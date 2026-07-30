# Bitácora de decisiones

> El chat se pierde; el repositorio permanece.
> Entradas **nuevas arriba**. Nunca se reescribe ni se borra una entrada: si algo cambió,
> se añade una nueva que la reemplaza y enlaza a la anterior.
>
> Formato: [`TEMPLATE.md`](./TEMPLATE.md) · Decisiones estructurales:
> [`../architecture/adr/`](../architecture/adr/) · Sesiones: [`sessions/`](./sessions/)

---

## 2026-07-30 · El handoff no aísla: el aislamiento se impone con herramientas y territorios

- **Tipo**: decisión
- **Contexto**: el requisito era que los agentes se llamen unos a otros **y** que ninguno haga el
  trabajo de otro —que el orquestador no programe, que el de datos no toque el front—. Al
  revisarlo aparecieron dos cosas:
  1. Son **dos problemas distintos**. El handoff hace que el trabajo avance; no impide nada. Un
     handoff impecable deja igual de libre al agente que lo recibe para escribir donde no debe.
  2. La plantilla **documentaba** la delegación real en VS Code y Cursor pero **no la había
     cableado**: ningún envoltorio de `.github/agents/` declaraba la herramienta `agent`, y
     `.cursor/agents/` tenía 2 ficheros de 20. Y `guard-write.mjs` no consultaba qué agente
     estaba escribiendo, así que el reparto por capas era una norma en prosa.
- **Decisión**: aislamiento en tres capas, con la más fuerte primero.
  1. **Herramientas**: solo `orchestrator`, `planner` e `implementer` delegan, cada uno con lista
     blanca (`Agent(tipo)` en Claude Code y Cursor, `agents:` en VS Code). Los auditores no
     tienen escritura (`readonly: true` en Cursor).
  2. **Territorio**: `.sdd/territories.json` + `guard-write.mjs`, con el agente activo registrado
     por los hooks en `.sdd/state/`.
  3. **Verificación**: `check-sdd.mjs` valida el mapa; `test-hooks.mjs` prueba las guardas en CI.
- **Alternativas descartadas**:
  - *Confiar en el prompt y en el bloque `### HANDOFF`*: es texto. Un modelo puede emitirlo
    perfectamente sin haber delegado nada, y puede ignorar "no toques el front" cuando le viene
    de camino.
  - *Regla "cada agente solo escribe en su territorio"*: en un proyecto nuevo nadie sabe todavía
    dónde vive cada cosa. Bloquear lo desconocido hace que la guarda se desactive el primer día.
    Por eso la regla es **no entres en el territorio de otro**.
  - *Deducir el agente activo del payload de `PreToolUse`*: no lo trae. De ahí el estado en
    `.sdd/state/`, escrito por `SubagentStart`/`SubagentStop`.
- **Impacto**: en Claude Code y Cursor el aislamiento es real y verificado. En VS Code hay
  delegación y restricción por herramienta, pero sin hooks verificados no hay guarda de
  territorio. En Antigravity y Codex el reparto es convención y el CI es el único juez. Está en
  la matriz, no escondido.
- **Deuda aceptada**: los patrones de `territories.json` asumen una estructura de proyecto
  convencional; `/sdd-init` y `/onboard` deberían ajustarlos al fijar la arquitectura. `readonly`
  de Cursor y el nombre exacto de la herramienta de subagentes de VS Code (`agent` vs
  `runSubagent`) están documentados pero **no ejecutados** aquí.
- **Referencias**: [`AGENTS.md`](../../AGENTS.md) §10.2,
  [`.sdd/territories.json`](../../.sdd/territories.json),
  [`baseline-2026-07-30.md`](../research/baseline-2026-07-30.md) §5,
  [`IDE-COMPATIBILITY.md`](../integrations/IDE-COMPATIBILITY.md) §3 bis
- **Quién**: agente `architect` + revisión humana pendiente

---

## 2026-07-30 · Skills de dominio propias y skills de terceros declaradas, no copiadas

- **Tipo**: decisión
- **Contexto**: había que incorporar "las mejores skills de repositorios oficiales" para trabajo
  de middle, front y BBDD. La búsqueda del 30/07/2026 encontró dos hechos que cambian el enfoque:
  el directorio del ecosistema declara **107 318 skills descubribles** en 2350 repositorios, y de
  las **17 skills oficiales de Anthropic solo 3** tocan este terreno —`frontend-design`,
  `webapp-testing` y `skill-creator`—. **Anthropic no publica ninguna de backend ni de BBDD.**
  Quien las publica es el fabricante de cada plataforma, y siempre atada a su producto.
- **Decisión**: dos capas separadas.
  1. El **método** lo pone la plantilla, agnóstico de stack: `/middle`, `/front` y `/bbdd`, con
     puerta de entrada, ciclo TDD, patrones y lista de comprobación. Nadie va a publicar una skill
     oficial de "cómo aplicar SOLID en tu capa de aplicación" porque no vende plataforma.
  2. Lo **específico del stack** se declara en `.sdd/external-skills.json` y se instala con
     `npx skills add`. No se copia el `SKILL.md` de nadie al repositorio.
- **Alternativas descartadas**:
  - *Vendorizar los `SKILL.md` de Vercel, Supabase y compañía*: crea copias que envejecen en
    silencio, arrastra su licencia y hace que la próxima mejora del fabricante no llegue nunca.
  - *Instalar colecciones curadas completas*: colisión de triggers, consumo de contexto, superficie
    de ejecución y deuda de actualización. Las listas curadas sirven para **descubrir**.
  - *Que `skills-sync.mjs` instale automáticamente*: un script que descarga y activa instrucciones
    de terceros sin intervención humana es OWASP Agentic **ASI04** con otro nombre. Imprime el
    comando; lo ejecuta una persona.
- **Impacto**: nada se aprueba sin versión fijada y licencia verificada — lo exige
  `skills-sync.mjs --check` en CI. `guard-bash` pregunta antes de `skills add`. La auditoría se
  hace cuando el proyecto adopta el stack, no antes: auditar lo que no se usa es teatro.
- **Deuda aceptada**: las 13 skills catalogadas están en estado `candidata`, **no auditadas**. Es
  el estado correcto para una plantilla sin stack, no un pendiente. Tampoco se ha comparado la
  salida real de una misma skill entre Claude Code, Codex y Copilot: el formato es portable por
  estándar, la equivalencia de resultado no está verificada.
- **Referencias**: [`docs/agents/SKILLS-EXTERNAS.md`](../agents/SKILLS-EXTERNAS.md),
  [`docs/research/baseline-2026-07-30.md`](../research/baseline-2026-07-30.md) §1
- **Quién**: agente `research-analyst` + revisión humana pendiente

---

## 2026-07-30 · El diseño pasa a ser fase con puerta, y la priorización se hace sobre esfuerzo

- **Tipo**: decisión
- **Contexto**: el diseño existía como especialista consultable (`ux-designer`), no como fase con
  artefacto ni gate. Y las specs se priorizaban de forma implícita, lo que en la práctica significa
  que todo es obligatorio.
- **Decisión**:
  1. `/sdd-design` entre `/sdd-clarify` y `/sdd-plan`, con `design.md` y dos gates duros: los seis
     estados por pantalla y accesibilidad verificada sobre el diseño. Se salta si no hay interfaz.
  2. MoSCoW con las reglas reales del **DSDM**: reparto **sobre esfuerzo estimado, no sobre número
     de requisitos**, must ≤ 60 %, could como contingencia deliberada, y *won't* escritos.
- **Alternativas descartadas**:
  - *Dejar el diseño dentro de `/sdd-plan`*: el diseño descubre requisitos que la spec no vio —una
    pantalla intermedia, una confirmación, un estado de error—. Descubrirlos después de decidir la
    arquitectura obliga a replanificar.
  - *MoSCoW por número de requisitos*: diez must pequeños y dos enormes no son el 83 % de must. Sin
    estimar, la etiqueta no informa de nada.
- **Impacto**: `/sdd-plan` no arranca con marcadores abiertos en `design.md`; el orden de
  implementación respeta las prioridades; `check-sdd` avisa si una spec no tiene ninguna.
- **Deuda aceptada**: la comprobación de los seis estados es un **aviso por palabras clave**, no
  una verificación semántica. Detecta el olvido completo, no un estado mal diseñado.
- **Referencias**: [`.claude/skills/sdd-design/SKILL.md`](../../.claude/skills/sdd-design/SKILL.md),
  `docs/specs/_TEMPLATE/design.md`, [`baseline-2026-07-30.md`](../research/baseline-2026-07-30.md) §4
- **Quién**: agente `spec-analyst` + `ux-designer` · revisión humana pendiente

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
