# Plan de test · NNN-slug

---

## 1. Alcance

Qué se prueba en esta spec y qué **no** (y por qué).

## 2. Mapa criterio → test

| OBJ | PRD-RF | UC | RF | CA | Tarea | Comportamiento | Nivel | Test |
|---|---|---|---|---|---|---|---|---|
| OBJ-001 | PRD-RF-001 | UC-001 | RF-01 | CA-01 | T-NNN-01 | | unitario | `ruta::debe_<...>_cuando_<...>` |

**Regla**: ningún CA sin test. Ningún test sin CA (salvo tests técnicos justificados).

## 3. Por nivel

### Unitarios (~70 %)
Dominio y aplicación, sin I/O. Milisegundos.
- <qué se cubre aquí>

### Integración (~20 %)
Adaptadores reales con testcontainers: BD, HTTP, colas.
- <qué se cubre aquí>

### Contrato
Cada frontera de `contracts/`. Consumer-driven. Un cambio incompatible **debe romper el build**.
- <qué contratos>

### E2E (~10 %)
Solo flujos críticos de negocio. Selectores por rol y texto accesible.
- <qué flujos>

## 4. Casos límite a cubrir

| Caso | Test | Estado |
|---|---|---|
| Entrada vacía | | |
| Límite exacto (n, n-1, n+1) | | |
| Concurrencia / carrera | | |
| Idempotencia (petición repetida) | | |
| Permiso denegado | | |
| Dependencia externa caída / timeout | | |
| Datos corruptos o parciales | | |
| Zonas horarias y cambio de hora | | |

## 5. Datos de prueba

- Builders / Object Mothers a usar: <…>
- Fixtures: <…>
- **Sin PII real.** Sin secretos, ni siquiera de prueba con formato válido.

## 6. Dobles

| Dependencia | Doble | Por qué |
|---|---|---|
| | fake / stub / mock | |

> No mockees lo que no controlas: envuélvelo en un puerto y haz un fake del puerto.

## 7. Criterio de suficiencia

- Cobertura dominio/aplicación ≥ 80 %
- Mutation score en el core ≥ <n> % (si está configurado)
- Todos los CA con test verde
- Suite completa < <n> minutos en CI
- Cero tests flaky, cero `.skip`, cero `.only`

## 8. Qué NO se automatiza

<Y cómo se verifica entonces: revisión manual, checklist, exploratorio.>

Los gates humanos de producto, spec, diseño, plan y entrega no se infieren de tests: su estado,
persona, fecha y alcance se comprueban como evidencia documental.

## 9. Fuentes y discrepancias

| Riesgo de intake | Fuente / discrepancia | Test o revisión | Resultado esperado |
|---|---|---|---|
| Fuente inaccesible | `<SRC-...>` | `<test/revisión>` | No se inventa contenido y el bloqueo queda visible |
| Contradicción producto-diseño | `<DISC-...>` | `<test/revisión>` | No avanza el gate hasta decisión humana |
