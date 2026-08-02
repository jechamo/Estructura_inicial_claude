Ejecuta la fase **design** del circuito SDD: convierte la spec en documento de diseño.

Procedimiento completo: [`.agents/skills/sdd-design/SKILL.md`](../../.agents/skills/sdd-design/SKILL.md)
Perfil del agente: [`.claude/agents/ux-designer.md`](../../.claude/agents/ux-designer.md)

**Puerta de entrada**: `docs/specs/NNN-slug/spec.md` existe y no tiene marcadores
`[NEEDS CLARIFICATION]`. Si quedan, para y pide `/sdd-clarify`.

Si la funcionalidad no tiene interfaz, di por qué se salta esta fase y pasa a `/sdd-plan`.

0. **Dirección visual: sin esto no se dibuja.** Comprueba `docs/design/DIRECCION-VISUAL.md`. Si no
   existe o sigue en borrador, la cierras **con el usuario**: referencias reales y una
   antirreferencia, tres adjetivos que excluyan algo, escala tipográfica con contraste real,
   densidad, movimiento y qué NO va a hacer el proyecto. Los seis estados y la accesibilidad son
   un **suelo**: se cumplen enteros y aun así sale el MVP de cuatro cajas grises.
1. **Pregunta antes de dibujar**: cada duda que cambie el resultado, con tu recomendación y su
   motivo. Espera confirmación. Lo no confirmado queda marcado y bloquea `/sdd-plan`.
2. **Flujo antes que pantalla**, en mermaid, con los caminos de error.
3. **Seis estados por pantalla**: vacío, cargando, parcial, error, sin permiso, éxito. Y **un
   elemento con carácter por pantalla**: "la tarjeta estándar" es ausencia de decisión.
4. **Componentes**: reutiliza / extiende / nuevo, los nuevos justificados.
5. **Accesibilidad WCAG 2.2 AA sobre el diseño**, no al final en el código.
6. Escribe `docs/specs/NNN-slug/design.md` desde `docs/specs/_TEMPLATE/design.md`.

**Cero tecnología.** Requisito nuevo que aparezca → vuelve a `/sdd-specify`.

Cierra con el bloque `### HANDOFF`.
