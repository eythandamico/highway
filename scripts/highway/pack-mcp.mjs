import { mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const artifacts = fileURLToPath(new URL('../../artifacts/', import.meta.url));
mkdirSync(artifacts, { recursive: true });
const packed = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['pack', './packages/highway-mcp', '--pack-destination', artifacts], { cwd: root, stdio: 'inherit' });
if (packed.error) throw packed.error;
process.exitCode = packed.status ?? 1;
