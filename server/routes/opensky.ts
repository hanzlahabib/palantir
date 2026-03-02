import { Router } from "express";
import { getCached, setCache, generateCacheKey } from "../cache.js";
import { rateLimitedFetch } from "../rateLimiter.js";
import { withCircuitBreaker } from "../circuitBreaker.js";

const router = Router();
const CACHE_TTL = 10;

router.get("/", async (req, res) => {
    const { lamin, lamax, lomin, lomax } = req.query;
    const params: Record<string, string> = {};
    if (lamin) params.lamin = String(lamin);
    if (lamax) params.lamax = String(lamax);
    if (lomin) params.lomin = String(lomin);
    if (lomax) params.lomax = String(lomax);

    const cacheKey = generateCacheKey("/api/flights", params);
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);

    try {
        const data = await rateLimitedFetch("opensky", () =>
            withCircuitBreaker(
                async () => {
                    let url = "https://opensky-network.org/api/states/all";
                    const qs = new URLSearchParams(params).toString();
                    if (qs) url += `?${qs}`;

                    const headers: Record<string, string> = {};
                    const username = process.env.OPENSKY_USERNAME;
                    const password = process.env.OPENSKY_PASSWORD;
                    if (username && password) {
                        headers.Authorization = `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
                    }

                    const resp = await fetch(url, { headers });
                    if (!resp.ok) throw new Error(`OpenSky HTTP ${resp.status}`);
                    return resp.json();
                },
                { name: "opensky" }
            )
        );

        setCache(cacheKey, data, CACHE_TTL);
        res.json(data);
    } catch (err) {
        const stale = getCached(cacheKey);
        if (stale) return res.json(stale);
        res.status(502).json({ error: "OpenSky unavailable", code: 502 });
    }
});

export default router;
