Ejecuta la fase **specify** del circuito SDD.

Procedimiento completo: [`.claude/skills/sdd-specify/SKILL.md`](../../.claude/skills/sdd-specify/SKILL.md)
Perfil del agente: [`.claude/agents/spec-analyst.md`](../../.claude/agents/spec-analyst.md)

1. Siguiente número libre en `docs/specs/`. Copia `docs/specs/_TEMPLATE/` a `docs/specs/NNN-slug/`.
2. Escribe `spec.md`: problema · objetivo medible · usuarios · requisitos funcionales en
   **EARS** · requisitos no funcionales · criterios de aceptación en **Gherkin** · casos
   límite · reglas de negocio · **fuera de alcance** · riesgos · supuestos · glosario.
3. **Cero tecnología**: ni tablas, ni endpoints, ni frameworks, ni nombres de clase.
4. Lo que no sepas y cambie el resultado → `[NEEDS CLARIFICATION: ...]`. **No inventes.**
5. Autorrevisión: cada RF con al menos un CA; cada CA automatizable; sección de casos límite
   no vacía; requisitos no funcionales presentes.

Cierra con el bloque `### HANDOFF`.
