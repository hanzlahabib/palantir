// Tactical Post-Processing Shader
// Desaturated, high-contrast, blue-tinted military tactical view with edge detection

uniform sampler2D colorTexture;
uniform float saturation;    // default: 0.2
uniform float contrastLevel; // default: 1.4
uniform float edgeOpacity;   // default: 0.4
uniform float gridOpacity;   // default: 0.15

in vec2 v_textureCoordinates;

void main() {
  vec2 texel = 1.0 / vec2(textureSize(colorTexture, 0));
  vec3 color = texture(colorTexture, v_textureCoordinates).rgb;
  
  // Desaturation
  float lum = dot(color, vec3(0.299, 0.587, 0.114));
  vec3 desaturated = mix(vec3(lum), color, saturation);
  
  // High contrast
  desaturated = pow(desaturated, vec3(contrastLevel));
  
  // Blue-gray tint
  vec3 tinted = mix(desaturated, vec3(0.15, 0.18, 0.25), 0.3);
  
  // Laplacian edge detection
  vec3 n = texture(colorTexture, v_textureCoordinates + vec2(0.0, texel.y)).rgb;
  vec3 s = texture(colorTexture, v_textureCoordinates - vec2(0.0, texel.y)).rgb;
  vec3 e = texture(colorTexture, v_textureCoordinates + vec2(texel.x, 0.0)).rgb;
  vec3 w = texture(colorTexture, v_textureCoordinates - vec2(texel.x, 0.0)).rgb;
  vec3 laplacian = abs(n + s + e + w - 4.0 * color);
  float edgeIntensity = dot(laplacian, vec3(0.33));
  
  // Add edge lines
  tinted += vec3(edgeIntensity * edgeOpacity * 0.6, edgeIntensity * edgeOpacity * 0.7, edgeIntensity * edgeOpacity);
  
  // Grid overlay (subtle)
  vec2 grid = abs(fract(v_textureCoordinates * 50.0) - 0.5);
  float gridLine = 1.0 - step(0.48, min(grid.x, grid.y));
  tinted += vec3(0.0, gridLine * gridOpacity * 0.5, gridLine * gridOpacity);
  
  out_FragColor = vec4(tinted, 1.0);
}
