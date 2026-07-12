import { mkdir, mkdtemp, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";

const rootDir = process.cwd();
const exportScript = resolve(rootDir, "scripts/export-readme.ts");
const successInput = resolve(rootDir, "scripts/fixtures/export-smoke.md");

async function assertFileExists(path: string) {
  const fileStat = await stat(path);
  if (!fileStat.isFile() || fileStat.size === 0) {
    throw new Error(`Expected non-empty file at ${path}`);
  }
}

async function runExport(inputPath: string, outputDir: string) {
  return Bun.spawn(["bun", "run", exportScript, inputPath, outputDir], {
    cwd: rootDir,
    stdout: "pipe",
    stderr: "pipe",
  });
}

const tempRoot = await mkdtemp(resolve(tmpdir(), "readmeplusplus-export-"));

try {
  const successOutputDir = resolve(tempRoot, "success-output");
  const successProcess = await runExport(successInput, successOutputDir);
  const successExitCode = await successProcess.exited;

  if (successExitCode !== 0) {
    const stderr = await new Response(successProcess.stderr).text();
    throw new Error(`Expected export success, got exit code ${successExitCode}.\n${stderr}`);
  }

  await assertFileExists(resolve(successOutputDir, "README.md"));
  await assertFileExists(resolve(successOutputDir, "assets/readme-light.png"));
  await assertFileExists(resolve(successOutputDir, "assets/readme-dark.png"));

  const brokenInputDir = resolve(tempRoot, "broken-input");
  await mkdir(brokenInputDir, { recursive: true });
  await Bun.write(
    resolve(brokenInputDir, "broken.md"),
    "# Broken export\n\n![Missing](./missing-image.png)\n",
  );

  const brokenOutputDir = resolve(tempRoot, "broken-output");
  const brokenProcess = await runExport(resolve(brokenInputDir, "broken.md"), brokenOutputDir);
  const brokenExitCode = await brokenProcess.exited;
  const brokenStderr = await new Response(brokenProcess.stderr).text();

  if (brokenExitCode === 0) {
    throw new Error("Expected export failure for missing image, but command succeeded.");
  }

  if (!brokenStderr.includes("did not load")) {
    throw new Error(
      `Expected clear missing-image failure output, got:\n${brokenStderr || "(no stderr output)"}`,
    );
  }

  console.log("Verified export success path and missing-image failure path.");
} finally {
  await rm(tempRoot, { recursive: true, force: true });
}
