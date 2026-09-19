import { useEffect, useRef, useState } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing"
import { Terrain, Ridges, Sky, Moon, SnowLayers, GroundMist } from "./scene/Environment"
import { Igloo } from "./scene/Igloo"
import { IceInterior } from "./scene/Interior"
import { CameraRig, DomainDriver } from "./scene/CameraRig"
import Interface, { openDossier } from "./ui/Interface"
import { IDENTITY } from "./data/cv"

// ============================================================
// Lumières cinématiques de la scène extérieure
// ============================================================

function ExteriorLights() {
  const moon = useRef()
  useFrame((state) => {
    // lueur lunaire vacillante très subtile
    if (moon.current) {
      moon.current.intensity = 1.55 + Math.sin(state.clock.elapsedTime * 0.35) * 0.08
    }
  })
  return (
    <>
      <ambientLight intensity={0.22} color="#a8c4e2" />
      <hemisphereLight args={["#8fb5dd", "#1b2a3d", 0.5]} />
      <directionalLight
        ref={moon}
        position={[-60, 45, -80]}
        intensity={1.55}
        color="#cfe2ff"
      />
    </>
  )
}

// ============================================================
// Le monde : extérieur + intérieur, cross-fadés par le scroll
// ============================================================

function World({ progress, mouse }) {
  const { scene } = useThree()
  const domainActives = useRef([{ current: 0 }, { current: 0 }, { current: 0 }, { current: 0 }])
  const iglooHover = useRef(0)
  const exterior = useRef()
  const interior = useRef()

  useFrame(() => {
    const p = THREE.MathUtils.clamp(progress.current, 0, 1)
    // fondu croisé : extérieur disparaît pendant la traversée (0.62 -> 0.78)
    const fadeOut = 1 - THREE.MathUtils.smoothstep(p, 0.6, 0.78)
    const fadeIn = THREE.MathUtils.smoothstep(p, 0.68, 0.85)
    if (exterior.current) exterior.current.visible = fadeOut > 0.01
    if (interior.current) interior.current.visible = fadeIn > 0.01
    scene.traverse((o) => {
      if (o.userData?.exterior && o.material) {
        o.material.opacity = undefined // placeholder: matériaux gérés par layer
      }
    })
  })

  return (
    <>
      <group ref={exterior}>
        <Sky />
        <Terrain />
        <Ridges />
        <Moon />
        <GroundMist />
        <SnowLayers progress={progress} />
        <group position={[0, 0, 0]}>
          <Igloo hoverProgress={iglooHover} onEnterRequest={() => {
            // boost cinématique : saut d'inertie vers le seuil
            progress.current = Math.max(progress.current, 0.5)
            window.scrollTo({ top: document.documentElement.scrollHeight * 0.5, behavior: "smooth" })
          }} />
        </group>
      </group>

      <group ref={interior}>
        <IceInterior
          domainActives={domainActives}
          onProjectOpen={(project) => openDossier(project)}
        />
      </group>

      <ExteriorLights />

      {/* lumière froide globale intérieure */}
      <pointLight position={[0, 3.4, -3]} intensity={1.4} color="#b7d4f0" distance={18} decay={2} />

      <CameraRig progress={progress} mouse={mouse} />
      <DomainDriver progress={progress} domainActives={domainActives} />
    </>
  )
}

// ============================================================
// Scroll : timeline compacte — 500vh au total, transformations
// majeures par palier court
// ============================================================

function useScrollProgress() {
  const progress = useRef(0)
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      progress.current = max > 0 ? window.scrollY / max : 0
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener("scroll", onScroll)
  }, [])
  return progress
}

function useMouseInfluence() {
  const mouse = useRef({ x: 0, y: 0 })
  useEffect(() => {
    const onMove = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.current.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener("mousemove", onMove, { passive: true })
    return () => window.removeEventListener("mousemove", onMove)
  }, [])
  return mouse
}

// ============================================================
// App
// ============================================================

export default function App() {
  const progress = useScrollProgress()
  const mouse = useMouseInfluence()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 300)
    return () => clearTimeout(t)
  }, [])

  // hauteur de scroll : 500vh via un spacer
  return (
    <div className="bg-[#040a13]">
      <div className="fixed inset-0 z-0">
        <Canvas
          gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
          camera={{ position: [0, 2.8, 27], fov: 46, near: 0.1, far: 900 }}
          dpr={[1, 2]}
        >
          <fog attach="fog" args={["#0a1524", 26, 240]} />
          <color attach="background" args={["#04080f"]} />

          <World progress={progress} mouse={mouse} />

          <EffectComposer multisampling={0}>
            <Bloom
              intensity={0.75}
              luminanceThreshold={0.32}
              luminanceSmoothing={0.2}
              mipmapBlur
            />
            <Vignette offset={0.18} darkness={0.62} />
          </EffectComposer>
        </Canvas>
      </div>

      {/* voile de chargement */}
      <div
        className={`pointer-events-none fixed inset-0 z-40 bg-[#040a13] transition-opacity duration-[1400ms] ${
          ready ? "opacity-0" : "opacity-100"
        }`}
      />

      {/* spacer de scroll : 500vh */}
      <div style={{ height: "500vh" }} />

      {/* interface éditoriale */}
      <Interface progress={progress} onProjectOpen={(p) => openDossier(p)} />

      {/* pied de page contact, visible à la fin */}
      <EndCard />
    </div>
  )
}

function EndCard() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setVisible(max > 0 && window.scrollY / max > 0.93)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])
  return (
    <div
      className={`pointer-events-none fixed bottom-0 left-0 right-0 z-30 px-8 pb-8 transition-all duration-700 sm:px-12 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
    >
      <div className="flex flex-col items-start justify-between gap-4 border-t border-sky-100/12 pt-5 sm:flex-row sm:items-center">
        <div className="text-[10px] leading-relaxed tracking-[0.25em] text-sky-100/50">
          {IDENTITY.location} — {IDENTITY.phone}
          <br />
          {IDENTITY.email.toUpperCase()}
        </div>
        <a
          href={`mailto:${IDENTITY.email}`}
          className="pointer-events-auto border border-sky-100/25 px-6 py-2.5 text-[10px] tracking-[0.35em] text-sky-50 transition-colors hover:bg-sky-50 hover:text-[#040a13]"
        >
          ME CONTACTER
        </a>
      </div>
    </div>
  )
}
