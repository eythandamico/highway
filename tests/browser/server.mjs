import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const staticRoot = path.join(projectRoot, "storybook-static");
const contentTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".webp", "image/webp"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
]);

createServer(async (request, response) => {
  try {
    const requestedPath = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    const file = path.resolve(staticRoot, `.${requestedPath === "/" ? "/index.html" : requestedPath}`);
    if (!file.startsWith(`${staticRoot}${path.sep}`)) {
      response.writeHead(403).end();
      return;
    }

    const body = await readFile(file);
    response.writeHead(200, { "Content-Type": contentTypes.get(path.extname(file)) ?? "application/octet-stream" });
    response.end(body);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
}).listen(6010, "127.0.0.1");
