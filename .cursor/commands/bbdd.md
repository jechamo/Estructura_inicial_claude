Implementa una tarea de **base de datos** con migración reversible e índices justificados.

Procedimiento completo: [`.agents/skills/bbdd/SKILL.md`](../../.agents/skills/bbdd/SKILL.md)
Perfil del agente: [`.claude/agents/database-expert.md`](../../.claude/agents/database-expert.md)

**Puerta de entrada**: tarea con criterio, `data-model.md` con entidades e invariantes, y volumen y
patrón de acceso conocidos. Para "arregla la consulta lenta" necesitas el plan de ejecución actual
**medido**. Esta capa va **antes** que `/middle`.

Innegociables:

- **Toda migración es reversible o no se aplica.** Reversión escrita y **probada** antes de aplicar
  hacia adelante. Una migración, un cambio.
- Despliegue en caliente: **expandir → migrar → contraer**, en despliegues distintos. Renombrar una
  columna de golpe rompe la versión anterior en cuanto empieza el despliegue.
- **Integridad en la base**: `NOT NULL`, `UNIQUE`, `CHECK`, claves ajenas. La aplicación tiene
  bugs; la restricción no negocia.
- Índice para una consulta concreta, con `EXPLAIN ANALYZE` **antes y después** en `evidence.md`.
- Consultas parametrizadas. Busca el N+1. Paginación por cursor. Transacciones cortas.
- Dinero en decimal exacto, tiempo con zona, auditoría desde el principio.
- **RLS** en multi-tenant, probado con **dos** tenants. Menor privilegio: la app no hace DDL.
- Ningún dato personal real en desarrollo. Copias con restauración probada.

`DROP`, `TRUNCATE` y `DELETE` sin `WHERE` acotado **requieren confirmación humana explícita**.

Cierra con el bloque `### HANDOFF`.
