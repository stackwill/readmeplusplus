# README Compiler V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page Bun + React app that previews a pasted `README.md` with a custom branded renderer and exports `readme-light.png`, `readme-dark.png`, and a GitHub-ready wrapper `README.md`.

**Architecture:** Use a shared markdown-to-rendered-HTML pipeline for both in-app preview and Playwright export so preview and output cannot drift. Keep v1 image-first and structural: parse Markdown with raw HTML enabled, style each supported node type through one design system, and generate light/dark full-document screenshots plus wrapper markdown.

**Tech Stack:** Bun, TypeScript, React, Vite, markdown-it, Playwright

---

## Planned File Structure

### Root app and tooling

- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `.gitignore`

### App entry and layout

- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/app.css`

### Shared renderer pipeline

- Create: `src/lib/sample-readme.ts`
- Create: `src/lib/theme.ts`
- Create: `src/lib/markdown.ts`
- Create: `src/lib/render-document.ts`
- Create: `src/lib/readme-export.ts`

### UI components

- Create: `src/components/editor-pane.tsx`
- Create: `src/components/preview-pane.tsx`
- Create: `src/components/export-bar.tsx`

### Export runtime

- Create: `scripts/export-readme.ts`
- Create: `scripts/render-static.ts`
- Create: `playwright.config.ts`

### Verification and reference

- Create: `README.md`

## Execution Batches

To keep subagent-driven execution practical, implement the plan in four larger batches instead of every micro-step as its own dispatch:

1. Foundation app setup
   Includes Tasks 1, 2, and 3.

2. Shared renderer and live preview
   Includes Tasks 4 and 5.

3. Export pipeline
   Includes Tasks 6, 7, 8, and 9.

4. Final polish and verification
   Includes Tasks 10, 11, and 12.

## Task 1: Scaffold The Bun + Vite App

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `.gitignore`

- [ ] **Step 1: Create `package.json` with Bun-first scripts and dependencies**

```json
{
  "name": "readmeplusplus",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "bunx vite",
    "build": "bunx vite build",
    "preview": "bunx vite preview",
    "export": "bun run scripts/export-readme.ts",
    "check": "bunx tsc --noEmit"
  },
  "dependencies": {
    "markdown-it": "^14.1.1",
    "react": "^19.2.0",
    "react-dom": "^19.2.0"
  },
  "devDependencies": {
    "@playwright/test": "^1.59.1",
    "@types/bun": "latest",
    "@types/markdown-it": "^14.1.2",
    "@types/react": "^19.2.2",
    "@types/react-dom": "^19.2.2",
    "@vitejs/plugin-react": "^5.0.4",
    "playwright": "^1.59.1",
    "typescript": "^5.9.3",
    "vite": "^7.1.7"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json` for a small React + Bun app**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "Bundler",
    "allowImportingTsExtensions": false,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "types": ["bun"]
  },
  "include": ["src", "scripts", "vite.config.ts", "playwright.config.ts"]
}
```

- [ ] **Step 3: Create `vite.config.ts` with React plugin**

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
});
```

- [ ] **Step 4: Create `index.html` as the Vite shell**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>readmeplusplus</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 5: Create `.gitignore` for Bun, Vite, and export output**

```gitignore
node_modules
dist
playwright-report
test-results
.DS_Store
```

- [ ] **Step 6: Install dependencies**

Run: `bun install`

Expected: Bun resolves and installs React, Vite, markdown-it, Playwright, and TypeScript dependencies with no lockfile errors.

- [ ] **Step 7: Verify the scaffold compiles**

Run: `bun run check`

Expected: TypeScript exits successfully even though app source files are not created yet or only fail on missing imports you will add in the next task.

## Task 2: Build The Single-Page App Shell

**Files:**
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/app.css`

- [ ] **Step 1: Create `src/main.tsx`**

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./app.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

- [ ] **Step 2: Create `src/App.tsx` with the top-level page shell**

```tsx
import { useState } from "react";
import { EditorPane } from "./components/editor-pane";
import { PreviewPane } from "./components/preview-pane";
import { ExportBar } from "./components/export-bar";
import { SAMPLE_README } from "./lib/sample-readme";

export default function App() {
  const [source, setSource] = useState(SAMPLE_README);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">README Compiler</p>
          <h1>readmeplusplus</h1>
        </div>
        <ExportBar source={source} theme={theme} onThemeChange={setTheme} />
      </header>
      <main className="workspace">
        <EditorPane source={source} onChange={setSource} />
        <PreviewPane source={source} theme={theme} />
      </main>
    </div>
  );
}
```

- [ ] **Step 3: Create `src/app.css` with app-level layout only**

```css
:root {
  color: #e6edf3;
  background: #0b0f14;
  font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

* {
  box-sizing: border-box;
}

html,
body,
#root {
  margin: 0;
  min-height: 100%;
}

body {
  min-height: 100vh;
}

.app-shell {
  min-height: 100vh;
  padding: 24px;
  background:
    radial-gradient(circle at top left, rgba(41, 193, 255, 0.18), transparent 28%),
    radial-gradient(circle at top right, rgba(255, 122, 89, 0.16), transparent 24%),
    linear-gradient(180deg, #091018 0%, #0d131b 100%);
}

.topbar {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 16px;
  margin: 0 auto 20px;
  max-width: 1800px;
}

.eyebrow {
  margin: 0 0 6px;
  color: #8ab4ff;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.topbar h1 {
  margin: 0;
  color: #f5f8ff;
  font-size: 32px;
  line-height: 1;
}

.workspace {
  display: grid;
  grid-template-columns: minmax(320px, 0.95fr) minmax(420px, 1.25fr);
  gap: 20px;
  margin: 0 auto;
  max-width: 1800px;
}

@media (max-width: 1100px) {
  .topbar,
  .workspace {
    grid-template-columns: 1fr;
  }

  .topbar {
    align-items: start;
  }
}
```

- [ ] **Step 4: Run the app once to verify the shell renders**

Run: `bun run dev`

Expected: Vite starts locally and the page loads a two-pane layout without runtime crashes. Missing component imports are resolved in later tasks, so finish those before repeating this check.

## Task 3: Add Shared Source, Theme, And Markdown Utilities

**Files:**
- Create: `src/lib/sample-readme.ts`
- Create: `src/lib/theme.ts`
- Create: `src/lib/markdown.ts`

- [ ] **Step 1: Create `src/lib/sample-readme.ts` with a useful default README**

```ts
export const SAMPLE_README = `# Project Name

An opinionated README rendered through \`readmeplusplus\`.

## Highlights

- Light and dark mode image export
- Structural markdown rendering
- Raw HTML passthrough

## Install

\`\`\`bash
bun install
bun run dev
\`\`\`

> The final GitHub output is a wrapper README that points at generated light and dark image assets.

<div class="custom-note">
  <strong>Raw HTML works too.</strong>
</div>

| Feature | Status |
| --- | --- |
| Preview | Ready |
| Export | Planned |
`;
```

- [ ] **Step 2: Create `src/lib/theme.ts` with theme tokens for both the app and renderer**

```ts
export type RenderTheme = "light" | "dark";

export const GITHUB_PAGE_BACKGROUNDS: Record<RenderTheme, string> = {
  light: "#ffffff",
  dark: "#0d1117",
};
```

- [ ] **Step 3: Create `src/lib/markdown.ts` with a single markdown-it instance**

```ts
import MarkdownIt from "markdown-it";

const markdown = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

export function renderMarkdown(source: string): string {
  return markdown.render(source);
}
```

- [ ] **Step 4: Verify the utility layer type-checks**

Run: `bun run check`

Expected: TypeScript accepts the utility modules with no type errors.

## Task 4: Implement The Shared Branded Renderer

**Files:**
- Create: `src/lib/render-document.ts`

- [ ] **Step 1: Create `src/lib/render-document.ts` with one renderer for preview and export**

```ts
import { renderMarkdown } from "./markdown";
import { GITHUB_PAGE_BACKGROUNDS, type RenderTheme } from "./theme";

function escapeAttr(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("\"", "&quot;");
}

export function getRenderDocument(title: string, source: string, theme: RenderTheme): string {
  const background = GITHUB_PAGE_BACKGROUNDS[theme];
  const content = renderMarkdown(source);

  return `<!doctype html>
<html lang="en" data-theme="${escapeAttr(theme)}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeAttr(title)}</title>
    <style>
      :root {
        color-scheme: ${theme};
        --page-bg: ${background};
        --page-fg: ${theme === "light" ? "#1f2328" : "#e6edf3"};
        --muted-fg: ${theme === "light" ? "#59636e" : "#8b949e"};
        --border: ${theme === "light" ? "rgba(31, 35, 40, 0.12)" : "rgba(230, 237, 243, 0.14)"};
        --accent: ${theme === "light" ? "#0969da" : "#58a6ff"};
        --accent-2: ${theme === "light" ? "#d1242f" : "#ff7b72"};
        --accent-3: ${theme === "light" ? "#1a7f37" : "#3fb950"};
        --surface: ${theme === "light" ? "#f6f8fa" : "#161b22"};
        --surface-strong: ${theme === "light" ? "#eef2ff" : "#111d2f"};
        --code-bg: ${theme === "light" ? "#f6f8fa" : "#161b22"};
      }

      * {
        box-sizing: border-box;
      }

      html,
      body {
        margin: 0;
        background: var(--page-bg);
        color: var(--page-fg);
        font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      body {
        min-height: 100vh;
      }

      .render-root {
        width: 1280px;
        padding: 72px 44px 88px;
        background: var(--page-bg);
      }

      .markdown-body {
        position: relative;
        color: var(--page-fg);
        font-size: 22px;
        line-height: 1.65;
      }

      .markdown-body > :first-child {
        margin-top: 0;
      }

      .markdown-body > * {
        margin: 0 0 24px;
      }

      .markdown-body h1,
      .markdown-body h2,
      .markdown-body h3,
      .markdown-body h4,
      .markdown-body h5,
      .markdown-body h6 {
        position: relative;
        margin-top: 44px;
        margin-bottom: 18px;
        line-height: 1.1;
        letter-spacing: -0.03em;
      }

      .markdown-body h1 {
        font-size: 68px;
      }

      .markdown-body h2 {
        font-size: 42px;
      }

      .markdown-body h3 {
        font-size: 32px;
      }

      .markdown-body h1::after,
      .markdown-body h2::after {
        content: "";
        display: block;
        width: 92px;
        height: 6px;
        margin-top: 12px;
        border-radius: 999px;
        background: linear-gradient(90deg, var(--accent), var(--accent-2), var(--accent-3));
      }

      .markdown-body p,
      .markdown-body li,
      .markdown-body blockquote,
      .markdown-body td,
      .markdown-body th {
        max-width: 72ch;
      }

      .markdown-body a {
        color: var(--accent);
        text-decoration-thickness: 2px;
        text-underline-offset: 0.16em;
      }

      .markdown-body ul,
      .markdown-body ol {
        padding-left: 0;
        margin-left: 0;
        list-style: none;
      }

      .markdown-body ul li,
      .markdown-body ol li {
        position: relative;
        padding-left: 28px;
        margin-bottom: 14px;
      }

      .markdown-body ul li::before {
        content: "";
        position: absolute;
        top: 0.72em;
        left: 0;
        width: 12px;
        height: 12px;
        border-radius: 999px;
        background: linear-gradient(135deg, var(--accent), var(--accent-2));
        box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent) 18%, transparent);
      }

      .markdown-body ol {
        counter-reset: item;
      }

      .markdown-body ol li::before {
        counter-increment: item;
        content: counter(item);
        position: absolute;
        top: 0;
        left: 0;
        color: var(--accent);
        font-weight: 800;
      }

      .markdown-body code {
        padding: 0.16em 0.42em;
        border-radius: 0.45em;
        background: var(--surface);
        font-family: ui-monospace, "SFMono-Regular", SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
        font-size: 0.9em;
      }

      .markdown-body pre {
        overflow: hidden;
        padding: 22px 24px;
        border: 1px solid var(--border);
        border-radius: 24px;
        background:
          linear-gradient(180deg, color-mix(in srgb, var(--surface-strong) 76%, transparent), transparent),
          var(--code-bg);
        box-shadow: inset 0 1px 0 color-mix(in srgb, white 8%, transparent);
      }

      .markdown-body pre code {
        padding: 0;
        background: transparent;
      }

      .markdown-body blockquote {
        margin-left: 0;
        padding: 18px 22px;
        border-left: 6px solid var(--accent);
        border-radius: 0 18px 18px 0;
        background: color-mix(in srgb, var(--surface) 78%, transparent);
        color: var(--muted-fg);
      }

      .markdown-body hr {
        height: 1px;
        border: 0;
        margin: 40px 0;
        background: linear-gradient(90deg, transparent, var(--accent), transparent);
      }

      .markdown-body table {
        width: 100%;
        max-width: 100%;
        border-collapse: separate;
        border-spacing: 0;
        overflow: hidden;
        border: 1px solid var(--border);
        border-radius: 22px;
        background: color-mix(in srgb, var(--surface) 55%, transparent);
      }

      .markdown-body thead th {
        padding: 16px 18px;
        text-align: left;
        background: linear-gradient(90deg, color-mix(in srgb, var(--accent) 10%, transparent), transparent);
      }

      .markdown-body td {
        padding: 16px 18px;
        border-top: 1px solid var(--border);
      }

      .markdown-body img {
        display: block;
        max-width: 100%;
        border-radius: 22px;
      }
    </style>
  </head>
  <body>
    <main class="render-root">
      <article class="markdown-body">
        ${content}
      </article>
    </main>
  </body>
</html>`;
}
```

- [ ] **Step 2: Keep preview and export on the same renderer API**

Code to preserve:

```ts
export function getRenderDocument(title: string, source: string, theme: RenderTheme): string
```

Expected: both the React preview and the Playwright exporter import this function directly instead of maintaining separate markup or CSS.

- [ ] **Step 3: Verify the shared renderer type-checks**

Run: `bun run check`

Expected: TypeScript passes with the renderer module in place.

## Task 5: Build The Editor, Preview, And Export Bar Components

**Files:**
- Create: `src/components/editor-pane.tsx`
- Create: `src/components/preview-pane.tsx`
- Create: `src/components/export-bar.tsx`

- [ ] **Step 1: Create `src/components/editor-pane.tsx`**

```tsx
type EditorPaneProps = {
  source: string;
  onChange: (value: string) => void;
};

export function EditorPane({ source, onChange }: EditorPaneProps) {
  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Source</h2>
        <p>Paste your current README.md here.</p>
      </div>
      <textarea
        className="editor"
        value={source}
        onChange={(event) => onChange(event.target.value)}
        spellCheck={false}
      />
    </section>
  );
}
```

- [ ] **Step 2: Create `src/components/preview-pane.tsx` using the shared renderer**

```tsx
import { useMemo } from "react";
import { getRenderDocument } from "../lib/render-document";
import type { RenderTheme } from "../lib/theme";

type PreviewPaneProps = {
  source: string;
  theme: RenderTheme;
};

export function PreviewPane({ source, theme }: PreviewPaneProps) {
  const documentMarkup = useMemo(
    () => getRenderDocument("readmeplusplus preview", source, theme),
    [source, theme],
  );

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Preview</h2>
        <p>Branded render output using exact GitHub page backgrounds.</p>
      </div>
      <div className="preview-shell">
        <iframe
          className="preview-frame"
          sandbox="allow-same-origin"
          srcDoc={documentMarkup}
          title="Rendered README preview"
        />
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Create `src/components/export-bar.tsx` with theme toggle and export button placeholder**

```tsx
import type { RenderTheme } from "../lib/theme";

type ExportBarProps = {
  source: string;
  theme: RenderTheme;
  onThemeChange: (theme: RenderTheme) => void;
};

export function ExportBar({ source, theme, onThemeChange }: ExportBarProps) {
  const sourceBytes = new TextEncoder().encode(source).length;

  return (
    <div className="export-bar">
      <div className="theme-toggle" role="group" aria-label="Preview theme">
        <button
          className={theme === "light" ? "active" : ""}
          type="button"
          onClick={() => onThemeChange("light")}
        >
          Light
        </button>
        <button
          className={theme === "dark" ? "active" : ""}
          type="button"
          onClick={() => onThemeChange("dark")}
        >
          Dark
        </button>
      </div>
      <span className="source-meta">{sourceBytes.toLocaleString()} bytes</span>
      <button type="button" className="export-button">
        Export
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Extend `src/app.css` with panel, editor, and preview styles**

```css
.panel {
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 28px;
  background: rgba(8, 14, 22, 0.8);
  backdrop-filter: blur(16px);
  box-shadow: 0 22px 60px rgba(0, 0, 0, 0.28);
}

.panel-header {
  padding: 20px 22px 0;
}

.panel-header h2,
.panel-header p {
  margin: 0;
}

.panel-header h2 {
  color: #f7fbff;
  font-size: 18px;
}

.panel-header p {
  margin-top: 6px;
  color: rgba(226, 234, 255, 0.72);
  font-size: 14px;
}

.editor {
  width: 100%;
  min-height: 75vh;
  padding: 22px;
  border: 0;
  outline: none;
  resize: vertical;
  background: transparent;
  color: #dbe7ff;
  font: 15px/1.6 ui-monospace, "SFMono-Regular", SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
}

.preview-shell {
  padding: 20px;
}

.preview-frame {
  width: 100%;
  min-height: 75vh;
  border: 0;
  border-radius: 22px;
  background: #fff;
}

.export-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.theme-toggle {
  display: inline-flex;
  padding: 4px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
}

.theme-toggle button,
.export-button {
  border: 0;
  border-radius: 999px;
  padding: 10px 14px;
  font: inherit;
  cursor: pointer;
}

.theme-toggle button {
  color: #d6e3ff;
  background: transparent;
}

.theme-toggle button.active {
  color: #08111a;
  background: #ffffff;
}

.source-meta {
  color: rgba(226, 234, 255, 0.72);
  font-size: 13px;
}

.export-button {
  color: #08111a;
  background: linear-gradient(135deg, #7fd8ff, #7affb6);
  font-weight: 700;
}
```

- [ ] **Step 5: Run the app and verify the full page shell**

Run: `bun run dev`

Expected: The page shows source and preview panels, a working light/dark toggle, and the preview updates as the source textarea changes.

## Task 6: Implement Wrapper README Generation

**Files:**
- Create: `src/lib/readme-export.ts`

- [ ] **Step 1: Create `src/lib/readme-export.ts`**

```ts
export function buildWrapperReadme() {
  return `<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./assets/readme-dark.png">
  <source media="(prefers-color-scheme: light)" srcset="./assets/readme-light.png">
  <img alt="Rendered README" src="./assets/readme-light.png" width="100%">
</picture>
`;
}
```

- [ ] **Step 2: Verify the wrapper generator matches the spec exactly**

Expected output:

```md
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./assets/readme-dark.png">
  <source media="(prefers-color-scheme: light)" srcset="./assets/readme-light.png">
  <img alt="Rendered README" src="./assets/readme-light.png" width="100%">
</picture>
```

- [ ] **Step 3: Re-run type-checking**

Run: `bun run check`

Expected: TypeScript passes with the wrapper generator added.

## Task 7: Add A Static Render Page For Playwright

**Files:**
- Create: `scripts/render-static.ts`

- [ ] **Step 1: Create `scripts/render-static.ts` to serve one rendered document from markdown input**

```ts
import { serve } from "bun";
import { getRenderDocument } from "../src/lib/render-document";

const sourcePath = process.argv[2];
const themeArg = process.argv[3] === "dark" ? "dark" : "light";

if (!sourcePath) {
  throw new Error("Usage: bun run scripts/render-static.ts <markdown-file> [light|dark]");
}

const source = await Bun.file(sourcePath).text();

const server = serve({
  port: 4179,
  fetch() {
    return new Response(getRenderDocument("readmeplusplus export", source, themeArg), {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  },
});

console.log(`render-static ready on http://127.0.0.1:${server.port} for theme ${themeArg}`);
```

- [ ] **Step 2: Validate the static renderer manually**

Run: `bun run scripts/render-static.ts src/lib/sample-readme.ts light`

Expected: The command starts a local server. Adjust this check after you add a real markdown fixture or point it at a temporary markdown file instead of the TypeScript module.

## Task 8: Implement Playwright Export

**Files:**
- Create: `scripts/export-readme.ts`
- Create: `playwright.config.ts`

- [ ] **Step 1: Create `playwright.config.ts`**

```ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  use: {
    viewport: { width: 1280, height: 1 },
    deviceScaleFactor: 2,
  },
});
```

- [ ] **Step 2: Create `scripts/export-readme.ts` to render light and dark PNGs and wrapper markdown**

```ts
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { buildWrapperReadme } from "../src/lib/readme-export";
import { getRenderDocument } from "../src/lib/render-document";

const input = process.argv[2];
const outputDir = process.argv[3] ?? "export";

if (!input) {
  throw new Error("Usage: bun run scripts/export-readme.ts <input-readme> [output-dir]");
}

const source = await Bun.file(input).text();
const root = process.cwd();
const exportRoot = resolve(root, outputDir);
const assetsDir = resolve(exportRoot, "assets");
const wrapperPath = resolve(exportRoot, "README.md");

await mkdir(assetsDir, { recursive: true });

const browser = await chromium.launch();

try {
  for (const theme of ["light", "dark"] as const) {
    const page = await browser.newPage({
      viewport: { width: 1280, height: 1 },
      deviceScaleFactor: 2,
    });

    await page.setContent(getRenderDocument("readmeplusplus export", source, theme), {
      waitUntil: "load",
    });

    await page.screenshot({
      path: resolve(assetsDir, `readme-${theme}.png`),
      fullPage: true,
      animations: "disabled",
    });

    await page.close();
  }
} finally {
  await browser.close();
}

await Bun.write(wrapperPath, buildWrapperReadme());

console.log(`Exported assets to ${dirname(wrapperPath)}`);
```

- [ ] **Step 3: Run the export against a real markdown file**

Run: `bun run export idea.md export`

Expected: The command creates:

```text
export/README.md
export/assets/readme-light.png
export/assets/readme-dark.png
```

- [ ] **Step 4: Open the exported wrapper README and inspect the generated files**

Run: `ls -la export export/assets`

Expected: The wrapper markdown and both theme assets exist and have non-zero file sizes.

## Task 9: Wire Export Into The UI

**Files:**
- Modify: `src/components/export-bar.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Add a client-side wrapper markdown download in `src/components/export-bar.tsx`**

```tsx
import { buildWrapperReadme } from "../lib/readme-export";

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
```

Expected: the UI can at minimum download the wrapper markdown even before fully integrating browser-side image export.

- [ ] **Step 2: Add an explicit temporary export behavior**

Code to add inside `ExportBar`:

```tsx
const handleExport = () => {
  downloadText("README.md", buildWrapperReadme());
};
```

And wire the button:

```tsx
<button type="button" className="export-button" onClick={handleExport}>
  Export README
</button>
```

- [ ] **Step 3: Keep the boundary explicit in `src/App.tsx`**

Expected behavior: the in-browser UI provides the README wrapper immediately, while Playwright export remains the authoritative CLI path until a browser-initiated export endpoint is added.

- [ ] **Step 4: Verify the UI export affordance works**

Run: `bun run dev`

Expected: Clicking the export button downloads a `README.md` wrapper with the correct `<picture>` markup.

## Task 10: Polish The Renderer Against The Old Prototype

**Files:**
- Modify: `src/lib/render-document.ts`

- [ ] **Step 1: Compare output visually against `/home/will/code/readmeplusplus-old`**

Review:

```text
/home/will/code/readmeplusplus-old/scripts/render-readme.ts
/home/will/code/readmeplusplus-old/assets/readme-light.png
/home/will/code/readmeplusplus-old/assets/readme-dark.png
```

Expected: carry forward only the parts that improve GitHub blending or export correctness, not the split-marker architecture.

- [ ] **Step 2: Adjust branded element treatments**

Focus on:

```text
- heading hierarchy
- list bullet styling
- code block shell styling
- table framing
- blockquote treatment
- image corner treatment
```

Expected: the rendered output feels more designed than native GitHub markdown without turning into a generic landing page.

- [ ] **Step 3: Verify the GitHub compatibility constraints still hold**

Check:

```text
- GitHub font stack still in use
- light background remains #ffffff
- dark background remains #0d1117
- no page-wide tinted background introduced into exported documents
```

## Task 11: Document Local Usage

**Files:**
- Create: `README.md`

- [ ] **Step 1: Create `README.md` with setup and export instructions**

```md
# readmeplusplus

Single-page README compiler for generating branded GitHub-compatible README image exports.

## Local development

```bash
bun install
bun run dev
```

## CLI export

```bash
bun run export path/to/README.md export
```

This writes:

- `export/README.md`
- `export/assets/readme-light.png`
- `export/assets/readme-dark.png`
```

- [ ] **Step 2: Verify the README instructions match the actual scripts**

Run: `cat package.json`

Expected: the documented commands exactly match the configured Bun scripts.

## Task 12: Final Verification

**Files:**
- Verify only

- [ ] **Step 1: Run type-checking**

Run: `bun run check`

Expected: PASS

- [ ] **Step 2: Run the production build**

Run: `bun run build`

Expected: PASS and Vite outputs a production bundle in `dist/`.

- [ ] **Step 3: Run one full export**

Run: `bun run export idea.md export`

Expected: `export/README.md`, `export/assets/readme-light.png`, and `export/assets/readme-dark.png` all exist.

- [ ] **Step 4: Smoke check the app manually**

Run: `bun run dev`

Expected:

```text
- the page loads
- pasted markdown updates preview
- theme toggle updates preview
- wrapper README export downloads
```

- [ ] **Step 5: Commit the completed v1 foundation**

```bash
git add .
git commit -m "feat: build readme compiler v1 foundation"
```
