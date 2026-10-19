import { env } from "cloudflare:workers";
import { appConfig } from "@/config/app";
export default function sitemap(){return appConfig.publicPages.map(path=>({url:new URL(path,env.SITE_ORIGIN).href}));}
