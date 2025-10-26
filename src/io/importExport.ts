// Import/Export functionality for Chronica (v0.1.0-alpha)
import { save, open } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeTextFile, stat } from "@tauri-apps/plugin-fs";
import { validateImportData, VALIDATION_LIMITS } from "./schema";
import { PREDEFINED_COLORS } from "../state/types";
import type { Card, Column, ExportFormat } from "../state/types";
import { sanitizeColor } from "../utils/sanitize";
import { VERSION_DISPLAY, VERSION_FILENAME } from "../version";

/**
 * Normalize color name or hex to valid hex color
 * Uses sanitization to prevent CSS injection
 */
function normalizeColor(color?: string): string | undefined {
  if (!color) return undefined;

  // Check if it's a predefined color name
  const lowerColor = color.toLowerCase();
  if (lowerColor in PREDEFINED_COLORS) {
    return PREDEFINED_COLORS[lowerColor as keyof typeof PREDEFINED_COLORS];
  }

  // Sanitize and validate hex colors
  return sanitizeColor(color);
}

/**
 * Normalize imported cards
 * - Map unknown columns to 'todo'
 * - Validate colors
 * - Deduplicate tags
 * - Set default rank
 */
function normalizeCards(cards: Card[], validColumns: Set<string>): Card[] {
  return cards.map((card) => ({
    ...card,
    column: validColumns.has(card.column) ? card.column : "todo",
    color: normalizeColor(card.color),
    tags: card.tags ? [...new Set(card.tags)] : undefined,
    rank: card.rank ?? 1000,
  }));
}

/**
 * Export current board to JSON file
 */
export async function exportBoard(
  boardName: string,
  columns: Column[],
  cards: Card[],
  fields?: Record<string, import("./fieldSchema").FieldDefinition>
): Promise<void> {
  try {
    // Prepare export data
    const exportData: ExportFormat = {
      meta: {
        schema: "chronica-board",
        version: 1,
        project: boardName,
        generated_by: "Chronica",
        created_at: new Date().toISOString(),
        app_version: VERSION_DISPLAY,
        fields,
      },
      columns,
      cards,
    };

    // Show save dialog
    const defaultFilename = `chronica_${boardName.replace(/\s+/g, "_")}_${VERSION_FILENAME}.json`;
    const filePath = await save({
      defaultPath: defaultFilename,
      filters: [
        {
          name: "JSON",
          extensions: ["json"],
        },
      ],
    });

    if (!filePath) {
      return; // User cancelled
    }

    // Write file
    const content = JSON.stringify(exportData, null, 2);
    await writeTextFile(filePath, content);

    console.log("Board exported successfully:", filePath);
  } catch (error) {
    console.error("Export failed:", error);
    throw new Error(`Export failed: ${error}`);
  }
}

/**
 * Import board from JSON file or pasted content
 */
export async function importBoardFromFile(): Promise<{
  name: string;
  columns: Column[];
  cards: Card[];
  fields?: Record<string, import("./fieldSchema").FieldDefinition>;
} | null> {
  try {
    // Show open dialog
    const filePath = await open({
      multiple: false,
      filters: [
        {
          name: "JSON",
          extensions: ["json"],
        },
      ],
    });

    if (!filePath || typeof filePath !== "string") {
      return null; // User cancelled
    }

    // Check file size before reading (security: prevent DoS)
    const fileStats = await stat(filePath);
    if (fileStats.size > VALIDATION_LIMITS.MAX_FILE_SIZE) {
      throw new Error(
        `File too large (${Math.round(fileStats.size / 1024 / 1024)}MB). Maximum allowed is ${VALIDATION_LIMITS.MAX_FILE_SIZE / 1024 / 1024}MB.`
      );
    }

    // Read file
    const content = await readTextFile(filePath);
    return importBoardFromJSON(content);
  } catch (error) {
    console.error("Import from file failed:", error);
    throw new Error(`Import failed: ${error}`);
  }
}

/**
 * Import board from JSON string
 */
export function importBoardFromJSON(jsonContent: string): {
  name: string;
  columns: Column[];
  cards: Card[];
  fields?: Record<string, import("./fieldSchema").FieldDefinition>;
} {
  try {
    // Parse JSON
    const data = JSON.parse(jsonContent);

    // Validate schema
    const validatedData = validateImportData(data);

    // Extract board name from meta.project
    const name = validatedData.meta.project || "Untitled Board";

    // Get valid column keys
    const validColumns = new Set(validatedData.columns.map((c) => c.key));

    // Normalize cards
    const cards = normalizeCards(validatedData.cards, validColumns);

    // Extract field definitions from metadata
    const fields = validatedData.meta.fields;

    return {
      name,
      columns: validatedData.columns,
      cards,
      fields,
    };
  } catch (error) {
    console.error("Import from JSON failed:", error);
    throw new Error(`Invalid JSON: ${error}`);
  }
}

/**
 * Preview import data
 */
export interface ImportPreview {
  boardName: string;
  columnCount: number;
  cardCount: number;
  firstCards: { title: string; column: string }[];
}

export function getImportPreview(jsonContent: string): ImportPreview {
  const data = importBoardFromJSON(jsonContent);

  return {
    boardName: data.name,
    columnCount: data.columns.length,
    cardCount: data.cards.length,
    firstCards: data.cards.slice(0, 10).map((c) => ({
      title: c.title,
      column: c.column,
    })),
  };
}
