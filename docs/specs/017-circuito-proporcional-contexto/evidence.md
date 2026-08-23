# Evidencia · 017-circuito-proporcional-contexto

## Ejecuciones

| Tarea | Comando | Resultado real |
|---|---|---|
| T-017-01 · `declared-direct` | `node scripts/test-circuit.mjs` | 🟢 61 comprobaciones |
| T-017-02 · `declared-direct` | `node scripts/test-trace-audit.mjs` | 🟢 38 comprobaciones |
| T-017-03 · `declared-direct` | `node scripts/test-context.mjs` | 🟢 25 comprobaciones |
| T-017-03 · `declared-direct` | `node scripts/test-gate-summary.mjs` | 🟢 26 comprobaciones; timeout y maxBuffer reales |
| T-017-04 · `declared-direct` | `node scripts/test-hooks.mjs` | 🟢 181 correctas, 0 fallos |
| T-017-04 · `declared-direct` | `node scripts/test-install.mjs` | 🟢 537 correctas, 0 fallos |
| T-017-04 · `declared-direct` | `node docs/quality/benchmarks/017/run-benchmark.mjs` | 🟢 compact 76,00 %/3 intervenciones; full 71,30 %; clasificación 100 % |
| T-017-05 · `declared-direct` | `node scripts/sdd-project.mjs run --fast --summary-json` | 🟢 PASS · `2026-08-22T20-54-31-720Z-9f08fc39` |
| T-017-05 · `declared-direct` | `node scripts/sdd-project.mjs run --slow --summary-json` | 🟢 PASS · `2026-08-22T20-55-18-481Z-20bd556e` · trace/security/coverage/a11y/E2E |
| T-017-05 · `declared-corroborated` | GitHub Actions · Template quality gates | 🟢 PASS · Node/OS, instalación, contratos, docs y strict 017 · run `32598560957` |
| T-017-05 · `declared-corroborated` | GitHub Actions · SDD gates | 🟢 PASS · fast, slow y trace exacto · run `32598560941` |
| T-017-05 · `declared-corroborated` | GitHub Actions · Pages | 🟢 PASS · publicación · run `32598560946` |

## Cadena de producto

| OBJ | PRD-RF | UC | RF | CA | Tarea | Test | Resultado |
|---|---|---|---|---|---|---|---|
| OBJ-004 | PRD-RF-007 | UC-005 | RF-01 | CA-01 | T-017-01 | `scripts/test-circuit.mjs::rechaza_rutas_ambiguas_y_enlaces` | 🟢 |
| OBJ-002 | PRD-RF-003 | UC-002 | RF-04 | CA-02 | T-017-02 | `scripts/test-trace-audit.mjs::bloquea_commit_nuevo_sin_trailers` | 🟢 |
| OBJ-004 | PRD-RF-007 | UC-005 | RF-01 | CA-01 | T-017-02 | `scripts/test-trace-audit.mjs::impide_legitimacion_retroactiva_e_invasion` | 🟢 |
| OBJ-004 | PRD-RF-008 | UC-005 | RF-02 | CA-03 | T-017-03 | `scripts/test-context.mjs::ignora_instrucciones_y_falla_ante_estructura_invalida` | 🟢 |
| OBJ-004 | PRD-RF-008 | UC-005 | RF-03 | CA-04 | T-017-03 | `scripts/test-gate-summary.mjs::redacta_todos_los_canales_antes_de_persistir` | 🟢 |
| OBJ-004 | PRD-RF-008 | UC-005 | RF-05 | CA-05 | T-017-04 | `docs/quality/benchmarks/017/run-benchmark.mjs` | 🟢 |
| OBJ-002 | PRD-RF-004 | UC-004 | RF-05 | CA-05 | T-017-04 | `docs/quality/benchmarks/017/run-benchmark.mjs` | 🟢 |

## Seguridad

| Control | Tarea | Test ejecutado | Resultado |
|---|---|---|---|
| SEC-CIRCUIT-001 | T-017-01 | `scripts/test-circuit.mjs::rechaza_rutas_ambiguas_y_enlaces` | 🟢 RED → GREEN |
| SEC-CIRCUIT-002 | T-017-01 | `scripts/test-circuit.mjs::rechaza_hash_obsoleto_o_aprobacion_de_agente` | 🟢 RED → GREEN |
| SEC-CIRCUIT-003 | T-017-02 | `scripts/test-trace-audit.mjs::bloquea_commit_nuevo_sin_trailers` | 🟢 RED → GREEN |
| SEC-CIRCUIT-004 | T-017-02 | `scripts/test-trace-audit.mjs::impide_legitimacion_retroactiva_e_invasion` | 🟢 RED → GREEN |
| SEC-CIRCUIT-005 | T-017-01 | `scripts/test-circuit.mjs::eleva_impacto_sensible_y_tipo_no_regular` | 🟢 RED → GREEN |
| SEC-CIRCUIT-006 | T-017-02 | `scripts/test-trace-audit.mjs::agrega_grupos_por_modulo_en_ventana` | 🟢 RED → GREEN |
| SEC-CONTEXT-001 | T-017-03 | `scripts/test-context.mjs::ignora_instrucciones_y_falla_ante_estructura_invalida` | 🟢 RED → GREEN |
| SEC-EVIDENCE-001 | T-017-03 | `scripts/test-gate-summary.mjs::redacta_todos_los_canales_antes_de_persistir` | 🟢 RED → GREEN |
| SEC-EVIDENCE-002 | T-017-03 | `scripts/test-gate-summary.mjs::acota_tiempo_y_salida` | 🟢 RED → GREEN |

Informe PLAN: `docs/security/reports/2026-08-22-017-circuito-proporcional-contexto.md` — PASS, 0 CRÍTICO/ALTO/MEDIO.

Informe VERIFY: `docs/security/reports/2026-08-22-017-circuito-proporcional-contexto-verify.md` — PASS, 9/9 controles, 0/0/0/0 y ninguno sin ejecutar.

## Documentación

| DOC-ID | Tarea | Artefacto | Comprobación | Resultado |
|---|---|---|---|---|
| DOC-CIRCUITO | T-017-04 | modelo operativo, AGENTS/hosts/skills | check-sdd + skills-sync | 🟢 sincronizado |
| DOC-GATES | T-017-04 | guía y definición de hecho | hooks + workflows + slow | 🟢 implementado |
| DOC-TFM | T-017-04 | `docs/TFM/MEMORIA-TECNICA-TFM.md`; cinco diagramas `.excalidraw` de `docs/TFM/` | JSON válido + conceptos del circuito + site-prep | 🟢 actualizado |
| DOC-PAGES | T-017-04 | `site/index.html`, `site/documentacion.html`, datos | guía de modos + benchmark/proxy + a11y | 🟢 3 superficies |

## Controles no ejecutados

| Control | Resultado |
|---|---|
| Ninguno | Todos los controles aplicables fueron ejecutados y corroborados |

## Decisión

Estado: `GO DE ENTREGA`; el usuario aceptó el endurecimiento y autorizó explícitamente publicar
tag y release. Commit real, trace exacto, CI portátil y Pages están corroborados sobre `4080df0`.
Informe de calidad: `docs/quality/reports/2026-08-22-017-circuito-proporcional-contexto.md`.

## Enmienda T-017-06 · reutilización segura de gates para releases

La enmienda no altera los resultados históricos de v0.9.0 anteriores. Añade un cierre local
explícito para v0.9.1 y conserva el `slow` completo como fuente única de evidencia reutilizable.

### Ejecuciones T-017-06

| Tarea | Comando / caso | Resultado real |
|---|---|---|
| T-017-06 · `declared-direct` | RED · spec reescrita tratada como metadata | 🔴 `0 !== 1`; el runner aceptaba indebidamente el cambio de requisito |
| T-017-06 · `declared-direct` | RED · sello release manipulado | 🔴 esperado `false`, obtenido `true` en la guarda de push |
| T-017-06 · `declared-direct` | RED · evidencia de otra máquina | 🔴 esperado rechazo, obtenido `true` |
| T-017-06 · `declared-direct` | RED · resumen extenso con resultados reutilizados | 🔴 procedencia obtenida `[]`; se esperaban a11y/coverage/e2e |
| T-017-06 · `declared-direct` | `node scripts/test-release-gates.mjs` | 🟢 42 comprobaciones; ancestro, HMAC local anticorrupción, runtime/host, huellas, allowlist cerrada, tag por workflow exacto, hardlink/junction, cuotas y fail-closed |
| T-017-06 · `declared-direct` | `node scripts/test-gate-summary.mjs` | 🟢 26 comprobaciones; conserva procedencia `reused` bajo la cota de 8 KiB |
| T-017-06 · `declared-direct` | `node scripts/test-hooks.mjs` | 🟢 183 correctas, 0 fallos; sello íntegro aceptado y sello manipulado rechazado |
| T-017-06 · `declared-direct` | `node scripts/test-install.mjs` | 🟢 539 correctas, 0 fallos |
| T-017-06 · `declared-direct` | `npm test` | 🟢 hooks, circuit, trace, context, summary, release y sintaxis |
| T-017-06 · `declared-direct` | `node scripts/check-coverage.mjs --json` | 🟢 50,5 % ≥ 48,3 % |

### Cadena T-017-06

| OBJ | PRD-RF | UC | RF | CA | Tarea | Test | Resultado |
|---|---|---|---|---|---|---|---|
| OBJ-002 | PRD-RF-003 | UC-004 | RF-06 | CA-06 | T-017-06 | `scripts/test-release-gates.mjs::reutiliza_solo_evidencia_materialmente_vigente` | 🟢 RED → GREEN |

### SEC-EVIDENCE-003

| Control | Tarea | Test ejecutado | Resultado |
|---|---|---|---|
| SEC-EVIDENCE-003 | T-017-06 | `scripts/test-release-gates.mjs::reutiliza_solo_evidencia_materialmente_vigente` | 🟢 PASS ancestral con HMAC local anticorrupción; checks/runtime/host/entradas idénticos; procedencia explícita; tag condicionado al workflow exacto en CI; rechazo fail-closed |

### Documentación T-017-06

| DOC-ID | Tarea | Artefacto | Comprobación | Resultado |
|---|---|---|---|---|
| DOC-GATES | T-017-06 | runner, guarda, pre-push, workflow, modelo y skills | hooks + instalación + skills-sync | 🟢 sincronizado |
| DOC-TFM | T-017-06 | `docs/TFM/MEMORIA-TECNICA-TFM.md` | site-prep + revisión de comandos | 🟢 actualizado |
| DOC-PAGES | T-017-06 | `site/index.html` y datos públicos | site-prep + a11y | 🟢 3 páginas |

Informe VERIFY de la enmienda:
`docs/security/reports/2026-08-23-017-circuito-proporcional-contexto-t01706.md` — APTO, 10/10
controles, 0/0/0/0 y ninguno sin ejecutar. El fast/slow de cierre se ejecuta después de
materializar este documento y sus `runId` se entregan en el HANDOFF, sin reescribir la evidencia y
romper el sello del árbol. No se publica tag ni release como parte de T-017-06.
