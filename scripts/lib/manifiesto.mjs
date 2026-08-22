/**
 * Manifiesto declarativo del instalador.
 *
 * El repositorio conserva su propia historia. Estas reglas deciden qué parte es motor
 * reusable y qué parte debe nacer sin contexto en cada proyecto destino.
 */

export const VERSION_MANIFIESTO = 7;

// Artefactos publicados por versiones anteriores que ahora duplican Agent Skills. Una
// actualización solo los elimina cuando installed.json demuestra propiedad y el hash sigue
// intacto; cualquier personalización se conserva y deja de considerarse gestionada.
export const RUTAS_RETIRADAS = [
  '.github/prompts/bbdd.prompt.md',
  '.github/prompts/front.prompt.md',
  '.github/prompts/middle.prompt.md',
  '.github/prompts/onboard.prompt.md',
  '.github/prompts/respond-incident.prompt.md',
  '.github/prompts/sdd-clarify.prompt.md',
  '.github/prompts/sdd-design.prompt.md',
  '.github/prompts/sdd-implement.prompt.md',
  '.github/prompts/sdd-init.prompt.md',
  '.github/prompts/sdd-plan.prompt.md',
  '.github/prompts/sdd-ship.prompt.md',
  '.github/prompts/sdd-specify.prompt.md',
  '.github/prompts/sdd-tasks.prompt.md',
  '.github/prompts/sdd-verify.prompt.md',
  '.github/prompts/security-scan.prompt.md',
  '.cursor/commands/bbdd.md',
  '.cursor/commands/front.md',
  '.cursor/commands/middle.md',
  '.cursor/commands/sdd-design.md',
  '.cursor/commands/sdd-implement.md',
  '.cursor/commands/sdd-specify.md',
];

export const DIRECTORIOS_VIRGENES = [
  'docs/bitacora/sessions',
  'docs/quality/reports',
  'docs/security/reports',
  'docs/design/reports',
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

La política operativa vinculante está en [\`docs/sdd/OPERATING-MODEL.md\`](docs/sdd/OPERATING-MODEL.md).
No se lee entera: pide la sección de tu fase con \`node scripts/sdd-project.mjs context --phase <fase>\`.

- Ningún código se implementa sin una spec aprobada en \`docs/specs/NNN-slug/\`.
- Producto se aprueba con \`/sdd-intake\` antes de arquitectura greenfield o de specs derivadas de un PRD global.
- Circuito: intake → init/onboard → specify → clarify → design cuando haya UI → plan → tasks → implement → verify → ship.
- La implementación sigue TDD: RED demostrado → GREEN mínimo → REFACTOR con la suite verde.
- Toda spec nueva declara \`Impacto de seguridad\`; si es sensible, cada \`SEC-*\` enlaza decisión, tarea, test y evidencia.
- \`security-auditor\` es de solo lectura. Un \`GO\` exige informe parseable sin CRÍTICO/ALTO ni controles no ejecutados.
- Toda spec nueva declara \`Impacto de usabilidad\`; si es aplicable, cada \`UX-*\` enlaza decisión, tarea, test y evidencia.
- \`ux-designer\` diseña y escribe; quien audita usabilidad en \`/sdd-verify\` es \`code-reviewer\`, en solo lectura. Nadie audita su propio diseño.
- \`orchestrator\` es la entrada; solo \`orchestrator\`, \`planner\` e \`implementer\` delegan.
- La profundidad máxima es de dos saltos; los especialistas siempre devuelven el control.
- Las decisiones viven en la bitácora o en un ADR, nunca únicamente en el chat.

### HANDOFF
- Agente origen:
- Fase completada:
- Fuentes consultadas:
- Artefactos:
- Requisitos / casos cubiertos:
- Discrepancias:
- Decisiones tomadas:
- Supuestos:
- Bloqueos:
- Siguiente agente sugerido:
- Comando / contexto durable:`,
  'CLAUDE.md': `Lee y aplica primero [\`AGENTS.md\`](AGENTS.md). Empieza por \`/sdd-intake\` cuando haya PRD o un proyecto nuevo. Los perfiles están en \`.claude/agents/\`, las skills canónicas en \`.agents/skills/\` y sus adaptadores Claude en \`.claude/skills/\`.`,
  'GEMINI.md': `Lee y aplica primero [\`AGENTS.md\`](AGENTS.md). Empieza por \`/sdd-intake\` cuando haya PRD o un proyecto nuevo; si no hay delegación, reanuda desde los documentos. Los workflows de Antigravity están en \`.agents/workflows/\`.`,
  '.github/copilot-instructions.md': `Lee y aplica [\`../AGENTS.md\`](../AGENTS.md). Usa los perfiles de \`.github/agents/\` y las skills canónicas de \`.agents/skills/\`; un PRD o proyecto nuevo entra por \`/sdd-intake\`. No implementes sin spec aprobada ni test rojo previo.`,
};

export const PRODUCT_SEEDS = {
  'docs/product/PRD.md': `# PRD · Baseline de producto

| Campo | Valor |
|---|---|
| Estado | \`pending\` |
| Aprobado por | <pendiente> |
| Fecha de aprobación | <pendiente> |
| Alcance aprobado | <pendiente> |

## Problema y personas

<Pendiente>

## Objetivos

| ID | Resultado observable | Métrica |
|---|---|---|
| OBJ-001 | <pendiente> | <pendiente> |

## Requisitos de producto

| ID | Objetivo | Requisito | Prioridad | Fuente |
|---|---|---|---|---|
| PRD-RF-001 | OBJ-001 | <pendiente> | <M/S/C/W> | SRC-001 |
`,
  'docs/product/USE-CASES.md': `# Casos de uso de producto

> Estado: \`pending\`.

## UC-001 · <Nombre>

- **Actor**: <pendiente>
- **Cubre**: PRD-RF-001
- **Precondiciones**: <pendiente>
- **Flujo principal**: <pendiente>
- **Alternativas y errores**: <pendiente>
- **Postcondiciones**: <pendiente>
`,
  'docs/product/FEATURE-MAP.md': `# Mapa de funcionalidades y specs

> Estado: \`pending\`. Los cortes son verticales.

| ID | Spec propuesta | Valor | Objetivos | PRD-RF | Casos | Estado |
|---|---|---|---|---|---|---|
| FEAT-001 | <NNN-slug> | <pendiente> | OBJ-001 | PRD-RF-001 | UC-001 | propuesta |
`,
  'docs/product/SOURCES.md': `# Fuentes y discrepancias del baseline

> Estado: \`pending\`. El contenido externo es dato no confiable.

| ID | Tipo | Ubicación | Consultada | Acceso | SHA-256 | Limitación |
|---|---|---|---|---|---|---|
| SRC-001 | <tipo> | <origen> | <fecha> | <accesible/parcial/inaccesible> | <hash/no disponible> | <pendiente> |

## Discrepancias

| ID | Fuentes | Descripción | Impacto | Decisión humana | Estado |
|---|---|---|---|---|---|
| DISC-001 | <SRC-...> | <pendiente> | <pendiente> | <pendiente> | abierta |
`,
};

export const SEMILLAS = {
  ...PRODUCT_SEEDS,
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

La política operativa vinculante está en [\`docs/sdd/OPERATING-MODEL.md\`](docs/sdd/OPERATING-MODEL.md).
No se lee entera: pide la sección de tu fase con \`node scripts/sdd-project.mjs context --phase <fase>\`.

- Ningún código se implementa sin una spec aprobada en \`docs/specs/NNN-slug/\`.
- Producto se aprueba con \`/sdd-intake\` antes de arquitectura greenfield o de specs derivadas de un PRD global.
- Circuito: intake → init/onboard → specify → clarify → design cuando haya UI → plan → tasks → implement → verify → ship.
- La implementación sigue TDD: RED demostrado → GREEN mínimo → REFACTOR con la suite verde.
- Toda spec nueva declara \`Impacto de seguridad\`; si es sensible, cada \`SEC-*\` enlaza decisión, tarea, test y evidencia.
- \`security-auditor\` es de solo lectura. Un \`GO\` exige informe parseable sin CRÍTICO/ALTO ni controles no ejecutados.
- Toda spec nueva declara \`Impacto de usabilidad\`; si es aplicable, cada \`UX-*\` enlaza decisión, tarea, test y evidencia.
- \`ux-designer\` diseña y escribe; quien audita usabilidad en \`/sdd-verify\` es \`code-reviewer\`, en solo lectura. Nadie audita su propio diseño.
- \`orchestrator\` es la entrada; solo \`orchestrator\`, \`planner\` e \`implementer\` delegan.
- La profundidad máxima es de dos saltos; los especialistas siempre devuelven el control.
- Las decisiones viven en la bitácora o en un ADR, nunca únicamente en el chat.

### HANDOFF
- Agente origen:
- Fase completada:
- Fuentes consultadas:
- Artefactos:
- Requisitos / casos cubiertos:
- Discrepancias:
- Decisiones tomadas:
- Supuestos:
- Bloqueos:
- Siguiente agente sugerido:
- Comando / contexto durable:
<!-- sdd:end -->
`,
  'CLAUDE.md': `# CLAUDE.md

<!-- sdd:start -->
Lee y aplica primero [\`AGENTS.md\`](AGENTS.md). Empieza por \`/sdd-intake\` cuando haya PRD o un proyecto nuevo. Los perfiles están en \`.claude/agents/\`, las skills canónicas en \`.agents/skills/\` y sus adaptadores Claude en \`.claude/skills/\`.
<!-- sdd:end -->
`,
  'GEMINI.md': `# GEMINI.md

<!-- sdd:start -->
Lee y aplica primero [\`AGENTS.md\`](AGENTS.md). Empieza por \`/sdd-intake\` cuando haya PRD o un proyecto nuevo; si no hay delegación, reanuda desde los documentos. Los workflows de Antigravity están en \`.agents/workflows/\`.
<!-- sdd:end -->
`,
  '.github/copilot-instructions.md': `# Instrucciones de Copilot

<!-- sdd:start -->
Lee y aplica [\`../AGENTS.md\`](../AGENTS.md). Usa los perfiles de \`.github/agents/\` y las skills canónicas de \`.agents/skills/\`; un PRD o proyecto nuevo entra por \`/sdd-intake\`. No implementes sin spec aprobada ni test rojo previo.
<!-- sdd:end -->
`,
  'docs/README.md': `# Documentación

<!-- sdd:start -->
- [Modelo operativo SDD](sdd/OPERATING-MODEL.md)
- [Visión de producto](product/VISION.md)
- [PRD de producto](product/PRD.md)
- [Casos de uso](product/USE-CASES.md)
- [Mapa de funcionalidades](product/FEATURE-MAP.md)
- [Fuentes del baseline](product/SOURCES.md)
- [Constitución de arquitectura](architecture/constitution.md)
- [Specs](specs/)
- [Dirección visual](design/DIRECCION-VISUAL.md)
- [Checklist de accesibilidad](design/A11Y-CHECKLIST.md)
- [Checklist de usabilidad](design/USABILITY-CHECKLIST.md)
- [Estrategia de pruebas](quality/TEST-STRATEGY.md)
- [Modelo de amenazas](security/THREAT-MODEL.md)
- [Checklist de seguridad](security/SECURITY-CHECKLIST.md)
- [Autenticación y tokens](security/AUTH-TOKENS.md)
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
  'docs/product/VISION.md': `# Visión de producto (fuente opcional)

> Si existe contenido real, /sdd-intake lo trata como fuente. PRD.md es el baseline canónico.

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
  'docs/quality/TECH-DEBT.md': `# Deuda técnica

Documento vinculante. La mide \`/sdd-verify\`, la registra \`bitacora-keeper\` y la paga
\`refactor-specialist\`.

---

## Qué es

> "Decisiones de diseño convenientes a corto plazo y caras a largo plazo." — Ward Cunningham

Como la deuda financiera: tomas prestado tiempo hoy y pagas intereses cada vez que tocas ese código.
La deuda no es un fracaso; **no saber cuánta tienes, sí**.

| Eje | Tipos |
|---|---|
| Origen | **Deliberada**: decisión consciente, con compensación analizada y plan de pago · **Accidental**: por desconocimiento o prisa, sin intención |
| Efecto | **Crítica**: bloquea features · **Manejable**: solo ralentiza |

La deliberada se registra en la bitácora en el momento de contraerla, con su fecha de revisión. La
accidental se descubre midiendo.

---

## Cómo se mide

Con un comando, no con una impresión. **La deuda con adjetivo no existe**: "tenemos bastante deuda"
no permite decidir nada.

\`\`\`bash
node scripts/sdd-project.mjs debt --json
\`\`\`

Cuenta \`TODO\`, \`FIXME\`, \`HACK\` y \`XXX\` sobre los ficheros versionados —no sobre
\`node_modules\` ni sobre lo ignorado— y agrupa por directorio. Sin dependencias y sin presuponer
lenguaje.

Señales complementarias, del proyecto que las tenga configuradas:

| Señal | De dónde sale |
|---|---|
| Avisos de lint | gate \`lint\` |
| Funciones sobre el umbral de complejidad | gate \`smells\` |
| Módulos CORE por debajo de su umbral | gate \`coverage\` |
| Tendencia del tiempo de build | histórico de CI: subida sostenida = complejidad creciente |

### Ratio

\`\`\`
ratio = esfuerzo estimado para saldar la deuda / esfuerzo total del periodo
\`\`\`

| Ratio | Lectura |
|---:|---|
| < 30 % | Normal. Se paga con la regla del 80/20 |
| > 30 % | Alta. Se programa un sprint de deuda |
| > 50 % | Crítica. Hay una decisión arquitectónica pendiente, no una limpieza |

El numerador es una estimación humana y se declara como tal. Lo que no es opinable es el conteo.

---

## Cómo se paga

**Regla del boy scout.** Cada vez que tocas un fichero, lo dejas algo mejor: un nombre que revela
intención, un número mágico extraído, código muerto fuera. Acotada al fichero que ya estabas
tocando —\`implementer\` tiene prohibido arreglar de paso lo que no es su tarea, y esa prohibición
manda—.

**Regla del 80/20.** Un quinto de la capacidad de cada ciclo va a deuda. Previene la acumulación y
mantiene la velocidad estable. Es lo que evita el sprint de deuda.

**Sprint de deuda.** Cuando el ratio supera el 30 %: un periodo sin features, solo refactor,
limpieza y tests. Es una corrección, no una rutina; si hace falta cada trimestre, el problema está
en el 80/20 que no se está respetando.

**Un \`TODO\` sin ticket no es deuda, es un despiste.** La Definition of Done lo bloquea.

---

## Cómo se comunica

El negocio no decide sobre complejidad ciclomática. Decide sobre tiempo y riesgo.

| No | Sí |
|---|---|
| "Tenemos alta complejidad ciclomática y varios code smells" | "Cada feature nueva en este módulo tarda el doble que hace seis meses" |
| "Hay 47 TODOs pendientes" | "Invertir una semana ahora ahorra cuatro el próximo trimestre" |
| "El código está mal" | "El riesgo es que un cambio en pagos rompa algo que no vemos hasta producción" |

Traducir no es maquillar: la cifra sigue estando en \`evidence.md\`. Es elegir la unidad que permite
a quien decide, decidir.
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
    { "agent": "spec-analyst", "paths": ["docs/product/PRD.md", "docs/product/USE-CASES.md", "docs/product/FEATURE-MAP.md", "docs/product/SOURCES.md", "docs/specs/**/spec.md", "docs/specs/**/clarifications.md"] },
    { "agent": "ux-designer", "paths": ["docs/design/**"] }
  ]
}
`,
  '.sdd/checks.json': `{
  "version": 1,
  "checks": {
    "sdd": { "command": "node scripts/check-sdd.mjs", "required": true, "speed": "fast" }
  },
  "unconfigured": ["lint", "test", "typecheck", "build", "smells", "coverage", "e2e", "visual", "a11y", "security", "deps-audit", "docs", "mutation"]
}
`,
  '.sdd/docs.json': `{
  "schemaVersion": 1,
  "mode": "audit",
  "documentSets": []
}
`,
  '.sdd/generators.json': `{
  "schemaVersion": 1,
  "generators": []
}
`,
  '.sdd/coverage.json': `{
  "version": 1,
  "incluir": [],
  "excluir": [],
  "suites": [],
  "umbral": 0,
  "margen": 3,
  "medido": null,
  "actualizado": null
}
`,
  '.sdd/smells.json': `{
  "version": 1,
  "incluir": [],
  "maxLineas": null,
  "maxLineasFuncion": null,
  "margen": 0,
  "medido": null,
  "actualizado": null
}
`,
  '.sdd/circuit.json': `{
  "schemaVersion": 1,
  "status": "pending",
  "approvedAt": null,
  "approvedBy": null,
  "proposalHash": null,
  "cuota": 0.4,
  "light": { "allowed": [] },
  "compact": { "modules": [] },
  "denied": [
    "src/",
    "app/",
    "lib/",
    "components/",
    "public/",
    "api/",
    "server/",
    "migrations/",
    "prisma/",
    "supabase/",
    "contracts/",
    "scripts/",
    ".sdd/",
    ".claude/",
    ".agents/",
    ".github/",
    ".cursor/",
    ".codex/",
    ".gemini/",
    "docs/specs/",
    "docs/architecture/",
    "docs/product/",
    "docs/security/",
    "docs/quality/",
    "docs/sdd/",
    "AGENTS.md",
    "CLAUDE.md",
    "GEMINI.md",
    "package.json"
  ],
  "limits": { "criterios": 3, "tareas": 3, "kb": 12 }
}
`,
  '.sdd/lightweight.json': `{
  "version": 1,
  "cuota": 0.4,
  "permitido": [],
  "prohibido": [
    "scripts/",
    ".sdd/",
    ".claude/",
    ".github/",
    ".codex/",
    ".cursor/",
    ".gemini/",
    ".agents/",
    "docs/specs/",
    "docs/architecture/",
    "docs/product/",
    "docs/security/",
    "docs/quality/",
    "docs/sdd/",
    "package.json",
    "AGENTS.md",
    "CLAUDE.md",
    "GEMINI.md"
  ]
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

export const BASE_GITIGNORE = [
  '# Dependencias y entornos locales',
  'node_modules/',
  '.venv/',
  'venv/',
  '__pycache__/',
  '*.py[cod]',
  '',
  '# Salidas generadas',
  'dist/',
  'build/',
  'coverage/',
  '.cache/',
  '',
  '# IDE y sistema operativo',
  '.idea/',
  '.DS_Store',
  'Thumbs.db',
];

const EXCLUSIONES_EXACTAS = new Set([
  'README.md', 'CHANGELOG.md', 'AGENTS.md', 'CLAUDE.md', 'GEMINI.md',
  'docs/README.md', 'docs/product/VISION.md', 'docs/product/PRD.md',
  'docs/product/USE-CASES.md', 'docs/product/FEATURE-MAP.md', 'docs/product/SOURCES.md',
  'docs/agents/SKILLS-EXTERNAS.md', 'docs/integrations/IDE-COMPATIBILITY.md',
  'docs/guides/INSTALACION.md',
  'docs/architecture/constitution.md', 'docs/architecture/CURRENT-STATE.md',
  'docs/quality/TECH-DEBT.md', 'docs/design/DIRECCION-VISUAL.md',
  'docs/security/THREAT-MODEL.md', 'docs/bitacora/DECISIONS.md',
  '.sdd/agent-audit.jsonl', '.sdd/external-skills.json', '.sdd/territories.json',
  '.sdd/checks.json', '.sdd/docs.json', '.sdd/generators.json', '.sdd/installed.json', '.env.example',
  '.sdd/coverage.json', '.sdd/smells.json', '.sdd/lightweight.json', '.sdd/circuit.json',
  '.github/copilot-instructions.md', '.github/dependabot.yml',
  '.gitignore', '.npmignore',
  '.mcp.json', '.vscode/mcp.json', '.agents/mcp_config.json',
  'LICENSE',
  'package.json', 'package-lock.json', 'pnpm-lock.yaml', 'yarn.lock',
  'scripts/install.mjs', 'scripts/test-install.mjs',
  '.github/workflows/quality-gates.yml',
]);

/** Devuelve true solo para artefactos reutilizables, nunca para historia generada. */
export function debeCopiar(ruta, { conBaseline = false, conMcp = false } = {}) {
  const r = ruta.replaceAll('\\', '/');
  if (r.startsWith('.git/') || r.startsWith('node_modules/')) return false;
  if (r.startsWith('scripts/lib/') && ![
    'scripts/lib/circuito.mjs',
    'scripts/lib/contexto.mjs',
    'scripts/lib/resumen-gates.mjs',
    'scripts/lib/coverage-v8.mjs',
    'scripts/lib/docs-contract.mjs',
    'scripts/lib/jsonc.mjs',
    'scripts/lib/trace-audit.mjs',
  ].includes(r)) return false;
  if (r.startsWith('docs/quality/benchmarks/')) return false;
  // La memoria del TFM documenta esta plantilla concreta: es historia, no artefacto reutilizable.
  if (r.startsWith('docs/TFM/')) return false;
  // La landing instala la plantilla; no se instala con ella ni tendría sentido en el destino.
  if (r.startsWith('web/')) return false;
  // El sitio estático es la portada de esta plantilla y contiene su catálogo y versión.
  // Copiarlo a un proyecto nuevo filtraría contexto propio y no aporta al circuito instalado.
  if (r.startsWith('site/')) return false;
  if (EXCLUSIONES_EXACTAS.has(r)) {
    if (conMcp && ['.mcp.json', '.vscode/mcp.json', '.agents/mcp_config.json'].includes(r)) return true;
    return false;
  }
  if (r.startsWith('docs/specs/')) return r.startsWith('docs/specs/_TEMPLATE/');
  if (r.startsWith('docs/architecture/adr/')) return r === 'docs/architecture/adr/_TEMPLATE.md';
  if (r.startsWith('docs/bitacora/sessions/')) return r.endsWith('/.gitkeep');
  if (r.startsWith('docs/quality/reports/') || r.startsWith('docs/security/reports/') ||
      r.startsWith('docs/design/reports/')) return r.endsWith('/.gitkeep');
  if (r.startsWith('docs/research/')) return conBaseline;
  if (r === 'docs/agents/ORIGEN-Y-EVOLUCION.md') return false;
  if (r.startsWith('.sdd/state/') || r.startsWith('.sdd/conflicts/')) return false;
  if (r.startsWith('.claude/hooks/')) return false;
  return true;
}

export const APENDICE_GITIGNORE = {
  inicio: '# ─── SDD (instalado por sdd init) ───',
  fin: '# ─── fin SDD ───',
  lineas: [
    '# Secretos y estado exclusivamente local',
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
