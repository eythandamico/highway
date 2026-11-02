import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import ts from "typescript";

const root = process.cwd();
const readJson = (file) => JSON.parse(readFileSync(path.join(root, file), "utf8"));
const catalog = readJson("catalog/components.json");
const reactManifest = readJson("packages/highway-react/package.json");
const stylesManifest = readJson("packages/highway-styles/package.json");

function resolveSource(fromFile, specifier) {
  const base = path.resolve(path.dirname(fromFile), specifier);
  if (!path.extname(base)) {
    for (const extension of [".ts", ".tsx", ".js", ".jsx"]) {
      if (existsSync(base + extension)) return base + extension;
    }
    for (const extension of [".ts", ".tsx", ".js", ".jsx"]) {
      const indexFile = path.join(base, `index${extension}`);
      if (existsSync(indexFile)) return indexFile;
    }
  }
  return existsSync(base) ? base : null;
}

function publicExports(entryFile) {
  const names = new Set();
  const visited = new Set();
  function scan(file) {
    if (visited.has(file)) return;
    visited.add(file);
    const source = readFileSync(file, "utf8");
    const parsed = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
    for (const statement of parsed.statements) {
      if (!ts.isExportDeclaration(statement)) continue;
      if (!statement.exportClause) {
        const target = resolveSource(file, statement.moduleSpecifier.text);
        assert.ok(target, `${path.relative(root, file)} has an unresolved public re-export`);
        scan(target);
      } else if (ts.isNamedExports(statement.exportClause) && !statement.isTypeOnly) {
        for (const element of statement.exportClause.elements) {
          if (!element.isTypeOnly) names.add(element.name.text);
        }
      }
    }
  }
  scan(entryFile);
  return names;
}

assert.equal(catalog.schemaVersion, 1, "Catalog schemaVersion must be explicit and supported");
assert.equal(catalog.package, reactManifest.name, "Catalog must identify the published React package");
assert.equal(catalog.packageVersion, reactManifest.version, "Catalog package version must match the package manifest");
assert.ok(Array.isArray(catalog.rules) && catalog.rules.length > 0, "Catalog should include implementation-selection rules");
assert.equal(catalog.stylesImport, "@highway/styles/styles.css", "Catalog must use the public styles entry");
assert.ok(stylesManifest.exports?.["./styles.css"], "Styles package must expose the catalog's stylesheet");
for (const source of [
  "tokens.css",
  "typography.css",
  "controls.css",
  "foundation.css",
  "component-theme.css",
  "utilities.css",
  "vendor/shadcn-tailwind-4.13.0.css",
]) {
  const file = path.join(root, "packages/highway-styles/src", source);
  assert.ok(existsSync(file), `Canonical stylesheet source is missing: packages/highway-styles/src/${source}`);
  assert.ok(readFileSync(file, "utf8").trim(), `Canonical stylesheet source is empty: packages/highway-styles/src/${source}`);
}

for (const [legacyPath, canonicalPath] of [
  ["app/tokens.css", "packages/highway-styles/src/tokens.css"],
  ["app/typography.css", "packages/highway-styles/src/typography.css"],
  ["app/controls.css", "packages/highway-styles/src/controls.css"],
  ["app/foundation.css", "packages/highway-styles/src/foundation.css"],
  ["packages/highway-compat/tokens/theme.css", "packages/highway-styles/src/component-theme.css"],
  ["vendor/shadcn-tailwind-4.13.0.css", "packages/highway-styles/src/vendor/shadcn-tailwind-4.13.0.css"],
]) {
  const legacyFile = path.resolve(root, legacyPath);
  const legacySource = readFileSync(legacyFile, "utf8");
  const imported = legacySource.match(/^\s*@import\s+["']([^"']+)["'];\s*$/m)?.[1];
  assert.ok(imported, `${legacyPath} should remain a compatibility import, not a duplicate stylesheet`);
  assert.equal(
    resolveSource(legacyFile, imported),
    path.resolve(root, canonicalPath),
    `${legacyPath} must import the package-owned stylesheet ${canonicalPath}`,
  );
}

const exports = publicExports(path.resolve(root, "packages/highway-react/src/index.ts"));
assert.ok(exports.has(catalog.themeExport), "Catalog theme export must exist in the public package entrypoint");
assert.ok(Array.isArray(catalog.components) && catalog.components.length > 0, "Catalog must list public component APIs");
const catalogExportNames = catalog.components.map((component) => component.export);
assert.equal(new Set(catalogExportNames).size, catalogExportNames.length, "Every public runtime export must have one canonical catalog record");
assert.deepEqual(
  [...catalogExportNames].sort(),
  [...exports].sort(),
  "Catalog should contain every and only public runtime export; type-only names are not installable components",
);

const ids = new Set();
for (const component of catalog.components) {
  assert.match(component.id, /^highway\.[a-z0-9]+(?:-[a-z0-9]+)*$/, `Invalid stable component ID: ${component.id}`);
  assert.ok(!ids.has(component.id), `Duplicate component ID: ${component.id}`);
  ids.add(component.id);
  assert.ok(exports.has(component.export), `${component.id} claims missing public export ${component.export}`);
  const sourceFile = resolveSource(path.resolve(root, "package.json"), component.source);
  assert.ok(sourceFile, `${component.id} references missing source ${component.source}`);
  assert.ok(
    path.relative(path.resolve(root, "packages/highway-react/src"), sourceFile).split(path.sep)[0] !== "..",
    `${component.id} must point to the canonical package-owned implementation, got ${component.source}`,
  );
  assert.ok(["supported", "alternative"].includes(component.status), `${component.id} has invalid status ${component.status}`);
  assert.ok(["component", "helper"].includes(component.kind), `${component.id} has invalid API kind ${component.kind}`);
  assert.ok(typeof component.useWhen === "string" && component.useWhen.trim(), `${component.id} needs a useWhen explanation`);
  assert.ok(Array.isArray(component.constraints) && component.constraints.length > 0, `${component.id} needs explicit implementation constraints`);
  if (component.status === "alternative") {
    assert.ok(
      component.constraints.some((constraint) => !/do not recreate/i.test(constraint) && /\bnot\b|prefer /i.test(constraint)),
      `${component.id} must explain its distinction from the recommended API`,
    );
  }
}

const packageOwnedOnlyPaths = new Set([
  "components/ui/number-ticker.tsx",
  "components/ui/token-icon.tsx",
  "components/ui/breadcrumbs.tsx",
  "components/ui/copy-page.tsx",
]);

const compatibilityCatalog = readJson("packages/highway-compat/components.json");
const compatibilityByExport = new Map();
for (const entry of Object.values(compatibilityCatalog)) {
  const exportNames = entry.export.split(",").map((name) => name.trim());
  for (const exportName of exportNames) compatibilityByExport.set(exportName, entry.file);
}

function assertCompatibilityReexport(legacyPath, canonicalPath, context) {
  const legacyFile = path.resolve(root, legacyPath);
  if (packageOwnedOnlyPaths.has(legacyPath)) {
    assert.ok(!existsSync(legacyFile), `${context} is package-owned and should not acquire a duplicate legacy implementation at ${legacyPath}`);
    return;
  }
  assert.ok(existsSync(legacyFile), `${context} lost its legacy compatibility path ${legacyPath}`);
  const parsed = ts.createSourceFile(legacyFile, readFileSync(legacyFile, "utf8"), ts.ScriptTarget.Latest, true);
  const targets = parsed.statements
    .filter((statement) => ts.isExportDeclaration(statement) && statement.moduleSpecifier && ts.isStringLiteral(statement.moduleSpecifier))
    .map((statement) => resolveSource(legacyFile, statement.moduleSpecifier.text))
    .filter(Boolean);
  assert.ok(targets.includes(canonicalPath), `${legacyPath} must re-export its canonical source ${path.relative(root, canonicalPath)}`);
}

for (const component of catalog.components) {
  const canonicalPath = resolveSource(path.resolve(root, "package.json"), component.source);
  const packageRelative = path.relative(path.resolve(root, "packages/highway-react/src"), canonicalPath).split(path.sep).join("/");
  let legacyPath = null;
  const compatibilityFile = compatibilityByExport.get(component.export);
  if (compatibilityFile === packageRelative) legacyPath = `packages/highway-compat/${compatibilityFile}`;
  else if (packageRelative.startsWith("components/")) legacyPath = packageRelative;
  else if (packageRelative.startsWith("lib/")) legacyPath = `lib/${packageRelative.slice("lib/".length)}`;
  if (legacyPath) assertCompatibilityReexport(legacyPath, canonicalPath, component.id);
}

const componentIds = new Set();
for (const entry of [...(catalog.recipes ?? [])]) {
  assert.match(entry.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, `Invalid recipe ID: ${entry.id}`);
  assert.ok(!componentIds.has(entry.id), `Duplicate recipe ID: ${entry.id}`);
  componentIds.add(entry.id);
  assert.ok(typeof entry.purpose === "string" && entry.purpose.trim(), `${entry.id} needs a purpose`);
  assert.ok(Array.isArray(entry.exports) && entry.exports.length > 0, `${entry.id} needs a public composition`);
  for (const name of entry.exports) assert.ok(exports.has(name), `${entry.id} references missing public export ${name}`);
}

const gapIds = new Set();
for (const gap of catalog.gaps ?? []) {
  assert.match(gap.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, `Invalid catalog gap ID: ${gap.id}`);
  assert.ok(!gapIds.has(gap.id), `Duplicate catalog gap ID: ${gap.id}`);
  gapIds.add(gap.id);
  assert.ok(resolveSource(path.resolve(root, "package.json"), gap.source), `${gap.id} references missing source ${gap.source}`);
  assert.equal(gap.availability, "source-only", `${gap.id} availability must state that it is not in the published package`);
  const missingExport = gap.export ?? gap.id.split("-").map((part) => part[0].toUpperCase() + part.slice(1)).join("");
  assert.ok(!exports.has(missingExport), `${gap.id} is marked as missing but ${missingExport} is publicly exported`);
  assert.ok(typeof gap.reason === "string" && gap.reason.trim(), `${gap.id} needs a reason`);
  assert.ok(typeof gap.fallback === "string" && gap.fallback.trim(), `${gap.id} needs a usable fallback`);
}

const registry = readJson("apps/showcase/previews/metadata.json");
const showcaseSource = readFileSync(path.join(root, "apps/showcase/previews/examples.tsx"), "utf8");
const localShowcaseIds = [...showcaseSource.matchAll(/\{\s*["']?id["']?\s*:\s*["']([a-z0-9-]+)["']\s*,\s*["']?name["']?\s*:/g)].map((match) => match[1]);
const showcaseIds = new Set([...localShowcaseIds, ...registry.map((entry) => entry.id)]);
const catalogShowcaseIds = Object.keys(catalog.showcase ?? {});
assert.equal(new Set(localShowcaseIds).size, localShowcaseIds.length, "Showcase source has duplicate local IDs");
assert.equal(new Set(catalogShowcaseIds).size, catalogShowcaseIds.length, "Catalog has duplicate showcase IDs");
assert.deepEqual(
  [...catalogShowcaseIds].sort(),
  [...showcaseIds].sort(),
  "Catalog availability must cover every local and Highway showcase entry, including legacy aliases",
);

for (const [id, mapping] of Object.entries(catalog.showcase)) {
  assert.ok(["package", "mixed", "demo-only"].includes(mapping.availability), `${id} needs an installability classification`);
  assert.ok(typeof mapping.note === "string" && mapping.note.trim(), `${id} needs an installability note`);
  assert.ok(Array.isArray(mapping.exports), `${id} must list its package exports`);
  for (const name of mapping.exports) assert.ok(exports.has(name), `${id} references missing package export ${name}`);
  if (mapping.availability === "demo-only") {
    assert.deepEqual(mapping.exports, [], `${id} is demo-only and must not claim installable exports`);
  } else {
    assert.ok(mapping.exports.length > 0, `${id} must list the package exports needed to install the showcased example`);
  }
}

console.log(`Component catalog contract passed: ${catalog.components.length} APIs, ${catalogShowcaseIds.length} showcase entries, ${catalog.recipes.length} recipes, ${catalog.gaps.length} documented gap.`);
