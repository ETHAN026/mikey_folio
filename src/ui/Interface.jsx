import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  IDENTITY,
  PROFILE,
  DOMAINS,
  PROJECTS,
  CHAPTERS,
  DOMAIN_WINDOWS,
  EXPERIENCES,
  FORMATIONS,
  CERTIFICATIONS,
} from "../data/cv"

// ------------------------------------------------------------
// Utilitaires de progression
// ------------------------------------------------------------

function chapterAt(p) {
  const c = CHAPTERS.find((ch) => p >= ch.range[0] && p < ch.range[1])
  return c ? c.id : CHAPTERS.length - 1
}

function domainAt(p) {
  const d = DOMAIN_WINDOWS.find((w) => p >= w.range[0] && p < w.range[1])
  return d ? d.id : null
}

// ------------------------------------------------------------
// Caption de chapitre (coin bas-gauche, style index technique)
// ------------------------------------------------------------

function ChapterCaption({ progress }) {
  const [pct, setPct] = useState(0)
  useEffect(() => {
    const i = setInterval(() => setPct(progress.current), 100)
    return () => clearInterval(i)
  }, [progress])
  const chapter = CHAPTERS[Math.min(chapterAt(pct), CHAPTERS.length - 1)]
  return (
    <div className="pointer-events-none fixed bottom-8 left-8 z-20 sm:left-12">
      <AnimatePresence mode="wait">
        <motion.div
          key={chapter.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="text-[10px] tracking-[0.35em] text-[#6b7480]">
            [{String(chapter.id + 1).padStart(2, "0")}] {chapter.label}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ------------------------------------------------------------
// Bandeau domaine (bas, pendant la traversée intérieure)
// ------------------------------------------------------------

function DomainStrip({ domain }) {
  return (
    <AnimatePresence mode="wait">
      {domain && (
        <motion.div
          key={domain.id}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none fixed bottom-8 left-1/2 z-20 w-[min(92vw,620px)] -translate-x-1/2"
        >
          <div className="border border-[#1a222c] bg-[#0a0d12]/85 px-5 py-4 backdrop-blur-sm">
            <div className="flex items-baseline justify-between">
              <span className="text-[10px] tracking-[0.4em] text-[#6b7480]">
                {domain.index} / {domain.title}
              </span>
              <span className="text-[10px] text-[#9aa3ad]">{domain.caption}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              {domain.stack.map((s) => (
                <span key={s} className="text-[11px] text-[#c9d2db]">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ------------------------------------------------------------
// Top bar : identité + liens techniques
// ------------------------------------------------------------

function TopBar() {
  return (
    <>
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.3 }}
        className="pointer-events-auto fixed left-0 right-0 top-0 z-30 flex items-center justify-between px-8 py-5 sm:px-12"
      >
        <div className="flex items-baseline gap-2 text-[11px] tracking-[0.3em]">
          <span className="text-[#e8edf2]">ETHAN_OREKAN</span>
          <span className="po-blink text-[#6b7480]">_</span>
        </div>
        <nav className="flex items-center gap-5 text-[10px] tracking-[0.25em]">
          <a href={IDENTITY.github} target="_blank" rel="noreferrer" className="po-link">
            GITHUB
          </a>
          <a href={`mailto:${IDENTITY.email}`} className="po-link">
            {IDENTITY.email.toUpperCase()}
          </a>
        </nav>
      </motion.header>

      <ScrollRail />
    </>
  )
}

function ScrollRail() {
  const [pct, setPct] = useState(0)
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setPct(max > 0 ? window.scrollY / max : 0)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener("scroll", onScroll)
  }, [])
  return (
    <div className="pointer-events-none fixed right-8 top-1/2 z-20 hidden -translate-y-1/2 sm:block">
      <div className="relative h-36 w-px bg-[#1a222c]">
        <div
          className="absolute left-0 top-0 w-px bg-[#9aa3ad] transition-[height] duration-150"
          style={{ height: `${pct * 100}%` }}
        />
      </div>
      <div className="mt-2 text-center text-[9px] text-[#6b7480]">
        {String(Math.round(pct * 100)).padStart(2, "0")}
      </div>
    </div>
  )
}

// ------------------------------------------------------------
// Hero : bloc titre mono, minimal
// ------------------------------------------------------------

function Hero() {
  const [faded, setFaded] = useState(false)
  useEffect(() => {
    const onScroll = () => setFaded(window.scrollY > window.innerHeight * 0.1)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])
  return (
    <motion.div
      animate={{ opacity: faded ? 0 : 1, y: faded ? -24 : 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="pointer-events-none fixed inset-0 z-10 flex flex-col items-center justify-center"
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.5 }}
        className="border border-[#1a222c] bg-[#0a0d12]/70 px-8 py-7 backdrop-blur-sm sm:px-12"
      >
        <p className="mb-3 text-[10px] tracking-[0.45em] text-[#6b7480]">
          {IDENTITY.role}
        </p>
        <h1 className="text-2xl font-medium tracking-[0.18em] text-[#e8edf2] sm:text-3xl">
          ETHAN OREKAN
        </h1>
        <p className="mt-3 max-w-md text-[11px] leading-relaxed text-[#9aa3ad]">
          {PROFILE}
        </p>
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.6 }}
        className="mt-8 text-[10px] tracking-[0.4em] text-[#6b7480]"
      >
        DÉFILEZ POUR ENTRER<span className="po-blink">_</span>
      </motion.p>
    </motion.div>
  )
}

// ------------------------------------------------------------
// Panneaux parcours / formations (chapitres intermédiaires)
// ------------------------------------------------------------

function ParcoursPanel({ chapterId }) {
  const visible = chapterId === 2 || chapterId === 3
  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none fixed left-8 top-1/2 z-20 hidden w-72 -translate-y-1/2 md:block"
        >
          <p className="mb-4 text-[9px] tracking-[0.45em] text-[#6b7480]">EXPÉRIENCES</p>
          <div className="space-y-4">
            {EXPERIENCES.map((e) => (
              <div key={`${e.period}-${e.place}`} className="border-l border-[#1a222c] pl-4">
                <p className="text-[9px] tracking-[0.25em] text-[#6b7480]">{e.period}</p>
                <p className="mt-0.5 text-[12px] text-[#e8edf2]">{e.title}</p>
                <p className="text-[10px] text-[#9aa3ad]">{e.place}</p>
              </div>
            ))}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}

function FormationPanel({ chapterId }) {
  const visible = chapterId === 3
  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 24 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none fixed right-20 top-1/2 z-20 hidden w-64 -translate-y-1/2 md:block"
        >
          <p className="mb-4 text-[9px] tracking-[0.45em] text-[#6b7480]">FORMATIONS</p>
          <div className="space-y-3">
            {FORMATIONS.map((f) => (
              <div key={f.title}>
                <p className="text-[9px] tracking-[0.25em] text-[#6b7480]">{f.period}</p>
                <p className="text-[12px] leading-snug text-[#e8edf2]">{f.title}</p>
                <p className="text-[10px] text-[#9aa3ad]">{f.place}</p>
              </div>
            ))}
          </div>
          <p className="mb-2 mt-6 text-[9px] tracking-[0.45em] text-[#6b7480]">
            CERTIFICATIONS
          </p>
          <div className="space-y-1">
            {CERTIFICATIONS.map((c) => (
              <p key={c} className="text-[10px] text-[#9aa3ad]">
                — {c}
              </p>
            ))}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}

// ------------------------------------------------------------
// Dossier projet : carte éditoriale (po-card)
// ------------------------------------------------------------

function ProjectDossier({ project, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="po-backdrop pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-[#0a0d12]/85 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="po-card relative mx-6 w-full max-w-xl border border-[#1a222c] bg-[#0c1016] p-8 sm:p-10"
          >
            <div className="po-card-title-row mb-5 flex items-baseline justify-between">
              <span className="text-[9px] tracking-[0.45em] text-[#6b7480]">
                {project.kind.toUpperCase()}
              </span>
              <button
                onClick={onClose}
                className="text-[10px] tracking-[0.2em] text-[#6b7480] transition-colors hover:text-[#e8edf2]"
              >
                ESC ✕
              </button>
            </div>
            <h2 className="text-xl font-medium tracking-[0.12em] text-[#e8edf2]">
              {project.title}
            </h2>
            <div className="mt-4 h-px w-14 bg-[#1a222c]" />
            <p className="mt-5 text-[12px] leading-relaxed text-[#c9d2db]">
              {project.context}
            </p>
            <div className="mt-7 flex flex-wrap gap-x-4 gap-y-1.5">
              {project.stack.map((s) => (
                <span key={s} className="text-[10px] tracking-[0.1em] text-[#9aa3ad]">
                  {s}
                </span>
              ))}
            </div>
            <div className="mt-8 flex items-center justify-between border-t border-[#1a222c] pt-4 text-[9px] tracking-[0.35em] text-[#6b7480]">
              <span>ETHAN OREKAN</span>
              <span>
                {String(PROJECTS.indexOf(project) + 1).padStart(2, "0")} /{" "}
                {String(PROJECTS.length).padStart(2, "0")}
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ------------------------------------------------------------
// Interface racine
// ------------------------------------------------------------

export default function Interface({ progress }) {
  const [project, setProject] = useState(null)
  const [domainId, setDomainId] = useState(null)
  const [chapterId, setChapterId] = useState(-1)

  useEffect(() => {
    const i = setInterval(() => {
      const p = progress.current
      const d = domainAt(p)
      setDomainId((prev) => (prev !== d ? d : prev))
      const c = chapterAt(p)
      setChapterId((prev) => (prev !== c ? c : prev))
    }, 100)
    return () => clearInterval(i)
  }, [progress])

  const domain = DOMAINS.find((d) => d.id === domainId)

  return (
    <>
      <TopBar />
      <Hero />
      <ChapterCaption progress={progress} />
      <DomainStrip domain={domain} />
      <ParcoursPanel chapterId={chapterId} />
      <FormationPanel chapterId={chapterId} />
      <ProjectDossier project={project} onClose={() => setProject(null)} />
      <SceneBridge onOpen={setProject} />
    </>
  )
}

// pont : la scène 3D déclenche l'ouverture des dossiers
let openDossierHandler = null
export function registerDossierOpener(fn) {
  openDossierHandler = fn
}
export function openDossier(project) {
  openDossierHandler?.(project)
}

function SceneBridge({ onOpen }) {
  useEffect(() => {
    registerDossierOpener(onOpen)
    return () => registerDossierOpener(null)
  }, [onOpen])
  return null
}
