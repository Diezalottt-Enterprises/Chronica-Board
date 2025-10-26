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

- **Rust** - [Install from rust-lang.org](https://www.rust-lang.org/learn/get-started#installing-rust)
- **Node.js** (v18+) and **pnpm**
- **WebView2 Runtime** (Windows) - Usually pre-installed on Windows 10/11

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

The installer will be created in `src-tauri/target/release/bundle/`

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

- **Tauri** - Lightweight desktop framework
- **React** - UI framework
- **TypeScript** - Type safety
- **Zustand** - State management
- **@dnd-kit** - Drag and drop
- **Zod** - Schema validation

## Project Structure

```
/Chronica-CC
  /src
    /ui       - React components
    /state    - Zustand store and types
    /platform - Tauri window/path helpers
    /io       - Import/export and persistence
  /src-tauri  - Rust backend
  /assets     - Icons and images
```

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

Contributions welcome! Please ensure all tests pass before submitting PRs.

---

**Chronica v0.1.0-alpha** - Built with ❤️ using Tauri + React
