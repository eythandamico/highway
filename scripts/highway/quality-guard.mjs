import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../../', import.meta.url));
const rules = [
  ['transition-all', /\btransition-all\b|transition\s*:\s*['"]?all\b/g],
  ['literal-motion', /\b\d*\.?\d+(?:ms|s)\s+(?:cubic-bezier|ease(?:-in|-out|-in-out)?|linear)\b/g],
  ['literal-color', /#[0-9a-fA-F]{6}\b/g],
  ['heavy-weight', /\bfont-(?:bold|extrabold|black)\b|fontWeight\s*:\s*[789]00/g],
];
function scan(directory) {
  return readdirSync(path.join(root, directory), { withFileTypes: true }).flatMap(item => item.isDirectory() ? scan(`${directory}/${item.name}`) : /\.[jt]sx?$/.test(item.name) ? [`${directory}/${item.name}`] : []);
}
export function findings() {
  const output = [];
  for (const file of scan('packages/highway-react/src')) {
    const source = readFileSync(path.join(root, file), 'utf8');
    for (const [rule, pattern] of rules) {
      const counts = new Map();
      for (const match of source.matchAll(pattern)) counts.set(match[0], (counts.get(match[0]) ?? 0) + 1);
      for (const [match, count] of counts) output.push({ file, rule, match, count });
    }
    if (/(?:from\s*|import\s*\()['"](?:@\/|[^'"]*(?:apps\/|examples\/|worker\/|lib\/yardwork))/.test(source)) output.push({ file, rule: 'package-boundary', match: 'application import', count: 1 });
  }
  return output;
}
export function checkQuality() {
  const exceptions = JSON.parse(readFileSync(path.join(root, 'catalog/quality-exceptions.json'), 'utf8'));
  const current = findings();
  const key = item => JSON.stringify([item.file, item.rule, item.match]);
  const failures = [];
  for (const item of current) {
    const exception = exceptions.find(value => key(value) === key(item));
    if (!exception || exception.count < item.count || !exception.reason || exception.reason.length < 20 || item.rule === 'package-boundary') failures.push(`${item.file}: ${item.rule}: ${item.match}`);
  }
  for (const exception of exceptions) if (!current.some(item => key(item) === key(exception))) failures.push(`Remove resolved exception: ${exception.file}: ${exception.rule}: ${exception.match}`);
  if (failures.length) throw new Error(`Quality guard failed:\n${failures.join('\n')}`);
  console.log(`Quality guard passed; ${exceptions.length} precisely inventoried inherited style exceptions. New occurrences are blocked.`);
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) checkQuality();
