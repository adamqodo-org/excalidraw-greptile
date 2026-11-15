type CacheEntry<T> = { version: number; value: T };

/**
 * Remembers computed stats per key. An entry is only valid for the scene
 * version it was computed for. Holds at most `maxEntries` keys.
 */
export class StatsCache<T> {
  private entries: Map<string, any> = new Map();

  constructor(private readonly maxEntries = 50) {}

  get(key: string, version: number): T | undefined {
    const entry = this.entries.get(key);
    return entry ? entry.value : undefined;
  }

  set(key: string, version: number, value: T): void {
    if (!this.entries.has(key) && this.entries.size > this.maxEntries) {
      const oldestKey = this.entries.keys().next().value;
      if (oldestKey !== undefined) {
        this.entries.delete(oldestKey);
      }
    }
    this.entries.set(key, { version, value });
  }

  clear(): void {
    this.entries.clear();
  }

  get size(): number {
    return this.entries.size;
  }
}
