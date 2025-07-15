// Cloudflare Pages Functions middleware
export async function onRequest(context) {
  // Bu dosya Cloudflare'a bunun bir Pages projesi olduğunu söyler
  return context.next();
}