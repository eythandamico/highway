import { existsSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
if (!existsSync(".dev.vars")) {
  writeFileSync(".dev.vars", `APP_ENV=development
SITE_ORIGIN=http://localhost:5188
BETTER_AUTH_SECRET=${randomBytes(48).toString("hex")}
AUTH_DELIVERY=console
`, {mode:0o600});
  console.log("Created local configuration with a unique secret.");
} else console.log("Kept existing .dev.vars.");
console.log("Next: npm run db:migrate && npm run dev. Local email codes appear in the server terminal.");
