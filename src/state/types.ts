// Core TypeScript type definitions for Chronica v0.1.0-alpha
import type { FieldDefinition } from "../io/fieldSchema";

/**
 * Column keys - identifies each column in the kanban board
 * Accepts any string, with common defaults being "todo", "doing", "done"
 */
export type ColumnKey = string;

/**
 * Column definition with key, title, display order, and optional color
 */
export interface Column {
  key: ColumnKey;
  title: string;
  order: number;
  color?: string | null; // hex like "#3b82f6"; null/undefined = default
  collapsed?: boolean; // Column collapsed to thin vertical bar
}

/**
 * Card definition - represents a single task card
 */
export interface Card {
  id: string;
  title: string;
  description?: string;
  column: ColumnKey;
  color?: string; // Hex color or predefined name (primary, accent, success, warning, danger, info)
  colorStyle?: "border" | "filled"; // Border-only (default) or filled background
  colorIntensity?: "subtle" | "vibrant"; // Color intensity for filled backgrounds (default: subtle)
  tags?: string[];
  rank?: number; // For ordering within column (default: 1000)
  due?: string | null; // ISO8601 date
  links?: { label: string; url: string }[];
  customFields?: Record<string, unknown>; // fieldId → value (validated against board.fields)
  cardOnlyFields?: Record<string, unknown>; // One-off fields unique to this card only
}

/**
 * Board definition - contains columns and cards
 */
export interface Board {
  id: string;
  name: string;
  columns: Column[];
  cards: Card[];
  fields?: Record<string, import("../io/fieldSchema").FieldDefinition>; // Board-level field definitions
}

/**
 * Boards index - tracks all boards and active board
 */
export interface BoardsIndex {
  boards: { id: string; name: string }[];
  activeId: string;
}

/**
 * Application config - window state, settings, preferences
 */
export interface Config {
  appVersion: string; // "v0.1.0-alpha"
  window: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  pinned: boolean;
  opacity: number; // 0.7 - 1.0
  autostart: boolean;
  sidebarPinned: boolean; // Sidebar pin/unpin state
  columnsLocked: boolean; // Column dragging lock state
  uiScale: number; // Global UI/font scale: 0.8 - 1.2 (default 1.0)
  columnColorMode?: "subtle" | "vibrant"; // Column background color intensity (default: "subtle")
  // Future-proofing
  columnTitles?: Record<ColumnKey, string>;
  defaultFieldTemplate?: Record<string, FieldDefinition>; // Template for new boards (max 20 fields)
  fields?: Record<string, FieldDefinition>; // DEPRECATED: Migrated to board-level fields
}

/**
 * Import/Export JSON schema metadata
 */
export interface BoardMetadata {
  schema: "chronica-board";
  version: 1;
  project: string;
  generated_by: string;
  created_at: string; // ISO8601
  app_version: string; // "v0.1.0-alpha"
  fields?: Record<string, FieldDefinition>; // Custom field definitions
}

/**
 * Complete export format (canonical schema)
 */
export interface ExportFormat {
  meta: BoardMetadata;
  columns: Column[];
  cards: Card[];
}

/**
 * Semantic color palette (Stack Junkie Style Guide v0.3)
 * These are the resolved hex values for use in color pickers and dynamic styling
 */
export const PREDEFINED_COLORS = {
  primary: "#2563EB", // Blue - primary actions
  accent: "#3B82F6", // Light blue - accents and highlights
  success: "#16A34A", // Green - success states
  warning: "#D97706", // Amber - warnings
  danger: "#DC2626", // Red - errors and destructive actions
  info: "#0284C7", // Cyan - informational
} as const;

export type PredefinedColorName = keyof typeof PREDEFINED_COLORS;

/**
 * Legacy color name mapping for backward compatibility
 * Maps old color names to new semantic color names
 */
export const LEGACY_COLOR_MAP: Record<string, PredefinedColorName> = {
  cyan: "primary",
  mint: "success",
  salmon: "danger",
  lavender: "accent",
  slate: "info",
} as const;

/**
 * AI-optimized metadata
 */
export interface AIOptimizedMetadata {
  schema: "chronica-ai-optimized";
  version: 2; // Increment version for AI format
  ai_optimized: true;
  project: string;
  description?: string; // Human-readable project description
  created_at: string;
  modified_at: string;
  generated_by: "Chronica";
  app_version: string;
  fields: Record<string, FieldDefinition>; // Custom field definitions
}

/**
 * AI-optimized column with nested cards
 */
export interface AIOptimizedColumn {
  key: string;
  title: string;
  order: number;
  color?: string | null;
  collapsed?: boolean;
  card_count: number; // Redundant count for AI verification
  cards: AIOptimizedCard[]; // Nested cards
}

/**
 * AI-optimized card with timestamps
 */
export interface AIOptimizedCard {
  id: string;
  title: string;
  description?: string;
  color?: string;
  tags?: string[];
  rank?: number;
  due?: string | null;
  links?: { label: string; url: string }[];
  customFields?: Record<string, unknown>;
  created_at?: string; // ISO8601 timestamp
  modified_at?: string; // ISO8601 timestamp
}

/**
 * AI-optimized board entry
 */
export interface AIOptimizedBoardEntry {
  id: string;
  name: string;
  description?: string; // Board-level description
  created_at?: string;
  modified_at?: string;
  column_count: number; // Redundant count
  card_count: number; // Total cards
  columns: AIOptimizedColumn[]; // Nested structure
}

/**
 * AI-optimized single board export
 */
export interface AIOptimizedExportFormat {
  meta: AIOptimizedMetadata;
  board: AIOptimizedBoardEntry;
  statistics: {
    total_columns: number;
    total_cards: number;
    cards_per_column: Record<string, number>; // Column name → count
    tags_used: string[]; // All unique tags
    colors_used: string[]; // All unique colors
  };
}

/**
 * AI-optimized multi-board export
 */
export interface AIOptimizedMultiboardExportFormat {
  meta: AIOptimizedMetadata;
  boards: AIOptimizedBoardEntry[];
  statistics: {
    board_count: number;
    total_columns: number;
    total_cards: number;
    boards_summary: Array<{
      name: string;
      card_count: number;
      completion_percent: number; // % of cards in "Done" columns
    }>;
  };
}
