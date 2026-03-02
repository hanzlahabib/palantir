import { Router } from "express";
import { getCached, setCache, generateCacheKey } from "../cache.js";
import { withCircuitBreaker } from "../circuitBreaker.js";

const router = Router();
const CACHE_TTL = 30;

const CITY_FEEDS: Record<string, { name: string; feedUrl: string }> = {
    austin: {
        name: "Austin, TX",
        feedUrl: "https://data.austintexas.gov/resource/b4k4-adkb.json?$limit=100",
    },
    nyc: {
        name: "New York City",
        feedUrl: "https://webcams.nyctmc.org/api/cameras/",
    },
    london: {
        name: "London",
        feedUrl: "https://api.tfl.gov.uk/Place/Type/JamCam",
    },
};

router.get("/cities", (_req, res) => {
    res.json(Object.entries(CITY_FEEDS).map(([id, info]) => ({ id, name: info.name })));
});

router.get("/:city", async (req, res) => {
    const { city } = req.params;
    const feed = CITY_FEEDS[city];
    if (!feed) {
        return res.status(404).json({ error: `Unknown city: ${city}`, code: 404 });
    }

    const cacheKey = generateCacheKey(`/api/cctv/${city}`);
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);

    try {
        const data = await withCircuitBreaker(
            async () => {
                const resp = await fetch(feed.feedUrl);
                if (!resp.ok) throw new Error(`CCTV ${city} HTTP ${resp.status}`);
                return resp.json();
            },
            { name: `cctv-${city}` }
        );

        setCache(cacheKey, data, CACHE_TTL);
        res.json(data);
    } catch (err) {
        const stale = getCached(cacheKey);
        if (stale) return res.json(stale);
        res.status(502).json({ error: `CCTV feed ${city} unavailable`, code: 502 });
    }
});

export default router;
