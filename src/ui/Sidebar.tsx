// Sidebar component with board list and management (Chronica v0.1.0-alpha)
import { useState } from "react";
import { useBoardStore } from "../stores/boardStore";
import { useUIStore } from "../stores/uiStore";
import { useConfigStore } from "../stores/configStore";

interface SidebarProps {
  onSettings: () => void;
  onImport: () => void;
  onExport: () => void;
}

export function Sidebar({ onSettings, onImport, onExport }: SidebarProps) {
  const { boards, activeBoard, setActiveBoard, createBoard, renameBoard, deleteBoard } =
    useBoardStore();
  const { showPrompt, showAlert, showConfirm } = useUIStore();
  const { config, setSidebarPinned } = useConfigStore();
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    boardId: string;
  } | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renamingValue, setRenamingValue] = useState("");

  const handleNewBoard = () => {
    showPrompt("New Board", "Enter board name:", "Untitled Board", (name) => {
      if (name.trim()) {
        createBoard(name.trim(), false);
      }
    });
  };

  const handleContextMenu = (e: React.MouseEvent, boardId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, boardId });
  };

  const handleRename = (boardId: string, currentName: string) => {
    setRenamingId(boardId);
    setRenamingValue(currentName);
    setContextMenu(null);
  };

  const handleRenameSubmit = (boardId: string) => {
    if (renamingValue.trim()) {
      renameBoard(boardId, renamingValue.trim());
    }
    setRenamingId(null);
    setRenamingValue("");
  };

  const handleDelete = (boardId: string) => {
    if (boards.length === 1) {
      showAlert("Cannot Delete", "Cannot delete the last board");
      return;
    }

    const board = boards.find((b) => b.id === boardId);
    if (board) {
      showConfirm("Delete Board", `Delete board "${board.name}"?`, () => {
        deleteBoard(boardId);
      });
    }
    setContextMenu(null);
  };

  // Close context menu when clicking outside
  const handleClickOutside = () => {
    setContextMenu(null);
  };

  return (
    <>
      <div className="sidebar">
        <div className="sidebar-header">
          <span className="sidebar-title">Boards</span>
          <div className="sidebar-header-buttons">
            <button onClick={handleNewBoard} className="icon" title="New board">
              +
            </button>
            <button
              onClick={() => setSidebarPinned(!config?.sidebarPinned)}
              className="icon"
              title={config?.sidebarPinned ? "Collapse sidebar" : "Expand sidebar"}
            >
              ☰
            </button>
          </div>
        </div>

        <div className="board-list">
          {boards.map((board) => (
            <div
              key={board.id}
              className={`board-item ${activeBoard?.id === board.id ? "active" : ""}`}
              onClick={() => setActiveBoard(board.id)}
              onContextMenu={(e) => handleContextMenu(e, board.id)}
            >
              {renamingId === board.id ? (
                <input
                  type="text"
                  className="form-input"
                  value={renamingValue}
                  onChange={(e) => setRenamingValue(e.target.value)}
                  onBlur={() => handleRenameSubmit(board.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRenameSubmit(board.id);
                    if (e.key === "Escape") setRenamingId(null);
                  }}
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <>
                  <span className="board-item-name">{board.name}</span>
                  <span className="board-item-menu">⋮</span>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <button onClick={onImport} style={{ width: "100%", marginBottom: "8px" }}>
            📥 Import
          </button>
          <button
            onClick={onExport}
            disabled={!activeBoard}
            style={{ width: "100%", marginBottom: "8px" }}
          >
            📤 Export
          </button>
          <button onClick={onSettings} style={{ width: "100%" }}>
            ⚙️ Settings
          </button>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <>
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999,
            }}
            onClick={handleClickOutside}
          />
          <div
            className="context-menu"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            <div
              className="context-menu-item"
              onClick={() => {
                const board = boards.find((b) => b.id === contextMenu.boardId);
                if (board) handleRename(contextMenu.boardId, board.name);
              }}
            >
              ✏️ Rename
            </div>
            <div
              className="context-menu-item danger"
              onClick={() => handleDelete(contextMenu.boardId)}
            >
              🗑️ Delete
            </div>
          </div>
        </>
      )}
    </>
  );
}
