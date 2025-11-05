// Import/Export functionality for Chronica (v0.1.0-alpha)
import { save, open } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { validateImportData, VALIDATION_LIMITS } from "./schema";
import { PREDEFINED_COLORS } from "../state/types";
import type {
  Card,
  Column,
  ExportFormat,
  Board,
  AIOptimizedExportFormat,
  AIOptimizedMultiboardExportFormat,
  AIOptimizedBoardEntry,
  AIOptimizedColumn,
  AIOptimizedCard,
} from "../state/types";
import type { FieldDefinition } from "./fieldSchema";
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

    // Read file
    const content = await readTextFile(filePath);

    // Check file size after reading (security: prevent DoS)
    const sizeInBytes = new Blob([content]).size;
    if (sizeInBytes > VALIDATION_LIMITS.MAX_FILE_SIZE) {
      throw new Error(
        `File too large (${Math.round(sizeInBytes / 1024 / 1024)}MB). Maximum allowed is ${VALIDATION_LIMITS.MAX_FILE_SIZE / 1024 / 1024}MB.`
      );
    }

    return importBoardFromJSON(content);
  } catch (error) {
    console.error("Import from file failed:", error);
    throw new Error(`Import failed: ${error}`);
  }
}

/**
 * Import board from JSON string
 * Auto-detects AI-optimized format and handles both single and multi-board imports
 */
export function importBoardFromJSON(jsonContent: string): {
  name: string;
  columns: Column[];
  cards: Card[];
  fields?: Record<string, FieldDefinition>;
} {
  try {
    // Parse JSON
    const data = JSON.parse(jsonContent);

    // Check if it's AI-optimized format
    if (data.meta?.schema === "chronica-ai-optimized") {
      const aiImport = importAIOptimizedFromJSON(jsonContent);

      if (aiImport.format === "single" && aiImport.singleBoard) {
        return aiImport.singleBoard;
      } else if (aiImport.format === "multi" && aiImport.multiBoard) {
        // For multi-board, return the first board
        // The caller should use importAIOptimizedFromJSON directly for multi-board support
        const firstBoard = aiImport.multiBoard.boards[0];
        if (!firstBoard) {
          throw new Error("Multi-board export contains no boards");
        }
        return {
          name: firstBoard.name,
          columns: firstBoard.columns,
          cards: firstBoard.cards,
          fields: aiImport.multiBoard.fields,
        };
      }
    }

    // Standard format
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

// ============================================================================
// AI-OPTIMIZED EXPORT/IMPORT FUNCTIONS
// ============================================================================

/**
 * Convert flat board to AI-optimized nested structure
 */
function convertToAIOptimized(
  board: Board,
  includeTimestamps = true
): AIOptimizedBoardEntry {
  // Group cards by column
  const cardsByColumn = board.columns.reduce(
    (acc, column) => {
      acc[column.key] = board.cards.filter((card) => card.column === column.key);
      return acc;
    },
    {} as Record<string, Card[]>
  );

  // Convert columns with nested cards
  const aiColumns: AIOptimizedColumn[] = board.columns
    .sort((a, b) => a.order - b.order)
    .map((column) => {
      const columnCards = cardsByColumn[column.key] || [];
      return {
        key: column.key,
        title: column.title,
        order: column.order,
        color: column.color,
        collapsed: column.collapsed,
        card_count: columnCards.length,
        cards: columnCards.map(
          (card): AIOptimizedCard => ({
            ...card,
            created_at: includeTimestamps ? new Date().toISOString() : undefined,
            modified_at: includeTimestamps ? new Date().toISOString() : undefined,
          })
        ),
      };
    });

  return {
    id: board.id,
    name: board.name,
    created_at: includeTimestamps ? new Date().toISOString() : undefined,
    modified_at: includeTimestamps ? new Date().toISOString() : undefined,
    column_count: board.columns.length,
    card_count: board.cards.length,
    columns: aiColumns,
  };
}

/**
 * Calculate statistics for AI context
 */
function calculateBoardStatistics(
  board: Board
): AIOptimizedExportFormat["statistics"] {
  const cardsPerColumn: Record<string, number> = {};
  const tagsUsed = new Set<string>();
  const colorsUsed = new Set<string>();

  board.columns.forEach((column) => {
    const columnCards = board.cards.filter((card) => card.column === column.key);
    cardsPerColumn[column.title] = columnCards.length;
  });

  board.cards.forEach((card) => {
    card.tags?.forEach((tag) => tagsUsed.add(tag));
    if (card.color) colorsUsed.add(card.color);
  });

  return {
    total_columns: board.columns.length,
    total_cards: board.cards.length,
    cards_per_column: cardsPerColumn,
    tags_used: Array.from(tagsUsed),
    colors_used: Array.from(colorsUsed),
  };
}

/**
 * Export board in AI-optimized format
 */
export async function exportBoardAIOptimized(board: Board): Promise<void> {
  try {
    const aiBoard = convertToAIOptimized(board);
    const statistics = calculateBoardStatistics(board);

    const exportData: AIOptimizedExportFormat = {
      meta: {
        schema: "chronica-ai-optimized",
        version: 2,
        ai_optimized: true,
        project: board.name,
        description: `Board: ${board.name}. ${board.cards.length} cards across ${board.columns.length} columns.`,
        created_at: new Date().toISOString(),
        modified_at: new Date().toISOString(),
        generated_by: "Chronica",
        app_version: VERSION_DISPLAY,
        fields: board.fields || {}, // Use board's fields
      },
      board: aiBoard,
      statistics,
    };

    // Save with "_ai" suffix
    const defaultFilename = `chronica_${board.name.replace(/\s+/g, "_")}_ai_${VERSION_FILENAME}.json`;
    const filePath = await save({
      defaultPath: defaultFilename,
      filters: [{ name: "JSON", extensions: ["json"] }],
    });

    if (!filePath) return;

    // Write with extra spacing for AI readability
    const content = JSON.stringify(exportData, null, 2);
    await writeTextFile(filePath, content);

    console.log("AI-optimized board exported:", filePath);
  } catch (error) {
    console.error("AI-optimized export failed:", error);
    throw new Error(`Export failed: ${error}`);
  }
}

/**
 * Export all boards in AI-optimized format
 */
export async function exportAllBoardsAIOptimized(boards: Board[]): Promise<void> {
  try {
    const aiBoards = boards.map((board) => convertToAIOptimized(board));

    // Calculate per-board statistics
    const boardsSummary = boards.map((board) => {
      const doneCards = board.cards.filter((card) =>
        ["done", "complete", "finished"].some((keyword) =>
          card.column.toLowerCase().includes(keyword)
        )
      ).length;
      const completionPercent =
        board.cards.length > 0 ? Math.round((doneCards / board.cards.length) * 100) : 0;

      return {
        name: board.name,
        card_count: board.cards.length,
        completion_percent: completionPercent,
      };
    });

    // Collect all unique fields across all boards (for backwards compatibility)
    const allFields = boards.reduce(
      (acc, board) => ({ ...acc, ...board.fields }),
      {} as Record<string, FieldDefinition>
    );

    const exportData: AIOptimizedMultiboardExportFormat = {
      meta: {
        schema: "chronica-ai-optimized",
        version: 2,
        ai_optimized: true,
        project: "All Boards",
        description: `Multi-board export with ${boards.length} boards and ${boards.reduce((sum, b) => sum + b.cards.length, 0)} total cards.`,
        created_at: new Date().toISOString(),
        modified_at: new Date().toISOString(),
        generated_by: "Chronica",
        app_version: VERSION_DISPLAY,
        fields: allFields, // Merged fields from all boards
      },
      boards: aiBoards,
      statistics: {
        board_count: boards.length,
        total_columns: boards.reduce((sum, b) => sum + b.columns.length, 0),
        total_cards: boards.reduce((sum, b) => sum + b.cards.length, 0),
        boards_summary: boardsSummary,
      },
    };

    const timestamp = new Date().toISOString().split("T")[0];
    const defaultFilename = `chronica_all_boards_ai_${VERSION_FILENAME}_${timestamp}.json`;
    const filePath = await save({
      defaultPath: defaultFilename,
      filters: [{ name: "JSON", extensions: ["json"] }],
    });

    if (!filePath) return;

    const content = JSON.stringify(exportData, null, 2);
    await writeTextFile(filePath, content);

    console.log(`AI-optimized export: ${boards.length} boards →`, filePath);
  } catch (error) {
    console.error("AI-optimized multi-board export failed:", error);
    throw new Error(`Export failed: ${error}`);
  }
}

/**
 * Convert AI-optimized format back to flat structure
 */
function convertFromAIOptimized(aiBoard: AIOptimizedBoardEntry): {
  name: string;
  columns: Column[];
  cards: Card[];
} {
  // Flatten nested structure
  const columns: Column[] = aiBoard.columns.map((col) => ({
    key: col.key,
    title: col.title,
    order: col.order,
    color: col.color,
    collapsed: col.collapsed,
  }));

  const cards: Card[] = aiBoard.columns.flatMap((col) =>
    col.cards.map((card) => ({
      id: card.id,
      title: card.title,
      description: card.description,
      column: col.key, // Restore column reference
      color: card.color,
      tags: card.tags,
      rank: card.rank,
      due: card.due,
      links: card.links,
      customFields: card.customFields,
    }))
  );

  return {
    name: aiBoard.name,
    columns,
    cards,
  };
}

/**
 * Import AI-optimized format (auto-detects and converts)
 */
export function importAIOptimizedFromJSON(jsonContent: string): {
  format: "single" | "multi";
  singleBoard?: {
    name: string;
    columns: Column[];
    cards: Card[];
    fields?: Record<string, FieldDefinition>;
  };
  multiBoard?: {
    boards: Array<{ id: string; name: string; columns: Column[]; cards: Card[] }>;
    fields?: Record<string, FieldDefinition>;
  };
} {
  const data = JSON.parse(jsonContent);

  if (data.meta?.schema !== "chronica-ai-optimized") {
    throw new Error("Not an AI-optimized export file");
  }

  // Single board AI export
  if (data.board) {
    const converted = convertFromAIOptimized(data.board);
    return {
      format: "single",
      singleBoard: {
        ...converted,
        fields: data.meta.fields,
      },
    };
  }

  // Multi-board AI export
  if (data.boards) {
    const boards = data.boards.map((aiBoard: AIOptimizedBoardEntry) => ({
      id: aiBoard.id,
      ...convertFromAIOptimized(aiBoard),
    }));

    return {
      format: "multi",
      multiBoard: {
        boards,
        fields: data.meta.fields,
      },
    };
  }

  throw new Error("Invalid AI-optimized format");
}
