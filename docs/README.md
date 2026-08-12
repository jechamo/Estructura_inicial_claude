# Mapa de la documentación

Cada carpeta tiene un dueño y un propósito. Si no sabes dónde va un documento, probablemente
no hace falta escribirlo.

```
docs/
├── sdd/                Modelo operativo completo compartido por los hosts
├── product/            PRD, casos de uso, mapa de features, fuentes y visión
├── specs/              ⭐ El corazón. Una carpeta por funcionalidad
│   └── _TEMPLATE/      spec · clarifications · design · research · plan · data-model
│                       · contracts · tasks · test-plan · evidence
├── architecture/       Constitución, ADR, guía de decisión, patrones
│   ├── adr/            Decisiones estructurales (MADR)
│   └── CURRENT-STATE   Solo en repos adoptados con /onboard
├── design/             Dirección visual, revisión de intake, flujos, wireframes, design system
├── quality/            Estrategia de test, Definition of Done, informes, deuda
│   └── reports/        Informes de /sdd-verify
├── security/           Checklist OWASP, contrato auth/JWT/CSRF, amenazas y seguridad MCP
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
| [`../AGENTS.md`](../AGENTS.md) | Router operativo e identidad del proyecto |
| [`sdd/OPERATING-MODEL.md`](./sdd/OPERATING-MODEL.md) | Circuito desde intake, seis gates humanos, TDD, seguridad, delegación y handoff durable |
| [`product/PRD.md`](./product/PRD.md) | Baseline de producto aprobado; fuente de objetivos y requisitos `PRD-RF` |
| [`product/USE-CASES.md`](./product/USE-CASES.md) | Casos de uso y errores trazados a requisitos |
| [`product/FEATURE-MAP.md`](./product/FEATURE-MAP.md) | Cortes verticales propuestos para futuras specs |
| [`product/SOURCES.md`](./product/SOURCES.md) | Procedencia, accesibilidad y discrepancias del intake |
| [`architecture/constitution.md`](./architecture/constitution.md) | Arquitectura, capas, stack, prohibiciones |
| [`architecture/adr/`](./architecture/adr/) | Decisiones estructurales tomadas |
| [`quality/DEFINITION-OF-DONE.md`](./quality/DEFINITION-OF-DONE.md) | Cuándo algo está terminado |
| [`quality/TEST-STRATEGY.md`](./quality/TEST-STRATEGY.md) | Cómo se prueba |
| [`design/DIRECCION-VISUAL.md`](./design/DIRECCION-VISUAL.md) | Referencias, personalidad, tipografía, color, densidad y movimiento. **Sin aprobar, `/sdd-design` no dibuja** |
| [`security/SECURITY-CHECKLIST.md`](./security/SECURITY-CHECKLIST.md) | Qué se audita |
| [`security/AUTH-TOKENS.md`](./security/AUTH-TOKENS.md) | Decidir y verificar sesiones, JWT, cookies y CSRF sin imponer stack |

## Documentos de referencia

| Documento | Para qué |
|---|---|
| [`architecture/DECISION-GUIDE.md`](./architecture/DECISION-GUIDE.md) | Elegir arquitectura con criterio |
| [`architecture/_TEMPLATE.constitution.md`](./architecture/_TEMPLATE.constitution.md) | Plantilla completa; no es una decisión del proyecto |
| [`architecture/PATTERNS.md`](./architecture/PATTERNS.md) | Elegir patrón cuando aparece el problema |
| [`guides/INSTALACION.md`](./guides/INSTALACION.md) | **Empieza aquí si tienes un proyecto ya montado**: cómo instalar la estructura sin pisar lo que ya tienes, y cómo actualizarla |
| [`guides/COMO-TRABAJAR-CON-LOS-AGENTES.md`](./guides/COMO-TRABAJAR-CON-LOS-AGENTES.md) | **Empieza aquí si vas a usar el sistema**: comunicación entre agentes, por dónde empezar, TDD, calidad y seguridad |
| [`guides/DOCUMENTACION.md`](./guides/DOCUMENTACION.md) | Qué se versiona, circuitos docs-only/SDD, `/docs-sync`, propietarios y gates |
| [`agents/CATALOG.md`](./agents/CATALOG.md) | Qué agente hace qué y a quién llama |
| [`agents/MAPEO-10-AGENTES.md`](./agents/MAPEO-10-AGENTES.md) | La idea original de 10 agentes y por qué cambió cada pieza |
| [`agents/SKILLS-EXTERNAS.md`](./agents/SKILLS-EXTERNAS.md) | Skills de terceros: catálogo, auditoría y registro |
| [`security/MCP-SECURITY.md`](./security/MCP-SECURITY.md) | Usar MCP sin abrir un agujero |
| [`security/_TEMPLATE.threat-model.md`](./security/_TEMPLATE.threat-model.md) | Plantilla STRIDE; no es un análisis real |
| [`design/DIRECTION-GUIDE.md`](./design/DIRECTION-GUIDE.md) | Guía para decidir una dirección visual sin prefijarla |
| [`integrations/IDE-COMPATIBILITY.md`](./integrations/IDE-COMPATIBILITY.md) | Qué funciona en cada IDE y proveedor, y qué no |
| [`research/baseline-2026-07-30.md`](./research/baseline-2026-07-30.md) | Baseline vigente: skills de dominio, TDD/QA, macro/micro, MoSCoW |
| [`research/baseline-2026-07-29.md`](./research/baseline-2026-07-29.md) | Baseline anterior: formatos por IDE, hooks, seguridad, MCP |

---

## Reglas de documentación

- Se actualiza **en el mismo cambio** que el código. Documentación desfasada miente con autoridad.
- Diagramas en **mermaid** dentro del markdown: versionables y diffables. Nunca imágenes
  exportadas que nadie podrá actualizar.
- Una sola fuente de verdad por hecho. **No dupliques: enlaza.**
- `/sdd-intake` acepta PRD en texto/ruta/carpeta/URL y diseño opcional. Si no hay delegación,
  cada handoff indica perfil, comando y rutas a releer; nunca depende solo del chat.
- La plantilla conserva 20 agentes y 26 skills en seis superficies de host. No añadas
  prompts/commands paralelos ni actives MCP para representar una skill.
- Una corrección editorial entra por `/docs-sync update`; si cambia comportamiento, contrato,
  arquitectura, seguridad o persistencia, vuelve a SDD/TDD.
- Código y documentación aplicable llegan en el mismo PR, con trazabilidad
  `DOC-ID → tarea → artefacto → comprobación → evidencia`.
- No crees documentos que nadie ha pedido ni que nadie va a mantener.
- Español para la documentación, inglés para el código y los identificadores.
