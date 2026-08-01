# Instalar la estructura en un proyecto existente

Dos capas. Una se instala **una vez por máquina** y aparece en todos tus proyectos; la otra se
instala **por repositorio** y se versiona con el código.

```bash
# Una vez por máquina: agentes y skills en todos tus proyectos
npx github:jechamo/Estructura_inicial_claude global

# Una vez por proyecto, desde su raíz
npx github:jechamo/Estructura_inicial_claude init
```

**Antes de la primera vez, míralo en seco.** No escribe nada:

```bash
npx github:jechamo/Estructura_inicial_claude init --dry-run
```

---

## Por qué dos capas

| | Capa global | Capa por proyecto |
|---|---|---|
| **Qué** | Agentes y skills | Hooks, territorios, `AGENTS.md`, docs, CI, reglas por IDE |
| **Dónde** | Tu carpeta de usuario | Dentro del repositorio |
| **Por qué ahí** | Para que estén al abrir cualquier proyecto sin tocar nada | Porque describen **ese** proyecto y quien lo clone debe recibirlos |

**Los hooks no se instalan en global, a propósito.** Una guarda de territorio o un formateador
activos en todos tus repositorios —incluidos los que no usan SDD— es intrusivo, y lo intrusivo
acaba desactivado. Se quedan donde tienen contexto.

Los agentes y skills se instalan **en las dos capas**: en tu máquina para tenerlos siempre, y en
el repositorio para que quien lo clone no tenga que instalar nada. Es la única duplicación
aceptada, y es entre máquina y repo, nunca dentro del repo.

---

## Qué IDE coge la capa global

| Host | Agentes | Skills | ¿Automático? |
|---|---|---|---|
| **Claude Code** | `~/.claude/agents/` | `~/.claude/skills/` | ✅ Nativo |
| **Cursor** | `~/.cursor/agents/` | lee `~/.claude/skills/` por compatibilidad | ✅ Nativo |
| **VS Code + Copilot** | `~/.github/agents/` | vía `chat.agentSkillsLocations` | 🟡 El instalador añade la clave a tu `settings.json` de usuario |
| **Codex** | `~/.codex/agents/` en TOML | — | ❌ Formato distinto, no se cubre |
| **Antigravity** | — | — | ❌ Solo admite reglas globales |

**Coste honesto**: los 20 agentes aparecerán en el selector de **todos** tus proyectos, también
donde no quieras SDD. Son inertes si no los invocas, pero ensucian la lista. Si eso te molesta,
sáltate `global` y usa solo `init` donde lo quieras.

---

## Qué hace `init` con lo que ya tienes

La regla es una: **nunca se pisa un fichero tuyo.**

| Situación | Qué pasa |
|---|---|
| El fichero no existe | Se escribe |
| Existe y es idéntico | No se toca |
| Existe y es **distinto** | **No se toca.** El nuevo se deja como `<fichero>.sdd-nuevo` y se lista al final |
| Es un JSON conocido (`.vscode/settings.json`, `.claude/settings.json`, `.mcp.json`) | Se **fusionan** las claves que falten. Las tuyas ganan siempre |
| `.gitignore` | Se añaden solo las líneas ausentes, en un bloque delimitado y comentado |

Al terminar te dice cuántos ficheros escribió, cuáles fusionó y **qué tienes que revisar**.

### Lo que nunca se copia

El historial de la plantilla no es el de tu proyecto: `README.md`, `CHANGELOG.md`, las sesiones de
bitácora, el log de auditoría y el propio instalador se quedan fuera. `docs/bitacora/DECISIONS.md`
se instala **vacío**, con su cabecera y su formato.

Con `--con-baseline` se incluye además `docs/research/`, la investigación fechada sobre la que se
construyó la plantilla. Es referencia útil, pero es de la plantilla, no tuya.

---

## Actualizar

```bash
npx github:jechamo/Estructura_inicial_claude check    # ¿hay novedades? ¿qué he tocado yo?
npx github:jechamo/Estructura_inicial_claude update
```

`update` funciona gracias a `.sdd/installed.json`, que guarda el hash de cada fichero instalado:

- Si el fichero **está como lo dejamos**, nadie lo ha tocado → se actualiza en silencio.
- Si **lo has modificado**, se respeta y el nuevo llega como `.sdd-nuevo`.

Así puedes personalizar los territorios, los agentes o la constitución sin miedo a que una
actualización se lleve tu trabajo por delante.

---

## Después de instalar

Instalar **no** es adoptar. Quedan dos cosas, y la primera es la que más se olvida:

### 1. Ajustar los territorios

`.sdd/territories.json` trae rutas convencionales: `src/components/**`, `migrations/**`,
`src/domain/**`… Si tu proyecto no las usa, **la guarda de territorio estará protegiendo rutas que
no existen** y no protegiendo las que sí. Ábrelo y ajústalo a tu estructura real.

### 2. Documentar lo que ya hay

```
/onboard
```

`@research-analyst` reconstruye la arquitectura **real** —no la declarada— y `@architect` la
formaliza en `docs/architecture/constitution.md` y el ADR-0001. No refactoriza nada: documenta la
realidad, aunque la realidad sea fea.

A partir de ahí ya estás en el circuito: `/sdd-specify` para lo siguiente que toques.

### Y comprueba que quedó bien

```bash
node scripts/check-sdd.mjs
node scripts/test-hooks.mjs
```

---

## Desinstalar

No hay comando, y es deliberado: borrar ficheros del proyecto de alguien automáticamente es
justo lo que este sistema evita. `.sdd/installed.json` tiene la lista exacta de lo que se instaló;
con eso y `git` puedes revertir con precisión.

---

## Límites declarados

- **`npx github:` clona el repositorio entero** en cada ejecución. Es aceptable para un comando
  puntual; si molesta, la alternativa es publicarlo en npm.
- **Codex y Antigravity no reciben la capa global.** Codex usa TOML en `~/.codex/agents/`;
  mantener un traductor de 20 perfiles a otro formato es coste que hoy no se justifica.
- **VS Code necesita que se toque tu `settings.json` de usuario.** Es la única escritura fuera del
  proyecto además de las carpetas de agentes. El instalador lo anuncia antes de hacerlo, y si no
  encuentra el fichero te imprime la clave para que la pegues tú.
