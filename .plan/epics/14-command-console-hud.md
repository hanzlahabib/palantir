# Epic 14: Command Console & HUD System

## Priority: HIGH (UI framework for everything)
## Dependencies: Epic 01 (Globe)
## Blocks: None (but all layers render into these panels)
## Estimated Effort: 2-3 days
## Parallelizable With: Epic 02 (Shaders), Epic 16 (Backend)

---

## Objective
Build the full tactical heads-up display: top status bar, bottom coordinates bar, left layer panel, right entity inspector, scrolling alert feed, command console, and classified-intelligence aesthetic.

## UI Generation Protocol
- **USE Stitch MCP** for generating spy-like component designs
- **USE `/frontend-design` skill** for distinctive HUD panels
- **USE `/ui-ux-pro-max` skill** for dark tactical color palettes and typography

## Tasks

### 14.1 HUD Layout Shell
- Full viewport with Cesium underneath
- Overlay panels with absolute positioning
- Dark theme base: `#0a0a0a` background, `#00ff41` text
- All panels semi-transparent (background: `rgba(10, 10, 10, 0.85)`)
- Sharp edges, no rounded corners
- Monospace font everywhere (JetBrains Mono)

### 14.2 Top Status Bar (`src/hud/TopBar.tsx`)
- Left: `PALANTIR v1.0 | UNCLASSIFIED // FOUO`
- Center: UTC clock (ticking every second), local time
- Right: Feed status `12/15 ONLINE`, Entity count, FPS counter
- Subtle border-bottom with green/amber glow

### 14.3 Bottom Status Bar (`src/hud/BottomBar.tsx`)
- Camera readout: `Lat: 38.8977 | Lon: -77.0365 | Alt: 45.2km`
- Heading, pitch: `Heading: 045.3 | Pitch: -35.2`
- Active mode indicator: `Mode: NVG`
- MGRS coordinates (optional)

### 14.4 Layer Panel (`src/hud/LayerPanel.tsx`)
- Left sidebar, collapsible
- Toggle switches for each data layer:
  - SAT (Satellites), FLT (Flights), MIL (Military), SEA (Maritime)
  - EQ (Earthquakes), FIRE (Wildfires), CAM (CCTV), TFC (Traffic)
  - INTEL (News), CONF (Conflicts), INFRA (Infrastructure)
- Each toggle shows active entity count
- Sub-options per layer (category filters, density)
- Detection mode toggle (Sparse/Dense/Full labels)

### 14.5 Entity Inspector (`src/hud/EntityInspector.tsx`)
- Right panel, shows when entity selected
- Header: Entity type icon + name
- Body: Key-value pairs of entity properties
- Footer: Action buttons (Track, Jump To, Dismiss)
- Supports all entity types (satellite, aircraft, ship, earthquake, camera, event)

### 14.6 Alert Feed Ticker (`src/hud/AlertFeed.tsx`)
- Horizontal scrolling text ticker above bottom bar
- Shows latest CRITICAL/HIGH events from news/conflict layers
- Format: `>>> BREAKING: 5.8 earthquake near Tonga... | ALERT: Military activity elevated near Taiwan... <<<`
- Clickable headlines -> jump to location

### 14.7 Command Console (`src/hud/CommandConsole.tsx`)
- Bottom of screen, activated with `/` or backtick
- Monospace input with blinking block cursor
- Command parsing:
  - `goto <location>` — Fly to city/landmark
  - `track <callsign/NORAD>` — Track entity
  - `mode <crt/nvg/flir/tac>` — Switch visual mode
  - `layer <name> on/off` — Toggle layer
  - `density <sparse/dense>` — Label density
  - `filter <type> <criteria>` — Filter data
  - `search <query>` — Search GDELT/news
- Command history (up/down arrow)
- Auto-complete suggestions

### 14.8 Classified Watermark (`src/hud/ClassifiedWatermark.tsx`)
- Faint diagonal text: "TOP SECRET // SCI // NOFORN"
- Toggle-able with keyboard shortcut
- CSS: rotated, low opacity (~0.05), large font, covers viewport

### 14.9 Boot Sequence (Optional)
- On app load, fake "system initialization" animation:
  - Cascading monospace text: "INITIALIZING SENSORS...", "CONNECTING TO FEEDS...", etc.
  - Progress bars for each subsystem
  - Final: "PALANTIR OPERATIONAL" with green flash
  - Duration: 3-5 seconds

### 14.10 Sound Design (Optional)
- Subtle click sounds on button press
- Alert beep for critical events
- Typing sounds in command console
- Toggle-able via settings

### 14.11 Scanline CSS Overlay
- Subtle horizontal scanlines over entire HUD (not globe)
- CSS `background: repeating-linear-gradient(transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)`
- Adds to the surveillance aesthetic

## Design Specifications
```
Font: JetBrains Mono, 12-14px
Background: #0a0a0a (panels), transparent (over globe)
Primary: #00ff41 (green) or #ff6600 (amber)
Secondary: #666666
Borders: 1px solid #1a1a1a
Hover borders: 1px solid #333333
Alert Red: #ff0000
Warning Amber: #ffaa00
Info Cyan: #00ffff
Neutral: #888888
Panel opacity: 85%
```

## Files Created
- `src/hud/TopBar.tsx` — Status bar + clock
- `src/hud/BottomBar.tsx` — Camera coordinates + mode
- `src/hud/LayerPanel.tsx` — Layer toggle sidebar
- `src/hud/EntityInspector.tsx` — Entity detail panel
- `src/hud/AlertFeed.tsx` — Scrolling alert ticker
- `src/hud/CommandConsole.tsx` — Command input + parser
- `src/hud/ClassifiedWatermark.tsx` — TOP SECRET overlay
- `src/hud/BootSequence.tsx` — Initialization animation
- `src/hud/MiniMap.tsx` — Optional 2D overview map
- `src/stores/entityStore.ts` — Selected entity state
- `src/stores/alertStore.ts` — Alert/notification queue
- `src/stores/layerStore.ts` — Layer visibility state

## Acceptance Criteria
- [ ] Full HUD renders over globe without blocking interaction
- [ ] UTC clock ticks every second
- [ ] Camera coordinates update as camera moves
- [ ] Layer toggles work (on/off per layer)
- [ ] Entity inspector shows data when entity clicked
- [ ] Alert ticker scrolls headlines
- [ ] Command console parses and executes commands
- [ ] Classified watermark toggles on/off
- [ ] Entire UI feels like classified intelligence software, not generic dashboard
