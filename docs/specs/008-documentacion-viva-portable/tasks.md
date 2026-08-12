# Tareas · 008-documentacion-viva-portable

| Campo | Valor |
|---|---|
| **Spec** | [`spec.md`](./spec.md) · **Plan**: [`plan.md`](./plan.md) |
| **Total** | 9 tareas · S: 2 · M: 5 · L: 2 |
| **Progreso** | 1/9 |

## Trazabilidad

| RF | CA | DOC-ID | Tarea | Test | Evidencia |
|---|---|---|---|---|---|
| RF-01…RF-03 | CA-01, CA-02 | DOC-VCS | T-008-01, T-008-02 | `scripts/test-install.mjs::versionado_portable` | `evidence.md#DOC-VCS` |
| RF-04 | CA-03 | DOC-TRACE | T-008-01, T-008-03, T-008-05 | `scripts/test-install.mjs::trazabilidad_documental` | `evidence.md#DOC-TRACE` |
| RF-05…RF-07 | CA-04, CA-05 | DOC-SYNC | T-008-01, T-008-04 | `scripts/test-hooks.mjs::docs_sync_routing` | `evidence.md#DOC-SYNC` |
| RF-08, RF-09 | CA-05, CA-06 | DOC-GATES | T-008-05, T-008-06, T-008-08 | `scripts/test-install.mjs::docs_diff_base_aware` | `evidence.md#DOC-GATES` |
| RF-10…RF-12 | CA-07…CA-09 | DOC-HOSTS | T-008-04, T-008-07 | `scripts/test-install.mjs::paridad_documental_hosts` | `evidence.md#DOC-HOSTS` |
| RF-13 | CA-10 | DOC-OPS | T-008-06, T-008-09 | `scripts/test-install.mjs::instalacion_documental_idempotente` | `evidence.md#DOC-OPS` |

## Orden de ejecución

### T-008-01 · Escribir las regresiones RED
- **Estado**: hecho
- **Terreno**: test
- **Skill**: `/tdd`
- **Capa**: test
- **Cubre**: RF-01…RF-13, CA-01…CA-10, DOC-VCS, DOC-SYNC, DOC-TRACE, DOC-GATES, DOC-HOSTS, DOC-OPS
- **Documentación**: DOC-VCS, DOC-SYNC, DOC-TRACE, DOC-GATES, DOC-HOSTS, DOC-OPS
- **Controles de seguridad**: SEC-DOCS-001, SEC-DOCS-002, SEC-DOCS-003, SEC-DOCS-004, SEC-DOCS-005, SEC-DOCS-006
- **Test que la define**: `scripts/test-install.mjs::documentacion_viva_red` y `scripts/test-hooks.mjs::docs_sync_routing`
- **Depende de**: ninguna
- **Ficheros previstos**: `scripts/test-install.mjs`, `scripts/test-hooks.mjs`
- **Definición de hecho**: los casos nuevos fallan por capacidades ausentes y no por fixtures rotos.
- **Evidencia prevista**: `evidence.md#T-008-01`
- **Estimación**: M
- **Paralelizable**: no

### T-008-02 · Declarar el contrato Git portable
- **Estado**: pendiente
- **Terreno**: tooling
- **Skill**: `/sdd-implement`
- **Capa**: infrastructure
- **Cubre**: RF-01…RF-03, CA-01, CA-02, DOC-VCS
- **Documentación**: DOC-VCS
- **Controles de seguridad**: SEC-DOCS-001, SEC-DOCS-006
- **Tests de seguridad**: `scripts/test-install.mjs::estado local y secretos quedan ignorados`, `scripts/test-install.mjs::el instalador no ejecuta git add, commit ni push`
- **Test que la define**: `scripts/test-install.mjs::versionado_portable`
- **Depende de**: T-008-01
- **Ficheros previstos**: `.gitignore`, `scripts/install.mjs`, `scripts/lib/manifiesto.mjs`
- **Definición de hecho**: instalación informa qué versionar/excluir y nunca ejecuta add/commit/push.
- **Evidencia prevista**: `evidence.md#T-008-02`
- **Estimación**: M
- **Paralelizable**: no

### T-008-03 · Extender las plantillas con trazabilidad DOC
- **Estado**: pendiente
- **Terreno**: docs
- **Skill**: `/docs-sync`
- **Capa**: docs
- **Cubre**: RF-04, CA-03, DOC-TRACE
- **Documentación**: DOC-TRACE
- **Controles de seguridad**: no aplica (solo plantillas Markdown sin datos ejecutables)
- **Test que la define**: `scripts/test-install.mjs::trazabilidad_documental`
- **Depende de**: T-008-01
- **Ficheros previstos**: `docs/specs/_TEMPLATE/*.md`, `.agents/skills/sdd-*/SKILL.md`
- **Definición de hecho**: spec, plan, tareas, test y evidencia comparten el contrato DOC-ID.
- **Evidencia prevista**: `evidence.md#T-008-03`
- **Estimación**: M
- **Paralelizable**: [P] con T-008-04 sobre ficheros disjuntos

### T-008-04 · Crear `/docs-sync` y su enrutado ligero
- **Estado**: pendiente
- **Terreno**: docs
- **Skill**: `/skill-creator`
- **Capa**: interfaces
- **Cubre**: RF-05…RF-07, CA-04, CA-05, DOC-SYNC
- **Documentación**: DOC-SYNC
- **Controles de seguridad**: SEC-DOCS-004
- **Test de seguridad**: `scripts/test-hooks.mjs::documentar comportamiento existente enruta a /docs-sync sin abrir una spec`
- **Test que la define**: `scripts/test-hooks.mjs::docs_sync_routing`
- **Depende de**: T-008-01
- **Ficheros previstos**: `.agents/skills/docs-sync/**`, `.claude/skills/docs-sync/SKILL.md`, `.sdd/hooks/sdd-router.mjs`
- **Definición de hecho**: bootstrap/update/audit están definidos y el router no secuestra cambios de código.
- **Evidencia prevista**: `evidence.md#T-008-04`
- **Estimación**: M
- **Paralelizable**: [P] con T-008-03 sobre ficheros disjuntos

### T-008-05 · Implementar el gate documental universal
- **Estado**: pendiente
- **Terreno**: tooling
- **Skill**: `/sdd-implement`
- **Capa**: application
- **Cubre**: RF-04, RF-08…RF-10, CA-03, CA-05…CA-07, DOC-TRACE, DOC-GATES
- **Documentación**: DOC-TRACE, DOC-GATES
- **Controles de seguridad**: SEC-DOCS-002, SEC-DOCS-003
- **Test de seguridad**: `scripts/test-install.mjs::check-sdd rechaza traversal y rutas documentales absolutas`
- **Test que la define**: `scripts/test-install.mjs::docs_diff_base_aware`
- **Depende de**: T-008-01, T-008-03
- **Ficheros previstos**: `scripts/check-sdd.mjs`, `scripts/sdd-project.mjs`
- **Definición de hecho**: valida esquema, rutas, enlaces, placeholders, cadena DOC y diff contra base exacta.
- **Evidencia prevista**: `evidence.md#T-008-05`
- **Estimación**: L
- **Paralelizable**: no

### T-008-06 · Migrar el estado documental de forma conservadora
- **Estado**: pendiente
- **Terreno**: tooling
- **Skill**: `/sdd-implement`
- **Capa**: infrastructure
- **Cubre**: RF-08, RF-13, CA-05, CA-10, DOC-GATES, DOC-OPS
- **Documentación**: DOC-GATES, DOC-OPS
- **Controles de seguridad**: SEC-DOCS-001, SEC-DOCS-002
- **Test que la define**: `scripts/test-install.mjs::instalacion_documental_idempotente`
- **Depende de**: T-008-01
- **Ficheros previstos**: `.sdd/docs.json`, `scripts/install.mjs`, `scripts/lib/manifiesto.mjs`, `scripts/sdd-project.mjs`
- **Definición de hecho**: greenfield bootstrap, brownfield legacy-pending, approve explícito e idempotencia.
- **Evidencia prevista**: `evidence.md#T-008-06`
- **Estimación**: L
- **Paralelizable**: no

### T-008-07 · Sincronizar agentes y adaptadores de seis hosts
- **Estado**: pendiente
- **Terreno**: tooling
- **Skill**: `/sdd-implement`
- **Capa**: interfaces
- **Cubre**: RF-11, RF-12, CA-08, CA-09, DOC-HOSTS
- **Documentación**: DOC-HOSTS
- **Controles de seguridad**: SEC-DOCS-005
- **Test de seguridad**: `scripts/test-install.mjs::el CI documental obtiene historial y pasa un SHA base exacto`
- **Test que la define**: `scripts/test-install.mjs::paridad_documental_hosts`
- **Depende de**: T-008-04
- **Ficheros previstos**: `.claude/agents/**`, `.github/agents/**`, `.cursor/agents/**`, `.codex/agents/**`, `.agents/agents/**`, `.gemini/agents/**`, `package.json`
- **Definición de hecho**: 20 agentes coherentes y 26 skills sin comandos duplicados.
- **Evidencia prevista**: `evidence.md#T-008-07`
- **Estimación**: M
- **Paralelizable**: [P] tras T-008-04 con propietario exclusivo de hosts

### T-008-08 · Hacer CI y pre-push base-aware
- **Estado**: pendiente
- **Terreno**: infra
- **Skill**: `/sdd-implement`
- **Capa**: infrastructure
- **Cubre**: RF-09, CA-06, DOC-GATES
- **Documentación**: DOC-GATES
- **Controles de seguridad**: SEC-DOCS-003, SEC-DOCS-005
- **Test de seguridad**: `scripts/test-install.mjs::docs-diff falla cerrado cuando no puede resolver el SHA base`
- **Test que la define**: `scripts/test-install.mjs::paquete_y_workflow_documental`
- **Depende de**: T-008-05
- **Ficheros previstos**: `.github/workflows/*.yml`, `.sdd/githooks/pre-push`, `scripts/lib/manifiesto.mjs`
- **Definición de hecho**: CI usa historial y SHA base explícito; base irresoluble no pasa silenciosamente.
- **Evidencia prevista**: `evidence.md#T-008-08`
- **Estimación**: S
- **Paralelizable**: no

### T-008-09 · Actualizar documentación oficial y preparar la entrega
- **Estado**: pendiente
- **Terreno**: docs
- **Skill**: `/docs-sync`
- **Capa**: docs
- **Cubre**: RF-01…RF-13, CA-01…CA-10, DOC-VCS, DOC-SYNC, DOC-TRACE, DOC-GATES, DOC-HOSTS, DOC-OPS
- **Documentación**: DOC-VCS, DOC-SYNC, DOC-TRACE, DOC-GATES, DOC-HOSTS, DOC-OPS
- **Controles de seguridad**: SEC-DOCS-001, SEC-DOCS-005
- **Test que la define**: `scripts/check-sdd.mjs --strict --spec 008`
- **Depende de**: T-008-02…T-008-08
- **Ficheros previstos**: `README.md`, `CHANGELOG.md`, `AGENTS.md`, `docs/**`, `package.json`
- **Definición de hecho**: documentación, evidencia, informes y paquete v0.6.0 son coherentes y verificables.
- **Evidencia prevista**: `evidence.md#T-008-09`
- **Estimación**: S
- **Paralelizable**: no

**Estados**: pendiente · en curso · hecho · bloqueado
