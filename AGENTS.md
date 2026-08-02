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
2. Circuito: specify → clarify → design cuando haya UI → plan → tasks → implement → verify → ship.
3. Implementación con TDD: RED demostrado → GREEN mínimo → REFACTOR con la suite verde.
4. No se modifican artefactos de una fase anterior sin avisar y registrar la decisión.
5. Toda tarea terminada enlaza spec, criterio, tarea, test y evidencia ejecutada.
6. “Pasa” sin ejecución real no es un resultado; “no ejecutado” sí, con riesgo y siguiente paso.
7. Nunca se leen, copian ni escriben secretos, `.env`, credenciales o configuración local.
8. No se usa `git push --force`, no se toca producción y no se borra contexto ajeno.

## Entrada por situación

| Situación | Entrada |
|---|---|
| Proyecto nuevo | `/sdd-init` |
| Repositorio existente sin documentar | `/onboard` |
| Nueva funcionalidad | `/sdd-specify` |
| Implementación de tarea | `/sdd-implement` → `/middle`, `/front` o `/bbdd` |
| Validación | `/sdd-verify` |
| Entrega | `/sdd-ship` |
| Duda sobre la fase | `orchestrator` o `/sdd-status` |

## Agentes, delegación y aislamiento

- Perfiles canónicos: `.claude/agents/`.
- Skills canónicas: `.agents/skills/`; `.claude/skills/` contiene adaptadores.
- `orchestrator` es la puerta de entrada por defecto.
- Solo `orchestrator`, `planner` e `implementer` delegan.
- Profundidad máxima: dos saltos de delegación.
- Los especialistas devuelven el control; nunca encadenan otro especialista.
- `orchestrator`, `code-reviewer`, `security-auditor` y `research-analyst` son auditores sin escritura.
- Los territorios se aplican donde el host lo permite y siempre se verifican en CI.

## Trazabilidad

- Con spec activa: `docs/specs/NNN-slug/execution-log.jsonl`.
- Sin spec: `.sdd/agent-audit.jsonl`.
- `observed`: solo si un hook vio realmente inicio y fin del subagente.
- `declared-direct`: el agente activo hizo el trabajo sin delegar.
- `unverified`: solo con motivo explícito.
- Los JSONL son append-only y no se editan a mano.

## Gates

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
- Artefactos:
- Decisiones tomadas:
- Bloqueos / supuestos:
- Siguiente agente sugerido:
- Contexto que necesita:
```
<!-- sdd:end -->
