# ADR-0000: <título en forma de decisión>

> Plantilla MADR. Copia este fichero como `ADR-NNNN-titulo-en-kebab-case.md`.

- **Estado**: propuesto | aceptado | rechazado | obsoleto | reemplazado por ADR-XXXX
- **Fecha**: YYYY-MM-DD
- **Decisores**: <quién decide>
- **Spec relacionada**: `docs/specs/NNN-slug/`
- **Etiquetas**: <arquitectura · datos · seguridad · infraestructura · frontend>

---

## Contexto y problema

<Qué situación obliga a decidir. Fuerzas en juego, restricciones reales, qué pasa si no
decidimos. Escribe hechos, no opiniones.>

## Criterios de decisión

- <criterio 1 — p. ej. coste operativo>
- <criterio 2 — p. ej. experiencia del equipo>
- <criterio 3 — p. ej. reversibilidad>

## Opciones consideradas

### A · <nombre>
- **Cómo funciona**: <…>
- ✅ **Pros**: <…>
- ❌ **Contras**: <…>
- 💰 **Coste**: <complejidad · dinero · tiempo · lock-in>

### B · <nombre>
- **Cómo funciona**: <…>
- ✅ **Pros**: <…>
- ❌ **Contras**: <…>
- 💰 **Coste**: <…>

### C · No hacer nada / seguir como estamos
> Inclúyela **siempre**. Gana más veces de las que parece.
- ✅ **Pros**: <…>
- ❌ **Contras**: <…>

## Decisión

Elegimos **<opción>**.

**Criterio que desempató**: <el que realmente decidió, no la lista entera>

## Consecuencias

**Positivas**
- <…>

**Negativas / deuda aceptada**
- <…> — revisión prevista: <fecha o condición>

**Impacto en**
| Ámbito | Efecto |
|---|---|
| Código | |
| Equipo | |
| Operación | |
| Coste | |

## Condiciones de revisión

Revisar esta decisión si ocurre: <señal concreta y medible que la invalidaría>.

## Referencias

- <enlaces, benchmarks, documentación consultada con fecha>

---

> **Un ADR no se edita para cambiar la decisión.** Se marca `reemplazado por ADR-XXXX` y se
> escribe uno nuevo. La historia no se reescribe.
