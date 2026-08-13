# Evidencias y convergencia · 008-documentacion-viva-portable

## 1. Ejecuciones

| Fecha/hora | Agente | Verificación | Tarea | Comando ejecutado | Resultado | Artefacto |
|---|---|---|---|---|---|---|
| 2026-08-11 16:45 | test-engineer | observed | T-008-01 | `node scripts/test-hooks.mjs` | 🔴 64 correctas · 7 fallos funcionales esperados | `scripts/test-hooks.mjs` |
| 2026-08-11 16:47 | test-engineer | observed | T-008-01 | `node scripts/test-install.mjs` | 🔴 200 correctas · 25 fallos funcionales esperados | `scripts/test-install.mjs` |
| 2026-08-13 | implementer | declared-direct · integración verificada por el agente activo; el host no registró subagentes en el JSONL | T-008-01 | `node scripts/test-install.mjs` | 🟢 259/259 · exit 0 | `scripts/test-install.mjs` |
| 2026-08-13 | implementer | declared-direct · cierre integrado sobre `main` sin editar el JSONL append-only | T-008-02 | `node scripts/test-install.mjs` | 🟢 259/259 · exit 0 | `scripts/install.mjs`, `scripts/lib/manifiesto.mjs` |
| 2026-08-13 | implementer | declared-direct · cierre integrado sobre `main` sin editar el JSONL append-only | T-008-03 | `node scripts/check-sdd.mjs --spec 008` | 🟢 exit 0 | `docs/specs/_TEMPLATE/` |
| 2026-08-13 | implementer | declared-direct · cierre integrado sobre `main` sin editar el JSONL append-only | T-008-04 | `node scripts/test-hooks.mjs` | 🟢 71/71 · exit 0 | `.agents/skills/docs-sync/`, `.sdd/hooks/sdd-router.mjs` |
| 2026-08-13 | implementer | declared-direct · cierre integrado sobre `main` sin editar el JSONL append-only | T-008-05 | `node scripts/test-install.mjs` | 🟢 261/261 · exit 0; incluye contención del destino frente a symlink/junction y registro hostil | `scripts/check-sdd.mjs`, `scripts/lib/docs-contract.mjs`, `scripts/install.mjs` |
| 2026-08-13 | implementer | declared-direct · cierre integrado sobre `main` sin editar el JSONL append-only | T-008-06 | `node scripts/test-install.mjs` | 🟢 259/259 · incluye segunda instalación idempotente | `.sdd/docs.json`, `scripts/install.mjs` |
| 2026-08-13 | implementer | declared-direct · cierre integrado sobre `main` sin editar el JSONL append-only | T-008-07 | `node scripts/check-sdd.mjs --spec 008` | 🟢 20 agentes · 26 skills · exit 0 | `.agents/agents/`, `.gemini/agents/` y adaptadores de host |
| 2026-08-13 | implementer | declared-direct · cierre integrado sobre `main` sin editar el JSONL append-only | T-008-08 | `node scripts/test-install.mjs` | 🟢 259/259 · base SHA, tags y refs múltiples cubiertos | `.github/workflows/sdd-gates.yml`, `.sdd/githooks/pre-push` |
| 2026-08-13 | implementer | declared-direct · cierre integrado sobre `main` sin editar el JSONL append-only | T-008-09 | `npm pack --dry-run --json` | 🟢 `sdd-agents@0.6.0` · 286 entradas | README, guías, changelog y paquete |

## 2. Trazabilidad documental

| DOC-ID | Tarea | Artefacto | Test/comando | Resultado |
|---|---|---|---|---|
| DOC-VCS | T-008-02, T-008-09 | README, guía, ignore y resumen CLI | `scripts/test-install.mjs::versionado_portable` | 🟢 VERDE · contrato compartido/local, salida del instalador y ausencia de mutaciones Git cubiertos en 259/259 |
| DOC-SYNC | T-008-04 | skill, router y guía | `scripts/test-hooks.mjs::docs_sync_routing` | 🟢 VERDE · cuatro rutas docs-only/escalado cubiertas en 71/71 |
| DOC-TRACE | T-008-03, T-008-05 | templates, parser y fixtures | `scripts/test-install.mjs::trazabilidad_documental` | 🟢 VERDE · matriz DOC, cadena y casos adversos cubiertos en 259/259 |
| DOC-GATES | T-008-05, T-008-08 | checks, workflow y referencia | `scripts/test-install.mjs::docs_diff_base_aware` | 🟢 VERDE · SHA exacto, rename/delete, base inválida y co-cambio cubiertos en 259/259 |
| DOC-HOSTS | T-008-07 | seis adaptadores y compatibilidad | `scripts/test-install.mjs::paridad_documental_hosts` | 🟢 VERDE · 20 agentes y 26 skills en seis superficies |
| DOC-OPS | T-008-06, T-008-09 | README, modelo, índice, changelog, bitácora | `node scripts/check-sdd.mjs --strict --spec 008` | 🟢 VERDE local antes del gate humano; informe final pendiente de materialización |

## 3. Controles de seguridad ejecutados

| Control | Tarea | Test | Resultado | Evidencia |
|---|---|---|---|---|
| SEC-DOCS-001 | T-008-02 | `scripts/test-install.mjs::estado local y secretos quedan ignorados` | 🟢 VERDE · secretos/configuración local excluidos; `scan-secrets` 390 ficheros, 0 hallazgos | `docs/security/reports/2026-08-13-008-documentacion-viva-portable.md` |
| SEC-DOCS-002 | T-008-05 | `scripts/test-install.mjs::check-sdd rechaza traversal y rutas documentales absolutas` | 🟢 VERDE · traversal, rutas absolutas, symlink/junction, claves hostiles de `installed.json` y paths sensibles rechazados | `docs/security/reports/2026-08-13-008-documentacion-viva-portable.md` |
| SEC-DOCS-003 | T-008-08 | `scripts/test-install.mjs::docs-diff falla cerrado cuando no puede resolver el SHA base` | 🟢 VERDE · base no resoluble produce exit 1 y no falso PASS | `docs/security/reports/2026-08-13-008-documentacion-viva-portable.md` |
| SEC-DOCS-004 | T-008-04 | `scripts/test-hooks.mjs::documentar comportamiento existente enruta a /docs-sync sin abrir una spec` | 🟢 VERDE · el contenido documental se trata como dato y el cambio de comportamiento escala | `docs/security/reports/2026-08-13-008-documentacion-viva-portable.md` |
| SEC-DOCS-005 | T-008-07 | `scripts/test-install.mjs::el CI documental obtiene historial y pasa un SHA base exacto` | 🟢 VERDE · acciones fijadas por SHA, historial suficiente y tooling opt-in | `docs/security/reports/2026-08-13-008-documentacion-viva-portable.md` |
| SEC-DOCS-006 | T-008-02 | `scripts/test-install.mjs::el instalador no ejecuta git add, commit ni push` | 🟢 VERDE · instalador sin add, commit, push, chmod ni mutación de hooksPath | `docs/security/reports/2026-08-13-008-documentacion-viva-portable.md` |

## 4. Gates y controles no ejecutados

| Control | Resultado | Riesgo / siguiente paso |
|---|---|---|
| `node scripts/test-install.mjs` | 🟢 261/261 · exit 0 | ninguno |
| `node scripts/test-hooks.mjs` | 🟢 71/71 · exit 0 | ninguno |
| `node scripts/skills-sync.mjs --check` | 🟢 20 declaradas · política válida | ninguno |
| `node scripts/scan-secrets.mjs --json` | 🟢 390 ficheros · 0 hallazgos | ninguno |
| `npm pack --dry-run --json` | 🟢 `sdd-agents@0.6.0` · 286 entradas | ninguno |
| `node scripts/sdd-project.mjs run --fast` | 🟢 1 gate fast · PASS | lint, test, typecheck, build y smells no están configurados como gates separados; la suite propia se ejecutó explícitamente |
| `node scripts/sdd-project.mjs run --slow` | 🟢 security PASS | coverage, e2e, visual, a11y, deps-audit, docs y mutation no están configurados para esta plantilla sin dependencias de runtime |
| Matriz CI Windows/Linux · Node 18/20/22 | NO EJECUTADO todavía | se ejecuta sobre el commit de cierre en `main`; el tag `v0.6.0` queda bloqueado hasta observarla verde |

## 5. Gates humanos

| Gate | Estado | Persona | Fecha | Evidencia |
|---|---|---|---|---|
| Spec | approved | usuario | 2026-08-11 | `spec.md` |
| Plan | approved | usuario | 2026-08-11 | `plan.md` |
| Entrega | pending | — | — | esta evidencia y los informes finales |

## 6. Convergencia

- [x] Nueve tareas terminadas y evidenciadas.
- [x] Seis DOC-ID con artefacto y resultado real.
- [x] Seis controles de seguridad ejecutados.
- [x] Instalación greenfield/brownfield e idempotencia verificadas.
- [x] Paridad 20 agentes / 26 skills verificada.
- [x] Gates rápidos y lentos locales verificados.
- [x] Paquete v0.6.0 inspeccionado.
- [ ] Matriz CI Windows/Linux con Node 18/20/22 observada en verde.

**Informe de seguridad**: `docs/security/reports/2026-08-13-008-documentacion-viva-portable.md`

## 7. Decisión de entrega

| Campo | Valor |
|---|---|
| **Estado** | `NO-GO` |
| **Razón** | Candidato local verificado; pendiente de aprobación humana y de observar la matriz CI antes del tag |
| **Aprobado por** | — |
| **Fecha** | — |
