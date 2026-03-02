export interface FeedDefinition {
  id: string;
  name: string;
  url: string;
  tier: 1 | 2 | 3;
  category: "wire" | "government" | "major" | "specialty" | "security" | "defense";
}

export const RSS_FEEDS: FeedDefinition[] = [
  // Tier 1 — Wire Services
  { id: "reuters", name: "Reuters", url: "https://feeds.reuters.com/reuters/topNews", tier: 1, category: "wire" },
  { id: "ap", name: "Associated Press", url: "https://rsshub.app/apnews/topics/apf-topnews", tier: 1, category: "wire" },

  // Tier 1 — Government
  { id: "whitehouse", name: "White House", url: "https://www.whitehouse.gov/feed/", tier: 1, category: "government" },
  { id: "state-dept", name: "State Dept", url: "https://www.state.gov/rss-feed/press-releases/feed/", tier: 1, category: "government" },
  { id: "dod", name: "Pentagon", url: "https://www.defense.gov/DesktopModules/ArticleCS/RSS.ashx?ContentType=1&Site=945", tier: 1, category: "government" },
  { id: "un-news", name: "UN News", url: "https://news.un.org/feed/subscribe/en/news/all/rss.xml", tier: 1, category: "government" },
  { id: "cisa", name: "CISA Alerts", url: "https://www.cisa.gov/cybersecurity-advisories/all.xml", tier: 1, category: "government" },

  // Tier 2 — Major Outlets
  { id: "bbc", name: "BBC World", url: "https://feeds.bbci.co.uk/news/world/rss.xml", tier: 2, category: "major" },
  { id: "aljazeera", name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml", tier: 2, category: "major" },
  { id: "guardian", name: "The Guardian", url: "https://www.theguardian.com/world/rss", tier: 2, category: "major" },

  // Tier 3 — Specialty
  { id: "defense-one", name: "Defense One", url: "https://www.defenseone.com/rss/", tier: 3, category: "defense" },
  { id: "war-zone", name: "The War Zone", url: "https://www.thedrive.com/the-war-zone/rss", tier: 3, category: "defense" },
  { id: "bellingcat", name: "Bellingcat", url: "https://www.bellingcat.com/feed/", tier: 3, category: "specialty" },
  { id: "krebs", name: "Krebs on Security", url: "https://krebsonsecurity.com/feed/", tier: 3, category: "security" },
  { id: "usni", name: "USNI News", url: "https://news.usni.org/feed", tier: 3, category: "defense" },
];

export function getFeedsByTier(tier: 1 | 2 | 3): FeedDefinition[] {
  return RSS_FEEDS.filter((f) => f.tier === tier);
}

export function getFeedsByCategory(category: FeedDefinition["category"]): FeedDefinition[] {
  return RSS_FEEDS.filter((f) => f.category === category);
}
