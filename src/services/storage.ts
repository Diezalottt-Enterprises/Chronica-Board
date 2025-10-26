// Storage service abstraction for Chronica v0.1.0-alpha
// Provides testable interface for file operations

import {
  exists,
  mkdir,
  readTextFile,
  writeTextFile,
  remove,
  stat,
  type FileInfo,
} from "@tauri-apps/plugin-fs";

/**
 * Storage service interface
 * Abstracts file system operations for testability
 */
export interface IStorageService {
  exists(path: string): Promise<boolean>;
  mkdir(path: string, options?: { recursive?: boolean }): Promise<void>;
  readTextFile(path: string): Promise<string>;
  writeTextFile(path: string, content: string): Promise<void>;
  remove(path: string): Promise<void>;
  stat(path: string): Promise<FileInfo>;
}

/**
 * Tauri-based storage implementation
 * Uses Tauri plugin-fs for actual file operations
 */
export class TauriStorageService implements IStorageService {
  async exists(path: string): Promise<boolean> {
    return await exists(path);
  }

  async mkdir(path: string, options?: { recursive?: boolean }): Promise<void> {
    await mkdir(path, options);
  }

  async readTextFile(path: string): Promise<string> {
    return await readTextFile(path);
  }

  async writeTextFile(path: string, content: string): Promise<void> {
    await writeTextFile(path, content);
  }

  async remove(path: string): Promise<void> {
    await remove(path);
  }

  async stat(path: string): Promise<FileInfo> {
    return await stat(path);
  }
}

/**
 * Default storage service instance
 */
export const storageService: IStorageService = new TauriStorageService();
