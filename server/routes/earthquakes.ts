import { Router } from "express";
import { getCached, setCache, generateCacheKey } from "../cache.js";
import { rateLimitedFetch } from "../rateLimiter.js";
import { withCircuitBreaker } from "../circuitBreaker.js";

const router = Router();
const CACHE_TTL = 60;

// All earthquakes, past day
router.get("/", async (req, res) => {
    const feed = (req.query.feed as string) || "all_day";
    const feedMap: Record<string, string> = {
        all_hour: "all_hour",
        all_day: "all_day",
        all_week: "all_week",
        all_month: "all_month",
        significant_day: "significant_day",
        significant_week: "significant_week",
        "4.5_day": "4.5_day",
        "2.5_day": "2.5_day",
        "1.0_day": "1.0_day",
    };

    const feedPath = feedMap[feed] || "all_day";
    const cacheKey = generateCacheKey("/api/earthquakes", { feed: feedPath });
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);

    try {
        const data = await rateLimitedFetch("usgs", () =>
            withCircuitBreaker(
                async () => {
                    const resp = await fetch(`https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/${feedPath}.geojson`);
                    if (!resp.ok) throw new Error(`USGS HTTP ${resp.status}`);
                    return resp.json();
                },
                { name: "usgs" }
            )
        );

        setCache(cacheKey, data, CACHE_TTL);
        res.json(data);
    } catch (err) {
        const stale = getCached(cacheKey);
        if (stale) return res.json(stale);
        res.status(502).json({ error: "USGS unavailable", code: 502 });
    }
});

export default router;
