# Tareas · 014-gates-propios-y-medicion

| Campo | Valor |
|---|---|
| **Spec** | [`spec.md`](./spec.md) · **Plan**: [`plan.md`](./plan.md) |
| **Total** | 7 tareas · S: 1 · M: 4 · L: 2 |
| **Progreso** | 7/7 |

## Trazabilidad

| Objetivo | PRD-RF | Caso de uso | RF | CA | Tarea | Test | Evidencia |
|---|---|---|---|---|---|---|---|
| OBJ-002 | PRD-RF-003 | UC-004 | RF-01 | CA-01 | T-014-01 | `scripts/test-hooks.mjs::la_cobertura_no_lee_fuera_del_repositorio` | `evidence.md#T-014-01` |
| OBJ-002 | PRD-RF-003 | UC-004 | RF-02 | CA-02 | T-014-02 | `scripts/test-install.mjs::los_gates_nuevos_no_invocan_shell` | `evidence.md#T-014-02` |
| OBJ-002 | PRD-RF-003 | UC-004 | RF-02 | CA-02 | T-014-03 | `scripts/test-install.mjs::el_fallo_de_cobertura_dice_que_falta` | `evidence.md#T-014-03` |
| OBJ-002 | PRD-RF-004 | UC-004 | RF-03 | CA-03 | T-014-04 | `scripts/test-install.mjs::el_sitio_publicado_pasa_su_propia_auditoria` | `evidence.md#T-014-04` |
| OBJ-003 | PRD-RF-006 | UC-001 | RF-05 | CA-05 | T-014-05 | `scripts/test-install.mjs::cada_ausencia_declara_su_clase` | `evidence.md#T-014-05` |
| OBJ-003 | PRD-RF-006 | UC-001 | RF-06 | CA-06 | T-014-06 | `scripts/test-install.mjs::un_motivo_caducado_falla` | `evidence.md#T-014-06` |
| OBJ-002 | PRD-RF-004 | UC-004 | RF-04, RF-07 | CA-04, CA-07 | T-014-07 | `scripts/test-install.mjs::el_peaje_rapido_sigue_siendo_rapido` | `evidence.md#T-014-07` |

## Orden de ejecución

`T-014-01` primero: sin lector de volcados no hay nada que medir. `T-014-02` y `T-014-03` se
apoyan en él y son la mitad de cobertura. `T-014-04` es independiente y podría ir en paralelo,
pero toca `scripts/test-install.mjs` como las anteriores, así que no lo es.

`T-014-05` y `T-014-06` son la mitad de honestidad y van después de que existan los gates
nuevos: reclasificar una ausencia que se acaba de cerrar exige que esté cerrada. `T-014-07`
cierra dando de alta los gates en `.sdd/checks.json` y aseverando que el peaje rápido no ha
engordado; es la última porque hasta entonces no hay nada que dar de alta.

Ninguna es paralelizable: seis de las siete tocan `scripts/test-install.mjs`.

### T-014-01 · Leer los volcados de cobertura de V8 sin salir del repositorio
- **Estado**: hecho
- **Terreno**: middle
- **Skill**: `/tdd`
- **Capa**: transversal
- **Cubre**: OBJ-002, PRD-RF-003, UC-004, RF-01, CA-01
- **Controles de seguridad**: SEC-COV-001
- **Controles de usabilidad**: ninguno
- **Documentación**: no aplica (la superficie documental la cierra T-014-05)
- **Test que la define**: `scripts/test-hooks.mjs::la_cobertura_no_lee_fuera_del_repositorio`
- **Depende de**: ninguna
- **Ficheros previstos**: `scripts/check-coverage.mjs`, `scripts/lib/manifiesto.mjs`, `scripts/test-hooks.mjs`
- **Definición de hecho**: una URL percent-encoded con espacios resuelve a su ruta real; una que apunta fuera del repositorio se descarta sin leerse; los desplazamientos se cuentan sobre la cadena y un fichero con tildes no desalinea
- **Evidencia prevista**: `evidence.md#T-014-01`
- **Estimación**: L
- **Paralelizable**: no

### T-014-02 · Calcular el porcentaje y contrastarlo contra el trinquete
- **Estado**: hecho
- **Terreno**: middle
- **Skill**: `/tdd`
- **Capa**: transversal
- **Cubre**: OBJ-002, PRD-RF-003, UC-004, RF-02, CA-02
- **Controles de seguridad**: SEC-COV-002
- **Controles de usabilidad**: ninguno
- **Documentación**: no aplica (la superficie documental la cierra T-014-05)
- **Test que la define**: `scripts/test-install.mjs::los_gates_nuevos_no_invocan_shell`
- **Depende de**: T-014-01
- **Ficheros previstos**: `scripts/check-coverage.mjs`, `.sdd/coverage.json`, `scripts/test-install.mjs`
- **Definición de hecho**: el umbral vive en `.sdd/coverage.json` con el valor medido y el margen; por debajo falla y por encima pasa; `--selftest` verifica el cálculo contra un caso construido; ningún gate nuevo interpola en shell
- **Evidencia prevista**: `evidence.md#T-014-02`
- **Estimación**: M
- **Paralelizable**: no

### T-014-03 · Decir qué falta cuando la cobertura no llega
- **Estado**: hecho
- **Terreno**: middle
- **Skill**: `/tdd`
- **Capa**: transversal
- **Cubre**: OBJ-002, PRD-RF-003, UC-004, RF-02, CA-02
- **Controles de seguridad**: ninguno
- **Controles de usabilidad**: UX-COPY-003
- **Documentación**: no aplica (la superficie documental la cierra T-014-05)
- **Test que la define**: `scripts/test-install.mjs::el_fallo_de_cobertura_dice_que_falta`
- **Depende de**: T-014-02
- **Ficheros previstos**: `scripts/check-coverage.mjs`, `scripts/test-install.mjs`
- **Definición de hecho**: el fallo nombra porcentaje medido, umbral vigente y los ficheros que más lo bajan; el mensaje contiene la salida, no solo el diagnóstico
- **Evidencia prevista**: `evidence.md#T-014-03`
- **Estimación**: S
- **Paralelizable**: no

### T-014-04 · Auditar las páginas publicadas
- **Estado**: hecho
- **Terreno**: front
- **Skill**: `/tdd`
- **Capa**: transversal
- **Cubre**: OBJ-002, PRD-RF-004, UC-004, RF-03, CA-03
- **Controles de seguridad**: ninguno
- **Controles de usabilidad**: UX-A11Y-002
- **Documentación**: no aplica (la superficie documental la cierra T-014-05)
- **Test que la define**: `scripts/test-install.mjs::el_sitio_publicado_pasa_su_propia_auditoria`
- **Depende de**: ninguna
- **Ficheros previstos**: `scripts/check-a11y.mjs`, `scripts/lib/manifiesto.mjs`, `scripts/test-install.mjs`
- **Definición de hecho**: falta de `lang`, de `title`, de `alt` informativo, de región principal, salto de nivel de encabezado y control sin nombre accesible producen hallazgo; las tres páginas del sitio pasan; `--selftest` verifica cada regla contra un HTML construido
- **Evidencia prevista**: `evidence.md#T-014-04`
- **Estimación**: L
- **Paralelizable**: no

### T-014-05 · Clasificar cada ausencia por su naturaleza
- **Estado**: hecho
- **Terreno**: middle
- **Skill**: `/tdd`
- **Capa**: transversal
- **Cubre**: OBJ-003, PRD-RF-006, UC-001, RF-05, CA-05
- **Controles de seguridad**: ninguno
- **Controles de usabilidad**: ninguno
- **Documentación**: DOC-QUALITY
- **Test que la define**: `scripts/test-install.mjs::cada_ausencia_declara_su_clase`
- **Depende de**: T-014-02, T-014-04
- **Ficheros previstos**: `docs/quality/TEST-STRATEGY.md`, `scripts/test-install.mjs`
- **Definición de hecho**: la tabla de §10 tiene columna `Clase`; una ausencia sin clase, con clase no admitida, o `se-ejecuta-en-otro-sitio` sin nombrar dónde, falla
- **Evidencia prevista**: `evidence.md#T-014-05`
- **Estimación**: M
- **Paralelizable**: no

### T-014-06 · Hacer que un motivo caducado falle
- **Estado**: hecho
- **Terreno**: middle
- **Skill**: `/tdd`
- **Capa**: transversal
- **Cubre**: OBJ-003, PRD-RF-006, UC-001, RF-06, CA-06
- **Controles de seguridad**: ninguno
- **Controles de usabilidad**: ninguno
- **Documentación**: no aplica (queda cubierta por T-014-05)
- **Test que la define**: `scripts/test-install.mjs::un_motivo_caducado_falla`
- **Depende de**: T-014-05
- **Ficheros previstos**: `scripts/test-install.mjs`, `docs/quality/TEST-STRATEGY.md`
- **Definición de hecho**: un motivo que afirme la inexistencia de una superficie presente en el árbol versionado falla nombrando los ficheros que lo desmienten; el caso real corregido en esta spec queda como caso de prueba
- **Evidencia prevista**: `evidence.md#T-014-06`
- **Estimación**: M
- **Paralelizable**: no

### T-014-07 · Dar de alta los gates sin engordar el peaje rápido
- **Estado**: hecho
- **Terreno**: middle
- **Skill**: `/tdd`
- **Capa**: transversal
- **Cubre**: OBJ-002, PRD-RF-004, UC-004, RF-04, RF-07, CA-04, CA-07
- **Controles de seguridad**: ninguno
- **Controles de usabilidad**: ninguno
- **Documentación**: no aplica (queda cubierta por T-014-05)
- **Test que la define**: `scripts/test-install.mjs::el_peaje_rapido_sigue_siendo_rapido`
- **Depende de**: T-014-02, T-014-04, T-014-05
- **Ficheros previstos**: `.sdd/checks.json`, `scripts/check-smells.mjs`, `.sdd/smells.json`, `package.json`, `scripts/lib/manifiesto.mjs`, `scripts/test-install.mjs`
- **Definición de hecho**: `coverage` y `a11y` son lentos, `smells` es rápido, los cuatro rápidos anteriores siguen siéndolo y ninguno de los nuevos aparece en la lista de rápidos salvo `smells`
- **Evidencia prevista**: `evidence.md#T-014-07`
- **Estimación**: M
- **Paralelizable**: no
