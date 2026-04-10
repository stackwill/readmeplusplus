# convertparty

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&height=240&color=0:1f3a5f,45:2c6e49,100:e9c46a&text=convertparty&fontAlignY=38&fontSize=56&desc=copyparty-inspired%20bulk%20conversion%20appliance&descAlignY=58&descAlign=50&fontColor=f8fafc&animation=fadeIn" alt="convertparty header" />
</p>

<p align="center">
  <img alt="Python 3.12+" src="https://img.shields.io/badge/python-3.12%2B-1f3a5f?style=for-the-badge&logo=python&logoColor=ffd343">
  <img alt="Linux-first" src="https://img.shields.io/badge/platform-linux--first-2c6e49?style=for-the-badge&logo=linux&logoColor=white">
  <img alt="Self-extracting release" src="https://img.shields.io/badge/release-python%20sfx-e9c46a?style=for-the-badge&logoColor=1f2933">
</p>

<p align="center">
  <strong>A small Linux-first conversion appliance with a bundled runtime.</strong><br>
  Upload loose files, choose one output format, watch the queue, download completed results.
</p>

`convertparty` is a Linux-first bulk file conversion appliance with a plain operational web UI and a self-extracting Python release artifact. It takes heavy inspiration from `copyparty`'s startup experience, terminal ergonomics, utility-first HTML, and appliance-like feel, but it is built from scratch around conversion jobs instead of file sharing.

> Core rule: if a conversion path is presented as supported, the release artifact is expected to contain every runtime dependency needed to execute that path. No host-installed converters should be required for supported features.

## Project status

`convertparty` is currently best described as a usable, tested, intentionally narrow local utility rather than a broad self-hosted platform.

- The current browser flow works: upload loose files, choose a shared output, submit a batch, watch progress, download outputs.
- The Linux SFX build path exists and bundles the converter stack needed for supported routes.
- The codebase is compact and active enough to extend, but the product scope is intentionally conservative.
- The project is not trying to outgrow into a general hosted conversion service or chase every format forever.
- Local test status at the time of writing: `117 passed`.

## Why this exists

Most conversion tools are either:

- single-purpose wrappers around one converter
- developer-facing CLIs that assume you already manage the toolchain
- web services that move files off the machine

`convertparty` aims at a different shape:

- appliance-style startup
- website-only interaction
- batch conversion as the default workflow
- bundled converter stack
- persistent completed outputs until delivery
- minimal operational friction

If `copyparty` is "bring your own browser and immediately have a useful local file appliance," `convertparty` is the same instinct pointed at conversion.

The point of the project is less "be the biggest converter" and more "ship an honest appliance artifact that really contains what it claims to support."

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
| Audio | `ffmpeg` | Common audio transcodes such as `wav -> mp3`, `flac -> opus`, `m4a -> wav` |
| Video | `ffmpeg` | Container and media conversion such as `mp4 -> webm`, `mov -> gif`, `mkv -> mp3` |
| Images | `ImageMagick`, RAW adapter | Raster and image export such as `png -> webp`, `heic -> jpg`, `nef -> tiff` |
| Documents | `pandoc`, `tectonic`, `pdftotext`, `pdftocairo` | Text and document conversion such as `md -> pdf`, `docbook -> epub`, `pdf -> txt`, `pdf -> png` |
| Office docs | `LibreOffice` | Office-oriented routes such as `docx -> pdf`, `xlsx -> csv`, `pptx -> html` |
| Ebooks | `Calibre` | Ebook conversion such as `epub -> azw3`, `mobi -> epub`, `pdf -> fb2` |
| Archives | `7z` | Archive-to-archive repacking such as `zip -> tar.gz`, `rar -> 7z`, `tar.xz -> zip` |
| OCR | `tesseract` | Image-to-text extraction such as `png -> txt`, `tiff -> hocr`, `jpg -> tsv` |
| Structured data | `jq`/`yq`/`xq`/`tomlq` | `json <-> yaml`, `toml -> json`, `xml -> yaml` |
| Tabular data | `DuckDB` | `csv <-> parquet`, `jsonl -> tsv`, `parquet -> json` |

Representative format families currently wired into the registry:

- Audio inputs include `aac`, `flac`, `m4a`, `mp3`, `ogg`, `opus`, `wav`, `wma`
- Video inputs include `avi`, `gif`, `mkv`, `mov`, `mp4`, `mpeg`, `ts`, `webm`, `wmv`
- Image inputs include `avif`, `bmp`, `gif`, `heic`, `jpeg`, `jpg`, `jp2`, `jxl`, `png`, `svg`, `tiff`, `webp`
- Document inputs include `docx`, `epub`, `html`, `ipynb`, `latex`, `markdown`, `md`, `odt`, `org`, `rst`, `rtf`, `txt`, `typst`
- Office-specific inputs include `doc`, `docx`, `odt`, `xls`, `xlsx`, `ods`, `ppt`, `pptx`, `odp`
- Ebook inputs include `azw3`, `cbz`, `chm`, `djvu`, `epub`, `fb2`, `mobi`, `odt`, `pdf`, `rtf`
- Archive inputs include `7z`, `zip`, `rar`, `tar`, `tar.gz`, `tar.xz`, `tar.bz2`, `tar.zst`, `gz`, `xz`, `bz2`, `zst`
- Structured inputs include `json`, `yaml`, `yml`, `xml`, `toml`
- Tabular inputs include `csv`, `tsv`, `json`, `jsonl`, `parquet`

The live UI exposes the full route matrix for whatever tool bundle is actually available at runtime.

## What the UI does

The main page is a conversion dashboard, not a file browser:

1. Drop one or more loose files into the upload tray
2. `convertparty` computes the shared output formats for the current selection
3. Pick one target format
4. Optionally set route-specific conversion knobs
5. Submit the batch
6. Watch progress on the job page
7. Download outputs one-by-one or as a bundle

Completed outputs persist on disk until downloaded or manually removed. If the process restarts while work is active, unfinished tasks are marked failed explicitly on restart rather than silently disappearing.

```mermaid
flowchart LR
    A[Upload loose files] --> B[Find shared outputs]
    B --> C[Create batch job]
    C --> D[Resolve one direct adapter path per file]
    D --> E[Run bundled toolchain]
    E --> F[Persist completed outputs]
    F --> G[Direct download or zip bundle]
```

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

1. Compiles the Python source as a quick sanity check
2. Stages the native converter toolchain into `build/tools/linux-x86_64`
3. Bundles Python dependencies needed by the appliance into `build/pylib`
4. Produces the SFX and payload artifacts in `dist/`

If you want the manual build path:

```bash
bash scripts/stage_tools.sh
python scripts/build_sfx.py
```

## Releasing

Releases are built locally and uploaded manually. There is intentionally no GitHub Actions release pipeline attached to tags.

Build release artifacts and checksums:

```bash
bash scripts/prepare_release.sh
```

That produces:

- `dist/convertparty-sfx.py`
- `dist/payload.tar.gz`
- `dist/SHA256SUMS.txt`

Then either:

1. Open GitHub's "Draft a new release" page and upload those files manually.
2. Or use the GitHub CLI:

```bash
gh release create v0.1.0 \
  dist/convertparty-sfx.py \
  dist/payload.tar.gz \
  dist/SHA256SUMS.txt \
  --draft \
  --title v0.1.0
```

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

Default runtime state is kept under:

- Linux source/dev runs: `~/.local/state/convertparty` unless `--state-dir` is supplied
- Linux SFX runs: same app-level state model, with the staged bundle extracted separately by the bootstrap

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

Some of these need packaging-specific wrappers so the bundle stays relocatable:

- `soffice` is wrapped so LibreOffice can run from the staged bundle
- `ebook-convert` is wrapped with the right Calibre Python/resource paths
- `yq`, `xq`, and `tomlq` are exposed through bundled Python modules in `build/pylib`
- ImageMagick and Tectonic cache/config paths are redirected into the extracted bundle

This is the appliance contract in practice: supported routes should come from bundled capability, not lucky host state.

## Project layout

```text
convertparty/
├── convertparty/
│   ├── main.py               # CLI startup, banner, and QR output
│   ├── app.py                # Runtime wiring
│   ├── web.py                # Routes, forms, downloads, HTML rendering
│   ├── jobs.py               # Job models, queue, restart reconciliation
│   ├── storage.py            # Upload and output persistence
│   ├── convert.py            # Route resolution and adapter execution
│   ├── registry.py           # Format matrix and adapter registry
│   ├── conversion_options.py # Curated per-route option schemas
│   └── adapters/             # Tool-specific conversion backends
├── scripts/
│   ├── stage_tools.sh        # Stage native toolchain into the release bundle
│   ├── build_sfx.py          # Build the self-extracting Python release
│   ├── build_release.sh      # End-to-end release build
│   ├── prepare_release.sh    # Build artifacts, write checksums, print release steps
│   └── run_dev.sh            # Local dev launcher
└── tests/                    # Behavioral coverage for web flow, registry, and SFX
```

## Current status

`convertparty` is usable today, but it is intentionally scoped:

- the core product loop is present and works
- the release artifact model exists
- the bundled toolchain staging logic is real
- the route matrix is broad enough to be useful
- the UI is intentionally operational rather than polished like a consumer app

The next bar is not "add more extensions forever." It is keeping the shipped artifact honest: every claimed route should keep honoring the appliance contract from the built SFX itself.

## Development notes

- Python requirement: `3.12+`
- Runtime web stack: `Werkzeug` + `Jinja2`
- Tests: `pytest`
- Default listen address: `0.0.0.0:3923`
- Local dev launcher defaults to `127.0.0.1:3923`

If you are working on conversion support, the most important standard in this repository is simple: **do not claim a route is supported unless the release artifact actually carries everything needed to perform it**.
