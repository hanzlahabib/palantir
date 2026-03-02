# Epic 01: 3D Globe Foundation

## Priority: CRITICAL (must be first)
## Dependencies: None
## Blocks: All other epics
## Estimated Effort: 1-2 days
## Parallelizable With: Nothing (foundation)

---

## Objective
Render a photorealistic 3D globe using CesiumJS with Google Photorealistic 3D Tiles. This is the canvas upon which every data layer will be rendered.

## Tasks

### 1.1 Project Initialization
- Initialize Vite + React + TypeScript project with `pnpm create vite`
- Install core dependencies: `cesium`, `resium`, `zustand`, `tailwindcss`, `sonner`
- Configure `vite-plugin-cesium` for static asset handling
- Set up path aliases (`@/` -> `src/`)
- Create `.env.example` with all API key placeholders
- Set up Tailwind with dark tactical theme

### 1.2 CesiumJS Viewer Setup
- Create `src/globe/GlobeViewer.tsx`
- Initialize `Cesium.Viewer` with:
  - `animation: false` (no animation widget)
  - `baseLayerPicker: false`
  - `fullscreenButton: false`
  - `geocoder: false`
  - `homeButton: false`
  - `infoBox: false`
  - `sceneModePicker: false`
  - `selectionIndicator: false`
  - `timeline: false`
  - `navigationHelpButton: false`
  - `requestRenderMode: false` (continuous render for real-time data)
  - `msaaSamples: 4` (anti-aliasing)
- Enable scene features:
  - `viewer.scene.globe.enableLighting = true`
  - `viewer.scene.skyBox` with star textures
  - `viewer.scene.skyAtmosphere.show = true`
  - `viewer.scene.fog.enabled = true`
  - Depth testing against terrain/tiles

### 1.3 Google Photorealistic 3D Tiles
- Load tileset: `Cesium.Cesium3DTileset.fromUrl()` with Google API key
- URL: `https://tile.googleapis.com/v1/3dtiles/root.json?key=${GOOGLE_API_KEY}`
- Configure tileset:
  - `maximumScreenSpaceError: 16` (quality vs performance balance)
  - `maximumMemoryUsage: 512` (MB)
  - `skipLevelOfDetail: true`
  - `dynamicScreenSpaceError: true`

### 1.4 Initial Camera Configuration
- Default view: Full Earth orbital view
- Camera: `{ longitude: 0, latitude: 20, height: 20000000 }` (20,000 km up)
- Enable mouse/touch interaction:
  - Left drag: rotate globe
  - Right drag / middle drag: zoom
  - Ctrl + drag: tilt
  - Scroll: zoom

### 1.5 Dark UI Shell
- Full viewport Cesium canvas
- Top bar overlay: App name + UTC clock + basic status
- Bottom bar overlay: Camera coordinates (lat, lon, alt, heading, pitch)
- Dark theme (`#0a0a0a` background for overlay areas)
- Monospace font (JetBrains Mono / Fira Code)

### 1.6 Performance Baseline
- Measure FPS with Chrome DevTools
- Target: 60 FPS with just globe + tiles, no data layers
- Memory: < 300MB with tiles loaded

## Files Created
- `package.json` — Project config + all dependencies
- `vite.config.ts` — Vite + Cesium plugin config
- `tsconfig.json` — TypeScript config with path aliases
- `tailwind.config.ts` — Tailwind dark theme config
- `.env.example` — API key template
- `index.html` — Entry HTML
- `src/main.tsx` — React entry point
- `src/App.tsx` — Root component with globe + overlay
- `src/globe/GlobeViewer.tsx` — CesiumJS viewer setup
- `src/types/globe.ts` — Globe-related TypeScript types
- `src/styles/globals.css` — Global styles + Tailwind imports

## Acceptance Criteria
- [ ] App loads and shows a photorealistic 3D Earth
- [ ] Google 3D tiles render with building geometry visible when zoomed in
- [ ] Camera orbit/zoom/tilt works smoothly
- [ ] Star field visible in space background
- [ ] Atmosphere glow visible at Earth's edge
- [ ] UTC clock ticking in top bar
- [ ] Camera coordinates updating in bottom bar
- [ ] 60 FPS sustained on mid-range hardware
