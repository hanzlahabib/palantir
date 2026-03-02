import { Router } from "express";
import { getCached, setCache, generateCacheKey } from "../cache.js";
import { rateLimitedFetch } from "../rateLimiter.js";
import { withCircuitBreaker } from "../circuitBreaker.js";
import { XMLParser } from "fast-xml-parser";

const router = Router();
const CACHE_TTL = 5 * 60; // 5 minutes

const RSS_FEEDS = [
    // Tier 1: Wire Services
    { id: "reuters", name: "Reuters", url: "https://feeds.reuters.com/reuters/topNews", tier: 1 },
    { id: "bbc", name: "BBC World", url: "https://feeds.bbci.co.uk/news/world/rss.xml", tier: 1 },
    // Tier 2: Defense & Security
    { id: "defenseone", name: "Defense One", url: "https://www.defenseone.com/rss/", tier: 2 },
    // Tier 3: OSINT
    { id: "bellingcat", name: "Bellingcat", url: "https://www.bellingcat.com/feed/", tier: 3 },
];

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });

router.get("/", async (_req, res) => {
    const cacheKey = generateCacheKey("/api/news");
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);

    try {
        const results = await Promise.allSettled(
            RSS_FEEDS.map((feed) =>
                rateLimitedFetch("rss", () =>
                    withCircuitBreaker(
                        async () => {
                            const resp = await fetch(feed.url, { signal: AbortSignal.timeout(10_000) });
                            if (!resp.ok) throw new Error(`RSS ${feed.id} HTTP ${resp.status}`);
                            const xml = await resp.text();
                            const parsed = parser.parse(xml);
                            const items = parsed?.rss?.channel?.item || parsed?.feed?.entry || [];
                            return {
                                source: feed.id,
                                name: feed.name,
                                tier: feed.tier,
                                articles: (Array.isArray(items) ? items : [items]).slice(0, 10).map((item: any) => ({
                                    title: item.title || "",
                                    link: item.link?.["@_href"] || item.link || "",
                                    pubDate: item.pubDate || item.published || item.updated || "",
                                    description: (item.description || item.summary || "").slice(0, 200),
                                })),
                            };
                        },
                        { name: `rss-${feed.id}` }
                    )
                )
            )
        );

        const feeds = results
            .filter((r): r is PromiseFulfilledResult<any> => r.status === "fulfilled")
            .map((r) => r.value);

        setCache(cacheKey, feeds, CACHE_TTL);
        res.json(feeds);
    } catch (err) {
        res.status(502).json({ error: "News feeds unavailable", code: 502 });
    }
});

router.get("/sources", (_req, res) => {
    res.json(RSS_FEEDS.map(({ id, name, tier }) => ({ id, name, tier })));
});

export default router;
