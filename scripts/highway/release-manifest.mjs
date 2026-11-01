import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
const root = resolve(import.meta.dirname, '../..');
const version = JSON.parse(readFileSync(resolve(root, 'packages/highway-react/package.json'))).version;
const files = ['styles', 'react'].map(name => {
  const filename = `highway-${name}-${version}.tgz`;
  const bytes = readFileSync(resolve(root, 'artifacts', filename));
  return { filename, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') };
});
const manifest = { version, status: 'local-candidate', releaseNotes: `docs/releases/${version}.md`, files };
const output = resolve(root, 'artifacts', `highway-${version}-manifest.json`);
writeFileSync(output, JSON.stringify(manifest, null, 2) + '\n');
console.log(output);
