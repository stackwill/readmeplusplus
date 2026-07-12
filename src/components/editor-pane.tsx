interface EditorPaneProps {
  source: string;
  onChange: (nextSource: string) => void;
}

export function EditorPane({ source, onChange }: EditorPaneProps) {
  return (
    <div className="editor-pane">
      <div className="pane-heading">
        <div>
          <p className="pane-heading__eyebrow">Source</p>
          <h2 className="pane-heading__title">Markdown editor</h2>
        </div>
        <p className="pane-heading__meta">{source.length} characters</p>
      </div>
      <textarea
        aria-label="Markdown source"
        className="editor-pane__textarea"
        spellCheck={false}
        value={source}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
