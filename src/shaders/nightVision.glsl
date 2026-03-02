// Night Vision (NVG) Post-Processing Shader
// Simulates Gen III+ night vision with green phosphor, bloom, grain, and tube vignette

uniform sampler2D colorTexture;
uniform float sensitivity;    // default: 1.5
uniform float gainLevel;      // default: 2.0
uniform float grainIntensity; // default: 0.15
uniform float time;

in vec2 v_textureCoordinates;

float noise(vec2 co) {
  return fract(sin(dot(co + vec2(time * 0.1, time * 0.13), vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec3 color = texture(colorTexture, v_textureCoordinates).rgb;
  
  // Luminance extraction
  float lum = dot(color, vec3(0.299, 0.587, 0.114));
  
  // Apply gain
  lum = pow(lum * sensitivity, 0.8) * gainLevel;
  lum = clamp(lum, 0.0, 1.5);
  
  // Green phosphor mapping
  vec3 nvgColor = vec3(lum * 0.1, lum, lum * 0.1);
  
  // Intensifier bloom (simple bright-spot glow)
  float bloom = max(lum - 0.8, 0.0) * 3.0;
  nvgColor += vec3(bloom * 0.2, bloom, bloom * 0.2);
  
  // Heavy film grain
  float grain = (noise(v_textureCoordinates * 500.0) - 0.5) * grainIntensity;
  nvgColor += grain;
  
  // Tube vignette (strong circular darkening)
  vec2 vig = v_textureCoordinates - 0.5;
  float vigDist = length(vig);
  float vigFactor = 1.0 - smoothstep(0.3, 0.7, vigDist);
  nvgColor *= vigFactor;
  
  // Subtle scanlines
  float scanline = sin(v_textureCoordinates.y * 600.0) * 0.03;
  nvgColor -= scanline;
  
  out_FragColor = vec4(nvgColor, 1.0);
}
