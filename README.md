# Ecosistema de agentes SDD

Estructura inicial lista para **copiar y pegar** en cualquier proyecto. Trae un circuito de
Spec-Driven Development completo, 20 agentes especializados, skills, hooks y un validador
determinista, con soporte para **Claude Code, GitHub Copilot, VS Code, Cursor, Antigravity
y Codex**.

> **Regla cero: ninguna línea de código se escribe sin una especificación aprobada.**
> El artefacto de verdad es la spec. El código es su compilación.

El soporte no es idéntico en todos: las reglas y el protocolo de handoff son universales,
pero la delegación real y los hooks dependen de lo que cada host expone. La matriz honesta
—con lo verificado y lo no verificado separado— está en
[`docs/integrations/IDE-COMPATIBILITY.md`](docs/integrations/IDE-COMPATIBILITY.md).

---

## Empezar en 3 pasos

1. **Copia** todo el contenido de esta carpeta en tu proyecto (incluidos los directorios que
   empiezan por punto).
2. **Abre** el proyecto en tu IDE.
3. **Escribe** lo que quieres construir. El sistema te lleva de la mano.

```bash
/sdd-start
```

Si prefieres saltarte el router:

| Tu situación | Comando |
|---|---|
| Proyecto nuevo, carpeta vacía | `/sdd-init` |
| Repositorio existente sin documentar | `/onboard` |
| Funcionalidad nueva sobre proyecto ya montado | `/sdd-specify` |
| No sé en qué punto estoy | `/sdd-status` |

---

## El circuito SDD

```mermaid
flowchart LR
    subgraph A["Circuito A · Proyecto nuevo"]
        I["/sdd-init<br/>📐 architect"]
    end

    subgraph B["Circuito B · Toda funcionalidad"]
        S["/sdd-specify<br/>📝 spec-analyst"]
        C["/sdd-clarify<br/>📝 spec-analyst"]
        P["/sdd-plan<br/>🗂️ planner"]
        T["/sdd-tasks<br/>🗂️ planner"]
        M["/sdd-implement<br/>⚙️ implementer"]
        V["/sdd-verify<br/>🔍 reviewer + 🛡️ security"]
        SH["/sdd-ship<br/>🚀 release-manager"]
    end

    I --> S --> C --> P --> T --> M --> V --> SH
    V -.rojo.-> M
    C -.dudas.-> S
    P -.viola arquitectura.-> I

    style I fill:#553c9a,color:#fff
    style M fill:#276749,color:#fff
    style V fill:#9b2c2c,color:#fff
    style SH fill:#2c5282,color:#fff
```

Cada fase produce un fichero que la siguiente **lee**. Esa es la memoria del sistema:
no depende del chat, vive en el repositorio.

| Fase | Produce | Puerta de salida |
|---|---|---|
| `/sdd-init` | `constitution.md` + ADR-0001 | Arquitectura elegida y justificada |
| `/sdd-specify` | `spec.md` | Requisitos EARS, criterios testables, **cero tecnología** |
| `/sdd-clarify` | `clarifications.md` | 0 marcadores `[NEEDS CLARIFICATION]` |
| `/sdd-plan` | `plan.md`, `data-model.md`, `contracts/`, `research.md` | Conforme a la constitución |
| `/sdd-tasks` | `tasks.md` | Tareas atómicas, ordenadas, con test asociado |
| `/sdd-implement` | Código + tests | TDD: rojo → verde → refactor |
| `/sdd-verify` | Informes de calidad y seguridad | Todos los gates en verde |
| `/sdd-ship` | PR, CHANGELOG, bitácora | Revisión humana |

---

## Supuesto 1 · Proyecto nuevo desde cero

**Empiezas con `/sdd-init`** (agente `architect`).

```mermaid
sequenceDiagram
    actor U as Tú
    participant O as 🎯 orchestrator
    participant A as 📐 architect
    participant S as 📝 spec-analyst
    participant P as 🗂️ planner
    participant I as ⚙️ implementer
    participant R as 🔍 reviewer
    participant Sec as 🛡️ security
    participant RM as 🚀 release

    U->>O: "Quiero una app de reservas"
    O->>O: No hay constitution.md → proyecto nuevo
    O->>A: /sdd-init

    A->>U: 8 preguntas (producto, escala, equipo, restricciones…)
    U-->>A: respuestas
    A->>U: Recomendación + 1 alternativa, con coste
    U-->>A: confirmo
    A->>A: constitution.md · ADR-0001 · ADR-0002<br/>esqueleto · CI · test de humo
    A-->>U: HANDOFF → spec-analyst

    U->>S: /sdd-specify "reservar una mesa"
    S->>S: spec.md — EARS + Gherkin + casos límite
    S->>U: 5 preguntas de clarificación
    U-->>S: respuestas
    S-->>U: HANDOFF → planner

    U->>P: /sdd-plan
    P->>P: research · data-model · contracts · plan
    Note over P: consulta a database-expert,<br/>api-designer, ux-designer
    P->>P: /sdd-tasks → tasks.md
    P-->>U: HANDOFF → implementer

    U->>I: /sdd-implement
    loop Por cada tarea
        I->>I: 🔴 test que falla (salida real)
        I->>I: 🟢 código mínimo
        I->>I: 🔵 refactor con SOLID
    end
    I-->>U: HANDOFF → verify

    U->>R: /sdd-verify
    R->>Sec: auditoría OWASP
    Sec-->>R: 0 críticos, 0 altos
    R-->>U: ✅ APTO

    U->>RM: /sdd-ship
    RM->>RM: gates · PR · CHANGELOG · bitácora
    RM-->>U: PR preparado (NO enviado)
```

### Qué obtienes en `/sdd-init`

- `docs/architecture/constitution.md` — arquitectura, capas, stack, prohibiciones
- `ADR-0001` (arquitectura) y `ADR-0002` (stack), en formato MADR
- Esqueleto de carpetas con un README por capa
- Linter, formateador, tipado estricto, runner de tests, CI con los gates
- `TEST-STRATEGY.md` y `THREAT-MODEL.md` adaptados
- Un test de humo **ejecutado**, con la salida pegada

---

## Supuesto 2 · Funcionalidad nueva sobre proyecto existente

**Empiezas con `/sdd-specify`** (agente `spec-analyst`). El `architect` **no interviene**:
la arquitectura ya está decidida en `constitution.md`.

```mermaid
flowchart TD
    U(["Tú: 'quiero añadir checkout como invitado'"]) --> Q{¿Existe<br/>constitution.md?}
    Q -->|No| ON["/onboard<br/>🔎 research-analyst → 📐 architect"]
    ON --> S
    Q -->|Sí| S["/sdd-specify<br/>📝 spec-analyst"]

    S --> C{¿Marcadores<br/>NEEDS CLARIFICATION?}
    C -->|Sí| CL["/sdd-clarify<br/>máx. 5 preguntas por ronda"]
    CL --> C
    C -->|No| P["/sdd-plan<br/>🗂️ planner"]

    P --> AR{¿Viola la<br/>constitución?}
    AR -->|Sí| ADR["📐 architect<br/>nuevo ADR"]
    ADR --> P
    AR -->|No| T["/sdd-tasks"]

    T --> IM["/sdd-implement<br/>⚙️ TDD por tarea"]
    IM --> V["/sdd-verify"]
    V --> G{¿Gates<br/>en verde?}
    G -->|No| IM
    G -->|Sí| SH["/sdd-ship<br/>🚀 PR preparado"]
    SH --> H([Revisión humana])

    style S fill:#2b6cb0,color:#fff
    style IM fill:#276749,color:#fff
    style V fill:#9b2c2c,color:#fff
```

### Subflujos que se activan solos

| Situación | Quién entra |
|---|---|
| Hay diseño en Figma o Stitch | `ux-designer` → `/design-sync` → `frontend-expert` |
| Cambia el esquema de datos | `database-expert` (migración reversible, expand→migrate→contract) |
| Se toca la API pública | `api-designer` (contract-first, versionado, tests de contrato) |
| El test es difícil de escribir | `test-engineer` |
| El código huele mal | `refactor-specialist` |
| Algo va lento | `performance-optimizer` (con medición previa, siempre) |
| Se toca auth, pagos o datos personales | `security-auditor` de forma obligatoria |
| Se toma una decisión relevante | `bitacora-keeper` + `/adr` si es estructural |

---

## Los 20 agentes

```mermaid
flowchart TD
    U([Usuario]) --> O["🎯 orchestrator"]
    O --> F["Agentes de fase<br/>spec-analyst · architect · planner<br/>implementer · code-reviewer<br/>release-manager · research-analyst"]
    F -.consulta y recupera control.-> E["Especialistas<br/>ux · frontend · backend · database<br/>api · test · security · refactor<br/>performance · devops · docs · bitácora"]
    style O fill:#4a5568,color:#fff
```

**Modelo híbrido**: el `orchestrator` enruta por defecto, los agentes de fase conocen su
sucesor y hacen handoff explícito, los especialistas **devuelven el control** sin encadenar.
Profundidad máxima de delegación: **2 niveles**.

Catálogo completo con handoffs: [`docs/agents/CATALOG.md`](docs/agents/CATALOG.md).

### Protocolo de handoff

```
### HANDOFF
- Agente origen: <nombre>
- Fase completada: <fase SDD>
- Artefactos: <rutas>
- Decisiones tomadas: <lista, o "ninguna">
- Bloqueos / supuestos: <lista, o "ninguno">
- Siguiente agente sugerido: <nombre> — motivo: <por qué>
- Contexto que necesita: <mínimo imprescindible>
```

---

## Compatibilidad entre IDEs

Una sola fuente de verdad — [`AGENTS.md`](AGENTS.md) — y cada herramienta la lee por su vía:

| Herramienta | Lee | Agentes | Comandos |
|---|---|---|---|
| **Claude Code** | `CLAUDE.md` → `AGENTS.md` | `.claude/agents/*.md` | `.claude/skills/*/SKILL.md` (`/sdd-...`) |
| **VS Code (Copilot)** | `.github/copilot-instructions.md` + `.github/instructions/*` | `.claude/agents/` **y** `.github/agents/*.agent.md` | `.github/prompts/*.prompt.md` |
| **GitHub Copilot** (CLI / nube) | `AGENTS.md` + `.github/copilot-instructions.md` | `.github/agents/*.agent.md` | `.github/prompts/` |
| **Cursor** | `.cursor/rules/*.mdc` | Referencia a `.claude/agents/` | Reglas por glob |
| **Antigravity** | `AGENTS.md` + `.agents/rules/*.md` | Perfiles de `.claude/agents/` | `.agents/workflows/*.md` |

> **Sobre VS Code**: sí, funciona. VS Code lee los agentes personalizados tanto de
> `.github/agents/` como de `.claude/agents/`, así que los perfiles canónicos sirven para
> ambos. En `.github/agents/` solo hay envoltorios finos que apuntan al perfil real y añaden
> `handoffs`, que es una función propia de VS Code y genera botones de traspaso en el chat.
> Detalle en [`.github/agents/README.md`](.github/agents/README.md).

---

## Hooks (Claude Code)

Escritos en Node sin dependencias, así que funcionan igual en Windows, macOS y Linux.

| Evento | Hook | Efecto |
|---|---|---|
| `SessionStart` | `session-context.mjs` | Inyecta arquitectura, spec activa, tareas y últimas decisiones |
| `UserPromptSubmit` | `sdd-router.mjs` | Detecta la intención y recuerda la fase SDD correcta |
| `PreToolUse` (Edit\|Write) | `guard-write.mjs` | `deny` en `.env`, secretos y artefactos generados · `ask` en agentes, skills y constitución |
| `PreToolUse` (Bash) | `guard-bash.mjs` | `deny` en destructivo · `ask` en push, deploy, IaC y publicación |
| `PostToolUse` (Edit\|Write) | `format-and-lint.mjs` | Formatea y linta lo tocado |
| `SubagentStart` / `SubagentStop` | `subagent-log.mjs` | **Registra qué subagente trabajó realmente**, fuera del modelo |
| `Stop` | `session-log.mjs` | Registra la sesión en la bitácora |

Tres decisiones, no dos: `deny` bloquea, **`ask` escala al humano**, `allow` deja pasar.
Bloquear un `terraform apply` legítimo frustra; dejarlo pasar sin preguntar, arruina.

Los payloads se normalizan entre hosts (`tool_name`/`tool_input` de Claude y Copilot,
`toolCall.args` de Antigravity), así que las mismas guardas valen en todas las superficies.

Desactivación temporal: `SDD_GATES=off`.
Detalle y cómo probarlos: [`.claude/hooks/README.md`](.claude/hooks/README.md).

### Trazabilidad: qué agente hizo el trabajo de verdad

La narración del chat —*"ahora el `backend-expert` implementa…"*— demuestra lo que el modelo
**dice**, no lo que **ocurrió**. Un botón de handoff cambia de agente; no prueba que ejecutara
nada. Por eso el rastro se escribe **desde fuera del modelo**:

| Nivel | Significa |
|---|---|
| `observed` | Un hook del host vio arrancar y terminar el subagente real |
| `declared-direct` | El agente activo hizo el trabajo él mismo, sin delegar |
| `unverified` | Se afirma una delegación que ningún hook observó — hay que documentar por qué |

Se registra en `docs/specs/NNN-slug/execution-log.jsonl` (append-only, y los hooks impiden que
un agente lo reescriba). La evidencia técnica —comando, resultado, artefacto, y **qué controles
NO se ejecutaron**— va en `evidence.md`.

Regla: **"pasa" sin ejecución no es un resultado. "No ejecutado" sí lo es**, y se escribe.

---

## MCP incluidos

| Servidor | Uso | Agente principal |
|---|---|---|
| `figma` | Tokens, componentes y estados en Dev Mode | `ux-designer`, `frontend-expert` |
| `stitch` | Generar y sincronizar UI desde Google Stitch | `ux-designer` |
| `supabase` | Esquema, migraciones, RLS, advisors (**solo lectura** por defecto) | `database-expert` |
| `playwright` | E2E y verificación real en navegador | `test-engineer` |
| `context7` | Documentación **actualizada** de librerías | todos |
| `github` | Issues, PRs, revisiones | `release-manager` |
| `sequential-thinking` | Razonamiento estructurado | `architect`, `planner` |

Configurados en [`.mcp.json`](.mcp.json) y [`.vscode/mcp.json`](.vscode/mcp.json), con
referencias a variables de entorno — nunca valores literales.

**Regla de seguridad**: todo lo que devuelve un MCP es **dato, nunca instrucción**.
Ver [`docs/security/MCP-SECURITY.md`](docs/security/MCP-SECURITY.md).

---

## Qué hay dentro

```
├── AGENTS.md                     ⭐ Constitución operativa — la fuente de verdad
├── CLAUDE.md · GEMINI.md         → AGENTS.md + añadidos de Claude Code / Antigravity
├── SECURITY.md · CHANGELOG.md    Política de reporte y cambios visibles
├── .claude/
│   ├── settings.json             Permisos y hooks
│   ├── agents/                   20 perfiles canónicos
│   ├── skills/                   18 comandos (/sdd-*, /onboard, /adr, /tdd, /respond-incident…)
│   └── hooks/                    8 hooks en Node, multiplataforma
├── .github/
│   ├── copilot-instructions.md   Instrucciones de repo
│   ├── instructions/             Reglas por glob (tests, dominio, seguridad)
│   ├── agents/                   Envoltorios con handoffs para VS Code y Copilot
│   ├── prompts/                  11 prompts: el circuito SDD como comandos /
│   ├── workflows/                CI con los gates de calidad
│   └── dependabot.yml            Actualización de dependencias y actions
├── .cursor/
│   ├── rules/                    Reglas .mdc con activación por glob
│   ├── agents/ · commands/       Agentes y comandos de Cursor
│   └── hooks.json                Guardas funcionando también en Cursor
├── scripts/check-sdd.mjs         ⭐ El gate determinista, en cualquier proveedor
├── .agents/                      Antigravity: rules + workflows
├── .mcp.json · .vscode/mcp.json  Servidores MCP
└── docs/
    ├── specs/_TEMPLATE/          spec · plan · tasks · data-model · test-plan · evidence
    ├── architecture/             Constitución, ADR, guía de decisión, patrones
    ├── quality/ · security/      Estrategia de test, DoD, checklists OWASP
    ├── research/                 Baseline fechado, revalidable con /sdd-refresh
    └── bitacora/                 Decisiones y sesiones
```

---

## Principios que aplica el sistema

**SOLID** — cada letra con su detector de olor y su refactor asociado en
[`refactor-specialist`](.claude/agents/refactor-specialist.md).

**DRY / KISS / YAGNI**, con el matiz que casi siempre se pierde: DRY se aplica al
*conocimiento*, no a las líneas. Dos cosas que hoy se parecen pero cambian por motivos
distintos **no se unifican**.

**Patrones de diseño** solo cuando el problema aparece, con la alternativa descartada
documentada: [`docs/architecture/PATTERNS.md`](docs/architecture/PATTERNS.md).

**Arquitectura por ejes, no por etiquetas.** "Clean", "hexagonal", "monolito" y
"microservicios" no son opciones del mismo menú: describen dimensiones distintas y se
combinan. La constitución declara una posición por eje —despliegue, dependencias, dominio,
integración, datos, experiencia—, cada una justificable y revisable por separado.

**TDD estricto**: sin test rojo demostrado no hay código. Y "los tests pasan" sin la salida
pegada no cuenta. La cobertura se orienta al **riesgo**, no a un porcentaje universal: el
umbral que importa es *cero zonas críticas sin probar*.

**Seguridad continua**: OWASP Top 10, ASVS y —si el producto usa IA— OWASP Top 10 for
Agentic Applications.

**Bitácora obligatoria**: el chat se pierde, el repositorio permanece. Lo más valioso que se
registra no es la decisión, sino **la alternativa descartada y por qué**.

---

## Documentación

| Documento | Para qué |
|---|---|
| [`AGENTS.md`](AGENTS.md) | La constitución. Empieza aquí |
| [`docs/README.md`](docs/README.md) | Mapa de toda la documentación |
| [`docs/agents/CATALOG.md`](docs/agents/CATALOG.md) | Los 20 agentes y sus handoffs |
| [`docs/architecture/DECISION-GUIDE.md`](docs/architecture/DECISION-GUIDE.md) | Elegir arquitectura con criterio |
| [`docs/architecture/PATTERNS.md`](docs/architecture/PATTERNS.md) | Catálogo de patrones por problema |
| [`docs/quality/TEST-STRATEGY.md`](docs/quality/TEST-STRATEGY.md) | Cómo se prueba aquí |
| [`docs/quality/DEFINITION-OF-DONE.md`](docs/quality/DEFINITION-OF-DONE.md) | Cuándo algo está terminado |
| [`docs/security/SECURITY-CHECKLIST.md`](docs/security/SECURITY-CHECKLIST.md) | Qué se audita |
| [`docs/integrations/IDE-COMPATIBILITY.md`](docs/integrations/IDE-COMPATIBILITY.md) | Qué funciona en cada IDE, y qué no |
| [`docs/research/baseline-2026-07-29.md`](docs/research/baseline-2026-07-29.md) | Qué se verificó, cuándo y con qué fuente |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | Cómo trabajar en un repo con este sistema |

---

## El gate que no puede mentir

Una Definition of Done que marca el propio modelo no es un gate: es una declaración de
intenciones. Por eso hay un validador que comprueba **contra el sistema de ficheros**:

```bash
node scripts/check-sdd.mjs --strict
```

Verifica que toda tarea `hecho` tiene evidencia y ejecución registrada, que ningún criterio
de aceptación quedó sin test, que no se planificó sobre ambigüedades, que el log de ejecución
no se ha manipulado, y que las superficies de los IDE no han derivado del perfil canónico.

Está en CI y **falla el build**. No depende del IDE, del proveedor ni del modelo: solo de
Node y del repositorio. En un host sin hooks, es tu única garantía real.

---

## Alcance honesto

No existe un catálogo finito y universal de "todas" las arquitecturas, patrones o skills.
Esta plantilla cubre las familias reconocidas y de mayor aplicación, **obliga a justificar
cada elección**, y trae `/sdd-refresh` para revalidar el baseline cuando cambien los
estándares, los formatos de los IDE o los riesgos.

Lo que no se ha verificado está listado como tal en el
[baseline](docs/research/baseline-2026-07-29.md) §7. Preferimos un hueco declarado a una
afirmación cómoda.

---

## Personalizar para tu proyecto

1. Rellena la tabla §1 de [`AGENTS.md`](AGENTS.md) — o deja que lo haga `/sdd-init`.
2. Ajusta `.claude/hooks/format-and-lint.mjs` a tu formateador si no usas Prettier/Biome/Ruff.
3. Quita del `.mcp.json` los servidores que no uses: cada MCP activo consume contexto y
   amplía la superficie de ataque.
4. Ajusta los umbrales de `docs/quality/DEFINITION-OF-DONE.md` a tu realidad — pero no los
   bajes sin escribir por qué en la bitácora.
5. Añade especialistas propios en `.claude/agents/` siguiendo el mismo formato.
