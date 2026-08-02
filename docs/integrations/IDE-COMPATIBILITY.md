# Compatibilidad entre IDEs y proveedores

**Fecha de verificación: 2026-08-02.** Revalidar con `/sdd-refresh`.

> **Respuesta corta a "¿funciona todo en todas partes?": no, y ninguna plantilla puede
> conseguirlo.** Las reglas y el protocolo de handoff funcionan en todos; la ejecución
> real de subagentes y los hooks dependen de lo que cada host expone. Este documento
> dice exactamente qué está verificado, qué está inferido y qué no funciona.
>
> Preferimos un hueco declarado a una afirmación cómoda.

---

## 1. Las cuatro capas, y por qué se degradan distinto

El ecosistema tiene cuatro capas con **portabilidad muy distinta**:

| Capa | Qué es | Portabilidad |
|---|---|---|
| **Reglas** | `AGENTS.md` y sus adaptadores | ✅ **Universal.** Es texto que el modelo lee |
| **Skills** | Los 22 `SKILL.md` de `.claude/skills/` | ✅ **Estándar abierto** desde 18/12/2025. El mismo fichero vale en 30+ superficies |
| **Perfiles de agente** | Los 20 ficheros de `.claude/agents/` | 🟡 Nativo con adaptadores en 4 hosts, por referencia en el resto |
| **Handoff** | El bloque `### HANDOFF` | ✅ **Universal como contrato**, ⚠️ la ejecución no |
| **Hooks** | Las garantías deterministas | 🔴 **Lo menos portable.** Aquí están las diferencias reales |

**Skills y agentes no se comportan igual, y conviene tenerlo claro**: las skills son estándar
abierto —Claude Code, Codex, Antigravity, Gemini CLI, Cursor, Copilot, OpenCode, Windsurf— y **no
hay que duplicarlas por IDE**. Los agentes sí necesitan envoltorio por superficie, porque el
frontmatter cambia. Por eso `/middle`, `/front` y `/bbdd` viven en un solo sitio, mientras
`backend-expert` tiene envoltorios en `.github/agents/` y referencias en `.cursor/`.

La consecuencia práctica, y es la más importante de este documento:

> **Cuanto más fuerte es la garantía, menos portable es.** Las reglas se leen en todas
> partes pero no obligan a nada. Los hooks obligan de verdad pero solo donde existen.
> Por eso el gate que de verdad vale en todos los proveedores es
> [`scripts/check-sdd.mjs`](../../scripts/check-sdd.mjs): es Node y CI, no depende del IDE.

---

## 2. Matriz por proveedor

Leyenda: ✅ verificado contra documentación oficial · 🟡 funciona con limitación conocida ·
⚠️ formato inferido, sin verificar · ❌ no soportado

| Capacidad | Claude Code | VS Code + Copilot | Copilot CLI/nube | Cursor | Antigravity | Codex |
|---|---|---|---|---|---|---|
| Lee `AGENTS.md` | ✅ vía `CLAUDE.md` | ✅ vía `copilot-instructions` | ✅ | ✅ vía `.cursor/rules` | ✅ vía `GEMINI.md` | ✅ **nativo** |
| Reglas por glob | ✅ skills | ✅ `.github/instructions/` | ✅ | ✅ `.mdc` con `globs` | 🟡 activación por glob | ❌ |
| Perfiles de agente nativos | ✅ `.claude/agents/` | ✅ lee `.github/agents/` **y** `.claude/agents/` | ✅ `.github/agents/` | 🟡 `.cursor/agents/` | ❌ sin formato propio | ✅ `.codex/agents/*.toml` |
| Comandos `/` | ✅ 22 skills | ✅ 15 prompts | ✅ prompts | 🟡 `.cursor/commands/` | 🟡 workflows | ❌ |
| Delegación real a subagente | ✅ herramienta `Agent` | ✅ herramienta `agent` | 🟡 según modo | ✅ subagentes nativos | 🟡 por prompt | ✅ subagentes |
| **Lista blanca de a quién puede llamar** | ✅ `Agent(tipo)` en `tools` | ✅ `agents:` en frontmatter | 🟡 | ✅ `Agent(tipo)` en `tools` | ❌ | ⚠️ |
| **Agente sin escritura (auditor)** | ✅ omitir `Write`/`Edit` | ✅ omitir `edit/editFiles` | ✅ | ✅ `readonly: true` | ❌ | ✅ `sandbox_mode = "read-only"` |
| **Territorio por agente** | ✅ hook + `territories.json` | 🟡 mismo hook, sin probar en vivo | ❌ | ✅ hook + `territories.json` | ⚠️ hook inferido | ❌ |
| Botones de handoff | ❌ (delega el modelo) | ✅ `handoffs:` en frontmatter | ❌ | ❌ | ❌ | ❌ |
| Hooks de herramienta | ✅ 7 eventos, probados | ✅ **8 eventos, lee `.claude/settings.json`** (preview) | ❌ | ✅ `.cursor/hooks.json` | ⚠️ formato inferido | ❌ |
| Trazabilidad `observed` | ✅ `SubagentStart/Stop` | ✅ **tiene los dos eventos** | ❌ | ❌ | ❌ | ❌ |
| `model:` por agente | ✅ | ✅ (`model:`, admite array) | ✅ | 🟡 | ❌ | ✅ |
| MCP | ✅ `.mcp.json` | ✅ `.vscode/mcp.json` | ✅ | ✅ | ✅ | ✅ |
| `check-sdd.mjs` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### Qué significa cada casilla incómoda

**Codex — perfiles de agente ✅.** Las versiones actuales aceptan TOML personales en
`~/.codex/agents/` **y de proyecto en `.codex/agents/`**. Esta plantilla incluye veinte
adaptadores de proyecto; cada uno registra `name`, `description` y `developer_instructions` y
remite a `.claude/agents/<rol>.md`, que sigue siendo la fuente canónica. Los cuatro auditores
usan `sandbox_mode = "read-only"`. Codex carga además `AGENTS.md` de forma nativa. Fuente:
[documentación oficial de subagentes](https://developers.openai.com/codex/multi-agent/).

**Antigravity — perfiles ❌.** No hay formato de subagente equivalente. Los flujos de
`.agents/workflows/` indican en cada paso *qué perfil adoptar* y el agente lee ese fichero
de `.claude/agents/`. Funciona, pero es adopción por lectura, no delegación real: no hay
contexto aislado ni límite de herramientas por rol.

**VS Code — hooks ⚠️.** No he verificado que Copilot en VS Code ejecute hooks de repositorio.
No he creado `.github/hooks/` para no afirmar soporte que no he comprobado. En VS Code las
garantías vienen de `.github/instructions/` (que sí se aplican por glob) y del CI.

**Antigravity — hooks ⚠️.** `.agents/hooks.json` está escrito con el formato más probable
y los guards **sí** emiten el formato de respuesta correcto (probado). Pero no he verificado
que Antigravity lea ese fichero con ese esquema. Trátalo como intención declarada.

---

## 3. Handoffs: lo que funciona y lo que solo parece funcionar

El protocolo de handoff es un **contrato de trabajo escrito**, y por eso es universal:

```
### HANDOFF
- Agente origen · Fase completada · Artefactos · Decisiones
- Bloqueos / supuestos · Siguiente agente sugerido · Contexto que necesita
```

Cualquier modelo en cualquier IDE puede producirlo y consumirlo. No requiere API.

**Lo que cambia por host es la ejecución del traspaso:**

| Mecanismo | Dónde | Qué demuestra |
|---|---|---|
| El modelo invoca la herramienta de subagente | Claude Code, VS Code, Cursor, Codex | Que se creó un contexto nuevo |
| Botón de handoff en el chat | VS Code | Que **cambió el agente activo** |
| Traspaso por prompt | Antigravity, cualquiera | Nada automático: lo continúa el usuario |

> **Un botón de handoff cambia de agente. No prueba que ese agente ejecutara nada.**
> Y la narración del chat —*"ahora el `backend-expert` implementa el caso de uso…"*—
> demuestra lo que el modelo **dice**, no lo que **ocurrió**.

Por eso la trazabilidad tiene niveles explícitos, y por eso solo el primero es una prueba:

| Nivel | Significa | Dónde se consigue |
|---|---|---|
| `observed` | Un hook del **host** vio arrancar y terminar el subagente | Solo Claude Code hoy |
| `declared-direct` | El agente activo hizo el trabajo él mismo, sin delegar | Todos, y es honesto |
| `unverified` | Se afirma una delegación que ningún hook observó | Requiere justificación escrita |

En cualquier host sin `SubagentStart`/`SubagentStop`, **usa `declared-direct`**. Es la opción
correcta, no la de segunda: describe la realidad. Afirmar `observed` sin hook que lo respalde
es exactamente la clase de mentira que este sistema existe para evitar.

---

## 3 bis. Aislamiento: que un agente no haga lo que no le toca

Esto es un problema **distinto** del handoff, y el error habitual es creer que el primero
resuelve el segundo. No lo hace: un handoff impecable deja igualmente al agente de datos libre
para escribir un componente de interfaz.

Se impone en tres capas, y cada host soporta unas:

**1 · Herramientas** — la más fuerte, porque no depende de que el modelo obedezca.

| Objetivo | Claude Code | VS Code | Cursor | Codex |
|---|---|---|---|---|
| Que no pueda escribir | omitir `Write`/`Edit` de `tools` | omitir `edit/editFiles` | **`readonly: true`** | **`sandbox_mode = "read-only"`** |
| Que no pueda delegar | omitir `Agent` de `tools` | omitir `agent` de `tools` | omitir de `tools` | instrucción, sin lista de herramientas por rol |
| Que solo pueda llamar a ciertos agentes | `Agent(tipo)` en `tools` | **`agents: [...]`** en frontmatter | `Agent(tipo)` en `tools` | instrucción, sin lista blanca nativa documentada |

En esta plantilla: solo `orchestrator`, `planner` e `implementer` delegan, cada uno con su lista
blanca; y `orchestrator`, `code-reviewer`, `security-auditor` y `research-analyst` **no tienen
escritura en ningún host**.

**2 · Territorio** — [`.sdd/territories.json`](../../.sdd/territories.json) + `guard-write.mjs`.
El hook cruza el agente activo con la ruta que intenta escribir y bloquea si es territorio ajeno.
El agente activo lo registran `SubagentStart`/`SubagentStop` en `.sdd/state/`, **fuera del
modelo**: `PreToolUse` no dice quién escribe, y sin ese dato la guarda vería la ruta pero no la
mano. Funciona en Claude Code y Cursor (probado), y **también en VS Code** según su documentación
de hooks —mismos eventos, mismo payload, misma decisión—, aunque ahí no se ha ejecutado en vivo.

**3 · Verificación determinista** — `check-sdd.mjs` comprueba que el mapa no nombra agentes
inexistentes y avisa de quién no está gobernado por ninguna regla. **Funciona en todas partes**,
porque es Node y CI.

> **En Codex el territorio sigue siendo convención**, aunque los cuatro auditores sí quedan en
> solo lectura mediante el sandbox. En Antigravity todo el reparto es convención. Lo sostienen
> `AGENTS.md`, el prompt y el CI. Si el aislamiento por ruta es un requisito duro, trabaja en
> Claude Code o Cursor —donde está probado— y deja que el CI sea la red en el resto.

---

## 3 ter. Qué va en cada carpeta, y por qué no se duplica

La pregunta natural al ver el árbol es *"¿no debería haber `skills/` y `hooks/` también en
`.github/` y en `.cursor/`?"*. La respuesta es **no**, y por motivos distintos en cada caso:

| Elemento | Vive en | Lo leen | ¿Duplicar? |
|---|---|---|---|
| **Skills** | `.claude/skills/` | Claude Code · VS Code · Cursor · Codex, **todos de forma nativa** | **No.** Es estándar abierto. Cursor carga `.claude/skills/` por compatibilidad y VS Code también |
| **Hooks (scripts)** | `.claude/hooks/*.mjs` | Los ejecuta quien los invoque | **No.** Son Node puro, sin dependencias |
| **Hooks (configuración)** | `.claude/settings.json` + `.cursor/hooks.json` | Claude Code y VS Code leen el primero; Cursor necesita el suyo porque usa otros nombres de evento | Solo donde el formato obliga |
| **Agentes** | `.claude/agents/` (canónico) + envoltorios | Cada host quiere el suyo: el frontmatter **sí** diverge | Sí, y por eso `.github/agents/`, `.cursor/agents/` y `.codex/agents/` referencian el canónico |
| **Comandos / prompts** | `.claude/skills/` · `.github/prompts/` · `.cursor/commands/` | Cada host tiene su formato | Sí |

La regla general: **se duplica solo donde el formato del host lo exige, y el duplicado es un
envoltorio fino que referencia al canónico**, nunca una copia del contenido. `check-sdd` verifica
que no derivan.

### La capa global, por host

`npx github:jechamo/Estructura_inicial_claude global` instala agentes y skills a nivel de usuario,
para que estén disponibles al abrir **cualquier** proyecto:

| Host | Agentes | Skills | ¿Automático? |
|---|---|---|---|
| Claude Code | `~/.claude/agents/` | `~/.claude/skills/` | ✅ nativo |
| Cursor | `~/.cursor/agents/` | lee `~/.claude/skills/` | ✅ nativo |
| VS Code + Copilot | `~/.github/agents/` | vía `chat.agentSkillsLocations` | 🟡 el instalador añade la clave |
| Codex | `~/.codex/agents/` en TOML | — | ❌ el comando `global` no los instala; `init` sí instala los de proyecto |
| Antigravity | — | — | ❌ solo reglas globales |

**Los hooks no van en global a propósito**: una guarda activa en todos tus repositorios —incluidos
los que no usan SDD— es intrusiva, y lo intrusivo se desactiva. Se quedan por proyecto, que es
donde tienen contexto. Detalle en [`../guides/INSTALACION.md`](../guides/INSTALACION.md).

Y el corolario que ya nos ha mordido dos veces: **duplicar donde no hace falta tiene coste real**
—agentes repetidos en el selector, hooks ejecutándose dos veces por llamada—. Ante la duda, una
sola ubicación.

---

## 4. El gate que sí funciona en todas partes

```bash
node scripts/check-sdd.mjs --strict
```

No depende del IDE, del proveedor ni del modelo. Solo necesita Node y el repositorio.
Comprueba contra el sistema de ficheros:

- toda tarea `hecho` tiene evidencia en `evidence.md` y evento en `execution-log.jsonl`;
- ningún criterio de aceptación quedó sin test;
- no se planificó sobre ambigüedades sin resolver;
- ninguna delegación queda `unverified` sin justificación;
- el log de ejecución no se ha manipulado a mano;
- ningún agente lleva especificadores inválidos en `tools`;
- toda skill declara `name` coincidente con su carpeta y tiene `description`;
- los envoltorios de otras superficies no han derivado del perfil canónico.

Y su gemelo para las dependencias ejecutables de terceros:

```bash
node scripts/skills-sync.mjs --check
```

Exige que ninguna skill externa esté aprobada sin versión fijada ni licencia verificada, y que
todo descarte tenga motivo escrito. Ver [`../agents/SKILLS-EXTERNAS.md`](../agents/SKILLS-EXTERNAS.md).

Los dos están en CI (`.github/workflows/quality-gates.yml`, job `sdd`) y fallan el build.

**Si trabajas en un host sin hooks, este validador es tu única garantía real.** Ejecútalo
antes de cada entrega, y deja que CI lo ejecute en cada PR.

---

## 5. Qué hacer en cada host

### Claude Code — soporte completo
```
/sdd-start
```
Los 20 agentes con `@nombre`, 18 skills, 7 hooks y trazabilidad `observed`.

### VS Code sí tiene hooks, y con el mismo protocolo

Corrección de una afirmación anterior de este documento. VS Code tiene **agent hooks** (en
preview) y son sorprendentemente compatibles:

| | Claude Code | VS Code |
|---|---|---|
| Eventos | 7 | **8** — los mismos más `PreCompact` |
| `SubagentStart` / `SubagentStop` | ✅ | ✅ |
| Payload por stdin | `session_id`, `cwd`, `tool_name`, `tool_input` | **idéntico** |
| Decisión por stdout | `hookSpecificOutput.permissionDecision` | **idéntica** |
| Dónde se configura | `.claude/settings.json` | `.github/hooks/*.json` **o `.claude/settings.json`** |

**Consecuencia**: los hooks de `.claude/hooks/` funcionan en VS Code **sin tocar nada**, porque
VS Code lee `.claude/settings.json` por defecto. Y eso arrastra dos cosas que este documento daba
por perdidas fuera de Claude Code: **la guarda de territorio** y la **trazabilidad `observed`**.

> **Por eso NO hay `.github/hooks/` en este repositorio.** Si existiera, VS Code cargaría la
> configuración **dos veces** —la suya y la de `.claude/settings.json`— y cada guarda se
> ejecutaría por duplicado en cada llamada a herramienta. Es exactamente el mismo error que
> producía agentes duplicados en el selector, y la solución es la misma: **una sola ubicación**.

Un detalle que hay que vigilar: los `matcher` son expresiones regulares contra el **nombre de la
herramienta**, y ese nombre cambia por host (`Edit` en Claude Code, `edit/editFiles` en VS Code).
Un matcher que no coincide **no dispara el hook**, y una guarda que no se ejecuta falla en
abierto: permite todo en silencio. Por eso los matchers de `.claude/settings.json` cubren los dos
vocabularios.

**Lo que no está verificado**: nada de esto se ha ejecutado en una sesión real de VS Code. Está
contrastado contra la documentación oficial y el protocolo coincide campo por campo, pero es
*preview* y su formato puede cambiar. Si lo pruebas y falla, el sitio para anotarlo es el baseline.

### VS Code — el duplicado del selector, y por qué

VS Code lee `.github/agents/` **y además** `.claude/agents/`, y **no deduplica por nombre**
([microsoft/vscode#312256](https://github.com/microsoft/vscode/issues/312256)). Con los 20 agentes
en ambas carpetas, el selector los mostraba dos veces cada uno.

Se resuelve en [`.vscode/settings.json`](../../.vscode/settings.json), desactivando una ubicación:

```jsonc
"chat.agentFilesLocations": { ".github/agents": true, ".claude/agents": false }
```

Se desactiva `.claude/agents` —y no al revés— porque los envoltorios llevan `handoffs:` y
**`agents:`**, la lista blanca de a quién puede delegar cada agente. Ese campo es el aislamiento en
VS Code: sin él, el orquestador podría invocar a cualquiera. A cambio, **los 20 agentes necesitan
envoltorio**, y `check-sdd` falla si falta alguno.

Las **skills no tienen este problema**: VS Code lee `.claude/skills/` de forma nativa, así que el
mismo `SKILL.md` vale en VS Code, Claude Code, Cursor y Codex sin duplicar nada. Es la diferencia
práctica entre el estándar abierto de skills y los formatos de agente, que sí divergen por host.

### VS Code + Copilot — soporte alto
Picker de agentes (lee `.claude/agents/` y `.github/agents/`), 15 prompts `/`, instrucciones
por glob, botones de handoff **y delegación real a subagentes**: `orchestrator`, `planner` e
`implementer` declaran la herramienta `agent` y una lista `agents:` que limita a quién pueden
llamar. Sin hooks verificados no hay guarda de territorio → **apóyate en el CI**.

### Copilot CLI y agente en la nube
Usa `.github/agents/*.agent.md`. Si necesitas un especialista que solo tiene perfil canónico,
créale el envoltorio con el mismo patrón (ver [`.github/agents/README.md`](../../.github/agents/README.md)).

### Cursor — soporte alto
Reglas `.mdc` por glob, **los 20 agentes** en `.cursor/agents/`, comandos en `.cursor/commands/`
y **hooks funcionando** vía `.cursor/hooks.json`. Delegación automática según la `description`
del agente —por eso importa que sean específicas— y `readonly: true` en los auditores, que
impide escribir a nivel de plataforma. Es, junto a Claude Code, donde el aislamiento es real.

### Antigravity — soporte medio
`GEMINI.md` + `.agents/rules/00-core.md` (ojo al límite de ~12 000 caracteres) y los flujos
de `.agents/workflows/`. Los perfiles se **adoptan leyéndolos**. Hooks sin verificar.

### Codex — soporte nativo de los 20 agentes
`AGENTS.md` aporta la constitución completa y `.codex/agents/*.toml` registra los veinte roles
del proyecto. Los TOML son adaptadores finos: antes de actuar, cada subagente lee su definición
canónica en `.claude/agents/`. `.codex/config.toml` habilita la herramienta de subagentes sin fijar
modelo, esfuerzo ni concurrencia, de modo que esos valores se heredan de la sesión.

En la app, CLI o extensión IDE, pide explícitamente el rol —por ejemplo, *«delega en
`security-auditor`»*— o deja que una instrucción aplicable de `AGENTS.md`/skill solicite la
delegación. En CLI, `/agent` permite inspeccionar y cambiar entre hilos. Los auditores son de solo
lectura; la lista blanca de delegación y los territorios continúan como reglas escritas, porque
Codex no documenta un control nativo equivalente por agente. Ejecuta `check-sdd --strict` como gate.

### Cualquier otro host compatible con AGENTS.md
Zed, Windsurf, Gemini CLI, Aider y demás leen `AGENTS.md`. Tendrás las reglas y el circuito.
Los perfiles, por referencia. Las garantías, por CI.

---

## 6. Cómo mantener esto sin que derive

El riesgo real de tener cinco superficies es que en seis meses haya cinco versiones
distintas de las mismas reglas y nadie sepa cuál rige.

Tres defensas:

1. **Una sola fuente canónica.** `AGENTS.md` para las reglas, `.claude/agents/` para los
   perfiles. El resto **referencia**, no copia.
2. **`check-sdd.mjs` detecta la deriva**: si un envoltorio apunta a un perfil que no existe,
   falla; si no referencia su perfil canónico, avisa.
3. **`guard-write.mjs` pide confirmación humana** al tocar `.claude/agents/`, `.github/agents/`,
   `.cursor/`, `.codex/`, `.agents/`, `AGENTS.md` o la constitución. Un cambio ahí afecta a todas las
   sesiones futuras.

Cuando cambie el formato de una plataforma: `/sdd-refresh`. Genera un baseline nuevo fechado
sin borrar el anterior.

---

## 7. Lo que no está verificado

Honestidad explícita, para que nadie confíe de más:

- Hooks de VS Code: **verificados contra la documentación**, no ejecutados en vivo. Están en
  *preview*. No hay `.github/hooks/` a propósito: duplicaría la carga de `.claude/settings.json`.
- Si los `matcher` de `.claude/settings.json` cubren o no los nombres de herramienta reales de
  VS Code: **inferido**. Se han ampliado para cubrir los dos vocabularios, sin comprobarlo en vivo.
- Esquema de `.agents/hooks.json` de Antigravity: **inferido**, no confirmado en su documentación.
- Formato exacto de `.cursor/agents/`: los ficheros siguen la convención de reglas de Cursor,
  pero no he confirmado que Cursor los trate como agentes seleccionables.
- Comportamiento de `handoffs:` en la versión concreta de VS Code que uses.
- `SubagentStart`/`SubagentStop` fuera de Claude Code: **no existen** que yo haya verificado.
  La trazabilidad `observed` es exclusiva de Claude Code hoy.
- La carga interactiva de estos veinte TOML en la versión concreta de Codex instalada: el esquema
  está verificado contra la documentación oficial y por tests estáticos, no mediante el selector.
- Que una misma skill produzca la **misma salida** en Claude Code, Codex y Copilot: el formato es
  portable por estándar, pero **no he comparado el resultado real** en cada superficie.

Lo verificado y su fuente está en
[`docs/research/baseline-2026-07-30.md`](../research/baseline-2026-07-30.md) (vigente) y
[`docs/research/baseline-2026-07-29.md`](../research/baseline-2026-07-29.md).
