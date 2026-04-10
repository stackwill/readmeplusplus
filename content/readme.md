# convertparty

<section class="hero">
  <p class="eyebrow">Linux-first conversion appliance</p>
  <p><strong>Upload loose files, choose one output format, watch the queue, and download completed results.</strong></p>
  <p><code>convertparty</code> is a small bulk conversion appliance with a bundled runtime, copyparty-inspired startup ergonomics, and an intentionally narrow self-hosted shape.</p>
</section>

<!-- readmeplusplus:copyable-install:start -->
```bash
curl -fsSL https://example.com/convertparty/install.sh | bash
```
<!-- readmeplusplus:copyable-install:end -->

<div class="stat-strip">
  <strong>3.12+</strong><span>Python runtime</span>
  <strong>11</strong><span>conversion domains</span>
  <strong>117</strong><span>local tests passing at the time of writing</span>
</div>

> Core rule: if a conversion path is presented as supported, the release artifact is expected to contain every runtime dependency needed to execute that path. No host-installed converters should be required for supported features.

## Project status

`convertparty` is best described as a usable, tested, intentionally narrow local utility rather than a broad hosted conversion platform.

- The browser flow works: upload loose files, choose a shared output, submit a batch, watch progress, download outputs.
- The Linux SFX build path exists and bundles the converter stack needed for supported routes.
- The codebase is compact enough to extend, but the product scope is intentionally conservative.
- The project is not trying to become a general hosted conversion service or chase every format forever.

## Why this exists

Most conversion tools are either single-purpose wrappers, developer-facing CLIs that assume you already manage the toolchain, or web services that move files off the machine.

`convertparty` aims at a different shape: appliance-style startup, website-only interaction, batch conversion as the default workflow, a bundled converter stack, persistent completed outputs until delivery, and minimal operational friction.

If `copyparty` is "bring your own browser and immediately have a useful local file appliance," `convertparty` is the same instinct pointed at conversion.

<section class="feature-grid">
  <article>
    <span>01</span>
    <h3>Bundle honestly</h3>
    <p>Supported routes should work from the release artifact itself, not from lucky host state.</p>
  </article>
  <article>
    <span>02</span>
    <h3>Batch by default</h3>
    <p>One upload batch produces one shared output format with per-file success and failure states.</p>
  </article>
  <article>
    <span>03</span>
    <h3>Stay appliance-shaped</h3>
    <p>The UI, terminal banner, QR startup, and release flow are built around local utility.</p>
  </article>
</section>

## Highlights

- Self-extracting Python SFX for Linux releases
- Copyparty-inspired UI with server-rendered HTML and minimal JavaScript
- Batch jobs with per-file success and failure states
- Direct download for single-file jobs and zip bundle download for multi-file jobs
- Terminal startup banner with bundled tool visibility and optional QR output
- Runtime that prefers bundled binaries over host-installed ones
- Curated conversion options for selected routes such as bitrate, resolution, quality, and archive compression

## Support at a glance

When the full bundled toolchain is staged, the registry currently exposes support across **11 domains**, **195 input extensions**, **75 output extensions**, **110 adapter route definitions**, and **2,386 direct input to output conversion pairs**.

| Domain | Backing tool | What it covers |
| --- | --- | --- |
| Audio | `ffmpeg` | `wav -> mp3`, `flac -> opus`, `m4a -> wav` |
| Video | `ffmpeg` | `mp4 -> webm`, `mov -> gif`, `mkv -> mp3` |
| Images | `ImageMagick`, RAW adapter | `png -> webp`, `heic -> jpg`, `nef -> tiff` |
| Documents | `pandoc`, `tectonic`, `pdftotext`, `pdftocairo` | `md -> pdf`, `docbook -> epub`, `pdf -> txt`, `pdf -> png` |
| Office docs | `LibreOffice` | `docx -> pdf`, `xlsx -> csv`, `pptx -> html` |
| Ebooks | `Calibre` | `epub -> azw3`, `mobi -> epub`, `pdf -> fb2` |
| Archives | `7z` | `zip -> tar.gz`, `rar -> 7z`, `tar.xz -> zip` |
| OCR | `tesseract` | `png -> txt`, `tiff -> hocr`, `jpg -> tsv` |
| Structured data | `jq`/`yq`/`xq`/`tomlq` | `json <-> yaml`, `toml -> json`, `xml -> yaml` |
| Tabular data | `DuckDB` | `csv <-> parquet`, `jsonl -> tsv`, `parquet -> json` |

Representative format families currently wired into the registry:

- Audio: `aac`, `flac`, `m4a`, `mp3`, `ogg`, `opus`, `wav`, `wma`
- Video: `avi`, `gif`, `mkv`, `mov`, `mp4`, `mpeg`, `ts`, `webm`, `wmv`
- Images: `avif`, `bmp`, `gif`, `heic`, `jpeg`, `jpg`, `jp2`, `jxl`, `png`, `svg`, `tiff`, `webp`
- Documents: `docx`, `epub`, `html`, `ipynb`, `latex`, `markdown`, `md`, `odt`, `org`, `rst`, `rtf`, `txt`, `typst`
- Archives: `7z`, `zip`, `rar`, `tar`, `tar.gz`, `tar.xz`, `tar.bz2`, `tar.zst`, `gz`, `xz`, `bz2`, `zst`
- Data: `json`, `yaml`, `yml`, `xml`, `toml`, `csv`, `tsv`, `jsonl`, `parquet`

The live UI exposes the full route matrix for whatever tool bundle is actually available at runtime.

## What the UI does

The main page is a conversion dashboard, not a file browser:

1. Drop one or more loose files into the upload tray.
2. `convertparty` computes the shared output formats for the current selection.
3. Pick one target format.
4. Optionally set route-specific conversion knobs.
5. Submit the batch.
6. Watch progress on the job page.
7. Download outputs one by one or as a bundle.

Completed outputs persist on disk until downloaded or manually removed. If the process restarts while work is active, unfinished tasks are marked failed explicitly on restart rather than silently disappearing.

## Copyparty influence

This repository is intentionally close to `copyparty` in spirit:

- the website is server-rendered HTML first
- the terminal boot output is part of the product experience
- QR output is built into startup
- the interface feels like an appliance, not a SaaS landing page
- theming is file-based and lightweight
- one artifact should be enough to get a working local service

The implementation is still its own thing. `convertparty` is not a `copyparty` fork and does not reuse the `copyparty` codebase as its runtime foundation.

## Running from source

Create a local development environment:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install -U pip
python -m pip install -e .[dev]
```

Run the test suite:

```bash
python -m pytest
```

Start the local app directly from source:

```bash
scripts/run_dev.sh
```

Useful variations:

```bash
HOST=0.0.0.0 PORT=4010 scripts/run_dev.sh
scripts/run_dev.sh --qr
python -m convertparty.main --host 127.0.0.1 --port 3923 --state-dir ./runtime
```

## Building the appliance

The release build produces a self-extracting Python archive plus the compressed runtime payload:

- `dist/convertparty-sfx.py`
- `dist/payload.tar.gz`

Build them with the project script:

```bash
bash scripts/build_release.sh
```

That build currently does the following:

1. Compiles the Python source as a quick sanity check.
2. Stages the native converter toolchain into `build/tools/linux-x86_64`.
3. Bundles Python dependencies needed by the appliance into `build/pylib`.
4. Produces the SFX and payload artifacts in `dist/`.

## Release artifact behavior

Running the built SFX on Linux should feel like an appliance boot:

- the bootstrap picks a writable extraction workspace
- stale extracted bundles from dead processes are cleaned up
- the payload is unpacked
- bundled tools are placed ahead of the host `PATH`
- the main runtime prints a compact tool-status banner
- local and LAN URLs are announced
- an ASCII QR code can be shown in the terminal

After extraction, the app runs `convertparty.main` with the staged bundle injected via `--bundle-dir`.

Default runtime state is kept under `~/.local/state/convertparty` unless `--state-dir` is supplied. SFX runs use the same app-level state model, with the staged bundle extracted separately by the bootstrap.

## Bundled runtime expectations

The appliance currently stages or wraps the following tools for release builds:

- `ffmpeg`
- `magick`
- `pandoc`
- `tectonic`
- `7z`
- `soffice`
- `ebook-convert`
- `pdftotext`
- `duckdb`
- `jq`
- `yq`
- `xq`
- `tomlq`
- `dcraw` or `dcraw_emu`

Some of these need packaging-specific wrappers so the bundle stays relocatable. `soffice` runs from the staged bundle, `ebook-convert` gets the right Calibre Python/resource paths, `yq`/`xq`/`tomlq` are exposed through bundled Python modules, and ImageMagick and Tectonic cache/config paths are redirected into the extracted bundle.

This is the appliance contract in practice: supported routes should come from bundled capability, not lucky host state.

## Development notes

- Python requirement: `3.12+`
- Runtime web stack: `Werkzeug` + `Jinja2`
- Tests: `pytest`
- Default listen address: `0.0.0.0:3923`
- Local dev launcher defaults to `127.0.0.1:3923`

If you are working on conversion support, the most important standard in this repository is simple: **do not claim a route is supported unless the release artifact actually carries everything needed to perform it**.
