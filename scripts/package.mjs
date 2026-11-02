import { readdirSync, readFileSync, statSync, writeFileSync, mkdirSync, mkdtempSync, cpSync, rmSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve, join, relative } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
const root=process.cwd();
const directories=["apps","examples","catalog","app","components","config","db","hooks","lib","packages","migrations","public","scripts","stories","tests","vendor","worker","docs",".storybook",".github"];
const roots=["package.json","package-lock.json","tsconfig.json","next-env.d.ts","next.config.ts","vite.config.ts","postcss.config.mjs","eslint.config.mjs","wrangler.jsonc","cloudflare-env.d.ts","README.md","CHANGELOG.md","AGENTS.md","NOTICE.md",".gitignore",".dev.vars.example",".impeccable.md","playwright.design.config.ts","playwright.components.config.ts","playwright.package.config.ts"];
const paths=[];
function walk(path){for(const entry of readdirSync(path,{withFileTypes:true})){if(entry.isSymbolicLink())throw new Error(`Refusing symlink ${entry.name}`);const full=join(path,entry.name);if(entry.isDirectory()){if(["node_modules","dist",".next",".vinext",".wrangler",".git","artifacts","test-results","playwright-report"].includes(entry.name))continue;walk(full);}else if(entry.isFile())paths.push(relative(root,full));}}
for(const dir of directories){try{walk(join(root,dir));}catch(e){if(e.code!=="ENOENT")throw e;}}
for(const file of roots){try{if(statSync(join(root,file)).isFile())paths.push(file);}catch(e){if(e.code!=="ENOENT")throw e;}}
for(const path of paths){if(/(^|\/)(node_modules|\.git|\.wrangler|artifacts|dist)(\/|$)/.test(path)||(/(^|\/)\.(env|dev\.vars)/.test(path)&&path!==".dev.vars.example"))throw new Error(`Refusing private/generated path: ${path}`);}
const manifest={createdAt:new Date().toISOString(),files:paths.sort().map(path=>{const data=readFileSync(join(root,path));return {path,bytes:data.length,sha256:createHash("sha256").update(data).digest("hex")};})};
writeFileSync("PACKAGE-MANIFEST.json",JSON.stringify(manifest,null,2)+"\n");
const temp=mkdtempSync(join(tmpdir(),"highway-package-")),folder=join(temp,"highway");mkdirSync(folder);
try{for(const path of paths){const target=join(folder,path);mkdirSync(resolve(target,".."),{recursive:true});cpSync(join(root,path),target);}cpSync("PACKAGE-MANIFEST.json",join(folder,"PACKAGE-MANIFEST.json"));mkdirSync("artifacts",{recursive:true});const output=resolve("artifacts/highway.zip");rmSync(output,{force:true});const result=spawnSync("zip",["-q","-r",output,"highway"],{cwd:temp,stdio:"inherit"});if(result.status!==0)throw new Error("ZIP creation failed; install zip or archive the allowlisted folder manually.");console.log(output);}finally{rmSync(temp,{recursive:true,force:true});}
