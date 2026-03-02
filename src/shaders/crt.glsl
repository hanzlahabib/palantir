// CRT Scanline Post-Processing Shader
// Simulates a cathode ray tube monitor with scanlines, chromatic aberration, noise, and barrel distortion

uniform sampler2D colorTexture;
uniform float scanlineDensity;    // default: 800.0
uniform float chromaticAberration; // default: 0.003
uniform float noiseIntensity;      // default: 0.08
uniform float curvature;           // default: 0.3
uniform float time;

in vec2 v_textureCoordinates;

float random(vec2 co) {
  return fract(sin(dot(co, vec2(12.9898, 78.233)) + time) * 43758.5453);
}

vec2 barrelDistortion(vec2 uv, float amt) {
  vec2 cc = uv - 0.5;
  float dist = dot(cc, cc);
  return uv + cc * dist * amt;
}

void main() {
  // Barrel distortion
  vec2 uv = barrelDistortion(v_textureCoordinates, curvature);
  
  // Chromatic aberration
  float r = texture(colorTexture, uv + vec2(chromaticAberration, 0.0)).r;
  float g = texture(colorTexture, uv).g;
  float b = texture(colorTexture, uv - vec2(chromaticAberration, 0.0)).b;
  vec3 color = vec3(r, g, b);
  
  // Scanlines
  float scanline = sin(v_textureCoordinates.y * scanlineDensity) * 0.08;
  color -= scanline;
  
  // Vignette
  vec2 vig = v_textureCoordinates * (1.0 - v_textureCoordinates);
  float vigIntensity = vig.x * vig.y * 15.0;
  vigIntensity = pow(vigIntensity, 0.25);
  color *= vigIntensity;
  
  // Noise
  float noise = random(v_textureCoordinates) * noiseIntensity;
  color += noise;
  
  // Green/amber phosphor tint
  color *= vec3(0.9, 1.1, 0.8);
  
  out_FragColor = vec4(color, 1.0);
}
