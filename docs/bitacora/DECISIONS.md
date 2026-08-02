# Bitácora de decisiones

> El chat se pierde; el repositorio permanece.
> Entradas **nuevas arriba**. Nunca se reescribe ni se borra una entrada: si algo cambió,
> se añade una nueva que la reemplaza y enlaza a la anterior.
>
> Formato: [`TEMPLATE.md`](./TEMPLATE.md) · Decisiones estructurales:
> [`../architecture/adr/`](../architecture/adr/) · Sesiones: [`sessions/`](./sessions/)

---

## 2026-08-02 · Skills canónicas portables y `skill-creator` vendorizada

- **Tipo**: decisión de compatibilidad y cadena de suministro
- **Contexto**: trece skills canónicas usaban `disable-model-invocation`, una extensión de Claude
  que no pertenece al estándar Agent Skills. Además, la plantilla no incluía una herramienta
  común para crear, validar y evaluar skills nuevas desde los hosts soportados.
- **Decisión / hecho**: limitar el frontmatter canónico a los campos de Agent Skills y mantener
  cualquier extensión de host en su adaptador. Se añade la `skill-creator` oficial de Anthropic
  en `.agents/skills/`, completa, con licencia Apache-2.0 y commit
  `b29e7cf65e5cb78a5ac33d582270551bc74a14eb`; Claude recibe un adaptador fino. Es la única skill
  externa que nace instalada: forma parte del método base, no del stack de aplicación.
- **Alternativas descartadas**:
  - *Instalar solo en `.claude/skills/`*: rompería el objetivo multihost y duplicaría la fuente.
  - *Seguir `main` de Anthropic*: haría mutable la cadena de suministro.
  - *Depender de `npx skills` en runtime*: su versión 1.5.21 requiere Node 22.20, mientras el
    instalador mantiene compatibilidad con Node 18.
- **Impacto**: 23 skills canónicas y 23 adaptadores Claude; el gate rechaza claves no portables y
  la instalación virgen conserva la skill base auditada sin heredar candidatas ni historial.
  La suite del instalador cubre 89 comprobaciones.
- **Limitación aceptada**: el comando `npx skills` no terminó de resolver en esta máquina; la
  copia se obtuvo por Git desde el commit exacto y se validó con el script oficial. Los smokes
  interactivos en los cinco hosts y la matriz completa de sistemas/Node siguen sin ejecutarse.
- **Referencias**: spec `003-skills-portables-estandar` · tareas `T-003-01` a `T-003-03` ·
  `docs/research/baseline-2026-08-02.md`
- **Quién**: Codex `declared-direct`, entrega y tag solicitados por el usuario

---

## 2026-08-02 · Distribución portable con semillas vírgenes y estado propiedad del proyecto

- **Tipo**: decisión y cambio
- **Contexto**: el repositorio de la plantilla contenía su propia historia —specs, ADR, bitácora,
  informes, sesiones, auditoría y changelog— y el instalador podía trasladar parte de ese contexto
  a un proyecto nuevo. También coexistían skills y hooks duplicados por host, y la instalación
  presuponía Node, npm y MCP concretos.
- **Decisión / hecho**: separar distribución, referencias y estado. Las 22 skills canónicas viven
  en `.agents/skills/`, los hooks compartidos en `.sdd/hooks/` y cada IDE conserva un adaptador en
  su formato. `init` crea semillas vírgenes solo cuando faltan; `update` nunca las reinicia. Las
  modificaciones gestionadas se conservan y la propuesta nueva va a `.sdd/conflicts/<version>/`.
  MCP es opt-in y selectivo; `.sdd/checks.json` nace sin asumir el stack. El CI universal ejecuta
  únicamente scripts distribuidos.
- **Alternativas descartadas**:
  - *Copiar el repositorio y borrar después*: el borrado por nombres concretos es frágil y puede
    eliminar contexto legítimo de un brownfield.
  - *Symlinks entre superficies*: crean fricción en Windows y en clones sin permisos adecuados.
  - *Una copia completa de cada skill por IDE*: multiplica la deriva y el coste de actualización.
  - *Activar MCP y comandos de aplicación por detección*: detectar no equivale a una decisión
    aprobada del proyecto.
- **Impacto**: instalación greenfield y brownfield conservadora, estado virgen comprobable,
  paridad de 20 agentes y 22 skills, handoff/delegación documentados y contratos de hooks para
  Claude, Cursor, Copilot/VS Code, Codex y Antigravity. La suite del instalador cubre 87 escenarios
  y las guardas 40.
- **Deuda aceptada**: falta el smoke manual en los cinco hosts y la confirmación remota de la
  matriz Windows/Linux con Node 18/20/22; se exige antes de publicar un tag estable.
- **Referencias**: spec `002-portabilidad-instalador-universal` · tareas `T-002-01` a `T-002-07`
- **Quién**: Codex `declared-direct`, alcance aprobado por el usuario

---

## 2026-08-02 · Agentes Codex versionados por proyecto mediante adaptadores TOML

- **Tipo**: decisión de compatibilidad
- **Contexto**: la plantilla ya ofrecía los veinte agentes en Claude Code, VS Code/Copilot y
  Cursor, pero Codex solo recibía `AGENTS.md`. La documentación oficial actual permite agentes
  personales en `~/.codex/agents/` y agentes versionados por proyecto en `.codex/agents/`.
- **Decisión**: añadir veinte TOML de proyecto y `.codex/config.toml`. Cada TOML conserva el mismo
  nombre y criterio de uso y ordena leer `.claude/agents/<rol>.md`; esa carpeta sigue siendo la
  única definición canónica. No se toca ningún adaptador de otro IDE. Los cuatro roles auditores
  declaran `sandbox_mode = "read-only"`.
- **Alternativas descartadas**:
  - *Copiar el perfil completo al TOML*: duplicaría instrucciones y crearía deriva.
  - *Instalar solo en `~/.codex/agents/`*: modificaría configuración personal y no viajaría al clonar.
  - *Fijar modelo y concurrencia por agente*: no es requisito; se heredan de la sesión.
- **Impacto**: `sdd init` distribuye la nueva superficie. `check-sdd` valida los tres campos
  obligatorios, la referencia canónica, los auditores de solo lectura y la paridad 20/20.
- **Limitación**: Codex no documenta lista blanca de delegación ni territorios por agente; esas
  reglas siguen en `AGENTS.md` y el CI. Tampoco hay trazabilidad `observed` mediante hooks.
- **Fuente**: [Subagents — documentación oficial de Codex](https://developers.openai.com/codex/multi-agent/),
  consultada el 2026-08-02.
- **Quién**: Codex `declared-direct`, alcance aprobado por el usuario

---

## 2026-07-31 · Instalador en dos capas: global para lo inerte, proyecto para lo que obliga

- **Tipo**: decisión
- **Contexto**: la plantilla solo se podía adoptar clonando el repositorio entero, lo que sirve
  para empezar de cero pero no para incorporarla a proyectos que ya existen —unos en Cursor, otros
  en VS Code— sin pisar lo que ya tienen. Y hacía falta poder **actualizar** N repositorios sin
  copiar ficheros a mano.
- **Decisión**: instalador `npx` con **dos capas**.
  - **Global** (`~/.claude/`, `~/.cursor/`, `~/.github/`): solo **agentes y skills**. Nativo en
    Claude Code y Cursor; en VS Code hay que añadir una clave al `settings.json` de usuario.
  - **Por proyecto**: todo lo que describe *ese* proyecto y debe viajar con el código.
  - Política de colisión: **nunca sobrescribir**. Fichero distinto → se deja `.sdd-nuevo` y se
    informa. JSON conocidos → fusión donde las claves del usuario ganan siempre.
  - `update` se apoya en `.sdd/installed.json` con el hash de cada fichero instalado: distingue
    "no lo ha tocado nadie" de "lo ha modificado el usuario", que es la única forma de actualizar
    sin miedo.
- **Alternativas descartadas**:
  - *Instalar también los hooks en global*: una guarda de territorio o un formateador activos en
    todos los repositorios, incluidos los que no usan SDD, es intrusivo. Lo intrusivo se
    desactiva, y entonces se pierde todo, no solo lo molesto.
  - *Plugin de Claude Code* (`/plugin marketplace add`): es el mecanismo nativo y el más limpio,
    pero **solo cubre Claude Code**. No resuelve Cursor ni Copilot, que era el problema.
  - *Repositorio plantilla de GitHub*: solo sirve para repos nuevos.
  - *Sobrescribir y que el usuario mire el diff en git*: asume árbol limpio y confianza previa.
    Un instalador que pisa se usa una vez.
- **Impacto**: `scripts/test-install.mjs` verifica sobre directorios reales que un `AGENTS.md`
  ajeno queda intacto, que las claves propias de `settings.json` sobreviven, que dos ejecuciones
  seguidas no generan conflictos y que **`check-sdd` y las guardas pasan dentro del destino recién
  instalado**. En CI.
- **Deuda aceptada**: Codex (TOML en `~/.codex/agents/`) y Antigravity quedan fuera de la capa
  global; mantener un traductor de 20 perfiles a otro formato no se justifica hoy. `npx github:`
  clona el repositorio entero en cada ejecución. Y la capa global hace que los 20 agentes aparezcan
  en el selector de proyectos donde no se quiere SDD: son inertes, pero ensucian.
- **Referencias**: [`docs/guides/INSTALACION.md`](../guides/INSTALACION.md),
  [`scripts/install.mjs`](../../scripts/install.mjs),
  [`scripts/lib/manifiesto.mjs`](../../scripts/lib/manifiesto.mjs)
- **Quién**: agente `devops-expert` + revisión humana pendiente

---

## 2026-07-31 · Una sola ubicación por elemento: duplicar tiene coste real

- **Tipo**: decisión + corrección
- **Contexto**: el usuario vio **agentes repetidos** en el selector de VS Code y preguntó por qué
  no había carpetas `skills/` y `hooks/` bajo `.github/` y `.cursor/`. Al investigarlo salieron
  tres cosas:
  1. VS Code lee `.github/agents/` **y** `.claude/agents/` y **no deduplica por nombre**
     ([microsoft/vscode#312256](https://github.com/microsoft/vscode/issues/312256)). Los 8 agentes
     con envoltorio aparecían dos veces.
  2. **VS Code sí tiene hooks**, con los mismos 8 eventos, el mismo payload y la misma decisión
     por stdout que Claude Code — y **lee `.claude/settings.json`**. El baseline los daba por no
     verificados.
  3. Las skills **no necesitan duplicarse**: VS Code y Cursor leen `.claude/skills/` de forma
     nativa.
- **Decisión**: **una sola ubicación por elemento, y se duplica solo donde el formato del host lo
  exige.**
  - Agentes: se desactiva `.claude/agents` en `.vscode/settings.json` y se completan los 20
    envoltorios. Se conserva `.github/agents` —y no al revés— porque lleva `handoffs:` y
    **`agents:`**, la lista blanca de delegación, que es el aislamiento en VS Code.
  - Hooks: **no se crea `.github/hooks/`**. VS Code ya lee `.claude/settings.json`; crear la otra
    ubicación haría que cada guarda se ejecutara **dos veces por llamada**.
  - Skills: no se crea nada. Una carpeta sirve a las cuatro superficies.
- **Alternativas descartadas**:
  - *Desactivar `.github/agents` en vez de `.claude/agents`*: más simple, pero perdía `handoffs:`
    y la lista blanca de delegación. Habría cambiado un problema cosmético por uno de seguridad.
  - *Crear `.github/hooks/` "por completitud"*: habría duplicado la ejecución de todas las guardas.
- **Impacto**: `check-sdd` falla si una superficie en uso tiene agentes sin envoltorio —a partir
  del ajuste, un agente sin envoltorio **no existe** en VS Code—. Verificado retirando
  `docs-writer`. Y los `matcher` de `.claude/settings.json` se amplían para cubrir los nombres de
  herramienta de los dos hosts: un matcher que no coincide no dispara el hook, y **una guarda que
  no se ejecuta falla en abierto**.
- **Deuda aceptada**: los hooks de VS Code están **verificados contra la documentación, no
  ejecutados en vivo**, y están en *preview*. Que los matchers ampliados cubran los nombres reales
  de VS Code es **inferencia**. Si al probarlo falla, se anota aquí y en el baseline.
- **Referencias**: [`.vscode/settings.json`](../../.vscode/settings.json),
  [`.github/agents/README.md`](../../.github/agents/README.md),
  [`baseline-2026-07-30.md`](../research/baseline-2026-07-30.md) §5.1 bis y §5.1 ter,
  [`IDE-COMPATIBILITY.md`](../integrations/IDE-COMPATIBILITY.md) §3 ter
- **Quién**: agente `research-analyst` + revisión humana pendiente

---

## 2026-07-30 · La accesibilidad es el suelo: hace falta una dirección visual vinculante

- **Tipo**: decisión
- **Contexto**: requisito explícito del usuario —*que lo que salga de aquí no sea el típico MVP
  soso de cuatro cajas*—. Al revisarlo, la plantilla no lo cubría: los gates de `/sdd-design`
  (seis estados, WCAG 2.2 AA, tokens, flujo con errores) garantizan que la interfaz **funcione**,
  no que tenga carácter. Peor: cuando el criterio dominante es "contraste ≥ 4.5:1 y foco visible",
  el camino de menor resistencia es una interfaz correcta y anodina. Y hay un sesgo documentado —
  la UI generada por un modelo converge en una estética genérica reconocible—, hasta el punto de
  que las skills de diseño de 2026 lo tratan como su problema central.
- **Decisión**: `docs/design/DIRECCION-VISUAL.md` como artefacto **vinculante que se decide una
  vez**, igual que la constitución de arquitectura, y **puerta dura** en `/sdd-design`: sin
  dirección aprobada por el usuario, no se dibuja. Obligatorio además un **elemento con carácter
  por pantalla**. `/front` verifica el código contra la dirección y `check-sdd --strict` falla si
  hay `design.md` con la dirección sin aprobar.
- **Alternativas descartadas**:
  - *Confiar en las skills externas de diseño* (`frontend-design`, `shadcn`, `web-design-guidelines`):
    son buenas y están catalogadas, pero dependen del stack y de que alguien las apruebe. La
    decisión de qué aspecto tiene **este** producto no la puede tomar una skill genérica.
  - *Dejarlo al criterio del `ux-designer` en cada spec*: produce deriva. Cinco pantallas
    diseñadas en cinco momentos distintos sin dirección común no forman un producto.
  - *Una guía de estilo descriptiva sin puerta*: se lee una vez y se ignora. Sin gate no obliga.
- **Impacto**: `/sdd-design` gana un paso previo que exige conversación con el usuario. Es
  fricción deliberada: es más barato discutir la dirección ahora que cuando haya diez pantallas
  hechas con el criterio de "cumple contraste".
- **Deuda aceptada**: la verificación es **estructural, no estética**. `check-sdd` comprueba que
  la dirección esté aprobada y que se declare un elemento con carácter; no puede juzgar si el
  resultado es bueno. Eso sigue siendo criterio humano, y así debe ser.
- **Referencias**: [`docs/design/DIRECCION-VISUAL.md`](../design/DIRECCION-VISUAL.md),
  [`baseline-2026-07-30.md`](../research/baseline-2026-07-30.md) §5 bis,
  [`SKILLS-EXTERNAS.md`](../agents/SKILLS-EXTERNAS.md)
- **Quién**: agente `ux-designer` + revisión humana pendiente

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
