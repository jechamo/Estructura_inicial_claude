# Plan de pruebas · 005

| Id | OBJ | PRD-RF | UC | RF / CA | Tareas | Nivel | Caso |
|---|---|---|---|---|---|---|---|
| TP-01 | OBJ-005-01 | PRD-RF-005-01 | UC-005-01 | RF-02, RF-03, RF-04, RF-12 / CA-02, CA-03, CA-07 | T-005-01, T-005-02, T-005-04 | estático | plantillas, fuentes, discrepancias, IDs, gates, 20 agentes, 24 skills y cero duplicados |
| TP-02 | OBJ-005-01 | PRD-RF-005-02 | UC-005-02 | RF-08, RF-09 / CA-06, CA-08 | T-005-01, T-005-05 | integración | greenfield, brownfield, update e idempotencia |
| TP-03 | OBJ-005-01 | PRD-RF-005-01 | UC-005-01 | RF-01, RF-05, RF-10 / CA-01, CA-04, CA-05 | T-005-01, T-005-03 | routing | PRD pegado/local/carpeta/URL/repo; diseño opcional/inaccesible |
| TP-04 | OBJ-005-01 | PRD-RF-005-01 | UC-005-01 | RF-04 / CA-03 | T-005-01, T-005-02 | trazabilidad | cadena completa hasta tarea, test y evidencia; specs verticales sin IDs huérfanos |
| TP-05 | OBJ-005-01 | PRD-RF-005-01 | UC-005-01 | RF-11 / CA-01, CA-08 | T-005-01, T-005-02 | seguridad | fuente como dato, sin secretos ni MCP activos |
| TP-06 | OBJ-005-01 | PRD-RF-005-02 | UC-005-02 | RF-06, RF-07, RF-12 / CA-05, CA-07 | T-005-03, T-005-04 | host | handoff automático/guiado y un solo slash visible |
| TP-07 | OBJ-005-01 | PRD-RF-005-02 | UC-005-02 | RF-08, RF-09, RF-12 / CA-08 | T-005-05, T-005-06 | matriz | Windows/Linux; Node 18/20/22 |

La semántica del contenido generado requiere evaluación humana; estructura, IDs, estados,
paridad, instalación y routing se validan de forma determinista.

Los gates humanos no se deducen de una suite verde: se comprueba que producto, spec, diseño,
plan y entrega registran estado, persona, fecha y alcance. Una discrepancia `DISC-*` abierta debe
bloquear el avance de la fase a la que afecte.
