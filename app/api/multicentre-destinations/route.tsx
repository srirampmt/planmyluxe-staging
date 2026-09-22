import { proxyToBackend } from "@/lib/backendProxy";
 
export const runtime = "nodejs";
 
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const query = q ? `?q=${encodeURIComponent(q)}` : "";
  return proxyToBackend(`/client/api/multicentre-destinations/${query}`, {}, request);
}