// ============================================================
// SOURCE DE VÉRITÉ — CV Ethan Orekan (rien d'inventé ici)
// ============================================================

export const IDENTITY = {
  name: "ETHAN OREKAN",
  role: "Systèmes · Réseaux · Développement · Cloud",
  location: "Cotonou, Bénin",
  email: "ethanorekan3@gmail.com",
  phone: "+229 01 62 71 71 38",
  github: "https://github.com/ETHAN026",
  tagline:
    "Un profil informatique polyvalent, façonné par les environnements techniques et le perfectionnement continu.",
}

export const PROFILE =
  "Rigoureux et motivé, doté de solides connaissances en systèmes, réseaux, développement web et cloud computing. Un esprit analytique aiguisé, un sens de l'organisation développé et une grande capacité d'apprentissage."

// Les 4 dimensions du profil — aucun domaine n'est supérieur aux autres
export const DOMAINS = [
  {
    id: "dev",
    index: "01",
    title: "DÉVELOPPEMENT",
    caption: "Interfaces lumineuses, structures numériques, produit web.",
    stack: ["React", "TailwindCSS", "Node.js"],
    detail:
      "Conception et développement d'applications web complètes — du frontend au backend — avec un souci du détail et de la qualité d'expérience.",
  },
  {
    id: "systems",
    index: "02",
    title: "SYSTÈMES",
    caption: "Serveurs, infrastructure, administration.",
    stack: ["Windows Server", "Linux", "Active Directory", "GLPI"],
    detail:
      "Installation, configuration et maintenance de serveurs Windows et Linux. Gestion des utilisateurs, des services et des incidents.",
  },
  {
    id: "networks",
    index: "03",
    title: "RÉSEAUX",
    caption: "Topologies, flux, connexions sécurisées.",
    stack: ["MikroTik (RouterOS)", "VLAN", "NAT", "DHCP", "DNS", "Routage"],
    detail:
      "Conception d'architectures réseau : segmentations VLAN, filtrage, routage, authentification RADIUS et détection d'intrusion.",
  },
  {
    id: "cloud",
    index: "04",
    title: "CLOUD / DEVOPS",
    caption: "Architecture distribuée, pipelines, conteneurs.",
    stack: ["AWS (EC2 · S3 · IAM)", "Docker", "Kubernetes", "CI/CD", "Vercel · Railway · Render · Neon"],
    detail:
      "Conteneurisation, orchestration et déploiement continu. Gestion d'infrastructure cloud et des environnements applicatifs.",
  },
]

export const EXPERIENCES = [
  {
    period: "03 — 05 / 2026",
    title: "Stagiaire Réseaux",
    place: "JENYSA — FAI (registre .bj)",
  },
  {
    period: "07 — 09 / 2025",
    title: "Stagiaire Systèmes et Réseaux",
    place: "Novotel Cotonou",
  },
  {
    period: "07 — 09 / 2024",
    title: "Stagiaire Systèmes et Réseaux",
    place: "Novotel Cotonou",
  },
  {
    period: "06 / 2021 — 08 / 2022",
    title: "Stagiaire Maintenance IT",
    place: "Planet-Computer",
  },
]

export const FORMATIONS = [
  {
    period: "2025 — 2026",
    title: "Licence Systèmes, Réseaux et Cloud Computing",
    place: "ESGI Bénin",
  },
  {
    period: "2022 — 2023",
    title: "Diplôme Technique (DT-IMI)",
    place: "Lycée Technique Coulibaly",
  },
]

export const CERTIFICATIONS = [
  "Introduction à Linux",
  "Conception de réseaux TCP/IP",
  "Introduction à l'IA",
  "Apprendre à programmer en C",
]

export const PROJECTS = [
  {
    id: "webatelier",
    title: "Webatelier",
    kind: "SaaS · IA",
    context:
      "Plateforme SaaS de génération de sites web assistée par IA (AI APIs), avec système d'abonnement via Fedapay API et authentification OAuth Google et Apple.",
    stack: ["React", "Node.js", "AI APIs", "Fedapay", "OAuth"],
  },
  {
    id: "connote",
    title: "Connote",
    kind: "Plateforme multi-rôles",
    context:
      "Gestion des élèves, notes, moyennes, présences et notifications. Backend/API, base PostgreSQL, notifications e-mails via Brevo, déploiement sur Railway.",
    stack: ["React", "PostgreSQL", "Brevo", "Railway"],
  },
  {
    id: "ultrabarber",
    title: "UltraBarber",
    kind: "Full-stack · Cloud distribué",
    context:
      "Application full-stack de réservation. Architecture cloud distribuée : frontend sur Vercel (CI/CD automatisé), API sur Render, PostgreSQL managé via Neon.",
    stack: ["Node.js", "Express", "PostgreSQL", "Vercel", "Render", "Neon"],
  },
  {
    id: "infra-fai",
    title: "Infrastructure FAI",
    kind: "Réseaux · Sécurité",
    context:
      "Infrastructure FAI sécurisée sous MikroTik : firewall, authentification RADIUS, supervision. Active Directory et PfSense pour le filtrage, la DMZ, le Wi-Fi invité et la détection d'intrusion Suricata.",
    stack: ["MikroTik", "RADIUS", "PfSense", "Suricata", "Active Directory"],
  },
  {
    id: "wazuh-glpi",
    title: "Wazuh × GLPI",
    kind: "Supervision · SOC",
    context:
      "Surveillance de la sécurité, collecte des journaux et analyse des intrusions avec Wazuh. Gestion des incidents et suivi des interventions informatiques avec GLPI.",
    stack: ["Wazuh", "GLPI", "Nagios", "The Dude"],
  },
]

export const CHAPTERS = [
  { id: 0, label: "L'APPROCHE", range: [0.0, 0.14] },
  { id: 1, label: "LA CRÊTE", range: [0.14, 0.34] },
  { id: 2, label: "L'ARRIVÉE", range: [0.34, 0.52] },
  { id: 3, label: "LE SEUIL", range: [0.52, 0.64] },
  { id: 4, label: "LE SANCTUAIRE", range: [0.64, 1.0] },
]

// Fenêtres de progression des 4 espaces intérieurs (chapitre 5)
export const DOMAIN_WINDOWS = [
  { id: "dev", range: [0.62, 0.72] },
  { id: "systems", range: [0.71, 0.81] },
  { id: "networks", range: [0.8, 0.9] },
  { id: "cloud", range: [0.89, 1.0] },
]
