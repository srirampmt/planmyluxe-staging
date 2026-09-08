import { proxyToBackend } from "@/lib/backendProxy";

export async function GET() {
  return proxyToBackend("/client/app/api/toptrendingmulticentre/");
}
