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

0. **Dirección visual: sin esto no se dibuja.** Comprueba `docs/design/DIRECCION-VISUAL.md`. Si no
   existe o sigue en borrador, la cierras **con el usuario** antes de seguir: referencias reales y
   una antirreferencia, tres adjetivos que excluyan algo, escala tipográfica con contraste real,
   densidad, movimiento, y qué NO va a hacer el proyecto.
   Los seis estados y la accesibilidad son un **suelo**: se cumplen enteros y aun así sale el MVP
   de cuatro cajas grises. Si el usuario no tiene criterio formado, **propón una dirección
   completa y defiéndela**; dejarla vacía garantiza el resultado genérico.
1. **Pregunta antes de dibujar.** Por cada duda que cambie el resultado: pregunta, trae tu
   recomendación con su motivo, y espera confirmación. Lo no confirmado queda como
   `[NEEDS CLARIFICATION]` y bloquea `/sdd-plan`.
2. **Flujo antes que pantalla** — mermaid con los caminos de error, no solo el feliz.
3. **Seis estados por pantalla**: vacío, cargando, parcial, error, sin permiso, éxito.
   Y **un elemento con carácter por pantalla**, obligatorio: un dato bien presentado tiene más
   carácter que una ilustración; "la tarjeta estándar" es ausencia de decisión.
4. **Componentes**: reutiliza / extiende / nuevo. Los nuevos se justifican.
5. **Accesibilidad WCAG 2.2 AA sobre el diseño**, no al final en el código.
6. Escribe `docs/specs/NNN-slug/design.md` desde `docs/specs/_TEMPLATE/design.md`.

Reglas duras:

- **Cero tecnología**: ni framework, ni librería de componentes, ni estructura de carpetas.
- Requisito nuevo que aparezca en el diseño → **vuelve a `/sdd-specify`**, no lo metas aquí.
- Valor que no esté en los tokens → señálalo como inconsistencia, no lo codifiques a pelo.

Cierra con el bloque `### HANDOFF` de la skill.
