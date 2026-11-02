import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDirectories = [
  "app",
  "components",
  "packages/highway-react/src",
  "packages/highway-styles/src",
  "apps/showcase/app",
  "apps/showcase/components",
  "examples/yardwork/app",
  "examples/yardwork/src/components/yardwork",
].map((directory) => path.join(root, directory));
const tokenFile = path.join(root, "packages/highway-styles/src/tokens.css");
const issues = [];
const filesOutsideLegacyDesignGuard = new Set([
  path.join(root, "packages/highway-styles/src/component-theme.css"),
  path.join(root, "packages/highway-styles/src/vendor/shadcn-tailwind-4.13.0.css"),
]);
const legacyOwnership = new Map([
  ["packages/highway-styles/src/controls.css", "app/controls.css"],
  ["packages/highway-react/src/components/visual/visual-effects.css", "components/visual/visual-effects.css"],
  ["packages/highway-react/src/components/ui/native-select.tsx", "components/ui/native-select.tsx"],
]);

function ownershipPath(file) {
  const relativeFile = path.relative(root, file).replaceAll(path.sep, "/");
  return legacyOwnership.get(relativeFile) ?? relativeFile;
}

function filesUnder(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory()
      ? filesUnder(fullPath)
      : entry.isFile()
        ? [fullPath]
        : [];
  });
}

function withoutBlockComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, "");
}

function reportMatches(file, source, pattern, describe, shouldReport = () => true) {
  for (const match of source.matchAll(pattern)) {
    if (!shouldReport(match)) continue;
    const line = source.slice(0, match.index).split("\n").length;
    issues.push(`${path.relative(root, file)}:${line}: ${describe(match[0])}`);
  }
}

function isIntentionalArtworkColor(file, source, match) {
  const relativeFile = ownershipPath(file);
  const lineStart = source.lastIndexOf("\n", match.index) + 1;
  const lineEnd = source.indexOf("\n", match.index);
  const line = source.slice(lineStart, lineEnd < 0 ? source.length : lineEnd);
  const color = match[0].toLowerCase();

  // The CodeMirror syntax palette is a separate, named code-color set.
  if (relativeFile === "app/controls.css" && /--code-[\w-]+\s*:\s*[^;]+;?\s*$/.test(line)) return true;

  // Keep the synthetic sample artwork's original hand-picked palette explicit.
  if (relativeFile === "components/visual/visual-guide.css") {
    const swatchPalette = new Set(["#18281e", "#b9debe", "#f0ba80", "#4b301b", "#aaa9df", "#27233e"]);
    return swatchPalette.has(color) && /\.fx-demo-art/.test(line);
  }

  if (relativeFile !== "components/visual/visual-effects.css") return false;
  if (color === "#000" && /(?:-webkit-)?mask-image\s*:/.test(line)) return true;
  const artworkPalettes = [
    ["#f7f8ff", /\[data-gradient=onboarding\]/],
    ["#fff", /\[data-gradient=onboarding\]/],
    ["#eaf0ff", /\[data-gradient=profile\]/],
    ["#f2f5fc", /\[data-gradient=profile\]/],
    ["#e7eeff", /\[data-gradient=profile\]/],
    ["#fafbff", /\[data-gradient=upload\]/],
    ["#fff", /\[data-gradient=upload\]/],
    ["#f0f4ff", /\[data-gradient=stage\]/],
    ["#12141605", /\.fx-media-scrim/],
    ["#12141680", /\.fx-media-scrim/],
    ["#121416f5", /\.fx-media-scrim/],
    ["#12141930", /\.fx-overlay/],
    ["#00000070", /\.fx-overlay/],
    ["#fff", /\.image-action/],
    ["#242424", /(?:@supports|\.image-action)/],
    ["#333", /(?:@supports|\.image-action)/],
  ];
  return artworkPalettes.some(([allowedColor, selector]) => color === allowedColor && selector.test(line));
}

const sourceFiles = sourceDirectories.flatMap(filesUnder);
const tsxFiles = sourceFiles.filter((file) => file.endsWith(".tsx"));
const cssFiles = sourceFiles.filter((file) => file.endsWith(".css") && !filesOutsideLegacyDesignGuard.has(file));
const tokenCss = withoutBlockComments(readFileSync(tokenFile, "utf8"));
const declaredTokenNames = new Set([...tokenCss.matchAll(/(--(?:space|radius)-[\w-]+)\s*:/g)].map((match) => match[1]));

for (const file of tsxFiles) {
  let source = withoutBlockComments(readFileSync(file, "utf8"));
  // Recharts emits neutral SVG defaults in selectors; these are compatibility selectors, not component palette choices.
  if (ownershipPath(file) === "components/ui/chart.tsx") {
    source = source.replace(/\[(?:stroke|fill)='(?:#ccc|#fff)'\]/gi, "[]");
  }

  reportMatches(file, source, /#[\da-fA-F]{3,8}\b/g, () => "use a shared semantic color token instead of a raw color");
  reportMatches(
    file,
    source,
    /<\s*select(?:\s|>|\/)/g,
    () => "use the shared NativeSelect component",
    () => ownershipPath(file) !== "components/ui/native-select.tsx",
  );
  reportMatches(
    file,
    source,
    /(?:^|\s)text-\[[^\]\n]*\b\d+(?:\.\d+)?px[^\]\n]*\]/g,
    (value) => `avoid arbitrary pixel typography (${value.trim()})`,
  );
  reportMatches(
    file,
    source,
    /\bfontSize\s*:\s*([^,}\n]+)/g,
    (value) => `use a shared typography token instead of an inline fontSize value (${value.trim()})`,
    (match) => !/^\s*["']?var\(--type-[\w-]+\)["']?\s*$/.test(match[1]),
  );
  reportMatches(
    file,
    source,
    /\b(?:gap|padding|margin|borderRadius)\s*:\s*["'][^"']*[\d.]+(?:px|rem|em|ch|ex|vw|vh|vmin|vmax|%)/g,
    (value) => `use spacing or radius tokens in inline style objects (${value.trim()})`,
  );
  reportMatches(file, source, /var\(\s*--(?:space|radius)-[\w-]+/g, (value) => `undefined spacing or radius token ${value.match(/--[\w-]+/)?.[0] ?? value}`, (match) => {
    const name = match[0].match(/--[\w-]+/)?.[0];
    return name !== undefined && !declaredTokenNames.has(name);
  });
}

const spacingProperty = /(?:^|[;{}])\s*(gap(?:-(?:row|column|x|y))?|padding(?:-(?:block|inline|top|right|bottom|left|block-start|block-end|inline-start|inline-end))?|margin(?:-(?:block|inline|top|right|bottom|left|block-start|block-end|inline-start|inline-end))?|border-radius)\s*:\s*([^;{}]+)/gi;
const literalLength = /(?<![\w.-])(?:\d+(?:\.\d+)?|\.\d+)(?:px|rem|em|ch|ex|vw|vh|vmin|vmax|%)(?![\w-])/gi;

for (const file of cssFiles) {
  const source = withoutBlockComments(readFileSync(file, "utf8"));
  if (file !== tokenFile) {
    reportMatches(file, source, /#[\da-fA-F]{3,8}\b/g, () => "move palette colors to app/tokens.css and reference them with var()", (match) => !isIntentionalArtworkColor(file, source, match));

    for (const match of source.matchAll(spacingProperty)) {
      const property = match[1].toLowerCase();
      const value = match[2];
      const line = source.slice(0, match.index).split("\n").length;
      for (const length of value.matchAll(literalLength)) {
        if ((property === "border-radius" && length[0] === "50%") || length[0] === "0%") continue;
        issues.push(`${path.relative(root, file)}:${line}: replace literal ${property} length ${length[0]} with a shared spacing or radius token`);
      }
    }

    reportMatches(file, source, /font-size\s*:\s*[^;{}]*\b\d+(?:\.\d+)?px\b/gi, () => "use a shared typography token instead of a literal pixel font size");
  }

  for (const match of source.matchAll(/var\(\s*--(?:space|radius)-[\w-]+/g)) {
    const name = match[0].match(/--[\w-]+/)?.[0];
    if (name !== undefined && !declaredTokenNames.has(name)) {
      const line = source.slice(0, match.index).split("\n").length;
      issues.push(`${path.relative(root, file)}:${line}: undefined spacing or radius token ${name}`);
    }
  }

  for (const match of source.matchAll(/(--[\w-]+)\s*:\s*([^;{}]+)/g)) {
    const [, variableName, value] = match;
    const reference = new RegExp(`var\\(\\s*${variableName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?=\\s*(?:,|\\)))`);
    if (reference.test(value)) {
      const line = source.slice(0, match.index).split("\n").length;
      issues.push(`${path.relative(root, file)}:${line}: ${variableName} references itself in its own declaration`);
    }
  }
}

if (issues.length) {
  console.error(`Design guard found ${issues.length} issue${issues.length === 1 ? "" : "s"}:\n${issues.map((issue) => `- ${issue}`).join("\n")}`);
  process.exitCode = 1;
} else {
  console.log(`Design guard passed (${tsxFiles.length} application and shared components, ${cssFiles.length} stylesheets).`);
}
