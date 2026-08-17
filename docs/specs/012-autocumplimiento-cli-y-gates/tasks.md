# Tareas · 012-autocumplimiento-cli-y-gates

| Campo | Valor |
|---|---|
| **Spec** | [`spec.md`](./spec.md) · **Plan**: [`plan.md`](./plan.md) |
| **Total** | 6 tareas · S: 2 · M: 4 · L: 0 |
| **Progreso** | 6/6 |

## Trazabilidad

| RF | CA | Tarea | Test | Evidencia |
|---|---|---|---|---|
| RF-01, RF-03 | CA-01, CA-03 | T-012-01, T-012-02 | `scripts/test-install.mjs::cli_degrada_sin_estado_instalado` | `evidence.md#T-012-02` |
| RF-02 | CA-02 | T-012-01, T-012-03 | `scripts/test-install.mjs::cli_error_json_es_maquina_legible` | `evidence.md#T-012-03` |
| RF-04 | CA-04 | T-012-01, T-012-04 | `scripts/test-install.mjs::cli_ayuda_explica_comandos` | `evidence.md#T-012-04` |
| RF-05 | CA-05 | T-012-01, T-012-05 | `scripts/test-install.mjs::gates_declarados_son_ejecutables` | `evidence.md#T-012-05` |
| RF-06 | CA-06 | T-012-06 | `scripts/test-install.mjs::gates_no_configurados_tienen_motivo` | `evidence.md#T-012-06` |

## Orden de ejecución

`T-012-01` primero (RED). Luego `T-012-02`, `T-012-03` y `T-012-04` sobre el mismo fichero, en
serie para no pisarse. `T-012-05` y `T-012-06` cierran el gate y su justificación.

### T-012-01 · Escribir los tests RED del contrato del CLI
- **Estado**: hecho
- **Terreno**: test
- **Skill**: `/tdd`
- **Capa**: transversal
- **Cubre**: RF-01…RF-06, CA-01…CA-06
- **Controles de seguridad**: SEC-CLI-001, SEC-CLI-002, SEC-CLI-003
- **Controles de usabilidad**: UX-COPY-001, UX-COPY-002
- **Documentación**: no aplica (los tests no son artefacto documental)
- **Test que la define**: `scripts/test-install.mjs::cli_degrada_sin_estado_instalado`
- **Depende de**: ninguna
- **Ficheros previstos**: `scripts/test-install.mjs`
- **Definición de hecho**: los casos fallan por capacidad ausente del CLI, no por fixture roto
- **Evidencia prevista**: `evidence.md#T-012-01`
- **Estimación**: M
- **Paralelizable**: no

### T-012-02 · Degradar el CLI cuando no hay instalación registrada
- **Estado**: hecho
- **Terreno**: tooling
- **Skill**: `/tdd`
- **Capa**: infrastructure
- **Cubre**: RF-01, RF-03, CA-01, CA-03
- **Controles de seguridad**: SEC-CLI-001 — `scripts/test-install.mjs::cli_degrada_sin_estado_instalado`
- **Controles de usabilidad**: no aplica (no cambia microcopy)
- **Documentación**: DOC-CLI
- **Test que la define**: `scripts/test-install.mjs::cli_degrada_sin_estado_instalado`
- **Depende de**: T-012-01
- **Ficheros previstos**: `scripts/sdd-project.mjs`
- **Definición de hecho**: `product-status`, `docs-status` y `approve-product` funcionan sin `.sdd/installed.json` y un JSON corrupto sigue fallando
- **Evidencia prevista**: `evidence.md#T-012-02`
- **Estimación**: M
- **Paralelizable**: no

### T-012-03 · Emitir errores JSON cuando se pidió JSON
- **Estado**: hecho
- **Terreno**: tooling
- **Skill**: `/tdd`
- **Capa**: interfaces
- **Cubre**: RF-02, CA-02
- **Controles de seguridad**: SEC-CLI-002 — `scripts/test-install.mjs::cli_error_json_es_maquina_legible`
- **Controles de usabilidad**: UX-COPY-002 — `scripts/test-install.mjs::cli_error_json_es_maquina_legible`
- **Documentación**: DOC-CLI
- **Test que la define**: `scripts/test-install.mjs::cli_error_json_es_maquina_legible`
- **Depende de**: T-012-02
- **Ficheros previstos**: `scripts/sdd-project.mjs`
- **Definición de hecho**: `stderr` contiene una línea JSON con `ok:false`, exit 1, y sin `--json` el texto humano no cambia
- **Evidencia prevista**: `evidence.md#T-012-03`
- **Estimación**: S
- **Paralelizable**: no

### T-012-04 · Publicar la ayuda del CLI
- **Estado**: hecho
- **Terreno**: tooling
- **Skill**: `/tdd`
- **Capa**: interfaces
- **Cubre**: RF-04, CA-04
- **Controles de seguridad**: no aplica (solo imprime texto estático)
- **Controles de usabilidad**: UX-COPY-001 — `scripts/test-install.mjs::cli_ayuda_explica_comandos`
- **Documentación**: DOC-CLI
- **Test que la define**: `scripts/test-install.mjs::cli_ayuda_explica_comandos`
- **Depende de**: T-012-03
- **Ficheros previstos**: `scripts/sdd-project.mjs`
- **Definición de hecho**: `--help`, `-h` y `help` salen con 0 y nombran todos los subcomandos; la invocación desnuda sigue dando `status`
- **Evidencia prevista**: `evidence.md#T-012-04`
- **Estimación**: S
- **Paralelizable**: no

### T-012-05 · Declarar gates propios ejecutables
- **Estado**: hecho
- **Terreno**: tooling
- **Skill**: `/tdd`
- **Capa**: transversal
- **Cubre**: RF-05, CA-05
- **Controles de seguridad**: SEC-CLI-003 — `scripts/test-install.mjs::gates_declarados_son_ejecutables`
- **Controles de usabilidad**: no aplica (configuración, sin superficie)
- **Documentación**: DOC-CLI
- **Test que la define**: `scripts/test-install.mjs::gates_declarados_son_ejecutables`
- **Depende de**: T-012-01
- **Ficheros previstos**: `scripts/check-syntax.mjs`, `.sdd/checks.json`, `package.json`
- **Definición de hecho**: `run --fast` ejecuta `sdd`, `lint`, `test` y `build` en verde y `security` sigue lento y obligatorio
- **Evidencia prevista**: `evidence.md#T-012-05`
- **Estimación**: M
- **Paralelizable**: no

### T-012-06 · Justificar por escrito cada gate no configurado
- **Estado**: hecho
- **Terreno**: docs
- **Skill**: `/tdd`
- **Capa**: transversal
- **Cubre**: RF-06, CA-06
- **Controles de seguridad**: no aplica (documentación)
- **Controles de usabilidad**: no aplica (documentación)
- **Documentación**: DOC-CLI
- **Test que la define**: `scripts/test-install.mjs::gates_no_configurados_tienen_motivo`
- **Depende de**: T-012-05
- **Ficheros previstos**: `docs/quality/TEST-STRATEGY.md`
- **Definición de hecho**: cada identificador de `unconfigured` aparece con motivo material y ninguno está a la vez configurado
- **Evidencia prevista**: `evidence.md#T-012-06`
- **Estimación**: M
- **Paralelizable**: no
