# Epic 04: Commercial Aviation Intelligence Layer

## Priority: HIGH (highest data density, visual impact)
## Dependencies: Epic 01 (Globe), Epic 16 (Backend)
## Blocks: Epic 05 (Military Aviation), Epic 15 (Fusion)
## Estimated Effort: 1-2 days
## Parallelizable With: Epic 03, 07, 10

---

## Objective
Display all commercial flights worldwide (~6,000-30,000 simultaneous) in real-time using OpenSky Network API.

## Data Source
- **OpenSky Network**: `https://opensky-network.org/api/states/all`
- Free registration recommended (4000 credits/day vs 400 anonymous)
- See `00-DATA-FEEDS.md` Feed #03

## Tasks

### 4.1 OpenSky API Integration
- Backend route: `GET /api/flights?lamin=&lamax=&lomin=&lomax=`
- Proxy OpenSky API with auth (basic auth username/password)
- Rate limit: 1 request per 10 seconds
- Cache TTL: 10 seconds (stale-while-revalidate pattern)
- Parse state vectors array into typed objects

### 4.2 State Vector Processing
Map OpenSky array format to typed interface:
```typescript
interface FlightState {
  icao24: string;        // ICAO transponder hex
  callsign: string;      // Flight callsign
  originCountry: string; // Country of registration
  lat: number;
  lon: number;
  altitude: number;      // meters (baro or geo)
  velocity: number;      // m/s ground speed
  heading: number;       // degrees true track
  verticalRate: number;  // m/s
  onGround: boolean;
  squawk: string | null;
  isEmergency: boolean;  // Derived from squawk 7500/7600/7700
}
```

### 4.3 Cesium Rendering
- Use `Cesium.PointPrimitiveCollection` for bulk rendering
- Color by altitude band:
  - Ground/Low (< 3000m): `#44ff44` (green)
  - Mid (3000-10000m): `#ffff44` (yellow)
  - High (> 10000m): `#ff4444` (red)
- Point size: 4-6px
- Heading arrow: Short line in direction of travel
- Alternative: Use small billboard images (plane icon rotated by heading)

### 4.4 Position Interpolation
Between API updates (10 second intervals), interpolate positions:
- Dead reckoning: `newLat = lat + (velocity * cos(heading) * dt) / earthRadius`
- Use `Cesium.SampledPositionProperty` with LAGRANGE interpolation
- Smooth animation between known positions

### 4.5 Detection Mode Labels
- Sparse: Just dots, no text
- Dense: Callsign + altitude labels
- Full: Callsign + altitude + speed + heading

### 4.6 Flight Selection & Tracking
- Click flight -> select it
- Show trail: Last 20 known positions as polyline
- Info panel: callsign, ICAO24, origin country, altitude, speed, heading, vertical rate, squawk
- Camera follow mode

### 4.7 Squawk Code Alerts
- `7500` (Hijacking): RED ALERT -> auto-track, sound alarm, notify in alert feed
- `7600` (Radio failure): AMBER alert -> highlight in alert feed
- `7700` (Emergency): RED alert -> auto-track, notify
- Implement in `src/services/flightService.ts` squawk parser

### 4.8 Regional Loading
- Load flights by visible bounding box to reduce data
- Use OpenSky bbox parameters
- Re-query when camera moves significantly (debounce 2s)

## Files Created
- `src/layers/FlightLayer.tsx` — Aircraft rendering + tracking
- `src/services/flightService.ts` — OpenSky API + interpolation
- `server/routes/opensky.ts` — Backend proxy with auth + rate limiting

## Worldmonitor Reference
- OpenSky proxy: `api/opensky.js` — existing proxy pattern
- Flight data used in worldmonitor's military service

## Acceptance Criteria
- [ ] Toggle flight layer -> see 6K+ aircraft dots worldwide
- [ ] Dots move smoothly (interpolated between updates)
- [ ] Color gradient by altitude visible
- [ ] Click aircraft -> trail + info panel appears
- [ ] Squawk 7700 triggers alert notification
- [ ] Detection mode toggles label density
- [ ] Regional loading reduces payload when zoomed in
