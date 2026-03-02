# Epic 03: Real-Time Satellite Tracking Layer

## Priority: HIGH (most visually impressive)
## Dependencies: Epic 01 (Globe), Epic 16 (Backend)
## Blocks: Epic 15 (Fusion)
## Estimated Effort: 1-2 days
## Parallelizable With: Epic 04, 07, 10

---

## Objective
Display every trackable satellite in orbit (~10,000+) in real-time using CelesTrak TLE data propagated with SGP4 via satellite.js.

## Data Source
- **CelesTrak**: `https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle`
- No auth, free, reliable
- Backup: Space-Track.org (needs free account)
- See `00-DATA-FEEDS.md` Feed #01 and #02

## Tasks

### 3.1 TLE Data Fetching & Caching
- Backend route: `GET /api/satellites/tle?group=active`
- Fetch from CelesTrak, cache for 4 hours
- Parse TLE format into structured objects: `{name, line1, line2, noradId}`
- Support multiple groups: active, stations, starlink, military, weather, gps

### 3.2 SGP4 Propagation Engine
- Use `satellite.js` to propagate all satellites
- Create Web Worker for bulk propagation (don't block main thread)
- Propagation loop: calculate all positions every 1 second
- Convert ECI to geodetic (lat/lon/alt) using `eciToGeodetic()`
- Export: `getSatellitePosition(tle1, tle2, date) => {lat, lon, alt}`

### 3.3 Cesium Rendering
- Use `Cesium.PointPrimitiveCollection` for bulk rendering (NOT individual entities)
- Color by orbit type:
  - LEO (< 2000km): `#00ffff` (cyan)
  - MEO (2000-35786km): `#ffff00` (yellow)
  - GEO (~35786km): `#ff4444` (red)
- Point size: 3-8px based on zoom level (pixelSize)
- Frustum culling: Only propagate/render satellites in current view

### 3.4 Detection Mode Labels
- Sparse mode: No labels, just points
- Dense mode: NORAD ID + name labels on each satellite
- Label font: monospace, small (10-12px)
- Label color matches point color

### 3.5 Satellite Selection & Tracking
- Click on satellite point -> select it
- Selected satellite shows:
  - Full orbit path as `Cesium.PolylineGraphics` (360 propagated points over 1 orbital period)
  - Info panel in EntityInspector: NORAD ID, name, altitude, speed, inclination, period, orbit type
- Camera tracking mode: Camera follows selected satellite

### 3.6 Category Filtering
- Filter buttons in layer panel:
  - All | Communication | Navigation | Weather | Military | Science | Starlink | Debris
- Each category fetches different CelesTrak groups

### 3.7 Performance Optimization
- Web Worker for SGP4 propagation
- SharedArrayBuffer for position transfer (if available)
- Level-of-detail: reduce point count when zoomed out
- Batch updates: update 1000 satellites per frame, not all at once

## Files Created
- `src/layers/SatelliteLayer.tsx` — Cesium rendering component
- `src/services/satelliteService.ts` — CelesTrak fetch + SGP4 propagation
- `src/workers/satelliteWorker.ts` — Web Worker for bulk propagation
- `server/routes/satellites.ts` — Backend TLE cache proxy

## Worldmonitor Reference Patterns
- Circuit breaker: `src/utils/circuit-breaker.ts` — use for API calls
- No direct satellite equivalent in worldmonitor, but follows same service pattern

## Acceptance Criteria
- [ ] Toggle satellite layer -> see 10,000+ dots orbiting Earth
- [ ] Satellites visibly move in real-time
- [ ] Different colors for LEO/MEO/GEO orbits
- [ ] Click satellite -> see orbit line + info panel
- [ ] Category filter works (Starlink, Military, etc.)
- [ ] Detection mode toggles labels on/off
- [ ] Maintains 30+ FPS with all satellites visible
