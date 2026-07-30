# Mapeo — los 10 agentes de la idea original sobre el ecosistema implementado

Este documento contesta a una pregunta concreta: **¿dónde está cada uno de los 10 agentes que
pediste?** Todos están. Cinco cambiaron de forma, y aquí está el motivo de cada cambio.

Catálogo completo: [`CATALOG.md`](./CATALOG.md) · Circuito: [`../../AGENTS.md`](../../AGENTS.md) §2

---

## 1. Tabla de correspondencia

| # | Agente de la idea | Dónde vive ahora | Fase SDD | Cambio |
|---|---|---|---|---|
| 1 | **Funcional** | [`spec-analyst`](../../.claude/agents/spec-analyst.md) | `/sdd-specify` + `/sdd-clarify` | Se parte en dos fases |
| 2 | **Diseño** | [`ux-designer`](../../.claude/agents/ux-designer.md) | `/sdd-design` | Igual |
| 3 | **Arquitectura** | [`architect`](../../.claude/agents/architect.md) | `/sdd-init` + ADR | Igual, pero **no se repite** en cada feature |
| 4 | **Técnico** | [`planner`](../../.claude/agents/planner.md) + [`api-designer`](../../.claude/agents/api-designer.md) | `/sdd-plan` | Se le separa el diseño de contratos |
| 5 | **Jefe de proyecto** | [`orchestrator`](../../.claude/agents/orchestrator.md) + [`planner`](../../.claude/agents/planner.md) + [`implementer`](../../.claude/agents/implementer.md) + hooks | `/sdd-tasks` + `/sdd-implement` | Se parte en tres, y la bitácora sale del modelo |
| 6 | **Middle** | [`backend-expert`](../../.claude/agents/backend-expert.md) + skill [`/middle`](../../.claude/skills/middle/SKILL.md) | dentro de `/sdd-implement` | Igual |
| 7 | **Front** | [`frontend-expert`](../../.claude/agents/frontend-expert.md) + skill [`/front`](../../.claude/skills/front/SKILL.md) | dentro de `/sdd-implement` | Igual |
| 8 | **BBDD** | [`database-expert`](../../.claude/agents/database-expert.md) + skill [`/bbdd`](../../.claude/skills/bbdd/SKILL.md) | dentro de `/sdd-implement` | Igual |
| 9 | **Validador QA** | [`code-reviewer`](../../.claude/agents/code-reviewer.md) + [`test-engineer`](../../.claude/agents/test-engineer.md) + [`refactor-specialist`](../../.claude/agents/refactor-specialist.md) + `scripts/check-sdd.mjs` | `/sdd-verify` | Se parte en tres **y un verificador que no es un modelo** |
| 10 | **Seguridad** | [`security-auditor`](../../.claude/agents/security-auditor.md) | `/sdd-verify` | Deja de ser solo fase final |

Los 10 agentes restantes del catálogo (`research-analyst`, `devops-expert`,
`performance-optimizer`, `docs-writer`, `bitacora-keeper`, `release-manager`…) cubren huecos que la
idea original no contemplaba: adoptar un repo existente, montar el CI, entregar, responder a un
incidente. No sustituyen a ninguno de tus diez.

---

## 2. Los cinco cambios, con su motivo

### 2.1 El funcional se parte en `specify` y `clarify`

Pedías un agente que **pregunte** y que **sugiera, pero requiera confirmación**. Está tal cual, y
además con puerta: `spec.md` **no puede pasar a `/sdd-plan` con marcadores
`[NEEDS CLARIFICATION]` abiertos** — lo comprueba `check-sdd.mjs`, no el criterio del modelo.

El motivo de separarlas: escribir requisitos y resolver ambigüedades son actividades con ritmo
distinto. Clarificar es un diálogo por rondas —máximo cinco preguntas cada una, cada una con
recomendación—; especificar es redacción. Juntas producen o una entrevista interminable o una
spec inventada.

**Tu formato se respeta y se completa**: given/when/then en Gherkin sobre requisitos EARS, y
MoSCoW **con las reglas reales del DSDM**, que casi nadie aplica: el reparto es sobre **esfuerzo
estimado, no sobre número de requisitos**, y los *must* no deberían pasar del **60 %**. Si pasan,
el agente lo avisa y propone qué bajar. Un alcance donde todo es obligatorio no tiene margen.

### 2.2 El arquitecto no se repite en cada funcionalidad

En tu circuito, arquitectura era un paso más de cada feature. Aquí la arquitectura se decide
**una vez** en `/sdd-init`, queda en `docs/architecture/constitution.md` y pasa a ser
**vinculante**. En una funcionalidad nueva el `architect` **solo interviene si el cambio viola la
constitución**, y entonces produce un ADR.

Motivo: si cada feature vuelve a elegir arquitectura, no hay arquitectura. Hay opiniones sucesivas.

### 2.3 El técnico entrega los contratos aparte

Tu agente técnico hacía diseño técnico completo más tecnología. Sigue igual (`planner` →
`plan.md`), con una separación: los **contratos** entre sistemas (OpenAPI, GraphQL, esquemas de
evento, tipos compartidos) los hace `api-designer` y viven en `contracts/`.

Motivo: el contrato es lo que permite que front y middle avancen **en paralelo** sin bloquearse ni
inventarse la forma de la respuesta. Si vive dentro de un documento de diseño, se descubre tarde y
mal.

### 2.4 El jefe de proyecto se parte en tres — y la bitácora deja de depender del modelo

Es el cambio más grande. Tus cinco responsabilidades siguen todas:

| Lo que pedías | Dónde está |
|---|---|
| Bajar a tareas separadas por middle / front / BBDD | `planner` en `/sdd-tasks` → `tasks.md` |
| Delegar a cada agente de su ámbito | `implementer` en `/sdd-implement`, con las skills `/middle`, `/front`, `/bbdd` |
| Controlar bitácora al terminar cada modificación | **hooks** `subagent-log.mjs` y `session-log.mjs` |
| Mantener el documento de tareas actualizado | `implementer`, con `check-sdd.mjs` verificándolo |
| Iterar hasta que todo esté "verde" | `/sdd-verify` + `check-sdd.mjs --strict`, y los caminos de vuelta del circuito |

El motivo del reparto: un solo agente que planifica, delega, audita y firma **es su propio juez**.
Y hay algo más de fondo, que conviene entender porque es la diferencia entre este diseño y el
original:

> Cuando un modelo narra *"ahora el agente Middle implementa el caso de uso…"*, eso demuestra lo
> que el modelo **dice**, no lo que **ocurrió**. Un botón de handoff cambia de agente; no prueba
> que ejecutara nada.

Por eso la bitácora **no la escribe ningún agente**: la escriben los hooks del host, fuera del
modelo, en `execution-log.jsonl` (append-only, y los hooks bloquean su edición). Cada delegación
queda con nivel de verificación `observed`, `declared-direct` o `unverified`, y una tarea no pasa a
`hecho` sin ejecución registrada. Ver [`../../AGENTS.md`](../../AGENTS.md) §10.1.

Si el jefe de proyecto se autocertificara, tendrías una bitácora que dice lo que quieres leer.

### 2.5 QA se parte en tres, y uno de los tres no es un modelo

Pedías que QA valide calidad, SOLID, TDD y patrones. Son tres oficios distintos:

- `test-engineer` — ¿los tests prueban algo? Pirámide, tests de contrato, casos límite, y
  **mutation testing**: el único indicador que detecta tests que mienten. Cobertura alta con
  *mutation score* bajo es una suite decorativa, y es el patrón habitual en tests generados por un
  modelo.
- `refactor-specialist` — SOLID, DRY, KISS, YAGNI y patrones. Una violación sin ADR bloquea.
- `code-reviewer` — corrección, legibilidad y trazabilidad con la spec.

Y encima de los tres, `scripts/check-sdd.mjs`: **un verificador determinista**. Comprueba contra
el sistema de ficheros que toda tarea marcada `hecho` tiene evidencia y ejecución registrada, que
ningún criterio de aceptación quedó sin test, que no se planificó sobre ambigüedades y que el log
de ejecución no se ha manipulado.

Motivo: una casilla de "Definition of Done" que marca quien tiene que ser evaluado no es un gate,
es una declaración de intenciones. Y el dato acompaña: los PR generados por IA presentan **1,7×
más incidencias**, y DORA mide **−7,2 % de estabilidad** cuando se adopta IA sin fundamentos
sólidos. Un gate que **ejecuta** vale más que cualquier instrucción en un prompt.

### 2.6 Seguridad no espera al final

Tu agente 10 validaba al final. Aquí `security-auditor` sigue existiendo y firmando en
`/sdd-verify`, pero la seguridad entra **desde la spec**: nivel ASVS declarado en la constitución
(**L2 por defecto** en aplicación expuesta), innegociables en `AGENTS.md` §8, hooks que bloquean
`.env` y comandos destructivos, y `guard-bash.mjs`/`guard-write.mjs` operando en cada llamada.

Motivo: encontrar un fallo de autorización en la fase de validación significa rehacer casos de uso
ya implementados. Los que pedías explícitamente —accesos, contraseñas, variables de entorno— están
todos, y además con Argon2/bcrypt, consultas parametrizadas, secretos fuera del repo y OWASP Top 10
for Agentic Applications si el producto usa LLM.

---

## 3. Lo que se añadió y no estaba

| Añadido | Por qué |
|---|---|
| `/onboard` + `research-analyst` | Tu circuito asumía proyecto nuevo. La mayoría del trabajo real es sobre un repo que ya existe y no está documentado |
| `/respond-incident` | Cuando algo se cae, no se entra por `/sdd-specify`. Primero se para el dolor, después se diagnostica |
| `/sdd-ship` + `release-manager` | La idea acababa en "resumen de implementación". Falta PR, CHANGELOG, trazabilidad, decisión GO/NO-GO firmada por una persona y plan de reversión |
| `devops-expert`, `performance-optimizer`, `docs-writer` | Huecos de ciclo de vida: CI/CD, latencia, documentación para quien venga después |
| `bitacora-keeper` + tres niveles de bitácora | Tu punto de "controlar una bitácora" merecía estructura: ADR para lo estructural, diario para decisiones, sesiones automáticas para lo que hicieron los agentes |
| `/sdd-refresh` | Todo esto caduca. Un mecanismo para revalidar formatos y prácticas contra las fuentes, con baseline fechado |
| Skills `/middle`, `/front`, `/bbdd` | Tus agentes 6, 7 y 8 pedían "tener como documentación las mejores prácticas". Un agente que dice "aplica SOLID" no aplica SOLID: hacía falta el procedimiento escrito, con puertas de entrada y listas de comprobación |
| `.sdd/external-skills.json` + `SKILLS-EXTERNAS.md` | Para incorporar las mejores skills de repositorios oficiales sin instalar código de terceros a ciegas |

---

## 4. Dónde está cada requisito de tu lista de "IMPORTANTE"

| Requisito | Estado |
|---|---|
| Estructura de agentes, hooks, skills, prompts y handoff | 20 agentes en `.claude/agents/` · 7 hooks en `.claude/hooks/` · 22 skills en `.claude/skills/` · 15 prompts de Copilot en `.github/prompts/` · 6 comandos de Cursor · workflows de Antigravity · protocolo de handoff obligatorio en `AGENTS.md` §10 |
| Información actualizada de patrones, SOLID y arquitecturas | [`baseline-2026-07-30.md`](../research/baseline-2026-07-30.md) §3 y [`baseline-2026-07-29.md`](../research/baseline-2026-07-29.md) · corrección del eje macro/micro aplicada a `AGENTS.md` §3.1 |
| Información actualizada de QA, TDD y mejores prácticas | [`baseline-2026-07-30.md`](../research/baseline-2026-07-30.md) §2, con datos DORA y mutation testing incorporado a `AGENTS.md` §6 |
| **Las mejores skills de repos oficiales para middle, front y BBDD** | [`SKILLS-EXTERNAS.md`](./SKILLS-EXTERNAS.md): 13 skills oficiales catalogadas (Anthropic, Vercel, Supabase, Cloudflare, Netlify, Stripe, Neon), con política de auditoría y `scripts/skills-sync.mjs --check` en CI. **Hallazgo:** Anthropic no publica ninguna de backend ni BBDD — de sus 17 skills, solo 3 tocan este terreno. El método lo pone esta plantilla; el fabricante pone lo específico de su stack |
| Funcionar en todos los IDE y proveedores | [`../integrations/IDE-COMPATIBILITY.md`](../integrations/IDE-COMPATIBILITY.md): Claude Code, VS Code + Copilot, Copilot CLI/nube, Cursor, Antigravity, Codex, Gemini. Las **skills** son estándar abierto y no se duplican; los **agentes** sí necesitan envoltorio por superficie, y `check-sdd.mjs` detecta la deriva entre ellos |

---

## 5. Veredicto honesto sobre la idea original

Lo que estaba bien y se ha conservado entero:

- **La secuencia.** Funcional → diseño → arquitectura → técnico → implementación → validación es
  el orden correcto, y coincide con lo que hace GitHub Spec Kit. No es obvio: mucha gente empieza
  por la arquitectura.
- **Preguntar y sugerir requiriendo confirmación.** Es el detalle más valioso de tu propuesta y
  se ha llevado a todas las fases, no solo al funcional.
- **Separar el trabajo por middle / front / BBDD.** Es la división que coincide con dónde están
  las fronteras técnicas de verdad.
- **Un responsable que itera hasta verde.** Correcto. Solo hacía falta que el que itera no sea el
  que certifica.

Lo que fallaba, y es un fallo de diseño, no un olvido:

1. **El jefe de proyecto era juez y parte.** Planificaba, delegaba, escribía la bitácora y decidía
   si estaba verde. Un agente que se autocertifica produce siempre el resultado que le pides.
2. **La bitácora dependía del modelo.** Y el modelo puede narrar delegaciones que no ocurrieron.
   Sin hooks fuera del modelo, la trazabilidad es literatura.
3. **La arquitectura se decidía en cada feature.** Eso no es tener arquitectura.
4. **Faltaba el ciclo de vida completo.** Sin entrega, sin incidentes, sin repos existentes, sin
   revalidación. El día 1 funciona; el mes 6 se cae.

Los cuatro se arreglan con la misma idea: **sacar la verificación del modelo**. Todo lo demás de
tu propuesta se ha implementado tal como lo planteaste.
