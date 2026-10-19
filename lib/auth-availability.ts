import { env } from "cloudflare:workers";

/** Only expose availability to clients, never delivery credentials. */
export function signInAvailable() {
  const local = env.APP_ENV === "development"
    && ["localhost", "127.0.0.1", "[::1]"].includes(new URL(env.SITE_ORIGIN).hostname);
  return (local && env.AUTH_DELIVERY === "console")
    || (env.AUTH_DELIVERY === "email" && Boolean(env.SENDGRID_API_TOKEN && env.FROM_ADDRESS));
}
