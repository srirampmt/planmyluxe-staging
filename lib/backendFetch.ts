import "server-only";

const DEFAULT_TIMEOUT_MS = 60_000;

export class BackendConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BackendConfigError";
  }
}

export type BackendFetchOptions = Omit<RequestInit, "headers" | "signal"> & {
  headers?: HeadersInit;
  signal?: AbortSignal | null;
  timeoutMs?: number;
};

function joinUrl(base: string, path: string) {
  const normalizedBase = base.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

function getTimeoutSignal(
  signal: AbortSignal | null | undefined,
  timeoutMs: number | undefined,
) {
  if (!timeoutMs || timeoutMs < 1) {
    return signal;
  }

  const timeoutSignal = AbortSignal.timeout(timeoutMs);
  if (!signal) {
    return timeoutSignal;
  }

  const abortSignalWithAny = AbortSignal as typeof AbortSignal & {
    any?: (signals: AbortSignal[]) => AbortSignal;
  };

  if (typeof abortSignalWithAny.any === "function") {
    return abortSignalWithAny.any([signal, timeoutSignal]);
  }

  return signal;
}

export function getBackendConfig() {
  const backendUrl = process.env.BACKEND_URL?.trim();
  const serverKey = process.env.NEXT_SERVER_API_SECRET?.trim();

  if (!backendUrl) {
    throw new BackendConfigError("BACKEND_URL is not set in the environment.");
  }

  if (!serverKey) {
    throw new BackendConfigError("NEXT_SERVER_API_SECRET is not set in the environment.");
  }

  return { backendUrl, serverKey };
}

export function buildBackendUrl(path: string) {
  const { backendUrl } = getBackendConfig();
  return joinUrl(backendUrl, path);
}

export async function fetchBackend(
  path: string,
  options: BackendFetchOptions = {},
): Promise<Response> {
  const { serverKey } = getBackendConfig();
  const { headers: headerInit, timeoutMs = DEFAULT_TIMEOUT_MS, signal, ...requestInit } = options;

  const headers = new Headers(headerInit);
  headers.set("X-NEXT-SERVER-KEY", serverKey);

  return fetch(buildBackendUrl(path), {
    ...requestInit,
    headers,
    signal: getTimeoutSignal(signal, timeoutMs),
  });
}