import { useEffect, useRef, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing"
import { Terrain, Ridges, Sky, Moon, SnowLayers, GroundMist } from "./scene/Environment"
import { Igloo } from "./scene/Igloo"
import { IceInterior } from "./scene/Interior"
import { CameraRig, DomainDriver } from "./scene/CameraRig"
import Interface, { openDossier } from "./ui/Interface"
import { IDENTITY } from "./data/cv"

// ============================================================
// Lumières de la scène extérieure
// ============================================================

function ExteriorLights() {
  const moon = useRef()
  useFrame((state) => {
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
// Le monde : extérieur + intérieur, pilotés par le scroll
// ============================================================

function World({ progress, mouse }) {
  const domainActives = useRef([{ current: 0 }, { current: 0 }, { current: 0 }, { current: 0 }])
  const iglooHover = useRef(0)
  const exterior = useRef()
  const interior = useRef()

  useFrame(() => {
    const p = THREE.MathUtils.clamp(progress.current, 0, 1)
    const fadeOut = 1 - THREE.MathUtils.smoothstep(p, 0.6, 0.78)
    const fadeIn = THREE.MathUtils.smoothstep(p, 0.68, 0.85)
    if (exterior.current) exterior.current.visible = fadeOut > 0.01
    if (interior.current) interior.current.visible = fadeIn > 0.01
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
        <Igloo
          hoverProgress={iglooHover}
          onEnterRequest={() => {
            progress.current = Math.max(progress.current, 0.5)
            window.scrollTo({ top: document.documentElement.scrollHeight * 0.5, behavior: "smooth" })
          }}
        />
      </group>

      <group ref={interior}>
        <IceInterior
          domainActives={domainActives}
          onProjectOpen={(project) => openDossier(project)}
        />
      </group>

      <ExteriorLights />
      <pointLight position={[0, 3.4, -3]} intensity={1.4} color="#b7d4f0" distance={18} decay={2} />

      <CameraRig progress={progress} mouse={mouse} />
      <DomainDriver progress={progress} domainActives={domainActives} />
    </>
  )
}

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
  const [webglOk, setWebglOk] = useState(true)

  useEffect(() => {
    try {
      const c = document.createElement("canvas")
      setWebglOk(!!(c.getContext("webgl2") || c.getContext("webgl")))
    } catch {
      setWebglOk(false)
    }
    const t = setTimeout(() => setReady(true), 300)
    return () => clearTimeout(t)
  }, [])

  if (!webglOk) {
    return (
      <div className="webgl-unsupported flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-[11px] tracking-[0.3em] text-[#9aa3ad]">
          WEBGL INDISPONIBLE SUR CE NAVIGATEUR
        </p>
        <a href={`mailto:${IDENTITY.email}`} className="po-link text-[11px] tracking-[0.25em]">
          {IDENTITY.email.toUpperCase()}
        </a>
      </div>
    )
  }

  return (
    <div className="bg-[#0a0d12]">
      <div className="fixed inset-0 z-0">
        <Canvas
          gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
          camera={{ position: [0, 2.8, 27], fov: 46, near: 0.1, far: 900 }}
          dpr={[1, 2]}
        >
          <fog attach="fog" args={["#0a0d12", 26, 240]} />
          <color attach="background" args={["#0a0d12"]} />

          <World progress={progress} mouse={mouse} />

          <EffectComposer multisampling={0}>
            <Bloom
              intensity={0.55}
              luminanceThreshold={0.38}
              luminanceSmoothing={0.25}
              mipmapBlur
            />
            <Vignette offset={0.16} darkness={0.65} />
          </EffectComposer>
        </Canvas>
      </div>

      {/* voile de chargement */}
      <div
        className={`pointer-events-none fixed inset-0 z-40 bg-[#0a0d12] transition-opacity duration-[1200ms] ${
          ready ? "opacity-0" : "opacity-100"
        }`}
      />

      {/* spacer de scroll : 500vh */}
      <div style={{ height: "500vh" }} />

      <Interface progress={progress} />

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
      className={`fixed bottom-0 left-0 right-0 z-30 border-t border-[#1a222c] bg-[#0a0d12]/90 px-8 py-4 backdrop-blur-sm transition-all duration-500 sm:px-12 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      }`}
    >
      <div className="flex flex-col items-start justify-between gap-2 text-[10px] tracking-[0.2em] sm:flex-row sm:items-center">
        <span className="text-[#6b7480]">
          {IDENTITY.location.toUpperCase()} — {IDENTITY.phone}
        </span>
        <a href={`mailto:${IDENTITY.email}`} className="po-link text-[#c9d2db]">
          {IDENTITY.email.toUpperCase()}
        </a>
      </div>
    </div>
  )
}
