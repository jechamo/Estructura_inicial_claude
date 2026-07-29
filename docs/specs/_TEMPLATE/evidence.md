# Evidencias y convergencia · NNN-slug

> `execution-log.jsonl` es la bitácora **append-only** que registra qué subagente arrancó y
> terminó, escrita por los hooks y no por el modelo. Este documento resume la **evidencia
> técnica**: qué se ejecutó, con qué comando, con qué resultado.
>
> Regla: **"pasa" sin ejecución no es un resultado. "No ejecutado" sí lo es** — y se escribe.

---

## 1. Ejecuciones

| Fecha/hora | Agente | Verificación | Tarea | Comando ejecutado | Resultado | Artefacto |
|---|---|---|---|---|---|---|
| YYYY-MM-DD HH:MM | `implementer` | `observed` | T-NNN-01 | `npm test -- order.spec` | 🔴 falla por `InsufficientStock` (esperado) | log en la conversación |
| YYYY-MM-DD HH:MM | `implementer` | `observed` | T-NNN-01 | `npm test` | 🟢 42/42 | — |

**Verificación**: `observed` (hooks vieron el subagente) · `declared-direct` (el agente activo
trabajó él mismo) · `unverified` (delegación afirmada pero no observada — documenta por qué).

## 2. Trazabilidad requisito → test

| RF | CA | Implementación | Test | Resultado |
|---|---|---|---|---|
| RF-01 | CA-01 | `src/domain/Order.ts:42` | `tests/unit/order.spec.ts::debe_rechazar_cuando_stock_insuficiente` | 🟢 |

- [ ] Todo `CA` de la spec aparece en esta tabla
- [ ] Cada test citado se ha ejecutado y su salida está arriba

## 3. Controles NO ejecutados

> La sección más importante y la que todo el mundo omite. Un control que no se corrió
> no es un control aprobado: es un riesgo sin dueño.

| Control | Por qué no se ejecutó | Riesgo que queda abierto | Propietario | Próximo paso |
|---|---|---|---|---|
| E2E en Safari | Sin runner de macOS en CI | Regresión no detectada en WebKit | | Añadir job antes de la v1.1 |

## 4. Convergencia

- [ ] La spec refleja el comportamiento realmente construido (si divergen, se clasifica como
      defecto, aprendizaje o cambio aprobado — **no se ajusta la spec en silencio**)
- [ ] Código y contratos satisfacen los criterios de aceptación
- [ ] Los tests relevantes pasan; ningún test flaky ignorado
- [ ] Seguridad, privacidad, datos y accesibilidad revisados
- [ ] ADR, documentación, runbooks y CHANGELOG actualizados donde aplica
- [ ] Cada tarea `hecho` tiene ejecución registrada, checks y evidencia
- [ ] Las delegaciones se observaron por hooks, o su limitación está documentada arriba
- [ ] Los riesgos abiertos tienen propietario y decisión

## 5. Decisión de entrega

| Campo | Valor |
|---|---|
| **Estado** | `NO-GO` \| `GO` |
| **Razón** | |
| **Aprobado por** | |
| **Fecha** | |

> Arranca en `NO-GO`. Se cambia a `GO` cuando todas las casillas de §4 están marcadas
> **y** una persona lo aprueba. El valor por defecto no es "listo".
