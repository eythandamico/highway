import { auth } from "@/lib/auth";
import { env } from "cloudflare:workers";
import { createHmac } from "node:crypto";
import { handle, sameOrigin, limit, HttpError, limitedBody } from "@/lib/http";
const allowed=new Set(["/get-session","/email-otp/send-verification-otp","/sign-in/email-otp","/sign-out","/update-user"]);
function run(request:Request) {return handle(async()=>{
  const path=new URL(request.url).pathname.replace(/^\/api\/auth/,"");
  if(!allowed.has(path))throw new HttpError(404,"Not found.");
  if(request.method!=="GET") {
    sameOrigin(request);
    const key=createHmac("sha256",env.BETTER_AUTH_SECRET).update(request.headers.get("CF-Connecting-IP")||"local").digest("hex");
    await limit(`auth:${key}`,30,600);
    if(path==="/email-otp/send-verification-otp") {await limit(`email:${key}`,5,600);await limit("email-global",200,86400);}
    const bytes=await limitedBody(request,8192);
    request=new Request(request.url,{method:request.method,headers:request.headers,body:bytes as BodyInit});
  }
  return auth().handler(request);
});}
export const GET=run; export const POST=run;
