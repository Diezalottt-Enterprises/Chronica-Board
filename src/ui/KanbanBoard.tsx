// KanbanBoard component with drag-and-drop (Chronica v0.1.0-alpha)
import { useMemo, useCallback, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useBoardStore } from "../stores/boardStore";
import { useUIStore } from "../stores/uiStore";
import { useConfigStore } from "../stores/configStore";
import { Card } from "./Card";
import { SortableCard } from "./SortableCard";
import { ColorPicker } from "./ColorPicker";
import type { Card as CardType, Column, ColumnKey } from "../state/types";
import { DEFAULT_RANK, RANK_GAP } from "../constants/ranks";
import { getColumnColorStyles } from "../utils/theme";
import type { Theme } from "../utils/theme";

interface KanbanBoardProps {
  onEditCard: (card: CardType) => void;
  onNewCard: (column: ColumnKey) => void;
  theme: Theme;
}

// Droppable column component
function DroppableColumn({
  columnKey,
  children,
}: {
  columnKey: string;
  children: React.ReactNode;
}) {
  const { setNodeRef } = useDroppable({
    id: columnKey,
  });

  return (
    <div ref={setNodeRef} className="column-cards">
      {children}
    </div>
  );
}

// Sortable column component
interface SortableColumnProps {
  column: Column;
  cards: CardType[];
  locked: boolean;
  theme: Theme;
  onEditCard: (card: CardType) => void;
  onNewCard: (column: ColumnKey) => void;
  onRenameColumn: (columnKey: string, currentTitle: string) => void;
  onDeleteColumn: (columnKey: string, columnTitle: string) => void;
  onToggleLock: () => void;
  onSetColor: (columnKey: string, color: string | null) => void;
  columnsCount: number;
}

function SortableColumn({
  column,
  cards,
  locked,
  theme,
  onEditCard,
  onNewCard,
  onRenameColumn,
  onDeleteColumn,
  onToggleLock,
  onSetColor,
  columnsCount,
}: SortableColumnProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `column-${column.key}`,
    disabled: locked,
  });

  const colorStyles = getColumnColorStyles(column.color, theme);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    backgroundColor: colorStyles.bodyBg || undefined,
    borderLeft: colorStyles.rail ? `4px solid ${colorStyles.rail}` : undefined,
  };

  const headerStyle = {
    backgroundColor: colorStyles.headerBg || undefined,
    borderBottom: colorStyles.border ? `1px solid ${colorStyles.border}` : undefined,
    color: colorStyles.textColor || undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className="kanban-column">
      <div className="column-header" style={headerStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
          {!locked && (
            <span
              className="drag-grip"
              style={{ cursor: "grab", opacity: 0.4 }}
              {...attributes}
              {...listeners}
              title="Drag to reorder"
            >
              ⋮⋮
            </span>
          )}
          <span className="column-title" style={{ cursor: locked ? "default" : "pointer" }}>
            {column.title}
          </span>
          <span className="column-count">{cards.length}</span>
        </div>
        <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
          <button
            className="color-swatch"
            onClick={() => {
              setShowColorPicker(true);
            }}
            title="Set column color"
            aria-label={`Set column color for ${column.title}`}
            style={{ backgroundColor: column.color || "#d0d0d0" }}
          />
          <button
            className="icon"
            onClick={onToggleLock}
            title={locked ? "Unlock columns" : "Lock columns"}
          >
            {locked ? "🔒" : "🔓"}
          </button>
          <button
            className="icon"
            onClick={() => {
              onRenameColumn(column.key, column.title);
            }}
            title="Rename column"
          >
            ✏️
          </button>
          <button
            className="icon"
            onClick={() => {
              onDeleteColumn(column.key, column.title);
            }}
            title="Delete column"
            disabled={columnsCount <= 1}
          >
            🗑️
          </button>
        </div>
      </div>

      {showColorPicker && (
        <ColorPicker
          currentColor={column.color}
          columnTitle={column.title}
          onApply={(color) => {
            onSetColor(column.key, color);
          }}
          onClose={() => {
            setShowColorPicker(false);
          }}
        />
      )}

      <SortableContext
        items={cards.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
        id={column.key}
      >
        <DroppableColumn columnKey={column.key}>
          {cards.map((card) => (
            <SortableCard
              key={card.id}
              card={card}
              onClick={() => {
                onEditCard(card);
              }}
            />
          ))}
        </DroppableColumn>
      </SortableContext>

      <button
        className="add-card-btn"
        onClick={() => {
          onNewCard(column.key);
        }}
      >
        + Add Card
      </button>
    </div>
  );
}

export function KanbanBoard({ onEditCard, onNewCard, theme }: KanbanBoardProps) {
  const {
    activeBoard,
    moveCard,
    renameColumn,
    addColumn,
    deleteColumn,
    reorderColumns,
    setColumnColor,
  } = useBoardStore();
  const { showPrompt, showConfirm } = useUIStore();
  const { config, setColumnsLocked } = useConfigStore();
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Column management handlers
  const handleRenameColumn = useCallback(
    (columnKey: string, currentTitle: string) => {
      showPrompt("Rename Column", "Enter new column name:", currentTitle, (newTitle) => {
        if (newTitle.trim()) {
          renameColumn(columnKey, newTitle.trim());
        }
      });
    },
    [showPrompt, renameColumn]
  );

  const handleDeleteColumn = useCallback(
    (columnKey: string, columnTitle: string) => {
      if (!activeBoard) return;
      if (activeBoard.columns.length <= 1) {
        return; // Prevent deleting last column
      }
      showConfirm(
        "Delete Column",
        `Delete column "${columnTitle}"? All cards will be moved to the first remaining column.`,
        () => {
          deleteColumn(columnKey);
        }
      );
    },
    [showConfirm, deleteColumn, activeBoard]
  );

  const handleAddColumn = useCallback(() => {
    showPrompt("New Column", "Enter column name:", "New Column", (title) => {
      if (title.trim()) {
        addColumn(title.trim());
      }
    });
  }, [showPrompt, addColumn]);

  // Group cards by column
  const cardsByColumn = useMemo(() => {
    if (!activeBoard) return {};

    const grouped: Record<string, CardType[]> = {};
    activeBoard.columns.forEach((col) => {
      grouped[col.key] = activeBoard.cards
        .filter((card) => card.column === col.key)
        .sort((a, b) => (a.rank ?? 1000) - (b.rank ?? 1000));
    });

    return grouped;
  }, [activeBoard]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const id = event.active.id as string;
    if (!id.startsWith("column-")) {
      setActiveCardId(id);
    }
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveCardId(null);

      if (!over) return;
      if (!activeBoard) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      // Handle column reordering
      if (activeId.startsWith("column-") && overId.startsWith("column-")) {
        const activeColKey = activeId.replace("column-", "");
        const overColKey = overId.replace("column-", "");

        if (activeColKey === overColKey) return;

        const sortedColumns = activeBoard.columns.sort((a, b) => a.order - b.order);
        const oldIndex = sortedColumns.findIndex((col) => col.key === activeColKey);
        const newIndex = sortedColumns.findIndex((col) => col.key === overColKey);

        const reordered = arrayMove(sortedColumns, oldIndex, newIndex);
        reorderColumns(reordered);
        return;
      }

      // Handle card dragging (existing logic)
      const cardId = activeId;

      // Check if dropped over a column
      const column = activeBoard.columns.find((col) => col.key === overId);
      if (column) {
        moveCard(cardId, column.key);
        return;
      }

      // Check if dropped over another card
      const overCard = activeBoard.cards.find((c) => c.id === overId);
      if (overCard && overCard.id !== cardId) {
        // Move to the same column as the card it was dropped on
        // Calculate new rank (between the card above and below)
        const columnCards = cardsByColumn[overCard.column] || [];
        const overIndex = columnCards.findIndex((c) => c.id === overId);

        let newRank: number;
        if (overIndex === 0) {
          newRank = (overCard.rank ?? DEFAULT_RANK) - RANK_GAP;
        } else {
          const prevCard = columnCards[overIndex - 1];
          newRank = ((prevCard?.rank ?? DEFAULT_RANK) + (overCard.rank ?? DEFAULT_RANK)) / 2;
        }

        moveCard(cardId, overCard.column, newRank);
      }
    },
    [activeBoard, cardsByColumn, moveCard, reorderColumns]
  );

  const activeCard = useMemo(
    () => activeBoard?.cards.find((c) => c.id === activeCardId),
    [activeBoard, activeCardId]
  );

  const sortedColumns = useMemo(
    () => activeBoard?.columns.sort((a, b) => a.order - b.order) ?? [],
    [activeBoard]
  );

  if (!activeBoard) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📋</div>
        <div className="empty-state-title">No board selected</div>
        <div className="empty-state-description">
          Create a new board or select one from the sidebar
        </div>
      </div>
    );
  }

  const columnsLocked = config?.columnsLocked ?? false;

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <SortableContext
        items={sortedColumns.map((col) => `column-${col.key}`)}
        strategy={horizontalListSortingStrategy}
      >
        <div className="kanban-board">
          {sortedColumns.map((column) => {
            const cards = cardsByColumn[column.key] || [];

            return (
              <SortableColumn
                key={column.key}
                column={column}
                cards={cards}
                locked={columnsLocked}
                theme={theme}
                onEditCard={onEditCard}
                onNewCard={onNewCard}
                onRenameColumn={handleRenameColumn}
                onDeleteColumn={handleDeleteColumn}
                onToggleLock={() => {
                  setColumnsLocked(!columnsLocked);
                }}
                onSetColor={setColumnColor}
                columnsCount={activeBoard.columns.length}
              />
            );
          })}

          {/* Add Column Button */}
          <div className="add-column-container">
            <button className="add-column-btn" onClick={handleAddColumn}>
              + Add Column
            </button>
          </div>
        </div>
      </SortableContext>

      <DragOverlay>{activeCard ? <Card card={activeCard} onClick={() => {}} /> : null}</DragOverlay>
    </DndContext>
  );
}
