# Plan de pruebas · 004

| Id | Nivel | Cubre | Evidencia esperada |
|---|---|---|---|
| TP-01 | gate estático | CA-01, CA-02 | fallo rojo con colisiones actuales y verde tras retirarlas |
| TP-02 | integración instalador | CA-01, CA-03, CA-05 | destino temporal con 20 agentes, 23 skills y aviso postinstalación |
| TP-03 | empaquetado | CA-04 | listado real de `npm pack` sin estado local ni historia |
| TP-04 | regresión | CA-05 | greenfield, brownfield e idempotencia en verde |
| TP-05 | smoke manual | CA-01, CA-02, CA-03 | VS Code/Cursor disponibles; limitaciones declaradas si no se ejecutan |
