# Epic 09: Street Traffic Simulation Layer

## Priority: MEDIUM
## Dependencies: Epic 01 (Globe)
## Blocks: Epic 15 (Fusion)
## Estimated Effort: 1-2 days
## Parallelizable With: Epic 12, 13

---

## Objective
Simulate street-level traffic using OpenStreetMap road network data with animated particle system showing vehicle movement along actual road geometries.

## Data Source
- **Overpass API**: `https://overpass-api.de/api/interpreter` (free, no auth)
- See `00-DATA-FEEDS.md` Feed #14

## Tasks

### 9.1 Road Network Fetching
- Backend route: `GET /api/roads?bbox=lat1,lon1,lat2,lon2`
- Overpass QL query for roads by classification
- Cache aggressively (road data is mostly static) — cache per city/bbox for 24 hours
- Sequential loading: motorway first, then primary, then secondary

### 9.2 Road Geometry Parsing
- Parse Overpass JSON ways into polyline segments
- Classify roads: motorway > trunk > primary > secondary > tertiary
- Store as arrays of [lat, lon] coordinate pairs

### 9.3 Particle System
- Spawn vehicle particles along road segments
- Particle speed by road class: motorway 100-130 km/h, primary 50-80, secondary 30-50
- Particle density by road class: motorway 20/km, primary 10/km, secondary 5/km
- Use `Cesium.PointPrimitiveCollection` for rendering
- Time-of-day density variation (optional)

### 9.4 Performance Management
- Only simulate traffic for visible bounding box
- Limit total particles to ~10,000 max
- Sequential loading prevents browser crash (video lesson: too many particles = crash)
- Particle recycling pool pattern

### 9.5 Visual Integration
- Standard: white/yellow dots on roads
- NVG: green dots, dark roads
- FLIR: hot dots (heat sources) on cold roads
- Sparse labels: road names at intersections

## Files Created
- `src/layers/TrafficLayer.tsx` — Particle system renderer
- `src/services/trafficService.ts` — Overpass API + road parsing
- `server/routes/traffic.ts` — Overpass proxy with caching

## Acceptance Criteria
- [ ] Zoom to city -> see animated dots moving along roads
- [ ] Motorways have more/faster traffic than side streets
- [ ] Sequential loading prevents browser crash
- [ ] Looks good in NVG and FLIR modes
- [ ] Performance: 30+ FPS with traffic active
