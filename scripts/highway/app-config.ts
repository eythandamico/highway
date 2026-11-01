import { defineConfig } from "vite";
import vinext from "vinext";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
const repository = fileURLToPath(new URL("../../", import.meta.url));
export function previewApp(directory: string) {
  return defineConfig({
    root: resolve(repository, directory),
    cacheDir: process.env.HIGHWAY_TEST_CACHE_DIR ? resolve(process.env.HIGHWAY_TEST_CACHE_DIR) : undefined,
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
