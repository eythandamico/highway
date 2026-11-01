#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync, mkdirSync, realpathSync, lstatSync, rmSync } from 'node:fs';
import { resolve, join, dirname, relative, sep } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const root = resolve(import.meta.dirname, '../..');
function entry(path) {
  try { return lstatSync(path); } catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}
const args = process.argv.slice(2);
const options = { mode: 'react', apply: false };
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--apply') options.apply = true;
  else if (arg === '--target' || arg === '--mode') {
    if (!args[i + 1] || args[i + 1].startsWith('--')) throw new Error(`Missing value for ${arg}`);
    options[arg.slice(2)] = args[++i];
  } else if (arg === '--help') {
    console.log('node scripts/highway/adopt.mjs --target /absolute/project --mode react|styles [--apply]\nDry-run by default. Requires existing npm package.json and built tarballs.');
    process.exit(0);
  } else throw new Error(`Unknown argument: ${arg}`);
}
if (!options.target || !['react', 'styles'].includes(options.mode)) throw new Error('Supply --target and --mode react|styles.');
const target = realpathSync(resolve(options.target));
if (target === root || target.startsWith(root + sep)) throw new Error('Use an independent consumer outside the Highway repository.');
const packagePath = join(target, 'package.json');
const originalPackage = readFileSync(packagePath);
const pkg = JSON.parse(originalPackage);
if ((pkg.packageManager && !pkg.packageManager.startsWith('npm@')) || ['yarn.lock', 'pnpm-lock.yaml', 'bun.lock', 'bun.lockb'].some(p => existsSync(join(target, p)))) throw new Error('This installer supports npm projects only; use the manual package guide for other package managers.');
if (pkg.workspaces) throw new Error('Run adoption in an independent npm project; workspace wiring requires the manual guide.');
const dependencies = { ...pkg.devDependencies, ...pkg.dependencies };
if (options.mode === 'react') {
  // Resolve the actual installed pair, never infer support from a broad manifest range.
  const versions = ['react', 'react-dom'].map(name => {
    const path = join(target, 'node_modules', name, 'package.json');
    if (!dependencies[name] || !existsSync(path)) throw new Error('Install the host React and React DOM dependencies first (npm install).');
    return JSON.parse(readFileSync(path, 'utf8')).version;
  });
  if (versions[0] !== versions[1] || !/^19\.(?:[2-9]|[1-9]\d+)\.\d+$/.test(versions[0])) throw new Error(`Unsupported React pair ${versions.join(' / ')}. Requires matching stable React / React DOM ^19.2.0; no automatic React upgrade.`);
}
const version = JSON.parse(readFileSync(join(root, 'packages/highway-styles/package.json'))).version;
if (JSON.parse(readFileSync(join(root, 'packages/highway-react/package.json'))).version !== version) throw new Error('Highway package versions must match.');
const names = options.mode === 'react' ? ['styles', 'react'] : ['styles'];
const files = new Map();
for (const name of names) {
  const filename = `highway-${name}-${version}.tgz`;
  const dependency = `@highway/${name}`;
  if (dependencies[dependency]) throw new Error(`${dependency} already exists. Use the changelog upgrade instructions; adoption never replaces an existing installation.`);
  files.set(`vendor/highway/${filename}`, readFileSync(join(root, 'artifacts', filename)));
}
files.set('src/highway/theme.css', options.mode === 'react'
  ? '/* Import once through your framework\'s global CSS entry. */\n@import "@highway/styles/styles.css";\n'
  : '@import "@highway/styles/styles.css";\n/* Wrap the adopted region in .highway; add data-highway-mode="dark" and .dark for dark mode. Brand using scoped semantic variables. */\n');
const typescript = existsSync(join(target, 'tsconfig.json'));
if (options.mode === 'react') files.set(`src/highway/Provider.${typescript ? 'tsx' : 'jsx'}`, `'use client';
import { HighwayTheme${typescript ? ', type HighwayThemeProps' : ''} } from '@highway/react';

// Pass existing brand tokens and controlled light/dark mode from the host.
// Import ./theme.css once through your framework's global CSS entry.
export function HighwayProvider(props${typescript ? ': HighwayThemeProps' : ''}) {
  return <HighwayTheme {...props} />;
}
`);
files.set('src/highway/INTEGRATION.md', `# Highway ${version} adoption\n\nSetup only: no routes or application files were rewritten.\n\n1. Import src/highway/theme.css once through the host's global CSS entry.\n2. ${options.mode === 'react' ? 'Wrap the chosen region with HighwayProvider; pass the existing brand and mode. The provider uses TSX when the project has tsconfig.json, otherwise JSX.' : 'Wrap the chosen region in class="highway"; map the existing brand to scoped semantic CSS variables.'}\n3. Follow IMPLEMENTATION.md and components.json beside this file. PACKAGES.md is the complete reference; its build/release commands and repository-relative links refer to the Highway source checkout, not this host. CHANGELOG.md and RELEASE-NOTES.md record the installed release. Preserve handlers, state, validation, routing and infrastructure.\n4. Inspect computed styles and exercise existing behavior before expanding adoption. See PACKAGES.md for typography and API contracts.\n\nCommit vendor/highway, these generated files, package.json and package-lock.json. npm lifecycle scripts were disabled during installation; review and run any trusted host-required build step separately.\n`);
for (const [destination, source] of [
  ['src/highway/IMPLEMENTATION.md', 'docs/IMPLEMENTATION.md'],
  ['src/highway/PACKAGES.md', 'docs/PACKAGES.md'],
  ['src/highway/components.json', 'catalog/components.json'],
  ['src/highway/CHANGELOG.md', 'CHANGELOG.md'],
  ['src/highway/RELEASE-NOTES.md', `docs/releases/${version}.md`],
]) files.set(destination, readFileSync(join(root, source)));
const hashes = Object.fromEntries([...files].map(([path, data]) => [path, createHash('sha256').update(data).digest('hex')]));
files.set('src/highway/adoption.json', JSON.stringify({ version, mode: options.mode, files: hashes }, null, 2) + '\n');
// Refuse collisions and symlink traversal before any mutation.
for (const path of [...files.keys(), 'package.json', 'package-lock.json', 'node_modules']) {
  let current = target;
  for (const part of path.split('/')) {
    current = join(current, part);
    if (entry(current)?.isSymbolicLink()) throw new Error(`Refusing symlink: ${relative(target, current)}`);
  }
  if (files.has(path) && entry(join(target, path))) throw new Error(`Existing file would be replaced: ${path}. No files changed.`);
}
console.log(JSON.stringify({ mode: options.apply ? 'apply' : 'preview', target, version, create: [...files.keys()], modify: ['package.json', 'package-lock.json', 'node_modules'], next: 'Import theme.css and explicitly wrap the adopted region; host source/infra are not rewritten.' }, null, 2));
if (!options.apply) process.exit(0);
const lockPath = join(target, 'package-lock.json');
const originalLock = existsSync(lockPath) ? readFileSync(lockPath) : null;
const created = [];
try {
  for (const [path, data] of files) {
    mkdirSync(dirname(join(target, path)), { recursive: true });
    writeFileSync(join(target, path), data, { flag: 'wx' });
    created.push(path);
  }
  const result = spawnSync('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund', '--save-exact', ...names.map(name => `./vendor/highway/highway-${name}-${version}.tgz`)], { cwd: target, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`npm install failed (${result.status}).`);
  console.log('Highway setup complete. Follow src/highway/INTEGRATION.md to connect the existing app.');
} catch (error) {
  writeFileSync(packagePath, originalPackage);
  if (originalLock) writeFileSync(lockPath, originalLock); else rmSync(lockPath, { force: true });
  for (const path of created) rmSync(join(target, path), { force: true });
  throw new Error(`${error.message} Manifest/lock and generated files restored. node_modules may need npm install to resynchronize; empty generated directories may remain.`);
}
