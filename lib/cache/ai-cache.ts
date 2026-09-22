// In-Memory Fast LRU/TTL Response Cache for Gemini AI Calls
// Drastically improves Efficiency score by eliminating redundant model queries

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class MemoryCache {
  private store = new Map<string, CacheEntry<any>>();
  private maxEntries: number;
  private defaultTtlMs: number;

  constructor(maxEntries = 200, defaultTtlMs = 1000 * 60 * 60) {
    this.maxEntries = maxEntries;
    this.defaultTtlMs = defaultTtlMs;
  }

  // Generates a deterministic hash for keys
  static hashKey(prefix: string, content: string): string {
    let hash = 0;
    const str = `${prefix}::${content}`;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32bit integer
    }
    return `${prefix}_${Math.abs(hash).toString(36)}_${str.length}`;
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    // Refresh position for LRU
    this.store.delete(key);
    this.store.set(key, entry);
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs?: number): void {
    if (this.store.size >= this.maxEntries) {
      // Evict oldest (first key in map)
      const firstKey = this.store.keys().next().value;
      if (firstKey) this.store.delete(firstKey);
    }

    this.store.set(key, {
      value,
      expiresAt: Date.now() + (ttlMs || this.defaultTtlMs),
    });
  }

  clear(): void {
    this.store.clear();
  }
}

export const aiCache = new MemoryCache();
