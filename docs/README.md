# Mapa de la documentación

Cada carpeta tiene un dueño y un propósito. Si no sabes dónde va un documento, probablemente
no hace falta escribirlo.

```
docs/
├── product/            Visión, contexto de negocio, público objetivo
├── specs/              ⭐ El corazón. Una carpeta por funcionalidad
│   └── _TEMPLATE/      spec · clarifications · design · research · plan · data-model
│                       · contracts · tasks · test-plan · evidence
├── architecture/       Constitución, ADR, guía de decisión, patrones
│   ├── adr/            Decisiones estructurales (MADR)
│   └── CURRENT-STATE   Solo en repos adoptados con /onboard
├── design/             Flujos, wireframes, design system, accesibilidad
├── quality/            Estrategia de test, Definition of Done, informes, deuda
│   └── reports/        Informes de /sdd-verify
├── security/           Checklist OWASP, modelo de amenazas, seguridad MCP
│   └── reports/        Informes de /security-scan
├── ops/                Runbooks, observabilidad, despliegue
│   └── runbooks/
├── agents/             Catálogo de agentes y su protocolo de handoff
├── integrations/       Compatibilidad entre IDEs y política de MCP
├── research/           Baseline fechado de lo verificado (/sdd-refresh lo revalida)
├── guides/             Guías por tarea para desarrolladores
└── bitacora/           ⭐ Memoria del proyecto
    ├── DECISIONS.md    Diario cronológico de decisiones
    ├── TEMPLATE.md     Formato de entrada
    └── sessions/       Traza automática de sesiones (hook)
```

---

## Documentos vinculantes

Estos **obligan**, no son sugerencias:

| Documento | Qué obliga |
|---|---|
| [`../AGENTS.md`](../AGENTS.md) | Constitución operativa: circuito SDD, principios, TDD, seguridad |
| [`architecture/constitution.md`](./architecture/constitution.md) | Arquitectura, capas, stack, prohibiciones |
| [`architecture/adr/`](./architecture/adr/) | Decisiones estructurales tomadas |
| [`quality/DEFINITION-OF-DONE.md`](./quality/DEFINITION-OF-DONE.md) | Cuándo algo está terminado |
| [`quality/TEST-STRATEGY.md`](./quality/TEST-STRATEGY.md) | Cómo se prueba |
| [`security/SECURITY-CHECKLIST.md`](./security/SECURITY-CHECKLIST.md) | Qué se audita |

## Documentos de referencia

| Documento | Para qué |
|---|---|
| [`architecture/DECISION-GUIDE.md`](./architecture/DECISION-GUIDE.md) | Elegir arquitectura con criterio |
| [`architecture/PATTERNS.md`](./architecture/PATTERNS.md) | Elegir patrón cuando aparece el problema |
| [`agents/CATALOG.md`](./agents/CATALOG.md) | Qué agente hace qué y a quién llama |
| [`agents/MAPEO-10-AGENTES.md`](./agents/MAPEO-10-AGENTES.md) | La idea original de 10 agentes y por qué cambió cada pieza |
| [`agents/SKILLS-EXTERNAS.md`](./agents/SKILLS-EXTERNAS.md) | Skills de terceros: catálogo, auditoría y registro |
| [`security/MCP-SECURITY.md`](./security/MCP-SECURITY.md) | Usar MCP sin abrir un agujero |
| [`integrations/IDE-COMPATIBILITY.md`](./integrations/IDE-COMPATIBILITY.md) | Qué funciona en cada IDE y proveedor, y qué no |
| [`research/baseline-2026-07-30.md`](./research/baseline-2026-07-30.md) | Baseline vigente: skills de dominio, TDD/QA, macro/micro, MoSCoW |
| [`research/baseline-2026-07-29.md`](./research/baseline-2026-07-29.md) | Baseline anterior: formatos por IDE, hooks, seguridad, MCP |

---

## Reglas de documentación

- Se actualiza **en el mismo cambio** que el código. Documentación desfasada miente con autoridad.
- Diagramas en **mermaid** dentro del markdown: versionables y diffables. Nunca imágenes
  exportadas que nadie podrá actualizar.
- Una sola fuente de verdad por hecho. **No dupliques: enlaza.**
- No crees documentos que nadie ha pedido ni que nadie va a mantener.
- Español para la documentación, inglés para el código y los identificadores.
