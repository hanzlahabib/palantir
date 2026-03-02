# Epic 15: Data Fusion Engine

## Priority: MEDIUM-HIGH (intelligence value)
## Dependencies: ALL data layer epics (03-13)
## Blocks: Epic 17 (Deploy)
## Estimated Effort: 2-3 days
## Parallelizable With: Nothing (needs all layers first)

---

## Objective
Cross-correlate data from multiple layers to generate fused intelligence assessments, composite threat scores, proximity alerts, and focal point detection.

## Tasks

### 15.1 Proximity Engine
- Spatial hashing or grid-based index for O(n) proximity queries
- Run every 30 seconds on latest position data
- Configurable distance thresholds per layer pair
- Generate ProximityEvent when thresholds crossed

### 15.2 Fusion Rules
| Rule | Layers | Alert Level |
|------|--------|-------------|
| Military aircraft near conflict zone | Military (05) + Conflict (11) | ELEVATED |
| Earthquake near nuclear facility | Seismic (07) + Infrastructure (12) | CRITICAL |
| Ship AIS loss near sanctioned country | Maritime (06) + Conflict (11) | SUSPICIOUS |
| News spike + military movement | News (10) + Military (05) | ESCALATION |
| Multiple layers converging on location | Any 3+ layers | FOCAL POINT |
| Satellite overhead during conflict | Satellite (03) + Conflict (11) | ISR COLLECTION |
| Fire near infrastructure | Fire (07) + Infrastructure (12) | INFRASTRUCTURE RISK |

### 15.3 Composite Threat Score
Per geographic region (H3 hexagon or custom zones):
```
Score = w1*conflictActivity + w2*militaryPresence + w3*newsVelocity
      + w4*seismicRisk + w5*infraProximity + w6*historicalBaseline
```
- Display as global threat gauge in HUD
- Heatmap overlay option on globe

### 15.4 Threat Gauge Widget
- `src/hud/ThreatGauge.tsx`
- Circular dial showing global composite threat level
- Range: DEFCON 5 (green/low) to DEFCON 1 (red/critical)
- Animated needle
- Updates every 60 seconds

### 15.5 Focal Point Detection
When 3+ layer types report activity within a radius:
- Auto-create "FOCAL POINT" marker on globe
- Pulsing red marker with concentric rings
- Alert: "FOCAL POINT DETECTED: {location} — {layer1}, {layer2}, {layer3}"
- Priority in alert feed

## Files Created
- `src/services/fusionEngine.ts` — Cross-layer correlation logic
- `src/services/proximityEngine.ts` — Spatial proximity detection
- `src/hud/ThreatGauge.tsx` — Global threat level dial

## Worldmonitor Reference
- `src/services/cross-module-integration.ts` — Cross-module patterns
- `src/services/focal-point-detector.ts` — Focal point detection
- `src/services/geo-convergence.ts` — Geo convergence scoring
- `src/services/hotspot-escalation.ts` — Escalation scoring
- `src/services/signal-aggregator.ts` — Signal aggregation

## Acceptance Criteria
- [ ] Proximity alerts fire when entities from different layers are near each other
- [ ] Fusion rules generate correct alert types
- [ ] Threat gauge displays and updates
- [ ] Focal points auto-detected when 3+ layers converge
- [ ] Composite scores change based on real-time data
