# Epic 16: Backend Proxy & Caching Layer

## Priority: CRITICAL (needed before data layers)
## Dependencies: Epic 01 (Globe — needs to know frontend port for CORS)
## Blocks: Epic 03, 04, 05, 06, 07, 08, 10, 11
## Estimated Effort: 2-3 days
## Parallelizable With: Epic 02 (Shaders), Epic 14 (HUD)

---

## Objective
Build the Node.js backend that proxies all external API calls, handles authentication, rate limiting, caching, and WebSocket broadcasting. This is the data backbone.

## Tasks

### 16.1 Express Server Setup
- `server/index.ts` — Express app with CORS, JSON body parser
- Port 3001 (configurable via env)
- Environment variable loading with dotenv
- Health check endpoint: `GET /api/health`

### 16.2 API Route Handlers
Create proxy routes for each data source:

| Route | Upstream | Cache TTL | Auth |
|-------|----------|-----------|------|
| `GET /api/satellites/tle` | CelesTrak | 4 hours | None |
| `GET /api/flights` | OpenSky | 10 sec | Basic Auth |
| `GET /api/military` | airplanes.live + ADS-B | 15 sec | API Key |
| `GET /api/earthquakes` | USGS | 1 min | None |
| `GET /api/fires` | NASA FIRMS | 15 min | MAP_KEY |
| `GET /api/gdelt` | GDELT | 5 min | None |
| `GET /api/cctv/:city` | DOT APIs | 30 sec | Varies |
| `GET /api/conflicts` | ACLED | 1 hour | API Key |
| `GET /api/events` | NASA EONET | 15 min | None |
| `GET /api/roads` | Overpass | 24 hours | None |
| `GET /api/news` | RSS feeds | 5 min | None |

### 16.3 Caching Layer (`server/cache.ts`)
- Use `node-cache` for in-memory TTL caching
- Stale-while-revalidate: serve stale cache, refresh in background
- Cache key: route path + query params hash
- Max cache entries configurable

### 16.4 Rate Limiter (`server/rateLimiter.ts`)
- Per-upstream rate limiting using `p-queue`
- OpenSky: 1 req/10sec
- GDELT: 1 req/5sec
- Overpass: 1 req/30sec
- Others: reasonable defaults

### 16.5 Circuit Breaker (`server/circuitBreaker.ts`)
- Port from worldmonitor `src/utils/circuit-breaker.ts`
- If upstream fails 3 times -> trip breaker
- Cooldown: 5 minutes
- Serve stale cache during cooldown
- Auto-reset after cooldown

### 16.6 WebSocket Server (`server/websocket.ts`)
- Use `ws` package
- Channels: `satellites`, `flights`, `military`, `maritime`, `earthquakes`, `alerts`
- Clients subscribe to channels they need
- Server pushes delta updates (changed/new entities only)
- Heartbeat every 30 seconds
- Connection tracking + cleanup

### 16.7 Cron Scheduler (`server/scheduler.ts`)
- Use `node-cron` for periodic data pre-fetching
- Pre-fetch high-priority feeds:
  - Flights: every 10 seconds
  - Military: every 15 seconds
  - Earthquakes: every 1 minute
  - News: every 5 minutes
  - Satellites: every 4 hours
- Push updates to WebSocket clients after fetch

### 16.8 Environment Variables
```env
# Server
PORT=3001
NODE_ENV=development

# Google Maps
VITE_GOOGLE_MAPS_API_KEY=

# OpenSky
OPENSKY_USERNAME=
OPENSKY_PASSWORD=

# ADS-B Exchange
ADSB_API_KEY=

# aisstream.io
AISSTREAM_API_KEY=

# NASA FIRMS
FIRMS_MAP_KEY=

# Space-Track
SPACETRACK_USERNAME=
SPACETRACK_PASSWORD=

# ACLED
ACLED_API_KEY=
ACLED_EMAIL=

# Windy Webcams (optional)
WINDY_API_KEY=
```

### 16.9 Error Handling
- Structured error responses: `{ error: string, code: number, upstream?: string }`
- Log all upstream failures with timestamp
- Never expose API keys in error responses
- Graceful degradation: return cached data on upstream failure

## Files Created
- `server/index.ts` — Express + WebSocket server entry
- `server/cache.ts` — In-memory TTL cache
- `server/rateLimiter.ts` — Per-API rate limiting
- `server/circuitBreaker.ts` — Circuit breaker pattern
- `server/websocket.ts` — WebSocket subscription server
- `server/scheduler.ts` — Cron-based data refresh
- `server/routes/opensky.ts` — OpenSky proxy
- `server/routes/adsb.ts` — ADS-B Exchange proxy
- `server/routes/satellites.ts` — CelesTrak proxy
- `server/routes/earthquakes.ts` — USGS proxy
- `server/routes/fires.ts` — FIRMS proxy
- `server/routes/gdelt.ts` — GDELT proxy
- `server/routes/cctv.ts` — CCTV feed proxy
- `server/routes/conflicts.ts` — ACLED proxy
- `server/routes/maritime.ts` — AIS relay
- `server/routes/news.ts` — RSS proxy
- `server/routes/traffic.ts` — Overpass proxy

## Worldmonitor Reference
- `src/utils/circuit-breaker.ts` — Circuit breaker implementation
- `api/opensky.js` — OpenSky proxy pattern
- `api/rss-proxy.js` — RSS proxy pattern
- `server/` directory — General server patterns

## Acceptance Criteria
- [ ] Server starts on port 3001
- [ ] All API routes return valid JSON
- [ ] Caching works (second request faster, returns cached data)
- [ ] Rate limiting prevents upstream abuse
- [ ] Circuit breaker trips after 3 failures, recovers after cooldown
- [ ] WebSocket connections work, clients receive push updates
- [ ] Error handling returns structured errors, never leaks API keys
- [ ] Health check endpoint returns server status + feed health
