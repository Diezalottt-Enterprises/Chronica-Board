// Save queue service with retry logic (Chronica v0.1.0-alpha)
// Handles resilient saving with exponential backoff on failures

/**
 * Save status for a specific key
 */
export type SaveStatus = "idle" | "saving" | "success" | "error";

/**
 * Save operation metadata
 */
interface SaveOperation<T> {
  key: string;
  saveFn: (data: T) => Promise<void>;
  data: T;
  attempt: number;
  maxAttempts: number;
  timerId?: number;
}

/**
 * Status subscriber callback
 */
type StatusCallback = (key: string, status: SaveStatus, error?: Error) => void;

/**
 * SaveQueue class - manages save operations with retry logic
 */
class SaveQueue {
  private operations = new Map<string, SaveOperation<unknown>>();
  private subscribers = new Set<StatusCallback>();
  private retryDelays = [0, 1000, 2000]; // 0ms, 1s, 2s

  /**
   * Subscribe to status changes
   */
  subscribe(callback: StatusCallback): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  /**
   * Notify subscribers of status change
   */
  private notify(key: string, status: SaveStatus, error?: Error): void {
    this.subscribers.forEach((cb) => {
      cb(key, status, error);
    });
  }

  /**
   * Queue a save operation
   */
  async save<T>(
    key: string,
    saveFn: (data: T) => Promise<void>,
    data: T,
    maxAttempts = 3
  ): Promise<void> {
    // Cancel existing operation for this key
    const existing = this.operations.get(key);
    if (existing?.timerId) {
      clearTimeout(existing.timerId);
    }

    // Create new operation
    const operation: SaveOperation<T> = {
      key,
      saveFn,
      data,
      attempt: 0,
      maxAttempts,
    };

    this.operations.set(key, operation as SaveOperation<unknown>);
    this.notify(key, "saving");

    // Start saving
    await this.executeSave(operation);
  }

  /**
   * Execute save operation with retry logic
   */
  private async executeSave<T>(operation: SaveOperation<T>): Promise<void> {
    const { key, saveFn, data, attempt, maxAttempts } = operation;

    try {
      // Attempt save
      await saveFn(data);

      // Success - remove from queue and notify
      this.operations.delete(key);
      this.notify(key, "success");
    } catch (error) {
      const nextAttempt = attempt + 1;

      // Check if we should retry
      if (nextAttempt < maxAttempts) {
        // Schedule retry with exponential backoff
        const delay = this.retryDelays[nextAttempt] || 2000;

        operation.attempt = nextAttempt;
        operation.timerId = window.setTimeout(() => {
          this.executeSave(operation);
        }, delay);
      } else {
        // Max attempts reached - fail
        this.operations.delete(key);
        this.notify(key, "error", error as Error);
        console.error(`[SaveQueue] Save failed after ${maxAttempts} attempts:`, error);
      }
    }
  }

  /**
   * Get current status for a key
   */
  getStatus(key: string): SaveStatus {
    return this.operations.has(key) ? "saving" : "idle";
  }

  /**
   * Clear all pending operations (for cleanup)
   */
  clear(): void {
    this.operations.forEach((op) => {
      if (op.timerId) {
        clearTimeout(op.timerId);
      }
    });
    this.operations.clear();
  }
}

// Export singleton instance
export const saveQueue = new SaveQueue();
