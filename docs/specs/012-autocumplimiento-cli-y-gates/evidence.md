# Evidencia · 012-autocumplimiento-cli-y-gates

| Campo | Valor |
|---|---|
| **Estado** | cerrada |
| **Veredicto** | GO |
| **Actualizado** | 2026-08-17 |

## Resultados por tarea

| Tarea | Test / gate | Resultado | Evidencia |
|---|---|---|---|
| T-012-01 | RED de degradación, error JSON, ayuda y gates | PASS · los cinco casos fallaron primero por capacidad ausente del CLI y por gates sin declarar | `declared-direct` · historial TDD de `scripts/test-install.mjs` |
| T-012-02 | `scripts/test-install.mjs::cli_degrada_sin_estado_instalado` | PASS · `product-status` y `docs-status` responden sin registro; el registro corrupto sigue fallando | `declared-direct` · suite completa en verde |
| T-012-03 | `scripts/test-install.mjs::cli_error_json_es_maquina_legible` | PASS · `stderr` lleva una línea JSON con `ok:false`, `stdout` queda limpio y sin `--json` el texto humano no cambia | `declared-direct` · suite completa en verde |
| T-012-04 | `scripts/test-install.mjs::cli_ayuda_explica_comandos` | PASS · `--help`, `-h` y `help` salen con 0; la invocación desnuda sigue resolviendo a `status` | `declared-direct` · suite completa en verde |
| T-012-05 | `scripts/test-install.mjs::gates_declarados_son_ejecutables` | PASS · `run --fast` ejecuta `sdd`, `lint`, `test` y `build` en verde; `security` y `e2e` quedan lentos | `declared-direct` · `run --fast` exit 0 |
| T-012-06 | `scripts/test-install.mjs::gates_no_configurados_tienen_motivo` | PASS · los ocho identificadores de `unconfigured` tienen motivo material en `TEST-STRATEGY.md` §10 | `declared-direct` · suite completa en verde |

## Controles de seguridad

| Control | Tarea | Test | Resultado |
|---|---|---|---|
| SEC-CLI-001 | T-012-02 | `scripts/test-install.mjs::cli_degrada_sin_estado_instalado` | PASS |
| SEC-CLI-002 | T-012-03 | `scripts/test-install.mjs::cli_error_json_es_maquina_legible` | PASS |
| SEC-CLI-003 | T-012-05 | `scripts/test-install.mjs::gates_declarados_son_ejecutables` | PASS |

## Controles de usabilidad

| Control | Tarea | Test | Resultado |
|---|---|---|---|
| UX-COPY-001 | T-012-04 | `scripts/test-install.mjs::cli_ayuda_explica_comandos` | PASS |
| UX-COPY-002 | T-012-03 | `scripts/test-install.mjs::cli_error_json_es_maquina_legible` | PASS |

## Trazabilidad documental

| DOC-ID | Tarea | Artefacto | Comprobación | Resultado |
|---|---|---|---|---|
| DOC-CLI | T-012-06 | `docs/quality/TEST-STRATEGY.md` | `scripts/test-install.mjs::gates_no_configurados_tienen_motivo` | PASS |

## Gates locales

| Gate | Comando | Resultado |
|---|---|---|
| `sdd` | `node scripts/check-sdd.mjs` | PASS |
| `lint` | `node scripts/check-syntax.mjs` | PASS · 19 ficheros sin problemas |
| `test` | `node scripts/test-hooks.mjs && node scripts/check-syntax.mjs --selftest` | PASS · 85/85 y 7/7 |
| `build` | `node scripts/skills-sync.mjs --check` | PASS |
| `security` | `node scripts/scan-secrets.mjs --json` | PASS |
| `e2e` | `node scripts/test-install.mjs` | PASS |

## Controles NO ejecutados

| Control | Motivo |
|---|---|
| UX-A11Y-001 | declarado `no` en el plan: la superficie es una línea de comandos, sin foco, contraste ni orden de tabulación que auditar |
| UX-FORM-001 | declarado `no` en el plan: el CLI no presenta formularios ni campos de entrada |

<!-- sdd-security-report:v1
{
  "schemaVersion": 1,
  "spec": "012-autocumplimiento-cli-y-gates",
  "verdict": "GO",
  "standards": { "owaspTop10": "2025", "asvs": "5.0.0", "level": "L2" },
  "controls": [
    { "id": "SEC-CLI-001", "asvs": "V1.2.4", "owasp": "A01:2025", "result": "pass" },
    { "id": "SEC-CLI-002", "asvs": "V7.4.1", "owasp": "A09:2025", "result": "pass" },
    { "id": "SEC-CLI-003", "asvs": "V15.3.5", "owasp": "A03:2025", "result": "pass" }
  ],
  "findings": []
}
-->

## Corrección append-only · 2026-08-21 · T-012-05

Se conserva T-012-05 como tarea histórica cerrada y se registra esta regresión sin reescribir
su estado ni la evidencia original. En Windows, `tmpdir()` puede pertenecer a una unidad distinta
de la raíz del repositorio; recomponer una ruta absoluta con `join(ROOT, ruta)` hacía que el
autotest rechazase un módulo sintácticamente válido.

| Fase | Comando | Resultado real |
|---|---|---|
| RED | `node scripts/check-syntax.mjs --selftest` | FAIL · `✗ ruta absoluta con sintaxis válida aceptada` · `1 comprobación(es) fallida(s)` |
| GREEN | `node scripts/check-syntax.mjs --selftest` | PASS · siete comprobaciones, incluida `✓ ruta absoluta con sintaxis válida aceptada` |
| Suite pertinente | `npm test` | PASS · `181 correcta(s) · 0 fallo(s)` y autotest completo en verde |
| Gate rápido | `node scripts/sdd-project.mjs run --fast` | FAIL ajeno a esta corrección · `sdd`, `lint`, `test` y `build` verdes; `smells` rechaza el cambio staged preexistente en `scripts/test-install.mjs` (3832 líneas, máximo 3831) |

**SEC-CLI-003:** verificado para esta corrección: el linter sigue invocando `node --check`
mediante `argv` sin shell y no amplía los comandos configurables. El gate global queda pendiente
de que el propietario de la reconciliación staged resuelva el trinquete de tamaño citado.
