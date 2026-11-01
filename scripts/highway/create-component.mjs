import { existsSync, lstatSync, mkdirSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../../', import.meta.url));
const args = process.argv.slice(2);
let name; let family = 'display'; let apply = false;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--name') name = args[++i];
  else if (args[i] === '--family') family = args[++i];
  else if (args[i] === '--apply') apply = true;
  else throw new Error(`Unknown argument: ${args[i]}`);
}
if (!/^[A-Z][A-Za-z0-9]{1,63}$/.test(name ?? '') || !['display', 'action', 'field'].includes(family)) throw new Error('Use --name PascalCase --family display|action|field [--apply]');
const slug = name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
const catalog = JSON.parse(readFileSync(path.join(root, 'catalog/components.json'), 'utf8'));
if (catalog.components.some(item => item.export.toLowerCase() === name.toLowerCase() || item.id === `highway.${slug}`)) throw new Error('A public component with this name already exists');
const base = family === 'action' ? 'Button' : family === 'field' ? 'Input' : 'div';
const source = `"use client";\nimport type { ComponentProps } from 'react';\n${base === 'div' ? '' : `import { ${base} } from '../ui/${base.toLowerCase()}';\n`}\nexport type ${name}Props = ComponentProps<${base === 'div' ? "'div'" : `typeof ${base}`}>;\n\n/** Draft composition: preserve inherited props and native behavior. */\nexport function ${name}(props: ${name}Props) {\n  return <${base} {...props} />;\n}\n`;
const sourcePath = `packages/highway-react/src/components/generated/${slug}.tsx`;
const example = `import { ${name} } from '../../${sourcePath.replace(/\.tsx$/, '')}';\n\n// Draft authoring example. After promotion, import from @highway/react.\nexport function ${name}Example() {\n  return <${name}${family === 'field' ? ' aria-label="Example field"' : ''}${family === 'action' ? ' type="button"' : ''}>${family === 'field' ? '' : 'Example content'}</${name}>;\n}\n`;
const contract = { id: `highway.${slug}`, export: name, source: sourcePath, status: 'draft', kind: 'component', useWhen: 'Describe the concrete task this composition improves before promotion.', constraints: ['Preserve host handlers and inherited component behavior.'], contract: { family, motion: family === 'action' ? 'press' : 'none', material: family === 'field' ? 'field' : 'inherited' }, examples: [`examples/contracts/${slug}.tsx`], promotion: ['Replace TODO tests with meaningful interaction coverage.', 'Review the actual component visually in light/dark, narrow/wide and reduced motion.', 'Add the public export and move this record into catalog/components.json without draft-only fields.', 'Run systems:update, review the API diff, then npm run verify:full.'] };
const files = {
  [sourcePath]: source,
  [`examples/contracts/${slug}.tsx`]: example,
  [`catalog/drafts/${slug}.json`]: JSON.stringify(contract, null, 2) + '\n',
  [`tests/generated/${slug}.test.mjs`]: `import { test } from 'node:test';\n\n// Draft: implement real behavior tests before promoting this component.\ntest.todo('${name}: preserves host handlers, disabled/error states and keyboard behavior');\ntest.todo('${name}: retains appearance at narrow widths, zoom and reduced motion');\n`,
};
for (const relative of Object.keys(files)) {
  const target = path.join(root, relative);
  if (existsSync(target)) throw new Error(`Refusing to overwrite ${relative}`);
  let current = target;
  while (current !== root.replace(/\/$/, '')) {
    try { if (lstatSync(current).isSymbolicLink()) throw new Error(`Refusing symlink: ${relative}`); } catch (error) { if (error.code !== 'ENOENT') throw error; }
    current = path.dirname(current);
    if (!current.startsWith(root.replace(/\/$/, ''))) throw new Error('Path escaped Highway');
  }
}
if (apply) {
  const written = [];
  try {
    for (const [relative, text] of Object.entries(files)) { const target = path.join(root, relative); mkdirSync(path.dirname(target), { recursive: true }); writeFileSync(target, text, { flag: 'wx' }); written.push(target); }
  } catch (error) { for (const file of written) unlinkSync(file); throw error; }
}
console.log(JSON.stringify({ mode: apply ? 'created-draft' : 'preview', name, files: Object.keys(files), publicExportAdded: false }, null, 2));
