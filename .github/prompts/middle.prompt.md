---
mode: backend-expert
description: Implementa una tarea de capa media con SOLID, patrones y TDD estricto
---

Implementa la tarea de **capa media**: `${input:tarea:¿Qué tarea? (p. ej. T-042-03)}`

Procedimiento completo: [`.agents/skills/middle/SKILL.md`](../../.agents/skills/middle/SKILL.md)
Perfil del agente: [`.claude/agents/backend-expert.md`](../../.claude/agents/backend-expert.md)

**Puerta de entrada**: la tarea existe en `tasks.md` con criterio de aceptación, y `plan.md` fija
la posición arquitectónica. Si la tarea no está definida, para y pídelo. Si toca el esquema de
datos, la tarea de `/bbdd` va antes.

Ciclo, sin atajos:

1. 🔴 **RED** — un test que falla por el motivo correcto. **Pega la salida real del fallo.**
   Unitario del caso de uso con los puertos como dobles: sin BD, sin HTTP, sin reloj real.
2. 🟢 **GREEN** — el código mínimo. Nada de generalizar "por si acaso".
3. ♻️ **REFACTOR** — con la suite en verde.

No negociable en esta capa:

- **Las dependencias apuntan hacia dentro.** El dominio declara los puertos; la infraestructura
  los implementa. Si borras el framework, el dominio debe seguir compilando.
- Validación en la frontera con esquema. Dentro se confía.
- **Autorización comprobada en el caso de uso**, en servidor. No solo en la ruta ni en la UI.
- Consultas parametrizadas siempre. Idempotencia en todo lo reintentable.
- Transactional Outbox si hay que escribir en BD y publicar en un broker.
- Retry con backoff **y jitter**, timeout, circuit breaker en toda llamada remota.
- El reloj y el azar son dependencias: inyéctalos.
- Sin secretos en código, logs ni tests. Logs estructurados sin PII.

Antes de cerrar: suite completa en verde, lint y tipado sin warnings, observabilidad en el camino
nuevo, `contracts/` actualizado si cambió una frontera. Cierra con el bloque `### HANDOFF`.
