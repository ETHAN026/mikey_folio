import { useMemo, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { motion } from "framer-motion"

// === Snow particle field (animated) ===

function SnowField({ count = 350 }) {
  const ref = useRef()

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const speeds = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 60
      positions[i * 3 + 1] = Math.random() * 30
      positions[i * 3 + 2] = (Math.random() - 0.5) * 60
      speeds[i] = 0.03 + Math.random() * 0.05
    }
    return { positions, speeds }
  }, [count])

  useFrame(() => {
    const positions = ref.current.geometry.attributes.position.array
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 1] -= particles.speeds[i]
      if (positions[i * 3 + 1] < -4) {
        positions[i * 3 + 1] = 25 + Math.random() * 5
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
        size={0.18}
        transparent
        opacity={0.9}
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
            emissive={c.color}
            emissiveIntensity={0.35}
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
            color="rgb(120, 200, 255)"
            emissive="rgb(80, 160, 230)"
            emissiveIntensity={0.6}
            transparent
            opacity={0.65}
            metalness={0.8}
            roughness={0.1}
          />
        </mesh>
      ))}
    </group>
  )
}

// === HTML overlay (hero content) ===

function Overlay() {
  return (
    <div className="pointer-events-none fixed inset-0 z-10 flex flex-col justify-between p-6 sm:p-10">
      <header className="flex items-start justify-between">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-lg font-bold tracking-[0.25em] text-sky-100 sm:text-xl">
            ETHAN OREKAN
          </h1>
          <p className="mt-1 text-[10px] tracking-[0.4em] text-sky-400/80 sm:text-xs">
            PORTFOLIO
          </p>
        </motion.div>
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="hidden gap-8 text-sm text-sky-200/80 sm:flex"
        >
          <a className="transition-colors hover:text-white" href="#competences">Compétences</a>
          <a className="transition-colors hover:text-white" href="#projets">Projets</a>
          <a className="transition-colors hover:text-white" href="#contact">Contact</a>
        </motion.nav>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.4 }}
        className="mx-auto max-w-3xl text-center"
      >
        <h2 className="text-4xl font-black leading-tight text-white drop-shadow-[0_0_25px_rgba(100,180,255,0.35)] sm:text-6xl">
          Bienvenue dans
          <br />
          mon igloo
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-sm text-sky-200/80 sm:text-base">
          Développeur web — un portfolio sculpté dans la glace,
          construit avec React, Three.js et beaucoup de neige.
        </p>
      </motion.div>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="text-center text-[10px] tracking-[0.35em] text-sky-300/60 sm:text-xs"
      >
        GLISSEZ POUR EXPLORER LA SCÈNE
      </motion.footer>
    </div>
  )
}

// === Main scene ===

export default function App() {
  return (
    <>
      <Canvas
        gl={{ antialias: true, alpha: false }}
        camera={{ position: [0, 0, 18], fov: 55 }}
        dpr={Math.min(window.devicePixelRatio, 2)}
      >
        {/* Arctic night sky */}
        <color attach="background" args={["#0a192f"]} />
        <fog attach="fog" args={["#0a192f", 25, 90]} />

        {/* Lights */}
        <ambientLight intensity={0.5} />
        <hemisphereLight args={["#7fb4ff", "#0a192f", 0.6]} />
        <pointLight
          position={[0, 4, 2]}
          intensity={40}
          color="rgb(150, 220, 255)"
          distance={40}
          decay={2}
        />

        {/* Snowy ground */}
        <mesh position={[0, -4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[200, 200]} />
          <meshStandardMaterial color="rgb(226, 238, 252)" roughness={0.9} />
        </mesh>

        {/* Distant mountains (dark silhouettes) */}
        <mesh position={[-14, -3, -30]} rotation={[-0.15, 0, 0]}>
          <boxGeometry args={[22, 9, 22]} />
          <meshStandardMaterial color="rgb(22, 50, 82)" flatShading />
        </mesh>
        <mesh position={[13, -3.5, -35]} rotation={[-0.15, 0.3, 0]}>
          <boxGeometry args={[18, 10, 18]} />
          <meshStandardMaterial color="rgb(18, 42, 70)" flatShading />
        </mesh>
        <mesh position={[0, -4, -45]} rotation={[0, 0.6, 0]}>
          <boxGeometry args={[30, 12, 20]} />
          <meshStandardMaterial color="rgb(14, 34, 58)" flatShading />
        </mesh>

        {/* Main igloo dome (camera sits inside) */}
        <mesh position={[0, -0.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <icosahedronGeometry args={[5, 1]} />
          <meshStandardMaterial
            color="rgb(235, 245, 255)"
            transparent
            opacity={0.97}
            side="BackSide"
            roughness={0.6}
          />
        </mesh>

        {/* Igloo wireframe texture */}
        <mesh position={[0, -0.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <icosahedronGeometry args={[5.3, 1]} />
          <meshStandardMaterial
            color="rgb(140, 200, 255)"
            transparent
            opacity={0.35}
            side="BackSide"
            wireframe
            roughness={0.25}
          />
        </mesh>

        {/* Entrance torus */}
        <mesh position={[0, -1.3, 0]} rotation={[0, Math.PI, 0]}>
          <torusGeometry args={[2.5, 0.6, 16, 32]} />
          <meshStandardMaterial color="rgb(240, 245, 255)" roughness={0.5} />
        </mesh>

        {/* Skill crystals */}
        <group position={[-8, 0.5, -6]} rotation={[0, 0.2, 0]}>
          <IceCrystalCluster
            count={40}
            radius={4}
            colors={["#7dd3fc", "#67e8f9", "#a5b4fc"]}
          />
        </group>

        {/* Holographic panels */}
        <group position={[6, 1, -4]} rotation={[0, -0.2, 0]}>
          <HolographicPanels count={6} size={1.8} />
        </group>

        {/* Snow */}
        <SnowField count={350} />

        {/* CTA orb */}
        <mesh position={[-9, -2.8, 2]}>
          <torusGeometry args={[0.8, 0.2, 32, 64]} />
          <meshStandardMaterial
            color="rgb(110, 210, 255)"
            emissive="rgb(110, 210, 255)"
            emissiveIntensity={1.2}
            roughness={0.4}
          />
        </mesh>

        {/* Sections for scroll transitions */}
        <group id="hero" />
        <group id="competences" />
        <group id="projets" />
        <group id="experiences" />
        <group id="formations" />
        <group id="contact" />

        <OrbitControls
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.4}
          minDistance={7}
          maxDistance={26}
          minPolarAngle={Math.PI / 3.5}
          maxPolarAngle={Math.PI / 2.1}
        />
      </Canvas>

      <Overlay />
    </>
  )
}
