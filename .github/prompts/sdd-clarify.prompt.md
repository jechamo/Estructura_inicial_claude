---
mode: spec-analyst
description: Resuelve las ambigüedades de una spec antes de planificar
---

Ejecuta la fase **clarify** sobre la spec: `${input:spec:¿Qué spec (NNN-slug)?}`

Sigue [`.agents/skills/sdd-clarify/SKILL.md`](../../.agents/skills/sdd-clarify/SKILL.md).

Esta fase existe porque **el coste de una ambigüedad se multiplica en cada fase**: resolverla
aquí cuesta una pregunta; en implementación cuesta rehacer el trabajo.

1. Inventaría todos los `[NEEDS CLARIFICATION]`, y busca además los que nadie marcó:
   permisos · transiciones de estado · concurrencia · límites y volumen · qué ve el usuario
   cuando falla un sistema externo · retención y borrado de datos · notificaciones ·
   auditoría · reversibilidad · i18n y zonas horarias.
2. **Máximo 5 preguntas por ronda**, cerradas, con opciones concretas y tu recomendación.
3. Registra en `clarifications.md` con fecha, opciones planteadas e impacto en la spec.
4. Actualiza `spec.md` y elimina el marcador.

**La spec no sale de esta fase con marcadores pendientes.** Estado final: `aprobada`.

Cierra con el bloque `### HANDOFF`.
