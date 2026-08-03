# Tareas · 005

## Trazabilidad

| OBJ | PRD-RF | UC | RF / CA | Tareas | Tests | Evidencia |
|---|---|---|---|---|---|---|
| OBJ-005-01 | PRD-RF-005-01 | UC-005-01 | RF-01 a RF-05, RF-11 / CA-01 a CA-04 | T-005-01, T-005-02 | TP-01, TP-03, TP-04, TP-05 | `evidence.md` por tarea |
| OBJ-005-01 | PRD-RF-005-02 | UC-005-02 | RF-06 a RF-10, RF-12 / CA-05 a CA-08 | T-005-03 a T-005-06 | TP-02, TP-06, TP-07 | `evidence.md` por tarea |

### T-005-01 · Definir gates RED de intake y paridad
- **Estado**: hecho
- **Terreno**: test / tooling
- **Skill**: `tdd`
- **Producto**: OBJ-005-01, PRD-RF-005-01, UC-005-01
- **Cubre**: RF-02, RF-03, RF-04, RF-05, RF-08, RF-09, RF-12; CA-02, CA-03, CA-04, CA-06, CA-07, CA-08
- **Test que la define**: `scripts/check-sdd.mjs`, `scripts/test-install.mjs`, `scripts/test-hooks.mjs`

### T-005-02 · Crear skill y plantillas de producto
- **Estado**: hecho
- **Terreno**: docs / producto
- **Skill**: `skill-creator`, `sdd-implement`
- **Producto**: OBJ-005-01, PRD-RF-005-01, UC-005-01
- **Cubre**: RF-01, RF-02, RF-03, RF-04, RF-05, RF-10, RF-11; CA-01, CA-02, CA-03, CA-04
- **Test que la define**: quick_validate + gates de estructura/trazabilidad

### T-005-03 · Integrar routing, delegación y handoff
- **Estado**: hecho
- **Terreno**: agentes / workflows
- **Skill**: `sdd-implement`
- **Producto**: OBJ-005-01, PRD-RF-005-02, UC-005-02
- **Cubre**: RF-05, RF-06, RF-07, RF-09, RF-10; CA-04, CA-05, CA-06
- **Test que la define**: contratos de perfiles, router y handoff guiado

### T-005-04 · Propagar adaptadores multihost sin duplicados
- **Estado**: hecho
- **Terreno**: configuración de hosts
- **Skill**: `sdd-implement`
- **Producto**: OBJ-005-01, PRD-RF-005-02, UC-005-02
- **Cubre**: RF-06, RF-07, RF-12; CA-05, CA-07
- **Test que la define**: paridad 20 agentes/24 skills y colisión vacía

### T-005-05 · Preservar greenfield, brownfield e idempotencia
- **Estado**: hecho
- **Terreno**: distribución
- **Skill**: `sdd-implement`
- **Producto**: OBJ-005-01, PRD-RF-005-02, UC-005-02
- **Cubre**: RF-08, RF-09, RF-11, RF-12; CA-06, CA-08
- **Test que la define**: suite del instalador con centinelas y legacy-pending

### T-005-06 · Verificar, documentar y preparar v0.4.0
- **Estado**: hecho
- **Terreno**: release / calidad
- **Skill**: `sdd-verify`, `sdd-ship`
- **Producto**: OBJ-005-01, PRD-RF-005-01, PRD-RF-005-02, UC-005-01, UC-005-02
- **Cubre**: RF-01 a RF-12; CA-01 a CA-08
- **Test que la define**: `npm run verify`, smokes disponibles y revisión humana
