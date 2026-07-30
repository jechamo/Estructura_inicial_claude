---
mode: planner
description: Trocea el plan en tareas atómicas con test asociado y trazabilidad
---

Ejecuta la fase **tasks** sobre: `${input:spec:¿Qué spec (NNN-slug)?}`

Sigue [`.claude/skills/sdd-tasks/SKILL.md`](../../.claude/skills/sdd-tasks/SKILL.md).

Cada tarea lleva: estado · capa · qué `RF`/`CA` cubre · **el test que la define** ·
dependencias · ficheros previstos · definición de hecho · estimación.

Reglas del troceo:

- **Atómica**: una sesión, un concepto, idealmente un commit.
- **Toda tarea nace de un test.** Si no sabes nombrar el test, la tarea está mal cortada.
- Orden **de dentro hacia fuera**: `domain` → `application` → `infrastructure` → `interfaces`.
  Empezar por la pantalla o por la tabla lleva a diseñar el dominio para que encaje en el ORM.
- Marca `[P]` lo paralelizable (ficheros disjuntos).
- No olvides las transversales: migración de datos, contratos y regeneración de tipos,
  observabilidad, documentación, retirada del feature flag, entrada en bitácora.

Construye la tabla de trazabilidad `RF → CA → tareas` y comprueba que no queda hueco.

Cierra con el bloque `### HANDOFF`.
