# Evidencia · 013-verificacion-independiente-del-host

| Campo | Valor |
|---|---|
| **Spec** | [`spec.md`](./spec.md) · **Plan**: [`plan.md`](./plan.md) · **Tareas**: [`tasks.md`](./tasks.md) |
| **Estado** | implementación completa · entrega pendiente de decisión humana |
| **Entorno** | Windows · Node.js 18+ · sin dependencias externas |

## 1. Ejecuciones

| Comando | Resultado | Fecha |
|---|---|---|
| `node scripts/check-sdd.mjs --strict --spec 013` | rojo inicial: DOC-TRACE sin resultado documental y tres controles no aplicables sin declarar; corregido · PASS · 7 tarea(s) hecha(s), 0 avisos | 2026-08-18 |
| `node scripts/test-hooks.mjs` | PASS · 146 correcta(s), 0 fallo(s) | 2026-08-18 |
| `node scripts/test-install.mjs` | rojo inicial: 2 fallos de contrato y 83 en cascada por el manifiesto; verde final: PASS · 386 correcta(s), 0 fallo(s) | 2026-08-18 |
| `node scripts/sdd-project.mjs trace-status --spec 013 --json` | PASS · `complete: true`, `missing: 0`, sin huérfanos | 2026-08-18 |
| `node scripts/sdd-project.mjs run --fast` | PASS · 4 check(s): sdd, lint, test, build | 2026-08-18 |
| `node scripts/sdd-project.mjs run --slow` | por ejecutar al cerrar la spec | — |

## 2. Trazabilidad requisito → test

| Objetivo | PRD-RF | Caso de uso | RF | CA | Tarea | Test | Resultado |
|---|---|---|---|---|---|---|---|
| OBJ-001 | PRD-RF-001 | UC-003 | RF-01 | CA-01 | T-013-01 | `scripts/test-hooks.mjs::la_normalizacion_de_ruta_no_elude_el_territorio` | PASS |
| OBJ-001 | PRD-RF-001 | UC-003 | RF-02 | CA-02 | T-013-02 | `scripts/test-hooks.mjs::un_reparto_corrupto_no_degrada_a_permitir` | PASS |
| OBJ-003 | PRD-RF-006 | UC-001 | RF-03 | CA-03 | T-013-03 | `scripts/test-hooks.mjs::el_rechazo_por_territorio_dice_quien_que_y_de_quien` | PASS |
| OBJ-002 | PRD-RF-003 | UC-004 | RF-04 | CA-04 | T-013-04 | `scripts/test-install.mjs::el_trailer_no_suplanta_ni_inyecta` | PASS |
| OBJ-002 | PRD-RF-003 | UC-004 | RF-05 | CA-05 | T-013-05 | `scripts/test-install.mjs::el_fallo_de_auditoria_ensena_como_arreglarlo` | PASS |
| OBJ-002 | PRD-RF-003 | UC-004 | RF-06 | CA-06 | T-013-06 | `scripts/test-hooks.mjs::la_autoria_no_escribe_fuera_del_repositorio` | PASS |
| OBJ-001 | PRD-RF-001 | UC-003 | RF-07 | CA-07 | T-013-07 | `scripts/test-install.mjs::el_repositorio_declara_modo_restrictivo` | PASS |

## 2.1 Evidencia por tarea

| Tarea | Test | Resultado | Trazabilidad |
|---|---|---|---|
| T-013-01 | `scripts/test-hooks.mjs::la_normalizacion_de_ruta_no_elude_el_territorio` | PASS | `declared-direct` · plan.md#D-01 |
| T-013-02 | `scripts/test-hooks.mjs::un_reparto_corrupto_no_degrada_a_permitir` | PASS | `declared-direct` · plan.md#D-02 |
| T-013-03 | `scripts/test-hooks.mjs::el_rechazo_por_territorio_dice_quien_que_y_de_quien` | PASS | `declared-direct` · plan.md#D-03 |
| T-013-04 | `scripts/test-install.mjs::el_trailer_no_suplanta_ni_inyecta` | PASS | `declared-direct` · plan.md#D-04 |
| T-013-05 | `scripts/test-install.mjs::el_fallo_de_auditoria_ensena_como_arreglarlo` | PASS | `declared-direct` · plan.md#D-04 |
| T-013-06 | `scripts/test-hooks.mjs::la_autoria_no_escribe_fuera_del_repositorio` | PASS | `declared-direct` · plan.md#D-05 |
| T-013-07 | `scripts/test-install.mjs::el_repositorio_declara_modo_restrictivo` | PASS | `declared-direct` · plan.md#D-06 |

T-013-06 lleva además `scripts/test-hooks.mjs::la_autoria_de_fichero_no_depende_del_ciclo_de_subagente`,
que fija el alcance: si la autoría de fichero vuelve al hook de subagente, cae de cinco entornos
a dos y ese test se pone rojo.

## 2.2 Gates humanos

| Gate | Estado | Quién | Fecha |
|---|---|---|---|
| Spec sin ambigüedades | aprobado | usuario | 2026-08-17 |
| Plan técnico | aprobado | usuario | 2026-08-17 |
| Entrega final | por solicitar | — | — |

## 3. Controles NO ejecutados

Ninguno de los controles aplicables quedó sin ejecutar: los cuatro de seguridad y los dos de
usabilidad que el plan marca como aplicables se ejecutaron y salieron en verde.

Tres controles del catálogo se declararon **no aplicables** en el plan, con su motivo, y por eso
no tienen test asociado. Se listan aquí para que la ausencia sea explícita y no un descuido:

| Control | Aplica | Motivo |
|---|---|---|
| SEC-CLI-004 | no | Esta spec no añade ejecución de programas externos ni interpolación de shell. La auditoría de trazas lee la salida de `git` mediante `spawnSync` con argumentos separados, sin construir cadenas de comando. |
| UX-A11Y-001 | no | La salida es de línea de comandos y no transmite información solo por color: cada estado lleva su palabra (`conforme`, `no auditable`, hallazgo). |
| UX-FORM-001 | no | Esta spec no añade formularios ni entrada interactiva; la entrada son argumentos de comando. |

### 3.0 Evidencia documental

<a id="DOC-TRACE"></a>
**DOC-TRACE** · `docs/sdd/OPERATING-MODEL.md` · tarea T-013-05 · `scripts/test-install.mjs::el_fallo_de_auditoria_ensena_como_arreglarlo` · PASS.

<a id="DOC-HOSTS"></a>
**DOC-HOSTS** · `docs/integrations/IDE-COMPATIBILITY.md` · tarea T-013-03 · `scripts/test-hooks.mjs::el_rechazo_por_territorio_dice_quien_que_y_de_quien` · PASS.

### 3.1 Controles de seguridad

<a id="SEC-TERR-001"></a>
**SEC-TERR-001** · A01:2025 · ASVS 5.0.0 V4.1.3 · T-013-01 · `scripts/test-hooks.mjs::la_normalizacion_de_ruta_no_elude_el_territorio` · PASS.

<a id="SEC-TERR-002"></a>
**SEC-TERR-002** · A01:2025 · ASVS 5.0.0 V1.2.2 · T-013-02 · `scripts/test-hooks.mjs::un_reparto_corrupto_no_degrada_a_permitir` · PASS.

<a id="SEC-TRACE-001"></a>
**SEC-TRACE-001** · A09:2025 · ASVS 5.0.0 V7.1.1 · T-013-04 · `scripts/test-install.mjs::el_trailer_no_suplanta_ni_inyecta` · PASS.

<a id="SEC-TRACE-002"></a>
**SEC-TRACE-002** · A09:2025 · ASVS 5.0.0 V7.3.1 · T-013-06 · `scripts/test-hooks.mjs::la_autoria_no_escribe_fuera_del_repositorio` · PASS.

<!-- sdd-security-report:v1
{
  "schemaVersion": 1,
  "spec": "013-verificacion-independiente-del-host",
  "standards": { "asvs": "5.0.0", "owasp": "Top 10:2025" },
  "controlsEvaluated": ["SEC-TERR-001", "SEC-TERR-002", "SEC-TRACE-001", "SEC-TRACE-002"],
  "openFindings": { "critical": 0, "high": 0, "medium": 0, "low": 0 },
  "verdict": "PASS",
  "controlsNotExecuted": []
}
-->

### 3.2 Controles de usabilidad

<a id="UX-COPY-001"></a>
**UX-COPY-001** · H1 · T-013-03 · `scripts/test-hooks.mjs::el_rechazo_por_territorio_dice_quien_que_y_de_quien` · PASS.

<a id="UX-COPY-002"></a>
**UX-COPY-002** · H9 · T-013-05 · `scripts/test-install.mjs::el_fallo_de_auditoria_ensena_como_arreglarlo` · PASS.

<!-- sdd-usability-report:v1
{
  "schemaVersion": 1,
  "spec": "013-verificacion-independiente-del-host",
  "standards": { "wcag": "2.2 AA" },
  "controlsEvaluated": ["UX-COPY-001", "UX-COPY-002"],
  "openFindings": { "critical": 0, "high": 0, "medium": 0, "low": 0 },
  "verdict": "PASS",
  "controlsNotExecuted": []
}
-->
