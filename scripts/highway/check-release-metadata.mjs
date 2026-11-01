import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
const root = resolve(import.meta.dirname, '../..');
const read = path => readFileSync(resolve(root, path), 'utf8');
const json = path => JSON.parse(read(path));
const react = json('packages/highway-react/package.json');
const styles = json('packages/highway-styles/package.json');
const version = react.version;
assert.match(version, /^\d+\.\d+\.\d+$/);
assert.equal(styles.version, version, 'React/styles versions must match');
assert.equal(react.peerDependencies['@highway/styles'], version, 'Pin matching styles peer');
assert.equal(json('catalog/components.json').packageVersion, version, 'Catalog version drift');
for (const name of ['react', 'styles']) {
  assert.ok(json('examples/highway-vite/package.json').dependencies[`@highway/${name}`].endsWith(`highway-${name}-${version}.tgz`), 'Consumer version drift');
}
assert.ok(read('CHANGELOG.md').includes(`## ${version} —`), 'Missing versioned changelog entry');
const notes = read(`docs/releases/${version}.md`);
for (const heading of ['## Install or upgrade', '## Behavior to review', '## Validation and rollback']) assert.ok(notes.includes(heading), `Missing release notes section: ${heading}`);
assert.ok(notes.includes(`highway-react-${version}.tgz`) && notes.includes(`highway-styles-${version}.tgz`), 'Release notes must install matched artifacts');
console.log(`Release metadata aligned for Highway ${version}; publication remains manual.`);
