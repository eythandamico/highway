import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
// Framework-independent packages deliberately use native images; Next/Image would couple hosts to Next.
export default defineConfig([...nextVitals, ...nextTs,
  { files: ["packages/highway-react/src/**/*.{js,jsx,ts,tsx}"], rules: { "@next/next/no-img-element": "off", "@typescript-eslint/no-unused-vars": "error", "react-hooks/exhaustive-deps": "error" } },
  globalIgnores(["**/.next/**", "**/.vinext/**","**/dist/**", "public/invariant-preview/**", ".wrangler/**", ".vinext/**", "storybook-static/**", "artifacts/**", "test-results/**", "playwright-report/**", "next-env.d.ts"]),
]);
