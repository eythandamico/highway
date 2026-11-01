import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { mkdtemp, mkdir, readFile, readdir, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = resolve(import.meta.dirname, '..');
const ui = JSON.parse(await readFile(join(root, 'packages/highway-react/package.json'), 'utf8'));
const mcpRequire = createRequire(join(root, 'packages/highway-mcp/package.json'));
const { Client } = await import(pathToFileURL(mcpRequire.resolve('@modelcontextprotocol/client')).href);
const { StdioClientTransport } = await import(pathToFileURL(mcpRequire.resolve('@modelcontextprotocol/client/stdio')).href);

async function filesUnder(directory) {
  const entries = await readdir(directory);
  const files = [];
  for (const name of entries) {
    const file = join(directory, name);
    if ((await stat(file)).isDirectory()) files.push(...await filesUnder(file));
    else files.push(file);
  }
  return files;
}

async function readJson(file) {
  return JSON.parse(await readFile(file, 'utf8'));
}

async function checkSkillMetadata(skillRoot) {
  const skill = await readFile(join(skillRoot, 'SKILL.md'), 'utf8');
  const frontmatter = skill.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  assert.ok(frontmatter, 'SKILL.md has a delimited metadata block');
  assert.match(frontmatter[1], /^name:\s*highway\s*$/m, 'Skill metadata name matches the plugin skill');
  const description = frontmatter[1].match(/^description:\s*(.+)$/m)?.[1]?.trim();
  assert.ok(description && description.length <= 1024, 'Skill metadata has a bounded description');
  assert.doesNotMatch(frontmatter[1], /^license:\s*\S/m, 'Skill does not claim a license that has not been selected');
  assert.match(frontmatter[1], /^metadata:\s*$/m);
  assert.match(frontmatter[1], /^  author:\s*Highway\s*$/m, 'Skill metadata identifies Highway as the maintainer');
  assert.match(frontmatter[1], /^  homepage:\s*https:\/\/github\.com\/eythandamico\/highway\s*$/m);

  const interfaceMetadata = await readFile(join(skillRoot, 'agents/openai.yaml'), 'utf8');
  assert.match(interfaceMetadata, /^interface:\s*$/m);
  for (const field of ['display_name', 'short_description', 'default_prompt']) {
    assert.match(interfaceMetadata, new RegExp(`^  ${field}:\\s*.+$`, 'm'), `OpenAI skill metadata includes ${field}`);
  }
}

async function checkSkill(skillRoot) {
  const sourceRoot = join(root, 'skills/highway');
  const sourceFiles = await filesUnder(sourceRoot);
  const bundledFiles = await filesUnder(skillRoot);
  const asRelative = (files, base) => files.map(file => relative(base, file)).sort();
  const sourcePaths = asRelative(sourceFiles, sourceRoot);
  const bundledPaths = asRelative(bundledFiles, skillRoot);
  assert.ok(!sourcePaths.includes('LICENSE'), 'Source skill does not include a license file that has not been selected');
  assert.ok(!bundledPaths.includes('LICENSE'), 'Bundled skill does not include a license file that has not been selected');
  assert.ok(sourcePaths.includes('UPSTREAM.md'), 'Source skill records project provenance');
  assert.ok(bundledPaths.includes('UPSTREAM.md'), 'Bundled skill records project provenance');
  assert.deepEqual(bundledPaths, sourcePaths, 'bundled skill file set matches source');
  await checkSkillMetadata(skillRoot);
  const provenance = await readFile(join(skillRoot, 'UPSTREAM.md'), 'utf8');
  assert.match(provenance, /^# Highway skill provenance/m);
  assert.match(provenance, /^Maintainer:\s*Highway\s*$/m);
  assert.match(provenance, /^Canonical project:\s*https:\/\/github\.com\/eythandamico\/highway\s*$/m);
  assert.doesNotMatch(provenance, /^License:\s*\S/m, 'Provenance does not claim a license that has not been selected');

  for (const file of bundledFiles) {
    const source = await readFile(join(sourceRoot, relative(skillRoot, file)));
    const bundled = await readFile(file);
    const skillRelative = relative(skillRoot, file);
    assert.deepEqual(bundled, source, `bundled skill matches source: ${skillRelative}`);
    if (file.endsWith('.md')) {
      assert.doesNotMatch(source.toString(), /(?:Damir Sokolovsky|@heydamir|unslop by @)/i, `${skillRelative} retains Highway provenance without stale upstream/story credit`);
    }
    if (skillRelative.split(sep)[0] === 'scripts' && /\.(?:mjs|cjs|js)$/.test(file)) {
      const checked = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
      assert.ifError(checked.error);
      assert.equal(checked.status, 0, `${skillRelative} parses without executing: ${checked.stderr}`);
    }
    if (!file.endsWith('.md')) continue;
    for (const [, target] of source.toString().matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
      if (/^(?:https?:|mailto:|#)/i.test(target)) continue;
      const local = decodeURIComponent(target.split('#')[0]);
      if (local) {
        assert.ok((await import('node:fs')).existsSync(resolve(dirname(file), local)), `${relative(skillRoot, file)} has a resolvable local link: ${target}`);
      }
    }
  }
}

async function checkRuntime(serverConfig, pluginRoot, outsideCwd) {
  assert.equal(typeof serverConfig.command, 'string', 'MCP manifest declares its launch command');
  assert.ok(Array.isArray(serverConfig.args), 'MCP manifest declares launch arguments');
  const env = { ...process.env, CLAUDE_PLUGIN_ROOT: pluginRoot, CODEX_PLUGIN_ROOT: pluginRoot };
  const args = serverConfig.args.map(arg => arg.replaceAll('${CLAUDE_PLUGIN_ROOT}', pluginRoot).replaceAll('${CODEX_PLUGIN_ROOT}', pluginRoot));
  assert.ok(args.every(arg => !/\$\{[^}]+\}/.test(arg)), 'MCP launch arguments must not contain unresolved plugin-root placeholders');
  const cwd = serverConfig.cwd === undefined ? outsideCwd : resolve(pluginRoot, serverConfig.cwd);
  const transport = new StdioClientTransport({ command: serverConfig.command, args, cwd, env });
  const client = new Client({ name: 'highway-plugin-check', version: '1.0.0' });
  try {
    await client.connect(transport);
    const reply = await client.callTool({ name: 'get_component', arguments: { name: 'AskBar' } });
    assert.equal(reply.isError, undefined, 'AskBar lookup succeeds');
    const data = reply.structuredContent;
    assert.equal(data.packageVersion, ui.version, 'MCP snapshot matches Highway UI version');
    assert.equal(data.component.export, 'AskBar');
    assert.equal(data.import, "import { AskBar } from '@highway/react';");
    assert.match(data.declaration.text, /AskBar/);
    return data.packageVersion;
  } finally {
    await client.close();
  }
}

const temporary = await mkdtemp(join(tmpdir(), 'highway-plugin-check-'));
try {
  const outsideCwd = join(temporary, 'unrelated-working-directory');
  await mkdir(outsideCwd);

  for (const clientName of ['codex', 'claude']) {
    const archive = join(root, `artifacts/highway-${clientName}-plugin-${JSON.parse(await readFile(join(root, 'plugins/highway/package.json'), 'utf8')).version}.zip`);
    const extracted = join(temporary, clientName);
    await mkdir(extracted);
    const result = spawnSync('unzip', ['-q', archive, '-d', extracted], { encoding: 'utf8' });
    assert.equal(result.status, 0, `extract ${relative(root, archive)}: ${result.stderr}`);

    const marketplace = clientName === 'codex'
      ? join(extracted, '.agents/plugins/marketplace.json')
      : join(extracted, '.claude-plugin/marketplace.json');
    const marketplaceManifest = await readJson(marketplace);
    assert.equal(marketplaceManifest.plugins[0].name, 'highway');
    const pluginRoot = join(extracted, 'plugins/highway');
    assert.ok((await readJson(join(pluginRoot, clientName === 'codex' ? '.codex-plugin/plugin.json' : '.claude-plugin/plugin.json'))).name === 'highway');
    assert.equal((await readJson(join(pluginRoot, 'server/data/snapshot.json'))).packageVersion, ui.version);
    await checkSkill(join(pluginRoot, 'skills/highway'));
    const mcpManifest = await readJson(join(pluginRoot, '.mcp.json'));
    const serverConfig = mcpManifest.mcpServers?.highway;
    assert.ok(serverConfig, `${clientName} plugin declares its Highway MCP server`);
    const packageVersion = await checkRuntime(serverConfig, pluginRoot, outsideCwd);
    console.log(`${clientName}: relocated AskBar MCP OK (Highway ${packageVersion}); skill refs resolve`);
  }
} finally {
  await rm(temporary, { recursive: true, force: true });
}
