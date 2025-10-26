// Centralized version management for Chronica
// This is the single source of truth for version numbers

/**
 * App version - update here only
 */
export const VERSION = "0.1.0-alpha.3" as const;

/**
 * Version with 'v' prefix for display
 */
export const VERSION_DISPLAY = `v${VERSION}` as const;

/**
 * Version for filenames (no 'v' prefix)
 */
export const VERSION_FILENAME = VERSION;
