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
  setConfig: (config) => {
    // Migration: Copy old global fields to defaultFieldTemplate
    if (config.fields && !config.defaultFieldTemplate) {
      config.defaultFieldTemplate = config.fields;
      delete config.fields; // Clean up deprecated field
    }
    set({ config });
  },

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

  // Field management actions (operates on defaultFieldTemplate)
  addField: (fieldId, field) => {
    const state = get();
    if (!state.config) return;
    const defaultFieldTemplate = { ...(state.config.defaultFieldTemplate || {}) };
    defaultFieldTemplate[fieldId] = field;
    set({ config: { ...state.config, defaultFieldTemplate } });
  },

  updateField: (fieldId, field) => {
    const state = get();
    if (!state.config) return;
    const defaultFieldTemplate = { ...(state.config.defaultFieldTemplate || {}) };
    defaultFieldTemplate[fieldId] = field;
    set({ config: { ...state.config, defaultFieldTemplate } });
  },

  removeField: (fieldId) => {
    const state = get();
    if (!state.config) return;
    const defaultFieldTemplate = { ...(state.config.defaultFieldTemplate || {}) };
    delete defaultFieldTemplate[fieldId];
    set({ config: { ...state.config, defaultFieldTemplate } });
  },

  getField: (fieldId) => {
    const state = get();
    return state.config?.defaultFieldTemplate?.[fieldId];
  },

  getAllFields: () => {
    const state = get();
    return state.config?.defaultFieldTemplate || {};
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
    sidebarPinned: true,
    columnsLocked: false,
    uiScale: 1.0,
  };
}
