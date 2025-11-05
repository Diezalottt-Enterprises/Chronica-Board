// Sortable card wrapper for drag-and-drop (Chronica v0.1.0-alpha)
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "./Card";
import type { Card as CardType } from "../state/types";
import type { Theme } from "../utils/theme";

interface SortableCardProps {
  card: CardType;
  onClick: () => void;
  theme: Theme;
}

export function SortableCard({ card, onClick, theme }: SortableCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card card={card} onClick={onClick} theme={theme} />
    </div>
  );
}
