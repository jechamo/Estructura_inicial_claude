# Diseño del flujo documental · 005

No aplica diseño de interfaz de aplicación. El flujo conversacional/documental es:

```mermaid
flowchart LR
  U[Usuario y fuentes] --> O[orchestrator]
  O --> S1[spec-analyst: normaliza producto]
  S1 --> X[HANDOFF durable]
  X --> UX[ux-designer: analiza/proponen diseño]
  UX --> Y[HANDOFF durable]
  Y --> S2[spec-analyst: integra discrepancias]
  S2 --> G{Gate humano de producto}
  G -->|greenfield aprobado| A[architect]
  G -->|brownfield aprobado| V[primera spec vertical]
  G -->|pendiente/rechazado| B[Bloqueo explícito]
```

Estados del gate: `legacy-pending`, `pendiente`, `aprobado`, `rechazado`. No existe transición a
arquitectura/spec si el estado es pendiente o rechazado.
