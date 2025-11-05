// UI store for Chronica v0.1.0-alpha
// Manages UI state (modals, loading flags, etc.)
import { create } from "zustand";
import type { Card, ColumnKey } from "../state/types";
import type { SaveStatus } from "../services/saveQueue";

/**
 * Dialog types
 */
export type DialogType = "alert" | "confirm" | "prompt";

export interface DialogState {
  type: DialogType;
  title: string;
  message: string;
  defaultValue?: string; // For prompt dialogs
  onConfirm: (value?: string) => void;
  onCancel?: () => void;
}

/**
 * UI state interface
 */
interface UIState {
  // Modal states
  showSettings: boolean;
  showImport: boolean;
  showExport: boolean;
  editingCard: Card | null;
  newCardColumn: ColumnKey | null;
  dialog: DialogState | null;

  // Save status
  saveStatus: SaveStatus;
  saveError: string | null;

  // Actions
  setShowSettings: (show: boolean) => void;
  setShowImport: (show: boolean) => void;
  setShowExport: (show: boolean) => void;
  setEditingCard: (card: Card | null) => void;
  setNewCardColumn: (column: ColumnKey | null) => void;
  closeAllModals: () => void;

  // Save status actions
  setSaveStatus: (status: SaveStatus, error?: Error) => void;

  // Dialog actions
  showAlert: (title: string, message: string, onConfirm?: () => void) => void;
  showConfirm: (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void
  ) => void;
  showPrompt: (
    title: string,
    message: string,
    defaultValue: string,
    onConfirm: (value: string) => void,
    onCancel?: () => void
  ) => void;
  closeDialog: () => void;
}

/**
 * UI store
 */
export const useUIStore = create<UIState>((set) => ({
  // Initial state
  showSettings: false,
  showImport: false,
  showExport: false,
  editingCard: null,
  newCardColumn: null,
  dialog: null,
  saveStatus: "idle",
  saveError: null,

  // Actions
  setShowSettings: (show) => {
    set({ showSettings: show });
  },
  setShowImport: (show) => {
    set({ showImport: show });
  },
  setShowExport: (show) => {
    set({ showExport: show });
  },
  setEditingCard: (card) => {
    set({ editingCard: card });
  },
  setNewCardColumn: (column) => {
    set({ newCardColumn: column });
  },
  closeAllModals: () => {
    set({
      showSettings: false,
      showImport: false,
      showExport: false,
      editingCard: null,
      newCardColumn: null,
      dialog: null,
    });
  },

  // Save status actions
  setSaveStatus: (status, error) => {
    set({
      saveStatus: status,
      saveError: error?.message || null,
    });
  },

  // Dialog actions
  showAlert: (title, message, onConfirm) => {
    set({
      dialog: {
        type: "alert",
        title,
        message,
        onConfirm: () => {
          if (onConfirm) onConfirm();
          set({ dialog: null });
        },
      },
    });
  },

  showConfirm: (title, message, onConfirm, onCancel) => {
    set({
      dialog: {
        type: "confirm",
        title,
        message,
        onConfirm: () => {
          onConfirm();
          set({ dialog: null });
        },
        onCancel: () => {
          if (onCancel) onCancel();
          set({ dialog: null });
        },
      },
    });
  },

  showPrompt: (title, message, defaultValue, onConfirm, onCancel) => {
    set({
      dialog: {
        type: "prompt",
        title,
        message,
        defaultValue,
        onConfirm: (value?: string) => {
          if (value !== undefined) onConfirm(value);
          set({ dialog: null });
        },
        onCancel: () => {
          if (onCancel) onCancel();
          set({ dialog: null });
        },
      },
    });
  },

  closeDialog: () => {
    set({ dialog: null });
  },
}));
