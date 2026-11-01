import { build } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync, readdirSync, existsSync } from 'node:fs';
import { resolve, join, dirname, relative } from 'node:path';
import { spawnSync } from 'node:child_process';
const root = resolve(import.meta.dirname, '../..');
const output = join(root,'artifacts/highway-plugins');
const metadata = JSON.parse(readFileSync(join(root,'plugins/highway/package.json')));
const snapshot = JSON.parse(readFileSync(join(root,'packages/highway-mcp/data/snapshot.json')));
const ui = JSON.parse(readFileSync(join(root,'packages/highway-react/package.json')));
if (snapshot.packageVersion !== ui.version) throw new Error('Build matching MCP/UI packages first.');
const write = (path, data) => { mkdirSync(dirname(path),{recursive:true}); writeFileSync(path,typeof data === 'string' ? data : JSON.stringify(data,null,2)+'\n'); };
rmSync(output,{recursive:true,force:true});
mkdirSync(join(root,'public/downloads'),{recursive:true});
for (const client of ['codex','claude']) {
  const market = join(output,client);
  const plugin = join(market,'plugins/highway');
  mkdirSync(plugin,{recursive:true});
  cpSync(join(root,'skills/highway'),join(plugin,'skills/highway'),{recursive:true});
  cpSync(join(root,'packages/highway-mcp/data'),join(plugin,'server/data'),{recursive:true});
  cpSync(join(root,'packages/highway-mcp/package.json'),join(plugin,'server/package.json'));
  const result = await build({entryPoints:[join(root,'packages/highway-mcp/src/server.mjs')],outfile:join(plugin,'server/src/server.mjs'),bundle:true,platform:'node',format:'esm',target:'node22',metafile:true,banner:{js:"import { createRequire as highwayCreateRequire } from 'node:module'; const require = highwayCreateRequire(import.meta.url);"}});
  // Preserve notices for bundled third-party modules, without shipping node_modules.
  const packages = new Set();
  for (const input of Object.keys(result.metafile.inputs)) {
    let folder = dirname(resolve(root,input));
    while (folder !== dirname(folder) && folder.includes('node_modules')) {
      if (existsSync(join(folder,'package.json')) && JSON.parse(readFileSync(join(folder,'package.json'))).name) { packages.add(folder); break; }
      folder = dirname(folder);
    }
  }
  for (const folder of packages) {
    const pkg = JSON.parse(readFileSync(join(folder,'package.json')));
    const dest = join(plugin,'notices',pkg.name.replaceAll('/','__'));
    mkdirSync(dest,{recursive:true});
    for (const file of readdirSync(folder)) if (/^(license|licence|notice)(\.|$)/i.test(file)) cpSync(join(folder,file),join(dest,file),{recursive:true});
    write(join(dest,'package.json'),{name:pkg.name,version:pkg.version,license:pkg.license});
  }
  write(join(plugin,'assets/icon.svg'),'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#191919"/><path d="M20 17v30m24-30v30M20 32h24" fill="none" stroke="#fff" stroke-width="6"/></svg>');
  const manifest = {name:'highway',version:metadata.version,description:metadata.description,author:{name:'Highway'},homepage:'https://github.com/eythandamico/highway',skills:'./skills/',mcpServers:'./.mcp.json'};
  if (client === 'codex') {
    write(join(plugin,'.codex-plugin/plugin.json'),{...manifest,requires_local_executor:true,interface:{displayName:'Highway',shortDescription:'Build with Highway',longDescription:'Design guidance and exact Highway component APIs. Local read-only MCP; requires Node 22.13+. UI packages are installed separately in your app.',developerName:'Highway',category:'Developer Tools',capabilities:['Read'],composerIcon:'./assets/icon.svg',logo:'./assets/icon.svg',defaultPrompt:['Use Highway to build or improve one screen. Read the exact component APIs before editing.']}});
    write(join(plugin,'.mcp.json'),{mcpServers:{highway:{command:'node',args:['./server/src/server.mjs'],cwd:'.'}}});
    write(join(market,'.agents/plugins/marketplace.json'),{name:'highway-local',interface:{displayName:'Highway'},plugins:[{name:'highway',source:{source:'local',path:'./plugins/highway'},policy:{installation:'AVAILABLE',authentication:'ON_INSTALL'},category:'Developer Tools'}]});
  } else {
    write(join(plugin,'.claude-plugin/plugin.json'),manifest);
    write(join(plugin,'.mcp.json'),{mcpServers:{highway:{command:'node',args:['${CLAUDE_PLUGIN_ROOT}/server/src/server.mjs']}}});
    write(join(market,'.claude-plugin/marketplace.json'),{name:'highway-local',description:'Highway design skill and component MCP',owner:{name:'Highway'},plugins:[{name:'highway',source:'./plugins/highway',description:metadata.description}]});
  }
  write(join(plugin,'README.md'),`# Highway ${metadata.version}\n\nIncludes the Highway skill and read-only MCP snapshot for UI ${ui.version}. Requires Node 22.13+ on PATH. No credentials, install hooks, or network calls by the MCP server.\n\nOpen your app with this plugin enabled. Ask the agent to use Highway MCP to inspect AskBar and report its import and snapshot version. Then describe the screen to build or improve. UI packages are a separate project dependency; ask the agent to call get_installation and install the returned public GitHub Release URLs.\n\nBundled dependency notices are in notices/. Highway package source remains subject to its own distribution terms.\n\nThis local plugin has not been submitted to a public directory. It is not a ChatGPT web connector.\n`);
  write(join(market,'INSTALL.md'),`# Install Highway for ${client}\n\nRequires Node 22.13+ on PATH and a current ${client === 'codex' ? 'Codex' : 'Claude Code'} client with plugin support. Run from this directory:\n\n\`\`\`sh\n${client === 'codex' ? 'codex plugin marketplace add .\ncodex plugin add highway@highway-local' : 'claude plugin marketplace add .\nclaude plugin install highway@highway-local'}\n\`\`\`\n\nEnable the plugin and its MCP connection through your client. Restart the session if necessary. Do not also enable a standalone Highway MCP or skill copy in the same project; choose one connection to avoid duplicates.\n\nThe marketplace directory must remain available for updates. For another machine, copy this entire directory; all plugin assets and MCP dependencies are bundled. The consumer needs Node, not the Highway source checkout.\n`);
  const zip = join(root,`artifacts/highway-${client}-plugin-${metadata.version}.zip`);
  rmSync(zip,{force:true});
  const archived=spawnSync('zip',['-qr',zip,'.'],{cwd:market,stdio:'inherit'});
  if (archived.status !== 0) throw new Error(`Could not archive ${client}`);
  cpSync(zip,join(root,`public/downloads/highway-${client}-plugin.zip`));
  console.log(`${client}: ${relative(root,market)} and ${relative(root,zip)}`);
}
