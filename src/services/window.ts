// Window service abstraction for Chronica v0.1.0-alpha
// Provides testable interface for window operations

import {
  getCurrentWindow,
  LogicalPosition,
  LogicalSize,
  type Window as TauriWindow,
} from "@tauri-apps/api/window";

/**
 * Window state type
 */
export interface WindowState {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Window service interface
 * Abstracts window operations for testability
 */
export interface IWindowService {
  setPinned(pinned: boolean): Promise<void>;
  setOpacity(opacity: number): Promise<void>;
  getWindowState(): Promise<WindowState>;
  setWindowState(state: WindowState): Promise<void>;
  show(): Promise<void>;
  hide(): Promise<void>;
  close(): Promise<void>;
}

/**
 * Tauri-based window implementation
 */
export class TauriWindowService implements IWindowService {
  private window: TauriWindow;

  constructor() {
    this.window = getCurrentWindow();
  }

  async setPinned(pinned: boolean): Promise<void> {
    await this.window.setAlwaysOnTop(pinned);
  }

  async setOpacity(opacity: number): Promise<void> {
    const clamped = Math.max(0.7, Math.min(1.0, opacity));
    // @ts-expect-error - setOpacity exists in Tauri v2 but types may be incomplete
    await this.window.setOpacity(clamped);
  }

  async getWindowState(): Promise<WindowState> {
    const position = await this.window.outerPosition();
    const size = await this.window.outerSize();

    return {
      x: position.x,
      y: position.y,
      width: size.width,
      height: size.height,
    };
  }

  async setWindowState(state: WindowState): Promise<void> {
    await this.window.setPosition(new LogicalPosition(state.x, state.y));
    await this.window.setSize(new LogicalSize(state.width, state.height));
  }

  async show(): Promise<void> {
    await this.window.show();
    await this.window.setFocus();
  }

  async hide(): Promise<void> {
    await this.window.hide();
  }

  async close(): Promise<void> {
    await this.window.close();
  }
}

/**
 * Default window service instance
 */
export const windowService: IWindowService = new TauriWindowService();
