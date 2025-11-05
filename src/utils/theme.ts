// Theme utilities for Chronica v0.1.0-alpha

export type Theme = "light" | "dark";
export type ColumnColorMode = "subtle" | "vibrant";
export type CardColorStyle = "border" | "filled";
export type CardColorIntensity = "subtle" | "vibrant";

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
 * Get column color styles based on theme and color mode
 */
export function getColumnColorStyles(
  color: string | null | undefined,
  theme: Theme,
  mode: ColumnColorMode = "subtle"
) {
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

  // Alpha values for subtle mode (gentle tints)
  const subtleAlphas = {
    headerBg: isLightTheme ? 0.16 : 0.24,
    bodyBg: isLightTheme ? 0.06 : 0.12,
    border: isLightTheme ? 0.35 : 0.45,
  };

  // Alpha values for vibrant mode (bold, saturated colors)
  const vibrantAlphas = {
    headerBg: isLightTheme ? 0.5 : 0.6,
    bodyBg: isLightTheme ? 0.15 : 0.25,
    border: isLightTheme ? 0.7 : 0.8,
  };

  const alphas = mode === "vibrant" ? vibrantAlphas : subtleAlphas;

  return {
    headerBg: hexToRgba(color, alphas.headerBg),
    bodyBg: hexToRgba(color, alphas.bodyBg),
    border: hexToRgba(color, alphas.border),
    rail: color, // Always solid
    textColor: isDark(color) ? "#ffffff" : "#000000",
  };
}

/**
 * Get card color styles based on theme, style mode, and intensity
 */
export function getCardColorStyles(
  color: string | null | undefined,
  theme: Theme,
  style: CardColorStyle = "border",
  intensity: CardColorIntensity = "subtle"
) {
  if (!color) {
    // No color set - use default card styling
    return {
      background: "var(--bg-surface)",
      borderLeft: "4px solid var(--border)",
      color: "var(--text-primary)",
    };
  }

  // Border-only mode (current default behavior)
  if (style === "border") {
    return {
      background: "var(--bg-surface)",
      borderLeft: `4px solid ${color}`,
      color: "var(--text-primary)",
    };
  }

  // Filled mode with dynamic background
  const isLightTheme = theme === "light";

  // Alpha values for filled card backgrounds
  // Cards are primary content, so even vibrant is less intense than column headers
  const subtleAlphas = {
    bg: isLightTheme ? 0.12 : 0.18,
  };

  const vibrantAlphas = {
    bg: isLightTheme ? 0.35 : 0.45,
  };

  const alpha = intensity === "vibrant" ? vibrantAlphas.bg : subtleAlphas.bg;

  return {
    background: hexToRgba(color, alpha),
    borderLeft: `4px solid ${color}`,
    color: isDark(color) ? "#ffffff" : "#000000", // Auto-contrast text
  };
}
