import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium, type Page, type Request, type Response } from "playwright";
import { buildWrapperReadme } from "../src/lib/readme-export";
import type { RenderTheme } from "../src/lib/theme";
import { startStaticRenderer } from "./render-static";

const input = process.argv[2];
const outputDir = process.argv[3] ?? "export";

if (!input) {
  throw new Error("Usage: bun run scripts/export-readme.ts <input-readme> [output-dir]");
}

const rootDir = process.cwd();
const exportRoot = resolve(rootDir, outputDir);
const assetsDir = resolve(exportRoot, "assets");
const wrapperPath = resolve(exportRoot, "README.md");

function createImageFailureTracker(page: Page) {
  const failedImageResponses = new Set<string>();
  const failedImageRequests = new Set<string>();

  const handleResponse = (response: Response) => {
    if (response.request().resourceType() !== "image") {
      return;
    }

    if (!response.ok()) {
      failedImageResponses.add(`${response.status()} ${response.url()}`);
    }
  };

  const handleRequestFailed = (request: Request) => {
    if (request.resourceType() !== "image") {
      return;
    }

    failedImageRequests.add(
      `${request.failure()?.errorText ?? "request failed"} ${request.url()}`,
    );
  };

  page.on("response", handleResponse);
  page.on("requestfailed", handleRequestFailed);

  return {
    collectFailures(additionalFailures: string[] = []) {
      return [
        ...Array.from(failedImageResponses),
        ...Array.from(failedImageRequests),
        ...additionalFailures.map((src) => `broken image ${src}`),
      ];
    },
    dispose() {
      page.off("response", handleResponse);
      page.off("requestfailed", handleRequestFailed);
    },
  };
}

async function waitForRenderStability(page: Page) {
  const imageDiagnostics = await page.evaluate(async () => {
    if ("fonts" in document && document.fonts) {
      await document.fonts.ready;
    }

    await Promise.all(
      Array.from(document.images).map((image) => {
        if (image.complete) {
          return Promise.resolve();
        }

        return new Promise<void>((resolveImage) => {
          image.addEventListener("load", () => resolveImage(), { once: true });
          image.addEventListener("error", () => resolveImage(), { once: true });
        });
      }),
    );

    return Array.from(document.images)
      .filter((image) => !image.complete || image.naturalWidth === 0)
      .map((image) => image.currentSrc || image.src || "(unknown image source)");
  });

  return imageDiagnostics;
}

function throwIfImageFailures(theme: RenderTheme, failures: string[]) {
  if (failures.length === 0) {
    return;
  }

  throw new Error(
    `Export failed for ${theme} theme because one or more images did not load:\n${failures
      .map((failure) => `- ${failure}`)
      .join("\n")}`,
  );
}

await mkdir(assetsDir, { recursive: true });

const browser = await chromium.launch();

try {
  for (const theme of ["light", "dark"] as const satisfies readonly RenderTheme[]) {
    const server = await startStaticRenderer({
      sourcePath: input,
      theme,
      title: `readmeplusplus export ${theme}`,
    });

    try {
      const page = await browser.newPage({
        viewport: { width: 1280, height: 720 },
        deviceScaleFactor: 2,
      });
      const imageFailureTracker = createImageFailureTracker(page);

      try {
        await page.goto(server.url, { waitUntil: "networkidle" });
        const imageDiagnostics = await waitForRenderStability(page);
        throwIfImageFailures(theme, imageFailureTracker.collectFailures(imageDiagnostics));
        await page.screenshot({
          path: resolve(assetsDir, `readme-${theme}.png`),
          fullPage: true,
          animations: "disabled",
        });
      } finally {
        imageFailureTracker.dispose();
        await page.close();
      }
    } finally {
      server.stop();
    }
  }
} finally {
  await browser.close();
}

await Bun.write(wrapperPath, buildWrapperReadme());

console.log(`Exported wrapper README to ${wrapperPath}`);
console.log(`Exported theme assets to ${assetsDir}`);
