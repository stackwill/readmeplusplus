export type RenderTheme = "light" | "dark";

export const GITHUB_PAGE_BACKGROUNDS: Record<RenderTheme, string> = {
  light: "#ffffff",
  dark: "#0d1117",
} as const;

export const GITHUB_RENDER_THEMES = {
  light: {
    colorScheme: "light",
    panelBackground: "#f8fafc",
    panelBorder: "#d0d7de",
    panelShadow: "0 30px 80px rgba(15, 23, 42, 0.12)",
    textPrimary: "#1f2328",
    textSecondary: "#434d5a",
    textMuted: "#57606a",
    accent: "#0969da",
    accentSoft: "rgba(9, 105, 218, 0.12)",
    accentStrong: "#0550ae",
    codeBackground: "#eef2ff",
    codeBorder: "#c6d4f7",
    rule: "#d8dee4",
    quoteBorder: "#2f81f7",
    quoteBackground: "rgba(9, 105, 218, 0.07)",
    tableHeader: "#f3f4f6",
    selection: "rgba(9, 105, 218, 0.18)",
  },
  dark: {
    colorScheme: "dark",
    panelBackground: "#161b22",
    panelBorder: "#30363d",
    panelShadow: "0 30px 80px rgba(1, 4, 9, 0.55)",
    textPrimary: "#e6edf3",
    textSecondary: "#c9d1d9",
    textMuted: "#8b949e",
    accent: "#58a6ff",
    accentSoft: "rgba(88, 166, 255, 0.12)",
    accentStrong: "#79c0ff",
    codeBackground: "#0f1724",
    codeBorder: "#253041",
    rule: "#21262d",
    quoteBorder: "#58a6ff",
    quoteBackground: "rgba(31, 111, 235, 0.12)",
    tableHeader: "#11161d",
    selection: "rgba(88, 166, 255, 0.2)",
  },
} as const satisfies Record<
  RenderTheme,
  {
    colorScheme: "light" | "dark";
    panelBackground: string;
    panelBorder: string;
    panelShadow: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    accent: string;
    accentSoft: string;
    accentStrong: string;
    codeBackground: string;
    codeBorder: string;
    rule: string;
    quoteBorder: string;
    quoteBackground: string;
    tableHeader: string;
    selection: string;
  }
>;

export const RENDER_THEMES: readonly RenderTheme[] = ["light", "dark"] as const;
