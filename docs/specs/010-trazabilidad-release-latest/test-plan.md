# Plan de test · 010-trazabilidad-release-latest

## 1. Alcance

Parser de tareas, selección inequívoca, auditoría sin spec, rectificación append-only, validación
hostil, documentación de las dos referencias Git y release. No prueba la red de npm en unitario;
el tarball y la instalación real se comprueban en la suite/entrega.

## 2. Mapa criterio → test

| RF | CA | Tarea | Comportamiento | Nivel | Test |
|---|---|---|---|---|---|
| RF-01 | CA-01 | T-010-02 | plain/bold cerrada; pendiente/en curso activa; directorio configurado confinado | unitario | `scripts/test-hooks.mjs::spec_activa_respeta_estados`, `::spec_activa_respeta_directorio_configurado_sin_escapar` |
| RF-02 | CA-02 | T-010-02 | cero/varias no se atribuyen | integración | `scripts/test-hooks.mjs::spec_activa_ambigua_no_se_atribuye` |
| RF-03, RF-05 | CA-03, CA-05 | T-010-03 | conserva, añade e idempotencia secuencial/concurrente | integración | `scripts/test-install.mjs::trace_correct_append_only_e_idempotente`, `::trace_correct_idempotencia_concurrente` |
| RF-04 | CA-04 | T-010-03 | entrada inválida falla cerrada | integración | `scripts/test-install.mjs::trace_correct_rechaza_entrada_hostil` |
| RF-06 | CA-06 | T-010-04 | main móvil/tag estable en guías | contrato | `scripts/test-install.mjs::instalacion_main_movil_y_tag_estable` |
| RF-07 | CA-07 | T-010-05 | gates, CI y tag | entrega | `scripts/test-install.mjs::release_rechaza_tag_existente_o_ci_rojo` |

## 3. Casos adversos

- IDs vacíos, inexistentes, duplicados, traversal y absolutos.
- Symlink en una carpeta de spec.
- Sesión ausente y motivo vacío/excesivo.
- Rectificación repetida.
- Estados sin bloque, bloque sin estado y `_TEMPLATE`.
- Dos specs abiertas simultáneamente.
- `SDD_SPECS_DIR` relativo válido y override que intenta salir del repositorio.
- Dos procesos rectificando simultáneamente la misma sesión.

## 4. Seguridad

| Control | Caso negativo | Test | Resultado seguro esperado |
|---|---|---|---|
| SEC-TRACE-001 | ID hostil, directorio o log enlazado | `scripts/test-install.mjs::trace_correct_seguridad_rutas_hooks_y_lock` | cero escrituras fuera y degradación confinada |
| SEC-TRACE-002 | motivo con saltos/JSON y repetición | `scripts/test-install.mjs::trace_correct_append_only_e_idempotente` | JSON válido, una sola corrección |
| SEC-TRACE-003 | fallo tras append, procesos simultáneos, lock reemplazado o stale | `scripts/test-install.mjs::trace_correct_seguridad_rutas_hooks_y_lock` | completa o falla cerrado sin duplicar/robar lock |
| SEC-RELEASE-001 | tag existente o CI rojo | `scripts/test-install.mjs::release_rechaza_tag_existente_o_ci_rojo` | no crear/mover tag |

## 5. Documentación

| DOC-ID | Tarea | Fuente | Artefacto | Comprobación | Resultado esperado |
|---|---|---|---|---|---|
| DOC-VCS | T-010-04 | npm/git | `README.md`, `docs/guides/INSTALACION.md` | `scripts/test-install.mjs::instalacion_main_movil_y_tag_estable` | dos comandos y semántica explícita |
| DOC-TRACE | T-010-04 | hooks/CLI | `.sdd/hooks/README.md`, `.sdd/README.md` | `node scripts/check-sdd.mjs --strict --spec 010` | contrato consistente |
| DOC-OPS | T-010-05 | release | `CHANGELOG.md`, evidencia | `scripts/test-install.mjs::release_rechaza_tag_existente_o_ci_rojo` | release verificable |

## 6. Criterio de suficiencia

Todos los caminos nuevos del parser y CLI se ejercitan en positivo, negativo e idempotencia.
Suites completas, paquete real, fast/slow y strict 009/010 deben quedar verdes.

## 7. No automatizado

La aprobación humana ya consta en la petición. La disponibilidad remota se comprueba tras push
mediante GitHub Actions y `git ls-remote`; no se simula como verde.
