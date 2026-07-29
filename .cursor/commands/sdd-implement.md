Ejecuta la fase **implement** del circuito SDD con TDD estricto.

Procedimiento completo: [`.claude/skills/sdd-implement/SKILL.md`](../../.claude/skills/sdd-implement/SKILL.md)
Perfil del agente: [`.claude/agents/implementer.md`](../../.claude/agents/implementer.md)

**Puerta de entrada**: `docs/specs/NNN-slug/tasks.md` existe, con tareas trazadas a la spec y
test asociado. Si no existe, para y pide `/sdd-tasks`.

Bucle, **una tarea por ciclo**:

1. Selecciona la primera tarea `pendiente` sin dependencias abiertas. Márcala `en curso`.
2. 🔴 Escribe el test. Ejecútalo. **Pega la salida real del fallo.**
3. 🟢 Código mínimo. Test verde + suite completa verde. Pega la salida.
4. 🔵 Refactor con SOLID, en verde. Vuelve a ejecutar.
5. `tasks.md` → `hecho`. Registra la evidencia en `evidence.md`.

Si el plan resulta incorrecto, **para** y vuelve al `planner`. No parchees el plan sobre la marcha.

Cierra con el bloque `### HANDOFF`.
