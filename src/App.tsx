// Chronica v0.1.0-alpha - Main App Component
import { useEffect, useState } from "react";
import { useBoardStore } from "./stores/boardStore";
import { useConfigStore } from "./stores/configStore";
import { useUIStore } from "./stores/uiStore";
import { Dialog } from "./ui/Dialog";
import {
  initDataDir,
  loadBoardsIndex,
  loadAllBoards,
  loadConfig,
  saveBoardsIndex,
  saveBoard,
  saveConfig,
} from "./io/persistence";
import { saveQueue } from "./services/saveQueue";
import {
  exportBoardAIOptimized,
  exportAllBoardsAIOptimized,
} from "./io/importExport";
import { setOpacity } from "./platform/window";
import { Header } from "./ui/Header";
import { Sidebar } from "./ui/Sidebar";
import { KanbanBoard } from "./ui/KanbanBoard";
import { CardEditor } from "./ui/CardEditor";
import { SettingsModal } from "./ui/SettingsModal";
import { ImportModal } from "./ui/ImportModal";
import { ExportModal } from "./ui/ExportModal";
import type { Card, ColumnKey } from "./state/types";
import { detectInitialTheme, type Theme } from "./utils/theme";
import "./App.css";

function App() {
  const { boards, activeBoard, setBoards, createBoard } = useBoardStore();
  const { config, setConfig } = useConfigStore();
  const {
    editingCard,
    newCardColumn,
    showSettings,
    showImport,
    showExport,
    dialog,
    setEditingCard,
    setNewCardColumn,
    setShowSettings,
    setShowImport,
    setShowExport,
    setSaveStatus,
    showAlert,
  } = useUIStore();

  const [isInitialized, setIsInitialized] = useState(false);
  const [theme, setTheme] = useState<Theme>(detectInitialTheme());

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("chronica.theme", theme);
  }, [theme]);

  // Apply UI scale to document
  useEffect(() => {
    const scale = config?.uiScale ?? 1.0;
    document.documentElement.style.setProperty("--ui-scale", scale.toString());
  }, [config?.uiScale]);

  // Initialize app on mount
  useEffect(() => {
    async function initialize() {
      try {
        console.log("[Chronica] Starting initialization...");

        // Initialize data directory
        console.log("[Chronica] Initializing data directory...");
        await initDataDir();
        console.log("[Chronica] Data directory initialized");

        // Load config
        console.log("[Chronica] Loading config...");
        const loadedConfig = await loadConfig();
        console.log("[Chronica] Config loaded:", loadedConfig);
        setConfig(loadedConfig);

        // Set initial opacity (may fail if permission missing)
        console.log("[Chronica] Setting opacity...");
        try {
          await setOpacity(loadedConfig.opacity);
          console.log("[Chronica] Opacity set successfully");
        } catch (opacityError) {
          console.warn("[Chronica] Failed to set opacity (non-critical):", opacityError);
        }

        // Load boards
        console.log("[Chronica] Loading boards...");
        const index = await loadBoardsIndex();
        console.log("[Chronica] Boards index:", index);

        if (index && index.boards.length > 0) {
          // Load existing boards
          console.log("[Chronica] Loading existing boards...");
          const loadedBoards = await loadAllBoards(index);
          console.log("[Chronica] Loaded boards:", loadedBoards);
          setBoards(loadedBoards);
        } else {
          // Create first board (no starter cards)
          console.log("[Chronica] Creating first board...");
          createBoard("Untitled Board", false);
          console.log("[Chronica] First board created");
        }

        console.log("[Chronica] Initialization complete!");
        setIsInitialized(true);
      } catch (error) {
        console.error("[Chronica] Initialization failed:", error);
        console.error("[Chronica] Error details:", {
          name: (error as Error).name,
          message: (error as Error).message,
          stack: (error as Error).stack,
        });
        showAlert(
          "Initialization Failed",
          `Failed to initialize Chronica: ${(error as Error).message}\n\nCheck DevTools console (F12) for details.`
        );
      }
    }

    initialize();
  }, []);

  // Subscribe to save queue status updates
  useEffect(() => {
    const unsubscribe = saveQueue.subscribe((key, status, error) => {
      setSaveStatus(status, error);

      // Show alert on final failure
      if (status === "error" && error) {
        showAlert("Save Failed", `Failed to save ${key}: ${error.message}`);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [setSaveStatus, showAlert]);

  // Auto-save boards when they change
  useEffect(() => {
    if (!isInitialized || boards.length === 0) return;

    // Debounce timeout for batching rapid changes
    const timerId = window.setTimeout(() => {
      // Save all boards (each with unique key for independent retry)
      boards.forEach((board) => {
        saveQueue.save(`board-${board.id}`, saveBoard, board);
      });

      // Save boards index
      if (activeBoard) {
        const index = {
          boards: boards.map((b) => ({ id: b.id, name: b.name })),
          activeId: activeBoard.id,
        };
        saveQueue.save("boards-index", saveBoardsIndex, index);
      }
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [boards, activeBoard, isInitialized]);

  // Auto-save config when it changes
  useEffect(() => {
    if (!isInitialized || !config) return;

    const timerId = window.setTimeout(() => {
      saveQueue.save("config", saveConfig, config);
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [config, isInitialized]);

  // Listen for tray "open-settings" event
  useEffect(() => {
    const setupTrayListener = async () => {
      const { listen } = await import("@tauri-apps/api/event");
      const unlisten = await listen("open-settings", () => {
        setShowSettings(true);
      });
      return unlisten;
    };

    let cleanup: (() => void) | undefined;
    setupTrayListener().then((unlisten) => {
      cleanup = unlisten;
    });

    return () => {
      if (cleanup) cleanup();
    };
  }, [setShowSettings]);

  const handleNewCard = (column: ColumnKey) => {
    setNewCardColumn(column);
  };

  const handleEditCard = (card: Card) => {
    setEditingCard(card);
  };

  const handleCloseCardEditor = () => {
    setEditingCard(null);
    setNewCardColumn(null);
  };

  const handleShowExport = () => {
    setShowExport(true);
  };

  const handleExport = async (
    boardId: string // "all" for all boards, or board.id for single board
  ) => {
    try {
      if (boardId === "all") {
        await exportAllBoardsAIOptimized(boards);
      } else {
        const board = boards.find((b) => b.id === boardId);
        if (!board) throw new Error("Board not found");
        await exportBoardAIOptimized(board);
      }
    } catch (error) {
      console.error("Export failed:", error);
      showAlert("Export Failed", `${error}`);
      throw error;
    }
  };

  if (!isInitialized) {
    return (
      <div className="app">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            color: "var(--text-secondary)",
          }}
        >
          Loading Chronica...
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Header />

      <div className={`main-content ${!config?.sidebarPinned ? "sidebar-collapsed" : ""}`}>
        <Sidebar
          onSettings={() => {
            setShowSettings(true);
          }}
          onImport={() => {
            setShowImport(true);
          }}
          onExport={handleShowExport}
        />
        <KanbanBoard onEditCard={handleEditCard} onNewCard={handleNewCard} theme={theme} />
      </div>

      {/* Modals */}
      {(editingCard || newCardColumn) && (
        <CardEditor
          card={editingCard || undefined}
          initialColumn={newCardColumn || undefined}
          onClose={handleCloseCardEditor}
        />
      )}

      {showSettings && (
        <SettingsModal
          onClose={() => {
            setShowSettings(false);
          }}
          theme={theme}
          onThemeChange={setTheme}
        />
      )}

      {showImport && (
        <ImportModal
          onClose={() => {
            setShowImport(false);
          }}
        />
      )}

      {showExport && (
        <ExportModal
          boards={boards}
          activeBoard={activeBoard}
          fields={config?.fields}
          onExport={handleExport}
          onClose={() => {
            setShowExport(false);
          }}
        />
      )}

      {/* Global Dialog */}
      {dialog && (
        <Dialog
          type={dialog.type}
          title={dialog.title}
          message={dialog.message}
          defaultValue={dialog.defaultValue}
          onConfirm={dialog.onConfirm}
          onCancel={dialog.onCancel}
        />
      )}
    </div>
  );
}

export default App;
