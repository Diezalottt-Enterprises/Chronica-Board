// Import modal (Chronica v0.1.0-alpha)
import { useState, useEffect } from "react";
import { useBoardStore } from "../stores/boardStore";
import { useUIStore } from "../stores/uiStore";
import {
  importBoardFromFile,
  importBoardFromJSON,
  getImportPreview,
  importAIOptimizedFromJSON,
} from "../io/importExport";

interface ImportModalProps {
  onClose: () => void;
}

export function ImportModal({ onClose }: ImportModalProps) {
  const { importBoard } = useBoardStore();
  const { showAlert } = useUIStore();
  const [tab, setTab] = useState<"file" | "paste">("file");
  const [jsonContent, setJsonContent] = useState("");
  const [preview, setPreview] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleFileImport = async () => {
    try {
      setError(null);
      const result = await importBoardFromFile();
      if (result) {
        // Fields are passed directly to the board - no more merging
        importBoard(result.name, result.columns, result.cards, result.fields);
        onClose();
      }
    } catch (err: any) {
      // If standard import fails, the error will be caught here
      setError(err.message || "Import failed");
    }
  };

  const handlePastePreview = () => {
    try {
      setError(null);
      const previewData = getImportPreview(jsonContent);
      setPreview(previewData);
    } catch (err: any) {
      setError(err.message || "Invalid JSON");
      setPreview(null);
    }
  };

  const handlePasteImport = () => {
    try {
      setError(null);

      // Parse to detect format
      const data = JSON.parse(jsonContent);
      const schema = data.meta?.schema;

      if (schema === "chronica-ai-optimized") {
        // AI-optimized format
        const imported = importAIOptimizedFromJSON(jsonContent);

        if (imported.format === "single" && imported.singleBoard) {
          importBoard(
            imported.singleBoard.name,
            imported.singleBoard.columns,
            imported.singleBoard.cards,
            imported.singleBoard.fields
          );
          onClose();
        } else if (imported.format === "multi" && imported.multiBoard) {
          // Import multiple boards - each board gets the shared fields
          imported.multiBoard.boards.forEach((board) => {
            importBoard(board.name, board.columns, board.cards, imported.multiBoard?.fields);
          });
          showAlert(
            "Multi-Board Import",
            `Successfully imported ${imported.multiBoard.boards.length} boards.`
          );
          onClose();
        }
      } else {
        // Standard format
        const result = importBoardFromJSON(jsonContent);
        importBoard(result.name, result.columns, result.cards, result.fields);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "Import failed");
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
          <h2 className="modal-title">Import Board</h2>
          <button className="icon" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* Tabs */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
            <button
              className={tab === "file" ? "primary" : ""}
              onClick={() => {
                setTab("file");
              }}
            >
              From File
            </button>
            <button
              className={tab === "paste" ? "primary" : ""}
              onClick={() => {
                setTab("paste");
              }}
            >
              Paste JSON
            </button>
          </div>

          {/* File Tab */}
          {tab === "file" && (
            <div className="form-group">
              <p style={{ fontSize: "14px", marginBottom: "16px" }}>
                Select a Chronica board JSON file to import. The board will be added as a new board.
              </p>
              <button onClick={handleFileImport} className="primary">
                Choose File
              </button>
            </div>
          )}

          {/* Paste Tab */}
          {tab === "paste" && (
            <>
              <div className="form-group">
                <label className="form-label">JSON Content</label>
                <textarea
                  className="form-textarea"
                  style={{ minHeight: "200px", fontFamily: "monospace", fontSize: "12px" }}
                  value={jsonContent}
                  onChange={(e) => {
                    setJsonContent(e.target.value);
                  }}
                  placeholder="Paste Chronica board JSON here..."
                />
              </div>

              {jsonContent && (
                <button onClick={handlePastePreview} style={{ marginBottom: "16px" }}>
                  Preview
                </button>
              )}

              {preview && (
                <div
                  style={{
                    padding: "12px",
                    background: "var(--bg-secondary)",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "12px",
                  }}
                >
                  <div style={{ marginBottom: "8px" }}>
                    <strong>Board:</strong> {preview.boardName}
                  </div>
                  <div style={{ marginBottom: "8px" }}>
                    <strong>Columns:</strong> {preview.columnCount}
                  </div>
                  <div style={{ marginBottom: "8px" }}>
                    <strong>Cards:</strong> {preview.cardCount}
                  </div>
                  {preview.firstCards.length > 0 && (
                    <div>
                      <strong>First cards:</strong>
                      <ul style={{ marginTop: "4px", paddingLeft: "20px" }}>
                        {preview.firstCards.map((card: any, i: number) => (
                          <li key={i}>
                            {card.title} ({card.column})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Error */}
          {error && (
            <div
              style={{
                padding: "12px",
                background: "#ffe5e5",
                color: "#d32f2f",
                borderRadius: "var(--radius-sm)",
                fontSize: "12px",
                marginTop: "16px",
              }}
            >
              {error}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose}>Cancel</button>
          {tab === "paste" && preview && (
            <button onClick={handlePasteImport} className="primary">
              Import
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
