export const README_EXPORT_ASSET_PATHS = {
  dark: "./assets/readme-dark.png",
  light: "./assets/readme-light.png",
} as const;

export const README_EXPORT_IMAGE_ALT = "Rendered README";

export function buildWrapperReadme(): string {
  return `<picture>
  <source media="(prefers-color-scheme: dark)" srcset="${README_EXPORT_ASSET_PATHS.dark}">
  <source media="(prefers-color-scheme: light)" srcset="${README_EXPORT_ASSET_PATHS.light}">
  <img alt="${README_EXPORT_IMAGE_ALT}" src="${README_EXPORT_ASSET_PATHS.light}" width="100%">
</picture>
`;
}
