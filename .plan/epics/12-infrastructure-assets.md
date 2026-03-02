# Epic 12: Infrastructure & Critical Assets Layer

## Priority: LOW-MEDIUM
## Dependencies: Epic 01 (Globe)
## Blocks: Epic 15 (Fusion)
## Estimated Effort: 1 day
## Parallelizable With: Epic 09, 13

---

## Objective
Map critical infrastructure: military bases, nuclear facilities, submarine cables, pipelines, and data centers as static overlay layers.

## Data Sources
- **Submarine Cables**: TeleGeography GitHub GeoJSON (free, static)
- **Nuclear Facilities**: IAEA PRIS (static extract)
- **Military Bases**: OSINT curated dataset (static)
- See `00-DATA-FEEDS.md` Feeds #19, #25, #26

## Tasks

### 12.1 Static Data Curation
- Create curated JSON datasets for:
  - Military bases (~800 major US/NATO bases): name, lat, lon, branch, country
  - Nuclear facilities (~440 worldwide): name, type, status, capacity, lat, lon
  - Major data centers/AI labs: operator, lat, lon
- Store in `src/config/infrastructure.ts` or `public/data/` as JSON

### 12.2 Submarine Cables
- Fetch TeleGeography GeoJSON: cable routes as polylines
- Render as Cesium PolylineGraphics on ocean floor
- Color by operator/capacity

### 12.3 Visualization
- Military bases: shield/star billboard icons, colored by branch (Army green, Navy blue, AF blue, Marines red)
- Nuclear facilities: radiation symbol icons, colored by status (operational=green, construction=yellow, shutdown=gray)
- Submarine cables: thin colored polylines along ocean floor
- Data centers: server icon billboards

### 12.4 Proximity Alerts
- When seismic events (Epic 07) occur near nuclear facilities -> CRITICAL alert
- When conflict events (Epic 11) occur near infrastructure -> ELEVATED alert
- Distance threshold configurable (default 100km)

## Files Created
- `src/layers/InfrastructureLayer.tsx` — Static asset rendering
- `src/config/infrastructure.ts` — Infrastructure database
- `public/data/military-bases.json` — Base locations
- `public/data/nuclear-facilities.json` — Nuclear plant data
- `public/data/submarine-cables.json` — Cable route data (or fetch from GitHub)

## Worldmonitor Reference
- `src/config/bases-expanded.ts` — Military base data
- `src/config/pipelines.ts` — Pipeline data
- `src/config/ai-datacenters.ts` — AI datacenter locations

## Acceptance Criteria
- [ ] Military base icons visible at correct global locations
- [ ] Nuclear facilities shown with status color coding
- [ ] Submarine cable routes render as ocean polylines
- [ ] Each asset clickable with info panel
- [ ] Proximity alerts fire when events overlap
