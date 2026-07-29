---
name: sdd-status
description: Muestra en qué punto del circuito SDD está el proyecto, qué specs hay abiertas, qué tareas quedan y cuál es el siguiente paso.
disable-model-invocation: true
---

# /sdd-status — Dónde estoy

Solo lectura. Rápido y sin adornos.

## Recolecta

1. ¿Existe `docs/architecture/constitution.md`? → arquitectura declarada.
2. `Glob docs/specs/*/spec.md` → lista de specs con su estado (metadatos del fichero).
3. Por cada spec activa, qué artefactos existen:
   `spec.md · clarifications.md · plan.md · data-model.md · contracts/ · tasks.md · test-plan.md`
4. `Grep` en `tasks.md` → tareas por estado.
5. `git status` y `git log -5` → trabajo sin cerrar.
6. Últimas 3 entradas de `docs/bitacora/DECISIONS.md`.
7. Deuda técnica registrada con fecha de revisión vencida.

## Presenta

```
📐 Arquitectura: <estilo> (ADR-0001)
📋 Specs
   · 042-checkout-invitado   [implement]  tareas 7/12   rama feature/042-checkout-invitado
   · 043-informes-mensuales  [specify]    3 marcadores pendientes
🔧 Trabajo en curso: T-042-08 · <título>
📝 Últimas decisiones:
   · 2026-07-20 — Se descarta Redis para sesiones; se usa cookie firmada
⚠️  Atención:
   · Deuda vencida: <ítem> (revisión prevista 2026-06-01)
   · 4 ficheros sin commitear

👉 Siguiente paso: /sdd-implement (T-042-08)
```

## Reglas

- Si hay varias specs activas, ordénalas por avance y di cuál es la prioritaria.
- Si detectas incoherencias (tareas `hecho` sin tests, spec `entregada` con tareas
  pendientes, plan sin spec aprobada), **dilo**: son la fuente habitual de sorpresas.
- No modifiques nada.
