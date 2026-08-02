# Evidencia · 003-skills-portables-estandar

## Ejecuciones

| Fecha | Agente | Verificación | Tarea | Comando | Resultado |
|---|---|---|---|---|---|
| 2026-08-02 | Codex | `declared-direct` | T-003-01 | `node scripts/check-sdd.mjs` | RED: 13 frontmatters no portables y adaptador ausente; GREEN: 23 skills coherentes |
| 2026-08-02 | Codex | `declared-direct` | T-003-02 | `quick_validate.py` sobre las 23 skills | 23 válidas, 0 fallos con el validador oficial de Anthropic |
| 2026-08-02 | Codex | `declared-direct` | T-003-02 | `node scripts/test-install.mjs` | 89 correctas, 0 fallos; copia completa y adaptador Claude verificados |
| 2026-08-02 | Codex | `declared-direct` | T-003-03 | `npm run verify` | Gates estructurales, skills, hooks e instalación en verde |

## Controles NO ejecutados

| Control | Motivo | Riesgo / tratamiento |
|---|---|---|
| Smoke interactivo en los cinco hosts | Requiere sesiones reales de Claude Code, Cursor, VS Code/Copilot, Antigravity y Codex | Compatibilidad declarada según contrato y gates; queda pendiente la ejecución en vivo |
| Matriz Windows/Linux con Node 18/20/22 | Esta ejecución dispone de Windows y Node 24 | El instalador no añade una dependencia de runtime; la matriz queda para CI |
| `npx skills add` | La resolución quedó colgada en esta máquina | Se instaló por Git al mismo commit y se ejecutó el validador oficial sobre la copia resultante |

## Decisión de entrega

GO humano: el usuario ha solicitado explícitamente crear y publicar el tag estable `v0.3.0`,
con las limitaciones anteriores declaradas y sin ocultarlas como resultados ejecutados.
