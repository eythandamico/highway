import assert from "node:assert/strict";
import { test } from "node:test";
import { createDemoWorkspace } from "../lib/demo-workspace.ts";

test("demo workspaces isolate record state and keep file URLs local", async () => {
  const originalFetch = globalThis.fetch;
  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevokeObjectURL = URL.revokeObjectURL;
  const createdUrls = [];
  const revokedUrls = [];
  globalThis.fetch = async () => { throw new Error("Demo must not make network requests."); };
  URL.createObjectURL = blob => {
    const url = originalCreateObjectURL.call(URL, blob);
    createdUrls.push(url);
    return url;
  };
  URL.revokeObjectURL = url => {
    revokedUrls.push(url);
    originalRevokeObjectURL.call(URL, url);
  };

  const first = createDemoWorkspace();
  const second = createDemoWorkspace();
  const call = async (workspace, path, options = {}) => workspace.request(path, options);

  try {
    assert.equal(first.initial.records.length, 5);
    assert.equal(first.initial.total, 5);
    assert.equal(second.initial.records.length, 5);

    const createResult = await call(first, "/records", {
      method: "POST",
      body: JSON.stringify({ title: "  Demo roadmap  ", body: "Try the isolated workspace." }),
    });
    assert.ok(createResult.id);
    let active = await call(first, "/records?status=active");
    assert.equal(active.total, 6);
    assert.equal(active.records[0].title, "Demo roadmap");
    assert.equal((await call(first, "/records?q=ROADMAP")).total, 1, "search is case-insensitive");
    assert.equal((await call(second, "/records?q=ROADMAP")).total, 0, "records do not leak between instances");

    await call(first, "/records", {
      method: "PATCH",
      body: JSON.stringify({ id: createResult.id, revision: 1, status: "archived" }),
    });
    assert.equal((await call(first, "/records?q=roadmap")).total, 0);
    let archived = await call(first, "/records?q=roadmap&status=archived");
    assert.equal(archived.total, 1);
    assert.equal(archived.records[0].revision, 2);

    await call(first, "/records", {
      method: "PATCH",
      body: JSON.stringify({ id: createResult.id, revision: 2, status: "active" }),
    });
    active = await call(first, "/records?q=roadmap");
    assert.equal(active.total, 1, "archived records can be restored");
    assert.equal(active.records[0].revision, 3);

    for (let index = 0; index < 22; index++) {
      await call(first, "/records", {
        method: "POST",
        body: JSON.stringify({ title: `Page fixture ${index}`, body: "Pagination fixture." }),
      });
    }
    const pageOne = await call(first, "/records?page=1");
    const pageTwo = await call(first, "/records?page=2");
    assert.equal(pageOne.page, 1);
    assert.equal(pageOne.records.length, 20);
    assert.equal(pageTwo.page, 2);
    assert.equal(pageTwo.records.length, 8);
    assert.equal(pageTwo.total, 28);

    const resetInstance = createDemoWorkspace();
    assert.equal((await call(resetInstance, "/records?q=roadmap")).total, 0, "a fresh instance resets demo state");
    assert.equal((await call(first, "/records?q=roadmap")).total, 1, "resetting one instance leaves another intact");
    resetInstance.dispose();

    const initialFiles = await call(first, "/files");
    assert.equal(initialFiles.files.length, 1);
    const sampleHref = first.fileHref(initialFiles.files[0].id);
    assert.match(sampleHref, /^data:text\/plain;charset=utf-8,/);
    assert.equal(decodeURIComponent(sampleHref.split(",")[1]).includes("sample attachment"), true);

    const fileOne = await call(first, "/files?name=first.txt", {
      method: "POST",
      body: new Blob(["first demo file"], { type: "text/plain" }),
    });
    const fileTwo = await call(first, "/files?name=second.txt", {
      method: "POST",
      body: new Blob(["second demo file"], { type: "text/plain" }),
    });
    const firstHref = first.fileHref(fileOne.id);
    const secondHref = first.fileHref(fileTwo.id);
    assert.match(firstHref, /^blob:/);
    assert.match(secondHref, /^blob:/);
    assert.deepEqual(createdUrls, [firstHref, secondHref]);
    assert.equal((await call(first, "/files")).files.some(file => "href" in file), false, "file hrefs stay in the adapter");

    await call(first, `/files/${fileOne.id}`, { method: "DELETE" });
    assert.deepEqual(revokedUrls, [firstHref], "deleting an uploaded file revokes its object URL");
    assert.equal(first.fileHref(fileOne.id), "#");
    first.dispose();
    assert.deepEqual(revokedUrls, [firstHref, secondHref], "dispose revokes remaining object URLs");
    assert.equal(first.fileHref(fileTwo.id), secondHref, "dispose cleans up URLs without deleting demo file metadata");
    assert.equal((await call(second, "/files")).files.length, 1, "file state is isolated between instances");
    assert.equal(createdUrls.length, 2);
  } finally {
    first.dispose();
    globalThis.fetch = originalFetch;
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
    for (const url of createdUrls) if (!revokedUrls.includes(url)) originalRevokeObjectURL.call(URL, url);
  }
});
