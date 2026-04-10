import MarkdownIt from "markdown-it";
import { chromium, type Browser } from "playwright";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

type Theme = "light" | "dark";

type Options = {
  input: string;
  outDir: string;
  width: number;
  scale: number;
};

const defaultOptions: Options = {
  input: "content/readme.md",
  outDir: "assets",
  width: 1280,
  scale: 2,
};

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
const renderedMarkdown = markdown.render(source);

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
try {
  await renderTheme(browser, "light");
  await renderTheme(browser, "dark");
} finally {
  await browser.close();
}

await writeReadme();

console.log(`Rendered ${options.input} to ${options.outDir}/readme-light.png`);
console.log(`Rendered ${options.input} to ${options.outDir}/readme-dark.png`);
console.log("Updated README.md with GitHub light/dark image switching.");

async function renderTheme(browser: Browser, theme: Theme) {
  const page = await browser.newPage({
    viewport: { width: options.width, height: 720 },
    deviceScaleFactor: options.scale,
  });

  await page.setContent(documentFor(theme), { waitUntil: "networkidle" });
  await page.locator(".readme-canvas").waitFor();
  await page.screenshot({
    path: resolve(outDir, `readme-${theme}.png`),
    fullPage: true,
    animations: "disabled",
  });
  await page.close();
}

function documentFor(theme: Theme) {
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
  <main class="readme-canvas markdown-body">
    ${renderedMarkdown}
  </main>
</body>
</html>`;
}

async function writeReadme() {
  const readmePath = resolve(root, "README.md");
  const body = `# readmeplusplus

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./assets/readme-dark.png">
  <source media="(prefers-color-scheme: light)" srcset="./assets/readme-light.png">
  <img alt="Rendered README++ preview" src="./assets/readme-light.png" width="100%">
</picture>

## Editing

Edit \`content/readme.md\`, then regenerate the README images:

\`\`\`bash
bun run render
\`\`\`

Text and links inside the image are not selectable or clickable. Put anything interactive below the image in this README.
`;

  await writeFile(readmePath, body, "utf8");
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
  min-height: 720px;
  padding: 64px;
  overflow: hidden;
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--bgColor-accent-muted) 62%, transparent), transparent 36%),
    radial-gradient(circle at 82% 10%, color-mix(in srgb, var(--bgColor-success-muted) 68%, transparent), transparent 32%),
    var(--bgColor-default);
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
  background: color-mix(in srgb, var(--bgColor-muted) 76%, transparent);
}

.markdown-body blockquote p {
  margin: 0;
  color: var(--fgColor-default);
  font-weight: 650;
}

.markdown-body code {
  padding: 0.16em 0.36em;
  border-radius: 6px;
  background: var(--bgColor-neutral-muted);
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
  background: var(--bgColor-inset);
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
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--bgColor-accent-muted) 78%, transparent), transparent 52%),
    color-mix(in srgb, var(--bgColor-muted) 82%, transparent);
  box-shadow: 0 18px 58px color-mix(in srgb, var(--fgColor-default) 12%, transparent);
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
  background: color-mix(in srgb, var(--bgColor-muted) 86%, transparent);
}

.feature-grid span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: var(--bgColor-accent-emphasis);
  color: var(--fgColor-onEmphasis);
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
  background: var(--bgColor-muted);
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
