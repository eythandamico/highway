import { defineConfig } from "vite";
import vinext from "vinext";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
const repository = fileURLToPath(new URL("../../", import.meta.url));
export function previewApp(directory: string) {
  return defineConfig({
    root: resolve(repository, directory),
    // Both apps share the root package.json; Vite's default cache would collide.
    // Keep their optimized dependency graphs separate, including in isolated tests.
    cacheDir: resolve(process.env.HIGHWAY_TEST_CACHE_DIR || resolve(repository, "node_modules/.cache/highway"), directory),
    publicDir: resolve(repository, "public"),
    plugins: [vinext()],
    define: {
      "process.env.NEXT_PUBLIC_HIGHWAY_DEMO_URL": JSON.stringify(process.env.HIGHWAY_DEMO_URL || "http://localhost:5191/demo"),
      "process.env.NEXT_PUBLIC_HIGHWAY_DOCS_URL": JSON.stringify(process.env.HIGHWAY_DOCS_URL || "http://localhost:5190"),
    },
    resolve: { alias: { "@": repository } },
    server: { fs: { allow: [repository] } },
  });
}
