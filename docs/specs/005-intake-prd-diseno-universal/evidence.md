# Evidencia · 005

## 1. Ejecuciones

| Fecha | Agente | Verificación | Tarea | Comando / control | Resultado |
|---|---|---|---|---|---|
| 2026-08-03 | Codex raíz | `declared-direct` | T-005-01 | `node scripts/test-install.mjs` durante RED | 🔴 119 correctas, 2 fallos antes de corregir estado bootstrap y metadatos vírgenes |
| 2026-08-03 | Codex raíz | `declared-direct` | T-005-01 | gates nuevos de producto, trazabilidad, URL y router | 🔴 fallaron primero los casos huérfano/inconexo, SSRF y `PRD-RF-*`; después quedaron cubiertos |
| 2026-08-03 | Codex raíz | `declared-direct` | T-005-02 | `quick_validate.py` oficial sobre `.agents/skills/*` | 🟢 24/24 skills válidas |
| 2026-08-03 | `spec_004` | `unverified` | T-005-02 | evaluación cualitativa de `sdd-intake` | 🟢 5/5 casos; motivo: Codex no expone eventos de subagente al hook del repositorio |
| 2026-08-03 | Codex raíz | `declared-direct` | T-005-03 | `node scripts/test-hooks.mjs` | 🟢 51/51, incluido routing de intake y prioridad de una spec aprobada aunque cite el PRD |
| 2026-08-03 | Codex raíz | `declared-direct` | T-005-04 | `node scripts/check-sdd.mjs --strict` | 🟢 20 agentes, 24 skills y cadena SDD verificada |
| 2026-08-03 | Codex raíz | `declared-direct` | T-005-05 | `node scripts/test-install.mjs` | 🟢 128/128: greenfield, brownfield, update, idempotencia, MCP, URL pública y bypasses de trazabilidad |
| 2026-08-03 | `audit_ide_duplicates` | `unverified` | T-005-04 | revisión de perfiles y handoffs | hallazgos corregidos; motivo: Codex no expone eventos de subagente al hook del repositorio |
| 2026-08-03 | `audit_packaging` | `unverified` | T-005-05 | revisión de seguridad y distribución | hallazgos corregidos; motivo: Codex no expone eventos de subagente al hook del repositorio |
| 2026-08-03 | Codex raíz | `declared-direct` | T-005-06 | `npm run verify` sobre el árbol definitivo | 🟢 strict + skills + 51 hooks + 128 instalador |
| 2026-08-03 | Codex raíz | `declared-direct` | T-005-06 | `npm pack --dry-run --json` | 🟢 v0.4.0, 224 ficheros y cero artefactos de historia prohibidos |
| 2026-08-03 | `audit_ide_duplicates` + `audit_packaging` | `unverified` | T-005-06 | revisión final independiente | 🟢 GO; motivo de `unverified`: Codex no expone eventos de subagente al hook del repositorio |

## 2. Trazabilidad

| Producto | RF / CA | Tareas | Evidencia |
|---|---|---|---|
| OBJ-005-01 → PRD-RF-005-01 → UC-005-01 | RF-01 a RF-05, RF-11 / CA-01 a CA-04 | T-005-01, T-005-02 | cuatro documentos vírgenes, `approve-product`, validación de IDs/cadenas, URL pública saneada y skill portable |
| OBJ-005-01 → PRD-RF-005-02 → UC-005-02 | RF-06 a RF-10, RF-12 / CA-05 a CA-08 | T-005-03, T-005-04, T-005-05 | router, perfiles/handoffs, paridad 20/24, estado `legacy-pending` e instalación multihost |

La cadena que se instala queda expresada en las plantillas de `spec.md`, `tasks.md` y
`evidence.md`. `check-sdd` exige que los IDs no solo existan: deben coincidir en una fila de
`FEATURE-MAP.md`, otra de la spec, un bloque de tarea con test y una fila de evidencia cuando la
tarea esté hecha.

## 3. Controles NO ejecutados

| Control | Motivo | Riesgo | Dueño | Paso siguiente |
|---|---|---|---|---|
| Smoke interactivo en Claude Code, Cursor, VS Code, Codex y Antigravity | Este host no puede abrir las cinco superficies como sesiones independientes | Algún host podría interpretar un adaptador de forma distinta | usuario / release-manager | validar manualmente tras instalar `v0.4.0` en cada host |
| Matriz Linux y Node 18/20/22 | Solo se ejecutó localmente en Windows con el Node disponible | Diferencia de plataforma no observada localmente | CI | confirmar el workflow tras el push |
| Figma/Stitch accesible e inaccesible mediante MCP real | MCP permanece desactivado por defecto y no se autorizó una fuente externa | Diferencias del proveedor no observadas | ux-designer | smoke opt-in con una cuenta de prueba |
| Benchmark estadístico completo de triggering | Se ejecutaron 5 casos cualitativos, no varias repeticiones por caso | Varianza de activación no medida | skill-creator | ampliar eval si aparecen falsos positivos reales |
| `gitleaks` y `semgrep` | No están instalados en el entorno | Hallazgos que los gates internos no detecten | security-auditor | ejecutar en CI o entorno que disponga de ambos |

## 4. Decisión de entrega

`GO` el 2026-08-03. El usuario aprobó expresamente el plan, commit, push y tags; dos revisiones
independientes no dejaron P0/P1 bloqueantes, y el gate completo terminó en verde sobre el árbol
definitivo. Los controles no ejecutados de §3 permanecen como limitaciones explícitas, no como
resultados simulados.
