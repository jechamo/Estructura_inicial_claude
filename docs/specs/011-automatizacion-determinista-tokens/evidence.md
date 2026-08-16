# Evidencia · 011-automatizacion-determinista-tokens

| Campo | Valor |
|---|---|
| **Estado** | GO |
| **Veredicto** | GO técnico local · release condicionada a CI Windows/Linux y Node 18/20/22 |
| **Actualizado** | 2026-08-16 |

## Resultados por tarea

| Tarea | Test / gate | Resultado | Evidencia |
|---|---|---|---|
| T-011-01 | RED de contratos CLI, instalación, seguridad, skills y benchmark | PASS · los casos fallaron por capacidad ausente antes de producción | `declared-direct` · historial TDD y `scripts/test-install.mjs` |
| T-011-02 | `scripts/test-install.mjs::estado_y_gate_json_versionados` | PASS · JSON v1, tareas bloqueadas visibles y exit code material | `declared-direct` · `315/315` |
| T-011-03 | `scripts/test-install.mjs::scaffold_conservador_y_traza` | PASS · dry-run, gates, `sin-ui` justificado y no-overwrite | `declared-direct` · `315/315` |
| T-011-04 | `scripts/test-install.mjs::generadores_opt_in_y_drift`, `::generadores_sin_shell`, `::automatizacion_rutas_confinadas` | PASS · opt-in, timeout, drift y entradas hostiles | `declared-direct` · informe de seguridad 011 |
| T-011-05 | `scripts/test-install.mjs::skills_consumen_snapshots` | PASS · snapshots/scaffolds canónicos y referencias lazy | `declared-direct` · `skills-sync --check` PASS |
| T-011-06 | `scripts/test-install.mjs::automatizacion_documentada`, `::generadores_versionados` | PASS · contrato portable, preservación e idempotencia | `declared-direct` · informe de calidad 011 |
| T-011-07 | `scripts/test-install.mjs::benchmark_tiene_calidad_y_umbral` | PASS · 5/5, calidad 100 %, mediana 43,33 % | `declared-direct` · `docs/quality/benchmarks/011/benchmark.json` |

## Controles de seguridad ejecutados

| Control | Tarea | Test | Resultado |
|---|---|---|---|
| SEC-AUTO-001 | T-011-03 | `scripts/test-install.mjs::automatizacion_rutas_confinadas` | PASS · traversal, absolutas, UNC, separadores mixtos y enlaces/hardlinks bloqueados |
| SEC-AUTO-002 | T-011-04 | `scripts/test-install.mjs::generadores_sin_shell` | PASS · gramática cerrada, `shell:false` e instalación implícita rechazada |
| SEC-AUTO-003 | T-011-04 | `scripts/test-install.mjs::generadores_opt_in_y_drift` | PASS · timeout, ausencia, idempotencia y drift verificados con cierre seguro |

**Informe de seguridad**: `docs/security/reports/2026-08-16-011-automatizacion-determinista-tokens.md`.

## Trazabilidad documental

| DOC-ID | Tarea | Artefacto | Comprobación | Resultado |
|---|---|---|---|---|
| DOC-AUTO | T-011-06 | `README.md`, `docs/guides/COMO-TRABAJAR-CON-LOS-AGENTES.md` | `scripts/test-install.mjs::automatizacion_documentada` | PASS · comandos, límites y frontera de confianza publicados |
| DOC-SKILLS | T-011-05 | `.agents/skills/sdd-status/SKILL.md`, `.agents/skills/*/references/**` | `scripts/test-install.mjs::skills_consumen_snapshots` | PASS · fuente canónica y progressive disclosure |
| DOC-GEN | T-011-06 | `.sdd/README.md`, `.sdd/generators.json` | `scripts/test-install.mjs::generadores_versionados` | PASS · registro vacío, portable y preservado |

Informe de calidad: `docs/quality/reports/2026-08-16-011-automatizacion-determinista-tokens.md`.

## Benchmark

- Baseline: skills de `v0.6.0`; candidata: árbol de spec 011.
- Expectativas comunes: 15/15 en ambas configuraciones.
- Reducciones estimadas por caso: 49,10 %, 43,33 %, 41,28 %, 39,48 % y 47,31 %.
- Mediana: **43,33 %**; supera el umbral del 20 % con calidad 100 %.
- La métrica es un proxy reproducible sobre bytes UTF-8, no tokens internos del modelo.
- Ejecuciones: `docs/quality/benchmarks/011/eval-*/{without_skill,with_skill}/run-1/execution-evidence.json`.

## Gates locales

- `node scripts/test-install.mjs`: PASS · 315 correctas, 0 fallos.
- `node scripts/test-hooks.mjs`: PASS · 85 correctas, 0 fallos.
- `node scripts/skills-sync.mjs --check`: PASS.
- `node scripts/scan-secrets.mjs --json`: PASS · 405 ficheros, 0 hallazgos.
- `git diff --check`: PASS.
- Revisión de código/benchmark: GO · 0 P0, 0 P1, 0 P2 abiertos.
- Seguridad: PASS · CRÍTICO 0, ALTO 0, MEDIO 0, BAJO 0.

## Controles NO ejecutados

| Control | Estado |
|---|---|
| Ninguno | todos los controles aplicables al GO técnico local fueron ejecutados |

## Condición de release

La matriz GitHub Actions Windows/Linux con Node 18/20/22 solo puede observarse sobre un commit
publicado. No se afirma como ejecutada y no se creó commit, push ni tag en esta implementación.

### HANDOFF
- Agente origen: implementer
- Fase completada: implement → verify local
- Fuentes consultadas: spec/plan/tasks 011, skills canónicas, CLI, instalador y benchmark skill-creator
- Artefactos: CLI, parser JSONC, registro de generadores, skills/references, documentación y benchmark
- Requisitos / casos cubiertos: RF-01…RF-08 · CA-01…CA-07
- Discrepancias: tokens reales no expuestos; se usa proxy exacto y explícito
- Decisiones tomadas: automatizar solo mecánica; ejecutable registrado sigue siendo frontera confiable
- Supuestos: el generador existe y fue aprobado por el proyecto; el CLI no instala dependencias
- Bloqueos: release remota pendiente de commit/push autorizado y CI
- Siguiente agente sugerido: release-manager si el usuario solicita publicar v0.7.0
- Comando / contexto durable: `node scripts/check-sdd.mjs --strict --spec 011`
