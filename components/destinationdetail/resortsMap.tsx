"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, RotateCcw } from "lucide-react";
import {
  encodeDestinationParam,
  getDestinationLabel,
  getDestinationLevel,
  makeDestinationSelection,
  type DestinationLevel,
  type DestinationRow,
} from "@/lib/mappings/destinations";

interface ResortItem {
  name: string;
  latitude?: number | null;
  longitude?: number | null;
  href?: string;
  country?: number;
  region?: number;
  resort?: number;
  city?: number;
}

interface ResortsMapProps {
  destinationName: string;
  resortsList?: ResortItem[] | null;
  hierarchyLevel?: "" | "country" | "region" | "resort";
  apiKey?: string;
}

interface ResolvedDestination {
  placeIds: string[];
  viewport?: any;
}

// In-memory cache for resolved Google Place IDs and viewports
const destinationCache = new Map<string, ResolvedDestination>();

// Resolve destination placeIds & viewport using Google Maps PlacesService
const resolveDestination = (
  destination: string,
  map: any
): Promise<ResolvedDestination | null> => {
  const trimmed = destination.trim().replace(/[-_]+/g, " ");
  if (!trimmed) return Promise.resolve(null);

  const cacheKey = trimmed.toLowerCase();
  if (destinationCache.has(cacheKey)) {
    return Promise.resolve(destinationCache.get(cacheKey)!);
  }

  const google = (window as any).google;
  if (!google?.maps?.places?.PlacesService) return Promise.resolve(null);

  return new Promise((resolve) => {
    try {
      const placesService = new google.maps.places.PlacesService(
        map || document.createElement("div")
      );

      placesService.findPlaceFromQuery(
        {
          query: trimmed,
          fields: ["place_id", "geometry", "name", "types"],
        },
        (results: any[], status: any) => {
          if (
            status === google.maps.places.PlacesServiceStatus.OK &&
            results &&
            results.length > 0
          ) {
            const placeIds: string[] = results
              .map((r: any) => r.place_id)
              .filter(Boolean);

            const resolved: ResolvedDestination = {
              placeIds,
              viewport: results[0]?.geometry?.viewport,
            };

            destinationCache.set(cacheKey, resolved);
            resolve(resolved);
          } else {
            // Fallback: Google Places textSearch
            placesService.textSearch(
              { query: trimmed },
              (textResults: any[], textStatus: any) => {
                if (
                  textStatus === google.maps.places.PlacesServiceStatus.OK &&
                  textResults &&
                  textResults.length > 0
                ) {
                  const placeIds: string[] = textResults
                    .map((r: any) => r.place_id)
                    .filter(Boolean);

                  const resolved: ResolvedDestination = {
                    placeIds,
                    viewport: textResults[0]?.geometry?.viewport,
                  };

                  destinationCache.set(cacheKey, resolved);
                  resolve(resolved);
                } else {
                  resolve(null);
                }
              }
            );
          }
        }
      );
    } catch {
      resolve(null);
    }
  });
};

const escapeHtml = (str: string): string => {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const LEVEL_RANK: DestinationLevel[] = ["city", "resort", "region", "country", "top_level"];

const pickDestination = (
  rows: DestinationRow[],
  name: string,
  destinationName: string
): DestinationRow | null => {
  const needle = name.trim().toLowerCase();
  const dest = destinationName.trim().toLowerCase();
  const named = rows.filter((row) => getDestinationLabel(row).trim().toLowerCase() === needle);
  const pool = named.length ? named : rows;
  const underDest = pool.filter((row) =>
    [row.country_name, row.top_level_name, row.region_name, row.resort_name].some((part) =>
      part?.toLowerCase().includes(dest)
    )
  );
  const candidates = (underDest.length ? underDest : pool).slice();
  candidates.sort((a, b) => {
    const rank = (row: DestinationRow) => {
      const level = getDestinationLevel(row);
      const index = level ? LEVEL_RANK.indexOf(level) : LEVEL_RANK.length;
      return index < 0 ? LEVEL_RANK.length : index;
    };
    return rank(a) - rank(b);
  });
  return candidates[0] ?? null;
};

const getValidCoords = (resort: ResortItem): [number, number] | null => {
  if (
    resort.latitude === null ||
    resort.latitude === undefined ||
    resort.longitude === null ||
    resort.longitude === undefined
  ) {
    return null;
  }
  const lat = Number(resort.latitude);
  const lng = Number(resort.longitude);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  return [lat, lng];
};

export default function ResortsMap({
  destinationName,
  resortsList = [],
  hierarchyLevel = "",
  apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
}: ResortsMapProps) {
  const router = useRouter();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const infoWindowRef = useRef<any>(null);
  const destinationViewportRef = useRef<any>(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [scrollEnabled, setScrollEnabled] = useState(false);
  const [listOverflows, setListOverflows] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [hoveredResort, setHoveredResort] = useState<string | null>(null);
  const [selectedResort, setSelectedResort] = useState<ResortItem | null>(null);
  const [activePlaceIds, setActivePlaceIds] = useState<string[]>([]);

  const markersRef = useRef<
    Record<
      string,
      { marker: any; normalIcon: any; hoverIcon: any; selectedIcon: any }
    >
  >({});
  const iconsRef = useRef<{ normalIcon: any; hoverIcon: any; selectedIcon: any } | null>(null);
  const geocodeCacheRef = useRef<Record<string, { lat: number; lng: number }>>({});
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevSelectedNameRef = useRef<string | null>(null);
  const bounceTimeoutRef = useRef<any>(null);
  const fitDestinationViewRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const updateMatches = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsDesktop(e.matches);
    };
    updateMatches(mediaQuery);
    mediaQuery.addEventListener("change", updateMatches);
    return () => mediaQuery.removeEventListener("change", updateMatches);
  }, []);

  const list = useMemo(() => {
    const rows = Array.isArray(resortsList) ? resortsList : [];
    return rows.filter((resort) => Boolean(resort.href));
  }, [resortsList]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    setListOverflows(el.scrollHeight > el.clientHeight + 1);
  }, [list, scrollEnabled, isDesktop]);

  // Load Google Maps SDK with Places and Geometry libraries
  useEffect(() => {
    if (list.length === 0) return;
    if (typeof window === "undefined") return;

    if (!apiKey) {
      setMapError("Google Maps API key is missing. Please check your configuration.");
      return;
    }

    (window as any).initGoogleMapGlobal = () => {
      setMapLoaded(true);
    };

    if ((window as any).google?.maps?.Map) {
      setMapLoaded(true);
      return;
    }

    let script = document.getElementById("google-maps-sdk") as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = "google-maps-sdk";
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly&libraries=geometry,places&callback=initGoogleMapGlobal&loading=async`;
      script.async = true;
      script.defer = true;
      script.onerror = () => {
        setMapError("Failed to load Google Maps SDK. Please check your network connection.");
      };
      document.head.appendChild(script);
    } else {
      const interval = setInterval(() => {
        if ((window as any).google?.maps?.Map) {
          clearInterval(interval);
          setMapLoaded(true);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [apiKey, list.length]);

  // Initialize Google Maps instance with Map ID for Data-Driven Styling
  useEffect(() => {
    if (!mapLoaded || !mapContainerRef.current) return;
    if (mapInstanceRef.current) return;
    const google = (window as any).google;
    if (!google?.maps?.Map) return;

    try {
      const configuredMapId =
        process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID?.trim();

      const mapOptions: any = {
        center: { lat: 23.6345, lng: -102.5528 },
        zoom: 5,
        disableDefaultUI: true,
        zoomControl: true,
        zoomControlOptions: {
          position: google.maps.ControlPosition.RIGHT_BOTTOM,
        },
        gestureHandling: "cooperative",
        backgroundColor: "#d5dcde",
        mapId: configuredMapId,
        renderingType: google.maps.RenderingType?.VECTOR || "VECTOR",
      };

      const map = new google.maps.Map(mapContainerRef.current, mapOptions);

      infoWindowRef.current = new google.maps.InfoWindow({
        disableAutoPan: true,
        headerDisabled: true,
      });

      map.addListener("click", () => {
        setSelectedResort(null);
        setHoveredResort(null);
        try {
          infoWindowRef.current?.close();
        } catch {
          // ignore
        }
        fitDestinationViewRef.current?.();
      });

      mapInstanceRef.current = map;
      setMapInstance(map);

      let hasTilesLoaded = false;
      const tilesLoadedListener = google.maps.event.addListenerOnce(map, "tilesloaded", () => {
        hasTilesLoaded = true;
        setIsMapReady(true);
      });

      const readyTimer = setTimeout(() => {
        if (!hasTilesLoaded) {
          setIsMapReady(true);
        }
      }, 1500);

      setTimeout(() => {
        if (mapInstanceRef.current) {
          google.maps.event.trigger(mapInstanceRef.current, "resize");
        }
      }, 300);
    } catch (err: any) {
      console.error("Failed to initialize Google Map:", err);
      setMapError(err?.message || "Failed to initialize Google Map");
    }

    return () => {
      mapInstanceRef.current = null;
      setMapInstance(null);
      setIsMapReady(false);
    };
  }, [mapLoaded]);

  // ResizeObserver for container
  useEffect(() => {
    if (!mapContainerRef.current) return;
    const observer = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        const google = (window as any).google;
        if (google?.maps?.event) {
          google.maps.event.trigger(mapInstanceRef.current, "resize");
        }
      }
    });
    observer.observe(mapContainerRef.current);
    return () => observer.disconnect();
  }, [mapLoaded]);

  const fitOptimalBounds = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const google = (window as any).google;
    if (!google?.maps) return;

    const bounds = new google.maps.LatLngBounds();
    let hasPoints = false;
    list.forEach((resort) => {
      const coords = getValidCoords(resort);
      if (coords) {
        bounds.extend({ lat: coords[0], lng: coords[1] });
        hasPoints = true;
      }
    });

    if (hasPoints) {
      map.fitBounds(bounds, {
        top: isDesktop ? 45 : 25,
        right: isDesktop ? 45 : 25,
        bottom: isDesktop ? 45 : 25,
        left: isDesktop ? 45 : 25,
      });
    }
  }, [list, isDesktop]);

  const fitDestinationView = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const google = (window as any).google;
    if (!google?.maps) return;

    if (destinationViewportRef.current) {
      map.fitBounds(destinationViewportRef.current, {
        top: isDesktop ? 45 : 25,
        right: isDesktop ? 45 : 25,
        bottom: isDesktop ? 45 : 25,
        left: isDesktop ? 45 : 25,
      });
    } else {
      fitOptimalBounds();
    }
  }, [isDesktop, fitOptimalBounds]);

  fitDestinationViewRef.current = fitDestinationView;

  // Google Maps Official Data-Driven Styling (DDS) Feature Layer Boundary Manager
  useEffect(() => {
    if (!mapInstance) return;
    const google = (window as any).google;
    if (!google?.maps) return;

    if (typeof mapInstance.getFeatureLayer !== "function") return;

    const renderingType =
      typeof mapInstance.getRenderingType === "function"
        ? mapInstance.getRenderingType()
        : null;
    const isVector =
      renderingType === "VECTOR" ||
      renderingType === google.maps.RenderingType?.VECTOR;

    if (!isVector) return;

    const featureTypes = [
      google.maps.FeatureType?.COUNTRY || "COUNTRY",
      google.maps.FeatureType?.ADMINISTRATIVE_AREA_LEVEL_1 || "ADMINISTRATIVE_AREA_LEVEL_1",
      google.maps.FeatureType?.ADMINISTRATIVE_AREA_LEVEL_2 || "ADMINISTRATIVE_AREA_LEVEL_2",
      google.maps.FeatureType?.LOCALITY || "LOCALITY",
      google.maps.FeatureType?.POSTAL_CODE || "POSTAL_CODE",
    ];

    featureTypes.forEach((type: string) => {
      try {
        const layer = mapInstance.getFeatureLayer(type);
        if (!layer) return;

        if (activePlaceIds.length > 0) {
          layer.style = ({ feature }: { feature: { placeId: string } }) => {
            if (activePlaceIds.includes(feature.placeId)) {
              return {
                strokeColor: "#CB1287",
                strokeOpacity: 1.0,
                strokeWeight: 1.5,
                fillColor: "#CB1287",
                fillOpacity: 0.0,
              };
            }
            return null;
          };
        } else {
          layer.style = null;
        }
      } catch {
        // Feature layer not configured on style
      }
    });
  }, [mapInstance, activePlaceIds]);

  // Resolve destination Place IDs & viewport on destination change using Google Places API
  useEffect(() => {
    if (!mapInstance || !destinationName?.trim()) return;

    let isMounted = true;
    resolveDestination(destinationName, mapInstance).then((resolved) => {
      if (!isMounted || !resolved) return;

      setActivePlaceIds(resolved.placeIds);
      destinationViewportRef.current = resolved.viewport;

      fitDestinationView();

      // Ensure settled camera alignment after container layout stabilizes
      setTimeout(() => {
        if (isMounted && mapInstanceRef.current) {
          const google = (window as any).google;
          if (google?.maps?.event) {
            google.maps.event.trigger(mapInstanceRef.current, "resize");
          }
          fitDestinationView();
        }
      }, 350);
    });

    return () => {
      isMounted = false;
    };
  }, [destinationName, mapInstance, fitDestinationView]);

  const handleResetView = useCallback(() => {
    setSelectedResort(null);
    setHoveredResort(null);
    try {
      infoWindowRef.current?.close();
    } catch {
      // ignore
    }
    fitDestinationView();
  }, [fitDestinationView]);

  const geocodeResort = useCallback((resort: ResortItem): Promise<[number, number] | null> => {
    const existing = getValidCoords(resort);
    if (existing) return Promise.resolve(existing);

    const cached = geocodeCacheRef.current[resort.name];
    if (cached) return Promise.resolve([cached.lat, cached.lng]);

    const google = (window as any).google;
    if (!google?.maps?.places?.PlacesService) return Promise.resolve(null);

    const query = `${resort.name}, ${destinationName}`;
    const places = new google.maps.places.PlacesService(
      mapInstanceRef.current || document.createElement("div")
    );

    const readLocation = (results: any): [number, number] | null => {
      const location = results?.[0]?.geometry?.location;
      if (!location) return null;
      const lat = location.lat();
      const lng = location.lng();
      geocodeCacheRef.current[resort.name] = { lat, lng };
      return [lat, lng];
    };

    return new Promise((resolve) => {
      places.findPlaceFromQuery(
        { query, fields: ["geometry", "name"] },
        (results: any, status: string) => {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            resolve(readLocation(results));
            return;
          }
          places.textSearch({ query }, (textResults: any, textStatus: string) => {
            if (textStatus === google.maps.places.PlacesServiceStatus.OK) {
              resolve(readLocation(textResults));
              return;
            }
            resolve(null);
          });
        }
      );
    });
  }, [destinationName]);

  const ensureMarker = useCallback((resort: ResortItem, coords: [number, number]) => {
    const map = mapInstanceRef.current;
    const google = (window as any).google;
    const icons = iconsRef.current;
    if (!map || !google?.maps || !icons) return null;

    const existing = markersRef.current[resort.name];
    if (existing) {
      existing.marker.setPosition({ lat: coords[0], lng: coords[1] });
      return existing;
    }

    const marker = new google.maps.Marker({
      position: { lat: coords[0], lng: coords[1] },
      map,
      title: resort.name,
      icon: icons.normalIcon,
      zIndex: 10,
      cursor: "pointer",
    });
    marker.addListener("click", () => {
      openHotelSearchRef.current(resort);
    });
    marker.addListener("mouseover", () => {
      setHoveredResort(resort.name);
    });
    marker.addListener("mouseout", () => {
      setHoveredResort((prev) => (prev === resort.name ? null : prev));
    });

    const entry = { marker, ...icons };
    markersRef.current[resort.name] = entry;
    return entry;
  }, []);

  const openHotelSearch = useCallback((resort: ResortItem) => {
    const params = new URLSearchParams();
    params.set("q", resort.name);
    const go = (did: string) => {
      if (did) params.set("did", did);
      router.push(`/hotels?${params.toString()}`);
    };
    fetch(`/api/destinations?q=${encodeURIComponent(resort.name)}`)
      .then((res) => res.json())
      .then((data: DestinationRow[]) => {
        const rows = Array.isArray(data) ? data : [];
        const match = pickDestination(rows, resort.name, destinationName);
        go(match ? encodeDestinationParam(makeDestinationSelection(match)) : "");
      })
      .catch(() => go(""));
  }, [destinationName, router]);

  const openHotelSearchRef = useRef(openHotelSearch);
  openHotelSearchRef.current = openHotelSearch;

  const handleResortHover = useCallback((resort: ResortItem) => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setHoveredResort(resort.name);
  }, []);

  const handleResortHoverEnd = useCallback(() => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setHoveredResort(null);
  }, []);

  // Render Pin Markers on Google Maps
  useEffect(() => {
    if (!mapInstance) return;
    const google = (window as any).google;
    if (!google?.maps) return;

    Object.values(markersRef.current).forEach(({ marker }) => {
      marker.setMap(null);
    });
    markersRef.current = {};

    // 1. Default Pin: Teardrop in brand magenta (#CB1287) with center white cutout & subtle bottom shadow
    const normalPinSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="34" viewBox="0 0 28 34">
        <defs>
          <filter id="def-shadow" x="-30%" y="-15%" width="160%" height="150%">
            <feDropShadow dx="0" dy="2.5" stdDeviation="1.8" flood-color="#000000" flood-opacity="0.28"/>
          </filter>
        </defs>
        <path d="M 14 3 C 8.477 3 4 7.477 4 13 C 4 20 11.6 27 14 30.5 C 16.4 27 24 20 24 13 C 24 7.477 19.523 3 14 3 Z" fill="#CB1287" filter="url(#def-shadow)"/>
        <circle cx="14" cy="13" r="3.7" fill="#FFFFFF"/>
      </svg>
    `.trim();

    // 2. Hover Pin: Teardrop with soft translucent pink background halo glow
    const hoverPinSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="34" height="40" viewBox="0 0 34 40">
        <defs>
          <filter id="hov-shadow" x="-30%" y="-15%" width="160%" height="150%">
            <feDropShadow dx="0" dy="2.5" stdDeviation="2" flood-color="#000000" flood-opacity="0.22"/>
          </filter>
        </defs>
        <!-- Soft Outer Pink Halo -->
        <path d="M 17 2 C 9.268 2 3 8.268 3 16 C 3 24.5 13.5 33.5 17 37.5 C 20.5 33.5 31 24.5 31 16 C 31 8.268 24.732 2 17 2 Z" fill="#CB1287" fill-opacity="0.22"/>
        <!-- Main Pin -->
        <path d="M 17 6.5 C 12.306 6.5 8.5 10.306 8.5 15 C 8.5 20.8 15 26.8 17 30 C 19 26.8 25.5 20.8 25.5 15 C 25.5 10.306 21.694 6.5 17 6.5 Z" fill="#CB1287" filter="url(#hov-shadow)"/>
        <!-- Center White Circle -->
        <circle cx="17" cy="15" r="3.6" fill="#FFFFFF"/>
      </svg>
    `.trim();

    // 3. Selected / Active Pin: Larger teardrop with soft pink halo + crisp white border stroke
    const selectedPinSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="38" height="44" viewBox="0 0 38 44">
        <defs>
          <filter id="act-shadow" x="-30%" y="-15%" width="160%" height="150%">
            <feDropShadow dx="0" dy="3" stdDeviation="2.5" flood-color="#CB1287" flood-opacity="0.35"/>
          </filter>
        </defs>
        <!-- Soft Outer Pink Halo -->
        <path d="M 19 2 C 10.163 2 3 9.163 3 18 C 3 27.5 15 37.5 19 41.5 C 23 37.5 35 27.5 35 18 C 35 9.163 27.837 2 19 2 Z" fill="#CB1287" fill-opacity="0.24"/>
        <!-- Main Pin with Crisp White Border -->
        <path d="M 19 6.5 C 13.477 6.5 9 10.977 9 16.5 C 9 23.2 16.2 30.5 19 34.5 C 21.8 30.5 29 23.2 29 16.5 C 29 10.977 24.523 6.5 19 6.5 Z" fill="#CB1287" stroke="#FFFFFF" stroke-width="2.2" stroke-linejoin="round" filter="url(#act-shadow)"/>
        <!-- Center White Circle -->
        <circle cx="19" cy="16.5" r="3.8" fill="#FFFFFF"/>
      </svg>
    `.trim();

    const normalIcon = {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(normalPinSvg)}`,
      scaledSize: new google.maps.Size(28, 34),
      anchor: new google.maps.Point(14, 30.5),
    };

    const hoverIcon = {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(hoverPinSvg)}`,
      scaledSize: new google.maps.Size(34, 40),
      anchor: new google.maps.Point(17, 37.5),
    };

    const selectedIcon = {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(selectedPinSvg)}`,
      scaledSize: new google.maps.Size(38, 44),
      anchor: new google.maps.Point(19, 41.5),
    };

    iconsRef.current = { normalIcon, hoverIcon, selectedIcon };

    list.forEach((resort) => {
      const coords = getValidCoords(resort);
      if (!coords) return;

      const marker = new google.maps.Marker({
        position: { lat: coords[0], lng: coords[1] },
        map: mapInstance,
        title: resort.name,
        icon: normalIcon,
        zIndex: 10,
        cursor: "pointer",
      });

      marker.addListener("click", () => {
        openHotelSearchRef.current(resort);
      });

      marker.addListener("mouseover", () => {
        setHoveredResort(resort.name);
      });

      marker.addListener("mouseout", () => {
        setHoveredResort((prev) => (prev === resort.name ? null : prev));
      });

      markersRef.current[resort.name] = {
        marker,
        normalIcon,
        hoverIcon,
        selectedIcon,
      };
    });

    return () => {
      Object.values(markersRef.current).forEach(({ marker }) => marker.setMap(null));
      markersRef.current = {};
    };
  }, [mapInstance, list]);

  useEffect(() => {
    if (!mapInstance) return;
    let cancelled = false;

    const fitPlacedPins = () => {
      const google = (window as any).google;
      const map = mapInstanceRef.current;
      if (!google?.maps || !map) return;
      const bounds = new google.maps.LatLngBounds();
      let count = 0;
      Object.values(markersRef.current).forEach(({ marker }) => {
        const pos = marker.getPosition?.();
        if (!pos) return;
        bounds.extend(pos);
        count += 1;
      });
      if (count === 1) {
        map.setCenter(bounds.getCenter());
        map.setZoom(10);
        return;
      }
      if (count > 1) map.fitBounds(bounds, 48);
    };

    fitPlacedPins();

    const missing = list.filter((resort) => !getValidCoords(resort) && !markersRef.current[resort.name]);
    const queue = [...missing];
    const worker = async () => {
      while (queue.length && !cancelled) {
        const resort = queue.shift();
        if (!resort) break;
        const coords = await geocodeResort(resort);
        if (cancelled || !coords) continue;
        ensureMarker({ ...resort, latitude: coords[0], longitude: coords[1] }, coords);
      }
    };

    void Promise.all(Array.from({ length: 4 }, () => worker())).then(() => {
      if (!cancelled) fitPlacedPins();
    });

    return () => {
      cancelled = true;
    };
  }, [mapInstance, list, geocodeResort, ensureMarker]);

  // Synchronize hover / selected resort to pin icons
  useEffect(() => {
    Object.entries(markersRef.current).forEach(
      ([name, { marker, normalIcon, hoverIcon, selectedIcon }]) => {
        const isSelected = selectedResort?.name === name;
        const isHovered = hoveredResort === name;

        if (isSelected) {
          marker.setIcon(selectedIcon);
          marker.setZIndex(1000);
        } else if (isHovered) {
          marker.setIcon(hoverIcon);
          marker.setZIndex(500);
        } else {
          marker.setIcon(normalIcon);
          marker.setZIndex(10);
        }
      }
    );
  }, [hoveredResort, selectedResort]);

  // Bounce animation on new selection
  useEffect(() => {
    if (!selectedResort) {
      if (bounceTimeoutRef.current) clearTimeout(bounceTimeoutRef.current);
      prevSelectedNameRef.current = null;
      Object.values(markersRef.current).forEach(({ marker }) => {
        try {
          marker.setAnimation(null);
        } catch {
          // ignore
        }
      });
      return;
    }

    if (prevSelectedNameRef.current === selectedResort.name) return;
    prevSelectedNameRef.current = selectedResort.name;

    if (bounceTimeoutRef.current) {
      clearTimeout(bounceTimeoutRef.current);
    }

    Object.values(markersRef.current).forEach(({ marker }) => {
      try {
        marker.setAnimation(null);
      } catch {
        // ignore
      }
    });

    const targetMarker = markersRef.current[selectedResort.name]?.marker;
    if (targetMarker) {
      const google = (window as any).google;
      if (google?.maps?.Animation) {
        targetMarker.setAnimation(google.maps.Animation.BOUNCE);
        bounceTimeoutRef.current = setTimeout(() => {
          try {
            targetMarker.setAnimation(null);
          } catch {
            // ignore
          }
        }, 700);
      }
    }
  }, [selectedResort]);

  useEffect(() => {
    const info = infoWindowRef.current;
    if (!mapInstance || !info) return;

    if (!hoveredResort) {
      info.close();
      return;
    }

    const markerData = markersRef.current[hoveredResort];
    if (!markerData?.marker) return;

    info.setContent(
      `<div style="font-family: Montserrat, sans-serif; font-weight: 600; font-size: 12px; color: #1a1a1a; padding: 2px 2px 0;">${escapeHtml(hoveredResort)}</div>`
    );
    info.open({ anchor: markerData.marker, map: mapInstance });
  }, [hoveredResort, mapInstance]);

  if (list.length === 0) return null;

  return (
    <section className="w-screen left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] relative bg-[#F9FAFB] font-['Montserrat']">
      <div className="mx-auto w-full max-w-[1440px] px-[16px] py-6 sm:px-[24px] md:px-[32px] md:py-8 lg:px-[40px]">
        <div className="w-full max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-stretch">
          
          {/* Left Column: Regions and Resorts List */}
          <div className={`lg:col-span-5 flex max-h-[420px] w-full flex-col self-stretch rounded-[8px] border border-gray-200/60 bg-white p-5 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] sm:p-6 lg:max-h-[480px] lg:p-7 ${list.length > 4 ? "min-h-[280px] sm:min-h-[320px] lg:min-h-[360px]" : "min-h-0 lg:min-h-[240px]"}`}>
            <div className="flex min-h-0 flex-1 flex-col">
              <h2 className="font-['Montserrat'] text-[18px] md:text-[20px] font-semibold text-[#1a1a1a] leading-snug mb-3 pb-2 border-b border-gray-100 shrink-0">
                {hierarchyLevel === "country"
                  ? `Explore regions in ${destinationName}`
                  : hierarchyLevel === "region"
                    ? `Explore resorts in ${destinationName}`
                    : `Explore ${destinationName}`}
              </h2>

              {/* Destination Header Node: Focus Destination Boundary */}
              <div
                onClick={handleResetView}
                className="border-l-2 border-[#cb2187] pl-2.5 block mb-2.5 text-left shrink-0 cursor-pointer group"
                title={`Focus ${destinationName} boundary`}
              >
                <span className="font-semibold text-[13.5px] sm:text-[14px] text-[#cb2187] group-hover:underline">
                  {destinationName}
                </span>
              </div>

              {list.length === 0 ? (
                <p className="text-gray-400 text-sm italic pl-2.5 py-3">
                  Specific resorts and region list not available.
                </p>
              ) : (
                <div
                  ref={listRef}
                  className={`grid min-h-0 flex-1 grid-cols-2 content-start gap-2 ${scrollEnabled ? "overflow-y-auto pr-1" : "overflow-hidden"}`}
                >
                  {list.map((resort, idx) => {
                    const className = `w-full rounded-full border bg-transparent px-3 py-1.5 text-left font-montserrat text-[13px] leading-none transition-colors outline-none cursor-pointer ${
                      hoveredResort === resort.name || selectedResort?.name === resort.name
                        ? "border-transparent font-semibold text-[#cb2187]"
                        : "border-transparent font-medium text-[#7C7C7C] hover:text-[#cb2187]"
                    }`;
                    const label = <span className="block truncate">{resort.name}</span>;
                    if (resort.href) {
                      return (
                        <Link
                          key={resort.href}
                          href={resort.href}
                          onMouseEnter={() => handleResortHover(resort)}
                          onMouseLeave={handleResortHoverEnd}
                          className={className}
                        >
                          {label}
                        </Link>
                      );
                    }
                    return (
                      <button
                        key={`${resort.name}-${idx}`}
                        onClick={() => openHotelSearch(resort)}
                        onMouseEnter={() => handleResortHover(resort)}
                        onMouseLeave={handleResortHoverEnd}
                        className={className}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              )}
              {listOverflows && (
                <button
                  type="button"
                  onClick={() => {
                    setScrollEnabled((open) => !open);
                    if (scrollEnabled) listRef.current?.scrollTo({ top: 0 });
                  }}
                  className="mt-2 shrink-0 cursor-pointer px-3 py-1.5 text-left text-[13px] font-semibold leading-none text-[#cb2187] outline-none hover:underline"
                >
                  {scrollEnabled ? "Show less" : "Read more"}
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Interactive Google Map */}
          <div className="relative flex h-[280px] w-full flex-col overflow-hidden rounded-[8px] border border-gray-200/60 bg-[#d5dcde] shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] sm:h-[320px] lg:col-span-7 lg:h-full lg:min-h-[360px] lg:max-h-[480px] lg:self-stretch">
            <div
              ref={mapContainerRef}
              className="w-full h-full flex-1 z-10"
              style={{ width: "100%", height: "100%" }}
            />

            {/* Reset View Button */}
            <button
              type="button"
              onClick={handleResetView}
              title="Reset map view"
              className="absolute top-3.5 left-3.5 bg-white/95 hover:bg-white text-gray-700 hover:text-[#cb2187] text-[11.5px] font-medium px-3 py-1.5 rounded-full shadow-sm transition-all z-20 flex items-center gap-1.5 border border-gray-200/60 cursor-pointer group active:scale-95 backdrop-blur-sm"
            >
              <RotateCcw size={12} className="text-[#cb2187] group-hover:-rotate-90 transition-transform duration-200" />
              <span>Reset View</span>
            </button>

            {/* Loading State Overlay with Smooth Fade Transition */}
            {!mapError && (
              <div
                className={`absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center z-30 gap-3 transition-opacity duration-500 ease-out ${
                  isMapReady ? "opacity-0 pointer-events-none" : "opacity-100"
                }`}
              >
                <div className="w-8 h-8 rounded-[8px] border-4 border-gray-200 border-t-[#cb2187] animate-spin" />
                <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider animate-pulse">
                  Loading Google Map...
                </span>
              </div>
            )}

            {/* Error State */}
            {mapError && (
              <div className="absolute inset-0 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center z-30 p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-pink-50 flex items-center justify-center text-[#cb2187] mb-3 shadow-inner">
                  <MapPin size={22} />
                </div>
                <h5 className="text-[14px] font-bold text-gray-900 mb-1">
                  Google Maps Notice
                </h5>
                <p className="text-[12px] text-gray-600 max-w-sm mb-4 leading-relaxed">
                  {mapError}
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
