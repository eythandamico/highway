import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  readlinkSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const installer = path.join(root, "scripts/highway/adopt.mjs");
const packageVersion = JSON.parse(readFileSync(path.join(root, "packages/highway-react/package.json"), "utf8")).version;
const tempRoot = mkdtempSync(path.join(os.tmpdir(), "highway-adoption-tests-"));
let passed = 0;

function run(command, args, cwd, env = {}) {
  const result = spawnSync(command, args, {
    cwd,
    env: { ...process.env, ...env },
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
  });
  if (result.error) throw result.error;
  return { ...result, output: `${result.stdout ?? ""}${result.stderr ?? ""}` };
}

function command(commandName, args, cwd, env = {}) {
  const result = run(commandName, args, cwd, env);
  assert.equal(result.status, 0, `${commandName} ${args.join(" ")} failed:\n${result.output}`);
  return result.output;
}

function adopt(target, args = [], env = {}) {
  return run(process.execPath, [installer, "--target", target, ...args], root, env);
}

function writeJson(file, value) {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function fakeReactPair(target, react = "19.2.0", reactDom = react) {
  writeJson(path.join(target, "package.json"), {
    name: "host-fixture",
    private: true,
    type: "module",
    dependencies: { react, "react-dom": reactDom },
  });
  writeJson(path.join(target, "node_modules/react/package.json"), { name: "react", version: react });
  writeJson(path.join(target, "node_modules/react-dom/package.json"), { name: "react-dom", version: reactDom });
}

function snapshotTree(directory) {
  const snapshot = [];
  const visit = (current, prefix = "") => {
    for (const entry of readdirSync(current, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const relative = path.join(prefix, entry.name).split(path.sep).join("/");
      const absolute = path.join(current, entry.name);
      if (entry.isSymbolicLink()) {
        snapshot.push([relative, "symlink", readlinkSync(absolute)]);
      } else if (entry.isDirectory()) {
        snapshot.push([relative, "directory"]);
        visit(absolute, relative);
      } else {
        snapshot.push([relative, "file", readFileSync(absolute).toString("base64")]);
      }
    }
  };
  visit(directory);
  return snapshot;
}

function freshHost(name) {
  const target = path.join(tempRoot, name);
  mkdirSync(target, { recursive: true });
  return target;
}

async function test(name, body) {
  await body();
  passed += 1;
  console.log(`PASS ${name}`);
}

async function installHost(target, { reactVersion, typescript }) {
  mkdirSync(path.join(target, "src"), { recursive: true });
  const dependencies = { react: reactVersion, "react-dom": reactVersion };
  const devDependencies = { vite: "8.0.16" };
  if (typescript) {
    Object.assign(devDependencies, {
      "@types/react": "19.2.14",
      "@types/react-dom": "19.2.3",
      typescript: "5.9.3",
    });
  }
  writeJson(path.join(target, "package.json"), {
    name: `highway-adoption-${path.basename(target)}`,
    private: true,
    type: "module",
    scripts: {
      build: "vite build",
      ...(typescript ? { typecheck: "tsc --noEmit" } : {}),
      postinstall: "node postinstall.mjs",
    },
    dependencies,
    devDependencies,
  });
  writeFileSync(path.join(target, "postinstall.mjs"), `import { writeFileSync } from "node:fs";\nwriteFileSync("POSTINSTALL_RAN", "yes");\n`);
  writeFileSync(path.join(target, "index.html"), `<!doctype html><html><body><div id="root"></div><script type="module" src="/src/main.${typescript ? "tsx" : "jsx"}"></script></body></html>\n`);
  writeFileSync(path.join(target, "README.md"), "Host README that must remain unchanged.\n");
  writeFileSync(path.join(target, "vite.config.mjs"), `import { defineConfig } from "vite";\nexport default defineConfig({ build: { outDir: "dist", emptyOutDir: true } });\n`);
  writeFileSync(path.join(target, "wrangler.jsonc"), `{"name":"host-worker","main":"src/worker.ts"}\n`);
  writeFileSync(path.join(target, "src/host-marker.txt"), "Preserve this host-owned file.\n");
  writeFileSync(path.join(target, "src/routes.ts"), "export const hostRoute = '/existing-route';\n");
  writeFileSync(path.join(target, "src/main." + (typescript ? "tsx" : "jsx")), typescript
    ? `import { createRoot } from "react-dom/client";\nimport { HighwayProvider } from "./highway/Provider";\nimport { Button } from "@highway/react";\nimport "./highway/theme.css";\nfunction App() { return <HighwayProvider><Button onClick={() => {}}>Existing save action</Button></HighwayProvider>; }\ncreateRoot(document.getElementById("root")!).render(<App />);\n`
    : `import { createRoot } from "react-dom/client";\nimport { HighwayProvider } from "./highway/Provider";\nimport { Button } from "@highway/react";\nimport "./highway/theme.css";\nfunction App() { return <HighwayProvider><Button onClick={() => {}}>Existing save action</Button></HighwayProvider>; }\ncreateRoot(document.getElementById("root")).render(<App />);\n`);
  if (typescript) {
    writeJson(path.join(target, "tsconfig.json"), {
      compilerOptions: {
        target: "ES2020",
        lib: ["ES2020", "DOM", "DOM.Iterable"],
        jsx: "react-jsx",
        module: "ESNext",
        moduleResolution: "Bundler",
        strict: true,
        skipLibCheck: false,
        noEmit: true,
        esModuleInterop: true,
        types: ["vite/client"],
      },
      include: ["src"],
    });
  }
  command("npm", ["install", "--ignore-scripts", "--no-audit", "--no-fund", "--silent"], target);
}

async function ssrSmoke(target, text) {
  const smoke = path.join(target, "verify-ssr.mjs");
  writeFileSync(smoke, `import assert from "node:assert/strict";\nimport React from "react";\nimport { renderToString } from "react-dom/server";\nimport { Button, HighwayTheme } from "@highway/react";\nconst html = renderToString(React.createElement(HighwayTheme, null, React.createElement(Button, null, ${JSON.stringify(text)})));\nassert.match(html, new RegExp(${JSON.stringify(text)}));\nconsole.log("SSR rendered installed Highway component");\n`);
  command(process.execPath, [smoke], target);
}

try {
  await test("default dry-run previews an additive plan without changing the host", () => {
    const target = freshHost("dry-run");
    fakeReactPair(target);
    mkdirSync(path.join(target, "src"), { recursive: true });
    writeFileSync(path.join(target, "src/main.tsx"), "Host entry.\n");
    writeFileSync(path.join(target, "vite.config.mjs"), "Host build config.\n");
    const before = snapshotTree(target);
    const result = adopt(target);
    assert.equal(result.status, 0, result.output);
    const plan = JSON.parse(result.stdout);
    assert.equal(plan.mode, "preview");
    assert.equal(plan.version, packageVersion);
    assert.ok(plan.create.includes("src/highway/Provider.jsx"));
    assert.ok(plan.create.includes("src/highway/CHANGELOG.md"));
    assert.deepEqual(snapshotTree(target), before, "A preview must not mutate any host file or dependency");
  });

  await test("isolated React 19.2.0 TS host applies, typechecks, builds, SSR-renders, and preserves host infrastructure", async () => {
    const target = freshHost("react-19.2.0-typescript");
    await installHost(target, { reactVersion: "19.2.0", typescript: true });
    assert.equal(existsSync(path.join(target, "POSTINSTALL_RAN")), false);
    const originals = new Map(["src/main.tsx", "src/routes.ts", "vite.config.mjs", "wrangler.jsonc", "index.html", "README.md", "src/host-marker.txt", "tsconfig.json"].map((file) => [file, readFileSync(path.join(target, file), "utf8")]));
    const result = adopt(target, ["--apply"]);
    assert.equal(result.status, 0, result.output);
    assert.ok(existsSync(path.join(target, "src/highway/Provider.tsx")));
    assert.equal(existsSync(path.join(target, "src/highway/Provider.jsx")), false);
    assert.equal(existsSync(path.join(target, "POSTINSTALL_RAN")), false, "npm lifecycle scripts must stay disabled");
    for (const [file, content] of originals) assert.equal(readFileSync(path.join(target, file), "utf8"), content, `${file} is host-owned and must not be replaced`);
    const manifest = JSON.parse(readFileSync(path.join(target, "package.json"), "utf8"));
    assert.equal(manifest.dependencies["@highway/react"], `file:vendor/highway/highway-react-${packageVersion}.tgz`);
    assert.equal(manifest.dependencies["@highway/styles"], `file:vendor/highway/highway-styles-${packageVersion}.tgz`);
    const provider = readFileSync(path.join(target, "src/highway/Provider.tsx"), "utf8");
    assert.match(provider, /HighwayThemeProps/);
    command("npm", ["run", "typecheck", "--silent"], target);
    command("npm", ["run", "build", "--silent"], target);
    await ssrSmoke(target, "Minimum React host");
    const secondApply = adopt(target, ["--apply"]);
    assert.notEqual(secondApply.status, 0, "Repeated apply must refuse to replace an existing Highway installation");
    assert.match(secondApply.output, /already exists/);
  });

  await test("React 19.2.8 JavaScript host receives JSX provider and builds without rewriting its entry", async () => {
    const target = freshHost("react-19.2.8-javascript");
    await installHost(target, { reactVersion: "19.2.8", typescript: false });
    const originalEntry = readFileSync(path.join(target, "src/main.jsx"), "utf8");
    const result = adopt(target, ["--apply"]);
    assert.equal(result.status, 0, result.output);
    const provider = readFileSync(path.join(target, "src/highway/Provider.jsx"), "utf8");
    assert.match(provider, /export function HighwayProvider/);
    assert.doesNotMatch(provider, /HighwayThemeProps/);
    assert.equal(existsSync(path.join(target, "src/highway/Provider.tsx")), false);
    assert.equal(readFileSync(path.join(target, "src/main.jsx"), "utf8"), originalEntry);
    command("npm", ["run", "build", "--silent"], target);
    await ssrSmoke(target, "JavaScript host");
  });

  await test("styles-only mode installs CSS without requiring or adding React", async () => {
    const target = freshHost("styles-only");
    writeJson(path.join(target, "package.json"), {
      name: "highway-styles-host",
      private: true,
      type: "module",
      scripts: { build: "vite build" },
      devDependencies: { vite: "8.0.16" },
    });
    mkdirSync(path.join(target, "src"), { recursive: true });
    writeFileSync(path.join(target, "index.html"), `<!doctype html><html><head><link rel="stylesheet" href="/src/main.css"></head><body><main class="highway">Scoped styles host</main></body></html>\n`);
    writeFileSync(path.join(target, "src/main.css"), "@import './highway/theme.css';\n");
    writeFileSync(path.join(target, "src/host-marker.txt"), "Keep me.\n");
    command("npm", ["install", "--ignore-scripts", "--no-audit", "--no-fund", "--silent"], target);
    const originalCss = readFileSync(path.join(target, "src/main.css"), "utf8");
    const result = adopt(target, ["--mode", "styles", "--apply"]);
    assert.equal(result.status, 0, result.output);
    assert.equal(existsSync(path.join(target, "src/highway/Provider.tsx")), false);
    assert.equal(existsSync(path.join(target, "src/highway/Provider.jsx")), false);
    assert.match(readFileSync(path.join(target, "src/highway/theme.css"), "utf8"), /@highway\/styles\/styles\.css/);
    assert.equal(readFileSync(path.join(target, "src/main.css"), "utf8"), originalCss);
    const manifest = JSON.parse(readFileSync(path.join(target, "package.json"), "utf8"));
    assert.ok(manifest.devDependencies["@highway/styles"] || manifest.dependencies["@highway/styles"]);
    assert.equal(manifest.dependencies?.react, undefined);
    assert.equal(manifest.devDependencies?.react, undefined);
    command("npm", ["run", "build", "--silent"], target);
  });

  await test("unsupported, mismatched, and prerelease React pairs are rejected before mutation", () => {
    for (const [name, react, reactDom] of [
      ["react-18", "18.3.1", "18.3.1"],
      ["react-mismatch", "19.2.8", "19.2.7"],
      ["react-prerelease", "19.2.0-rc.0", "19.2.0-rc.0"],
    ]) {
      const target = freshHost(name);
      fakeReactPair(target, react, reactDom);
      writeFileSync(path.join(target, "src-marker.txt"), "Host is unchanged.\n");
      const before = snapshotTree(target);
      const result = adopt(target);
      assert.notEqual(result.status, 0, `${name} should not be accepted`);
      assert.match(result.output, /Unsupported React pair/);
      assert.deepEqual(snapshotTree(target), before, `${name} failure must not mutate the host`);
    }
  });

  await test("existing Highway dependencies and generated files are rejected without overwrites", () => {
    const dependencyTarget = freshHost("existing-highway-dependency");
    fakeReactPair(dependencyTarget);
    const manifest = JSON.parse(readFileSync(path.join(dependencyTarget, "package.json"), "utf8"));
    manifest.dependencies["@highway/react"] = "0.1.0";
    writeJson(path.join(dependencyTarget, "package.json"), manifest);
    const beforeDependency = snapshotTree(dependencyTarget);
    const dependencyResult = adopt(dependencyTarget, ["--apply"]);
    assert.notEqual(dependencyResult.status, 0);
    assert.match(dependencyResult.output, /already exists/);
    assert.deepEqual(snapshotTree(dependencyTarget), beforeDependency);

    const generatedTarget = freshHost("existing-generated-file");
    fakeReactPair(generatedTarget);
    mkdirSync(path.join(generatedTarget, "src/highway"), { recursive: true });
    writeFileSync(path.join(generatedTarget, "src/highway/theme.css"), "host-owned theme file\n");
    const beforeGenerated = snapshotTree(generatedTarget);
    const generatedResult = adopt(generatedTarget, ["--apply"]);
    assert.notEqual(generatedResult.status, 0);
    assert.match(generatedResult.output, /Existing file would be replaced/);
    assert.deepEqual(snapshotTree(generatedTarget), beforeGenerated);
  });

  await test("symlinked and dangling generated paths are refused", () => {
    for (const name of ["symlinked-src", "dangling-vendor"]) {
      const target = freshHost(name);
      fakeReactPair(target);
      if (name === "symlinked-src") {
        const outside = freshHost("external-src");
        symlinkSync(outside, path.join(target, "src"), "dir");
      } else {
        symlinkSync(path.join(target, "missing-vendor-target"), path.join(target, "vendor"), "dir");
      }
      const before = snapshotTree(target);
      const result = adopt(target);
      assert.notEqual(result.status, 0);
      assert.match(result.output, /Refusing symlink/);
      assert.deepEqual(snapshotTree(target), before);
    }
  });

  await test("failed npm installation restores manifest, lock, and generated files", () => {
    const target = freshHost("npm-rollback");
    fakeReactPair(target);
    writeFileSync(path.join(target, "package-lock.json"), "{\"name\":\"unchanged-lock\",\"lockfileVersion\":3}\n");
    const packageBefore = readFileSync(path.join(target, "package.json"));
    const lockBefore = readFileSync(path.join(target, "package-lock.json"));
    const fakeBin = path.join(target, "fake-bin");
    mkdirSync(fakeBin);
    const fakeNpm = path.join(fakeBin, "npm");
    writeFileSync(fakeNpm, "#!/bin/sh\nexit 42\n");
    chmodSync(fakeNpm, 0o755);
    const result = adopt(target, ["--apply"], { PATH: `${fakeBin}${path.delimiter}${process.env.PATH}` });
    assert.notEqual(result.status, 0);
    assert.match(result.output, /npm install failed|restored/);
    assert.deepEqual(readFileSync(path.join(target, "package.json")), packageBefore);
    assert.deepEqual(readFileSync(path.join(target, "package-lock.json")), lockBefore);
    for (const relative of [`vendor/highway/highway-react-${packageVersion}.tgz`, `vendor/highway/highway-styles-${packageVersion}.tgz`, "src/highway/Provider.tsx", "src/highway/theme.css", "src/highway/adoption.json"]) {
      assert.equal(existsSync(path.join(target, relative)), false, `${relative} must be rolled back`);
    }
    assert.equal(readdirSync(path.join(target, "vendor/highway")).length, 0, "Rollback may retain created empty directories but no generated package files");
  });

  console.log(`Highway adoption checks passed (${passed} scenarios; package version ${packageVersion}).`);
} finally {
  rmSync(tempRoot, { recursive: true, force: true });
}
