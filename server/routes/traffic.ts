import { Router } from "express";
import { getCached, setCache, generateCacheKey } from "../cache.js";
import { rateLimitedFetch } from "../rateLimiter.js";
import { withCircuitBreaker } from "../circuitBreaker.js";

const router = Router();
const CACHE_TTL = 24 * 60 * 60; // 24 hours (roads don't change often)

router.get("/", async (req, res) => {
    const { south, west, north, east } = req.query;
    if (!south || !west || !north || !east) {
        return res.status(400).json({ error: "Bounding box required: south, west, north, east", code: 400 });
    }

    const bbox = `${south},${west},${north},${east}`;
    const cacheKey = generateCacheKey("/api/roads", { bbox });
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);

    try {
        const data = await rateLimitedFetch("overpass", () =>
            withCircuitBreaker(
                async () => {
                    const query = `[out:json][timeout:30];way["highway"~"^(motorway|trunk|primary|secondary)$"](${bbox});(._;>;);out body;`;
                    const resp = await fetch("https://overpass-api.de/api/interpreter", {
                        method: "POST",
                        headers: { "Content-Type": "application/x-www-form-urlencoded" },
                        body: `data=${encodeURIComponent(query)}`,
                    });
                    if (!resp.ok) throw new Error(`Overpass HTTP ${resp.status}`);
                    return resp.json();
                },
                { name: "overpass" }
            )
        );

        setCache(cacheKey, data, CACHE_TTL);
        res.json(data);
    } catch (err) {
        const stale = getCached(cacheKey);
        if (stale) return res.json(stale);
        res.status(502).json({ error: "Overpass API unavailable", code: 502 });
    }
});

export default router;
