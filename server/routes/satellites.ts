import { Router } from "express";
import { getCached, setCache, generateCacheKey } from "../cache.js";
import { rateLimitedFetch } from "../rateLimiter.js";
import { withCircuitBreaker } from "../circuitBreaker.js";

const router = Router();
const CACHE_TTL = 4 * 60 * 60; // 4 hours

router.get("/tle", async (_req, res) => {
    const cacheKey = generateCacheKey("/api/satellites/tle");
    const cached = getCached<string>(cacheKey);
    if (cached) return res.type("text/plain").send(cached);

    try {
        const data = await rateLimitedFetch("celestrak", () =>
            withCircuitBreaker(
                async () => {
                    const resp = await fetch("https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle");
                    if (!resp.ok) throw new Error(`CelesTrak HTTP ${resp.status}`);
                    return resp.text();
                },
                { name: "celestrak" }
            )
        );

        setCache(cacheKey, data, CACHE_TTL);
        res.type("text/plain").send(data);
    } catch (err) {
        const stale = getCached<string>(cacheKey);
        if (stale) return res.type("text/plain").send(stale);
        res.status(502).json({ error: "CelesTrak unavailable", code: 502 });
    }
});

router.get("/categories", async (_req, res) => {
    const groups = ["stations", "visual", "active", "starlink", "gps-ops", "galileo", "beidou", "weather", "resource", "military"];
    res.json({ groups });
});

router.get("/tle/:group", async (req, res) => {
    const { group } = req.params;
    const cacheKey = generateCacheKey(`/api/satellites/tle/${group}`);
    const cached = getCached<string>(cacheKey);
    if (cached) return res.type("text/plain").send(cached);

    try {
        const data = await rateLimitedFetch("celestrak", () =>
            withCircuitBreaker(
                async () => {
                    const resp = await fetch(`https://celestrak.org/NORAD/elements/gp.php?GROUP=${group}&FORMAT=tle`);
                    if (!resp.ok) throw new Error(`CelesTrak HTTP ${resp.status}`);
                    return resp.text();
                },
                { name: "celestrak" }
            )
        );

        setCache(cacheKey, data, CACHE_TTL);
        res.type("text/plain").send(data);
    } catch (err) {
        const stale = getCached<string>(cacheKey);
        if (stale) return res.type("text/plain").send(stale);
        res.status(502).json({ error: "CelesTrak unavailable", code: 502 });
    }
});

export default router;
