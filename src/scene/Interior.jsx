import { useMemo, useRef, useState } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { createGlowTexture } from "./factory"
import { DOMAINS, PROJECTS } from "../data/cv"

// ============================================================
// Membrane de glace : translucide, fissures verticales, fresnel
// ============================================================

const ICE_WALL_VERT = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`

const ICE_WALL_FRAG = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec3 uTint;
  void main() {
    float fres = pow(1.0 - abs(dot(normalize(vNormal), normalize(vView))), 2.4);
    // fissures verticales lentes : lignes fines presque invisibles
    float fissure = smoothstep(0.4965, 0.5, abs(sin(vUv.x * 26.0 + sin(vUv.y * 3.0 + uTime * 0.05) * 0.6)));
    float pulse = 0.5 + 0.5 * sin(uTime * 0.14 + vUv.y * 5.0);
    vec3 base = uTint * (0.10 + 0.10 * pulse);
    vec3 col = base + fres * vec3(0.30, 0.44, 0.58) + fissure * vec3(0.05, 0.09, 0.13);
    gl_FragColor = vec4(col, 0.34 + fres * 0.5);
  }
`

function IceWallMaterial({ tint = "#20364e" }) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: ICE_WALL_VERT,
        fragmentShader: ICE_WALL_FRAG,
        uniforms: {
          uTime: { value: 0 },
          uTint: { value: new THREE.Color(tint) },
        },
        transparent: true,
        side: THREE.BackSide,
        depthWrite: false,
      }),
    [tint]
  )
  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime
  })
  return material
}

// ============================================================
// Monolithe de domaine : dalle de glace avec contenu abstrait
// ============================================================

const MONO_FRAG = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vView;
  uniform float uTime;
  uniform float uActive;
  uniform vec3 uAccent;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x),
               mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }
  void main() {
    float fres = pow(1.0 - abs(dot(normalize(vNormal), normalize(vView))), 2.0);
    // structures verticales : données / serveurs / flux selon le domaine
    float columns = smoothstep(0.42, 0.5, abs(sin(vUv.x * 14.0 + noise(vUv * 3.0) * 2.0)));
    float grid = smoothstep(0.47, 0.5, abs(fract(vUv.y * 18.0) - 0.5));
    float flow = 0.5 + 0.5 * sin(vUv.y * 22.0 - uTime * 1.1 + vUv.x * 9.0);
    float reveal = smoothstep(0.0, 1.0, uActive);
    float body = mix(0.10, 0.55, reveal);
    vec3 col = uAccent * (body * (0.35 + 0.65 * flow))
             + uAccent * columns * (0.18 + 0.4 * reveal)
             + vec3(0.6, 0.75, 0.9) * grid * 0.05
             + fres * vec3(0.35, 0.5, 0.65) * (0.6 + 0.4 * reveal);
    gl_FragColor = vec4(col, 0.5 + 0.45 * reveal);
  }
`

const MONO_VERT = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`

const ACCENTS = {
  dev: "#8fd0ff",
  systems: "#9db4d6",
  networks: "#7fe6cf",
  cloud: "#b9c6f2",
}

function DomainSpace({ domain, position, rotY, active01 }) {
  const ref = useRef()
  const glow = useMemo(() => createGlowTexture(), [])
  const accent = ACCENTS[domain.id] || "#8fd0ff"

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: MONO_VERT,
        fragmentShader: MONO_FRAG,
        uniforms: {
          uTime: { value: 0 },
          uActive: { value: 0 },
          uAccent: { value: new THREE.Color(accent) },
        },
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    [accent]
  )

  useFrame((state, delta) => {
    material.uniforms.uTime.value = state.clock.elapsedTime
    const target = active01?.current ?? 0
    const u = material.uniforms.uActive
    u.value += (target - u.value) * Math.min(1, delta * 3)
    if (ref.current) {
      ref.current.position.y = 1.15 + Math.sin(state.clock.elapsedTime * 0.7 + position[0]) * 0.03
    }
  })

  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {/* arche : seuil architectural */}
      <mesh position={[0, 0, -2.2]} rotation={[0, 0, 0]}>
        <torusGeometry args={[1.25, 0.05, 10, 42, Math.PI]} />
        <meshStandardMaterial
          color="#bcd8ee"
          emissive={accent}
          emissiveIntensity={0.25}
          roughness={0.3}
          metalness={0.4}
          transparent
          opacity={0.9}
        />
      </mesh>
      {/* montants de l'arche */}
      <mesh position={[-1.25, 0.62, -2.2]}>
        <cylinderGeometry args={[0.045, 0.045, 1.3, 8]} />
        <meshStandardMaterial color="#bcd8ee" roughness={0.35} metalness={0.4} transparent opacity={0.85} />
      </mesh>
      <mesh position={[1.25, 0.62, -2.2]}>
        <cylinderGeometry args={[0.045, 0.045, 1.3, 8]} />
        <meshStandardMaterial color="#bcd8ee" roughness={0.35} metalness={0.4} transparent opacity={0.85} />
      </mesh>

      {/* monolithe de glace : le contenu du domaine */}
      <mesh ref={ref} position={[0, 1.15, -2.2]} material={material}>
        <boxGeometry args={[1.7, 2.3, 0.1]} />
      </mesh>

      {/* lueur au sol devant le monolithe */}
      <sprite position={[0, 0.06, -1.7]} rotation={[0, 0, 0]} scale={[2.6, 0.9, 1]}>
        <spriteMaterial
          map={glow}
          color={accent}
          transparent
          opacity={0.14}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>

      {/* index romain flottant */}
      <sprite position={[0, 2.6, -2.0]} scale={[0.6, 0.6, 1]}>
        <spriteMaterial
          map={glow}
          color={accent}
          transparent
          opacity={0.3}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
    </group>
  )
}

// ============================================================
// Vitrines projets : éclats de glace flottants
// ============================================================

function ProjectShard({ project, position, onOpen }) {
  const ref = useRef()
  const glow = useMemo(() => createGlowTexture(), [])
  const [hovered, setHovered] = useState(false)
  const active = useRef(0)

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    active.current += ((hovered ? 1 : 0) - active.current) * Math.min(1, delta * 4)
    if (ref.current) {
      ref.current.rotation.y = t * 0.22 + position[0]
      ref.current.rotation.x = Math.sin(t * 0.4 + position[1]) * 0.14
      ref.current.position.y = position[1] + Math.sin(t * 0.8 + position[0] * 2.0) * 0.06
      const s = 1 + active.current * 0.12
      ref.current.scale.setScalar(s)
    }
  })

  return (
    <group position={[position[0], 0, position[2]]}>
      <mesh
        ref={ref}
        position={[0, position[1], 0]}
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
          onOpen?.(project)
        }}
      >
        <icosahedronGeometry args={[0.34, 0]} />
        <meshStandardMaterial
          color="#cfe6f8"
          emissive="#9fd4ff"
          emissiveIntensity={0.5 + active.current * 0.9}
          transparent
          opacity={0.8}
          roughness={0.15}
          metalness={0.5}
          flatShading
        />
      </mesh>
      <sprite position={[0, position[1], 0]} scale={[1.4, 1.4, 1]}>
        <spriteMaterial
          map={glow}
          color="#9fd4ff"
          transparent
          opacity={0.12 + active.current * 0.25}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
    </group>
  )
}

// ============================================================
// Intérieur complet : architecture de glace
// ============================================================

export function IceInterior({ domainActives, onProjectOpen }) {
  const glow = useMemo(() => createGlowTexture(), [])

  // actives[i] : ref pilotée par le DomainDriver (fenêtres de scroll)
  const actives = domainActives

  const spaces = [
    { pos: [-5.2, 0, -2.0], rotY: 0.55 },
    { pos: [5.2, 0, -2.0], rotY: -0.55 },
    { pos: [-3.6, 0, -6.4], rotY: 0.25 },
    { pos: [3.6, 0, -6.4], rotY: -0.25 },
  ]

  const shardPositions = useMemo(
    () =>
      PROJECTS.map((_, i) => {
        const a = (i / PROJECTS.length) * Math.PI * 1.1 + 0.5
        const r = 6.2
        return [Math.cos(a) * r, 0.9 + (i % 3) * 0.55, Math.sin(a) * r * 0.55 - 2.5]
      }),
    []
  )

  return (
    <group>
      {/* parois intérieures : dôme translucide vu de l'intérieur */}
      <mesh position={[0, 2.2, -3]}>
        <sphereGeometry args={[9.5, 48, 32, 0, Math.PI * 2, 0, Math.PI * 0.56]} />
        <IceWallMaterial tint="#1c3250" />
      </mesh>

      {/* sol de glace intérieur */}
      <mesh position={[0, 0, -3]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[9, 48]} />
        <meshStandardMaterial
          color="#d7e7f5"
          roughness={0.25}
          metalness={0.1}
          transparent
          opacity={0.94}
        />
      </mesh>

      {/* reflets subtils : disque sombre au centre (ouverture) */}
      <mesh position={[0, 0.012, -3]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.7, 40]} />
        <meshBasicMaterial color="#0a1524" transparent opacity={0.55} />
      </mesh>

      {/* brasero central : cœur lumineux de l'igloo */}
      <group position={[0, 0, -3]}>
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.5, 0.62, 0.5, 24]} />
          <meshStandardMaterial color="#9db8d2" roughness={0.6} transparent opacity={0.9} />
        </mesh>
        <pointLight
          position={[0, 0.9, 0]}
          color="#ffd9a8"
          intensity={5.5}
          distance={13}
          decay={2}
        />
        <sprite position={[0, 0.95, 0]} scale={[1.5, 2.0, 1]}>
          <spriteMaterial
            map={glow}
            color="#ffd2a0"
            transparent
            opacity={0.22}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </sprite>
      </group>

      {/* les 4 espaces-domaines */}
      {DOMAINS.map((d, i) => (
        <DomainSpace
          key={d.id}
          domain={d}
          position={spaces[i].pos}
          rotY={spaces[i].rotY}
          active01={actives[i]}
        />
      ))}

      {/* vitrines projets */}
      {PROJECTS.map((p, i) => (
        <ProjectShard
          key={p.id}
          project={p}
          position={shardPositions[i]}
          onOpen={onProjectOpen}
        />
      ))}
    </group>
  )
}
