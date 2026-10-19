import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const fixtureRoot = resolve("examples/highway-vite");
const packageRoot = resolve(fixtureRoot, "node_modules/@highway/react");
const manifest = JSON.parse(readFileSync(resolve(packageRoot, "package.json"), "utf8"));
const importTarget = manifest.exports?.["."]?.import ?? manifest.module ?? manifest.main;
assert.ok(importTarget, "@highway/react does not expose an ESM import entry");

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
