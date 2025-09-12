import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SimpleCacheService {
  private cache = new Map<string, { value: any; expires: number }>();
  private readonly logger = new Logger(SimpleCacheService.name);

  /**
   * Store a value in the cache with expiration time
   * @param key The cache key
   * @param value The value to store
   * @param ttlMs Time to live in milliseconds (default: 5 minutes)
   */
  set(key: string, value: any, ttlMs = 5 * 60 * 1000) {
    this.cache.set(key, { value, expires: Date.now() + ttlMs });
    this.logger.debug(`Cache set: ${key}`);
  }

  /**
   * Retrieve a value from cache
   * @param key The cache key
   * @returns The cached value or undefined if not found or expired
   */
  get(key: string) {
    const entry = this.cache.get(key);
    if (!entry) {
      return undefined;
    }
    
    if (entry.expires < Date.now()) {
      this.cache.delete(key);
      this.logger.debug(`Cache expired: ${key}`);
      return undefined;
    }
    
    this.logger.debug(`Cache hit: ${key}`);
    return entry.value;
  }

  /**
   * Check if a key exists in the cache and is not expired
   * @param key The cache key
   * @returns True if the key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    return !!entry && entry.expires >= Date.now();
  }

  /**
   * Delete a specific key from the cache
   * @param key The cache key
   * @returns True if the key was deleted
   */
  del(key: string): boolean {
    const result = this.cache.delete(key);
    if (result) {
      this.logger.debug(`Cache deleted: ${key}`);
    }
    return result;
  }

  /**
   * Delete all cache entries that match a pattern
   * @param pattern The pattern to match (simple string match)
   * @returns Number of entries deleted
   */
  delByPattern(pattern: string): number {
    let count = 0;
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
        count++;
      }
    }
    if (count > 0) {
      this.logger.debug(`Deleted ${count} cache entries matching pattern: ${pattern}`);
    }
    return count;
  }

  /**
   * Clear all entries from the cache
   */
  clear(): void {
    const count = this.cache.size;
    this.cache.clear();
    this.logger.debug(`Cache cleared: ${count} entries removed`);
  }

  /**
   * Get cache statistics
   * @returns Object with cache statistics
   */
  getStats(): { size: number; activeKeys: string[] } {
    const now = Date.now();
    const activeKeys = Array.from(this.cache.entries())
      .filter(([_, entry]) => entry.expires >= now)
      .map(([key]) => key);

    return {
      size: activeKeys.length,
      activeKeys,
    };
  }
}
