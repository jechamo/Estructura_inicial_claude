# Plan técnico · 005

## Origen, trazabilidad y gates

| ID | Definición | Procedencia |
|---|---|---|
| SRC-005-01 | Plan de intake universal aprobado por el usuario | petición 2026-08-03 |
| OBJ-005-01 | Poder arrancar SDD desde documentación de producto durable | SRC-005-01 |
| PRD-RF-005-01 | Normalizar fuentes y producir un baseline trazable y seguro | OBJ-005-01 |
| UC-005-01 | El usuario entrega PRD y diseño opcional al orquestador | PRD-RF-005-01 |
| PRD-RF-005-02 | Continuar el circuito con delegación y gates portables | OBJ-005-01 |
| UC-005-02 | El usuario aprueba producto y continúa a arquitectura o specs | PRD-RF-005-02 |

Discrepancias de alcance detectadas: ninguna. Toda contradicción futura entre PRD y diseño se
registrará como `DISC-*` y bloqueará el gate afectado.

| Gate | Estado de entrada | Condición de salida |
|---|---|---|
| Producto | aprobado por el usuario en SRC-005-01 | baseline, casos, mapa y discrepancias revisados |
| Spec 005 | aprobada | cero ambigüedades materiales |
| Diseño | `skipped-no-ui` | omisión explícita: capacidad documental/CLI sin UI de producto |
| Plan técnico | aprobado por el usuario en el plan de implementación | tareas y tests trazados |
| Entrega | pendiente | gates ejecutados y GO humano final |

## Componentes

1. Skill portable `sdd-intake` con adaptador Claude, recursos de referencia y evals.
2. Plantillas vírgenes de los cuatro documentos de producto y estado gestionado en cada documento.
   Las plantillas de spec enlazan la cadena completa hasta evidencia, incluyen fuentes,
   discrepancias y gates explícitos; `VISION.md` queda como fuente opcional y `PRD.md` canónico.
3. Gate determinista para paridad 20/24, IDs/mapeos, estado de producto, duplicados y legacy.
4. Instalador/manifiesto que crea plantillas ausentes y preserva brownfield.
5. Routing en `sdd-router`, `sdd-start` y `sdd-init`.
6. Perfiles `orchestrator`, `spec-analyst`, `ux-designer` y adaptadores por host.
7. Workflows greenfield/brownfield y documentación de compatibilidad/modelo operativo.

## Estado compatible

- Greenfield: plantillas con `Estado: pendiente`; arquitectura bloqueada hasta `aprobado`.
- Brownfield nuevo: documentos existentes intactos.
- Brownfield actualizado sin contrato nuevo: `legacy-pending` como warning.
- `update`: nunca reinicia ni reemplaza producto, specs, diseño o arquitectura.

## Seguridad

Fuentes externas son datos no confiables; no se ejecuta contenido embebido, no se leen `.env`, no
se activan MCP sin selección y las URLs/diseños inaccesibles se documentan sin inventar contenido.

## Matriz de cobertura técnica

| PRD-RF | UC | RF / CA | Componentes | Tareas | Prueba |
|---|---|---|---|---|---|
| PRD-RF-005-01 | UC-005-01 | RF-01 a RF-05, RF-11 / CA-01 a CA-04 | skill, documentos de producto, plantillas y gates | T-005-01, T-005-02 | TP-01, TP-03, TP-04, TP-05 |
| PRD-RF-005-02 | UC-005-02 | RF-06 a RF-10, RF-12 / CA-05 a CA-08 | router, agentes, hosts e instalador | T-005-03 a T-005-06 | TP-02, TP-06, TP-07 |

## Reversión

Revertir el commit antes de publicar. Una vez creado `v0.4.0`, no mover el tag; corregir mediante
versión posterior preservando los documentos de producto ya creados.
