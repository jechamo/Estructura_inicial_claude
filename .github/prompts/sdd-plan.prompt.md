---
mode: planner
description: Convierte una spec aprobada en plan técnico, modelo de datos, contratos y backlog de tareas
---

Ejecuta las fases **plan** y **tasks** del circuito SDD sobre la spec: `${input:spec:¿Qué spec (NNN-slug)?}`

Sigue [`.claude/skills/sdd-plan/SKILL.md`](../../.claude/skills/sdd-plan/SKILL.md) y
[`.claude/skills/sdd-tasks/SKILL.md`](../../.claude/skills/sdd-tasks/SKILL.md).

**Puerta de entrada**: `spec.md` sin marcadores `[NEEDS CLARIFICATION]`. Si los hay, para y
pide `/sdd-clarify`.

Produce:
- `research.md` — decisiones técnicas con alternativas y coste; documentación **actual** verificada
- `data-model.md` — entidades, invariantes, migraciones, ER en mermaid
- `contracts/` — OpenAPI / GraphQL / AsyncAPI. **Contract-first**
- `test-plan.md` — niveles, casos límite, criterio de suficiencia
- `plan.md` — arquitectura aplicada, componentes, **patrones justificados**, seguridad,
  rendimiento, observabilidad, riesgos, plan de reversión
- `tasks.md` — tareas atómicas, ordenadas de dentro hacia fuera, cada una con su test y su
  trazabilidad a RF/CA

Si el plan viola `docs/architecture/constitution.md`, **para** y escala al `architect`.

Cierra con el bloque `### HANDOFF`.
