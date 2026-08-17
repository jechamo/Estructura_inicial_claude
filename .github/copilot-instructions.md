# Instrucciones para GitHub Copilot

Este repositorio se rige por **[`AGENTS.md`](../AGENTS.md)** y por el modelo completo en
[`docs/sdd/OPERATING-MODEL.md`](../docs/sdd/OPERATING-MODEL.md). Léelos antes de responder:
contienen el circuito SDD, principios, TDD, gates, seguridad, delegación y handoff.

## Resumen operativo

1. **Sin spec no hay código.** Si la petición no tiene spec en `docs/specs/`, propón crearla
   antes de escribir nada (agente `spec-analyst`, skill `/sdd-specify`).
   Si llega un PRD global, requisitos por ruta/URL o un diseño opcional, usa `/sdd-intake`
   primero; en greenfield el producto se aprueba antes de arquitectura.
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

Empieza por **`orchestrator`** si no sabes qué agente usar. El contrato mantiene 20 agentes;
durante intake solo el orquestador coordina `spec-analyst`, `ux-designer` y `spec-analyst`.

## Skills reutilizables

Las 26 skills canónicas viven en `.agents/skills/*/SKILL.md`. Invócalas con `/nombre` en el chat;
no crees `.github/prompts/` equivalentes porque aparecerían como comandos duplicados.
El circuito SDD son: `/sdd-intake`, `/sdd-init`, `/sdd-specify`, `/sdd-clarify`, `/sdd-design`, `/sdd-plan`,
`/sdd-tasks`, `/sdd-implement`, `/sdd-verify`, `/sdd-ship`.
`/sdd-design` se salta si la funcionalidad no tiene interfaz.

Si el host no completa una delegación, muestra el agente/comando exacto y reanuda leyendo
`docs/product/`, `docs/design/` o la spec indicada por el handoff; nunca desde memoria del chat.

Para implementar, entra por la skill del terreno de la tarea: **`/middle`** (dominio, casos de
uso, integraciones), **`/front`** (interfaz) o **`/bbdd`** (esquema, migraciones, consultas). Cada
uno lleva su puerta de entrada, su ciclo TDD y su lista de comprobación.

## Instrucciones por tipo de fichero

En `.github/instructions/*.instructions.md`, con `applyTo` por glob. Se aplican
automáticamente según el fichero que estés tocando.

| Fichero | Se aplica a |
|---|---|
| `domain.instructions.md` | Dominio y casos de uso |
| `tests.instructions.md` | Ficheros de test |
| `security.instructions.md` | Todo el código ejecutable |
| `usability.instructions.md` | Interfaz: `tsx`, `jsx`, `vue`, `svelte`, `astro`, `html`, `css`, `scss` |
