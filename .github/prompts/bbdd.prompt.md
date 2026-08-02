---
mode: database-expert
description: Implementa una tarea de base de datos con migración reversible e índices justificados
---

Implementa la tarea de **base de datos**: `${input:tarea:¿Qué tarea? (p. ej. T-042-01)}`

Procedimiento completo: [`.agents/skills/bbdd/SKILL.md`](../../.agents/skills/bbdd/SKILL.md)
Perfil del agente: [`.claude/agents/database-expert.md`](../../.claude/agents/database-expert.md)

**Puerta de entrada**: la tarea existe con su criterio, `data-model.md` define entidades e
invariantes, y conoces volumen y patrón de acceso. Si la tarea es "arregla la consulta lenta",
necesitas el plan de ejecución actual **medido**.

Esta capa **va antes** que `/middle`. Si el backend ya escribe contra un esquema que no existe, el
orden está mal: avisa.

No negociable:

- **Toda migración es reversible o no se aplica.** Reversión escrita y **probada** antes de
  aplicar hacia adelante. Una migración, un cambio.
- Cambio con despliegue en caliente: **expandir → migrar → contraer**, en despliegues distintos.
  Renombrar una columna de golpe rompe la versión anterior en cuanto empieza el despliegue.
- **Integridad en la base**, no solo en la aplicación: `NOT NULL`, `UNIQUE`, `CHECK`, claves ajenas.
  Toda invariante de `data-model.md` que se pueda declarar, se declara.
- Índice **para una consulta concreta**, justificado con `EXPLAIN ANALYZE` **antes y después**,
  pegado en `evidence.md`. Sin plan, "es más rápido" no vale.
- Consultas parametrizadas siempre. Busca el N+1 explícitamente. Paginación por cursor.
- Dinero en decimal exacto, tiempo con zona. Auditoría (`created_at`, `updated_at`, quién) desde
  el principio.
- **RLS** donde haya multi-tenant, probado **con dos tenants**, no supuesto. Menor privilegio: la
  cuenta de la aplicación no hace DDL.
- Ningún dato personal real en desarrollo. Copias con **restauración probada**.

Operaciones destructivas (`DROP`, `TRUNCATE`, `DELETE` sin `WHERE` acotado): **requieren
confirmación humana explícita**. No busques la vuelta a los hooks.

Cierra con el bloque `### HANDOFF`.
