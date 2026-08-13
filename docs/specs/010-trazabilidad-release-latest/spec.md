# 010 · Trazabilidad fiable y release móvil/estable

| Campo | Valor |
|---|---|
| **ID** | `010-trazabilidad-release-latest` |
| **Estado** | aprobada · implementación completa; release pendiente de CI |
| **Autor** | usuario + `spec-analyst` (`declared-direct`) |
| **Fecha** | 2026-08-13 |
| **Rama** | `main` — entrega directa solicitada por el usuario |
| **Depende de** | `008-documentacion-viva-portable`, `009-usabilidad-integrada` |
| **Impacto de seguridad** | `sensible` |
| **Impacto de usabilidad** | `sin-ui · cambia CLI, hooks, trazabilidad y documentación; no existe interfaz gráfica` |
| **Impacto de documentación** | `aplicable · DOC-VCS, DOC-TRACE, DOC-OPS` |

> Capacidad interna de la plantilla: no crea requisitos de producto ficticios.

## 1. Problema

El hook de auditoría solo reconoce `- Estado: hecho`, pero las tareas actuales usan también
`- **Estado**: hecho`. Como resultado selecciona specs ya entregadas y atribuye a ellas eventos
posteriores. Además, la guía presenta únicamente un tag todavía inexistente y no explica que la
referencia Git puede omitirse para obtener la última `main`.

## 2. Objetivo

Seleccionar una spec activa solo cuando tenga tareas realmente abiertas, rectificar atribuciones
históricas sin reescribir logs append-only y publicar `v0.6.0` con una vía móvil y otra reproducible.

## 3. Requisitos

| Id | Requisito EARS | Prioridad |
|---|---|---:|
| RF-01 | CUANDO el hook inspeccione tareas, DEBE reconocer estados plain y Markdown en negrita dentro de bloques `T-*`. | M |
| RF-02 | CUANDO exista exactamente una spec con tarea `pendiente` o `en curso`, DEBE atribuirle el evento; SI hay cero o varias, DEBE usar la auditoría general y declarar el motivo. | M |
| RF-03 | CUANDO se rectifique una sesión, el CLI DEBE conservar el evento original y añadir una corrección durable a origen, destino y bitácora. | M |
| RF-04 | SI IDs, sesión, motivo o rutas son hostiles o inconsistentes, el CLI DEBE fallar antes de escribir. | M |
| RF-05 | CUANDO se repita la misma rectificación, incluso desde procesos concurrentes, el resultado DEBE ser byte-idempotente. | S |
| RF-06 | CUANDO se consulte la instalación, la documentación DEBE distinguir `main` móvil de un tag estable inmutable. | S |
| RF-07 | CUANDO se publique `v0.6.0`, DEBE incluir 008 y 009 cerradas, gates verdes y un tag nuevo que no se mueva. | M |

## 4. Criterios de aceptación

### CA-01 · Estados interpretados correctamente

Specs cerradas con estado plain o bold no se seleccionan; una tarea pendiente o en curso sí.

### CA-02 · Ambigüedad honesta

`_TEMPLATE`, carpetas sin tareas y specs cerradas se ignoran. Cero specs abiertas produce
`sin-spec-activa`; varias producen `spec-activa-ambigua`, ambos en `.sdd/agent-audit.jsonl`.

### CA-03 · Rectificación append-only

`trace-correct` conserva los eventos originales, añade `trace-correction` al origen,
`trace-attribution` al destino y una línea legible a la sesión mensual.

### CA-04 · Entrada hostil rechazada

Traversal, IDs no resolubles, origen igual a destino, sesión ausente y motivo vacío no escriben.

### CA-05 · Idempotencia

Repetir una rectificación idéntica, secuencial o concurrentemente, no cambia ningún byte ni
duplica la bitácora.

### CA-06 · Instalación móvil y estable

README y guía muestran sin `#ref` la última `main` y con `#v0.6.0` una versión reproducible.

### CA-07 · Release coherente

009 queda entregada con tareas, pruebas, informe de usabilidad y evidencia material; 010 queda
entregada con informe de seguridad, gates y CI verdes antes de crear el tag.

## 5. Casos límite

- Estado bold, plain, mayúsculas y espacios.
- Tarea sin estado, carpeta `_TEMPLATE` y spec sin `tasks.md`.
- Dos specs con tareas abiertas.
- Directorio de specs configurado mediante `SDD_SPECS_DIR`, incluido un override con traversal.
- Sesión presente varias veces y rectificación repetida.
- Dos procesos ejecutando simultáneamente la misma rectificación.
- ID con `../`, ruta absoluta, bytes NUL o spec inexistente.
- Tag ya existente o CI rojo.

## 6. Fuera de alcance

- Reescribir o borrar eventos históricos.
- Elegir una spec por orden lexicográfico cuando existe ambigüedad.
- Publicar en npm registry o crear un alias `latest` externo.
- Mover un tag ya publicado.

## 7. Gate humano de especificación

| Campo | Valor |
|---|---|
| **Estado** | `approved` |
| **Aprobado por** | usuario |
| **Fecha** | 2026-08-13 |
| **Alcance de la decisión** | plan completo solicitado: latest main, trazabilidad append-only, cierre 009 y tag v0.6.0 |
| **Condiciones** | no etiquetar con gates o CI en rojo |

### HANDOFF
- Agente origen: spec-analyst
- Fase completada: specify
- Fuentes consultadas: plan explícitamente aprobado y estado real de `main`
- Artefactos: `docs/specs/010-trazabilidad-release-latest/spec.md`
- Requisitos / casos cubiertos: RF-01…RF-07 · CA-01…CA-07
- Discrepancias: la 009 está fusionada pero sus artefactos siguen en borrador/NO-GO
- Decisiones tomadas: rectificación append-only; ambigüedad cae a auditoría general
- Supuestos: el tag será nuevo e inmutable
- Bloqueos: ninguno para implementar; release condicionada a gates y CI
- Siguiente agente sugerido: planner
- Comando / contexto durable: `/sdd-plan docs/specs/010-trazabilidad-release-latest/spec.md`
