# Plan de test · NNN-slug

---

## 1. Alcance

Qué se prueba en esta spec y qué **no** (y por qué).

## 2. Mapa criterio → test

| CA | Comportamiento | Nivel | Test |
|---|---|---|---|
| CA-01 | | unitario | `ruta::debe_<...>_cuando_<...>` |

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
