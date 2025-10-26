// Settings modal (Chronica v0.1.0-alpha)
import { useState, useEffect } from "react";
import { useConfigStore } from "../stores/configStore";
import { invoke } from "@tauri-apps/api/core";
import { setPinned, setOpacity } from "../platform/window";
import { FieldManager } from "./FieldManager";
import type { Theme } from "../utils/theme";
import { VERSION_DISPLAY } from "../version";

interface SettingsModalProps {
  onClose: () => void;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

type Tab = "general" | "fields";

export function SettingsModal({ onClose, theme, onThemeChange }: SettingsModalProps) {
  const {
    config,
    setAutostart,
    setShowStarterCards,
    setPinned: updatePinned,
    setOpacity: updateOpacity,
    setUIScale,
  } = useConfigStore();
  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [autostart, setAutostartLocal] = useState(config?.autostart || false);
  const [showStarters, setShowStartersLocal] = useState(config?.showStarterCards ?? true);

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

  const handlePinToggle = async () => {
    const newPinned = !config?.pinned;
    await setPinned(newPinned);
    updatePinned(newPinned);
  };

  const handleOpacityChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newOpacity = parseFloat(e.target.value);
    await setOpacity(newOpacity);
    updateOpacity(newOpacity);
  };

  const handleUIScaleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newScale = parseFloat(e.target.value);
    setUIScale(newScale);
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
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid var(--border-color)",
            padding: "0 24px",
          }}
        >
          <button
            onClick={() => {
              setActiveTab("general");
            }}
            style={{
              padding: "12px 16px",
              background: "transparent",
              border: "none",
              borderBottom:
                activeTab === "general" ? "2px solid var(--color-cyan)" : "2px solid transparent",
              color: activeTab === "general" ? "var(--color-cyan)" : "var(--text-secondary)",
              cursor: "pointer",
              fontWeight: activeTab === "general" ? 600 : 400,
            }}
          >
            General
          </button>
          <button
            onClick={() => {
              setActiveTab("fields");
            }}
            style={{
              padding: "12px 16px",
              background: "transparent",
              border: "none",
              borderBottom:
                activeTab === "fields" ? "2px solid var(--color-cyan)" : "2px solid transparent",
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
                <label className="form-label">Appearance</label>
                <div className="form-checkbox">
                  <input
                    type="checkbox"
                    role="switch"
                    id="darkMode"
                    aria-checked={theme === "dark"}
                    checked={theme === "dark"}
                    onChange={(e) => {
                      onThemeChange(e.target.checked ? "dark" : "light");
                    }}
                  />
                  <label htmlFor="darkMode" style={{ textTransform: "none" }}>
                    Dark mode
                  </label>
                </div>
                <p
                  style={{
                    fontSize: "11px",
                    color: "var(--text-secondary)",
                    marginTop: "4px",
                    marginLeft: "24px",
                  }}
                >
                  Use a dark background and light text
                </p>

                <div style={{ marginTop: "12px", marginLeft: "24px" }}>
                  <label
                    htmlFor="uiScaleSlider"
                    style={{
                      fontSize: "11px",
                      color: "var(--text-secondary)",
                      display: "block",
                      marginBottom: "8px",
                    }}
                  >
                    UI Scale: {Math.round((config?.uiScale ?? 1.0) * 100)}%
                  </label>
                  <input
                    id="uiScaleSlider"
                    type="range"
                    min="0.8"
                    max="1.2"
                    step="0.05"
                    value={config?.uiScale ?? 1.0}
                    onChange={handleUIScaleChange}
                    style={{ width: "100%" }}
                  />
                  <p style={{ fontSize: "10px", color: "var(--text-secondary)", marginTop: "4px" }}>
                    Adjust font and icon sizes globally (80% - 120%)
                  </p>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Window</label>
                <div className="form-checkbox">
                  <input
                    type="checkbox"
                    id="alwaysOnTop"
                    checked={config?.pinned || false}
                    onChange={handlePinToggle}
                  />
                  <label htmlFor="alwaysOnTop" style={{ textTransform: "none" }}>
                    Always on top
                  </label>
                </div>
                <p
                  style={{
                    fontSize: "11px",
                    color: "var(--text-secondary)",
                    marginTop: "4px",
                    marginLeft: "24px",
                  }}
                >
                  Keep window above other applications
                </p>

                <div style={{ marginTop: "12px", marginLeft: "24px" }}>
                  <label
                    htmlFor="opacitySlider"
                    style={{
                      fontSize: "11px",
                      color: "var(--text-secondary)",
                      display: "block",
                      marginBottom: "8px",
                    }}
                  >
                    Window opacity: {Math.round((config?.opacity ?? 1.0) * 100)}%
                  </label>
                  <input
                    id="opacitySlider"
                    type="range"
                    min="0.7"
                    max="1.0"
                    step="0.05"
                    value={config?.opacity ?? 1.0}
                    onChange={handleOpacityChange}
                    style={{ width: "100%" }}
                  />
                  <p
                    style={{
                      fontSize: "10px",
                      color: "var(--text-secondary)",
                      marginTop: "4px",
                      fontStyle: "italic",
                    }}
                  >
                    Note: Opacity control requires window decorations (currently disabled for
                    transparency)
                  </p>
                </div>
              </div>

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
                  Chronica {VERSION_DISPLAY}
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
