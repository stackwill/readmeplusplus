<div class="rpp-hero">
  <p class="rpp-kicker">GitHub README compiler · v0.1</p>
  <h1>readme<br>plusplus</h1>
  <p>Make a repository read like a <strong>designed artifact</strong>. Author familiar Markdown, keep the parts that matter real, then compile a light and dark README that feels native to GitHub.</p>
  <div class="rpp-rule">Markdown in / distinctive README out</div>
</div>

<div class="rpp-pills">
  <span class="rpp-pill">BUN</span>
  <span class="rpp-pill">REACT 19</span>
  <span class="rpp-pill">MARKDOWN-IT</span>
  <span class="rpp-pill">PLAYWRIGHT</span>
  <span class="rpp-pill">LIGHT + DARK</span>
  <span class="rpp-pill">GITHUB-READY</span>
</div>

> **The premise:** GitHub README files do not have to look like every other GitHub README. `readmeplusplus` turns one source document into a presentation with its own type, rhythm, components, and theme-aware surface—then ships it as ordinary GitHub-compatible Markdown.

## Not a landing page. A better README.

<div class="rpp-grid">
  <div class="rpp-card"><span class="rpp-card__index">01 / STRUCTURE</span><strong>Markdown stays recognizable.</strong><span>Headings, tables, lists, quotes, code, images, task lists, and raw HTML all take part in one visual system.</span></div>
  <div class="rpp-card"><span class="rpp-card__index">02 / CONTROL</span><strong>Opt in when the moment needs it.</strong><span>Authored HTML primitives give an ambitious document more range without pretending to infer what your content means.</span></div>
  <div class="rpp-card"><span class="rpp-card__index">03 / DELIVERY</span><strong>GitHub does the theme swap.</strong><span>One wrapper README points to two rendered PNGs using the platform's native <code>&lt;picture&gt;</code> behavior.</span></div>
  <div class="rpp-card rpp-card--wide"><span class="rpp-card__index">04 / PARITY</span><strong>The preview is not a mock.</strong><span>The editor and export process use the same document factory. If it looks deliberate in the tool, it is the exact design that gets captured for the repository.</span></div>
  <div class="rpp-card"><span class="rpp-card__index">05 / ESCAPE HATCH</span><strong>Raw HTML is welcome.</strong><span>Use it to compose richer moments such as this showcase while retaining a direct, inspectable source file.</span></div>
</div>

## The compilation ritual

<div class="rpp-terminal">
  <div class="rpp-terminal__top"><span>local / readme compiler</span><span class="rpp-terminal__dots"><i></i><i></i><i></i></span></div>
  <pre><b>$</b> bun install
<b>$</b> bun run dev
<b>$</b> bun run export README.source.md .

✓ assets/readme-light.png
✓ assets/readme-dark.png
✓ README.md</pre>
</div>

1. Write the document you actually want people to experience.
   - Start with **normal Markdown**.
   - Add raw HTML only where composition needs more range.
2. Preview it in the two-pane app.
   - Inspect the **light** GitHub surface.
   - Flip to **dark** without changing the source.
3. Capture both versions and commit the wrapper plus assets.

## What the renderer is flexing right now

| Authoring surface | What you are looking at | Why it matters |
| --- | --- | --- |
| # headings | Editorial type scale and marker system | Hierarchy without a generic page template |
| `fenced code` | A labeled code shell with a terminal-grade density | Commands remain legible inside a visual README |
| `> blockquotes` | A deliberate callout rather than a weak left border | Intent is visible before prose is read |
| Tables | A framed capability matrix | Dense technical information stays scannable |
| Raw HTML | Hero, tiles, terminal, and timeline primitives | Ambition is opt-in, never guessed |
| Light / dark assets | Exact GitHub page backgrounds | The seam disappears on the repository page |

<details>
<summary>Why render a README to images?</summary>

GitHub's Markdown renderer is deliberately constrained. That constraint is excellent for consistency, but it means a project with a strong point of view quickly starts fighting the platform. This compiler moves visual freedom into a deterministic build step, while the final wrapper remains a tiny, conventional GitHub document.

</details>

## One source. Two surfaces. No drift.

<div class="rpp-timeline">
  <div class="rpp-step"><span class="rpp-step__number">SOURCE / 01</span><div><strong>Author in Markdown</strong><p>Use the same language your contributors already know. The parser preserves raw HTML, linkifies URLs, understands task lists, and keeps structural intent intact.</p></div></div>
  <div class="rpp-step"><span class="rpp-step__number">PREVIEW / 02</span><div><strong>Render through the shared document factory</strong><p>The React preview mounts the same generated HTML that the export server will hand to Chromium.</p></div></div>
  <div class="rpp-step"><span class="rpp-step__number">CAPTURE / 03</span><div><strong>Export both GitHub contexts</strong><p>Playwright waits for fonts and images, checks image failures, then captures full-page light and dark artifacts.</p></div></div>
  <div class="rpp-step"><span class="rpp-step__number">SHIP / 04</span><div><strong>Let GitHub select the right image</strong><p>The generated wrapper uses <code>prefers-color-scheme</code>. Repository visitors see the version that belongs on their page.</p></div></div>
</div>

---

## Build it yourself

```bash
bun install
bunx playwright install chromium
bun run dev

# Compile this very README.
bun run export README.source.md .
```

Run the reliability checks before publishing:

- [x] `bun run check` — strict TypeScript validation
- [x] `bun run build` — production Vite build
- [x] `bun run verify:export` — export success and missing-image failure paths

<div class="rpp-endcap">READMEs ARE THE FIRST COMMIT PEOPLE READ. · SOURCE: README.source.md · GENERATED WITH readmeplusplus</div>
