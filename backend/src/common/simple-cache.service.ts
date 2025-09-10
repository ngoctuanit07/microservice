import { Injectable } from '@nestjs/common';

@Injectable()
export class SimpleCacheService {
  private cache = new Map<string, { value: any; expires: number }>();

  set(key: string, value: any, ttlMs: number) {
    this.cache.set(key, { value, expires: Date.now() + ttlMs });
  }

  get(key: string) {
    const entry = this.cache.get(key);
    if (!entry || entry.expires < Date.now()) {
      this.cache.delete(key);
      return undefined;
    }
    return entry.value;
  }
}
