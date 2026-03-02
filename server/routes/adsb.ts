import { Router } from "express";
import { getCached, setCache, generateCacheKey } from "../cache.js";
import { rateLimitedFetch } from "../rateLimiter.js";
import { withCircuitBreaker } from "../circuitBreaker.js";

const router = Router();
const CACHE_TTL = 15;

// Primary: airplanes.live (free, no auth)
router.get("/", async (_req, res) => {
    const cacheKey = generateCacheKey("/api/military");
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);

    try {
        const data = await rateLimitedFetch("adsb", () =>
            withCircuitBreaker(
                async () => {
                    const resp = await fetch("https://api.airplanes.live/v2/mil");
                    if (!resp.ok) throw new Error(`airplanes.live HTTP ${resp.status}`);
                    return resp.json();
                },
                { name: "airplanes-live" }
            )
        );

        setCache(cacheKey, data, CACHE_TTL);
        res.json(data);
    } catch (err) {
        const stale = getCached(cacheKey);
        if (stale) return res.json(stale);
        res.status(502).json({ error: "Military feed unavailable", code: 502 });
    }
});

// By hex (specific aircraft)
router.get("/hex/:hex", async (req, res) => {
    const { hex } = req.params;
    const cacheKey = generateCacheKey(`/api/military/hex/${hex}`);
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);

    try {
        const data = await rateLimitedFetch("adsb", () =>
            withCircuitBreaker(
                async () => {
                    const resp = await fetch(`https://api.airplanes.live/v2/hex/${hex}`);
                    if (!resp.ok) throw new Error(`airplanes.live HTTP ${resp.status}`);
                    return resp.json();
                },
                { name: "airplanes-live" }
            )
        );

        setCache(cacheKey, data, CACHE_TTL);
        res.json(data);
    } catch (err) {
        res.status(502).json({ error: "Aircraft lookup failed", code: 502 });
    }
});

export default router;
