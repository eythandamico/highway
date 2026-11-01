import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = path.resolve(packageRoot, "../..");
const serverEntry = path.join(packageRoot, "src/server.mjs");
const packageManifest = JSON.parse(readFileSync(path.join(packageRoot, "package.json"), "utf8"));
const libraryManifest = JSON.parse(readFileSync(path.join(repositoryRoot, "packages/highway-react/package.json"), "utf8"));
const sourceCatalog = JSON.parse(readFileSync(path.join(repositoryRoot, "catalog/components.json"), "utf8"));

function run(command, args, cwd, options = {}) {
  return spawnSync(command, args, {
    cwd,
    env: { ...process.env, ...options.env },
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
    timeout: 120_000,
  });
}

function runOk(command, args, cwd, options) {
  const result = run(command, args, cwd, options);
  assert.ifError(result.error);
  assert.equal(result.status, 0, `${command} ${args.join(" ")} failed:\n${result.stdout}\n${result.stderr}`);
  return result.stdout;
}

function treeSnapshot(directory) {
  const output = [];
  const walk = (current, prefix = "") => {
    for (const entry of readdirSync(current, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const relative = path.posix.join(prefix, entry.name);
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "node_modules") continue;
        output.push(`${relative}/`);
        walk(absolute, relative);
      } else {
        output.push(`${relative}:${readFileSync(absolute).toString("base64")}`);
      }
    }
  };
  walk(directory);
  return output;
}

function contentText(result) {
  return (result.content ?? []).filter((block) => block.type === "text").map((block) => block.text).join("\n");
}

function data(result) {
  assert.notEqual(result.isError, true, contentText(result));
  assert.ok(result.structuredContent && typeof result.structuredContent === "object", "Tool result should provide structured JSON");
  const text = contentText(result);
  assert.ok(text, "Successful tool results should include a text representation");
  assert.deepEqual(JSON.parse(text), result.structuredContent, "Text and structuredContent should represent the same JSON result");
  return result.structuredContent;
}

function assertToolError(result, pattern = /error|unknown|not found|demo-only/i) {
  assert.equal(result.isError, true, `Expected isError=true, received: ${contentText(result)}`);
  assert.match(contentText(result), pattern);
}

async function withClient(serverCommand, args, cwd, callback) {
  const transport = new StdioClientTransport({
    command: serverCommand,
    args,
    cwd,
    stderr: "pipe",
  });
  const client = new Client({ name: "highway-mcp-contract-tests", version: "1.0.0" });
  try {
    await withTimeout(client.connect(transport), 20_000, "stdio MCP handshake timed out");
    await callback(client);
  } finally {
    await client.close().catch(() => {});
    await transport.close().catch(() => {});
  }
}

function withTimeout(promise, milliseconds, message) {
  let timer;
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(message)), milliseconds);
    }),
  ]).finally(() => clearTimeout(timer));
}

test("Highway MCP exposes its read-only API over stdio", { timeout: 120_000 }, async (t) => {
  const before = treeSnapshot(packageRoot);
  const hostRoot = mkdtempSync(path.join(os.tmpdir(), "highway-mcp-readonly-host-"));
  t.after(() => rmSync(hostRoot, { recursive: true, force: true }));
  mkdirSync(path.join(hostRoot, "src"), { recursive: true });
  writeFileSync(path.join(hostRoot, "package.json"), `{"name":"simulated-host","private":true}\n`);
  writeFileSync(path.join(hostRoot, "wrangler.jsonc"), `{"name":"existing-deployment"}\n`);
  writeFileSync(path.join(hostRoot, "src/routes.ts"), "export const existingRoute = true;\n");
  const secret = `HIGHWAY_MCP_HOST_SENTINEL_${process.pid}`;
  const secretPath = path.join(hostRoot, ".env");
  writeFileSync(secretPath, `${secret}=private\n`);
  const hostBefore = treeSnapshot(hostRoot);
  await withClient(process.execPath, [serverEntry], hostRoot, async (client) => {
    const serverInfo = client.getServerVersion();
    assert.equal(serverInfo.name, "highway");
    assert.equal(serverInfo.version, packageManifest.version, "MCP server metadata should match its package manifest");

    await t.test("lists bounded tools and documented resource routes", async () => {
      const { tools } = await client.listTools();
      assert.deepEqual(new Set(tools.map((tool) => tool.name)), new Set([
        "list_families",
        "get_family",
        "select_variant",
        "search_components",
        "get_component",
        "get_guidance",
        "get_installation",
      ]));
      for (const tool of tools) {
        assert.ok(tool.inputSchema && tool.inputSchema.type === "object", `${tool.name} should publish a strict object schema`);
        assert.equal(tool.annotations?.readOnlyHint, true, `${tool.name} must be marked read-only`);
        assert.equal(tool.annotations?.destructiveHint, false, `${tool.name} must not be marked destructive`);
        assert.equal(tool.annotations?.openWorldHint, false, `${tool.name} must not be marked open-world`);
      }

      const { resources } = await client.listResources();
      const uris = new Set(resources.map((resource) => resource.uri));
      assert.ok(uris.has("highway://catalog"));
      assert.ok(uris.has("highway://families"));
      for (const topic of ["implementation", "packages", "design", "effects", "systems", "interactions"]) assert.ok(uris.has(`highway://guides/${topic}`));
      assert.ok([...uris].some((uri) => uri.startsWith("highway://declarations/")));
    });

    await t.test("serves bounded catalog search, default limits, and offsets", async () => {
      const firstPage = data(await client.callTool({ name: "search_components", arguments: {} }));
      assert.equal(firstPage.packageVersion, libraryManifest.version);
      assert.equal(firstPage.offset, 0);
      assert.equal(firstPage.items.length, 8, "Default query should use the documented page size");
      assert.ok(firstPage.total >= firstPage.items.length);

      const bounded = data(await client.callTool({
        name: "search_components",
        arguments: { query: "", limit: 20, offset: 0 },
      }));
      assert.equal(bounded.items.length, 20);
      assert.ok(bounded.items.length <= 20);
      const nextPage = data(await client.callTool({
        name: "search_components",
        arguments: { query: "", limit: 20, offset: 20 },
      }));
      assert.equal(nextPage.offset, 20);
      assert.ok(nextPage.items.every((item) => !bounded.items.some((first) => first.id === item.id)), "Pages should not repeat catalog entries");
      assert.equal(bounded.total, nextPage.total);

      const matching = data(await client.callTool({
        name: "search_components",
        arguments: { query: "GlassCard", limit: 20 },
      }));
      assert.ok(matching.items.some((item) => item.export === "GlassCard"));
    });

    await t.test("lists family metadata and returns exact family variants", async () => {
      const listed = data(await client.callTool({ name: "list_families", arguments: { query: "combobox" } }));
      assert.equal(listed.packageVersion, libraryManifest.version);
      const comboboxFamily = listed.items.find((item) => item.id === "combobox");
      assert.ok(comboboxFamily, "Search should include the Combobox family by its exact ID");
      assert.deepEqual(comboboxFamily.variants.map((variant) => variant.id), ["combobox", "multi-select"]);
      assert.ok(comboboxFamily.variants.every((variant) => variant.exports.length > 0));

      const family = data(await client.callTool({ name: "get_family", arguments: { family: "combobox" } }));
      assert.equal(family.family.id, "combobox");
      const multiple = family.family.variants.find((variant) => variant.id === "multi-select");
      assert.deepEqual(multiple.exports, ["Combobox"]);
      assert.equal(multiple.props.multiple, true);
      assert.deepEqual(multiple.compatibility, ["MultiSelect"]);
      const resource = await client.readResource({ uri: "highway://families" });
      assert.ok(resource.contents.some((item) => item.text?.includes('"id":"combobox"')));
    });

    await t.test("selects only explicit or sole family variants and does not claim a keyword recommendation", async () => {
      const explicit = data(await client.callTool({
        name: "select_variant",
        arguments: { family: "combobox", variant: "multi-select" },
      }));
      assert.equal(explicit.selection, "multi-select");
      assert.equal(explicit.candidates.length, 1);
      assert.equal(explicit.candidates[0].props.multiple, true);
      assert.equal(explicit.candidates[0].import, "import { Combobox } from '@highway/react';");
      assert.deepEqual(explicit.candidates[0].compatibility, ["MultiSelect"]);
      assert.ok(explicit.preserve.length > 0);

      const ambiguous = data(await client.callTool({
        name: "select_variant",
        arguments: { family: "layout", intent: "horizontal" },
      }));
      assert.equal(ambiguous.selection, null);
      assert.equal(ambiguous.candidates[0].id, "inv-row", "Keyword matches may order candidates without claiming a selection");
      assert.equal(ambiguous.candidates[0].props.align, "center", "The horizontal compatibility mode keeps Row's centered default");
      assert.match(ambiguous.next, /exact exports/i);
      assert.ok(ambiguous.preserve.length > 0);

      const onlyVariant = data(await client.callTool({
        name: "select_variant",
        arguments: { family: "spinner" },
      }));
      assert.equal(onlyVariant.candidates.length, 1);
      assert.equal(onlyVariant.candidates[0].id, "inv-spinner");
      assert.equal(onlyVariant.selection, onlyVariant.candidates[0].id);
    });

    await t.test("resolves exact exports and stable IDs with package declarations", async () => {
      const byName = data(await client.callTool({ name: "get_component", arguments: { name: "GlassCard" } }));
      const byId = data(await client.callTool({ name: "get_component", arguments: { name: "highway.glass-card" } }));
      assert.equal(byName.packageVersion, libraryManifest.version);
      assert.equal(byName.component.export, "GlassCard");
      assert.equal(byId.component.id, "highway.glass-card");
      assert.equal(byName.component.id, byId.component.id);
      assert.match(byName.import, /import\s*\{\s*GlassCard\s*\}\s*from\s*["']@highway\/react["']/);
      assert.match(byName.declaration.uri, /^highway:\/\/declarations\//);
      assert.match(byName.declaration.text, /\bCard\b/);
      assert.ok(Array.isArray(byName.supportingDeclarations));
      assert.ok(Array.isArray(byName.recipes));
      assert.ok(Array.isArray(byName.families));
      assert.ok(Array.isArray(byName.rules));
      assert.ok(byName.standards.family && byName.standards.motion && byName.standards.material);
      assert.ok(byName.examples.length > 0);
      assert.ok(byName.examples.every((example) => example.code.length > 0), "Component guidance should include compiled examples");

      const declaration = await client.readResource({ uri: byName.declaration.uri });
      assert.ok(declaration.contents.some((item) => item.text?.includes("Card")), "The alias's declaration points to its canonical Card implementation");
      for (const supporting of byName.supportingDeclarations) {
        assert.match(supporting.uri, /^highway:\/\/declarations\//);
        const resource = await client.readResource({ uri: supporting.uri });
        assert.ok(resource.contents.length > 0);
      }
    });

    await t.test("returns the requested guidance and installation modes", async () => {
      for (const topic of ["implementation", "packages", "design", "effects", "systems", "interactions"]) {
        const guidance = data(await client.callTool({ name: "get_guidance", arguments: { topic } }));
        assert.equal(guidance.topic, topic);
        assert.ok(guidance.text.length > 0);
        const resource = await client.readResource({ uri: `highway://guides/${topic}` });
        assert.ok(resource.contents.some((item) => item.text?.length > 0));
      }
      for (const mode of ["react", "styles"]) {
        const install = data(await client.callTool({ name: "get_installation", arguments: { mode } }));
        assert.equal(install.packageVersion, libraryManifest.version);
        assert.equal(install.mode, mode);
        const release = `https://github.com/eythandamico/highway/releases/download/highway-v${install.packageVersion}`;
        const packages = ["styles", ...(mode === "react" ? ["react"] : [])];
        const expectedArtifacts = packages.map((name) => `${release}/highway-${name}-${install.packageVersion}.tgz`);
        assert.equal(
          install.command,
          `npm install --ignore-scripts --save-exact ${expectedArtifacts.join(" ")}`,
          `${mode} install should use the exact version-matched public release artifacts`,
        );
        assert.equal(install.releaseUrl, `https://github.com/eythandamico/highway/releases/tag/highway-v${install.packageVersion}`);
        assert.equal(install.distribution, "public-github-release");
        assert.ok(install.prerequisites.some((item) => /no GitHub login or Highway checkout is required/i.test(item)));
        assert.doesNotMatch(`${install.command} ${install.releaseUrl} ${install.prerequisites.join(" ")}`, /registry\.npmjs\.org|file:|packages\/highway-(?:react|styles)/i);
        assert.ok(install.steps.length > 0);
      }
      const defaultInstall = data(await client.callTool({ name: "get_installation", arguments: {} }));
      assert.equal(defaultInstall.mode, "react");
      assert.equal(defaultInstall.packageVersion, libraryManifest.version);
      assert.match(defaultInstall.command, new RegExp(`highway-v${libraryManifest.version}/highway-react-${libraryManifest.version}\\.tgz`));
    });

    await t.test("rejects unknown, demo-only, malformed, and out-of-range input", async () => {
      const missing = await client.callTool({ name: "get_component", arguments: { name: "NoSuchHighwayComponent" } });
      assertToolError(missing, /unknown|not found|component/i);
      const demoOnly = await client.callTool({ name: "get_component", arguments: { name: "navigation" } });
      assertToolError(demoOnly, /demo-only|not available|not a public/i);
      const pathAttempt = await client.callTool({ name: "get_component", arguments: { name: secretPath } });
      assertToolError(pathAttempt);
      assert.doesNotMatch(contentText(pathAttempt), new RegExp(secret));
      assertToolError(await client.callTool({ name: "get_component", arguments: { name: "__proto__" } }));

      for (const args of [
        { query: "button", limit: 0 },
        { query: "button", limit: 21 },
        { query: "button", offset: 1001 },
        { query: "button", extra: "ignored values are unsafe" },
        { query: 5 },
      ]) {
        const outcome = await captureInvalidCall(client, "search_components", args);
        assert.ok(outcome, `Expected strict validation for ${JSON.stringify(args)}`);
      }
      assert.ok(await captureInvalidCall(client, "get_guidance", { topic: "secrets" }));
      assert.ok(await captureInvalidCall(client, "get_installation", { mode: "workspace" }));

      const externalPath = path.relative(packageRoot, secretPath).split(path.sep).join("/");
      const traversalUri = `highway://declarations/${encodeURIComponent(externalPath)}`;
      await assert.rejects(client.readResource({ uri: traversalUri }));
      await assert.rejects(client.readResource({ uri: "file:///etc/passwd" }));
    });
  });
  assert.deepEqual(treeSnapshot(hostRoot), hostBefore, "Tool calls must not create, edit, or delete host files");
  assert.deepEqual(treeSnapshot(packageRoot), before, "Read-only tool calls must not write into the installed host package");
});

async function captureInvalidCall(client, name, args) {
  let result;
  try {
    result = await client.callTool({ name, arguments: args });
  } catch (error) {
    assert.ok(error instanceof Error, "Invalid tool calls should fail through protocol validation");
    assert.match(error.message, /invalid|argument|parameter|schema|validation|bad request/i);
    return true;
  }
  assertToolError(result, /invalid|argument|limit|offset|topic|mode|schema|validation/i);
  return true;
}

test("published Highway MCP tarball runs from an isolated npm consumer", { timeout: 240_000 }, async (t) => {
  const initialTree = treeSnapshot(packageRoot);
  const temp = mkdtempSync(path.join(os.tmpdir(), "highway-mcp-consumer-"));
  t.after(() => rmSync(temp, { recursive: true, force: true }));
  const packDir = path.join(temp, "packed");
  const consumer = path.join(temp, "consumer");
  await import("node:fs/promises").then(({ mkdir }) => Promise.all([
    mkdir(packDir, { recursive: true }),
    mkdir(consumer, { recursive: true }),
  ]));

  const pack = run("npm", ["pack", "--pack-destination", packDir, "--json", "--silent"], packageRoot);
  assert.ifError(pack.error);
  assert.equal(pack.status, 0, `${pack.stdout}\n${pack.stderr}`);
  const packed = JSON.parse(pack.stdout)[0];
  const archive = path.join(packDir, packed.filename);
  assert.ok(packed.files.some((file) => file.path === "src/server.mjs"));
  assert.ok(packed.files.some((file) => file.path === "data/snapshot.json"));
  assert.ok(packed.files.some((file) => file.path === "src/create-server.mjs"));

  const manifest = {
    name: "highway-mcp-standalone-consumer",
    private: true,
    type: "module",
    dependencies: {
      "@highway/mcp": `file:${archive}`,
      "@modelcontextprotocol/client": "2.4.0",
    },
  };
  writeFileSync(path.join(consumer, "package.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  runOk("npm", ["install", "--ignore-scripts", "--no-audit", "--no-fund", "--silent"], consumer);
  const smoke = `import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";
const transport = new StdioClientTransport({ command: "node_modules/.bin/highway-mcp", cwd: process.cwd(), stderr: "pipe" });
const client = new Client({ name: "packed-consumer-smoke", version: "1.0.0" });
await client.connect(transport);
try {
  const { tools } = await client.listTools();
  assert.ok(tools.some((tool) => tool.name === "search_components"));
  const result = await client.callTool({ name: "search_components", arguments: { query: "GlassCard", limit: 2 } });
  assert.notEqual(result.isError, true);
  assert.equal(result.structuredContent.items[0].export, "GlassCard");
  const catalog = await client.readResource({ uri: "highway://catalog" });
  assert.ok(catalog.contents[0].text.includes("GlassCard"));
} finally {
  await client.close();
  await transport.close().catch(() => {});
}
console.log("Packed standalone stdio client passed");
`;
  writeFileSync(path.join(consumer, "smoke.mjs"), smoke);
  runOk(process.execPath, ["smoke.mjs"], consumer);
  assert.deepEqual(treeSnapshot(packageRoot), initialTree, "Packing and using the MCP must not write to the source host project");
});

test("MCP package and generated snapshot align with the Highway component manifest", () => {
  assert.equal(packageManifest.dependencies["@modelcontextprotocol/server"], "2.4.0");
  assert.equal(packageManifest.devDependencies["@modelcontextprotocol/client"], "2.4.0");
  assert.equal(packageManifest.dependencies.zod, "4.6.7");
  assert.equal(packageManifest.bin["highway-mcp"], "src/server.mjs");
  const snapshot = JSON.parse(readFileSync(path.join(packageRoot, "data/snapshot.json"), "utf8"));
  assert.equal(snapshot.packageVersion, libraryManifest.version);
  assert.deepEqual(snapshot.catalog, sourceCatalog);
  assert.deepEqual(snapshot.peerDependencies, libraryManifest.peerDependencies);
  assert.equal(snapshot.components.length, sourceCatalog.components.length);
  const guideSources = {
    implementation: "docs/IMPLEMENTATION.md",
    packages: "docs/PACKAGES.md",
    design: "docs/DESIGN-SYSTEM.md",
    effects: "docs/VISUAL-EFFECTS.md",
    systems: "docs/SYSTEMS.md",
    interactions: "docs/INTERACTIONS.md",
  };
  for (const [topic, source] of Object.entries(guideSources)) {
    assert.equal(snapshot.guides[topic].source, source);
    assert.equal(snapshot.guides[topic].text, readFileSync(path.join(repositoryRoot, source), "utf8"));
  }
  for (const [relative, declaration] of Object.entries(snapshot.declarations)) {
    assert.ok(relative.startsWith("packages/highway-react/src/") && !relative.includes(".."));
    assert.equal(declaration.uri, `highway://declarations/${encodeURIComponent(relative)}`);
    assert.equal(declaration.text, readFileSync(path.join(repositoryRoot, "packages/highway-react/dist/types", relative), "utf8"));
  }
});
