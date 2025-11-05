// Export modal (Chronica v0.1.0-alpha)
import { useState, useEffect } from "react";
import type { Board } from "@state/types";
import type { FieldDefinition } from "../io/fieldSchema";

interface ExportModalProps {
  boards: Board[];
  activeBoard: Board | null;
  fields?: Record<string, FieldDefinition>;
  onExport: (
    boardId: string // "all" for all boards, or board.id for single board
  ) => Promise<void>;
  onClose: () => void;
}

export function ExportModal({
  boards,
  activeBoard,
  onExport,
  onClose,
}: ExportModalProps) {
  const [selectedBoardId, setSelectedBoardId] = useState<string>(
    activeBoard?.id || "all"
  );
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExport(selectedBoardId);
      onClose();
    } catch (error) {
      console.error("Export failed:", error);
      alert(`Export failed: ${error}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal">
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
