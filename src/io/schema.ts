// Zod schema validation for import/export (Chronica v0.1.0-alpha)
import { z } from "zod";
import { FieldDefinitionSchema, FIELD_LIMITS } from "./fieldSchema";

/**
 * Column schema - validates column structure
 */
export const ColumnSchema = z.object({
  key: z.string(),
  title: z.string(),
  order: z.number(),
  color: z.string().nullable().optional(),
  collapsed: z.boolean().optional(),
});

/**
 * Card schema - validates card structure
 */
export const CardSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  column: z.string(),
  color: z.string().optional(),
  tags: z.array(z.string()).optional(),
  rank: z.number().optional(),
  due: z.string().nullable().optional(),
  links: z
    .array(
      z.object({
        label: z.string(),
        url: z.string(),
      })
    )
    .optional(),
  customFields: z.record(z.string(), z.unknown()).optional(), // fieldId → value
});

/**
 * Metadata schema - validates export metadata
 */
export const MetadataSchema = z.object({
  schema: z.literal("chronica-board"),
  version: z.literal(1),
  project: z.string(),
  generated_by: z.string(),
  created_at: z.string(),
  app_version: z.string(),
  fields: z
    .record(z.string(), FieldDefinitionSchema)
    .refine((fields) => Object.keys(fields).length <= FIELD_LIMITS.MAX_FIELDS_PER_BOARD, {
      message: `Too many fields (max ${FIELD_LIMITS.MAX_FIELDS_PER_BOARD})`,
    })
    .optional(),
});

/**
 * Export format schema - validates complete export structure
 */
export const ExportFormatSchema = z.object({
  meta: MetadataSchema,
  columns: z.array(ColumnSchema),
  cards: z.array(CardSchema),
});

/**
 * Board schema - validates full board structure for persistence
 */
export const BoardSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  columns: z.array(ColumnSchema),
  cards: z.array(CardSchema),
});

/**
 * Boards index schema - validates boards index structure
 */
export const BoardsIndexSchema = z.object({
  boards: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string(),
    })
  ),
  activeId: z.string().uuid(),
});

/**
 * Config schema - validates config structure
 */
export const ConfigSchema = z.object({
  appVersion: z.string(),
  window: z.object({
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number(),
  }),
  pinned: z.boolean(),
  opacity: z.number().min(0.7).max(1.0),
  autostart: z.boolean(),
  showStarterCards: z.boolean().optional(), // Legacy field, no longer used
  sidebarPinned: z.boolean().optional(),
  columnsLocked: z.boolean().optional(),
  uiScale: z.number().min(0.8).max(1.2).optional(),
  columnTitles: z.record(z.string(), z.string()).optional(),
  fields: z
    .record(z.string(), FieldDefinitionSchema)
    .refine((fields) => Object.keys(fields).length <= FIELD_LIMITS.MAX_FIELDS_PER_BOARD, {
      message: `Too many fields (max ${FIELD_LIMITS.MAX_FIELDS_PER_BOARD})`,
    })
    .optional(),
});

/**
 * Validation constants
 */
export const VALIDATION_LIMITS = {
  MAX_FILE_SIZE: 2 * 1024 * 1024, // 2MB
  MAX_CARDS: 3000,
  MAX_BOARDS: 20,
} as const;

/**
 * Validates import JSON data
 * @throws Error if validation fails
 */
export function validateImportData(data: unknown): z.infer<typeof ExportFormatSchema> {
  // Basic JSON validation
  if (!data || typeof data !== "object") {
    throw new Error("Invalid JSON data");
  }

  // Schema validation
  const result = ExportFormatSchema.safeParse(data);
  if (!result.success) {
    throw new Error(`Invalid schema: ${result.error.message}`);
  }

  // Size limits
  if (result.data.cards.length > VALIDATION_LIMITS.MAX_CARDS) {
    throw new Error(`Too many cards (max ${VALIDATION_LIMITS.MAX_CARDS})`);
  }

  return result.data;
}

/**
 * Validates a hex color code
 */
export function isValidHexColor(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}
