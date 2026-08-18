# Evidencia · 014-gates-propios-y-medicion

| Campo | Valor |
|---|---|
| **Spec** | [`spec.md`](./spec.md) · **Plan**: [`plan.md`](./plan.md) · **Tareas**: [`tasks.md`](./tasks.md) |
| **Estado** | implementación completa · entrega pendiente de decisión humana |
| **Entorno** | Windows · Node.js 18+ · sin dependencias externas |

## 1. Ejecuciones

| Comando | Resultado | Fecha |
|---|---|---|
| `node scripts/check-coverage.mjs --selftest` | PASS · el cálculo se comporta como se documenta | 2026-08-18 |
| `node scripts/check-a11y.mjs --selftest` | PASS · las seis reglas detectan su incumplimiento | 2026-08-18 |
| `node scripts/check-smells.mjs --selftest` | PASS · la cuenta ignora llaves en cadenas y comentarios | 2026-08-18 |
| `node scripts/check-coverage.mjs` | PASS · 51,3 % sobre 2756 línea(s) · umbral 48,3 % | 2026-08-18 |
| `node scripts/check-a11y.mjs` | rojo inicial · 2 hallazgos `nombre-accesible` en `site/index.html`, resueltos como falso positivo de la regla; verde final · 3 página(s) | 2026-08-18 |
| `node scripts/check-smells.mjs` | PASS · mayor fichero 3628 línea(s) · mayor función 304 | 2026-08-18 |
| `node scripts/test-hooks.mjs` | rojo inicial · `ERR_MODULE_NOT_FOUND` de `scripts/lib/coverage-v8.mjs`; verde final · PASS · 155 correcta(s), 0 fallo(s) | 2026-08-18 |
| `node scripts/test-install.mjs` | rojo inicial · `.sdd/coverage.json` y `.sdd/smells.json` filtraban al destino los umbrales y fechas medidos aquí; verde final · PASS · 422 correcta(s), 0 fallo(s) | 2026-08-18 |
| `node scripts/check-sdd.mjs --strict --spec 014` | PASS · 7 tarea(s) hecha(s), 0 avisos | 2026-08-18 |
| `node scripts/sdd-project.mjs trace-status --spec 014 --json` | PASS · `complete: true`, `missing: 0`, sin huérfanos | 2026-08-18 |
| `node scripts/sdd-project.mjs run --fast` | PASS · 5 check(s): sdd, lint, test, build, smells | 2026-08-18 |
| `node scripts/sdd-project.mjs run --slow` | por ejecutar al cerrar la spec | — |

El rojo inicial de `check-a11y` merece constar porque el diagnóstico correcto no fue el
evidente: los dos controles señalados estaban envueltos en un `<label>`, que da nombre accesible
implícito. El defecto era de la regla, no del sitio. Se corrigió la regla y se añadió el caso al
autotest, en lugar de tocar el marcado para contentar al verificador.

El rojo de la suite del instalador es el segundo hallazgo material: los dos ficheros de
configuración nuevos llevaban al destino el umbral de cobertura y el techo de tamaño **medidos en
esta plantilla**. Un número medido aquí no significa nada en otro repositorio, y bloquear a un
proyecto el primer día con él es la forma más rápida de que desactive el gate. Ambos pasan a
instalarse como semilla neutra —sin suites y sin techo— y los dos verificadores tratan ese estado
como aviso explícito de que todavía no miden, no como verde.


## 2. Trazabilidad requisito → test

| Objetivo | PRD-RF | Caso de uso | RF | CA | Tarea | Test | Resultado |
|---|---|---|---|---|---|---|---|
| OBJ-002 | PRD-RF-003 | UC-004 | RF-01 | CA-01 | T-014-01 | `scripts/test-hooks.mjs::la_cobertura_no_lee_fuera_del_repositorio` | PASS |
| OBJ-002 | PRD-RF-003 | UC-004 | RF-02 | CA-02 | T-014-02 | `scripts/test-install.mjs::los_gates_nuevos_no_invocan_shell` | PASS |
| OBJ-002 | PRD-RF-003 | UC-004 | RF-02 | CA-02 | T-014-03 | `scripts/test-install.mjs::el_fallo_de_cobertura_dice_que_falta` | PASS |
| OBJ-002 | PRD-RF-004 | UC-004 | RF-03 | CA-03 | T-014-04 | `scripts/test-install.mjs::el_sitio_publicado_pasa_su_propia_auditoria` | PASS |
| OBJ-003 | PRD-RF-006 | UC-001 | RF-05 | CA-05 | T-014-05 | `scripts/test-install.mjs::cada_ausencia_declara_su_clase` | PASS |
| OBJ-003 | PRD-RF-006 | UC-001 | RF-06 | CA-06 | T-014-06 | `scripts/test-install.mjs::un_motivo_caducado_falla` | PASS |
| OBJ-002 | PRD-RF-004 | UC-004 | RF-04, RF-07 | CA-04, CA-07 | T-014-07 | `scripts/test-install.mjs::el_peaje_rapido_sigue_siendo_rapido` | PASS |

## 2.1 Evidencia por tarea

| Tarea | Test | Resultado | Trazabilidad |
|---|---|---|---|
| T-014-01 | `scripts/test-hooks.mjs::la_cobertura_no_lee_fuera_del_repositorio` | PASS | `declared-direct` · plan.md#D-01 |
| T-014-02 | `scripts/test-install.mjs::los_gates_nuevos_no_invocan_shell` | PASS | `declared-direct` · plan.md#D-01 |
| T-014-03 | `scripts/test-install.mjs::el_fallo_de_cobertura_dice_que_falta` | PASS | `declared-direct` · plan.md#D-03 |
| T-014-04 | `scripts/test-install.mjs::el_sitio_publicado_pasa_su_propia_auditoria` | PASS | `declared-direct` · plan.md#D-03 |
| T-014-05 | `scripts/test-install.mjs::cada_ausencia_declara_su_clase` | PASS | `declared-direct` · plan.md#D-05 |
| T-014-06 | `scripts/test-install.mjs::un_motivo_caducado_falla` | PASS | `declared-direct` · plan.md#D-05 |
| T-014-07 | `scripts/test-install.mjs::el_peaje_rapido_sigue_siendo_rapido` | PASS | `declared-direct` · plan.md#D-06 |

El umbral de cobertura se fijó **después** de medir, no antes: 51,3 % medido, margen de 3 puntos
declarado en `.sdd/coverage.json`, umbral resultante 48,3 %. Un umbral aspiracional habría
nacido en rojo y se habría desactivado en la primera semana, que es cómo mueren los trinquetes.

## 2.2 Gates humanos

| Gate | Estado | Quién | Fecha |
|---|---|---|---|
| Spec sin ambigüedades | aprobado | usuario | 2026-08-18 |
| Plan técnico | aprobado | usuario | 2026-08-18 |
| Entrega final | por solicitar | — | — |

## 3. Controles NO ejecutados

Ninguno de los controles aplicables quedó sin ejecutar: los dos de seguridad y los dos de
usabilidad que el plan marca como aplicables se ejecutaron y salieron en verde.

Cuatro controles del catálogo se declararon **no aplicables** en el plan, con su motivo, y por
eso no tienen test asociado. Se listan aquí para que la ausencia sea explícita y no un descuido:

| Control | Aplica | Motivo |
|---|---|---|
| SEC-CLI-004 | no | Esta spec no añade ejecución de programas externos con entrada del usuario. Los tres verificadores invocan `git` y suites propias mediante `spawnSync` con argumentos ya separados, sin construir cadenas de comando. |
| SEC-TERR-001 | no | Esta spec no modifica el reparto de territorios ni la resolución de rutas de la guarda de escritura, que la spec 013 ya verifica. |
| UX-COPY-002 | no | El mensaje de la auditoría de trazas no se toca en esta spec; los mensajes nuevos son los de cobertura y accesibilidad, cubiertos por UX-COPY-003 y UX-A11Y-002. |
| UX-FORM-001 | no | Esta spec no añade formularios ni entrada interactiva; la entrada son argumentos de comando y ficheros de configuración versionados. |

### 3.0 Evidencia documental

<a id="DOC-QUALITY"></a>
**DOC-QUALITY** · `docs/quality/TEST-STRATEGY.md` · tarea T-014-05 · `scripts/test-install.mjs::cada_ausencia_declara_su_clase` · PASS.

### 3.1 Controles de seguridad

<a id="SEC-COV-001"></a>
**SEC-COV-001** · A01:2025 · ASVS 5.0.0 V4.1.3 · T-014-01 · `scripts/test-hooks.mjs::la_cobertura_no_lee_fuera_del_repositorio` · PASS.

<a id="SEC-COV-002"></a>
**SEC-COV-002** · A03:2025 · ASVS 5.0.0 V1.14.6 · T-014-02 · `scripts/test-install.mjs::los_gates_nuevos_no_invocan_shell` · PASS.

<!-- sdd-security-report:v1
{
  "schemaVersion": 1,
  "spec": "014-gates-propios-y-medicion",
  "standards": { "asvs": "5.0.0", "owasp": "Top 10:2025" },
  "controlsEvaluated": ["SEC-COV-001", "SEC-COV-002"],
  "openFindings": { "critical": 0, "high": 0, "medium": 0, "low": 0 },
  "verdict": "PASS",
  "controlsNotExecuted": []
}
-->

### 3.2 Controles de usabilidad

<a id="UX-A11Y-002"></a>
**UX-A11Y-002** · WCAG 2.2 AA 1.3.1 · T-014-04 · `scripts/test-install.mjs::el_sitio_publicado_pasa_su_propia_auditoria` · PASS.

<a id="UX-COPY-003"></a>
**UX-COPY-003** · H9 · T-014-03 · `scripts/test-install.mjs::el_fallo_de_cobertura_dice_que_falta` · PASS.

<!-- sdd-usability-report:v1
{
  "schemaVersion": 1,
  "spec": "014-gates-propios-y-medicion",
  "standards": { "wcag": "2.2 AA" },
  "controlsEvaluated": ["UX-A11Y-002", "UX-COPY-003"],
  "openFindings": { "critical": 0, "high": 0, "medium": 0, "low": 0 },
  "verdict": "PASS",
  "controlsNotExecuted": []
}
-->

## 4. Lo que esta evidencia no demuestra

El 51,3 % de cobertura dice que esa proporción de líneas se recorre durante las suites. No dice
que su comportamiento esté probado: una línea recorrida sin aserción cuenta igual que una
verificada. El número sirve para detectar código que ninguna suite toca jamás, y para eso el
trinquete es útil; no sirve para afirmar que el repositorio está bien probado.

La auditoría de accesibilidad cubre lo que se puede decidir leyendo el marcado. No cubre
contraste calculado, foco visible ni orden de tabulación real, que exigen un navegador. Esa
carencia está declarada en `docs/quality/TEST-STRATEGY.md` como clase `pendiente` del gate
`visual`, no omitida.

El detector de olores mide tamaño, no complejidad. Se descartó la complejidad ciclomática a
propósito: aproximarla contando palabras clave produce un número que se baja reordenando sin
mejorar nada, y un número así acaba gestionándose en lugar de usarse.
