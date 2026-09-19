import { useMemo, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { motion } from "framer-motion"

// === Snow particle field (animated) ===

function SnowField({ count = 350 }) {
  const ref = useRef()

  // Positions & speeds are memoized so they survive StrictMode re-renders
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const speeds = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40
      positions[i * 3 + 1] = Math.random() * 20 + 10
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40
      speeds[i] = 0.03 + Math.random() * 0.05
    }
    return { positions, speeds }
  }, [count])

  useFrame(() => {
    const positions = ref.current.geometry.attributes.position.array
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 1] -= particles.speeds[i]
      // Reset to the top once a flake reaches the ground
      if (positions[i * 3 + 1] < -4) {
        positions[i * 3 + 1] = 20 + Math.random() * 5
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particles.positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="rgb(255, 255, 255)"
        size={0.15}
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  )
}

// === Ice crystal cluster (decorative) ===

function IceCrystalCluster({ count = 40, radius = 4, colors }) {
  const crystals = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        key: i,
        position: [
          Math.random() * radius - radius / 2,
          Math.random() * radius * 0.5,
          Math.random() * radius - radius / 2,
        ],
        size: 0.3 + Math.random() * 0.7,
        rotation: [
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI,
        ],
        color: colors[i % colors.length],
      })),
    [count, radius, colors]
  )

  return (
    <group>
      {crystals.map((c) => (
        <mesh key={c.key} position={c.position} rotation={c.rotation} scale={c.size}>
          <icosahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color={c.color}
            transparent
            opacity={0.85}
            wireframe
            metalness={0.3}
            roughness={0.4}
          />
        </mesh>
      ))}
    </group>
  )
}

// === Holographic panels (decorative) ===

function HolographicPanels({ count = 6, size = 1.8 }) {
  const ref = useRef()

  useFrame((state) => {
    ref.current.children.forEach((panel, i) => {
      panel.rotation.y += 0.002 * (i % 2 === 0 ? 1 : -1)
      panel.position.y += Math.sin(state.clock.elapsedTime + i) * 0.002
    })
  })

  const panels = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        key: i,
        position: [
          (Math.random() - 0.5) * 5,
          0.5 + Math.random() * 3,
          (Math.random() - 0.5) * 5,
        ],
        rotation: [
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI,
        ],
        scale: 0.6 + Math.random() * 0.8,
      })),
    [count]
  )

  return (
    <group ref={ref}>
      {panels.map((p) => (
        <mesh key={p.key} position={p.position} rotation={p.rotation} scale={p.scale}>
          <boxGeometry args={[size, 0.3, size]} />
          <meshStandardMaterial
            color="rgb(200, 230, 255)"
            transparent
            opacity={0.55}
            metalness={0.8}
            roughness={0.1}
          />
        </mesh>
      ))}
    </group>
  )
}

// === Main scene ===

export default function App() {
  return (
    <Canvas
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 0, 18], fov: 55 }}
      dpr={Math.min(window.devicePixelRatio, 2)}
      style={{ position: "fixed", inset: 0 }}
    >
      <fog attach="fog" near={20} far={60} color="rgb(245, 250, 255)" />

      {/* Snowy ground */}
      <mesh position={[0, -4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="rgb(248, 250, 255)" transparent opacity={0.96} />
      </mesh>

      {/* Distant mountains */}
      <group rotation={[-0.15, 0, 0]} position={[-10, -1, -20]}>
        <mesh>
          <boxGeometry args={[15, 2.5, 15]} />
          <meshStandardMaterial color="rgb(225, 232, 242)" flatShading />
        </mesh>
      </group>
      <group rotation={[-0.15, 0, 0]} position={[10, -1.2, -22]}>
        <mesh>
          <boxGeometry args={[12, 2.8, 12]} />
        </mesh>
      </group>

      {/* Main igloo dome (BackSide so the camera sits inside) */}
      <mesh position={[0, -0.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <icosahedronGeometry args={[5, 1]} />
        <meshStandardMaterial
          color="rgb(255, 255, 255)"
          transparent
          opacity={0.96}
          side="BackSide"
        />
      </mesh>

      {/* Igloo wireframe texture */}
      <mesh position={[0, -0.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <icosahedronGeometry args={[5.3, 1]} />
        <meshStandardMaterial
          color="rgb(242, 248, 255)"
          transparent
          opacity={0.45}
          side="BackSide"
          wireframe
          roughness={0.25}
        />
      </mesh>

      {/* Entrance torus */}
      <mesh position={[0, -1.3, 0]} rotation={[0, Math.PI, 0]}>
        <torusGeometry args={[2.5, 0.6, 16, 32]} />
        <meshStandardMaterial color="rgb(240, 245, 255)" transparent opacity={0.97} />
      </mesh>

      {/* Lights */}
      <ambientLight color="rgb(140, 220, 255)" intensity={0.35} />
      <pointLight
        position={[0, 2, 0]}
        intensity={1.1}
        color="rgb(150, 230, 255)"
        distance={20}
      />

      {/* Skill crystals */}
      <group position={[-8, 1, -5]} rotation={[0, 0.2, 0]}>
        <IceCrystalCluster
          count={40}
          radius={4}
          colors={["hsl(210,80%,65%)", "hsl(180,70%,60%)", "hsl(160,75%,55%)"]}
        />
      </group>

      {/* Holographic panels */}
      <group position={[6, 1, -4]} rotation={[0, -0.2, 0]}>
        <HolographicPanels count={6} size={1.8} />
      </group>

      {/* Snow */}
      <SnowField count={350} />

      {/* CTA orb */}
      <mesh position={[-9, -4, 0]}>
        <torusGeometry args={[0.8, 0.2, 32, 64]} />
        <meshStandardMaterial
          color="rgb(110, 210, 255)"
          emissive="rgb(110, 210, 255)"
          emissiveIntensity={0.5}
          roughness={0.4}
        />
      </mesh>

      {/* Sections for scroll transitions */}
      <group id="hero" position={[0, 0, 0]} />
      <group id="competences" position={[0, 0, 0]} />
      <group id="projets" position={[0, 0, 0]} />
      <group id="experiences" position={[0, 0, 0]} />
      <group id="formations" position={[0, 0, 0]} />
      <group id="contact" position={[0, 0, 0]} />

      <OrbitControls enablePan={false} minDistance={8} maxDistance={30} />
    </Canvas>
  )
}
