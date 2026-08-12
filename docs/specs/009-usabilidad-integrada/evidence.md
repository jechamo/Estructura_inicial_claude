# Evidencias y convergencia · 009-usabilidad-integrada

> `execution-log.jsonl` es la bitácora **append-only** que registra qué subagente arrancó y
> terminó, escrita por los hooks y no por el modelo. Este documento resume la **evidencia
> técnica**: qué se ejecutó, con qué comando, con qué resultado.
>
> Regla: **"pasa" sin ejecución no es un resultado. "No ejecutado" sí lo es** — y se escribe.

---

## 1. Ejecuciones

| Fecha/hora | Agente | Verificación | Tarea | Comando ejecutado | Resultado | Artefacto |
|---|---|---|---|---|---|---|
| 2026-08-12 | `implementer` | `declared-direct` | T-009-09 | `node scripts/check-sdd.mjs --strict --spec 910` (fixture negativo en scratchpad) | 🔴 17 problemas: matriz incompleta, ID inválido, A11Y sin criterio WCAG, `no aplica` sin justificación y trazabilidad rota | salida en la conversación |
| 2026-08-12 | `implementer` | `declared-direct` | T-009-09 | `node scripts/check-sdd.mjs --strict --spec 910` con `GO` e informe con ALTO, MEDIO y control no ejecutado | 🔴 bloquea por estándar degradado, controles no evaluados, CRÍTICO/ALTO y `PASS` con MEDIO | salida en la conversación |
| 2026-08-12 | `implementer` | `declared-direct` | T-009-09 | `node scripts/check-sdd.mjs --strict --spec 910` con ruta `docs/design/reports/../../../etc/x.md` | 🔴 `usabilidad/informe`: ruta de informe no permitida | salida en la conversación |
| 2026-08-12 | `implementer` | `declared-direct` | T-009-11 | `node scripts/test-install.mjs` | 🟢 258/259 · el único fallo (`idempotentes docs.json`) se reprodujo en un worktree de `HEAD`: es previo a esta spec | salida en la conversación |
| 2026-08-12 | `implementer` | `declared-direct` | T-009-08 | `node scripts/test-hooks.mjs` | 🟢 71/71 | salida en la conversación |
| 2026-08-12 | `implementer` | `declared-direct` | T-009-02 | `node scripts/check-sdd.mjs --strict --spec 009` | 🟢 estructura, trazabilidad y evidencia verificadas | salida en la conversación |
| 2026-08-12 | `implementer` | `declared-direct` | T-009-08 | `node scripts/sdd-project.mjs run --fast` | 🟢 PASS · 1 check (`sdd`) | salida en la conversación |
| 2026-08-12 | `implementer` | `declared-direct` | T-009-08 | `node scripts/sdd-project.mjs run --slow` | 🟢 PASS · `security` · 381 ficheros, 0 hallazgos | salida en la conversación |
| 2026-08-12 | `implementer` | `declared-direct` | T-009-08 | `node scripts/sdd-project.mjs detect` sobre un `package.json` con `pa11y` | 🟢 sugiere `a11y → npm run pa11y` | salida en la conversación |
| 2026-08-12 | `implementer` | `declared-direct` | T-009-06 | Recuento de perfiles en los seis directorios de agentes | 🟢 20/20/20/20/20/20 | salida en la conversación |

**Verificación**: `observed` (hooks vieron el subagente) · `declared-direct` (el agente activo
trabajó él mismo) · `unverified` (delegación afirmada pero no observada — documenta por qué).

## 2. Trazabilidad requisito → test

| OBJ | PRD-RF | UC | RF | CA | Tarea | Implementación | Test | Resultado |
|---|---|---|---|---|---|---|---|---|
| OBJ-001 | PRD-RF-001 | UC-001 | RF-01 | CA-01 | T-009-02 | | `scripts/test-install.mjs::usabilidad_versionada` | ⏳ |
| OBJ-001 | PRD-RF-001 | UC-001 | RF-02 | CA-02 | T-009-09 | | `scripts/test-install.mjs::matriz_usabilidad` | ⏳ |
| OBJ-001 | PRD-RF-001 | UC-001 | RF-02 | CA-03 | T-009-09 | | `scripts/test-install.mjs::matriz_usabilidad` | ⏳ |
| OBJ-001 | PRD-RF-001 | UC-001 | RF-03 | CA-04 | T-009-03 | | `scripts/test-install.mjs::matriz_usabilidad` | ⏳ |
| OBJ-001 | PRD-RF-001 | UC-001 | RF-04 | CA-05 | T-009-04 | | `scripts/test-install.mjs::gate_a11y_e_informe` | ⏳ |
| OBJ-001 | PRD-RF-001 | UC-001 | RF-05 | CA-06 | T-009-09 | | `scripts/test-install.mjs::gate_a11y_e_informe` | ⏳ |
| OBJ-001 | PRD-RF-001 | UC-001 | RF-05 | CA-07 | T-009-09 | | `scripts/test-install.mjs::gate_a11y_e_informe` | ⏳ |
| OBJ-001 | PRD-RF-001 | UC-001 | RF-06 | CA-08 | T-009-01 | | `scripts/test-install.mjs::portabilidad_usabilidad` | ⏳ |
| OBJ-001 | PRD-RF-001 | UC-001 | RF-07 | CA-09 | T-009-06 | | `scripts/test-install.mjs::portabilidad_usabilidad` | ⏳ |
| OBJ-001 | PRD-RF-001 | UC-001 | RF-08 | CA-10 | T-009-05 | | `scripts/test-install.mjs::portabilidad_usabilidad` | ⏳ |
| OBJ-001 | PRD-RF-001 | UC-001 | RF-09 | CA-11 | T-009-08 | | `scripts/test-hooks.mjs` | ⏳ |
| OBJ-001 | PRD-RF-001 | UC-001 | RF-10 | CA-12 | T-009-09 | | `scripts/test-install.mjs::matriz_usabilidad` | ⏳ |

- [ ] Todo `CA` de la spec aparece en esta tabla
- [ ] Cada test citado se ha ejecutado y su salida está arriba
- [ ] Ningún OBJ, PRD-RF, UC, RF, CA o tarea referenciado es huérfano

### Gates humanos verificados

| Gate | Estado | Persona | Fecha | Alcance / evidencia |
|---|---|---|---|---|
| Producto | `legacy-pending` | | | `docs/product/PRD.md` |
| Spec | `pending` | | | `spec.md` §14 |
| Diseño | `skipped-no-ui` | | | La plantilla no tiene interfaz gráfica; su superficie es documental y de CLI |
| Plan técnico | `pending` | | | `plan.md` §16 |
| Entrega | `pending` | | | §5 |

## 3. Controles NO ejecutados

> La sección más importante y la que todo el mundo omite. Un control que no se corrió
> no es un control aprobado: es un riesgo sin dueño.

| Control | Por qué no se ejecutó | Riesgo que queda abierto | Propietario | Próximo paso |
|---|---|---|---|---|
| Cobertura por tier | El repositorio no tiene runner de cobertura configurado | Un camino nuevo de `check-sdd.mjs` podría quedar sin ejercitar sin que nadie lo note | `<pendiente de asignar>` | Verificar por caminos ejercitados en `test-install.mjs`; declarar la limitación en el informe |
| Efecto real de las reglas de IDE | No hay forma de automatizar la carga de reglas de Cursor o Copilot sin el host | Una regla podría no cargarse nunca y nadie enterarse | `<pendiente de asignar>` | Abrir un fichero de UI en Cursor y en VS Code y confirmar que la regla se aplica |
| Recorrido de un `UX-*` por la cadena completa en un host real | Requiere ejecutar el circuito de punta a punta con delegación viva | El campo de HANDOFF podría existir y no rellenarse nunca en la práctica | `<pendiente de asignar>` | Recorrer una spec de UI de juguete antes de cerrar el gate de entrega |
| Gate `a11y` | Este repositorio no tiene interfaz ni runner de accesibilidad | Ninguno para esta spec: `UX-A11Y-001` no aplica | — | Se configurará en los proyectos que instalen la plantilla y tengan UI |
| Auditoría de usabilidad por `code-reviewer` | La fase `/sdd-verify` no se ha ejecutado todavía | El veredicto de usabilidad no está emitido y el informe sigue siendo la plantilla | `<pendiente de asignar>` | Ejecutar `/sdd-verify` antes de cambiar la decisión de entrega |

### 3.0 · Evidencia documental

| DOC-ID | Tarea | Artefacto | Comprobación ejecutada | Resultado | Estado |
|---|---|---|---|---|---|
| DOC-TRACE | T-009-07 | `docs/sdd/OPERATING-MODEL.md` | `node scripts/check-sdd.mjs --strict` | | `no ejecutado` |
| DOC-VCS | T-009-10 | `docs/guides/INSTALACION.md` | `node scripts/check-sdd.mjs --strict` | | `no ejecutado` |
| DOC-HOSTS | T-009-06 | `docs/integrations/IDE-COMPATIBILITY.md` | `node scripts/check-sdd.mjs --strict` | | `no ejecutado` |

### 3.1 · Controles de seguridad ejecutados

| Control | Tarea | Test / comando ejecutado | Resultado | Evidencia | Estado |
|---|---|---|---|---|---|
| SEC-PATH-001 | T-009-09 | `scripts/test-install.mjs::gate_a11y_e_informe` | | | `no ejecutado` |

**Informe de seguridad**: no aplica. `Impacto de seguridad = no-sensible`; el alcance de auditoría
previsto en `plan.md` §9.2 es `plan`, que no exige informe materializado.

### 3.2 · Controles de usabilidad ejecutados

| Control | Tarea | Test / comando ejecutado | Resultado | Evidencia | Estado |
|---|---|---|---|---|---|
| UX-COPY-001 | T-009-09 | `scripts/test-install.mjs::matriz_usabilidad` | | | `no ejecutado` |
| UX-COPY-002 | T-009-10 | `scripts/test-install.mjs::usabilidad_versionada` | | | `no ejecutado` |
| UX-A11Y-001 | — | — | — | — | `no aplica` |
| UX-FORM-001 | — | — | — | — | `no aplica` |
| UX-PERF-001 | — | — | — | — | `no aplica` |

**Informe de usabilidad**: `docs/design/reports/YYYY-MM-DD-009-usabilidad-integrada.md`.

- Auditor: `code-reviewer` (solo lectura) — `<observed/declared-direct/unverified>`.
- Materialización: `docs-writer` copia literalmente el HANDOFF estructurado; no cambia hallazgos,
  conteos ni veredicto.
- Contrato mínimo del informe:

<!-- sdd-usability-report:v1 -->
```json
{
  "schemaVersion": 1,
  "spec": "009-usabilidad-integrada",
  "standards": {
    "wcag": "2.2",
    "level": "AA",
    "heuristics": "nielsen-10"
  },
  "scope": "diff",
  "controlsEvaluated": ["UX-COPY-001", "UX-COPY-002"],
  "openFindings": { "critical": 0, "high": 0, "medium": 0, "low": 0 },
  "verdict": "PASS",
  "acceptedRisks": [],
  "controlsNotExecuted": []
}
```

Valores JSON de `verdict`: `BLOCKED`, `CONDITIONAL` o `PASS`. Cada riesgo MEDIO aceptado usa
`id`, `owner`, `justification`, `reviewDate` (`YYYY-MM-DD`) y un `decisionRef` durable `DEC-*` o
`ADR-*`. Cada control no ejecutado usa `control`, `reason`, `risk`, `owner` y `nextStep`.
`controlsNotExecuted` no vacío bloquea `GO`; no cuenta como control verificado.

> ⚠️ El JSON de arriba es la **forma esperada**, no un resultado. Se sustituye por el HANDOFF real
> del auditor antes de cambiar la decisión de entrega. Un informe copiado de la plantilla no es
> evidencia.

## 3 bis. Cobertura, deuda y observabilidad

**Cobertura por tier.** No se reporta cifra global: un porcentaje único deja pasar el 6 % que
hunde el producto.

| Módulo / ruta | Tier declarado en `plan.md` | Umbral | Real | ✓ |
|---|---|---:|---:|---|
| `scripts/check-sdd.mjs` | CORE | caminos nuevos al 100 % | | |
| `scripts/install.mjs` | CORE | caminos nuevos al 100 % | | |
| `scripts/lib/manifiesto.mjs` | CORE | caminos nuevos al 100 % | | |
| `scripts/sdd-project.mjs` | IMPORTANT | 80 % | | |
| `.sdd/hooks/guard-bash.mjs` | IMPORTANT | 80 % | | |

**Módulos sin tier declarado** — el defecto estricto los exige al 100 %:

| Módulo / ruta | Cobertura real | ✓ |
|---|---:|---|
| ninguno | — | — |

| Medida | Valor | Comando |
|---|---|---|
| Mutation score en el core | n/a | sin runner de mutación configurado |
| Marcadores de deuda | | `node scripts/sdd-project.mjs debt` |
| Ratio de deuda | | |

**Observabilidad de los caminos nuevos**

- [ ] Errores capturados y **clasificados** por tipo — códigos `usabilidad/*` y `diseno/tabla`
- [ ] Salud por versión visible, con regla de reversión escrita — `VERSION_MANIFIESTO` 6
- [ ] Rastro de eventos de negocio **sin datos personales** — no aplica
- [ ] Toda alerta con umbral de aviso, umbral crítico y playbook — CI en rojo es la única alerta
- [ ] Error de prueba disparado y visto llegar — el fixture negativo es exactamente eso

## 4. Convergencia

- [ ] La spec refleja el comportamiento realmente construido
- [ ] Código y contratos satisfacen los criterios de aceptación
- [ ] Los tests relevantes pasan; ningún test flaky ignorado
- [ ] Seguridad, privacidad, datos y accesibilidad revisados
- [ ] ADR, documentación, runbooks y CHANGELOG actualizados donde aplica
- [ ] Cada tarea `hecho` tiene ejecución registrada, checks y evidencia
- [ ] No quedan discrepancias de intake abiertas que afecten al alcance entregado
- [ ] Las delegaciones se observaron por hooks, o su limitación está documentada arriba
- [ ] Los riesgos abiertos tienen propietario y decisión

## 5. Decisión de entrega

| Campo | Valor |
|---|---|
| **Estado** | `NO-GO` |
| **Razón** | Implementación en curso; ningún gate ejecutado todavía |
| **Aprobado por** | |
| **Fecha** | |

> Arranca en `NO-GO`. Se cambia a `GO` cuando todas las casillas de §4 están marcadas
> **y** una persona lo aprueba. El valor por defecto no es "listo".
