/**
 * Modular Browser Storage & Caching Utilities
 *
 * Principles:
 * 1. Minimal client footprint: Server remains the source of truth.
 * 2. Session-bound search caching: Results cache in sessionStorage.
 * 3. 30-day auto-rotating Visitor ID in localStorage.
 * 4. Modular exports for page-specific imports.
 */

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const isClient = typeof window !== 'undefined';

// Simple UUID generator fallback
export function generateUUID(): string {
  if (isClient && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return 'pml_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
}

// Helper to read cookie in client
function getCookie(name: string): string {
  if (!isClient) return '';
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || '';
  }
  return '';
}

// Helper to set cookie in client
function setCookie(name: string, value: string, maxAgeSeconds: number) {
  if (!isClient) return;
  const secure = window.location.protocol === 'https:' ? '; secure' : '';
  document.cookie = `${name}=${value}; max-age=${maxAgeSeconds}; path=/; samesite=lax${secure}`;
}

// 1. Visitor ID (cookie with 30-day expiration, fallback/sync to localStorage)
export function getVisitorId(): string {
  if (!isClient) return '';
  const COOKIE_KEY = 'pml_visitor_id';
  const STORAGE_KEY = 'pml_visitor_id_v2';

  // Try reading from cookie first
  const cookieVal = getCookie(COOKIE_KEY);
  if (cookieVal) {
    return cookieVal;
  }

  // Fall back to existing localStorage visitor_id to reuse it
  let existingId = '';
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.id && parsed.createdAt) {
        const age = Date.now() - Number(parsed.createdAt);
        if (age < THIRTY_DAYS_MS) {
          existingId = parsed.id;
        }
      }
    }
  } catch (e) {
    // ignore parsing errors
  }

  const visitorId = existingId || generateUUID();

  // Store in cookie (30 days)
  setCookie(COOKIE_KEY, visitorId, 30 * 24 * 60 * 60);

  // Sync to localStorage
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ id: visitorId, createdAt: Date.now() })
    );
  } catch (e) {
    console.warn('Unable to write visitor_id to localStorage', e);
  }

  return visitorId;
}

// 2. Session ID (sessionStorage - cleared when browser tab closes)
export function getSessionId(): string {
  if (!isClient) return '';
  const STORAGE_KEY = 'pml_session_id';
  try {
    let sessionId = sessionStorage.getItem(STORAGE_KEY);
    if (!sessionId) {
      sessionId = generateUUID();
      sessionStorage.setItem(STORAGE_KEY, sessionId);
    }
    return sessionId;
  } catch (e) {
    return generateUUID();
  }
}

// 3. Search ID (Unique ID generated per search execution)
export function createSearchId(): string {
  return 'srch_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
}

// 4. Browser Signature (User Agent, resolution, timezone, language footprint)
export function getBrowserSignature(): string {
  if (!isClient) return '';
  try {
    const ua = navigator.userAgent || '';
    const screenRes = `${window.screen?.width || 0}x${window.screen?.height || 0}`;
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const lang = navigator.language || '';
    return `${ua}|${screenRes}|${tz}|${lang}`;
  } catch (e) {
    return 'unknown_browser';
  }
}

// 5. UTM Parameter Capture (Captured into sessionStorage on landing)
export interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

export function captureUTMParams(): UTMParams {
  if (!isClient) return {};
  const STORAGE_KEY = 'pml_utm_params';
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get('utm_source');
    if (utmSource) {
      const utm: UTMParams = {
        utm_source: utmSource,
        utm_medium: urlParams.get('utm_medium') || undefined,
        utm_campaign: urlParams.get('utm_campaign') || undefined,
        utm_term: urlParams.get('utm_term') || undefined,
        utm_content: urlParams.get('utm_content') || undefined,
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(utm));
      return utm;
    }
    const existing = sessionStorage.getItem(STORAGE_KEY);
    return existing ? JSON.parse(existing) : {};
  } catch (e) {
    return {};
  }
}

// 6. Search Results Caching (sessionStorage - cleared when tab closes)
export function setSearchCache(queryHash: string, data: any): void {
  if (!isClient) return;
  try {
    const key = `pml_search_cache_${queryHash}`;
    // sessionStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('Unable to cache search results to sessionStorage', e);
  }
}

export function getSearchCache(queryHash: string): any | null {
  if (!isClient || !queryHash) return null;
  try {
    const key = `pml_search_cache_${queryHash}`;
    const cached = sessionStorage.getItem(key);
    return cached ? JSON.parse(cached) : null;
  } catch (e) {
    return null;
  }
}

// Invalidate a cached search result — used when the server tells us the
// underlying search session has expired/gone (404/410) so a stale
// sessionStorage entry doesn't keep masking that with cached data forever.
export function removeSearchCache(queryHash: string): void {
  if (!isClient || !queryHash) return;
  try {
    sessionStorage.removeItem(`pml_search_cache_${queryHash}`);
  } catch (e) {
    // ignore
  }
}

// 7. Recent Searches (localStorage, capped at max 6 items)
export type SearchHistoryItem = [string, string, number];

export function parseQueryFromUrl(urlStr: string) {
  try {
    const qStr = urlStr.includes('?') ? urlStr.substring(urlStr.indexOf('?')) : '';
    const params = new URLSearchParams(qStr);
    return {
      searchId: params.get('searchId') || '',
      // "did" (destination id + level, e.g. "842:resort") replaced the old
      // "d"/"dest" slug params — still surfaced as `dest` here since every
      // caller of this function only ever does raw string equality on it.
      dest: params.get('did') || '',
      date: params.get('date') || params.get('dt') || '',
      nights: params.get('nights') || params.get('n') || '',
      departurePoints: params.get('departurePoints') || params.get('dp') || '',
      q: params.get('q') || ''
    };
  } catch (e) {
    return null;
  }
}

export function isSameSearch(urlA: string, urlB: string): boolean {
  const queryA = parseQueryFromUrl(urlA);
  const queryB = parseQueryFromUrl(urlB);
  if (!queryA || !queryB) return false;

  // If searchId matches, they are identical searches
  if (queryA.searchId && queryB.searchId && queryA.searchId === queryB.searchId) return true;

  // Otherwise compare core parameters
  if (queryA.dest.toLowerCase() !== queryB.dest.toLowerCase()) return false;
  if (queryA.date !== queryB.date) return false;
  if (queryA.nights !== queryB.nights) return false;
  if (queryA.q.toLowerCase() !== queryB.q.toLowerCase()) return false;

  const airportsA = queryA.departurePoints.split(',').sort().join(',');
  const airportsB = queryB.departurePoints.split(',').sort().join(',');
  if (airportsA !== airportsB) return false;

  return true;
}

export function saveSearchHistory(url: string): void {
  if (!isClient || !url) return;
  const STORAGE_KEY = 'pml_search_history';
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let history: SearchHistoryItem[] = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(history)) history = [];

    // Defense-in-depth: a URL with no resolved destination (e.g. a caller
    // that saved before `did=` landed in the address bar) must never
    // silently clobber an existing, more-complete entry for the same
    // search — isSameSearch matches on searchId alone when present, so
    // without this a dest-less save would delete the good entry below and
    // replace it with a worse one.
    const incoming = parseQueryFromUrl(url);
    if (incoming && !incoming.dest) {
      const existingHasDest = history.some(
        (h) => Array.isArray(h) && h.length >= 2 && isSameSearch(url, h[0]) && parseQueryFromUrl(h[0])?.dest
      );
      if (existingHasDest) return;
    }

    // Deduplicate: filter out entries matching the same criteria
    history = history.filter((h) => {
      if (!Array.isArray(h) || h.length < 2) return false;
      return !isSameSearch(url, h[0]);
    });

    const newItem: SearchHistoryItem = [url, url, Date.now()];

    history.unshift(newItem);
    // Keep max 6 recent searches
    history = history.slice(0, 6);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (e) {
    console.warn('Unable to save search history', e);
  }
}

export function getSearchHistory(): SearchHistoryItem[] {
  if (!isClient) return [];
  try {
    const raw = localStorage.getItem('pml_search_history');
    if (!raw) return [];
    const history: any[] = JSON.parse(raw);
    if (!Array.isArray(history)) return [];

    // Validate structure of each history item
    return history.filter((h): h is SearchHistoryItem => {
      return Array.isArray(h) && h.length >= 2 && typeof h[0] === 'string';
    });
  } catch (e) {
    return [];
  }
}

export function clearSearchHistory(): void {
  if (!isClient) return;
  try {
    localStorage.removeItem('pml_search_history');
  } catch (e) {
    console.warn('Unable to clear search history', e);
  }
}

// 8. Identification Headers Builder (Attached to API fetch calls)
export function getRequestHeaders(searchId?: string, idempotencyKey?: string): Record<string, string> {
  const visitorId = getVisitorId();
  const sessionId = getSessionId();
  const activeSearchId = searchId || createSearchId();
  const browserSig = getBrowserSignature();

  return {
    'Content-Type': 'application/json',
    'X-Visitor-ID': visitorId,
    'X-Session-ID': sessionId,
    'X-Search-ID': activeSearchId,
    'Idempotency-Key': idempotencyKey || `${sessionId}_${activeSearchId}`,
    'X-Client-Signature': browserSig,
  };
}

// 9. Lightweight User Activity Tracking Event
export function trackEvent(eventType: string, eventData: Record<string, any> = {}): void {
  if (!isClient) return;
  try {
    const visitorId = getVisitorId();
    const sessionId = getSessionId();

    fetch('/api/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        visitorId,
        sessionId,
        eventType,
        eventData,
      }),
    }).catch((err) => {
      console.warn('Failed to send tracking activity log', err);
    });
  } catch (e) {
    // catch-all
  }
}

const FILTER_OPTIONS_KEY = 'pml_filter_options';

export function saveFilterOptions(options: any): void {
  if (!isClient) return;
  try {
    sessionStorage.setItem(FILTER_OPTIONS_KEY, JSON.stringify(options));
  } catch (e) {
    console.warn('Unable to write filter options to sessionStorage', e);
  }
}

export function getFilterOptions(): any | null {
  if (!isClient) return null;
  try {
    const cached = sessionStorage.getItem(FILTER_OPTIONS_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    }
  } catch (e) { }
  return null;
}
