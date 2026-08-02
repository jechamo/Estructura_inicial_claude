Implementa una tarea de **capa media / backend** con SOLID, patrones y TDD estricto.

Procedimiento completo: [`.agents/skills/middle/SKILL.md`](../../.agents/skills/middle/SKILL.md)
Perfil del agente: [`.claude/agents/backend-expert.md`](../../.claude/agents/backend-expert.md)

**Puerta de entrada**: tarea con id y criterio de aceptación en `tasks.md`, `plan.md` con la
posición arquitectónica, y contrato en `contracts/` si cruza una frontera. Si toca el esquema de
datos, la tarea de `/bbdd` va antes. Si la tarea no está definida, para y pídelo.

Ciclo: 🔴 test que falla **con la salida real pegada** → 🟢 código mínimo → ♻️ refactor en verde.

Innegociables de esta capa:

- **Dependencias hacia dentro.** El dominio declara los puertos; la infraestructura los implementa.
  Si borras el framework, el dominio debe seguir compilando.
- Validación en la frontera con esquema; dentro se confía.
- **Autorización en el caso de uso**, en servidor. Nunca solo en la ruta o en la UI.
- Consultas parametrizadas. Idempotencia en todo lo reintentable. Transactional Outbox si hay que
  escribir en BD y publicar en un broker.
- Timeout → retry con backoff **y jitter** → circuit breaker en toda llamada remota.
- El reloj y el azar se inyectan. Errores tipados. Logs estructurados sin PII.

Cierra con el bloque `### HANDOFF`.
