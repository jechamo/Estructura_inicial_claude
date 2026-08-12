# Tareas · 009-usabilidad-integrada

| Campo | Valor |
|---|---|
| **Spec** | [`spec.md`](./spec.md) · **Plan**: [`plan.md`](./plan.md) |
| **Total** | 10 tareas · S: 2 · M: 6 · L: 2 |
| **Progreso** | 0/10 |

---

## Trazabilidad

| OBJ | PRD-RF | UC | RF | CA | Tarea | Test | Evidencia |
|---|---|---|---|---|---|---|---|
| OBJ-001 | PRD-RF-001 | UC-001 | RF-06 | CA-08 | T-009-01 | `scripts/test-install.mjs::portabilidad_usabilidad` | `evidence.md#T-009-01` |
| OBJ-001 | PRD-RF-001 | UC-001 | RF-01 | CA-01 | T-009-02 | `scripts/test-install.mjs::usabilidad_versionada` | `evidence.md#T-009-02` |
| OBJ-001 | PRD-RF-001 | UC-001 | RF-02, RF-03 | CA-02, CA-04 | T-009-03 | `scripts/test-install.mjs::matriz_usabilidad` | `evidence.md#T-009-03` |
| OBJ-001 | PRD-RF-001 | UC-001 | RF-04 | CA-05 | T-009-04 | `scripts/test-install.mjs::gate_a11y_e_informe` | `evidence.md#T-009-04` |
| OBJ-001 | PRD-RF-001 | UC-001 | RF-08 | CA-10 | T-009-05 | `scripts/check-sdd.mjs::handoff/ausente` | `evidence.md#T-009-05` |
| OBJ-001 | PRD-RF-001 | UC-001 | RF-07 | CA-09 | T-009-06 | `scripts/test-install.mjs::portabilidad_usabilidad` | `evidence.md#T-009-06` |
| OBJ-001 | PRD-RF-001 | UC-001 | RF-07 | CA-09 | T-009-07 | `scripts/check-sdd.mjs --strict` | `evidence.md#T-009-07` |
| OBJ-001 | PRD-RF-001 | UC-001 | RF-09 | CA-11 | T-009-08 | `scripts/test-hooks.mjs` | `evidence.md#T-009-08` |
| OBJ-001 | PRD-RF-001 | UC-001 | RF-02, RF-05, RF-10 | CA-03, CA-06, CA-07, CA-12 | T-009-09 | `scripts/test-install.mjs::matriz_usabilidad` | `evidence.md#T-009-09` |
| OBJ-001 | PRD-RF-001 | UC-001 | RF-01, RF-06 | CA-08 | T-009-10 | `scripts/test-install.mjs::usabilidad_versionada` | `evidence.md#T-009-10` |

- [ ] Todo RF tiene al menos una tarea
- [ ] Todo CA tiene un test en alguna tarea
- [ ] Ninguna tarea sin RF ni justificación transversal
- [ ] Ningún OBJ, PRD-RF o UC referenciado es huérfano

---

## Orden de ejecución

> Este repositorio no tiene capas de aplicación: el orden va de **doctrina** hacia **validación**.
> Validar antes de que exista qué validar deja el repositorio en rojo durante toda la
> implementación, así que `check-sdd.mjs` se toca al final a propósito.

### T-009-01 · Escribir la doctrina de accesibilidad y ampliar la de usabilidad
- **Estado**: pendiente
- **Terreno**: `docs`
- **Skill**: `/docs-sync`
- **Capa**: doctrina
- **Cubre**: OBJ-001, PRD-RF-001, UC-001, RF-06, CA-08
- **Controles de seguridad**: `no aplica (documento sin superficie de ejecución)`
- **Controles de usabilidad**: `no aplica (doctrina, no interfaz)`
- **Documentación**: `no aplica (docs/design/ no es una superficie declarada en .sdd/docs.json)`
- **Test que la define**: `scripts/test-install.mjs::portabilidad_usabilidad` — falla mientras `docs/design/A11Y-CHECKLIST.md` no exista ni esté en `package.json:files`
- **Depende de**: ninguna
- **Ficheros previstos**: `docs/design/A11Y-CHECKLIST.md`, `docs/design/USABILITY-CHECKLIST.md`, `docs/design/reports/.gitkeep`, `package.json`
- **Definición de hecho**: existe el checklist de a11y con POUR, ARIA, teclado y herramientas; `USABILITY-CHECKLIST.md` §4 incorpora el uso de IA para microcopy y §5 los umbrales medibles; ninguna referencia apunta a un fichero inexistente
- **Evidencia prevista**: `evidence.md#T-009-01`
- **Estimación**: M
- **Paralelizable**: no

### T-009-02 · Introducir la clasificación de usabilidad en la plantilla de spec
- **Estado**: pendiente
- **Terreno**: `docs`
- **Skill**: `/docs-sync`
- **Capa**: contrato
- **Cubre**: OBJ-001, PRD-RF-001, UC-001, RF-01, CA-01
- **Controles de seguridad**: `no aplica (plantilla documental)`
- **Controles de usabilidad**: `no aplica (plantilla, no interfaz)`
- **Documentación**: `no aplica (el contrato se documenta en T-009-07)`
- **Test que la define**: `scripts/test-install.mjs::usabilidad_versionada` — falla mientras `_TEMPLATE/spec.md` no declare `Impacto de usabilidad`
- **Depende de**: T-009-01
- **Ficheros previstos**: `docs/specs/_TEMPLATE/spec.md`
- **Definición de hecho**: la cabecera declara `Impacto de usabilidad` y existe §5.3 con las cuatro señales
- **Evidencia prevista**: `evidence.md#T-009-02`
- **Estimación**: S
- **Paralelizable**: no

### T-009-03 · Propagar los controles a plan, tareas, plan de test y diseño
- **Estado**: pendiente
- **Terreno**: `docs`
- **Skill**: `/docs-sync`
- **Capa**: contrato
- **Cubre**: OBJ-001, PRD-RF-001, UC-001, RF-02, RF-03, CA-02, CA-04
- **Controles de seguridad**: `no aplica (plantilla documental)`
- **Controles de usabilidad**: `no aplica (plantilla, no interfaz)`
- **Documentación**: `no aplica (cubierto por DOC-009-02)`
- **Test que la define**: `scripts/test-install.mjs::matriz_usabilidad` — falla mientras `_TEMPLATE/plan.md` no tenga §9.3
- **Depende de**: T-009-02
- **Ficheros previstos**: `docs/specs/_TEMPLATE/{plan,tasks,test-plan,design}.md`
- **Definición de hecho**: §9.3 y §9.4 en el plan; campo `Controles de usabilidad` en cada tarea; §5.2 de casos hostiles en el plan de test; columna `Evidencia` en §6 y §6 bis del diseño
- **Evidencia prevista**: `evidence.md#T-009-03`
- **Estimación**: M
- **Paralelizable**: no

### T-009-04 · Definir el informe de usabilidad y su contrato JSON
- **Estado**: pendiente
- **Terreno**: `docs`
- **Skill**: `/docs-sync`
- **Capa**: contrato
- **Cubre**: OBJ-001, PRD-RF-001, UC-001, RF-04, CA-05
- **Controles de seguridad**: `no aplica (la plantilla declara la forma del informe; la ruta la valida T-009-09)`
- **Controles de usabilidad**: `no aplica (esquema de datos, no interfaz)`
- **Documentación**: `no aplica (plantilla de spec; su efecto se documenta en DOC-TRACE)`
- **Test que la define**: `scripts/test-install.mjs::gate_a11y_e_informe` — falla mientras `_TEMPLATE/evidence.md` no declare el marcador `sdd-usability-report:v1`
- **Depende de**: T-009-03
- **Ficheros previstos**: `docs/specs/_TEMPLATE/evidence.md`
- **Definición de hecho**: §3.2 con la tabla de controles ejecutados, la ruta del informe y el bloque JSON canónico con sus reglas de veredicto
- **Evidencia prevista**: `evidence.md#T-009-04`
- **Estimación**: S
- **Paralelizable**: no

### T-009-05 · Llevar la usabilidad a las skills del circuito y a los HANDOFF
- **Estado**: pendiente
- **Terreno**: `docs`
- **Skill**: `/docs-sync`
- **Capa**: comportamiento de agentes
- **Cubre**: OBJ-001, PRD-RF-001, UC-001, RF-08, CA-10
- **Controles de seguridad**: `no aplica (instrucciones, sin superficie de ejecución)`
- **Controles de usabilidad**: `no aplica (instrucciones para agentes)`
- **Documentación**: `no aplica (cubierto por DOC-009-02)`
- **Test que la define**: `scripts/check-sdd.mjs::handoff/ausente` — el validador ya exige el bloque; el test nuevo comprueba que la cadena conserva el campo de usabilidad
- **Depende de**: T-009-04
- **Ficheros previstos**: `.agents/skills/{sdd-specify,sdd-clarify,sdd-design,sdd-plan,sdd-tasks,sdd-implement,sdd-verify,sdd-ship,front}/SKILL.md`
- **Definición de hecho**: `/sdd-verify` tiene el paso 5 bis; las nueve skills nombran los controles; el contador de skills canónicas sigue en 26
- **Evidencia prevista**: `evidence.md#T-009-05`
- **Estimación**: L
- **Paralelizable**: no

### T-009-06 · Actualizar los perfiles de agente en los seis hosts
- **Estado**: pendiente
- **Terreno**: `docs`
- **Skill**: `/docs-sync`
- **Capa**: comportamiento de agentes
- **Cubre**: OBJ-001, PRD-RF-001, UC-001, RF-07, RF-08, CA-09, CA-10
- **Controles de seguridad**: `no aplica (perfiles declarativos)`
- **Controles de usabilidad**: `no aplica (perfiles para agentes)`
- **Documentación**: `DOC-HOSTS` — artefacto `docs/integrations/IDE-COMPATIBILITY.md`
- **Test que la define**: `scripts/test-install.mjs::portabilidad_usabilidad` — falla si alguna superficie pierde paridad de 20
- **Depende de**: T-009-05
- **Ficheros previstos**: `.claude/agents/{ux-designer,orchestrator,planner,implementer,frontend-expert,code-reviewer}.md` y sus envoltorios en `.agents/agents/`, `.github/agents/`, `.cursor/agents/`, `.gemini/agents/`, `.codex/agents/`
- **Definición de hecho**: `code-reviewer` declara la auditoría de usabilidad en solo lectura; `ux-designer` conserva su escritura; los seis directorios mantienen 20 perfiles
- **Evidencia prevista**: `evidence.md#T-009-06`
- **Estimación**: L
- **Paralelizable**: no

### T-009-07 · Crear las reglas de IDE y la regla dura 13
- **Estado**: pendiente
- **Terreno**: `docs`
- **Skill**: `/docs-sync`
- **Capa**: reglas por glob y política
- **Cubre**: OBJ-001, PRD-RF-001, UC-001, RF-07, CA-09
- **Controles de seguridad**: `no aplica (documentos de política)`
- **Controles de usabilidad**: `no aplica (reglas para agentes)`
- **Documentación**: `DOC-TRACE` — artefacto `docs/sdd/OPERATING-MODEL.md`
- **Test que la define**: `scripts/test-install.mjs::portabilidad_usabilidad` — falla mientras falten las dos reglas
- **Depende de**: T-009-06
- **Ficheros previstos**: `.cursor/rules/40-usability.mdc`, `.github/instructions/usability.instructions.md`, `AGENTS.md`, `docs/sdd/OPERATING-MODEL.md`, `docs/quality/DEFINITION-OF-DONE.md`, `.agents/rules/00-core.md`
- **Definición de hecho**: las dos reglas existen con `glob` de UI; `AGENTS.md` tiene la regla dura 13; `OPERATING-MODEL.md` tiene la trazabilidad por fase; `00-core.md` deja de decir 25 skills
- **Evidencia prevista**: `evidence.md#T-009-07`
- **Estimación**: M
- **Paralelizable**: no

### T-009-08 · Condicionar el gate a11y en checks, runner y hooks
- **Estado**: pendiente
- **Terreno**: `tooling`
- **Skill**: `/tdd`
- **Capa**: gates
- **Cubre**: OBJ-001, PRD-RF-001, UC-001, RF-09, CA-11
- **Controles de seguridad**: `no aplica (no toca secretos ni credenciales)`
- **Controles de usabilidad**: `no aplica (configuración, no interfaz)`
- **Documentación**: `no aplica (cubierto por DOC-009-01)`
- **Test que la define**: `scripts/test-hooks.mjs::sello sin gate a11y` — RED antes de tocar `guard-bash.mjs`
- **Depende de**: T-009-07
- **Ficheros previstos**: `.sdd/checks.json`, `scripts/sdd-project.mjs`, `.sdd/hooks/guard-bash.mjs`, `.github/workflows/sdd-gates.yml`
- **Definición de hecho**: la detección reconoce axe, pa11y y lighthouse; el sello `slow` exige `a11y` solo cuando es obligatorio; un proyecto sin runner no se rompe
- **Evidencia prevista**: `evidence.md#T-009-08`
- **Estimación**: M
- **Paralelizable**: no

### T-009-09 · Validar el contrato de usabilidad en check-sdd.mjs
- **Estado**: pendiente
- **Terreno**: `tooling`
- **Skill**: `/tdd`
- **Capa**: validación
- **Cubre**: OBJ-001, PRD-RF-001, UC-001, RF-02, RF-05, RF-10, CA-03, CA-06, CA-07, CA-12
- **Controles de seguridad**: `SEC-PATH-001` — `scripts/test-install.mjs::gate_a11y_e_informe`
- **Controles de usabilidad**: `UX-COPY-001` — `scripts/test-install.mjs::matriz_usabilidad`
- **Documentación**: `no aplica (el validador no es superficie documental; su efecto se documenta en DOC-TRACE)`
- **Test que la define**: `scripts/test-install.mjs::matriz_usabilidad` — el fixture negativo debe hacer fallar `check-sdd --strict` **antes** de que exista la validación no puede pasar; se escribe primero y se ve rojo
- **Depende de**: T-009-08
- **Ficheros previstos**: `scripts/check-sdd.mjs`
- **Definición de hecho**: `impactoUsabilidad()`, parser del informe, validación de la matriz, validación de las tablas de diseño, contrato de `installed.json` y puerta de `GO`; el fixture negativo falla con código 1
- **Evidencia prevista**: `evidence.md#T-009-09`
- **Estimación**: L
- **Paralelizable**: no

### T-009-10 · Declarar el contrato en el instalador y subir el manifiesto
- **Estado**: pendiente
- **Terreno**: `tooling`
- **Skill**: `/tdd`
- **Capa**: distribución
- **Cubre**: OBJ-001, PRD-RF-001, UC-001, RF-01, RF-06, CA-08
- **Controles de seguridad**: `no aplica (no escribe secretos ni configuración personal)`
- **Controles de usabilidad**: `UX-COPY-002` — `scripts/test-install.mjs::usabilidad_versionada`
- **Documentación**: `DOC-VCS` — artefacto `docs/guides/INSTALACION.md`
- **Test que la define**: `scripts/test-install.mjs::usabilidad_versionada` — falla mientras `.sdd/installed.json` no tenga el bloque `usability`
- **Depende de**: T-009-09
- **Ficheros previstos**: `scripts/install.mjs`, `scripts/lib/manifiesto.mjs`, `README.md`, `docs/README.md`, `docs/guides/INSTALACION.md`, `CHANGELOG.md`
- **Definición de hecho**: `contratoUsabilidad()` y `migrarChecksUsabilidad()` escriben el bloque; `VERSION_MANIFIESTO` pasa a 6; una instalación limpia recibe los dos checklists y las dos reglas
- **Evidencia prevista**: `evidence.md#T-009-10`
- **Estimación**: M
- **Paralelizable**: no

---

## Tareas transversales (no las olvides)

- [ ] Migración de datos existentes — **no aplica**: el contrato solo vive en ficheros versionados
- [ ] Actualización de contratos y regeneración de tipos — **no aplica**: sin tipos generados
- [ ] Logs, métricas y trazas de los caminos nuevos — códigos de error nuevos documentados en el plan §11
- [ ] Casos de abuso y controles de seguridad aplicables, cada uno con test y evidencia — `SEC-PATH-001`
- [ ] Auditoría `/security-scan`; `security-auditor` devuelve HANDOFF y `docs-writer` materializa — alcance `plan`, spec `no-sensible`
- [ ] Controles de usabilidad aplicables, cada uno con test y evidencia — `UX-COPY-001`, `UX-COPY-002`
- [ ] Documentación de usuario o de API — `DOC-009-01`, `DOC-009-02`
- [ ] Retirada del feature flag tras estabilizar — `enforceFromSpec` se retira cuando ninguna spec activa sea anterior
- [ ] Entrada en `docs/bitacora/DECISIONS.md`

---

**Estados**: `pendiente` · `en curso` · `hecho` · `bloqueado`
**Estimaciones**: `S` (< 2 h) · `M` (medio día) · `L` (más — pártela)
