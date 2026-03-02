# Epic 18: Advanced Intelligence Features (Palantir Parity)

## Priority: HIGH (differentiator from basic dashboards)
## Dependencies: Epic 14 (HUD), Epic 15 (Fusion), Epic 10 (News Intel)
## Blocks: None
## Estimated Effort: 3-4 days
## Parallelizable With: Partially — 18.1-18.4 can run as 4 parallel sub-tasks after dependencies met

---

## Gap Analysis vs Real Palantir

| Feature | Status | Priority |
|---------|--------|----------|
| 3D globe + COP | Already planned (Epic 01) | - |
| Satellite tracking | Already planned (Epic 03) | - |
| Aircraft + military tracking | Already planned (Epic 04, 05) | - |
| Maritime AIS | Already planned (Epic 06) | - |
| Dark tactical UI | Already planned (Epic 14) | - |
| Data fusion engine | Already planned (Epic 15) | - |
| OSINT/GDELT intelligence | Already planned (Epic 10) | - |
| Entity resolution (fuzzy matching) | Can enhance (Epic 15) | HIGH |
| Anomaly detection (all layers) | Can enhance (Epics 05, 06) | HIGH |
| Timeline analysis | Can enhance (Epic 14) | HIGH |
| Mixed reality views | Can enhance (Epic 02) | MEDIUM |
| **Entity Graph View** | **MISSING — NEW** | **CRITICAL** |
| **Global Timeline Scrubber** | **MISSING — NEW** | **HIGH** |
| **Search Around (radius + time)** | **MISSING — NEW** | **HIGH** |
| **Report Export** | **MISSING — NEW** | **MEDIUM** |

---

## Task 18.1: Entity Graph View (CRITICAL)

### What
Palantir's core differentiator is relationship visualization — a force-directed graph showing how entities (people, organizations, countries, aircraft, ships, events) connect to each other.

### Implementation

#### EntityGraph.tsx — Interactive Graph Component
- **Library**: Use `d3-force` for force-directed graph layout
- **Rendering**: Canvas-based (not SVG) for performance with 1000+ nodes
- **Display**: Full-screen overlay panel (toggled via `G` key or HUD button)

#### Node Types
```typescript
type EntityNodeType =
  | 'aircraft'    // Specific flight/military aircraft
  | 'ship'        // Vessel
  | 'satellite'   // Orbital object
  | 'country'     // Nation state
  | 'organization'// Military org, terror group, company
  | 'person'      // Named individual from news
  | 'event'       // Conflict, earthquake, incident
  | 'location'    // City, base, facility
  | 'weapon'      // Weapon system mentioned in news
```

#### Edge Types (Relationships)
```typescript
type EntityEdge =
  | 'operates'        // Country -> Aircraft/Ship
  | 'near'           // Entity -> Entity (proximity)
  | 'mentioned_with' // Entity co-mentioned in news articles
  | 'part_of'        // Organization membership
  | 'located_at'     // Entity -> Location
  | 'targets'        // Conflict -> Location
  | 'detected_by'    // Satellite overhead -> Event
```

#### Graph Building Logic
1. **Proximity-based edges**: Entities from different layers within threshold distance
2. **Co-mention edges**: Entities appearing in same GDELT/news articles
3. **Operational edges**: Military callsign -> operator country, ship -> flag state
4. **Event correlation**: Events happening within same time window + location

#### Interactive Features
- Click node -> highlight all connected edges + nodes
- Hover -> tooltip with entity summary
- Drag nodes to rearrange
- Zoom + pan on graph
- Filter by node type / edge type
- "Expand" a node -> query for more connections
- Right-click -> "Find on Globe" jumps to entity's location
- Cluster detection: Auto-identify densely connected subgraphs

#### Visual Style
- Dark background matching HUD aesthetic
- Node colors match layer colors (cyan=satellite, blue=aircraft, etc.)
- Edge opacity by strength (more co-mentions = thicker/brighter)
- Pulsing animation on nodes with recent activity
- Monospace labels

### Files Created
- `src/hud/EntityGraph.tsx` — Force-directed graph component
- `src/services/entityGraphService.ts` — Graph building from cross-layer data
- `src/types/entities.ts` — Node/Edge type definitions

---

## Task 18.2: Global Timeline Scrubber (HIGH)

### What
Temporal playback control — scrub through time to see how the world situation evolved. Like a video player but for geospatial intelligence data.

### Implementation

#### TimelineScrubber.tsx — Bottom timeline control
- Horizontal timeline bar at bottom of globe (above command console)
- Range: Past 24h, 7d, 30d (selectable)
- Playback controls: Play, Pause, Speed (1x, 2x, 5x, 10x, 50x)
- Current time indicator (draggable scrubber handle)
- Event markers on timeline: colored pips for significant events

#### Temporal Data Storage
Each data layer stores timestamped history:
```typescript
interface TemporalEntity {
  id: string;
  positions: Array<{ time: Date; lat: number; lon: number; alt?: number }>;
  events: Array<{ time: Date; type: string; description: string }>;
}
```

#### Playback Behavior
- **Flights**: Show aircraft trails appearing/disappearing over time
- **Military**: Show military activity patterns over days
- **Earthquakes**: Show seismic wave progression
- **Conflicts**: Show event escalation/de-escalation
- **News**: Show news headlines emerging chronologically
- Current "now" marker shows live data; scrubbing back shows historical

#### Historical Data Caching
- Backend caches historical snapshots at intervals
- Satellites: orbit positions pre-calculated
- Flights: OpenSky historical API (limited for free tier)
- Earthquakes: USGS supports date ranges natively
- GDELT: Supports historical queries natively
- ACLED: Supports date range queries

### Files Created
- `src/hud/TimelineScrubber.tsx` — Timeline UI component
- `src/services/temporalEngine.ts` — Time-based data management
- `src/hooks/useTimeline.ts` — Timeline state hook

---

## Task 18.3: Search Around (Radius + Time Query) (HIGH)

### What
Right-click any point on the globe -> "Search Around" -> define radius (km) and time window -> see all entities and events within that space-time cone.

### Implementation

#### SearchAround.tsx — Query interface
- Right-click context menu on globe: "Search Around This Location"
- Dialog: Radius slider (1km - 1000km), Time window (1h - 30d)
- Results grouped by layer:
  - "3 military aircraft passed through in last 48h"
  - "12 news articles mentioning this area in last 7d"
  - "2 earthquakes within 200km in last 30d"
  - "5 AIS vessels transited in last 24h"

#### Spatial Query Engine
```typescript
function searchAround(
  center: { lat: number; lon: number },
  radiusKm: number,
  timeWindow: { start: Date; end: Date },
  layers: LayerType[]
): SearchResult[]
```

- Use Haversine distance for spatial filtering
- Query each layer's historical data within time window
- Rank results by relevance (closer + more recent = higher)

#### Visualization
- Draw search radius circle on globe
- Highlight all matching entities within radius
- Results panel with timeline of events within the cone

### Files Created
- `src/hud/SearchAround.tsx` — Search interface + results
- `src/services/spatialQueryEngine.ts` — Radius + time filtering

---

## Task 18.4: Report Export (MEDIUM)

### What
Generate intelligence reports from the current view state — export as PDF or Markdown with maps, entity lists, and assessment summaries.

### Implementation

#### ReportExport.tsx — Report generation UI
- Button in HUD: "Generate Report"
- Options: Format (PDF/Markdown), Scope (current view / selected entities / hotspot), Time range
- Report sections:
  1. **Header**: Classification banner, date/time, report ID
  2. **Situation Summary**: Text summary of active layers + notable events
  3. **Map Snapshot**: Screenshot of current globe view
  4. **Entity Table**: All visible/selected entities with details
  5. **Event Timeline**: Chronological list of events in time window
  6. **Threat Assessment**: Composite threat scores per region
  7. **Sources**: Data feed attribution

#### Markdown Generation
```markdown
# INTELLIGENCE REPORT — IR-2026-0302-001
## UNCLASSIFIED // FOUO
### Date: 2026-03-02 14:32 UTC

## SITUATION SUMMARY
Active monitoring of 12,451 entities across 8 data layers...

## ENTITIES OF INTEREST
| Type | ID | Location | Status |
|------|-----|----------|--------|
| Military Aircraft | COBRA55 | Black Sea | SIGINT orbit |
| Vessel | MMSI 123456 | Red Sea | AIS dark since 0800Z |

## THREAT ASSESSMENT
- Taiwan Strait: ELEVATED (Score: 72/100)
- Black Sea: HIGH (Score: 84/100)
```

#### PDF Generation
- Use `html2canvas` to capture globe screenshot
- Use `jspdf` or `@react-pdf/renderer` for PDF layout
- Include map image + formatted tables

### Files Created
- `src/hud/ReportExport.tsx` — Report generation UI
- `src/services/reportGenerator.ts` — Markdown/PDF generation

---

## Task 18.5: Enhanced Anomaly Detection (All Layers)

### What
Upgrade existing layer-specific anomaly detection into a unified anomaly engine.

### Implementation

#### AnomalyEngine.ts
Detect across all layers:

| Layer | Anomaly Type | Detection Method |
|-------|-------------|-----------------|
| Flights | Emergency squawk | Squawk code 7500/7600/7700 |
| Military | Orbit pattern | Heading change rate > 90°/10min |
| Military | Unusual deployment | Aircraft type in unusual region |
| Maritime | AIS gap (dark ship) | Transmission gap > 1 hour |
| Maritime | Rendezvous | Two vessels < 500m in open ocean |
| Maritime | Speed anomaly | Speed change > 50% |
| Satellites | Unexpected maneuver | Orbital element change detection |
| News | Velocity spike | Story acceleration (sources/hour) |
| Seismic | Swarm pattern | Multiple small quakes in tight cluster |
| Conflicts | Escalation surge | Event rate > 2x historical average |

#### Anomaly Alerts
Each detected anomaly generates:
```typescript
interface AnomalyAlert {
  id: string;
  type: AnomalyType;
  layer: LayerType;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  entityId: string;
  location: { lat: number; lon: number };
  description: string;
  detectedAt: Date;
  confidence: number; // 0-1
}
```

- Feed into AlertFeed ticker
- Feed into EntityGraph as highlighted nodes
- Feed into Fusion Engine for cross-correlation

### Files Created
- `src/services/anomalyEngine.ts` — Unified anomaly detection
- Update `src/hud/AlertFeed.tsx` — Add anomaly alert type

---

## Task 18.6: Entity Resolution (Fuzzy Matching)

### What
Match entities across layers that refer to the same real-world object. E.g., a news article about "USS Gerald Ford" should link to the AIS vessel with that name.

### Implementation

#### Entity Resolution Service
```typescript
function resolveEntity(
  name: string,
  context: { type?: string; lat?: number; lon?: number; time?: Date }
): ResolvedEntity | null
```

- **Aircraft**: Match callsign/ICAO hex across OpenSky + ADS-B
- **Vessels**: Match MMSI/vessel name across AIS sources
- **Locations**: Fuzzy match location names from news to coordinates
- **Organizations**: Map organization mentions to known entities
- **Cross-layer**: News mentions "F-22" -> link to active F-22 flights in military layer

#### Techniques
- Levenshtein distance for fuzzy string matching
- Proximity + time correlation for spatial matching
- Known alias database (e.g., "Carrier Strike Group" aliases)

### Files Created
- `src/services/entityResolution.ts` — Fuzzy matching engine
- `src/config/entityAliases.ts` — Known alias database

---

## Updated Dependency Graph Addition

```
                    ┌──────────────────┐
                    │    EPIC 18       │
                    │  Advanced Intel  │
                    │  Features        │
                    └────────┬─────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
    ┌─────┴─────┐     ┌─────┴─────┐     ┌─────┴──────┐
    │ 18.1      │     │ 18.2      │     │ 18.3       │
    │ Entity    │     │ Timeline  │     │ Search     │
    │ Graph     │     │ Scrubber  │     │ Around     │
    │ (d:14,15) │     │ (d:14)    │     │ (d:14,16)  │
    └───────────┘     └───────────┘     └────────────┘

    ┌─────────────┐  ┌──────────────┐  ┌──────────────┐
    │ 18.4        │  │ 18.5         │  │ 18.6         │
    │ Report      │  │ Anomaly      │  │ Entity       │
    │ Export      │  │ Engine       │  │ Resolution   │
    │ (d:14)      │  │ (d:03-13)    │  │ (d:10,15)    │
    └─────────────┘  └──────────────┘  └──────────────┘
```

## Sub-task Parallelization

| Sub-task | Depends On | Can Parallel With |
|----------|-----------|-------------------|
| 18.1 Entity Graph | Epic 14 + 15 | 18.2, 18.4 |
| 18.2 Timeline Scrubber | Epic 14 | 18.1, 18.3, 18.4 |
| 18.3 Search Around | Epic 14 + 16 | 18.2, 18.4 |
| 18.4 Report Export | Epic 14 | 18.1, 18.2, 18.3 |
| 18.5 Anomaly Engine | All data layers (03-13) | 18.6 |
| 18.6 Entity Resolution | Epic 10 + 15 | 18.5 |

## Acceptance Criteria
- [ ] Entity Graph renders with nodes from multiple layers
- [ ] Click node in graph -> highlight on globe + connected entities
- [ ] Timeline scrubber allows temporal playback of historical data
- [ ] Play button animates data over time at configurable speed
- [ ] Right-click "Search Around" returns entities within radius + time
- [ ] Report export generates readable Markdown with entity tables
- [ ] Anomaly engine detects orbit patterns, AIS gaps, squawk emergencies
- [ ] Entity resolution links news mentions to live tracked entities
