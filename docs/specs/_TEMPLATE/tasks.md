# Tareas · NNN-slug

| Campo | Valor |
|---|---|
| **Spec** | [`spec.md`](./spec.md) · **Plan**: [`plan.md`](./plan.md) |
| **Total** | 0 tareas · S: 0 · M: 0 · L: 0 |
| **Progreso** | 0/0 |

---

## Trazabilidad

| RF | CA | Tareas |
|---|---|---|
| RF-01 | CA-01 | T-NNN-01 |

- [ ] Todo RF tiene al menos una tarea
- [ ] Todo CA tiene un test en alguna tarea
- [ ] Ninguna tarea sin RF ni justificación transversal

---

## Orden de ejecución

> De dentro hacia fuera: `domain` → `application` → `infrastructure` → `interfaces` → transversal.
> Nunca empieces por la pantalla ni por la tabla.

### T-NNN-01 · <título imperativo>
- **Estado**: pendiente
- **Capa**: domain
- **Cubre**: RF-01, CA-01
- **Test que la define**: `tests/domain/<...>.test.ts::debe_<comportamiento>_cuando_<condición>`
- **Depende de**: ninguna
- **Ficheros previstos**: `src/domain/<...>`
- **Definición de hecho**: <condición observable>
- **Estimación**: S
- **Paralelizable**: no

### T-NNN-02 · <título>
- **Estado**: pendiente
- **Capa**: application
- **Cubre**: RF-01
- **Test que la define**: `…`
- **Depende de**: T-NNN-01
- **Ficheros previstos**: `…`
- **Definición de hecho**: <…>
- **Estimación**: M
- **Paralelizable**: `[P]`

---

## Tareas transversales (no las olvides)

- [ ] Migración de datos existentes
- [ ] Actualización de contratos y regeneración de tipos
- [ ] Logs, métricas y trazas de los caminos nuevos
- [ ] Documentación de usuario o de API
- [ ] Retirada del feature flag tras estabilizar
- [ ] Entrada en `docs/bitacora/DECISIONS.md`

---

**Estados**: `pendiente` · `en curso` · `hecho` · `bloqueado`
**Estimaciones**: `S` (< 2 h) · `M` (medio día) · `L` (más — pártela)
