# CLAUDE.md

@AGENTS.md

> Todo lo anterior (`AGENTS.md`) es vinculante. Aquí solo van los añadidos específicos de Claude Code.

## Punto de entrada

Si no sabes por dónde empezar, invoca `/sdd-start`. Clasificará la petición y te llevará
a la fase correcta del circuito SDD.

| Situación | Comando |
|---|---|
| Proyecto nuevo desde cero | `/sdd-init` |
| Repo existente sin documentar | `/onboard` |
| Revalidar formatos y estándares | `/sdd-refresh` |
| Nueva funcionalidad | `/sdd-specify` |
| No sé en qué punto estoy | `/sdd-status` |

## Subagentes

Viven en `.claude/agents/`. Invócalos con `@nombre-agente` o deja que el `orchestrator`
delegue. Catálogo en `docs/agents/CATALOG.md`.

El `orchestrator` es el router por defecto. Los agentes de fase hacen handoff explícito
según el protocolo de `AGENTS.md` §10.

## Skills / comandos

En `.claude/skills/`. Los que empiezan por `sdd-` son el circuito principal y son
**de invocación explícita** (`disable-model-invocation: true`) para que el flujo lo
controles tú, no el modelo.

## Hooks activos

Definidos en `.claude/settings.json`, implementados en Node (`.claude/hooks/*.mjs`) para
que funcionen igual en Windows, macOS y Linux.

| Evento | Hook | Efecto |
|---|---|---|
| `SessionStart` | `session-context.mjs` | Inyecta spec activa, últimas entradas de bitácora y estado de tareas |
| `UserPromptSubmit` | `sdd-router.mjs` | Recuerda la fase SDD actual y avisa si intentas saltarte una |
| `PreToolUse` (Edit\|Write) | `guard-write.mjs` | `deny` en `.env`, secretos y artefactos generados; `ask` en agentes, skills y constitución |
| `PreToolUse` (Bash) | `guard-bash.mjs` | `deny` en destructivo sin retorno; `ask` en push, commit, IaC, kubectl y publicación |
| `PostToolUse` (Edit\|Write) | `format-and-lint.mjs` | Formatea y linta lo tocado |
| `SubagentStart` / `SubagentStop` | `subagent-log.mjs` | Registra qué subagente trabajó realmente, fuera del modelo |
| `Stop` | `session-log.mjs` | Registra la sesión en `docs/bitacora/sessions/` |

Para desactivar temporalmente un gate: `SDD_GATES=off` en el entorno.

## Preferencias de trabajo

- Ejecuta los tests y **muestra la salida real** antes de decir que algo funciona.
- Rutas de fichero como enlaces markdown relativos.
- Al terminar una fase, cierra siempre con el bloque `### HANDOFF`.
- No hagas commit ni push salvo que te lo pidan explícitamente.
- Prefiere editar ficheros existentes a crear nuevos.
- No crees documentación no solicitada fuera de la estructura `docs/`.

## Modelos sugeridos por agente

| Trabajo | Modelo |
|---|---|
| Arquitectura, specs, planificación, revisión de seguridad | `opus` |
| Implementación, tests, especialistas de dominio | `inherit` (o `sonnet`) |
| Búsqueda, formateo, bitácora, tareas mecánicas | `haiku` |
