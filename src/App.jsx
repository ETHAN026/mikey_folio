import { useEffect, useMemo, useRef, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { AnimatePresence, motion } from "framer-motion"

// === Contenu des sections ===

const SECTIONS = {
  competences: {
    title: "Compétences",
    subtitle: "Ce que je sais faire",
    items: [
      { name: "React / Next.js", level: 85 },
      { name: "Three.js / WebGL", level: 70 },
      { name: "JavaScript / TypeScript", level: 85 },
      { name: "Node.js", level: 75 },
      { name: "CSS / Tailwind", level: 80 },
      { name: "Git / CI-CD", level: 70 },
    ],
  },
  projets: {
    title: "Projets",
    subtitle: "Une sélection de réalisations",
    items: [
      {
        name: "Mikey Folio",
        desc: "Ce portfolio 3D — un igloo interactif construit avec React Three Fiber et Tailwind.",
        tags: ["React", "Three.js", "Tailwind"],
      },
      {
        name: "À venir",
        desc: "D'autres projets arrivent bientôt dans cette vitrine. En attendant, glissez dans la neige.",
        tags: ["Work in progress"],
      },
    ],
  },
  contact: {
    title: "Contact",
    subtitle: "Discutons autour d'un chocolat chaud",
    items: [
      { name: "Email", value: "ethan.orekan@example.com", href: "mailto:ethan.orekan@example.com" },
      { name: "GitHub", value: "github.com/ETHAN026", href: "https://github.com/ETHAN026" },
      { name: "LinkedIn", value: "linkedin.com/in/ethan-orekan", href: "#" },
    ],
  },
}

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

// === Ice crystal cluster (cliquable → compétences) ===

function IceCrystalCluster({ count = 40, radius = 4, colors, onOpen }) {
  const [hovered, setHovered] = useState(false)

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
    <group
      scale={hovered ? 1.08 : 1}
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
        onOpen("competences")
      }}
    >
      {crystals.map((c) => (
        <mesh key={c.key} position={c.position} rotation={c.rotation} scale={c.size}>
          <icosahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color={c.color}
            emissive={c.color}
            emissiveIntensity={hovered ? 0.8 : 0.35}
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

// === Holographic panels (cliquables → projets) ===

function HolographicPanels({ count = 6, size = 1.8, onOpen }) {
  const ref = useRef()
  const [hovered, setHovered] = useState(false)

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
    <group
      ref={ref}
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
        onOpen("projets")
      }}
    >
      {panels.map((p) => (
        <mesh key={p.key} position={p.position} rotation={p.rotation} scale={p.scale}>
          <boxGeometry args={[size, 0.3, size]} />
          <meshStandardMaterial
            color="rgb(120, 200, 255)"
            emissive="rgb(80, 160, 230)"
            emissiveIntensity={hovered ? 1.2 : 0.6}
            transparent
            opacity={hovered ? 0.85 : 0.65}
            metalness={0.8}
            roughness={0.1}
          />
        </mesh>
      ))}
    </group>
  )
}

// === Panneau de section (HTML, glassmorphism) ===

function SectionPanel({ sectionId, onClose }) {
  const section = SECTIONS[sectionId]

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  return (
    <AnimatePresence>
      {section && (
        <motion.div
          key={sectionId}
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="pointer-events-auto fixed inset-x-4 bottom-4 z-30 mx-auto max-w-xl rounded-2xl border border-sky-400/20 bg-sky-950/85 p-6 shadow-[0_0_60px_rgba(60,140,220,0.25)] backdrop-blur-xl sm:inset-x-8 sm:p-8"
        >
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-sky-400/30 text-sky-300 transition-colors hover:bg-sky-400/20 hover:text-white"
          >
            ✕
          </button>

          <h3 className="text-2xl font-bold text-white">{section.title}</h3>
          <p className="mt-1 text-xs tracking-widest text-sky-400/80 uppercase">
            {section.subtitle}
          </p>

          <div className="mt-5 max-h-[45vh] space-y-4 overflow-y-auto pr-1">
            {sectionId === "competences" &&
              section.items.map((item) => (
                <div key={item.name}>
                  <div className="mb-1 flex justify-between text-sm text-sky-100">
                    <span>{item.name}</span>
                    <span className="text-sky-400">{item.level}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-sky-900/60">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.level}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-300"
                    />
                  </div>
                </div>
              ))}

            {sectionId === "projets" &&
              section.items.map((item) => (
                <div
                  key={item.name}
                  className="rounded-xl border border-sky-400/15 bg-sky-900/40 p-4 transition-colors hover:border-sky-400/40"
                >
                  <h4 className="font-semibold text-white">{item.name}</h4>
                  <p className="mt-1 text-sm text-sky-200/75">{item.desc}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-sky-400/25 px-2.5 py-0.5 text-[11px] text-sky-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}

            {sectionId === "contact" &&
              section.items.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-xl border border-sky-400/15 bg-sky-900/40 p-4 text-sm transition-colors hover:border-sky-400/40 hover:bg-sky-900/60"
                >
                  <span className="text-sky-400">{item.name}</span>
                  <span className="text-sky-100">{item.value} →</span>
                </a>
              ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// === HTML overlay (hero content) ===

function Overlay({ activeSection, onOpen, onClose }) {
  return (
    <>
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
            className="pointer-events-auto flex gap-3 text-sm text-sky-200/80 sm:gap-8"
          >
            {Object.entries(SECTIONS).map(([id, section]) => (
              <button
                key={id}
                onClick={() => onOpen(id)}
                className={`cursor-pointer transition-colors hover:text-white ${
                  activeSection === id ? "text-white underline underline-offset-4" : ""
                }`}
              >
                {section.title}
              </button>
            ))}
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
          GLISSEZ POUR EXPLORER — CLIQUEZ LES CRISTAUX ET LES PANNEAUX
        </motion.footer>
      </div>

      <SectionPanel sectionId={activeSection} onClose={onClose} />
    </>
  )
}

// === Main scene ===

export default function App() {
  const [activeSection, setActiveSection] = useState(null)
  const openSection = (id) => setActiveSection(id)
  const closeSection = () => setActiveSection(null)

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

        {/* Skill crystals → clic ouvre "Compétences" */}
        <group position={[-8, 0.5, -6]} rotation={[0, 0.2, 0]}>
          <IceCrystalCluster
            count={40}
            radius={4}
            colors={["#7dd3fc", "#67e8f9", "#a5b4fc"]}
            onOpen={openSection}
          />
        </group>

        {/* Holographic panels → clic ouvre "Projets" */}
        <group position={[6, 1, -4]} rotation={[0, -0.2, 0]}>
          <HolographicPanels count={6} size={1.8} onOpen={openSection} />
        </group>

        {/* Snow */}
        <SnowField count={350} />

        {/* CTA orb → clic ouvre "Contact" */}
        <mesh
          position={[-9, -2.8, 2]}
          onPointerOver={() => {
            document.body.style.cursor = "pointer"
          }}
          onPointerOut={() => {
            document.body.style.cursor = "auto"
          }}
          onClick={() => openSection("contact")}
        >
          <torusGeometry args={[0.8, 0.2, 32, 64]} />
          <meshStandardMaterial
            color="rgb(110, 210, 255)"
            emissive="rgb(110, 210, 255)"
            emissiveIntensity={1.2}
            roughness={0.4}
          />
        </mesh>

        <OrbitControls
          enablePan={false}
          autoRotate={!activeSection}
          autoRotateSpeed={0.4}
          minDistance={7}
          maxDistance={26}
          minPolarAngle={Math.PI / 3.5}
          maxPolarAngle={Math.PI / 2.1}
        />
      </Canvas>

      <Overlay
        activeSection={activeSection}
        onOpen={openSection}
        onClose={closeSection}
      />
    </>
  )
}
