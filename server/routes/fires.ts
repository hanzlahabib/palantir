import { Router } from "express";
import { getCached, setCache, generateCacheKey } from "../cache.js";
import { rateLimitedFetch } from "../rateLimiter.js";
import { withCircuitBreaker } from "../circuitBreaker.js";

const router = Router();
const CACHE_TTL = 15 * 60; // 15 minutes

router.get("/", async (_req, res) => {
    const mapKey = process.env.FIRMS_MAP_KEY;
    if (!mapKey) {
        return res.status(400).json({ error: "FIRMS_MAP_KEY not configured", code: 400 });
    }

    const cacheKey = generateCacheKey("/api/fires");
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);

    try {
        const data = await rateLimitedFetch("firms", () =>
            withCircuitBreaker(
                async () => {
                    const resp = await fetch(
                        `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${mapKey}/VIIRS_SNPP_NRT/world/1`
                    );
                    if (!resp.ok) throw new Error(`FIRMS HTTP ${resp.status}`);
                    const csv = await resp.text();
                    return parseFirmsCSV(csv);
                },
                { name: "firms" }
            )
        );

        setCache(cacheKey, data, CACHE_TTL);
        res.json(data);
    } catch (err) {
        const stale = getCached(cacheKey);
        if (stale) return res.json(stale);
        res.status(502).json({ error: "NASA FIRMS unavailable", code: 502 });
    }
});

function parseFirmsCSV(csv: string) {
    const lines = csv.trim().split("\n");
    if (lines.length < 2) return [];
    const headers = lines[0].split(",");
    const latIdx = headers.indexOf("latitude");
    const lonIdx = headers.indexOf("longitude");
    const frpIdx = headers.indexOf("frp");
    const dateIdx = headers.indexOf("acq_date");

    return lines.slice(1).map((line) => {
        const cols = line.split(",");
        return {
            lat: parseFloat(cols[latIdx]),
            lon: parseFloat(cols[lonIdx]),
            frp: parseFloat(cols[frpIdx] || "0"),
            date: cols[dateIdx] || "",
        };
    }).filter((f) => !isNaN(f.lat) && !isNaN(f.lon));
}

export default router;
