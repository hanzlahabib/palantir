# PALANTIR — Tech Stack & Tooling Decisions

## Frontend Stack

| Package | Version | Purpose |
|---------|---------|---------|
| `vite` | ^6.x | Build tool (ESM-native, fast HMR) |
| `react` | ^19.x | UI framework |
| `react-dom` | ^19.x | React DOM renderer |
| `typescript` | ^5.7+ | Type safety |
| `cesium` | ^1.130+ | 3D globe engine |
| `resium` | ^1.18+ | React + CesiumJS declarative bindings |
| `satellite.js` | ^5.x | SGP4/SDP4 orbital propagation |
| `zustand` | ^5.x | Lightweight state management |
| `tailwindcss` | ^4.x | Utility-first CSS |
| `sonner` | ^2.x | Toast notifications |
| `fast-xml-parser` | ^5.x | RSS/XML parsing |
| `d3` | ^7.x | Data visualization helpers |
| `ws` | ^8.x | WebSocket client |

## Backend Stack

| Package | Version | Purpose |
|---------|---------|---------|
| `express` | ^5.x | HTTP server |
| `ws` | ^8.x | WebSocket server |
| `node-cache` | ^5.x | In-memory TTL cache |
| `p-queue` | ^8.x | Concurrency-limited promise queue |
| `node-cron` | ^3.x | Scheduled task runner |
| `cors` | ^2.x | CORS middleware |
| `dotenv` | ^16.x | Environment variable loading |
| `tsx` | ^4.x | TypeScript execution for dev |

## Dev Dependencies

| Package | Purpose |
|---------|---------|
| `vite-plugin-cesium` | Cesium static asset management |
| `@types/express` | Express type definitions |
| `@playwright/test` | E2E testing |

## Design & UI Generation Tools

### CRITICAL: Agent UI Generation Protocol
When building UI components, agents MUST use these tools:

1. **Stitch MCP** — Use the Stitch design MCP server for generating component designs and UI patterns. Stitch can produce spy-like/tactical UI designs matching the PALANTIR aesthetic.

2. **Claude Frontend Design Skill** (`frontend-design`) — Use this skill for creating distinctive, production-grade interfaces. It generates creative, polished code that avoids generic AI aesthetics. Invoke with `/frontend-design` when building:
   - HUD panels and overlays
   - Command console interface
   - Entity inspector panels
   - Layer toggle controls
   - Alert feed ticker
   - Data visualization components

3. **UI/UX Pro Max Skill** (`ui-ux-pro-max`) — Use this skill for:
   - Color palette generation (dark tactical themes)
   - Font pairing (monospace tactical fonts)
   - Layout design (dashboard panels)
   - Animation patterns (scanning, pulsing, glitching effects)
   - Accessibility review of dark-mode interfaces
   - Responsive layout strategies

### Design Aesthetic Requirements
- **Style**: Dark military/intelligence aesthetic (think SCIF terminal)
- **Primary Font**: `JetBrains Mono` or `Fira Code` (monospace everywhere)
- **Background**: `#0a0a0a` near-black
- **Primary Accent**: `#00ff41` (matrix green) or `#ff6600` (amber)
- **Alert Colors**: Red `#ff0000`, Amber `#ffaa00`, Cyan `#00ffff`
- **Borders**: `#1a1a1a` with subtle `#333` glow
- **Effects**: Scanline overlays, subtle CRT flicker on panels, blinking cursors
- **NO generic AI look** — must feel like classified intelligence software
- **NO rounded happy corners** — sharp edges, angular design
- **NO bright backgrounds** — everything is dark, data-dense, terminal-like

## Build Configuration

### Vite Config Key Points
- CesiumJS static assets (Workers, Assets, ThirdParty) copied to build output
- Environment variables prefixed with `VITE_` for client-side access
- Proxy `/api/*` to backend in dev mode
- Source maps in dev, disabled in prod

### TypeScript Config
- Strict mode enabled
- Path aliases: `@/` -> `src/`
- Target: ES2022
- Module: ESNext

## Deployment Stack

| Tool | Purpose |
|------|---------|
| Nginx | Reverse proxy + SSL termination |
| PM2 | Node.js process management |
| Let's Encrypt | SSL certificates (via CyberPanel) |
| Contabo VPS | Production server |

## Package Manager
**pnpm** — Always. Never npm or yarn.
