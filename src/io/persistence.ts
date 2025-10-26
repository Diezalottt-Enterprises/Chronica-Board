// Persistence layer for Chronica (v0.1.0-alpha)
// Handles loading/saving boards, config, and boards index
import { exists, mkdir, readTextFile, writeTextFile, remove, readDir } from "@tauri-apps/plugin-fs";
import {
  getBoardPath,
  getBoardsDir,
  getBoardsIndexPath,
  getConfigPath,
  getDataDir,
  getBackupPath,
  getBackupsDir,
} from "../platform/paths";
import { getDefaultConfig } from "../stores/configStore";
import type { Board, BoardsIndex, Config } from "../state/types";
import { BoardSchema, BoardsIndexSchema, ConfigSchema } from "./schema";

/**
 * Initialize data directory structure
 */
export async function initDataDir(): Promise<void> {
  const dataDir = await getDataDir();
  const boardsDir = await getBoardsDir();
  const backupsDir = await getBackupsDir();

  // Create directories if they don't exist
  if (!(await exists(dataDir))) {
    await mkdir(dataDir, { recursive: true });
  }

  if (!(await exists(boardsDir))) {
    await mkdir(boardsDir, { recursive: true });
  }

  if (!(await exists(backupsDir))) {
    await mkdir(backupsDir, { recursive: true });
  }
}

/**
 * Load boards index with validation
 */
export async function loadBoardsIndex(): Promise<BoardsIndex | null> {
  try {
    const path = await getBoardsIndexPath();
    if (!(await exists(path))) {
      return null;
    }

    const content = await readTextFile(path);
    const parsed = JSON.parse(content);

    // Validate with Zod schema (security: prevent corrupted data)
    const validated = BoardsIndexSchema.parse(parsed);
    return validated;
  } catch (error) {
    console.error("Failed to load boards index:", error);
    return null;
  }
}

/**
 * Save boards index
 */
export async function saveBoardsIndex(index: BoardsIndex): Promise<void> {
  try {
    const path = await getBoardsIndexPath();
    const content = JSON.stringify(index, null, 2);
    await writeTextFile(path, content);
  } catch (error) {
    console.error("Failed to save boards index:", error);
    throw error;
  }
}

/**
 * Load a single board by ID with validation
 */
export async function loadBoard(boardId: string): Promise<Board | null> {
  try {
    const path = await getBoardPath(boardId);
    if (!(await exists(path))) {
      return null;
    }

    const content = await readTextFile(path);
    const parsed = JSON.parse(content);

    // Validate with Zod schema (security: prevent corrupted data)
    const validated = BoardSchema.parse(parsed);
    return validated;
  } catch (error) {
    console.error(`Failed to load board ${boardId}:`, error);
    return null;
  }
}

/**
 * Save a single board with atomic write, backup, and cleanup
 */
export async function saveBoard(board: Board): Promise<void> {
  const path = await getBoardPath(board.id);
  const tempPath = `${path}.tmp`;

  try {
    // Create backup before saving
    await backupBoard(board.id);

    const content = JSON.stringify(board, null, 2);

    // Atomic write: write to temp file first
    await writeTextFile(tempPath, content);

    // Then overwrite main file
    // Note: Tauri fs plugin doesn't have rename, so we use overwrite
    // In production, consider using invoke to call Rust rename for true atomicity
    await writeTextFile(path, content);
  } catch (error) {
    console.error(`Failed to save board ${board.id}:`, error);
    throw error;
  } finally {
    // Always cleanup temp file (security: prevent disk filling)
    try {
      if (await exists(tempPath)) {
        await remove(tempPath);
      }
    } catch (cleanupError) {
      console.warn(`Failed to cleanup temp file ${tempPath}:`, cleanupError);
      // Don't throw - cleanup failure shouldn't block the save
    }
  }
}

/**
 * Load all boards
 */
export async function loadAllBoards(index: BoardsIndex): Promise<Board[]> {
  const boards: Board[] = [];

  for (const { id } of index.boards) {
    const board = await loadBoard(id);
    if (board) {
      boards.push(board);
    }
  }

  return boards;
}

/**
 * Delete a board
 */
export async function deleteBoard(boardId: string): Promise<void> {
  try {
    const path = await getBoardPath(boardId);
    if (await exists(path)) {
      await remove(path);
    }
  } catch (error) {
    console.error(`Failed to delete board ${boardId}:`, error);
    throw error;
  }
}

/**
 * Create backup of a board with rotation (keep max 5 backups)
 */
export async function backupBoard(boardId: string): Promise<void> {
  try {
    const sourcePath = await getBoardPath(boardId);

    // Only backup if board exists
    if (!(await exists(sourcePath))) {
      return;
    }

    // Create timestamped backup
    const backupPath = await getBackupPath(boardId);
    const content = await readTextFile(sourcePath);
    await writeTextFile(backupPath, content);

    // Rotate backups - keep only latest 5
    await rotateBackups(boardId, 5);
  } catch (error) {
    console.error(`Failed to backup board ${boardId}:`, error);
    // Don't throw - backup failure shouldn't block operations
  }
}

/**
 * Rotate backups for a board - keep only N most recent
 */
async function rotateBackups(boardId: string, maxBackups: number): Promise<void> {
  try {
    const backupsDir = await getBackupsDir();

    // List all backups for this board
    const entries = await readDir(backupsDir);
    const backups = entries
      .filter((entry) => entry.name.startsWith(`board-${boardId}-`) && entry.name.endsWith(".json"))
      .map((entry) => ({
        name: entry.name,
        path: `${backupsDir}\\${entry.name}`, // Windows path separator
      }))
      .sort((a, b) => b.name.localeCompare(a.name)); // Sort by timestamp descending

    // Delete old backups if we have more than maxBackups
    if (backups.length > maxBackups) {
      const toDelete = backups.slice(maxBackups);
      for (const backup of toDelete) {
        try {
          await remove(backup.path);
        } catch (error) {
          console.warn(`Failed to delete old backup ${backup.name}:`, error);
        }
      }
    }
  } catch (error) {
    console.error(`Failed to rotate backups for board ${boardId}:`, error);
  }
}

/**
 * Load config with validation
 */
export async function loadConfig(): Promise<Config> {
  try {
    const path = await getConfigPath();
    if (!(await exists(path))) {
      return getDefaultConfig();
    }

    const content = await readTextFile(path);
    const parsed = JSON.parse(content);

    // Validate with Zod schema (security: prevent corrupted data)
    const validated = ConfigSchema.parse(parsed);

    // Merge with defaults to ensure all fields exist
    return { ...getDefaultConfig(), ...validated };
  } catch (error) {
    console.error("Failed to load config:", error);
    return getDefaultConfig();
  }
}

/**
 * Save config
 */
export async function saveConfig(config: Config): Promise<void> {
  try {
    const path = await getConfigPath();
    const content = JSON.stringify(config, null, 2);
    await writeTextFile(path, content);
  } catch (error) {
    console.error("Failed to save config:", error);
    throw error;
  }
}

/**
 * Map-based debounced save helper
 * Each key gets its own timer for independent debouncing
 */
const saveTimers = new Map<string, number>();

export function debouncedSave<T>(
  saveFn: (data: T) => Promise<void>,
  data: T,
  delay = 500, // Increased from 250ms for better batching
  key?: string
): void {
  // Generate key from data if not provided
  const timerKey = key || JSON.stringify(data);

  // Clear existing timer for this key
  if (saveTimers.has(timerKey)) {
    clearTimeout(saveTimers.get(timerKey));
  }

  // Set new timer
  const timer = window.setTimeout(() => {
    saveFn(data).catch((error) => {
      console.error("Debounced save failed:", error);
    });
    saveTimers.delete(timerKey);
  }, delay);

  saveTimers.set(timerKey, timer);
}
