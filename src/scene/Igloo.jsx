import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { createGlowTexture } from "./factory"

const TAU = Math.PI * 2

export function buildIglooBlocks() {
  const rows = [
    { n: 9, phi: 0.07, r: 1.75, y: 0.42, bh: 0.62, bw: 1.14 },
    { n: 10, phi: 0.2, r: 1.66, y: 0.9, bh: 0.6, bw: 1.02 },
    { n: 10, phi: 0.32, r: 1.5, y: 1.34, bh: 0.55, bw: 0.92 },
    { n: 10, phi: 0.44, r: 1.27, y: 1.73, bh: 0.5, bw: 0.8 },
    { n: 8, phi: 0.56, r: 0.98, y: 2.07, bh: 0.45, bw: 0.7 },
    { n: 7, phi: 0.68, r: 0.66, y: 2.34, bh: 0.4, bw: 0.6 },
    { n: 7, phi: 0.8, r: 0.35, y: 2.55, bh: 0.35, bw: 0.5 },
  ]
  const blocks = []
  let offset = 0.32
  rows.forEach((row, ri) => {
    offset += 0.55
    for (let i = 0; i < row.n; i++) {
      const a = (i / row.n) * TAU + offset
      const jit = (f) =>
        (((Math.sin(i * 12.9898 + ri * 78.233 + f) * 43758.5453) % 1) + 1) % 1 * 0.5
      const r = row.r * (1 + jit(1) * 0.09)
      const scaleH = 1 + jit(2) * 0.16
      blocks.push({
        key: `${ri}-${i}`,
        pos: [Math.cos(a) * r, row.y, Math.sin(a) * r],
        size: [row.bw * (0.9 + jit(3) * 0.2), row.bh * scaleH, 0.34 + jit(4) * 0.08],
        rotY: -a,
        rotZ: -row.phi * 0.92,
        tone: 0.82 + jit(5) * 0.14,
      })
    }
  })
  return blocks
}

function buildTunnelBlocks() {
  const segs = []
  const L = 2.3
  const R = 0.62
  const yC = 0.62
  for (let i = 0; i < 5; i++) {
    const t = i / 4
    const z = 1.55 + t * L
    const ang = Math.PI / 2 + (t - 0.5) * 0.9
    segs.push({
      key: `tun-${i}`,
      pos: [Math.cos(ang) * R * 0.1, yC + Math.sin(ang - Math.PI / 2) * R, z],
      size: [0.5, 0.3 + (1 - Math.abs(t - 0.5)) * 0.14, 0.52],
      rotY: 0,
      rotZ: (t - 0.5) * 1.1,
      tone: 0.86 + t * 0.06,
    })
  }
  return segs
}

function SnowBlockMaterial({ tone }) {
  return (
    <meshStandardMaterial
      color={new THREE.Color(tone * 0.95, tone * 0.97, Math.min(1, tone * 1.03))}
      roughness={0.88}
      metalness={0.02}
    />
  )
}

export function Igloo({ hoverProgress = { current: 0 }, onEnterRequest }) {
  const blocks = useMemo(() => buildIglooBlocks(), [])
  const tunnel = useMemo(() => buildTunnelBlocks(), [])
  const group = useRef()
  const glow = useMemo(() => createGlowTexture(), [])
  const [hovered, setHovered] = useState(false)

  const inner = useRef()
  useFrame((state) => {
    const t = state.clock.elapsedTime
    const target = hovered ? 1 : 0
    hoverProgress.current += (target - hoverProgress.current) * 0.045
    if (inner.current) {
      inner.current.intensity =
        2.1 + Math.sin(t * 0.8) * 0.25 + hoverProgress.current * 1.9
    }
    if (group.current) {
      group.current.position.y = Math.sin(t * 0.5) * 0.012 + hoverProgress.current * 0.02
    }
  })

  return (
    <group
      ref={group}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
        document.body.style.cursor = "pointer"
      }}
      onPointerOut={() => {
        setHovered(false)
        document.body.style.cursor = "auto"
      }}
      onClick={(e) => {
        e.stopPropagation()
        onEnterRequest?.()
      }}
    >
      {blocks.map((b) => (
        <mesh key={b.key} position={b.pos} rotation={[0, b.rotY, b.rotZ]} castShadow>
          <boxGeometry args={b.size} />
          <SnowBlockMaterial tone={b.tone} />
        </mesh>
      ))}

      {tunnel.map((b) => (
        <mesh key={b.key} position={b.pos} rotation={[0, b.rotY, b.rotZ]}>
          <boxGeometry args={b.size} />
          <SnowBlockMaterial tone={b.tone} />
        </mesh>
      ))}

      {/* linteau de neige au-dessus de l'entrée */}
      <mesh position={[0, 1.28, 1.62]} rotation={[0.12, 0, 0]}>
        <boxGeometry args={[0.98, 0.2, 0.5]} />
        <SnowBlockMaterial tone={0.9} />
      </mesh>

      {/* ouverture : plan sombre pour la profondeur */}
      <mesh position={[0, 0.62, 1.51]}>
        <planeGeometry args={[0.78, 0.6]} />
        <meshBasicMaterial color="#04070c" />
      </mesh>

      {/* lueur intérieure qui traverse la glace */}
      <pointLight
        ref={inner}
        position={[0, 1.1, 0]}
        color="#7ab3d8"
        intensity={2.1}
        distance={7}
        decay={2}
      />

      {/* halo doux au-dessus du dôme */}
      <sprite position={[0, 3.1, 0]} scale={[3.2, 1.4, 1]}>
        <spriteMaterial
          map={glow}
          color="#9cc8e8"
          transparent
          opacity={0.12}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
    </group>
  )
}
