import { proxyToBackend } from "@/lib/backendProxy";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const encoded = encodeURIComponent(slug);
  return proxyToBackend(`/client/api/offertypes/${encoded}/`);
}
