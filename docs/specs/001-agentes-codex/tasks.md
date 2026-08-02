# Tareas · 001-agentes-codex

| Campo | Valor |
|---|---|
| **Spec** | [`spec.md`](./spec.md) · **Plan**: [`plan.md`](./plan.md) |
| **Total** | 4 tareas · S: 2 · M: 2 · L: 0 |
| **Progreso** | 4/4 |

## Trazabilidad

| RF | CA | Tareas |
|---|---|---|
| RF-01 | CA-01 | T-001-01, T-001-02 |
| RF-02 | CA-02 | T-001-03 |
| RF-03 | CA-03 | T-001-04 |
| RF-04 | CA-04 | T-001-01 |
| RF-05 | CA-05 | T-001-02 |

### T-001-01 · Definir primero las pruebas de instalación Codex
- **Estado**: hecho
- **Terreno**: test
- **Capa**: test
- **Cubre**: RF-04, CA-04
- **Test que la define**: `scripts/test-install.mjs::instala_la_superficie_codex`
- **Depende de**: ninguna
- **Ficheros previstos**: `scripts/test-install.mjs`
- **Definición de hecho**: el test falla antes de existir `.codex/` y pasa después.
- **Estimación**: S
- **Paralelizable**: no

### T-001-02 · Añadir los veinte adaptadores y validar su paridad
- **Estado**: hecho
- **Terreno**: infra
- **Capa**: infra
- **Cubre**: RF-01, RF-05, CA-01, CA-05
- **Test que la define**: `scripts/test-install.mjs::detecta_agente_codex_ausente`
- **Depende de**: T-001-01
- **Ficheros previstos**: `.codex/config.toml`, `.codex/agents/*.toml`, `scripts/check-sdd.mjs`
- **Definición de hecho**: Codex tiene 20 adaptadores válidos y el gate detecta cualquier ausencia.
- **Estimación**: M
- **Paralelizable**: no

### T-001-03 · Verificar que las demás superficies permanecen intactas
- **Estado**: hecho
- **Terreno**: test
- **Capa**: test
- **Cubre**: RF-02, CA-02
- **Test que la define**: `npm run verify`
- **Depende de**: T-001-02
- **Ficheros previstos**: ninguno adicional
- **Definición de hecho**: toda la suite pasa y el diff no modifica los adaptadores existentes.
- **Estimación**: S
- **Paralelizable**: no

### T-001-04 · Documentar la estructura y la decisión
- **Estado**: hecho
- **Terreno**: docs
- **Capa**: docs
- **Cubre**: RF-03, CA-03
- **Test que la define**: `scripts/check-sdd.mjs --strict --spec 001`
- **Depende de**: T-001-03
- **Ficheros previstos**: `README.md`, `docs/integrations/IDE-COMPATIBILITY.md`, `docs/guides/INSTALACION.md`, `docs/agents/CATALOG.md`, `docs/bitacora/DECISIONS.md`, `CHANGELOG.md`
- **Definición de hecho**: la documentación explica ubicación, esquema, invocación y límites vigentes.
- **Estimación**: M
- **Paralelizable**: no
