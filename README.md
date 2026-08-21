# Ecosistema de agentes SDD

Estructura inicial lista para **copiar y pegar** en cualquier proyecto. Trae un circuito de
Spec-Driven Development completo, 20 agentes especializados, 27 skills, hooks y un validador
determinista, con soporte para **Claude Code, GitHub Copilot/VS Code, Cursor, Codex, Gemini CLI
y Antigravity**.

> **Regla cero: ninguna línea de código se escribe sin una especificación aprobada.**
> El artefacto de verdad es la spec. El código es su compilación.

El soporte no es idéntico en todos: las reglas y el protocolo de handoff son universales,
pero la delegación real y los hooks dependen de lo que cada host expone. La matriz honesta
—con lo verificado y lo no verificado separado— está en
[`docs/integrations/IDE-COMPATIBILITY.md`](docs/integrations/IDE-COMPATIBILITY.md).

---

## Instalar

Sin `#referencia`, npm usa la rama predeterminada del repositorio: aquí es `main`. Esta es la
opción móvil para obtener inmediatamente la última versión disponible:

```powershell
npx --yes github:jechamo/Estructura_inicial_claude init "C:\ruta\proyecto" --mode auto --dry-run
npx --yes github:jechamo/Estructura_inicial_claude init "C:\ruta\proyecto" --mode auto
```

Para CI, automatizaciones o una instalación reproducible, fija el tag estable e inmutable:

```powershell
npx --yes github:jechamo/Estructura_inicial_claude#v0.8.0 init "C:\ruta\proyecto" --mode auto
```

**Nunca reinicia contexto existente.** Los documentos propios se conservan, los adaptadores
Markdown usan bloques gestionados y los conflictos quedan en `.sdd/conflicts/<version>/`.
MCP está desactivado salvo selección explícita con `--with-mcp`.

Guía completa: [`docs/guides/INSTALACION.md`](docs/guides/INSTALACION.md).

## Y después

1. Entrega el PRD —texto, ruta, carpeta o URL— y, si existe, el diseño al `orchestrator`;
   ejecutará `/sdd-intake`. Si aún no hay documentación de producto, el intake es conversacional.
2. Aprueba producto antes de arquitectura; después usa `/sdd-init` en greenfield o `/onboard`
   en un repositorio existente sin documentar.
3. Crea el baseline de documentación oficial con `/docs-sync bootstrap` y apruébalo después de
   revisar fuentes, artefactos y gates.
4. Revisa las propuestas antes de aprobar arquitectura, territorios y checks del stack.
5. Abre el proyecto en cualquiera de los hosts soportados y entra por `orchestrator`.

```bash
/sdd-start
```

Si prefieres saltarte el router:

| Tu situación | Comando |
|---|---|
| Tengo un PRD, requisitos o diseño opcional | `/sdd-intake` |
| Proyecto nuevo, carpeta vacía | `/sdd-intake` → `/sdd-init` |
| Repositorio existente sin documentar | `/onboard` |
| Funcionalidad nueva sobre proyecto ya montado | `/sdd-specify` |
| Solo quiero corregir o sincronizar documentación | `/docs-sync update` |
| No sé en qué punto estoy | `/sdd-status` |

### Automatización determinista

Las skills delegan mecánica repetitiva en el mismo CLI portable de Node:

```bash
node scripts/sdd-project.mjs --help
node scripts/sdd-project.mjs status --json [--spec NNN]
node scripts/sdd-project.mjs scaffold --spec NNN --phase design|plan|tasks|verify --dry-run
node scripts/sdd-project.mjs trace-status --spec NNN --json
node scripts/check-sdd.mjs --json --strict --spec NNN
node scripts/sdd-project.mjs generate <id> --dry-run
```

`--help`, `-h` o `help` imprimen la lista completa de subcomandos agrupados por tarea. Todos
aceptan `--json`, y cuando se pidió JSON el error también sale en JSON por `stderr`. Los comandos
de consulta —`status`, `product-status`, `docs-status`— responden aunque el proyecto todavía no
tenga instalación registrada: preguntar por el estado no puede exigir que el estado ya exista.

El CLI hace inventario, numera, instancia plantillas y calcula cobertura; **no decide** requisitos,
arquitectura, tareas, DTO ni veredictos. Los generadores son opt-in en `.sdd/generators.json`, no
usan shell, tienen timeout acotado y no instalan dependencias. El CLI confina las rutas declaradas, pero no es un sandbox
del sistema operativo: solo se registran ejecutables confiables y aprobados por el proyecto.

---

## El circuito SDD

```mermaid
flowchart LR
    subgraph A["Circuito A · Proyecto nuevo"]
        IN["/sdd-intake<br/>🎯 orchestrator"]
        I["/sdd-init<br/>📐 architect"]
    end

    subgraph B["Circuito B · Toda funcionalidad"]
        S["/sdd-specify<br/>📝 spec-analyst"]
        C["/sdd-clarify<br/>📝 spec-analyst"]
        D["/sdd-design<br/>🎨 ux-designer"]
        P["/sdd-plan<br/>🗂️ planner"]
        T["/sdd-tasks<br/>🗂️ planner"]
        M["/sdd-implement<br/>⚙️ implementer<br/><i>/middle · /front · /bbdd</i>"]
        V["/sdd-verify<br/>🔍 reviewer + 🛡️ security"]
        SH["/sdd-ship<br/>🚀 release-manager"]
    end

    IN --> I --> S --> C --> D --> P --> T --> M --> V --> SH
    C -->|sin interfaz| P
    V -.rojo.-> M
    C -.dudas.-> S
    D -.requisito nuevo.-> S
    P -.viola arquitectura.-> I

    style IN fill:#805ad5,color:#fff
    style I fill:#553c9a,color:#fff
    style M fill:#276749,color:#fff
    style V fill:#9b2c2c,color:#fff
    style SH fill:#2c5282,color:#fff
```

Cada fase produce un fichero que la siguiente **lee**. Esa es la memoria del sistema:
no depende del chat, vive en el repositorio.

| Fase | Produce | Puerta de salida |
|---|---|---|
| `/sdd-intake` | `PRD.md`, `USE-CASES.md`, `FEATURE-MAP.md`, `SOURCES.md` | Producto, casos, discrepancias y mapa de specs aprobados |
| `/sdd-init` | `constitution.md` + ADR-0001 | Arquitectura elegida y justificada |
| `/sdd-specify` | `spec.md` | Requisitos EARS con **MoSCoW sobre esfuerzo** (must ≤ 60 %), criterios testables, **cero tecnología** |
| `/sdd-clarify` | `clarifications.md` | 0 marcadores `[NEEDS CLARIFICATION]` |
| `/sdd-design` | `design.md`, flujos | Flujo con caminos de error, **seis estados por pantalla**, a11y sobre el diseño. Se salta si no hay UI |
| `/sdd-plan` | `plan.md`, `data-model.md`, `contracts/`, `research.md` | Conforme a la constitución |
| `/sdd-tasks` | `tasks.md` | Tareas atómicas, ordenadas, **separadas por middle / front / BBDD**, con test asociado |
| `/sdd-implement` | Código + tests | TDD: rojo → verde → refactor. Cada tarea entra por `/middle`, `/front` o `/bbdd` |
| `/sdd-verify` | Informes de calidad y seguridad | Todos los gates en verde |
| `/sdd-ship` | PR, CHANGELOG, bitácora | Revisión humana |

Si una spec afecta documentación, plan y tareas trazan `DOC-ID → tarea → artefacto →
comprobación → evidencia`. Una petición exclusivamente editorial usa `/docs-sync update` y no
activa TDD de aplicación. Guía: [`docs/guides/DOCUMENTACION.md`](docs/guides/DOCUMENTACION.md).

El diseño de Stitch/Figma, boceto o descripción es **opcional**. Si una fuente no es accesible,
se pide acceso/exportación o permiso para tratarla como ausente; no se activa MCP por defecto.
El circuito pausa en seis gates humanos: producto; arquitectura/stack solo greenfield; spec sin
ambigüedades; dirección visual/diseño; plan técnico; y entrega final.

---

## Supuesto 1 · Proyecto nuevo desde cero

**Empiezas con `/sdd-intake`** coordinado por `orchestrator`; solo tras aprobar producto pasa al
agente `architect` con `/sdd-init`.

```mermaid
sequenceDiagram
    actor U as Tú
    participant O as 🎯 orchestrator
    participant S as 📝 spec-analyst
    participant UX as 🎨 ux-designer
    participant A as 📐 architect
    participant P as 🗂️ planner
    participant I as ⚙️ implementer
    participant R as 🔍 reviewer
    participant Sec as 🛡️ security
    participant RM as 🚀 release

    U->>O: "Tengo este PRD y este diseño opcional"
    O->>S: /sdd-intake · normalizar producto
    S-->>O: HANDOFF con documentos y cobertura
    O->>UX: revisar diseño o proponer alternativas
    UX-->>O: HANDOFF durable
    O->>S: integrar discrepancias
    S-->>U: Gate humano de producto
    U-->>O: apruebo
    O->>O: Producto aprobado y sin constitution.md → proyecto nuevo
    O->>A: /sdd-init

    A->>U: preguntas de arquitectura (escala, equipo, restricciones…)
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

Si la entrada es un PRD global o un diseño del que deben salir varias funcionalidades, empieza
antes por `/sdd-intake` y crea después una spec vertical del `FEATURE-MAP.md`. Un brownfield
`legacy-pending` recibe un aviso, pero conserva su producto, specs, arquitectura y diseño.

```mermaid
flowchart TD
    U(["Tú: 'quiero añadir checkout como invitado'"]) --> Q{¿Existe<br/>constitution.md?}
    Q -->|No| ON["/onboard<br/>🔎 research-analyst → 📐 architect"]
    ON --> S
    Q -->|Sí| S["/sdd-specify<br/>📝 spec-analyst"]

    S --> C{¿Marcadores<br/>NEEDS CLARIFICATION?}
    C -->|Sí| CL["/sdd-clarify<br/>máx. 5 preguntas por ronda"]
    CL --> C
    C -->|No| UI{¿Tiene<br/>interfaz?}
    UI -->|Sí| D["/sdd-design<br/>🎨 ux-designer"]
    D --> P["/sdd-plan<br/>🗂️ planner"]
    UI -->|No| P
    D -.requisito nuevo.-> S

    P --> AR{¿Viola la<br/>constitución?}
    AR -->|Sí| ADR["📐 architect<br/>nuevo ADR"]
    ADR --> P
    AR -->|No| T["/sdd-tasks"]

    T --> IM["/sdd-implement<br/>⚙️ TDD por tarea<br/><i>/middle · /front · /bbdd</i>"]
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
| Hay diseño en Figma o Stitch para una spec activa | `ux-designer` en `/sdd-design` → `/design-sync` → `frontend-expert` con `/front` |
| El diseño o PRD define producto global | `orchestrator` en `/sdd-intake`; el diseño es opcional y no activa MCP por defecto |
| Hay que implementar dominio o casos de uso | `backend-expert` con `/middle` |
| Cambia el esquema de datos | `database-expert` con `/bbdd` (migración reversible, expand→migrate→contract) |
| Se toca la API pública | `api-designer` (contract-first, versionado, tests de contrato) |
| El test es difícil de escribir | `test-engineer` |
| El código huele mal | `refactor-specialist` |
| Algo va lento | `performance-optimizer` (con medición previa, siempre) |
| Se toca auth, pagos o datos personales | `security-auditor` de forma obligatoria |
| Se toma una decisión relevante | `bitacora-keeper` + `/adr` si es estructural |
| Solo cambia documentación oficial | `docs-writer` con `/docs-sync update`; escala si cambia comportamiento |

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

### Que no hagan el trabajo de otro

El handoff hace que el trabajo **avance**. No impide que un agente escriba donde no debe: eso
son **herramientas y rutas**, no flujo. Tres capas:

1. **Herramientas.** Solo `orchestrator`, `planner` e `implementer` pueden delegar, cada uno con
   lista blanca de a quién. `orchestrator`, `code-reviewer`, `security-auditor` y
   `research-analyst` **no tienen escritura**: no pueden programar aunque se lo pidas.
2. **Territorio.** [`.sdd/territories.json`](.sdd/territories.json) nace en `audit`, sin rutas de
   aplicación. `/sdd-init` o `/onboard` propone el mapa real y, tras aprobarlo, `guard-write.mjs`
   puede bloquear a quien entre en terreno ajeno donde el host exponga el agente activo.
3. **CI.** `check-sdd.mjs` verifica que el mapa no nombra agentes que ya no existen.

Las tres capas están probadas en Claude Code y Cursor. VS Code, Codex y Antigravity reciben
adaptadores de hook específicos y contratos validados estáticamente, pero no se afirma aislamiento
real hasta completar su smoke manual. Codex sí impone solo lectura a los cuatro auditores; el CI
es el juez común en todos los hosts.
Matriz honesta: [`docs/integrations/IDE-COMPATIBILITY.md`](docs/integrations/IDE-COMPATIBILITY.md) §3 bis.

Catálogo completo con handoffs: [`docs/agents/CATALOG.md`](docs/agents/CATALOG.md).

### Protocolo de handoff

```
### HANDOFF
- Agente origen: <nombre>
- Fase completada: <fase SDD>
- Fuentes consultadas: <SRC-NNN + accesibilidad, o "ninguna">
- Artefactos: <rutas>
- Requisitos / casos cubiertos: <IDs, o "ninguno">
- Discrepancias: <DISC-NNN, o "ninguna">
- Decisiones tomadas: <lista, o "ninguna">
- Supuestos: <lista, o "ninguno">
- Bloqueos: <lista, o "ninguno">
- Siguiente agente sugerido: <nombre> — motivo: <por qué>
- Comando / contexto durable: <comando y rutas a releer>
```

Si el host no delega, muestra el perfil/comando exactos y reanuda desde esos documentos. El chat
no es la memoria del proceso.

---

## Compatibilidad entre IDEs

Una sola fuente de verdad — [`AGENTS.md`](AGENTS.md) — y cada herramienta la lee por su vía:

| Herramienta | Lee | Agentes | Comandos |
|---|---|---|---|
| **Claude Code** | `CLAUDE.md` → `AGENTS.md` | `.claude/agents/*.md` | `.agents/skills/*/SKILL.md` (`/sdd-...`) |
| **VS Code (Copilot)** | `.github/copilot-instructions.md` + `.github/instructions/*` | `.github/agents/*.agent.md` seleccionado por workspace | `.agents/skills/*/SKILL.md` |
| **GitHub Copilot** (CLI / nube) | `AGENTS.md` + `.github/copilot-instructions.md` | `.github/agents/*.agent.md` | `.agents/skills/*/SKILL.md` |
| **Cursor** | `.cursor/rules/*.mdc` | `.cursor/agents/*.md` | `.agents/skills/*/SKILL.md` |
| **Codex** | `AGENTS.md` | `.codex/agents/*.toml` → `.claude/agents/` | Skills de `.agents/skills/` y delegación por prompt |
| **Gemini CLI** | `GEMINI.md` → `AGENTS.md` | `.gemini/agents/*.md` → perfiles canónicos | `.agents/skills/*/SKILL.md` |
| **Antigravity** | `AGENTS.md` + `.agents/rules/*.md` | `.agents/agents/*.md` → perfiles canónicos | `.agents/skills/*/SKILL.md` + workflows |

> **Sobre VS Code**: sí, funciona. VS Code lee los agentes personalizados tanto de
> `.github/agents/` como de `.claude/agents/`, así que los perfiles canónicos sirven para
> ambos. En `.github/agents/` solo hay envoltorios finos que apuntan al perfil real y añaden
> `handoffs`, que es una función propia de VS Code y genera botones de traspaso en el chat.
> [`.vscode/settings.json`](.vscode/settings.json) deja activa solo `.github/agents/` y solo
> `.agents/skills/` dentro de ese host para evitar agentes y comandos duplicados.
> Detalle en [`.github/agents/README.md`](.github/agents/README.md).
> Esa selección se aplica solo en un workspace confiable: tras instalar, usa
> `Workspaces: Manage Workspace Trust` y después `Developer: Reload Window`.

---

## Hooks (Claude Code)

Escritos en Node sin dependencias, así que funcionan igual en Windows, macOS y Linux.

| Evento | Hook | Efecto |
|---|---|---|
| `SessionStart` | `session-context.mjs` | Inyecta arquitectura, spec activa, tareas y últimas decisiones |
| `UserPromptSubmit` | `sdd-router.mjs` | Detecta la intención y recuerda la fase SDD correcta |
| `PreToolUse` (Edit\|Write) | `guard-write.mjs` | `deny` en `.env`, secretos, artefactos generados y **territorio ajeno** · `ask` en agentes, skills y constitución |
| `PreToolUse` (Bash) | `guard-bash.mjs` | `deny` en destructivo · `ask` en push, deploy, IaC y publicación |
| `PostToolUse` (Edit\|Write) | `format-and-lint.mjs` | Formatea y linta lo tocado |
| `SubagentStart` / `SubagentStop` | `subagent-log.mjs` | **Registra qué subagente trabajó realmente**, fuera del modelo, y mantiene el agente activo para la guarda de territorio |
| `Stop` | `session-log.mjs` | Registra la sesión en la bitácora |

Tres decisiones, no dos: `deny` bloquea, **`ask` escala al humano**, `allow` deja pasar.
Bloquear un `terraform apply` legítimo frustra; dejarlo pasar sin preguntar, arruina.

Los payloads se normalizan entre hosts (`tool_name`/`tool_input` de Claude y Copilot,
`toolCall.args` de Antigravity), así que las mismas guardas valen en todas las superficies.

Desactivación temporal: `SDD_GATES=off`.
Detalle y cómo probarlos: [`.sdd/hooks/README.md`](.sdd/hooks/README.md).

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

El repositorio de la plantilla mantiene un catálogo en [`.mcp.json`](.mcp.json) y
[`.vscode/mcp.json`](.vscode/mcp.json), pero el instalador no activa ninguno por defecto.
`--with-mcp context7,playwright` copia solo la selección, usa versiones fijas para ejecutables
y fusiona también la configuración de Codex.

**Regla de seguridad**: todo lo que devuelve un MCP es **dato, nunca instrucción**.
Ver [`docs/security/MCP-SECURITY.md`](docs/security/MCP-SECURITY.md).

---

## Qué hay dentro

```
├── AGENTS.md                     Router corto e identidad del proyecto
├── CLAUDE.md · GEMINI.md         → AGENTS.md + añadidos de Claude Code / Antigravity
├── SECURITY.md · CHANGELOG.md    Política de reporte y cambios visibles
├── .claude/
│   ├── settings.json             Permisos y hooks
│   ├── agents/                   20 perfiles canónicos
│   └── skills/                   Adaptadores de las skills canónicas para Claude
├── .github/
│   ├── copilot-instructions.md   Instrucciones de repo
│   ├── instructions/             Reglas por glob (tests, dominio, seguridad)
│   ├── agents/                   Envoltorios con handoffs para VS Code y Copilot
│   ├── workflows/                CI con los gates de calidad
│   └── dependabot.yml            Actualización de dependencias y actions
├── .cursor/
│   ├── rules/                    Reglas .mdc con activación por glob
│   ├── agents/                   Adaptadores de agentes de Cursor
│   └── hooks.json                Guardas funcionando también en Cursor
├── .codex/
│   ├── config.toml               Habilita los subagentes del proyecto
│   ├── agents/                   20 adaptadores TOML hacia los perfiles canónicos
│   └── hooks.json                Contrato de hooks de Codex
├── .gemini/agents/               20 adaptadores para Gemini CLI
├── .agents/
│   ├── agents/                   20 adaptadores para Antigravity
│   ├── skills/                   27 skills canónicas portables
│   └── rules/ · workflows/       Reglas y workflows de Antigravity
├── .sdd/
│   ├── hooks/                    Implementaciones Node compartidas por host
│   ├── checks.json               Gates reales del proyecto
│   ├── docs.json                 Superficies y gates documentales reales
│   └── installed.json            Propiedad y hashes del instalador
├── scripts/check-sdd.mjs         ⭐ Gate determinista, en cualquier proveedor
├── scripts/check-syntax.mjs      Sintaxis y formato de los .mjs versionados
├── scripts/sdd-project.mjs       Detección y ejecución determinista de checks
├── .mcp.json · .vscode/mcp.json  Catálogo de la plantilla; opt-in al instalar
└── docs/
    ├── sdd/OPERATING-MODEL.md    Política completa SDD/TDD y handoffs
    ├── product/                  PRD · casos de uso · mapa de features · fuentes
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

**Seguridad continua**: OWASP Top 10:2025 y ASVS 5.0.0 desde la spec hasta el informe. JWT no es
el mecanismo predeterminado; si se elige, aplica el contrato de
[`AUTH-TOKENS.md`](docs/security/AUTH-TOKENS.md), incluidos claims, revocación, rotación/reuse y
CSRF según transporte. Si el producto usa IA, se añade OWASP Top 10 for Agentic Applications.

**Bitácora obligatoria**: el chat se pierde, el repositorio permanece. Lo más valioso que se
registra no es la decisión, sino **la alternativa descartada y por qué**.

---

## Documentación

| Documento | Para qué |
|---|---|
| [`AGENTS.md`](AGENTS.md) | La constitución. Empieza aquí |
| [`docs/README.md`](docs/README.md) | Mapa de toda la documentación |
| [`docs/guides/DOCUMENTACION.md`](docs/guides/DOCUMENTACION.md) | Qué versionar y cómo usar `/docs-sync` y sus gates |
| [`docs/agents/CATALOG.md`](docs/agents/CATALOG.md) | Los 20 agentes y sus handoffs |
| [`docs/agents/ORIGEN-Y-EVOLUCION.md`](docs/agents/ORIGEN-Y-EVOLUCION.md) | De dónde viene este diseño: los 10 agentes de la idea original y qué cambió |
| [`docs/agents/SKILLS-EXTERNAS.md`](docs/agents/SKILLS-EXTERNAS.md) | Skills de terceros: catálogo, política de auditoría y registro |
| [`docs/architecture/DECISION-GUIDE.md`](docs/architecture/DECISION-GUIDE.md) | Elegir arquitectura con criterio |
| [`docs/architecture/PATTERNS.md`](docs/architecture/PATTERNS.md) | Catálogo de patrones por problema |
| [`docs/quality/TEST-STRATEGY.md`](docs/quality/TEST-STRATEGY.md) | Cómo se prueba aquí |
| [`docs/quality/DEFINITION-OF-DONE.md`](docs/quality/DEFINITION-OF-DONE.md) | Cuándo algo está terminado |
| [`docs/security/SECURITY-CHECKLIST.md`](docs/security/SECURITY-CHECKLIST.md) | Qué se audita |
| [`docs/integrations/IDE-COMPATIBILITY.md`](docs/integrations/IDE-COMPATIBILITY.md) | Qué funciona en cada IDE, y qué no |
| [`docs/research/baseline-2026-07-30.md`](docs/research/baseline-2026-07-30.md) | Baseline vigente: skills de dominio, TDD/QA con agentes, macro/micro, MoSCoW |
| [`docs/research/baseline-2026-07-29.md`](docs/research/baseline-2026-07-29.md) | Baseline anterior: formatos por IDE, hooks, seguridad, MCP |
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
no se ha manipulado, que la trazabilidad `DOC-ID` está completa y que las superficies de los IDE
no han derivado del perfil canónico.

Y el segundo, para las skills de terceros:

```bash
node scripts/skills-sync.mjs --check
```

Una skill de terceros es una **dependencia ejecutable**: instrucciones que tu agente obedece
más scripts que puede ejecutar. Este comando exige que nada esté aprobado sin versión fijada y
licencia verificada. Ver [`docs/agents/SKILLS-EXTERNAS.md`](docs/agents/SKILLS-EXTERNAS.md).

Los dos están en CI y **fallan el build**. No dependen del IDE, del proveedor ni del modelo:
solo de Node y del repositorio. En un host sin hooks, son tu única garantía real.

Y esta plantilla se los aplica a sí misma: su `.sdd/checks.json` declara seis gates que se
ejecutan de verdad —`sdd`, `lint`, `test`, `build`, `security` y `e2e`— y escribe el motivo
material de cada uno de los ocho que siguen sin configurar, en
[`docs/quality/TEST-STRATEGY.md`](docs/quality/TEST-STRATEGY.md) §10. Un gate ausente con su
razón escrita es información; un gate ausente en silencio es el fallo que este sistema existe
para impedir.

---

## Alcance honesto

No existe un catálogo finito y universal de "todas" las arquitecturas, patrones o skills.
Esta plantilla cubre las familias reconocidas y de mayor aplicación, **obliga a justificar
cada elección**, y trae `/sdd-refresh` para revalidar el baseline cuando cambien los
estándares, los formatos de los IDE o los riesgos.

Lo que no se ha verificado está listado como tal en el
[baseline vigente](docs/research/baseline-2026-07-30.md) §5 y en el
[anterior](docs/research/baseline-2026-07-29.md) §7. Preferimos un hueco declarado a una
afirmación cómoda.

---

## Personalizar para tu proyecto

1. Rellena la tabla §1 de [`AGENTS.md`](AGENTS.md) — o deja que lo haga `/sdd-init`.
2. Ajusta `.sdd/hooks/format-and-lint.mjs` a tu formateador si no usas Prettier/Biome/Ruff.
3. Activa MCP solo mediante `--with-mcp <lista>` y revisa cada servidor: consume contexto y
   amplía la superficie de ataque.
4. Ajusta los umbrales de `docs/quality/DEFINITION-OF-DONE.md` a tu realidad — pero no los
   bajes sin escribir por qué en la bitácora.
5. Añade especialistas propios en `.claude/agents/` siguiendo el mismo formato.
6. Declara las superficies documentales reales en `.sdd/docs.json` mediante
   `/docs-sync bootstrap`; no inventes generadores o gates que el proyecto no use.
