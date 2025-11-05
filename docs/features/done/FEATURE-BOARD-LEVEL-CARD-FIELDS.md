# FEATURE: Board-Level Card Fields System

**Status:** Ready to Implement
**Priority:** High
**Estimated Time:** 4-6 hours
**Dependencies:** None

---

## Overview

Refactor card field system from global (config-level) to board-level, with support for card-specific one-off fields.

### **Current Problem:**
- All boards share same field definitions globally
- Importing boards causes field conflicts
- Can't have board-specific fields (e.g., "Sprint" only on sprint boards)

### **Solution:**
3-tier field system:
1. **Global Template** (Settings) → blueprint for new boards
2. **Board Fields** → independent fields per board
3. **Card-Only Fields** → one-off fields for specific cards

---

## Data Structure Changes

### **1. Card Type** (src/state/types.ts)

```typescript
export interface Card {
  // ... existing fields
  customFields?: Record<string, unknown>; // From board.fields
  cardOnlyFields?: Record<string, unknown>; // Card-specific fields
}
```

### **2. Board Type** (src/state/types.ts)

```typescript
export interface Board {
  id: string;
  name: string;
  columns: Column[];
  cards: Card[];
  fields?: Record<string, FieldDefinition>; // Board-level field definitions
}
```

### **3. Config Type** (src/state/types.ts)

```typescript
export interface Config {
  // ... existing fields
  defaultFieldTemplate?: Record<string, FieldDefinition>; // Template for new boards
  fields?: Record<string, FieldDefinition>; // DEPRECATED (for migration)
}
```

---

## Implementation Steps

### **Phase 1: Core Refactor**

#### **1.1 Update Types** ✅ (Already done)
- Add `cardOnlyFields` to Card
- Add `fields` to Board
- Rename Config.fields → `defaultFieldTemplate`

#### **1.2 Update boardStore.ts**

**createBoard function:**
```typescript
createBoard: (name, withStarters = false) => {
  const state = get();
  // Copy global template to new board
  const { config } = useConfigStore.getState();
  const templateFields = config?.defaultFieldTemplate;

  const newBoard: Board = {
    id: uuidv4(),
    name,
    columns: DEFAULT_COLUMNS,
    cards: withStarters ? STARTER_CARDS.map(...) : [],
    fields: templateFields ? { ...templateFields } : undefined, // Copy template
  };
  // ...
},
```

**importBoard function:**
```typescript
importBoard: (name, columns, cards, fields) => {  // Add fields param
  const state = get();
  const newBoard: Board = {
    id: uuidv4(),
    name,
    columns,
    cards: cards.map((card) => ({
      ...card,
      id: card.id || uuidv4(),
    })),
    fields, // Use imported fields directly
  };
  // ...
},
```

#### **1.3 Update configStore.ts**

**Migration logic** (in loadConfig or init):
```typescript
// Migrate old global fields to defaultFieldTemplate
if (config.fields && !config.defaultFieldTemplate) {
  config.defaultFieldTemplate = config.fields;
  delete config.fields; // Clean up deprecated field
}
```

**getAllFields() method:**
```typescript
// DEPRECATED - phase out usage
getAllFields: () => {
  const config = get().config;
  return config?.defaultFieldTemplate || {};
},
```

#### **1.4 Update Export Functions** (src/io/importExport.ts)

**exportBoardAIOptimized:**
```typescript
export async function exportBoardAIOptimized(
  board: Board,
  fields?: Record<string, FieldDefinition> // Remove - use board.fields instead
): Promise<void> {
  const exportData: AIOptimizedExportFormat = {
    meta: {
      // ...
      fields: board.fields || {}, // Use board's fields
    },
    // ...
  };
}
```

**Remove `fields` parameter from:**
- `exportBoardAIOptimized(board)`
- `exportAllBoardsAIOptimized(boards)`

**Update all call sites in App.tsx:**
```typescript
await exportBoardAIOptimized(board); // Remove config?.fields param
await exportAllBoardsAIOptimized(boards); // Remove config?.fields param
```

#### **1.5 Update Import Functions** (src/io/importExport.ts)

**importAIOptimizedFromJSON:**
```typescript
// Single board
if (aiImport.format === "single" && aiImport.singleBoard) {
  return {
    ...aiImport.singleBoard,
    fields: data.meta.fields, // Fields come from export meta
  };
}

// Multi-board
boards.map((aiBoard: AIOptimizedBoardEntry) => ({
  id: aiBoard.id,
  ...convertFromAIOptimized(aiBoard),
  fields: data.meta.fields, // Each board gets its own fields
}))
```

#### **1.6 Update ImportModal.tsx**

**Remove field conflict logic entirely:**
```typescript
// DELETE this function
const mergeFields = (importedFields?: Record<string, any>) => {
  // REMOVE - no longer needed
};

// Import directly without merging
const handleFileImport = async () => {
  const result = await importBoardFromFile();
  if (result) {
    // Fields already in result.fields - no merge needed
    importBoard(result.name, result.columns, result.cards, result.fields);
    onClose();
  }
};
```

**Update boardStore.importBoard signature:**
```typescript
importBoard: (name: string, columns: Column[], cards: Card[], fields?: Record<string, FieldDefinition>) => void;
```

---

### **Phase 2: UI Enhancements**

#### **2.1 Add Board Edit Menu**

**Location:** Above first column in KanbanBoard.tsx

```tsx
<div className="board-header">
  <button className="board-edit-btn" onClick={handleShowEditMenu}>
    Edit ▼
  </button>

  {showEditMenu && (
    <div className="board-edit-dropdown">
      <div className="menu-item" onClick={() => setShowBoardFieldEditor(true)}>
        ⚙️ Card Fields
      </div>
      {/* Future: Add more options */}
    </div>
  )}
</div>
```

#### **2.2 BoardFieldEditor Component**

**New file:** `src/ui/BoardFieldEditor.tsx`

```tsx
interface BoardFieldEditorProps {
  board: Board;
  onSave: (fields: Record<string, FieldDefinition>) => void;
  onClose: () => void;
}

export function BoardFieldEditor({ board, onSave, onClose }: BoardFieldEditorProps) {
  const [fields, setFields] = useState(board.fields || {});

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Card Fields for "{board.name}"</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <FieldManager
            fields={fields}
            onChange={setFields}
            context="board" // New prop to show context
          />
        </div>

        <div className="modal-footer">
          <button onClick={onClose}>Cancel</button>
          <button className="primary" onClick={() => onSave(fields)}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Add to boardStore:**
```typescript
updateBoardFields: (boardId: string, fields: Record<string, FieldDefinition>) => {
  const state = get();
  const boards = state.boards.map((b) =>
    b.id === boardId ? { ...b, fields } : b
  );
  const activeBoard = state.activeBoard?.id === boardId
    ? { ...state.activeBoard, fields }
    : state.activeBoard;
  set({ boards, activeBoard });
},
```

#### **2.3 Update FieldManager**

**Add context prop:**
```tsx
interface FieldManagerProps {
  fields: Record<string, FieldDefinition>;
  onChange: (fields: Record<string, FieldDefinition>) => void;
  context?: "global" | "board"; // New prop
}

// Show context in UI
<div className="field-manager-header">
  <h3>Card Fields</h3>
  {context === "global" && (
    <p className="context-hint">
      Default template for new boards
    </p>
  )}
  {context === "board" && (
    <p className="context-hint">
      Fields for this board only
    </p>
  )}
</div>
```

#### **2.4 Card-Specific Fields (CardEditor.tsx)**

**Add section for one-off fields:**
```tsx
{/* Board Fields Section */}
<div className="card-fields-section">
  <h4>Card Fields</h4>
  {Object.entries(activeBoard.fields || {}).map(([id, field]) => (
    <FieldInput key={id} field={field} value={formData.customFields?.[id]} />
  ))}
</div>

{/* Card-Only Fields Section */}
<div className="card-only-fields-section">
  <div className="section-header">
    <h4>Custom Fields (This Card Only)</h4>
    <button onClick={handleAddCardOnlyField}>+ Add</button>
  </div>

  {Object.entries(formData.cardOnlyFields || {}).map(([id, value]) => (
    <div key={id} className="card-only-field">
      <input
        type="text"
        value={value as string}
        onChange={(e) => updateCardOnlyField(id, e.target.value)}
      />
      <button onClick={() => removeCardOnlyField(id)}>×</button>
    </div>
  ))}
</div>
```

**Add state management:**
```typescript
const [showAddCardFieldDialog, setShowAddCardFieldDialog] = useState(false);

const handleAddCardOnlyField = () => {
  const fieldName = prompt("Field name:");
  if (fieldName) {
    setFormData({
      ...formData,
      cardOnlyFields: {
        ...formData.cardOnlyFields,
        [fieldName]: "",
      },
    });
  }
};

const removeCardOnlyField = (fieldId: string) => {
  const { [fieldId]: _, ...rest } = formData.cardOnlyFields || {};
  setFormData({ ...formData, cardOnlyFields: rest });
};
```

#### **2.5 Update SettingsModal**

**Update field template section:**
```tsx
<div className="settings-section">
  <h3>Default Card Fields Template</h3>
  <p className="section-description">
    These fields will be copied to new boards when created.
    Existing boards are not affected.
  </p>

  <FieldManager
    fields={config?.defaultFieldTemplate || {}}
    onChange={(fields) => updateConfig({ defaultFieldTemplate: fields })}
    context="global"
  />
</div>
```

---

## Testing Checklist

### **Phase 1 (Core):**
- [ ] Create new board → has template fields from Settings
- [ ] Import board → fields come with board (no conflicts)
- [ ] Export board → includes board.fields in meta
- [ ] Multiple boards can have different fields
- [ ] Old boards without fields still work

### **Phase 2 (UI):**
- [ ] Board Edit menu appears above first column
- [ ] Board field editor shows board-specific fields
- [ ] Saving board fields updates only that board
- [ ] Card editor shows board fields + card-only fields
- [ ] Card-only fields save with card
- [ ] Settings shows "Default Template" context

---

## Migration Strategy

**For existing users:**

1. **On first load after update:**
   - Copy `config.fields` → `config.defaultFieldTemplate`
   - For each existing board: `board.fields = config.fields` (copy)
   - Delete `config.fields`

2. **Fallback handling:**
   - If board.fields is undefined, use `config.defaultFieldTemplate` as fallback
   - Card editor checks `activeBoard.fields || config.defaultFieldTemplate`

---

## File Modifications

**Phase 1:**
- `src/state/types.ts` (~15 lines)
- `src/stores/boardStore.ts` (~30 lines)
- `src/stores/configStore.ts` (~20 lines)
- `src/io/importExport.ts` (~40 lines)
- `src/ui/ImportModal.tsx` (~-50 lines, removals)
- `src/App.tsx` (~10 lines)

**Phase 2:**
- `src/ui/KanbanBoard.tsx` (~50 lines, add edit menu)
- `src/ui/BoardFieldEditor.tsx` (~120 lines, NEW)
- `src/ui/FieldManager.tsx` (~30 lines, add context)
- `src/ui/CardEditor.tsx` (~80 lines, add card-only fields)
- `src/ui/SettingsModal.tsx` (~20 lines, update label)

**Total:** ~400 lines

---

## Success Criteria

✅ **Data Model:**
- Boards have independent field definitions
- Cards can have board fields + card-only fields
- Global template used only for new boards

✅ **Import/Export:**
- No field conflicts on import
- Fields travel with boards
- Round-trip preserves all data

✅ **UI:**
- Clear context labels ("Template" vs "This Board")
- Easy access to board field editor
- Simple card-only field addition

✅ **Migration:**
- Existing boards get current fields
- No data loss
- Backward compatible with old exports

---

**Document Version:** 1.0
**Last Updated:** 2025-11-04
**Ready for Implementation**
