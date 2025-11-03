// Overflow menu component for Chronica v0.1.0-alpha
// Dropdown menu with click-outside-to-close behavior
import { useEffect, useRef } from "react";

export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  onClick: () => void;
  destructive?: boolean;
  checked?: boolean;
  disabled?: boolean;
  divider?: boolean; // Show divider after this item
  submenu?: MenuItem[];
}

interface OverflowMenuProps {
  items: MenuItem[];
  onClose: () => void;
  anchorEl?: HTMLElement | null;
}

export function OverflowMenu({ items, onClose, anchorEl }: OverflowMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        anchorEl &&
        !anchorEl.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    // Handle Escape key
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose, anchorEl]);

  const handleItemClick = (item: MenuItem) => {
    if (!item.submenu) {
      item.onClick();
      onClose();
    }
  };

  return (
    <div ref={menuRef} className="overflow-menu">
      <div className="overflow-menu-items">
        {items.map((item) => (
          <div key={item.id}>
            {item.submenu ? (
              // Render parent label + submenu items inline
              <>
                <div className="overflow-menu-item overflow-menu-parent" style={{ opacity: 0.7 }}>
                  {item.icon && <span className="overflow-menu-icon">{item.icon}</span>}
                  <span className="overflow-menu-label">{item.label}</span>
                </div>
                {item.submenu.map((subItem) => (
                  <button
                    key={subItem.id}
                    className="overflow-menu-item overflow-menu-subitem"
                    onClick={() => {
                      subItem.onClick();
                      onClose();
                    }}
                  >
                    {subItem.icon && <span className="overflow-menu-icon">{subItem.icon}</span>}
                    <span className="overflow-menu-label">{subItem.label}</span>
                  </button>
                ))}
              </>
            ) : (
              <button
                className={`overflow-menu-item ${item.destructive ? "destructive" : ""} ${item.checked ? "checked" : ""}`}
                onClick={() => {
                  handleItemClick(item);
                }}
                disabled={item.disabled}
              >
                {item.icon && <span className="overflow-menu-icon">{item.icon}</span>}
                <span className="overflow-menu-label">{item.label}</span>
                {item.checked && <span className="overflow-menu-check">✓</span>}
              </button>
            )}
            {item.divider && <div className="overflow-menu-divider" />}
          </div>
        ))}
      </div>
    </div>
  );
}
