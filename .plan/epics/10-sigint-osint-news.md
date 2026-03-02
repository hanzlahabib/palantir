# Epic 10: SIGINT & OSINT News Intelligence Layer

## Priority: HIGH (situational awareness)
## Dependencies: Epic 16 (Backend)
## Blocks: Epic 15 (Fusion)
## Estimated Effort: 2 days
## Parallelizable With: Epic 03, 04, 07

---

## Objective
Aggregate intelligence from GDELT, RSS feeds, and Telegram OSINT channels. Geocode events, classify threats, and display on the globe with a scrolling alert ticker.

## Data Sources
- **GDELT DOC API**: `https://api.gdeltproject.org/api/v2/doc/doc?query=...` (free, no auth)
- **GDELT GEO API**: `https://api.gdeltproject.org/api/v2/geo/geo?query=...` (free, no auth)
- **RSS Feeds**: 50+ sources adapted from worldmonitor (free)
- See `00-DATA-FEEDS.md` Feeds #15, #27, #28

## Tasks

### 10.1 GDELT Intelligence Service
- Backend route: `GET /api/intel?topic=military&format=artlist`
- Pre-defined intelligence topics (from worldmonitor):
  - Military Activity, Cyber Threats, Nuclear, Sanctions, Terrorism, Political Unrest, Maritime Security
- Each topic has a GDELT query string
- Cache 5 minutes

### 10.2 GDELT GeoJSON Service
- Backend route: `GET /api/intel/geo?query=...`
- Returns geocoded event markers
- Cache 5 minutes

### 10.3 RSS News Aggregation
- Backend route: `GET /api/news?tier=1,2`
- Aggregate from tiered RSS sources
- Source tiers: T1 (wire/gov), T2 (major outlets), T3 (specialty)
- Parse RSS/XML with fast-xml-parser
- Cache 5 minutes

### 10.4 Threat Classification
Port from worldmonitor `src/services/threat-classifier.ts`:
- Classify articles by severity: CRITICAL, HIGH, MEDIUM, LOW, INFO
- Keyword-based scoring (explosion, attack, nuclear, sanctions, etc.)
- Color mapping for each level

### 10.5 Globe Visualization
- Geocoded events as pulsing markers on globe
- Color by threat level (red=critical, orange=high, yellow=medium, green=low, blue=info)
- Size by source count (more sources covering = bigger marker)
- Click marker -> article list + summary

### 10.6 Alert Feed Ticker
- `src/hud/AlertFeed.tsx` — Scrolling headline ticker at bottom of HUD
- Shows latest CRITICAL/HIGH events
- Auto-scrolls with configurable speed
- Click headline -> jump to location + open detail panel

### 10.7 News Clustering
Port from worldmonitor `src/services/clustering.ts`:
- Group articles about same event (deduplicate)
- Show "12 sources reporting" count
- Primary headline from highest-tier source

## Files Created
- `src/services/gdeltService.ts` — GDELT API integration
- `src/services/newsService.ts` — RSS aggregation + classification
- `src/layers/IntelLayer.tsx` — Globe event markers
- `src/hud/AlertFeed.tsx` — Scrolling headline ticker
- `server/routes/gdelt.ts` — GDELT proxy
- `server/routes/news.ts` — RSS proxy

## Worldmonitor Reference (PORT THESE)
- `src/services/gdelt-intel.ts` — GDELT query patterns + topic definitions
- `src/services/threat-classifier.ts` — Threat level classification
- `src/services/clustering.ts` — Event deduplication
- `src/services/live-news.ts` — RSS processing
- `src/config/feeds.ts` — Feed definitions with tiers

## Acceptance Criteria
- [ ] GDELT events appear as markers on globe at correct locations
- [ ] Markers colored by threat level
- [ ] Alert ticker scrolls latest headlines
- [ ] Click event -> see article list from multiple sources
- [ ] Threat classification produces sensible results
- [ ] News clustering deduplicates same-event coverage
