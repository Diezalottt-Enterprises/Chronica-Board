# FEATURE: AI-Friendly JSON Export Format

**Status:** Not Started
**Priority:** High
**Complexity:** Medium
**Estimated Time:** 1-2 days
**Dependencies:** FEATURE-MULTI-BOARD-EXPORT.md (optional but recommended)

---

## Table of Contents

1. [Feature Overview](#feature-overview)
2. [Requirements](#requirements)
3. [AI Use Cases](#ai-use-cases)
4. [Current State Analysis](#current-state-analysis)
5. [Proposed Changes](#proposed-changes)
6. [Implementation Steps](#implementation-steps)
7. [Files to Modify](#files-to-modify)
8. [New Files to Create](#new-files-to-create)
9. [Claude Code Integration Examples](#claude-code-integration-examples)
10. [Testing Checklist](#testing-checklist)
11. [Success Criteria](#success-criteria)

---

## Feature Overview

### What

Enhance the export format with an AI-optimized structure that makes it easy for Claude Code and other AI assistants to:

- Understand project structure and status
- Generate new boards from requirements
- Update card details automatically
- Track project progress and suggest next actions

### Why

- **AI Integration:** Enable Claude Code to read/write Chronica boards programmatically
- **Automation:** AI can execute tasks and update status automatically
- **Context Sharing:** Provide full project context to AI in one file
- **Intelligence:** AI can analyze patterns and suggest improvements
- **Documentation:** Self-documenting project state for team/AI

### User Benefit

- AI assistant can manage tasks automatically
- Project tracking integrated with development workflow
- Intelligent task suggestions based on project state
- Reduced manual project management overhead

---

## Requirements

### Functional Requirements

1. **Export Format:**
   - JSON structure optimized for AI parsing
   - Nested columns → cards structure (not flat)
   - Redundant metadata for AI context
   - Human-readable field names
   - Optional `readme` field for AI instructions

2. **Metadata Enrichment:**
   - Board timestamps (created, modified)
   - Card timestamps
   - Relationship indicators
   - Progress statistics
   - Context descriptions

3. **Export UI:**
   - Checkbox: "AI-Optimized Format" in export modal
   - Tooltip explaining benefits
   - Works with both single and multi-board exports

4. **Import Compatibility:**
   - AI-optimized files can be imported back
   - Backward compatible with standard format
   - Auto-detect format during import

### AI Use Cases Supported

1. **Task Automation**
   - AI reads board, executes tasks, updates status
   - Example: Run tests, update card from "To Do" → "Done"

2. **Board Generation**
   - AI creates boards from requirements
   - Example: "Create sprint board with 10 user stories"

3. **Card Enrichment**
   - AI adds details, links, estimates, Card Fields
   - Example: Add acceptance criteria, links to docs, time estimates

4. **Project Tracking**
   - AI monitors state, creates reports, suggests actions
   - Example: "67% complete, 3 blockers, suggest: assign card X to dev Y"

---

## AI Use Cases

### Use Case 1: Task Automation

**Scenario:** Developer asks Claude Code to run tests and update board

**User Command:**

```
Claude, run all tests and update the "Testing" board. Move passed tests to Done, failed tests get error details in description.
```

**AI Workflow:**

1. Read `chronica_testing_ai.json`
2. Parse cards in "In Progress" column
3. Execute tests for each card
4. Update card status and description
5. Write updated JSON back to file
6. User imports updated board

**Required Format Features:**

- Nested structure (column contains cards)
- Writable JSON (AI can modify easily)
- Clear card identifiers
- Status/column mapping

---

### Use Case 2: Board Generation

**Scenario:** Product owner provides requirements, AI creates sprint board

**User Command:**

```
Claude, create a sprint board with these user stories:
1. User login
2. Password reset
3. Profile editing
... (10 more stories)

Add acceptance criteria, estimates, and assign to columns based on priority.
```

**AI Workflow:**

1. Parse user stories from command
2. Generate Chronica board structure
3. Create columns: Backlog, To Do, In Progress, Review, Done
4. Add cards with titles, descriptions, Card Fields (estimate, priority)
5. Output `chronica_sprint_1_ai.json`
6. User imports into Chronica

**Required Format Features:**

- Template structure (AI knows all required fields)
- Custom field definitions
- Clear schema documentation
- Example boards in docs

---

### Use Case 3: Card Enrichment

**Scenario:** Developer asks AI to add details to existing cards

**User Command:**

```
Claude, for each card in "To Do" column, add:
- Acceptance criteria (3-5 bullet points)
- Link to relevant docs
- Time estimate (use custom field)
- Tags based on feature area
```

**AI Workflow:**

1. Read board JSON
2. For each card in "To Do":
   - Generate acceptance criteria
   - Search docs, add link
   - Estimate time, set custom field
   - Auto-tag based on title keywords
3. Write enriched JSON
4. User imports

**Required Format Features:**

- Card Fields schema in export
- Links array structure
- Tags array
- Description supports formatting

---

### Use Case 4: Project Tracking

**Scenario:** Daily standup, AI generates progress report

**User Command:**

```
Claude, analyze the "Q4 Roadmap" board and give me:
- % complete
- Blockers (cards in "Blocked" column)
- Velocity (cards done per week)
- Suggested next actions
```

**AI Workflow:**

1. Read board JSON
2. Calculate statistics:
   - Total cards, done cards, % complete
   - Identify blocked cards
   - Analyze timestamps for velocity
3. Generate human-readable report
4. Suggest: "Assign card X to dev Y", "Merge card A and B (duplicates)", etc.

**Required Format Features:**

- Timestamps for trend analysis
- Column statistics
- Card metadata (assignee via Card Fields)
- Historical data (if available)

---

## Current State Analysis

### Current Export Format Limitations

**Flat Structure:**

```json
{
  "meta": {...},
  "columns": [
    {"key": "todo", "title": "To Do"},
    {"key": "doing", "title": "Doing"}
  ],
  "cards": [
    {"id": "1", "title": "Card 1", "column": "todo"},
    {"id": "2", "title": "Card 2", "column": "doing"}
  ]
}
```

**Problems for AI:**

1. **Flat arrays:** AI must join columns ↔ cards manually
2. **No nesting:** Cards not grouped by column
3. **No context:** Minimal metadata, no timestamps
4. **No guidance:** No human-readable descriptions for AI

### What AI Needs

1. **Nested Structure:**

   ```json
   {
     "columns": [
       {
         "title": "To Do",
         "cards": [{ "title": "Card 1" }, { "title": "Card 2" }]
       }
     ]
   }
   ```

2. **Redundant Counts:**

   ```json
   {
     "statistics": {
       "total_cards": 10,
       "cards_per_column": { "To Do": 5, "Done": 5 }
     }
   }
   ```

   (AI can verify parsing correctness)

3. **Temporal Data:**

   ```json
   {
     "board": {
       "created_at": "2025-11-01T00:00:00Z",
       "modified_at": "2025-11-03T10:30:00Z"
     },
     "cards": [
       {
         "created_at": "2025-11-02T14:00:00Z",
         "modified_at": "2025-11-03T09:15:00Z"
       }
     ]
   }
   ```

4. **Context Field:**
   ```json
   {
     "readme": "This board tracks Q4 features. Update 'Done' column when deployed to prod. Use 'estimate' custom field for story points."
   }
   ```

---

## Proposed Changes

### 1. AI-Optimized Export Schema

**File:** `src/state/types.ts` (add after MultiboardExportFormat)

```typescript
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
  readme?: string; // Optional AI instructions/context
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
  readme?: string;
}
```

### 2. Export Function with AI Optimization

**File:** `src/io/importExport.ts` (add after exportAllBoards)

```typescript
/**
 * Convert flat board to AI-optimized nested structure
 */
function convertToAIOptimized(board: Board, includeTimestamps = true): AIOptimizedBoardEntry {
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
        cards: columnCards.map((card) => ({
          ...card,
          created_at: includeTimestamps ? new Date().toISOString() : undefined, // TODO: Use real timestamp
          modified_at: includeTimestamps ? new Date().toISOString() : undefined,
        })),
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
function calculateBoardStatistics(board: Board): AIOptimizedExportFormat["statistics"] {
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
export async function exportBoardAIOptimized(
  board: Board,
  fields?: Record<string, FieldDefinition>,
  readme?: string
): Promise<void> {
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
        fields: fields || {},
      },
      board: aiBoard,
      statistics,
      readme,
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
export async function exportAllBoardsAIOptimized(
  boards: Board[],
  fields?: Record<string, FieldDefinition>,
  readme?: string
): Promise<void> {
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
        fields: fields || {},
      },
      boards: aiBoards,
      statistics: {
        board_count: boards.length,
        total_columns: boards.reduce((sum, b) => sum + b.columns.length, 0),
        total_cards: boards.reduce((sum, b) => sum + b.cards.length, 0),
        boards_summary: boardsSummary,
      },
      readme,
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
```

### 3. Import AI-Optimized Format

**File:** `src/io/importExport.ts` (add import support)

```typescript
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
      ...card,
      column: col.key, // Restore column reference
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
```

### 4. Export UI with AI Checkbox

**File:** Create new modal `src/ui/AIExportModal.tsx`

```tsx
import { useState } from "react";
import type { Board } from "@state/types";

interface AIExportModalProps {
  boards: Board[];
  activeBoard: Board | null;
  onExport: (boardId: string | "all", aiOptimized: boolean, readme?: string) => Promise<void>;
  onClose: () => void;
}

export function AIExportModal({ boards, activeBoard, onExport, onClose }: AIExportModalProps) {
  const [selectedBoardId, setSelectedBoardId] = useState<string | "all">(activeBoard?.id || "all");
  const [aiOptimized, setAIOptimized] = useState(true); // Default to AI-optimized
  const [readme, setReadme] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExport(selectedBoardId, aiOptimized, readme || undefined);
      onClose();
    } catch (error) {
      console.error("Export failed:", error);
      alert(`Export failed: ${error}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Export Board</h2>
          <button className="icon" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* Board Selection */}
          <div className="form-group">
            <label className="form-label">Select Board</label>
            <select
              className="form-select"
              value={selectedBoardId}
              onChange={(e) => setSelectedBoardId(e.target.value)}
            >
              {boards.map((board) => (
                <option key={board.id} value={board.id}>
                  {board.name}
                </option>
              ))}
              <option value="all">All Boards ({boards.length})</option>
            </select>
          </div>

/*          {/* AI-Optimized Checkbox */}
          <div className="form-checkbox">
            <input
              type="checkbox"
              checked={aiOptimized}
              onChange={(e) => setAIOptimized(e.target.checked)}
              id="ai-optimized"
            />
            <label htmlFor="ai-optimized">
              AI-Optimized Format
              <span
                style={{
                  display: "block",
                  fontSize: "var(--font-sm)",
                  color: "var(--text-muted)",
                  marginTop: "var(--space-1)",
                }}
              >
                Nested structure with timestamps and statistics. Better for Claude Code integration.
              </span>
            </label>
          </div>
*/
          {/* README/Instructions (only for AI-optimized) */}
          {aiOptimized && (
            <div className="form-group">
              <label className="form-label">
                AI Instructions (Optional)
                <span
                  style={{
                    fontSize: "var(--font-sm)",
                    color: "var(--text-muted)",
                    marginLeft: "var(--space-2)",
                  }}
                >
                  Provide context for AI assistants
                </span>
              </label>
              <textarea
                className="form-textarea"
                value={readme}
                onChange={(e) => setReadme(e.target.value)}
                placeholder="Example: Update cards in 'In Progress' after running tests. Use 'estimate' field for story points."
                rows={4}
              />
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose}>Cancel</button>
          <button
            className="primary"
            onClick={handleExport}
            disabled={isExporting || boards.length === 0}
          >
            {isExporting ? "Exporting..." : "Export"}
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## Implementation Steps

### Step 1: Add AI-Optimized Types (1 hour)

**File:** `src/state/types.ts`

1. Add all AI-optimized interfaces after `MultiboardExportFormat` (around line 120)
2. Export all new types

**Verification:** TypeScript compiles

---

### Step 2: Implement Conversion Functions (2 hours)

**File:** `src/io/importExport.ts`

1. Add `convertToAIOptimized()` function
2. Add `calculateBoardStatistics()` function
3. Add `convertFromAIOptimized()` function (for import)

**Verification:**

- Unit test: Convert sample board, verify nested structure
- Unit test: Convert back, verify no data loss

---

### Step 3: Implement AI Export Functions (2 hours)

**File:** `src/io/importExport.ts`

1. Add `exportBoardAIOptimized()` function
2. Add `exportAllBoardsAIOptimized()` function
3. Test with sample boards

**Verification:**

- Export produces valid JSON
- File name includes "\_ai" suffix
- Statistics match manual count

---

### Step 4: Implement AI Import Functions (1 hour)

**File:** `src/io/importExport.ts`

1. Add `importAIOptimizedFromJSON()` function
2. Integrate with existing `importFromJSON()` universal function

**Verification:**

- Export AI-optimized → Import → Verify board identical
- Nested structure correctly flattened

---

### Step 5: Create AI Export Modal (2 hours)

**File:** `src/ui/AIExportModal.tsx` (NEW)

1. Create modal component
2. Add board dropdown
3. Add AI-optimized checkbox
4. Add readme textarea
5. Wire up export handlers

**Verification:**

- Modal renders correctly
- Checkbox toggles AI format
- Readme field shows/hides based on checkbox

---

### Step 6: Integrate AI Export UI (1 hour)

**File:** `src/ui/Sidebar.tsx`

Update export button to open AI Export Modal instead of direct export:

```tsx
const [showAIExportModal, setShowAIExportModal] = useState(false);

// In JSX:
<button
  className="icon"
  onClick={() => setShowAIExportModal(true)}
  disabled={boards.length === 0}
  title="Export Board"
>
  ↓
</button>;

{
  showAIExportModal && (
    <AIExportModal
      boards={boards}
      activeBoard={activeBoard}
      onExport={handleAIExport}
      onClose={() => setShowAIExportModal(false)}
    />
  );
}
```

**File:** `src/App.tsx`

Update export handler:

```typescript
const handleAIExport = async (boardId: string | "all", aiOptimized: boolean, readme?: string) => {
  try {
    if (aiOptimized) {
      if (boardId === "all") {
        await exportAllBoardsAIOptimized(boards, config?.fields, readme);
      } else {
        const board = boards.find((b) => b.id === boardId);
        if (!board) throw new Error("Board not found");
        await exportBoardAIOptimized(board, config?.fields, readme);
      }
    } else {
      // Standard export
      if (boardId === "all") {
        await exportAllBoards(boards, config?.fields);
      } else {
        const board = boards.find((b) => b.id === boardId);
        if (!board) throw new Error("Board not found");
        await exportBoard(board.name, board.columns, board.cards, config?.fields);
      }
    }
  } catch (error) {
    console.error("Export failed:", error);
    showAlert("Export Failed", `${error}`);
  }
};
```

**Verification:**

- Export modal opens on button click
- AI checkbox works
- Export creates correct file format

---

### Step 7: Update Import to Handle AI Format (1 hour)

**File:** `src/ui/ImportModal.tsx`

Update format detection to include AI format:

```typescript
const handleImport = (content: string) => {
  try {
    const data = JSON.parse(content);
    const schema = data.meta?.schema;

    if (schema === "chronica-ai-optimized") {
      const imported = importAIOptimizedFromJSON(content);
      // Handle single or multi-board
      if (imported.format === "single") {
        // Existing single-board logic
      } else {
        // Multi-board logic
      }
    } else {
      // Standard format
      const imported = importFromJSON(content);
      // Existing logic
    }
  } catch (error) {
    setError(`Import failed: ${error}`);
  }
};
```

**Verification:**

- Import AI-optimized file → works correctly
- Import standard file → works as before
- Import detects format automatically

---

### Step 8: Testing & Documentation (2 hours)

1. Create example AI-optimized export
2. Test all AI use cases (see [Claude Code Integration Examples](#claude-code-integration-examples))
3. Update README with AI export feature
4. Create user guide for Claude Code integration

---

## Files to Modify

### New Files

1. **`src/ui/AIExportModal.tsx`** (~120 lines)
2. **Example:** `docs/examples/ai-optimized-export.json` (~200 lines)
3. **Guide:** `docs/CLAUDE-CODE-INTEGRATION.md` (~300 lines)

**Total New Lines:** ~620

### Modified Files

1. **`src/state/types.ts`** (+150 lines)
   - AI-optimized interfaces

2. **`src/io/importExport.ts`** (+200 lines)
   - Conversion functions
   - Export functions
   - Import functions

3. **`src/ui/Sidebar.tsx`** (+10 lines)
   - AI export modal integration

4. **`src/App.tsx`** (+30 lines)
   - AI export handler

5. **`src/ui/ImportModal.tsx`** (+20 lines)
   - AI format detection

**Total Modified Lines:** ~410

---

## Claude Code Integration Examples

### Example 1: Task Automation Script

**File:** `.claude/commands/update-board.md`

```markdown
# Update Testing Board

Read `chronica_testing_ai.json`, run all tests for cards in "In Progress" column, update card status:

- Passed tests → move to "Done"
- Failed tests → add error details to description, add "failed" tag

Export updated board to `chronica_testing_ai_updated.json`.
```

**Claude Code Workflow:**

1. Read AI-optimized JSON
2. Parse nested structure: `board.columns[1].cards`
3. For each card, run test command
4. Update card object
5. Write modified JSON

---

### Example 2: Board Generation

**User Prompt:**

```
Create a new Chronica board for Q4 roadmap with these features:
1. User authentication
2. Dashboard redesign
3. API v2 migration
4. Mobile app prototype

Use columns: Backlog, To Do, In Progress, Review, Done
Add acceptance criteria for each feature.
```

**Claude Response (generates JSON):**

```json
{
  "meta": {
    "schema": "chronica-ai-optimized",
    "version": 2,
    "ai_optimized": true,
    "project": "Q4 Roadmap",
    "description": "Q4 feature roadmap with 4 major initiatives",
    "created_at": "2025-11-03T...",
    ...
  },
  "board": {
    "id": "generated-uuid",
    "name": "Q4 Roadmap",
    "description": "Q4 2025 feature development roadmap",
    "column_count": 5,
    "card_count": 4,
    "columns": [
      {
        "key": "backlog",
        "title": "Backlog",
        "order": 0,
        "card_count": 0,
        "cards": []
      },
      {
        "key": "todo",
        "title": "To Do",
        "order": 1,
        "card_count": 4,
        "cards": [
          {
            "id": "generated-uuid-1",
            "title": "User Authentication",
            "description": "**Acceptance Criteria:**\n- OAuth 2.0 support\n- Email/password login\n- Password reset flow\n- Session management",
            "tags": ["backend", "security"],
            "customFields": {
              "estimate": "8"
            }
          },
          // ... 3 more cards
        ]
      },
      // ... other columns
    ]
  },
  "statistics": {...}
}
```

**User imports this file into Chronica → instant board creation!**

---

### Example 3: Card Enrichment

**User Prompt:**

```
For each card in "To Do" column of my_project_ai.json:
- Add 3-5 acceptance criteria bullet points
- Add link to docs (search my docs folder)
- Set time estimate custom field
```

**Claude Code Script:**

```python
import json

# Read AI-optimized export
with open("my_project_ai.json") as f:
    data = json.load(f)

# Find "To Do" column
todo_column = next(col for col in data["board"]["columns"] if col["title"] == "To Do")

# Enrich each card
for card in todo_column["cards"]:
    # Generate acceptance criteria
    card["description"] = generate_acceptance_criteria(card["title"])

    # Add doc link
    doc_url = search_docs(card["title"])
    if not card.get("links"):
        card["links"] = []
    card["links"].append({"label": "Documentation", "url": doc_url})

    # Estimate time
    if not card.get("customFields"):
        card["customFields"] = {}
    card["customFields"]["estimate"] = estimate_story_points(card["title"])

# Update statistics
data["statistics"]["total_cards"] = len(todo_column["cards"])

# Write updated JSON
with open("my_project_ai_enriched.json", "w") as f:
    json.dump(data, f, indent=2)
```

---

### Example 4: Progress Report

**User Prompt:**

```
Analyze q4_roadmap_ai.json and give me a progress report.
```

**Claude Response:**

```
# Q4 Roadmap Progress Report
Generated: 2025-11-03 10:30 AM

## Overall Status
- **Completion:** 65% (13/20 cards done)
- **Velocity:** 2.5 cards/week
- **Projected Completion:** Dec 15, 2025

## Column Breakdown
| Column      | Cards | % of Total |
|-------------|-------|------------|
| Backlog     | 2     | 10%        |
| To Do       | 3     | 15%        |
| In Progress | 2     | 10%        |
| Review      | 0     | 0%         |
| Done        | 13    | 65%        |

## Blockers
1. **API v2 Migration** (In Progress) - Blocked on database schema approval
2. **Mobile Prototype** (To Do) - Waiting for design mockups

## Recommendations
1. Assign "Dashboard Redesign" to UI team (high priority)
2. Merge duplicate cards: "User Login" and "Authentication"
3. Add acceptance criteria to 3 cards missing them
4. Schedule review for 2 cards in "In Progress" for >5 days

## Tags Analysis
Most used tags: `backend (8), frontend (6), security (4)`

## Next Actions
- **This Week:** Complete API migration, start dashboard redesign
- **Next Week:** Review completed features, deploy to staging
```

---

## Testing Checklist

### Export Tests

- [ ] AI-optimized export creates nested structure
- [ ] Statistics match manual count
- [ ] Readme field included when provided
- [ ] File name has "\_ai" suffix
- [ ] JSON is pretty-printed (readable)
- [ ] Timestamps in ISO8601 format
- [ ] Card Fields included in metadata

### Import Tests

- [ ] AI-optimized import converts to flat structure
- [ ] No data loss during round-trip (export → import)
- [ ] Standard import still works
- [ ] Format auto-detected correctly
- [ ] Invalid AI format shows clear error

### UI Tests

- [ ] AI Export Modal renders
- [ ] Checkbox toggles AI format
- [ ] Readme field shows/hides correctly
- [ ] Export button disabled when no boards
- [ ] Progress indicator during export

### AI Integration Tests

- [ ] Claude Code can parse nested structure
- [ ] Claude Code can modify and re-export
- [ ] Statistics help AI verify parsing
- [ ] Readme provides useful context
- [ ] Nested cards easy to iterate

---

## Success Criteria

1. **AI-Optimized Export Works**
   - Nested column → cards structure
   - Statistics included and accurate
   - Readme field optional but functional

2. **Import Compatibility**
   - AI-optimized files import correctly
   - Standard files import as before
   - No data loss

3. **Claude Code Integration**
   - AI can parse exports easily
   - AI can modify and re-export
   - All 4 use cases demonstrated

4. **Documentation Complete**
   - Example exports provided
   - Claude Code integration guide written
   - User guide updated

---

**End of FEATURE-AI-JSON-FORMAT.md**

**Last Updated:** 2025-11-03
**Author:** Claude Code
**Version:** 1.0
