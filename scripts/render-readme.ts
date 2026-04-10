import MarkdownIt from "markdown-it";
import { chromium, type Browser } from "playwright";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

type Theme = "light" | "dark";

type Options = {
  input: string;
  outDir: string;
  width: number;
  scale: number;
};

type Segment = {
  name: "top" | "bottom";
  markdown: string;
};

const defaultOptions: Options = {
  input: "content/readme.md",
  outDir: "assets",
  width: 1280,
  scale: 2,
};

const splitStartMarker = "<!-- readmeplusplus:copyable-install:start -->";
const splitEndMarker = "<!-- readmeplusplus:copyable-install:end -->";

const markdown = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

const options = parseArgs(process.argv.slice(2));
const root = process.cwd();
const inputPath = resolve(root, options.input);
const outDir = resolve(root, options.outDir);
const primerLightCss = await readFile(
  resolve(root, "node_modules/@primer/primitives/dist/internalCss/light.css"),
  "utf8",
);
const primerDarkCss = await readFile(
  resolve(root, "node_modules/@primer/primitives/dist/internalCss/dark.css"),
  "utf8",
);
const source = await readFile(inputPath, "utf8");
const splitReadme = splitSource(source);
const segments: Segment[] = [
  { name: "top", markdown: splitReadme.top },
  { name: "bottom", markdown: splitReadme.bottom },
];

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
try {
  for (const segment of segments) {
    await renderTheme(browser, "light", segment);
    await renderTheme(browser, "dark", segment);
  }
} finally {
  await browser.close();
}

await writeReadme();

console.log(`Rendered ${options.input} to ${options.outDir}/readme-top-light.png`);
console.log(`Rendered ${options.input} to ${options.outDir}/readme-top-dark.png`);
console.log(`Rendered ${options.input} to ${options.outDir}/readme-bottom-light.png`);
console.log(`Rendered ${options.input} to ${options.outDir}/readme-bottom-dark.png`);
console.log("Updated README.md with split image switching and copyable install command.");

async function renderTheme(browser: Browser, theme: Theme, segment: Segment) {
  const page = await browser.newPage({
    viewport: { width: options.width, height: 1 },
    deviceScaleFactor: options.scale,
  });

  await page.setContent(documentFor(theme, segment), { waitUntil: "networkidle" });
  await page.locator(".readme-canvas").waitFor();
  await page.screenshot({
    path: resolve(outDir, `readme-${segment.name}-${theme}.png`),
    fullPage: true,
    animations: "disabled",
  });
  await page.close();
}

function documentFor(theme: Theme, segment: Segment) {
  return `<!doctype html>
<html lang="en" data-color-mode="${theme}" data-${theme}-theme="${theme}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
${primerLightCss}
${primerDarkCss}
${rendererCss()}
</style>
</head>
<body>
  <main class="readme-canvas readme-canvas--${segment.name} markdown-body">
    ${markdown.render(segment.markdown)}
  </main>
</body>
</html>`;
}

async function writeReadme() {
  const readmePath = resolve(root, "README.md");
  const body = `<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./assets/readme-top-dark.png">
  <source media="(prefers-color-scheme: light)" srcset="./assets/readme-top-light.png">
  <img alt="Rendered convertparty README header" src="./assets/readme-top-light.png" width="100%">
</picture>

${splitReadme.installBlock}

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./assets/readme-bottom-dark.png">
  <source media="(prefers-color-scheme: light)" srcset="./assets/readme-bottom-light.png">
  <img alt="Rendered convertparty README details" src="./assets/readme-bottom-light.png" width="100%">
</picture>

## Editing

Edit \`content/readme.md\`, then regenerate the README images and this wrapper:

\`\`\`bash
bun run render
\`\`\`

Text and links inside the image are not selectable or clickable. Put anything interactive below the image in this README.
`;

  await writeFile(readmePath, body, "utf8");
}

function splitSource(source: string) {
  const start = source.indexOf(splitStartMarker);
  const end = source.indexOf(splitEndMarker);

  if (start === -1 || end === -1 || end < start) {
    throw new Error(
      `Expected ${options.input} to contain ${splitStartMarker} and ${splitEndMarker}.`,
    );
  }

  const installBlock = source
    .slice(start + splitStartMarker.length, end)
    .trim();
  const bottomStart = end + splitEndMarker.length;

  return {
    top: source.slice(0, start).trim(),
    installBlock,
    bottom: source.slice(bottomStart).trim(),
  };
}

function parseArgs(args: string[]): Options {
  const parsed = { ...defaultOptions };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const next = args[index + 1];

    if (arg === "--input" && next) {
      parsed.input = next;
      index += 1;
    } else if (arg === "--out-dir" && next) {
      parsed.outDir = next;
      index += 1;
    } else if (arg === "--width" && next) {
      parsed.width = parsePositiveInt("--width", next);
      index += 1;
    } else if (arg === "--scale" && next) {
      parsed.scale = parsePositiveInt("--scale", next);
      index += 1;
    } else if (arg === "--help" || arg === "-h") {
      printHelpAndExit();
    } else {
      throw new Error(`Unknown or incomplete argument: ${arg}`);
    }
  }

  return parsed;
}

function parsePositiveInt(name: string, value: string) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    throw new Error(`${name} must be a positive integer.`);
  }

  return parsed;
}

function printHelpAndExit(): never {
  console.log(`Usage: bun run render [options]

Options:
  --input <path>    Markdown file to render. Default: ${defaultOptions.input}
  --out-dir <dir>   Output directory. Default: ${defaultOptions.outDir}
  --width <px>      CSS viewport width. Default: ${defaultOptions.width}
  --scale <n>       Device scale factor. Default: ${defaultOptions.scale}`);
  process.exit(0);
}

function rendererCss() {
  return `
:root {
  color-scheme: light dark;
}

* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  min-height: 100%;
  background: var(--bgColor-default);
  color: var(--fgColor-default);
  font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

body {
  padding: 0;
}

.readme-canvas {
  width: 100%;
  padding: 64px;
  overflow: hidden;
  background: var(--bgColor-default);
}

.readme-canvas--top {
  padding-bottom: 24px;
}

.readme-canvas--bottom {
  padding-top: 12px;
}

.readme-canvas--bottom .stat-strip {
  margin-top: 24px;
}

.markdown-body {
  font-size: 22px;
  line-height: 1.55;
}

.markdown-body > * {
  max-width: 1080px;
  margin-left: auto;
  margin-right: auto;
}

.markdown-body h1,
.markdown-body h2,
.markdown-body h3 {
  color: var(--fgColor-default);
  line-height: 1.05;
  letter-spacing: 0;
}

.markdown-body h1 {
  margin: 0 0 24px;
  max-width: 980px;
  font-size: 74px;
  font-weight: 800;
}

.markdown-body h2 {
  margin-top: 64px;
  margin-bottom: 18px;
  font-size: 38px;
}

.markdown-body h3 {
  margin: 16px 0 10px;
  font-size: 28px;
}

.markdown-body p,
.markdown-body li {
  color: var(--fgColor-muted);
}

.markdown-body blockquote {
  margin-top: 0;
  padding: 14px 18px;
  border: 1px solid var(--borderColor-default);
  border-left: 6px solid var(--fgColor-accent);
  border-radius: 8px;
  background: transparent;
}

.markdown-body blockquote p {
  margin: 0;
  color: var(--fgColor-default);
  font-weight: 650;
}

.markdown-body code {
  padding: 0.16em 0.36em;
  border: 1px solid var(--borderColor-muted);
  border-radius: 6px;
  background: transparent;
  color: var(--fgColor-default);
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", monospace;
  font-size: 0.9em;
}

.markdown-body pre {
  margin-top: 28px;
  padding: 24px;
  overflow: hidden;
  border: 1px solid var(--borderColor-default);
  border-radius: 8px;
  background: transparent;
}

.markdown-body pre code {
  padding: 0;
  background: transparent;
}

.hero {
  max-width: 1080px;
  margin: 44px auto 54px;
  padding: 42px;
  border: 1px solid var(--borderColor-default);
  border-radius: 8px;
  background: transparent;
}

.hero p {
  max-width: 820px;
  margin: 0;
  font-size: 24px;
}

.hero .eyebrow {
  margin-bottom: 18px;
  color: var(--fgColor-accent);
  font-size: 18px;
  font-weight: 800;
  text-transform: uppercase;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  margin-top: 30px;
}

.feature-grid article {
  min-height: 280px;
  padding: 28px;
  border: 1px solid var(--borderColor-default);
  border-radius: 8px;
  background: transparent;
}

.feature-grid span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 8px;
  border: 1px solid var(--borderColor-accent-emphasis);
  background: transparent;
  color: var(--fgColor-accent);
  font-weight: 800;
}

.feature-grid p {
  margin: 0;
}

.stat-strip {
  display: grid;
  grid-template-columns: auto 1fr auto 1fr auto 1fr;
  gap: 10px 16px;
  align-items: center;
  margin-top: 48px;
  padding: 24px;
  border: 1px solid var(--borderColor-default);
  border-radius: 8px;
  background: transparent;
}

.stat-strip strong {
  color: var(--fgColor-success);
  font-size: 34px;
}

.stat-strip span {
  color: var(--fgColor-muted);
}
`;
}
