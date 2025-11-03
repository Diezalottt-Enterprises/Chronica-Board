// Vitest setup file for Chronica v0.1.0-alpha
import "@testing-library/jest-dom/vitest";

// Mock Tauri API for testing
(globalThis.window as any).__TAURI_INTERNALS__ = {} as never;
