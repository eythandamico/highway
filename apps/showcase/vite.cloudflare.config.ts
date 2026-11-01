import { defineConfig } from "vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import { previewApp } from "../../scripts/highway/app-config";
export default defineConfig(() => {
  process.env.HIGHWAY_DEMO_URL ??= "https://highway-demo.winter-lake-b4eb.workers.dev/demo";
  process.env.HIGHWAY_DOCS_URL ??= "https://highway.winter-lake-b4eb.workers.dev";
  const base = previewApp("apps/showcase");
  return { ...base, plugins: [base.plugins, cloudflare({ configPath: "wrangler.jsonc", viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] }, inspectorPort: false })] };
});
