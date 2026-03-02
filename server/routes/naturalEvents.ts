import { Router, type Request, type Response } from "express";
import { getCached, setCache, generateCacheKey } from "../cache.js";
import { withCircuitBreaker } from "../circuitBreaker.js";

const router = Router();
const CACHE_TTL = 900; // 15 minutes

router.get("/", async (_req: Request, res: Response) => {
    const cacheKey = generateCacheKey("/api/natural-events");
    const cached = getCached(cacheKey);
    if (cached) { res.json(cached); return; }

    try {
        const data = await withCircuitBreaker(
            async () => {
                const resp = await fetch("https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=50");
                if (!resp.ok) throw new Error(`EONET HTTP ${resp.status}`);
                return resp.json();
            },
            { name: "eonet" }
        );

        setCache(cacheKey, data, CACHE_TTL);
        res.json(data);
    } catch {
        const stale = getCached(cacheKey);
        if (stale) { res.json(stale); return; }
        res.status(502).json({ error: "EONET feed unavailable", code: 502 });
    }
});

export default router;
