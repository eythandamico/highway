// Check public deployment configuration only; secrets are provisioned separately.
import { readFileSync } from "node:fs";
const config = JSON.parse(readFileSync("wrangler.jsonc", "utf8"));
const errors = [];
if (config.vars?.APP_ENV !== "production") errors.push("Set APP_ENV=production.");
if (config.vars?.AUTH_DELIVERY !== "email") errors.push("Set AUTH_DELIVERY=email.");
if (!/^https:\/\//.test(config.vars?.SITE_ORIGIN || "")) errors.push("Set your HTTPS SITE_ORIGIN.");
if (config.d1_databases?.some(d => d.database_id === "00000000-0000-0000-0000-000000000000")) errors.push("Create your D1 database and replace the placeholder ID.");
if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
console.log("Public release config valid. Also provision auth/email secrets, apply remote migrations and run the release checklist. Nothing deployed.");
