import handler from "vinext/server/fetch-handler";
const worker = {
 async fetch(request:Request,env:Cloudflare.Env,ctx:ExecutionContext) {
  const response=await handler.fetch(request,env,ctx),headers=new Headers(response.headers),path=new URL(request.url).pathname;
  headers.set("X-Content-Type-Options","nosniff");headers.set("Referrer-Policy","strict-origin-when-cross-origin");headers.set("X-Frame-Options","DENY");headers.set("Permissions-Policy","camera=(), microphone=(), geolocation=()");
  if(/^\/(workspace|settings|api|signin)(\/|$)/.test(path)){headers.set("Cache-Control","private, no-store");headers.set("X-Robots-Tag","noindex, nofollow");}
  if(env.APP_ENV!=="production")headers.set("X-Robots-Tag","noindex, nofollow");
  if(env.APP_ENV==="production")headers.set("Strict-Transport-Security","max-age=31536000");
  // Start with framing restrictions; add a nonce-based script policy for your integrations.
  if(headers.get("Content-Type")?.includes("text/html")){headers.set("Cache-Control","private, no-store");headers.set("Content-Security-Policy","frame-ancestors 'none'; object-src 'none'; base-uri 'self'");}
  return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
 }
};

export default worker;
