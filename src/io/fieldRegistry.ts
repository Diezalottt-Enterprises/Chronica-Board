// Field registry with dynamic validation for Chronica v0.1.0-alpha
// Validates card custom field values against field definitions
import type { FieldDefinition, FieldValue } from "./fieldSchema";
import { validateFieldValue } from "./fieldSchema";
import { sanitizeText, sanitizeUrl } from "../utils/sanitize";

/**
 * Field registry for managing and validating custom fields
 */
export class FieldRegistry {
  private fields: Map<string, FieldDefinition>;

  constructor(fields?: Record<string, FieldDefinition>) {
    this.fields = new Map();
    if (fields) {
      Object.entries(fields).forEach(([id, def]) => {
        this.fields.set(id, def);
      });
    }
  }

  /**
   * Get all field definitions as a record
   */
  getFieldsRecord(): Record<string, FieldDefinition> {
    const record: Record<string, FieldDefinition> = {};
    this.fields.forEach((def, id) => {
      record[id] = def;
    });
    return record;
  }

  /**
   * Get field definition by ID
   */
  getField(id: string): FieldDefinition | undefined {
    return this.fields.get(id);
  }

  /**
   * Get all field definitions
   */
  getAllFields(): FieldDefinition[] {
    return Array.from(this.fields.values());
  }

  /**
   * Add or update field definition
   */
  setField(id: string, definition: FieldDefinition): void {
    this.fields.set(id, definition);
  }

  /**
   * Remove field definition
   */
  removeField(id: string): boolean {
    return this.fields.delete(id);
  }

  /**
   * Check if field exists
   */
  hasField(id: string): boolean {
    return this.fields.has(id);
  }

  /**
   * Get field count
   */
  getFieldCount(): number {
    return this.fields.size;
  }

  /**
   * Sanitize field value based on type
   */
  sanitizeFieldValue(value: unknown, field: FieldDefinition): FieldValue {
    if (value === null || value === undefined) {
      return value;
    }

    switch (field.type) {
      case "text":
        return typeof value === "string" ? sanitizeText(value) : undefined;

      case "url":
        return typeof value === "string" ? sanitizeUrl(value) || undefined : undefined;

      default:
        // Other types don't need sanitization
        return value as FieldValue;
    }
  }

  /**
   * Validate single field value
   */
  validateValue(
    fieldId: string,
    value: unknown
  ): { valid: boolean; error?: string; sanitized?: FieldValue } {
    const field = this.fields.get(fieldId);
    if (!field) {
      return { valid: false, error: "Field not found" };
    }

    // Sanitize value
    const sanitized = this.sanitizeFieldValue(value, field);

    // Validate
    const result = validateFieldValue(sanitized, field);
    return {
      ...result,
      sanitized,
    };
  }

  /**
   * Validate all custom fields on a card
   */
  validateCardFields(customFields?: Record<string, unknown>): {
    valid: boolean;
    errors: Record<string, string>;
    sanitized: Record<string, FieldValue>;
  } {
    const errors: Record<string, string> = {};
    const sanitized: Record<string, FieldValue> = {};

    // Check required fields
    this.fields.forEach((_field, fieldId) => {
      const value = customFields?.[fieldId];
      const result = this.validateValue(fieldId, value);

      if (!result.valid && result.error) {
        errors[fieldId] = result.error;
      }

      if (result.sanitized !== undefined) {
        sanitized[fieldId] = result.sanitized;
      }
    });

    // Check for unknown fields in customFields
    if (customFields) {
      Object.keys(customFields).forEach((fieldId) => {
        if (!this.fields.has(fieldId)) {
          // Silently ignore unknown fields (for backwards compatibility)
          // Could optionally log a warning here
        }
      });
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
      sanitized,
    };
  }

  /**
   * Get default value for a field
   */
  getDefaultValue(fieldId: string): FieldValue {
    const field = this.fields.get(fieldId);
    if (!field) {
      return undefined;
    }

    switch (field.type) {
      case "text":
      case "url":
      case "date":
        return "";
      case "number":
        return field.validation?.min ?? 0;
      case "checkbox":
        return false;
      case "select":
        return field.validation?.options?.[0] ?? "";
      default:
        return undefined;
    }
  }

  /**
   * Clone registry
   */
  clone(): FieldRegistry {
    return new FieldRegistry(this.getFieldsRecord());
  }

  /**
   * Clear all fields
   */
  clear(): void {
    this.fields.clear();
  }
}

/**
 * Create field registry from config
 */
export function createFieldRegistry(fields?: Record<string, FieldDefinition>): FieldRegistry {
  return new FieldRegistry(fields);
}
