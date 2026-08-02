Implementa una tarea de **frontend** con los seis estados, accesibilidad y TDD.

Procedimiento completo: [`.agents/skills/front/SKILL.md`](../../.agents/skills/front/SKILL.md)
Perfil del agente: [`.claude/agents/frontend-expert.md`](../../.claude/agents/frontend-expert.md)

**Puerta de entrada**: tarea con criterio de aceptación, `design.md` (o flujo en
`docs/design/flows/`) y contrato en `contracts/` si consume datos. Sin contrato no adivines la
forma de la respuesta.

Ciclo: 🔴 test que falla **con la salida real pegada** → 🟢 código mínimo → ♻️ refactor en verde.
Prueba **comportamiento observable por el usuario**: rol accesible y texto visible, no clases CSS
ni estructura interna del DOM.

Innegociables:

- **Los seis estados**: vacío, cargando, parcial, error, sin permiso, éxito. Sin ellos el
  componente no está terminado.
- Navegable solo con teclado, modales incluidos: foco atrapado, `Esc` cierra, foco devuelto.
  Foco visible. Contraste ≥ 4.5:1. Nada solo por color. Verifica con axe.
- HTML semántico primero: un `div` con `onClick` no es un botón.
- **Cero lógica de negocio y cero secretos en el cliente.** Ocultar un botón no es autorización.
- Estado en el nivel más bajo que funcione; filtros y paginación en la URL.
- Presentación separada de la obtención de datos, para testear sin red.
- Rendimiento con medición previa y presupuesto declarado.

Toda desviación del diseño se acuerda y se anota. Cierra con el bloque `### HANDOFF`.
