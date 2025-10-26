// Theme utilities for Chronica v0.1.0-alpha

export type Theme = "light" | "dark";

/**
 * Detect initial theme preference
 */
export function detectInitialTheme(): Theme {
  const saved = localStorage.getItem("chronica.theme") as Theme | null;
  if (saved) return saved;
  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

/**
 * Convert hex color to RGBA with alpha
 */
export function hexToRgba(hex: string, a: number): string {
  const x = hex.replace("#", "");
  const r = parseInt(x.length === 3 ? (x[0] ?? "") + (x[0] ?? "") : x.slice(0, 2), 16);
  const g = parseInt(x.length === 3 ? (x[1] ?? "") + (x[1] ?? "") : x.slice(2, 4), 16);
  const b = parseInt(x.length === 3 ? (x[2] ?? "") + (x[2] ?? "") : x.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/**
 * Check if a color is dark (for contrast)
 */
export function isDark(hex: string): boolean {
  const x = hex.replace("#", "");
  const r = parseInt(x.length === 3 ? (x[0] ?? "") + (x[0] ?? "") : x.slice(0, 2), 16);
  const g = parseInt(x.length === 3 ? (x[1] ?? "") + (x[1] ?? "") : x.slice(2, 4), 16);
  const b = parseInt(x.length === 3 ? (x[2] ?? "") + (x[2] ?? "") : x.slice(4, 6), 16);
  const L = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return L < 0.55;
}

/**
 * Validate hex color format
 */
export function isValidHex(hex: string): boolean {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex);
}

/**
 * Get column color styles based on theme
 */
export function getColumnColorStyles(color: string | null | undefined, theme: Theme) {
  if (!color) {
    return {
      headerBg: "",
      bodyBg: "",
      border: "",
      rail: "",
      textColor: "",
    };
  }

  const isLightTheme = theme === "light";

  return {
    headerBg: hexToRgba(color, isLightTheme ? 0.16 : 0.24),
    bodyBg: hexToRgba(color, isLightTheme ? 0.06 : 0.12),
    border: hexToRgba(color, isLightTheme ? 0.35 : 0.45),
    rail: color,
    textColor: isDark(color) ? "#ffffff" : "#000000",
  };
}
