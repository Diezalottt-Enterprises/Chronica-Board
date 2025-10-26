// Header component with controls (Chronica v0.1.0-alpha)
import { useUIStore } from "../stores/uiStore";

export function Header() {
  const { saveStatus, saveError } = useUIStore();

  // Render save status indicator (only show saving/error, not success)
  const renderSaveStatus = () => {
    switch (saveStatus) {
      case "saving":
        return <span style={{ fontSize: "11px", color: "var(--text-secondary)", marginLeft: "12px" }}>Saving...</span>;
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
    </div>
  );
}
