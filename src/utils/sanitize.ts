// Sanitization utilities for Chronica v0.1.0-alpha
// Defense-in-depth against XSS and injection attacks
import DOMPurify from "dompurify";
import { PREDEFINED_COLORS } from "../state/types";

/**
 * Sanitize HTML content to prevent XSS
 * Strips all HTML tags and returns plain text
 */
export function sanitizeText(input: string): string {
  // Configure DOMPurify to strip all HTML
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [], // No attributes allowed
  });
}

/**
 * Validate and sanitize color
 * Allows predefined color names (mint, cyan, salmon, lavender, slate) or valid #RRGGBB hex format
 * Returns sanitized color or undefined if invalid
 */
export function sanitizeColor(color: string | undefined): string | undefined {
  if (!color) return undefined;

  // Check if it's a predefined color name
  if (color in PREDEFINED_COLORS) {
    return color;
  }

  // Only allow valid hex colors (#RRGGBB format)
  const hexRegex = /^#[0-9A-Fa-f]{6}$/;
  if (!hexRegex.test(color)) {
    console.warn(`[Security] Invalid color format rejected: ${color}`);
    return undefined;
  }

  return color;
}

/**
 * Validate URL for safety
 * Only allows http, https, and mailto protocols
 */
export function sanitizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url);

    // Only allow safe protocols
    const allowedProtocols = ["http:", "https:", "mailto:"];
    if (!allowedProtocols.includes(parsed.protocol)) {
      console.warn(`[Security] Dangerous protocol rejected: ${parsed.protocol}`);
      return null;
    }

    return url;
  } catch {
    console.warn(`[Security] Invalid URL rejected: ${url}`);
    return null;
  }
}

/**
 * Sanitize array of tags
 * Removes empty tags and duplicates, sanitizes each tag
 */
export function sanitizeTags(tags: string[] | undefined): string[] | undefined {
  if (!tags || tags.length === 0) return undefined;

  const sanitized = tags
    .map((tag) => sanitizeText(tag.trim()))
    .filter((tag) => tag.length > 0)
    .filter((tag, index, array) => array.indexOf(tag) === index) // Deduplicate
    .slice(0, 50); // Max 50 tags

  return sanitized.length > 0 ? sanitized : undefined;
}

/**
 * Sanitize card title
 * Max 200 characters
 */
export function sanitizeTitle(title: string): string {
  const sanitized = sanitizeText(title);
  return sanitized.slice(0, 200);
}

/**
 * Sanitize card description
 * Max 2000 characters
 */
export function sanitizeDescription(description: string | undefined): string | undefined {
  if (!description) return undefined;

  const sanitized = sanitizeText(description);
  return sanitized.length > 0 ? sanitized.slice(0, 2000) : undefined;
}
