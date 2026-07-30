# Compatibilidad entre IDEs y proveedores

**Fecha de verificación: 2026-07-29.** Revalidar con `/sdd-refresh`.

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
| **Perfiles de agente** | Los 20 ficheros de `.claude/agents/` | 🟡 Nativo en 3 hosts, por referencia en el resto |
| **Handoff** | El bloque `### HANDOFF` | ✅ **Universal como contrato**, ⚠️ la ejecución no |
| **Hooks** | Las garantías deterministas | 🔴 **Lo menos portable.** Aquí están las diferencias reales |

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
| Perfiles de agente nativos | ✅ `.claude/agents/` | ✅ lee `.github/agents/` **y** `.claude/agents/` | ✅ `.github/agents/` | 🟡 `.cursor/agents/` | ❌ sin formato propio | 🟡 TOML en `~/.codex/agents/` |
| Comandos `/` | ✅ 18 skills | ✅ 11 prompts | ✅ prompts | 🟡 `.cursor/commands/` | 🟡 workflows | ❌ |
| Delegación real a subagente | ✅ herramienta `Agent` | ✅ herramienta `agent` + `handoffs` | 🟡 según modo | ✅ subagentes nativos | 🟡 por prompt | ✅ subagentes |
| Botones de handoff | ❌ (delega el modelo) | ✅ `handoffs:` en frontmatter | ❌ | ❌ | ❌ | ❌ |
| Hooks de herramienta | ✅ 7 eventos, probados | ⚠️ sin verificar | ❌ | ✅ `.cursor/hooks.json` | ⚠️ formato inferido | ❌ |
| Trazabilidad `observed` | ✅ `SubagentStart/Stop` | ❌ | ❌ | ❌ | ❌ | ❌ |
| `model:` por agente | ✅ | ✅ (`model:`, admite array) | ✅ | 🟡 | ❌ | ✅ |
| MCP | ✅ `.mcp.json` | ✅ `.vscode/mcp.json` | ✅ | ✅ | ✅ | ✅ |
| `check-sdd.mjs` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### Qué significa cada casilla incómoda

**Codex — perfiles de agente 🟡.** Codex define agentes como **ficheros TOML en
`~/.codex/agents/`**, a nivel de usuario, no de repositorio. Una plantilla no puede
enviarlos: viven en la máquina de cada persona. Lo que **sí** funciona en Codex es
`AGENTS.md`, que es su fichero nativo de instrucciones, y ahí está la constitución
completa: circuito SDD, principios, TDD, seguridad y protocolo de handoff. En Codex
tendrás las reglas y el flujo, no el picker de 20 agentes.

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
- los envoltorios de otras superficies no han derivado del perfil canónico.

Está en CI (`.github/workflows/quality-gates.yml`, job `sdd`) y falla el build.

**Si trabajas en un host sin hooks, este validador es tu única garantía real.** Ejecútalo
antes de cada entrega, y deja que CI lo ejecute en cada PR.

---

## 5. Qué hacer en cada host

### Claude Code — soporte completo
```
/sdd-start
```
Los 20 agentes con `@nombre`, 18 skills, 7 hooks y trazabilidad `observed`.

### VS Code + Copilot — soporte alto
Picker de agentes (lee `.claude/agents/` y `.github/agents/`), 11 prompts `/`, instrucciones
por glob y botones de handoff. Sin hooks verificados → **apóyate en el CI**.

### Copilot CLI y agente en la nube
Usa `.github/agents/*.agent.md`. Si necesitas un especialista que solo tiene perfil canónico,
créale el envoltorio con el mismo patrón (ver [`.github/agents/README.md`](../../.github/agents/README.md)).

### Cursor — soporte alto
Reglas `.mdc` por glob, agentes en `.cursor/agents/`, comandos en `.cursor/commands/` y
**hooks funcionando** vía `.cursor/hooks.json`. Para un especialista sin fichero propio,
referencia el perfil: `@.claude/agents/database-expert.md`.

### Antigravity — soporte medio
`GEMINI.md` + `.agents/rules/00-core.md` (ojo al límite de ~12 000 caracteres) y los flujos
de `.agents/workflows/`. Los perfiles se **adoptan leyéndolos**. Hooks sin verificar.

### Codex — soporte de reglas
`AGENTS.md` es su fichero nativo: tienes la constitución completa y el circuito. Los perfiles
de agente van en TOML de usuario (`~/.codex/agents/`), fuera del repositorio. Ejecuta
`check-sdd --strict` como gate.

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
   `.cursor/`, `.agents/`, `AGENTS.md` o la constitución. Un cambio ahí afecta a todas las
   sesiones futuras.

Cuando cambie el formato de una plataforma: `/sdd-refresh`. Genera un baseline nuevo fechado
sin borrar el anterior.

---

## 7. Lo que no está verificado

Honestidad explícita, para que nadie confíe de más:

- Hooks de repositorio en Copilot/VS Code: **no verificado**, por eso no hay `.github/hooks/`.
- Esquema de `.agents/hooks.json` de Antigravity: **inferido**, no confirmado en su documentación.
- Formato exacto de `.cursor/agents/`: los ficheros siguen la convención de reglas de Cursor,
  pero no he confirmado que Cursor los trate como agentes seleccionables.
- Comportamiento de `handoffs:` en la versión concreta de VS Code que uses.
- `SubagentStart`/`SubagentStop` fuera de Claude Code: **no existen** que yo haya verificado.
  La trazabilidad `observed` es exclusiva de Claude Code hoy.

Lo verificado y su fuente está en
[`docs/research/baseline-2026-07-29.md`](../research/baseline-2026-07-29.md).
