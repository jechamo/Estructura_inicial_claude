---
name: sdd-clarify
description: Resuelve las ambigüedades de una spec. Recorre los marcadores [NEEDS CLARIFICATION], pregunta al humano con opciones concretas y actualiza la spec. Gate obligatorio antes de planificar.
---

# /sdd-clarify — Cerrar ambigüedades

Agente responsable: `@spec-analyst`.

Esta fase existe porque **el coste de una ambigüedad crece por diez en cada fase**.
Resolverla aquí cuesta una pregunta; en implementación cuesta una semana.

## Paso 1 — Inventario

Localiza todos los `[NEEDS CLARIFICATION]` de `docs/specs/NNN-slug/spec.md`.

Además, busca ambigüedades **no marcadas** en estas categorías, que casi siempre faltan:

- Permisos: ¿quién puede hacerlo? ¿ve datos de otros?
- Estados y transiciones: ¿qué pasa si ya estaba en ese estado?
- Concurrencia: ¿dos usuarios a la vez?
- Volumen y límites: ¿cuántos como máximo? ¿qué pasa al superarlo?
- Errores: ¿qué ve el usuario cuando falla el sistema externo?
- Datos: ¿se borran? ¿cuánto se guardan? ¿son personales?
- Notificaciones: ¿se avisa a alguien? ¿por qué canal?
- Histórico: ¿hace falta auditoría de quién hizo qué?
- Reversión: ¿se puede deshacer?
- i18n y zonas horarias.

## Paso 2 — Preguntar

**Máximo 5 preguntas por ronda.** Cada pregunta:

```
❓ <pregunta cerrada y concreta>
   a) <opción> — consecuencia: <...>
   b) <opción> — consecuencia: <...>
   c) <opción> — consecuencia: <...>
   👉 Recomendación: <a/b/c> porque <motivo>
```

Prioriza las que más cambian el alcance. Si el usuario dice "lo que veas tú", aplica tu
recomendación y **regístrala como decisión**, no como pregunta pendiente.

## Paso 3 — Registrar

En `docs/specs/NNN-slug/clarifications.md`:

```markdown
## Ronda N — YYYY-MM-DD

### P1: <pregunta>
- Opciones planteadas: <...>
- **Respuesta**: <la del usuario>
- Impacto en la spec: <qué RF/CA cambia>
- Decidido por: usuario | agente (por defecto aceptado)
```

## Paso 4 — Actualizar la spec

- Elimina el marcador y escribe el requisito resuelto.
- Añade los `CA` nuevos que salgan de la respuesta.
- Si la respuesta amplía el alcance, dilo explícitamente y confirma antes de incorporarla.
- Si la respuesta cambia el "fuera de alcance", actualízalo.

## Puerta de salida

**La spec no sale de esta fase con marcadores pendientes.** Si quedan, o se responden,
o se mueven a "fuera de alcance" de esta iteración con acuerdo explícito.

Cambia el estado de la spec a `aprobada`.

## Cierre

```
### HANDOFF
- Agente origen: spec-analyst
- Fase completada: clarify
- Rondas: <n> · Preguntas resueltas: <n>
- Cambios de alcance: <lista o "ninguno">
- Marcadores pendientes: 0
- Estado de la spec: aprobada
- Siguiente agente sugerido: planner — comando: /sdd-plan
```
