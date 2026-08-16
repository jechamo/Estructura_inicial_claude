# Tareas · 011-automatizacion-determinista-tokens

| Campo | Valor |
|---|---|
| **Spec** | [`spec.md`](./spec.md) · **Plan**: [`plan.md`](./plan.md) |
| **Total** | 7 tareas · S: 1 · M: 5 · L: 1 |
| **Progreso** | 7/7 |

## Trazabilidad

| RF | CA | Tarea | Test | Evidencia |
|---|---|---|---|---|
| RF-01, RF-04 | CA-01, CA-04 | T-011-01, T-011-02 | `scripts/test-install.mjs::estado_y_gate_json_versionados` | `evidence.md#T-011-02` |
| RF-02, RF-03 | CA-02, CA-03 | T-011-01, T-011-03 | `scripts/test-install.mjs::scaffold_conservador_y_traza` | `evidence.md#T-011-03` |
| RF-05, RF-06 | CA-05, CA-06 | T-011-01, T-011-04 | `scripts/test-install.mjs::generadores_opt_in_y_drift`, `::generadores_sin_shell`, `::automatizacion_rutas_confinadas` | `evidence.md#T-011-04` |
| RF-07 | CA-06 | T-011-05, T-011-06 | `scripts/test-install.mjs::skills_consumen_snapshots`, `::automatizacion_documentada` | `evidence.md#T-011-06` |
| RF-08 | CA-07 | T-011-07 | benchmark `skill-creator` + `scripts/test-install.mjs::benchmark_tiene_calidad_y_umbral` | `evidence.md#T-011-07` |

### T-011-01 · Escribir tests RED
- **Estado**: hecho
- **Terreno**: test
- **Skill**: `/tdd`
- **Cubre**: RF-01…RF-08, CA-01…CA-07
- **Controles de seguridad**: SEC-AUTO-001, SEC-AUTO-002, SEC-AUTO-003
- **Controles de usabilidad**: no aplica (CLI)
- **Documentación**: no aplica
- **Test que la define**: `scripts/test-install.mjs::estado_y_gate_json_versionados`
- **Depende de**: ninguna
- **Ficheros previstos**: `scripts/test-install.mjs`
- **Definición de hecho**: fallos por comandos/contratos ausentes, no por fixture roto
- **Evidencia prevista**: `evidence.md#T-011-01`
- **Estimación**: M
- **Paralelizable**: no

### T-011-02 · Implementar status y check-sdd JSON
- **Estado**: hecho
- **Terreno**: tooling
- **Skill**: `/tdd`
- **Cubre**: RF-01, RF-04, CA-01, CA-04
- **Controles de seguridad**: no aplica (lectura confinada)
- **Controles de usabilidad**: no aplica (CLI)
- **Documentación**: DOC-AUTO
- **Test que la define**: `scripts/test-install.mjs::estado_y_gate_json_versionados`
- **Depende de**: T-011-01
- **Ficheros previstos**: `scripts/sdd-project.mjs`, `scripts/check-sdd.mjs`
- **Definición de hecho**: snapshots v1 estables y mismo exit code del gate
- **Evidencia prevista**: `evidence.md#T-011-02`
- **Estimación**: M
- **Paralelizable**: no

### T-011-03 · Implementar scaffold y trace-status
- **Estado**: hecho
- **Terreno**: tooling
- **Skill**: `/tdd`
- **Cubre**: RF-02, RF-03, CA-02, CA-03
- **Controles de seguridad**: SEC-AUTO-001 — `scripts/test-install.mjs::automatizacion_rutas_confinadas`
- **Controles de usabilidad**: no aplica (CLI)
- **Documentación**: DOC-AUTO
- **Test que la define**: `scripts/test-install.mjs::scaffold_conservador_y_traza`
- **Depende de**: T-011-01
- **Ficheros previstos**: `scripts/sdd-project.mjs`
- **Definición de hecho**: fases mecánicas, sin overwrite ni decisiones inventadas
- **Evidencia prevista**: `evidence.md#T-011-03`
- **Estimación**: M
- **Paralelizable**: no

### T-011-04 · Registrar y ejecutar generadores seguros
- **Estado**: hecho
- **Terreno**: tooling
- **Skill**: `/tdd`
- **Cubre**: RF-05, RF-06, CA-05, CA-06
- **Controles de seguridad**: SEC-AUTO-001 — `scripts/test-install.mjs::automatizacion_rutas_confinadas`; SEC-AUTO-002 — `scripts/test-install.mjs::generadores_sin_shell`; SEC-AUTO-003 — `scripts/test-install.mjs::generadores_opt_in_y_drift`
- **Controles de usabilidad**: no aplica (CLI)
- **Documentación**: DOC-GEN
- **Test que la define**: `scripts/test-install.mjs::generadores_opt_in_y_drift`
- **Depende de**: T-011-01
- **Ficheros previstos**: `.sdd/generators.json`, instalador, manifiesto, CLI
- **Definición de hecho**: opt-in, shell false, timeout acotado, rutas confinadas y resultado verificable
- **Evidencia prevista**: `evidence.md#T-011-04`
- **Estimación**: L
- **Paralelizable**: no

### T-011-05 · Reducir skills mediante progressive disclosure
- **Estado**: hecho
- **Terreno**: skills
- **Skill**: `/skill-creator`
- **Cubre**: RF-07, CA-06
- **Controles de seguridad**: no aplica (instrucciones)
- **Controles de usabilidad**: no aplica (router)
- **Documentación**: DOC-SKILLS
- **Test que la define**: `scripts/test-install.mjs::skills_consumen_snapshots`
- **Depende de**: T-011-02, T-011-03
- **Ficheros previstos**: skills canónicas y `references/`
- **Definición de hecho**: reglas críticas quedan en SKILL; detalle aplicable bajo references
- **Evidencia prevista**: `evidence.md#T-011-05`
- **Estimación**: M
- **Paralelizable**: no

### T-011-06 · Actualizar documentación portable
- **Estado**: hecho
- **Terreno**: docs
- **Skill**: `/docs-sync`
- **Cubre**: RF-06, RF-07, CA-06
- **Controles de seguridad**: no aplica (documentación pública)
- **Controles de usabilidad**: no aplica (guías)
- **Documentación**: DOC-AUTO, DOC-SKILLS, DOC-GEN
- **Test que la define**: `scripts/test-install.mjs::automatizacion_documentada`
- **Depende de**: T-011-04, T-011-05
- **Ficheros previstos**: README, guía de agentes, `.sdd/README.md`, docs index
- **Definición de hecho**: comandos, límites y versionado explicados sin asumir stack
- **Evidencia prevista**: `evidence.md#T-011-06`
- **Estimación**: S
- **Paralelizable**: no

### T-011-07 · Benchmark, verificación y descarte
- **Estado**: hecho
- **Terreno**: quality
- **Skill**: `/skill-creator`, `/sdd-verify`
- **Cubre**: RF-08, CA-07
- **Controles de seguridad**: SEC-AUTO-001…SEC-AUTO-003
- **Controles de usabilidad**: no aplica (evaluación CLI)
- **Documentación**: DOC-AUTO
- **Test que la define**: `scripts/test-install.mjs::benchmark_tiene_calidad_y_umbral`
- **Depende de**: T-011-05, T-011-06
- **Ficheros previstos**: workspace/evals del benchmark, `evidence.md`, informe de seguridad
- **Definición de hecho**: métricas antes/después; cambios sin umbral descartados; gates verdes
- **Evidencia prevista**: `evidence.md#T-011-07`
- **Estimación**: M
- **Paralelizable**: no
