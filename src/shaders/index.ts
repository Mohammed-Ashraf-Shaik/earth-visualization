export const atmosphereVertShader = `
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  vNormal = normalize(normalMatrix * normal);
  vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const atmosphereFragShader = `
uniform vec3 uAtmosphereColor;
uniform float uCoefficient;
uniform float uPower;

varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  vec3 viewDirection = normalize(-vPosition);
  float intensity = pow(uCoefficient - dot(vNormal, viewDirection), uPower);
  gl_FragColor = vec4(uAtmosphereColor, 1.0) * intensity;
}
`;

export const terminatorFragShader = `
uniform sampler2D uDayTexture;
uniform sampler2D uNightTexture;
uniform sampler2D uSpecularMap;
uniform vec3 uSunDirection;

varying vec2 vUv;
varying vec3 vNormal;

void main() {
  vec3 norm = normalize(vNormal);
  vec3 sunDir = normalize(uSunDirection);
  float nDotL = dot(norm, sunDir);
  
  float blendFactor = smoothstep(-0.15, 0.15, nDotL);
  
  vec4 dayColor = texture2D(uDayTexture, vUv);
  vec4 nightColor = texture2D(uNightTexture, vUv);
  vec4 specColor = texture2D(uSpecularMap, vUv);
  
  vec3 viewDir = vec3(0.0, 0.0, 1.0);
  vec3 halfVector = normalize(sunDir + viewDir);
  float specFactor = pow(max(dot(norm, halfVector), 0.0), 32.0) * (1.0 - specColor.r);
  
  vec3 finalColor = mix(nightColor.rgb * 1.6, dayColor.rgb + vec3(specFactor * 0.4), blendFactor);
  
  gl_FragColor = vec4(finalColor, 1.0);
}
`;
