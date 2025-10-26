// Custom field schema definitions for Chronica v0.1.0-alpha
// Type-safe field definitions with validation
import { z } from "zod";

/**
 * Field types supported
 */
export type FieldType = "text" | "number" | "date" | "select" | "url" | "checkbox";

/**
 * Field validation limits
 */
export const FIELD_LIMITS = {
  MAX_FIELDS_PER_BOARD: 20,
  MAX_LABEL_LENGTH: 50,
  MAX_TEXT_LENGTH: 1000,
  MAX_SELECT_OPTIONS: 100,
  MAX_OPTION_LENGTH: 100,
} as const;

/**
 * Safe regex patterns that won't cause ReDoS
 * Validated list of allowed patterns
 */
export const SAFE_REGEX_PATTERNS: Record<string, RegExp> = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[1-9]\d{1,14}$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  url: /^https?:\/\/.+/,
} as const;

/**
 * Validate regex pattern for safety (prevent ReDoS)
 */
function isValidRegexPattern(pattern: string): boolean {
  // Check if it's a predefined safe pattern
  if (Object.values(SAFE_REGEX_PATTERNS).some((p) => p.source === pattern)) {
    return true;
  }

  // Reject patterns with known ReDoS risks
  const dangerousPatterns = [
    /\(\?.*\)\+/, // Nested quantifiers
    /\(\.\*\)\+/, // .* with +
    /\{.*,.*\}\+/, // Range quantifiers with +
  ];

  for (const dangerous of dangerousPatterns) {
    if (dangerous.test(pattern)) {
      return false;
    }
  }

  // Test if pattern is valid and not too complex
  try {
    const regex = new RegExp(pattern);
    // Test execution time on simple string
    const start = Date.now();
    regex.test("test");
    const duration = Date.now() - start;
    return duration < 10; // Max 10ms execution
  } catch {
    return false;
  }
}

/**
 * Field validation configuration
 */
export interface FieldValidation {
  maxLength?: number; // For text fields (max 1000)
  pattern?: string; // Regex pattern (validated for safety)
  min?: number; // For number fields
  max?: number; // For number fields
  options?: string[]; // For select fields (max 100 options)
}

/**
 * Field definition interface
 */
export interface FieldDefinition {
  id: string; // UUID
  label: string; // Display name (max 50 chars)
  type: FieldType;
  required?: boolean;
  validation?: FieldValidation;
}

/**
 * Zod schema for field validation config
 */
export const FieldValidationSchema = z
  .object({
    maxLength: z.number().int().min(1).max(FIELD_LIMITS.MAX_TEXT_LENGTH).optional(),
    pattern: z
      .string()
      .refine(isValidRegexPattern, { message: "Invalid or unsafe regex pattern" })
      .optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    options: z
      .array(z.string().max(FIELD_LIMITS.MAX_OPTION_LENGTH))
      .max(FIELD_LIMITS.MAX_SELECT_OPTIONS)
      .optional(),
  })
  .refine(
    (data) => {
      // If min and max are both defined, min must be < max
      if (data.min !== undefined && data.max !== undefined) {
        return data.min < data.max;
      }
      return true;
    },
    { message: "min must be less than max" }
  );

/**
 * Zod schema for field definition
 */
export const FieldDefinitionSchema = z.object({
  id: z.string().uuid(),
  label: z.string().min(1).max(FIELD_LIMITS.MAX_LABEL_LENGTH),
  type: z.enum(["text", "number", "date", "select", "url", "checkbox"]),
  required: z.boolean().optional(),
  validation: FieldValidationSchema.optional(),
});

/**
 * Validate field definition
 */
export function validateFieldDefinition(field: unknown): FieldDefinition {
  return FieldDefinitionSchema.parse(field);
}

/**
 * Create default field definition
 */
export function createDefaultFieldDefinition(
  id: string,
  label: string,
  type: FieldType
): FieldDefinition {
  return {
    id,
    label,
    type,
    required: false,
  };
}

/**
 * Field value types
 */
export type FieldValue =
  | string // text, url, date
  | number // number
  | boolean // checkbox
  | null
  | undefined;

/**
 * Validate field value against definition
 */
export function validateFieldValue(
  value: unknown,
  field: FieldDefinition
): { valid: boolean; error?: string } {
  // Handle required fields
  if (field.required && (value === null || value === undefined || value === "")) {
    return { valid: false, error: `${field.label} is required` };
  }

  // Allow empty optional fields
  if (!field.required && (value === null || value === undefined || value === "")) {
    return { valid: true };
  }

  // Type-specific validation
  switch (field.type) {
    case "text":
      if (typeof value !== "string") {
        return { valid: false, error: "Must be text" };
      }
      if (field.validation?.maxLength && value.length > field.validation.maxLength) {
        return { valid: false, error: `Max ${field.validation.maxLength} characters` };
      }
      if (field.validation?.pattern) {
        const regex = new RegExp(field.validation.pattern);
        if (!regex.test(value)) {
          return { valid: false, error: "Invalid format" };
        }
      }
      return { valid: true };

    case "number":
      if (typeof value !== "number") {
        return { valid: false, error: "Must be a number" };
      }
      if (field.validation?.min !== undefined && value < field.validation.min) {
        return { valid: false, error: `Minimum value is ${field.validation.min}` };
      }
      if (field.validation?.max !== undefined && value > field.validation.max) {
        return { valid: false, error: `Maximum value is ${field.validation.max}` };
      }
      return { valid: true };

    case "date": {
      if (typeof value !== "string") {
        return { valid: false, error: "Must be a date string" };
      }
      // Validate ISO date format
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return { valid: false, error: "Invalid date" };
      }
      return { valid: true };
    }

    case "select":
      if (typeof value !== "string") {
        return { valid: false, error: "Must be text" };
      }
      if (field.validation?.options && !field.validation.options.includes(value)) {
        return { valid: false, error: "Invalid option" };
      }
      return { valid: true };

    case "url":
      if (typeof value !== "string") {
        return { valid: false, error: "Must be a URL" };
      }
      try {
        const url = new URL(value);
        const allowedProtocols = ["http:", "https:"];
        if (!allowedProtocols.includes(url.protocol)) {
          return { valid: false, error: "Only HTTP/HTTPS URLs allowed" };
        }
        return { valid: true };
      } catch {
        return { valid: false, error: "Invalid URL" };
      }

    case "checkbox":
      if (typeof value !== "boolean") {
        return { valid: false, error: "Must be true or false" };
      }
      return { valid: true };

    default:
      return { valid: false, error: "Unknown field type" };
  }
}
