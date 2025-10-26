// Environment-aware logger service for Chronica v0.1.0-alpha
// Only logs debug messages in development

interface Logger {
  debug: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
}

/**
 * Create logger instance
 * Debug logs only appear in development
 */
function createLogger(): Logger {
  const isDev = import.meta.env.DEV;

  return {
    debug: isDev ? console.log.bind(console, "[DEBUG]") : () => {},
    info: console.info.bind(console, "[INFO]"),
    warn: console.warn.bind(console, "[WARN]"),
    error: console.error.bind(console, "[ERROR]"),
  };
}

export const logger = createLogger();
