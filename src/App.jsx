import { useEffect, useRef } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { motion } from "framer-motion"

export default function App() {
  return (
    <Canvas
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 0, 18], fov: 55 }}
      controls={OrbitControls}
      resize
      pixelRatio={Math.min(window.devicePixelRatio, 2)}
      shadows
    >
      <fog near={0.003} far={20} color="rgb(245, 250, 255)" />

      {/* Snowy ground */}
      <mesh>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial
          color="rgb(248, 250, 255)"
          transparent
          opacity={0.96}
        />
        <position y={-4} />
        <rotation x={-Math.PI / 2} />
      </mesh>

      {/* Distant mountains */}
      <group rotation={[-0.15, 0, 0]} position={[-10, 0, -20]}>
        <mesh>
          <boxGeometry args={[15, 2.5, 15]} />
          <meshStandardMaterial color="rgb(225, 232, 242)" flatShading />
        </mesh>
      </group>
      <group rotation={[-0.15, 0, 0]} position={[10, 0, -22]}>
        <mesh>
          <boxGeometry args={[12, 2.8, 12]} />
          <meshStandardMaterial color="rgb(225, 232, 242)" flatShading />
        </mesh>
      </group>

      {/* Main igloo */}
      <mesh position={[0, -0.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <icoGeometry args={[5, 1]} />
        <meshStandardMaterial
          color="rgb(255, 255, 255)"
          transparent
          opacity={0.96}
          side="BackSide"
        />
      </mesh>

      {/* Igloo texture */}
      <mesh position={[0, -0.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <icoGeometry args={[5.3, 1]} />
        <meshStandardMaterial
          color="rgb(242, 248, 255)"
          transparent
          opacity={0.45}
          side="BackSide"
          wireframe
          roughness={0.25}
        />
      </mesh>

      {/* Entrance */}
      <mesh position={[0, -1.3, 0]} rotation={[0, Math.PI, 0]}>
        <torusGeometry args={[2.5, 0.6, 16, 32]} />
        <meshStandardMaterial
          color="rgb(240, 245, 255)"
          transparent
          opacity={0.97}
        />
      </mesh>

      {/* Interior light */}
      <ambientLight color="rgb(140, 220, 255)" intensity={0.35} />
      <pointLight position={[0, 2, 0]} intensity={1.1} color="rgb(150, 230, 255)" distance={20} />

      {/* Skill crystals */}
      <group position={[-8, 1, -5]} rotation={[0, 0.2, 0]}>
        <IceCrystalCluster count={40} radius={4} colors={["hsl(210,80%,65%)", "hsl(180,70%,60%)", "hsl(160,75%,55%)"]} />
      </group>

      {/* Holographic panels */}
      <group position={[6, 1, -4]} rotation={[0, -0.2, 0]}>
        <HolographicPanels count={6} size={1.8} />
      </group>

      {/* Snow field */}
      <SnowField particleCount={350} sizeRange={[0.1, 0.6]} downSpeed={[0.03, 0.08]} />

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
    </Canvas>
  )
}

// === Sub-components ===

const IceCrystal = ({ size, position, color }) => ({
  position: position,
  scale: size,
  geometry: "icosahedron",
  material: {
    color: color,
    transparent: true,
    opacity: 0.85,
    wireframe: true,
    metalness: 0.3,
    roughness: 0.4,
  },
  rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
})

const IceCrystalCluster = ({ count, radius, colors }) => {
  const crystals = Array.from({ length: count }, (_, i) => ({
    key: i,
    position: [
      Math.random() * radius - radius / 2,
      Math.random() * radius * 0.5,
      Math.random() * radius - radius / 2,
    ],
    size: 0.3 + Math.random() * 0.7,
    color: colors[i % colors.length],
  }))

  return {
    children: crystals.map((c, i) => ({
      key: i,
      ...IceCrystal({
        size: c.size,
        position: c.position,
        color: c.color,
      }),
    })),
  }
}

const HolographicPanels = ({ count, size }) => {
  const panels = Array.from({ length: count }, (_, i) => ({
    key: i,
    position: [
      (Math.random() - 0.5) * 5,
      0.5 + Math.random() * 3,
      (Math.random() - 0.5) * 5,
    ],
    rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
    scale: 0.6 + Math.random() * 0.8,
  }))

  return {
    children: panels.map((p, i) => ({
      key: i,
      ...HolographicPanel({ position: p.position, rotation: p.rotation, scale: p.scale }),
    })),
  }
}

const HolographicPanel = ({ position, rotation, scale }) => ({
  position: position,
  rotation: rotation,
  scale: scale,
  children: (
    <mesh
      boxGeometry args={[size, 0.3, size]}
      material={{
        color: "rgb(200, 230, 255)",
        transparent: true,
        opacity: 0.55,
        metalness: 0.8,
        roughness: 0.1,
      }}
      rotation={rotation}
      scale={scale}
    />
  ),
})

const SnowField = ({ particleCount, sizeRange, downSpeed }) => {
  const sizes = Array.from({ length: particleCount }, () =>
    Math.random() * (sizeRange[1] - sizeRange[0]) + sizeRange[0]
  )
  const startY = Array.from({ length: particleCount }, () =>
    Math.random() * 20 + 10
  )
  const startX = Array.from({ length: particleCount }, () =>
    (Math.random() - 0.5) * 40
  )
  const startZ = Array.from({ length: particleCount }, () =>
    (Math.random() - 0.5) * 40
  )

  return {
    children: Array.from({ length: particleCount }).map((_, i) => ({
      key: i,
      position: [startX[i], startY[i], startZ[i]],
      size: sizes[i],
    })),
    args: [[startX, startY, startZ], [sizes]],
    material: {
      transparent: true,
      opacity: 0.25,
      sizeAttenuation: true,
    },
  }
}