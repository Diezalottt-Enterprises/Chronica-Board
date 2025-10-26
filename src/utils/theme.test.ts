// Unit tests for theme utilities
import { describe, it, expect } from "vitest";
import { hexToRgba, isDark, isValidHex } from "./theme";

describe("theme utilities", () => {
  describe("hexToRgba", () => {
    it("should convert 6-digit hex to rgba", () => {
      expect(hexToRgba("#FF0000", 0.5)).toBe("rgba(255, 0, 0, 0.5)");
      expect(hexToRgba("#00FF00", 1)).toBe("rgba(0, 255, 0, 1)");
    });

    it("should convert 3-digit hex to rgba", () => {
      expect(hexToRgba("#F00", 0.5)).toBe("rgba(255, 0, 0, 0.5)");
      expect(hexToRgba("#0F0", 1)).toBe("rgba(0, 255, 0, 1)");
    });

    it("should handle lowercase hex", () => {
      expect(hexToRgba("#ff0000", 0.5)).toBe("rgba(255, 0, 0, 0.5)");
    });
  });

  describe("isDark", () => {
    it("should identify dark colors", () => {
      expect(isDark("#000000")).toBe(true);
      expect(isDark("#333333")).toBe(true);
      expect(isDark("#0000FF")).toBe(true);
    });

    it("should identify light colors", () => {
      expect(isDark("#FFFFFF")).toBe(false);
      expect(isDark("#FFFF00")).toBe(false);
      expect(isDark("#00FF00")).toBe(false);
    });
  });

  describe("isValidHex", () => {
    it("should validate correct hex colors", () => {
      expect(isValidHex("#FF0000")).toBe(true);
      expect(isValidHex("#fff")).toBe(true);
      expect(isValidHex("#123ABC")).toBe(true);
    });

    it("should reject invalid hex colors", () => {
      expect(isValidHex("FF0000")).toBe(false); // Missing #
      expect(isValidHex("#gg0000")).toBe(false); // Invalid chars
      expect(isValidHex("#FF00")).toBe(false); // Wrong length
      expect(isValidHex("red")).toBe(false);
    });
  });
});
