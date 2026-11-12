import * as THREE from "three";

import { sampleAsset, type SampledCloud } from "./ImageSampler";
import { CameraDirector, type CameraPhase } from "./CameraDirector";
import { MORPH_MS, phaseFromMorph } from "./easing";

export type ParticlePhase = CameraPhase;

export interface ParticleEngineOptions {
  particleCount?: number;
  reducedMotion?: boolean;
  background?: string;
  onPhaseChange?: (phase: ParticlePhase) => void;
  onIdle?: () => void;
}

/** Base particle diameter in CSS px at the reference camera distance. */
const POINT_SIZE_PX = 2.2;
const REF_CAMERA_DIST = 1.85;
const IDLE_DRIFT = 0.012;

/**
 * Continuous GPU morph: one uMorph 0→1.
 * Path = mix(from, to, ease) + mid-flight burst envelope (no phase seams).
 * Easing + stagger happen in the vertex shader.
 */
const VERT = /* glsl */ `
attribute vec3 aFrom;
attribute vec3 aTo;
attribute vec3 aColorFrom;
attribute vec3 aColorTo;
attribute vec3 aRand;
attribute float aSize;

uniform float uMorph;
uniform float uTime;
uniform float uPixelRatio;
uniform float uDrift;
uniform float uPointSize;
uniform float uRefDist;
uniform float uMorphing;

varying vec3 vColor;
varying float vAlpha;

float easeInOutCubic(float t) {
  return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
}

float staggered(float progress, float seed) {
  float delay = seed * 0.18;
  float span = max(1.0 - delay, 0.001);
  return clamp((progress - delay) / span, 0.0, 1.0);
}

void main() {
  float seed = fract(aRand.x * 0.5 + aRand.y * 0.35 + aRand.z * 0.15);
  float raw = clamp(uMorph, 0.0, 1.0);
  float t = easeInOutCubic(staggered(raw, seed));

  vec3 dir = normalize(aRand + vec3(0.001));
  // Peak displacement in the middle of the morph — continuous, no phase reset.
  float envelope = sin(3.14159265 * t);
  vec3 burst = dir * envelope * (0.55 + length(aRand) * 0.55);
  vec3 swirl = vec3(
    sin(uTime * 0.9 + aRand.z * 6.0),
    cos(uTime * 0.7 + aRand.x * 5.0),
    sin(uTime * 0.5 + aRand.y * 4.0)
  ) * envelope * 0.12;

  vec3 base = mix(aFrom, aTo, t);
  vec3 pos = base + burst + swirl;

  if (uMorphing < 0.5) {
    pos = aTo + vec3(
      sin(uTime * 0.8 + aRand.z * 10.0),
      cos(uTime * 0.6 + aRand.x * 8.0),
      sin(uTime * 0.5 + aRand.y * 7.0)
    ) * uDrift;
  }

  vColor = mix(aColorFrom, aColorTo, t);
  vAlpha = mix(0.95, 0.62, envelope);

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  float jitter = 0.75 + aSize * 0.5;
  gl_PointSize = clamp(
    uPointSize * uPixelRatio * jitter * (uRefDist / max(-mv.z, 0.1)),
    0.0,
    8.0
  );
}
`;

const FRAG = /* glsl */ `
precision mediump float;
varying vec3 vColor;
varying float vAlpha;

void main() {
  vec2 c = gl_PointCoord - vec2(0.5);
  float r2 = dot(c, c);
  float alpha = 1.0 - smoothstep(0.12, 0.22, r2);
  if (alpha < 0.06) discard;
  gl_FragColor = vec4(vColor, vAlpha * alpha);
}
`;

function fillRandom(count: number): Float32Array {
  const data = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 0.35 + Math.random() * 0.9;
    data[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    data[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    data[i * 3 + 2] = r * Math.cos(phi) * 0.35;
  }
  return data;
}

function fillSizes(count: number): Float32Array {
  const data = new Float32Array(count);
  for (let i = 0; i < count; i++) data[i] = 0.7 + Math.random() * 0.8;
  return data;
}

export class ParticleEngine {
  readonly canvas: HTMLCanvasElement;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera: THREE.PerspectiveCamera;
  private readonly director = new CameraDirector();
  private readonly count: number;
  private readonly material: THREE.ShaderMaterial;
  private readonly geometry: THREE.BufferGeometry;
  private readonly points: THREE.Points;
  private readonly fromAttr: THREE.BufferAttribute;
  private readonly toAttr: THREE.BufferAttribute;
  private readonly colorFromAttr: THREE.BufferAttribute;
  private readonly colorToAttr: THREE.BufferAttribute;
  private readonly onPhaseChange?: (phase: ParticlePhase) => void;
  private readonly onIdle?: () => void;

  private phase: ParticlePhase = "idle";
  /** Continuous morph clock 0–1 (CPU only advances this; GPU does the rest). */
  private morph = 1;
  private morphStartedAt = 0;
  private morphing = false;
  private reducedMotion = false;
  private raf = 0;
  private disposed = false;
  private transitionToken = 0;
  private currentUrl = "";
  private busy = false;

  constructor(canvas: HTMLCanvasElement, options: ParticleEngineOptions = {}) {
    this.canvas = canvas;
    this.count = options.particleCount ?? 12000;
    this.reducedMotion = options.reducedMotion ?? false;
    this.onPhaseChange = options.onPhaseChange;
    this.onIdle = options.onIdle;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: true,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setClearColor(new THREE.Color(options.background || "#000000"), 0);

    this.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 20);
    this.camera.position.copy(new THREE.Vector3(0, 0, REF_CAMERA_DIST));

    const from = new Float32Array(this.count * 3);
    const to = new Float32Array(this.count * 3);
    const colorFrom = new Float32Array(this.count * 3);
    const colorTo = new Float32Array(this.count * 3);
    colorFrom.fill(0.4);
    colorTo.fill(0.4);

    this.geometry = new THREE.BufferGeometry();
    this.fromAttr = new THREE.BufferAttribute(from, 3);
    this.toAttr = new THREE.BufferAttribute(to, 3);
    this.colorFromAttr = new THREE.BufferAttribute(colorFrom, 3);
    this.colorToAttr = new THREE.BufferAttribute(colorTo, 3);
    this.geometry.setAttribute("aFrom", this.fromAttr);
    this.geometry.setAttribute("aTo", this.toAttr);
    this.geometry.setAttribute("aColorFrom", this.colorFromAttr);
    this.geometry.setAttribute("aColorTo", this.colorToAttr);
    this.geometry.setAttribute(
      "aRand",
      new THREE.BufferAttribute(fillRandom(this.count), 3)
    );
    this.geometry.setAttribute(
      "aSize",
      new THREE.BufferAttribute(fillSizes(this.count), 1)
    );
    this.geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(this.count * 3), 3)
    );

    this.material = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      uniforms: {
        uMorph: { value: 1 },
        uMorphing: { value: 0 },
        uTime: { value: 0 },
        uPixelRatio: { value: this.renderer.getPixelRatio() },
        uDrift: { value: this.reducedMotion ? 0 : IDLE_DRIFT },
        uPointSize: { value: POINT_SIZE_PX },
        uRefDist: { value: REF_CAMERA_DIST },
      },
    });

    this.points = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.points);

    this.resize();
    this.tick = this.tick.bind(this);
    this.raf = requestAnimationFrame(this.tick);
  }

  get isBusy() {
    return this.busy;
  }

  get phaseName() {
    return this.phase;
  }

  get currentAssetUrl() {
    return this.currentUrl;
  }

  setReducedMotion(value: boolean) {
    this.reducedMotion = value;
    this.material.uniforms.uDrift.value = value ? 0 : IDLE_DRIFT;
  }

  setBackground(cssColor: string) {
    void cssColor;
  }

  resize() {
    const width = Math.max(1, this.canvas.clientWidth);
    const height = Math.max(1, this.canvas.clientHeight);
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.material.uniforms.uPixelRatio.value = this.renderer.getPixelRatio();
  }

  async loadInitial(url: string) {
    const token = ++this.transitionToken;
    this.busy = true;
    const cloud = await sampleAsset(url, this.count);
    if (token !== this.transitionToken || this.disposed) return;
    this.writeTargets(cloud, cloud);
    this.currentUrl = url;
    this.setIdle();
    this.busy = false;
    this.onIdle?.();
  }

  async goTo(url: string) {
    if (this.disposed) return;
    if (url === this.currentUrl && this.phase === "idle" && !this.morphing) return;

    const token = ++this.transitionToken;
    this.busy = true;

    const cloud = await sampleAsset(url, this.count);
    if (token !== this.transitionToken || this.disposed) return;

    if (this.reducedMotion) {
      this.writeTargets(cloud, cloud);
      this.currentUrl = url;
      this.setIdle();
      this.busy = false;
      this.onIdle?.();
      return;
    }

    // Current visual → from; next sample → to. Colors lerp on GPU the whole way.
    const fromPos = (this.toAttr.array as Float32Array).slice();
    const fromColor = (this.colorToAttr.array as Float32Array).slice();
    this.fromAttr.array.set(fromPos);
    this.colorFromAttr.array.set(fromColor);
    this.toAttr.array.set(cloud.positions);
    this.colorToAttr.array.set(cloud.colors);
    this.fromAttr.needsUpdate = true;
    this.toAttr.needsUpdate = true;
    this.colorFromAttr.needsUpdate = true;
    this.colorToAttr.needsUpdate = true;

    await this.runMorph(token);
    if (token !== this.transitionToken || this.disposed) return;

    this.fromAttr.array.set(cloud.positions);
    this.colorFromAttr.array.set(cloud.colors);
    this.fromAttr.needsUpdate = true;
    this.colorFromAttr.needsUpdate = true;

    this.currentUrl = url;
    this.setIdle();
    this.busy = false;
    this.onIdle?.();
  }

  destroy() {
    this.disposed = true;
    this.transitionToken += 1;
    cancelAnimationFrame(this.raf);
    this.geometry.dispose();
    this.material.dispose();
    this.renderer.dispose();
  }

  private writeTargets(from: SampledCloud, to: SampledCloud) {
    this.fromAttr.array.set(from.positions);
    this.toAttr.array.set(to.positions);
    this.colorFromAttr.array.set(from.colors);
    this.colorToAttr.array.set(to.colors);
    this.fromAttr.needsUpdate = true;
    this.toAttr.needsUpdate = true;
    this.colorFromAttr.needsUpdate = true;
    this.colorToAttr.needsUpdate = true;
  }

  private setIdle() {
    this.morphing = false;
    this.morph = 1;
    this.phase = "idle";
    this.material.uniforms.uMorph.value = 1;
    this.material.uniforms.uMorphing.value = 0;
    this.onPhaseChange?.("idle");
  }

  private runMorph(token: number) {
    return new Promise<void>((resolve) => {
      this.morphing = true;
      this.morphStartedAt = performance.now();
      this.morph = 0;
      this.material.uniforms.uMorph.value = 0;
      this.material.uniforms.uMorphing.value = 1;
      this.phase = "explode";
      this.onPhaseChange?.("explode");

      const step = () => {
        if (token !== this.transitionToken || this.disposed) {
          resolve();
          return;
        }
        const elapsed = performance.now() - this.morphStartedAt;
        const t = Math.min(1, elapsed / MORPH_MS);
        this.morph = t;
        this.material.uniforms.uMorph.value = t;

        const nextPhase = phaseFromMorph(t);
        if (nextPhase !== this.phase && nextPhase !== "idle") {
          this.phase = nextPhase;
          this.onPhaseChange?.(nextPhase);
        }

        if (t >= 1) {
          resolve();
          return;
        }
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

  private tick(now: number) {
    if (this.disposed) return;
    this.material.uniforms.uTime.value = now * 0.001;
    this.director.apply(
      this.camera,
      this.morphing ? this.morph : 1,
      this.reducedMotion
    );
    this.renderer.render(this.scene, this.camera);
    this.raf = requestAnimationFrame(this.tick);
  }
}

export function pickParticleCount(width: number): number {
  if (width < 768) return 5000;
  if (width < 1280) return 10000;
  return 16000;
}
