// FLIR (Forward-Looking Infrared) / Thermal Post-Processing Shader
// Maps luminance to thermal color palettes with edge enhancement

uniform sampler2D colorTexture;
uniform int palette;       // 0=white-hot, 1=black-hot, 2=ironbow
uniform float sensitivity; // default: 1.0
uniform float contrast;    // default: 1.3
uniform float edgeStrength; // default: 0.3

in vec2 v_textureCoordinates;

vec3 whiteHot(float t) {
  // black -> blue -> magenta -> red -> yellow -> white
  if (t < 0.2) return mix(vec3(0.0), vec3(0.0, 0.0, 0.5), t * 5.0);
  if (t < 0.4) return mix(vec3(0.0, 0.0, 0.5), vec3(0.8, 0.0, 0.8), (t - 0.2) * 5.0);
  if (t < 0.6) return mix(vec3(0.8, 0.0, 0.8), vec3(1.0, 0.0, 0.0), (t - 0.4) * 5.0);
  if (t < 0.8) return mix(vec3(1.0, 0.0, 0.0), vec3(1.0, 1.0, 0.0), (t - 0.6) * 5.0);
  return mix(vec3(1.0, 1.0, 0.0), vec3(1.0), (t - 0.8) * 5.0);
}

vec3 blackHot(float t) {
  return whiteHot(1.0 - t);
}

vec3 ironbow(float t) {
  // black -> purple -> red -> orange -> yellow -> white
  if (t < 0.2) return mix(vec3(0.0), vec3(0.3, 0.0, 0.5), t * 5.0);
  if (t < 0.4) return mix(vec3(0.3, 0.0, 0.5), vec3(0.8, 0.0, 0.0), (t - 0.2) * 5.0);
  if (t < 0.6) return mix(vec3(0.8, 0.0, 0.0), vec3(1.0, 0.5, 0.0), (t - 0.4) * 5.0);
  if (t < 0.8) return mix(vec3(1.0, 0.5, 0.0), vec3(1.0, 1.0, 0.0), (t - 0.6) * 5.0);
  return mix(vec3(1.0, 1.0, 0.0), vec3(1.0), (t - 0.8) * 5.0);
}

void main() {
  vec2 texel = 1.0 / vec2(textureSize(colorTexture, 0));
  vec3 color = texture(colorTexture, v_textureCoordinates).rgb;
  
  // Luminance
  float lum = dot(color, vec3(0.299, 0.587, 0.114));
  lum = pow(lum * sensitivity, contrast);
  lum = clamp(lum, 0.0, 1.0);
  
  // Sobel edge detection
  float tl = dot(texture(colorTexture, v_textureCoordinates + vec2(-texel.x, texel.y)).rgb, vec3(0.33));
  float t_ = dot(texture(colorTexture, v_textureCoordinates + vec2(0.0, texel.y)).rgb, vec3(0.33));
  float tr = dot(texture(colorTexture, v_textureCoordinates + vec2(texel.x, texel.y)).rgb, vec3(0.33));
  float l_ = dot(texture(colorTexture, v_textureCoordinates + vec2(-texel.x, 0.0)).rgb, vec3(0.33));
  float r_ = dot(texture(colorTexture, v_textureCoordinates + vec2(texel.x, 0.0)).rgb, vec3(0.33));
  float bl = dot(texture(colorTexture, v_textureCoordinates + vec2(-texel.x, -texel.y)).rgb, vec3(0.33));
  float b_ = dot(texture(colorTexture, v_textureCoordinates + vec2(0.0, -texel.y)).rgb, vec3(0.33));
  float br = dot(texture(colorTexture, v_textureCoordinates + vec2(texel.x, -texel.y)).rgb, vec3(0.33));
  
  float gx = -tl - 2.0*l_ - bl + tr + 2.0*r_ + br;
  float gy = -tl - 2.0*t_ - tr + bl + 2.0*b_ + br;
  float edge = length(vec2(gx, gy));
  
  // Apply thermal palette
  vec3 thermal;
  if (palette == 0) thermal = whiteHot(lum);
  else if (palette == 1) thermal = blackHot(lum);
  else thermal = ironbow(lum);
  
  // Add edge highlighting
  thermal += edge * edgeStrength;
  
  out_FragColor = vec4(thermal, 1.0);
}
