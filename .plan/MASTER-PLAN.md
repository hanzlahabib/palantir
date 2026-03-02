# PALANTIR: Personal Autonomous Live-feed Analysis, Navigation, Tracking & Intelligence Reconnaissance

## A Comprehensive Blueprint for Building an Open-Source Geospatial Intelligence Platform

---

## Context

**Why this exists:** You watched Bolavo's viral demo of a "Google Earth meets Palantir" system and want to build your own — but better, darker, more spy-like. The goal is a classified-intelligence-aesthetic geospatial dashboard that fuses every publicly available open-source data feed into a single 3D operational picture of the planet. Real satellites. Real flights. Real military movements. Real seismic events. Real CCTV feeds. Real ship traffic. All rendered against a photorealistic 3D globe with CRT, night vision, FLIR, and tactical overlay modes.

**The reference:** `hanzlahabib/worldmonitor` is an existing 2D map-based intelligence dashboard (MapLibre + deck.gl) with RSS feeds, GDELT intel, military flight tracking, earthquake monitoring, and market data. Our project takes this concept to a completely different level — a full 3D CesiumJS globe with real-time data fusion, tactical visual modes, and a UI that looks like it belongs in a SCIF (Sensitive Compartmented Information Facility).

**The outcome:** A deployable TypeScript web application (Vite + CesiumJS + React) with a Node.js backend proxy layer, capable of running locally or on your Contabo VPS at a domain like `palantir.hanzla.com`.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Tech Stack Selection](#2-tech-stack-selection)
3. [Project Structure](#3-project-structure)
4. [Phase 1: 3D Globe Foundation](#4-phase-1-3d-globe-foundation)
5. [Phase 2: Tactical Visual Modes & Post-Processing](#5-phase-2-tactical-visual-modes--post-processing)
6. [Phase 3: Satellite Tracking Layer](#6-phase-3-satellite-tracking-layer)
7. [Phase 4: Aviation Intelligence Layer](#7-phase-4-aviation-intelligence-layer)
8. [Phase 5: Military Aviation OSINT Layer](#8-phase-5-military-aviation-osint-layer)
9. [Phase 6: Maritime Intelligence Layer](#9-phase-6-maritime-intelligence-layer)
10. [Phase 7: Seismic & Natural Disaster Layer](#10-phase-7-seismic--natural-disaster-layer)
11. [Phase 8: CCTV Surveillance Feed Integration](#11-phase-8-cctv-surveillance-feed-integration)
12. [Phase 9: Street Traffic Simulation Layer](#12-phase-9-street-traffic-simulation-layer)
13. [Phase 10: SIGINT & OSINT News Intelligence](#13-phase-10-sigint--osint-news-intelligence)
14. [Phase 11: Geopolitical Conflict & Threat Layer](#14-phase-11-geopolitical-conflict--threat-layer)
15. [Phase 12: Infrastructure & Critical Assets Layer](#15-phase-12-infrastructure--critical-assets-layer)
16. [Phase 13: Camera Presets & Cinematic Navigation](#16-phase-13-camera-presets--cinematic-navigation)
17. [Phase 14: Command Console & HUD System](#17-phase-14-command-console--hud-system)
18. [Phase 15: Data Fusion Engine](#18-phase-15-data-fusion-engine)
19. [Phase 16: Backend Proxy & Caching Layer](#19-phase-16-backend-proxy--caching-layer)
20. [Phase 17: Deployment & Operations](#20-phase-17-deployment--operations)
21. [Open Source Data Feed Registry](#21-open-source-data-feed-registry)
22. [Verification & Testing](#22-verification--testing)

---

## 1. Architecture Overview

```
+------------------------------------------------------------------+
|                        PALANTIR CLIENT                            |
|  +------------------------------------------------------------+  |
|  |                    CesiumJS 3D Globe                        |  |
|  |  - Google Photorealistic 3D Tiles                           |  |
|  |  - Custom GLSL Post-Processing Pipeline                     |  |
|  |  - Cesium Entities + Primitives for data layers             |  |
|  +------------------------------------------------------------+  |
|  |                   Data Layer Manager                         |  |
|  |  [Satellites] [Flights] [Military] [Ships] [Quakes]         |  |
|  |  [CCTV] [Traffic] [Fires] [Conflicts] [Infrastructure]     |  |
|  +------------------------------------------------------------+  |
|  |                    Tactical HUD Overlay                      |  |
|  |  - Command console     - Entity inspector                   |  |
|  |  - Layer toggles       - Camera presets                     |  |
|  |  - Detection mode      - Alert feed                         |  |
|  |  - Threat assessment   - Data freshness indicators          |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
                              |
                     HTTPS / WebSocket
                              |
+------------------------------------------------------------------+
|                      PALANTIR BACKEND                             |
|  +------------------------------------------------------------+  |
|  |              API Proxy & Rate Limiter                       |  |
|  |  - OpenSky proxy       - ADS-B Exchange proxy               |  |
|  |  - Space-Track auth     - USGS proxy                        |  |
|  |  - AIS stream relay     - GDELT proxy                       |  |
|  |  - CCTV feed aggregator - TLE cache                         |  |
|  +------------------------------------------------------------+  |
|  |              Caching Layer (Redis / In-Memory)              |  |
|  |  - TTL-based feed caching                                   |  |
|  |  - Circuit breaker pattern                                  |  |
|  |  - Deduplication engine                                     |  |
|  +------------------------------------------------------------+  |
|  |              WebSocket Server                               |  |
|  |  - Real-time push for position updates                      |  |
|  |  - Event broadcasting                                       |  |
|  |  - Client subscription management                           |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
```

### Data Flow Architecture

```
External APIs ──> Backend Proxy (rate limit + cache) ──> WebSocket/REST ──> Client
                                                                              |
                                                                    CesiumJS Entity Manager
                                                                              |
                                                              ┌───────────────┼───────────────┐
                                                              |               |               |
                                                        3D Entities    Primitives    Post-Processing
                                                        (tracked      (particles,   (CRT, NVG,
                                                         objects)      heatmaps)     FLIR shaders)
```

---

## 2. Tech Stack Selection

### Frontend
| Technology | Purpose | Why |
|-----------|---------|-----|
| **Vite** | Build tool | Fast HMR, ESM-native, proven in worldmonitor |
| **React 19** | UI framework | Component composition for HUD panels |
| **TypeScript** | Type safety | Critical for complex data layer types |
| **CesiumJS 1.130+** | 3D globe engine | Industry standard, Google 3D Tiles support, post-processing pipeline |
| **Resium** | React + Cesium bindings | Declarative Cesium entities in React |
| **satellite.js** | SGP4/SDP4 propagation | Real-time satellite position calculation from TLEs |
| **Tailwind CSS** | Styling | Utility-first, fast iteration for tactical UI |
| **Zustand** | State management | Lightweight, no boilerplate, perfect for layer toggles |
| **Sonner** | Toast notifications | Alert system for threat notifications |

### Backend
| Technology | Purpose | Why |
|-----------|---------|-----|
| **Node.js + Express** | API proxy server | Lightweight, async, proven |
| **ws** | WebSocket server | Real-time data push |
| **node-cache** | In-memory caching | TTL-based, zero infrastructure |
| **p-queue** | Rate limiting | Per-API concurrency control |
| **node-cron** | Scheduled fetching | Periodic data refresh |

### Infrastructure
| Technology | Purpose |
|-----------|---------|
| **Contabo VPS** | Production hosting |
| **Nginx** | Reverse proxy + SSL |
| **PM2** | Process management |
| **Let's Encrypt** | SSL certificates |

---

## 3. Project Structure

```
palantir/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── .env.example                    # API keys template
├── public/
│   ├── cesium/                     # CesiumJS static assets
│   └── assets/
│       ├── textures/               # Globe textures, overlays
│       ├── models/                 # 3D models (aircraft, satellites)
│       └── sounds/                 # UI sound effects (optional)
├── src/
│   ├── main.tsx                    # Entry point
│   ├── App.tsx                     # Root component
│   ├── globe/                      # 3D Globe core (~8 files)
│   │   ├── GlobeViewer.tsx         # CesiumJS viewer setup + 3D tiles
│   │   ├── CameraController.tsx    # Camera presets + cinematic flyto
│   │   ├── PostProcessing.tsx      # Shader pipeline manager
│   │   └── EntityManager.tsx       # Central entity lifecycle
│   ├── layers/                     # Data layer components (~15 files)
│   │   ├── SatelliteLayer.tsx      # Satellite tracking
│   │   ├── FlightLayer.tsx         # Commercial aviation
│   │   ├── MilitaryFlightLayer.tsx # Military OSINT aviation
│   │   ├── MaritimeLayer.tsx       # Ship/vessel tracking
│   │   ├── SeismicLayer.tsx        # Earthquake data
│   │   ├── CCTVLayer.tsx           # Surveillance camera feeds
│   │   ├── TrafficLayer.tsx        # Street traffic simulation
│   │   ├── FireLayer.tsx           # Wildfire/FIRMS data
│   │   ├── ConflictLayer.tsx       # ACLED/UCDP conflict events
│   │   ├── InfrastructureLayer.tsx # Critical infrastructure
│   │   ├── WeatherLayer.tsx        # Weather overlays
│   │   ├── NuclearLayer.tsx        # Nuclear facilities
│   │   └── CyberThreatLayer.tsx    # Cyber threat visualization
│   ├── shaders/                    # GLSL post-processing (~6 files)
│   │   ├── crt.glsl               # CRT scanline + chromatic aberration
│   │   ├── nightVision.glsl       # NVG green phosphor effect
│   │   ├── flir.glsl              # Forward-Looking Infrared (thermal)
│   │   ├── tactical.glsl          # Military tactical overlay
│   │   ├── classified.glsl        # "Classified" document aesthetic
│   │   └── bloom.glsl             # Glow/bloom for entities
│   ├── hud/                       # Tactical HUD components (~10 files)
│   │   ├── CommandConsole.tsx      # Bottom command input
│   │   ├── LayerPanel.tsx          # Left sidebar layer toggles
│   │   ├── EntityInspector.tsx     # Right panel entity details
│   │   ├── AlertFeed.tsx           # Scrolling alert ticker
│   │   ├── MiniMap.tsx             # 2D overview minimap
│   │   ├── DataFreshness.tsx       # Feed health indicators
│   │   ├── ThreatGauge.tsx         # Global threat level dial
│   │   ├── CameraPresets.tsx       # Jump-to presets bar
│   │   ├── DetectionMode.tsx       # Label density toggle
│   │   └── ClassifiedWatermark.tsx # "TOP SECRET//SCI" overlay
│   ├── services/                   # Data fetching services (~12 files)
│   │   ├── satelliteService.ts     # CelesTrak TLE + SGP4
│   │   ├── flightService.ts       # OpenSky API
│   │   ├── militaryFlightService.ts# ADS-B Exchange
│   │   ├── maritimeService.ts     # AIS stream
│   │   ├── earthquakeService.ts   # USGS GeoJSON
│   │   ├── cctvService.ts         # DOT camera feeds
│   │   ├── fireService.ts         # NASA FIRMS
│   │   ├── conflictService.ts     # ACLED/UCDP
│   │   ├── gdeltService.ts        # GDELT intelligence
│   │   ├── weatherService.ts      # Open-Meteo
│   │   └── infrastructureService.ts# OSM Overpass
│   ├── stores/                     # Zustand stores (~4 files)
│   │   ├── layerStore.ts          # Layer visibility + settings
│   │   ├── cameraStore.ts         # Camera state + presets
│   │   ├── entityStore.ts         # Selected entity state
│   │   └── alertStore.ts          # Alert/notification queue
│   ├── hooks/                      # Custom React hooks (~5 files)
│   │   ├── useDataLayer.ts        # Generic layer data hook
│   │   ├── useRealTimeUpdates.ts  # WebSocket connection hook
│   │   ├── useKeyboardShortcuts.ts# Keyboard navigation
│   │   ├── usePostProcessing.ts   # Shader toggle hook
│   │   └── useCameraFlyTo.ts      # Animated camera transitions
│   ├── utils/                      # Utilities (~5 files)
│   │   ├── circuitBreaker.ts      # Circuit breaker pattern
│   │   ├── coordinateUtils.ts     # Lat/lon/alt conversions
│   │   ├── militaryIdentifier.ts  # Callsign pattern matching
│   │   ├── colorSchemes.ts        # Tactical color palettes
│   │   └── formatters.ts          # Data formatters
│   ├── config/                     # Configuration (~5 files)
│   │   ├── landmarks.ts           # City/landmark coordinates
│   │   ├── militaryCallsigns.ts   # Military callsign database
│   │   ├── hotspots.ts            # Geopolitical hotspot definitions
│   │   ├── feeds.ts               # RSS/news feed definitions
│   │   └── constants.ts           # App-wide constants
│   └── types/                      # TypeScript types (~3 files)
│       ├── globe.ts               # Globe/Cesium types
│       ├── layers.ts              # Layer data types
│       └── entities.ts            # Entity types
├── server/                         # Backend proxy server
│   ├── index.ts                   # Express server entry
│   ├── routes/                    # API proxy routes (~8 files)
│   │   ├── opensky.ts             # OpenSky proxy
│   │   ├── adsb.ts                # ADS-B Exchange proxy
│   │   ├── satellites.ts          # CelesTrak/Space-Track proxy
│   │   ├── earthquakes.ts         # USGS proxy
│   │   ├── maritime.ts            # AIS proxy
│   │   ├── cctv.ts                # CCTV feed proxy
│   │   ├── gdelt.ts               # GDELT proxy
│   │   └── fires.ts               # NASA FIRMS proxy
│   ├── cache.ts                   # Caching layer
│   ├── rateLimiter.ts             # Per-API rate limiting
│   ├── websocket.ts               # WebSocket server
│   └── scheduler.ts               # Cron-based data refresh
└── deploy/                         # Deployment configs
    ├── nginx.conf                 # Nginx reverse proxy
    ├── pm2.config.js              # PM2 process config
    └── Dockerfile                 # Container option
```

**Total estimated files: ~85 files**
**Max file size: 400-500 lines per file (strict enforcement)**

---

## 4. Phase 1: 3D Globe Foundation

### Goal
Render a photorealistic 3D globe using CesiumJS with Google's Photorealistic 3D Tiles, creating the base canvas for all intelligence layers.

### Implementation

#### 4.1 CesiumJS Setup with Vite

Install CesiumJS and configure Vite to serve Cesium's static assets:

```
pnpm add cesium resium
pnpm add -D vite-plugin-cesium
```

Configure `vite.config.ts` with the Cesium plugin to copy Workers, Assets, Widgets, and ThirdParty to the build output.

#### 4.2 Google Photorealistic 3D Tiles

Register for a Google Maps Platform API key with the Map Tiles API enabled. Load the tileset via:

```typescript
// GlobeViewer.tsx
const tileset = viewer.scene.primitives.add(
  await Cesium.Cesium3DTileset.fromUrl(
    `https://tile.googleapis.com/v1/3dtiles/root.json?key=${GOOGLE_API_KEY}`
  )
);
```

#### 4.3 Globe Configuration

- Disable default imagery provider (Google tiles replace it)
- Enable depth testing against terrain
- Configure render settings: `fxaa: true`, `requestRenderMode: false` (continuous render for real-time)
- Set initial camera to an orbital view showing the full Earth
- Dark background (space black) with star field enabled
- Atmosphere rendering enabled for realistic edge glow

#### 4.4 Base Dark UI Shell

The initial page is a full-viewport Cesium canvas with a minimal dark overlay:
- Top bar: "PALANTIR v1.0 | UNCLASSIFIED // FOUO" timestamp + UTC clock
- Bottom bar: Coordinates readout, altitude, camera heading/pitch
- No sidebars initially — they slide in when activated

### Key Files
- `src/globe/GlobeViewer.tsx` — CesiumJS viewer initialization + 3D tiles
- `src/App.tsx` — Root layout with viewer + HUD overlay
- `vite.config.ts` — Cesium asset configuration

### Dependencies from worldmonitor reference
- Circuit breaker pattern: `src/utils/circuit-breaker.ts` — reuse this pattern for all API calls
- Theme system: `src/utils/theme-colors.ts` — adapt dark tactical color scheme

---

## 5. Phase 2: Tactical Visual Modes & Post-Processing

### Goal
Implement CRT, Night Vision (NVG), FLIR (thermal), and tactical overlay modes using CesiumJS post-processing stages with custom GLSL shaders.

### 5.1 Post-Processing Pipeline Architecture

CesiumJS provides `PostProcessStage` and `PostProcessStageComposite` for full-screen shader effects. Each visual mode is a composite of multiple stages.

### 5.2 Visual Modes

#### Mode 1: STANDARD
Default rendering. Clean photorealistic tiles with minimal overlay.

#### Mode 2: CRT (Cathode Ray Tube)
GLSL Fragment Shader Effects:
- **Scanlines**: Horizontal lines with configurable density (`uniform float scanlineDensity`)
- **Chromatic Aberration**: RGB channel offset (2-5px)
- **Vignette**: Darkened corners/edges
- **Noise/Static**: Animated grain overlay using `fract(sin(dot(...)))` noise function
- **Phosphor Glow**: Slight green/amber tint
- **Curvature**: Barrel distortion simulating CRT tube
- Uniforms: `scanlineDensity`, `chromaticAberration`, `noiseIntensity`, `curvature`

#### Mode 3: NIGHT VISION (NVG)
GLSL Fragment Shader Effects:
- **Green Phosphor Mapping**: Convert to luminance, apply green LUT (`vec3(0.0, lum * 1.2, 0.0)`)
- **Bloom/Glow**: Bright areas bleed with Gaussian blur
- **Film Grain**: High-frequency animated noise
- **Vignette**: Heavy circular vignette (tube effect)
- **Intensifier Halo**: Bright spots create circular halos
- Uniforms: `sensitivity`, `gainLevel`, `grainIntensity`

#### Mode 4: FLIR (Forward-Looking Infrared / Thermal)
GLSL Fragment Shader Effects:
- **Thermal Color Mapping**: Luminance to thermal palette (black -> blue -> magenta -> red -> yellow -> white)
- **Heat Signature Highlighting**: Entities (planes, ships, vehicles) rendered as hot spots
- **Edge Enhancement**: Sobel filter for structure outlines
- **Temperature Scale**: Color bar overlay showing temperature range
- Uniforms: `palette` (white-hot/black-hot/ironbow), `sensitivity`, `contrast`

#### Mode 5: TACTICAL
GLSL Fragment Shader Effects:
- **Desaturation**: Reduce to ~20% saturation
- **Grid Overlay**: MGRS/UTM grid lines
- **Edge Detection**: Laplacian edge detection for building outlines
- **High Contrast**: Enhance shadows and highlights
- **Blue Tint**: Slight blue-gray color grade

### 5.3 Shader Control Panel

Right-side collapsible panel with:
- Mode selector (keyboard shortcuts: `1-5`)
- Per-mode sliders (sensitivity, pixelation, noise, contrast)
- Bloom toggle + intensity slider
- Sharpen toggle + amount slider

### Key Files
- `src/shaders/crt.glsl` — CRT scanline shader
- `src/shaders/nightVision.glsl` — NVG shader
- `src/shaders/flir.glsl` — Thermal imaging shader
- `src/shaders/tactical.glsl` — Tactical overlay shader
- `src/globe/PostProcessing.tsx` — Shader pipeline manager
- `src/hud/DetectionMode.tsx` — Mode selection UI

---

## 6. Phase 3: Satellite Tracking Layer

### Goal
Display every trackable satellite in orbit in real-time using TLE data from CelesTrak, propagated with SGP4 via satellite.js.

### 6.1 Data Source: CelesTrak

- **URL**: `https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle`
- **Format**: Two-Line Element Sets (TLE)
- **Update Frequency**: Every 4-8 hours (satellites don't change position rapidly relative to TLE accuracy)
- **No Auth Required**: Free public access
- **Alternative**: Space-Track.org (requires free registration, better for bulk/historical)

### 6.2 SGP4 Propagation

```typescript
import { twoline2satrec, propagate, gstime, eciToGeodetic } from 'satellite.js';

function getSatellitePosition(tle1: string, tle2: string, date: Date) {
  const satrec = twoline2satrec(tle1, tle2);
  const positionAndVelocity = propagate(satrec, date);
  const gmst = gstime(date);
  const position = eciToGeodetic(positionAndVelocity.position, gmst);
  return {
    lat: position.latitude * (180 / Math.PI),
    lon: position.longitude * (180 / Math.PI),
    alt: position.height * 1000, // Convert km to meters
  };
}
```

### 6.3 Visualization

- **Points**: Each satellite as a colored point entity (`Cesium.PointGraphics`)
  - LEO (< 2000km): Cyan
  - MEO (2000-35786km): Yellow
  - GEO (~35786km): Red
  - Size: 3-8px based on zoom level
- **Labels**: NORAD catalog number + name (toggle-able via detection mode)
- **Orbit Lines**: When a satellite is selected, render its full orbital path as a `Cesium.PolylineGraphics` using 360 propagated points over one orbital period
- **Tracking Mode**: Click a satellite -> camera follows it in orbit
- **Sparse/Dense Toggle**: Sparse shows ~500 most important (ISS, Starlink, military recon). Dense shows all ~10,000+

### 6.4 Performance

- Use `Cesium.PointPrimitiveCollection` for bulk rendering (not individual entities)
- Propagate positions every 1 second using `requestAnimationFrame`
- Only propagate visible satellites (frustum culling)
- Batch TLE parsing on initial load in a Web Worker

### 6.5 Satellite Categories & Filtering

- **Communication**: Starlink, OneWeb, Iridium
- **Navigation**: GPS, GLONASS, Galileo, BeiDou
- **Weather**: NOAA, GOES, Meteosat
- **Military/Recon**: USA-series, Keyhole, Lacrosse
- **Science**: ISS, Hubble, JWST
- **Debris**: Trackable debris objects

### Key Files
- `src/layers/SatelliteLayer.tsx` — Cesium entity rendering
- `src/services/satelliteService.ts` — CelesTrak fetch + SGP4 propagation
- `server/routes/satellites.ts` — Backend TLE cache proxy

---

## 7. Phase 4: Aviation Intelligence Layer

### Goal
Display all commercial flights worldwide in real-time using OpenSky Network API data.

### 7.1 Data Source: OpenSky Network

- **URL**: `https://opensky-network.org/api/states/all`
- **Format**: JSON (array of state vectors)
- **Update Frequency**: Every 5-10 seconds (polling)
- **Auth**: Free account required (anonymous: 400 credits/day, registered: 4000 credits/day)
- **Rate Limit**: 1 request per 10 seconds (registered)
- **Fields**: icao24, callsign, origin_country, position (lat/lon/alt), velocity, heading, vertical_rate, on_ground, squawk

### 7.2 Visualization

- **3D Models**: Aircraft rendered as small 3D arrow/chevron models pointing in direction of travel
  - Color by altitude: Low (green) -> Mid (yellow) -> High (red)
  - Or color by airline/origin country
- **Detection Mode Sparse**: Just dots, no labels
- **Detection Mode Dense**: Callsign labels, altitude readouts
- **Tracking Mode**: Click aircraft -> camera follows it, shows:
  - Flight path trail (last 20 positions as polyline)
  - Info panel: callsign, origin, altitude, speed, heading, vertical rate, squawk code
- **Regional Loading**: Load flights by bounding box to reduce payload size
  - Use `lamin, lamax, lomin, lomax` parameters

### 7.3 Real-Time Position Interpolation

Between API updates (5-10s), interpolate aircraft positions using:
- Dead reckoning: `newPos = currentPos + velocity * deltaTime * heading`
- `Cesium.SampledPositionProperty` with `LAGRANGE` interpolation for smooth animation

### 7.4 Squawk Code Alerts

Special squawk codes trigger alerts:
- `7500`: Hijacking (RED ALERT)
- `7600`: Communication failure (AMBER)
- `7700`: Emergency (RED)
- These auto-trigger the alert feed and optional sound notification

### Key Files
- `src/layers/FlightLayer.tsx` — Aircraft rendering + tracking
- `src/services/flightService.ts` — OpenSky API + interpolation
- `server/routes/opensky.ts` — Backend proxy with auth + rate limiting

---

## 8. Phase 5: Military Aviation OSINT Layer

### Goal
Overlay military aircraft tracking from ADS-B Exchange, with callsign identification, aircraft type classification, and hotspot correlation.

### 8.1 Data Sources

#### Primary: ADS-B Exchange
- **URL**: `https://globe.adsbexchange.com/data/aircraft.json` (or V2 API)
- **Format**: JSON
- **Auth**: Free tier available, paid tiers for higher rate limits
- **Key Feature**: Does NOT filter military aircraft like FlightRadar24 does
- **Alternative**: `airplanes.live` API (free, community-driven)

#### Supplementary: airplanes.live
- **URL**: `https://api.airplanes.live/v2/mil`
- **Format**: JSON
- **No Auth Required**
- **Military-specific endpoint**: Returns only military-tagged aircraft

### 8.2 Military Identification Engine

Port the callsign pattern database from worldmonitor's `src/config/military.ts`:

**Callsign Pattern Matching:**
- US Air Force: `RCH/REACH` (transport), `KING/SHELL` (tanker), `COBRA/RIVET` (SIGINT), `SNTRY` (AWACS), `DRAGN` (U-2), `BONE/DEATH/DOOM` (bombers)
- US Navy: `NAVY`, `TRIDENT` (P-8 patrol), `RED` (P-3)
- US Marines: `MARINE`, `HMX` (Marine One)
- NATO: Various country-specific patterns
- ICAO hex range identification for military registrations

**Aircraft Type Classification:**
- Fighter, Bomber, Tanker, Transport, Reconnaissance, AWACS, Patrol, Special Ops, VIP, Helicopter, UAV

### 8.3 Visualization

- **Color by operator**: US (blue), NATO (green), Russia (red), China (orange), Others (white)
- **Icons by type**: Different symbols for fighters, bombers, tankers, recon, etc.
- **Orange highlight**: Military aircraft stand out from commercial traffic
- **Orbit pattern detection**: Aircraft circling an area highlighted as "SURVEILLANCE PATTERN"
- **Formation detection**: Multiple military aircraft in close proximity highlighted

### 8.4 Military Hotspot Correlation

Define geographic hotspots and alert when military aircraft are near:
- Pentagon, NATO HQ, Black Sea, South China Sea, Taiwan Strait, Korean DMZ, Persian Gulf, Arctic routes
- Calculate proximity and trigger "ELEVATED ACTIVITY" alerts

### Key Files
- `src/layers/MilitaryFlightLayer.tsx` — Military aircraft rendering
- `src/services/militaryFlightService.ts` — ADS-B Exchange + identification
- `src/config/militaryCallsigns.ts` — Callsign pattern database (port from worldmonitor)
- `server/routes/adsb.ts` — Backend proxy for ADS-B Exchange

---

## 9. Phase 6: Maritime Intelligence Layer

### Goal
Track global vessel movements using AIS data, highlighting military vessels, tanker movements, and anomalous behavior.

### 9.1 Data Sources

#### Primary: aisstream.io
- **URL**: `wss://stream.aisstream.io/v0/stream` (WebSocket)
- **Format**: JSON via WebSocket
- **Auth**: Free API key required
- **Real-Time**: True streaming, not polling
- **Data**: MMSI, vessel name, type, position, speed, heading, destination, cargo

#### Supplementary: AISHub
- **URL**: `http://data.aishub.net/ws.php?username=YOUR_KEY`
- **Format**: JSON/XML/CSV
- **Auth**: Free (requires sharing your own AIS feed)

### 9.2 Vessel Classification

- **Cargo**: Container ships, bulk carriers, general cargo (Gray)
- **Tanker**: Oil tankers, LNG carriers, chemical tankers (Orange)
- **Military**: Warships, submarines (surfaced), auxiliary (Red)
- **Passenger**: Cruise ships, ferries (Blue)
- **Fishing**: Trawlers, long-liners (Green)
- **Special**: Research vessels, cable layers, SAR (Yellow)

### 9.3 Visualization

- Ship icons rendered as directional triangles/arrows on the water surface
- Speed vectors (line ahead of vessel showing projected position)
- Wake trails for tracked vessels
- Vessel name labels in detection mode
- Click to inspect: full vessel details, flag state, destination, ETA

### 9.4 Anomaly Detection

- **Dark ships**: Vessels that stop transmitting AIS (gap in track)
- **Loitering**: Vessels stationary in unusual locations
- **Speed anomalies**: Sudden speed changes
- **Rendezvous**: Two vessels meeting at sea (ship-to-ship transfer)
- **Sanctioned vessels**: Cross-reference with OFAC sanctions list

### Key Files
- `src/layers/MaritimeLayer.tsx` — Vessel rendering
- `src/services/maritimeService.ts` — AIS WebSocket client
- `server/routes/maritime.ts` — AIS relay server

---

## 10. Phase 7: Seismic & Natural Disaster Layer

### Goal
Display real-time earthquake data, active wildfires, volcanic activity, and natural events on the globe.

### 10.1 Data Sources

#### Earthquakes: USGS
- **URL**: `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson`
- **Format**: GeoJSON
- **Update Frequency**: Every 1-5 minutes
- **No Auth Required**
- **Feeds**: Past Hour (all/significant), Past Day (all/M1+/M2.5+/M4.5+/significant), Past 7 Days, Past 30 Days

#### Wildfires: NASA FIRMS
- **URL**: `https://firms.modaps.eosdis.nasa.gov/api/area/csv/{MAP_KEY}/VIIRS_SNPP_NRT/world/1`
- **Format**: CSV/JSON
- **Auth**: Free MAP_KEY required
- **Update**: Near real-time (satellite overpass dependent)

#### Natural Events: NASA EONET
- **URL**: `https://eonet.gsfc.nasa.gov/api/v3/events`
- **Format**: JSON
- **No Auth Required**
- **Events**: Wildfires, severe storms, volcanoes, floods, sea/lake ice

#### Volcanoes: Smithsonian GVP
- **URL**: `https://volcano.si.edu/` (RSS feeds)
- **Format**: RSS/XML
- **No Auth Required**

### 10.2 Earthquake Visualization

- **Pulsing circles**: Magnitude-proportional radius, pulsing animation
- **Color by depth**: Shallow (< 70km, red) -> Intermediate (70-300km, orange) -> Deep (> 300km, yellow)
- **Size by magnitude**: M1 = 5px, M5 = 25px, M7+ = 50px with glow
- **Seismic waves**: Animated expanding rings from epicenter for recent quakes (< 1 hour)
- **Timeline**: Ability to scrub through past 24h/7d/30d of seismic activity
- **Tectonic plate boundaries**: Subtle polyline overlay

### 10.3 Wildfire Visualization

- **Fire hotspots**: Orange/red dots from VIIRS/MODIS
- **Fire perimeters**: Polygons where available
- **Smoke plume direction**: Wind-based particle animation
- **Thermal anomaly intensity**: Color intensity by FRP (Fire Radiative Power)

### Key Files
- `src/layers/SeismicLayer.tsx` — Earthquake + volcano rendering
- `src/layers/FireLayer.tsx` — Wildfire rendering
- `src/services/earthquakeService.ts` — USGS feed
- `src/services/fireService.ts` — NASA FIRMS feed
- `server/routes/earthquakes.ts` — USGS proxy
- `server/routes/fires.ts` — FIRMS proxy

---

## 11. Phase 8: CCTV Surveillance Feed Integration

### Goal
Integrate live public traffic camera feeds projected onto the 3D globe, with camera selection and real-time image display.

### 11.1 Data Sources (Public DOT Cameras)

#### Austin, TX (as shown in video)
- **URL**: `https://its.txdot.gov/api/cameras` (or specific DOT feeds)
- **Format**: JPEG snapshots (1 frame per minute)
- **No Auth Required**

#### NYC DOT
- **URL**: `https://webcams.nyctmc.org/api/cameras`
- **Format**: JPEG streams
- **No Auth Required**

#### London (TfL)
- **URL**: `https://api.tfl.gov.uk/Place/Type/JamCam`
- **Format**: JPEG snapshots
- **No Auth Required**

#### Aggregators
- **Insecam** (aggregates public cameras worldwide — use with caution, verify legality)
- **Windy Webcams API**: `https://api.windy.com/webcams/v2/list`

### 11.2 Implementation

- Fetch camera metadata (lat, lon, name, feed URL) for supported cities
- Place camera icons on the globe at their geo-coordinates
- Click camera -> open feed panel showing:
  - Live JPEG (auto-refreshing every 30-60 seconds)
  - Camera name, location, last update time
  - "Jump to Camera" -> Fly camera to street level at that location
- Advanced: Project camera feed onto 3D geometry as a billboard/texture
  - Use `Cesium.BillboardGraphics` with auto-updating image URL
  - Or texture mapping onto a rectangle at the camera's frustum position

### 11.3 Camera Feed Projection (Advanced)

For the spy-movie effect of projecting CCTV onto 3D buildings:
- Define camera position (lat, lon, height) and orientation (heading, pitch, FOV)
- Create a `Cesium.RectanglePrimitive` or frustum-shaped geometry
- Apply the camera feed as a texture via `Cesium.Material` with dynamic `Image`
- Update texture every 30-60 seconds

### Key Files
- `src/layers/CCTVLayer.tsx` — Camera marker rendering + feed display
- `src/services/cctvService.ts` — Camera metadata + feed fetching
- `src/hud/CCTVPanel.tsx` — Camera selection + feed viewer panel
- `server/routes/cctv.ts` — CORS proxy for camera JPEG feeds

---

## 12. Phase 9: Street Traffic Simulation Layer

### Goal
Simulate street-level traffic using OpenStreetMap road network data, creating an animated particle system showing vehicle movement along roads.

### 12.1 Data Source: Overpass API (OpenStreetMap)

- **URL**: `https://overpass-api.de/api/interpreter`
- **Query**: Fetch road geometries for a given bounding box
- **Format**: JSON (nodes + ways)
- **No Auth Required** (rate limited, cache results)

Example Overpass query for roads in a city:
```
[out:json][timeout:30];
way["highway"~"^(motorway|trunk|primary|secondary|tertiary)$"](bbox);
(._;>;);
out body;
```

### 12.2 Traffic Particle System

1. **Road Network Loading**:
   - Fetch road geometries for the visible area
   - Parse ways into polyline segments
   - Classify roads: motorway > trunk > primary > secondary > tertiary

2. **Sequential Loading** (performance critical):
   - First: Motorways and trunk roads (highest traffic)
   - Then: Primary and secondary roads
   - Finally: Tertiary roads (only at close zoom)

3. **Particle System**:
   - Spawn "vehicle" particles along road segments
   - Each particle moves along the road geometry at a speed proportional to road class
   - Motorways: 100-130 km/h, Primary: 50-80 km/h, Residential: 30-50 km/h
   - Particles rendered as small dots or short line segments (trail effect)
   - Use `Cesium.PointPrimitiveCollection` for performance

4. **Density Control**:
   - Time-of-day based density (peak hours more traffic)
   - Road class based density (motorways more vehicles per km)
   - User-adjustable density slider

### 12.3 Visual Modes for Traffic

- **Standard**: White/yellow dots moving along roads
- **NVG mode**: Green dots on dark roads
- **FLIR mode**: Hot dots (vehicles as heat sources) on cold roads
- **Sparse labels**: Road names at intersections
- **Dense labels**: Vehicle count per road segment

### Key Files
- `src/layers/TrafficLayer.tsx` — Particle system renderer
- `src/services/trafficService.ts` — Overpass API + road parsing
- `server/routes/traffic.ts` — Overpass proxy with caching

---

## 13. Phase 10: SIGINT & OSINT News Intelligence

### Goal
Aggregate intelligence from GDELT, RSS feeds, Telegram channels, and social media OSINT to provide real-time situational awareness of global events.

### 13.1 Data Sources

#### GDELT (Global Database of Events, Language, and Tone)
- **DOC API URL**: `https://api.gdeltproject.org/api/v2/doc/doc?query=QUERY&mode=artlist&format=json`
- **GEO API URL**: `https://api.gdeltproject.org/api/v2/geo/geo?query=QUERY&mode=pointdata&format=geojson`
- **No Auth Required** (rate limited)
- **Update**: Every 15 minutes
- **Capability**: Full-text search across 100+ languages, tone analysis, theme extraction, geocoded events

#### RSS Feeds (adapted from worldmonitor)
Source tiers from worldmonitor's `src/config/feeds.ts`:
- **Tier 1 Wire Services**: Reuters, AP, AFP, Bloomberg
- **Tier 1 Government**: White House, State Dept, Pentagon, UN News, CISA
- **Tier 2 Major Outlets**: BBC, CNN, Al Jazeera, Guardian
- **Tier 3 Specialty**: Defense One, The War Zone, Bellingcat, Krebs Security, Janes, USNI News

#### Telegram OSINT Channels
- Use Telegram API to monitor public OSINT channels
- Key channels: OSINT aggregators, conflict monitoring, military spotters

### 13.2 Intelligence Processing Pipeline

```
Raw Feed → Geocode → Classify Threat Level → Deduplicate → Score → Display
```

1. **Geocoding**: Extract locations from article text, map to lat/lon
2. **Threat Classification**: ML-based or keyword-based severity scoring
   - CRITICAL (red), HIGH (orange), MEDIUM (yellow), LOW (green), INFO (blue)
3. **Clustering**: Group articles about the same event
4. **Velocity Detection**: Detect story velocity (how fast a topic is spreading)
5. **Entity Extraction**: Identify countries, organizations, persons mentioned

### 13.3 Visualization on Globe

- **Event Markers**: Geocoded news events as pulsing markers on the globe
  - Color by threat level
  - Size by source count (more sources = bigger marker)
- **Heatmap Mode**: Density heatmap of global event activity
- **Connection Lines**: Draw lines between related events/entities
- **News Ticker**: Scrolling headline ticker in the HUD

### 13.4 Intelligence Topics (from worldmonitor)

Pre-defined intelligence queries:
- Military Activity: exercises, deployments, airstrikes
- Cyber Threats: cyberattacks, ransomware, APTs
- Nuclear: enrichment, IAEA, weapons tests
- Sanctions: trade wars, embargoes
- Terrorism: attacks, plots, arrests
- Political Unrest: protests, coups, elections
- Natural Disasters: earthquakes, hurricanes, floods
- Maritime Security: piracy, naval incidents

### Key Files
- `src/services/gdeltService.ts` — GDELT API integration
- `src/services/newsService.ts` — RSS aggregation + classification
- `src/hud/AlertFeed.tsx` — Scrolling intelligence ticker
- `src/hud/IntelPanel.tsx` — Intelligence analysis panel
- `server/routes/gdelt.ts` — GDELT proxy

---

## 14. Phase 11: Geopolitical Conflict & Threat Layer

### Goal
Visualize active conflicts, military deployments, threat zones, and geopolitical hotspots.

### 14.1 Data Sources

#### ACLED (Armed Conflict Location & Event Data)
- **URL**: `https://api.acleddata.com/acled/read`
- **Auth**: Free registration required
- **Data**: Battles, explosions/remote violence, riots, protests, strategic developments
- **Coverage**: Global, near real-time

#### UCDP (Uppsala Conflict Data Program)
- **URL**: `https://ucdpapi.pcr.uu.se/api/gedevents/24.1`
- **Format**: JSON
- **No Auth Required**
- **Data**: State-based conflicts, non-state conflicts, one-sided violence

#### GDACS (Global Disaster Alert and Coordination System)
- **URL**: `https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH`
- **Format**: GeoJSON/XML
- **No Auth Required**

### 14.2 Hotspot Definitions

Define persistent geopolitical hotspots with escalation scoring:

```typescript
interface Hotspot {
  id: string;
  name: string;
  lat: number;
  lon: number;
  radius: number;        // km
  baselineThreat: number; // 0-100
  category: 'conflict' | 'nuclear' | 'maritime' | 'cyber' | 'political';
}
```

Hotspots: Ukraine/Donbas, Taiwan Strait, South China Sea, Korean DMZ, Iran/Persian Gulf, Israel/Gaza, Yemen/Red Sea, Kashmir, Sahel Region, Horn of Africa, Venezuela, Myanmar, Arctic (Northern Sea Route)

### 14.3 Visualization

- **Conflict zones**: Semi-transparent red/orange polygons
- **Hotspot circles**: Pulsing concentric rings at hotspot centers
- **Event markers**: ACLED events as typed icons (battle, explosion, protest)
- **Escalation gauge**: Per-hotspot escalation score in the HUD
- **Threat corridors**: Lines connecting related hotspots

### Key Files
- `src/layers/ConflictLayer.tsx` — Conflict event rendering
- `src/services/conflictService.ts` — ACLED/UCDP integration
- `src/config/hotspots.ts` — Hotspot definitions + escalation logic

---

## 15. Phase 12: Infrastructure & Critical Assets Layer

### Goal
Map critical infrastructure including military bases, nuclear facilities, submarine cables, pipelines, data centers, and ports.

### 15.1 Data Sources

#### Military Bases
- Static dataset from OSINT sources (Wikipedia, GlobalSecurity.org)
- ~800 major US/NATO bases worldwide
- Fields: name, lat, lon, branch, country, status

#### Submarine Cables
- **URL**: `https://raw.githubusercontent.com/telegeography/www.submarinecablemap.com/master/web/public/api/v3/cable/cable-geo.json`
- **Format**: GeoJSON
- **No Auth Required**

#### Nuclear Facilities
- IAEA PRIS database (static extract)
- Fields: name, type (power/research/enrichment), lat, lon, country, status

#### Oil & Gas Pipelines
- OpenStreetMap + static curated datasets
- Major pipelines: Nord Stream, TAPI, Keystone, etc.

#### Data Centers / AI Labs
- Curated dataset of major cloud/AI data center locations
- Fields: operator, capacity, lat, lon

### 15.2 Visualization

- **Military bases**: Shield/star icons colored by branch
- **Nuclear facilities**: Radiation symbol icons
- **Submarine cables**: Polylines on ocean floor (colored by operator)
- **Pipelines**: Polylines on land (colored by type: oil/gas)
- **Data centers**: Server rack icons
- **Proximity alerts**: Warn when conflict events occur near critical infrastructure

### Key Files
- `src/layers/InfrastructureLayer.tsx` — Static asset rendering
- `src/config/infrastructure.ts` — Infrastructure database
- `src/services/infrastructureService.ts` — Overpass API for dynamic queries

---

## 16. Phase 13: Camera Presets & Cinematic Navigation

### Goal
Create a preset system for instantly jumping to landmarks, cities, and strategic locations with cinematic camera animations.

### 16.1 Camera Preset System

Each preset defines:
```typescript
interface CameraPreset {
  name: string;
  lat: number;
  lon: number;
  height: number;        // Camera altitude in meters
  heading: number;       // Compass heading (degrees)
  pitch: number;         // Camera pitch (degrees, -90 = looking down)
  roll: number;
  duration: number;      // Animation duration in seconds
  category: 'city' | 'landmark' | 'hotspot' | 'strategic';
}
```

### 16.2 City Presets

Major cities with their iconic landmarks centered:
- **New York**: Statue of Liberty, Manhattan skyline
- **London**: Big Ben, Tower Bridge
- **Dubai**: Burj Khalifa, Palm Jumeirah
- **Tokyo**: Tokyo Tower, Shibuya
- **Moscow**: Kremlin, Red Square
- **Beijing**: Forbidden City, Tiananmen
- **Washington DC**: Pentagon, Capitol
- **Paris**: Eiffel Tower, Arc de Triomphe
- **Singapore**: Marina Bay Sands
- **Sydney**: Opera House, Harbour Bridge

### 16.3 Strategic Presets

- **Taiwan Strait**: Aerial view showing both sides
- **Korean DMZ**: Looking south from north
- **Persian Gulf**: Strait of Hormuz choke point
- **South China Sea**: Spratly Islands overview
- **Suez Canal**: Top-down chokepoint view
- **Bosphorus**: Istanbul strait view
- **Gibraltar**: Mediterranean gateway

### 16.4 Keyboard Navigation

- `Q, W, E, R, T` — Cycle through presets in current city
- `Shift + 1-9` — Jump to city preset group
- `Space` — Toggle orbit mode (camera orbits current target)
- `Arrow keys` — Pan camera
- `+/-` — Zoom in/out
- `Home` — Return to full Earth view

### 16.5 Cinematic Camera Modes

- **Orbit**: Camera orbits the current target at fixed distance
- **Follow**: Camera follows a selected entity (satellite, aircraft, ship)
- **Flythrough**: Automated tour through multiple presets
- **Locked**: Camera locked to a ground point, entities move around it

### Key Files
- `src/globe/CameraController.tsx` — Camera animation engine
- `src/config/landmarks.ts` — Preset database
- `src/hud/CameraPresets.tsx` — Preset selection UI
- `src/hooks/useCameraFlyTo.ts` — Animated flyTo hook
- `src/hooks/useKeyboardShortcuts.ts` — Keyboard binding system

---

## 17. Phase 14: Command Console & HUD System

### Goal
Build a tactical heads-up display with a command console, layer management, entity inspection, and classified-intelligence aesthetic.

### 17.1 HUD Layout

```
+------------------------------------------------------------------+
| [TOP BAR] PALANTIR v1.0 | UNCLASSIFIED//FOUO | 2026-03-02 14:32Z |
|          Feeds: 12/15 ONLINE | Entities: 45,231 | FPS: 60        |
+--------+------------------------------------------+--------------+
|        |                                          |              |
| [LEFT] |          3D GLOBE VIEWPORT               | [RIGHT]      |
| LAYER  |                                          | ENTITY       |
| PANEL  |                                          | INSPECTOR    |
|        |                                          |              |
| SAT [x]|                                          | NORAD 25544  |
| FLT [x]|                                          | ISS          |
| MIL [ ]|                                          | Alt: 408km   |
| SEA [ ]|                                          | Speed: 7.66  |
| EQ  [x]|                                          | km/s         |
| CAM [ ]|                                          | Orbit: LEO   |
| TFC [ ]|                                          | Period: 92m  |
|        |                                          |              |
+--------+------------------------------------------+--------------+
| [BOTTOM BAR] Lat: 38.8977 | Lon: -77.0365 | Alt: 45.2km         |
| Heading: 045.3 | Pitch: -35.2 | Mode: NVG                        |
| [ALERT TICKER] >>> BREAKING: 5.8 earthquake Tonga... <<<         |
+------------------------------------------------------------------+
| > COMMAND CONSOLE: _                                              |
+------------------------------------------------------------------+
```

### 17.2 Command Console

Text-input command bar at the bottom (activated with `/` or backtick):

Commands:
- `goto <city/landmark>` — Fly to location
- `track <callsign/NORAD>` — Track entity
- `filter <type> <criteria>` — Filter layer data
- `mode <crt/nvg/flir/tac>` — Switch visual mode
- `layer <name> on/off` — Toggle layer
- `alert <on/off>` — Toggle alert sounds
- `density <sparse/dense>` — Set label density
- `screenshot` — Capture current view
- `record` — Start/stop screen recording
- `search <query>` — Search GDELT/news

### 17.3 Classified Document Aesthetic

- **Font**: Courier New / JetBrains Mono (monospace throughout)
- **Color Scheme**:
  - Background: `#0a0a0a` (near black)
  - Primary text: `#00ff41` (matrix green) or `#ff6600` (amber)
  - Secondary text: `#666666`
  - Borders: `#1a1a1a` with subtle `#333` highlights
  - Alert red: `#ff0000`
  - Warning amber: `#ffaa00`
  - Info cyan: `#00ffff`
- **"TOP SECRET//SCI" Watermark**: Faint diagonal text across the viewport (toggle-able)
- **Scanline overlay**: Subtle CSS scanlines over the entire HUD
- **Blinking cursor**: Command console with blinking block cursor
- **Boot sequence**: On app load, fake "system initialization" sequence with cascading text

### 17.4 Sound Design (Optional)

- Subtle UI sounds: click, toggle, alert beep
- Keyboard typing sounds in command console
- Alert klaxon for critical events
- Ambient electronic hum (toggle-able)

### Key Files
- `src/hud/CommandConsole.tsx` — Command input + parser
- `src/hud/LayerPanel.tsx` — Left sidebar layer toggles
- `src/hud/EntityInspector.tsx` — Right panel entity details
- `src/hud/AlertFeed.tsx` — Scrolling alert ticker
- `src/hud/TopBar.tsx` — Status bar + clock
- `src/hud/BottomBar.tsx` — Coordinates + mode indicator
- `src/hud/ClassifiedWatermark.tsx` — TOP SECRET overlay

---

## 18. Phase 15: Data Fusion Engine

### Goal
Cross-correlate data from multiple layers to generate fused intelligence assessments and composite alerts.

### 18.1 Fusion Rules

1. **Military aircraft near conflict zone** → ELEVATED alert
2. **Earthquake near nuclear facility** → CRITICAL infrastructure alert
3. **Ship AIS loss near sanctioned country** → SUSPICIOUS activity flag
4. **Spike in GDELT articles about region + military movement** → ESCALATION warning
5. **Multiple data sources converging on location** → FOCAL POINT detection
6. **Satellite overhead during conflict event** → POSSIBLE ISR (intelligence, surveillance, reconnaissance) collection

### 18.2 Composite Threat Score

For each geographic region, calculate a composite score:

```
Score = w1 * conflictActivity + w2 * militaryPresence + w3 * newsVelocity
      + w4 * seismicRisk + w5 * infrastructureProximity + w6 * historicalBaseline
```

Display as a global threat gauge in the HUD and per-region heatmap overlay.

### 18.3 Proximity Engine

Efficiently detect when entities from different layers are within a threshold distance:
- Use spatial hashing or R-tree index for O(n log n) proximity queries
- Run every 30 seconds on position updates
- Generate fusion events when thresholds are crossed

### Key Files
- `src/services/fusionEngine.ts` — Cross-layer correlation logic
- `src/services/proximityEngine.ts` — Spatial proximity detection
- `src/hud/ThreatGauge.tsx` — Global threat level visualization

---

## 19. Phase 16: Backend Proxy & Caching Layer

### Goal
Build a Node.js backend that proxies all external API calls, handles authentication, rate limiting, caching, and WebSocket broadcasting.

### 19.1 Architecture

```
Client ──> Express Server ──> Cache Layer ──> External APIs
                |
           WebSocket Server ──> Client subscriptions
                |
           Cron Scheduler ──> Pre-fetch high-priority feeds
```

### 19.2 API Route Specifications

| Route | Upstream | Cache TTL | Auth | Rate Limit |
|-------|----------|-----------|------|------------|
| `/api/satellites/tle` | CelesTrak | 4 hours | None | 10/hour |
| `/api/flights` | OpenSky | 10 sec | API Key | 6/min |
| `/api/military` | ADS-B Exchange / airplanes.live | 15 sec | API Key | 4/min |
| `/api/maritime` | aisstream.io | Streaming | API Key | WebSocket |
| `/api/earthquakes` | USGS | 1 min | None | 60/hour |
| `/api/fires` | NASA FIRMS | 15 min | MAP_KEY | 30/hour |
| `/api/gdelt` | GDELT API | 5 min | None | 30/hour |
| `/api/cctv/:city` | DOT APIs | 30 sec | Varies | 60/hour |
| `/api/conflicts` | ACLED | 1 hour | API Key | 10/hour |
| `/api/weather` | Open-Meteo | 15 min | None | 60/hour |

### 19.3 Caching Strategy

- **In-Memory Cache**: `node-cache` with per-route TTL
- **Stale-While-Revalidate**: Serve cached data while fetching fresh data in background
- **Circuit Breaker**: If upstream fails 3 times, stop trying for 5 minutes, serve stale cache
- **Deduplication**: Hash incoming data to avoid re-broadcasting unchanged data via WebSocket

### 19.4 WebSocket Server

- Clients subscribe to channels: `satellites`, `flights`, `military`, `maritime`, `earthquakes`, `alerts`
- Server pushes delta updates (only changed/new entities)
- Heartbeat every 30 seconds
- Auto-reconnect on client side with exponential backoff

### 19.5 Environment Variables

```env
# Google
GOOGLE_MAPS_API_KEY=

# OpenSky Network
OPENSKY_USERNAME=
OPENSKY_PASSWORD=

# ADS-B Exchange
ADSB_API_KEY=

# aisstream.io
AISSTREAM_API_KEY=

# NASA FIRMS
FIRMS_MAP_KEY=

# Space-Track.org
SPACETRACK_USERNAME=
SPACETRACK_PASSWORD=

# ACLED
ACLED_API_KEY=
ACLED_EMAIL=

# CelesTrak (no auth needed)
# USGS (no auth needed)
# GDELT (no auth needed)
# EONET (no auth needed)
# Overpass (no auth needed)
```

### Key Files
- `server/index.ts` — Express server + WebSocket setup
- `server/cache.ts` — Cache layer with TTL + stale-while-revalidate
- `server/rateLimiter.ts` — Per-route rate limiting
- `server/websocket.ts` — WebSocket subscription management
- `server/scheduler.ts` — Cron-based data pre-fetching
- `server/routes/*.ts` — Individual route handlers

---

## 20. Phase 17: Deployment & Operations

### 20.1 Local Development

```bash
# Install dependencies
pnpm install

# Start backend
pnpm run dev:server

# Start frontend
pnpm run dev

# Open browser to http://localhost:5173
```

### 20.2 Contabo VPS Deployment

1. **CyberPanel**: Create site `palantir.hanzla.com` with SSL
2. **Nginx Config**: Reverse proxy to backend (port 3001) + serve frontend static files
3. **PM2**: Run backend as persistent process
4. **Build**: `pnpm run build` -> deploy `dist/` to `/home/palantir.hanzla.com/public_html/`

### 20.3 Nginx Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name palantir.hanzla.com;

    root /home/palantir.hanzla.com/public_html;
    index index.html;

    # API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # WebSocket proxy
    location /ws {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 21. Open Source Data Feed Registry

### Complete list of all data feeds integrated:

| # | Feed | API | Auth | Update Rate | Data Type |
|---|------|-----|------|-------------|-----------|
| 1 | **Satellite TLEs** | CelesTrak | None | 4-8h | Orbital elements |
| 2 | **Satellite TLEs (backup)** | Space-Track.org | Free account | 4-8h | Orbital elements |
| 3 | **Commercial Flights** | OpenSky Network | Free account | 5-10s | Aircraft positions |
| 4 | **Military Flights** | ADS-B Exchange | API key | 5-15s | Unfiltered aircraft |
| 5 | **Military Flights (alt)** | airplanes.live | None | 5-15s | Military-tagged aircraft |
| 6 | **Ship Tracking** | aisstream.io | Free API key | Real-time WS | Vessel positions |
| 7 | **Ship Tracking (alt)** | AISHub | Free (share feed) | 1-5min | Vessel positions |
| 8 | **Earthquakes** | USGS GeoJSON | None | 1-5min | Seismic events |
| 9 | **Wildfires** | NASA FIRMS | Free MAP_KEY | ~60s | Fire hotspots |
| 10 | **Natural Events** | NASA EONET | None | 15min | Multi-hazard events |
| 11 | **CCTV (Austin)** | TxDOT | None | 1min | Camera snapshots |
| 12 | **CCTV (NYC)** | NYCTMC | None | 30s | Camera snapshots |
| 13 | **CCTV (London)** | TfL JamCam | None | 5min | Camera snapshots |
| 14 | **Road Network** | Overpass/OSM | None | Static | Road geometry |
| 15 | **News Intelligence** | GDELT | None | 15min | Geocoded articles |
| 16 | **Armed Conflicts** | ACLED | Free account | Daily | Conflict events |
| 17 | **Conflict Events** | UCDP | None | Periodic | Armed conflict |
| 18 | **Disaster Alerts** | GDACS | None | 15min | Multi-hazard |
| 19 | **Submarine Cables** | TeleGeography | None | Static | Cable routes |
| 20 | **Weather** | Open-Meteo | None | 15min | Weather data |
| 21 | **GPS Interference** | GPSJam.org | None | Hourly | GNSS interference |
| 22 | **Prediction Markets** | Polymarket | None | 5min | Event probabilities |
| 23 | **Webcams** | Windy Webcams | API key | 5min | Global camera feeds |
| 24 | **Volcanoes** | Smithsonian GVP | None | Daily | Volcanic activity |
| 25 | **Nuclear Facilities** | IAEA PRIS | None | Static | Nuclear plant data |
| 26 | **Cyber Threats** | CISA KEV | None | Daily | Known exploited vulns |
| 27 | **Telegram OSINT** | Telegram API | Bot token | Real-time | OSINT channel msgs |
| 28 | **RSS News Feeds** | Multiple | None | 5-15min | News articles |

**Total: 28 live data feeds**

---

## 22. Verification & Testing

### 22.1 Phase-by-Phase Verification

| Phase | Test | Expected Result |
|-------|------|-----------------|
| 1: Globe | Load app, see 3D Earth | Photorealistic tiles render with star field |
| 2: Shaders | Press 1-5 keys | Switch between Standard/CRT/NVG/FLIR/Tactical |
| 3: Satellites | Toggle satellite layer | See 10K+ dots orbiting Earth, click to track |
| 4: Flights | Toggle flight layer | See 6K+ aircraft dots with callsigns |
| 5: Military | Toggle military layer | Orange military aircraft with type labels |
| 6: Maritime | Toggle maritime layer | Ship icons on oceans with direction |
| 7: Seismic | Toggle earthquake layer | Pulsing circles at recent epicenters |
| 8: CCTV | Toggle CCTV, select camera | See live camera feed from Austin/NYC |
| 9: Traffic | Toggle traffic, zoom to city | Animated dots moving along roads |
| 10: Intel | Check alert feed | Scrolling headlines from GDELT/RSS |
| 11: Conflicts | Toggle conflict layer | Red markers at active conflict zones |
| 12: Infrastructure | Toggle infrastructure | Military bases, cables, nuke facilities |
| 13: Camera | Press Q/W/E/R/T | Cinematic flyto between landmarks |
| 14: HUD | All panels visible | Command console, layer panel, inspector |
| 15: Fusion | Multiple layers active | Cross-layer alerts firing |
| 16: Backend | Hit /api/* endpoints | JSON responses with cached data |
| 17: Deploy | Visit palantir.hanzla.com | Full app running on VPS |

### 22.2 Performance Targets

- **60 FPS** with 3D tiles + 2 active data layers
- **30+ FPS** with 3D tiles + all layers active
- **< 3 second** initial load to globe visible
- **< 500MB** browser memory with all layers
- **< 100ms** camera preset transition initiation

### 22.3 Browser Compatibility

- Chrome 120+ (primary target)
- Firefox 115+
- Edge 120+
- Safari 17+ (WebGL2 required)

---

## Implementation Priority Order

The phases should be implemented in this exact order, as each builds on the previous:

1. **Phase 1**: 3D Globe Foundation (MUST be first — everything renders on this)
2. **Phase 16**: Backend Proxy (needed before any data layers)
3. **Phase 14**: HUD System (framework for all panels)
4. **Phase 2**: Visual Modes (makes everything look spy-like immediately)
5. **Phase 3**: Satellite Tracking (most visually impressive, space layer)
6. **Phase 4**: Commercial Flights (highest data density)
7. **Phase 5**: Military Aviation (the OSINT differentiator)
8. **Phase 7**: Seismic Events (simple to implement, high visual impact)
9. **Phase 10**: News Intelligence (GDELT/RSS feeds)
10. **Phase 13**: Camera Presets (cinematic navigation)
11. **Phase 6**: Maritime Tracking (ships)
12. **Phase 8**: CCTV Feeds (surveillance aesthetic)
13. **Phase 9**: Street Traffic (particle system)
14. **Phase 11**: Conflict Layer (ACLED integration)
15. **Phase 12**: Infrastructure (static assets)
16. **Phase 15**: Data Fusion (cross-layer intelligence)
17. **Phase 17**: Deployment (ship it)

---

## Key Patterns to Reuse from worldmonitor

| Pattern | Source File | Usage |
|---------|------------|-------|
| Circuit Breaker | `src/utils/circuit-breaker.ts` | All API calls |
| Military Callsign DB | `src/config/military.ts` | Military flight identification |
| Feed Tier System | `src/config/feeds.ts` | RSS source prioritization |
| Threat Classification | `src/services/threat-classifier.ts` | Event severity scoring |
| GDELT Integration | `src/services/gdelt-intel.ts` | Intelligence topic queries |
| Earthquake Service | `src/services/earthquakes.ts` | Seismic data fetching |
| Military Flight Service | `src/services/military-flights.ts` | ADS-B data processing |
| Hotspot Definitions | `src/config/entities.ts` | Geopolitical hotspot coords |
| News Clustering | `src/services/clustering.ts` | Event deduplication |
| Entity Extraction | `src/services/entity-extraction.ts` | NLP entity detection |

---

*This plan represents a full-spectrum open-source intelligence platform. Each phase is independently deployable — you can ship the globe + 2-3 layers and iterate. The spy aesthetic comes from Phase 2 (shaders) and Phase 14 (HUD), so prioritize those early for maximum visual impact.*
