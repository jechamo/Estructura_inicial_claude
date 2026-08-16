# Plan de pruebas · 011-automatizacion-determinista-tokens

## 1. Estrategia

Pruebas de caja negra sobre destinos instalados, fixtures Git aislados y programas auxiliares sin
shell. Cada caso prueba salida JSON, exit code y bytes escritos. Los tests de seguridad conservan
sentinels fuera del destino para detectar escapes.

## 2. Casos

| Caso | Tipo | Requisitos | Resultado esperado |
|---|---|---|---|
| `estado_y_gate_json_versionados` | integración | RF-01, RF-04 | JSON v1 estable, zero/one/multi spec y exit code real |
| `scaffold_conservador_y_traza` | integración | RF-02, RF-03 | dry-run, creación exacta, no overwrite, IDs/huérfanos |
| `automatizacion_rutas_confinadas` | seguridad | RF-02, RF-05 | traversal, absolutas, UNC, separadores mixtos y symlink/junction/hardlink no escriben fuera |
| `generadores_sin_shell` | seguridad | RF-05 | argv literal, shell false, programa/args hostiles rechazados |
| `generadores_opt_in_y_drift` | integración | RF-05, RF-06 | vacío por defecto; éxito/fallo/timeout/output ausente/drift distinguibles |
| `generadores_versionados` | instalación | RF-06 | greenfield/brownfield/update/idempotencia/paquete |
| `skills_consumen_snapshots` | contrato | RF-07 | comandos canónicos y referencias lazy; sin adaptadores duplicados |
| `automatizacion_documentada` | docs | RF-06, RF-07 | guía portable, límites y versionado |
| `benchmark_tiene_calidad_y_umbral` | evaluación | RF-08 | grading completo y umbral o descarte explícito |

## 2.1 Trazabilidad de controles

| Control | Tarea | Test exacto |
|---|---|---|
| SEC-AUTO-001 | T-011-03 | `scripts/test-install.mjs::automatizacion_rutas_confinadas` |
| SEC-AUTO-002 | T-011-04 | `scripts/test-install.mjs::generadores_sin_shell` |
| SEC-AUTO-003 | T-011-04 | `scripts/test-install.mjs::generadores_opt_in_y_drift` |
| DOC-AUTO | T-011-06 | `scripts/test-install.mjs::automatizacion_documentada` |
| DOC-SKILLS | T-011-05 | `scripts/test-install.mjs::skills_consumen_snapshots` |
| DOC-GEN | T-011-06 | `scripts/test-install.mjs::generadores_versionados` |

## 3. Casos hostiles

- IDs y fases desconocidas, flags duplicadas y valores que empiezan por `--`.
- Rutas absolutas POSIX/Windows, UNC, `..`, NUL, separadores mixtos y symlinks colgantes.
- Registro JSON malformado, claves extra críticas, IDs repetidos, owner desconocido.
- Programas `sh`, `bash`, `cmd`, `powershell`, argumentos con metacaracteres/CR/LF/NUL.
- Input ausente, output fuera de root, output ya modificado y proceso no cero.
- `check-sdd --json` con warnings, problemas y spec inexistente.

## 4. Matriz de plataformas

Suite en Windows/Linux con Node 18/20/22 mediante GitHub Actions. El CLI no depende de utilidades
Unix ni del shell del host.

## 5. Benchmark

Los mismos prompts y fixtures se ejecutan contra skills de `v0.6.0` y candidatas. Se registran
tokens totales, duración, tool calls, artefactos y grading. La mediana se calcula por caso y global;
calidad distinta implica descarte aunque la reducción sea mayor.
