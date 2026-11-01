import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import ts from "typescript";

const root = process.cwd();
const sourceExtensions = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"];
const moduleExtensions = [...sourceExtensions, ".json", ".css"];
const forbiddenPackages = /^(?:cloudflare:|@cloudflare\/|wrangler(?:\/|$)|better-auth(?:\/|$)|@better-auth\/)/;
const forbiddenLocalPaths = [
  /^app\/api(?:\/|$)/,
  /^lib\/(?:auth(?:[-./]|$)|session(?:[./]|$)|workspace(?:[./]|$)|http(?:[./]|$)|client(?:[./]|$)|db(?:[./]|$))/,
];

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if ([".next", "dist", "node_modules", "coverage"].includes(entry.name)) return [];
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(file) : entry.isFile() ? [file] : [];
  });
}

function localModule(fromFile, specifier) {
  if (specifier.startsWith("@/")) {
    return resolveCandidates(path.resolve(root, specifier.slice(2)));
  }
  if (specifier.startsWith(".")) {
    return resolveCandidates(path.resolve(path.dirname(fromFile), specifier));
  }
  return null;
}

function resolveCandidates(base) {
  const candidates = [base];
  for (const extension of moduleExtensions) candidates.push(base + extension);
  for (const extension of moduleExtensions) candidates.push(path.join(base, `index${extension}`));
  return candidates.find((candidate) => existsSync(candidate) && statSync(candidate).isFile()) ?? null;
}

function references(file) {
  const source = readFileSync(file, "utf8");
  if (file.endsWith(".css")) {
    return [...source.matchAll(/@import\s+(?:url\()?\s*["']([^"']+)["']\s*\)?/g)].map((match) => match[1]);
  }

  const kind = file.endsWith(".tsx") ? ts.ScriptKind.TSX : file.endsWith(".jsx") ? ts.ScriptKind.JSX : ts.ScriptKind.TS;
  const parsed = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, kind);
  const result = [];
  function hasRuntimeImport(clause) {
    if (!clause || clause.isTypeOnly) return false;
    if (clause.name || !clause.namedBindings || ts.isNamespaceImport(clause.namedBindings)) return true;
    return clause.namedBindings.elements.some((element) => !element.isTypeOnly);
  }
  function visit(node) {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      if (hasRuntimeImport(node.importClause)) result.push(node.moduleSpecifier.text);
    } else if (ts.isExportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      const clause = node.exportClause;
      const hasRuntimeExport = !node.isTypeOnly && (!clause || !ts.isNamedExports(clause) || clause.elements.some((element) => !element.isTypeOnly));
      if (hasRuntimeExport) result.push(node.moduleSpecifier.text);
    } else if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments.length === 1 &&
      ts.isStringLiteral(node.arguments[0])
    ) {
      result.push(node.arguments[0].text);
    } else if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === "require" &&
      node.arguments.length === 1 &&
      ts.isStringLiteral(node.arguments[0])
    ) {
      result.push(node.arguments[0].text);
    }
    ts.forEachChild(node, visit);
  }
  visit(parsed);
  return result;
}

function dependencyGraph(appDirectory) {
  const entries = walk(path.join(root, appDirectory)).filter((file) => sourceExtensions.includes(path.extname(file)));
  assert.ok(entries.length > 0, `${appDirectory} should have source entrypoints`);
  const visited = new Set();
  const edges = [];
  const problems = [];
  const pending = [...entries];

  while (pending.length) {
    const file = pending.pop();
    if (visited.has(file)) continue;
    visited.add(file);
    const relative = path.relative(root, file).split(path.sep).join("/");
    if (forbiddenLocalPaths.some((pattern) => pattern.test(relative))) {
      problems.push(`${relative} is part of the standalone app dependency graph`);
    }

    for (const specifier of references(file)) {
      if (forbiddenPackages.test(specifier)) {
        problems.push(`${relative} imports forbidden backend package ${specifier}`);
        continue;
      }
      const target = localModule(file, specifier);
      if (!target) {
        if (specifier.startsWith(".") || specifier.startsWith("@/")) {
          problems.push(`${relative} has an unresolved local import ${specifier}`);
        }
        continue;
      }
      edges.push({ from: relative, to: path.relative(root, target).split(path.sep).join("/") });
      pending.push(target);
    }
  }

  assert.deepEqual(problems, [], `${appDirectory} must remain independent of Cloudflare and auth/backend modules`);
  return { entries, visited, edges };
}

const showcase = dependencyGraph("apps/showcase/app");
const demo = dependencyGraph("examples/yardwork/app");

const allowedShowcaseDemoImports = new Set([
  "apps/showcase/previews/demo-reference.tsx -> examples/yardwork/src/components/yardwork/office-navigation.tsx",
  "apps/showcase/previews/demo-reference.tsx -> examples/yardwork/src/components/yardwork/bookings-chart.tsx",
  "apps/showcase/previews/demo-reference.tsx -> examples/yardwork/src/lib/yardwork/demo-suite.ts",
  "apps/showcase/previews/surfaces.tsx -> examples/yardwork/src/components/yardwork/account-avatar.tsx",
]);
const directDemoImports = new Set(
  showcase.edges
    .filter(({ from, to }) => from.startsWith("apps/showcase/") && to.startsWith("examples/yardwork/"))
    .map(({ from, to }) => `${from} -> ${to}`),
);
assert.deepEqual(
  [...directDemoImports].sort(),
  [...allowedShowcaseDemoImports].sort(),
  "Showcase may import only the three Yardwork illustration components and synthetic demo seed",
);
assert.ok(
  !showcase.visited.has(path.join(root, "examples/yardwork/src/components/yardwork/office.tsx")),
  "The docs/showcase app must not bundle the Yardwork demo application",
);

console.log(
  `Standalone app boundaries passed: ${showcase.visited.size} showcase modules and ${demo.visited.size} demo modules contain no Cloudflare/auth backend dependency.`,
);
