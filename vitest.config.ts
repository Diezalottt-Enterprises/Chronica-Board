/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@ui": resolve(__dirname, "./src/ui"),
      "@stores": resolve(__dirname, "./src/stores"),
      "@services": resolve(__dirname, "./src/services"),
      "@io": resolve(__dirname, "./src/io"),
      "@platform": resolve(__dirname, "./src/platform"),
      "@state": resolve(__dirname, "./src/state"),
      "@constants": resolve(__dirname, "./src/constants"),
      "@utils": resolve(__dirname, "./src/utils"),
    },
  },
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: ["./src/test-utils/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov", "cobertura"],
      exclude: [
        "node_modules/**",
        "tauri/**",
        "dist/**",
        "src/test-utils/**",
        "**/*.d.ts",
        "**/*.config.ts",
        "**/*.config.js",
      ],
      include: ["src/**/*.ts", "src/**/*.tsx"],
      all: true,
      lines: 50,
      functions: 50,
      branches: 50,
      statements: 50,
    },
  },
});
