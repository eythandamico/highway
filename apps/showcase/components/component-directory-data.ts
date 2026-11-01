import { entries } from '../previews/examples';
import documentedExamples from '../previews/metadata.json';
import catalog from '../../../catalog/components.json';
export const allEntries = [...entries, ...documentedExamples.filter(entry => !['inv-button', 'inv-toggle', 'inv-icon-button'].includes(entry.id))];
export const componentFamilies = catalog.families;
export function familyFor(id: string) { return componentFamilies.find(family => family.variants.some(variant => variant.id === id)); }
export function pageFor(id: string) { return catalog.pages.find(page => page.examples.includes(id)); }
export const familyEntries = catalog.pages.flatMap(page => {
  const entry = allEntries.find(item => item.id === page.id);
  const family = componentFamilies.find(item => item.id === page.family);
  return entry ? [{ ...entry, name: page.title, searchText: family?.variants.filter(item => page.examples.includes(item.id)).map(item => [item.label, ...item.exports, ...item.compatibility].join(" ")).join(" ") ?? "" }] : [];
}).sort((a,b) => a.group.localeCompare(b.group) || a.name.localeCompare(b.name));
