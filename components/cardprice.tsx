// Returns durationMin as a string with 'Nights' or empty string if not found
export function extractDurationMinStringFromUrl(
  api_url?: string | null,
): string {
  const key = normalizeApiUrl(api_url ?? "");
  if (!key) return "";
  let durationMin: string | null = null;
  try {
    const searchParams = new URLSearchParams(key);
    durationMin = searchParams.get("durationMin");
  } catch (e) {
    const match = key.match(/durationMin=(\d+)/);
    if (match) durationMin = match[1];
  }
  const value =
    durationMin && !isNaN(Number(durationMin)) ? Number(durationMin) : null;
  return value !== null ? `${value} Nights` : "";
}
import { ChevronDownCircle, CircleChevronRight } from "lucide-react";

export function normalizeApiUrl(raw: string): string {
  const input = (raw ?? "").trim();
  // If backend gives a full dpSearch URL, keep only the querystring.
  const qs = input.includes("?") ? input.split("?").slice(1).join("?") : input;
  return qs
    .replace(/^\?/, "")
    .replace(/cheapestPerDay=\d+/, "cheapestPerDuration=0");
}

export function getCardMeta(
  url: string | null | undefined,
  priceByUrl: Record<string, string | null>,
  durationByUrl: Record<string, number | null>,
  loadingByUrl: Record<string, boolean>,
): { key: string; loading: boolean; price: string | null; duration: number } {
  const key = normalizeApiUrl(url ?? "");
  if (!key) {
    return {
      key: "",
      loading: false,
      price: null,
      duration: 7,
    };
  }
  const loading = Boolean(loadingByUrl[key]);
  const price = priceByUrl[key] ?? null;
  const durationRaw = durationByUrl[key];
  const duration =
    typeof durationRaw === "number" && durationRaw > 0 ? durationRaw : 7;
  return { key, loading, price, duration };
}

export function extractDurationMinFromUrl(
  api_url?: string | null,
): number | null {
  if (!api_url) return null;
  try {
    const key = normalizeApiUrl(api_url);
    const params = Object.fromEntries(
      key
        .split("&")
        .map((item) => item.split("=", 2))
        .filter((arr) => arr.length === 2),
    );
    const durationMin = parseInt(params["durationMin"] ?? "0", 10);
    return durationMin > 0 ? durationMin : null;
  } catch {
    return null;
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function renderDealPriceButton({
  starting_price,
  api_url,
}: {
  starting_price?: string | null;
  api_url?: string | null;
}) {
  
  const durationMin = extractDurationMinFromUrl(api_url) ?? "";
  // Treat 0, 0.0, 0.00, "0", "0.0", "0.00" as no starting price
  const isNoStartingPrice =
    starting_price === undefined ||
    starting_price === null ||
    String(starting_price).trim() === "" ||
    Number(starting_price) === 0;

  if (!isNoStartingPrice) {
    const rounded = Math.round(Number(starting_price));
    if (!rounded || isNaN(rounded)) {
      return (
        <div className="flex items-center justify-center h-6">
          Find Out More
        </div>
      );
    }
    return (
      <>
        <span className="font-bold">{durationMin}</span> nights from{" "}
        <span className="font-bold">&nbsp;£{rounded}&nbsp;</span> per person
        <CircleChevronRight className="ml-[4px] w-[20px] md:w-[20px]" />
      </>
    );
  }

  // If no starting_price, fetch price from API, but always use durationMin from api_url
  if (isNoStartingPrice && api_url) {
    const url = api_url.trim();
    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        const res = await fetch(
          `/api/cardprice?url=${encodeURIComponent(url)}`,
          {
            method: "GET",
            cache: "no-store",
          },
        );
        if (res.ok) {
          const json = await res.json().catch(() => null);
          const rawPrice = json?.price;
          const p =
            typeof rawPrice === "number"
              ? rawPrice
              : rawPrice != null
                ? Number(rawPrice)
                : NaN;
          const price = Number.isFinite(p) && p > 0 ? Math.round(p) : null;
          if (price) {
            return (
              <div className="flex items-center justify-center">
                <span className="font-bold">{durationMin}</span> nights from
                <span className="font-bold">&nbsp;£{price}&nbsp;</span> per
                person
                <CircleChevronRight className="ml-[4px] w-[20px] md:w-[20px]" />
              </div>
            );
          }
        }
      } catch (e) {
        console.error("Error fetching price from API:", e);
      }
      if (attempt < maxAttempts) {
        await sleep(300);
      }
    }
    return (
      <div className="flex items-center justify-center h-6">Find Out More</div>
    );
  }
  return (
    <div className="flex items-center justify-center h-6">Find Out More</div>
  );
}
