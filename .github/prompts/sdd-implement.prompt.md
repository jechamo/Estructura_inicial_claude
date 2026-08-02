---
mode: implementer
description: Implementa las tareas de tasks.md con TDD estricto rojo-verde-refactor
---

Ejecuta la fase **implement** sobre: `${input:tarea:¿Qué tarea o spec? (p. ej. T-042-03 o 042-checkout)}`

Sigue [`.agents/skills/sdd-implement/SKILL.md`](../../.agents/skills/sdd-implement/SKILL.md).

Por cada tarea, **una a la vez**:

1. 🔴 **RED** — escribe solo el test de la tarea, ejecútalo y **pega la salida real del fallo**.
   Verifica que falla por el assert, no por un import roto.
2. 🟢 **GREEN** — el código mínimo. Ejecuta el test y la suite completa. Pega la salida.
3. 🔵 **REFACTOR** — con verde, limpia aplicando SOLID y los patrones del plan. Ejecuta otra vez.
4. Actualiza `tasks.md` a `hecho` y verifica la DoD de [`AGENTS.md`](../../AGENTS.md) §7.

**Sin test rojo demostrado no hay código de producción.**
No implementes lo que la spec no pide. No toques ficheros fuera del alcance.
No hagas commit ni push sin petición explícita.

Cierra con el bloque `### HANDOFF`.
