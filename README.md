# Chronica v0.1.0-alpha

**Desktop Sticky Kanban Widget** - A lightweight, always-accessible task management tool that lives on your desktop like a sticky note.

## Features

- 🎯 **Multi-Board Support** - Manage multiple projects with separate kanban boards
- 📌 **Always-on-Top Toggle** - Pin the widget to stay visible above other windows
- 🎨 **Custom Card Colors** - Organize with predefined or custom hex colors
- 💾 **Local Persistence** - All data saved locally in `%AppData%/Chronica`
- 📤 **Import/Export** - Backup and share boards as JSON files
- 🚀 **Autostart** - Optional launch on system startup
- 🔍 **Opacity Control** - Adjust window transparency (0.7 - 1.0)
- 🎴 **Drag & Drop** - Smooth card movement between columns

## Requirements

- **Rust** (latest stable) - [Install from rust-lang.org](https://www.rust-lang.org/learn/get-started#installing-rust)
- **Node.js** 22+ and **pnpm** 9+
- **WebView2 Runtime** (Windows) - Usually pre-installed on Windows 10/11

> **Note:** Node and pnpm versions enforced via `package.json` engines field

## Quick Start

### Development

```cmd
# Install dependencies
pnpm install

# Run in development mode
pnpm tauri dev
```

### Build

```cmd
# Build for production
pnpm tauri build
```

The installer will be created in `tauri/target/release/bundle/`

## Usage

### Board Management

- **New Board**: Click the `+` button in the sidebar
- **Switch Boards**: Click on any board in the sidebar
- **Rename Board**: Right-click → Rename
- **Delete Board**: Right-click → Delete (cannot delete last board)

### Card Management

- **Add Card**: Click `+ Add Card` in any column
- **Edit Card**: Click on a card to edit title, description, color
- **Move Card**: Drag cards between columns
- **Delete Card**: Open card editor → Delete button

### Import/Export

- **Export**: Header → Export (saves current board as JSON)
- **Import**: Header → Import → Choose file or paste JSON (adds as new board)

### Settings

- **Autostart**: Launch Chronica on Windows login
- **Starter Cards**: Show example cards on first launch

## Data Location

All data is stored in `%AppData%/Chronica/`:

- `boards-index.json` - List of all boards
- `boards/` - Individual board files
- `config.json` - Window state and settings

## Keyboard Shortcuts

- **ESC** - Close current modal
- **Enter** - Save card (when editing)

## Tech Stack

| Technology         | Purpose           | Rationale                                                       |
| ------------------ | ----------------- | --------------------------------------------------------------- |
| **Tauri 2**        | Desktop framework | Lightweight (~5MB), secure, cross-platform, uses system WebView |
| **React 19**       | UI library        | Component model, hooks, wide ecosystem                          |
| **TypeScript 5.8** | Type system       | Strict mode, catches bugs at compile-time, better DX            |
| **Vite 7**         | Build tool        | Fast HMR, ES modules, optimized bundling                        |
| **Zustand**        | State management  | Minimal boilerplate, <3KB, excellent TS support                 |
| **@dnd-kit**       | Drag & drop       | Accessible, performant, modular                                 |
| **Zod**            | Schema validation | Runtime type safety for import/export                           |
| **DOMPurify**      | XSS protection    | Sanitize user HTML input                                        |

**Dev Tools:**

- **Vitest** - Fast test runner with Vite integration
- **ESLint + Prettier** - Code quality and formatting
- **Renovate** - Automated dependency updates

## Project Structure

```
/Chronica-CC
  /src
    /ui          - React components (Card, KanbanBoard, modals, etc.)
    /stores      - Zustand stores (boardStore, configStore, uiStore)
    /services    - Business logic (saveQueue, storage, logger)
    /io          - Persistence, import/export, field registry
    /platform    - Tauri/OS integration (paths, window management)
    /state       - TypeScript type definitions
    /constants   - App constants (ranks, validation)
    /utils       - Pure utility functions (sanitize, theme, type guards)
  /tauri         - Rust backend (moved from src-tauri)
  /public        - Static assets
  /tests         - Test files
  /docs          - Documentation and ADRs
```

**Path Aliases:**

- `@/` → `src/`
- `@ui/` → `src/ui/`
- `@stores/` → `src/stores/`
- `@services/` → `src/services/`

## Available Scripts

| Script               | Description                         |
| -------------------- | ----------------------------------- |
| `pnpm dev`           | Start Vite dev server               |
| `pnpm build`         | TypeScript check + production build |
| `pnpm preview`       | Preview production build            |
| `pnpm tauri dev`     | Run Tauri app in dev mode           |
| `pnpm tauri build`   | Build production Tauri app          |
| `pnpm typecheck`     | Run TypeScript compiler (no emit)   |
| `pnpm lint`          | Run ESLint                          |
| `pnpm lint:fix`      | Run ESLint with auto-fix            |
| `pnpm format`        | Check Prettier formatting           |
| `pnpm format:fix`    | Auto-format with Prettier           |
| `pnpm test`          | Run Vitest tests                    |
| `pnpm test:ui`       | Run Vitest with UI                  |
| `pnpm test:coverage` | Run tests with coverage report      |

## Known Issues

- Rust must be installed to build the app
- First build may take 5-10 minutes (Rust compilation)
- Opacity control has TypeScript type warnings (works correctly at runtime)

## Future Roadmap (v0.2.0+)

- System tray integration
- Multiple board tabs/switcher UI
- CSV import
- Card due dates and reminders
- Search and filtering
- Theme customization

## License

MIT License - See LICENSE file for details

## Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

**Quality Checks:**

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm build
```

All checks must pass before merge.

## Security

See [SECURITY.md](SECURITY.md) for reporting vulnerabilities.

---

**Chronica v0.1.0-alpha** - Built with ❤️ using Tauri + React
