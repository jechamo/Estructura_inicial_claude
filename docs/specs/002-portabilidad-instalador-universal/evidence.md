# Evidencia · 002-portabilidad-instalador-universal

## Ejecuciones

| Fecha | Agente | Verificación | Tarea | Comando | Resultado |
|---|---|---|---|---|---|
| 2026-08-02 | Codex | `declared-direct` | T-002-01 | `node scripts/test-install.mjs` | RED inicial: 38 correctas, 23 fallos; GREEN final: 87 correctas, 0 fallos |
| 2026-08-02 | Codex | `declared-direct` | T-002-02 | `node scripts/check-sdd.mjs` | 22 skills canónicas, 22 adaptadores Claude y 20 agentes coherentes |
| 2026-08-02 | Codex | `declared-direct` | T-002-03 | `node scripts/test-hooks.mjs` | 40 correctas, 0 fallos; contratos de cinco hosts válidos |
| 2026-08-02 | Codex | `declared-direct` | T-002-04 | `node scripts/test-install.mjs` | greenfield, brownfield, idempotencia, update, conflictos, MCP y protecciones verdes |
| 2026-08-02 | Codex | `declared-direct` | T-002-05 | `node scripts/check-sdd.mjs` | gate normal verde; CI universal sin comandos de stack no configurados |
| 2026-08-02 | Codex | `declared-direct` | T-002-06 | `node scripts/test-install.mjs` | `detect`, `inventory`, `new-spec`, `new-adr` y `verify` verdes en destino temporal |
| 2026-08-02 | Codex | `declared-direct` | T-002-07 | `node scripts/check-sdd.mjs --strict --spec 002`; `npm run verify` | 7 tareas de la spec y 11 totales verificadas; 40 hooks y 87 escenarios de instalación verdes |
| 2026-08-21 | implementer | `declared-direct` | T-002-01, T-002-04 | `node scripts/test-install.mjs` | RED: `CURRENT-STATE.md` y el backlog propio de `TECH-DEBT.md` se filtraban al destino; GREEN: semilla neutra de deuda + exclusión de estado observado, 517 correctas y 0 fallos |

No existe `execution-log.jsonl`: no hubo una delegación observada por hooks. El agente activo hizo
el trabajo directamente y por eso cada fila usa `declared-direct`.

## Ciclos TDD

| Ciclo | RED observado | Cambio mínimo | GREEN observado |
|---|---|---|---|
| Estado virgen y brownfield | 38 correctas, 23 fallos | Separación de semillas, exclusiones y fusión conservadora | 61 correctas, 0 fallos |
| CLI de proyecto | 61 correctas, 3 fallos | `scripts/sdd-project.mjs` | 64 correctas, 0 fallos |
| MCP explícito | 67 correctas, 1 fallo | selección y fusión con versiones fijadas | 68 correctas, 0 fallos |
| Scaffolding y protecciones | 79 correctas, 4 fallos; después 84 correctas, 1 fallo en raíz | scaffolds deterministas y rechazo de raíz/home | 87 correctas, 0 fallos |

## Controles no ejecutados

| Control | Motivo | Riesgo | Responsable | Paso de cierre |
|---|---|---|---|---|
| Smoke manual real en Claude, Cursor, VS Code/Copilot, Codex y Antigravity | Esta sesión solo puede ejecutar contratos y procesos locales, no abrir los cinco hosts | Una versión concreta del host podría interpretar distinto un contrato documentado | mantenedor de la plantilla | Ejecutar la lista de `docs/integrations/IDE-COMPATIBILITY.md` antes de publicar el tag |
| Matriz Windows/Linux con Node 18/20/22 | Localmente solo está disponible el runtime actual en Windows | Diferencia de rutas o versión de Node no detectada localmente | CI | Confirmar el workflow `quality-gates.yml` en GitHub tras el push |
| Mutation testing | El repositorio distribuye scripts de infraestructura y no tiene motor de mutación configurado | Bugs lógicos no cubiertos por los escenarios actuales | mantenedor | Evaluar mutación específica del instalador en una spec posterior |

## Decisión de entrega

**GO técnico** para commit y push tras repetir el gate estricto con las siete tareas cerradas y la
suite completa. La publicación de un tag queda fuera de esta entrega y requiere los smoke tests
manuales indicados.
