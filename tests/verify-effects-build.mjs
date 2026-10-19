import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";

const cssDirectory = "dist/client/_next/static/css";
const cssFiles = readdirSync(cssDirectory).filter((file) => file.endsWith(".css"));
assert.ok(cssFiles.length, `No production CSS files found under ${cssDirectory}; build first`);

const css = cssFiles.map((file) => readFileSync(`${cssDirectory}/${file}`, "utf8")).join("\n");
const rules = css.match(/[^{}]+\{[^{}]*\}/g) ?? [];

function declarations(rule) {
  const body = rule.slice(rule.indexOf("{") + 1, rule.lastIndexOf("}"));
  return new Map(body.split(";").flatMap((declaration) => {
    const separator = declaration.indexOf(":");
    if (separator < 0) return [];
    return [[declaration.slice(0, separator).trim().toLowerCase(), declaration.slice(separator + 1).trim()]];
  }));
}

function withoutImportant(value) {
  return value?.replace(/\s*!important\s*$/i, "").trim();
}

function hasSelector(selector, predicate = () => true) {
  return rules.some((rule) => {
    const brace = rule.indexOf("{");
    return rule.slice(0, brace).includes(selector) && predicate(declarations(rule));
  });
}

const backdropRules = rules.filter((rule) => declarations(rule).has("-webkit-backdrop-filter"));
assert.ok(backdropRules.length >= 5, "Expected production blur declarations for progressive layers and glass controls");
for (const rule of backdropRules) {
  const values = declarations(rule);
  assert.equal(
    withoutImportant(values.get("backdrop-filter")),
    withoutImportant(values.get("-webkit-backdrop-filter")),
    `Production CSS lost or changed standard backdrop-filter parity: ${rule}`,
  );
}

const maskRules = rules.filter((rule) => declarations(rule).has("-webkit-mask-image"));
assert.ok(maskRules.length >= 8, "Expected three masked blur layers across header, rail and panel recipes");
for (const rule of maskRules) {
  const values = declarations(rule);
  assert.equal(
    withoutImportant(values.get("mask-image")),
    withoutImportant(values.get("-webkit-mask-image")),
    `Production CSS lost or changed standard mask-image parity: ${rule}`,
  );
}

for (const selector of ["span:first-child", "span:nth-child(2)", "span:nth-child(3)"]) {
  assert.ok(
    hasSelector(`.fx-progressive>${selector}`, (values) => values.has("-webkit-backdrop-filter") && values.has("-webkit-mask-image")),
    `Missing masked blur declarations for progressive layer ${selector}`,
  );
}

assert.ok(
  hasSelector(".fx-progressive", (values) => values.get("--fx-direction") === "to bottom"),
  "Missing default top-edge direction",
);
for (const [edge, direction] of Object.entries({ bottom: "to top", left: "to right", right: "to left" })) {
  assert.ok(
    hasSelector(`.fx-progressive[data-edge=${edge}]`, (values) => values.get("--fx-direction") === direction),
    `Missing ${direction} gradient direction for ${edge} edge`,
  );
}

for (const [name, value] of [["blur-low", "4px"], ["blur-mid", "10px"], ["blur-high", "20px"], ["panel-low", "2px"], ["panel-mid", "6px"], ["panel-high", "12px"]]) {
  assert.ok(css.includes(`--fx-${name}:${value}`), `Missing ${name} blur token (${value})`);
}

for (const gradient of ["onboarding", "profile", "upload", "stage"]) {
  assert.ok(css.includes(`.fx-gradient-surface[data-gradient=${gradient}]`), `Missing ${gradient} surface gradient`);
}

for (const selector of [".fx-progressive", ".fx-progressive>span", ".fx-edge-fade", ".fx-media-scrim"]) {
  assert.ok(
    hasSelector(selector, (values) => values.get("pointer-events") === "none"),
    `Decorative layer ${selector} must not intercept pointer input`,
  );
}

assert.ok(css.includes("@supports not"), "Missing unsupported-backdrop-filter fallback");
assert.ok(css.includes(".fx-progressive:after{background:var(--surface)"), "Missing opaque progressive-blur fallback");
assert.ok(css.includes("prefers-reduced-transparency:reduce"), "Missing reduced-transparency treatment");
assert.ok(css.includes("backdrop-filter:none!important"), "Reduced transparency must disable backdrop blur");
assert.ok(css.includes("prefers-reduced-motion:reduce"), "Missing reduced-motion treatment");
assert.ok(css.includes(".fx-hover-detail{transition:none}"), "Reduced motion must remove hover-detail transitions");
assert.ok(
  hasSelector(".state-icon>span", (values) => values.get("transition") === "none" && values.get("filter") === "none"),
  "Reduced motion must remove StateIcon transitions",
);

console.log(`PASS ${cssFiles.length} production CSS file(s): ${backdropRules.length} blur rules, ${maskRules.length} masked layers, directions, gradients, fallbacks and reduced-motion rules verified`);
