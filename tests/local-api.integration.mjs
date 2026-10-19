import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { createConnection } from "node:net";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("..", import.meta.url));
const port = 5188;
const origin = `http://localhost:${port}`;
const baseURL = `http://127.0.0.1:${port}`;
const persistDir = path.join(root, ".wrangler", "test-state");
const serverConfig = path.join(root, "dist", "server", "wrangler.json");
const firstEmail = "userfixture@example.test";
const secondEmail = "otherfixture@example.test";
let server;
let serverOutput = "";

function run(command, args, extra = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    ...extra,
  });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed:\n${result.stderr || result.stdout}`);
  }
  return result.stdout;
}

function readLocalVars() {
  const varsPath = path.join(root, ".dev.vars");
  if (!existsSync(varsPath)) run(process.execPath, ["scripts/setup.mjs"]);
  const values = Object.fromEntries(readFileSync(varsPath, "utf8").split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line && !line.startsWith("#"))
    .map(line => {
      const separator = line.indexOf("=");
      return separator < 0 ? [line, ""] : [line.slice(0, separator), line.slice(separator + 1)];
    }));
  assert.equal(values.APP_ENV, "development", ".dev.vars must use the local development environment");
  assert.equal(values.SITE_ORIGIN, origin, ".dev.vars must use the reserved local test origin");
  assert.equal(values.AUTH_DELIVERY, "console", "integration tests only accept console OTP delivery");
  assert.ok((values.BETTER_AUTH_SECRET || "").length >= 32, "run npm run setup to create a local auth secret");
}

async function assertPortFree() {
  await new Promise((resolve, reject) => {
    const socket = createConnection({ host: "127.0.0.1", port });
    socket.once("connect", () => {
      socket.destroy();
      reject(new Error(`Port ${port} is already in use; stop that local server before running the API integration test.`));
    });
    socket.once("error", error => error.code === "ECONNREFUSED" ? resolve() : reject(error));
  });
}

function startServer() {
  server = spawn(process.execPath, [
    "node_modules/wrangler/bin/wrangler.js", "dev",
    "--config", serverConfig,
    "--local",
    "--persist-to", persistDir,
    "--ip", "127.0.0.1",
    "--port", String(port),
    "--inspector-port", "0",
  ], { cwd: root, env: { ...process.env, WRANGLER_SEND_METRICS: "false" }, stdio: ["ignore", "pipe", "pipe"] });
  for (const stream of [server.stdout, server.stderr]) {
    stream.setEncoding("utf8");
    stream.on("data", chunk => { serverOutput = (serverOutput + chunk).slice(-12000); });
  }
}

function cleanLog(value) {
  return value.replace(/(\[LOCAL SIGN IN\]\s+[^:\r\n]+:\s*)\d{6}/g, "$1[redacted]");
}

function diagnosticLog() {
  return cleanLog(serverOutput.split(/\r?\n/)
    .filter(line => /\[LOCAL SIGN IN\]|request failed|wrangler:error|exception|error/i.test(line))
    .slice(-30).join("\n"));
}

async function waitForServer() {
  const deadline = Date.now() + 90_000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) throw new Error(`Local Worker stopped during startup:\n${cleanLog(serverOutput)}`);
    try {
      const response = await fetch(baseURL, { redirect: "manual" });
      if (response.status >= 500) {
        const body = await response.text();
        throw new Error(`Local Worker returned ${response.status} for ${baseURL}:\n${body.slice(0, 4000)}\n${cleanLog(serverOutput)}`);
      }
      if (response.status < 500) return;
    } catch (error) {
      if (error instanceof Error && error.message.startsWith("Local Worker returned ")) {
        throw new Error(`${error.message}\n${diagnosticLog()}`);
      }
    }
    await delay(400);
  }
  throw new Error(`Local Worker did not become ready:\n${cleanLog(serverOutput)}`);
}

async function stopServer() {
  if (!server || server.exitCode !== null) return;
  server.kill("SIGTERM");
  await Promise.race([
    new Promise(resolve => server.once("exit", resolve)),
    delay(5000).then(() => server.kill("SIGKILL")),
  ]);
}

class CookieJar {
  cookies = new Map();

  async fetch(pathname, init = {}) {
    const headers = new Headers(init.headers);
    if (this.cookies.size) headers.set("Cookie", [...this.cookies].map(([key, value]) => `${key}=${value}`).join("; "));
    const response = await fetch(new URL(pathname, baseURL), { ...init, headers, redirect: "manual" });
    const setCookies = response.headers.getSetCookie?.() ?? [response.headers.get("set-cookie")].filter(Boolean);
    for (const setCookie of setCookies) {
      const [pair, ...attributes] = setCookie.split(";");
      const separator = pair.indexOf("=");
      if (separator < 1) continue;
      const key = pair.slice(0, separator).trim();
      const value = pair.slice(separator + 1).trim();
      if (!value || attributes.some(attribute => /^\s*max-age=0\s*$/i.test(attribute))) this.cookies.delete(key);
      else this.cookies.set(key, value);
    }
    return response;
  }
}

async function takeJson(response) {
  const text = await response.text();
  let value;
  try { value = text ? JSON.parse(text) : null; } catch { value = text; }
  return value;
}

async function expectStatus(response, expected, description) {
  if (response.status !== expected) {
    throw new assert.AssertionError({
      message: `${description}: ${JSON.stringify(await takeJson(response))}\n${diagnosticLog()}`,
      expected,
      actual: response.status,
    });
  }
}

async function waitForOtp(email) {
  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    const line = serverOutput.split(/\r?\n/).find(value => value.includes(`[LOCAL SIGN IN] ${email}: `));
    const code = line?.match(/: (\d{6})\b/)?.[1];
    if (code) return code;
    if (server.exitCode !== null) break;
    await delay(100);
  }
  throw new Error(`Console OTP was not emitted for ${email}. Server log:\n${cleanLog(serverOutput)}`);
}

async function signIn(email) {
  const jar = new CookieJar();
  const send = await jar.fetch("/api/auth/email-otp/send-verification-otp", {
    method: "POST",
    headers: { Origin: origin, "Content-Type": "application/json" },
    body: JSON.stringify({ email, type: "sign-in" }),
  });
  await expectStatus(send, 200, `OTP request for ${email} should succeed`);
  const otp = await waitForOtp(email);
  const verify = await jar.fetch("/api/auth/sign-in/email-otp", {
    method: "POST",
    headers: { Origin: origin, "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });
  await expectStatus(verify, 200, `OTP verification for ${email} should succeed`);
  const sessionResponse = await jar.fetch("/api/auth/get-session");
  assert.equal(sessionResponse.status, 200);
  const session = await takeJson(sessionResponse);
  assert.equal(session?.user?.email, email);
  assert.ok(session.user.emailVerified, "email OTP sign-in should produce a verified session");
  return { jar, user: session.user };
}

async function seedWorkspaces(firstUserId, secondUserId) {
  const first = `fixture-workspace-${firstUserId}`;
  const second = `fixture-workspace-${secondUserId}`;
  const now = Date.now();
  const quote = value => `'${String(value).replaceAll("'", "''")}'`;
  const sql = [
    `INSERT OR IGNORE INTO workspaces(id,name,created_at) VALUES(${quote(first)},'First fixture',${now}),(${quote(second)},'Second fixture',${now});`,
    `INSERT OR REPLACE INTO memberships(workspace_id,user_id,role) VALUES(${quote(first)},${quote(firstUserId)},'owner'),(${quote(second)},${quote(secondUserId)},'owner');`,
    `INSERT OR REPLACE INTO memberships(workspace_id,user_id,role) VALUES(${quote(second)},${quote(firstUserId)},'viewer');`,
  ].join("\n");
  run(process.execPath, [
    "node_modules/wrangler/bin/wrangler.js", "d1", "execute", "DB",
    "--local", "--persist-to", persistDir, "--config", "wrangler.jsonc", "--command", sql,
  ], { env: { ...process.env, CI: "1", WRANGLER_SEND_METRICS: "false" } });
  return { first, second };
}

async function jsonRequest(jar, pathname, method, body, requestOrigin = origin) {
  return jar.fetch(pathname, {
    method,
    headers: { ...(requestOrigin === null ? {} : { Origin: requestOrigin }), "Content-Type": "application/json" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

async function testAuthAndTenantBoundaries() {
  const first = await signIn(firstEmail);
  const second = await signIn(secondEmail);
  const workspaces = await seedWorkspaces(first.user.id, second.user.id);

  const create = await jsonRequest(first.jar, "/api/records", "POST", {
    workspace: workspaces.first, title: "Private fixture record", body: "owned by first user",
  });
  await expectStatus(create, 201, "owner can create a record");
  const record = await takeJson(create);
  assert.ok(record.id);

  const ownList = await first.jar.fetch(`/api/records?workspace=${encodeURIComponent(workspaces.first)}`);
  assert.equal(ownList.status, 200);
  assert.ok((await takeJson(ownList)).records.some(item => item.id === record.id));

  const foreignList = await second.jar.fetch(`/api/records?workspace=${encodeURIComponent(workspaces.first)}`);
  assert.equal(foreignList.status, 404, "an unshared tenant is not discoverable");
  const viewerList = await first.jar.fetch(`/api/records?workspace=${encodeURIComponent(workspaces.second)}`);
  assert.equal(viewerList.status, 200, "a read-only workspace member can list records");

  const readOnlyWrite = await jsonRequest(first.jar, "/api/records", "POST", {
    workspace: workspaces.second, title: "Must not be created", body: "viewer access is read-only",
  });
  assert.equal(readOnlyWrite.status, 403, "viewer membership cannot create records");

  const deniedNoOrigin = await jsonRequest(first.jar, "/api/records", "POST", {
    workspace: workspaces.first, title: "CSRF without origin", body: "",
  }, null);
  assert.equal(deniedNoOrigin.status, 403, "write requests without Origin are rejected");
  const deniedForeignOrigin = await jsonRequest(first.jar, "/api/records", "POST", {
    workspace: workspaces.first, title: "CSRF foreign origin", body: "",
  }, "https://attacker.example");
  assert.equal(deniedForeignOrigin.status, 403, "write requests from a foreign origin are rejected");

  const updates = await Promise.all([
    jsonRequest(first.jar, "/api/records", "PATCH", { workspace: workspaces.first, id: record.id, revision: 1, status: "archived" }),
    jsonRequest(first.jar, "/api/records", "PATCH", { workspace: workspaces.first, id: record.id, revision: 1, status: "active" }),
  ]);
  assert.deepEqual(updates.map(response => response.status).sort(), [200, 409], "only one concurrent update can win the same revision");
  const stale = await jsonRequest(first.jar, "/api/records", "PATCH", { workspace: workspaces.first, id: record.id, revision: 1, status: "archived" });
  assert.equal(stale.status, 409, "stale revisions return a conflict");

  const active = await first.jar.fetch(`/api/records?workspace=${encodeURIComponent(workspaces.first)}&status=active`);
  const archived = await first.jar.fetch(`/api/records?workspace=${encodeURIComponent(workspaces.first)}&status=archived`);
  const allCurrentRecords = [...(await takeJson(active)).records, ...(await takeJson(archived)).records];
  const updated = allCurrentRecords.find(item => item.id === record.id);
  assert.equal(updated?.revision, 2, "successful update increments the stored revision once");
  assert.ok(["active", "archived"].includes(updated.status));

  return { first, second, workspaces, record };
}

async function testPrivateUploads({ first, second, workspaces }) {
  const bytes = new TextEncoder().encode("private upload fixture\n\u0000bytes");
  const upload = await first.jar.fetch(`/api/files?workspace=${encodeURIComponent(workspaces.first)}&name=fixture%0D%0Asecret.html`, {
    method: "POST",
    headers: { Origin: origin, "Content-Type": "application/octet-stream" },
    body: bytes,
  });
  await expectStatus(upload, 201, "owner can upload a private file");
  const { id } = await takeJson(upload);
  assert.ok(id);

  const downloaded = await first.jar.fetch(`/api/files/${encodeURIComponent(id)}`);
  assert.equal(downloaded.status, 200);
  assert.equal(downloaded.headers.get("content-type"), "application/octet-stream");
  assert.match(downloaded.headers.get("content-disposition") || "", /attachment;/);
  assert.equal(downloaded.headers.get("cache-control"), "private, no-store");
  assert.equal(downloaded.headers.get("x-content-type-options"), "nosniff");
  assert.deepEqual(new Uint8Array(await downloaded.arrayBuffer()), bytes);

  const deniedDownload = await second.jar.fetch(`/api/files/${encodeURIComponent(id)}`);
  assert.equal(deniedDownload.status, 404, "a user without workspace membership cannot download the file");
  const deniedDelete = await second.jar.fetch(`/api/files/${encodeURIComponent(id)}`, {
    method: "DELETE", headers: { Origin: origin },
  });
  assert.equal(deniedDelete.status, 404, "a user without workspace membership cannot delete the file");

  const listed = await first.jar.fetch(`/api/files?workspace=${encodeURIComponent(workspaces.first)}`);
  assert.equal(listed.status, 200);
  const listing = await takeJson(listed);
  assert.ok(listing.files.some(file => file.id === id && file.bytes === bytes.byteLength));
  assert.ok(!listing.files.some(file => /[\r\n]/.test(file.name)), "uploaded filenames strip line breaks");

  const deleted = await first.jar.fetch(`/api/files/${encodeURIComponent(id)}`, {
    method: "DELETE", headers: { Origin: origin },
  });
  assert.equal(deleted.status, 200);
  const missing = await first.jar.fetch(`/api/files/${encodeURIComponent(id)}`);
  assert.equal(missing.status, 404, "deleting the metadata and object removes future downloads");
}

async function main() {
  assert.ok(existsSync(serverConfig), "build the starter before running local API integration tests");
  readLocalVars();
  await assertPortFree();
  rmSync(persistDir, { recursive: true, force: true });
  mkdirSync(path.dirname(persistDir), { recursive: true });

  run(process.execPath, [
    "node_modules/wrangler/bin/wrangler.js", "d1", "migrations", "apply", "DB",
    "--local", "--persist-to", persistDir, "--config", "wrangler.jsonc",
  ], { env: { ...process.env, CI: "1", WRANGLER_SEND_METRICS: "false" } });

  startServer();
  await waitForServer();
  const identities = await testAuthAndTenantBoundaries();
  await testPrivateUploads(identities);
  console.log("Local API integration passed: email OTP, tenant access, read-only roles, CSRF, concurrent revision conflicts, and private uploads.");
}

try {
  await main();
} catch (error) {
  if (server && server.exitCode === null) {
    try {
      const response = await fetch("http://127.0.0.1:5188/cdn-cgi/local/explorer/api/local/observability/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sql: "SELECT * FROM logs ORDER BY ts_ms DESC LIMIT 20" }),
      });
      const logs = await response.text();
      if (logs) error.message += `\nRecent local Worker logs: ${cleanLog(logs)}`;
    } catch {}
  }
  if (error instanceof Error && error.message && error.stack) error.stack += `\n${error.message}`;
  throw error;
} finally {
  await stopServer();
}
