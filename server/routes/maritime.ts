import { Router } from "express";
import { getCached, setCache, generateCacheKey } from "../cache.js";
import { rateLimitedFetch } from "../rateLimiter.js";
import { withCircuitBreaker } from "../circuitBreaker.js";

const router = Router();

// Maritime AIS placeholder — actual WebSocket relay is handled in server/websocket.ts
// This route returns current vessel snapshot from cache
router.get("/", async (_req, res) => {
    const cacheKey = generateCacheKey("/api/maritime");
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);

    // No polling endpoint for AIS — data comes via WebSocket
    // Return empty array until WebSocket data is cached
    res.json({ vessels: [], message: "AIS data available via WebSocket /ws subscription to 'maritime' channel" });
});

// NASA EONET natural events
router.get("/events", async (_req, res) => {
    const cacheKey = generateCacheKey("/api/events");
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);

    try {
        const data = await rateLimitedFetch("eonet", () =>
            withCircuitBreaker(
                async () => {
                    const resp = await fetch("https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=50");
                    if (!resp.ok) throw new Error(`EONET HTTP ${resp.status}`);
                    return resp.json();
                },
                { name: "eonet" }
            )
        );

        setCache(cacheKey, data, 15 * 60);
        res.json(data);
    } catch (err) {
        const stale = getCached(cacheKey);
        if (stale) return res.json(stale);
        res.status(502).json({ error: "EONET unavailable", code: 502 });
    }
});

export default router;
