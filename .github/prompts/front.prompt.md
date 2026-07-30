---
mode: frontend-expert
description: Implementa una tarea de frontend con los seis estados, accesibilidad y TDD
---

Implementa la tarea de **frontend**: `${input:tarea:¿Qué tarea? (p. ej. T-042-05)}`

Procedimiento completo: [`.claude/skills/front/SKILL.md`](../../.claude/skills/front/SKILL.md)
Perfil del agente: [`.claude/agents/frontend-expert.md`](../../.claude/agents/frontend-expert.md)

**Puerta de entrada**: la tarea existe con su criterio de aceptación, hay `design.md` (o flujo en
`docs/design/flows/`) y hay contrato en `contracts/` si consume datos. Sin contrato no adivines la
forma de la respuesta.

Ciclo:

1. 🔴 **RED** — test que falla, con la salida real pegada. Prueba **comportamiento observable por
   el usuario**: consulta por rol accesible y texto visible, no por clase CSS ni estructura del DOM.
2. 🟢 **GREEN** — lo mínimo.
3. ♻️ **REFACTOR** — con la suite en verde.

No negociable:

- **Los seis estados**: vacío, cargando, parcial, error, sin permiso, éxito. Un componente que
  trae datos no está terminado sin los seis. Es lo que más se olvida y lo que más se nota.
- Navegable **solo con teclado**, incluidos modales: foco atrapado, `Esc` cierra, foco devuelto.
  Foco visible siempre. Contraste ≥ 4.5:1. Nada comunicado solo por color. Verifica con axe.
- HTML semántico primero. Un `div` con `onClick` no es un botón.
- **Cero lógica de negocio y cero secretos en el cliente.** Todo lo que llega al navegador es
  público. Ocultar un botón no es autorización.
- Estado en el nivel más bajo que funcione. Filtros y paginación en la URL.
- Presentación separada de obtención de datos, para poder testear sin red.
- Rendimiento con medición previa y presupuesto declarado. Memoiza cuando lo pida el perfilador.

Fidelidad al diseño: toda desviación se acuerda y se anota. Cierra con el bloque `### HANDOFF`.
