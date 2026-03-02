import { Router } from "express";
import { getCached, setCache, generateCacheKey } from "../cache.js";
import { rateLimitedFetch } from "../rateLimiter.js";
import { withCircuitBreaker } from "../circuitBreaker.js";

const router = Router();
const CACHE_TTL = 60 * 60; // 1 hour

router.get("/", async (req, res) => {
    const apiKey = process.env.ACLED_API_KEY;
    const email = process.env.ACLED_EMAIL;

    const cacheKey = generateCacheKey("/api/conflicts");
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);

    try {
        // Try ACLED first (requires API key)
        if (apiKey && email) {
            const data = await rateLimitedFetch("acled", () =>
                withCircuitBreaker(
                    async () => {
                        const limit = (req.query.limit as string) || "500";
                        const params = new URLSearchParams({
                            key: apiKey,
                            email,
                            limit,
                            event_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
                            event_date_where: ">=",
                        });
                        const resp = await fetch(`https://api.acleddata.com/acled/read?${params}`);
                        if (!resp.ok) throw new Error(`ACLED HTTP ${resp.status}`);
                        return resp.json();
                    },
                    { name: "acled" }
                )
            );

            setCache(cacheKey, data, CACHE_TTL);
            return res.json(data);
        }

        // Fallback: UCDP (no auth required)
        const data = await rateLimitedFetch("acled", () =>
            withCircuitBreaker(
                async () => {
                    const resp = await fetch("https://ucdpapi.pcr.uu.se/api/gedevents/24.1?pagesize=500");
                    if (!resp.ok) throw new Error(`UCDP HTTP ${resp.status}`);
                    return resp.json();
                },
                { name: "ucdp" }
            )
        );

        setCache(cacheKey, data, CACHE_TTL);
        res.json(data);
    } catch (err) {
        const stale = getCached(cacheKey);
        if (stale) return res.json(stale);
        res.status(502).json({ error: "Conflict data unavailable", code: 502 });
    }
});

export default router;
