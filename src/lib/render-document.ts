import { renderMarkdown } from "./markdown";
import { GITHUB_PAGE_BACKGROUNDS, GITHUB_RENDER_THEMES, type RenderTheme } from "./theme";

const GITHUB_FONT_STACK = '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"';
const MONO_FONT_STACK = '"SFMono-Regular", SFMono-Regular, ui-monospace, Menlo, Consolas, "Liberation Mono", monospace';

function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

export function getRenderDocument(title: string, source: string, theme: RenderTheme): string {
  const palette = GITHUB_RENDER_THEMES[theme];

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    :root {
      color-scheme: ${palette.colorScheme};
      --page: ${GITHUB_PAGE_BACKGROUNDS[theme]};
      --surface: ${palette.panelBackground};
      --border: ${palette.panelBorder};
      --text: ${palette.textPrimary};
      --text-2: ${palette.textSecondary};
      --muted: ${palette.textMuted};
      --accent: ${palette.accent};
      --accent-soft: ${palette.accentSoft};
      --accent-strong: ${palette.accentStrong};
      --code: ${palette.codeBackground};
      --code-border: ${palette.codeBorder};
      --rule: ${palette.rule};
      --quote: ${palette.quoteBackground};
      --quote-border: ${palette.quoteBorder};
      --table-head: ${palette.tableHeader};
      --selection: ${palette.selection};
    }

    * { box-sizing: border-box; }
    html, body { margin: 0; min-height: 100%; background: var(--page); }
    body { color: var(--text); font-family: ${GITHUB_FONT_STACK}; -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; }
    ::selection { background: var(--selection); }
    .document-shell { width: min(100%, 1040px); margin: 0 auto; padding: 44px 32px 72px; }
    .markdown-body { position: relative; padding: 46px 50px 60px; border: 1px solid var(--border); background: var(--surface); overflow-wrap: anywhere; }
    .markdown-body::before, .markdown-body::after { position: absolute; top: -1px; width: 74px; height: 4px; background: var(--accent); content: ""; }
    .markdown-body::before { left: -1px; }
    .markdown-body::after { right: -1px; opacity: .35; }
    .markdown-body > :first-child { margin-top: 0 !important; }
    .markdown-body > :last-child { margin-bottom: 0 !important; }

    /* Authored showcase primitives. These are deliberately opt-in raw HTML
       classes: the renderer never guesses at document semantics. */
    .rpp-kicker { margin: 0 0 .65rem !important; color: var(--accent) !important; font: 700 .72rem ${MONO_FONT_STACK}; letter-spacing: .14em; text-transform: uppercase; }
    .rpp-hero { position: relative; margin: -46px -50px 2.8rem; padding: 48px 50px 40px; border-bottom: 1px solid var(--border); background: linear-gradient(135deg, color-mix(in srgb, var(--accent-soft) 72%, var(--surface)), var(--surface) 58%); overflow: hidden; }
    .rpp-hero::after { position: absolute; right: -10px; bottom: -48px; width: 260px; height: 260px; border: 1px solid color-mix(in srgb, var(--accent) 35%, transparent); border-radius: 50%; box-shadow: 0 0 0 24px color-mix(in srgb, var(--accent) 10%, transparent), 0 0 0 49px color-mix(in srgb, var(--accent) 5%, transparent); content: ""; }
    .rpp-hero > * { position: relative; z-index: 1; }
    .rpp-hero h1 { max-width: 11ch; margin: 0 0 .9rem; padding: 0; border: 0; font-size: clamp(3.35rem, 8vw, 5.7rem); letter-spacing: -.07em; line-height: .9; }
    .rpp-hero p:last-child { max-width: 59ch; margin-bottom: 0; font-size: 1.12rem; }
    .rpp-rule { display: flex; gap: .55rem; align-items: center; margin: 1.5rem 0 0; color: var(--muted); font: 700 .7rem ${MONO_FONT_STACK}; letter-spacing: .06em; text-transform: uppercase; }
    .rpp-rule::before { width: 34px; height: 2px; background: var(--accent); content: ""; }
    .rpp-pills { display: flex; flex-wrap: wrap; gap: .55rem; margin: 1.25rem 0 1.7rem; }
    .rpp-pill { padding: .35rem .58rem; border: 1px solid var(--border); background: color-mix(in srgb, var(--surface) 75%, var(--accent-soft)); color: var(--text); font: 700 .7rem ${MONO_FONT_STACK}; letter-spacing: .035em; }
    .rpp-grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 1px; margin: 1.5rem 0 2.2rem; border: 1px solid var(--border); background: var(--border); }
    .rpp-card { grid-column: span 4; min-height: 164px; padding: 1.25rem 1.2rem; background: var(--surface); }
    .rpp-card--wide { grid-column: span 8; }
    .rpp-card__index { display: block; margin-bottom: 1.7rem; color: var(--accent); font: 700 .7rem ${MONO_FONT_STACK}; letter-spacing: .08em; }
    .rpp-card strong { display: block; margin-bottom: .42rem; font-size: 1.05rem; }
    .rpp-card span:last-child { display: block; color: var(--text-2); font-size: .89rem; line-height: 1.55; }
    .rpp-terminal { margin: 1.55rem 0 1.85rem; border: 1px solid var(--code-border); background: var(--code); }
    .rpp-terminal__top { display: flex; align-items: center; justify-content: space-between; padding: .65rem .85rem; border-bottom: 1px solid var(--code-border); color: var(--muted); font: 700 .68rem ${MONO_FONT_STACK}; letter-spacing: .07em; text-transform: uppercase; }
    .rpp-terminal__dots { display: flex; gap: 5px; }
    .rpp-terminal__dots i { width: 7px; height: 7px; border-radius: 50%; background: var(--accent); opacity: .7; }
    .rpp-terminal pre { margin: 0; padding: 1rem 1.15rem 1.15rem; color: var(--text); font: .88rem/1.65 ${MONO_FONT_STACK}; white-space: pre-wrap; }
    .rpp-terminal b { color: var(--accent); }
    .rpp-timeline { margin: 1.6rem 0 2.1rem; border-left: 1px solid var(--border); }
    .rpp-step { position: relative; display: grid; grid-template-columns: 88px 1fr; gap: 1.2rem; padding: 0 0 1.45rem 1.45rem; }
    .rpp-step::before { position: absolute; top: .2rem; left: -5px; width: 9px; height: 9px; border: 2px solid var(--surface); border-radius: 50%; background: var(--accent); content: ""; }
    .rpp-step:last-child { padding-bottom: 0; }
    .rpp-step__number { color: var(--accent); font: 700 .7rem ${MONO_FONT_STACK}; letter-spacing: .08em; }
    .rpp-step strong { display: block; margin: -.25rem 0 .25rem; }
    .rpp-step p { margin: 0; font-size: .92rem; }
    .rpp-endcap { margin: 3.1rem -50px -60px; padding: 1.5rem 50px; border-top: 1px solid var(--border); background: color-mix(in srgb, var(--surface) 92%, var(--accent-soft)); color: var(--muted); font: .75rem/1.55 ${MONO_FONT_STACK}; letter-spacing: .025em; }

    .markdown-body p { margin: 0 0 1rem; color: var(--text-2); line-height: 1.68; }
    .markdown-body a { color: var(--accent); font-weight: 600; text-decoration-thickness: 1px; text-underline-offset: .2em; }
    .markdown-body a:hover { color: var(--accent-strong); }
    .markdown-body strong { color: var(--text); font-weight: 700; }
    .markdown-body em { color: var(--text-2); }
    .markdown-body del { color: var(--muted); text-decoration-thickness: 1px; }
    .markdown-body small { color: var(--muted); }
    .markdown-body mark { padding: .08em .25em; background: var(--accent-soft); color: var(--text); }
    .markdown-body kbd { display: inline-block; min-width: 1.55em; padding: .12rem .38rem; border: 1px solid var(--border); border-bottom-width: 2px; border-radius: 5px; background: var(--surface); color: var(--text); font: .78em ${MONO_FONT_STACK}; text-align: center; }
    .markdown-body sub, .markdown-body sup { font-size: .72em; }

    .markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4, .markdown-body h5, .markdown-body h6 { color: var(--text); font-weight: 700; line-height: 1.2; }
    .markdown-body h1 { margin: 0 0 1.5rem; padding-bottom: 1.15rem; border-bottom: 1px solid var(--rule); font-size: clamp(2.25rem, 5vw, 3.55rem); letter-spacing: -.045em; }
    .markdown-body h2 { display: grid; grid-template-columns: 10px 1fr; gap: .7rem; align-items: center; margin: 2.8rem 0 1rem; font-size: clamp(1.55rem, 3vw, 2.05rem); letter-spacing: -.025em; }
    .markdown-body h2::before { width: 10px; height: 10px; background: var(--accent); content: ""; }
    .markdown-body h3 { margin: 2rem 0 .75rem; font-size: 1.35rem; }
    .markdown-body h4 { margin: 1.6rem 0 .65rem; font-size: 1.05rem; }
    .markdown-body h5, .markdown-body h6 { margin: 1.4rem 0 .55rem; color: var(--muted); font-size: .82rem; letter-spacing: .08em; text-transform: uppercase; }

    .markdown-body ul, .markdown-body ol { margin: 0 0 1.2rem; padding-left: 1.55rem; color: var(--text-2); }
    .markdown-body li { margin: .35rem 0; padding-left: .2rem; line-height: 1.58; }
    .markdown-body li::marker { color: var(--accent); font-weight: 700; }
    .markdown-body :is(ul, ol) :is(ul, ol) { margin: .4rem 0 .25rem; }
    .markdown-body .contains-task-list { padding-left: .25rem; list-style: none; }
    .markdown-body .task-list-item { padding-left: 0; list-style: none; }
    .task-list-item-checkbox { width: 1rem; height: 1rem; margin: 0 .55rem 0 0; vertical-align: -.15rem; accent-color: var(--accent); }

    .markdown-body code { padding: .14rem .38rem; border: 1px solid var(--code-border); border-radius: 5px; background: var(--code); color: var(--text); font-family: ${MONO_FONT_STACK}; font-size: .88em; }
    .code-block { margin: 1.35rem 0 1.6rem; border: 1px solid var(--code-border); background: var(--code); }
    .code-block__bar { display: flex; height: 31px; align-items: center; justify-content: flex-end; padding: 0 .8rem; border-bottom: 1px solid var(--code-border); color: var(--muted); font: 700 .68rem ${MONO_FONT_STACK}; letter-spacing: .08em; text-transform: uppercase; }
    .code-block pre { margin: 0; padding: 1.05rem 1.15rem 1.2rem; overflow-x: auto; }
    .code-block pre code { padding: 0; border: 0; border-radius: 0; background: transparent; font-size: .88rem; line-height: 1.62; }
    .markdown-body pre:not(.code-block pre) { margin: 1.35rem 0; padding: 1rem; overflow-x: auto; border: 1px solid var(--code-border); background: var(--code); }

    .markdown-body blockquote { position: relative; margin: 1.5rem 0; padding: 1rem 1.2rem 1rem 1.35rem; border-left: 4px solid var(--quote-border); background: var(--quote); color: var(--text-2); }
    .markdown-body blockquote > :last-child { margin-bottom: 0; }
    .markdown-body blockquote blockquote { margin: .8rem 0 0; }
    .markdown-body hr { height: 1px; margin: 2.4rem 0; border: 0; background: var(--rule); }

    .table-shell { width: 100%; margin: 1.4rem 0 1.8rem; overflow-x: auto; border: 1px solid var(--border); }
    .markdown-body table { width: 100%; min-width: 480px; border-spacing: 0; border-collapse: collapse; color: var(--text-2); }
    .markdown-body thead { background: var(--table-head); }
    .markdown-body th, .markdown-body td { padding: .72rem .85rem; border-right: 1px solid var(--border); border-bottom: 1px solid var(--border); text-align: left; vertical-align: top; }
    .markdown-body tr:last-child td { border-bottom: 0; }
    .markdown-body :is(th, td):last-child { border-right: 0; }
    .markdown-body th { color: var(--text); font-size: .78rem; font-weight: 700; letter-spacing: .045em; }
    .markdown-body tbody tr:nth-child(even) { background: color-mix(in srgb, var(--surface) 93%, var(--accent-soft) 7%); }

    .readme-image { display: block; margin: 1.6rem 0 1.8rem; }
    .readme-image img { display: block; max-width: 100%; height: auto; margin: 0 auto; border: 1px solid var(--border); }
    .readme-image__caption { display: block; margin-top: .55rem; color: var(--muted); font-size: .76rem; text-align: center; }
    .markdown-body p:has(> .readme-image:only-child) { margin: 0; }
    .markdown-body picture, .markdown-body video, .markdown-body iframe { display: block; max-width: 100%; margin: 1.5rem auto; }

    .markdown-body details { margin: 1.35rem 0; border: 1px solid var(--border); background: color-mix(in srgb, var(--surface) 94%, var(--accent-soft) 6%); }
    .markdown-body summary { padding: .8rem 1rem; cursor: pointer; color: var(--text); font-weight: 700; }
    .markdown-body details > :not(summary) { margin-right: 1rem; margin-left: 1rem; }
    .markdown-body dl { margin: 1.2rem 0; }
    .markdown-body dt { margin-top: .85rem; color: var(--text); font-weight: 700; }
    .markdown-body dd { margin: .25rem 0 .75rem 1.25rem; color: var(--text-2); }

    @media (max-width: 700px) {
      .document-shell { padding: 18px 12px 36px; }
      .markdown-body { padding: 30px 22px 42px; }
      .rpp-hero { margin: -30px -22px 2.2rem; padding: 34px 22px 30px; }
      .rpp-hero h1 { font-size: 3.1rem; }
      .rpp-card, .rpp-card--wide { grid-column: span 12; min-height: auto; }
      .rpp-step { grid-template-columns: 64px 1fr; gap: .7rem; padding-left: 1.05rem; }
      .rpp-endcap { margin: 2.4rem -22px -42px; padding: 1.2rem 22px; }
      .markdown-body h1 { font-size: 2.15rem; }
      .markdown-body h2 { font-size: 1.5rem; }
    }
  </style>
</head>
<body>
  <main class="document-shell">
    <article class="markdown-body" aria-label="${escapeHtml(title)}">${renderMarkdown(source)}</article>
  </main>
</body>
</html>`;
}
