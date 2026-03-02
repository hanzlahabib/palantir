import { Router, type Request, type Response } from "express";
import { getCached, setCache, generateCacheKey } from "../cache.js";
import { withCircuitBreaker } from "../circuitBreaker.js";

const router = Router();
const CACHE_TTL = 30;

interface CityFeed {
    name: string;
    feedUrl: string;
    parseCamera: (item: Record<string, unknown>, index: number) => CameraInfo | null;
}

interface CameraInfo {
    id: string;
    name: string;
    lat: number;
    lon: number;
    imageUrl: string;
}

const CITY_FEEDS: Record<string, CityFeed> = {
    austin: {
        name: "Austin, TX",
        feedUrl: "https://data.austintexas.gov/resource/b4k4-adkb.json?$limit=100",
        parseCamera: (item, index) => {
            const lat = Number(item.location_latitude || item.latitude);
            const lon = Number(item.location_longitude || item.longitude);
            if (!lat || !lon) return null;
            return {
                id: `austin-${index}`,
                name: (item.location_name as string) || (item.signal_id as string) || `Austin Cam ${index}`,
                lat,
                lon,
                imageUrl: (item.camera_url as string) || (item.camera_image_url as string) || "",
            };
        },
    },
    nyc: {
        name: "New York City",
        feedUrl: "https://webcams.nyctmc.org/api/cameras/",
        parseCamera: (item, index) => {
            const lat = Number(item.latitude);
            const lon = Number(item.longitude);
            if (!lat || !lon) return null;
            return {
                id: (item.id as string) || `nyc-${index}`,
                name: (item.name as string) || `NYC Cam ${index}`,
                lat,
                lon,
                imageUrl: (item.imageUrl as string) || (item.url as string) || "",
            };
        },
    },
    london: {
        name: "London",
        feedUrl: "https://api.tfl.gov.uk/Place/Type/JamCam",
        parseCamera: (item, index) => {
            const lat = Number(item.lat);
            const lon = Number(item.lon);
            if (!lat || !lon) return null;
            const props = (item.additionalProperties as Record<string, unknown>[]) || [];
            const imgProp = props.find?.((p: Record<string, unknown>) => p.key === "imageUrl");
            return {
                id: (item.id as string) || `london-${index}`,
                name: (item.commonName as string) || `London Cam ${index}`,
                lat,
                lon,
                imageUrl: (imgProp?.value as string) || "",
            };
        },
    },
};

router.get("/cities", (_req: Request, res: Response) => {
    res.json(Object.entries(CITY_FEEDS).map(([id, info]) => ({ id, name: info.name })));
});

router.get("/:city", async (req: Request, res: Response) => {
    const { city } = req.params;
    const feed = CITY_FEEDS[city];
    if (!feed) {
        res.status(404).json({ error: `Unknown city: ${city}`, code: 404 });
        return;
    }

    const cacheKey = generateCacheKey(`/api/cctv/${city}`);
    const cached = getCached(cacheKey);
    if (cached) { res.json(cached); return; }

    try {
        const rawData = await withCircuitBreaker(
            async () => {
                const resp = await fetch(feed.feedUrl);
                if (!resp.ok) throw new Error(`CCTV ${city} HTTP ${resp.status}`);
                return resp.json();
            },
            { name: `cctv-${city}` }
        );

        const items = Array.isArray(rawData) ? rawData : [];
        const cameras = items
            .map((item: Record<string, unknown>, i: number) => feed.parseCamera(item, i))
            .filter((c: CameraInfo | null): c is CameraInfo => c !== null && c.lat !== 0);

        const result = { cameras, total: cameras.length, city: feed.name };
        setCache(cacheKey, result, CACHE_TTL);
        res.json(result);
    } catch {
        const stale = getCached(cacheKey);
        if (stale) { res.json(stale); return; }
        res.status(502).json({ error: `CCTV feed ${city} unavailable`, code: 502 });
    }
});

// Image proxy endpoint — proxies camera JPEG feeds to avoid CORS issues
router.get("/:city/:cameraId/image", async (req: Request, res: Response) => {
    const { city, cameraId } = req.params;
    const feed = CITY_FEEDS[city];
    if (!feed) { res.status(404).json({ error: "Unknown city" }); return; }

    // Get cached camera list to find the image URL
    const cacheKey = generateCacheKey(`/api/cctv/${city}`);
    const cached = getCached(cacheKey) as { cameras: CameraInfo[] } | undefined;
    if (!cached?.cameras) { res.status(404).json({ error: "Camera list not cached" }); return; }

    const cam = cached.cameras.find((c) => c.id === cameraId);
    if (!cam?.imageUrl) { res.status(404).json({ error: "Camera not found" }); return; }

    try {
        const imgResp = await fetch(cam.imageUrl);
        if (!imgResp.ok) throw new Error(`Image fetch failed: ${imgResp.status}`);

        const contentType = imgResp.headers.get("content-type") || "image/jpeg";
        res.setHeader("Content-Type", contentType);
        res.setHeader("Cache-Control", "public, max-age=30");

        const buffer = Buffer.from(await imgResp.arrayBuffer());
        res.send(buffer);
    } catch {
        res.status(502).json({ error: "Image proxy failed" });
    }
});

export default router;
