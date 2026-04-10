# README++

> A GitHub README that escapes the markdown box without leaving the README.

<section class="hero">
  <p class="eyebrow">Rendered from markdown</p>
  <h1>One source file. Two GitHub-native themes. Zero markdown layout ceilings.</h1>
  <p>
    This whole panel is generated from <code>content/readme.md</code>, rendered
    with GitHub Primer light and dark tokens, then captured as PNGs for GitHub's
    light/dark <code>&lt;picture&gt;</code> switch.
  </p>
</section>

## Why

Markdown is great for text, but it is intentionally conservative. This prototype
keeps the README workflow while letting the rendered result behave like a custom
poster, dashboard, landing page, diagram, or whatever else is worth showing off.

<div class="feature-grid">
  <article>
    <span>01</span>
    <h3>Theme-aware</h3>
    <p>Builds matching light and dark images using Primer's GitHub-authored theme tokens.</p>
  </article>
  <article>
    <span>02</span>
    <h3>Markdown-fed</h3>
    <p>Write normal markdown, then drop into HTML when the layout needs to get weird.</p>
  </article>
  <article>
    <span>03</span>
    <h3>README-ready</h3>
    <p>The generated README uses a plain picture element, so GitHub swaps the asset automatically.</p>
  </article>
</div>

## Current trade-off

The screenshot is an image, so text is not selectable and links inside it are not
clickable. Keep anything that must be copied or clicked outside the image, below
the picture in the actual `README.md`.

```bash
bun install
bun run render
```

<div class="stat-strip">
  <strong>1280px</strong><span>default render width</span>
  <strong>2x</strong><span>pixel density</span>
  <strong>PNG</strong><span>GitHub-safe output</span>
</div>
