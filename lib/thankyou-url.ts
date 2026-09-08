const THANKYOU_SUFFIX = "/thankyou";
const THANKYOU_STATE_KEY = "__pml_thankyou_state__";

type ThankyouState = {
  originalUrl: string;
  thankyouUrl: string;
};

function isBrowser() {
  return typeof window !== "undefined";
}

function isThankyouPath(pathname: string) {
  return pathname === THANKYOU_SUFFIX || pathname.endsWith(THANKYOU_SUFFIX);
}

function toThankyouPath(pathname: string) {
  if (isThankyouPath(pathname)) return pathname;
  if (pathname === "/") return THANKYOU_SUFFIX;
  const normalizedPath = pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  return `${normalizedPath}${THANKYOU_SUFFIX}`;
}

function stripThankyouPath(pathname: string) {
  const strippedPath = pathname.replace(/\/thankyou\/?$/, "");
  return strippedPath || "/";
}

function readState(): ThankyouState | null {
  if (!isBrowser()) return null;

  try {
    const raw = window.sessionStorage.getItem(THANKYOU_STATE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<ThankyouState>;
    if (!parsed.originalUrl || !parsed.thankyouUrl) return null;

    return {
      originalUrl: parsed.originalUrl,
      thankyouUrl: parsed.thankyouUrl,
    };
  } catch {
    return null;
  }
}

function clearState() {
  if (!isBrowser()) return;

  try {
    window.sessionStorage.removeItem(THANKYOU_STATE_KEY);
  } catch {
    // ignore storage access issues
  }
}

export function markThankyouUrl() {
  if (!isBrowser()) return;

  const { pathname, search, hash } = window.location;
  const originalUrl = `${pathname}${search}${hash}`;
  const thankyouUrl = `${toThankyouPath(pathname)}${search}${hash}`;

  try {
    window.sessionStorage.setItem(
      THANKYOU_STATE_KEY,
      JSON.stringify({ originalUrl, thankyouUrl })
    );
  } catch {
    // ignore storage access issues
  }

  if (thankyouUrl !== originalUrl) {
    window.history.replaceState(window.history.state, "", thankyouUrl);
  }
}

export function restoreThankyouUrl() {
  if (!isBrowser()) return;

  const { pathname, search, hash } = window.location;
  const currentUrl = `${pathname}${search}${hash}`;
  const state = readState();

  if (!state) {
    if (!isThankyouPath(pathname)) return;

    const fallbackUrl = `${stripThankyouPath(pathname)}${search}${hash}`;
    window.history.replaceState(window.history.state, "", fallbackUrl);
    return;
  }

  if (currentUrl !== state.thankyouUrl) {
    clearState();

    if (!isThankyouPath(pathname)) return;

    const fallbackUrl = `${stripThankyouPath(pathname)}${search}${hash}`;
    window.history.replaceState(window.history.state, "", fallbackUrl);
    return;
  }

  clearState();

  if (currentUrl !== state.originalUrl) {
    window.history.replaceState(window.history.state, "", state.originalUrl);
  }
}
