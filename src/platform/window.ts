// Window control helpers for Chronica (v0.1.0-alpha)
import { getCurrentWindow, LogicalPosition, LogicalSize, type Window as TauriWindow } from "@tauri-apps/api/window";

/**
 * Set window always-on-top state
 */
export async function setPinned(pinned: boolean): Promise<void> {
  const appWindow: TauriWindow = getCurrentWindow();
  await appWindow.setAlwaysOnTop(pinned);
}

/**
 * Set window opacity (0.7 - 1.0)
 * Note: Requires window decorations in Tauri v2
 */
export async function setOpacity(opacity: number): Promise<void> {
  const appWindow: TauriWindow = getCurrentWindow();
  const clamped = Math.max(0.7, Math.min(1.0, opacity));

  try {
    // Check if setOpacity exists (may not be available with decorations:false)
    if (typeof (appWindow as any).setOpacity === 'function') {
      await (appWindow as any).setOpacity(clamped);
    } else {
      // Opacity control not available - silently skip
      // This is expected with decorations:false in tauri.conf.json
      console.debug('[Window] Opacity control not available (decorations disabled)');
    }
  } catch (error) {
    console.warn('[Window] Failed to set opacity:', error);
  }
}

/**
 * Get current window position and size
 */
export async function getWindowState() {
  const appWindow = getCurrentWindow();
  const position = await appWindow.outerPosition();
  const size = await appWindow.outerSize();

  return {
    x: position.x,
    y: position.y,
    width: size.width,
    height: size.height,
  };
}

/**
 * Set window position and size
 */
export async function setWindowState(x: number, y: number, width: number, height: number) {
  const appWindow = getCurrentWindow();
  await appWindow.setPosition(new LogicalPosition(x, y));
  await appWindow.setSize(new LogicalSize(width, height));
}

/**
 * Show the window
 */
export async function showWindow(): Promise<void> {
  const appWindow = getCurrentWindow();
  await appWindow.show();
  await appWindow.setFocus();
}

/**
 * Hide the window
 */
export async function hideWindow(): Promise<void> {
  const appWindow = getCurrentWindow();
  await appWindow.hide();
}

/**
 * Close the window
 */
export async function closeWindow(): Promise<void> {
  const appWindow = getCurrentWindow();
  await appWindow.close();
}
