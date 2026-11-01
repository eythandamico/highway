import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tokenPath = path.join(root, "packages/highway-styles/src/tokens.css");

function parseBlocks(source) {
  const css = source.replace(/\/\*[\s\S]*?\*\//g, "");
  return [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((match) => ({
    selector: match[1].trim(),
    body: match[2],
  }));
}

function readVariables(blocks, selectorMatches) {
  const variables = new Map();
  for (const { selector, body } of blocks) {
    if (!selectorMatches(selector)) continue;
    for (const declaration of body.split(";")) {
      const colon = declaration.indexOf(":");
      if (colon < 0) continue;
      const name = declaration.slice(0, colon).trim();
      if (name.startsWith("--")) variables.set(name, declaration.slice(colon + 1).trim());
    }
  }
  return variables;
}

function splitTopLevelComma(value) {
  let depth = 0;
  for (let index = 0; index < value.length; index += 1) {
    if (value[index] === "(") depth += 1;
    else if (value[index] === ")") depth -= 1;
    else if (value[index] === "," && depth === 0) {
      return [value.slice(0, index).trim(), value.slice(index + 1).trim()];
    }
  }
  return [value.trim(), undefined];
}

function expandVariables(value, variables, stack = []) {
  let result = "";
  for (let index = 0; index < value.length;) {
    const start = value.indexOf("var(", index);
    if (start < 0) return result + value.slice(index).trim();
    result += value.slice(index, start);
    let depth = 1;
    let end = start + 4;
    for (; end < value.length && depth > 0; end += 1) {
      if (value[end] === "(") depth += 1;
      else if (value[end] === ")") depth -= 1;
    }
    assert.equal(depth, 0, `unclosed var() in ${value}`);
    const [name, fallback] = splitTopLevelComma(value.slice(start + 4, end - 1));
    assert.match(name, /^--[\w-]+$/, `invalid custom property reference var(${name})`);
    assert.ok(!stack.includes(name), `cyclic token alias: ${[...stack, name].join(" -> ")}`);
    const referenced = variables.get(name);
    assert.ok(referenced !== undefined || fallback !== undefined, `unresolved token ${name}`);
    result += expandVariables(referenced ?? fallback, variables, [...stack, name]);
    index = end;
  }
  return result.trim();
}

function parseColor(value, tokenName) {
  const normalized = value.trim().toLowerCase();
  const hex = normalized.match(/^#([\da-f]{3}|[\da-f]{6})$/i)?.[1];
  if (hex) {
    const full = hex.length === 3 ? [...hex].map((digit) => digit + digit).join("") : hex;
    return [0, 2, 4].map((offset) => Number.parseInt(full.slice(offset, offset + 2), 16));
  }

  const rgb = normalized.match(/^rgba?\(\s*(\d+(?:\.\d+)?)\s*[, ]\s*(\d+(?:\.\d+)?)\s*[, ]\s*(\d+(?:\.\d+)?)\s*(?:[,/]\s*(?:1(?:\.0+)?|100%))?\s*\)$/);
  if (rgb) return rgb.slice(1, 4).map(Number);

  const oklch = normalized.match(/^oklch\(\s*(\d*\.?\d+)(%)?\s+(\d*\.?\d+)\s+(-?\d*\.?\d+)(?:\s*\/\s*(?:1(?:\.0+)?|100%))?\s*\)$/);
  if (oklch) {
    const lightness = Number(oklch[1]) / (oklch[2] ? 100 : 1);
    const chroma = Number(oklch[3]);
    const hue = Number(oklch[4]) * Math.PI / 180;
    const a = chroma * Math.cos(hue);
    const b = chroma * Math.sin(hue);
    const lRoot = lightness + 0.3963377774 * a + 0.2158037573 * b;
    const mRoot = lightness - 0.1055613458 * a - 0.0638541728 * b;
    const sRoot = lightness - 0.0894841775 * a - 1.2914855480 * b;
    const l = lRoot ** 3;
    const m = mRoot ** 3;
    const s = sRoot ** 3;
    const linearRgb = [
      4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
      -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
      -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
    ];
    return linearRgb.map((channel) => {
      const clipped = Math.max(0, Math.min(1, channel));
      const srgb = clipped <= 0.0031308 ? clipped * 12.92 : 1.055 * clipped ** (1 / 2.4) - 0.055;
      return srgb * 255;
    });
  }

  assert.fail(`${tokenName} must resolve to a solid hex, rgb, or oklch color, got ${JSON.stringify(value)}`);
}

function relativeLuminance([red, green, blue]) {
  const linear = [red, green, blue].map((channel) => {
    const srgb = channel / 255;
    return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrast(first, second) {
  const luminances = [relativeLuminance(first), relativeLuminance(second)].sort((a, b) => b - a);
  return (luminances[0] + 0.05) / (luminances[1] + 0.05);
}

test("shared color token pairs meet contrast in light and dark themes", async () => {
  const css = await readFile(tokenPath, "utf8");
  const blocks = parseBlocks(css);
  const light = readVariables(blocks, (selector) => /(^|[\s,]):root\b/.test(selector));
  const darkOverrides = readVariables(blocks, (selector) =>
    /(^|[\s,])\.dark\b/.test(selector) || /\[data-theme\s*=\s*["']?dark["']?\]/i.test(selector),
  );
  assert.ok(light.size > 0, "packages/highway-styles/src/tokens.css must define light-theme tokens in :root");
  assert.ok(darkOverrides.size > 0, "packages/highway-styles/src/tokens.css must define dark-theme token overrides");

  const pairs = [
    ["--foreground", "--background", 4.5],
    ["--foreground", "--field-surface", 4.5],
    ["--ring", "--field-surface", 3],
    ["--muted-foreground", "--surface-muted", 4.5],
    ["--primary-foreground", "--primary", 4.5],
    ["--secondary-foreground", "--secondary", 4.5],
    ["--destructive-foreground", "--destructive", 4.5],
    ["--input", "--surface-muted", 3],
    ["--ring", "--background", 3],
    ["--status-neutral-ink", "--status-neutral-bg", 4.5],
    ["--status-success", "--status-success-bg", 4.5],
    ["--status-warning", "--status-warning-bg", 4.5],
    ["--status-error", "--status-error-bg", 4.5],
    ["--status-info", "--status-info-bg", 4.5],
    ["--action-border", "--background", 3],
  ];
  const failures = [];

  for (const [themeName, overrides] of [["light", light], ["dark", new Map([...light, ...darkOverrides])]]) {
    const resolved = new Map([...overrides].map(([name, value]) => [name, expandVariables(value, overrides, [name])]));
    for (const [foregroundName, backgroundName, minimum] of pairs) {
      const foreground = resolved.get(foregroundName);
      const background = resolved.get(backgroundName);
      assert.ok(foreground !== undefined, `${themeName} theme is missing ${foregroundName}`);
      assert.ok(background !== undefined, `${themeName} theme is missing ${backgroundName}`);
      const ratio = contrast(parseColor(foreground, foregroundName), parseColor(background, backgroundName));
      if (ratio < minimum) {
        failures.push(`${themeName} ${foregroundName} against ${backgroundName} is ${ratio.toFixed(2)}:1; required ${minimum}:1`);
      }
    }
  }

  assert.deepEqual(failures, [], failures.join("\n"));
});
