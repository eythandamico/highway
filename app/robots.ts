import { env } from "cloudflare:workers";
export default function robots(){return {rules:env.APP_ENV==="production"?{userAgent:"*",allow:"/",disallow:["/api/","/workspace","/settings","/components"]}:{userAgent:"*",disallow:"/"},sitemap:`${env.SITE_ORIGIN}/sitemap.xml`};}
