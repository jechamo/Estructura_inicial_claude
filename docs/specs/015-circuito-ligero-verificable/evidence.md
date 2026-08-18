# Evidencia · 015-circuito-ligero-verificable

| Campo | Valor |
|---|---|
| **Spec** | [`spec.md`](./spec.md) · **Plan**: [`plan.md`](./plan.md) · **Tareas**: [`tasks.md`](./tasks.md) |
| **Estado** | implementación completa · entrega pendiente de decisión humana |
| **Entorno** | Windows · Node.js 18+ · sin dependencias externas |

## 1. Ejecuciones

| Comando | Resultado | Fecha |
|---|---|---|
| `node scripts/check-sdd.mjs --circuit-status` | PASS · responde `full` y nombra las rutas que obligan al circuito completo | 2026-08-18 |
| `node scripts/check-sdd.mjs --circuit-status --json` | PASS · JSON con `circuito`, `obligan`, `total`, `frontera` | 2026-08-18 |
| `node scripts/test-hooks.mjs` | rojo inicial · `SyntaxError: Identifier 'motivoMaterial' has already been declared`; verde final · PASS · 181 correcta(s), 0 fallo(s) | 2026-08-18 |
| `node scripts/check-sdd.mjs --trace-audit --base HEAD~1` | PASS · sin regresión sobre la auditoría existente | 2026-08-18 |
| `node scripts/check-sdd.mjs` | rojo inicial · `superficie/sitio`: el sitio anunciaba 26 skills y el catálogo tenía 27; verde final | 2026-08-18 |
| `node scripts/test-install.mjs` | PASS · seis casos nuevos del circuito ligero | 2026-08-18 |
| `node scripts/check-sdd.mjs --strict --spec 015` | PASS · 7 tarea(s) hecha(s) | 2026-08-18 |
| `node scripts/sdd-project.mjs trace-status --spec 015 --json` | PASS · `complete: true`, `missing: 0` | 2026-08-18 |
| `node scripts/sdd-project.mjs run --fast` | PASS · el peaje rápido sigue tardando segundos | 2026-08-18 |
| `node scripts/sdd-project.mjs run --slow` | por ejecutar al cerrar la spec | — |

Dos hallazgos merecen constar.

El primero fue de diseño y salió del propio comando: al preguntar `--circuit-status` sobre el
árbol de trabajo de esta spec, la respuesta fue `full`. Es lo correcto y conviene subrayarlo —
el circuito ligero no puede usarse para introducirse a sí mismo, porque toca `scripts/`,
`.sdd/` y `docs/specs/`, las tres carpetas que la frontera prohíbe.

El segundo fue el rojo de `superficie/sitio`. La comprobación se escribió, se ejecutó y falló
inmediatamente señalando que el sitio publicado anunciaba 26 skills cuando ya había 27. Esa
deriva llevaba existiendo los pocos minutos que tardó en crearse `sdd-light`, pero demuestra
justo lo que la tarea T-015-07 afirma: la única superficie que ve alguien de fuera era la única
que nadie verificaba.

## 2. Trazabilidad requisito → test

| Objetivo | PRD-RF | Caso de uso | RF | CA | Tarea | Test | Resultado |
|---|---|---|---|---|---|---|---|
| OBJ-002 | PRD-RF-004 | UC-004 | RF-01 | CA-01 | T-015-01 | `scripts/test-hooks.mjs::la_negacion_prevalece_sobre_el_permiso` | PASS |
| OBJ-002 | PRD-RF-004 | UC-004 | RF-06 | CA-06 | T-015-02 | `scripts/test-install.mjs::circuit_status_nombra_lo_que_obliga_al_circuito_completo` | PASS |
| OBJ-002 | PRD-RF-003 | UC-004 | RF-03 | CA-03 | T-015-03 | `scripts/test-install.mjs::un_commit_ligero_que_miente_falla` | PASS |
| OBJ-002 | PRD-RF-003 | UC-004 | RF-04, RF-05 | CA-04, CA-05 | T-015-04 | `scripts/test-install.mjs::la_cuota_senala_la_frontera` | PASS |
| OBJ-002 | PRD-RF-004 | UC-004 | RF-02 | CA-02 | T-015-05 | `scripts/test-install.mjs::el_circuito_ligero_no_perdona_ningun_gate` | PASS |
| OBJ-002 | PRD-RF-004 | UC-004 | RF-02 | CA-02 | T-015-06 | `scripts/test-install.mjs::el_modelo_operativo_describe_el_circuito_ligero` | PASS |
| OBJ-003 | PRD-RF-006 | UC-001 | RF-07 | CA-07 | T-015-07 | `scripts/test-install.mjs::el_sitio_publicado_no_puede_mentir_sobre_el_catalogo` | PASS |

## 2.1 Evidencia por tarea

| Tarea | Test | Resultado | Trazabilidad |
|---|---|---|---|
| T-015-01 | `scripts/test-hooks.mjs::la_negacion_prevalece_sobre_el_permiso` | PASS | `declared-direct` · plan.md#D-01 |
| T-015-02 | `scripts/test-install.mjs::circuit_status_nombra_lo_que_obliga_al_circuito_completo` | PASS | `declared-direct` · plan.md#D-06 |
| T-015-03 | `scripts/test-install.mjs::un_commit_ligero_que_miente_falla` | PASS | `declared-direct` · plan.md#D-04 |
| T-015-04 | `scripts/test-install.mjs::la_cuota_senala_la_frontera` | PASS | `declared-direct` · plan.md#D-05 |
| T-015-05 | `scripts/test-install.mjs::el_circuito_ligero_no_perdona_ningun_gate` | PASS | `declared-direct` · plan.md#D-08 |
| T-015-06 | `scripts/test-install.mjs::el_modelo_operativo_describe_el_circuito_ligero` | PASS | `declared-direct` · plan.md#D-02 |
| T-015-07 | `scripts/test-install.mjs::el_sitio_publicado_no_puede_mentir_sobre_el_catalogo` | PASS | `declared-direct` · plan.md#D-07 |

La frontera de este repositorio nació deliberadamente pequeña: guías, README, runbooks y las
tres páginas del sitio. Es más fácil ampliarla con evidencia de que un atajo no hizo daño que
recortarla después de que sí lo hiciera. La instalación nueva es aún más restrictiva: la semilla
de `.sdd/lightweight.json` llega con `permitido` vacío, de modo que un proyecto recién instalado
no tiene circuito ligero hasta que alguien decida, explícitamente, qué rutas lo merecen.

## 2.2 Gates humanos

| Gate | Estado | Quién | Fecha |
|---|---|---|---|
| Spec sin ambigüedades | aprobado | usuario | 2026-08-18 |
| Plan técnico | aprobado | usuario | 2026-08-18 |
| Entrega final | por solicitar | — | — |

## 3. Controles NO ejecutados

Ninguno de los controles aplicables quedó sin ejecutar: los tres de seguridad y los dos de
usabilidad que el plan marca como aplicables se ejecutaron y salieron en verde.

Cuatro controles del catálogo se declararon **no aplicables** en el plan, con su motivo:

| Control | Aplica | Motivo |
|---|---|---|
| SEC-COV-001 | no | El cálculo del circuito es puro: no lee ficheros ni recorre el disco, así que no puede leer fuera del repositorio. |
| SEC-TERR-001 | no | Esta spec no modifica el reparto de territorios; el circuito ligero se evalúa además del reparto, nunca en su lugar. |
| UX-A11Y-002 | no | El bloque añadido al sitio no introduce controles interactivos nuevos; el gate `a11y` lo cubre con las reglas ya existentes. |
| UX-FORM-001 | no | Esta spec no añade formularios; la entrada son argumentos de comando, un fichero versionado y trailers de commit. |

### 3.0 Evidencia documental

<a id="DOC-CIRCUITO"></a>
**DOC-CIRCUITO** · `docs/sdd/OPERATING-MODEL.md` · tarea T-015-06 · `scripts/test-install.mjs::el_modelo_operativo_describe_el_circuito_ligero` · PASS.

### 3.1 Controles de seguridad

<a id="SEC-LIGHT-001"></a>
**SEC-LIGHT-001** · A01:2025 · ASVS 5.0.0 V8.1.1 · T-015-01 · `scripts/test-hooks.mjs::la_negacion_prevalece_sobre_el_permiso` · PASS.

<a id="SEC-LIGHT-002"></a>
**SEC-LIGHT-002** · A04:2025 · ASVS 5.0.0 V1.4.1 · T-015-01 · `scripts/test-hooks.mjs::sin_frontera_no_hay_circuito_ligero` · PASS.

<a id="SEC-LIGHT-003"></a>
**SEC-LIGHT-003** · A09:2025 · ASVS 5.0.0 V7.1.1 · T-015-03 · `scripts/test-install.mjs::un_commit_ligero_que_miente_falla` · PASS.

<!-- sdd-security-report:v1
{
  "schemaVersion": 1,
  "spec": "015-circuito-ligero-verificable",
  "standards": { "asvs": "5.0.0", "owasp": "Top 10:2025" },
  "controlsEvaluated": ["SEC-LIGHT-001", "SEC-LIGHT-002", "SEC-LIGHT-003"],
  "openFindings": { "critical": 0, "high": 0, "medium": 0, "low": 0 },
  "verdict": "PASS",
  "controlsNotExecuted": []
}
-->

### 3.2 Controles de usabilidad

<a id="UX-COPY-004"></a>
**UX-COPY-004** · H1 · T-015-02 · `scripts/test-install.mjs::circuit_status_nombra_lo_que_obliga_al_circuito_completo` · PASS.

<a id="UX-COPY-005"></a>
**UX-COPY-005** · H9 · T-015-04 · `scripts/test-install.mjs::la_cuota_senala_la_frontera` · PASS.

<!-- sdd-usability-report:v1
{
  "schemaVersion": 1,
  "spec": "015-circuito-ligero-verificable",
  "standards": { "wcag": "2.2 AA" },
  "controlsEvaluated": ["UX-COPY-004", "UX-COPY-005"],
  "openFindings": { "critical": 0, "high": 0, "medium": 0, "low": 0 },
  "verdict": "PASS",
  "controlsNotExecuted": []
}
-->

## 4. Lo que esta evidencia no demuestra

No demuestra que el circuito ligero ahorre tokens. Es la razón por la que se propuso, pero
medirlo exigiría instrumentar los hosts, y una cifra estimada a ojo en un documento de evidencia
vale menos que no decir nada. Queda declarado como intención, no como resultado.

No demuestra que la frontera esté bien trazada. Demuestra que existe, que se respeta y que
mentir sobre ella falla. Si `docs/guides/` resulta ser un sitio peligroso para saltarse la spec,
estos tests seguirán en verde mientras el daño ocurre. La cuota es lo único que apunta en esa
dirección, y apunta tarde y de forma agregada.

Tampoco demuestra que nadie vaya a rodear el sistema entero. Quien no escriba los trailers cae
en `no-auditable`, no en `infractor`: ese estado existe desde la spec 013 para no convertir el
historial previo en un campo de minas, y sigue siendo la vía de escape real. El circuito ligero
la reduce dándole una alternativa legítima, no la cierra.

La comprobación de la séptima superficie verifica inventario y recuentos, no prosa. Que el sitio
liste `sdd-light` no garantiza que la describa bien; eso sigue siendo trabajo humano, a
propósito.
