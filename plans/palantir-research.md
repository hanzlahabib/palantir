# PALANTIR Research — Real Palantir Features vs Our Plan

Research on Palantir Technologies' actual products and how they map to our open-source PALANTIR plan.

---

## Palantir's Product Suite

| Product | Purpose | Relevance |
|---------|---------|-----------|
| **Gotham** | Defense & intelligence platform | 🟢 Primary inspiration — geospatial, graph, kill chain |
| **MetaConstellation** | Satellite tasking & tracking | 🟢 Directly maps to our Phase 3 (Satellites) |
| **Foundry** | Commercial data integration | 🟡 Ontology/data fusion concepts for Phase 15 |
| **AIP** | AI Platform on top of Ontology | 🔴 Advanced AI — out of scope for v1 |
| **TITAN** | Mobile tactical intelligence node | 🟡 Deployment inspiration for VPS setup |

---

## Feature-by-Feature Mapping

### ✅ Features We Already Cover

| Real Palantir Feature | Our Phase | Coverage |
|----------------------|-----------|----------|
| **Geospatial 3D globe** with satellite/drone imagery | Phase 1 | ✅ CesiumJS + Google 3D Tiles |
| **Common Operating Picture (COP)** — unified map view | Phase 1 + 14 | ✅ Globe + HUD overlay |
| **Real-time data processing** — live sensor feeds | Phases 3-12 | ✅ 28 live data feeds |
| **Satellite tracking & tasking** | Phase 3 | ✅ CelesTrak TLEs + SGP4 |
| **Aircraft tracking** (commercial + military) | Phases 4-5 | ✅ OpenSky + ADS-B Exchange |
| **Maritime vessel tracking** (AIS) | Phase 6 | ✅ aisstream.io WebSocket |
| **Dark tactical UI** — dark mode command center | Phase 14 | ✅ Classified aesthetic HUD |
| **Interactive dashboards** with configurable panels | Phase 14 | ✅ Layer panel, inspector, console |
| **Alert/notification system** | Phase 14 | ✅ AlertFeed ticker + Sonner toasts |
| **Cross-layer data fusion** | Phase 15 | ✅ Fusion rules + proximity engine |
| **Threat assessment** scoring | Phase 15 | ✅ Composite threat score |
| **OSINT news intelligence** | Phase 10 | ✅ GDELT + RSS feeds |
| **Conflict zone visualization** | Phase 11 | ✅ ACLED/UCDP data |
| **Critical infrastructure** mapping | Phase 12 | ✅ Bases, cables, nuclear sites |
| **CCTV/surveillance** integration | Phase 8 | ✅ DOT camera feeds |
| **Squawk code emergency** alerts | Phase 4 | ✅ 7500/7600/7700 detection |

### 🟡 Features We Partially Cover (Enhancement Opportunities)

| Real Palantir Feature | Current Coverage | Enhancement |
|----------------------|-----------------|-------------|
| **Entity resolution** — deduplication across sources | Basic (by ID) | Add fuzzy matching for cross-source entity linking (same aircraft in OpenSky + ADS-B) |
| **Network graph analysis** — relationship visualization | Not visual | Add a graph view showing connections between entities (aircraft → base → conflict zone) |
| **Timeline analysis** — temporal event playback | Earthquake timeline only | Add global timeline scrubber across ALL layers for temporal analysis |
| **Anomaly detection** — AI/ML pattern recognition | Rule-based (maritime only) | Extend to all layers: orbit pattern, unusual flight paths, seismic clustering |
| **Mixed reality / immersive views** | Camera presets only | Add VR/AR mode using WebXR API for immersive globe viewing |

### 🔴 Features We're Missing (Consider Adding)

| Real Palantir Feature | Description | Priority | Suggested Phase |
|----------------------|-------------|----------|-----------------|
| **Entity Graph View** | Visual graph showing relationships between tracked entities | HIGH | New: Phase 14.5 |
| **Global Timeline Scrubber** | Temporal playback across all data layers | HIGH | Enhance Phase 14 |
| **AI Kill Chain Visualization** | Target identification → sensor tasking → decision flow | LOW | Future v2 |
| **Predictive Analytics** | Forecast movements/events based on historical patterns | LOW | Future v2 |
| **Collaborative Annotations** | Multiple users can annotate the globe with markers/notes | MEDIUM | Enhance Phase 14 |
| **Report Generation** | Export intelligence reports from current view/data | MEDIUM | Enhance Phase 14 |
| **Search Around Query** | Click entity → find all related entities within radius/time | HIGH | Enhance Phase 15 |
| **Edge AI / Sensor Tasking** | Autonomous satellite/drone tasking | LOW | Out of scope |

---

## Key Insights from Research

### 1. Palantir's "Ontology" = Our Data Fusion Engine
Palantir's core differentiator is the **Ontology** — a unified data model that maps real-world objects and their relationships. Our Phase 15 (Data Fusion Engine) covers this partially. 

**Enhancement**: Define an `Entity` ontology where every tracked object (satellite, aircraft, ship, earthquake, news event) is a first-class entity with typed relationships.

### 2. Dark Tactical UI is Correct
Research confirms Palantir Gotham uses **dark mode, tactical aesthetic** with interactive dashboards. Our Phase 14 design with monospace fonts, matrix green, scanlines, and classified watermark is perfectly aligned.

### 3. MetaConstellation = Our Satellite Layer on Steroids
Real Palantir can **task satellites** to collect imagery on demand. We can't do that, but our satellite tracking layer with 10K+ objects, orbital prediction, and category filtering is the civilian equivalent.

### 4. Common Operating Picture (COP) is Key
The military term for what we're building. Every layer contributing to one unified view = COP. Our architecture is already COP-like. **Label it as such in the UI**.

### 5. Graph Analytics is the Biggest Gap
Real Palantir is famous for **link analysis** — showing how entity A connects to entity B through entity C. We should add a lightweight graph view:
- Click aircraft → show its operator, base, nearby conflicts, flight history
- Click earthquake → show nearby nuclear facilities, affected infrastructure
- This maps to a new `EntityGraph` component in the HUD

---

## Suggested Enhancements to Add to Plan

### Priority 1 — Add to Current Phases

1. **Entity Ontology System** (enhance Phase 15)
   - Unified `Entity` type across all layers
   - `EntityRelationship` linking entities (proximity, causation, correlation)

2. **Global Timeline Scrubber** (enhance Phase 14)
   - Bottom-of-screen timeline bar
   - Drag to scrub through time across ALL layers
   - Shows event density over time

3. **Search Around** (enhance Phase 15)
   - Click any entity → "Search Around" button
   - Find all entities within radius + time window
   - Display results in inspector panel

### Priority 2 — Add as New Mini-Phases

4. **Entity Relationship Graph** (new HUD component)
   - `src/hud/EntityGraph.tsx`
   - Force-directed graph showing selected entity's connections
   - Powered by fusion engine data

5. **Intelligence Report Export** (new HUD component)
   - `src/hud/ReportExport.tsx`
   - Screenshot current view + entity list + alert log → PDF/markdown

### Priority 3 — Future v2

6. Predictive movement forecasting
7. Collaborative multi-user annotations
8. WebXR immersive mode
9. AI-powered natural language queries ("show me all military flights near Taiwan")

---

## Sources

- Palantir Gotham official documentation (palantir.com)
- Palantir MetaConstellation product page
- UK Government Palantir assessment (service.gov.uk)
- Palantir Foundry geospatial capabilities docs
- Palantir AIP/Ontology documentation
- Bolavo reference demo ("Google Earth + Palantir" concept)
- Palantir TITAN military system documentation
