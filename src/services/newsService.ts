const API_BASE = "/api";

export interface NewsArticle {
  id: string;
  title: string;
  link: string;
  source: string;
  tier: number;
  pubDate: string;
  description: string;
}

export interface NewsFeed {
  name: string;
  url: string;
  tier: 1 | 2 | 3;
  category: string;
}

export async function fetchNews(): Promise<NewsArticle[]> {
  const resp = await fetch(`${API_BASE}/news`);
  if (!resp.ok) throw new Error(`News fetch failed: ${resp.status}`);
  const data = await resp.json();
  return (data.articles || []).map((a: Record<string, unknown>, i: number) => ({
    id: (a.link as string) || String(i),
    title: (a.title as string) || "",
    link: (a.link as string) || "",
    source: (a.source as string) || "",
    tier: (a.tier as number) || 3,
    pubDate: (a.pubDate as string) || "",
    description: (a.description as string) || "",
  }));
}

export function getSourceColor(tier: number): string {
  switch (tier) {
    case 1: return "#ff6600";
    case 2: return "#00ffff";
    default: return "#666666";
  }
}

export function isBreaking(article: NewsArticle): boolean {
  const lower = article.title.toLowerCase();
  return lower.includes("breaking") || lower.includes("urgent") || lower.includes("alert");
}
