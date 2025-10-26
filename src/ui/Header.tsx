// Header component with controls (Chronica v0.1.0-alpha)
import { useConfigStore } from "../stores/configStore";
import { useUIStore } from "../stores/uiStore";
import { setPinned, setOpacity } from "../platform/window";

interface HeaderProps {
  onSettings: () => void;
}

export function Header({ onSettings }: HeaderProps) {
  const { config, setPinned: updatePinned, setOpacity: updateOpacity } = useConfigStore();
  const { saveStatus, saveError } = useUIStore();

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

  // Render save status indicator
  const renderSaveStatus = () => {
    switch (saveStatus) {
      case "saving":
        return <span style={{ fontSize: "11px", color: "var(--text-secondary)", marginLeft: "12px" }}>Saving...</span>;
      case "success":
        return <span style={{ fontSize: "11px", color: "var(--color-cyan)", marginLeft: "12px" }}>✓ Saved</span>;
      case "error":
        return <span style={{ fontSize: "11px", color: "var(--color-salmon)", marginLeft: "12px" }} title={saveError || "Save failed"}>⚠ Failed</span>;
      default:
        return null;
    }
  };

  return (
    <div className="header">
      <div className="header-drag">
        <span className="header-title">Chronica</span>
        {renderSaveStatus()}
      </div>
      <div className="header-controls">
        <button
          className={config?.pinned ? "primary" : ""}
          onClick={handlePinToggle}
          title="Always on top"
        >
          {config?.pinned ? "📌" : "📌"}
        </button>
        <input
          type="range"
          min="0.7"
          max="1.0"
          step="0.05"
          value={config?.opacity ?? 1.0}
          onChange={handleOpacityChange}
          className="opacity-slider"
          title="Opacity"
        />
        <button onClick={onSettings} title="Settings" className="icon">
          ⚙️
        </button>
      </div>
    </div>
  );
}
