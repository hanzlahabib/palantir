# PALANTIR — Epic Dependency Map & Parallelization Guide

## Dependency Graph (Visual)

```
                    ┌──────────────┐
                    │  EPIC 01     │
                    │  3D Globe    │
                    │  Foundation  │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              v            v            v
     ┌────────────┐ ┌──────────┐ ┌──────────────┐
     │  EPIC 16   │ │ EPIC 14  │ │   EPIC 02    │
     │  Backend   │ │ HUD/UI   │ │   Shaders    │
     │  Proxy     │ │ System   │ │   Visual     │
     └─────┬──────┘ └────┬─────┘ └──────────────┘
           │              │
           │    ┌─────────┼─────────────────────────────────┐
           │    │         │              │                   │
           v    v         v              v                   v
    ┌────────────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐
    │  EPIC 03       │ │ EPIC 04  │ │ EPIC 07  │ │  EPIC 10     │
    │  Satellites    │ │ Flights  │ │ Seismic  │ │  News Intel  │
    └────────────────┘ └────┬─────┘ └──────────┘ └──────────────┘
                            │
                            v
                     ┌──────────┐
                     │ EPIC 05  │
                     │ Military │
                     │ Aviation │
                     └──────────┘

    ┌────────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐
    │  EPIC 06   │ │ EPIC 08  │ │ EPIC 09  │ │  EPIC 11     │
    │  Maritime  │ │ CCTV     │ │ Traffic  │ │  Conflicts   │
    └────────────┘ └──────────┘ └──────────┘ └──────────────┘
    (needs 16)     (needs 16)   (needs 01)   (needs 16)

    ┌────────────┐ ┌──────────┐
    │  EPIC 12   │ │ EPIC 13  │
    │  Infra     │ │ Camera   │
    │  Assets    │ │ Presets  │
    └────────────┘ └──────────┘
    (needs 01)     (needs 01)

                    ┌──────────────┐
                    │  EPIC 15     │
                    │  Data Fusion │◄── needs ALL layers (03-13)
                    └──────┬───────┘
                           │
                           v
                    ┌──────────────┐
                    │  EPIC 17     │
                    │  Deployment  │◄── needs everything
                    └──────────────┘
```

## Dependency Table

| Epic | Name | Depends On | Blocks |
|------|------|-----------|--------|
| 01 | 3D Globe Foundation | None | 02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12, 13, 14, 16 |
| 02 | Visual Modes & Shaders | 01 | None (enhances everything) |
| 03 | Satellite Tracking | 01, 16 | 15 |
| 04 | Commercial Aviation | 01, 16 | 05, 15 |
| 05 | Military Aviation OSINT | 04 | 15 |
| 06 | Maritime Intelligence | 01, 16 | 15 |
| 07 | Seismic & Natural Disasters | 01, 16 | 15 |
| 08 | CCTV Surveillance | 01, 16 | 15 |
| 09 | Street Traffic Simulation | 01 | 15 |
| 10 | SIGINT & OSINT News | 16 | 15 |
| 11 | Conflict & Threat Layer | 01, 16 | 15 |
| 12 | Infrastructure Assets | 01 | 15 |
| 13 | Camera Presets & Navigation | 01 | None |
| 14 | Command Console & HUD | 01 | None (but all layers render into it) |
| 15 | Data Fusion Engine | 03-13 (all layers) | 17 |
| 16 | Backend Proxy & Caching | 01 | 03, 04, 05, 06, 07, 08, 10, 11 |
| 17 | Deployment & Operations | All | None |
| 18 | Advanced Intelligence Features | 14, 15, 10 | 17 |
| 18.1 | Entity Graph View | 14, 15 | None |
| 18.2 | Global Timeline Scrubber | 14 | None |
| 18.3 | Search Around (Radius+Time) | 14, 16 | None |
| 18.4 | Report Export (PDF/MD) | 14 | None |
| 18.5 | Anomaly Engine (All Layers) | 03-13 (all layers) | None |
| 18.6 | Entity Resolution (Fuzzy) | 10, 15 | None |

## Parallelization Windows

### Window 1: Foundation (Sequential — MUST be first)
```
Epic 01: 3D Globe Foundation
```
**Duration estimate**: 1-2 days
**Why sequential**: Everything renders on this canvas. No parallelism possible here.

### Window 2: Core Infrastructure (PARALLEL — 3 agents)
After Epic 01 completes, launch these 3 in parallel:
```
Agent A: Epic 16 — Backend Proxy & Caching Layer
Agent B: Epic 14 — Command Console & HUD System
Agent C: Epic 02 — Visual Modes & Post-Processing Shaders
```
**Duration estimate**: 2-3 days each, all in parallel
**Why parallel**:
- Backend (16) is server-side, independent of frontend UI
- HUD (14) is React overlay components, independent of shaders
- Shaders (02) are GLSL files + PostProcessStage, independent of UI components

### Window 3: Data Layers Batch 1 (PARALLEL — 4 agents)
After Epics 01 + 16 complete, launch these in parallel:
```
Agent A: Epic 03 — Satellite Tracking
Agent B: Epic 04 — Commercial Aviation
Agent C: Epic 07 — Seismic & Natural Disasters
Agent D: Epic 10 — SIGINT & OSINT News Intelligence
```
**Duration estimate**: 1-2 days each, all in parallel
**Why parallel**: Each layer is a self-contained service + component pair. They share the globe canvas and backend proxy but don't interact with each other.

### Window 4: Data Layers Batch 2 (PARALLEL — 4 agents)
After Window 3, or partially in parallel:
```
Agent A: Epic 05 — Military Aviation OSINT (needs Epic 04 done)
Agent B: Epic 06 — Maritime Intelligence
Agent C: Epic 08 — CCTV Surveillance
Agent D: Epic 11 — Conflict & Threat Layer
```
**Duration estimate**: 1-2 days each
**Note**: Epic 05 depends on Epic 04 (reuses flight infrastructure). Others are independent.

### Window 5: Enhancement Layers (PARALLEL — 3 agents)
```
Agent A: Epic 09 — Street Traffic Simulation
Agent B: Epic 12 — Infrastructure & Critical Assets
Agent C: Epic 13 — Camera Presets & Cinematic Navigation
```
**Duration estimate**: 1 day each
**Why parallel**: All only need Epic 01, completely independent of each other.

### Window 6: Intelligence (Sequential)
```
Epic 15: Data Fusion Engine
```
**Duration estimate**: 2-3 days
**Why sequential**: Needs ALL data layers to be complete. Cross-references everything.

### Window 7: Ship It (Sequential)
```
Epic 17: Deployment & Operations
```
**Duration estimate**: 1 day
**Why sequential**: Final step after everything works.

## Critical Path

```
Epic 01 → Epic 16 → Epic 04 → Epic 05 → Epic 15 → Epic 17
(Globe)   (Backend)  (Flights)  (Military) (Fusion)  (Deploy)
```

This is the longest chain. Everything else can be parallelized around it.

## Window 6.5: Advanced Intelligence (PARALLEL — 4 agents)
After Epic 14 + 15 complete:
```
Agent A: Epic 18.1 — Entity Graph View
Agent B: Epic 18.2 — Global Timeline Scrubber
Agent C: Epic 18.3 — Search Around
Agent D: Epic 18.4 — Report Export
```
Then sequentially (after all data layers):
```
Agent A: Epic 18.5 — Anomaly Engine
Agent B: Epic 18.6 — Entity Resolution
```

## Estimated Total Timeline (Updated with Epic 18)

- **Sequential (1 agent)**: ~30-35 days
- **With parallelization (4-6 agents)**: ~12-14 days
- **Maximum parallelization (8 agents)**: ~9-10 days

## Agent Assignment Strategy (8 Agents)

| Agent | Window 1 | Window 2 | Window 3 | Window 4 | Window 5 | Window 6 | Window 7 |
|-------|----------|----------|----------|----------|----------|----------|----------|
| A | Epic 01 | Epic 16 | Epic 03 | Epic 05 | Epic 09 | Epic 15 | Epic 17 |
| B | - | Epic 14 | Epic 04 | Epic 06 | Epic 12 | - | - |
| C | - | Epic 02 | Epic 07 | Epic 08 | Epic 13 | - | - |
| D | - | - | Epic 10 | Epic 11 | - | - | - |
| E-H | Available for bug fixes, testing, optimization |
