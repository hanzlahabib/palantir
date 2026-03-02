# PALANTIR — Task Checklist

## Foundation
- [ ] Project scaffolding (Vite + React + TypeScript + Tailwind)
- [ ] Install core deps: cesium, resium, vite-plugin-cesium, zustand, sonner, satellite.js
- [ ] Configure `vite.config.ts` with Cesium plugin
- [ ] Create `.env.example` with all API key placeholders
- [ ] Set up `tsconfig.json` with strict mode
- [ ] Set up Tailwind config with tactical color scheme

## Phase 1 — 3D Globe Foundation
- [ ] `src/globe/GlobeViewer.tsx` — CesiumJS viewer + Google 3D Tiles
- [ ] `src/App.tsx` — Root layout with viewer + overlay shell
- [ ] Top bar (PALANTIR title, UTC clock)
- [ ] Bottom bar (coordinates, altitude, heading)
- [ ] Verify: Globe renders with photorealistic tiles

## Phase 16 — Backend Proxy & Caching
- [ ] `server/index.ts` — Express + WebSocket setup
- [ ] `server/cache.ts` — node-cache with TTL + stale-while-revalidate
- [ ] `server/rateLimiter.ts` — p-queue per-API rate limiting
- [ ] `server/websocket.ts` — Channel subscription + delta push
- [ ] `server/scheduler.ts` — node-cron data pre-fetch
- [ ] Create route stubs: opensky, adsb, satellites, earthquakes, maritime, cctv, gdelt, fires
- [ ] Verify: `/api/earthquakes` returns cached USGS data

## Phase 14 — Command Console & HUD
- [ ] `src/hud/TopBar.tsx` — Status + clock + feed health
- [ ] `src/hud/BottomBar.tsx` — Coordinates + mode
- [ ] `src/hud/LayerPanel.tsx` — Left sidebar layer toggles
- [ ] `src/hud/EntityInspector.tsx` — Right panel details
- [ ] `src/hud/CommandConsole.tsx` — "/" command input + parser
- [ ] `src/hud/AlertFeed.tsx` — Scrolling ticker
- [ ] `src/hud/ClassifiedWatermark.tsx` — TOP SECRET overlay
- [ ] `src/hud/ThreatGauge.tsx` — Threat level dial
- [ ] `src/hud/DataFreshness.tsx` — Feed online/offline
- [ ] Boot sequence animation on load
- [ ] Verify: HUD renders without blocking globe interaction

## Phase 2 — Tactical Visual Modes (GLSL Shaders)
- [ ] `src/shaders/crt.glsl` — Scanlines + chromatic aberration
- [ ] `src/shaders/nightVision.glsl` — Green phosphor + bloom
- [ ] `src/shaders/flir.glsl` — Thermal palette mapping
- [ ] `src/shaders/tactical.glsl` — Desaturation + edge detection
- [ ] `src/shaders/bloom.glsl` — Entity glow
- [ ] `src/globe/PostProcessing.tsx` — Shader pipeline manager
- [ ] Keyboard shortcuts (1-5) for mode switching
- [ ] Verify: All 5 modes render correctly

## Phase 3 — Satellite Tracking
- [ ] `src/services/satelliteService.ts` — CelesTrak TLE + SGP4
- [ ] `src/layers/SatelliteLayer.tsx` — PointPrimitiveCollection rendering
- [ ] `server/routes/satellites.ts` — TLE cache proxy (4hr TTL)
- [ ] Orbit lines on selection
- [ ] Category filtering (comms, nav, weather, military, debris)
- [ ] Verify: 10K+ dots orbiting, click to track

## Phase 4 — Commercial Aviation
- [ ] `src/services/flightService.ts` — OpenSky API + interpolation
- [ ] `src/layers/FlightLayer.tsx` — Aircraft entities with heading
- [ ] `server/routes/opensky.ts` — Auth proxy (10s TTL)
- [ ] Squawk code alerts (7500/7600/7700)
- [ ] Verify: 6K+ aircraft visible with callsigns

## Phase 5 — Military Aviation OSINT
- [ ] `src/services/militaryFlightService.ts` — ADS-B Exchange + airplanes.live
- [ ] `src/layers/MilitaryFlightLayer.tsx` — Military entity rendering
- [ ] `src/config/militaryCallsigns.ts` — Callsign pattern database
- [ ] Orbit/formation pattern detection
- [ ] Hotspot proximity alerts
- [ ] Verify: Orange military aircraft with type labels

## Phase 7 — Seismic & Natural Disasters
- [ ] `src/services/earthquakeService.ts` — USGS GeoJSON
- [ ] `src/layers/SeismicLayer.tsx` — Pulsing circles by magnitude
- [ ] `src/services/fireService.ts` — NASA FIRMS
- [ ] `src/layers/FireLayer.tsx` — Wildfire hotspots
- [ ] `server/routes/earthquakes.ts` + `server/routes/fires.ts`
- [ ] Verify: Pulsing circles at recent epicenters

## Phase 10 — SIGINT & OSINT News
- [ ] `src/services/gdeltService.ts` — GDELT DOC + GEO API
- [ ] `src/services/newsService.ts` — RSS aggregation
- [ ] `src/hud/AlertFeed.tsx` — Wire to GDELT data
- [ ] `server/routes/gdelt.ts` — GDELT proxy (5min TTL)
- [ ] Verify: Scrolling headlines in alert ticker

## Phase 13 — Camera Presets & Cinematic Nav
- [ ] `src/config/landmarks.ts` — City/strategic presets
- [ ] `src/globe/CameraController.tsx` — Animated flyTo engine
- [ ] `src/hud/CameraPresets.tsx` — Preset selection UI
- [ ] `src/hooks/useCameraFlyTo.ts` — Flyto hook
- [ ] `src/hooks/useKeyboardShortcuts.ts` — Keyboard bindings
- [ ] Orbit, Follow, Flythrough camera modes
- [ ] Verify: Q/W/E/R/T cycle presets, space toggles orbit

## Phase 6 — Maritime Intelligence
- [ ] `src/services/maritimeService.ts` — AIS WebSocket
- [ ] `src/layers/MaritimeLayer.tsx` — Vessel icons + direction
- [ ] `server/routes/maritime.ts` — AIS relay
- [ ] Anomaly detection (dark ships, loitering, rendezvous)
- [ ] Verify: Ship icons on oceans with heading

## Phase 8 — CCTV Surveillance
- [ ] `src/services/cctvService.ts` — DOT camera metadata
- [ ] `src/layers/CCTVLayer.tsx` — Camera markers on globe
- [ ] `src/hud/CCTVPanel.tsx` — Feed viewer panel
- [ ] `server/routes/cctv.ts` — CORS proxy for JPEG feeds
- [ ] Verify: Live camera feed from Austin/NYC

## Phase 9 — Street Traffic Simulation
- [ ] `src/services/trafficService.ts` — Overpass road geometry
- [ ] `src/layers/TrafficLayer.tsx` — Particle system renderer
- [ ] `server/routes/traffic.ts` — Overpass proxy + cache
- [ ] Verify: Animated dots along roads at city zoom

## Phase 11 — Geopolitical Conflicts
- [ ] `src/services/conflictService.ts` — ACLED/UCDP
- [ ] `src/layers/ConflictLayer.tsx` — Conflict markers + zones
- [ ] `src/config/hotspots.ts` — Hotspot definitions
- [ ] Verify: Red markers at active conflict zones

## Phase 12 — Infrastructure & Critical Assets
- [ ] `src/config/infrastructure.ts` — Static asset database
- [ ] `src/layers/InfrastructureLayer.tsx` — Bases, cables, nukes
- [ ] `src/services/infrastructureService.ts` — OSM Overpass queries
- [ ] Verify: Military bases, submarine cables visible

## Phase 15 — Data Fusion Engine
- [ ] `src/services/fusionEngine.ts` — Cross-layer correlation
- [ ] `src/services/proximityEngine.ts` — Spatial proximity detection
- [ ] Composite threat scoring
- [ ] Verify: Cross-layer alerts firing

## Phase 17 — Deployment
- [ ] CyberPanel: Create `palantir.hanzla.com` site
- [ ] `deploy/nginx.conf` — Reverse proxy config
- [ ] `deploy/pm2.config.js` — Process manager config
- [ ] Build & deploy to Contabo VPS
- [ ] Verify: `palantir.hanzla.com` loads with SSL + API proxy

## Zustand Stores (created alongside relevant phases)
- [ ] `src/stores/layerStore.ts` — Layer visibility + settings
- [ ] `src/stores/cameraStore.ts` — Camera state + presets
- [ ] `src/stores/entityStore.ts` — Selected entity
- [ ] `src/stores/alertStore.ts` — Alert queue

## Utility Files (created as needed)
- [ ] `src/utils/circuitBreaker.ts`
- [ ] `src/utils/coordinateUtils.ts`
- [ ] `src/utils/militaryIdentifier.ts`
- [ ] `src/utils/colorSchemes.ts`
- [ ] `src/utils/formatters.ts`

## TypeScript Types (created alongside relevant phases)
- [ ] `src/types/globe.ts`
- [ ] `src/types/layers.ts`
- [ ] `src/types/entities.ts`
