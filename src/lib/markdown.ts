import MarkdownIt from "markdown-it";

/**
 * README raw HTML is preserved for layout-oriented customization, but active
 * content is stripped so preview and export behave consistently and stay closer
 * to GitHub-compatible expectations.
 */
export const markdown = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

markdown.core.ruler.after("inline", "readme-task-lists", (state) => {
  for (let index = 0; index < state.tokens.length; index += 1) {
    const token = state.tokens[index];
    if (token.type !== "inline" || !token.children?.length) continue;

    const firstText = token.children.find((child) => child.type === "text");
    const task = firstText?.content.match(/^\[([ xX])\]\s+/);
    if (!firstText || !task) continue;

    firstText.content = firstText.content.slice(task[0].length);
    const checkbox = new state.Token("html_inline", "", 0);
    checkbox.content = `<input class="task-list-item-checkbox" type="checkbox" disabled${task[1].toLowerCase() === "x" ? " checked" : ""}>`;
    token.children.unshift(checkbox);

    for (let parentIndex = index - 1; parentIndex >= 0; parentIndex -= 1) {
      if (state.tokens[parentIndex].type === "list_item_open") {
        state.tokens[parentIndex].attrJoin("class", "task-list-item");
        break;
      }
      if (state.tokens[parentIndex].type === "list_item_close") break;
    }
  }
});

markdown.renderer.rules.bullet_list_open = (tokens, index, options, env, self) => {
  const token = tokens[index];
  const nextInline = tokens.slice(index + 1).find((candidate) => candidate.type === "inline");
  if (nextInline?.content.match(/^\[[ xX]\]\s+/)) token.attrJoin("class", "contains-task-list");
  return self.renderToken(tokens, index, options);
};

markdown.renderer.rules.fence = (tokens, index) => {
  const token = tokens[index];
  const language = token.info.trim().split(/\s+/)[0] || "text";
  const escapedLanguage = markdown.utils.escapeHtml(language);
  return `<div class="code-block"><div class="code-block__bar"><span>${escapedLanguage}</span></div><pre><code class="language-${escapedLanguage}">${markdown.utils.escapeHtml(token.content)}</code></pre></div>`;
};

markdown.renderer.rules.table_open = () => '<div class="table-shell"><table>\n';
markdown.renderer.rules.table_close = () => "</table></div>\n";

markdown.renderer.rules.image = (tokens, index) => {
  const token = tokens[index];
  const src = markdown.utils.escapeHtml(token.attrGet("src") ?? "");
  const title = token.attrGet("title");
  const alt = markdown.utils.escapeHtml(token.content);
  const titleAttribute = title ? ` title="${markdown.utils.escapeHtml(title)}"` : "";
  return `<span class="readme-image"><img src="${src}" alt="${alt}"${titleAttribute}>${alt ? `<span class="readme-image__caption">${alt}</span>` : ""}</span>`;
};

function sanitizeRenderedHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gis, "")
    .replace(/\son[a-z0-9:-]+\s*=\s*(".*?"|'.*?'|[^\s>]+)/gis, "")
    .replace(
      /\s(href|src)\s*=\s*("javascript:[^"]*"|'javascript:[^']*'|javascript:[^\s>]+)/gis,
      ' $1="#"',
    );
}

export function renderMarkdown(source: string): string {
  return sanitizeRenderedHtml(markdown.render(source));
}
