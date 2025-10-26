// Config store for Chronica v0.1.0-alpha
// Manages application configuration and settings
import { create } from "zustand";
import type { Config } from "../state/types";
import type { FieldDefinition } from "../io/fieldSchema";
import { VERSION_DISPLAY } from "../version";

/**
 * Config state interface
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
  setSidebarPinned: (pinned: boolean) => void;
  setColumnsLocked: (locked: boolean) => void;
  setUIScale: (scale: number) => void;

  // Field management
  addField: (fieldId: string, field: FieldDefinition) => void;
  updateField: (fieldId: string, field: FieldDefinition) => void;
  removeField: (fieldId: string) => void;
  getField: (fieldId: string) => FieldDefinition | undefined;
  getAllFields: () => Record<string, FieldDefinition>;
}

/**
 * Config store
 */
export const useConfigStore = create<ConfigState>((set, get) => ({
  // Initial state
  config: null,

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

  setSidebarPinned: (pinned) => {
    const state = get();
    if (!state.config) return;
    set({ config: { ...state.config, sidebarPinned: pinned } });
  },

  setColumnsLocked: (locked) => {
    const state = get();
    if (!state.config) return;
    set({ config: { ...state.config, columnsLocked: locked } });
  },

  setUIScale: (scale) => {
    const state = get();
    if (!state.config) return;
    const clamped = Math.max(0.8, Math.min(1.2, scale));
    set({ config: { ...state.config, uiScale: clamped } });
  },

  // Field management actions
  addField: (fieldId, field) => {
    const state = get();
    if (!state.config) return;
    const fields = { ...(state.config.fields || {}) };
    fields[fieldId] = field;
    set({ config: { ...state.config, fields } });
  },

  updateField: (fieldId, field) => {
    const state = get();
    if (!state.config) return;
    const fields = { ...(state.config.fields || {}) };
    fields[fieldId] = field;
    set({ config: { ...state.config, fields } });
  },

  removeField: (fieldId) => {
    const state = get();
    if (!state.config) return;
    const fields = { ...(state.config.fields || {}) };
    delete fields[fieldId];
    set({ config: { ...state.config, fields } });
  },

  getField: (fieldId) => {
    const state = get();
    return state.config?.fields?.[fieldId];
  },

  getAllFields: () => {
    const state = get();
    return state.config?.fields || {};
  },
}));

/**
 * Helper to get default config
 */
export function getDefaultConfig(): Config {
  return {
    appVersion: VERSION_DISPLAY,
    window: { x: 100, y: 100, width: 1000, height: 700 },
    pinned: false,
    opacity: 1.0,
    autostart: false,
    showStarterCards: true,
    sidebarPinned: true,
    columnsLocked: false,
    uiScale: 1.0,
  };
}
