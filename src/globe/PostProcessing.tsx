import { useEffect, useRef } from "react";
import * as Cesium from "cesium";
import { useCameraStore } from "@/stores/cameraStore";


// Inline GLSL shader sources
const CRT_SHADER = `
uniform sampler2D colorTexture;
uniform float scanlineDensity;
uniform float chromaticAberration;
uniform float noiseIntensity;
uniform float curvature;
uniform float time;
in vec2 v_textureCoordinates;
float random(vec2 co) { return fract(sin(dot(co + vec2(time * 0.1, time * 0.13), vec2(12.9898, 78.233))) * 43758.5453); }
vec2 barrel(vec2 uv, float amt) { vec2 c = uv - 0.5; return uv + c * dot(c,c) * amt; }
void main() {
  vec2 uv = barrel(v_textureCoordinates, curvature);
  float r = texture(colorTexture, uv + vec2(chromaticAberration, 0.0)).r;
  float g = texture(colorTexture, uv).g;
  float b = texture(colorTexture, uv - vec2(chromaticAberration, 0.0)).b;
  vec3 col = vec3(r, g, b);
  col -= sin(v_textureCoordinates.y * scanlineDensity) * 0.08;
  vec2 vig = v_textureCoordinates * (1.0 - v_textureCoordinates);
  col *= pow(vig.x * vig.y * 15.0, 0.25);
  col += random(v_textureCoordinates) * noiseIntensity;
  col *= vec3(0.9, 1.1, 0.8);
  out_FragColor = vec4(col, 1.0);
}`;

const NVG_SHADER = `
uniform sampler2D colorTexture;
uniform float sensitivity;
uniform float gainLevel;
uniform float grainIntensity;
uniform float time;
in vec2 v_textureCoordinates;
float noise(vec2 co) { return fract(sin(dot(co + vec2(time * 0.1, time * 0.13), vec2(12.9898, 78.233))) * 43758.5453); }
void main() {
  vec3 col = texture(colorTexture, v_textureCoordinates).rgb;
  float lum = clamp(pow(dot(col, vec3(0.299, 0.587, 0.114)) * sensitivity, 0.8) * gainLevel, 0.0, 1.5);
  vec3 nvg = vec3(lum * 0.1, lum, lum * 0.1);
  float bloom = max(lum - 0.8, 0.0) * 3.0;
  nvg += vec3(bloom * 0.2, bloom, bloom * 0.2);
  nvg += (noise(v_textureCoordinates * 500.0) - 0.5) * grainIntensity;
  float vigD = length(v_textureCoordinates - 0.5);
  nvg *= 1.0 - smoothstep(0.3, 0.7, vigD);
  nvg -= sin(v_textureCoordinates.y * 600.0) * 0.03;
  out_FragColor = vec4(nvg, 1.0);
}`;

const FLIR_SHADER = `
uniform sampler2D colorTexture;
uniform int palette;
uniform float sensitivity;
uniform float contrast;
uniform float edgeStrength;
in vec2 v_textureCoordinates;
vec3 whiteHot(float t) {
  if(t<0.2) return mix(vec3(0.0), vec3(0.0,0.0,0.5), t*5.0);
  if(t<0.4) return mix(vec3(0.0,0.0,0.5), vec3(0.8,0.0,0.8), (t-0.2)*5.0);
  if(t<0.6) return mix(vec3(0.8,0.0,0.8), vec3(1.0,0.0,0.0), (t-0.4)*5.0);
  if(t<0.8) return mix(vec3(1.0,0.0,0.0), vec3(1.0,1.0,0.0), (t-0.6)*5.0);
  return mix(vec3(1.0,1.0,0.0), vec3(1.0), (t-0.8)*5.0);
}
void main() {
  vec2 tx = 1.0 / vec2(textureSize(colorTexture, 0));
  vec3 col = texture(colorTexture, v_textureCoordinates).rgb;
  float lum = clamp(pow(dot(col, vec3(0.299,0.587,0.114)) * sensitivity, contrast), 0.0, 1.0);
  float gx = -dot(texture(colorTexture, v_textureCoordinates+vec2(-tx.x,tx.y)).rgb, vec3(0.33)) + dot(texture(colorTexture, v_textureCoordinates+vec2(tx.x,-tx.y)).rgb, vec3(0.33));
  float gy = -dot(texture(colorTexture, v_textureCoordinates+vec2(-tx.x,-tx.y)).rgb, vec3(0.33)) + dot(texture(colorTexture, v_textureCoordinates+vec2(tx.x,tx.y)).rgb, vec3(0.33));
  float edge = length(vec2(gx, gy));
  vec3 thermal = (palette == 1) ? whiteHot(1.0-lum) : whiteHot(lum);
  thermal += edge * edgeStrength;
  out_FragColor = vec4(thermal, 1.0);
}`;

const TACTICAL_SHADER = `
uniform sampler2D colorTexture;
uniform float saturation;
uniform float contrastLevel;
uniform float edgeOpacity;
uniform float gridOpacity;
in vec2 v_textureCoordinates;
void main() {
  vec2 tx = 1.0 / vec2(textureSize(colorTexture, 0));
  vec3 col = texture(colorTexture, v_textureCoordinates).rgb;
  float lum = dot(col, vec3(0.299,0.587,0.114));
  vec3 d = pow(mix(vec3(lum), col, saturation), vec3(contrastLevel));
  d = mix(d, vec3(0.15,0.18,0.25), 0.3);
  vec3 n = texture(colorTexture, v_textureCoordinates+vec2(0.0,tx.y)).rgb;
  vec3 s = texture(colorTexture, v_textureCoordinates-vec2(0.0,tx.y)).rgb;
  vec3 e = texture(colorTexture, v_textureCoordinates+vec2(tx.x,0.0)).rgb;
  vec3 w = texture(colorTexture, v_textureCoordinates-vec2(tx.x,0.0)).rgb;
  float edge = dot(abs(n+s+e+w-4.0*col), vec3(0.33));
  d += vec3(edge*edgeOpacity*0.6, edge*edgeOpacity*0.7, edge*edgeOpacity);
  vec2 grid = abs(fract(v_textureCoordinates*50.0)-0.5);
  float gl = 1.0 - step(0.48, min(grid.x,grid.y));
  d += vec3(0.0, gl*gridOpacity*0.5, gl*gridOpacity);
  out_FragColor = vec4(d, 1.0);
}`;

interface PostProcessingProps {
    viewer: Cesium.Viewer | null;
}

export default function PostProcessing({ viewer }: PostProcessingProps) {
    const visualMode = useCameraStore((s) => s.visualMode);
    const stagesRef = useRef<Map<string, Cesium.PostProcessStage>>(new Map());
    const timeRef = useRef(0);

    useEffect(() => {
        if (!viewer) return;
        const scene = viewer.scene;
        const stages = stagesRef.current;

        // Clean up previous stages
        for (const [, stage] of stages) {
            if (scene.postProcessStages.contains(stage)) {
                scene.postProcessStages.remove(stage);
            }
        }
        stages.clear();

        if (visualMode === "standard") return;

        const configs: Record<string, { source: string; uniforms: Record<string, unknown> }> = {
            crt: { source: CRT_SHADER, uniforms: { scanlineDensity: 800.0, chromaticAberration: 0.003, noiseIntensity: 0.08, curvature: 0.3, time: 0.0 } },
            nvg: { source: NVG_SHADER, uniforms: { sensitivity: 1.5, gainLevel: 2.0, grainIntensity: 0.15, time: 0.0 } },
            flir: { source: FLIR_SHADER, uniforms: { palette: 0, sensitivity: 1.0, contrast: 1.3, edgeStrength: 0.3 } },
            tactical: { source: TACTICAL_SHADER, uniforms: { saturation: 0.2, contrastLevel: 1.4, edgeOpacity: 0.4, gridOpacity: 0.15 } },
        };

        const config = configs[visualMode];
        if (!config) return;

        const stage = new Cesium.PostProcessStage({
            fragmentShader: config.source,
            uniforms: config.uniforms,
        });

        scene.postProcessStages.add(stage);
        stages.set(visualMode, stage);

        // Animate time uniform for CRT and NVG
        if (visualMode === "crt" || visualMode === "nvg") {
            const start = performance.now();
            const animate = () => {
                if (!stages.has(visualMode)) return;
                timeRef.current = (performance.now() - start) / 1000;
                (stage.uniforms as any).time = timeRef.current;
                requestAnimationFrame(animate);
            };
            requestAnimationFrame(animate);
        }

        return () => {
            for (const [, s] of stages) {
                if (scene.postProcessStages.contains(s)) {
                    scene.postProcessStages.remove(s);
                }
            }
            stages.clear();
        };
    }, [viewer, visualMode]);

    return null;
}
