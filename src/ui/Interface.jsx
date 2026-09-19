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

const SERIF = "'Cormorant Garamond', Georgia, 'Times New Roman', serif"

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
// Typo de chapitre (coin bas-gauche)
// ------------------------------------------------------------

function ChapterCaption({ progress }) {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const i = setInterval(() => setTick((t) => t + 1), 120)
    return () => clearInterval(i)
  }, [])
  void tick
  const chapter = CHAPTERS[Math.min(chapterAt(progress.current), CHAPTERS.length - 1)]
  return (
    <div className="pointer-events-none fixed bottom-10 left-10 z-20">
      <AnimatePresence mode="wait">
        <motion.div
          key={chapter.id}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className="mb-2 text-[10px] tracking-[0.45em] text-sky-100/50"
          >
            CHAPITRE {String(chapter.id + 1).padStart(2, "0")} — {chapter.label}
          </div>
          <div
            className="h-px w-16 bg-gradient-to-r from-sky-200/40 to-transparent"
            style={{ backgroundColor: "transparent" }}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ------------------------------------------------------------
// Carte domaine (bas-droite, pendant la traversée intérieure)
// ------------------------------------------------------------

function DomainCard({ domain }) {
  return (
    <AnimatePresence mode="wait">
      {domain && (
        <motion.div
          key={domain.id}
          initial={{ opacity: 0, y: 30, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -20, filter: "blur(6px)" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none fixed bottom-10 right-10 z-20 max-w-sm"
        >
          <div className="mb-3 flex items-baseline gap-4">
            <span
              className="text-4xl font-light text-sky-100/25"
              style={{ fontFamily: SERIF }}
            >
              {domain.index}
            </span>
            <h3 className="text-xl font-light tracking-[0.28em] text-sky-50">
              {domain.title}
            </h3>
          </div>
          <p className="mb-3 text-xs leading-relaxed text-sky-100/60">
            {domain.caption}
          </p>
          <div className="flex flex-wrap gap-2">
            {domain.stack.map((s) => (
              <span
                key={s}
                className="border border-sky-100/15 bg-sky-950/30 px-2.5 py-1 text-[10px] tracking-wider text-sky-100/70 backdrop-blur-sm"
              >
                {s}
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ------------------------------------------------------------
// Parcours : expériences professionnelles (chapitres 3-4)
// ------------------------------------------------------------

function ParcoursPanel({ chapterId }) {
  const visible = chapterId === 2 || chapterId === 3
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none fixed left-10 top-1/2 z-20 hidden w-72 -translate-y-1/2 md:block"
        >
          <p className="mb-4 text-[9px] tracking-[0.5em] text-sky-100/40">
            EXPÉRIENCES
          </p>
          <div className="space-y-4">
            {EXPERIENCES.map((e) => (
              <div key={`${e.period}-${e.place}`} className="border-l border-sky-100/15 pl-4">
                <p className="text-[9px] tracking-[0.3em] text-sky-200/45">
                  {e.period}
                </p>
                <p
                  className="mt-0.5 text-base font-light text-sky-50/90"
                  style={{ fontFamily: SERIF }}
                >
                  {e.title}
                </p>
                <p className="text-[10px] tracking-[0.15em] text-sky-100/50">
                  {e.place}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ------------------------------------------------------------
// Formations + certifications (chapitre 4 — le seuil)
// ------------------------------------------------------------

function FormationPanel({ chapterId }) {
  const visible = chapterId === 3
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 30 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none fixed right-24 top-1/2 z-20 hidden w-64 -translate-y-1/2 md:block"
        >
          <p className="mb-4 text-[9px] tracking-[0.5em] text-sky-100/40">
            FORMATIONS
          </p>
          <div className="space-y-3">
            {FORMATIONS.map((f) => (
              <div key={f.title}>
                <p className="text-[9px] tracking-[0.3em] text-sky-200/45">{f.period}</p>
                <p
                  className="text-sm font-light leading-snug text-sky-50/90"
                  style={{ fontFamily: SERIF }}
                >
                  {f.title}
                </p>
                <p className="text-[10px] tracking-[0.15em] text-sky-100/50">{f.place}</p>
              </div>
            ))}
          </div>
          <p className="mb-3 mt-7 text-[9px] tracking-[0.5em] text-sky-100/40">
            CERTIFICATIONS
          </p>
          <div className="space-y-1.5">
            {CERTIFICATIONS.map((c) => (
              <p key={c} className="text-[10px] leading-relaxed text-sky-100/60">
                — {c}
              </p>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ------------------------------------------------------------
// Header contact + rail de progression
// ------------------------------------------------------------

function TopBar() {
  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.4 }}
        className="pointer-events-auto fixed left-0 right-0 top-0 z-30 flex items-center justify-between px-8 py-6 sm:px-12"
      >
        <div className="flex items-baseline gap-3">
          <span
            className="text-lg tracking-[0.35em] text-sky-50"
            style={{ fontFamily: SERIF }}
          >
            E.
          </span>
          <span className="text-[9px] tracking-[0.4em] text-sky-100/45">
            OREKAN
          </span>
        </div>
        <div className="flex items-center gap-6">
          <a
            href={IDENTITY.github}
            target="_blank"
            rel="noreferrer"
            className="text-[10px] tracking-[0.3em] text-sky-100/55 transition-colors hover:text-sky-50"
          >
            GITHUB
          </a>
          <a
            href={`mailto:${IDENTITY.email}`}
            className="border border-sky-100/20 px-4 py-2 text-[10px] tracking-[0.3em] text-sky-100/80 transition-all hover:border-sky-100/50 hover:text-white"
          >
            CONTACT
          </a>
        </div>
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
      <div className="relative h-40 w-px bg-sky-100/15">
        <motion.div
          className="absolute left-0 top-0 w-px bg-sky-100/70"
          style={{ height: `${pct * 100}%` }}
        />
        <div
          className="absolute -left-[3px] h-[7px] w-[7px] rounded-full bg-sky-50 shadow-[0_0_12px_rgba(160,210,255,0.9)]"
          style={{ top: `calc(${pct * 100}% - 3px)` }}
        />
      </div>
      <div className="mt-3 text-center text-[9px] tracking-[0.3em] text-sky-100/40">
        {String(Math.round(pct * 100)).padStart(2, "0")}
      </div>
    </div>
  )
}

// ------------------------------------------------------------
// Hero
// ------------------------------------------------------------

function Hero() {
  const [faded, setFaded] = useState(false)
  useEffect(() => {
    const onScroll = () => setFaded(window.scrollY > window.innerHeight * 0.14)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])
  return (
    <motion.div
      animate={{ opacity: faded ? 0 : 1, y: faded ? -30 : 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="pointer-events-none fixed inset-0 z-10 flex flex-col items-center justify-center"
    >
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.6, delay: 0.8 }}
        className="mb-6 text-[10px] tracking-[0.55em] text-sky-100/55"
      >
        {IDENTITY.role}
      </motion.p>
      <h1
        className="text-center text-5xl font-extralight leading-[1.05] tracking-[0.12em] text-sky-50 sm:text-7xl"
        style={{ fontFamily: SERIF }}
      >
        ETHAN
        <span className="mx-3 inline-block h-8 w-px self-center bg-sky-100/30 align-middle sm:h-10" />
        OREKAN
      </h1>
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.4, delay: 1.4, ease: [0.22, 1, 0.36, 1] }}
        className="mt-8 h-px w-40 bg-gradient-to-r from-transparent via-sky-100/50 to-transparent"
      />
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 1.8 }}
        className="mt-8 text-[10px] tracking-[0.4em] text-sky-100/40"
      >
        DÉFILEZ POUR ENTRER
      </motion.p>
    </motion.div>
  )
}

// ------------------------------------------------------------
// Dossier projet (interface éditoriale plein écran)
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
          transition={{ duration: 0.4 }}
          className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-[#050b14]/80 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.98 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative mx-6 max-w-2xl border border-sky-100/12 bg-gradient-to-b from-[#0b1626]/95 to-[#070e1a]/95 p-10 sm:p-14"
          >
            <div className="absolute left-0 top-0 h-full w-px bg-gradient-to-b from-sky-300/40 via-sky-300/10 to-transparent" />
            <button
              onClick={onClose}
              aria-label="Fermer"
              className="absolute right-6 top-6 text-sm tracking-[0.2em] text-sky-100/50 transition-colors hover:text-white"
            >
              ESC ✕
            </button>

            <p className="mb-3 text-[10px] tracking-[0.5em] text-sky-200/50">
              {project.kind.toUpperCase()}
            </p>
            <h2
              className="text-4xl font-light tracking-wide text-white"
              style={{ fontFamily: SERIF }}
            >
              {project.title}
            </h2>
            <div className="mt-6 h-px w-24 bg-sky-200/30" />
            <p className="mt-6 text-sm leading-loose text-sky-100/75">
              {project.context}
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              {project.stack.map((s) => (
                <span
                  key={s}
                  className="border border-sky-100/15 px-3 py-1.5 text-[10px] tracking-[0.15em] text-sky-100/65"
                >
                  {s}
                </span>
              ))}
            </div>
            <div className="mt-10 flex items-center justify-between border-t border-sky-100/10 pt-5">
              <span className="text-[9px] tracking-[0.4em] text-sky-100/35">
                ETHAN OREKAN — PROJET
              </span>
              <span className="text-[9px] tracking-[0.4em] text-sky-100/35">
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
  const showProfile = chapterId >= 4

  return (
    <>
      <TopBar />
      <Hero />
      <ChapterCaption progress={progress} />
      <DomainCard domain={domain} />
      <ParcoursPanel chapterId={chapterId} />
      <FormationPanel chapterId={chapterId} />

      {/* citation de profil pendant le sanctuaire */}
      <AnimatePresence>
        {showProfile && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none fixed left-1/2 top-24 z-20 w-[min(92vw,640px)] -translate-x-1/2 text-center"
          >
            <p
              className="text-lg font-light italic leading-relaxed text-sky-50/85 sm:text-xl"
              style={{ fontFamily: SERIF }}
            >
              « {PROFILE} »
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <ProjectDossier project={project} onClose={() => setProject(null)} />

      {/* pont : la scène passe l'ouverture de dossier */}
      <SceneBridge onOpen={setProject} />
    </>
  )
}

// petit composant interne pour recevoir les événements d'ouverture
// déclenchés depuis la 3D sans prop-drilling
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
