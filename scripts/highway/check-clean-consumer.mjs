import { mkdtemp, cp, readFile, writeFile, rm, mkdir, readdir, access } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";
import { spawnSync } from "node:child_process";
import { gzipSync } from "node:zlib";

const root = resolve(import.meta.dirname, "../..");
const temporary = await mkdtemp(join(tmpdir(), "highway-consumer-"));
const consumer = join(temporary, "examples/highway-vite");
function run(command, args, cwd = root, extraEnv = {}) {
  const result = spawnSync(command, args, { cwd, stdio: "inherit", env: { ...process.env, ...extraEnv } });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} ${args.join(" ")} failed (${result.status})`);
}
try {
  run("npm", ["run", "pack:packages"]);
  run("node", ["tests/validate-highway-packages.mjs"]);
  await mkdir(consumer, { recursive: true });
  for (const name of ["src", "index.html", "audit.html", "package.json", "package-lock.json", "tsconfig.json", "package-types.fixture.tsx"]) {
    await cp(join(root, "examples/highway-vite", name), join(consumer, name), { recursive: true });
  }
  await cp(join(root, "artifacts"), join(temporary, "artifacts"), { recursive: true });
  // Keep all registry dependencies locked, but discard stale local-tarball integrity
  // so this run always installs the tarballs just produced, even at the same version.
  const lockPath = join(consumer, "package-lock.json");
  const lock = JSON.parse(await readFile(lockPath, "utf8"));
  delete lock.packages["node_modules/@highway/react"];
  delete lock.packages["node_modules/@highway/styles"];
  await writeFile(lockPath, JSON.stringify(lock, null, 2));
  const tsconfigPath = join(consumer, "tsconfig.json");
  const tsconfig = JSON.parse(await readFile(tsconfigPath, "utf8"));
  tsconfig.include = ["src", "package-types.fixture.tsx"];
  await writeFile(tsconfigPath, JSON.stringify(tsconfig, null, 2));
  run("npm", ["install", "--no-audit", "--no-fund"], consumer);
  run("npm", ["audit", "--omit=dev", "--audit-level=high"], consumer);
  run("npm", ["run", "build"], consumer);

  // Prove a Button + Theme-only consumer tree-shakes the optional date-picker graph.
  const minimalRoot = join(consumer, "minimal");
  await mkdir(join(minimalRoot, "src"), { recursive: true });
  await writeFile(join(minimalRoot, "index.html"), `<!doctype html><html><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>`);
  await writeFile(join(minimalRoot, "src/main.tsx"), `import { createRoot } from "react-dom/client";\nimport { Button, HighwayTheme } from "@highway/react";\nimport "@highway/styles/styles.css";\ncreateRoot(document.getElementById("root")!).render(<HighwayTheme><Button>Save</Button></HighwayTheme>);\n`);
  await writeFile(join(consumer, "vite.minimal.config.mjs"), `import { defineConfig } from "vite";\nexport default defineConfig({ root: "./minimal", build: { outDir: "../minimal-dist", emptyOutDir: true } });\n`);
  run("npm", ["exec", "--", "vite", "build", "--config", "vite.minimal.config.mjs"], consumer);
  const listAssets = async (directory) => (await readdir(directory, { withFileTypes: true })).flatMap(entry => entry.isDirectory() ? [] : [join(directory, entry.name)]);
  const fullAssets = await listAssets(join(consumer, "dist/assets"));
  const minimalAssets = await listAssets(join(consumer, "minimal-dist/assets"));
  const jsFiles = paths => paths.filter(path => path.endsWith(".js"));
  const cssFiles = paths => paths.filter(path => path.endsWith(".css"));
  const gzipSize = async paths => (await Promise.all(paths.map(async path => gzipSync(await readFile(path)).byteLength))).reduce((sum, size) => sum + size, 0);
  const rawSize = async paths => (await Promise.all(paths.map(async path => (await readFile(path)).byteLength))).reduce((sum, size) => sum + size, 0);
  const minimalJs = jsFiles(minimalAssets);
  const minimalText = (await Promise.all(minimalJs.map(path => readFile(path, "utf8")))).join("\n");
  if (minimalAssets.some(path => /calendar/i.test(path)) || /react-day-picker|DayPicker/.test(minimalText)) {
    throw new Error("Button + HighwayTheme consumer retained the optional calendar/date-picker graph.");
  }
  const fullJsGzip = await gzipSize(jsFiles(fullAssets));
  const fullCssGzip = await gzipSize(cssFiles(fullAssets));
  const minimalJsGzip = await gzipSize(minimalJs);
  const minimalCssGzip = await gzipSize(cssFiles(minimalAssets));
  const fullJsRaw = await rawSize(jsFiles(fullAssets));
  const fullCssRaw = await rawSize(cssFiles(fullAssets));
  const minimalJsRaw = await rawSize(minimalJs);
  const minimalCssRaw = await rawSize(cssFiles(minimalAssets));
  const budgets = JSON.parse(await readFile(join(root, "catalog/bundle-budgets.json"), "utf8"));
  for (const [name, size] of Object.entries({ minimalJsGzip, fullJsGzip, minimalCssGzip, fullCssGzip })) {
    if (!Number.isFinite(budgets[name]) || size > budgets[name]) throw new Error(`${name}: ${size} bytes exceeds reviewed gzip budget ${budgets[name]}`);
  }
  if (minimalJsGzip >= fullJsGzip) throw new Error("Button + HighwayTheme consumer did not reduce the JavaScript gzip size.");
  console.log(`Bundle evidence: full consumer JS ${fullJsRaw} B (${fullJsGzip} B gzip), CSS ${fullCssRaw} B (${fullCssGzip} B gzip); Button + Theme JS ${minimalJsRaw} B (${minimalJsGzip} B gzip), CSS ${minimalCssRaw} B (${minimalCssGzip} B gzip); optional calendar graph absent.`);

  // Compare with prior tarballs when this checkout has them; a clean clone only
  // needs to verify the current minimal import and must not fail for absent history.
  const baselineTarballs = [
    join(temporary, "artifacts/highway-react-0.2.1.tgz"),
    join(temporary, "artifacts/highway-styles-0.2.1.tgz"),
  ];
  const hasBaseline = (await Promise.all(baselineTarballs.map(path => access(path).then(() => true, () => false)))).every(Boolean);
  if (hasBaseline) {
    const baseline = join(temporary, "baseline-consumer");
    await mkdir(join(baseline, "minimal/src"), { recursive: true });
    await cp(join(minimalRoot, "index.html"), join(baseline, "minimal/index.html"));
    await cp(join(minimalRoot, "src/main.tsx"), join(baseline, "minimal/src/main.tsx"));
    await writeFile(join(baseline, "package.json"), JSON.stringify({
      private: true,
      type: "module",
      dependencies: {
        "@highway/react": "file:../artifacts/highway-react-0.2.1.tgz",
        "@highway/styles": "file:../artifacts/highway-styles-0.2.1.tgz",
        react: "19.2.8",
        "react-dom": "19.2.8",
      },
      devDependencies: { vite: "8.0.16" },
    }, null, 2));
    await writeFile(join(baseline, "vite.minimal.config.mjs"), `import { defineConfig } from "vite";\nexport default defineConfig({ root: "./minimal", build: { outDir: "../dist", emptyOutDir: true } });\n`);
    run("npm", ["install", "--no-audit", "--no-fund"], baseline);
    run("npm", ["exec", "--", "vite", "build", "--config", "vite.minimal.config.mjs"], baseline);
    const baselineAssets = await listAssets(join(baseline, "dist/assets"));
    const baselineJs = jsFiles(baselineAssets);
    const baselineText = (await Promise.all(baselineJs.map(path => readFile(path, "utf8")))).join("\n");
    const baselineHasCalendar = baselineAssets.some(path => /calendar/i.test(path)) || /react-day-picker|DayPicker/.test(baselineText);
    console.log(`Same-entry @highway/react@0.2.1 baseline: JS ${await rawSize(baselineJs)} B (${await gzipSize(baselineJs)} B gzip), CSS ${await rawSize(cssFiles(baselineAssets))} B (${await gzipSize(cssFiles(baselineAssets))} B gzip); optional calendar graph ${baselineHasCalendar ? "retained" : "absent"}.`);
  } else {
    console.log("Same-entry @highway/react@0.2.1 baseline unavailable; historical tarballs are not present in this checkout.");
  }

  const env = { HIGHWAY_CONSUMER_DIR: consumer, HIGHWAY_CONSUMER_PORT: "5193" };
  run("node", ["tests/package-browser/ssr-smoke.mjs"], root, env);
  run("npx", ["playwright", "test", "--config", "playwright.package.config.ts"], root, env);
  console.log("Clean external consumer passed: fresh tarballs, strict types, production build, SSR and browser checks.");
} finally {
  await rm(temporary, { recursive: true, force: true });
}
