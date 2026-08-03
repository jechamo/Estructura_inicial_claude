# Visión de producto

> **PLANTILLA OPCIONAL.** Puede aportarla el usuario como fuente durante `/sdd-intake`.
> La visión orienta la estrategia, pero el baseline canónico y aprobable es
> [`PRD.md`](./PRD.md). Si se usa, se registra en [`SOURCES.md`](./SOURCES.md) con un ID `SRC-*`;
> no sustituye requisitos, casos de uso ni decisiones del PRD.

---

## 1. En una frase

<Qué es este producto, para quién, y qué problema resuelve. Si no cabe en una frase,
todavía no está claro.>

## 2. El problema

**Quién lo tiene**: `<...>`
**Qué hace hoy sin nosotros**: `<...>`
**Qué le cuesta**: `<tiempo, dinero, errores, frustración>`
**Por qué las soluciones actuales no le sirven**: `<...>`

## 3. Usuarios

| Perfil | Qué necesita | Cómo mide el éxito | Frecuencia de uso |
|---|---|---|---|
| | | | |

## 4. Propuesta de valor

<Qué hacemos distinto y por qué importa. No adjetivos: diferencias concretas.>

## 5. Métricas de éxito del producto

| Métrica | Valor hoy | Objetivo | Plazo |
|---|---|---|---|
| | | | |

## 6. Restricciones

| Tipo | Restricción |
|---|---|
| Presupuesto | |
| Plazo | |
| Equipo | |
| Normativa (RGPD, sectorial) | |
| Técnicas (cloud obligado, integraciones) | |

## 7. Fuera de alcance del producto

<Lo que este producto **no** va a hacer. Decidirlo pronto ahorra meses.>

## 8. Riesgos de producto

| Riesgo | Impacto | Cómo lo detectaríamos pronto |
|---|---|---|
| | | |

## 9. Hipótesis a validar

| Hipótesis | Cómo la validamos | Qué la invalidaría |
|---|---|---|
| | | |

---

## Relación con las specs

La visión puede inspirar objetivos `OBJ-*`, pero la cadena vinculante nace en el PRD aprobado:
`OBJ → PRD-RF → UC → spec/RF → CA → tarea → test → evidencia`.

Cada spec debe apuntar a IDs existentes del baseline. Si la visión contradice el PRD o un diseño,
la diferencia se registra como `DISC-*` en `SOURCES.md` y requiere decisión humana.
