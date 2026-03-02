import NodeCache from "node-cache";

interface CacheEntry<T = unknown> {
    data: T;
    fetchedAt: number;
    stale: boolean;
}

const cache = new NodeCache({ stdTTL: 60, checkperiod: 30 });
const staleStore = new Map<string, CacheEntry>();

export function getCached<T>(key: string): T | null {
    const entry = cache.get<CacheEntry<T>>(key);
    if (entry) return entry.data;

    // Stale-while-revalidate: return stale data if available
    const stale = staleStore.get(key) as CacheEntry<T> | undefined;
    if (stale) return stale.data;

    return null;
}

export function setCache<T>(key: string, data: T, ttlSeconds: number): void {
    const entry: CacheEntry<T> = {
        data,
        fetchedAt: Date.now(),
        stale: false,
    };
    cache.set(key, entry, ttlSeconds);
    staleStore.set(key, entry as CacheEntry);
}

export function getStale<T>(key: string): T | null {
    const entry = staleStore.get(key) as CacheEntry<T> | undefined;
    return entry ? entry.data : null;
}

export function invalidate(key: string): void {
    cache.del(key);
    staleStore.delete(key);
}

export function cacheStats() {
    const stats = cache.getStats();
    return {
        keys: cache.keys().length,
        hits: stats.hits,
        misses: stats.misses,
        staleEntries: staleStore.size,
    };
}

export function generateCacheKey(route: string, params?: Record<string, string>): string {
    if (!params || Object.keys(params).length === 0) return route;
    const sorted = Object.entries(params).sort(([a], [b]) => a.localeCompare(b));
    return `${route}:${sorted.map(([k, v]) => `${k}=${v}`).join("&")}`;
}
