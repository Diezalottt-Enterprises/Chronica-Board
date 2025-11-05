# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Chronica is a desktop sticky kanban widget built with Tauri 2, React 19, and TypeScript. It's a lightweight task management tool that lives on the desktop like a sticky note with multi-board support, local persistence, and drag-and-drop functionality.

## Project Status

**Current Version:** v0.1.0-alpha.6
**Completion:** ~90% ready for beta release

### What's Complete (100%)

- Multi-board kanban with drag-and-drop
- Card Fields system (FieldManager UI, validation, persistence)
- System tray integration (autostart, hide/show)
- Security hardening (XSS prevention, input validation)
- Resilient persistence (atomic writes, backups, retry logic)
- Dark mode and UI scaling

### What's Missing

- **Test coverage** (2.26% vs 80% target) - biggest gap
- **Custom field display** on cards (stored but not rendered)
- **Planned features** (4 docs in `docs/features/` ready to implement):
  1. Multi-board export (1-2 days)
  2. AI-optimized JSON format (1-2 days)
  3. Column color mode toggle (1 day)
  4. Style guide alignment (2-3 days)

### Known Issues

- 73 console.log statements need cleanup/removal
- 6 ESLint errors (coverage files need exclusion)
- No accessibility audit done
- Card Fields not visible on Card.tsx (only in CardEditor)

**All feature docs in `docs/features/` are current and relevant.**

## Development Commands

### Core Development

- `pnpm install` - Install dependencies (requires Node 22+, pnpm 9+)
- `pnpm tauri dev` - Run app in development mode (requires Rust)
- `pnpm tauri build` - Build production executable

### Testing & Quality

- `pnpm test` - Run all tests with Vitest
- `pnpm test:watch` - Run tests in watch mode
- `pnpm test:ui` - Run tests with UI
- `pnpm test:coverage` - Generate coverage report
- `pnpm typecheck` - Run TypeScript compiler without emitting files
- `pnpm lint` / `pnpm lint:fix` - Run ESLint
- `pnpm format` / `pnpm format:fix` - Check/fix Prettier formatting

### Build & Preview

- `pnpm build` - Build frontend only (syncs version, runs TypeScript, builds with Vite)
- `pnpm dev` - Start Vite dev server only (for frontend testing)
- `pnpm preview` - Preview production build

## Architecture

### State Management (Zustand)

Three core stores manage application state:

1. **`boardStore`** (`src/stores/boardStore.ts`) - Manages boards, cards, and columns
   - All board operations (create, rename, delete, import)
   - Card CRUD operations and drag-and-drop moves
   - Column management (add, delete, reorder, rename, duplicate, sort, collapse)
   - Uses lexicographic ranking for card ordering within columns

2. **`configStore`** (`src/stores/configStore.ts`) - Manages app configuration and window state
   - Window position, size, opacity
   - UI preferences (pinned, autostart, sidebar state, columns locked, UI scale)
   - Persisted to `%AppData%/Chronica/config.json`

3. **`uiStore`** (`src/stores/uiStore.ts`) - Manages ephemeral UI state
   - Modal visibility (card editor, board creator, import, settings, etc.)
   - Active card/board selection for editing
   - Not persisted

### Persistence Layer (`src/io/`)

**Critical**: All file I/O uses Tauri's `@tauri-apps/plugin-fs` API, not Node.js `fs` module.

- **`persistence.ts`** - Core file operations with Zod validation
  - Atomic writes with temp files (`.tmp` suffix)
  - Automatic backups before saves (max 5 per board, timestamped)
  - Debounced saves to reduce I/O
  - All data stored in `%AppData%/Chronica/`:
    - `boards-index.json` - Board registry with active board ID
    - `boards/board-{id}.json` - Individual board files
    - `backups/board-{id}-{timestamp}.json` - Automatic backups
    - `config.json` - App configuration

- **`importExport.ts`** - JSON import/export with schema versioning
  - Exports include metadata (schema version, app version, timestamp)
  - Zod validation prevents corrupted imports

- **`fieldRegistry.ts`** & **`fieldSchema.ts`** - Custom field system (future-proofing)
  - Dynamic field validation and sanitization
  - Max 20 Card Fields per board

### Service Layer (`src/services/`)

- **`saveQueue.ts`** - Resilient save queue with exponential backoff retry logic
  - Singleton instance handles all save operations
  - 3 attempts: 0ms, 1s, 2s delays
  - Subscribers can listen to save status changes
  - Prevents data loss from transient errors

- **`storage.ts`** - High-level storage API wrapping persistence layer
  - Integrates with `saveQueue` for all writes
  - Used by stores for persistence

- **`window.ts`** - Window management (position, size, opacity, always-on-top)
  - Wraps Tauri window API

- **`logger.ts`** - Centralized logging utility

### Platform Integration (`src/platform/`)

- **`paths.ts`** - Platform-agnostic path resolution using Tauri's `path` plugin
- **`window.ts`** - Window control abstractions

### Tauri Backend (`tauri/src/`)

- **`lib.rs`** - Main Rust application setup
  - System tray with Show/Hide, Settings, Quit menu
  - Tray click toggles window visibility
  - Window close button hides (doesn't quit) - app lives in system tray
  - Plugins: fs, dialog, opener, autostart, window-state
  - Emits `open-settings` event when tray Settings clicked

- **Tauri config** (`tauri/tauri.conf.json`)
  - Frameless transparent window (custom title bar in React)
  - Dev server on port 1420
  - Frontend dist from `../dist`

### UI Components (`src/ui/`)

React components organized by feature:

- **KanbanBoard** - Main board view with drag-and-drop (@dnd-kit)
- **Card** - Individual task cards
- **Column** - Kanban columns with add/rename/delete/sort actions
- **Modals** - CardEditor, BoardCreator, ImportModal, SettingsModal, etc.
- **TitleBar** - Custom window controls (frameless window)
- **Sidebar** - Board switcher

### Type System (`src/state/types.ts`)

Core domain types:

- `Card` - Task card with title, description, column, color, tags, rank, due date, links, customFields
- `Column` - Column definition with key, title, order, color, collapsed state
- `Board` - Contains columns and cards arrays
- `BoardsIndex` - Registry of all boards with active board ID
- `Config` - Application configuration
- `ExportFormat` - JSON export schema with metadata

### Security

- **XSS Prevention**: All user HTML sanitized with DOMPurify (`src/utils/sanitize.ts`)
- **Input Validation**: Zod schemas validate all persisted data
- **Path Safety**: All file paths resolved through Tauri's secure path API
- **CSP**: Content Security Policy configured in Tauri config

## Path Aliases

TypeScript/Vite aliases (configured in `tsconfig.json` and `vite.config.ts`):

- `@/` → `src/`
- `@ui/` → `src/ui/`
- `@stores/` → `src/stores/`
- `@services/` → `src/services/`
- `@io/` → `src/io/`
- `@platform/` → `src/platform/`
- `@state/` → `src/state/`
- `@constants/` → `src/constants/`
- `@utils/` → `src/utils/`

## Testing

- **Framework**: Vitest with happy-dom environment
- **Setup**: `src/test-utils/setup.ts`
- **Coverage**: 50% minimum for lines, functions, branches, statements
- **Test Files**: `*.test.ts` files next to source (e.g., `sanitize.test.ts`)
- **Mocking Tauri**: Tests mock Tauri APIs since they require native context

## Common Patterns

### Adding a New Store Action

1. Add action to store interface in the store file
2. Implement in Zustand `create()` callback
3. Update derived state (boards/activeBoard) immutably
4. Trigger persistence via `storage.ts` if needed

### Adding a New Persistence Operation

1. Define Zod schema in `src/io/schema.ts`
2. Add load/save functions in `persistence.ts`
3. Integrate with `saveQueue` for writes
4. Add high-level API in `storage.ts`

### Adding a New Modal

1. Create modal component in `src/ui/modals/`
2. Add visibility state to `uiStore`
3. Add open/close actions to `uiStore`
4. Import and conditionally render in `App.tsx`

### Drag-and-Drop (Cards)

- Uses `@dnd-kit` library (core, sortable, utilities)
- Card moves update `rank` for lexicographic ordering
- Rank calculation in `src/utils/ranking.ts`
- See `KanbanBoard.tsx` for DndContext setup

## Data Flow

1. **User Action** → UI Component
2. **UI Component** → Store Action (Zustand)
3. **Store Updates** → Immutable state updates
4. **Persistence** → `saveQueue.save()` → debounced → `persistence.ts` → Tauri fs plugin
5. **Re-render** → React components subscribe to store

## Key Constraints

- **Windows-only** (currently) - Tauri is cross-platform but only Windows tested
- **Rust required** - For Tauri compilation
- **Node 22+ / pnpm 9+** - Enforced via package.json engines
- **TypeScript strict mode** - All files must pass strict type checking
- **No backend server** - Fully offline, local-first application

## First Build Notes

- Rust compilation can take 5-10 minutes on first build
- Installer created in `tauri/target/release/bundle/`
- Dev mode supports hot reload for React but not Rust changes

## Version History

| Version | Date       | Changes                                          | Author      |
| ------- | ---------- | ------------------------------------------------ | ----------- |
| 1.0     | 2025-11-03 | Initial creation with 4 feature files            | Claude Code |
| 1.1     | 2025-11-04 | Added FEATURE-INSTALLER-BUILD.md (5 files total) | Claude Code |

---

**Last Updated:** 2025-11-04
**Maintained By:** Chronica Development Team
**Document Count:** 5 feature files + 1 index