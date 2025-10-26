// Settings modal (Chronica v0.1.0-alpha)
import { useState, useEffect } from "react";
import { useConfigStore } from "../stores/configStore";
import { invoke } from "@tauri-apps/api/core";
import { FieldManager } from "./FieldManager";

interface SettingsModalProps {
  onClose: () => void;
}

type Tab = "general" | "fields";

export function SettingsModal({ onClose }: SettingsModalProps) {
  const { config, setAutostart, setShowStarterCards } = useConfigStore();
  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [autostart, setAutostartLocal] = useState(config?.autostart || false);
  const [showStarters, setShowStartersLocal] = useState(
    config?.showStarterCards ?? true
  );

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleAutostartToggle = async () => {
    const newValue = !autostart;
    setAutostartLocal(newValue);
    setAutostart(newValue);

    // Update autostart via Tauri plugin
    try {
      if (newValue) {
        await invoke("plugin:autostart|enable");
      } else {
        await invoke("plugin:autostart|disable");
      }
    } catch (error) {
      console.error("Failed to update autostart:", error);
    }
  };

  const handleShowStartersToggle = () => {
    const newValue = !showStarters;
    setShowStartersLocal(newValue);
    setShowStarterCards(newValue);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal" style={{ maxWidth: "600px" }}>
        <div className="modal-header">
          <h2 className="modal-title">Settings</h2>
          <button className="icon" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--border-color)", padding: "0 24px" }}>
          <button
            onClick={() => setActiveTab("general")}
            style={{
              padding: "12px 16px",
              background: "transparent",
              border: "none",
              borderBottom: activeTab === "general" ? "2px solid var(--color-cyan)" : "2px solid transparent",
              color: activeTab === "general" ? "var(--color-cyan)" : "var(--text-secondary)",
              cursor: "pointer",
              fontWeight: activeTab === "general" ? 600 : 400,
            }}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab("fields")}
            style={{
              padding: "12px 16px",
              background: "transparent",
              border: "none",
              borderBottom: activeTab === "fields" ? "2px solid var(--color-cyan)" : "2px solid transparent",
              color: activeTab === "fields" ? "var(--color-cyan)" : "var(--text-secondary)",
              cursor: "pointer",
              fontWeight: activeTab === "fields" ? 600 : 400,
            }}
          >
            Custom Fields
          </button>
        </div>

        <div className="modal-body">
          {activeTab === "general" && (
            <>
              <div className="form-group">
                <div className="form-checkbox">
                  <input
                    type="checkbox"
                    id="autostart"
                    checked={autostart}
                    onChange={handleAutostartToggle}
                  />
                  <label htmlFor="autostart" style={{ textTransform: "none" }}>
                    Start Chronica on login
                  </label>
                </div>
              </div>

              <div className="form-group">
                <div className="form-checkbox">
                  <input
                    type="checkbox"
                    id="showStarters"
                    checked={showStarters}
                    onChange={handleShowStartersToggle}
                  />
                  <label htmlFor="showStarters" style={{ textTransform: "none" }}>
                    Show starter cards on first launch
                  </label>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: "24px" }}>
                <label className="form-label">About</label>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  Chronica v0.1.0-alpha
                  <br />
                  Desktop Sticky Kanban Widget
                </p>
              </div>
            </>
          )}

          {activeTab === "fields" && <FieldManager />}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="primary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
