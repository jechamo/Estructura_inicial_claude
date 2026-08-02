---
name: adr
description: Crea un Architecture Decision Record en formato MADR. Úsalo cuando se tome una decisión con consecuencias estructurales duraderas.
---

# /adr — Registrar una decisión arquitectónica

Agente responsable: `@architect`.

## ¿Merece un ADR?

**Sí** si: cambia una frontera o una capa · añade o quita un componente de infraestructura ·
cambia el modelo de consistencia o de despliegue · introduce una dependencia estructural ·
cambia un contrato público · acepta deuda con impacto duradero · **descarta** una alternativa
que alguien volverá a proponer.

**No** si: es una elección local reversible en una tarde. Eso va a `DECISIONS.md`.

Regla práctica: *si dentro de un año alguien preguntará "¿por qué esto es así?", es un ADR.*

## Procedimiento

1. Siguiente número libre en `docs/architecture/adr/`.
2. Fichero `ADR-NNNN-titulo-en-kebab-case.md`.
3. Rellena la plantilla. **La sección de alternativas descartadas es la más valiosa**: es la
   que evita repetir el debate.
4. Enlaza desde `docs/architecture/constitution.md` y desde la spec afectada.
5. Avisa a `@bitacora-keeper` para la entrada en `DECISIONS.md`.

## Plantilla (MADR)

```markdown
# ADR-NNNN: <título en forma de decisión>

- **Estado**: propuesto | aceptado | rechazado | obsoleto | reemplazado por ADR-XXXX
- **Fecha**: YYYY-MM-DD
- **Decisores**: <quién decide>
- **Spec relacionada**: docs/specs/NNN-slug/
- **Etiquetas**: <arquitectura, datos, seguridad, infraestructura…>

## Contexto y problema

<Qué situación obliga a decidir. Fuerzas en juego, restricciones, qué pasa si no decidimos.>

## Criterios de decisión

- <criterio 1: p. ej. coste operativo>
- <criterio 2: p. ej. experiencia del equipo>

## Opciones consideradas

### Opción A — <nombre>
- Cómo funciona: <...>
- ✅ Pros: <...>
- ❌ Contras: <...>
- 💰 Coste: <complejidad, dinero, tiempo, lock-in>

### Opción B — <nombre>
...

### Opción C — No hacer nada
<Siempre inclúyela. Muchas veces gana.>

## Decisión

Elegimos **<opción>** porque <el criterio que desempató>.

## Consecuencias

**Positivas**: <...>
**Negativas / deuda aceptada**: <...>
**Impacto en**: <código, equipo, operación, coste>

## Condiciones de revisión

Revisar esta decisión si: <señal concreta y medible que la invalidaría>.

## Referencias

<enlaces, benchmarks, documentación>
```

## Reglas

- Un ADR **no se edita** para cambiar la decisión: se marca `reemplazado por ADR-XXXX` y se
  escribe uno nuevo. La historia no se reescribe.
- Escribe en pasado y con hechos, no con opiniones sin apoyo.
- Sin alternativas descartadas, el ADR no vale: revisará el debate el próximo que llegue.
