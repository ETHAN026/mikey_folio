import { useMemo, useRef } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import { DOMAIN_WINDOWS } from "../data/cv"

// ============================================================
// TIMELINE CAMÉRA — le scroll contrôle la progression, pas la
// distance. Courbe de Catmull-Rom : vue lointaine -> approche ->
// seuil -> traversée -> centre de l'igloo.
// ============================================================

const KEYS = [
  { p: [0, 2.8, 27.0], t: [0, 1.3, 0] }, // 0.00 — plan large, monde immense
  { p: [7.0, 2.4, 16.0], t: [0, 1.1, 0] }, // 0.14 — dérive latérale
  { p: [3.0, 1.5, 8.0], t: [0, 0.95, 0] }, // 0.34 — rapprochement
  { p: [0.5, 0.9, 3.9], t: [0, 0.62, 1.6] }, // 0.52 — face à l'entrée
  { p: [0.0, 0.72, 2.3], t: [0, 0.6, 1.5] }, // 0.62 — le seuil
  { p: [0.0, 0.64, 1.15], t: [0, 0.6, -1.2] }, // 0.74 — traversée du tunnel
  { p: [0.0, 0.78, -1.5], t: [0, 0.85, -3.4] }, // 0.86 — révélation intérieure
  { p: [0.0, 1.05, -2.6], t: [0, 1.0, -3.8] }, // 1.00 — le sanctuaire
]

export function makeCameraCurves() {
  const posCurve = new THREE.CatmullRomCurve3(
    KEYS.map((k) => new THREE.Vector3(...k.p)),
    false,
    "catmullrom",
    0.6
  )
  const targetCurve = new THREE.CatmullRomCurve3(
    KEYS.map((k) => new THREE.Vector3(...k.t)),
    false,
    "catmullrom",
    0.6
  )
  return { posCurve, targetCurve }
}

export function CameraRig({ progress, mouse }) {
  const { camera } = useThree()
  const { posCurve, targetCurve } = useMemo(makeCameraCurves, [])
  const smooth = useRef(0)
  const lookAt = useRef(new THREE.Vector3(0, 1.3, 0))
  const offset = useRef(new THREE.Vector2(0, 0))
  const tmpPos = useMemo(() => new THREE.Vector3(), [])
  const tmpTarget = useMemo(() => new THREE.Vector3(), [])

  useFrame((_, delta) => {
    // inertie du scroll : la caméra suit avec un léger retard (easing)
    const k = Math.min(1, delta * 3.2)
    smooth.current += (progress.current - smooth.current) * k
    const p = THREE.MathUtils.clamp(smooth.current, 0, 1)

    posCurve.getPoint(p, tmpPos)
    targetCurve.getPoint(p, tmpTarget)

    // parallaxe souris : influence, jamais contrôle
    const mo = Math.min(1, delta * 2.2)
    offset.current.x += (mouse.current.x - offset.current.x) * mo
    offset.current.y += (mouse.current.y - offset.current.y) * mo

    // respiration permanente : dérive organique très lente
    const t = performance.now() * 0.0001
    const breatheX = Math.sin(t * 1.7) * 0.08
    const breatheY = Math.cos(t * 1.3) * 0.04

    const amp = 0.55 * (1 - p * 0.45) // amorti à l'intérieur
    tmpPos.x += offset.current.x * amp + breatheX
    tmpPos.y += offset.current.y * amp * 0.5 + breatheY
    tmpTarget.x += offset.current.x * 1.1
    tmpTarget.y += offset.current.y * 0.7

    camera.position.lerp(tmpPos, Math.min(1, delta * 5))
    lookAt.current.lerp(tmpTarget, Math.min(1, delta * 4))
    camera.lookAt(lookAt.current)

    // roulis léger, jamais nauséeux
    camera.rotation.z += offset.current.x * 0.012 * (1 - p)
  })

  return null
}

// ============================================================
// DRIVER — fenêtres d'activation des 4 espaces intérieurs
// ============================================================

export function DomainDriver({ progress, domainActives }) {
  useFrame(() => {
    const p = THREE.MathUtils.clamp(progress.current, 0, 1)
    DOMAIN_WINDOWS.forEach((w, i) => {
      const [a, b] = w.range
      const fade = 0.04
      let v = 0
      if (p > a && p < b) {
        v = Math.min((p - a) / fade, (b - p) / fade, 1)
        v = THREE.MathUtils.clamp(v, 0, 1)
      }
      const ref = domainActives.current[i]
      if (ref) ref.current = v
    })
  })
  return null
}
