import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { test } from "node:test";
import ts from "typescript";
import { fieldApi } from "../components/yardwork/field-api.ts";
import { demoSuite } from "../lib/yardwork/demo-suite.ts";
import { exampleMapStops } from "../lib/yardwork/route-map.ts";
import { applyAction } from "../lib/yardwork/yardwork.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function loadDemoProvider() {
  const source = await readFile(path.join(root, "components/yardwork/context.tsx"), "utf8");
  let output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText;
  output = output
    .replace('import { toast } from "sonner";', 'const toast = { success() {}, error() {} };')
    .replaceAll('"@/lib/ui/action-feedback"', JSON.stringify(pathToFileURL(path.join(root, "lib/ui/action-feedback.ts")).href))
    .replaceAll('"@/lib/yardwork/yardwork"', JSON.stringify(pathToFileURL(path.join(root, "lib/yardwork/yardwork.ts")).href));

  const directory = await mkdtemp(path.join(root, "tests", ".office-provider-test-"));
  const modulePath = path.join(directory, "context.mjs");
  try {
    await writeFile(modulePath, output);
    return await import(pathToFileURL(modulePath).href);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

function descendants(rootNode, predicate) {
  const matches = [];
  const visit = (node) => {
    if (predicate(node)) matches.push(node);
    node.forEachChild(visit);
  };
  visit(rootNode);
  return matches;
}

test("demo provider and field API stay offline while demo mutations stay isolated", async () => {
  const originalFetch = globalThis.fetch;
  let fetchCalls = 0;
  globalThis.fetch = async () => {
    fetchCalls++;
    throw new Error("Demo code must not issue network requests.");
  };

  try {
    const { OfficeProvider, useOffice } = await loadDemoProvider();
    const providerState = demoSuite();
    const siblingState = demoSuite();
    const firstScheduled = providerState.jobs.find((job) => job.status === "scheduled");
    assert.ok(firstScheduled, "fixture contains a scheduled job");

    let office;
    function Probe() {
      office = useOffice();
      return createElement("span", null, "provider captured");
    }
    renderToStaticMarkup(createElement(
      OfficeProvider,
      { initial: { state: providerState, revision: 0 }, initialNow: "2026-10-20T12:00:00.000Z", demo: true },
      createElement(Probe),
    ));

    assert.equal(office.demo, true);
    await assert.rejects(office.request("/api/integrations"), /standalone demo/);
    await assert.rejects(fieldApi("/api/field/jobs", "PUT", { status: "complete" }), /unavailable in this demo/);
    await office.refresh();

    const providerNext = await office.mutate("start", { id: firstScheduled.id });
    assert.equal(providerNext.jobs.find((job) => job.id === firstScheduled.id).status, "in-progress");
    assert.equal(providerState.jobs.find((job) => job.id === firstScheduled.id).status, "scheduled", "provider mutation does not alter its input fixture");
    assert.equal(siblingState.jobs.find((job) => job.id === firstScheduled.id).status, "scheduled", "separate demo fixtures remain unchanged");

    const reducerNext = applyAction(siblingState, "start", { id: firstScheduled.id }, new Date("2026-10-20T12:00:00.000Z"), true);
    assert.equal(reducerNext.jobs.find((job) => job.id === firstScheduled.id).status, "in-progress");
    assert.equal(siblingState.jobs.find((job) => job.id === firstScheduled.id).status, "scheduled", "applyAction returns an isolated state copy");
    assert.equal(fetchCalls, 0, "requests, field calls, and reducer actions do not use fetch");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("demo route maps use fixed synthetic pins instead of geocoding addresses", async () => {
  const state = demoSuite();
  const stops = state.jobs.map((job, index) => ({
    id: job.id,
    number: index + 1,
    name: job.service,
    address: state.customers.find((customer) => customer.id === job.customerId)?.address || "",
    time: job.time,
    status: job.status,
  }));
  const expectedPins = new Map([
    ["27 Woodbine Avenue, Toronto", { lat: 43.6687, lng: -79.3054 }],
    ["42 Oak Street, Toronto", { lat: 43.6616, lng: -79.3655 }],
    ["65 Queen Street East, Toronto", { lat: 43.6539, lng: -79.3745 }],
    ["118 Kingston Road, Toronto", { lat: 43.6699, lng: -79.3093 }],
    ["89 Danforth Avenue, Toronto", { lat: 43.6769, lng: -79.3575 }],
    ["14 Logan Avenue, Toronto", { lat: 43.6544, lng: -79.3395 }],
  ]);
  const mapped = exampleMapStops(stops);
  const mappedKnownAddresses = new Set(mapped.filter((stop) => stop.point).map((stop) => stop.address));
  assert.ok(mappedKnownAddresses.size > 0, "demo fixture includes sample pins");
  for (const stop of mapped) {
    if (expectedPins.has(stop.address)) assert.deepEqual(stop.point, expectedPins.get(stop.address));
    else assert.equal(stop.point, undefined, "unknown and user-provided addresses receive no map point");
  }
  assert.equal(exampleMapStops([{ id: "custom", number: 1, name: "Custom", address: "99 User Home Street, Toronto", time: "12:00", status: "scheduled" }])[0].point, undefined);

  const routeMapSource = await readFile(path.join(root, "components/yardwork/route-map.tsx"), "utf8");
  const routeMap = ts.createSourceFile("route-map.tsx", routeMapSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const mappedDeclaration = descendants(routeMap, (node) => ts.isVariableDeclaration(node) && node.name.getText(routeMap) === "mapped" && !!node.initializer)[0];
  assert.ok(mappedDeclaration && ts.isConditionalExpression(mappedDeclaration.initializer), "route map selects points from a demo condition");
  assert.equal(mappedDeclaration.initializer.condition.getText(routeMap), "demo");
  assert.match(mappedDeclaration.initializer.whenTrue.getText(routeMap), /exampleMapStops\(stops\)/);
  assert.match(mappedDeclaration.initializer.whenFalse.getText(routeMap), /mapJson\(/, "live geocoding stays in the non-demo branch");
});

test("demo chat photo upload remains guarded by demo mode", async () => {
  const askSource = await readFile(path.join(root, "components/yardwork/ask.tsx"), "utf8");
  const ask = ts.createSourceFile("ask.tsx", askSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const send = descendants(ask, (node) => ts.isFunctionDeclaration(node) && node.name?.text === "send")[0];
  assert.ok(send, "chat send handler exists");
  const fetchCalls = descendants(send, (node) => ts.isCallExpression(node) && node.expression.getText(ask) === "fetch");
  assert.equal(fetchCalls.length, 1);

  let guarded = false;
  for (let ancestor = fetchCalls[0].parent; ancestor && ancestor !== send; ancestor = ancestor.parent) {
    if (ts.isIfStatement(ancestor) && /photo\s*&&\s*!demo/.test(ancestor.expression.getText(ask))) {
      guarded = true;
      break;
    }
  }
  assert.ok(guarded, "the photo PUT is nested under the photo && !demo guard");
  assert.match(fetchCalls[0].arguments[0].getText(ask), /\/api\/chat-photos\//);
});
