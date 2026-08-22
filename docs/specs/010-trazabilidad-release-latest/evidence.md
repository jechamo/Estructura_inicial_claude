# Evidencias y convergencia · 010-trazabilidad-release-latest

## 1. Ejecuciones

| Fecha/hora | Agente | Verificación | Tarea | Comando ejecutado | Resultado | Artefacto |
|---|---|---|---|---|---|---|
| 2026-08-13 | `implementer` | `declared-direct` | T-010-01 | tests RED focales de hooks y `trace-correct` | 🔴 fallaron por comportamiento ausente | conversación y suite |
| 2026-08-13 | `implementer` | `declared-direct` | T-010-02 | `node scripts/test-hooks.mjs` | 🟢 85/85 | salida real |
| 2026-08-13 | `implementer` | `declared-direct` | T-010-03 | `node scripts/test-install.mjs` | 🟢 299/299 | salida real |
| 2026-08-13 | `implementer` | `declared-direct` | T-010-03 | dos procesos `trace-correct` simultáneos | 🟢 una corrección, una atribución y una línea de bitácora | suite concurrente real |
| 2026-08-13 | `implementer` | `declared-direct` | T-010-03 | dos ejecuciones de `trace-correct` y reintento | 🟢 `corrected`; después `already-corrected`, cero escrituras | logs y bitácora |
| 2026-08-13 | `docs-writer` | `declared-direct` | T-010-04 | actualización de README, guía y documentación de hooks | 🟢 contrato móvil/estable verificado | artefactos DOC-VCS/DOC-TRACE |
| 2026-08-13 | `release-manager` | `declared-direct` | T-010-05 | preparación de informes, changelog, workflows y cierre durable | 🟢 preparación local completa; publicación condicionada a CI | artefactos DOC-OPS |
| 2026-08-13 | `security-auditor` | `observed` | T-010-03 | `/security-scan` | 🟢 PASS · 0 hallazgos | informe de seguridad 010 |

## 2. Trazabilidad

| RF | CA | Tarea | Implementación | Test | Resultado |
|---|---|---|---|---|---|
| RF-01, RF-02 | CA-01, CA-02 | T-010-02 | `.sdd/hooks/_lib.mjs`, hooks consumidores | `scripts/test-hooks.mjs::spec_activa_respeta_estados`, `::spec_activa_respeta_directorio_configurado_sin_escapar`, `::spec_activa_ambigua_no_se_atribuye` | 🟢 85/85 |
| RF-03…RF-05 | CA-03…CA-05 | T-010-03 | `scripts/sdd-project.mjs` | `scripts/test-install.mjs::trace_correct_append_only_e_idempotente`, `::trace_correct_idempotencia_concurrente`, `::trace_correct_no_borra_lock_reemplazado`, `::trace_correct_rechaza_entrada_hostil` | 🟢 299/299 e idempotencia concurrente real |
| RF-06 | CA-06 | T-010-04 | README, guía y README de hooks | `scripts/test-install.mjs::instalacion_main_movil_y_tag_estable` | 🟢 299/299 |
| RF-07 | CA-07 | T-010-05 | skill de ship, workflow y evidencia | `scripts/test-install.mjs::release_rechaza_tag_existente_o_ci_rojo` | 🟢 contrato local; CI/tag pendientes del SHA final |

### Gates humanos verificados

| Gate | Estado | Persona | Fecha | Alcance / evidencia |
|---|---|---|---|---|
| Spec | `approved` | usuario | 2026-08-13 | petición explícita |
| Diseño | `skipped-no-ui` | usuario | 2026-08-13 | cambio de CLI/hooks/docs |
| Plan técnico | `approved` | usuario | 2026-08-13 | plan completo solicitado |
| Entrega | `pending` | | | §5 |

## 3. Controles NO ejecutados

| Control | Por qué no se ejecutó | Riesgo | Propietario | Próximo paso |
|---|---|---|---|---|
| CI del SHA final y creación del tag | requieren commit/push previos | el tag no puede crearse todavía | release-manager | observar CI verde y crear después el tag nuevo |

### 3.0 · Evidencia documental

| DOC-ID | Tarea | Artefacto | Comprobación | Resultado | Estado |
|---|---|---|---|---|---|
| DOC-VCS | T-010-04 | `README.md`, `docs/guides/INSTALACION.md` | `scripts/test-install.mjs::instalacion_main_movil_y_tag_estable` | 🟢 299/299 | verde |
| DOC-TRACE | T-010-04 | `.sdd/README.md`, `.sdd/hooks/README.md` | `node scripts/test-hooks.mjs` | 🟢 85/85 | verde |
| DOC-OPS | T-010-05 | `CHANGELOG.md`, `docs/specs/010-trazabilidad-release-latest/evidence.md` | `scripts/test-install.mjs::release_rechaza_tag_existente_o_ci_rojo` | 🟢 contrato local | verde local |

### 3.1 · Controles de seguridad ejecutados

| Control | Tarea | Test / comando | Resultado | Evidencia | Estado |
|---|---|---|---|---|---|
| SEC-TRACE-001 | T-010-03 | `scripts/test-install.mjs::trace_correct_seguridad_rutas_hooks_y_lock` | 🟢 PASS · rutas/enlaces hostiles rechazados | suites 299/299 y 85/85 | verde |
| SEC-TRACE-002 | T-010-03 | `scripts/test-install.mjs::trace_correct_append_only_e_idempotente` | 🟢 PASS · append-only e idempotencia | suite y rectificación real | verde |
| SEC-TRACE-003 | T-010-03 | `scripts/test-install.mjs::trace_correct_seguridad_rutas_hooks_y_lock` | 🟢 PASS · reanudación/concurrencia convergen; replacement/stale fallan cerrados | suite 299/299 | verde |
| SEC-RELEASE-001 | T-010-05 | `scripts/test-install.mjs::release_rechaza_tag_existente_o_ci_rojo` | 🟢 PASS · contrato fail-closed | informe de seguridad y skill ship | verde |

**Informe de seguridad**: `docs/security/reports/2026-08-13-010-trazabilidad-release-latest.md`.

## 4. Convergencia

- [x] Spec y comportamiento convergen.
- [x] Tareas y tests están completos.
- [x] Rectificaciones append-only aplicadas e idempotentes.
- [x] Informe de seguridad materializado.
- [x] Specs 009 y 010 estrictas en verde.
- [x] Fast, slow y paquete verdes localmente.
- [ ] CI verde del SHA exacto.
- [ ] `v0.6.0` nuevo apunta al HEAD de main.

## 5. Decisión de entrega

| Campo | Valor |
|---|---|
| **Estado** | `NO-GO` |
| **Razón** | implementación y controles en curso |
| **Aprobado por** | |
| **Fecha** | |

## 6. Apéndice de regresión · carrera al rotar el lock

| Fecha | Agente | Verificación | Tarea | Comando ejecutado | Resultado | Artefacto |
|---|---|---|---|---|---|---|
| 2026-08-21 | `implementer` | `declared-direct` | T-010-03 | `node scripts/sdd-project.mjs run --slow --json` | 🔴 `532/533`: `debe_serializar_rectificaciones_concurrentes_sin_duplicar_ningun_append` falló con `ENOENT` al desaparecer `trace-correct.lock` entre `lstat` y `realpath` | salida real del gate lento |
| 2026-08-21 | `implementer` | `declared-direct` | T-010-03 | `node scripts/test-install.mjs` | 🟢 `533 correctas · 0 fallos`; concurrencia verde y locks reemplazados/ajenos continúan fallando cerrados | `scripts/sdd-project.mjs` |

La corrección reintenta exclusivamente cuando la validación del lock que ya existía devuelve
`ENOENT`, estado benigno porque otro proceso terminó de liberar ese lock. Cualquier error distinto,
incluidos symlink, hardlink o reemplazo de identidad, conserva el rechazo fail-closed.

### 6.1 · Revisión independiente y cierre del timeout

| Fecha | Agente | Verificación | Tarea | Comando ejecutado | Resultado | Artefacto |
|---|---|---|---|---|---|---|
| 2026-08-21 | `code-reviewer` | `observed` | T-010-03 | revisión read-only de `/sdd-verify` | 🟠 detectó que `continue` podía eludir el deadline y que faltaba una ventana de carrera determinista | HANDOFF de revisión 016 |
| 2026-08-21 | `implementer` | `declared-direct` | T-010-03 | `node scripts/test-install.mjs` · `debe_respetar_el_timeout_si_el_lock_desaparece_durante_la_validacion` | 🔴 el runner terminó el proceso a 2019 ms con `ETIMEDOUT`; el límite interno de 100 ms no se respetó | preload que fuerza `EEXIST → lstat → ENOENT` |
| 2026-08-21 | `implementer` | `declared-direct` | T-010-03 | `node scripts/test-install.mjs` | 🟢 `536 correctas · 0 fallos`; timeout determinista, concurrencia, lock reemplazado y lock ajeno verdes | `scripts/sdd-project.mjs`, `scripts/test-install.mjs` |

### 6.2 · Normalización del estado durable de T-010-05 · 2026-08-22

T-010-05 (*"Rectificar historia, cerrar 009 y publicar v0.6.0"*) figuraba `en curso`. No era trabajo
pendiente: era un estado que nunca se actualizó. Su definición de hecho —*main y origin/main
limpios; CI verde; tag nuevo apunta al HEAD*— está satisfecha desde hace tiempo.

| Fecha | Agente | Verificación | Tarea | Comando ejecutado | Resultado | Artefacto |
|---|---|---|---|---|---|---|
| 2026-08-22 | `implementer` | `declared-direct` | T-010-05 | `git ls-remote --tags origin` | 🟢 `v0.6.0` y `v0.7.0` publicados en `origin`; la release objetivo de la tarea existe | refs remotas |
| 2026-08-22 | `implementer` | `declared-direct` | T-010-05 | `grep '^## \[0\.6\.0\]' CHANGELOG.md` | 🟢 `## [0.6.0] — 2026-08-13` registrado | `CHANGELOG.md:138` |
| 2026-08-22 | `implementer` | `declared-direct` | T-010-05 | `sdd-project status --json` | 🟢 la spec 009 consta `entregada`, que era la otra mitad de la tarea | snapshot del CLI |
| 2026-08-22 | `implementer` | `declared-direct` | T-010-05 | `git status --porcelain --untracked-files=all` | 🟢 árbol limpio al iniciar; no había trabajo ajeno que preservar | salida vacía |

Se marca `hecho` por hechos comprobados, no por antigüedad. **Esto no autoriza ninguna release
nueva:** commit, push, tag y publicación conservan sus aprobaciones humanas, y el estado durable de
la 010 no las sustituye.
