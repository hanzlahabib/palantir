uniform sampler2D colorTexture;
uniform float czm_frameNumber;

in vec2 v_textureCoordinates;

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
    vec4 color = texture(colorTexture, v_textureCoordinates);
    vec2 uv = v_textureCoordinates;
    float time = czm_frameNumber * 0.01;

    // Sepia / aged paper tone
    float lum = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    vec3 sepia = vec3(lum * 1.1, lum * 0.9, lum * 0.7);

    // Subtle paper texture noise
    float noise = hash(uv * 500.0 + time) * 0.05;

    // Vignette — heavy darkening at edges
    float vignette = 1.0 - length((uv - 0.5) * 1.8);
    vignette = smoothstep(0.0, 0.6, vignette);

    // Faint grid lines (document grid)
    float gridX = step(0.99, fract(uv.x * 50.0));
    float gridY = step(0.99, fract(uv.y * 50.0));
    float grid = max(gridX, gridY) * 0.03;

    // Slight desaturation with amber tint
    vec3 result = sepia + noise;
    result += vec3(grid * 0.5, grid * 0.3, 0.0);
    result *= vignette;

    // Faint red-stamp overlay effect at corners
    float stamp = smoothstep(0.85, 0.95, length(uv - vec2(0.85, 0.15)));
    result += vec3(stamp * 0.1, 0.0, 0.0);

    out_FragColor = vec4(result, color.a);
}
