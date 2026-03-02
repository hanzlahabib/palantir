import { Router } from "express";
import { getCached, setCache, generateCacheKey } from "../cache.js";
import { rateLimitedFetch } from "../rateLimiter.js";
import { withCircuitBreaker } from "../circuitBreaker.js";

const router = Router();
const CACHE_TTL = 5 * 60; // 5 minutes

// GDELT DOC API
router.get("/", async (req, res) => {
    const query = (req.query.q as string) || "conflict OR military OR terrorism";
    const mode = (req.query.mode as string) || "artlist";
    const maxrecords = (req.query.maxrecords as string) || "50";

    const cacheKey = generateCacheKey("/api/gdelt", { q: query, mode, maxrecords });
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);

    try {
        const data = await rateLimitedFetch("gdelt", () =>
            withCircuitBreaker(
                async () => {
                    const params = new URLSearchParams({
                        query,
                        mode,
                        maxrecords,
                        format: "json",
                    });
                    const resp = await fetch(`https://api.gdeltproject.org/api/v2/doc/doc?${params}`);
                    if (!resp.ok) throw new Error(`GDELT HTTP ${resp.status}`);
                    return resp.json();
                },
                { name: "gdelt" }
            )
        );

        setCache(cacheKey, data, CACHE_TTL);
        res.json(data);
    } catch (err) {
        const stale = getCached(cacheKey);
        if (stale) return res.json(stale);
        res.status(502).json({ error: "GDELT unavailable", code: 502 });
    }
});

// GDELT GEO API (geocoded events)
router.get("/geo", async (req, res) => {
    const query = (req.query.q as string) || "conflict";

    const cacheKey = generateCacheKey("/api/gdelt/geo", { q: query });
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);

    try {
        const data = await rateLimitedFetch("gdelt", () =>
            withCircuitBreaker(
                async () => {
                    const params = new URLSearchParams({
                        query,
                        mode: "pointdata",
                        format: "geojson",
                    });
                    const resp = await fetch(`https://api.gdeltproject.org/api/v2/geo/geo?${params}`);
                    if (!resp.ok) throw new Error(`GDELT GEO HTTP ${resp.status}`);
                    return resp.json();
                },
                { name: "gdelt" }
            )
        );

        setCache(cacheKey, data, CACHE_TTL);
        res.json(data);
    } catch (err) {
        const stale = getCached(cacheKey);
        if (stale) return res.json(stale);
        res.status(502).json({ error: "GDELT GEO unavailable", code: 502 });
    }
});

export default router;
