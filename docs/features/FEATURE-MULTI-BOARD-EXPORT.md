# FEATURE: Multi-Board Export with Dropdown Selector

**Status:** Not Started
**Priority:** High
**Complexity:** Medium
**Estimated Time:** 1-2 days
**Dependencies:** None

---

## Table of Contents

1. [Feature Overview](#feature-overview)
2. [Requirements](#requirements)
3. [Current State Analysis](#current-state-analysis)
4. [Proposed Changes](#proposed-changes)
5. [Implementation Steps](#implementation-steps)
6. [Files to Modify](#files-to-modify)
7. [New Files to Create](#new-files-to-create)
8. [Dependencies & Side Effects](#dependencies--side-effects)
9. [Testing Checklist](#testing-checklist)
10. [Success Criteria](#success-criteria)
11. [Migration Notes](#migration-notes)

---

## Feature Overview

### What
Replace the single-board export system with a dropdown board selector that allows users to export individual boards OR all boards at once in a single JSON file.

### Why
- **Backup Convenience:** Export entire workspace with one click
- **Portability:** Move all project data between machines easily
- **Version Control:** Commit all boards to git in one file
- **Sharing:** Share complete project context with team or AI assistants
- **Migration:** Simplify moving from old versions or other tools

### User Benefit
- One-click full workspace backup
- Easy project handoff
- Better integration with version control
- Simplified data migration

---

## Requirements

### Functional Requirements

1. **Export UI:**
   - Dropdown in Sidebar with board selection
   - Options: "Board 1", "Board 2", ..., "All Boards" (at bottom)
   - "Export" button next to dropdown
   - Button disabled when no board selected

2. **Export Behavior:**
   - **Single Board:** Exports active board only (current behavior)
   - **All Boards:** Exports all boards in one file with multi-board schema

3. **File Naming:**
   - Single board: `chronica_${boardName}_${version}.json`
   - All boards: `chronica_all_boards_${version}_${timestamp}.json`

4. **Import Behavior:**
   - Detect schema type (single vs multi-board)
   - Multi-board: Show preview with board selection checkboxes
   - User selects which boards to import
   - Conflict resolution: Rename duplicates automatically

5. **Field Handling:**
   - Export: Include global custom fields in metadata
   - Import: Merge field definitions (imported take precedence)

### Non-Functional Requirements

- **Performance:** Export up to 20 boards (<2MB) in <2 seconds
- **Validation:** All data validated with Zod schemas
- **Error Handling:** Clear error messages for failures
- **Accessibility:** Dropdown keyboard navigable

---

## Current State Analysis

### Current Export System

**Location:** `src/io/importExport.ts` lines 47-94

```typescript
export async function exportBoard(
  boardName: string,
  columns: Column[],
  cards: Card[],
  fields?: Record<string, FieldDefinition>
): Promise<void>
```

**Limitations:**
1. Only exports **one board** (active board)
2. Takes board data as parameters (not board ID)
3. No board selection UI
4. Can't export entire workspace

### Current Export UI

**Location:** `src/ui/Sidebar.tsx` lines 140-146

```tsx
<button
  className="icon"
  onClick={onExport}
  disabled={!activeBoard}
  title="Export Board"
>
  ↓
</button>
```

**Limitations:**
- Simple button, no selection
- Always exports active board
- No "all boards" option

### Current Import UI

**Location:** `src/ui/ImportModal.tsx` lines 1-220

**Features:**
- Two tabs: "From File", "Paste JSON"
- Preview: board name, column count, card count
- Creates new board (doesn't replace)

**Limitations:**
- Can only import one board per operation
- No multi-board file support
- No board selection UI for multi-board imports

### Current Export Format

**Schema:** `ExportFormat` (src/state/types.ts lines 79-97)

```typescript
interface BoardMetadata {
  schema: "chronica-board";
  version: 1;
  project: string; // Board name
  generated_by: string;
  created_at: string;
  app_version: string;
  fields?: Record<string, FieldDefinition>;
}

interface ExportFormat {
  meta: BoardMetadata;
  columns: Column[];
  cards: Card[];
}
```

**Limitations:**
- Schema only supports single board
- No board ID in metadata
- Field definitions global but only one board

---

## Proposed Changes

### 1. New Multi-Board Export Schema

**File:** `src/state/types.ts` (add after ExportFormat)

```typescript
/**
 * Multi-board export metadata
 */
export interface MultiboardMetadata {
  schema: "chronica-multiboard";
  version: 1;
  generated_by: "Chronica";
  created_at: string; // ISO8601
  app_version: string;
  board_count: number;
  total_cards: number;
  total_columns: number;
  fields: Record<string, FieldDefinition>; // Global custom fields
}

/**
 * Board entry in multi-board export
 */
export interface BoardExportEntry {
  id: string; // UUID
  name: string;
  columns: Column[];
  cards: Card[];
  created_at?: string; // Optional timestamp
}

/**
 * Multi-board export format
 */
export interface MultiboardExportFormat {
  meta: MultiboardMetadata;
  boards: BoardExportEntry[];
}
```

### 2. Export UI with Dropdown

**File:** `src/ui/Sidebar.tsx` lines 140-160 (replace export button section)

**NEW COMPONENT:** `ExportSelector.tsx`

```tsx
// src/ui/ExportSelector.tsx
import { useState } from "react";
import type { Board } from "@state/types";

interface ExportSelectorProps {
  boards: Board[];
  activeBoard: Board | null;
  onExport: (boardId: string | "all") => Promise<void>;
}

export function ExportSelector({ boards, activeBoard, onExport }: ExportSelectorProps) {
  const [selectedBoardId, setSelectedBoardId] = useState<string | "all">(
    activeBoard?.id || "all"
  );
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExport(selectedBoardId);
    } catch (error) {
      console.error("Export failed:", error);
      alert(`Export failed: ${error}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <select
        className="form-select"
        value={selectedBoardId}
        onChange={(e) => setSelectedBoardId(e.target.value)}
        disabled={boards.length === 0}
        style={{
          fontSize: "var(--font-sm)",
          padding: "var(--space-2)",
          background: "var(--bg-primary)",
          color: "var(--text-primary)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-sm)",
        }}
      >
        {boards.map((board) => (
          <option key={board.id} value={board.id}>
            {board.name}
          </option>
        ))}
        <option value="all">All Boards ({boards.length})</option>
      </select>

      <button
        className="primary"
        onClick={handleExport}
        disabled={boards.length === 0 || isExporting}
        style={{
          width: "100%",
          padding: "var(--space-2)",
          fontSize: "var(--font-sm)",
        }}
      >
        {isExporting ? "Exporting..." : "↓ Export"}
      </button>
    </div>
  );
}
```

**Integration in Sidebar.tsx:**

```tsx
import { ExportSelector } from "./ExportSelector";

// In Sidebar component JSX (replace lines 140-146):
<div className="sidebar-footer">
  <ExportSelector
    boards={boards}
    activeBoard={activeBoard}
    onExport={handleExport}
  />

  <button
    className="icon"
    onClick={onImport}
    title="Import Board"
  >
    ↑
  </button>

  <button
    className="icon"
    onClick={onSettings}
    title="Settings"
  >
    ⚙
  </button>
</div>
```

### 3. Export Function Updates

**File:** `src/io/importExport.ts`

**ADD:** Multi-board export function (after line 94)

```typescript
/**
 * Export multiple boards to a single JSON file
 */
export async function exportAllBoards(
  boards: Board[],
  fields?: Record<string, FieldDefinition>
): Promise<void> {
  try {
    // Calculate statistics
    const totalCards = boards.reduce((sum, board) => sum + board.cards.length, 0);
    const totalColumns = boards.reduce((sum, board) => sum + board.columns.length, 0);

    // Prepare export data
    const exportData: MultiboardExportFormat = {
      meta: {
        schema: "chronica-multiboard",
        version: 1,
        generated_by: "Chronica",
        created_at: new Date().toISOString(),
        app_version: VERSION_DISPLAY,
        board_count: boards.length,
        total_cards: totalCards,
        total_columns: totalColumns,
        fields: fields || {},
      },
      boards: boards.map((board) => ({
        id: board.id,
        name: board.name,
        columns: board.columns,
        cards: board.cards,
      })),
    };

    // Show save dialog
    const timestamp = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const defaultFilename = `chronica_all_boards_${VERSION_FILENAME}_${timestamp}.json`;
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

    console.log(`Exported ${boards.length} boards successfully:`, filePath);
  } catch (error) {
    console.error("Multi-board export failed:", error);
    throw new Error(`Export failed: ${error}`);
  }
}

/**
 * Export selected boards (one or all)
 */
export async function exportSelectedBoards(
  boardId: string | "all",
  boards: Board[],
  fields?: Record<string, FieldDefinition>
): Promise<void> {
  if (boardId === "all") {
    return exportAllBoards(boards, fields);
  } else {
    // Export single board
    const board = boards.find((b) => b.id === boardId);
    if (!board) {
      throw new Error(`Board not found: ${boardId}`);
    }
    return exportBoard(board.name, board.columns, board.cards, fields);
  }
}
```

### 4. Import Multi-Board Support

**File:** `src/io/importExport.ts`

**ADD:** Multi-board import detector and parser (after line 176)

```typescript
/**
 * Detect export format type
 */
function detectExportFormat(data: unknown): "single" | "multi" {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid export data");
  }

  const meta = (data as any).meta;
  if (!meta || !meta.schema) {
    throw new Error("Missing schema metadata");
  }

  if (meta.schema === "chronica-multiboard") {
    return "multi";
  } else if (meta.schema === "chronica-board") {
    return "single";
  } else {
    throw new Error(`Unknown schema: ${meta.schema}`);
  }
}

/**
 * Import multi-board file (returns array of boards)
 */
export function importMultiBoardFromJSON(jsonContent: string): {
  boards: Array<{
    id: string;
    name: string;
    columns: Column[];
    cards: Card[];
  }>;
  fields?: Record<string, FieldDefinition>;
} {
  try {
    const data = JSON.parse(jsonContent);
    const format = detectExportFormat(data);

    if (format !== "multi") {
      throw new Error("Not a multi-board export file");
    }

    // Validate with Zod (need to create schema)
    const validated = MultiboardExportFormatSchema.parse(data);

    // Normalize each board's cards
    const boards = validated.boards.map((board) => {
      const validColumns = new Set(board.columns.map((c) => c.key));
      const normalizedCards = normalizeCards(board.cards, validColumns);

      return {
        id: board.id,
        name: board.name,
        columns: board.columns,
        cards: normalizedCards,
      };
    });

    return {
      boards,
      fields: validated.meta.fields,
    };
  } catch (error) {
    console.error("Multi-board import from JSON failed:", error);
    throw new Error(`Invalid multi-board JSON: ${error}`);
  }
}

/**
 * Universal import function (auto-detects format)
 */
export function importFromJSON(jsonContent: string): {
  format: "single" | "multi";
  singleBoard?: {
    name: string;
    columns: Column[];
    cards: Card[];
    fields?: Record<string, FieldDefinition>;
  };
  multiBoard?: {
    boards: Array<{
      id: string;
      name: string;
      columns: Column[];
      cards: Card[];
    }>;
    fields?: Record<string, FieldDefinition>;
  };
} {
  const data = JSON.parse(jsonContent);
  const format = detectExportFormat(data);

  if (format === "single") {
    return {
      format: "single",
      singleBoard: importBoardFromJSON(jsonContent),
    };
  } else {
    return {
      format: "multi",
      multiBoard: importMultiBoardFromJSON(jsonContent),
    };
  }
}
```

### 5. Import Modal Updates

**File:** `src/ui/ImportModal.tsx`

**ADD:** Multi-board selection UI

```tsx
// After line 46 (after field merging logic)

const [importFormat, setImportFormat] = useState<"single" | "multi" | null>(null);
const [multiBoardData, setMultiBoardData] = useState<{
  boards: Array<{ id: string; name: string; columns: Column[]; cards: Card[] }>;
  fields?: Record<string, FieldDefinition>;
} | null>(null);
const [selectedBoardIds, setSelectedBoardIds] = useState<Set<string>>(new Set());

// Update handleImport to detect format
const handleImport = (content: string) => {
  try {
    const imported = importFromJSON(content);

    if (imported.format === "single") {
      setImportFormat("single");
      // Existing single-board logic...
    } else {
      setImportFormat("multi");
      setMultiBoardData(imported.multiBoard!);
      // Select all boards by default
      setSelectedBoardIds(new Set(imported.multiBoard!.boards.map((b) => b.id)));
      setPreview({
        boardName: `${imported.multiBoard!.boards.length} boards`,
        columnCount: imported.multiBoard!.boards.reduce((sum, b) => sum + b.columns.length, 0),
        cardCount: imported.multiBoard!.boards.reduce((sum, b) => sum + b.cards.length, 0),
        firstCards: imported.multiBoard!.boards.flatMap((b) =>
          b.cards.slice(0, 3).map((c) => ({
            title: c.title,
            column: `${b.name} > ${c.column}`,
          }))
        ),
      });
    }
  } catch (error) {
    setError(`Import failed: ${error}`);
  }
};

// Add multi-board selection UI in modal body
{importFormat === "multi" && multiBoardData && (
  <div className="form-group">
    <label className="form-label">Select Boards to Import</label>
    <div style={{ maxHeight: "200px", overflow: "auto", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "var(--space-3)" }}>
      {multiBoardData.boards.map((board) => (
        <div key={board.id} className="form-checkbox" style={{ marginBottom: "var(--space-2)" }}>
          <input
            type="checkbox"
            checked={selectedBoardIds.has(board.id)}
            onChange={(e) => {
              const newSet = new Set(selectedBoardIds);
              if (e.target.checked) {
                newSet.add(board.id);
              } else {
                newSet.delete(board.id);
              }
              setSelectedBoardIds(newSet);
            }}
          />
          <label>
            {board.name}
            <span style={{ color: "var(--text-muted)", fontSize: "var(--font-sm)", marginLeft: "var(--space-2)" }}>
              ({board.cards.length} cards, {board.columns.length} columns)
            </span>
          </label>
        </div>
      ))}
    </div>

    <button
      className="primary"
      onClick={() => {
        const selectedBoards = multiBoardData.boards.filter((b) => selectedBoardIds.has(b.id));
        selectedBoards.forEach((board) => {
          // Import each selected board
          onImport(board.name, board.columns, board.cards);
        });
        // Merge fields
        if (multiBoardData.fields) {
          // ... field merging logic
        }
        onClose();
      }}
      disabled={selectedBoardIds.size === 0}
      style={{ marginTop: "var(--space-4)", width: "100%" }}
    >
      Import {selectedBoardIds.size} Board{selectedBoardIds.size !== 1 ? "s" : ""}
    </button>
  </div>
)}
```

### 6. App.tsx Integration

**File:** `src/App.tsx`

Update export handler (replace lines 212-220):

```typescript
const handleExport = async (boardId: string | "all") => {
  try {
    if (boardId === "all") {
      await exportAllBoards(boards, config?.fields);
    } else {
      const board = boards.find((b) => b.id === boardId);
      if (!board) {
        showAlert("Export Failed", `Board not found: ${boardId}`);
        return;
      }
      await exportBoard(board.name, board.columns, board.cards, config?.fields);
    }
  } catch (error) {
    console.error("Export failed:", error);
    showAlert("Export Failed", "Export failed. See console for details.");
  }
};
```

---

## Implementation Steps

### Step 1: Add Multi-Board Types (30 minutes)

**File:** `src/state/types.ts`

1. Add `MultiboardMetadata` interface after `BoardMetadata` (around line 90)
2. Add `BoardExportEntry` interface
3. Add `MultiboardExportFormat` interface
4. Export all new types

**Verification:**
- TypeScript compiles without errors
- No "Cannot find type" errors

---

### Step 2: Create Zod Schema for Multi-Board (30 minutes)

**File:** `src/io/schema.ts`

Add after `ExportFormatSchema` (around line 64):

```typescript
/**
 * Multi-board metadata schema
 */
export const MultiboardMetadataSchema = z.object({
  schema: z.literal("chronica-multiboard"),
  version: z.literal(1),
  generated_by: z.string(),
  created_at: z.string(),
  app_version: z.string(),
  board_count: z.number().min(0).max(VALIDATION_LIMITS.MAX_BOARDS),
  total_cards: z.number(),
  total_columns: z.number(),
  fields: z.record(z.string(), FieldDefinitionSchema).optional(),
});

/**
 * Board export entry schema
 */
export const BoardExportEntrySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  columns: z.array(ColumnSchema),
  cards: z.array(CardSchema),
  created_at: z.string().optional(),
});

/**
 * Multi-board export format schema
 */
export const MultiboardExportFormatSchema = z.object({
  meta: MultiboardMetadataSchema,
  boards: z.array(BoardExportEntrySchema).max(VALIDATION_LIMITS.MAX_BOARDS),
});
```

**Verification:**
- Import schema in `importExport.ts`
- TypeScript compiles

---

### Step 3: Implement Multi-Board Export Functions (1 hour)

**File:** `src/io/importExport.ts`

1. Add `exportAllBoards()` function after line 94 (copy from Proposed Changes section)
2. Add `exportSelectedBoards()` function
3. Update imports to include `MultiboardExportFormat`, `BoardExportEntry`

**Verification:**
- Functions compile without errors
- Test with mock data:
  ```typescript
  const testBoards = [
    { id: "1", name: "Test 1", columns: [], cards: [] },
    { id: "2", name: "Test 2", columns: [], cards: [] },
  ];
  await exportAllBoards(testBoards);
  ```

---

### Step 4: Implement Multi-Board Import Functions (1 hour)

**File:** `src/io/importExport.ts`

1. Add `detectExportFormat()` function (after line 176)
2. Add `importMultiBoardFromJSON()` function
3. Add `importFromJSON()` universal function
4. Update imports to include schemas

**Verification:**
- Export 2 boards with "All Boards" option
- Import the file
- Check console for correct detection: `format: "multi"`

---

### Step 5: Create ExportSelector Component (1 hour)

**File:** `src/ui/ExportSelector.tsx` (NEW)

1. Create new file
2. Copy component code from Proposed Changes section
3. Style with CSS variables
4. Add prop types and TypeScript interfaces

**Verification:**
- Component renders in Storybook (if available)
- Or test by temporarily adding to Sidebar

---

### Step 6: Update Sidebar UI (30 minutes)

**File:** `src/ui/Sidebar.tsx`

1. Import `ExportSelector` component
2. Replace export button (lines 140-146) with `<ExportSelector>`
3. Pass boards, activeBoard, and handleExport props
4. Update footer layout if needed

**Verification:**
- Sidebar shows dropdown with all board names
- "All Boards" appears at bottom of dropdown
- Export button works

---

### Step 7: Update App.tsx Export Handler (30 minutes)

**File:** `src/App.tsx`

1. Update `handleExport` to accept `boardId: string | "all"` parameter
2. Add logic to call `exportAllBoards` vs `exportBoard`
3. Pass new handler to Sidebar

**Verification:**
- Select specific board → exports single board file
- Select "All Boards" → exports multi-board file
- Check file contents match expected schema

---

### Step 8: Update ImportModal for Multi-Board (2 hours)

**File:** `src/ui/ImportModal.tsx`

1. Add state for `importFormat`, `multiBoardData`, `selectedBoardIds`
2. Update `handleImport` to use `importFromJSON()`
3. Add multi-board selection UI (checkboxes)
4. Update import button to handle selected boards
5. Add "Select All" / "Deselect All" buttons

**Verification:**
- Import single-board file → works as before
- Import multi-board file → shows board selection UI
- Select some boards → imports only selected
- Deselect all → import button disabled

---

### Step 9: Handle Board Name Conflicts (1 hour)

**File:** `src/stores/boardStore.ts`

Add conflict resolution to `importBoard` action:

```typescript
importBoard: (name, columns, cards) => {
  const state = get();

  // Check for name conflict
  let finalName = name;
  let suffix = 1;
  while (state.boards.some((b) => b.name === finalName)) {
    finalName = `${name} (${suffix})`;
    suffix++;
  }

  const newBoard: Board = {
    id: uuidv4(),
    name: finalName,
    columns,
    cards: cards.map((card) => ({
      ...card,
      id: card.id || uuidv4(),
    })),
  };

  const boards = [...state.boards, newBoard];
  set({ boards, activeBoard: newBoard });
};
```

**Verification:**
- Import board with same name as existing → renamed to "Board Name (1)"
- Import again → renamed to "Board Name (2)"
- No duplicate names in board list

---

### Step 10: Comprehensive Testing (1 hour)

See [Testing Checklist](#testing-checklist) section.

---

## Files to Modify

### New Files

1. **`src/ui/ExportSelector.tsx`** (~80 lines)
   - Board selection dropdown
   - Export button with loading state

**Total New Lines:** ~80

### Modified Files

1. **`src/state/types.ts`** (+30 lines)
   - Lines 90+: Add MultiboardMetadata interface
   - Lines 95+: Add BoardExportEntry interface
   - Lines 100+: Add MultiboardExportFormat interface

2. **`src/io/schema.ts`** (+40 lines)
   - Lines 65+: Add MultiboardMetadataSchema
   - Lines 75+: Add BoardExportEntrySchema
   - Lines 85+: Add MultiboardExportFormatSchema

3. **`src/io/importExport.ts`** (+150 lines)
   - Lines 95+: Add exportAllBoards function
   - Lines 130+: Add exportSelectedBoards function
   - Lines 180+: Add detectExportFormat function
   - Lines 200+: Add importMultiBoardFromJSON function
   - Lines 250+: Add importFromJSON universal function

4. **`src/ui/Sidebar.tsx`** (~20 line changes)
   - Lines 1-10: Add ExportSelector import
   - Lines 140-160: Replace export button with ExportSelector component

5. **`src/App.tsx`** (~10 line changes)
   - Lines 212-220: Update handleExport to accept boardId parameter

6. **`src/ui/ImportModal.tsx`** (+100 lines)
   - Lines 20+: Add multi-board state variables
   - Lines 50+: Update handleImport for format detection
   - Lines 150+: Add multi-board selection UI

7. **`src/stores/boardStore.ts`** (~15 line changes)
   - Lines 141-155: Update importBoard with conflict resolution

**Total Modified Lines:** ~365 lines across 7 files

---

## Dependencies & Side Effects

### Dependencies

1. **Zod Schemas** - Must create multi-board schemas before import/export functions
2. **Type Definitions** - Must define types before using in functions

### Side Effects

1. **Export File Size** - All boards export creates larger files (up to 2MB max)
2. **Import Time** - Multi-board imports take longer (proportional to board count)
3. **Field Merging** - Global fields merged from multi-board imports
4. **Board Name Conflicts** - Auto-rename may surprise users (document clearly)

### Affected Features

1. **Version Control** - Users may now commit large multi-board files
2. **Backup Strategy** - Users can now backup entire workspace
3. **AI Integration** (separate feature) - Multi-board exports provide full context
4. **Migration Tools** - Easier to migrate entire workspaces

---

## Testing Checklist

### Unit Tests

- [ ] `detectExportFormat()` correctly identifies single vs multi
- [ ] `exportAllBoards()` generates valid multi-board JSON
- [ ] `importMultiBoardFromJSON()` parses multi-board files correctly
- [ ] `importFromJSON()` auto-detects format and routes correctly
- [ ] Board name conflict resolution works (appends "(1)", "(2)", etc.)
- [ ] Zod schemas validate multi-board format
- [ ] Zod schemas reject invalid multi-board data

### Integration Tests

#### Export Tests
- [ ] Select single board → exports single-board file
- [ ] Select "All Boards" → exports multi-board file
- [ ] Export all boards with custom fields → fields in metadata
- [ ] Export 20 boards (max) → file under 2MB
- [ ] Export 0 boards → button disabled
- [ ] Export while another export in progress → button disabled

#### Import Tests
- [ ] Import single-board file → works as before
- [ ] Import multi-board file → shows selection UI
- [ ] Import multi-board, select all → imports all boards
- [ ] Import multi-board, select some → imports only selected
- [ ] Import multi-board, select none → import button disabled
- [ ] Import multi-board with name conflicts → boards renamed
- [ ] Import multi-board with custom fields → fields merged correctly

### UI Tests

#### ExportSelector Component
- [ ] Dropdown shows all board names
- [ ] "All Boards" appears at bottom with count
- [ ] Dropdown disabled when no boards
- [ ] Export button disabled when no boards
- [ ] Export button shows "Exporting..." during operation
- [ ] Dropdown keyboard navigable
- [ ] Dropdown accessible (ARIA labels)

#### ImportModal Updates
- [ ] Multi-board preview shows total stats (boards, columns, cards)
- [ ] Board selection checkboxes render correctly
- [ ] "Select All" / "Deselect All" buttons work
- [ ] Import button updates count dynamically
- [ ] Importing multiple boards shows progress (if implemented)

### Error Handling

- [ ] Invalid multi-board schema → clear error message
- [ ] File too large (>2MB) → error before import
- [ ] Corrupted JSON → error with line number if possible
- [ ] Network failure during export → error, retry option
- [ ] Disk full during export → error message

### Performance Tests

- [ ] Export 20 boards with 3000 cards total → under 2 seconds
- [ ] Import 20 boards → under 3 seconds
- [ ] UI responsive during export/import (no freeze)
- [ ] Large file export (1.5MB+) → progress indicator

### Accessibility Tests

- [ ] Dropdown keyboard navigable (arrow keys, enter)
- [ ] Export button has proper focus indicator
- [ ] Checkboxes keyboard operable (space to toggle)
- [ ] Screen reader announces board count
- [ ] High-contrast mode: all controls visible

---

## Success Criteria

### Definition of Done

1. **Dropdown Working**
   - Shows all board names
   - "All Boards" at bottom with count
   - Selection persists until export

2. **Single Board Export**
   - Works exactly as before
   - File format unchanged
   - Backward compatible

3. **Multi-Board Export**
   - Exports all boards in one file
   - Valid multi-board schema
   - Includes global custom fields
   - File under 2MB (enforced)

4. **Multi-Board Import**
   - Auto-detects format
   - Shows board selection UI
   - Imports only selected boards
   - Renames conflicts automatically
   - Merges custom fields

5. **No Regressions**
   - Existing single-board export/import works
   - No performance degradation
   - No UI glitches

6. **Error Handling**
   - All errors caught and displayed
   - No silent failures
   - Clear user guidance

7. **Documentation Updated**
   - README mentions multi-board export
   - Changelog entry created
   - Feature documented

---

## Migration Notes

### Backward Compatibility

**Single-Board Files:**
- Existing single-board exports continue to work
- Import detects schema automatically
- No user action required

**Multi-Board Files:**
- New format, won't work with old versions
- Clearly labeled in file name ("all_boards")
- Includes schema version for future upgrades

### File Naming Convention

**Before:**
```
chronica_My_Board_v0.1.0-alpha.6.json
```

**After (Single):**
```
chronica_My_Board_v0.1.0-alpha.7.json
```

**After (Multi):**
```
chronica_all_boards_v0.1.0-alpha.7_2025-11-03.json
```

### User Communication

**Changelog Entry:**

```markdown
## [0.1.0-alpha.7] - 2025-XX-XX

### Added
- **Multi-Board Export:** Export all boards at once with dropdown selector
- Board selection UI in import modal for multi-board files
- Automatic board name conflict resolution (appends (1), (2), etc.)
- "All Boards" option at bottom of export dropdown

### Changed
- Export UI now uses dropdown instead of single button
- Import modal detects format automatically (single vs multi-board)

### Fixed
- Board name conflicts during import now handled gracefully
```

**User Guide Addition:**

> **Exporting Multiple Boards**
>
> 1. Click the dropdown in the sidebar footer
> 2. Select "All Boards (X)" at the bottom of the list
> 3. Click "Export"
> 4. Choose save location
>
> This creates a single JSON file containing all your boards, columns, cards, and custom field definitions.
>
> **Importing Multiple Boards**
>
> 1. Click "Import" (↑ button)
> 2. Select a multi-board file
> 3. Check the boards you want to import
> 4. Click "Import X Boards"
>
> If a board name conflicts with an existing board, it will be automatically renamed (e.g., "My Board" → "My Board (1)").

---

## Rollback Plan

### If Multi-Board Feature Breaks

**Symptoms:**
- Export fails silently
- Import shows errors
- Dropdown not working
- File corruption

**Rollback Steps:**

1. **Revert ExportSelector:**
   ```bash
   rm src/ui/ExportSelector.tsx
   git checkout HEAD -- src/ui/Sidebar.tsx
   ```

2. **Revert Import Functions:**
   ```bash
   git checkout HEAD -- src/io/importExport.ts
   ```

3. **Revert Types & Schemas:**
   ```bash
   git checkout HEAD -- src/state/types.ts
   git checkout HEAD -- src/io/schema.ts
   ```

4. **Revert App Integration:**
   ```bash
   git checkout HEAD -- src/App.tsx
   git checkout HEAD -- src/ui/ImportModal.tsx
   ```

5. **Test Single-Board Export:**
   - Should work as before
   - All existing features functional

### Partial Rollback (Keep Export, Revert Import)

If export works but import broken:

1. Keep ExportSelector and export functions
2. Revert only ImportModal.tsx and import functions
3. Multi-board export works, import requires manual splitting

---

## Additional Resources

### JSON Schema Examples

**Single-Board Export:**
```json
{
  "meta": {
    "schema": "chronica-board",
    "version": 1,
    "project": "My Project",
    "generated_by": "Chronica",
    "created_at": "2025-11-03T10:30:00.000Z",
    "app_version": "v0.1.0-alpha.7"
  },
  "columns": [...],
  "cards": [...]
}
```

**Multi-Board Export:**
```json
{
  "meta": {
    "schema": "chronica-multiboard",
    "version": 1,
    "generated_by": "Chronica",
    "created_at": "2025-11-03T10:30:00.000Z",
    "app_version": "v0.1.0-alpha.7",
    "board_count": 3,
    "total_cards": 47,
    "total_columns": 9,
    "fields": {...}
  },
  "boards": [
    {
      "id": "uuid-1",
      "name": "Board 1",
      "columns": [...],
      "cards": [...]
    },
    {
      "id": "uuid-2",
      "name": "Board 2",
      "columns": [...],
      "cards": [...]
    }
  ]
}
```

### File Size Estimation

- **Empty Board:** ~500 bytes
- **Board with 10 cards:** ~3KB
- **Board with 100 cards:** ~30KB
- **20 boards with 100 cards each:** ~600KB (well under 2MB limit)

### Related Features

- **AI JSON Format** (separate doc) - Builds on multi-board export
- **Version Control Integration** - Multi-board files better for git
- **Backup Strategy** - Users can now use "All Boards" for daily backups

---

**End of FEATURE-MULTI-BOARD-EXPORT.md**

**Last Updated:** 2025-11-03
**Author:** Claude Code
**Version:** 1.0
