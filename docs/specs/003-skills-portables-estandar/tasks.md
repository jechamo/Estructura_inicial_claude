# Tareas · 003-skills-portables-estandar

| Estado | Total |
|---|---:|
| pendiente | 0 |
| en curso | 0 |
| hecho | 3 |

### T-003-01 · Convertir el estándar Agent Skills en un gate
- Estado: hecho
- Cubre: RF-01, CA-01
- Test que la define: `scripts/check-sdd.mjs::skill_frontmatter_portable`
- Evidencia: RED con 13 claves `disable-model-invocation`; GREEN con 23 skills válidas.

### T-003-02 · Instalar y auditar skill-creator portable
- Estado: hecho
- Cubre: RF-02, RF-03, CA-02, CA-03
- Test que la define: `scripts/test-install.mjs::inventory_skills`
- Depende de: T-003-01
- Evidencia: `quick_validate.py` valida 23/23; el instalador pasa 89/89 comprobaciones.

### T-003-03 · Verificar, versionar y publicar el tag estable
- Estado: hecho
- Cubre: RF-04, CA-04
- Test que la define: `npm run verify`
- Depende de: T-003-01, T-003-02
- Evidencia: gates completos en verde y GO explícito para publicar `main` y `v0.3.0`.
