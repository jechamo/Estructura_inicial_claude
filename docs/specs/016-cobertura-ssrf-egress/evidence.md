# Evidencias y convergencia · 016-cobertura-ssrf-egress

> Evidencia técnica append-only de la implementación. `execution-log.jsonl`, si el host lo
> produce, pertenece exclusivamente a los hooks y no se edita desde este documento.

## 1. Ejecuciones

| Fecha | Agente | Verificación | Tarea | Comando ejecutado | Resultado | Artefacto |
|---|---|---|---|---|---|---|
| 2026-08-21 | `implementer` | `declared-direct` | T-016-01 | `node scripts/test-install.mjs` antes de extraer | 🟢 517 correctas, 0 fallos | baseline previo verde |
| 2026-08-21 | `implementer` | `declared-direct` | T-016-01 | `node scripts/test-install.mjs` tras extraer | 🟢 517 correctas, 0 fallos; `test-install.mjs` 3830 → 3772 líneas | `scripts/test/install-security-contracts.mjs` |
| 2026-08-21 | `implementer` | `declared-direct` | T-016-01 | `node scripts/test-install.mjs` con contratos Must | 🔴 11 asserts SSRF fallan por cláusulas ausentes, sin errores de importación | `scripts/test/install-security-contracts.mjs` |
| 2026-08-21 | `implementer` | `declared-direct` | T-016-02 | `node scripts/test-install.mjs` | 🟢 528 correctas, 0 fallos | skill/checklist fuente e instalación temporal |
| 2026-08-21 | `implementer` | `declared-direct` | T-016-03 | `node scripts/test-install.mjs` · `contrato_ssrf_exige_timeout_material` | 🔴 falta timeout/cancelación/reintentos → 🟢 caso específico | skill/checklist |
| 2026-08-21 | `implementer` | `declared-direct` | T-016-03 | `node scripts/test-install.mjs` · `contrato_ssrf_exige_limite_de_respuesta` | 🔴 falta límite de respuesta/procesamiento → 🟢; suite 530 correctas, 0 fallos | skill/checklist |
| 2026-08-21 | `implementer` | `declared-direct` | T-016-04 | `node scripts/test-install.mjs` · `contrato_ssrf_resume_resultados_verificables` | 🔴 falta resumen separado → 🟢 caso específico | skill portable |
| 2026-08-21 | `implementer` | `declared-direct` | T-016-04 | `node scripts/test-install.mjs` · `contrato_ssrf_agrupa_sin_perder_escenarios` | 🔴 531 correctas, 1 fallo → 🟢 suite 532 correctas, 0 fallos | skill portable |

El gate rápido de T-016-01 quedó deliberadamente diferido hasta T-016-02 porque el plan aprobado
separa la demostración RED del GREEN mínimo. No se presentó esa suite roja como tarea entregable.

## 2. Trazabilidad requisito → test

| OBJ | PRD-RF | UC | RF | CA | Tarea | Implementación | Test | Resultado |
|---|---|---|---|---|---|---|---|---|
| OBJ-001 | PRD-RF-001 | UC-003 | RF-01 | CA-01 | T-016-01/02 | skill + checklist | `scripts/test/install-security-contracts.mjs::contrato_ssrf_exige_destino_permitido` | 🟢 |
| OBJ-001 | PRD-RF-001 | UC-003 | RF-02 | CA-02 | T-016-01/02 | skill + checklist | `scripts/test/install-security-contracts.mjs::contrato_ssrf_exige_protocolo_permitido` | 🟢 |
| OBJ-001 | PRD-RF-001 | UC-003 | RF-03 | CA-03 | T-016-01/02 | skill + checklist | `scripts/test/install-security-contracts.mjs::contrato_ssrf_revalida_destino_efectivo` | 🟢 |
| OBJ-001 | PRD-RF-001 | UC-003 | RF-04 | CA-04 | T-016-01/02 | skill + checklist | `scripts/test/install-security-contracts.mjs::contrato_ssrf_revalida_cada_redireccion` | 🟢 |
| OBJ-001 | PRD-RF-001 | UC-003 | RF-05 | CA-05 | T-016-01/02 | skill + checklist | `scripts/test/install-security-contracts.mjs::contrato_ssrf_bloquea_metadata_sin_excepcion` | 🟢 |
| OBJ-002 | PRD-RF-004 | UC-004 | RF-06 | CA-06 | T-016-01/02 | skill + checklist | `scripts/test/install-security-contracts.mjs::contrato_ssrf_no_admite_verde_implicito` | 🟢 |
| OBJ-003 | PRD-RF-006 | UC-001 | RF-09 | CA-09 | T-016-01/02 | fuente canónica + instalación | `scripts/test/install-security-contracts.mjs::instala_contrato_ssrf_portable_sin_duplicados` | 🟢 |
| OBJ-002 | PRD-RF-004 | UC-004 | RF-07 | CA-07 | T-016-03 | skill + checklist | `scripts/test/install-security-contracts.mjs::contrato_ssrf_exige_timeout_material` | 🟢 |
| OBJ-002 | PRD-RF-004 | UC-004 | RF-08 | CA-08 | T-016-03 | skill + checklist | `scripts/test/install-security-contracts.mjs::contrato_ssrf_exige_limite_de_respuesta` | 🟢 |
| OBJ-002 | PRD-RF-004 | UC-004 | RF-10 | CA-10 | T-016-04 | skill portable | `scripts/test/install-security-contracts.mjs::contrato_ssrf_resume_resultados_verificables` | 🟢 |
| OBJ-002 | PRD-RF-004 | UC-004 | RF-11 | CA-11 | T-016-04 | skill portable | `scripts/test/install-security-contracts.mjs::contrato_ssrf_agrupa_sin_perder_escenarios` | 🟢 |
| OBJ-001 | PRD-RF-001 | UC-003 | RF-12 | CA-12 | T-016-01/02 | skill + checklist | `scripts/test/install-security-contracts.mjs::contrato_ssrf_exige_excepcion_interna_completa` | 🟢 |

## 3. Controles NO ejecutados

| Control | Por qué no se ejecutó | Riesgo | Propietario | Próximo paso |
|---|---|---|---|---|
| Matriz CI Windows/Linux × Node 18/20/22 | Solo se ejecuta tras push | posible diferencia de plataforma no observada localmente | CI | ejecutar workflow antes de release |
| Smoke vivo de los seis hosts | esta sesión valida contratos de fichero, no abre cada IDE | una versión concreta podría interpretar distinto el contrato | mantenedor | ejecutar matriz manual previa al tag |

### 3.0 · Evidencia documental

| DOC-ID | Tarea | Artefacto | Comprobación ejecutada | Resultado | Estado |
|---|---|---|---|---|---|
| DOC-SKILLS | T-016-02 | `.agents/skills/security-scan/SKILL.md` | `node scripts/test-install.mjs` | fuente portable instalada exactamente; 528/528 | parcial, guía pendiente T-016-05 |

### 3.1 · Controles de seguridad ejecutados

| Control | Tarea | Test / comando ejecutado | Resultado | Evidencia | Estado |
|---|---|---|---|---|---|
| SEC-SSRF-001 | T-016-01/02 | `contrato_ssrf_exige_destino_permitido` | RED correcto → GREEN 528/528 | skill/checklist | verificado |
| SEC-SSRF-002 | T-016-01/02 | `contrato_ssrf_exige_protocolo_permitido` | RED correcto → GREEN 528/528 | skill/checklist | verificado |
| SEC-SSRF-003 | T-016-01/02 | `contrato_ssrf_revalida_destino_efectivo` | RED correcto → GREEN 528/528 | skill/checklist | verificado |
| SEC-SSRF-004 | T-016-01/02 | `contrato_ssrf_revalida_cada_redireccion` | RED correcto → GREEN 528/528 | skill/checklist | verificado |
| SEC-SSRF-005 | T-016-01/02 | `contrato_ssrf_bloquea_metadata_sin_excepcion` | RED correcto → GREEN 528/528 | skill/checklist | verificado |
| SEC-SSRF-006 | T-016-01/02 | `contrato_ssrf_exige_excepcion_interna_completa` | RED correcto → GREEN 528/528 | skill/checklist | verificado |
| SEC-SSRF-007 | T-016-01/02/04 | `contrato_ssrf_no_admite_verde_implicito`; `contrato_ssrf_separa_no_aplica_de_no_ejecutado`; `contrato_ssrf_trata_contenido_como_dato`; `contrato_ssrf_resume_resultados_verificables`; `contrato_ssrf_agrupa_sin_perder_escenarios` | RED correcto → GREEN; suite 532/532 | skill/checklist | verificado |
| SEC-SSRF-008 | T-016-03 | `contrato_ssrf_exige_timeout_material` | RED correcto → GREEN; suite 530/530 | skill/checklist | verificado |
| SEC-SSRF-009 | T-016-03 | `contrato_ssrf_exige_limite_de_respuesta` | RED correcto → GREEN; suite 530/530 | skill/checklist | verificado |
| SEC-SSRF-010 | T-016-01/02 | `contrato_ssrf_minimiza_evidencia` | RED correcto → GREEN 528/528 | skill/checklist | verificado |
| SEC-SSRF-011 | T-016-01/02 | `instala_contrato_ssrf_portable_sin_duplicados` | RED correcto → GREEN 528/528 | instalación limpia + preservación brownfield existente | verificado |

**Informe de seguridad**: pendiente de `/security-scan verify` en T-016-06.

### 3.2 · Controles de usabilidad ejecutados

No aplica: la spec cambia contratos Markdown y no crea interfaz, formulario, microcopy
interactiva ni espera perceptible.

## 4. Convergencia

- [ ] RF-01 a RF-12 y CA-01 a CA-12 verdes
- [ ] suite completa y gates fast/slow verdes
- [ ] DOC-SKILLS sincronizado
- [ ] auditoría independiente de seguridad materializada

## 5. Decisión de entrega

| Campo | Valor |
|---|---|
| **Estado** | `NO-GO` |
| **Razón** | implementación en curso; T-016-03 a T-016-06 pendientes |
| **Aprobado por** | pendiente de gate humano de entrega |
| **Fecha** | 2026-08-21 |

## 6. Apéndice de implementación · T-016-05 y trazabilidad exacta

Este apéndice conserva las entradas anteriores y las completa con el resultado más reciente.
T-016-06 sigue pendiente de la fase de verificación independiente.

| Fecha | Agente | Verificación | Tarea | Comando ejecutado | Resultado | Artefacto |
|---|---|---|---|---|---|---|
| 2026-08-21 | `implementer` | `declared-direct` | T-016-04 | `node scripts/sdd-project.mjs run --fast` | 🟢 5 gates fast, PASS | sello local anterior a T-016-05 |
| 2026-08-21 | `implementer` | `declared-direct` | T-016-05 | `node scripts/test-install.mjs` · `la_guia_enlaza_el_contrato_ssrf_portable` | 🔴 532 correctas, 1 fallo; falta el contrato en la guía | `scripts/test/install-security-contracts.mjs` |
| 2026-08-21 | `docs-writer` | `declared-direct` | T-016-05 | `/docs-sync update --spec 016`; `node scripts/test-install.mjs` | 🟢 533 correctas, 0 fallos; caso documental verde | `docs/guides/COMO-TRABAJAR-CON-LOS-AGENTES.md` |
| 2026-08-21 | `implementer` | `declared-direct` | T-016-05 | `node scripts/test-install.mjs` | 🟢 533 correctas, 0 fallos | fuente, instalación limpia/brownfield y guía |
| 2026-08-21 | `implementer` | `declared-direct` | T-016-05 | `node scripts/sdd-project.mjs run --fast` | 🟢 5 gates fast, PASS | sdd, lint, test, build y smells |

### 6.1 · DOC-SKILLS cerrado

| DOC-ID | Tarea | Artefacto | Comprobación ejecutada | Resultado | Estado |
|---|---|---|---|---|---|
| DOC-SKILLS | T-016-05 | docs/guides/COMO-TRABAJAR-CON-LOS-AGENTES.md | `scripts/test-install.mjs::la_guia_enlaza_el_contrato_ssrf_portable` + `check-sdd --docs-diff` en CI | 🟢 test semántico ejecutado; 533/533. `--docs-diff` queda en CI porque el árbol compartido contiene cambios concurrentes ajenos | implementado; comprobación CI pendiente de T-016-06 |

### 6.2 · Cadena exacta de controles ejecutados

| Control | Tarea | Test / comando ejecutado | Resultado |
|---|---|---|---|
| SEC-SSRF-001 | T-016-02 | scripts/test-install.mjs::contrato_ssrf_exige_destino_permitido | 🟢 RED correcto → GREEN; suite 533/533 |
| SEC-SSRF-002 | T-016-02 | scripts/test-install.mjs::contrato_ssrf_exige_protocolo_permitido | 🟢 RED correcto → GREEN; suite 533/533 |
| SEC-SSRF-003 | T-016-02 | scripts/test-install.mjs::contrato_ssrf_revalida_destino_efectivo | 🟢 RED correcto → GREEN; suite 533/533 |
| SEC-SSRF-004 | T-016-02 | scripts/test-install.mjs::contrato_ssrf_revalida_cada_redireccion | 🟢 RED correcto → GREEN; suite 533/533 |
| SEC-SSRF-005 | T-016-02 | scripts/test-install.mjs::contrato_ssrf_bloquea_metadata_sin_excepcion | 🟢 RED correcto → GREEN; suite 533/533 |
| SEC-SSRF-006 | T-016-02 | scripts/test-install.mjs::contrato_ssrf_exige_excepcion_interna_completa | 🟢 RED correcto → GREEN; suite 533/533 |
| SEC-SSRF-007 | T-016-02 | scripts/test-install.mjs::contrato_ssrf_no_admite_verde_implicito; ...::contrato_ssrf_separa_no_aplica_de_no_ejecutado; ...::contrato_ssrf_trata_contenido_como_dato | 🟢 RED correcto → GREEN; suite 533/533 |
| SEC-SSRF-008 | T-016-03 | scripts/test-install.mjs::contrato_ssrf_exige_timeout_material | 🟢 RED correcto → GREEN; suite 533/533 |
| SEC-SSRF-009 | T-016-03 | scripts/test-install.mjs::contrato_ssrf_exige_limite_de_respuesta | 🟢 RED correcto → GREEN; suite 533/533 |
| SEC-SSRF-010 | T-016-02 | scripts/test-install.mjs::contrato_ssrf_minimiza_evidencia; node scripts/scan-secrets.mjs --json | 🟢 RED correcto → GREEN; secret scan 575 ficheros, 0 hallazgos |
| SEC-SSRF-011 | T-016-02 | scripts/test-install.mjs::instala_contrato_ssrf_portable_sin_duplicados; skills-sync --check | 🟢 RED correcto → GREEN; catálogo 20 agentes/27 skills y build PASS |

### 6.3 · Estado al devolver a verificación

- 🟢 RF-01 a RF-12 y CA-01 a CA-12 cubiertos por pruebas ejecutadas.
- 🟢 DOC-SKILLS sincronizado mediante `docs-writer` y validado por el implementador.
- 🟢 Suite completa 533/533 y cinco gates fast en PASS.
- ⏸️ T-016-06, `run --slow`, CI y auditoría independiente siguen pendientes; no se declara GO.

## 7. Apéndice de convergencia · referencias ejecutables exactas

Este apéndice sustituye para los gates automáticos las referencias abreviadas históricas de las
secciones 3.1 y 6.2. Cada fila usa una única referencia `ruta::caso` existente en el módulo de
contratos extraído y conserva el resultado real de la suite completa.

### 7.1 · Cadena de producto por tarea GREEN

| OBJ | PRD-RF | UC | RF | CA | Tarea | Test ejecutado | Resultado |
|---|---|---|---|---|---|---|---|
| OBJ-001 | PRD-RF-001 | UC-003 | RF-01 | CA-01 | T-016-02 | `scripts/test/install-security-contracts.mjs::contrato_ssrf_exige_destino_permitido` | 🟢 533/533 |
| OBJ-001 | PRD-RF-001 | UC-003 | RF-02 | CA-02 | T-016-02 | `scripts/test/install-security-contracts.mjs::contrato_ssrf_exige_protocolo_permitido` | 🟢 533/533 |
| OBJ-001 | PRD-RF-001 | UC-003 | RF-03 | CA-03 | T-016-02 | `scripts/test/install-security-contracts.mjs::contrato_ssrf_revalida_destino_efectivo` | 🟢 533/533 |
| OBJ-001 | PRD-RF-001 | UC-003 | RF-04 | CA-04 | T-016-02 | `scripts/test/install-security-contracts.mjs::contrato_ssrf_revalida_cada_redireccion` | 🟢 533/533 |
| OBJ-001 | PRD-RF-001 | UC-003 | RF-05 | CA-05 | T-016-02 | `scripts/test/install-security-contracts.mjs::contrato_ssrf_bloquea_metadata_sin_excepcion` | 🟢 533/533 |
| OBJ-002 | PRD-RF-004 | UC-004 | RF-06 | CA-06 | T-016-02 | `scripts/test/install-security-contracts.mjs::contrato_ssrf_no_admite_verde_implicito` | 🟢 533/533 |
| OBJ-002 | PRD-RF-004 | UC-004 | RF-07 | CA-07 | T-016-03 | `scripts/test/install-security-contracts.mjs::contrato_ssrf_exige_timeout_material` | 🟢 533/533 |
| OBJ-002 | PRD-RF-004 | UC-004 | RF-08 | CA-08 | T-016-03 | `scripts/test/install-security-contracts.mjs::contrato_ssrf_exige_limite_de_respuesta` | 🟢 533/533 |
| OBJ-003 | PRD-RF-006 | UC-001 | RF-09 | CA-09 | T-016-02 | `scripts/test/install-security-contracts.mjs::instala_contrato_ssrf_portable_sin_duplicados` | 🟢 533/533 |
| OBJ-002 | PRD-RF-004 | UC-004 | RF-10 | CA-10 | T-016-04 | `scripts/test/install-security-contracts.mjs::contrato_ssrf_resume_resultados_verificables` | 🟢 533/533 |
| OBJ-002 | PRD-RF-004 | UC-004 | RF-11 | CA-11 | T-016-04 | `scripts/test/install-security-contracts.mjs::contrato_ssrf_agrupa_sin_perder_escenarios` | 🟢 533/533 |
| OBJ-001 | PRD-RF-001 | UC-003 | RF-12 | CA-12 | T-016-02 | `scripts/test/install-security-contracts.mjs::contrato_ssrf_exige_excepcion_interna_completa` | 🟢 533/533 |

### 7.2 · Cadena de seguridad por control

| Control | Tarea | Test ejecutado | Resultado | Evidencia | Estado |
|---|---|---|---|---|---|
| SEC-SSRF-001 | T-016-02 | `scripts/test/install-security-contracts.mjs::contrato_ssrf_exige_destino_permitido` | 🔴 cláusula ausente → 🟢 533/533 | skill/checklist | verificado |
| SEC-SSRF-002 | T-016-02 | `scripts/test/install-security-contracts.mjs::contrato_ssrf_exige_protocolo_permitido` | 🔴 cláusula ausente → 🟢 533/533 | skill/checklist | verificado |
| SEC-SSRF-003 | T-016-02 | `scripts/test/install-security-contracts.mjs::contrato_ssrf_revalida_destino_efectivo` | 🔴 cláusula ausente → 🟢 533/533 | skill/checklist | verificado |
| SEC-SSRF-004 | T-016-02 | `scripts/test/install-security-contracts.mjs::contrato_ssrf_revalida_cada_redireccion` | 🔴 cláusula ausente → 🟢 533/533 | skill/checklist | verificado |
| SEC-SSRF-005 | T-016-02 | `scripts/test/install-security-contracts.mjs::contrato_ssrf_bloquea_metadata_sin_excepcion` | 🔴 cláusula ausente → 🟢 533/533 | skill/checklist | verificado |
| SEC-SSRF-006 | T-016-02 | `scripts/test/install-security-contracts.mjs::contrato_ssrf_exige_excepcion_interna_completa` | 🔴 cláusula ausente → 🟢 533/533 | skill/checklist | verificado |
| SEC-SSRF-007 | T-016-02 | `scripts/test/install-security-contracts.mjs::contrato_ssrf_no_admite_verde_implicito` | 🔴 cláusula ausente → 🟢 533/533 | skill/checklist | verificado |
| SEC-SSRF-008 | T-016-03 | `scripts/test/install-security-contracts.mjs::contrato_ssrf_exige_timeout_material` | 🔴 límite ausente → 🟢 533/533 | skill/checklist | verificado |
| SEC-SSRF-009 | T-016-03 | `scripts/test/install-security-contracts.mjs::contrato_ssrf_exige_limite_de_respuesta` | 🔴 límite ausente → 🟢 533/533 | skill/checklist | verificado |
| SEC-SSRF-010 | T-016-02 | `scripts/test/install-security-contracts.mjs::contrato_ssrf_minimiza_evidencia` | 🔴 cláusula ausente → 🟢 533/533; secrets 575/0 | skill/checklist | verificado |
| SEC-SSRF-011 | T-016-02 | `scripts/test/install-security-contracts.mjs::instala_contrato_ssrf_portable_sin_duplicados` | 🔴 cláusula ausente → 🟢 533/533 | instalación limpia/brownfield | verificado |

### 7.3 · Gates automáticos de verificación

| Fecha | Agente | Verificación | Tarea | Comando ejecutado | Resultado | Artefacto |
|---|---|---|---|---|---|---|
| 2026-08-21 | `implementer` | `declared-direct` | T-016-06 | `node scripts/check-sdd.mjs --json --strict --spec 016` | 🟢 `ok=true`; 0 problemas, 0 avisos; 5 tareas hechas | salida JSON real |
| 2026-08-21 | `implementer` | `declared-direct` | T-016-06 | `node scripts/sdd-project.mjs run --slow --json` | 🟢 PASS; secrets 575/0, cobertura 50,3 % sobre 2900 líneas (umbral 48,3 %), a11y 3 páginas y E2E 533/533 | salida JSON real |

La auditoría de código y la auditoría de seguridad permanecen independientes y pendientes en este
punto; estos gates automáticos no sustituyen sus informes ni autorizan el `GO` humano.

### 7.4 · Correcciones solicitadas por revisión independiente

| Fecha | Agente | Verificación | Tarea | Comando ejecutado | Resultado | Artefacto |
|---|---|---|---|---|---|---|
| 2026-08-21 | `code-reviewer` | `observed` | T-016-06 | revisión read-only de `/sdd-verify` | 🟠 2 mayores: deadline eludible y cláusulas CORE sin mutación negativa | HANDOFF de code-reviewer |
| 2026-08-21 | `implementer` | `declared-direct` | T-016-06 | `node scripts/test-install.mjs` · mutaciones CORE | 🔴 `contrato_ssrf_detecta_excepcion_sin_motivo_ni_revision` y `contrato_ssrf_detecta_perdida_de_separacion_del_estado` fallaron por no detectar la regresión | `scripts/test/install-security-contracts.mjs` |
| 2026-08-21 | `implementer` | `declared-direct` | T-016-06 | `node scripts/test-install.mjs` | 🟢 `536 correctas · 0 fallos`; mutaciones CORE detectadas y trinquete de olores verde con `test-install.mjs` en 3825 líneas | harness extraído y entrypoint |

Las comprobaciones SSRF quedan acotadas a la sección SSRF/egress de cada fuente, por lo que una
frase equivalente situada en otra sección ya no puede producir un falso verde.

### 7.5 · Informes independientes materializados

| Informe | Agente de solo lectura | Resultado | Hallazgos | Estado |
|---|---|---|---|---|
| `docs/quality/reports/2026-08-21-016-cobertura-ssrf-egress.md` | `code-reviewer` | APTO PARA ENTREGA | 0 bloqueantes · 0 mayores · 0 menores | materializado |
| `docs/security/reports/2026-08-21-016-cobertura-ssrf-egress.md` | `security-auditor` | PASS / APTO | CRÍTICO 0 · ALTO 0 · MEDIO 0 · BAJO 0 | materializado |

El gate local de verificación está completo. T-016-06 y la decisión global permanecen en
`pendiente` porque su definición de hecho exige todavía CI Windows/Linux × Node 18/20/22. Los
smokes vivos de los seis hosts tampoco se presentan como ejecutados. Ningún informe local
autoriza por sí mismo el push o el tag.
