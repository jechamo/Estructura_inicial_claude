# Tareas · 013-verificacion-independiente-del-host

| Campo | Valor |
|---|---|
| **Spec** | [`spec.md`](./spec.md) · **Plan**: [`plan.md`](./plan.md) |
| **Total** | 7 tareas · S: 1 · M: 6 · L: 0 |
| **Progreso** | 7/7 |

## Trazabilidad

| Objetivo | PRD-RF | Caso de uso | RF | CA | Tarea | Test | Evidencia |
|---|---|---|---|---|---|---|---|
| OBJ-001 | PRD-RF-001 | UC-003 | RF-01 | CA-01 | T-013-01 | `scripts/test-hooks.mjs::la_normalizacion_de_ruta_no_elude_el_territorio` | `evidence.md#T-013-01` |
| OBJ-001 | PRD-RF-001 | UC-003 | RF-02 | CA-02 | T-013-02 | `scripts/test-hooks.mjs::un_reparto_corrupto_no_degrada_a_permitir` | `evidence.md#T-013-02` |
| OBJ-003 | PRD-RF-006 | UC-001 | RF-03 | CA-03 | T-013-03 | `scripts/test-hooks.mjs::el_rechazo_por_territorio_dice_quien_que_y_de_quien` | `evidence.md#T-013-03` |
| OBJ-002 | PRD-RF-003 | UC-004 | RF-04 | CA-04 | T-013-04 | `scripts/test-install.mjs::el_trailer_no_suplanta_ni_inyecta` | `evidence.md#T-013-04` |
| OBJ-002 | PRD-RF-003 | UC-004 | RF-05 | CA-05 | T-013-05 | `scripts/test-install.mjs::el_fallo_de_auditoria_ensena_como_arreglarlo` | `evidence.md#T-013-05` |
| OBJ-002 | PRD-RF-003 | UC-004 | RF-06 | CA-06 | T-013-06 | `scripts/test-hooks.mjs::la_autoria_no_escribe_fuera_del_repositorio` | `evidence.md#T-013-06` |
| OBJ-001 | PRD-RF-001 | UC-003 | RF-07 | CA-07 | T-013-07 | `scripts/test-install.mjs::el_repositorio_declara_modo_restrictivo` | `evidence.md#T-013-07` |

## Orden de ejecución

`T-013-01` primero: extraer la regla es la condición para todo lo demás. `T-013-02` y `T-013-03`
se apoyan en ella. `T-013-04` y `T-013-05` forman la segunda mitad y no dependen de la primera
salvo por el reparto, que ya está verificado. `T-013-06` es independiente. `T-013-07` cierra:
cambiar el modo del repositorio solo tiene sentido cuando la regla ya está probada.

Ninguna es paralelizable: `T-013-01`, `T-013-02` y `T-013-03` tocan `scripts/test-hooks.mjs`, y
`T-013-04`, `T-013-05` y `T-013-07` tocan `scripts/test-install.mjs`.

### T-013-01 · Extraer la decisión de territorio a una función pura verificable
- **Estado**: hecho
- **Terreno**: middle
- **Skill**: `/tdd`
- **Capa**: transversal
- **Cubre**: OBJ-001, PRD-RF-001, UC-003, RF-01, CA-01
- **Controles de seguridad**: SEC-TERR-001
- **Controles de usabilidad**: ninguno
- **Documentación**: no aplica (cambio interno sin superficie para lectores)
- **Test que la define**: `scripts/test-hooks.mjs::la_normalizacion_de_ruta_no_elude_el_territorio`
- **Depende de**: ninguna
- **Ficheros previstos**: `.sdd/hooks/territorios.mjs`, `.sdd/hooks/guard-write.mjs`, `scripts/test-hooks.mjs`
- **Definición de hecho**: la tabla de casos cubre agente dueño, agente ajeno, ruta sin dueño y los cuatro modos; `guard-write.mjs` importa la función y no conserva copia de la regla
- **Evidencia prevista**: `evidence.md#T-013-01`
- **Estimación**: M
- **Paralelizable**: no

### T-013-02 · Verificar la integridad del reparto en check-sdd
- **Estado**: hecho
- **Terreno**: middle
- **Skill**: `/tdd`
- **Capa**: transversal
- **Cubre**: OBJ-001, PRD-RF-001, UC-003, RF-02, CA-02
- **Controles de seguridad**: SEC-TERR-002
- **Controles de usabilidad**: ninguno
- **Documentación**: no aplica (la superficie documental la cierra T-013-05)
- **Test que la define**: `scripts/test-hooks.mjs::un_reparto_corrupto_no_degrada_a_permitir`
- **Depende de**: T-013-01
- **Ficheros previstos**: `scripts/check-sdd.mjs`, `.sdd/territories.json`, `scripts/test-hooks.mjs`
- **Definición de hecho**: agente inexistente, ruta que no resuelve, solape y modo desconocido producen error; los agentes sin territorio quedan clasificados como auditores o de aplicación
- **Evidencia prevista**: `evidence.md#T-013-02`
- **Estimación**: M
- **Paralelizable**: no

### T-013-03 · Declarar las carencias de los seis entornos, incluido el que no tiene hooks
- **Estado**: hecho
- **Terreno**: middle
- **Skill**: `/tdd`
- **Capa**: transversal
- **Cubre**: OBJ-003, PRD-RF-006, UC-001, RF-03, CA-03
- **Controles de seguridad**: ninguno
- **Controles de usabilidad**: UX-COPY-001
- **Documentación**: DOC-HOSTS
- **Test que la define**: `scripts/test-hooks.mjs::el_rechazo_por_territorio_dice_quien_que_y_de_quien`
- **Depende de**: T-013-01
- **Ficheros previstos**: `scripts/test-hooks.mjs`, `docs/integrations/IDE-COMPATIBILITY.md`
- **Definición de hecho**: los seis entornos figuran con su capacidad de pre-escritura y de ciclo de vida de subagente; retirar la declaración de Gemini hace fallar la suite
- **Evidencia prevista**: `evidence.md#T-013-03`
- **Estimación**: M
- **Paralelizable**: no

### T-013-04 · Corroborar los trailers de commit contra tareas, agentes y territorios
- **Estado**: hecho
- **Terreno**: middle
- **Skill**: `/tdd`
- **Capa**: transversal
- **Cubre**: OBJ-002, PRD-RF-003, UC-004, RF-04, CA-04
- **Controles de seguridad**: SEC-TRACE-001
- **Controles de usabilidad**: ninguno
- **Documentación**: no aplica (la superficie documental la cierra T-013-05)
- **Test que la define**: `scripts/test-install.mjs::el_trailer_no_suplanta_ni_inyecta`
- **Depende de**: T-013-02
- **Ficheros previstos**: `scripts/check-sdd.mjs`, `scripts/test-install.mjs`
- **Definición de hecho**: sobre un repositorio de prueba, un commit conforme pasa y los tres casos hostiles fallan con mensajes distintos; un commit sin trailers se reporta como no auditable
- **Evidencia prevista**: `evidence.md#T-013-04`
- **Estimación**: M
- **Paralelizable**: no

### T-013-05 · Exigir excepción material fuera de territorio y documentar el tercer estado
- **Estado**: hecho
- **Terreno**: middle
- **Skill**: `/tdd`
- **Capa**: transversal
- **Cubre**: OBJ-002, PRD-RF-003, UC-004, RF-05, CA-05
- **Controles de seguridad**: ninguno
- **Controles de usabilidad**: UX-COPY-002
- **Documentación**: DOC-TRACE
- **Test que la define**: `scripts/test-install.mjs::el_fallo_de_auditoria_ensena_como_arreglarlo`
- **Depende de**: T-013-04
- **Ficheros previstos**: `scripts/check-sdd.mjs`, `scripts/test-install.mjs`, `docs/sdd/OPERATING-MODEL.md`
- **Definición de hecho**: un motivo vacío o de relleno se rechaza; el mensaje de fallo contiene el trailer exacto que falta; el modelo operativo describe `declared-corroborated` y su límite
- **Evidencia prevista**: `evidence.md#T-013-05`
- **Estimación**: M
- **Paralelizable**: no

### T-013-06 · Registrar la autoría desde la pre-escritura, no desde el ciclo de subagente
- **Estado**: hecho
- **Terreno**: middle
- **Skill**: `/tdd`
- **Capa**: transversal
- **Cubre**: OBJ-002, PRD-RF-003, UC-004, RF-06, CA-06
- **Controles de seguridad**: SEC-TRACE-002
- **Controles de usabilidad**: ninguno
- **Documentación**: no aplica (la superficie documental la cierra T-013-05)
- **Test que la define**: `scripts/test-hooks.mjs::la_autoria_no_escribe_fuera_del_repositorio`
- **Depende de**: T-013-01
- **Ficheros previstos**: `.sdd/hooks/guard-write.mjs`, `.sdd/hooks/subagent-log.mjs`, `scripts/test-hooks.mjs`
- **Definición de hecho**: la autoría de fichero (`observed-write`) la emite la guarda de escritura, que corre en cinco de los seis entornos, y no el ciclo de subagente, que corre en dos; veinte escrituras de la misma pareja agente-fichero producen una entrada; otro fichero u otro agente producen otra; una escritura bloqueada no deja autoría; una spec con ruta hostil no escribe fuera del repositorio
- **Evidencia prevista**: `evidence.md#T-013-06`
- **Estimación**: M
- **Paralelizable**: no

### T-013-07 · Pasar este repositorio a modo restrictivo sin cambiar el de la plantilla
- **Estado**: hecho
- **Terreno**: middle
- **Skill**: `/tdd`
- **Capa**: transversal
- **Cubre**: OBJ-001, PRD-RF-001, UC-003, RF-07, CA-07
- **Controles de seguridad**: ninguno
- **Controles de usabilidad**: ninguno
- **Documentación**: no aplica (queda cubierto por DOC-TRACE en T-013-05)
- **Test que la define**: `scripts/test-install.mjs::el_repositorio_declara_modo_restrictivo`
- **Depende de**: T-013-01, T-013-02, T-013-03
- **Ficheros previstos**: `.sdd/territories.json`, `scripts/test-install.mjs`
- **Definición de hecho**: este repositorio declara `deny`, una instalación nueva declara `audit`, y el escape `SDD_GATES=off` sigue funcionando en ambos
- **Evidencia prevista**: `evidence.md#T-013-07`
- **Estimación**: S
- **Paralelizable**: no
