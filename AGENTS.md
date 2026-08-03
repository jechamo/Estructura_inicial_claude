# AGENTS.md — Router operativo

Este fichero es la entrada compartida para Claude Code, Copilot, VS Code, Cursor,
Antigravity y Codex. La política completa y vinculante está en
[`docs/sdd/OPERATING-MODEL.md`](docs/sdd/OPERATING-MODEL.md).

## Identidad

| Campo | Valor |
|---|---|
| Nombre | Estructura inicial de agentes SDD |
| Tipo | plantilla y CLI de instalación |
| Estado | activo |
| Stack | Node.js 18+, sin dependencias de runtime |
| Arquitectura | [`docs/architecture/constitution.md`](docs/architecture/constitution.md) |
| Bitácora | [`docs/bitacora/DECISIONS.md`](docs/bitacora/DECISIONS.md) |

<!-- sdd:start -->
## Reglas duras

1. Ningún código se implementa sin una spec aprobada en `docs/specs/NNN-slug/`.
2. Un proyecto nuevo define y aprueba producto antes de decidir arquitectura. Si llega un PRD
   global o un diseño opcional, entra por `/sdd-intake` antes de crear specs verticales.
3. Circuito de funcionalidad: specify → clarify → design cuando haya UI → plan → tasks → implement → verify → ship.
4. Implementación con TDD: RED demostrado → GREEN mínimo → REFACTOR con la suite verde.
5. No se modifican artefactos de una fase anterior sin avisar y registrar la decisión.
6. Toda tarea terminada enlaza spec, criterio, tarea, test y evidencia ejecutada.
7. “Pasa” sin ejecución real no es un resultado; “no ejecutado” sí, con riesgo y siguiente paso.
8. Nunca se leen, copian ni escriben secretos, `.env`, credenciales o configuración local.
9. No se usa `git push --force`, no se toca producción y no se borra contexto ajeno.

## Entrada por situación

| Situación | Entrada |
|---|---|
| PRD global, ruta/URL de requisitos o diseño opcional | `/sdd-intake` |
| Proyecto nuevo | `/sdd-intake` → `/sdd-init` |
| Repositorio existente sin documentar | `/onboard` |
| Nueva funcionalidad | `/sdd-specify` |
| Implementación de tarea | `/sdd-implement` → `/middle`, `/front` o `/bbdd` |
| Validación | `/sdd-verify` |
| Entrega | `/sdd-ship` |
| Duda sobre la fase | `orchestrator` o `/sdd-status` |

## Agentes, delegación y aislamiento

- Perfiles canónicos: `.claude/agents/`.
- Skills canónicas: `.agents/skills/`; `.claude/skills/` contiene adaptadores.
- El contrato instalado mantiene **20 agentes** y **24 skills**; no se crean prompts o commands
  paralelos para representar una skill.
- `orchestrator` es la puerta de entrada por defecto.
- Solo `orchestrator`, `planner` e `implementer` delegan.
- Profundidad máxima: dos saltos de delegación.
- Los especialistas devuelven el control; nunca encadenan otro especialista.
- `orchestrator`, `code-reviewer`, `security-auditor` y `research-analyst` son auditores sin escritura.
- Los territorios se aplican donde el host lo permite y siempre se verifican en CI.
- Durante intake, solo `orchestrator` encadena `spec-analyst` → retorno → `ux-designer` →
  retorno → `spec-analyst`. Si el host no delega, indica perfil y comando exactos y reanuda
  leyendo los documentos durables del repositorio.

## Trazabilidad

- Con spec activa: `docs/specs/NNN-slug/execution-log.jsonl`.
- Sin spec: `.sdd/agent-audit.jsonl`.
- `observed`: solo si un hook vio realmente inicio y fin del subagente.
- `declared-direct`: el agente activo hizo el trabajo sin delegar.
- `unverified`: solo con motivo explícito.
- Los JSONL son append-only y no se editan a mano.

## Gates

El circuito pausa para aprobación humana en: (1) producto, casos, discrepancias y mapa de specs;
(2) arquitectura y stack, solo greenfield; (3) spec sin ambigüedades; (4) dirección visual y
diseño; (5) plan técnico; y (6) entrega final.

```text
node scripts/check-sdd.mjs
node scripts/test-hooks.mjs
node scripts/test-install.mjs   # solo en este repositorio de plantilla
```

Los checks de cada aplicación se declaran en `.sdd/checks.json` después de `/sdd-init` o
`/onboard`; nunca se presupone npm, Python, Java, Docker ni otro stack.

## HANDOFF obligatorio

```markdown
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
```
<!-- sdd:end -->
