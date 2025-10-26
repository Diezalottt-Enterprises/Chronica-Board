// Card component (Chronica v0.1.0-alpha)
import type { Card as CardType } from "../state/types";
import { PREDEFINED_COLORS } from "../state/types";
import { sanitizeColor } from "../utils/sanitize";

interface CardProps {
  card: CardType;
  onClick: () => void;
}

export function Card({ card, onClick }: CardProps) {
  // Determine color class based on card color
  const getColorClass = () => {
    if (!card.color) return "";

    // Check if it's a predefined color name
    const colorName = card.color.toLowerCase();
    if (colorName in PREDEFINED_COLORS) {
      return `card-color-${colorName}`;
    }

    // For custom hex colors, we'll use inline style
    return "";
  };

  const colorClass = getColorClass();
  // Sanitize color before using in style to prevent CSS injection
  const safeColor = card.color ? sanitizeColor(card.color) : undefined;
  const customStyle = colorClass ? {} : safeColor ? { borderLeftColor: safeColor } : {};

  return (
    <div className={`card ${colorClass}`} style={customStyle} onClick={onClick}>
      <div className="card-title">{card.title}</div>
      {card.description && (
        <div className="card-description">{card.description}</div>
      )}
      {card.tags && card.tags.length > 0 && (
        <div className="card-tags">
          {card.tags.map((tag, i) => (
            <span key={i} className="card-tag">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
