import * as THREE from "three"

// ============================================================
// Bruit de valeur 2D léger (déterministe) pour le terrain
// ============================================================

function hash2(x, z) {
  const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453123
  return s - Math.floor(s)
}

function smooth(t) {
  return t * t * (3 - 2 * t)
}

export function valueNoise(x, z) {
  const xi = Math.floor(x)
  const zi = Math.floor(z)
  const xf = x - xi
  const zf = z - zi
  const a = hash2(xi, zi)
  const b = hash2(xi + 1, zi)
  const c = hash2(xi, zi + 1)
  const d = hash2(xi + 1, zi + 1)
  const u = smooth(xf)
  const v = smooth(zf)
  return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v
}

export function fbm(x, z, octaves = 3) {
  let amp = 1
  let freq = 1
  let sum = 0
  let norm = 0
  for (let i = 0; i < octaves; i++) {
    sum += valueNoise(x * freq, z * freq) * amp
    norm += amp
    amp *= 0.5
    freq *= 2.1
  }
  return sum / norm
}

// ============================================================
// Sol arctique : plaine immense, relief subtil, creux près du camp
// ============================================================

export function createTerrainGeometry(size = 420, segments = 150) {
  const geo = new THREE.PlaneGeometry(size, size, segments, segments)
  const pos = geo.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i) // sera le z après rotation
    const r = Math.hypot(x, y)
    // masque : plat autour de l'igloo, relief croissant au loin
    const mask = THREE.MathUtils.smoothstep(r, 8, 55)
    const h =
      (fbm(x * 0.012 + 10, y * 0.012 - 4, 3) - 0.45) * 9 * mask +
      (fbm(x * 0.05, y * 0.05, 2) - 0.5) * 1.4 * mask +
      Math.pow(THREE.MathUtils.smoothstep(r, 60, 200), 2) * 14 // cuvette lointaine
    pos.setZ(i, h)
  }
  geo.computeVertexNormals()
  geo.rotateX(-Math.PI / 2)
  return geo
}

// ============================================================
// Chaîne de montagnes lointaine (silhouettes sculptées)
// ============================================================

export function createRidgeGeometry(radius = 26, height = 26, seed = 0) {
  const geo = new THREE.ConeGeometry(radius, height, 9, 5)
  const pos = geo.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    const z = pos.getZ(i)
    const n = fbm(x * 0.11 + seed * 7, z * 0.11 - seed * 3, 3)
    pos.setX(i, x * (0.72 + n * 0.5))
    pos.setZ(i, z * (0.72 + n * 0.5))
    if (y < height / 2 - 0.01) {
      pos.setX(i, x * 1.02)
    }
  }
  geo.computeVertexNormals()
  return geo
}

// ============================================================
// Matériau de neige : shader points pour la neige volumétrique
// (chute + rafales de vent + scintillement, tout sur GPU)
// ============================================================

export function createSnowMaterial({ speed = 1, size = 18, wind = 1, opacity = 0.75, height = 40 }) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uWind: { value: wind },
      uGust: { value: 0 },
      uSpeed: { value: speed },
      uSize: { value: size },
      uOpacity: { value: opacity },
      uHeight: { value: height },
    },
    vertexShader: /* glsl */ `
      attribute vec3 aSeed;
      uniform float uTime;
      uniform float uWind;
      uniform float uGust;
      uniform float uSpeed;
      uniform float uSize;
      uniform float uHeight;
      varying float vTwinkle;
      void main() {
        vec3 p = position;
        float fall = uTime * uSpeed * (0.55 + aSeed.x);
        p.y = mod(p.y - fall, uHeight);
        float sway = sin(uTime * (0.6 + aSeed.y) + aSeed.y * 40.0);
        p.x += sway * uWind * (0.6 + aSeed.z * 0.8) + uGust * (0.5 + aSeed.x);
        p.z += cos(uTime * 0.5 + aSeed.z * 30.0) * uWind * 0.35;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = uSize * (1.0 + aSeed.z) / max(1.0, -mv.z);
        vTwinkle = 0.55 + 0.45 * sin(uTime * (1.5 + aSeed.x * 2.0) + aSeed.y * 90.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uOpacity;
      varying float vTwinkle;
      void main() {
        vec2 uv = gl_PointCoord - 0.5;
        float d = length(uv);
        float alpha = smoothstep(0.5, 0.08, d) * uOpacity * vTwinkle;
        if (alpha < 0.01) discard;
        gl_FragColor = vec4(vec3(0.93, 0.96, 1.0), alpha);
      }
    `,
  })
}

// ============================================================
// Ciel : dôme dégradé nuit polaire + voile d'aurore très discret
// ============================================================

export function createSkyMaterial() {
  return new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms: { uTime: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec3 vWorld;
      void main() {
        vWorld = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vWorld;
      uniform float uTime;
      void main() {
        float h = normalize(vWorld).y;
        // dégradé : bleu nuit profond -> bleu d'horizon froid
        vec3 zenith = vec3(0.012, 0.028, 0.062);
        vec3 mid    = vec3(0.055, 0.10, 0.18);
        vec3 horizon = vec3(0.36, 0.47, 0.58);
        vec3 col = mix(mid, zenith, smoothstep(0.06, 0.55, h));
        col = mix(horizon, col, smoothstep(-0.02, 0.14, h));
        // aurore discrète : voile vertical sinusoïdal, très désaturé
        float band = exp(-pow((h - 0.24) * 5.2, 2.0));
        float curtain = 0.5 + 0.5 * sin(vWorld.x * 0.045 + uTime * 0.05);
        curtain *= 0.6 + 0.4 * sin(vWorld.z * 0.03 - uTime * 0.03);
        vec3 aurora = vec3(0.28, 0.62, 0.52) * band * curtain * 0.16;
        col += aurora;
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  })
}

// ============================================================
// Texture de lueur radiale (halo lunaire, lumières intérieures)
// ============================================================

export function createGlowTexture() {
  const c = document.createElement("canvas")
  c.width = c.height = 128
  const ctx = c.getContext("2d")
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  g.addColorStop(0, "rgba(255,255,255,1)")
  g.addColorStop(0.25, "rgba(220,235,255,0.55)")
  g.addColorStop(1, "rgba(200,225,255,0)")
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 128, 128)
  const tex = new THREE.CanvasTexture(c)
  return tex
}
