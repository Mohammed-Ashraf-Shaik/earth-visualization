'use client';

import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

// Custom Space Telescope Vignette & Optical Aberration Shader
const OpticalVignetteShader = {
  uniforms: {
    tDiffuse: { value: null },
    offset: { value: 0.35 },
    darkness: { value: 0.65 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float offset;
    uniform float darkness;
    varying vec2 vUv;

    void main() {
      vec4 texel = texture2D(tDiffuse, vUv);
      vec2 uv = (vUv - vec2(0.5)) * vec2(offset);
      float dist = length(uv);
      float vig = clamp(1.0 - dist * darkness, 0.0, 1.0);
      
      // Subtle cinematic tone curve
      vec3 col = texel.rgb * vig;
      gl_FragColor = vec4(col, texel.a);
    }
  `,
};

export class PostProcessingPipeline {
  public composer: EffectComposer;
  public bloomPass: UnrealBloomPass;
  public vignettePass: ShaderPass;
  public renderPass: RenderPass;

  constructor(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    width: number,
    height: number
  ) {
    // 1. Configure renderer for ACESFilmic tone mapping with 1.15 exposure
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    // 2. Setup EffectComposer
    const renderTarget = new THREE.WebGLRenderTarget(width, height, {
      type: THREE.HalfFloatType,
      format: THREE.RGBAFormat,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      stencilBuffer: false,
      depthBuffer: true,
    });

    this.composer = new EffectComposer(renderer, renderTarget);

    // 3. RenderPass
    this.renderPass = new RenderPass(scene, camera);
    this.composer.addPass(this.renderPass);

    // 4. UnrealBloomPass: intensity 1.35, threshold 0.22, smoothing 0.85
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      1.35,  // strength
      0.85,  // radius
      0.22   // threshold
    );
    this.composer.addPass(this.bloomPass);

    // 5. Vignette optical lens pass: offset 0.35, darkness 0.65
    this.vignettePass = new ShaderPass(OpticalVignetteShader);
    this.composer.addPass(this.vignettePass);

    // 6. OutputPass for accurate color space conversion
    const outputPass = new OutputPass();
    this.composer.addPass(outputPass);
  }

  public setSize(width: number, height: number) {
    this.composer.setSize(width, height);
    this.bloomPass.resolution.set(width, height);
  }

  public setBloomEnabled(enabled: boolean) {
    this.bloomPass.enabled = enabled;
  }

  public render() {
    this.composer.render();
  }
}
