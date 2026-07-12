import { useState } from "react";
import { ExportBar } from "./components/export-bar";
import { PreviewPane } from "./components/preview-pane";
import { EditorPane } from "./components/editor-pane";
import { SAMPLE_README } from "./lib/sample-readme";
import type { RenderTheme } from "./lib/theme";

export default function App() {
  const [source, setSource] = useState(SAMPLE_README);
  const [theme, setTheme] = useState<RenderTheme>("light");
  const lineCount = source.split("\n").length;

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar__copy">
          <p className="eyebrow">README compiler</p>
          <h1>readmeplusplus</h1>
          <p className="topbar__description">
            Compose, preview, and export GitHub-ready README imagery.
          </p>
        </div>
        <ExportBar theme={theme} onThemeChange={setTheme} />
      </header>

      <section className="status-strip" aria-label="Workspace status">
        <p>Preview and CLI export share the same HTML document renderer.</p>
        <p>
          {lineCount} lines in source · {theme} GitHub page background · browser download writes wrapper
          README only · PNG export runs via <code>bun run export</code>
        </p>
      </section>

      <main className="workspace" aria-label="README workspace">
        <section className="pane pane--source" aria-label="Source markdown">
          <EditorPane source={source} onChange={setSource} />
        </section>
        <section className="pane pane--preview" aria-label="Rendered preview">
          <PreviewPane source={source} theme={theme} />
        </section>
      </main>
    </div>
  );
}
