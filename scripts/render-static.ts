import { resolve, dirname, extname, relative } from "node:path";
import { getRenderDocument } from "../src/lib/render-document";
import type { RenderTheme } from "../src/lib/theme";

const ALLOWED_ASSET_EXTENSIONS = new Set([
  ".apng",
  ".avif",
  ".bmp",
  ".gif",
  ".ico",
  ".jpeg",
  ".jpg",
  ".png",
  ".svg",
  ".webp",
]);

interface StartStaticRendererOptions {
  sourcePath: string;
  theme: RenderTheme;
  port?: number;
  title?: string;
}

interface StaticRendererHandle {
  port: number;
  stop: () => void;
  url: string;
}

function resolveRequestedPath(baseDir: string, pathname: string): string | null {
  const decodedPath = decodeURIComponent(pathname);
  const requestedPath = resolve(baseDir, `.${decodedPath}`);
  const relativePath = relative(baseDir, requestedPath);

  if (relativePath.startsWith("..") || relativePath === "") {
    return null;
  }

  return requestedPath;
}

function createAssetResponse(filePath: string): Response {
  const file = Bun.file(filePath);

  return new Response(file, {
    headers: file.type ? { "content-type": file.type } : undefined,
  });
}

function isAllowedAssetPath(filePath: string): boolean {
  return ALLOWED_ASSET_EXTENSIONS.has(extname(filePath).toLowerCase());
}

export async function startStaticRenderer({
  sourcePath,
  theme,
  port = 0,
  title = "readmeplusplus export",
}: StartStaticRendererOptions): Promise<StaticRendererHandle> {
  const absoluteSourcePath = resolve(sourcePath);
  const sourceDir = dirname(absoluteSourcePath);
  const source = await Bun.file(absoluteSourcePath).text();

  const server = Bun.serve({
    hostname: "127.0.0.1",
    port,
    fetch(request) {
      const url = new URL(request.url);

      if (url.pathname === "/" || url.pathname === "/index.html") {
        return new Response(getRenderDocument(title, source, theme), {
          headers: { "content-type": "text/html; charset=utf-8" },
        });
      }

      const requestedPath = resolveRequestedPath(sourceDir, url.pathname);
      if (!requestedPath || !isAllowedAssetPath(requestedPath)) {
        return new Response("Not found", { status: 404 });
      }

      const file = Bun.file(requestedPath);
      return file.exists()
        .then((exists) =>
          exists ? createAssetResponse(requestedPath) : new Response("Not found", { status: 404 }),
        )
        .catch(() => new Response("Not found", { status: 404 }));
    },
  });

  const resolvedPort = server.port ?? port;

  return {
    port: resolvedPort,
    stop: () => server.stop(true),
    url: `http://127.0.0.1:${resolvedPort}/`,
  };
}

if (import.meta.main) {
  const sourcePath = process.argv[2];
  const themeArg: RenderTheme = process.argv[3] === "dark" ? "dark" : "light";

  if (!sourcePath) {
    throw new Error("Usage: bun run scripts/render-static.ts <markdown-file> [light|dark]");
  }

  const server = await startStaticRenderer({
    sourcePath,
    theme: themeArg,
    title: "readmeplusplus static preview",
    port: 4179,
  });

  console.log(`render-static ready on ${server.url} for theme ${themeArg}`);
}
