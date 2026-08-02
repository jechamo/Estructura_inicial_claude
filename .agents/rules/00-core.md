# Reglas del proyecto (Antigravity)

Activación: **Always On**.

La entrada es @AGENTS.md y la política completa está en @docs/sdd/OPERATING-MODEL.md. La arquitectura vigente está en
@docs/architecture/constitution.md. Léelas antes de actuar.

## Reglas duras

1. **Sin spec aprobada no se escribe código.** Specs en `docs/specs/NNN-slug/`.
   Circuito SDD: init → specify → clarify → plan → tasks → implement → verify → ship.
   Cada fase produce un fichero que la siguiente lee.
2. **TDD**: test rojo primero (demuéstralo fallando), código mínimo, refactor.
3. **Dependencias hacia dentro**: `domain → application → infrastructure`. Nunca al revés.
4. **SOLID, DRY, KISS, YAGNI.** No implementes nada que no esté en la spec.
5. **Patrones de diseño** solo cuando el problema aparece; justifícalo en `plan.md`.
6. **Seguridad**: validación en frontera, consultas parametrizadas, cero secretos,
   autorización en servidor, sin PII en logs.
7. **Bitácora**: toda decisión relevante se registra en `docs/bitacora/DECISIONS.md`;
   si es estructural, además un ADR en `docs/architecture/adr/`.
8. **Handoff**: al terminar una fase, cierra con el bloque `### HANDOFF` (ver AGENTS.md §10).
9. **Trazabilidad**: commits Conventional Commits con id de spec y de tarea.

## Roles disponibles

Los perfiles completos de los agentes están en `.claude/agents/*.md`. Cuando necesites un
especialista, adopta su perfil leyendo ese fichero: `architect`, `spec-analyst`, `planner`,
`implementer`, `test-engineer`, `frontend-expert`, `backend-expert`, `database-expert`,
`security-auditor`, `code-reviewer`, `refactor-specialist`, `ux-designer`, `devops-expert`,
`performance-optimizer`, `api-designer`, `docs-writer`, `bitacora-keeper`,
`research-analyst`, `release-manager`.

Los flujos paso a paso están en `.agents/workflows/`.

## Prohibido

- Código sin test previo. Lógica de negocio en UI o controladores.
- Dependencias nuevas sin justificar. Saltarse fases del circuito SDD.
- `git push --force`, tocar producción o secretos sin permiso explícito.
- Declarar terminado sin ejecutar los tests y mostrar la salida real.
