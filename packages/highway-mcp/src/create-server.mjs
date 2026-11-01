import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { McpServer } from '@modelcontextprotocol/server';
import { z } from 'zod/v4';

// Read only package-owned files. Tool arguments never become filesystem paths.
const snapshot = JSON.parse(readFileSync(new URL('../data/snapshot.json', import.meta.url), 'utf8'));
const { contentHash, ...payload } = snapshot;
if (createHash('sha256').update(JSON.stringify(payload)).digest('hex') !== contentHash) throw new Error('Highway MCP snapshot integrity check failed; rebuild the package');
const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const { packageVersion, catalog, components, declarations, guides } = snapshot;
const annotations = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };
const result = (value) => ({ content: [{ type: 'text', text: JSON.stringify(value) }], structuredContent: value });
const failure = (message) => ({ isError: true, content: [{ type: 'text', text: message }] });

export function createServer() {
  const server = new McpServer({ name: 'highway', version: manifest.version }, {
    instructions: `Use Highway ${packageVersion} exact exports. Choose a family with list_families and get_family, use select_variant to choose a component or behavior mode within that family, then distinguish its appearance props from interaction states, then inspect get_component declarations, then read implementation and package guidance before editing a host. Preserve business handlers and infrastructure. This server is read-only and does not install packages. Declaration module export names may differ from public aliases; always use the returned public import. Follow supporting declaration resources for referenced props.`,
  });
  const resource = (name, uri, text, mimeType = 'text/plain') => server.registerResource(name, uri, { mimeType }, async () => ({ contents: [{ uri, mimeType, text }] }));
  resource('catalog', 'highway://catalog', JSON.stringify(catalog), 'application/json');
  for (const [topic, guide] of Object.entries(guides)) resource(`guide-${topic}`, `highway://guides/${topic}`, guide.text, 'text/markdown');
  for (const [name, declaration] of Object.entries(declarations)) resource(name, declaration.uri, declaration.text);

  resource('families', 'highway://families', JSON.stringify(catalog.families), 'application/json');
  server.registerTool('list_families', {
    description: 'Browse Highway component families by intent. Families group implemented modes, recipes and compatibility adapters; they do not imply interchangeable APIs.',
    inputSchema: z.object({ query: z.string().max(200).default('') }).strict(), annotations,
  }, async ({ query }) => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    const items = catalog.families.filter(family => words.every(word => `${family.id} ${family.name} ${family.variants.map(v => `${v.label} ${v.when}`).join(' ')}`.toLowerCase().includes(word)));
    return result({ packageVersion, items: items.map(({ id, name, variants }) => ({ id, name, variants: variants.map(({ id, label, when, exports }) => ({ id, label, when, exports })) })) });
  });
  server.registerTool('get_family', {
    description: 'Read every component and behavior mode in a family, when to use each, exact props/examples where supplied, compatibility names and preservation rules. Read get_component for full types before use.',
    inputSchema: z.object({ family: z.string().min(1).max(160) }).strict(), annotations,
  }, async ({ family }) => {
    const found = catalog.families.find(item => item.id === family);
    return found ? result({ packageVersion, family: found, pages: catalog.pages.filter(page => page.family === family), terminology: catalog.terminology, rules: catalog.rules }) : failure(`Unknown family: ${family}. Use list_families; do not invent a family or mode.`);
  });
  server.registerTool('select_variant', {
    description: 'Choose a component or behavior mode within a family, or search its use cases. The legacy name select_variant does not mean visual appearance; appearance props and disabled/loading/error states are separate. Returns candidates with exact imports and props; ambiguity requires inspecting candidates or clarifying host needs, not inventing a mode. Compatibility names are not preferred new APIs.',
    inputSchema: z.object({ family: z.string().min(1).max(160), variant: z.string().min(1).max(160).optional(), intent: z.string().max(500).default('') }).strict(), annotations,
  }, async ({ family, variant, intent }) => {
    const found = catalog.families.find(item => item.id === family);
    if (!found) return failure(`Unknown family: ${family}. Use list_families.`);
    if (variant && !found.variants.some(item => item.id === variant)) return failure(`Unknown variant ${variant} in ${family}. Read get_family; do not invent props.`);
    const words = intent.toLowerCase().split(/\s+/).filter(Boolean);
    const ranked = found.variants.filter(item => !variant || item.id === variant).map(item => ({ ...item, score: words.reduce((sum, word) => sum + (`${item.label} ${item.when}`.toLowerCase().includes(word) ? 1 : 0), 0) })).sort((a,b) => b.score-a.score);
    const candidates = ranked.map(({ score, ...item }) => ({ ...item, relevance: score, import: `import { ${item.exports.join(', ')} } from '@highway/react';` }));
    return result({ packageVersion, family, terminology: catalog.terminology, candidates, selection: variant ?? (candidates.length === 1 ? candidates[0].id : null), next: 'Read the exact exports with get_component. Choose by host behavior and value shape, not appearance alone. Relevance is keyword matching, not a verified recommendation.', preserve: found.preserve });
  });
  server.registerTool('search_components', {
    description: 'Search supported Highway public exports by name or intent. Returns bounded, paginated results. Empty query browses the catalog. Inspect get_component before use; showcase demos are not package APIs.',
    inputSchema: z.object({ query: z.string().max(200).default(''), limit: z.number().int().min(1).max(20).default(8), offset: z.number().int().min(0).max(1000).default(0) }).strict(), annotations,
  }, async ({ query, limit, offset }) => {
    const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    const ranked = components.map((component) => {
      const recipes = catalog.recipes.filter((recipe) => recipe.exports.includes(component.export));
      const haystack = [component.id, component.export, component.useWhen, ...(component.families ?? []), ...catalog.families.filter(f => component.families?.includes(f.id)).flatMap(f => f.variants.map(v => v.when)), ...component.constraints, ...recipes.map((r) => r.purpose)].join(' ').toLowerCase();
      const score = words.length ? words.reduce((sum, word) => sum + (haystack.includes(word) ? 1 : 0), 0) + (component.export.toLowerCase() === query.toLowerCase().trim() || component.id === query.toLowerCase().trim() ? 100 : 0) : 1;
      return { component, score };
    }).filter(({ score }) => score > 0).sort((a, b) => b.score - a.score || a.component.export.localeCompare(b.component.export));
    return result({ packageVersion, total: ranked.length, offset, items: ranked.slice(offset, offset + limit).map(({ component }) => { const item = { ...component }; delete item.declaration; return item; }) });
  });
  server.registerTool('get_component', {
    description: 'Get an exact public export or highway.id, its canonical TypeScript declaration, supporting prop resources, recipes and selection constraints. Aliases such as GlassCard remain public aliases. Unknown and demo-only names are rejected.',
    inputSchema: z.object({ name: z.string().min(1).max(160) }).strict(), annotations,
  }, async ({ name }) => {
    const component = components.find((item) => item.export === name || item.id === name);
    if (!component) {
      const showcase = Object.hasOwn(catalog.showcase, name) ? catalog.showcase[name] : undefined;
      return failure(showcase ? `Showcase entry ${name} is ${showcase.availability}. ${showcase.note} Public exports: ${showcase.exports.join(', ') || 'none'}. Use an exact export name.` : `Unknown Highway export: ${name}. Search the catalog; do not invent or recreate a component.`);
    }
    const declaration = declarations[component.declaration];
    const dependencies = new Set();
    function visit(item) { for (const uri of item.dependencies) { if (dependencies.has(uri)) continue; dependencies.add(uri); visit(Object.values(declarations).find((d) => d.uri === uri)); } }
    visit(declaration);
    return result({ packageVersion, families: catalog.families.filter(family => component.families?.includes(family.id)), component, import: `import { ${component.export} } from '@highway/react';`, declaration: { uri: declaration.uri, text: declaration.text }, supportingDeclarations: [...dependencies].map((uri) => ({ uri })), recipes: catalog.recipes.filter((recipe) => recipe.exports.includes(component.export)), rules: catalog.rules, standards: { family: snapshot.standards.families[component.contract.family], motion: snapshot.standards.motion[component.contract.motion], material: snapshot.standards.materials[component.contract.material] }, examples: (component.examples ?? []).map(name => ({ name, code: snapshot.examples[name] })) });
  });
  server.registerTool('get_guidance', {
    description: 'Read canonical implementation, package/theming/typography, design, visual-effects, engineering systems or interaction guidance. Internal source references in design/effects docs are authoring references, not consumer imports; the public catalog and declarations determine availability.',
    inputSchema: z.object({ topic: z.enum(['implementation', 'packages', 'design', 'effects', 'systems', 'interactions']) }).strict(), annotations,
  }, async ({ topic }) => result({ topic, text: guides[topic].text }));
  server.registerTool('get_installation', {
    description: 'Return version-matched public GitHub Release package installation instructions for React or CSS-only adoption. Does not run commands or modify the host. Read implementation guidance before changing UI.',
    inputSchema: z.object({ mode: z.enum(['react', 'styles']).default('react') }).strict(), annotations,
  }, async ({ mode }) => result({
    packageVersion, mode,
    command: `npm install --ignore-scripts --save-exact https://github.com/eythandamico/highway/releases/download/highway-v${packageVersion}/highway-styles-${packageVersion}.tgz${mode === 'react' ? ` https://github.com/eythandamico/highway/releases/download/highway-v${packageVersion}/highway-react-${packageVersion}.tgz` : ''}`,
    releaseUrl: `https://github.com/eythandamico/highway/releases/tag/highway-v${packageVersion}`,
    distribution: 'public-github-release',
    prerequisites: [ 'Install the exact public release URLs below; no GitHub login or Highway checkout is required. These packages are not published on npm. If the release is unavailable, report the download failure rather than guessing another version.', ...(mode === 'react' ? [`Installed matching React and React DOM versions satisfying ${snapshot.peerDependencies.react}; ESM. React 18 is unsupported.`] : ['CSS-only use requires no React. It does not provide React component behavior.']), 'Record host baseline build/tests, package manager, existing brand, routes and handlers. Use the host package manager; the command below is the npm example.' ],
    steps: ['Read highway://guides/implementation and highway://guides/packages.', 'Review the exact component mapping and preserve host behavior, data, authentication and deployment.', 'Install matching artifacts; import @highway/styles/styles.css once in the host CSS entry.', mode === 'react' ? 'Wrap only the adopted region in HighwayTheme and pass existing brand tokens; inspect its declaration first.' : 'Scope adopted markup with .highway and apply documented tokens/type roles; CSS installation alone does not restyle every host element.', 'Verify host build, handlers, keyboard operation, overlays, narrow screens and unchanged surrounding styles. Commit package.json and the lockfile; npm records the release URLs and integrity hashes.'],
  }));
  return server;
}
