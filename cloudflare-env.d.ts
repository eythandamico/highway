declare namespace Cloudflare {
  interface Env {
    DB: D1Database; BUCKET: R2Bucket;
    APP_ENV: "development" | "production";
    SITE_ORIGIN: string; BETTER_AUTH_SECRET: string;
    AUTH_DELIVERY: "console" | "email";
    SENDGRID_API_TOKEN?: string; FROM_ADDRESS?: string;
  }
}
