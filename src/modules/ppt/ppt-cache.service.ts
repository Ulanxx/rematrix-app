import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

export interface CacheOptions {
  ttl?: number;
  enabled?: boolean;
}

@Injectable()
export class PptCacheService {
  private readonly logger = new Logger(PptCacheService.name);
  private cache: Map<string, { value: string; expiresAt: number }> = new Map();
  private hits = 0;
  private misses = 0;

  computeCacheKey(
    slideContent: string,
    themeConfig: any,
    context: any,
  ): string {
    const data = JSON.stringify({
      content: slideContent,
      theme: themeConfig,
      context: context,
    });

    return `ppt:slide:${crypto.createHash('sha256').update(data).digest('hex')}`;
  }

  async get(key: string): Promise<string | null> {
    const entry = this.cache.get(key);

    if (!entry) {
      this.misses++;
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    this.hits++;
    this.logger.debug(`缓存命中: ${key}`);
    return entry.value;
  }

  async set(key: string, value: string, ttlSeconds: number = 604800): Promise<void> {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { value, expiresAt });
    this.logger.debug(`缓存写入: ${key}, TTL: ${ttlSeconds}s`);
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
    this.logger.debug(`缓存删除: ${key}`);
  }

  async clear(): Promise<void> {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
    this.logger.log('缓存已清空');
  }

  getStats(): { hits: number; misses: number; hitRate: number; size: number } {
    const total = this.hits + this.misses;
    const hitRate = total > 0 ? this.hits / total : 0;

    return {
      hits: this.hits,
      misses: this.misses,
      hitRate: Math.round(hitRate * 100) / 100,
      size: this.cache.size,
    };
  }

  cleanExpired(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.logger.log(`清理过期缓存: ${cleaned} 条`);
    }
  }
}
