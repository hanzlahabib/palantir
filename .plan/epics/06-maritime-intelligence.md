# Epic 06: Maritime Intelligence Layer

## Priority: MEDIUM
## Dependencies: Epic 01 (Globe), Epic 16 (Backend)
## Blocks: Epic 15 (Fusion)
## Estimated Effort: 1-2 days
## Parallelizable With: Epic 05, 08, 11

---

## Objective
Track global vessel movements using AIS WebSocket streaming, with vessel classification, military vessel highlighting, and anomalous behavior detection.

## Data Source
- **aisstream.io**: `wss://stream.aisstream.io/v0/stream` (WebSocket, free API key)
- See `00-DATA-FEEDS.md` Feed #06

## Tasks

### 6.1 AIS WebSocket Relay Server
- Backend WebSocket relay: connects to aisstream.io, fans out to browser clients
- Subscribe message with API key and bounding box
- Parse AIS position reports into typed vessel objects
- Rate limit: buffer messages, batch-send every 2 seconds

### 6.2 Vessel Classification
Color and icon by ship type code:
- `30`: Fishing (green)
- `35`: Military (red, highlighted)
- `60-69`: Passenger/cruise (blue)
- `70-79`: Cargo (gray)
- `80-89`: Tanker (orange)
- Other: Special/unknown (yellow)

### 6.3 Cesium Rendering
- Directional triangle/arrow billboards on water surface
- Size proportional to vessel length (if available)
- Speed vector: short line ahead showing projected position
- Wake trail: fading polyline behind moving vessels

### 6.4 Anomaly Detection
- **AIS Gap (Dark Ship)**: Vessel stops transmitting, then reappears — flag
- **Loitering**: Vessel stationary > 4 hours in open ocean — flag
- **Speed Anomaly**: Sudden speed change > 50% — flag
- **Rendezvous**: Two vessels within 500m in open ocean — flag (ship-to-ship transfer)

### 6.5 Vessel Selection & Info Panel
Click vessel -> show: MMSI, name, type, flag state, speed, heading, destination, ETA

## Files Created
- `src/layers/MaritimeLayer.tsx` — Vessel rendering
- `src/services/maritimeService.ts` — AIS WebSocket client
- `server/routes/maritime.ts` — AIS relay server

## Acceptance Criteria
- [ ] Toggle maritime layer -> ship icons on oceans
- [ ] Vessels colored by type
- [ ] Military vessels highlighted in red
- [ ] Click vessel -> info panel with details
- [ ] Smooth position updates via WebSocket
