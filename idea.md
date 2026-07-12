# README Image Split Idea

The core idea is to make a GitHub README feel like a designed page while keeping selected parts of it as real, copyable Markdown.

Most of the README is rendered into images. That gives full control over typography, spacing, layout, and theme-specific presentation without fighting GitHub's Markdown renderer. But anything that should remain interactive, selectable, or copyable can be left as normal Markdown in the final `README.md`.

The useful pattern is:

1. Keep one source document for the README content.
2. Mark one or more sections that should stay real Markdown.
3. Render the content before each real section into an image.
4. Emit the real Markdown section directly into `README.md`.
5. Render the content after it into the next image.
6. Stitch the final README together from image slices plus real Markdown islands.

For example, the README can be assembled like this:

````md
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./assets/readme-top-dark.png">
  <source media="(prefers-color-scheme: light)" srcset="./assets/readme-top-light.png">
  <img alt="Rendered README header" src="./assets/readme-top-light.png" width="100%">
</picture>

```bash
curl -fsSL https://example.com/install.sh | bash
```

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./assets/readme-bottom-dark.png">
  <source media="(prefers-color-scheme: light)" srcset="./assets/readme-bottom-light.png">
  <img alt="Rendered README details" src="./assets/readme-bottom-light.png" width="100%">
</picture>
````

The code block is real Markdown, so GitHub gives it the normal copy button and native styling. The rendered image slices above and below it should be designed to make that native block look intentional, not pasted in.

## Theme Contract

Preserve GitHub's native README theme colors so the image background blends into the surrounding page.

- Light background: `srgb(255,255,255)` / `#ffffff`
- Dark background: `srgb(13,17,23)` / `#0d1117`

The rendered artifacts should use these as the only page background colors. Avoid gradients, tinted sections, bokeh, or alternate fills if the goal is to blend cleanly with GitHub's page.

Use GitHub's native responsive image switching:

```md
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./assets/readme-dark.png">
  <source media="(prefers-color-scheme: light)" srcset="./assets/readme-light.png">
  <img alt="Rendered README" src="./assets/readme-light.png" width="100%">
</picture>
```

For split READMEs, use the same pattern for each slice:

```md
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./assets/readme-top-dark.png">
  <source media="(prefers-color-scheme: light)" srcset="./assets/readme-top-light.png">
  <img alt="Rendered README header" src="./assets/readme-top-light.png" width="100%">
</picture>
```

The `prefers-color-scheme` media query chooses the dark or light artifact automatically. The `<img>` fallback should point to the light artifact.

## What A Better Renderer Should Optimize For

A rewrite should focus less on the current implementation and more on making the seam invisible:

- render each image slice at the same effective width as GitHub's README content column
- match GitHub's native Markdown margins around real Markdown islands
- allow multiple real Markdown islands, not just one code block
- crop slices tightly so image backgrounds do not create extra blank vertical space
- preserve exact light and dark theme backgrounds
- make the generated README deterministic and easy to review
- use Bun for the local command runner if the project remains TypeScript-based

The important product idea is not "turn Markdown into one big screenshot." It is "use rendered images for the parts where design control matters, and leave real Markdown where GitHub's native behavior matters."
