# Epic 13: Camera Presets & Cinematic Navigation

## Priority: MEDIUM (cinematic quality)
## Dependencies: Epic 01 (Globe)
## Blocks: None
## Estimated Effort: 1 day
## Parallelizable With: Epic 09, 12

---

## Objective
Create a preset system for instantly jumping to landmarks, cities, and strategic locations with smooth cinematic camera animations.

## Tasks

### 13.1 Camera Preset Database
Create `src/config/landmarks.ts` with presets:
- **Cities**: NYC, London, Dubai, Tokyo, Moscow, Beijing, DC, Paris, Singapore, Sydney (10+)
- **Landmarks per city**: 5 each (e.g., NYC: Statue of Liberty, Manhattan, Central Park, Brooklyn Bridge, Times Square)
- **Strategic locations**: Taiwan Strait, Korean DMZ, Persian Gulf, South China Sea, Suez Canal, Bosphorus, Gibraltar (10+)
- Each preset: `{name, lat, lon, height, heading, pitch, duration, category}`
- Use OpenStreetMap 3D volumes for accurate centering (not naive lat/lon)

### 13.2 Cinematic FlyTo Engine
- `src/hooks/useCameraFlyTo.ts`
- Use `viewer.camera.flyTo()` with custom easing
- Support: destination, duration, heading, pitch, roll
- Smooth easing: `Cesium.EasingFunction.QUARTIC_IN_OUT`

### 13.3 Keyboard Navigation
- `Q, W, E, R, T` — Cycle through 5 presets in current city group
- `Shift + 1-9` — Jump to city preset group
- `Space` — Toggle orbit mode (camera orbits current target)
- `Home` — Return to full Earth orbital view
- Arrow keys — Pan camera

### 13.4 Cinematic Camera Modes
- **Orbit**: Camera orbits target at fixed distance + altitude
- **Follow**: Camera follows selected entity (satellite, aircraft, ship)
- **Flythrough**: Auto-tour through preset sequence with configurable dwell time
- **Locked**: Camera locked to ground point, world moves

### 13.5 Camera Presets UI
- `src/hud/CameraPresets.tsx`
- Horizontal bar of preset buttons grouped by city
- Active preset highlighted
- Keyboard shortcut labels visible on buttons

## Files Created
- `src/config/landmarks.ts` — Preset database (~50-100 presets)
- `src/globe/CameraController.tsx` — Camera animation engine
- `src/hud/CameraPresets.tsx` — Preset UI bar
- `src/hooks/useCameraFlyTo.ts` — Animated flyTo hook
- `src/hooks/useKeyboardShortcuts.ts` — Keyboard binding system

## Acceptance Criteria
- [ ] Click preset button -> smooth cinematic flyto animation
- [ ] Q/W/E/R/T cycles through presets within a city
- [ ] Shift+1-9 jumps between city groups
- [ ] Space toggles orbit mode
- [ ] Landmarks centered accurately on 3D geometry
- [ ] Home returns to orbital view
