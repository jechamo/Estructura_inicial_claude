# Tareas · 016-cobertura-ssrf-egress

| Campo | Valor |
|---|---|
| **Spec** | [`spec.md`](./spec.md) · **Plan**: [`plan.md`](./plan.md) |
| **Total** | 6 tareas · S: 3 · M: 3 · L: 0 |
| **Progreso** | 5/6 |
| **Orden MoSCoW** | Must T-016-01/02 → Should T-016-03 → Could T-016-04 → documentación T-016-05 → gate T-016-06 |
| **Paralelizables** | 0 · las tareas comparten contrato o dependen de estabilizar su fuente |

---

## Trazabilidad

| OBJ | PRD-RF | UC | RF | CA | Tareas | Test / evidencia esperada |
|---|---|---|---|---|---|---|
| OBJ-001 | PRD-RF-001 | UC-003 | RF-01 | CA-01 | T-016-01, T-016-02 | `contrato_ssrf_exige_destino_permitido` · `evidence.md#T-016-01/02` |
| OBJ-001 | PRD-RF-001 | UC-003 | RF-02 | CA-02 | T-016-01, T-016-02 | `contrato_ssrf_exige_protocolo_permitido` · `evidence.md#T-016-01/02` |
| OBJ-001 | PRD-RF-001 | UC-003 | RF-03 | CA-03 | T-016-01, T-016-02 | `contrato_ssrf_revalida_destino_efectivo` · `evidence.md#T-016-01/02` |
| OBJ-001 | PRD-RF-001 | UC-003 | RF-04 | CA-04 | T-016-01, T-016-02 | `contrato_ssrf_revalida_cada_redireccion` · `evidence.md#T-016-01/02` |
| OBJ-001 | PRD-RF-001 | UC-003 | RF-05 | CA-05 | T-016-01, T-016-02 | `contrato_ssrf_bloquea_metadata_sin_excepcion` · `evidence.md#T-016-01/02` |
| OBJ-002 | PRD-RF-004 | UC-004 | RF-06 | CA-06 | T-016-01, T-016-02 | `contrato_ssrf_no_admite_verde_implicito` · `evidence.md#T-016-01/02` |
| OBJ-002 | PRD-RF-004 | UC-004 | RF-07 | CA-07 | T-016-03 | `contrato_ssrf_exige_timeout_material` · `evidence.md#T-016-03` |
| OBJ-002 | PRD-RF-004 | UC-004 | RF-08 | CA-08 | T-016-03 | `contrato_ssrf_exige_limite_de_respuesta` · `evidence.md#T-016-03` |
| OBJ-003 | PRD-RF-006 | UC-001 | RF-09 | CA-09 | T-016-01, T-016-02 | `instala_contrato_ssrf_portable_sin_duplicados` · `evidence.md#T-016-01/02` |
| OBJ-002 | PRD-RF-004 | UC-004 | RF-10 | CA-10 | T-016-04 | `contrato_ssrf_resume_resultados_verificables` · `evidence.md#T-016-04` |
| OBJ-002 | PRD-RF-004 | UC-004 | RF-11 | CA-11 | T-016-04 | `contrato_ssrf_agrupa_sin_perder_escenarios` · `evidence.md#T-016-04` |
| OBJ-001 | PRD-RF-001 | UC-003 | RF-12 | CA-12 | T-016-01, T-016-02 | `contrato_ssrf_exige_excepcion_interna_completa` · `evidence.md#T-016-01/02` |

### Cobertura transversal

| Elemento | Tareas | Test / gate | Evidencia |
|---|---|---|---|
| SEC-SSRF-001 a SEC-SSRF-007, SEC-SSRF-010 y SEC-SSRF-011 | T-016-01, T-016-02 | contratos negativos + instalación limpia/brownfield | `evidence.md#SEC-SSRF-001` a `#SEC-SSRF-007`, `#SEC-SSRF-010/011` |
| SEC-SSRF-008 y SEC-SSRF-009 | T-016-03 | timeout/reintentos y límite de respuesta | `evidence.md#SEC-SSRF-008/009` |
| SEC-SSRF-007 · resumen/agrupación | T-016-04 | conteos y conservación de IDs | `evidence.md#T-016-04` |
| DOC-SKILLS | T-016-02, T-016-03, T-016-04, T-016-05, T-016-06 | test semántico + `--docs-diff` en CI | `evidence.md#DOC-SKILLS` |
| Usabilidad | todas | no aplica: contrato Markdown sin pantalla, formulario, microcopy interactiva ni espera percibida | motivo conservado en cada tarea |

- [x] Todo RF tiene al menos una tarea.
- [x] Todo CA tiene un test previsto.
- [x] Toda tarea de producto conserva OBJ → PRD-RF → UC → RF → CA.
- [x] Toda tarea declara terreno y skill.
- [x] Los 11 controles de seguridad tienen tarea, test y evidencia previstos.
- [x] `DOC-SKILLS` llega a fuente, artefacto, comprobación y evidencia.
- [x] No hay UI ni controles `UX-*`; el motivo material se repite por tarea.
- [x] No se añaden agente, skill, comando, red, dependencia, migración ni esquema JSON.

---

## Orden de ejecución

### T-016-01 · Extrae el harness y demuestra los contratos Must en RED
- **Estado**: hecho
- **Terreno**: test
- **Skill**: `/tdd`
- **Capa**: test
- **Cubre**: OBJ-001 → PRD-RF-001 → UC-003 → RF-01, RF-02, RF-03, RF-04, RF-05, RF-12 → CA-01, CA-02, CA-03, CA-04, CA-05, CA-12; OBJ-002 → PRD-RF-004 → UC-004 → RF-06 → CA-06; OBJ-003 → PRD-RF-006 → UC-001 → RF-09 → CA-09
- **Controles de seguridad**: SEC-SSRF-001, SEC-SSRF-002, SEC-SSRF-003, SEC-SSRF-004, SEC-SSRF-005, SEC-SSRF-006, SEC-SSRF-007, SEC-SSRF-010, SEC-SSRF-011
- **Controles de usabilidad**: no aplica (solo reorganiza y añade pruebas Node; no hay interfaz, formulario, microcopy interactiva ni espera percibida)
- **Documentación**: no aplica (prepara el harness y los RED; no estabiliza todavía una fuente documental)
- **Test que la define**: `scripts/test/install-security-contracts.mjs::contrato_ssrf_exige_destino_permitido` y los casos Must enumerados en `test-plan.md` §2/§5.1
- **Depende de**: ninguna
- **Ficheros previstos**: `scripts/test-install.mjs`, `scripts/test/install-security-contracts.mjs`
- **Definición de hecho**: primero se extrae el bloque de contratos de seguridad y la suite previa sigue verde; después cada caso Must falla por su assert esperado contra la doctrina actual. `test-install.mjs` permanece como entrypoint, no supera 3831 líneas y no se eleva `maxLineas`.
- **Evidencia prevista**: `evidence.md#T-016-01` con salida verde previa a los RED, salida RED individual y medición de olores antes/después
- **Estimación**: M
- **Paralelizable**: no

### T-016-02 · Implementa el contrato Must portable de SSRF/egress
- **Estado**: hecho
- **Terreno**: contratos
- **Skill**: `/tdd`
- **Capa**: interfaces
- **Cubre**: OBJ-001 → PRD-RF-001 → UC-003 → RF-01, RF-02, RF-03, RF-04, RF-05, RF-12 → CA-01, CA-02, CA-03, CA-04, CA-05, CA-12; OBJ-002 → PRD-RF-004 → UC-004 → RF-06 → CA-06; OBJ-003 → PRD-RF-006 → UC-001 → RF-09 → CA-09
- **Controles de seguridad**: SEC-SSRF-001, SEC-SSRF-002, SEC-SSRF-003, SEC-SSRF-004, SEC-SSRF-005, SEC-SSRF-006, SEC-SSRF-007, SEC-SSRF-010, SEC-SSRF-011
- **Controles de usabilidad**: no aplica (cambia doctrina portable Markdown, no una superficie interactiva)
- **Documentación**: DOC-SKILLS (estabiliza la fuente; el artefacto de guía se actualiza en T-016-05)
- **Test que la define**: `scripts/test/install-security-contracts.mjs::contrato_ssrf_exige_destino_permitido`; `scripts/test/install-security-contracts.mjs::contrato_ssrf_exige_protocolo_permitido`; `scripts/test/install-security-contracts.mjs::contrato_ssrf_revalida_destino_efectivo`; `scripts/test/install-security-contracts.mjs::contrato_ssrf_revalida_cada_redireccion`; `scripts/test/install-security-contracts.mjs::contrato_ssrf_bloquea_metadata_sin_excepcion`; `scripts/test/install-security-contracts.mjs::contrato_ssrf_exige_excepcion_interna_completa`; `scripts/test/install-security-contracts.mjs::contrato_ssrf_no_admite_verde_implicito`; `scripts/test/install-security-contracts.mjs::contrato_ssrf_minimiza_evidencia`; `scripts/test/install-security-contracts.mjs::instala_contrato_ssrf_portable_sin_duplicados`
- **Depende de**: T-016-01
- **Ficheros previstos**: `.agents/skills/security-scan/SKILL.md`, `docs/security/SECURITY-CHECKLIST.md`, `scripts/test/install-security-contracts.mjs`
- **Definición de hecho**: GREEN mínimo exige aplicabilidad separada de estado, destino/protocolo, A/AAAA efectivo, redirects, metadata sin excepción, excepción interna completa, evidencia minimizada, contenido tratado como dato y una skill autosuficiente aunque brownfield conserve checklist propia. Instalación limpia/brownfield y catálogo 20/27 pasan sin modificar perfiles, adaptadores, manifiesto o esquema v1.
- **Evidencia prevista**: `evidence.md#T-016-02` y `#SEC-SSRF-001` a `#SEC-SSRF-007`, `#SEC-SSRF-010`, `#SEC-SSRF-011`
- **Estimación**: M
- **Paralelizable**: no

### T-016-03 · Añade límites de recursos y reintentos
- **Estado**: hecho
- **Terreno**: contratos
- **Skill**: `/tdd`
- **Capa**: interfaces
- **Cubre**: OBJ-002 → PRD-RF-004 → UC-004 → RF-07, RF-08 → CA-07, CA-08
- **Controles de seguridad**: SEC-SSRF-008, SEC-SSRF-009
- **Controles de usabilidad**: no aplica (los límites pertenecen al contrato de auditoría, no a una espera interactiva de esta plantilla)
- **Documentación**: DOC-SKILLS (amplía la fuente estabilizada; la guía se sincroniza en T-016-05)
- **Test que la define**: `scripts/test/install-security-contracts.mjs::contrato_ssrf_exige_timeout_material`; `scripts/test/install-security-contracts.mjs::contrato_ssrf_exige_limite_de_respuesta`
- **Depende de**: T-016-02
- **Ficheros previstos**: `.agents/skills/security-scan/SKILL.md`, `docs/security/SECURITY-CHECKLIST.md`, `scripts/test/install-security-contracts.mjs`
- **Definición de hecho**: tras demostrar RED, la skill/checklist exigen timeout, cancelación, reintentos acotados y límite de respuesta/procesamiento, o un hallazgo explícito; n-1/n/n+1 quedan delegados al proyecto auditado sin imponer valores universales.
- **Evidencia prevista**: `evidence.md#T-016-03`, `#SEC-SSRF-008`, `#SEC-SSRF-009`
- **Estimación**: S
- **Paralelizable**: no

### T-016-04 · Añade resumen y agrupación opcionales sin perder traza
- **Estado**: hecho
- **Terreno**: contratos
- **Skill**: `/tdd`
- **Capa**: interfaces
- **Cubre**: OBJ-002 → PRD-RF-004 → UC-004 → RF-10, RF-11 → CA-10, CA-11
- **Controles de seguridad**: SEC-SSRF-007
- **Controles de usabilidad**: no aplica (la salida es un HANDOFF/informe Markdown, no UI)
- **Documentación**: DOC-SKILLS (completa la fuente opcional; la guía se sincroniza en T-016-05)
- **Test que la define**: `scripts/test/install-security-contracts.mjs::contrato_ssrf_resume_resultados_verificables`; la agrupación complementaria consta en `test-plan.md` §2
- **Depende de**: T-016-03
- **Ficheros previstos**: `.agents/skills/security-scan/SKILL.md`, `scripts/test/install-security-contracts.mjs`
- **Definición de hecho**: tras RED, el bloque humano puede contar `superado`, `fallido`, `no ejecutado` y `no-aplica` por separado, y todo hallazgo agrupado conserva los IDs individuales. No se cambia `sdd-security-report:v1`. Si se consume contingencia, esta tarea puede aplazarse íntegra.
- **Evidencia prevista**: `evidence.md#T-016-04`, `#SEC-SSRF-007`
- **Estimación**: S
- **Paralelizable**: no

### T-016-05 · Sincroniza la guía DOC-SKILLS
- **Estado**: hecho
- **Terreno**: docs
- **Skill**: `/docs-sync update`
- **Capa**: docs
- **Cubre**: transversal justificada por `DOC-SKILLS` y el impacto documental aprobado; refleja RF-01 a RF-12 sin crear comportamiento adicional
- **Controles de seguridad**: SEC-SSRF-011 (la guía enlaza la fuente canónica y la checklist sin duplicar un contrato divergente)
- **Controles de usabilidad**: no aplica (documentación de desarrollador, sin interfaz o interacción nueva)
- **Documentación**: DOC-SKILLS
- **Test que la define**: `scripts/test/install-security-contracts.mjs::la_guia_enlaza_el_contrato_ssrf_portable`; `check-sdd --docs-diff` permanece como gate complementario de CI
- **Depende de**: T-016-04
- **Ficheros previstos**: `docs/guides/COMO-TRABAJAR-CON-LOS-AGENTES.md`, `scripts/test/install-security-contracts.mjs`
- **Definición de hecho**: la guía explica aplicabilidad, destino efectivo, redirects, metadata, excepciones, límites y evidencia; enlaza skill/checklist como fuentes y pasa su test semántico y `--docs-diff` en CI.
- **Evidencia prevista**: `evidence.md#T-016-05`, `evidence.md#DOC-SKILLS`
- **Estimación**: S
- **Paralelizable**: no

### T-016-06 · Verifica la entrega sensible y materializa la evidencia
- **Estado**: pendiente
- **Terreno**: test
- **Skill**: `/sdd-verify` + `/security-scan verify` (auditor read-only; materialización literal autorizada)
- **Capa**: test
- **Cubre**: transversal de gate sobre OBJ-001/002/003 → PRD-RF-001/004/006 → UC-001/003/004 → RF-01 a RF-12 → CA-01 a CA-12
- **Controles de seguridad**: SEC-SSRF-001, SEC-SSRF-002, SEC-SSRF-003, SEC-SSRF-004, SEC-SSRF-005, SEC-SSRF-006, SEC-SSRF-007, SEC-SSRF-008, SEC-SSRF-009, SEC-SSRF-010, SEC-SSRF-011
- **Controles de usabilidad**: no aplica (spec `sin-ui`; se verifica que no aparezca una superficie interactiva accidental)
- **Documentación**: DOC-SKILLS
- **Test que la define**: `node scripts/sdd-project.mjs run --fast`, `run --slow`, `node scripts/sdd-project.mjs trace-status --spec 016 --json` y `/security-scan verify`
- **Depende de**: T-016-05
- **Ficheros previstos**: `docs/specs/016-cobertura-ssrf-egress/evidence.md`, `docs/specs/016-cobertura-ssrf-egress/execution-log.jsonl`, `docs/security/reports/2026-08-21-016-cobertura-ssrf-egress.md`, `docs/bitacora/DECISIONS.md`
- **Definición de hecho**: se conservan salidas reales RED/GREEN/REFACTOR, instalación limpia/brownfield, paridad 20/27, `skills-sync`, `check-sdd`, secret scan, fast/slow y CI. El auditor devuelve PASS sin CRÍTICO/ALTO/MEDIO, riesgos no aceptados ni controles no ejecutados; el informe se materializa literalmente y la bitácora registra el cambio.
- **Evidencia prevista**: `evidence.md#T-016-06`, informe `sdd-security-report:v1` y entrada append-only de bitácora
- **Estimación**: M
- **Paralelizable**: no

---

## Tareas transversales y no aplicabilidad

- [x] Migración de datos: no aplica; no hay esquema, persistencia ni backfill.
- [x] Contrato: cubierto por T-016-01 a T-016-04; no se crea tipo generado o JSON v2.
- [x] Logs, métricas y trazas runtime: no aplica; la plantilla no ejecuta peticiones salientes.
- [x] Errores/alertas runtime: no aplica por el mismo motivo; la evidencia del auditor sí queda en T-016-06.
- [x] Casos de abuso y seguridad: T-016-01 a T-016-04 y auditoría independiente T-016-06.
- [x] Usabilidad: `sin-ui` con motivo material; no se crean IDs `UX-*` ni informe de usabilidad.
- [x] Documentación mantenible: T-016-05, `DOC-SKILLS`.
- [x] Feature flag: no aplica; no hay despliegue runtime.
- [x] Bitácora: T-016-06, append-only.
- [x] Release/tag: fuera de esta spec; se decide posteriormente en `/sdd-ship`.

---

**Estados**: `pendiente` · `en curso` · `hecho` · `bloqueado`
**Estimaciones**: `S` (< 2 h) · `M` (medio día) · `L` (debe partirse)
**Regla de ejecución**: una tarea cada vez mediante `/sdd-implement`; test RED real antes del GREEN.
