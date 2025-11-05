// Board Field Editor modal (Chronica v0.1.0-alpha)
import { useState, useEffect } from "react";
import { FieldManager } from "./FieldManager";
import type { Board } from "../state/types";
import type { FieldDefinition } from "../io/fieldSchema";

interface BoardFieldEditorProps {
  board: Board;
  onSave: (fields: Record<string, FieldDefinition>) => void;
  onClose: () => void;
}

export function BoardFieldEditor({ board, onSave, onClose }: BoardFieldEditorProps) {
  const [fields, setFields] = useState(board.fields || {});

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSave = () => {
    onSave(fields);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Card Fields for "{board.name}"</h2>
          <button className="icon" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <FieldManager fields={fields} onChange={setFields} context="board" />
        </div>

        <div className="modal-footer">
          <button onClick={onClose}>Cancel</button>
          <button className="primary" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
