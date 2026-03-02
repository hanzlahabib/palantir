# Epic 07: Seismic & Natural Disaster Layer

## Priority: HIGH (simple to implement, high visual impact)
## Dependencies: Epic 01 (Globe), Epic 16 (Backend)
## Blocks: Epic 15 (Fusion)
## Estimated Effort: 1 day
## Parallelizable With: Epic 03, 04, 10

---

## Objective
Display real-time earthquakes from USGS, active wildfires from NASA FIRMS, and natural events from NASA EONET.

## Data Sources
- **USGS Earthquakes**: `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson` (free, no auth)
- **NASA FIRMS**: `https://firms.modaps.eosdis.nasa.gov/api/area/csv/{MAP_KEY}/VIIRS_SNPP_NRT/world/1` (free MAP_KEY)
- **NASA EONET**: `https://eonet.gsfc.nasa.gov/api/v3/events` (free, no auth)
- See `00-DATA-FEEDS.md` Feeds #08, #09, #10

## Tasks

### 7.1 USGS Earthquake Service
- Backend route: `GET /api/earthquakes?period=day&minmag=2.5`
- Fetch USGS GeoJSON feed, cache 1 minute
- Parse features into earthquake objects

### 7.2 Earthquake Visualization
- **Pulsing circles**: Cesium entity with animated `scaleByDistance`
- **Size by magnitude**: M1=5px, M3=15px, M5=25px, M7+=50px
- **Color by depth**: Shallow(<70km)=red, Intermediate(70-300km)=orange, Deep(>300km)=yellow
- **Seismic waves**: For quakes < 1 hour old, animated expanding rings from epicenter
- **Click**: Show magnitude, depth, location, time, felt reports, tsunami warning

### 7.3 NASA FIRMS Wildfire Service
- Backend route: `GET /api/fires?sensor=VIIRS_SNPP_NRT&days=1`
- Fetch FIRMS CSV, parse into fire hotspots
- Cache 15 minutes

### 7.4 Wildfire Visualization
- Orange/red dots at fire hotspot coordinates
- Intensity by FRP (Fire Radiative Power): brighter = more intense
- Click: Show brightness, confidence, satellite, acquisition time

### 7.5 EONET Natural Events
- Backend route: `GET /api/events?status=open&category=wildfires,severeStorms,volcanoes`
- Fetch EONET events, cache 15 minutes
- Render as typed markers (volcano icon, storm icon, etc.)

## Files Created
- `src/layers/SeismicLayer.tsx` — Earthquake + event rendering
- `src/layers/FireLayer.tsx` — Wildfire rendering
- `src/services/earthquakeService.ts` — USGS feed
- `src/services/fireService.ts` — NASA FIRMS feed
- `server/routes/earthquakes.ts` — USGS proxy
- `server/routes/fires.ts` — FIRMS proxy

## Worldmonitor Reference
- `src/services/earthquakes.ts` — Earthquake fetching pattern
- `src/services/eonet.ts` — EONET integration

## Acceptance Criteria
- [ ] Pulsing earthquake circles at epicenters, sized by magnitude
- [ ] Fire hotspots visible as orange clusters
- [ ] Color coding by depth works correctly
- [ ] Recent quakes show expanding wave animation
- [ ] Click shows detail panel with all metadata
