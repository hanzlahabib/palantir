uniform sampler2D colorTexture;
uniform float intensity;
uniform float threshold;

in vec2 v_textureCoordinates;

vec4 sampleBlur(sampler2D tex, vec2 uv, vec2 offset) {
    vec4 sum = vec4(0.0);
    sum += texture(tex, uv + offset * -4.0) * 0.0162;
    sum += texture(tex, uv + offset * -3.0) * 0.0540;
    sum += texture(tex, uv + offset * -2.0) * 0.1216;
    sum += texture(tex, uv + offset * -1.0) * 0.1945;
    sum += texture(tex, uv) * 0.2270;
    sum += texture(tex, uv + offset * 1.0) * 0.1945;
    sum += texture(tex, uv + offset * 2.0) * 0.1216;
    sum += texture(tex, uv + offset * 3.0) * 0.0540;
    sum += texture(tex, uv + offset * 4.0) * 0.0162;
    return sum;
}

void main() {
    vec4 color = texture(colorTexture, v_textureCoordinates);

    // Extract bright areas above threshold
    float brightness = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
    vec4 bright = brightness > threshold ? color : vec4(0.0);

    // Approximate two-pass Gaussian blur
    vec2 texelSize = 1.0 / vec2(textureSize(colorTexture, 0));
    vec4 blurH = sampleBlur(colorTexture, v_textureCoordinates, vec2(texelSize.x * 2.0, 0.0));
    vec4 blurV = sampleBlur(colorTexture, v_textureCoordinates, vec2(0.0, texelSize.y * 2.0));
    vec4 bloom = (blurH + blurV) * 0.5;

    // Only bloom the bright parts
    float bloomMask = smoothstep(threshold, threshold + 0.2, brightness);
    bloom *= bloomMask;

    // Combine
    out_FragColor = color + bloom * intensity;
}
