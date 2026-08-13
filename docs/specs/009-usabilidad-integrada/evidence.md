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
| 2026-08-12 | `implementer` | `declared-direct` | T-009-10 | `node scripts/test-install.mjs` | 🟡 258/259 · ejecución histórica previa al cierre; sustituida por la suite final 296/296 | salida histórica en la conversación |
| 2026-08-12 | `implementer` | `declared-direct` | T-009-08 | `node scripts/test-hooks.mjs` | 🟢 71/71 | salida en la conversación |
| 2026-08-12 | `implementer` | `declared-direct` | T-009-02 | `node scripts/check-sdd.mjs --strict --spec 009` | 🟢 estructura, trazabilidad y evidencia verificadas | salida en la conversación |
| 2026-08-12 | `implementer` | `declared-direct` | T-009-08 | `node scripts/sdd-project.mjs run --fast` | 🟢 PASS · 1 check (`sdd`) | salida en la conversación |
| 2026-08-12 | `implementer` | `declared-direct` | T-009-08 | `node scripts/sdd-project.mjs run --slow` | 🟢 PASS · `security` · 381 ficheros, 0 hallazgos | salida en la conversación |
| 2026-08-12 | `implementer` | `declared-direct` | T-009-08 | `node scripts/sdd-project.mjs detect` sobre un `package.json` con `pa11y` | 🟢 sugiere `a11y → npm run pa11y` | salida en la conversación |
| 2026-08-12 | `implementer` | `declared-direct` | T-009-06 | Recuento de perfiles en los seis directorios de agentes | 🟢 20/20/20/20/20/20 | salida en la conversación |
| 2026-08-13 | `implementer` | `declared-direct` | T-009-01…T-009-10 | `node scripts/test-install.mjs`; `node scripts/test-hooks.mjs`; strict 009 | 🟢 296/296 · 81/81 · strict PASS | informes de calidad/usabilidad 009 |

**Verificación**: `observed` (hooks vieron el subagente) · `declared-direct` (el agente activo
trabajó él mismo) · `unverified` (delegación afirmada pero no observada — documenta por qué).

## 2. Trazabilidad requisito → test

| OBJ | PRD-RF | UC | RF | CA | Tarea | Implementación | Test | Resultado |
|---|---|---|---|---|---|---|---|---|
| OBJ-001 | PRD-RF-001 | UC-001 | RF-01 | CA-01 | T-009-02 | plantilla de spec e instalador | `scripts/test-install.mjs::usabilidad_versionada` | 🟢 296/296 |
| OBJ-001 | PRD-RF-001 | UC-001 | RF-02 | CA-02 | T-009-09 | validador de matriz | `scripts/test-install.mjs::matriz_usabilidad` | 🟢 296/296 |
| OBJ-001 | PRD-RF-001 | UC-001 | RF-02 | CA-03 | T-009-09 | puerta strict | `scripts/test-install.mjs::matriz_usabilidad` | 🟢 296/296 |
| OBJ-001 | PRD-RF-001 | UC-001 | RF-03 | CA-04 | T-009-03 | plantillas propagadas | `scripts/test-install.mjs::matriz_usabilidad` | 🟢 296/296 |
| OBJ-001 | PRD-RF-001 | UC-001 | RF-04 | CA-05 | T-009-04 | informe parseable | `scripts/test-install.mjs::matriz_usabilidad` | 🟢 296/296 |
| OBJ-001 | PRD-RF-001 | UC-001 | RF-05 | CA-06 | T-009-09 | bloqueo por gravedad | `scripts/test-install.mjs::matriz_usabilidad` | 🟢 296/296 |
| OBJ-001 | PRD-RF-001 | UC-001 | RF-05 | CA-07 | T-009-09 | bloqueo no ejecutado | `scripts/test-install.mjs::matriz_usabilidad` | 🟢 296/296 |
| OBJ-001 | PRD-RF-001 | UC-001 | RF-06 | CA-08 | T-009-01 | doctrina instalable | `scripts/test-install.mjs::portabilidad_usabilidad` | 🟢 296/296 |
| OBJ-001 | PRD-RF-001 | UC-001 | RF-07 | CA-09 | T-009-06 | seis hosts | `scripts/test-install.mjs::portabilidad_usabilidad` | 🟢 296/296 |
| OBJ-001 | PRD-RF-001 | UC-001 | RF-08 | CA-10 | T-009-05 | skills y HANDOFF | `scripts/test-install.mjs::portabilidad_usabilidad` | 🟢 296/296 |
| OBJ-001 | PRD-RF-001 | UC-001 | RF-09 | CA-11 | T-009-08 | gate condicional | `scripts/test-hooks.mjs` | 🟢 81/81 |
| OBJ-001 | PRD-RF-001 | UC-001 | RF-10 | CA-12 | T-009-09 | tablas de diseño | `scripts/test-install.mjs::matriz_usabilidad` | 🟢 296/296 |

- [x] Todo `CA` de la spec aparece en esta tabla
- [x] Cada test citado se ha ejecutado y su salida está arriba
- [x] Ningún OBJ, PRD-RF, UC, RF, CA o tarea referenciado es huérfano

### Gates humanos verificados

| Gate | Estado | Persona | Fecha | Alcance / evidencia |
|---|---|---|---|---|
| Producto | `legacy-pending` | | | `docs/product/PRD.md` |
| Spec | `approved` | usuario | 2026-08-13 | aprobación retrospectiva explícita en `spec.md` §14 |
| Diseño | `skipped-no-ui` | | | La plantilla no tiene interfaz gráfica; su superficie es documental y de CLI |
| Plan técnico | `approved` | usuario | 2026-08-13 | aprobación retrospectiva explícita en `plan.md` §16 |
| Entrega | `pending` | | | §5 |

## 3. Controles NO ejecutados

> La sección más importante y la que todo el mundo omite. Un control que no se corrió
> no es un control aprobado: es un riesgo sin dueño.

| Control | Por qué no se ejecutó | Riesgo que queda abierto | Propietario | Próximo paso |
|---|---|---|---|---|
| Cobertura por tier | No hay runner numérico configurado | No se afirma porcentaje; los caminos nuevos sí se ejercitan contractualmente | release-manager | mantener fixtures positivos/negativos en CI |
| Smoke de reglas en hosts reales | No automatizable en esta sesión | una integración de host puede variar pese a paridad estática | usuario | smoke posterior no bloqueante en VS Code/Cursor |
| Gate `a11y` | Este repositorio no tiene interfaz ni runner de accesibilidad | Ninguno para esta spec: `UX-A11Y-001` no aplica | — | Se configurará en los proyectos que instalen la plantilla y tengan UI |

### 3.0 · Evidencia documental

| DOC-ID | Tarea | Artefacto | Comprobación ejecutada | Resultado | Estado |
|---|---|---|---|---|---|
| DOC-TRACE | T-009-07 | `docs/sdd/OPERATING-MODEL.md` | `node scripts/check-sdd.mjs --strict --spec 009` | 🟢 PASS | verde |
| DOC-VCS | T-009-10 | `docs/guides/INSTALACION.md` | `node scripts/test-install.mjs` | 🟢 296/296 | verde |
| DOC-HOSTS | T-009-06 | `docs/integrations/IDE-COMPATIBILITY.md` | `node scripts/test-install.mjs::portabilidad_usabilidad` | 🟢 296/296 | verde |

### 3.1 · Controles de seguridad ejecutados

| Control | Tarea | Test / comando ejecutado | Resultado | Evidencia | Estado |
|---|---|---|---|---|---|
| SEC-PATH-001 | T-009-09 | `scripts/test-install.mjs::matriz_usabilidad` | 🟢 PASS · traversal y salida de reports rechazados | suite 296/296 | verde |

**Informe de seguridad**: no aplica. `Impacto de seguridad = no-sensible`; el alcance de auditoría
previsto en `plan.md` §9.2 es `plan`, que no exige informe materializado.

**Informe de seguridad**: `docs/security/reports/2026-08-13-009-usabilidad-integrada.md`.

### 3.2 · Controles de usabilidad ejecutados

| Control | Tarea | Test / comando ejecutado | Resultado | Evidencia | Estado |
|---|---|---|---|---|---|
| UX-COPY-001 | T-009-09 | `scripts/test-install.mjs::matriz_usabilidad` | 🟢 mensajes accionables verificados | informe de usabilidad | verde |
| UX-COPY-002 | T-009-10 | `scripts/test-install.mjs::usabilidad_versionada` | 🟢 estado, umbral y acción verificados | informe de usabilidad | verde |
| UX-A11Y-001 | — | — | — | — | `no aplica` |
| UX-FORM-001 | — | — | — | — | `no aplica` |
| UX-PERF-001 | — | — | — | — | `no aplica` |

**Informe de usabilidad**: `docs/design/reports/2026-08-13-009-usabilidad-integrada.md`.

- Auditor: `code-reviewer` (solo lectura) — `observed`.
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

- [x] Errores capturados y **clasificados** por tipo — códigos `usabilidad/*` y `diseno/tabla`
- [x] Salud por versión visible, con regla de reversión escrita — `VERSION_MANIFIESTO` 6
- [x] Rastro de eventos de negocio **sin datos personales** — no aplica
- [x] Toda alerta con umbral de aviso, umbral crítico y playbook — CI en rojo es la única alerta
- [x] Error de prueba disparado y visto llegar — el fixture negativo es exactamente eso

## 4. Convergencia

- [x] La spec refleja el comportamiento realmente construido
- [x] Código y contratos satisfacen los criterios de aceptación
- [x] Los tests relevantes pasan; ningún test flaky ignorado
- [x] Seguridad, privacidad, datos y accesibilidad revisados
- [x] ADR, documentación, runbooks y CHANGELOG actualizados donde aplica
- [x] Cada tarea `hecho` tiene ejecución registrada, checks y evidencia
- [x] No quedan discrepancias de intake abiertas que afecten al alcance entregado
- [x] Las delegaciones se observaron por hooks, o su limitación está documentada arriba
- [x] Los riesgos abiertos tienen propietario y decisión

## 5. Decisión de entrega

| Campo | Valor |
|---|---|
| **Estado** | `GO` |
| **Razón** | 296/296, hooks 81/81, strict PASS e informe de usabilidad PASS sin hallazgos abiertos |
| **Aprobado por** | usuario · aprobación retrospectiva explícita de cierre y release |
| **Fecha** | 2026-08-13 |

> Arranca en `NO-GO`. Se cambia a `GO` cuando todas las casillas de §4 están marcadas
> **y** una persona lo aprueba. El valor por defecto no es "listo".
