// Zustand store for Chronica state management (v0.1.0-alpha)
import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import type { Board, BoardsIndex, Card, Config, Column } from "./types";

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
    rank: 1000,
  },
  {
    title: "Organize your tasks",
    description: "Create new cards with the + button",
    column: "todo",
    color: "cyan",
    rank: 1100,
  },
  {
    title: "Export your board",
    description: "Save your progress as JSON",
    column: "todo",
    color: "lavender",
    rank: 1200,
  },
];

/**
 * Board state slice
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
  importBoard: (name: string, columns: Column[], cards: Card[]) => void;

  // Card actions
  addCard: (card: Omit<Card, "id">) => void;
  updateCard: (cardId: string, updates: Partial<Card>) => void;
  deleteCard: (cardId: string) => void;
  moveCard: (cardId: string, toColumn: string, newRank?: number) => void;
}

/**
 * Config state slice
 */
interface ConfigState {
  config: Config | null;

  // Actions
  setConfig: (config: Config) => void;
  updateConfig: (updates: Partial<Config>) => void;
  setPinned: (pinned: boolean) => void;
  setOpacity: (opacity: number) => void;
  setAutostart: (autostart: boolean) => void;
  setShowStarterCards: (show: boolean) => void;
}

/**
 * Combined app state
 */
type AppState = BoardState & ConfigState;

/**
 * Main Zustand store
 */
export const useStore = create<AppState>((set, get) => ({
  // Initial state
  boards: [],
  activeBoard: null,
  boardsIndex: null,
  config: null,

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
    const newBoard: Board = {
      id: uuidv4(),
      name,
      columns: DEFAULT_COLUMNS,
      cards: withStarters
        ? STARTER_CARDS.map((card) => ({ ...card, id: uuidv4() }))
        : [],
    };

    const boards = [...state.boards, newBoard];
    set({ boards, activeBoard: newBoard });
  },

  renameBoard: (boardId, newName) => {
    const state = get();
    const boards = state.boards.map((b) =>
      b.id === boardId ? { ...b, name: newName } : b
    );
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
    const activeBoard =
      state.activeBoard?.id === boardId ? boards[0] : state.activeBoard;

    set({ boards, activeBoard });
  },

  importBoard: (name, columns, cards) => {
    const state = get();
    const newBoard: Board = {
      id: uuidv4(),
      name,
      columns,
      cards: cards.map((card) => ({
        ...card,
        id: card.id || uuidv4(), // Ensure all cards have IDs
      })),
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
      rank: card.rank ?? 1000,
    };

    const updatedBoard: Board = {
      ...state.activeBoard,
      cards: [...state.activeBoard.cards, newCard],
    };

    const boards = state.boards.map((b) =>
      b.id === updatedBoard.id ? updatedBoard : b
    );

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

    const boards = state.boards.map((b) =>
      b.id === updatedBoard.id ? updatedBoard : b
    );

    set({ boards, activeBoard: updatedBoard });
  },

  deleteCard: (cardId) => {
    const state = get();
    if (!state.activeBoard) return;

    const updatedBoard: Board = {
      ...state.activeBoard,
      cards: state.activeBoard.cards.filter((card) => card.id !== cardId),
    };

    const boards = state.boards.map((b) =>
      b.id === updatedBoard.id ? updatedBoard : b
    );

    set({ boards, activeBoard: updatedBoard });
  },

  moveCard: (cardId, toColumn, newRank) => {
    const state = get();
    if (!state.activeBoard) return;

    const updatedBoard: Board = {
      ...state.activeBoard,
      cards: state.activeBoard.cards.map((card) =>
        card.id === cardId
          ? { ...card, column: toColumn, rank: newRank ?? card.rank ?? 1000 }
          : card
      ),
    };

    const boards = state.boards.map((b) =>
      b.id === updatedBoard.id ? updatedBoard : b
    );

    set({ boards, activeBoard: updatedBoard });
  },

  // Config actions
  setConfig: (config) => set({ config }),

  updateConfig: (updates) => {
    const state = get();
    if (!state.config) return;
    set({ config: { ...state.config, ...updates } });
  },

  setPinned: (pinned) => {
    const state = get();
    if (!state.config) return;
    set({ config: { ...state.config, pinned } });
  },

  setOpacity: (opacity) => {
    const state = get();
    if (!state.config) return;
    set({ config: { ...state.config, opacity } });
  },

  setAutostart: (autostart) => {
    const state = get();
    if (!state.config) return;
    set({ config: { ...state.config, autostart } });
  },

  setShowStarterCards: (show) => {
    const state = get();
    if (!state.config) return;
    set({ config: { ...state.config, showStarterCards: show } });
  },
}));

/**
 * Helper to get default config
 */
export function getDefaultConfig(): Config {
  return {
    appVersion: "v0.1.0-alpha",
    window: { x: 100, y: 100, width: 1000, height: 700 },
    pinned: false,
    opacity: 1.0,
    autostart: false,
    showStarterCards: true,
    sidebarPinned: true,
    columnsLocked: false,
  };
}
