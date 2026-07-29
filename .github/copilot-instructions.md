# Instrucciones para GitHub Copilot

Este repositorio se rige por **[`AGENTS.md`](../AGENTS.md)**. Léelo antes de responder:
contiene el circuito SDD, la arquitectura vigente, los principios SOLID/DRY/KISS/YAGNI,
los patrones permitidos, la política de TDD, los gates de calidad y las reglas de seguridad.

## Resumen operativo

1. **Sin spec no hay código.** Si la petición no tiene spec en `docs/specs/`, propón crearla
   antes de escribir nada (agente `spec-analyst`, prompt `/sdd-specify`).
2. **TDD estricto.** Test que falla primero, luego el código mínimo, luego refactor.
3. **Arquitectura vigente**: la que diga `docs/architecture/constitution.md`. No la cambies
   sin un ADR nuevo en `docs/architecture/adr/`.
4. **Dependencias hacia dentro.** El dominio no conoce la infraestructura.
5. **Seguridad**: consultas parametrizadas, validación en la frontera, cero secretos en el
   repo, autorización en servidor.
6. **Trazabilidad**: commits en Conventional Commits con el id de spec — `feat(042): ... — task T-042-07`.

## Agentes personalizados

Los agentes viven en `.github/agents/*.agent.md` (Copilot y VS Code) y en `.claude/agents/*.md`
(Claude Code y también VS Code). Selecciónalos desde el picker de agentes del chat.

Empieza por **`orchestrator`** si no sabes qué agente usar.

## Prompts reutilizables

En `.github/prompts/*.prompt.md`. Invócalos con `/nombre` en el chat.
El circuito SDD son: `/sdd-init`, `/sdd-specify`, `/sdd-clarify`, `/sdd-plan`,
`/sdd-tasks`, `/sdd-implement`, `/sdd-verify`, `/sdd-ship`.

## Instrucciones por tipo de fichero

En `.github/instructions/*.instructions.md`, con `applyTo` por glob. Se aplican
automáticamente según el fichero que estés tocando.
