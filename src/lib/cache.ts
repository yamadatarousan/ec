/**
 * クライアントサイドキャッシュユーティリティ
 * APIレスポンスをメモリとlocalStorageでキャッシュ
 */

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  expiry: number;
}

export interface CacheOptions {
  /** キャッシュの有効期限（ミリ秒） */
  ttl?: number;
  /** localStorageを使用するか */
  persist?: boolean;
  /** キャッシュキーのプレフィックス */
  prefix?: string;
}

class ClientCache {
  private memoryCache = new Map<string, CacheEntry>();
  private defaultTTL = 5 * 60 * 1000; // 5分
  private defaultPrefix = 'ec_cache_';

  /**
   * キャッシュからデータを取得
   */
  get<T = any>(key: string, options: CacheOptions = {}): T | null {
    const { persist = false, prefix = this.defaultPrefix } = options;
    const cacheKey = `${prefix}${key}`;

    // メモリキャッシュから取得
    const memoryEntry = this.memoryCache.get(cacheKey);
    if (memoryEntry && this.isValid(memoryEntry)) {
      return memoryEntry.data;
    }

    // localStorageから取得（persist=trueの場合）
    if (persist && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(cacheKey);
        if (stored) {
          const entry: CacheEntry<T> = JSON.parse(stored);
          if (this.isValid(entry)) {
            // メモリキャッシュにも追加
            this.memoryCache.set(cacheKey, entry);
            return entry.data;
          } else {
            // 期限切れのデータを削除
            localStorage.removeItem(cacheKey);
          }
        }
      } catch (error) {
        console.warn('Cache get error:', error);
      }
    }

    // 期限切れのメモリキャッシュを削除
    if (memoryEntry) {
      this.memoryCache.delete(cacheKey);
    }

    return null;
  }

  /**
   * キャッシュにデータを保存
   */
  set<T = any>(key: string, data: T, options: CacheOptions = {}): void {
    const {
      ttl = this.defaultTTL,
      persist = false,
      prefix = this.defaultPrefix,
    } = options;
    const cacheKey = `${prefix}${key}`;
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl,
    };

    // メモリキャッシュに保存
    this.memoryCache.set(cacheKey, entry);

    // localStorageに保存（persist=trueの場合）
    if (persist && typeof window !== 'undefined') {
      try {
        localStorage.setItem(cacheKey, JSON.stringify(entry));
      } catch (error) {
        console.warn('Cache set error:', error);
      }
    }
  }

  /**
   * キャッシュを削除
   */
  delete(key: string, options: CacheOptions = {}): void {
    const { persist = false, prefix = this.defaultPrefix } = options;
    const cacheKey = `${prefix}${key}`;

    // メモリキャッシュから削除
    this.memoryCache.delete(cacheKey);

    // localStorageから削除
    if (persist && typeof window !== 'undefined') {
      try {
        localStorage.removeItem(cacheKey);
      } catch (error) {
        console.warn('Cache delete error:', error);
      }
    }
  }

  /**
   * パターンに一致するキャッシュを削除
   */
  deletePattern(pattern: string, options: CacheOptions = {}): void {
    const { persist = false, prefix = this.defaultPrefix } = options;
    const regex = new RegExp(pattern);

    // メモリキャッシュから削除
    for (const key of this.memoryCache.keys()) {
      if (key.startsWith(prefix) && regex.test(key.replace(prefix, ''))) {
        this.memoryCache.delete(key);
      }
    }

    // localStorageから削除
    if (persist && typeof window !== 'undefined') {
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (
            key &&
            key.startsWith(prefix) &&
            regex.test(key.replace(prefix, ''))
          ) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
      } catch (error) {
        console.warn('Cache deletePattern error:', error);
      }
    }
  }

  /**
   * 全キャッシュをクリア
   */
  clear(options: CacheOptions = {}): void {
    const { persist = false, prefix = this.defaultPrefix } = options;

    // メモリキャッシュをクリア
    for (const key of this.memoryCache.keys()) {
      if (key.startsWith(prefix)) {
        this.memoryCache.delete(key);
      }
    }

    // localStorageをクリア
    if (persist && typeof window !== 'undefined') {
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(prefix)) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
      } catch (error) {
        console.warn('Cache clear error:', error);
      }
    }
  }

  /**
   * 期限切れキャッシュを削除
   */
  cleanup(): void {
    const now = Date.now();

    // メモリキャッシュの期限切れエントリを削除
    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.expiry < now) {
        this.memoryCache.delete(key);
      }
    }

    // localStorageの期限切れエントリを削除
    if (typeof window !== 'undefined') {
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(this.defaultPrefix)) {
            try {
              const stored = localStorage.getItem(key);
              if (stored) {
                const entry: CacheEntry = JSON.parse(stored);
                if (entry.expiry < now) {
                  keysToRemove.push(key);
                }
              }
            } catch {
              // 無効なJSONは削除
              keysToRemove.push(key);
            }
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
      } catch (error) {
        console.warn('Cache cleanup error:', error);
      }
    }
  }

  /**
   * キャッシュエントリが有効かチェック
   */
  private isValid(entry: CacheEntry): boolean {
    return entry.expiry > Date.now();
  }

  /**
   * キャッシュ統計を取得
   */
  getStats() {
    const memorySize = this.memoryCache.size;
    let persistentSize = 0;

    if (typeof window !== 'undefined') {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.defaultPrefix)) {
          persistentSize++;
        }
      }
    }

    return {
      memorySize,
      persistentSize,
    };
  }
}

// シングルトンインスタンス
export const cache = new ClientCache();

/**
 * APIレスポンス用の便利メソッド
 */
export const apiCache = {
  /** 商品リスト用キャッシュ（30秒） */
  products: {
    get: (key: string) => cache.get(`products_${key}`, { ttl: 30 * 1000 }),
    set: (key: string, data: any) =>
      cache.set(`products_${key}`, data, { ttl: 30 * 1000 }),
    delete: (key: string) => cache.delete(`products_${key}`),
    deleteAll: () => cache.deletePattern('^products_'),
  },

  /** 商品詳細用キャッシュ（5分） */
  productDetail: {
    get: (id: string) => cache.get(`product_${id}`, { ttl: 5 * 60 * 1000 }),
    set: (id: string, data: any) =>
      cache.set(`product_${id}`, data, { ttl: 5 * 60 * 1000 }),
    delete: (id: string) => cache.delete(`product_${id}`),
    deleteAll: () => cache.deletePattern('^product_'),
  },

  /** カテゴリ用キャッシュ（30分） */
  categories: {
    get: () => cache.get('categories', { ttl: 30 * 60 * 1000 }),
    set: (data: any) => cache.set('categories', data, { ttl: 30 * 60 * 1000 }),
    delete: () => cache.delete('categories'),
  },

  /** 検索結果用キャッシュ（1分） */
  search: {
    get: (query: string) =>
      cache.get(`search_${encodeURIComponent(query)}`, { ttl: 60 * 1000 }),
    set: (query: string, data: any) =>
      cache.set(`search_${encodeURIComponent(query)}`, data, {
        ttl: 60 * 1000,
      }),
    deleteAll: () => cache.deletePattern('^search_'),
  },
};

// 定期的なクリーンアップ（10分ごと）
if (typeof window !== 'undefined') {
  setInterval(
    () => {
      cache.cleanup();
    },
    10 * 60 * 1000
  );
}
