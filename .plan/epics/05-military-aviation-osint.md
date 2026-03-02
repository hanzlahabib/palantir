# Epic 05: Military Aviation OSINT Layer

## Priority: HIGH (the OSINT differentiator)
## Dependencies: Epic 04 (reuses flight infrastructure)
## Blocks: Epic 15 (Fusion)
## Estimated Effort: 2 days
## Parallelizable With: Epic 06, 08, 11

---

## Objective
Overlay military aircraft tracking from ADS-B Exchange / airplanes.live with callsign identification, aircraft type classification, and military hotspot correlation.

## Data Sources
- **airplanes.live**: `https://api.airplanes.live/v2/mil` (free, no auth, military-only)
- **ADS-B Exchange**: V2 API (paid key for higher rates)
- See `00-DATA-FEEDS.md` Feed #04 and #05

## Tasks

### 5.1 Military Flight API Integration
- Backend route: `GET /api/military`
- Primary: airplanes.live `/v2/mil` endpoint (free, military-tagged)
- Fallback: ADS-B Exchange V2 API
- Cache TTL: 15 seconds
- Merge data from both sources, deduplicate by ICAO hex

### 5.2 Military Callsign Identification Engine
Port from worldmonitor's `src/config/military.ts`:

**US Air Force Patterns:**
- `RCH/REACH` — AMC Transport
- `KING/SHELL/TEAL` — Tanker ops (KC-135/KC-46)
- `COBRA/RIVET/OLIVE` — RC-135 SIGINT/reconnaissance
- `SNTRY` — E-3 AWACS
- `DRAGN` — U-2 reconnaissance
- `BONE/DEATH/DOOM` — B-1B/B-2/B-52 bombers
- `BOLT/VIPER/RAPTOR` — Fighter ops (F-16/F-22)
- `MOOSE/HERKY` — C-17/C-130 transport
- `SAM/AF1/AF2/EXEC/DUKE` — VIP transport
- `SHADOW/GOLD/NCHO` — Special ops

**US Navy:** `NAVY`, `TRIDENT` (P-8), `RED` (P-3/P-8)
**US Marines:** `MARINE`, `HMX` (Marine One), `NIGHT` (VIP)
**US Army:** `ARMY`, `PAT` (Priority Air Transport)

**NATO Allies:** UK (`ASCOT`, `RAF`), France, Germany, etc.
**Adversaries:** Russia, China patterns for context

### 5.3 Aircraft Type Classification
Map to categories:
- `fighter` — F-16, F-22, F-35, F/A-18, Typhoon, Rafale
- `bomber` — B-1B, B-2, B-52, Tu-95, Tu-160
- `tanker` — KC-135, KC-46, A330 MRTT
- `transport` — C-17, C-130, C-5, A400M
- `reconnaissance` — RC-135, U-2, RQ-4, E-8 JSTARS
- `awacs` — E-3 Sentry, E-7 Wedgetail
- `patrol` — P-8 Poseidon, P-3 Orion
- `special_ops` — MC-130, AC-130, MH-60
- `helicopter` — Various rotary wing
- `uav` — MQ-9 Reaper, RQ-4 Global Hawk
- `vip` — Air Force One, Marine One

### 5.4 Visualization
- **Color by operator:**
  - US military: `#4488ff` (blue)
  - NATO allies: `#44ff88` (green)
  - Russia: `#ff4444` (red)
  - China: `#ff8844` (orange)
  - Others: `#ffffff` (white)
- **Icons by type:** Different billboard symbols for each aircraft type
- **Orange highlight:** Military aircraft stand out from commercial traffic
- **Formation detection:** Multiple mil aircraft in close proximity highlighted

### 5.5 Behavior Pattern Detection
- **Orbit/racetrack pattern:** Aircraft circling an area = "SURVEILLANCE PATTERN"
  - Detect: Calculate heading change rate, if > 90° over 10 min = orbiting
- **Tanker tracks:** Tankers flying straight lines at specific altitudes = refueling
- **Rapid deployment:** Multiple transports heading to same area = "DEPLOYMENT ACTIVITY"

### 5.6 Military Hotspot Correlation
Define geographic hotspots and alert on proximity:
```typescript
const HOTSPOTS = [
  { name: 'Pentagon', lat: 38.8719, lon: -77.0563, radius: 100 },
  { name: 'Black Sea', lat: 43.5, lon: 34.0, radius: 500 },
  { name: 'Taiwan Strait', lat: 24.5, lon: 119.5, radius: 300 },
  { name: 'Korean DMZ', lat: 38.0, lon: 127.0, radius: 200 },
  { name: 'Persian Gulf', lat: 26.5, lon: 52.0, radius: 400 },
  // ... more
];
```
- Alert when military aircraft count in hotspot zone exceeds historical average

### 5.7 Entity Inspector Details
When military aircraft selected, show:
- Callsign + decoded meaning
- Aircraft type + operator
- Altitude, speed, heading
- Nearest military hotspot
- Historical track (if available from position history)

## Files Created
- `src/layers/MilitaryFlightLayer.tsx` — Military aircraft rendering
- `src/services/militaryFlightService.ts` — ADS-B Exchange + identification engine
- `src/config/militaryCallsigns.ts` — Callsign pattern database
- `src/utils/militaryIdentifier.ts` — Pattern matching functions
- `server/routes/adsb.ts` — Backend proxy for ADS-B APIs

## Worldmonitor Reference (PORT THESE)
- `src/config/military.ts` — Full callsign database (600+ lines)
- `src/services/military-flights.ts` — Flight processing logic
- `src/services/wingbits.ts` — Aircraft detail enrichment

## Acceptance Criteria
- [ ] Toggle military layer -> see orange military aircraft dots
- [ ] Callsigns decoded correctly (COBRA = RC-135 SIGINT, etc.)
- [ ] Aircraft colored by operator nation
- [ ] Orbit pattern detection flags surveillance flights
- [ ] Hotspot proximity alerts fire correctly
- [ ] Click military aircraft -> detailed info with type + operator
- [ ] Separate from commercial traffic layer (different rendering)
