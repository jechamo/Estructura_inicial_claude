# Tareas · 017-circuito-proporcional-contexto

| Campo | Valor |
|---|---|
| **Spec** | [`spec.md`](./spec.md) · **Plan**: [`plan.md`](./plan.md) |
| **Total** | 9 tareas · S: 1 · M: 7 · L: 1 |
| **Progreso** | 0/9 |
| **Orden** | por amortización: detenerse en cualquier punto deja beneficio consolidado |
| **Paralelizables** | 0 · todas comparten `scripts/lib/` o el contrato del CLI |

---

## Trazabilidad

| OBJ | PRD-RF | UC | RF | CA | Tarea | Test | Evidencia |
|---|---|---|---|---|---|---|---|
| OBJ-004 | PRD-RF-008 | UC-005 | RF-01 | CA-01 | T-017-02 | `scripts/test/contexto-recorte.mjs::recorta_solo_las_secciones_de_la_fase` | `evidence.md#T-017-02` |
| OBJ-004 | PRD-RF-008 | UC-005 | RF-02 | CA-02 | T-017-02 | `scripts/test/contexto-recorte.mjs::falla_cerrado_y_conserva_invariantes` | `evidence.md#T-017-02` |
| OBJ-004 | PRD-RF-008 | UC-005 | RF-03 | CA-01 | T-017-02 | `scripts/test/contexto-recorte.mjs::la_trazabilidad_de_seguridad_solo_llega_si_la_spec_es_sensible` | `evidence.md#T-017-02` |
| OBJ-004 | PRD-RF-008 | UC-005 | RF-04 | CA-03 | T-017-03 | `scripts/test/contexto-recorte.mjs::ninguna_superficie_exige_el_documento_completo` | `evidence.md#T-017-03` |
| OBJ-004 | PRD-RF-007 | UC-005 | RF-05 | CA-04 | T-017-04 | `scripts/test/resumen-gates.mjs::resume_comando_codigo_conteos_y_ejecucion` | `evidence.md#T-017-04` |
| OBJ-004 | PRD-RF-007 | UC-005 | RF-06 | CA-04 | T-017-04 | `scripts/test/resumen-gates.mjs::la_salida_completa_sigue_recuperable_por_identificador` | `evidence.md#T-017-04` |
| OBJ-001 | PRD-RF-001 | UC-003 | RF-10 | CA-08 | T-017-05 | `scripts/test/circuito-frontera.mjs::deniega_variacion_de_caja` | `evidence.md#T-017-05` |
| OBJ-002 | PRD-RF-003 | UC-002 | RF-07 | CA-05 | T-017-06 | `scripts/test/circuito-frontera.mjs::clasifica_en_tres_niveles_con_full_por_defecto` | `evidence.md#T-017-06` |
| OBJ-002 | PRD-RF-003 | UC-002 | RF-08 | CA-06 | T-017-06 | `scripts/test/circuito-frontera.mjs::clasifica_rutas_previstas_con_arbol_limpio` | `evidence.md#T-017-06` |
| OBJ-002 | PRD-RF-004 | UC-004 | RF-09 | CA-07 | T-017-06 | `scripts/test/circuito-frontera.mjs::un_ejecutable_nunca_es_ligero` | `evidence.md#T-017-06` |
| OBJ-001 | PRD-RF-001 | UC-003 | RF-12 | CA-10 | T-017-06 | `scripts/test/circuito-frontera.mjs::la_frontera_heredada_sigue_habilitando_solo_light` | `evidence.md#T-017-06` |
| OBJ-001 | PRD-RF-001 | UC-003 | RF-11 | CA-09 | T-017-07 | `scripts/test/circuito-frontera.mjs::sin_aprobacion_no_hay_atajo` | `evidence.md#T-017-07` |
| OBJ-002 | PRD-RF-003 | UC-002 | RF-13 | CA-11 | T-017-08 | `scripts/test/circuito-frontera.mjs::el_documento_compacto_declara_limites_verificables` | `evidence.md#T-017-08` |

- [x] Todo RF tiene al menos una tarea
- [x] Todo CA tiene un test en alguna tarea
- [x] Ninguna tarea sin RF ni justificación transversal
- [x] Ningún OBJ, PRD-RF o UC referenciado es huérfano
- [x] Los tres controles de seguridad tienen tarea, test y evidencia previstos
- [x] No hay UI ni controles `UX-*`; el motivo material se repite por tarea
- [x] No se añade agente ni skill; `/sdd-light` se amplía y el contrato de 27 se conserva

---

## Orden de ejecución

> El orden es por **amortización**, no por capas: no hay dominio ni pantalla, son herramientas del
> propio circuito. Cada tarea ahorra por sí sola, así que detenerse deja beneficio consolidado.

### T-017-01 · Escribe en rojo el contrato del recorte de contexto
- **Estado**: pendiente
- **Terreno**: test
- **Skill**: `/tdd`
- **Capa**: test
- **Cubre**: OBJ-004, PRD-RF-008, UC-005, RF-01, RF-02, RF-03, CA-01, CA-02
- **Controles de seguridad**: `SEC-CONTEXT-001` (define en rojo que las invariantes no pueden faltar y que la estructura corrupta falla cerrado)
- **Controles de usabilidad**: no aplica (fichero de test de una función pura; sin interfaz)
- **Documentación**: no aplica (la prueba va primero; la documentación llega en T-017-02 y T-017-03)
- **Test que la define**: `scripts/test/contexto-recorte.mjs::recorta_solo_las_secciones_de_la_fase`
- **Depende de**: ninguna
- **Ficheros previstos**: `scripts/test/contexto-recorte.mjs`
- **Definición de hecho**: los casos fallan porque `scripts/lib/contexto.mjs` no existe todavía, no por un fixture roto ni por un import mal escrito
- **Evidencia prevista**: `evidence.md#T-017-01`
- **Estimación**: M
- **Paralelizable**: no

### T-017-02 · Implementa el recortador y el subcomando `context`
- **Estado**: pendiente
- **Terreno**: tooling
- **Skill**: `/tdd`
- **Capa**: infrastructure
- **Cubre**: OBJ-004, PRD-RF-008, UC-005, RF-01, RF-02, RF-03, CA-01, CA-02
- **Controles de seguridad**: `SEC-CONTEXT-001`
- **Controles de usabilidad**: no aplica (subcomando de CLI sin interfaz gráfica)
- **Documentación**: `DOC-CONTEXTO` (mapa de lectura por fase en el modelo operativo)
- **Test que la define**: `scripts/test/contexto-recorte.mjs::falla_cerrado_y_conserva_invariantes`
- **Depende de**: T-017-01
- **Ficheros previstos**: `scripts/lib/contexto.mjs`, `scripts/sdd-project.mjs`, `docs/sdd/OPERATING-MODEL.md`
- **Definición de hecho**: `context --phase` devuelve solo las secciones del mapa más las invariantes, lanza ante encabezado ausente, duplicado o renombrado, no escribe nada, y queda registrado en el bloque `USO`
- **Evidencia prevista**: `evidence.md#T-017-02`
- **Estimación**: M
- **Paralelizable**: no

### T-017-03 · Deja de exigir el tratado completo en las siete superficies
- **Estado**: pendiente
- **Terreno**: docs
- **Skill**: `/docs-sync update`
- **Capa**: interfaces
- **Cubre**: OBJ-004, PRD-RF-008, UC-005, RF-04, CA-03
- **Controles de seguridad**: no aplica (cambio de instrucciones; no toca la frontera ni el recortador, cuyos controles cubren T-017-02 y T-017-05)
- **Controles de usabilidad**: no aplica (ficheros de instrucciones para agentes, sin interfaz)
- **Documentación**: `DOC-CONTEXTO`
- **Test que la define**: `scripts/test/contexto-recorte.mjs::ninguna_superficie_exige_el_documento_completo`
- **Depende de**: T-017-02
- **Ficheros previstos**: `CLAUDE.md`, `AGENTS.md`, `.github/copilot-instructions.md`, `.cursor/`, `.codex/`, `.gemini/`, `.agents/`, `scripts/lib/manifiesto.mjs`
- **Definición de hecho**: ninguna superficie pide el modelo operativo completo; el bloque gestionado que se instala en destino también cambia, y los perfiles fríos acotan qué buscan en la constitución
- **Evidencia prevista**: `evidence.md#T-017-03`
- **Estimación**: M
- **Paralelizable**: no

### T-017-04 · Resume la ejecución de gates sin volcar la suite
- **Estado**: pendiente
- **Terreno**: tooling
- **Skill**: `/tdd`
- **Capa**: infrastructure
- **Cubre**: OBJ-004, PRD-RF-007, UC-005, RF-05, RF-06, CA-04
- **Controles de seguridad**: no aplica (no cambia qué se ejecuta ni el código de salida real, solo cómo se presenta)
- **Controles de usabilidad**: no aplica (salida de CLI para agentes)
- **Documentación**: no aplica (el bloque `USO` documenta la bandera; no hay superficie documental declarada)
- **Test que la define**: `scripts/test/resumen-gates.mjs::resume_comando_codigo_conteos_y_ejecucion`
- **Depende de**: ninguna
- **Ficheros previstos**: `scripts/lib/resumen-gates.mjs`, `scripts/sdd-project.mjs`, `scripts/test/resumen-gates.mjs`
- **Definición de hecho**: en verde el resumen identifica comando, código de salida, conteos y ejecución; en rojo incluye el fallo relevante; la salida completa sigue recuperable por identificador y el código de salida real no cambia
- **Evidencia prevista**: `evidence.md#T-017-04`
- **Estimación**: M
- **Paralelizable**: no

### T-017-05 · Corrige el defecto de caja y fija la gramática de la frontera ← corrección de defecto
- **Estado**: pendiente
- **Terreno**: tooling
- **Skill**: `/tdd`
- **Capa**: domain
- **Cubre**: OBJ-001, PRD-RF-001, UC-003, RF-10, CA-08
- **Controles de seguridad**: `SEC-CIRCUIT-001`
- **Controles de usabilidad**: no aplica (función pura sin interfaz)
- **Documentación**: no aplica (corrección de defecto sin cambio de contrato documental; el nivel se documenta en T-017-08)
- **Test que la define**: `scripts/test/circuito-frontera.mjs::deniega_variacion_de_caja`
- **Depende de**: ninguna
- **Ficheros previstos**: `scripts/lib/circuito.mjs`, `scripts/test/circuito-frontera.mjs`
- **Definición de hecho**: con `denied: ["src/domain/"]`, la ruta `Src/Domain/pagos.ts` queda denegada; comodín, ruta absoluta y traversal se rechazan sin conceder atajo; el test falla en rojo antes del arreglo
- **Evidencia prevista**: `evidence.md#T-017-05`
- **Estimación**: M
- **Paralelizable**: no

### T-017-06 · Clasifica en tres niveles con suelo por ejecutable y consulta previa
- **Estado**: pendiente
- **Terreno**: tooling
- **Skill**: `/tdd`
- **Capa**: domain
- **Cubre**: OBJ-002, PRD-RF-003, PRD-RF-004, UC-002, UC-004, RF-07, RF-08, RF-09, RF-12, CA-05, CA-06, CA-07, CA-10
- **Controles de seguridad**: `SEC-CIRCUIT-001` (el suelo por tipo de fichero es el candado que no depende de cómo esté escrita la frontera)
- **Controles de usabilidad**: no aplica (clasificador puro y bandera de CLI)
- **Documentación**: no aplica (el modelo operativo se actualiza en T-017-08, cuando el nivel compacto ya tiene procedimiento)
- **Test que la define**: `scripts/test/circuito-frontera.mjs::clasifica_en_tres_niveles_con_full_por_defecto`
- **Depende de**: T-017-05
- **Ficheros previstos**: `scripts/lib/circuito.mjs`, `scripts/check-sdd.mjs`, `.sdd/circuit.json`, `scripts/test/circuito-frontera.mjs`
- **Definición de hecho**: `--planned` clasifica con el árbol limpio; un ejecutable listado como permitido sigue siendo `compact`; la ruta desconocida cae en `full`; la frontera heredada sigue habilitando solo el `light` antiguo y no se reescribe
- **Evidencia prevista**: `evidence.md#T-017-06`
- **Estimación**: L
- **Paralelizable**: no

### T-017-07 · Instala la frontera sin aprobar y separa la aprobación
- **Estado**: pendiente
- **Terreno**: tooling
- **Skill**: `/tdd`
- **Capa**: infrastructure
- **Cubre**: OBJ-001, PRD-RF-001, UC-003, RF-11, CA-09
- **Controles de seguridad**: `SEC-CIRCUIT-002`
- **Controles de usabilidad**: no aplica (comandos de CLI y salida de instalación)
- **Documentación**: no aplica (la salida del instalador es texto de ejecución, no superficie documental declarada)
- **Test que la define**: `scripts/test/circuito-frontera.mjs::sin_aprobacion_no_hay_atajo`
- **Depende de**: T-017-06
- **Ficheros previstos**: `scripts/sdd-project.mjs`, `scripts/lib/manifiesto.mjs`, `scripts/install.mjs`, `scripts/test/circuito-frontera.mjs`
- **Definición de hecho**: recién instalada la frontera no concede atajo y el mensaje nombra el comando de aprobación; una propuesta alterada tras mostrarse no puede aprobarse; queda escrito que la identidad declarada no es firma criptográfica
- **Evidencia prevista**: `evidence.md#T-017-07`
- **Estimación**: M
- **Paralelizable**: no

### T-017-08 · Publica el documento compacto y amplía `/sdd-light`
- **Estado**: pendiente
- **Terreno**: docs
- **Skill**: `/tdd`
- **Capa**: interfaces
- **Cubre**: OBJ-002, PRD-RF-003, UC-002, RF-13, CA-11
- **Controles de seguridad**: no aplica (plantilla y procedimiento escrito; los controles de la frontera los cubren T-017-05, T-017-06 y T-017-07)
- **Controles de usabilidad**: no aplica (documento markdown y skill, sin interfaz)
- **Documentación**: `DOC-CIRCUITO`
- **Test que la define**: `scripts/test/circuito-frontera.mjs::el_documento_compacto_declara_limites_verificables`
- **Depende de**: T-017-06
- **Ficheros previstos**: `docs/specs/_TEMPLATE/change.md`, `.agents/skills/sdd-light/SKILL.md`, `.claude/skills/sdd-light/SKILL.md`, `docs/sdd/OPERATING-MODEL.md`, `scripts/sdd-project.mjs`
- **Definición de hecho**: `new-change --mode compact` instancia la plantilla sin aprobar nada; superar los límites obliga al circuito completo; `/sdd-light` cubre los tres niveles diciendo por escrito que su nombre se quedó corto; el recuento de 27 skills no cambia
- **Evidencia prevista**: `evidence.md#T-017-08`
- **Estimación**: M
- **Paralelizable**: no

### T-017-09 · Mide, verifica y cierra
- **Estado**: pendiente
- **Terreno**: test
- **Skill**: `/sdd-verify` + `/security-scan verify`
- **Capa**: transversal
- **Cubre**: transversal sobre RF-01 a RF-13 y CA-01 a CA-11; materializa la métrica de `spec.md` §2
- **Controles de seguridad**: `SEC-CIRCUIT-001`, `SEC-CIRCUIT-002`, `SEC-CONTEXT-001`
- **Controles de usabilidad**: no aplica (se verifica que no haya aparecido una superficie interactiva accidental; sin hallazgo se conserva el motivo material)
- **Documentación**: `DOC-CIRCUITO`, `DOC-CONTEXTO`
- **Test que la define**: `node scripts/sdd-project.mjs run --fast`, `run --slow`, `node scripts/sdd-project.mjs trace-status --spec 017 --json` y el benchmark de `docs/quality/benchmarks/017/`
- **Depende de**: T-017-08
- **Ficheros previstos**: `docs/quality/benchmarks/017/`, `docs/specs/017-circuito-proporcional-contexto/evidence.md`, `docs/security/reports/2026-08-22-017-circuito-proporcional-contexto.md`, `docs/bitacora/DECISIONS.md`
- **Definición de hecho**: umbrales de §2 alcanzados o la candidata registrada como experimento descartado conforme a `RF-08` de la spec 011; gates fast y slow en PASS con su resumen; auditoría independiente sin CRÍTICO ni ALTO; controles no ejecutados declarados con riesgo, dueño y siguiente paso
- **Evidencia prevista**: `evidence.md#T-017-09`
- **Estimación**: M
- **Paralelizable**: no

---

## Tareas transversales

- [ ] Migración de datos existentes — no aplica: no hay datos; `.sdd/lightweight.json` se lee sin reescribirse
- [ ] Actualización de contratos y regeneración de tipos — no aplica: no se publica API ni hay tipos generados
- [ ] Logs y trazas de los caminos nuevos — T-017-04, mediante el identificador de ejecución
- [ ] Controles de seguridad con test y evidencia — T-017-05, T-017-06, T-017-07
- [ ] Auditoría `/security-scan`; `security-auditor` devuelve HANDOFF y `docs-writer` materializa — T-017-09
- [ ] Controles de usabilidad — no aplica: `sin-ui`, motivo material repetido por tarea
- [ ] Auditoría de usabilidad en `/sdd-verify` — T-017-09, verificando que no aparezca superficie interactiva
- [ ] Documentación de usuario — T-017-03 y T-017-08
- [ ] Retirada del feature flag — no aplica: no se introduce ninguno
- [ ] Entrada en `docs/bitacora/DECISIONS.md` — T-017-09

---

**Estados**: `pendiente` · `en curso` · `hecho` · `bloqueado`
**Estimaciones**: `S` (< 2 h) · `M` (medio día) · `L` (más — pártela)
