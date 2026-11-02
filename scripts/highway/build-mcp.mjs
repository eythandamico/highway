import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import ts from 'typescript';

const root = fileURLToPath(new URL('../../', import.meta.url));
const read = (name) => readFile(path.join(root, name), 'utf8');
const catalog = JSON.parse(await read('catalog/components.json'));
const react = JSON.parse(await read('packages/highway-react/package.json'));
const styles = JSON.parse(await read('packages/highway-styles/package.json'));
if (catalog.packageVersion !== react.version || styles.version !== react.version) throw new Error('Package/catalog version mismatch');
const typesRoot = 'packages/highway-react/dist/types/';
const entry = path.join(root, 'packages/highway-react', react.types);
const program = ts.createProgram([entry], { skipLibCheck: true, moduleResolution: ts.ModuleResolutionKind.Bundler, module: ts.ModuleKind.ESNext });
const checker = program.getTypeChecker();
const symbol = checker.getSymbolAtLocation(program.getSourceFile(entry));
if (!symbol) throw new Error('Build Highway packages before generating MCP data');
const publicExports = new Set(checker.getExportsOfModule(symbol).map((item) => item.name));
const familyIds = new Set();
for (const family of catalog.families) {
  if (familyIds.has(family.id)) throw new Error(`Duplicate family: ${family.id}`);
  familyIds.add(family.id);
  if (!family.variants.some(variant => variant.id === family.primary)) throw new Error(`Missing primary variant: ${family.id}`);
  const variantIds = new Set();
  for (const variant of family.variants) {
    if (variantIds.has(variant.id) || !variant.when || !variant.exports.length) throw new Error(`Invalid family variant: ${family.id}/${variant.id}`);
    variantIds.add(variant.id);
    for (const name of [...variant.exports, ...variant.compatibility]) if (!publicExports.has(name)) throw new Error(`Family variant references unavailable export: ${name}`);
  }
}
for (const component of catalog.components) if (!component.families?.length || component.families.some(id => !familyIds.has(id))) throw new Error(`Missing family membership: ${component.export}`);
const declarations = {};
const declarationUri = (name) => `highway://declarations/${encodeURIComponent(name)}`;
async function collect(name) {
  if (declarations[name]) return;
  if (!name.startsWith('packages/highway-react/src/') || name.includes('..')) throw new Error(`Declaration outside package: ${name}`);
  const text = await read(typesRoot + name);
  declarations[name] = { uri: declarationUri(name), text, dependencies: [] };
  const relatives = new Set([...text.matchAll(/["'](\.[^"']+)["']/g)].map((match) => match[1]));
  for (const specifier of relatives) {
    const base = path.posix.normalize(path.posix.join(path.posix.dirname(name), specifier));
    let dependency;
    const declarationFile = base.endsWith('.d.ts') ? base : base.replace(/\.(?:js|jsx|ts|tsx)$/, '') + '.d.ts';
    for (const candidate of [declarationFile, base + '/index.d.ts']) {
      try { await read(typesRoot + candidate); dependency = candidate; break; } catch (error) { if (error.code !== 'ENOENT') throw error; }
    }
    if (!dependency) throw new Error(`Unresolved declaration: ${name} -> ${specifier}`);
    await collect(dependency);
    declarations[name].dependencies.push(declarations[dependency].uri);
  }
}
const components = [];
for (const component of catalog.components) {
  if (!publicExports.has(component.export)) throw new Error(`Catalog export missing: ${component.export}`);
  const name = component.source.replace(/\.[jt]sx?$/, '') + '.d.ts';
  await collect(name);
  components.push({ ...component, declaration: name });
}
const guidePaths = { implementation: 'docs/IMPLEMENTATION.md', packages: 'docs/PACKAGES.md', design: 'docs/DESIGN-SYSTEM.md', effects: 'docs/VISUAL-EFFECTS.md', systems: 'docs/SYSTEMS.md', interactions: 'docs/INTERACTIONS.md' };
const guides = {};
for (const [topic, source] of Object.entries(guidePaths)) guides[topic] = { source, text: await read(source) };
const standards = JSON.parse(await read('catalog/standards.json'));
const examples = {};
for (const component of components) for (const example of component.examples ?? []) {
  if (!/^examples\/contracts\/[a-z][a-z0-9-]*\.tsx$/.test(example)) throw new Error('Invalid registered example path');
  examples[example] = await read(example);
}
const payload = { standards, examples, schemaVersion: 1, packageVersion: react.version, catalog, components, declarations, guides, peerDependencies: react.peerDependencies };
const contentHash = createHash('sha256').update(JSON.stringify(payload)).digest('hex');
const output = JSON.stringify({ ...payload, contentHash }, null, 2) + '\n';
const destination = path.join(root, 'packages/highway-mcp/data');
await mkdir(destination, { recursive: true });
await writeFile(path.join(destination, 'snapshot.json'), output);
console.log(`Highway MCP: ${components.length} exports, ${Object.keys(declarations).length} declarations, version ${react.version} (${contentHash.slice(0, 12)})`);
