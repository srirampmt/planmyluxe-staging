import { proxyToBackend } from "@/lib/backendProxy";

export const runtime = "nodejs";

/** Forwards listing query as-is. Expects slim McPackageCard items — not the CMS detail record. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
  return proxyToBackend(`/client/api/multicentre-packages/${query}`, {}, request);
}
