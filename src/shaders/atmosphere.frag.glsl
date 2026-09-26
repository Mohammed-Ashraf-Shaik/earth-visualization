uniform vec3 uAtmosphereColor; // Default: vec3(0.18, 0.54, 0.98)
uniform float uCoefficient;    // Default: 0.65
uniform float uPower;          // Default: 3.2

varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  vec3 viewDirection = normalize(-vPosition);
  float intensity = pow(uCoefficient - dot(vNormal, viewDirection), uPower);
  gl_FragColor = vec4(uAtmosphereColor, 1.0) * intensity;
}
