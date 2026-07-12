# README Compiler V1 Design

## Summary

`readmeplusplus` v1 is a single-page web tool that accepts an existing GitHub `README.md`, renders it through a branded custom markdown engine, and exports a GitHub-compatible wrapper README plus light and dark image assets.

The website is not a hosted README runtime. It is an authoring, preview, and compilation tool for generating ordinary GitHub README output that relies on image rendering for presentation. The final export is:

- `readme-light.png`
- `readme-dark.png`
- `README.md`

The generated `README.md` uses a `<picture>` block with `prefers-color-scheme` so GitHub automatically swaps between the light and dark assets. The rendered images must use exact GitHub page backgrounds so they visually blend into the surrounding README surface.

## Product Goals

- Let a user paste their current plain `README.md` and immediately see a more visually distinctive version.
- Keep the output fully GitHub-compatible.
- Make the rendered result clearly not native GitHub markdown while still feeling visually at home on GitHub.
- Preserve the author's structure rather than guessing intent.
- Allow raw HTML passthrough so advanced users and agents have an escape hatch before custom syntax exists.

## Non-Goals

- No hosted page runtime.
- No account system or project persistence.
- No README slicing in v1.
- No custom syntax in v1.
- No heuristic reinterpretation of content into semantic components such as hero sections or feature grids.
- No preservation of native copyable markdown islands in v1.

## User Experience

The v1 app is a single-page tool with three functional areas:

- Source editor: a large textarea or code editor where the user pastes `README.md`.
- Preview pane: a live preview of the custom-rendered README.
- Export bar: controls for theme preview and final export.

The intended flow is:

1. User pastes their existing `README.md`.
2. The app parses and renders it immediately in the preview pane.
3. The user toggles between light and dark themes to inspect the result.
4. The user exports the generated assets and wrapper markdown.

The page should be focused and tool-like. It should not introduce dashboard concepts, file browsers, account UI, or workflow state beyond the current document in memory.

## Renderer Contract

The renderer is structural, not heuristic.

It must preserve the authored document structure and render each supported node type through a branded visual system. It must not inspect content and infer higher-level meaning such as "this looks like a feature grid" or "this paragraph should become a hero block."

The v1 renderer supports:

- headings
- paragraphs
- strong and emphasis
- inline code
- links
- unordered and ordered lists
- blockquotes
- fenced code blocks
- images
- horizontal rules
- tables
- raw HTML passthrough

The v1 renderer may degrade or reject unsupported markdown constructs, but it should do so deliberately and consistently rather than partially guessing.

## Visual Direction

The visual system should make the result clearly feel unlike standard GitHub markdown while still remaining compatible with GitHub's overall environment.

Visual constraints:

- Use the same GitHub font stack.
- Use exact GitHub page backgrounds:
  - light: `#ffffff`
  - dark: `#0d1117`
- Do not tint or gradient-fill the page background itself.
- Make distinction come from component styling, spacing, framing, accents, separators, list markers, code shells, table treatment, and recurring decorative motifs inside the content.

The system should feel intentional rather than random. Decorative treatment should be recurring and recognizable across the document. Examples of acceptable recurring accents:

- colored heading underlines or rails
- branded corner treatments on blocks
- custom list bullets
- designed code block shells
- framed tables with accent treatments

The renderer should remain document-shaped rather than webpage-shaped. It should not drift into generic landing page aesthetics.

## Raw HTML Policy

Raw HTML is allowed and should be rendered as-authored in both preview and export.

Rationale:

- Most pasted READMEs will not rely heavily on raw HTML.
- Supporting raw HTML gives users and agents immediate flexibility without designing a custom syntax first.
- The final export is image-based, so the system does not need to reproduce GitHub's sanitization model exactly in the output artifact.

This policy introduces risk around malformed layouts and unsafe assumptions. In v1, that is acceptable as long as preview and export share the same rendering path and therefore behave consistently.

## Export Format

V1 exports one full-image light asset and one full-image dark asset for the entire document.

Exported files:

- `readme-light.png`
- `readme-dark.png`
- `README.md`

The generated `README.md` should follow this structure:

```md
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./assets/readme-dark.png">
  <source media="(prefers-color-scheme: light)" srcset="./assets/readme-light.png">
  <img alt="Rendered README" src="./assets/readme-light.png" width="100%">
</picture>
```

The `<img>` fallback points at the light asset.

The export contract must stay simple in v1. No split markers, no partial native markdown sections, and no multiple slices.

## Technical Architecture

The implementation should use a shared renderer path for preview and export.

Recommended stack:

- Bun
- TypeScript
- React
- Vite
- `markdown-it` with `html: true`
- Playwright

Architecture layers:

1. Source state
   Stores the current markdown text in the page.

2. Markdown parse and render pipeline
   Uses `markdown-it` to turn source text into HTML, then wraps that HTML in the application's branded renderer shell.

3. Preview renderer
   Displays the same branded HTML and CSS used for export inside the browser app.

4. Export renderer
   Uses Playwright to load the same branded render output in light and dark modes and capture PNG screenshots.

5. Wrapper README generator
   Produces the final GitHub-compatible `README.md` with `<picture>` markup.

The key architectural rule is that preview and export must share the same render HTML and CSS source. Export must not use a separate styling path, or the preview will stop being trustworthy.

## Why Playwright Is The Right V1 Choice

The chosen rendering model is browser-driven rather than a custom document layout engine.

That is appropriate for v1 because:

- raw HTML support is a first-class requirement
- CSS gives more expressive control over how markdown elements are restyled
- the team already has a prototype showing that Playwright can produce correct output
- the website needs a browser preview anyway

This does trade some long-term purity for speed and flexibility, but for the current product boundary that trade is acceptable.

## Preview Requirements

The preview must:

- update quickly when the source changes
- support light and dark theme switching
- reflect the same backgrounds used in export
- use the same typography, spacing, and decorative system as export
- show the full document, not an approximation

The preview does not need to reproduce GitHub page chrome around the rendered document. It only needs to present the rendered content accurately against the correct page background.

## Export Requirements

The export flow must:

- render the current document in light mode
- render the current document in dark mode
- generate `README.md` wrapper content
- package or expose the three files for download

The raster output should be deterministic enough that the same input and renderer styling produce stable visual results. Exact byte-for-byte determinism is not required in the design, but unnecessary drift should be avoided.

## Supported Markdown Behavior

For v1, the system should take a practical stance:

- standard markdown constructs in the supported set should render consistently
- raw HTML should pass through
- unsupported constructs should fail in a visible and understandable way or degrade to plain rendering

The system should not silently transform author intent into unrelated presentation structures.

## Error Handling

V1 error handling should be simple and local:

- invalid or malformed markdown should still attempt to preview where possible
- raw HTML that creates invalid layout should surface in preview rather than being silently suppressed
- export failures should present a clear message and preserve the source content in the editor

There is no need for a backend job system, queues, retries, or persistence in v1.

## Scope Boundaries For Future Versions

The design intentionally leaves room for later additions:

- stacked slices instead of one full-image export
- custom syntax and branded custom blocks
- selective native markdown islands for copyable content
- saved projects

These future features should not shape the v1 implementation beyond keeping code boundaries clean enough to support them later.

## Open Implementation Questions

These are implementation questions, not product-definition blockers:

- whether the preview editor should be a plain textarea or a richer code editor
- whether export downloads a zip or exposes separate download buttons
- how strict unsupported markdown handling should be in the initial release

These can be decided in the implementation plan without changing the product contract.

## Acceptance Criteria

V1 is complete when:

- a user can paste a normal GitHub `README.md` into a single-page app
- the app shows a custom-rendered live preview in light and dark modes
- the rendered output preserves authored structure rather than using heuristics
- raw HTML renders in preview and export
- export produces `readme-light.png`, `readme-dark.png`, and a wrapper `README.md`
- the exported README works on GitHub using automatic light and dark switching
- the page background of the exported images matches GitHub exactly
- the result looks clearly more designed than native GitHub markdown while still feeling GitHub-compatible
