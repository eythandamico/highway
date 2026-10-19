import { readFile, writeFile, mkdir, rm, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { build } from "esbuild";
import { compile, optimize } from "@tailwindcss/node";
import { Scanner } from "@tailwindcss/oxide";
import postcss from "postcss";
const root = fileURLToPath(new URL("../../", import.meta.url));
const reactDir = path.join(root, "packages/highway-react");
const stylesDir = path.join(root, "packages/highway-styles");
const read = file => readFile(path.join(root, file), "utf8");
const cssFiles = new Set();
await rm(path.join(reactDir, "dist"), { recursive: true, force: true });
await rm(path.join(stylesDir, "dist"), { recursive: true, force: true });
await mkdir(path.join(stylesDir, "dist"), { recursive: true });
const result = await build({
  absWorkingDir: root, entryPoints: { index: "packages/highway-react/src/index.ts" },
  outdir: path.join(reactDir, "dist"), bundle: true, splitting: true, format: "esm", platform: "browser", target: "es2020",
  jsx: "automatic", packages: "external", alias: { "@": root }, metafile: true, sourcemap: false,
  banner: { js: '"use client";' },
  plugins: [{ name: "collect-component-css", setup(builder) {
    builder.onLoad({ filter: /\.css$/ }, args => { cssFiles.add(args.path); return { contents: "", loader: "js" }; });
  }}],
});
const inputs = Object.keys(result.metafile.inputs);
if (inputs.some(file => /(^|\/)(worker|server|yardwork)\/|lib\/(auth|session|db)/.test(file))) throw new Error("Application runtime leaked into library");
const packageName = specifier => specifier.startsWith("@") ? specifier.split("/").slice(0, 2).join("/") : specifier.split("/")[0];
const externals = [...new Set(Object.values(result.metafile.outputs).flatMap(output => output.imports.filter(item => item.external).map(item => packageName(item.path))))];
const rootManifest = JSON.parse(await read("package.json"));
const manifest = JSON.parse(await read("packages/highway-react/package.json"));
manifest.dependencies = {};
for (const name of externals.sort()) {
  if (name in manifest.peerDependencies) continue;
  if (!rootManifest.dependencies[name] || /^(next|better-auth|drizzle|@cloudflare)/.test(name)) throw new Error(`Unexpected runtime dependency: ${name}`);
  manifest.dependencies[name] = rootManifest.dependencies[name];
}
await writeFile(path.join(reactDir, "package.json"), JSON.stringify(manifest, null, 2) + "\n");
execFileSync(path.join(root, "node_modules/.bin/tsc"), ["-p", "scripts/highway/tsconfig.types.json"], { cwd: root, stdio: "inherit" });
async function files(directory) { return (await Promise.all((await readdir(directory, { withFileTypes: true })).map(entry => entry.isDirectory() ? files(path.join(directory, entry.name)) : [path.join(directory, entry.name)]))).flat(); }
const typesRoot = path.join(reactDir, "dist/types");
for (const file of await files(typesRoot)) {
  const source = await readFile(file, "utf8");
  const rewritten = source.replace(/(["'])@\/([^"']+)\1/g, (_, quote, imported) => {
    let relative = path.relative(path.dirname(file), path.join(typesRoot, imported)).replaceAll(path.sep, "/");
    if (!relative.startsWith(".")) relative = `./${relative}`;
    return `${quote}${relative}${quote}`;
  }).replace(/^import ["'][^"']+\.css["'];?\s*$/gm, "");
  await writeFile(file, rewritten);
}
// Compile only classes actually referenced by the component dependency graph.
const scanner = new Scanner({ sources: [] });
const candidates = scanner.scanFiles(await Promise.all(inputs.filter(file => /\.[jt]sx?$/.test(file)).map(async file => ({ content: await read(file), extension: path.extname(file).slice(1) }))));
const globals = await read("app/globals.css");
const theme = globals.slice(globals.indexOf("@custom-variant"), globals.indexOf("\n* {"));
const base = globals.slice(globals.indexOf("\n* {"), globals.indexOf("\n.brand {"));
const common = ["app/tokens.css", "app/typography.css", "app/controls.css", "app/foundation.css", "packages/invariant-ui/tokens/theme.css"];
const imports = [...common, ...[...cssFiles].map(file => path.relative(root, file))].map(file => `@import "./${file}";`).join("\n");
const compiler = await compile(`@import "tailwindcss" source(none);\n@import "tw-animate-css";\n@import "./vendor/shadcn-tailwind-4.13.0.css";\n${imports}\n${theme}\n${base}`, { base: root, onDependency() {} });
function scopeCSS(css) {
  // Flatten Tailwind nesting before prefixing so every selector is confined to Highway.
  const ast = postcss.parse(optimize(css, { minify: false }).code);
  ast.walkRules(rule => {
    if (rule.parent?.type === "atrule" && /keyframes$/.test(rule.parent.name)) return;
    // Browser/document scroll locking remains the host application's concern.
    if (/scroll-locked/.test(rule.selector)) { rule.remove(); return; }
    rule.selectors = rule.selectors.flatMap(selector => {
      const trimmed = selector.trim();
      if ([":root", ":host", "html", "body"].includes(trimmed)) return [":where(.highway)"];
      if (trimmed === ".dark" || trimmed === '[data-theme="dark"]') return [':where(.highway[data-highway-mode="dark"])'];
      if (trimmed === "[data-theme]") return [":where(.highway)"];
      if (["*", "::before", "::after", "::backdrop"].includes(trimmed)) return [`:where(.highway)${trimmed.startsWith("::") ? trimmed : ""}`, `:where(.highway) ${trimmed}`];
      return [`:where(.highway) ${trimmed.replace(/:root|:host/g, ".highway").replace(/(^|[\s>+~])(?:html|body)(?=$|[\s>+~.#[:])/g, "$1.highway")}`];
    });
  });
  return ast.toString();
}
await writeFile(path.join(stylesDir, "dist/styles.css"), scopeCSS(compiler.build(candidates)));
// Styles-only consumers can opt into tokens/effects without React or all component utilities.
const tokens = (await read("app/tokens.css")) + "\n" + (await read("app/typography.css"));
const tokenCompiler = await compile(tokens, { base: root, onDependency() {} });
await writeFile(path.join(stylesDir, "dist/tokens.css"), scopeCSS(tokenCompiler.build([])));
await writeFile(path.join(stylesDir, "dist/effects.css"), scopeCSS(tokenCompiler.build([]) + "\n" + await read("components/visual/visual-effects.css")));
const notices = "# Third-party notices\n\nHighway includes adapted Invariant UI code under the following license. Other dependencies retain their respective licenses.\n\n" + await read("packages/invariant-ui/LICENSE");
for (const directory of [reactDir, stylesDir]) await writeFile(path.join(directory, "THIRD-PARTY-NOTICES.md"), notices);
await writeFile(path.join(reactDir, "dist/build-manifest.json"), JSON.stringify({ version: manifest.version, sourceFiles: inputs.sort(), externalDependencies: externals.sort() }, null, 2));
console.log(`Built ${manifest.name}@${manifest.version}: ${inputs.length} shared source modules, ${candidates.length} CSS candidates. No application runtime.`);
