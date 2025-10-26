// Vitest setup file for Chronica v0.1.0-alpha
import "@testing-library/jest-dom/vitest";

// Mock Tauri API for testing
global.window.__TAURI_INTERNALS__ = {} as never;
