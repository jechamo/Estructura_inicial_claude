---
name: sdd-status
description: Muestra en qué punto del circuito SDD está el proyecto, qué specs hay abiertas, qué tareas quedan y cuál es el siguiente paso.
---

# /sdd-status — Dónde estoy

Solo lectura. Rápido y sin adornos.

## Recolecta

1. Ejecuta `node scripts/sdd-project.mjs product-status --json` y comprueba si existen
   `docs/product/PRD.md`, `USE-CASES.md`, `FEATURE-MAP.md` y `SOURCES.md`. El contrato durable usa
   `bootstrap`, `approved` o `legacy-pending`; `PRD.md` puede detallar una fase transitoria de intake.
2. ¿Existe `docs/design/INTAKE-REVIEW.md`? → fuente de diseño, accesibilidad y `DISC-*` abiertas;
   no lo cuentes como diseño aprobado.
3. ¿Existe `docs/architecture/constitution.md`? → arquitectura declarada.
4. `Glob docs/specs/*/spec.md` → lista de specs con su estado (metadatos del fichero).
5. Por cada spec activa, qué artefactos existen:
   `spec.md · clarifications.md · design.md · plan.md · data-model.md · contracts/ · tasks.md · test-plan.md`
6. `Grep` en `tasks.md` → tareas por estado.
7. `git status` y `git log -5` → trabajo sin cerrar.
8. Últimas 3 entradas de `docs/bitacora/DECISIONS.md`.
9. Deuda técnica registrada con fecha de revisión vencida.

## Presenta

```
📦 Producto: <bootstrap | intake | pending-approval | approved | legacy-pending>
   · Fuentes: <n accesibles · n parciales · n inaccesibles> · discrepancias abiertas: <n>
📐 Arquitectura: <estilo> (ADR-0001)
📋 Specs
   · 042-checkout-invitado   [implement]  tareas 7/12   rama feature/042-checkout-invitado
   · 043-informes-mensuales  [specify]    3 marcadores pendientes
🔧 Trabajo en curso: T-042-08 · <título>
📝 Últimas decisiones:
   · AAAA-MM-DD — <decisión reciente del proyecto>
⚠️  Atención:
   · Deuda vencida: <ítem> (revisión prevista 2026-06-01)
   · 4 ficheros sin commitear

👉 Siguiente paso: /sdd-implement (T-042-08)
```

## Reglas

- Si hay varias specs activas, ordénalas por avance y di cuál es la prioritaria.
- Si producto está `bootstrap`, `intake` o `pending-approval`, el siguiente paso es
  `/sdd-intake` antes de arquitectura o una nueva spec.
- Si producto está `approved` y es greenfield sin constitución, el siguiente paso es `/sdd-init`.
- Si está `legacy-pending`, avisa y recomienda `/sdd-intake`, pero no declares fallidos los checks
  brownfield ni ocultes el trabajo vigente por ese motivo.
- Si detectas incoherencias (tareas `hecho` sin tests, spec `entregada` con tareas
  pendientes, plan sin spec aprobada), **dilo**: son la fuente habitual de sorpresas.
- No modifiques nada.
