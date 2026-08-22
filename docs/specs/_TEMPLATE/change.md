# NNN · <título del cambio compacto>

| Campo | Valor |
|---|---|
| **ID** | `NNN-slug` |
| **Nivel** | `compact` |
| **Estado** | borrador \| aprobado \| hecho |
| **Autor** | |
| **Fecha** | YYYY-MM-DD |
| **Change-Group** | `<identificador compartido por todos los commits de este pedido>` |

> Este documento **sustituye a los cinco** de una spec completa: `spec.md`, `plan.md`, `tasks.md`,
> `test-plan.md` y `evidence.md`. Sustituye al **expediente**, no a la verificación.
>
> **Lo que NO dispensa:** ningún gate; el ciclo TDD completo cuando cambia comportamiento —hay un
> test rojo antes del código, y su salida real se pega aquí—; la entrada en la bitácora si la
> decisión merece recordarse; los trailers; las guardas de escritura y los territorios; y la
> revisión independiente de alguien que no lo escribió.

---

## 1. Comportamiento esperado

<Qué hace distinto el sistema después de este cambio. Una frase por comportamiento.>

## 2. Rutas previstas

Antes de tocar nada:

```bash
node scripts/check-sdd.mjs --circuit-status --planned <ruta>... --json
```

| Ruta | Módulo | Nivel que devuelve |
|---|---|---|
| `<ruta>` | `<módulo declarado en .sdd/circuit.json>` | `compact` |

Si durante la implementación aparece una ruta que no está aquí, **para**: el cambio ya no es el que
se aprobó. Se escala al circuito completo; nunca se degrada solo.

## 3. Impactos

| Impacto | Valor |
|---|---|
| **Seguridad** | `no-sensible · <motivo material>` — si es `sensible`, esto no cabe en compacto: escala a `full` |
| **Usabilidad** | `aplicable · <controles>` \| `sin-ui · <motivo material>` |
| **Documentación** | `aplicable · DOC-...` \| `no-aplica · <motivo material>` |

## 4. Criterios de aceptación · **máximo 3**

| Id | Criterio observable | Test que lo fija |
|---|---|---|
| CA-01 | `<qué se puede comprobar desde fuera>` | `<ruta::caso>` |

Si necesitas un cuarto, el cambio no es compacto. Vuelve a `/sdd-specify`.

## 5. Enfoque

<Cómo, en tres o cuatro líneas. Si necesita un diagrama, no es un cambio compacto.>

## 6. Tareas · **máximo 3**

| Id | Tarea | Test asociado | Estado |
|---|---|---|---|
| T-NNN-01 | `<imperativo>` | `<ruta::caso>` | pendiente |

## 7. Límites

| Límite | Declarado | Real |
|---|---:|---:|
| Criterios | 3 | `<n>` |
| Tareas | 3 | `<n>` |
| Módulos | 1 | `<n>` |
| Tamaño de este documento | 12 KB | `<n>` |

Los límites se acumulan por `Change-Group`: si entre todos los commits del mismo pedido se superan,
la auditoría exige circuito completo. Trocear no es una forma de caber.

## 8. Aprobación

- [ ] Aprobado por: ______________ · fecha: __________

Tras la aprobación, las secciones 1 a 7 son la intención acordada. Cambiarlas obliga a aprobar de
nuevo o a escalar; a partir de aquí solo se añade evidencia.

## 9. Evidencia

| Fecha | Tarea | Comando ejecutado | Resultado | Artefacto |
|---|---|---|---|---|
| YYYY-MM-DD | T-NNN-01 | `<comando>` | 🔴 `<salida real del fallo>` | |
| YYYY-MM-DD | T-NNN-01 | `<comando>` | 🟢 `<salida real>` | |
| YYYY-MM-DD | — | `node scripts/sdd-project.mjs run --fast --summary-json` | `<resumen y runId>` | |

**Revisión independiente**: `<quién, en solo lectura>` · veredicto `<apto / no apto>`.

**Controles no ejecutados**: `<ninguno / cuál, con riesgo, dueño y siguiente paso>`. «No ejecutado»
es un resultado; «pasa» sin ejecución, no.

## 10. Commit

```text
<tipo>(<ámbito>): <qué cambia>

Circuit: compact
Circuit-reason: <por qué este cambio no necesita las cinco piezas de una spec>
Change-Group: <identificador>
Agent: implementer
```
