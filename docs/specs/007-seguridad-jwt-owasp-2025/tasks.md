# Tareas · 007-seguridad-jwt-owasp-2025

| Campo | Valor |
|---|---|
| **Spec** | [`spec.md`](./spec.md) · **Plan**: [`plan.md`](./plan.md) |
| **Total** | 8 tareas · S: 1 · M: 5 · L: 2 |
| **Progreso** | 8/8 |

## Trazabilidad

| RF | CA | Tarea | Test / evidencia esperada |
|---|---|---|---|
| RF-01, RF-04, RF-05 | CA-01, CA-03, CA-04 | T-007-01, T-007-02 | regresiones documentales en `test-install` |
| RF-02, RF-03 | CA-02 | T-007-01, T-007-03 | fixtures de matriz completa/incompleta |
| RF-06, RF-07 | CA-05 | T-007-01, T-007-05 | `check-sdd` e informe parseable |
| RF-08, RF-09 | CA-06 | T-007-04 | `test-hooks` + paridad de handoff |
| RF-10, RF-12 | CA-07 | T-007-06 | greenfield/brownfield/idempotencia |
| RF-11 | CA-08 | T-007-06 | workflow instalado y acciones fijadas |
| todos | todos | T-007-07, T-007-08 | suites completas, auditorías e informes |

## Orden de ejecución

### T-007-01 · Escribir regresiones de seguridad en rojo
- **Estado**: hecho
- **Terreno**: test
- **Skill**: `/tdd`
- **Cubre**: RF-01…RF-12 · CA-01…CA-08
- **Controles de seguridad**: SEC-STD-001, SEC-TRACE-001, SEC-JWT-001, SEC-CSRF-001, SEC-GATE-001, SEC-SUPPLY-001
- **Test que la define**: `scripts/test-install.mjs::seguridad_versionada`; `scripts/test-install.mjs::matriz_seguridad`; `scripts/test-install.mjs::gate_security_e_informe`; `scripts/test-hooks.mjs::auth_feature_vs_auditoria`
- **Depende de**: ninguna
- **Ficheros previstos**: `scripts/test-install.mjs`, `scripts/test-hooks.mjs`
- **Definición de hecho**: las pruebas fallan por controles aún ausentes, no por fixture roto
- **Evidencia prevista**: `evidence.md#T-007-01`
- **Estimación**: L
- **Paralelizable**: no

### T-007-02 · Actualizar doctrina OWASP, JWT y CSRF
- **Estado**: hecho
- **Terreno**: docs
- **Skill**: documentación guiada por el HANDOFF de `/security-scan`
- **Cubre**: RF-01, RF-04, RF-05 · CA-01, CA-03, CA-04
- **Controles de seguridad**: SEC-STD-001, SEC-JWT-001, SEC-CSRF-001
- **Test que la define**: `scripts/test-install.mjs::seguridad_versionada`; `scripts/test-install.mjs::contrato_jwt`; `scripts/test-install.mjs::csrf_no_samesite_solo`
- **Depende de**: T-007-01
- **Ficheros previstos**: `docs/security/`, `docs/sdd/OPERATING-MODEL.md`, `docs/architecture/constitution.md`
- **Definición de hecho**: referencias versionadas, JWT condicional completo y CSRF correcto
- **Evidencia prevista**: `evidence.md#T-007-02`
- **Estimación**: M
- **Paralelizable**: sí

### T-007-03 · Llevar controles a plan, tareas, tests y evidencia
- **Estado**: hecho
- **Terreno**: contrato
- **Skill**: `/sdd-plan`
- **Cubre**: RF-02, RF-03 · CA-02
- **Controles de seguridad**: SEC-TRACE-001
- **Test que la define**: `scripts/test-install.mjs::matriz_seguridad`
- **Depende de**: T-007-01
- **Ficheros previstos**: plantillas de spec y skills SDD
- **Definición de hecho**: todo control aplicable enlaza decisión, tarea, test y evidencia
- **Evidencia prevista**: `evidence.md#T-007-03`
- **Estimación**: M
- **Paralelizable**: sí

### T-007-04 · Corregir enrutado, auditor y handoff multihost
- **Estado**: hecho
- **Terreno**: contrato
- **Skill**: `/tdd`; el `security-auditor` solo revisa y devuelve HANDOFF
- **Cubre**: RF-08, RF-09 · CA-06
- **Controles de seguridad**: SEC-TRACE-001
- **Test que la define**: `scripts/test-hooks.mjs::auth_feature_vs_auditoria`
- **Depende de**: T-007-01
- **Ficheros previstos**: router, perfil canónico y adaptadores mínimos
- **Definición de hecho**: fase correcta, auditor read-only y HANDOFF material
- **Evidencia prevista**: `evidence.md#T-007-04`
- **Estimación**: M
- **Paralelizable**: sí

### T-007-05 · Implementar gate e informe de seguridad deterministas
- **Estado**: hecho
- **Terreno**: tooling
- **Skill**: `/tdd`
- **Cubre**: RF-06, RF-07 · CA-05
- **Controles de seguridad**: SEC-GATE-001
- **Test que la define**: `scripts/test-install.mjs::gate_security_e_informe`
- **Depende de**: T-007-01, T-007-03
- **Ficheros previstos**: `check-sdd.mjs`, `sdd-project.mjs`, `.sdd/checks.json`
- **Definición de hecho**: `GO` inválido falla y `detect` no inventa comandos
- **Evidencia prevista**: `evidence.md#T-007-05`
- **Estimación**: L
- **Paralelizable**: no

### T-007-06 · Propagar por instalador, CI e IDE
- **Estado**: hecho
- **Terreno**: tooling
- **Skill**: `/tdd`
- **Cubre**: RF-10, RF-11, RF-12 · CA-07, CA-08
- **Controles de seguridad**: SEC-SUPPLY-001
- **Test que la define**: `scripts/test-install.mjs::portabilidad_seguridad`; `scripts/test-install.mjs::workflow_supply_chain`
- **Depende de**: T-007-02, T-007-03, T-007-04, T-007-05
- **Ficheros previstos**: paquete, manifiesto, workflow, docs de compatibilidad
- **Definición de hecho**: virgin/brownfield/idempotencia y paridad 20/25 sin duplicados
- **Evidencia prevista**: `evidence.md#T-007-06`
- **Estimación**: M
- **Paralelizable**: no

### T-007-07 · Actualizar documentación pública y bitácora
- **Estado**: hecho
- **Terreno**: docs
- **Skill**: — (documentación transversal)
- **Cubre**: RF-01, RF-10 · CA-01, CA-07
- **Controles de seguridad**: SEC-STD-001
- **Test que la define**: `node scripts/check-sdd.mjs`
- **Depende de**: T-007-06
- **Ficheros previstos**: guías, README/CHANGELOG, bitácora
- **Definición de hecho**: una sola fuente de verdad y rutas resolubles
- **Evidencia prevista**: `evidence.md#T-007-07`
- **Estimación**: S
- **Paralelizable**: no

### T-007-08 · Ejecutar gates, auditorías y cerrar evidencia
- **Estado**: hecho
- **Terreno**: test
- **Skill**: `/security-scan` en solo lectura; `implementer` materializa la evidencia
- **Cubre**: todos · CA-01…CA-08
- **Controles de seguridad**: todos los de `plan.md` §9
- **Test que la define**: suites completas + `check-sdd --strict --spec 007`
- **Depende de**: T-007-07
- **Ficheros previstos**: `evidence.md`, informes de calidad/seguridad
- **Definición de hecho**: todos los gates verdes; entrega permanece `NO-GO` hasta decisión humana
- **Evidencia prevista**: `evidence.md#T-007-08`
- **Estimación**: M
- **Paralelizable**: no

### HANDOFF
- Agente origen: planner
- Fase completada: tasks
- Artefacto: `docs/specs/007-seguridad-jwt-owasp-2025/tasks.md`
- Tareas: 8 (S:1 M:5 L:2) · paralelizables: 3
- Cobertura: 12/12 RF · 8/8 CA
- Terrenos / skills: test, docs, contrato y tooling; `/tdd`, `/security-scan`, `/sdd-plan`
- Primera tarea a ejecutar: T-007-01
- Siguiente agente sugerido: implementer — comando: `/sdd-implement`
