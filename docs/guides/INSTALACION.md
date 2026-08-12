# Instalación universal

La instalación es por proyecto y funciona igual desde cualquier IDE porque todo queda
versionado dentro del repositorio. Requiere Node 18 o posterior y no instala dependencias.

## Comando recomendado

Usa una versión etiquetada; evita instalar directamente desde una rama móvil:

```powershell
npx --yes github:jechamo/Estructura_inicial_claude#v0.6.0 init "C:\ruta\proyecto" --mode auto --dry-run
npx --yes github:jechamo/Estructura_inicial_claude#v0.6.0 init "C:\ruta\proyecto" --mode auto
```

El destino puede no existir y puede contener espacios. `--dry-run` no crea el directorio ni
instala agentes, skills o hooks: solo muestra qué haría. Ejecuta después el segundo comando para
materializar la instalación.

## Modos

| Modo | Uso | Efecto sobre contexto existente |
|---|---|---|
| `greenfield` | Directorio vacío o proyecto nuevo | Crea esqueletos vírgenes |
| `brownfield` | Repositorio en vuelo | Instala el motor y preserva todo el contexto |
| `auto` | Valor recomendado | Considera brownfield cualquier destino con contenido; nunca autoriza un reset |

“Virgen” solo se aplica a ficheros que no existían. `update` jamás vacía un changelog, una
bitácora, una spec, un ADR, una sesión, un informe ni un log.

## Qué nace virgen

- `README.md` de proyecto en estado bootstrap.
- `CHANGELOG.md` con solo `[Unreleased]`.
- Constitución, visión, dirección visual y modelo de amenazas como stubs sin decisiones.
- `docs/specs/` y `docs/architecture/adr/` con solo sus plantillas.
- Directorios de sesiones, informes, flujos y wireframes vacíos.
- `docs/bitacora/DECISIONS.md` sin entradas.
- `.sdd/agent-audit.jsonl` a cero bytes.
- `.sdd/external-skills.json` solo con `skill-creator`, auditada, licenciada y fijada a commit;
  sin candidatas, descartes ni decisiones históricas de la plantilla.
- `.sdd/territories.json` en `audit`, sin rutas de aplicación asumidas.
- `.sdd/checks.json` con solo el gate SDD; el stack queda sin configurar.
- `.sdd/docs.json` en modo `audit`, sin inventar superficies ni herramientas documentales.
- Estado documental `bootstrap` en greenfield; brownfield conserva contexto y nace
  `legacy-pending` hasta aprobar su baseline.

El README, changelog, specs, ADR, informes, sesiones, auditoría y decisiones de esta plantilla
no viajan al destino.

## Fusión brownfield

| Tipo | Política |
|---|---|
| Markdown de host | Bloque delimitado `<!-- sdd:start -->` / `<!-- sdd:end -->` |
| JSON/JSONC | Fusión conservadora; las claves del proyecto ganan |
| Hooks JSON | Unión por estructura sin borrar entradas existentes |
| TOML de Codex | Bloque gestionado; nunca reemplaza valores existentes |
| `.gitignore` | Apéndice delimitado; solo líneas ausentes |
| Documentos, specs, ADR y logs existentes | Se conservan íntegramente |

Si una configuración no se puede fusionar o un fichero gestionado fue modificado, la propuesta
queda en `.sdd/conflicts/<version>/<ruta>` y el original permanece intacto. La propiedad y los
hashes están en `.sdd/installed.json`.

## MCP: siempre opt-in

La instalación normal no crea `.mcp.json`, `.vscode/mcp.json` ni entradas MCP de Codex. Activa
solo los servidores que hayas elegido:

```powershell
npx --yes github:jechamo/Estructura_inicial_claude#v0.6.0 init "C:\ruta\proyecto" `
  --mode auto --with-mcp context7,playwright
```

Las referencias ejecutables están fijadas a una versión. Las credenciales no se escriben: cada
host las solicita o las lee del entorno. Revisa [MCP-SECURITY.md](../security/MCP-SECURITY.md).

## Después de instalar

En un proyecto nuevo ejecuta `/sdd-intake`: normaliza el PRD —pegado, local, URL o ya presente— y
el diseño opcional antes de decidir arquitectura. Tras la aprobación humana, ejecuta `/sdd-init`.
En uno existente usa `/sdd-intake` para cerrar el baseline de producto y `/onboard` si falta
documentar la arquitectura. Después ejecuta `/docs-sync bootstrap`: inventaría documentación
real sin crear código ni instalar Swagger, Storybook o TypeDoc y deja la aprobación a una persona.
El instalador nunca inventa producto, stack, territorios ni comandos de calidad.

Comandos deterministas disponibles:

```powershell
node scripts/check-sdd.mjs --virgin       # justo después de un greenfield
node scripts/check-sdd.mjs                # estructura y coherencia
node scripts/test-hooks.mjs               # guardas y contratos
node scripts/sdd-project.mjs detect --json
node scripts/sdd-project.mjs product-status --json
node scripts/sdd-project.mjs approve-product --approved-by "<persona>" --json
node scripts/sdd-project.mjs docs-status --json
node scripts/sdd-project.mjs approve-docs --approved-by "<persona>" --json
node scripts/sdd-project.mjs configure --accept-detected
node scripts/sdd-project.mjs run --ci
```

`detect` no escribe. `configure --accept-detected` es la aprobación explícita para incorporar
los comandos encontrados a `.sdd/checks.json`.

## Qué versionar después de instalar

Sube el circuito compartido: código y tests, `AGENTS.md`, perfiles de los seis hosts, skills,
reglas, workflows, hooks, `.sdd/*.json` durables, auditoría, specs, evidencias y documentación
oficial. Así otro equipo recupera el método y su historia con un `git clone`.

No subas `.env`, credenciales, configuración personal, `.sdd/state/`, `.sdd/conflicts/`, cachés,
dependencias ni builds documentales regenerables. El instalador no ejecuta `git add`, commit o
push: revisa siempre `git status --short`. La política completa está en
[`DOCUMENTACION.md`](./DOCUMENTACION.md).

## Hooks Git compartidos y opt-in

Los ficheros de hook se instalan y se versionan, pero el instalador no cambia Git ni permisos.
Actívalos de forma deliberada si quieres gates locales:

```powershell
git config core.hooksPath .sdd/githooks
git update-index --chmod=+x .sdd/githooks/pre-commit .sdd/githooks/pre-push
```

Antes de cada commit ejecuta `node scripts/sdd-project.mjs run --fast`; antes de cada push,
`node scripts/sdd-project.mjs run --slow`. El pre-push también exige una base Git resoluble para
comparar código y documentación.

## Actualizar

```powershell
npx --yes github:jechamo/Estructura_inicial_claude#v0.6.0 check "C:\ruta\proyecto"
npx --yes github:jechamo/Estructura_inicial_claude#v0.6.0 update "C:\ruta\proyecto"
```

Un fichero gestionado sin cambios se actualiza. Uno modificado se preserva y recibe una propuesta
en `conflicts`. Las semillas de estado virgen pasan a ser propiedad del proyecto desde su creación
y nunca se reinician.

## Capa global opcional

`global` instala perfiles y skills para descubrirlos fuera de proyectos preparados, pero no es
necesario para que un repositorio instalado funcione y no instala hooks globales:

```powershell
npx --yes github:jechamo/Estructura_inicial_claude#v0.6.0 global --dry-run
```

Codex y Antigravity se mantienen por proyecto para no alterar configuración personal.

## Abrir el clon en otro equipo

Después de `git clone`, instala el IDE y sus extensiones, configura las credenciales locales,
marca el workspace como confiable y recarga la ventana. Los agentes, skills y documentos ya
están en el repositorio; el estado de confianza y las credenciales no.
