---
mode: ux-designer
description: Convierte la spec en el documento de diseño — flujo, estados, componentes y accesibilidad
---

Ejecuta la fase **design** sobre: `${input:spec:¿Qué spec? (p. ej. 042-checkout-invitado)}`

Sigue [`.claude/skills/sdd-design/SKILL.md`](../../.claude/skills/sdd-design/SKILL.md).
Perfil del agente: [`.claude/agents/ux-designer.md`](../../.claude/agents/ux-designer.md).

**Puerta de entrada**: `spec.md` existe y no tiene marcadores `[NEEDS CLARIFICATION]`.
Si quedan, para y pide `/sdd-clarify`.

Si la funcionalidad **no tiene interfaz**, dilo y salta a `/sdd-plan`. No inventes pantallas.

Orden de trabajo:

1. **Pregunta antes de dibujar.** Por cada duda que cambie el resultado: pregunta, trae tu
   recomendación con su motivo, y espera confirmación. Lo no confirmado queda como
   `[NEEDS CLARIFICATION]` y bloquea `/sdd-plan`.
2. **Flujo antes que pantalla** — mermaid con los caminos de error, no solo el feliz.
3. **Seis estados por pantalla**: vacío, cargando, parcial, error, sin permiso, éxito.
4. **Componentes**: reutiliza / extiende / nuevo. Los nuevos se justifican.
5. **Accesibilidad WCAG 2.2 AA sobre el diseño**, no al final en el código.
6. Escribe `docs/specs/NNN-slug/design.md` desde `docs/specs/_TEMPLATE/design.md`.

Reglas duras:

- **Cero tecnología**: ni framework, ni librería de componentes, ni estructura de carpetas.
- Requisito nuevo que aparezca en el diseño → **vuelve a `/sdd-specify`**, no lo metas aquí.
- Valor que no esté en los tokens → señálalo como inconsistencia, no lo codifiques a pelo.

Cierra con el bloque `### HANDOFF` de la skill.
