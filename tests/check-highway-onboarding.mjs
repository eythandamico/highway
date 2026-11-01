import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { spawn, spawnSync } from 'node:child_process';
import { createServer } from 'node:net';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  lstatSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';
import { test } from 'node:test';
import { chromium } from 'playwright';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const onboarding = join(repositoryRoot, 'scripts/highway/onboard.mjs');
const requireFromMcp = createRequire(join(repositoryRoot, 'packages/highway-mcp/package.json'));
const { Client } = requireFromMcp('@modelcontextprotocol/client');
const { StdioClientTransport } = requireFromMcp('@modelcontextprotocol/client/stdio');

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function write(path, content) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}

function run(command, args, cwd, timeout = 180_000) {
  return spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    maxBuffer: 24 * 1024 * 1024,
    timeout,
  });
}

function runOnboard(target, agent, { fresh = false, apply = false } = {}) {
  const args = [onboarding, '--target', target, '--agent', agent];
  if (fresh) args.push('--new');
  if (apply) args.push('--apply');
  return run(process.execPath, args, repositoryRoot);
}

function assertSuccess(result, label) {
  assert.ifError(result.error);
  assert.equal(result.status, 0, `${label} failed:\n${result.stdout}\n${result.stderr}`);
}

function assertRefused(result, label) {
  assert.ifError(result.error);
  assert.notEqual(result.status, 0, `${label} should refuse the setup`);
}

function snapshotTree(root) {
  const entries = [];
  const visit = (directory, prefix = '') => {
    for (const name of readFileSyncNames(directory)) {
      const path = join(directory, name);
      const relative = prefix ? `${prefix}/${name}` : name;
      if (name === 'node_modules') continue;
      const stats = (awaitStat(path));
      if (stats.isDirectory()) visit(path, relative);
      else if (stats.isSymbolicLink()) entries.push(`${relative}:symlink`);
      else entries.push(`${relative}:${createHash('sha256').update(readFileSync(path)).digest('hex')}`);
    }
  };
  visit(root);
  return entries.sort();
}

// Keep the snapshot helper synchronous and avoid traversing installed dependency trees.
function readFileSyncNames(path) {
  return readdirSync(path).sort();
}

function awaitStat(path) {
  return lstatSync(path);
}

async function availablePort() {
  const server = createServer();
  await new Promise((resolveListen, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolveListen);
  });
  const port = server.address().port;
  await new Promise((resolveClose, reject) => server.close((error) => error ? reject(error) : resolveClose()));
  return port;
}

async function startVite(project, port) {
  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const child = spawn(npm, ['run', 'dev', '--', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], {
    cwd: project,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  child.stdout.on('data', (chunk) => { output += chunk.toString(); });
  child.stderr.on('data', (chunk) => { output += chunk.toString(); });
  const url = `http://127.0.0.1:${port}`;
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`Vite exited early:\n${output}`);
    try {
      const response = await fetch(url);
      if (response.ok) return { child, url };
    } catch {}
    await delay(150);
  }
  child.kill();
  throw new Error(`Vite did not become ready:\n${output}`);
}

async function stopServer(child) {
  if (child.exitCode !== null) return;
  child.kill();
  await Promise.race([
    new Promise((resolveExit) => child.once('exit', resolveExit)),
    delay(3_000),
  ]);
}

async function browserSave(url, { app = 'new' } = {}) {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto(url);
    if (app === 'new') {
      await page.getByLabel('Project name').fill('Onboarding smoke');
      await page.getByRole('button', { name: 'Save name' }).click();
      await page.getByRole('status').getByText('Saved in this session: Onboarding smoke').waitFor();
    } else {
      const input = page.getByLabel('Record name');
      await page.getByRole('button', { name: 'Save record' }).click();
      assert.equal(await input.evaluate((element) => element.checkValidity()), false, 'Required input should block an empty save');
      assert.equal(await page.evaluate(() => globalThis.__existingHandlerSentinel), undefined, 'Invalid input must not call the existing handler');
      await input.fill('  kept handler  ');
      await page.getByRole('button', { name: 'Save record' }).click();
      await page.getByRole('status').getByText('Saved existing record: kept handler').waitFor();
      assert.equal(await page.evaluate(() => globalThis.__existingHandlerSentinel), 'kept handler');
    }
  } finally {
    await browser.close();
  }
}

test('new and existing Highway onboarding flows install, build, preserve host behavior, and refuse unsafe repeats', { timeout: 600_000 }, async (t) => {
  const temporaryRoot = mkdtempSync(join(realpathSync('/tmp'), 'highway-onboarding-check-'));
  const keepFixtures = process.env.HIGHWAY_KEEP_ONBOARD_FIXTURE === '1';
  t.after(() => {
    if (keepFixtures) console.log(`Preserved onboarding fixtures at ${temporaryRoot}`);
    else rmSync(temporaryRoot, { recursive: true, force: true });
  });

  const help = run(process.execPath, [onboarding, '--help'], repositoryRoot);
  assertSuccess(help, '--help');

  const freshTarget = join(temporaryRoot, 'new-codex-app');
  const freshTargetAlias = join('/tmp', basename(freshTarget));
  assertSuccess(runOnboard(freshTargetAlias, 'codex', { fresh: true }), 'new app preview');
  assert.equal(existsSync(freshTarget), false, 'Preview must not create the new target');
  assertSuccess(runOnboard(freshTarget, 'codex', { fresh: true, apply: true }), 'new app apply');
  assert.ok(existsSync(join(freshTarget, '.codex/config.toml')));
  assert.ok(existsSync(join(freshTarget, '.agents/skills/highway/SKILL.md')));
  assert.equal(
    readJson(join(freshTarget, '.highway/mcp/data/snapshot.json')).packageVersion,
    readJson(join(freshTarget, 'node_modules/@highway/react/package.json')).version,
    'new app MCP and UI package versions must match',
  );
  assertSuccess(run('npm', ['run', 'build'], freshTarget), 'new app production build');
  const newPort = await availablePort();
  const newServer = await startVite(freshTarget, newPort);
  try {
    await browserSave(newServer.url);
  } finally {
    await stopServer(newServer.child);
  }

  const existingTarget = join(temporaryRoot, 'existing-claude-app');
  mkdirSync(join(existingTarget, 'src'), { recursive: true });
  write(join(existingTarget, 'package.json'), JSON.stringify({
    name: 'existing-host-fixture',
    private: true,
    type: 'module',
    dependencies: { react: '19.2.8', 'react-dom': '19.2.8' },
  }, null, 2) + '\n');
  write(join(existingTarget, 'src/App.jsx'), [
    "import { saveExistingRecord } from './handlers.js';",
    "export function App() { return <button onClick={() => saveExistingRecord('kept')}>Keep handler</button>; }",
    '',
  ].join('\n'));
  write(join(existingTarget, 'src/handlers.js'), "export function saveExistingRecord(value) { globalThis.__existingHandlerSentinel = value; }\n");
  write(join(existingTarget, '.mcp.json'), JSON.stringify({
    mcpServers: { 'other-tool': { command: 'node', args: ['./other-tool.mjs'], env: { KEEP_SENTINEL: 'untouched' } } },
    projectSetting: { theme: 'warm', keep: true },
  }, null, 2) + '\n');
  assertSuccess(run('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund'], existingTarget), 'existing host dependency install');
  const originalSourceHashes = ['src/App.jsx', 'src/handlers.js'].map((path) => createHash('sha256').update(readFileSync(join(existingTarget, path))).digest('hex'));
  const originalConfig = readJson(join(existingTarget, '.mcp.json'));
  const beforePreview = snapshotTree(existingTarget);
  assertSuccess(runOnboard(existingTarget, 'claude'), 'existing app preview');
  assert.deepEqual(snapshotTree(existingTarget), beforePreview, 'Existing preview must not mutate the project');

  assertSuccess(runOnboard(existingTarget, 'claude', { apply: true }), 'existing app apply');
  assert.deepEqual(
    ['src/App.jsx', 'src/handlers.js'].map((path) => createHash('sha256').update(readFileSync(join(existingTarget, path))).digest('hex')),
    originalSourceHashes,
    'Adoption must preserve the app and handler source files',
  );
  const adoptedConfig = readJson(join(existingTarget, '.mcp.json'));
  assert.deepEqual(adoptedConfig.mcpServers['other-tool'], originalConfig.mcpServers['other-tool']);
  assert.deepEqual(adoptedConfig.projectSetting, originalConfig.projectSetting);
  assert.equal(adoptedConfig.mcpServers.highway.command, process.execPath);
  assert.deepEqual(adoptedConfig.mcpServers.highway.args, [join(existingTarget, '.highway/mcp/src/server.mjs')]);
  assert.equal(readJson(join(existingTarget, 'node_modules/@highway/react/package.json')).version, '0.3.0');
  assert.equal(readJson(join(existingTarget, 'node_modules/@highway/styles/package.json')).version, '0.3.0');
  assert.equal(readJson(join(existingTarget, 'node_modules/react/package.json')).version, '19.2.8');
  assert.equal(readJson(join(existingTarget, 'node_modules/react-dom/package.json')).version, '19.2.8');

  const client = new Client({ name: 'highway-onboarding-regression', version: '1.0.0' });
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [join(existingTarget, '.highway/mcp/src/server.mjs')],
    cwd: existingTarget,
    stderr: 'pipe',
  });
  try {
    await client.connect(transport);
    assert.equal(client.getServerVersion().name, 'highway');
    assert.equal(client.getServerVersion().version, readJson(join(existingTarget, '.highway/mcp/package.json')).version);
    const response = await client.callTool({ name: 'get_component', arguments: { name: 'AskBar' } });
    assert.notEqual(response.isError, true, response.content?.map((item) => item.text).join('\n'));
    const result = response.structuredContent ?? JSON.parse(response.content.find((item) => item.type === 'text').text);
    const installedVersion = readJson(join(existingTarget, 'node_modules/@highway/react/package.json')).version;
    assert.equal(result.component.export, 'AskBar');
    assert.match(result.import, /@highway\/react/);
    assert.match(result.declaration.text, /onSend/);
    assert.equal(result.packageVersion, installedVersion);
    assert.equal(readJson(join(existingTarget, '.highway/mcp/data/snapshot.json')).packageVersion, installedVersion);
  } finally {
    await client.close().catch(() => {});
    await transport.close().catch(() => {});
  }

  const rootPackage = readJson(join(repositoryRoot, 'package.json'));
  assertSuccess(run('npm', [
    'install', '--save-dev', '--ignore-scripts', '--no-audit', '--no-fund',
    `vite@${rootPackage.devDependencies.vite}`,
    `@vitejs/plugin-react@${rootPackage.devDependencies['@vitejs/plugin-react']}`,
  ], existingTarget), 'existing host Vite integration dependencies');
  const existingPackage = readJson(join(existingTarget, 'package.json'));
  existingPackage.scripts = { ...existingPackage.scripts, dev: 'vite', build: 'vite build' };
  write(join(existingTarget, 'package.json'), JSON.stringify(existingPackage, null, 2) + '\n');
  write(join(existingTarget, 'index.html'), '<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Existing host fixture</title></head><body><div id="root"></div><script type="module" src="/src/main.jsx"></script></body></html>\n');
  write(join(existingTarget, 'vite.config.js'), "import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\nexport default defineConfig({ plugins: [react()] });\n");
  write(join(existingTarget, 'src/main.jsx'), "import React from 'react';\nimport { createRoot } from 'react-dom/client';\nimport { App } from './App.jsx';\nimport './app.css';\ncreateRoot(document.getElementById('root')).render(<App />);\n");
  write(join(existingTarget, 'src/app.css'), 'body { margin: 0; padding: 2rem; }\nmain { max-width: 32rem; margin-inline: auto; }\nform { display: grid; gap: 0.75rem; }\n');
  write(join(existingTarget, 'src/App.jsx'), [
    "import React, { useState } from 'react';",
    "import { Button, Input, Label } from '@highway/react';",
    "import { HighwayProvider } from './highway/Provider.jsx';",
    "import { saveExistingRecord } from './handlers.js';",
    "import './highway/theme.css';",
    'export function App() {',
    "  const [name, setName] = useState('');",
    "  const [saved, setSaved] = useState('');",
    '  return <HighwayProvider><main><form onSubmit={event => { event.preventDefault(); const value = name.trim(); if (!value) return; saveExistingRecord(value); setSaved(value); }}><Label htmlFor="record-name">Record name</Label><Input id="record-name" name="recordName" required value={name} onChange={event => setName(event.target.value)} /><Button type="submit">Save record</Button></form><p role="status">{saved ? `Saved existing record: ${saved}` : "No saved record"}</p></main></HighwayProvider>;',
    '}',
    '',
  ].join('\n'));
  assert.equal(
    createHash('sha256').update(readFileSync(join(existingTarget, 'src/handlers.js'))).digest('hex'),
    originalSourceHashes[1],
    'Integration must retain the original handler',
  );
  assertSuccess(run('npm', ['run', 'build'], existingTarget), 'existing app integration build');
  const existingPort = await availablePort();
  const existingServer = await startVite(existingTarget, existingPort);
  try {
    await browserSave(existingServer.url, { app: 'existing' });
  } finally {
    await stopServer(existingServer.child);
  }

  const beforeRepeat = snapshotTree(existingTarget);
  assertRefused(runOnboard(existingTarget, 'claude', { apply: true }), 'repeat setup');
  assert.deepEqual(snapshotTree(existingTarget), beforeRepeat, 'Repeat setup refusal must preserve the integrated host');

  const collisionTarget = join(temporaryRoot, 'mcp-collision');
  mkdirSync(collisionTarget, { recursive: true });
  write(join(collisionTarget, 'package.json'), '{"name":"collision-fixture","private":true}\n');
  write(join(collisionTarget, '.mcp.json'), '{"mcpServers":{"highway":{"command":"existing"},"other":{"command":"safe"}}}\n');
  const beforeCollision = snapshotTree(collisionTarget);
  assertRefused(runOnboard(collisionTarget, 'claude', { apply: true }), 'MCP config collision');
  assert.deepEqual(snapshotTree(collisionTarget), beforeCollision, 'Config collision refusal must preserve every fixture file');

  const unsupportedTarget = join(temporaryRoot, 'unsupported-react');
  write(join(unsupportedTarget, 'package.json'), '{"name":"unsupported-fixture","private":true,"dependencies":{"react":"18.3.1","react-dom":"18.3.1"}}\n');
  write(join(unsupportedTarget, 'node_modules/react/package.json'), '{"name":"react","version":"18.3.1"}\n');
  write(join(unsupportedTarget, 'node_modules/react-dom/package.json'), '{"name":"react-dom","version":"18.3.1"}\n');
  const unsupportedManifest = readFileSync(join(unsupportedTarget, 'package.json'));
  assertRefused(runOnboard(unsupportedTarget, 'codex', { apply: true }), 'unsupported React version');
  assert.deepEqual(readFileSync(join(unsupportedTarget, 'package.json')), unsupportedManifest);
  assert.equal(existsSync(join(unsupportedTarget, '.codex/config.toml')), false);
  assert.equal(existsSync(join(unsupportedTarget, 'src/highway')), false);

  const packageManagerTarget = join(temporaryRoot, 'non-npm-project');
  mkdirSync(packageManagerTarget, { recursive: true });
  write(join(packageManagerTarget, 'package.json'), '{"name":"non-npm-fixture","private":true,"packageManager":"pnpm@10.0.0"}\n');
  write(join(packageManagerTarget, 'pnpm-lock.yaml'), 'lockfileVersion: 9.0\n');
  const beforePackageManager = snapshotTree(packageManagerTarget);
  assertRefused(runOnboard(packageManagerTarget, 'cursor', { apply: true }), 'non-npm package manager');
  assert.deepEqual(snapshotTree(packageManagerTarget), beforePackageManager, 'Unsupported package manager refusal must be side-effect free');

  t.diagnostic(`Validated new and existing projects under ${temporaryRoot}`);
});
