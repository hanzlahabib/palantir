# Epic 08: CCTV Surveillance Feed Integration

## Priority: MEDIUM (spy aesthetic)
## Dependencies: Epic 01 (Globe), Epic 16 (Backend)
## Blocks: Epic 15 (Fusion)
## Estimated Effort: 1-2 days
## Parallelizable With: Epic 05, 06, 11

---

## Objective
Integrate live public traffic camera feeds from Austin TX, NYC, and London, displayed on the 3D globe with camera selection and real-time image display.

## Data Sources
- **Austin TX (TxDOT)**: DOT camera endpoints (free, ~1 frame/min)
- **NYC (NYCTMC)**: `https://webcams.nyctmc.org/api/cameras/` (free, ~30s)
- **London (TfL)**: `https://api.tfl.gov.uk/Place/Type/JamCam` (free, ~5min)
- See `00-DATA-FEEDS.md` Feeds #11, #12, #13

## Tasks

### 8.1 Camera Metadata Service
- Backend route: `GET /api/cctv/:city` returns camera list with lat/lon/name/feedUrl
- `GET /api/cctv/:city/:cameraId/image` proxies JPEG feed (avoids CORS)
- Cache camera list: 1 hour. Cache images: 30 seconds.

### 8.2 Camera Markers on Globe
- Place camera icons at each camera's geo-coordinates
- Use Cesium BillboardGraphics with camera icon
- Show camera count badge per city when zoomed out
- Show individual cameras when zoomed in (scaleByDistance)

### 8.3 CCTV Feed Viewer Panel
- HUD panel: `src/hud/CCTVPanel.tsx`
- City selector dropdown (Austin, NYC, London)
- Camera grid/list view
- Click camera -> show live JPEG (auto-refreshing every 30-60 seconds)
- "Jump to Camera" button -> fly camera to street level at that location

### 8.4 Feed Projection on Globe (Advanced)
- When camera selected, show feed as Cesium Billboard near the camera location
- Billboard auto-updates with new JPEG frames
- Creates the spy-movie effect of CCTV projected onto 3D geometry

## Files Created
- `src/layers/CCTVLayer.tsx` — Camera marker rendering
- `src/services/cctvService.ts` — Camera metadata + feed URLs
- `src/hud/CCTVPanel.tsx` — Camera selection + feed viewer
- `server/routes/cctv.ts` — CORS proxy for camera feeds

## Acceptance Criteria
- [ ] Camera icons visible on globe at correct locations
- [ ] Click camera -> see live JPEG feed in panel
- [ ] Feed auto-refreshes at correct interval
- [ ] Jump to camera flies to street-level view
- [ ] At least 3 cities supported (Austin, NYC, London)
