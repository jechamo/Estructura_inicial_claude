Ejecuta la fase **design** del circuito SDD: convierte la spec en documento de diseño.

Procedimiento completo: [`.claude/skills/sdd-design/SKILL.md`](../../.claude/skills/sdd-design/SKILL.md)
Perfil del agente: [`.claude/agents/ux-designer.md`](../../.claude/agents/ux-designer.md)

**Puerta de entrada**: `docs/specs/NNN-slug/spec.md` existe y no tiene marcadores
`[NEEDS CLARIFICATION]`. Si quedan, para y pide `/sdd-clarify`.

Si la funcionalidad no tiene interfaz, di por qué se salta esta fase y pasa a `/sdd-plan`.

1. **Pregunta antes de dibujar**: cada duda que cambie el resultado, con tu recomendación y su
   motivo. Espera confirmación. Lo no confirmado queda marcado y bloquea `/sdd-plan`.
2. **Flujo antes que pantalla**, en mermaid, con los caminos de error.
3. **Seis estados por pantalla**: vacío, cargando, parcial, error, sin permiso, éxito.
4. **Componentes**: reutiliza / extiende / nuevo, los nuevos justificados.
5. **Accesibilidad WCAG 2.2 AA sobre el diseño**, no al final en el código.
6. Escribe `docs/specs/NNN-slug/design.md` desde `docs/specs/_TEMPLATE/design.md`.

**Cero tecnología.** Requisito nuevo que aparezca → vuelve a `/sdd-specify`.

Cierra con el bloque `### HANDOFF`.
