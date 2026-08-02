# Evidencias y convergencia · 001-agentes-codex

> Esta sesión se ejecuta en Codex, que no expone al repositorio los hooks
> `SubagentStart`/`SubagentStop`. El trabajo directo se registra como `declared-direct`; no se
> añadirá manualmente ningún evento a `execution-log.jsonl`.

## 1. Ejecuciones

| Fecha/hora | Agente | Verificación | Tarea | Comando ejecutado | Resultado | Artefacto |
|---|---|---|---|---|---|---|
| 2026-08-02 | `implementer` | `declared-direct` | T-001-01 | `node scripts/test-install.mjs` | 🔴 35 correctas, 4 fallos esperados por ausencia de `.codex/` y paridad | salida de la sesión |
| 2026-08-02 | `implementer` | `declared-direct` | T-001-01 | `node scripts/test-install.mjs` | 🟢 41/41 tras implementar la superficie y la evidencia directa | salida de la sesión |
| 2026-08-02 | `implementer` | `declared-direct` | T-001-02 | `node scripts/test-hooks.mjs` | 🔴 31 correctas, 2 fallos esperados al tocar `.codex/` | salida de la sesión |
| 2026-08-02 | `implementer` | `declared-direct` | T-001-02 | `node scripts/test-hooks.mjs` | 🟢 33/33 tras proteger la configuración Codex | salida de la sesión |
| 2026-08-02 | `implementer` | `declared-direct` | T-001-03 | `npm run verify` | 🟢 suite completa: strict, skills, hooks e instalación | salida de la sesión |
| 2026-08-02 | `implementer` | `declared-direct` | T-001-04 | `rg` documental + revisión de diff | 🟢 estructura, invocación y límites actualizados; adaptadores existentes sin diff | diff de git |

## 2. Trazabilidad requisito → test

| RF | CA | Implementación | Test | Resultado |
|---|---|---|---|---|
| RF-01 | CA-01 | `.codex/agents/*.toml` | `check-sdd` + instalación 20/20 | 🟢 |
| RF-02 | CA-02 | adaptadores existentes sin cambios | `npm run verify` + diff dirigido | 🟢 |
| RF-03 | CA-03 | README y guías de compatibilidad | búsqueda documental | 🟢 |
| RF-04 | CA-04 | instalador por proyecto | `test-install::instala_la_superficie_codex` | 🟢 |
| RF-05 | CA-05 | gate de paridad TOML | `test-install::detecta_agente_codex_ausente` | 🟢 |

## 3. Controles NO ejecutados

| Control | Por qué no se ejecutó | Riesgo que queda abierto | Propietario | Próximo paso |
|---|---|---|---|---|
| Carga interactiva en Codex CLI | El binario instalado no es ejecutable dentro del sandbox actual | La detección real depende de la versión del cliente | Usuario | Abrir una sesión nueva de Codex tras el pull |

## 4. Convergencia

- [x] La spec refleja el comportamiento construido.
- [x] Los criterios de aceptación tienen evidencia.
- [x] La suite completa pasa.
- [x] Seguridad y mantenimiento revisados.

## 5. Decisión de entrega

| Campo | Valor |
|---|---|
| **Estado** | `GO` |
| **Razón** | Todos los gates automatizados están en verde; solo queda la comprobación manual declarada del cliente Codex |
| **Aprobado por** | usuario, mediante solicitud explícita de commit y push a `main` |
| **Fecha** | 2026-08-02 |
