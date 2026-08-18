/**
 * Catálogo del ecosistema. Vive en un único módulo para que la portada se construya desde datos
 * y no desde marcado copiado veinte veces: añadir un agente es añadir una línea aquí.
 *
 * `VERSION` la reescribe `scripts/site-prep.mjs` a partir de package.json.
 */

export const VERSION = '0.7.0';
export const REPO = 'jechamo/Estructura_inicial_claude';
export const URL_REPO = `https://github.com/${REPO}`;

/** Referencia que se usa en los comandos: la etiqueta fija es lo que hace la instalación repetible. */
export const REF_FIJA = `v${VERSION}`;

export const FAMILIAS_AGENTES = [
  {
    id: 'circuito',
    nombre: 'Circuito',
    resumen: 'Conducen el flujo de una fase a la siguiente y son los únicos que delegan.',
    agentes: [
      { id: 'orchestrator', nombre: 'orchestrator', papel: 'Puerta de entrada. Clasifica la petición y decide la fase; solo lectura.' },
      { id: 'spec-analyst', nombre: 'spec-analyst', papel: 'Convierte producto aprobado en requisitos EARS con criterios testables.' },
      { id: 'planner', nombre: 'planner', papel: 'Traduce la spec en plan técnico, modelo de datos, contratos y tareas atómicas.' },
      { id: 'implementer', nombre: 'implementer', papel: 'Ejecuta las tareas en ciclo rojo-verde-refactor mostrando la salida real.' },
      { id: 'release-manager', nombre: 'release-manager', papel: 'Prepara PR, CHANGELOG y trazabilidad. Nunca empuja sin permiso.' },
    ],
  },
  {
    id: 'arquitectura',
    nombre: 'Arquitectura y diseño',
    resumen: 'Deciden fronteras antes de que exista una sola línea de implementación.',
    agentes: [
      { id: 'architect', nombre: 'architect', papel: 'Elige arquitectura y stack, escribe la constitución y los ADR.' },
      { id: 'api-designer', nombre: 'api-designer', papel: 'Contract-first: OpenAPI, GraphQL o esquemas de evento antes del endpoint.' },
      { id: 'ux-designer', nombre: 'ux-designer', papel: 'Flujos, estados y accesibilidad a partir de la spec aprobada.' },
    ],
  },
  {
    id: 'construccion',
    nombre: 'Construcción',
    resumen: 'Especialistas de terreno. Hacen el trabajo y devuelven el control.',
    agentes: [
      { id: 'backend-expert', nombre: 'backend-expert', papel: 'Dominio, casos de uso, integraciones, colas, transacciones y resiliencia.' },
      { id: 'frontend-expert', nombre: 'frontend-expert', papel: 'Componentes, estado, formularios, rendimiento y accesibilidad de UI.' },
      { id: 'database-expert', nombre: 'database-expert', papel: 'Modelado, migraciones, índices, integridad y políticas de acceso.' },
      { id: 'devops-expert', nombre: 'devops-expert', papel: 'CI/CD, entornos, infraestructura como código y observabilidad.' },
    ],
  },
  {
    id: 'calidad',
    nombre: 'Calidad',
    resumen: 'Ponen el listón donde debe estar y no dejan pasar lo que no lo alcanza.',
    agentes: [
      { id: 'code-reviewer', nombre: 'code-reviewer', papel: 'Revisa el diff: corrección, trazabilidad, SOLID, tests y legibilidad.' },
      { id: 'test-engineer', nombre: 'test-engineer', papel: 'Estrategia de test, casos difíciles, fixtures y auditoría de la suite.' },
      { id: 'refactor-specialist', nombre: 'refactor-specialist', papel: 'Audita principios y patrones en la fase de refactor del ciclo TDD.' },
      { id: 'performance-optimizer', nombre: 'performance-optimizer', papel: 'Latencia, consultas lentas, memoria y tamaño de bundle. Siempre con medición.' },
    ],
  },
  {
    id: 'auditoria',
    nombre: 'Auditoría y memoria',
    resumen: 'Miran sin tocar y guardan el porqué de cada decisión.',
    agentes: [
      { id: 'security-auditor', nombre: 'security-auditor', papel: 'OWASP Top 10:2025, ASVS 5.0.0 y OWASP Agentic. Solo lectura.' },
      { id: 'research-analyst', nombre: 'research-analyst', papel: 'Entiende repos ajenos, localiza funcionalidad y evalúa alternativas.' },
      { id: 'docs-writer', nombre: 'docs-writer', papel: 'README, guías, documentación de API y onboarding coherente.' },
      { id: 'bitacora-keeper', nombre: 'bitacora-keeper', papel: 'Registra decisiones, alternativas descartadas, deuda e incidentes.' },
    ],
  },
];

export const AGENTES = FAMILIAS_AGENTES.flatMap((f) => f.agentes.map((a) => ({ ...a, familia: f.id })));

export const GRUPOS_SKILLS = [
  {
    id: 'circuito',
    nombre: 'Circuito SDD',
    skills: [
      { id: 'sdd-start', papel: 'Clasifica la petición y te lleva a la fase correcta.' },
      { id: 'sdd-intake', papel: 'Normaliza el baseline de producto desde un PRD, una ruta o un diseño.' },
      { id: 'sdd-init', papel: 'Arranca un proyecto nuevo: arquitectura, constitución y ADR-0001.' },
      { id: 'sdd-specify', papel: 'Convierte la idea en requisitos EARS. Sin decisiones técnicas.' },
      { id: 'sdd-clarify', papel: 'Resuelve las ambigüedades marcadas antes de planificar.' },
      { id: 'sdd-design', papel: 'Pantallas, estados, componentes y accesibilidad. Solo si hay interfaz.' },
      { id: 'sdd-plan', papel: 'Plan técnico, modelo de datos, contratos e investigación.' },
      { id: 'sdd-tasks', papel: 'Trocea el plan en tareas atómicas con su test asociado.' },
      { id: 'sdd-implement', papel: 'Ejecuta las tareas en ciclo TDD estricto, una a una.' },
      { id: 'sdd-verify', papel: 'Pasa todos los gates: tests, cobertura, lint, revisión y seguridad.' },
      { id: 'sdd-ship', papel: 'PR con trazabilidad, CHANGELOG, bitácora y plan de reversión.' },
      { id: 'sdd-status', papel: 'En qué punto está el proyecto y cuál es el siguiente paso.' },
      { id: 'sdd-refresh', papel: 'Revalida el baseline del ecosistema contra fuentes oficiales.' },
    ],
  },
  {
    id: 'terreno',
    nombre: 'Terreno',
    skills: [
      { id: 'middle', papel: 'Dominio, casos de uso, servicios e integraciones con SOLID y TDD.' },
      { id: 'front', papel: 'Interfaz: componentes, estado, routing, accesibilidad y rendimiento.' },
      { id: 'bbdd', papel: 'Esquema, migraciones, índices, integridad y despliegue reversible.' },
    ],
  },
  {
    id: 'riesgo',
    nombre: 'Calidad y riesgo',
    skills: [
      { id: 'tdd', papel: 'Un ciclo rojo-verde-refactor sobre un comportamiento concreto.' },
      { id: 'security-scan', papel: 'Auditoría OWASP Top 10:2025 y ASVS 5.0.0 antes de release.' },
      { id: 'observability', papel: 'Errores, salud de versión, eventos de negocio, umbrales y playbooks.' },
      { id: 'respond-incident', papel: 'Contener, recuperar, comunicar y aprender cuando algo falla ahora.' },
    ],
  },
  {
    id: 'memoria',
    nombre: 'Memoria y documentación',
    skills: [
      { id: 'adr', papel: 'Architecture Decision Record en formato MADR.' },
      { id: 'bitacora', papel: 'Registra la decisión y responde a «¿por qué hicimos X?».' },
      { id: 'docs-sync', papel: 'Sincroniza documentación sin cambiar comportamiento.' },
      { id: 'onboard', papel: 'Documenta un repositorio existente y lo deja listo para specs.' },
    ],
  },
  {
    id: 'otros',
    nombre: 'Diseño y meta',
    skills: [
      { id: 'design-sync', papel: 'Contrasta tokens y componentes de Figma o Stitch con el código.' },
      { id: 'skill-creator', papel: 'Crea, mejora y mide las skills del propio ecosistema.' },
    ],
  },
];

export const SKILLS = GRUPOS_SKILLS.flatMap((g) => g.skills.map((s) => ({ ...s, grupo: g.id })));

export const IDES = [
  { nombre: 'Claude Code', archivo: 'CLAUDE.md · .claude/' },
  { nombre: 'GitHub Copilot', archivo: '.github/agents/' },
  { nombre: 'VS Code', archivo: '.github/ · .agents/' },
  { nombre: 'Cursor', archivo: '.cursor/' },
  { nombre: 'Codex', archivo: '.codex/' },
  { nombre: 'Gemini CLI', archivo: 'GEMINI.md · .gemini/' },
  { nombre: 'Antigravity', archivo: '.agents/' },
];
