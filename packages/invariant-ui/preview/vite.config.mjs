import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
export default defineConfig({root: fileURLToPath(new URL(".",import.meta.url)), base:"/invariant-preview/", resolve:{alias:{"@":fileURLToPath(new URL("../../..",import.meta.url))}}, build:{outDir:"../../../public/invariant-preview",emptyOutDir:true}, esbuild:{jsx:"automatic"}});
