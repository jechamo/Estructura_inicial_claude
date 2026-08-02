/**
 * Manifiesto declarativo del instalador.
 *
 * El repositorio conserva su propia historia. Estas reglas deciden qué parte es motor
 * reusable y qué parte debe nacer sin contexto en cada proyecto destino.
 */

export const VERSION_MANIFIESTO = 2;

export const DIRECTORIOS_VIRGENES = [
  'docs/bitacora/sessions',
  'docs/quality/reports',
  'docs/security/reports',
  'docs/design/flows',
  'docs/design/wireframes',
];

export const JSON_FUSIONABLES = [
  '.vscode/settings.json',
  '.claude/settings.json',
  '.cursor/hooks.json',
  '.agents/hooks.json',
  '.codex/hooks.json',
  '.github/hooks/sdd.json',
];

export const BLOQUES_GESTIONADOS = {
  'AGENTS.md': `## Flujo SDD gestionado

La política operativa completa está en [\`docs/sdd/OPERATING-MODEL.md\`](docs/sdd/OPERATING-MODEL.md).

- Ningún código se implementa sin una spec aprobada en \`docs/specs/NNN-slug/\`.
- Circuito: specify → clarify → design cuando haya UI → plan → tasks → implement → verify → ship.
- La implementación sigue TDD: RED demostrado → GREEN mínimo → REFACTOR con la suite verde.
- \`orchestrator\` es la entrada; solo \`orchestrator\`, \`planner\` e \`implementer\` delegan.
- La profundidad máxima es de dos saltos; los especialistas siempre devuelven el control.
- Las decisiones viven en la bitácora o en un ADR, nunca únicamente en el chat.

### HANDOFF
- Agente origen:
- Fase completada:
- Artefactos:
- Decisiones tomadas:
- Bloqueos / supuestos:
- Siguiente agente sugerido:
- Contexto que necesita:`,
  'CLAUDE.md': `Lee y aplica primero [\`AGENTS.md\`](AGENTS.md). Los perfiles están en \`.claude/agents/\`, las skills canónicas en \`.agents/skills/\` y sus adaptadores Claude en \`.claude/skills/\`.`,
  'GEMINI.md': `Lee y aplica primero [\`AGENTS.md\`](AGENTS.md). Los workflows de Antigravity están en \`.agents/workflows/\` y los perfiles canónicos en \`.claude/agents/\`.`,
  '.github/copilot-instructions.md': `Lee y aplica [\`../AGENTS.md\`](../AGENTS.md). Usa los perfiles de \`.github/agents/\` y los prompts de \`.github/prompts/\`; no implementes sin spec aprobada ni test rojo previo.`,
};

export const SEMILLAS = {
  'README.md': `# <NOMBRE_DEL_PROYECTO>

> Estado: bootstrap.

## Propósito

<Describir el problema que resuelve el proyecto.>

## Instalación

<Pendiente de definir durante /sdd-init o /onboard.>

## Desarrollo

<Pendiente de definir según el stack real.>

## Calidad

El proyecto usa el circuito SDD/TDD descrito en [AGENTS.md](AGENTS.md).
`,
  'CHANGELOG.md': `# Changelog

Todos los cambios relevantes de este proyecto se documentarán aquí siguiendo
[Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

## [Unreleased]
`,
  'AGENTS.md': `# AGENTS.md — Router operativo del proyecto

| Campo | Valor |
|---|---|
| Nombre | <RELLENAR> |
| Tipo | <RELLENAR> |
| Estado | bootstrap |
| Stack | pendiente |

<!-- sdd:start -->
${''}## Flujo SDD gestionado

La política operativa completa está en [\`docs/sdd/OPERATING-MODEL.md\`](docs/sdd/OPERATING-MODEL.md).

- Ningún código se implementa sin una spec aprobada en \`docs/specs/NNN-slug/\`.
- Circuito: specify → clarify → design cuando haya UI → plan → tasks → implement → verify → ship.
- La implementación sigue TDD: RED demostrado → GREEN mínimo → REFACTOR con la suite verde.
- \`orchestrator\` es la entrada; solo \`orchestrator\`, \`planner\` e \`implementer\` delegan.
- La profundidad máxima es de dos saltos; los especialistas siempre devuelven el control.
- Las decisiones viven en la bitácora o en un ADR, nunca únicamente en el chat.

### HANDOFF
- Agente origen:
- Fase completada:
- Artefactos:
- Decisiones tomadas:
- Bloqueos / supuestos:
- Siguiente agente sugerido:
- Contexto que necesita:
<!-- sdd:end -->
`,
  'CLAUDE.md': `# CLAUDE.md

<!-- sdd:start -->
Lee y aplica primero [\`AGENTS.md\`](AGENTS.md). Los perfiles están en \`.claude/agents/\`, las skills canónicas en \`.agents/skills/\` y sus adaptadores Claude en \`.claude/skills/\`.
<!-- sdd:end -->
`,
  'GEMINI.md': `# GEMINI.md

<!-- sdd:start -->
Lee y aplica primero [\`AGENTS.md\`](AGENTS.md). Los workflows de Antigravity están en \`.agents/workflows/\` y los perfiles canónicos en \`.claude/agents/\`.
<!-- sdd:end -->
`,
  '.github/copilot-instructions.md': `# Instrucciones de Copilot

<!-- sdd:start -->
Lee y aplica [\`../AGENTS.md\`](../AGENTS.md). Usa los perfiles de \`.github/agents/\` y los prompts de \`.github/prompts/\`; no implementes sin spec aprobada ni test rojo previo.
<!-- sdd:end -->
`,
  'docs/README.md': `# Documentación

<!-- sdd:start -->
- [Modelo operativo SDD](sdd/OPERATING-MODEL.md)
- [Visión de producto](product/VISION.md)
- [Constitución de arquitectura](architecture/constitution.md)
- [Specs](specs/)
- [Dirección visual](design/DIRECCION-VISUAL.md)
- [Estrategia de pruebas](quality/TEST-STRATEGY.md)
- [Modelo de amenazas](security/THREAT-MODEL.md)
- [Bitácora](bitacora/DECISIONS.md)
<!-- sdd:end -->
`,
  'docs/agents/SKILLS-EXTERNAS.md': `# Skills externas

Las skills externas solo se distribuyen si están auditadas, fijadas y son parte del método base.
Se gobiernan en [\`.sdd/external-skills.json\`](../../.sdd/external-skills.json). La instalación
incluye únicamente \`skill-creator\`, oficial de Anthropic y fijada a un commit; no hereda
candidatas, rechazos ni decisiones históricas de la plantilla.

Para aprobar una entrada hacen falta publicador identificado, licencia verificada, versión o
commit inmutable, revisión de instrucciones y scripts, alcance, riesgo y responsable.

\`node scripts/skills-sync.mjs --check\` valida esa política; nunca instala por sí mismo.
`,
  'docs/integrations/IDE-COMPATIBILITY.md': `# Compatibilidad de hosts

| Capacidad | Claude | VS Code/Copilot | Cursor | Antigravity | Codex |
|---|---|---|---|---|---|
| Reglas SDD | \`CLAUDE.md\` → \`AGENTS.md\` | instrucciones GitHub → \`AGENTS.md\` | reglas → \`AGENTS.md\` | \`GEMINI.md\` → \`AGENTS.md\` | \`AGENTS.md\` nativo |
| Agentes | \`.claude/agents\` | \`.github/agents\` | \`.cursor/agents\` | adopción de perfil | \`.codex/agents\` |
| Skills | adaptadores Claude | \`.agents/skills\` | \`.agents/skills\` | \`.agents/skills\` | \`.agents/skills\` |
| Hooks | contrato Claude | contrato GitHub | contrato Cursor | contrato Antigravity | contrato Codex |
| Gate común | \`scripts/check-sdd.mjs\` | igual | igual | igual | igual |

Los contratos de fichero se validan determinísticamente. Una capacidad de hook o delegación solo
se considera verificada en vivo después de un smoke real en la versión concreta del host. Sin ese
smoke, usa \`declared-direct\` y deja que CI sea el juez.
`,
  'docs/product/VISION.md': `# Visión de producto

## Problema

<Pendiente>

## Personas usuarias

<Pendiente>

## Resultado esperado

<Pendiente>

## No objetivos

<Pendiente>
`,
  'docs/architecture/constitution.md': `# Constitución de arquitectura

> Estado: bootstrap. Este fichero no contiene todavía una decisión arquitectónica aprobada.

## Contexto del proyecto

<Pendiente de /sdd-init o /onboard.>

## Stack

<Pendiente>

## Decisiones vinculantes

Ninguna. Toda decisión nueva requiere justificación y, si es estructural, un ADR.
`,
  'docs/design/DIRECCION-VISUAL.md': `# Dirección visual

> Estado: pendiente. No existe una dirección visual aprobada para este proyecto.

## Necesidad de interfaz

<Pendiente>

## Decisión aprobada

<Pendiente de validación humana durante /sdd-design.>
`,
  'docs/security/THREAT-MODEL.md': `# Modelo de amenazas

> Estado: pendiente. Este documento no representa todavía un análisis real del sistema.

## Alcance

<Pendiente>

## Activos, fronteras y amenazas

<Pendiente de /sdd-init o /onboard.>
`,
  'docs/bitacora/DECISIONS.md': `# Bitácora de decisiones

> Entradas nuevas arriba. No se borra ni reescribe historia existente.
> Usa [\`TEMPLATE.md\`](TEMPLATE.md) para cada decisión.

---

<!-- decisiones:insertar-aqui -->
`,
  '.sdd/agent-audit.jsonl': '',
  '.sdd/external-skills.json': `{
  "$schema": "./schemas/external-skills.schema.json",
  "version": 1,
  "policy": "Toda skill externa requiere revisión, licencia verificada y versión inmutable antes de aprobarse.",
  "entries": [
    {
      "id": "anthropic-skill-creator",
      "source": "https://github.com/anthropics/skills",
      "skill": "skill-creator",
      "commit": "b29e7cf65e5cb78a5ac33d582270551bc74a14eb",
      "license": "Apache-2.0",
      "status": "approved-vendored",
      "path": ".agents/skills/skill-creator"
    }
  ]
}
`,
  '.sdd/territories.json': `{
  "version": 1,
  "modo": "audit",
  "descripcion": "Sin territorios de aplicación hasta /sdd-init o /onboard.",
  "territories": [
    { "agent": "architect", "paths": ["docs/architecture/**"] },
    { "agent": "spec-analyst", "paths": ["docs/specs/**/spec.md", "docs/specs/**/clarifications.md"] }
  ]
}
`,
  '.sdd/checks.json': `{
  "version": 1,
  "checks": {
    "sdd": { "command": "node scripts/check-sdd.mjs", "required": true }
  },
  "unconfigured": ["lint", "test", "typecheck", "build", "mutation"]
}
`,
  '.env.example': `# Variables de aplicación
# Añade solo nombres y explicaciones. Nunca incluyas valores reales ni credenciales.

`,
  '.github/dependabot.yml': `version: 2
updates:
  - package-ecosystem: github-actions
    directory: /
    schedule:
      interval: weekly
`,
};

const EXCLUSIONES_EXACTAS = new Set([
  'README.md', 'CHANGELOG.md', 'AGENTS.md', 'CLAUDE.md', 'GEMINI.md',
  'docs/README.md', 'docs/product/VISION.md',
  'docs/agents/SKILLS-EXTERNAS.md', 'docs/integrations/IDE-COMPATIBILITY.md',
  'docs/guides/INSTALACION.md',
  'docs/architecture/constitution.md', 'docs/design/DIRECCION-VISUAL.md',
  'docs/security/THREAT-MODEL.md', 'docs/bitacora/DECISIONS.md',
  '.sdd/agent-audit.jsonl', '.sdd/external-skills.json', '.sdd/territories.json',
  '.sdd/checks.json', '.sdd/installed.json', '.env.example',
  '.github/copilot-instructions.md', '.github/dependabot.yml',
  '.mcp.json', '.vscode/mcp.json', '.agents/mcp_config.json',
  'LICENSE',
  'package.json', 'package-lock.json', 'pnpm-lock.yaml', 'yarn.lock',
  'scripts/install.mjs', 'scripts/test-install.mjs',
  '.github/workflows/quality-gates.yml',
]);

/** Devuelve true solo para artefactos reutilizables, nunca para historia generada. */
export function debeCopiar(ruta, { conBaseline = false, conMcp = false } = {}) {
  const r = ruta.replaceAll('\\', '/');
  if (r.startsWith('.git/') || r.startsWith('node_modules/') || r.startsWith('scripts/lib/')) return false;
  if (EXCLUSIONES_EXACTAS.has(r)) {
    if (conMcp && ['.mcp.json', '.vscode/mcp.json', '.agents/mcp_config.json'].includes(r)) return true;
    return false;
  }
  if (r.startsWith('docs/specs/')) return r.startsWith('docs/specs/_TEMPLATE/');
  if (r.startsWith('docs/architecture/adr/')) return r === 'docs/architecture/adr/_TEMPLATE.md';
  if (r.startsWith('docs/bitacora/sessions/')) return r.endsWith('/.gitkeep');
  if (r.startsWith('docs/quality/reports/') || r.startsWith('docs/security/reports/')) return r.endsWith('/.gitkeep');
  if (r.startsWith('docs/research/')) return conBaseline;
  if (r === 'docs/agents/MAPEO-10-AGENTES.md') return false;
  if (r.startsWith('.sdd/state/') || r.startsWith('.sdd/conflicts/')) return false;
  if (r.startsWith('.claude/hooks/')) return false;
  return true;
}

export const APENDICE_GITIGNORE = {
  inicio: '# ─── SDD (instalado por sdd init) ───',
  fin: '# ─── fin SDD ───',
  lineas: [
    '.env',
    '.env.*',
    '!.env.example',
    '.sdd/state/',
    '.sdd/conflicts/',
    '.claude/settings.local.json',
    '.claude/.cache/',
    '.cursor/local/',
  ],
};
