# Clarificaciones · 016-cobertura-ssrf-egress

Registro de las ambigüedades resueltas con el usuario. Cada respuesta quedó incorporada en
`spec.md`.

---

## Ronda 1 — 2026-08-21

### P1 · Encaje en el mapa de producto

**Marcador origen**: `spec.md` §0 y §13

**Trazabilidad afectada**: `FEAT-003` + `FEAT-002` → `OBJ-001/002` →
`PRD-RF-001/004` → `UC-003/004` → `RF-01 a RF-08, RF-10 a RF-12` →
`CA-01 a CA-08, CA-10 a CA-12`

**Fuentes / discrepancias**: `SRC-001`, `SRC-002`, `SRC-003` · `DISC-016-01`

**Opciones planteadas**:

- a) Tratar SSRF/egress como endurecimiento de `FEAT-003`, con apoyo de `FEAT-002`, sin modificar
  el baseline — consecuencia: conserva los IDs aprobados y no inventa un nuevo corte de usuario.
- b) Volver a `/sdd-intake` para crear y aprobar un corte nuevo — consecuencia: reabre el gate de
  producto antes de continuar la spec.

**Recomendación del agente**: a), porque amplía una cobertura de seguridad existente y no crea una
capacidad de usuario independiente.

**Respuesta**: opción a).

**Decidido por**: usuario.

**Evidencia de confirmación**: respuesta literal del usuario: “aprobado continua”. La respuesta
aprueba conjuntamente las tres recomendaciones previamente expuestas.

**Impacto en la spec**: `DISC-016-01` queda resuelta; se conserva el encaje en `FEAT-003` y el
apoyo de `FEAT-002`; no se modifica `FEATURE-MAP.md` ni otro artefacto de producto.

### P2 · Aplicabilidad del contrato

**Marcador origen**: `spec.md` §4 y §13

**Trazabilidad afectada**: `OBJ-001/002` → `PRD-RF-001/004` → `UC-003/004` →
`RF-01 a RF-08, RF-10 a RF-12` → `CA-01 a CA-08, CA-10 a CA-12`

**Fuentes / discrepancias**: `SRC-001`, `SRC-002`, `SRC-003` · ninguna adicional

**Opciones planteadas**:

- a) Aplicar el contrato a toda petición saliente y permitir `no aplica` solo con justificación
  material por control — consecuencia: reduce falsos negativos por influencias indirectas.
- b) Aplicarlo solo cuando el destino pueda estar influido por datos no confiables — consecuencia:
  reduce el coste de revisión, pero puede omitir rutas de influencia no evidentes.

**Recomendación del agente**: a), porque la aplicabilidad amplia hace visible cada descarte y evita
que la ausencia de análisis se confunda con seguridad.

**Respuesta**: opción a).

**Decidido por**: usuario.

**Evidencia de confirmación**: respuesta literal del usuario: “aprobado continua”.

**Impacto en la spec**: el contrato se aplica a toda petición saliente; RN-08 y los casos límite
exigen justificación material para cada control declarado `no aplica`.

### P3 · Política de destinos internos y metadatos

**Marcador origen**: `spec.md` §6 y §13

**Trazabilidad afectada**: `OBJ-001` → `PRD-RF-001` → `UC-003` → `RF-05/RF-12` →
`CA-05/CA-12`

**Fuentes / discrepancias**: `SRC-001`, `SRC-002` · ninguna adicional

**Opciones planteadas**:

- a) Bloquear siempre metadatos de infraestructura y permitir otros destinos internos solo
  mediante excepción documentada con responsable, alcance y evidencia — consecuencia: protege el
  destino más sensible sin impedir integraciones internas justificadas.
- b) Permitir excepción documentada en todas las categorías — consecuencia: ofrece más
  flexibilidad, incluido el acceso a metadatos.
- c) Bloquear todos los destinos internos sin excepción — consecuencia: máxima restricción, pero
  puede impedir integraciones internas legítimas.

**Recomendación del agente**: a), porque mantiene una negación fuerte para metadatos y exige
responsabilidad verificable en las demás excepciones.

**Respuesta**: opción a).

**Decidido por**: usuario.

**Evidencia de confirmación**: respuesta literal del usuario: “aprobado continua”.

**Impacto en la spec**: RF-05/CA-05 exigen bloqueo incondicional de metadatos; RF-12/CA-12 exigen
responsable, alcance y evidencia para excepciones sobre otros destinos internos. También se
actualizan reglas de negocio, riesgos y fuera de alcance.

---

## Resumen de cambios de alcance

| Ronda | Qué se amplió | Qué se sacó del alcance |
|---|---|---|
| 1 | El contrato cubre toda petición saliente; se separan el bloqueo de metadatos y las excepciones documentadas para otros destinos internos | Excepciones para metadatos de infraestructura; creación de un corte de producto nuevo |

---

## Estado

- Marcadores iniciales: 3
- Resueltos: 3
- **Pendientes: 0**

## Gate humano de clarificaciones

| Campo | Valor |
|---|---|
| Estado | `approved` |
| Persona | Jesus Chamorro (usuario) |
| Fecha | 2026-08-21 |
| Alcance | Las tres recomendaciones de P1, P2 y P3 |
| Evidencia de confirmación | “aprobado continua” |
| Discrepancias abiertas | 0 |

Este gate alimenta el gate aprobado de `spec.md`; no lo sustituye.
