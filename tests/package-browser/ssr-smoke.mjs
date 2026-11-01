import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { mkdtempSync } from "node:fs";
import { pathToFileURL } from "node:url";

const fixtureRoot = resolve(process.env.HIGHWAY_CONSUMER_DIR || "examples/highway-vite");
const repositoryRoot = process.cwd();
const packageRoot = resolve(fixtureRoot, "node_modules/@highway/react");
const manifest = JSON.parse(readFileSync(resolve(packageRoot, "package.json"), "utf8"));
const importTarget = manifest.exports?.["."]?.import ?? manifest.module ?? manifest.main;
assert.ok(importTarget, "@highway/react does not expose an ESM import entry");

function filesBelow(directory, prefix = "") {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    return entry.isDirectory() ? filesBelow(resolve(directory, entry.name), relative) : [relative];
  });
}

// Compare the installed files to this run's freshly packed tarballs. A successful
// import alone cannot catch npm reusing a stale same-version local archive.
const artifactRoot = resolve(process.env.HIGHWAY_ARTIFACTS_DIR || resolve(fixtureRoot, "../../artifacts"));
const packages = [
  { sourceManifest: "packages/highway-react/package.json", name: "@highway/react" },
  { sourceManifest: "packages/highway-styles/package.json", name: "@highway/styles" },
].map(({ sourceManifest, name }) => {
  const { version } = JSON.parse(readFileSync(resolve(repositoryRoot, sourceManifest), "utf8"));
  return { archiveName: `highway-${name.split("/")[1]}-${version}.tgz`, name };
});
for (const { archiveName, name: packageName } of packages) {
  const archive = resolve(artifactRoot, archiveName);
  const installedRoot = resolve(fixtureRoot, "node_modules", packageName);
  const extractionRoot = mkdtempSync(resolve(tmpdir(), "highway-tarball-check-"));
  try {
    execFileSync("tar", ["-xzf", archive, "-C", extractionRoot]);
    const archivedDist = resolve(extractionRoot, "package/dist");
    const installedDist = resolve(installedRoot, "dist");
    const expectedFiles = filesBelow(archivedDist).sort();
    const installedFiles = filesBelow(installedDist).sort();
    assert.deepEqual(installedFiles, expectedFiles, `${packageName} installed files differ from ${archiveName}`);
    for (const relative of expectedFiles) {
      assert.deepEqual(
        readFileSync(resolve(installedDist, relative)),
        readFileSync(resolve(archivedDist, relative)),
        `${packageName}/dist/${relative} is not from the freshly packed archive`,
      );
    }
  } finally {
    rmSync(extractionRoot, { recursive: true, force: true });
  }
}

const fixtureRequire = createRequire(resolve(fixtureRoot, "package.json"));
const React = fixtureRequire("react");
const { renderToString } = fixtureRequire("react-dom/server");
const api = await import(pathToFileURL(resolve(packageRoot, importTarget)).href);
assert.equal(typeof api.HighwayTheme, "function", "HighwayTheme must be importable during SSR");
assert.equal(typeof api.Button, "function", "Button must be importable during SSR");

const html = renderToString(
  React.createElement(
    api.HighwayTheme,
    { mode: "dark", brand: { primary: "#1849a9", primaryForeground: "#ffffff" } },
    React.createElement(api.Button, { type: "button" }, "Server render"),
  ),
);
assert.match(html, /data-highway-mode="dark"/, "Theme mode should be present in server output");
assert.match(html, /Server render/, "A package component should render to HTML without browser globals");
assert.match(html, /--primary:#1849a9|--primary: #1849a9/, "Brand tokens should be emitted during server rendering");
console.log("Highway React package import and React SSR smoke passed (not a full Next.js integration test).");
