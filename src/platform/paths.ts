// Platform-specific path helpers for Chronica (v0.1.0-alpha)
import { appDataDir, join } from "@tauri-apps/api/path";

/**
 * UUID v4 regex for validation
 * Prevents path traversal attacks
 */
const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Validate boardId is a valid UUID v4
 * Throws error if invalid (security: prevent path traversal)
 */
function validateBoardId(boardId: string): void {
  if (!UUID_V4_REGEX.test(boardId)) {
    throw new Error(`Invalid board ID format: ${boardId}. Expected UUID v4.`);
  }
}

/**
 * Get the Chronica data directory
 * Windows: %AppData%/Chronica/
 */
export async function getDataDir(): Promise<string> {
  const appData = await appDataDir();
  return await join(appData, "Chronica");
}

/**
 * Get path to boards index file
 */
export async function getBoardsIndexPath(): Promise<string> {
  const dataDir = await getDataDir();
  return await join(dataDir, "boards-index.json");
}

/**
 * Get path to boards directory
 */
export async function getBoardsDir(): Promise<string> {
  const dataDir = await getDataDir();
  return await join(dataDir, "boards");
}

/**
 * Get path to specific board file
 * Validates boardId to prevent path traversal
 */
export async function getBoardPath(boardId: string): Promise<string> {
  validateBoardId(boardId);
  const boardsDir = await getBoardsDir();
  return await join(boardsDir, `board-${boardId}.json`);
}

/**
 * Get path to config file
 */
export async function getConfigPath(): Promise<string> {
  const dataDir = await getDataDir();
  return await join(dataDir, "config.json");
}

/**
 * Get path to backups directory
 */
export async function getBackupsDir(): Promise<string> {
  const boardsDir = await getBoardsDir();
  return await join(boardsDir, "backups");
}

/**
 * Get path to a timestamped backup file
 * Validates boardId to prevent path traversal
 */
export async function getBackupPath(boardId: string, timestamp?: string): Promise<string> {
  validateBoardId(boardId);
  const backupsDir = await getBackupsDir();
  const ts = timestamp || new Date().toISOString().replace(/[:.]/g, "-");
  return await join(backupsDir, `board-${boardId}-${ts}.json`);
}
