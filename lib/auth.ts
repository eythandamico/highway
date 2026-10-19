import { betterAuth } from "better-auth/minimal";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { emailOTP } from "better-auth/plugins/email-otp";
import { createHmac } from "node:crypto";
import { drizzle } from "drizzle-orm/d1";
import { env } from "cloudflare:workers";
import * as schema from "@/db/auth-schema";
import { appConfig } from "@/config/app";
import { signInEmail } from "./email";
export function auth() {
  if(!env.BETTER_AUTH_SECRET || env.BETTER_AUTH_SECRET.length<32 || env.BETTER_AUTH_SECRET.startsWith("replace-"))throw new Error("Run npm run setup or configure authentication secrets.");
  const origin=new URL(env.SITE_ORIGIN);
  const local=env.APP_ENV === "development" && ["localhost","127.0.0.1","[::1]"].includes(origin.hostname);
  if(!local && (origin.protocol!=="https:" || env.AUTH_DELIVERY!=="email"))throw new Error("Production requires HTTPS and email delivery.");
  return betterAuth({appName:appConfig.name,baseURL:origin.origin,secret:env.BETTER_AUTH_SECRET,
    database:drizzleAdapter(drizzle(env.DB),{provider:"sqlite",schema,transaction:false}),
    trustedOrigins:[origin.origin], session:{expiresIn:7*86400,updateAge:86400,cookieCache:{enabled:false}},
    advanced:{useSecureCookies:origin.protocol==="https:",defaultCookieAttributes:{httpOnly:true,sameSite:"lax",path:"/"}},
    // Atomic D1 limits are enforced before every auth POST in the route handler.
    rateLimit:{enabled:true}, logger:{disabled:true},
    plugins:[emailOTP({otpLength:6,expiresIn:600,allowedAttempts:5,resendStrategy:"rotate",
      storeOTP:{hash:async code=>createHmac("sha256",env.BETTER_AUTH_SECRET).update(code).digest("hex")},
      sendVerificationOTP:async ({email,otp,type})=>{
        if(type!=="sign-in")throw new Error("Only sign-in codes are supported.");
        if(local && env.AUTH_DELIVERY==="console") {console.info(`[LOCAL SIGN IN] ${email}: ${otp}`);return;}
        if(!env.SENDGRID_API_TOKEN || !env.FROM_ADDRESS)throw new Error("Email delivery is not configured.");
        const message=signInEmail(otp,origin.origin);
        const response=await fetch("https://api.sendgrid.com/v3/mail/send",{method:"POST",headers:{Authorization:`Bearer ${env.SENDGRID_API_TOKEN}`,"Content-Type":"application/json"},body:JSON.stringify({personalizations:[{to:[{email}]}],from:{email:env.FROM_ADDRESS,name:appConfig.name},subject:message.subject,content:[{type:"text/plain",value:message.text},{type:"text/html",value:message.html}],tracking_settings:{click_tracking:{enable:false,enable_text:false},open_tracking:{enable:false}}}),signal:AbortSignal.timeout(15000)});
        if(!response.ok)throw new Error("Email delivery is temporarily unavailable.");
      }} )]});
}
