# Tareas · 015-circuito-ligero-verificable

| Campo | Valor |
|---|---|
| **Spec** | [`spec.md`](./spec.md) · **Plan**: [`plan.md`](./plan.md) |
| **Total** | 7 tareas · S: 1 · M: 4 · L: 2 |
| **Progreso** | 7/7 |

## Trazabilidad

| Objetivo | PRD-RF | Caso de uso | RF | CA | Tarea | Test | Evidencia |
|---|---|---|---|---|---|---|---|
| OBJ-002 | PRD-RF-004 | UC-004 | RF-01 | CA-01 | T-015-01 | `scripts/test-hooks.mjs::la_negacion_prevalece_sobre_el_permiso` | `evidence.md#T-015-01` |
| OBJ-002 | PRD-RF-004 | UC-004 | RF-06 | CA-06 | T-015-02 | `scripts/test-install.mjs::circuit_status_nombra_lo_que_obliga_al_circuito_completo` | `evidence.md#T-015-02` |
| OBJ-002 | PRD-RF-003 | UC-004 | RF-03 | CA-03 | T-015-03 | `scripts/test-install.mjs::un_commit_ligero_que_miente_falla` | `evidence.md#T-015-03` |
| OBJ-002 | PRD-RF-003 | UC-004 | RF-04, RF-05 | CA-04, CA-05 | T-015-04 | `scripts/test-install.mjs::la_cuota_senala_la_frontera` | `evidence.md#T-015-04` |
| OBJ-002 | PRD-RF-004 | UC-004 | RF-02 | CA-02 | T-015-05 | `scripts/test-install.mjs::el_circuito_ligero_no_perdona_ningun_gate` | `evidence.md#T-015-05` |
| OBJ-002 | PRD-RF-004 | UC-004 | RF-02 | CA-02 | T-015-06 | `scripts/test-install.mjs::el_modelo_operativo_describe_el_circuito_ligero` | `evidence.md#T-015-06` |
| OBJ-003 | PRD-RF-006 | UC-001 | RF-07 | CA-07 | T-015-07 | `scripts/test-install.mjs::el_sitio_publicado_no_puede_mentir_sobre_el_catalogo` | `evidence.md#T-015-07` |

## Orden de ejecución

`T-015-01` primero: sin el cálculo puro de la frontera no hay nada sobre lo que preguntar ni nada
que auditar. `T-015-02` la expone como flag y `T-015-03` la usa para contrastar el trailer contra
el diff; ambas dependen de la primera y no entre sí, pero tocan el mismo fichero.

`T-015-04` cierra las dos piezas que impiden que el atajo degenere —motivo material y cuota— y
depende de que la auditoría ya clasifique commits ligeros. `T-015-05` y `T-015-06` dan de alta la
skill y su documentación: van al final a propósito, porque publicar la puerta antes de que la
cerradura funcione sería exactamente el peor resultado posible de esta spec.

`T-015-07` es la única independiente del circuito ligero y podría ir en paralelo, pero toca
`scripts/test-install.mjs` como casi todas.

### T-015-01 · Calcular la frontera por ruta, con la negación prevaleciendo
- **Estado**: hecho
- **Terreno**: middle
- **Skill**: `/tdd`
- **Capa**: transversal
- **Cubre**: OBJ-002, PRD-RF-004, UC-004, RF-01, CA-01
- **Controles de seguridad**: SEC-LIGHT-001, SEC-LIGHT-002
- **Controles de usabilidad**: ninguno
- **Documentación**: no aplica (la superficie documental la cierra T-015-06)
- **Test que la define**: `scripts/test-hooks.mjs::la_negacion_prevalece_sobre_el_permiso` y `scripts/test-hooks.mjs::sin_frontera_no_hay_circuito_ligero`
- **Depende de**: ninguna
- **Ficheros previstos**: `scripts/lib/circuito.mjs`, `.sdd/lightweight.json`, `scripts/lib/manifiesto.mjs`, `scripts/test-hooks.mjs`
- **Definición de hecho**: un fichero cubierto por `permitido` y alcanzado por `prohibido` sale `full`; una frontera ausente devuelve `full`; las rutas se normalizan a separador `/` antes de comparar y un patrón no puede escapar de la raíz
- **Evidencia prevista**: `evidence.md#T-015-01`
- **Estimación**: L
- **Paralelizable**: no

### T-015-02 · Responder si un cambio cabe, nombrando lo que lo impide
- **Estado**: hecho
- **Terreno**: middle
- **Skill**: `/tdd`
- **Capa**: transversal
- **Cubre**: OBJ-002, PRD-RF-004, UC-004, RF-06, CA-06
- **Controles de seguridad**: ninguno
- **Controles de usabilidad**: UX-COPY-004
- **Documentación**: no aplica (la superficie documental la cierra T-015-06)
- **Test que la define**: `scripts/test-install.mjs::circuit_status_nombra_lo_que_obliga_al_circuito_completo`
- **Depende de**: T-015-01
- **Ficheros previstos**: `scripts/check-sdd.mjs`, `scripts/test-install.mjs`
- **Definición de hecho**: `--circuit-status` mira los ficheros modificados y en índice, responde `light` o `full`, enumera los que obligan al circuito completo y admite `--json`
- **Evidencia prevista**: `evidence.md#T-015-02`
- **Estimación**: M
- **Paralelizable**: no

### T-015-03 · Contrastar `Circuit: light` contra las rutas reales del commit
- **Estado**: hecho
- **Terreno**: middle
- **Skill**: `/tdd`
- **Capa**: transversal
- **Cubre**: OBJ-002, PRD-RF-003, UC-004, RF-03, CA-03
- **Controles de seguridad**: SEC-LIGHT-003
- **Controles de usabilidad**: ninguno
- **Documentación**: no aplica (la superficie documental la cierra T-015-06)
- **Test que la define**: `scripts/test-install.mjs::un_commit_ligero_que_miente_falla`
- **Depende de**: T-015-01
- **Ficheros previstos**: `scripts/check-sdd.mjs`, `scripts/test-install.mjs`
- **Definición de hecho**: `--trace-audit` clasifica el commit ligero, lo corrobora si todas sus rutas caben y lo marca con hallazgo nombrando la ruta que no cabe; un commit ligero no exige `Spec:` ni `Task:`
- **Evidencia prevista**: `evidence.md#T-015-03`
- **Estimación**: M
- **Paralelizable**: no

### T-015-04 · Exigir motivo material y vigilar la cuota
- **Estado**: hecho
- **Terreno**: middle
- **Skill**: `/tdd`
- **Capa**: transversal
- **Cubre**: OBJ-002, PRD-RF-003, UC-004, RF-04, RF-05, CA-04, CA-05
- **Controles de seguridad**: ninguno
- **Controles de usabilidad**: UX-COPY-005
- **Documentación**: no aplica (la superficie documental la cierra T-015-06)
- **Test que la define**: `scripts/test-install.mjs::la_cuota_senala_la_frontera`
- **Depende de**: T-015-03
- **Ficheros previstos**: `scripts/lib/circuito.mjs`, `scripts/check-sdd.mjs`, `scripts/test-install.mjs`
- **Definición de hecho**: un `Circuit-reason:` vacío, de una palabra o de relleno se rechaza igual que su ausencia; la auditoría informa de la proporción de commits ligeros y avisa al superar la cuota, fallando solo en `--strict`, con un mensaje que apunta a la frontera
- **Evidencia prevista**: `evidence.md#T-015-04`
- **Estimación**: M
- **Paralelizable**: no

### T-015-05 · Publicar `/sdd-light` sin que perdone ningún gate
- **Estado**: hecho
- **Terreno**: middle
- **Skill**: `/tdd`
- **Capa**: transversal
- **Cubre**: OBJ-002, PRD-RF-004, UC-004, RF-02, CA-02
- **Controles de seguridad**: ninguno
- **Controles de usabilidad**: ninguno
- **Documentación**: no aplica (la superficie documental la cierra T-015-06)
- **Test que la define**: `scripts/test-install.mjs::el_circuito_ligero_no_perdona_ningun_gate`
- **Depende de**: T-015-02
- **Ficheros previstos**: `.agents/skills/sdd-light/SKILL.md`, `.sdd/hooks/sdd-router.mjs`, `scripts/test-hooks.mjs`, `scripts/test-install.mjs`
- **Definición de hecho**: la skill 27 existe en las seis superficies, empieza consultando `--circuit-status`, enumera lo que sigue siendo obligatorio y no menciona saltarse gates; el router la sugiere sin decidir
- **Evidencia prevista**: `evidence.md#T-015-05`
- **Estimación**: M
- **Paralelizable**: no

### T-015-06 · Escribir el circuito ligero en el modelo operativo
- **Estado**: hecho
- **Terreno**: middle
- **Skill**: `/docs-sync`
- **Capa**: transversal
- **Cubre**: OBJ-002, PRD-RF-004, UC-004, RF-02, CA-02
- **Controles de seguridad**: ninguno
- **Controles de usabilidad**: ninguno
- **Documentación**: DOC-CIRCUITO
- **Test que la define**: `scripts/test-install.mjs::el_modelo_operativo_describe_el_circuito_ligero`
- **Depende de**: T-015-05
- **Ficheros previstos**: `docs/sdd/OPERATING-MODEL.md`, `AGENTS.md`, `scripts/test-install.mjs`
- **Definición de hecho**: el modelo operativo describe qué dispensa el circuito ligero, qué no, dónde vive la frontera y cómo se audita; la comprobación falla si el documento deja de nombrar la frontera o el trailer
- **Evidencia prevista**: `evidence.md#T-015-06`
- **Estimación**: S
- **Paralelizable**: no

### T-015-07 · Cerrar la séptima superficie
- **Estado**: hecho
- **Terreno**: front
- **Skill**: `/front`
- **Capa**: interfaz
- **Cubre**: OBJ-003, PRD-RF-006, UC-001, RF-07, CA-07
- **Controles de seguridad**: ninguno
- **Controles de usabilidad**: ninguno
- **Documentación**: no aplica (la superficie documental la cierra T-015-06)
- **Test que la define**: `scripts/test-install.mjs::el_sitio_publicado_no_puede_mentir_sobre_el_catalogo`
- **Depende de**: T-015-05
- **Ficheros previstos**: `scripts/check-sdd.mjs`, `site/assets/js/datos.mjs`, `site/index.html`, `scripts/test-install.mjs`
- **Definición de hecho**: sobra o falta un identificador de agente o de skill en el sitio y `check-sdd` falla nombrándolo; los recuentos escritos a mano en el HTML se contrastan contra los reales; la prosa de cada entrada sigue siendo humana
- **Evidencia prevista**: `evidence.md#T-015-07`
- **Estimación**: L
- **Paralelizable**: no
