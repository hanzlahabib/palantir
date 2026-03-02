import PQueue from "p-queue";

interface RateLimitConfig {
    concurrency: number;
    intervalMs: number;
    intervalCap: number;
}

const UPSTREAM_LIMITS: Record<string, RateLimitConfig> = {
    opensky: { concurrency: 1, intervalMs: 10_000, intervalCap: 1 },
    adsb: { concurrency: 1, intervalMs: 15_000, intervalCap: 1 },
    celestrak: { concurrency: 1, intervalMs: 360_000, intervalCap: 1 },
    usgs: { concurrency: 1, intervalMs: 60_000, intervalCap: 1 },
    firms: { concurrency: 1, intervalMs: 120_000, intervalCap: 1 },
    gdelt: { concurrency: 1, intervalMs: 5_000, intervalCap: 1 },
    overpass: { concurrency: 1, intervalMs: 30_000, intervalCap: 1 },
    acled: { concurrency: 1, intervalMs: 360_000, intervalCap: 1 },
    eonet: { concurrency: 1, intervalMs: 60_000, intervalCap: 1 },
    cctv: { concurrency: 2, intervalMs: 30_000, intervalCap: 2 },
    rss: { concurrency: 2, intervalMs: 5_000, intervalCap: 2 },
};

const queues = new Map<string, PQueue>();

function getQueue(upstream: string): PQueue {
    if (!queues.has(upstream)) {
        const config = UPSTREAM_LIMITS[upstream] ?? {
            concurrency: 1,
            intervalMs: 5_000,
            intervalCap: 1,
        };
        queues.set(
            upstream,
            new PQueue({
                concurrency: config.concurrency,
                interval: config.intervalMs,
                intervalCap: config.intervalCap,
            })
        );
    }
    return queues.get(upstream)!;
}

export async function rateLimitedFetch<T>(
    upstream: string,
    fetchFn: () => Promise<T>
): Promise<T> {
    const queue = getQueue(upstream);
    return queue.add(fetchFn, { throwOnTimeout: true }) as Promise<T>;
}

export function getQueueStats() {
    const stats: Record<string, { size: number; pending: number }> = {};
    for (const [name, queue] of queues) {
        stats[name] = { size: queue.size, pending: queue.pending };
    }
    return stats;
}
