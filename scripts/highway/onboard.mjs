#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync, mkdirSync, lstatSync, realpathSync, cpSync, rmSync, readdirSync } from 'node:fs';
import { resolve, join, dirname, sep, basename } from 'node:path';
import { spawnSync } from 'node:child_process';

const [nodeMajor, nodeMinor] = process.versions.node.split('.').map(Number);
if (nodeMajor < 22 || (nodeMajor === 22 && nodeMinor < 13)) {
  console.error('Highway setup requires Node 22.13 or newer.');
  process.exit(1);
}
const root = resolve(import.meta.dirname, '../..');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const options = { agent: 'codex', apply: false, fresh: false };
const args = process.argv.slice(2);
function fail(message) { throw new Error(message); }
function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, stdio: 'inherit' });
  if (result.error || result.status !== 0) fail(result.error?.message || `${command} failed (${result.status}).`);
}
function json(path) { return JSON.parse(readFileSync(path, 'utf8')); }
function write(path, value) { mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, value); }
function noSymlinks(path) {
  let current = resolve(path);
  while (true) {
    try { if (lstatSync(current).isSymbolicLink()) fail(`Refusing symlink: ${current}`); } catch (error) { if (error.code !== 'ENOENT') throw error; }
    const parent = dirname(current); if (parent === current) break; current = parent;
  }
}
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--apply') options.apply = true;
  else if (arg === '--new') options.fresh = true;
  else if (['--target', '--agent'].includes(arg)) {
    const value = args[++i]; if (!value || value.startsWith('--')) fail(`Missing value for ${arg}`);
    options[arg.slice(2)] = value;
  } else if (arg === '--help') {
    console.log('npm run onboard -- --target /path/to/app [--new] [--agent codex|claude|cursor] [--apply]\nPreview by default. --new creates a React/Vite app in a new directory. Otherwise adopts into an existing standalone npm React 19.2+ project. Installs a project-local skill and MCP; never changes global agent settings.');
    process.exit(0);
  } else fail(`Unknown option: ${arg}`);
}
if (!options.target || !['codex', 'claude', 'cursor'].includes(options.agent)) fail('Provide --target and an agent: codex, claude, or cursor.');
const requestedTarget = resolve(options.target);
try { if (lstatSync(requestedTarget).isSymbolicLink()) fail('The target itself must not be a symlink.'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
let ancestor = dirname(requestedTarget);
const tail = [basename(requestedTarget)];
while (!existsSync(ancestor)) { tail.unshift(basename(ancestor)); ancestor = dirname(ancestor); }
// Canonicalize existing ancestors, including macOS /tmp -> /private/tmp.
const target = join(realpathSync(ancestor), ...tail);
noSymlinks(target);
if (target === root || target.startsWith(root + sep) || root.startsWith(target + sep)) fail('Choose an independent project outside the Highway checkout.');
if (options.fresh && existsSync(target)) fail('--new requires a directory that does not exist.');
if (!options.fresh && !existsSync(join(target, 'package.json'))) fail('Existing projects need package.json; use --new for a new project.');
const skillPath = options.agent === 'claude' ? '.claude/skills/highway' : options.agent === 'cursor' ? '.cursor/skills/highway' : '.agents/skills/highway';
const configPath = options.agent === 'codex' ? '.codex/config.toml' : options.agent === 'claude' ? '.mcp.json' : '.cursor/mcp.json';
const reserved = ['.highway', skillPath, 'src/highway'];
for (const path of [...reserved, configPath, 'package.json', 'package-lock.json', 'node_modules', 'vendor/highway']) noSymlinks(join(target, path));
for (const path of reserved) if (existsSync(join(target, path))) fail(`Already exists: ${path}. No changes made. This command is first-time setup, not an upgrade.`);
const configFile = join(target, configPath);
const originalConfig = existsSync(configFile) ? readFileSync(configFile, 'utf8') : null;
let config;
if (options.agent === 'codex') {
  // Avoid trying to rewrite arbitrary TOML. Existing unrelated settings are preserved verbatim.
  if (originalConfig && /highway/i.test(originalConfig)) fail('Existing Codex config mentions Highway. Review it before connecting again.');
} else {
  config = originalConfig ? JSON.parse(originalConfig) : {};
  if (!config || typeof config !== 'object' || Array.isArray(config) || (config.mcpServers !== undefined && (!config.mcpServers || typeof config.mcpServers !== 'object' || Array.isArray(config.mcpServers)))) fail('MCP settings must contain an object-shaped mcpServers map.');
  if (config.mcpServers?.highway) fail('A Highway MCP server is already configured.');
}
if (!options.fresh) {
  const pkg = json(join(target, 'package.json'));
  const deps = { ...pkg.devDependencies, ...pkg.dependencies };
  if (pkg.workspaces || (pkg.packageManager && !pkg.packageManager.startsWith('npm@')) || ['pnpm-lock.yaml','yarn.lock','bun.lock','bun.lockb'].some(p => existsSync(join(target,p)))) fail('Automatic setup currently supports standalone npm projects. Use the manual package guide for workspaces or other package managers.');
  if (deps['@highway/react'] || deps['@highway/styles']) fail('Highway is already installed. Use the manual connection instructions; this command does not upgrade packages.');
  const versions = ['react','react-dom'].map(name => {
    const path = join(target,'node_modules',name,'package.json');
    if (!deps[name] || !existsSync(path)) fail('Install the existing project dependencies first with npm install.');
    return json(path).version;
  });
  if (versions[0] !== versions[1] || !/^19\.(?:[2-9]|[1-9]\d+)\.\d+$/.test(versions[0])) fail(`Requires matching stable React and React DOM ^19.2.0; found ${versions.join(' / ')}. No automatic React upgrades.`);
}
console.log(JSON.stringify({ action: options.apply ? 'apply' : 'preview', project: options.fresh ? 'new React/Vite app' : 'existing app; source and routes preserved', target, agent: options.agent, add: [...reserved, 'vendor/highway'], configure: configPath, globalSettings: 'unchanged', next: options.apply ? 'Build packages, install, and connect' : 'Run the same command with --apply to continue' }, null, 2));
if (!options.apply) process.exit(0);
// Build version-matched artifacts once before touching the consumer.
run(npm, ['run','pack:packages'], root);
run(process.execPath, ['scripts/highway/build-mcp.mjs'], root);
const version = json(join(root,'packages/highway-react/package.json')).version;
const snapshot = json(join(root,'packages/highway-mcp/data/snapshot.json'));
if (snapshot.packageVersion !== version) fail('MCP snapshot and UI package versions differ.');
const originals = new Map(['package.json','package-lock.json'].map(name => [name, existsSync(join(target,name)) ? readFileSync(join(target,name)) : null]));
const vendorBefore = new Set(existsSync(join(target,'vendor/highway')) ? readdirSync(join(target,'vendor/highway')) : []);
let createdNew = false;
try {
  if (options.fresh) {
    mkdirSync(dirname(target), { recursive: true });
    mkdirSync(target); createdNew = true;
    const source = json(join(root,'package.json'));
    write(join(target,'package.json'), JSON.stringify({ name: basename(target).toLowerCase().replace(/[^a-z0-9-]/g,'-') || 'highway-app', private: true, version:'0.0.0', type:'module', scripts:{dev:'vite',build:'vite build',preview:'vite preview'}, dependencies:{react:source.dependencies.react,'react-dom':source.dependencies['react-dom']}, devDependencies:{vite:source.devDependencies.vite,'@vitejs/plugin-react':source.devDependencies['@vitejs/plugin-react']} },null,2)+'\n');
    write(join(target,'index.html'), '<!doctype html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/><title>Highway app</title></head><body><div id="root"></div><script type="module" src="/src/main.jsx"></script></body></html>\n');
    write(join(target,'vite.config.js'), "import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\nexport default defineConfig({ plugins: [react()] });\n");
    write(join(target,'.gitignore'), 'node_modules/\ndist/\n.env*\n.highway/mcp/node_modules/\n');
    run(npm,['install','--ignore-scripts','--no-audit','--no-fund'],target);
  }
  run(process.execPath,['scripts/highway/adopt.mjs','--target',target,'--apply'],root);
  cpSync(join(root,'skills/highway'),join(target,skillPath),{recursive:true,errorOnExist:true,force:false});
  const mcp = join(target,'.highway/mcp');
  mkdirSync(mcp,{recursive:true});
  for (const file of ['src','data','package.json','package-lock.json']) cpSync(join(root,'packages/highway-mcp',file),join(mcp,file),{recursive:true});
  run(npm,['ci','--omit=dev','--ignore-scripts','--no-audit','--no-fund'],mcp);
  const server = join(mcp,'src/server.mjs');
  if (options.agent === 'codex') {
    write(configFile,(originalConfig || '')+`\n[mcp_servers.highway]\ncommand = ${JSON.stringify(process.execPath)}\nargs = [${JSON.stringify(server)}]\n`);
  } else {
    write(configFile,JSON.stringify({...config,mcpServers:{...config.mcpServers,highway:{command:process.execPath,args:[server]}}},null,2)+'\n');
  }
  write(join(target,'.highway/.gitignore'),'mcp/node_modules/\n');
  const invocation = options.agent === 'codex' ? '$highway' : '/highway';
  write(join(target,'.highway/START-HERE.md'),`# Build with Highway\n\nInstalled UI and MCP snapshot: ${version}.\n\nOpen this project in ${options.agent}. Trust the project and enable its Highway MCP server when your client asks. Restart the session if the skill or tools do not appear.\n\nAsk: “${invocation} Use Highway MCP to inspect AskBar. Report the import, onSend signature, and snapshot version.”\n\nThen ask: “${invocation} ${options.fresh ? 'Help me design and build the first useful flow for my app.' : 'Inspect my app and adopt Highway in one screen. Preserve my handlers, validation, routing, and brand.'} Read the exact APIs through MCP before editing.”\n\n${options.fresh ? 'Run npm run dev to open the starter. Its example saves only in memory, not to a service.' : 'Follow src/highway/INTEGRATION.md to connect the provider and stylesheet. Existing source files are unchanged.'}\n\nMCP is installed locally in .highway/mcp; it requires no running Highway checkout. Configuration uses absolute paths to this project and Node. If you move the project or Node, update ${configPath}. Do not share these machine-specific paths unchanged. On another machine, run npm ci --omit=dev --ignore-scripts in .highway/mcp and configure that machine’s paths.\n\nCommit the vendored UI archives and lockfile for reproducible application installs. Review agent settings before committing them. This setup does not publish, deploy, connect an AI service, or upgrade an existing Highway installation.\n`);
  if (options.fresh) {
    write(join(target,'src/main.jsx'),`import React, { useState } from 'react';\nimport { createRoot } from 'react-dom/client';\nimport { Button, Input, Label } from '@highway/react';\nimport { HighwayProvider } from './highway/Provider';\nimport './highway/theme.css';\nimport './app.css';\n\nfunction App() {\n  const [name, setName] = useState('');\n  const [saved, setSaved] = useState('');\n  return <HighwayProvider><main className="app"><h1 className="highway-type-heading-xl">Your first Highway screen</h1><p className="highway-type-body">A working starting point. Tell your agent what you want to build.</p><form onSubmit={event => { event.preventDefault(); setSaved(name.trim()); }}><Label htmlFor="project-name">Project name</Label><Input id="project-name" name="projectName" required value={name} onChange={event => setName(event.target.value)} /><Button type="submit" disabled={!name.trim()}>Save name</Button><p role="status">{saved ? 'Saved in this session: ' + saved : 'This example keeps changes in memory.'}</p></form></main></HighwayProvider>;\n}\ncreateRoot(document.getElementById('root')).render(<App/>);\n`);
    write(join(target,'src/app.css'), 'body { margin:0; }\n.app { max-width:40rem; margin-inline:auto; padding:var(--space-12) var(--space-6); }\n.app > p { color:var(--muted-foreground); margin-block:var(--space-3) var(--space-8); }\n.app form { display:grid; gap:var(--space-3); }\n.app form > button { justify-self:start; }\n.app [role="status"] { color:var(--muted-foreground); font-size:var(--type-body-sm); }\n');
  }
  console.log(`\nHighway ${version} is installed. Open ${target} in ${options.agent}.\nRead .highway/START-HERE.md for the connection check and first prompt.${options.fresh ? '\nRun npm run dev in the new project.' : '\nNext: let the agent integrate the provider and stylesheet in one screen.'}`);
} catch (error) {
  if (createdNew) rmSync(target,{recursive:true,force:true});
  else {
    for (const [name,value] of originals) { if (value) write(join(target,name),value); else rmSync(join(target,name),{force:true}); }
    for (const path of reserved) rmSync(join(target,path),{recursive:true,force:true});
    if (originalConfig !== null) write(configFile,originalConfig); else rmSync(configFile,{force:true});
    const vendor = join(target,'vendor/highway');
    if (existsSync(vendor)) for (const name of readdirSync(vendor)) if (!vendorBefore.has(name)) rmSync(join(vendor,name),{force:true});
  }
  fail(`${error.message}\n${createdNew ? 'New project removed after failed setup.' : 'Manifests/config and generated files restored. Run npm install to resynchronize node_modules if necessary; empty directories may remain.'}`);
}
