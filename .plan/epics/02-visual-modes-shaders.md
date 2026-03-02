# Epic 02: Tactical Visual Modes & Post-Processing Shaders

## Priority: HIGH (makes everything look spy-like)
## Dependencies: Epic 01
## Blocks: None (enhances all layers)
## Estimated Effort: 2-3 days
## Parallelizable With: Epic 14 (HUD), Epic 16 (Backend)

---

## Objective
Implement 5 visual modes (Standard, CRT, Night Vision, FLIR, Tactical) using CesiumJS PostProcessStage with custom GLSL fragment shaders. Add bloom, sharpen, and other post-processing effects.

## Tasks

### 2.1 Post-Processing Pipeline Manager
- Create `src/globe/PostProcessing.tsx`
- Manage `Cesium.PostProcessStageComposite` instances
- Support enabling/disabling individual stages
- Expose uniform controls for per-mode settings
- Create Zustand store slice for visual mode state

### 2.2 CRT Shader (`src/shaders/crt.glsl`)
GLSL fragment shader implementing:
- **Scanlines**: `sin(gl_FragCoord.y * scanlineDensity) * 0.1`
- **Chromatic Aberration**: Sample R/G/B channels at offset UVs
- **Vignette**: `1.0 - smoothstep(0.5, 0.8, length(uv - 0.5))`
- **Animated Noise**: `fract(sin(dot(uv, vec2(12.9898, 78.233)) + time) * 43758.5453)`
- **Barrel Distortion**: UV distortion simulating CRT tube curvature
- **Phosphor Glow**: Slight green/amber tint on all pixels
- Uniforms: `scanlineDensity`, `chromaticAberration`, `noiseIntensity`, `curvature`, `time`

### 2.3 Night Vision Shader (`src/shaders/nightVision.glsl`)
GLSL fragment shader implementing:
- **Luminance Extraction**: `dot(color.rgb, vec3(0.299, 0.587, 0.114))`
- **Green Phosphor Mapping**: `vec3(0.0, lum * sensitivity, 0.0)`
- **Bloom/Glow**: Simplified Gaussian blur on bright areas (multi-pass ideally, or single-pass approximation)
- **Heavy Film Grain**: High-frequency noise with animated seed
- **Tube Vignette**: Strong circular darkening at edges
- **Intensifier Halos**: Bright spots create radial glow
- Uniforms: `sensitivity`, `gainLevel`, `grainIntensity`, `time`

### 2.4 FLIR Shader (`src/shaders/flir.glsl`)
GLSL fragment shader implementing:
- **Thermal Palette**: Map luminance to color gradient:
  - White-hot: black -> blue -> magenta -> red -> yellow -> white
  - Black-hot: white -> yellow -> red -> magenta -> blue -> black
  - Ironbow: black -> purple -> red -> orange -> yellow -> white
- **Edge Enhancement**: Sobel operator for structure outlines
- **Heat Shimmer**: Slight UV distortion animation (subtle)
- **Temperature Scale Overlay**: Color bar at bottom
- Uniforms: `palette` (enum: 0=white-hot, 1=black-hot, 2=ironbow), `sensitivity`, `contrast`, `edgeStrength`

### 2.5 Tactical Shader (`src/shaders/tactical.glsl`)
GLSL fragment shader implementing:
- **Desaturation**: Mix original color with luminance at ~20% saturation
- **High Contrast**: `pow(color, vec3(contrastLevel))`
- **Blue-Gray Tint**: Mix with `vec3(0.15, 0.18, 0.25)`
- **Edge Detection**: Laplacian filter for building/feature outlines
- **Grid Overlay**: Render UTM/MGRS grid lines based on camera position
- Uniforms: `saturation`, `contrastLevel`, `edgeOpacity`, `gridOpacity`

### 2.6 Bloom Post-Processing
- Use CesiumJS built-in bloom or custom implementation
- Apply to entity points (satellites, aircraft, ships) so they glow
- Configurable threshold and intensity
- Works across all visual modes

### 2.7 Sharpen Post-Processing
- Unsharp mask kernel:
```glsl
// 3x3 sharpen kernel
float kernel[9] = float[]( 0, -1, 0, -1, 5, -1, 0, -1, 0 );
```
- Adjustable amount slider

### 2.8 Shader Control Panel UI
- Right-side collapsible panel (or integrate into HUD)
- Mode selector buttons (1-5 keyboard shortcuts)
- Per-mode slider controls
- Bloom toggle + intensity
- Sharpen toggle + amount
- Reset to defaults button

### 2.9 Keyboard Shortcuts
- `1` — Standard mode
- `2` — CRT mode
- `3` — Night Vision (NVG) mode
- `4` — FLIR (Thermal) mode
- `5` — Tactical mode
- `B` — Toggle bloom
- `S` — Toggle sharpen (if not conflicting)

## Files Created
- `src/shaders/crt.glsl` — CRT scanline shader
- `src/shaders/nightVision.glsl` — NVG green phosphor shader
- `src/shaders/flir.glsl` — Thermal imaging shader
- `src/shaders/tactical.glsl` — Tactical overlay shader
- `src/shaders/bloom.glsl` — Bloom glow shader (if custom)
- `src/globe/PostProcessing.tsx` — Shader pipeline manager component
- `src/hooks/usePostProcessing.ts` — Shader mode hook
- `src/stores/layerStore.ts` — Visual mode state (add visual mode slice)

## Acceptance Criteria
- [ ] Press 1-5 to switch visual modes instantly
- [ ] CRT: Visible scanlines, chromatic aberration, noise, curvature
- [ ] NVG: Green phosphor glow, heavy grain, tube vignette
- [ ] FLIR: Thermal color palette (3 options), edge outlines
- [ ] Tactical: Desaturated, high contrast, blue tint
- [ ] All modes maintain 30+ FPS
- [ ] Uniform sliders adjust effects in real-time
- [ ] Bloom makes entity points glow across all modes
