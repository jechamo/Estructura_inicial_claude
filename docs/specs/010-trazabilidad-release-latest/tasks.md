# Tareas · 010-trazabilidad-release-latest

| Campo | Valor |
|---|---|
| **Spec** | [`spec.md`](./spec.md) · **Plan**: [`plan.md`](./plan.md) |
| **Total** | 5 tareas · S: 1 · M: 4 · L: 0 |
| **Progreso** | 4/5 |

## Trazabilidad

| RF | CA | Tarea | Test | Evidencia |
|---|---|---|---|---|
| RF-01, RF-02 | CA-01, CA-02 | T-010-01, T-010-02 | `scripts/test-hooks.mjs::spec_activa_respeta_estados`, `::spec_activa_respeta_directorio_configurado_sin_escapar`, `::spec_activa_ambigua_no_se_atribuye` | `evidence.md#T-010-02` |
| RF-03, RF-05 | CA-03, CA-05 | T-010-01, T-010-03 | `scripts/test-install.mjs::trace_correct_append_only_e_idempotente`, `::trace_correct_idempotencia_concurrente` | `evidence.md#T-010-03` |
| RF-04 | CA-04 | T-010-03 | `scripts/test-install.mjs::trace_correct_rechaza_entrada_hostil` | `evidence.md#T-010-03` |
| RF-06 | CA-06 | T-010-04 | `scripts/test-install.mjs::instalacion_main_movil_y_tag_estable` | `evidence.md#T-010-04` |
| RF-07 | CA-07 | T-010-05 | `scripts/test-install.mjs::release_rechaza_tag_existente_o_ci_rojo` | `evidence.md#T-010-05` |

### T-010-01 · Escribir los tests RED
- **Estado**: hecho
- **Terreno**: test
- **Skill**: `/tdd`
- **Capa**: test
- **Cubre**: RF-01…RF-05, CA-01…CA-05
- **Controles de seguridad**: SEC-TRACE-001, SEC-TRACE-002, SEC-TRACE-003 (tests RED definidos en esta tarea)
- **Controles de usabilidad**: no aplica (tests de CLI sin interfaz)
- **Documentación**: no aplica (prueba primero)
- **Test que la define**: `scripts/test-hooks.mjs::spec_activa_respeta_estados`; `scripts/test-install.mjs::trace_correct_append_only_e_idempotente`
- **Depende de**: ninguna
- **Ficheros previstos**: `scripts/test-hooks.mjs`, `scripts/test-install.mjs`
- **Definición de hecho**: fallan por comportamiento ausente, no por fixture roto
- **Evidencia prevista**: `evidence.md#T-010-01`
- **Estimación**: M
- **Paralelizable**: no

### T-010-02 · Corregir la resolución de spec activa
- **Estado**: hecho
- **Terreno**: tooling
- **Skill**: `/tdd`
- **Capa**: hooks
- **Cubre**: RF-01, RF-02, CA-01, CA-02
- **Controles de seguridad**: no aplica (lectura de rutas internas enumeradas)
- **Controles de usabilidad**: no aplica (sin interfaz)
- **Documentación**: DOC-TRACE
- **Test que la define**: `scripts/test-hooks.mjs::spec_activa_respeta_estados`, `::spec_activa_respeta_directorio_configurado_sin_escapar`, `::spec_activa_ambigua_no_se_atribuye`
- **Depende de**: T-010-01
- **Ficheros previstos**: `.sdd/hooks/_lib.mjs`, hooks consumidores
- **Definición de hecho**: solo una spec inequívocamente abierta recibe eventos
- **Evidencia prevista**: `evidence.md#T-010-02`
- **Estimación**: M
- **Paralelizable**: no

### T-010-03 · Implementar trace-correct seguro e idempotente
- **Estado**: hecho
- **Terreno**: tooling
- **Skill**: `/tdd`
- **Capa**: CLI
- **Cubre**: RF-03…RF-05, CA-03…CA-05
- **Controles de seguridad**: SEC-TRACE-001 — `scripts/test-install.mjs::trace_correct_seguridad_rutas_hooks_y_lock`; SEC-TRACE-002 — `scripts/test-install.mjs::trace_correct_append_only_e_idempotente`; SEC-TRACE-003 — `scripts/test-install.mjs::trace_correct_seguridad_rutas_hooks_y_lock`
- **Controles de usabilidad**: no aplica (sin interfaz)
- **Documentación**: DOC-TRACE
- **Test que la define**: `scripts/test-install.mjs::trace_correct_append_only_e_idempotente`, `::trace_correct_idempotencia_concurrente`, `::trace_correct_rechaza_entrada_hostil`, `::trace_correct_reanuda_fallo_parcial`
- **Depende de**: T-010-01
- **Ficheros previstos**: `scripts/sdd-project.mjs`
- **Definición de hecho**: rectifica sin borrar y rechaza toda entrada inválida antes de escribir
- **Evidencia prevista**: `evidence.md#T-010-03`
- **Estimación**: M
- **Paralelizable**: no

### T-010-04 · Documentar main móvil, tag estable y trazabilidad
- **Estado**: hecho
- **Terreno**: docs
- **Skill**: `/docs-sync`
- **Capa**: documentación
- **Cubre**: RF-06, CA-06
- **Controles de seguridad**: no aplica (documentación pública sin secretos)
- **Controles de usabilidad**: no aplica (guía CLI)
- **Documentación**: DOC-VCS, DOC-TRACE
- **Test que la define**: `scripts/test-install.mjs::instalacion_main_movil_y_tag_estable`
- **Depende de**: T-010-02, T-010-03
- **Ficheros previstos**: `README.md`, `docs/guides/INSTALACION.md`, `.sdd/{README.md,hooks/README.md}`
- **Definición de hecho**: ambas vías se explican sin llamar estable a `main`
- **Evidencia prevista**: `evidence.md#T-010-04`
- **Estimación**: S
- **Paralelizable**: no

### T-010-05 · Rectificar historia, cerrar 009 y publicar v0.6.0
- **Estado**: en curso
- **Terreno**: release
- **Skill**: `/sdd-ship`
- **Capa**: entrega
- **Cubre**: RF-07, CA-07
- **Controles de seguridad**: SEC-RELEASE-001 — `scripts/test-install.mjs::release_rechaza_tag_existente_o_ci_rojo`
- **Controles de usabilidad**: no aplica (release de plantilla sin UI)
- **Documentación**: DOC-OPS
- **Test que la define**: `scripts/test-install.mjs::release_rechaza_tag_existente_o_ci_rojo`; gates completos, informe de usabilidad 009, informe de seguridad 010 y CI
- **Depende de**: T-010-04
- **Ficheros previstos**: specs 009/010, informes, CHANGELOG, bitácora y logs append-only
- **Definición de hecho**: main y origin/main limpios; CI verde; tag nuevo apunta al HEAD
- **Evidencia prevista**: `evidence.md#T-010-05`
- **Estimación**: M
- **Paralelizable**: no
