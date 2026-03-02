import { Router, type Request, type Response } from "express";
import { getCached, setCache } from "../cache.js";
import { getQueue } from "../rateLimiter.js";

const router = Router();
const CACHE_TTL = 900; // 15 minutes

router.get("/", async (req: Request, res: Response) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
      res.status(400).json({ error: "lat and lon query params required" });
      return;
    }

    const cacheKey = `weather:${lat}:${lon}`;
    const cached = getCached(cacheKey);
    if (cached) {
      res.json(cached);
      return;
    }

    const queue = getQueue("opensky"); // reuse a general queue
    const data = await queue.add(async () => {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,precipitation,weather_code,is_day`;
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`Open-Meteo: ${resp.status}`);
      return resp.json();
    });

    setCache(cacheKey, data, CACHE_TTL);
    res.json(data);
  } catch (err) {
    console.error("Weather fetch error:", err);
    res.status(502).json({ error: "Weather data unavailable" });
  }
});

export default router;
