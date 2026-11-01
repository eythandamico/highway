import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const artifacts = join(root, "artifacts");
const packages = [
  { manifestPath: "packages/highway-styles/package.json", name: "@highway/styles", requires: ["package/dist/styles.css"] },
  { manifestPath: "packages/highway-react/package.json", name: "@highway/react", requires: ["package/dist/build-manifest.json"] },
].map((expected) => {
  const sourceManifest = JSON.parse(readFileSync(resolve(root, expected.manifestPath), "utf8"));
  assert.equal(sourceManifest.name, expected.name, `${expected.manifestPath} has the wrong package name`);
  return { ...expected, version: sourceManifest.version, file: `highway-${expected.name.split("/")[1]}-${sourceManifest.version}.tgz` };
});
const forbiddenDependency = /^(?:next|vinext|wrangler|cloudflare|@cloudflare\/|@opennextjs\/|react-server-dom)/i;
const forbiddenImport = /(?:from\s*["'](?:next\/|vinext(?:\/|["'])|wrangler(?:\/|["'])|@cloudflare\/|cloudflare:)|import\s*["'](?:next\/|vinext(?:\/|["'])|wrangler(?:\/|["'])|@cloudflare\/|cloudflare:))/;
const temp = mkdtempSync(join(tmpdir(), "highway-package-validation-"));

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: "utf8", ...options });
  assert.equal(result.status, 0, `${command} ${args.join(" ")} failed:\n${result.stderr || result.stdout}`);
  return result.stdout;
}

function safeTarEntries(tarball) {
  const entries = run("tar", ["-tzf", tarball]).trim().split("\n").filter(Boolean);
  assert.ok(entries.length, `${tarball} is empty`);
  for (const entry of entries) {
    assert.ok(!entry.startsWith("/") && !entry.split("/").includes(".."), `Unsafe archive path: ${entry}`);
    assert.ok(entry.startsWith("package/"), `Unexpected archive root: ${entry}`);
    assert.ok(!entry.split("/").includes("node_modules"), `Package bundles node_modules: ${entry}`);
  }
  return entries;
}

try {
  for (const expected of packages) {
    const tarball = resolve(artifacts, expected.file);
    assert.ok(statSync(tarball, { throwIfNoEntry: false })?.isFile(), `Missing ${expected.file}; build the packages first`);
    const entries = safeTarEntries(tarball);
    for (const required of expected.requires) assert.ok(entries.includes(required), `${expected.file} is missing ${required}`);

    run("tar", ["-xzf", tarball, "-C", temp]);
    const manifest = JSON.parse(readFileSync(join(temp, "package", "package.json"), "utf8"));
    assert.equal(manifest.name, expected.name, `${expected.file} has the wrong package name`);
    assert.equal(manifest.version, expected.version, `${expected.file} differs from its source manifest version`);
    for (const section of ["dependencies", "optionalDependencies", "peerDependencies"]) {
      for (const dependency of Object.keys(manifest[section] ?? {})) {
        assert.ok(!forbiddenDependency.test(dependency), `${expected.name} declares server/runtime dependency ${dependency}`);
      }
    }

    if (expected.name === "@highway/styles") {
      const stylesheet = readFileSync(join(temp, "package", "dist", "styles.css"), "utf8");
      assert.ok(stylesheet.length > 1_000, "Compiled package stylesheet is unexpectedly small");
      assert.doesNotMatch(stylesheet, /@(?:tailwind|apply|source)\b/, "Stylesheet contains uncompiled Tailwind directives");
      assert.ok(manifest.exports && Object.keys(manifest.exports).some((key) => key.includes("styles.css")), "Stylesheet is not exposed through package exports");
    }

    if (expected.name === "@highway/react") {
      const buildManifest = JSON.parse(readFileSync(join(temp, "package", "dist", "build-manifest.json"), "utf8"));
      assert.ok(Array.isArray(buildManifest.sourceFiles) && buildManifest.sourceFiles.length > 0, "React build manifest must list packaged source inputs");
      assert.equal(new Set(buildManifest.sourceFiles).size, buildManifest.sourceFiles.length, "React build manifest must not duplicate source inputs");
      for (const source of buildManifest.sourceFiles) {
        assert.ok(source.startsWith("packages/highway-react/src/"), `Canonical package graph imported non-package source ${source}`);
      }
      assert.ok(buildManifest.sourceFiles.includes("packages/highway-react/src/index.ts"), "Package graph must start at its own entrypoint");

      const reactPeer = manifest.peerDependencies?.react;
      assert.ok(reactPeer && /(?:\^|>=?)?19(?:\.|$)/.test(reactPeer), `Expected a React 19 peer dependency, got ${reactPeer ?? "none"}`);
      const jsAndTypes = entries.filter((entry) => /\.(?:[cm]?js|d\.ts|tsx?)$/.test(entry));
      assert.ok(jsAndTypes.some((entry) => entry.endsWith(".d.ts")), "React package has no declaration files");
      assert.ok(jsAndTypes.some((entry) => /\.m?js$/.test(entry)), "React package has no JavaScript entrypoint");
      for (const entry of jsAndTypes) {
        const content = readFileSync(join(temp, entry), "utf8");
        assert.doesNotMatch(content, forbiddenImport, `${entry} imports a server-only or framework runtime`);
      }
      assert.ok(Object.keys(manifest.exports ?? {}).length, "React package must declare package exports");
    }

    rmSync(join(temp, "package"), { recursive: true, force: true });
    console.log(`validated ${expected.name} ${manifest.version} (${entries.length} archive entries)`);
  }
  console.log("Highway package archive validation passed.");
} finally {
  rmSync(temp, { recursive: true, force: true });
}
