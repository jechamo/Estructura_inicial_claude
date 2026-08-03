# Evidencia · 004

## 1. Ejecuciones

| Fecha | Agente | Verificación | Tarea | Comando | Resultado |
|---|---|---|---|---|---|
| 2026-08-03 | Codex raíz | declared-direct | T-004-01 | `node scripts/check-sdd.mjs --spec 004` | RED: 15 colisiones VS Code y 6 Cursor |
| 2026-08-03 | Codex raíz | declared-direct | T-004-01 | `node scripts/test-install.mjs` | RED: 88 correctas, 13 fallos esperados |
| 2026-08-03 | implementer | unverified | T-004-02 | delegación Codex | completada; motivo: el host no expone eventos de subagente a los hooks del repo |
| 2026-08-03 | implementer | unverified | T-004-03 | delegación Codex | completada; motivo: el host no expone eventos de subagente a los hooks del repo |
| 2026-08-03 | Codex raíz | declared-direct | T-004-04 | `node scripts/test-install.mjs` | GREEN: 101 correctas, 0 fallos |
| 2026-08-03 | Codex raíz | declared-direct | T-004-04 | `npm pack --dry-run --json` | 222 entradas; 283008 bytes; sin fallback ni prohibidos |
| 2026-08-03 | Codex raíz | declared-direct | T-004-04 | `npm run verify` | verde: strict, skills, 40 hooks y 101 tests de instalación |

## 2. Trazabilidad

| Requisitos | Criterios | Tareas | Tests / evidencia |
|---|---|---|---|
| RF-01, RF-02 | CA-01, CA-02 | T-004-01, T-004-02 | gate de colisiones + instalación greenfield |
| RF-03 | CA-03 | T-004-01, T-004-02 | aserción Trust + Reload |
| RF-04 | CA-04 | T-004-01, T-004-03 | allowlist + `npm pack --dry-run --json` |
| RF-05 | CA-05 | T-004-01, T-004-02, T-004-03, T-004-04 | brownfield, poda segura e idempotencia |

## 3. Controles NO ejecutados

| Control | Motivo | Riesgo | Dueño | Paso siguiente |
|---|---|---|---|---|
| Smoke VS Code/Cursor | Los hosts no se abrieron en esta ejecución | el selector visual no está observado | usuario | confiar, recargar y comprobar un único nombre |
| Windows/Linux con Node 18/20/22 | Solo Node local ejecutado | diferencias de plataforma posibles | CI | ejecutar matriz tras push |

## 4. Decisión de entrega

GO condicionado a que `npm run verify` pase inmediatamente antes del commit y a que el push/tag
sean normales e inmutables, tal como autorizó el usuario.
