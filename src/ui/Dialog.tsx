// Reusable Dialog component for Chronica v0.1.0-alpha
// Replaces native alert(), confirm(), and prompt() with accessible modals

import { useEffect, useState } from "react";

interface DialogProps {
  title: string;
  message: string;
  type?: "alert" | "confirm" | "prompt";
  defaultValue?: string;
  onConfirm: (value?: string) => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

/**
 * Dialog modal component
 * Accessible replacement for native alert/confirm/prompt
 */
export function Dialog({
  title,
  message,
  type = "alert",
  defaultValue = "",
  onConfirm,
  onCancel,
  confirmText = "OK",
  cancelText = "Cancel",
}: DialogProps) {
  const [inputValue, setInputValue] = useState(defaultValue);

  useEffect(() => {
    // Prevent background scrolling
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && type === "alert") {
      onConfirm();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onConfirm(); // If no cancel handler, treat as confirm
    }
  };

  const handleConfirm = () => {
    if (type === "prompt") {
      onConfirm(inputValue);
    } else {
      onConfirm();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleConfirm();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal" style={{ maxWidth: "400px" }}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
        </div>

        <div className="modal-body">
          <p>{message}</p>
          {type === "prompt" && (
            <input
              type="text"
              className="form-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              style={{ marginTop: "12px" }}
            />
          )}
        </div>

        <div className="modal-footer">
          {(type === "confirm" || type === "prompt") && (
            <button onClick={handleCancel}>{cancelText}</button>
          )}
          <button onClick={handleConfirm} className="primary" autoFocus={type !== "prompt"}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
