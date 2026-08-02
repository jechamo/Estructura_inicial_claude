---
mode: spec-analyst
description: Crea la especificación de una funcionalidad nueva (requisitos EARS + criterios de aceptación testables)
---

Ejecuta la fase **specify** del circuito SDD sobre: `${input:funcionalidad:¿Qué funcionalidad hay que especificar?}`

Sigue el procedimiento completo de [`.agents/skills/sdd-specify/SKILL.md`](../../.agents/skills/sdd-specify/SKILL.md)
y las reglas de [`AGENTS.md`](../../AGENTS.md) §2.

Resumen:
1. Siguiente número libre en `docs/specs/`; crea `docs/specs/NNN-slug/` desde `_TEMPLATE`.
2. Escribe `spec.md` con: problema · objetivo medible · usuarios · requisitos funcionales en
   **EARS** · requisitos no funcionales · criterios de aceptación en **Gherkin** · casos límite ·
   reglas de negocio · **fuera de alcance** · riesgos · supuestos · glosario.
3. **Cero tecnología**: nada de tablas, endpoints, frameworks ni nombres de clase.
4. Lo que no sepas y cambie el resultado → `[NEEDS CLARIFICATION: ...]`. No inventes.
5. Autorrevisión: cada RF con al menos un CA; cada CA automatizable.

Cierra con el bloque `### HANDOFF`.
