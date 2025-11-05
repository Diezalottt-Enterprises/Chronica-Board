// Board store for Chronica v0.1.0-alpha
// Manages boards and cards state
import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import type { Board, BoardsIndex, Card, Column } from "../state/types";
import type { FieldDefinition } from "../io/fieldSchema";
import { DEFAULT_RANK } from "../constants/ranks";
import { useConfigStore } from "./configStore";

/**
 * Default columns for new boards
 */
const DEFAULT_COLUMNS: Column[] = [
  { key: "todo", title: "To Do", order: 0 },
  { key: "doing", title: "Doing", order: 1 },
  { key: "done", title: "Done", order: 2 },
];

/**
 * Starter cards for first-time users
 */
const STARTER_CARDS: Omit<Card, "id">[] = [
  {
    title: "Welcome to Chronica!",
    description: "Drag this card to 'Doing' to get started",
    column: "todo",
    color: "mint",
    tags: ["welcome"],
    rank: DEFAULT_RANK,
  },
  {
    title: "Organize your tasks",
    description: "Create new cards with the + button",
    column: "todo",
    color: "cyan",
    rank: DEFAULT_RANK + 100,
  },
  {
    title: "Export your board",
    description: "Save your progress as JSON",
    column: "todo",
    color: "lavender",
    rank: DEFAULT_RANK + 200,
  },
];

/**
 * Board state interface
 */
interface BoardState {
  boards: Board[];
  activeBoard: Board | null;
  boardsIndex: BoardsIndex | null;

  // Actions
  setBoards: (boards: Board[]) => void;
  setActiveBoard: (boardId: string) => void;
  createBoard: (name: string, withStarters?: boolean) => void;
  renameBoard: (boardId: string, newName: string) => void;
  deleteBoard: (boardId: string) => void;
  importBoard: (
    name: string,
    columns: Column[],
    cards: Card[],
    fields?: Record<string, FieldDefinition>
  ) => void;
  updateBoardFields: (boardId: string, fields: Record<string, FieldDefinition>) => void;

  // Card actions
  addCard: (card: Omit<Card, "id">) => void;
  updateCard: (cardId: string, updates: Partial<Card>) => void;
  deleteCard: (cardId: string) => void;
  moveCard: (cardId: string, toColumn: string, newRank?: number) => void;

  // Column actions
  renameColumn: (columnKey: string, newTitle: string) => void;
  addColumn: (title: string) => void;
  deleteColumn: (columnKey: string) => void;
  reorderColumns: (newOrder: Column[]) => void;
  setColumnColor: (columnKey: string, color: string | null) => void;
  duplicateColumn: (columnKey: string) => void;
  sortCards: (columnKey: string, direction: "asc" | "desc") => void;
  setColumnCollapsed: (columnKey: string, collapsed: boolean) => void;
}

/**
 * Board store
 */
export const useBoardStore = create<BoardState>((set, get) => ({
  // Initial state
  boards: [],
  activeBoard: null,
  boardsIndex: null,

  // Board actions
  setBoards: (boards) => {
    const state = get();
    const activeId = state.boardsIndex?.activeId || boards[0]?.id;
    const activeBoard = boards.find((b) => b.id === activeId) || boards[0];
    set({ boards, activeBoard });
  },

  setActiveBoard: (boardId) => {
    const state = get();
    const activeBoard = state.boards.find((b) => b.id === boardId);
    if (activeBoard) {
      set({ activeBoard });
    }
  },

  createBoard: (name, withStarters = false) => {
    const state = get();
    // Copy global template fields to new board
    const { config } = useConfigStore.getState();
    const templateFields = config?.defaultFieldTemplate;

    const newBoard: Board = {
      id: uuidv4(),
      name,
      columns: DEFAULT_COLUMNS,
      cards: withStarters ? STARTER_CARDS.map((card) => ({ ...card, id: uuidv4() })) : [],
      fields: templateFields ? { ...templateFields } : undefined, // Copy template
    };

    const boards = [...state.boards, newBoard];
    set({ boards, activeBoard: newBoard });
  },

  renameBoard: (boardId, newName) => {
    const state = get();
    const boards = state.boards.map((b) => (b.id === boardId ? { ...b, name: newName } : b));
    const activeBoard =
      state.activeBoard?.id === boardId
        ? { ...state.activeBoard, name: newName }
        : state.activeBoard;
    set({ boards, activeBoard });
  },

  deleteBoard: (boardId) => {
    const state = get();
    const boards = state.boards.filter((b) => b.id !== boardId);

    // Prevent deleting last board
    if (boards.length === 0) {
      return;
    }

    // If deleted board was active, switch to first board
    const activeBoard = state.activeBoard?.id === boardId ? boards[0] : state.activeBoard;

    set({ boards, activeBoard });
  },

  importBoard: (name, columns, cards, fields) => {
    const state = get();
    const newBoard: Board = {
      id: uuidv4(),
      name,
      columns,
      cards: cards.map((card) => ({
        ...card,
        id: card.id || uuidv4(), // Ensure all cards have IDs
      })),
      fields, // Use imported fields directly
    };

    const boards = [...state.boards, newBoard];
    set({ boards, activeBoard: newBoard });
  },

  // Card actions
  addCard: (card) => {
    const state = get();
    if (!state.activeBoard) return;

    const newCard: Card = {
      ...card,
      id: uuidv4(),
      rank: card.rank ?? DEFAULT_RANK,
    };

    const updatedBoard: Board = {
      ...state.activeBoard,
      cards: [...state.activeBoard.cards, newCard],
    };

    const boards = state.boards.map((b) => (b.id === updatedBoard.id ? updatedBoard : b));

    set({ boards, activeBoard: updatedBoard });
  },

  updateCard: (cardId, updates) => {
    const state = get();
    if (!state.activeBoard) return;

    const updatedBoard: Board = {
      ...state.activeBoard,
      cards: state.activeBoard.cards.map((card) =>
        card.id === cardId ? { ...card, ...updates } : card
      ),
    };

    const boards = state.boards.map((b) => (b.id === updatedBoard.id ? updatedBoard : b));

    set({ boards, activeBoard: updatedBoard });
  },

  deleteCard: (cardId) => {
    const state = get();
    if (!state.activeBoard) return;

    const updatedBoard: Board = {
      ...state.activeBoard,
      cards: state.activeBoard.cards.filter((card) => card.id !== cardId),
    };

    const boards = state.boards.map((b) => (b.id === updatedBoard.id ? updatedBoard : b));

    set({ boards, activeBoard: updatedBoard });
  },

  moveCard: (cardId, toColumn, newRank) => {
    const state = get();
    if (!state.activeBoard) return;

    const updatedBoard: Board = {
      ...state.activeBoard,
      cards: state.activeBoard.cards.map((card) =>
        card.id === cardId
          ? { ...card, column: toColumn, rank: newRank ?? card.rank ?? DEFAULT_RANK }
          : card
      ),
    };

    const boards = state.boards.map((b) => (b.id === updatedBoard.id ? updatedBoard : b));

    set({ boards, activeBoard: updatedBoard });
  },

  // Column actions
  renameColumn: (columnKey, newTitle) => {
    const state = get();
    if (!state.activeBoard) return;

    const updatedBoard: Board = {
      ...state.activeBoard,
      columns: state.activeBoard.columns.map((col) =>
        col.key === columnKey ? { ...col, title: newTitle } : col
      ),
    };

    const boards = state.boards.map((b) => (b.id === updatedBoard.id ? updatedBoard : b));

    set({ boards, activeBoard: updatedBoard });
  },

  addColumn: (title) => {
    const state = get();
    if (!state.activeBoard) return;

    // Generate unique column key using UUID
    const key = uuidv4();
    const maxOrder = Math.max(...state.activeBoard.columns.map((c) => c.order), -1);

    const newColumn: Column = {
      key,
      title,
      order: maxOrder + 1,
    };

    const updatedBoard: Board = {
      ...state.activeBoard,
      columns: [...state.activeBoard.columns, newColumn],
    };

    const boards = state.boards.map((b) => (b.id === updatedBoard.id ? updatedBoard : b));

    set({ boards, activeBoard: updatedBoard });
  },

  deleteColumn: (columnKey) => {
    const state = get();
    if (!state.activeBoard) return;

    // Prevent deleting last column
    if (state.activeBoard.columns.length <= 1) return;

    // Move all cards from deleted column to first remaining column
    const remainingColumns = state.activeBoard.columns.filter((col) => col.key !== columnKey);
    const firstColumnKey = remainingColumns[0]?.key ?? "todo";

    const updatedBoard: Board = {
      ...state.activeBoard,
      columns: remainingColumns,
      cards: state.activeBoard.cards.map((card) =>
        card.column === columnKey ? { ...card, column: firstColumnKey } : card
      ),
    };

    const boards = state.boards.map((b) => (b.id === updatedBoard.id ? updatedBoard : b));

    set({ boards, activeBoard: updatedBoard });
  },

  reorderColumns: (newOrder) => {
    const state = get();
    if (!state.activeBoard) return;

    // Update order property for each column
    const updatedColumns = newOrder.map((col, index) => ({
      ...col,
      order: index,
    }));

    const updatedBoard: Board = {
      ...state.activeBoard,
      columns: updatedColumns,
    };

    const boards = state.boards.map((b) => (b.id === updatedBoard.id ? updatedBoard : b));

    set({ boards, activeBoard: updatedBoard });
  },

  setColumnColor: (columnKey, color) => {
    const state = get();
    if (!state.activeBoard) return;

    const updatedBoard: Board = {
      ...state.activeBoard,
      columns: state.activeBoard.columns.map((col) =>
        col.key === columnKey ? { ...col, color } : col
      ),
    };

    const boards = state.boards.map((b) => (b.id === updatedBoard.id ? updatedBoard : b));

    set({ boards, activeBoard: updatedBoard });
  },

  duplicateColumn: (columnKey) => {
    const state = get();
    if (!state.activeBoard) return;

    const originalColumn = state.activeBoard.columns.find((col) => col.key === columnKey);
    if (!originalColumn) return;

    // Generate new column with unique key
    const newColumnKey = `${columnKey}_copy_${Date.now()}`;
    const newColumn: Column = {
      ...originalColumn,
      key: newColumnKey,
      title: `${originalColumn.title} (Copy)`,
      order: originalColumn.order + 1,
    };

    // Deep copy all cards in the column with new IDs
    const originalCards = state.activeBoard.cards.filter((card) => card.column === columnKey);
    const newCards: Card[] = originalCards.map((card) => ({
      ...card,
      id: uuidv4(),
      column: newColumnKey,
    }));

    // Insert new column after original
    const updatedColumns = [...state.activeBoard.columns];
    const insertIndex = updatedColumns.findIndex((col) => col.key === columnKey) + 1;
    updatedColumns.splice(insertIndex, 0, newColumn);

    // Reorder columns after insertion
    const reorderedColumns = updatedColumns.map((col, idx) => ({ ...col, order: idx }));

    const updatedBoard: Board = {
      ...state.activeBoard,
      columns: reorderedColumns,
      cards: [...state.activeBoard.cards, ...newCards],
    };

    const boards = state.boards.map((b) => (b.id === updatedBoard.id ? updatedBoard : b));

    set({ boards, activeBoard: updatedBoard });
  },

  sortCards: (columnKey, direction) => {
    const state = get();
    if (!state.activeBoard) return;

    const columnCards = state.activeBoard.cards.filter((card) => card.column === columnKey);

    // Sort by title
    const sorted = [...columnCards].sort((a, b) => {
      const compareResult = a.title.localeCompare(b.title);
      return direction === "asc" ? compareResult : -compareResult;
    });

    // Recalculate rank values (1000, 2000, 3000...)
    const RANK_START = 1000;
    const RANK_INCREMENT = 1000;
    const updatedCards = sorted.map((card, index) => ({
      ...card,
      rank: RANK_START + index * RANK_INCREMENT,
    }));

    // Merge with other cards
    const otherCards = state.activeBoard.cards.filter((card) => card.column !== columnKey);
    const allCards = [...otherCards, ...updatedCards];

    const updatedBoard: Board = {
      ...state.activeBoard,
      cards: allCards,
    };

    const boards = state.boards.map((b) => (b.id === updatedBoard.id ? updatedBoard : b));

    set({ boards, activeBoard: updatedBoard });
  },

  setColumnCollapsed: (columnKey, collapsed) => {
    const state = get();
    if (!state.activeBoard) return;

    const updatedBoard: Board = {
      ...state.activeBoard,
      columns: state.activeBoard.columns.map((col) =>
        col.key === columnKey ? { ...col, collapsed } : col
      ),
    };

    const boards = state.boards.map((b) => (b.id === updatedBoard.id ? updatedBoard : b));

    set({ boards, activeBoard: updatedBoard });
  },

  updateBoardFields: (boardId, fields) => {
    const state = get();
    const boards = state.boards.map((b) => (b.id === boardId ? { ...b, fields } : b));
    const activeBoard =
      state.activeBoard?.id === boardId ? { ...state.activeBoard, fields } : state.activeBoard;
    set({ boards, activeBoard });
  },
}));
