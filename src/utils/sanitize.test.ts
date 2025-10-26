// Unit tests for sanitize utilities
import { describe, it, expect } from "vitest";
import { sanitizeTitle, sanitizeDescription, sanitizeColor } from "./sanitize";

describe("sanitize utilities", () => {
  describe("sanitizeTitle", () => {
    it("should trim whitespace", () => {
      expect(sanitizeTitle("  Hello  ")).toBe("Hello");
    });

    it("should truncate to max length", () => {
      const longTitle = "a".repeat(300);
      const result = sanitizeTitle(longTitle);
      expect(result.length).toBeLessThanOrEqual(200);
    });

    it("should sanitize HTML", () => {
      expect(sanitizeTitle("<script>alert('xss')</script>Hello")).toBe("Hello");
    });

    it("should handle empty string", () => {
      expect(sanitizeTitle("")).toBe("");
    });
  });

  describe("sanitizeDescription", () => {
    it("should return undefined for empty input", () => {
      expect(sanitizeDescription("")).toBeUndefined();
      expect(sanitizeDescription("   ")).toBeUndefined();
    });

    it("should trim and sanitize HTML", () => {
      const result = sanitizeDescription("  <b>Bold</b> text  ");
      expect(result).toBe("<b>Bold</b> text");
    });

    it("should truncate long descriptions", () => {
      const longDesc = "a".repeat(10000);
      const result = sanitizeDescription(longDesc);
      expect(result).toBeDefined();
      if (result) {
        expect(result.length).toBeLessThanOrEqual(5000);
      }
    });
  });

  describe("sanitizeColor", () => {
    it("should return valid hex colors", () => {
      expect(sanitizeColor("#FF0000")).toBe("#FF0000");
      expect(sanitizeColor("#fff")).toBe("#fff");
    });

    it("should return default for invalid hex", () => {
      expect(sanitizeColor("red")).toBe("#6fc2db");
      expect(sanitizeColor("#gggggg")).toBe("#6fc2db");
    });

    it("should handle predefined color names", () => {
      expect(sanitizeColor("mint")).toBe("mint");
      expect(sanitizeColor("cyan")).toBe("cyan");
    });

    it("should handle empty input", () => {
      expect(sanitizeColor("")).toBe("#6fc2db");
    });
  });
});
