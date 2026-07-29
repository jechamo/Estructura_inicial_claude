---
name: sdd-tasks
description: Trocea el plan en tareas atómicas y ordenadas, cada una con su test asociado y su trazabilidad a la spec.
disable-model-invocation: true
---

# /sdd-tasks — Trocear

Agente responsable: `@planner`.

## Puerta de entrada

`plan.md`, `data-model.md`, `contracts/` y `test-plan.md` existen y son coherentes con `spec.md`.

## Formato de tarea

```markdown
### T-NNN-XX · <título imperativo>
- Estado: pendiente
- Capa: domain | application | infrastructure | interfaces | test | infra | docs
- Cubre: RF-03, CA-05
- Test que la define: `tests/domain/order/place_order.test.ts::debe_rechazar_cuando_stock_insuficiente`
- Depende de: T-NNN-YY  (o "ninguna")
- Ficheros previstos: `src/domain/order/Order.ts`
- Definición de hecho: <condición observable y verificable>
- Estimación: S | M | L
- Paralelizable: [P] sí | no
```

## Reglas del troceo

1. **Atómica**: una sesión, un concepto, idealmente un commit. Si tarda más de medio día,
   pártela.
2. **Toda tarea de producto nace de un test.** Si no puedes nombrar el test que la define,
   la tarea está mal cortada o falta información del plan.
3. **Orden por dependencias, de dentro hacia fuera**:
   ```
   1. domain          entidades, value objects, puertos
   2. application     casos de uso
   3. infrastructure  adaptadores, repositorios, migraciones
   4. interfaces      controladores, UI
   5. transversal     observabilidad, documentación, limpieza de flags
   ```
   **Nunca** empieces por la pantalla ni por la tabla: empezar por fuera lleva a diseñar el
   dominio para encajar en la UI o en el ORM.
4. Marca `[P]` las tareas que tocan ficheros disjuntos y pueden ir en paralelo.
5. Incluye tareas que se olvidan siempre:
   - migración de datos existentes
   - actualización de contratos y regeneración de tipos
   - logs, métricas y trazas de los caminos nuevos
   - documentación de usuario o de API
   - eliminación del feature flag tras la estabilización
   - actualización de la bitácora

## Verificación de cobertura

Construye la tabla de trazabilidad y comprueba que **no queda hueco**:

| RF | CA | Tareas |
|---|---|---|
| RF-01 | CA-01, CA-02 | T-042-01, T-042-03 |

- [ ] Todo `RF` tiene al menos una tarea
- [ ] Todo `CA` tiene un test en alguna tarea
- [ ] Toda tarea apunta a un `RF` o es transversal justificada
- [ ] No hay tareas que la spec no pida

## Salida

Escribe `docs/specs/NNN-slug/tasks.md` con: resumen (total, por capa, estimación),
la tabla de trazabilidad, y las tareas en orden de ejecución.

## Cierre

```
### HANDOFF
- Agente origen: planner
- Fase completada: tasks
- Artefacto: docs/specs/NNN-slug/tasks.md
- Tareas: <n> (S:<n> M:<n> L:<n>) · paralelizables: <n>
- Cobertura: <n>/<n> RF · <n>/<n> CA
- Primera tarea a ejecutar: T-NNN-01
- Siguiente agente sugerido: implementer — comando: /sdd-implement
```
