# Tareas · 002-portabilidad-instalador-universal

| Estado | Total |
|---|---:|
| pendiente | 0 |
| en curso | 0 |
| hecho | 7 |

## Trazabilidad

| RF | CA | Tareas |
|---|---|---|
| RF-01, RF-02 | CA-01, CA-02, CA-08 | T-002-01, T-002-04 |
| RF-03, RF-04 | CA-03, CA-04 | T-002-02, T-002-03 |
| RF-05 | CA-05 | T-002-05 |
| RF-06 | CA-06 | T-002-06 |
| RF-07 | CA-07 | T-002-04 |

### T-002-01 · Definir el contrato de distribución virgen
- Estado: hecho
- Terreno: test
- Skill: —
- Capa: test
- Cubre: RF-01, RF-02, CA-01, CA-02, CA-08
- Test que la define: `scripts/test-install.mjs::instalacion_virgen_y_brownfield`
- Depende de: ninguna
- Ficheros previstos: `scripts/test-install.mjs`, `scripts/lib/manifiesto.mjs`
- Definición de hecho: los nuevos invariantes fallan contra el instalador anterior.
- Estimación: L
- Paralelizable: no

### T-002-02 · Publicar skills portables y adaptadores
- Estado: hecho
- Terreno: infra
- Skill: —
- Capa: infra
- Cubre: RF-03, CA-03
- Test que la define: `scripts/check-sdd.mjs::paridad_skills`
- Depende de: T-002-01
- Ficheros previstos: `.agents/skills/**`, `.claude/skills/**`
- Definición de hecho: 22 skills canónicas y 22 adaptadores sin deriva.
- Estimación: M
- Paralelizable: no

### T-002-03 · Adaptar hooks y trazabilidad por host
- Estado: hecho
- Terreno: infra
- Skill: —
- Capa: infra
- Cubre: RF-03, RF-04, CA-03, CA-04
- Test que la define: `scripts/test-hooks.mjs::contratos_por_host`
- Depende de: T-002-01
- Ficheros previstos: `.sdd/hooks/**`, configuraciones de cada host
- Definición de hecho: fixtures de los cinco hosts producen respuestas válidas y honestas.
- Estimación: L
- Paralelizable: no

### T-002-04 · Implementar instalación transaccional y modos
- Estado: hecho
- Terreno: infra
- Skill: —
- Capa: infra
- Cubre: RF-01, RF-02, RF-07, RF-08, CA-01, CA-02, CA-07, CA-08
- Test que la define: `scripts/test-install.mjs`
- Depende de: T-002-01, T-002-02, T-002-03
- Ficheros previstos: `scripts/install.mjs`, `scripts/lib/**`
- Definición de hecho: greenfield, brownfield, update, conflictos y dry-run pasan.
- Estimación: L
- Paralelizable: no

### T-002-05 · Ampliar gates universales
- Estado: hecho
- Terreno: test
- Skill: —
- Capa: test
- Cubre: RF-05, CA-05
- Test que la define: `scripts/check-sdd.mjs`
- Depende de: T-002-02, T-002-03, T-002-04
- Ficheros previstos: `scripts/check-sdd.mjs`, `.github/workflows/**`
- Definición de hecho: detecta deriva y el CI no presupone stack.
- Estimación: M
- Paralelizable: no

### T-002-06 · Añadir operaciones deterministas de proyecto
- Estado: hecho
- Terreno: infra
- Skill: —
- Capa: infra
- Cubre: RF-06, CA-06
- Test que la define: `scripts/test-install.mjs::operaciones_deterministas_de_proyecto`
- Depende de: T-002-04
- Ficheros previstos: `scripts/sdd-project.mjs`, `scripts/test-install.mjs`
- Definición de hecho: inventory, status, new-spec, new-adr y verify tienen salida estable.
- Estimación: M
- Paralelizable: no

### T-002-07 · Documentar, verificar y entregar
- Estado: hecho
- Terreno: docs
- Skill: —
- Capa: docs
- Cubre: transversal
- Test que la define: `node scripts/check-sdd.mjs --strict --spec 002`
- Depende de: T-002-01, T-002-02, T-002-03, T-002-04, T-002-05, T-002-06
- Ficheros previstos: documentación, evidencia, changelog y bitácora
- Definición de hecho: todos los gates ejecutados, resultados y limitaciones registrados.
- Estimación: M
- Paralelizable: no
