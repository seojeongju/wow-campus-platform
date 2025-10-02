// Cloudflare Pages compatibility layer
export async function onRequest() {
  // This ensures Cloudflare Pages can properly handle the build
  return new Response(null, { status: 404 });
}