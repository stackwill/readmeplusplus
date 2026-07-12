import { buildWrapperReadme } from "../lib/readme-export";
import { RENDER_THEMES, type RenderTheme } from "../lib/theme";

interface ExportBarProps {
  theme: RenderTheme;
  onThemeChange: (nextTheme: RenderTheme) => void;
}

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function ExportBar({ theme, onThemeChange }: ExportBarProps) {
  const handleExport = () => {
    downloadText("README.md", buildWrapperReadme());
  };

  return (
    <div className="export-bar">
      <div className="export-bar__group" role="group" aria-label="Render theme">
        {RENDER_THEMES.map((nextTheme) => (
          <button
            key={nextTheme}
            type="button"
            className="export-bar__theme-button"
            aria-pressed={theme === nextTheme}
            onClick={() => onThemeChange(nextTheme)}
          >
            {nextTheme[0].toUpperCase() + nextTheme.slice(1)}
          </button>
        ))}
      </div>
      <div>
        <button
          type="button"
          className="export-bar__export-button"
          onClick={handleExport}
          title="Downloads only the wrapper README. Use bun run export for the PNG assets."
        >
          Download Wrapper README.md
        </button>
        <p
          style={{
            margin: "8px 0 0",
            maxWidth: "24rem",
            color: "#9cb0c7",
            fontSize: "0.85rem",
            lineHeight: 1.4,
          }}
        >
          Browser download saves the wrapper markdown only. Generate PNG assets with{" "}
          <code>bun run export</code>.
        </p>
      </div>
    </div>
  );
}
