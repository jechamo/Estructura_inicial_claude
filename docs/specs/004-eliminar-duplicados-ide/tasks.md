# Tareas · 004

### T-004-01 · Añadir pruebas de colisión y empaquetado
- **Estado**: hecho
- **Terreno**: tooling / calidad
- **Skill**: `tdd`
- **Cubre**: RF-01, RF-02, RF-03, RF-04, RF-05; CA-01, CA-02, CA-03, CA-04, CA-05
- **Test que la define**: `scripts/test-install.mjs`, `scripts/check-sdd.mjs`

### T-004-02 · Eliminar superficies redundantes y fijar ubicaciones
- **Estado**: hecho
- **Terreno**: configuración de hosts
- **Skill**: `sdd-implement`
- **Cubre**: RF-01, RF-02, RF-03; CA-01, CA-02, CA-03
- **Test que la define**: pruebas de instalación limpia y gate de colisiones

### T-004-03 · Declarar el paquete npm explícito
- **Estado**: hecho
- **Terreno**: distribución
- **Skill**: `sdd-implement`
- **Cubre**: RF-04, RF-05; CA-04, CA-05
- **Test que la define**: inspección de `npm pack --dry-run --json` y suite del instalador

### T-004-04 · Verificar, documentar y preparar v0.3.1
- **Estado**: hecho
- **Terreno**: release / documentación
- **Skill**: `sdd-verify`, `sdd-ship`
- **Cubre**: RF-01, RF-02, RF-03, RF-04, RF-05; CA-01, CA-02, CA-03, CA-04, CA-05
- **Test que la define**: `npm run verify`
