# Tareas · 017-circuito-proporcional-contexto

| Campo | Valor |
|---|---|
| **Spec / plan** | [`spec.md`](./spec.md) · [`plan.md`](./plan.md) |
| **Total** | 6 tareas · M: 5 · L: 1 |
| **Progreso** | 6/6 |

## Trazabilidad

| OBJ | PRD-RF | UC | RF | CA | Tarea | Test / evidencia |
|---|---|---|---|---|---|---|
| OBJ-004 | PRD-RF-007 | UC-005 | RF-01 | CA-01 | T-017-01 | `scripts/test-circuit.mjs` |
| OBJ-002 | PRD-RF-003, PRD-RF-004 | UC-002, UC-004 | RF-04 | CA-02 | T-017-02 | `scripts/test-trace-audit.mjs` |
| OBJ-004 | PRD-RF-008 | UC-005 | RF-02/03 | CA-03/04 | T-017-03 | context + summary tests |
| OBJ-004 | PRD-RF-008 | UC-005 | RF-05 | CA-05 | T-017-04 | install/docs/benchmark |
| OBJ-002 | PRD-RF-003, PRD-RF-004 | UC-004 | RF-01–05 | CA-01–05 | T-017-05 | gates y auditorías |
| OBJ-002 | PRD-RF-003 | UC-004 | RF-06 | CA-06 | T-017-06 | `scripts/test-release-gates.mjs` + hooks/install |

## Orden de ejecución

### T-017-01 · Implementa la frontera proporcional y su aprobación
- **Estado**: hecho
- **Terreno**: tooling
- **Skill**: `/tdd`
- **Capa**: contrato y aplicación
- **Cubre**: OBJ-004, PRD-RF-007, UC-005, RF-01, CA-01
- **Controles de seguridad**: SEC-CIRCUIT-001, SEC-CIRCUIT-002, SEC-CIRCUIT-005
- **Usabilidad**: no aplica; CLI sin interfaz visual
- **Documentación**: DOC-CIRCUITO
- **Test**: `scripts/test-circuit.mjs::rechaza_rutas_ambiguas_y_enlaces`; `scripts/test-circuit.mjs::rechaza_hash_obsoleto_o_aprobacion_de_agente`; `scripts/test-circuit.mjs::eleva_impacto_sensible_y_tipo_no_regular`
- **Test que la define**: `scripts/test-circuit.mjs`
- **Ficheros previstos**: `scripts/lib/circuito.mjs`, `scripts/sdd-project.mjs`, `scripts/check-sdd.mjs`, `.sdd/circuit.json`
- **DoD**: tres niveles, path portable, suelo ejecutable, catálogo sensible y aprobación sellada pasan RED/GREEN/REFACTOR
- **Depende de**: ninguna · **Estimación**: L · **Paralelizable**: no

### T-017-02 · Endurece la auditoría y la activación atómica
- **Estado**: hecho
- **Terreno**: tooling/infra
- **Skill**: `/tdd`
- **Capa**: infraestructura
- **Cubre**: OBJ-002, OBJ-004, PRD-RF-003, PRD-RF-004, PRD-RF-007, UC-002, UC-004, UC-005, RF-01, RF-04, CA-01, CA-02
- **Controles de seguridad**: SEC-CIRCUIT-003, SEC-CIRCUIT-004, SEC-CIRCUIT-006
- **Usabilidad**: no aplica; gate de repositorio
- **Documentación**: DOC-GATES
- **Test**: `scripts/test-trace-audit.mjs::bloquea_commit_nuevo_sin_trailers`; `scripts/test-trace-audit.mjs::impide_legitimacion_retroactiva_e_invasion`; `scripts/test-trace-audit.mjs::agrega_grupos_por_modulo_en_ventana`
- **Test que la define**: `scripts/test-trace-audit.mjs`
- **Ficheros previstos**: `scripts/lib/trace-audit.mjs`, `scripts/check-sdd.mjs`, runner, hooks y workflows
- **DoD**: baseline, padre, trailers, sello, rutas exactas, territorio y ventana histórica bloquean o avisan según contrato
- **Depende de**: T-017-01 · **Estimación**: M · **Paralelizable**: no

### T-017-03 · Recorta contexto y resume evidencia con límites
- **Estado**: hecho
- **Terreno**: tooling
- **Skill**: `/tdd`
- **Capa**: aplicación
- **Cubre**: OBJ-004, PRD-RF-008, UC-005, RF-02, RF-03, CA-03, CA-04
- **Controles de seguridad**: SEC-CONTEXT-001, SEC-EVIDENCE-001, SEC-EVIDENCE-002
- **Usabilidad**: no aplica; salida CLI legible por máquina
- **Documentación**: DOC-CIRCUITO, DOC-GATES
- **Test**: `scripts/test-context.mjs::ignora_instrucciones_y_falla_ante_estructura_invalida`; `scripts/test-gate-summary.mjs::redacta_todos_los_canales_antes_de_persistir`; `scripts/test-gate-summary.mjs::acota_tiempo_y_salida`
- **Test que la define**: `scripts/test-context.mjs`, `scripts/test-gate-summary.mjs`
- **Ficheros previstos**: `scripts/sdd-project.mjs`, modelo operativo y estado local
- **DoD**: contexto fail-closed y resumen redactado/acotado pasan límites n-1/n/n+1
- **Depende de**: T-017-02 · **Estimación**: M · **Paralelizable**: no

### T-017-04 · Distribuye y documenta el contrato medido
- **Estado**: hecho
- **Terreno**: docs/tooling
- **Skill**: `/docs-sync update --spec 017`
- **Capa**: transversal
- **Cubre**: OBJ-002, OBJ-004, PRD-RF-004, PRD-RF-008, UC-004, UC-005, RF-05, CA-05
- **Controles de seguridad**: los diez SEC se documentan sin reinterpretarlos
- **Usabilidad**: no aplica; Pages conserva su gate a11y existente
- **Documentación**: DOC-CIRCUITO, DOC-GATES, DOC-TFM, DOC-PAGES
- **Test**: instalación, skills-sync, site-prep, a11y y `docs/quality/benchmarks/017/run-benchmark.mjs`
- **Test que la define**: `docs/quality/benchmarks/017/run-benchmark.mjs`
- **Ficheros previstos**: manifiesto, skills/hosts, docs, TFM, `site/`, `.sdd/docs.json`, versión
- **DoD**: seis hosts e instalación sincronizados; benchmark alcanza umbrales o bloquea publicación
- **Depende de**: T-017-03 · **Estimación**: M · **Paralelizable**: no

### T-017-05 · Verifica la entrega sensible
- **Estado**: hecho
- **Terreno**: test/docs
- **Skill**: `/sdd-verify`, `/security-scan verify`
- **Capa**: transversal
- **Cubre**: RF-01–05, CA-01–05
- **Controles de seguridad**: SEC-CIRCUIT-001, SEC-CIRCUIT-002, SEC-CIRCUIT-003, SEC-CIRCUIT-004, SEC-CIRCUIT-005, SEC-CIRCUIT-006, SEC-CONTEXT-001, SEC-EVIDENCE-001, SEC-EVIDENCE-002
- **Usabilidad**: sin-ui; gate a11y de Pages se ejecuta como regresión documental
- **Documentación**: cuatro DOC-ID y evidence
- **Test**: fast, slow, strict 017, hooks, install, benchmark y auditorías read-only
- **Ficheros previstos**: `evidence.md` e informes de calidad/seguridad
- **DoD**: cero CRÍTICO/ALTO, ningún control no ejecutado y veredicto APTO PARA ENTREGA
- **Depende de**: T-017-04 · **Estimación**: M · **Paralelizable**: no

### T-017-06 · Reutiliza evidencia slow vigente al cerrar una release
- **Estado**: hecho
- **Terreno**: tooling/docs
- **Skill**: `/tdd`, `/docs-sync update --spec 017`
- **Capa**: infraestructura de gates
- **Cubre**: OBJ-002, PRD-RF-003, UC-004, RF-06, CA-06
- **Controles de seguridad**: SEC-EVIDENCE-003
- **Usabilidad**: no aplica; CLI y evidencia máquina
- **Documentación**: DOC-GATES, DOC-TFM, DOC-PAGES
- **Test**: `scripts/test-release-gates.mjs::reutiliza_solo_evidencia_materialmente_vigente`; regresión de hooks e instalación
- **Test que la define**: `scripts/test-release-gates.mjs`
- **Ficheros previstos**: runner, sello/guarda, manifiesto, skills, modelo operativo, TFM y Pages
- **DoD**: `run --release` diferencia executed/reused, siempre reejecuta trazabilidad/secretos/docs y falla cerrado ante cualquier entrada distinta
- **Depende de**: T-017-05 · **Estimación**: M · **Paralelizable**: no

### HANDOFF
- Agente origen: planner
- Fase completada: tasks
- Tareas: 6 secuenciales · cobertura RF/CA 6/6
- Seguridad: 10/10 controles asignados
- Primera tarea: T-017-01
- Siguiente agente sugerido: implementer — `/sdd-implement`
