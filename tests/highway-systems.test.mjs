import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFileSync, cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import test from 'node:test';

const repo = fileURLToPath(new URL('../', import.meta.url));
const node = process.execPath;

function temporaryProject(t) {
  const root = realpathSync(mkdtempSync(path.join(os.tmpdir(), 'highway-systems-')));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return root;
}

function invoke(root, script, args = []) {
  return spawnSync(node, [path.join(root, script), ...args], {
    cwd: root,
    encoding: 'utf8',
    timeout: 20_000,
    maxBuffer: 4 * 1024 * 1024,
  });
}

function assertFails(result, pattern) {
  assert.notEqual(result.status, 0, `expected command to fail, got stdout:\n${result.stdout}`);
  assert.match(`${result.stdout}\n${result.stderr}`, pattern);
}

function setupScaffoldProject(root, components = [{ id: 'highway.button', export: 'Button' }]) {
  const script = 'scripts/highway/create-component.mjs';
  mkdirSync(path.dirname(path.join(root, script)), { recursive: true });
  cpSync(path.join(repo, script), path.join(root, script));
  mkdirSync(path.join(root, 'catalog'), { recursive: true });
  writeFileSync(path.join(root, 'catalog/components.json'), `${JSON.stringify({ packageVersion: '0.2.2', components }, null, 2)}\n`);
}

test('component scaffolder previews without writing and applies only draft files', (t) => {
  const root = temporaryProject(t);
  setupScaffoldProject(root);
  const catalogPath = path.join(root, 'catalog/components.json');
  const catalogBefore = readFileSync(catalogPath, 'utf8');

  const preview = invoke(root, 'scripts/highway/create-component.mjs', ['--name', 'BrandNotice', '--family', 'action']);
  assert.equal(preview.status, 0, preview.stderr);
  const previewData = JSON.parse(preview.stdout);
  assert.equal(previewData.mode, 'preview');
  assert.equal(previewData.publicExportAdded, false);
  assert.deepEqual(previewData.files, [
    'packages/highway-react/src/components/generated/brand-notice.tsx',
    'examples/contracts/brand-notice.tsx',
    'catalog/drafts/brand-notice.json',
    'tests/generated/brand-notice.test.mjs',
  ]);
  for (const file of previewData.files) assert.equal(existsSync(path.join(root, file)), false, `${file} should not exist after preview`);
  assert.equal(readFileSync(catalogPath, 'utf8'), catalogBefore, 'preview must not change the public catalog');

  const applied = invoke(root, 'scripts/highway/create-component.mjs', ['--name', 'BrandNotice', '--family', 'action', '--apply']);
  assert.equal(applied.status, 0, applied.stderr);
  assert.equal(JSON.parse(applied.stdout).mode, 'created-draft');
  assert.equal(readFileSync(catalogPath, 'utf8'), catalogBefore, 'draft scaffolding must not publish an export');
  const source = readFileSync(path.join(root, previewData.files[0]), 'utf8');
  assert.match(source, /export function BrandNotice/);
  assert.match(source, /from '\.\.\/ui\/button'/);
  assert.match(readFileSync(path.join(root, previewData.files[1]), 'utf8'), /type="button"/);
  assert.equal(JSON.parse(readFileSync(path.join(root, previewData.files[2]), 'utf8')).status, 'draft');
  assert.match(readFileSync(path.join(root, previewData.files[3]), 'utf8'), /test\.todo/);

  assertFails(invoke(root, 'scripts/highway/create-component.mjs', ['--name', 'BrandNotice', '--family', 'action', '--apply']), /Refusing to overwrite/);
  assertFails(invoke(root, 'scripts/highway/create-component.mjs', ['--name', 'Button', '--family', 'display', '--apply']), /already exists/);
  assertFails(invoke(root, 'scripts/highway/create-component.mjs', ['--name', '../Escape', '--family', 'display', '--apply']), /Use --name PascalCase/);
  assertFails(invoke(root, 'scripts/highway/create-component.mjs', ['--name', 'NewCard', '--family', 'network', '--apply']), /Use --name PascalCase/);
});

test('component scaffolder refuses symlinked output paths before writing outside its root', (t) => {
  const root = temporaryProject(t);
  const outside = path.join(root, 'outside');
  setupScaffoldProject(root, []);
  mkdirSync(outside, { recursive: true });
  const generatedParent = path.join(root, 'packages/highway-react/src/components');
  mkdirSync(generatedParent, { recursive: true });
  symlinkSync(outside, path.join(generatedParent, 'generated'));

  assertFails(invoke(root, 'scripts/highway/create-component.mjs', ['--name', 'SafeCard', '--family', 'display', '--apply']), /Refusing symlink/);
  assert.deepEqual(readdirSync(outside), []);
});

function setupSystemsProject(t) {
  const root = temporaryProject(t);
  const copy = (from, to) => cpSync(path.join(repo, from), path.join(root, to), { recursive: true });
  copy('scripts/highway/systems.mjs', 'scripts/highway/systems.mjs');
  copy('catalog/components.json', 'catalog/components.json');
  copy('catalog/standards.json', 'catalog/standards.json');
  copy('packages/highway-react/package.json', 'packages/highway-react/package.json');
  copy('examples/contracts', 'examples/contracts');
  copy('packages/highway-react/dist/types', 'packages/highway-react/dist/types');
  symlinkSync(path.join(repo, 'node_modules'), path.join(root, 'node_modules'), 'dir');
  return root;
}

test('systems generator validates contracts, writes deterministic docs/API inventory, and rejects drift', (t) => {
  const root = setupSystemsProject(t);
  const generate = invoke(root, 'scripts/highway/systems.mjs', ['--write']);
  assert.equal(generate.status, 0, generate.stderr || generate.stdout);
  assert.match(generate.stdout, /contracts, \d+ declaration modules/);

  const check = invoke(root, 'scripts/highway/systems.mjs');
  assert.equal(check.status, 0, check.stderr || check.stdout);
  const apiPath = path.join(root, 'catalog/api-report.json');
  assert.equal(JSON.parse(readFileSync(apiPath, 'utf8')).packageVersion, JSON.parse(readFileSync(path.join(root, 'catalog/components.json'), 'utf8')).packageVersion);
  const reference = JSON.parse(readFileSync(path.join(root, 'catalog/component-reference.json'), 'utf8'));
  assert.match(reference.components.Button.declaration, /declare function Button/);
  assert.ok(Object.values(reference.examples).some(example => example.includes('<Button')));
  const voiceRecorder = reference.components.VoiceRecorder;
  assert.match(voiceRecorder.declaration, /VoiceRecorderProps[\s\S]*ContextTrayProps[\s\S]*ReviewApplyCardProps/);
  assert.match(voiceRecorder.displayDeclaration, /VoiceRecording[\s\S]*VoiceRecorderProps[\s\S]*declare function VoiceRecorder/);
  assert.doesNotMatch(voiceRecorder.displayDeclaration, /ContextItem|ContextTrayProps|ContextTray\(|ReviewApplyCardProps|ReviewApplyCard\(/);

  const docsPath = path.join(root, 'docs/COMPONENT-CONTRACTS.md');
  writeFileSync(docsPath, `${readFileSync(docsPath, 'utf8')}\nStale generated content.\n`);
  assertFails(invoke(root, 'scripts/highway/systems.mjs'), /docs\/COMPONENT-CONTRACTS\.md is stale/);
  assert.equal(invoke(root, 'scripts/highway/systems.mjs', ['--write']).status, 0);
  assert.equal(invoke(root, 'scripts/highway/systems.mjs').status, 0);

  const examplePath = path.join(root, 'examples/contracts/basic.tsx');
  writeFileSync(examplePath, `${readFileSync(examplePath, 'utf8')}\n// stale example snapshot\n`);
  assertFails(invoke(root, 'scripts/highway/systems.mjs'), /catalog\/component-reference\.json is stale/);
  assert.equal(invoke(root, 'scripts/highway/systems.mjs', ['--write']).status, 0);

  const catalogPath = path.join(root, 'catalog/components.json');
  const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));
  catalog.packageVersion = `${catalog.packageVersion}-drift`;
  writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);
  const manifestPath = path.join(root, 'packages/highway-react/package.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  manifest.version = catalog.packageVersion;
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  assertFails(invoke(root, 'scripts/highway/systems.mjs'), /catalog\/api-report\.json is stale/);

  catalog.components[0].contract.family = 'unknown-family';
  writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);
  assertFails(invoke(root, 'scripts/highway/systems.mjs'), /Missing\/invalid contract/);
});

test('quality guard accepts the inventoried baseline and rejects a new style violation', async (t) => {
  const root = temporaryProject(t);
  const script = 'scripts/highway/quality-guard.mjs';
  mkdirSync(path.dirname(path.join(root, script)), { recursive: true });
  cpSync(path.join(repo, script), path.join(root, script));
  cpSync(path.join(repo, 'packages/highway-react/src'), path.join(root, 'packages/highway-react/src'), { recursive: true });
  mkdirSync(path.join(root, 'catalog'), { recursive: true });
  copyFileSync(path.join(repo, 'catalog/quality-exceptions.json'), path.join(root, 'catalog/quality-exceptions.json'));

  const baseline = invoke(root, script);
  assert.equal(baseline.status, 0, baseline.stderr || baseline.stdout);
  const source = path.join(root, 'packages/highway-react/src/invariant/components/alert.jsx');
  writeFileSync(source, `${readFileSync(source, 'utf8')}\n// New style debt: transition-all.\n`);
  const guard = await import(`${pathToFileURL(path.join(root, script)).href}?injected=1`);
  assert.ok(guard.findings().some(item => item.file === 'packages/highway-react/src/invariant/components/alert.jsx' && item.rule === 'transition-all' && item.match === 'transition-all'));
  assertFails(invoke(root, script), /Quality guard failed:[\s\S]*transition-all/);
});
