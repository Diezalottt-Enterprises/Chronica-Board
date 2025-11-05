// Card component (Chronica v0.1.0-alpha)
import type { Card as CardType } from "../state/types";
import { getCardColorStyles, type Theme } from "../utils/theme";
import { sanitizeColor } from "../utils/sanitize";

interface CardProps {
  card: CardType;
  onClick: () => void;
  theme: Theme;
}

export function Card({ card, onClick, theme }: CardProps) {
  const safeColor = card.color ? sanitizeColor(card.color) : undefined;
  const colorStyles = getCardColorStyles(
    safeColor,
    theme,
    card.colorStyle || "border",
    card.colorIntensity || "subtle"
  );

  return (
    <div className="card" style={colorStyles} onClick={onClick}>
      <div className="card-title">{card.title}</div>
      {card.description && <div className="card-description">{card.description}</div>}
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
