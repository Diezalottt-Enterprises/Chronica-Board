// ColorPicker component for column colors (Chronica v0.1.0-alpha)
import { useState, useRef, useEffect } from "react";
import { isValidHex } from "../utils/theme";

interface ColorPickerProps {
  currentColor: string | null | undefined;
  columnTitle: string;
  onApply: (color: string | null) => void;
  onClose: () => void;
}

const QUICK_SWATCHES = [
  "#3b82f6", // blue
  "#06b6d4", // cyan
  "#10b981", // green
  "#f59e0b", // amber
  "#a855f7", // purple
  "#f43f5e", // rose
];

export function ColorPicker({
  currentColor,
  columnTitle,
  onApply,
  onClose,
}: ColorPickerProps) {
  const [color, setColor] = useState(currentColor || "#3b82f6");
  const [hexInput, setHexInput] = useState(currentColor || "#3b82f6");
  const [isValid, setIsValid] = useState(true);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Focus the color input when opened
    colorInputRef.current?.focus();

    // Close on Escape
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    // Close on click outside
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    setHexInput(newColor);
    setIsValid(true);
  };

  const handleHexInputChange = (value: string) => {
    setHexInput(value);
    if (isValidHex(value)) {
      setColor(value);
      setIsValid(true);
    } else {
      setIsValid(false);
    }
  };

  const handleApply = () => {
    if (isValid) {
      onApply(color);
      onClose();
    }
  };

  const handleReset = () => {
    onApply(null);
    onClose();
  };

  return (
    <div className="color-picker-overlay">
      <div ref={popoverRef} className="color-picker-popover" role="dialog" aria-label={`Set column color for ${columnTitle}`}>
        <div className="color-picker-section">
          <label className="form-label">Color</label>
          <input
            ref={colorInputRef}
            type="color"
            value={color}
            onChange={(e) => handleColorChange(e.target.value)}
            className="color-input"
          />
        </div>

        <div className="color-picker-section">
          <label className="form-label">Hex</label>
          <input
            type="text"
            value={hexInput}
            onChange={(e) => handleHexInputChange(e.target.value)}
            className={`form-input ${!isValid ? "invalid" : ""}`}
            placeholder="#3b82f6"
          />
          {!isValid && <span className="error-text">Invalid hex format</span>}
        </div>

        <div className="color-picker-section">
          <label className="form-label">Quick Colors</label>
          <div className="quick-swatches">
            {QUICK_SWATCHES.map((swatch) => (
              <button
                key={swatch}
                className={`quick-swatch ${color === swatch ? "selected" : ""}`}
                style={{ backgroundColor: swatch }}
                onClick={() => handleColorChange(swatch)}
                title={swatch}
                aria-label={`Select color ${swatch}`}
              />
            ))}
          </div>
        </div>

        <div className="color-picker-actions">
          <button onClick={handleReset} className="secondary">
            Reset
          </button>
          <button onClick={onClose} className="secondary">
            Cancel
          </button>
          <button onClick={handleApply} className="primary" disabled={!isValid}>
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
