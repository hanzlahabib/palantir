# Epic 11: Geopolitical Conflict & Threat Layer

## Priority: MEDIUM
## Dependencies: Epic 01 (Globe), Epic 16 (Backend)
## Blocks: Epic 15 (Fusion)
## Estimated Effort: 1-2 days
## Parallelizable With: Epic 05, 06, 08

---

## Objective
Visualize active armed conflicts, military deployments, threat zones, and geopolitical hotspots with escalation scoring.

## Data Sources
- **ACLED**: `https://api.acleddata.com/acled/read` (free registration, API key)
- **UCDP**: `https://ucdpapi.pcr.uu.se/api/gedevents/24.1` (free, no auth)
- **GDACS**: `https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH` (free, no auth)
- See `00-DATA-FEEDS.md` Feeds #16, #17, #18

## Tasks

### 11.1 ACLED Conflict Service
- Backend: `GET /api/conflicts?country=&event_type=&date_start=`
- Fetch ACLED events with API key
- Cache 1 hour (data updates weekly for free tier)

### 11.2 UCDP Conflict Service
- Backend: `GET /api/ucdp?pagesize=100`
- Free, no auth needed
- Parse conflict events with fatality counts

### 11.3 Hotspot Definition System
Define persistent hotspots with baseline threat scores:
- Ukraine/Donbas, Taiwan Strait, South China Sea, Korean DMZ
- Iran/Persian Gulf, Israel/Gaza, Yemen/Red Sea, Kashmir
- Sahel Region, Horn of Africa, Myanmar, Arctic
- Each has: name, lat, lon, radius, baselineThreat, category

### 11.4 Visualization
- Conflict events: Typed icons (battle sword, explosion, protest fist)
- Hotspot zones: Semi-transparent pulsing concentric rings
- Color by event type: battle=red, explosion=orange, protest=yellow, strategic=blue
- Escalation gauge: Per-hotspot score in EntityInspector

### 11.5 Escalation Scoring
Dynamic score combining:
- ACLED event count in last 7 days
- News velocity (from Epic 10)
- Military activity (from Epic 05)
- Historical baseline

## Files Created
- `src/layers/ConflictLayer.tsx` — Conflict event rendering
- `src/services/conflictService.ts` — ACLED/UCDP integration
- `src/config/hotspots.ts` — Hotspot definitions
- `server/routes/conflicts.ts` — ACLED/UCDP proxy

## Worldmonitor Reference
- `src/config/entities.ts` — Hotspot definitions
- `src/services/conflict/index.ts` — Conflict data patterns
- `src/services/country-instability.ts` — Instability scoring

## Acceptance Criteria
- [ ] ACLED events visible as typed markers
- [ ] Hotspot zones pulsing at defined locations
- [ ] Escalation scores calculated and displayed
- [ ] Click event -> detail panel with actors, fatalities, description
