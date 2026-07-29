# Bitácora de decisiones

> El chat se pierde; el repositorio permanece.
> Entradas **nuevas arriba**. Nunca se reescribe ni se borra una entrada: si algo cambió,
> se añade una nueva que la reemplaza y enlaza a la anterior.
>
> Formato: [`TEMPLATE.md`](./TEMPLATE.md) · Decisiones estructurales:
> [`../architecture/adr/`](../architecture/adr/) · Sesiones: [`sessions/`](./sessions/)

---

## YYYY-MM-DD · Adopción del ecosistema de agentes SDD

- **Tipo**: decisión
- **Contexto**: el proyecto arranca con la estructura inicial de agentes, skills y hooks.
- **Decisión**: se adopta el circuito SDD descrito en [`AGENTS.md`](../../AGENTS.md) §2 como
  única vía para producir código. Ninguna línea se escribe sin spec aprobada y test rojo previo.
- **Alternativas descartadas**:
  - *Trabajo ad-hoc con el agente*: rápido al principio, imposible de auditar y de retomar
    después. El contexto se pierde entre sesiones.
  - *Solo documentación al final*: nadie la escribe, y cuando se escribe ya no es cierta.
- **Impacto**: toda funcionalidad pasa por `specify → clarify → plan → tasks → implement →
  verify → ship`. Los gates de calidad son bloqueantes.
- **Deuda aceptada**: ninguna.
- **Referencias**: `AGENTS.md`, `.claude/agents/`, `.claude/skills/`
- **Quién**: <humano>

---

<!-- Añade las entradas nuevas justo debajo de esta línea, empujando esta hacia abajo -->
