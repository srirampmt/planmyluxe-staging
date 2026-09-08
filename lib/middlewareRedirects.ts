export type MiddlewareRedirectRule = {
  destination: string;
};

type RedirectsResponse = {
  redirects?: Array<{
    old_url?: unknown;
    new_url?: unknown;
  }>;
};

const REDIRECT_FETCH_TIMEOUT_MS = 5_000;
const REDIRECT_FAILURE_RETRY_COOLDOWN_MS = 5 * 60 * 1000;

let cachedRedirectLookup: Map<string, MiddlewareRedirectRule> | null = null;
let redirectLookupPromise: Promise<Map<string, MiddlewareRedirectRule> | null> | null = null;
let lastRedirectLoadFailureAt = 0;

function noteRedirectLoadFailure(message: string) {
  lastRedirectLoadFailureAt = Date.now();
  console.warn(message);
}

function asTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function joinUrl(base: string, path: string): string {
  const normalizedBase = base.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

function getAbortSignal(timeoutMs: number): AbortSignal | undefined {
  const abortSignalWithTimeout = AbortSignal as typeof AbortSignal & {
    timeout?: (ms: number) => AbortSignal;
  };

  if (typeof abortSignalWithTimeout.timeout !== "function") {
    return undefined;
  }

  return abortSignalWithTimeout.timeout(timeoutMs);
}

function normalizePathname(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  let pathname = trimmed;

  try {
    pathname = new URL(trimmed).pathname;
  } catch {
    pathname = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  }

  if (pathname.length > 1) {
    pathname = pathname.replace(/\/+$/, "");
  }

  return pathname || "/";
}

function normalizeDestination(value: unknown): string | null {
  const trimmed = asTrimmedString(value);
  if (!trimmed) {
    return null;
  }

  try {
    return new URL(trimmed).toString();
  } catch {
    return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  }
}

function getRedirectEndpoint(): string | null {
  const backendUrl = asTrimmedString(process.env.BACKEND_URL);
  if (!backendUrl) {
    return null;
  }

  return joinUrl(backendUrl, "/client/api/redirects/");
}

async function loadRedirectLookup(): Promise<Map<string, MiddlewareRedirectRule> | null> {
  const endpoint = getRedirectEndpoint();
  const serverKey = asTrimmedString(process.env.NEXT_SERVER_API_SECRET);

  if (!endpoint) {
    noteRedirectLoadFailure(
      "Skipping middleware redirects because BACKEND_URL is not configured.",
    );
    return null;
  }

  if (!serverKey) {
    noteRedirectLoadFailure(
      "Skipping middleware redirects because NEXT_SERVER_API_SECRET is not configured.",
    );
    return null;
  }

  const headers = new Headers({
    Accept: "application/json",
    "X-NEXT-SERVER-KEY": serverKey,
  });

  const response = await fetch(endpoint, {
    method: "GET",
    headers,
    cache: "no-store",
    signal: getAbortSignal(REDIRECT_FETCH_TIMEOUT_MS),
  });

  if (!response.ok) {
    noteRedirectLoadFailure(
      `Skipping middleware redirects because the redirects endpoint returned status ${response.status}.`,
    );
    return null;
  }

  const payload = (await response.json()) as RedirectsResponse;
  const redirectLookup = new Map<string, MiddlewareRedirectRule>();

  for (const item of payload.redirects ?? []) {
    const source = normalizePathname(asTrimmedString(item.old_url));
    const destination = normalizeDestination(item.new_url);

    if (!source || !destination) {
      continue;
    }

    redirectLookup.set(source, { destination });
  }

  cachedRedirectLookup = redirectLookup;
  lastRedirectLoadFailureAt = 0;

  return redirectLookup;
}

async function getRedirectLookup(): Promise<Map<string, MiddlewareRedirectRule> | null> {
  if (cachedRedirectLookup !== null) {
    return cachedRedirectLookup;
  }

  if (redirectLookupPromise) {
    return redirectLookupPromise;
  }

  if (
    lastRedirectLoadFailureAt > 0 &&
    Date.now() - lastRedirectLoadFailureAt < REDIRECT_FAILURE_RETRY_COOLDOWN_MS
  ) {
    return null;
  }

  redirectLookupPromise = loadRedirectLookup()
    .catch((error) => {
      lastRedirectLoadFailureAt = Date.now();
      const details = error instanceof Error ? error.message : String(error);
      console.warn(`Skipping middleware redirects because loading failed: ${details}`);
      return null;
    })
    .finally(() => {
      redirectLookupPromise = null;
    });

  return redirectLookupPromise;
}

export async function getCachedMiddlewareRedirect(
  pathname: string,
): Promise<MiddlewareRedirectRule | null> {
  const normalizedPathname = normalizePathname(pathname);
  if (!normalizedPathname) {
    return null;
  }

  const redirectLookup = await getRedirectLookup();
  if (!redirectLookup) {
    return null;
  }

  return redirectLookup.get(normalizedPathname) ?? null;
}