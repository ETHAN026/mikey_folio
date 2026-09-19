import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import {
  createTerrainGeometry,
  createRidgeGeometry,
  createSnowMaterial,
  createSkyMaterial,
  createGlowTexture,
} from "./factory"

// ============================================================
// Sol arctique immense
// ============================================================

export function Terrain() {
  const geometry = useMemo(() => createTerrainGeometry(420, 150), [])
  return (
    <mesh geometry={geometry} receiveShadow position={[0, -0.02, 0]}>
      <meshStandardMaterial color="#171c22" roughness={0.97} metalness={0} />
    </mesh>
  )
}

// ============================================================
// Crête montagneuse lointaine (3 anneaux sculptés, opacity par fog)
// ============================================================

export function Ridge() {
  const rings = useMemo(
    () => [
      { r: 210, h: 46, y: -6, seed: 1, color: "#1d242d" },
      { r: 260, h: 60, y: -8, seed: 4, color: "#161c23" },
      { r: 310, h: 78, y: -12, seed: 7, color: "#11161c" },
    ],
    []
  )
  return (
    <group>
      {rings.map((k, i) => (
        <RidgeRing key={i} {...k} />
      ))}
    </group>
  )
}

function RidgeRing({ r, h, y, seed, color }) {
  const geometry = useMemo(() => createRidgeGeometry(r, h, seed), [r, h, seed])
  const ref = useRef()
  const base = useMemo(() => r * 1.12, [r])
  useFrame(({ camera }) => {
    if (ref.current) ref.current.position.x = camera.position.x
    if (ref.current) ref.current.position.z = camera.position.z
  })
  return (
    <mesh ref={ref} geometry={geometry} position={[0, y + h / 2, -base]} visible={false}>
      <meshBasicMaterial color={color} fog={false} />
    </mesh>
  )
}

// Simple variante : crêtes fixes réparties autour de la scène
export function Ridges() {
  const peaks = useMemo(() => {
    const list = []
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2 + 0.3
      const dist = 170 + (i % 3) * 40
      list.push({
        pos: [Math.cos(a) * dist, -4 + (i % 4) * 2, Math.sin(a) * dist],
        r: 34 + (i % 5) * 10,
        h: 34 + ((i * 7) % 5) * 14,
        seed: i * 3 + 1,
        color: i % 2 ? "#181e26" : "#1c232c",
      })
    }
    return list
  }, [])
  return (
    <group>
      {peaks.map((p, i) => (
        <Peak key={i} {...p} />
      ))}
    </group>
  )
}

function Peak({ pos, r, h, seed, color }) {
  const geometry = useMemo(() => createRidgeGeometry(r, h, seed), [r, h, seed])
  return (
    <mesh geometry={geometry} position={[pos[0], pos[1] + h / 2 - 2, pos[2]]}>
      <meshStandardMaterial color={color} roughness={1} flatShading fog />
    </mesh>
  )
}

// ============================================================
// Ciel + lune
// ============================================================

export function Sky() {
  const material = useMemo(() => createSkyMaterial(), [])
  const ref = useRef()
  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime
    if (ref.current) ref.current.position.copy(state.camera.position)
  })
  return (
    <mesh ref={ref} material={material} renderOrder={-100}>
      <sphereGeometry args={[400, 32, 20]} />
    </mesh>
  )
}

export function Moon() {
  const glow = useMemo(() => createGlowTexture(), [])
  return (
    <group position={[-120, 95, -210]}>
      <sprite scale={[90, 90, 1]}>
        <spriteMaterial
          map={glow}
          color="#aab3bd"
          transparent
          opacity={0.22}
          depthWrite={false}
          fog={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
      <mesh>
        <circleGeometry args={[11, 48]} />
        <meshBasicMaterial color="#c9d2db" transparent opacity={0.75} fog={false} />
      </mesh>
    </group>
  )
}

// ============================================================
// Neige volumétrique multi-couches (proche / moyenne / lointaine)
// ============================================================

export function SnowLayers({ progress }) {
  const layers = useMemo(
    () => [
      { count: 900, box: [46, 42, 46], center: [0, 18, 0], speed: 1.15, size: 34, wind: 1.5, opacity: 0.9 },
      { count: 1200, box: [130, 55, 130], center: [0, 24, -20], speed: 0.8, size: 22, wind: 1.9, opacity: 0.55 },
      { count: 1600, box: [340, 80, 340], center: [0, 36, -40], speed: 0.5, size: 12, wind: 2.4, opacity: 0.3 },
    ],
    []
  )
  const gust = useRef(0)
  useFrame((state, delta) => {
    // rafales lentes : le vent respire par vagues
    gust.current =
      0.35 +
      0.3 * Math.sin(state.clock.elapsedTime * 0.23) +
      0.18 * Math.sin(state.clock.elapsedTime * 0.71 + 2)
    void delta
    void progress
  })
  return (
    <group>
      {layers.map((l, i) => (
        <SnowLayer key={i} {...l} gustRef={gust} />
      ))}
    </group>
  )
}

function SnowLayer({ count, box, center, speed, size, wind, opacity, gustRef }) {
  const points = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const seeds = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * box[0]
      positions[i * 3 + 1] = Math.random() * box[1]
      positions[i * 3 + 2] = (Math.random() - 0.5) * box[2]
      seeds[i * 3] = Math.random()
      seeds[i * 3 + 1] = Math.random()
      seeds[i * 3 + 2] = Math.random()
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    g.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 3))
    return g
  }, [count, box])

  const material = useMemo(
    () =>
      createSnowMaterial({
        speed,
        size,
        wind,
        opacity,
        height: box[1],
      }),
    [speed, size, wind, opacity, box]
  )

  const ref = useRef()
  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime
    material.uniforms.uGust.value = gustRef.current
    if (ref.current) ref.current.position.set(center[0], center[1] - box[1] / 2, center[2])
  })

  return <points ref={ref} geometry={points} material={material} frustumCulled={false} />
}

// ============================================================
// Brume au sol : plans additifs doux, dérive lente
// ============================================================

export function GroundMist() {
  const glow = useMemo(() => createGlowTexture(), [])
  const group = useRef()
  const puffs = useMemo(() => {
    const rng = (seed) => {
      const x = Math.sin(seed * 999.7) * 10000
      return x - Math.floor(x)
    }
    return Array.from({ length: 9 }, (_, i) => ({
      pos: [(rng(i + 1) - 0.5) * 70, -1.4 + rng(i + 5) * 0.8, -6 - rng(i + 9) * 40],
      scale: 22 + rng(i + 13) * 26,
      speed: 0.05 + rng(i + 17) * 0.08,
      phase: rng(i + 21) * Math.PI * 2,
    }))
  }, [])
  useFrame((state) => {
    const t = state.clock.elapsedTime
    group.current.children.forEach((spr, i) => {
      const p = puffs[i]
      spr.position.x = p.pos[0] + Math.sin(t * p.speed + p.phase) * 7
      spr.material.opacity = 0.05 + 0.035 * Math.sin(t * 0.11 + p.phase)
    })
  })
  return (
    <group ref={group}>
      {puffs.map((p, i) => (
        <sprite key={i} position={p.pos} scale={[p.scale, p.scale * 0.32, 1]}>
          <spriteMaterial
            map={glow}
            color="#8b95a1"
            transparent
            opacity={0.05}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </sprite>
      ))}
    </group>
  )
}
