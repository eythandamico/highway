import { mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../../", import.meta.url));
mkdirSync(new URL("../../artifacts/", import.meta.url), { recursive: true });
for (const name of ["highway-styles", "highway-react"]) {
  execFileSync("npm", ["pack", `./packages/${name}`, "--pack-destination", "./artifacts", "--ignore-scripts"], { cwd: root, stdio: "inherit" });
}
