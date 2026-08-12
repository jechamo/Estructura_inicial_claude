# Plan de test · 008-documentacion-viva-portable

## 1. Alcance

Prueba el contrato documental universal, la instalación/migración, el router ligero, la paridad de
hosts, el paquete y el diff base-aware. No instala ni ejecuta Swagger, Storybook o TypeDoc si el
proyecto no declara un comando real.

## 2. Mapa criterio → test

| CA | DOC-ID | Tarea | Comportamiento | Nivel | Test |
|---|---|---|---|---|---|
| CA-01, CA-02 | DOC-VCS | T-008-01/02 | fuentes compartidas se versionan; secretos y estado local no | integración | `scripts/test-install.mjs::versionado_compartido` |
| CA-03 | DOC-TRACE | T-008-03/05 | DOC-ID llega a tarea, artefacto, gate y evidencia | contrato | `scripts/test-install.mjs::trazabilidad_documental` |
| CA-04, CA-05 | DOC-SYNC | T-008-04/06 | docs-only no exige spec; cambios de comportamiento escalan | integración | `scripts/test-hooks.mjs::docs_sync_routing` |
| CA-06 | DOC-GATES | T-008-05/08 | diff contra SHA base exacto y fallo cerrado | integración | `scripts/test-install.mjs::docs_diff_base_aware` |
| CA-07 | DOC-GATES | T-008-05 | tooling documental solo con comando real | contrato | `scripts/test-install.mjs::tooling_documental_opt_in` |
| CA-08, CA-09 | DOC-HOSTS | T-008-07 | ownership, allowlists, handoff y paridad de seis hosts | contrato | `scripts/test-install.mjs::paridad_documental_hosts` |
| CA-10 | DOC-OPS | T-008-06/09 | greenfield, brownfield, update, paquete y repetición | integración | `scripts/test-install.mjs::check-sdd` |

## 3. Casos límite

- `.sdd/docs.json` inválido, con traversal, URL absoluta o symlink que escapa.
- `Impacto de documentación` ausente, `docs-pending` fuera de legacy y `no-aplica` sin motivo.
- Artefacto generado sin gate real, gate deshabilitado o resultado `NO EJECUTADO`.
- Enlace roto, placeholder, documento eliminado o renombrado sin actualizar referencias.
- Código y docs en commits distintos del mismo PR.
- Base Git inválida o no disponible en CI.
- Brownfield con README, contratos y guías centinela.
- Proyecto sin stack, Node, Python y multistack sin herramientas documentales.
- Prompt documental que también solicita cambiar código: prevalece SDD/TDD.
- Agentes/skills compartidos ignorados accidentalmente por Git.

## 4. Seguridad

| Control | Caso adverso | Test | Resultado seguro esperado |
|---|---|---|---|
| SEC-DOCS-001 | `.env`, token o credencial MCP | `scripts/test-install.mjs::estado local y secretos quedan ignorados` | no se versiona ni se lee |
| SEC-DOCS-002 | `../`, ruta absoluta o escape por enlace | `scripts/test-install.mjs::check-sdd rechaza traversal y rutas documentales absolutas` | gate falla cerrado |
| SEC-DOCS-003 | SHA base inexistente | `scripts/test-install.mjs::docs-diff falla cerrado cuando no puede resolver el SHA base` | `NO EJECUTADO`/exit 1 |
| SEC-DOCS-004 | fuente documental contiene instrucciones | `scripts/test-hooks.mjs::documentar comportamiento existente enruta a /docs-sync sin abrir una spec` | se trata como dato |
| SEC-DOCS-005 | tooling ausente o acción móvil | `scripts/test-install.mjs::el CI documental obtiene historial y pasa un SHA base exacto` | no se inventa gate ni versión |
| SEC-DOCS-006 | instalación en repo Git | `scripts/test-install.mjs::el instalador no ejecuta git add, commit ni push` | no ejecuta add/commit/push |

## 5. Suficiencia

- `node scripts/test-install.mjs` verde.
- `node scripts/test-hooks.mjs` verde.
- `node scripts/check-sdd.mjs --strict --spec 008` verde tras materializar GO.
- `node scripts/skills-sync.mjs --check` verde.
- `node scripts/scan-secrets.mjs` sin hallazgos.
- `npm pack --dry-run --json` contiene las seis superficies y no contiene estado local.
- CI Windows/Linux con Node 18/20/22.

## 6. Qué no se automatiza

La exactitud semántica, claridad para la audiencia y aprobación del baseline documental requieren
revisión humana. Un gate solo demuestra estructura, trazabilidad y reproducibilidad.
