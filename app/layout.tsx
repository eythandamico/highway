import type { Metadata } from "next";
import { env } from "cloudflare:workers";
import { appConfig } from "@/config/app";
import { getUser } from "@/lib/session";
import { Providers } from "@/components/foundation/providers";
import { Shell } from "@/components/foundation/shell";
import "./globals.css";
import "./foundation.css";
export const dynamic="force-dynamic";
export function generateMetadata():Metadata {return {metadataBase:new URL(env.SITE_ORIGIN),title:{default:appConfig.name,template:`%s · ${appConfig.name}`},description:appConfig.description,robots:env.APP_ENV==="production"?{index:true,follow:true}:{index:false,follow:false}};}
export default async function Layout({children}:{children:React.ReactNode}) {const user=await getUser();return <html lang="en" suppressHydrationWarning><body><Providers initialUser={user}><Shell>{children}</Shell></Providers></body></html>;}
