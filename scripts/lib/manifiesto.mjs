/**
 * Manifiesto de instalación: qué se copia, adónde y con qué política.
 *
 * Está separado del instalador a propósito. Cuando alguien añada un fichero a la
 * plantilla, el sitio donde declarar qué hacer con él tiene que ser evidente y corto;
 * si hay que leerse un instalador de 400 líneas para saberlo, no se actualiza.
 */

/**
 * Nunca se copian a un proyecto destino: son el historial de LA PLANTILLA, no del
 * proyecto que la adopta. Copiarlos plantaría decisiones y sesiones ajenas en su bitácora.
 */
export const NUNCA = [
  'README.md',
  'CHANGELOG.md',
  'CONTRIBUTING.md',
  'SECURITY.md',
  'package.json',
  'package-lock.json',
  'docs/agents/MAPEO-10-AGENTES.md',
  'docs/specs/001-agentes-codex/**',
  'docs/bitacora/sessions/**',
  '.sdd/agent-audit.jsonl',
  '.sdd/state/**',
  '.git/**',
  'node_modules/**',
  'scripts/install.mjs',
  'scripts/lib/**',
  'scripts/test-install.mjs',
];

/** Solo con `--con-baseline`: es referencia útil, pero es investigación de la plantilla. */
export const OPCIONAL_BASELINE = ['docs/research/**'];

/**
 * Se instalan vacíos o reiniciados: la estructura sí, el contenido no.
 * El valor es lo que se escribe cuando el fichero no existe en destino.
 */
export const REINICIADOS = {
  'docs/bitacora/DECISIONS.md': `# Bitácora de decisiones

> El chat se pierde; el repositorio permanece.
> Entradas **nuevas arriba**. Nunca se reescribe ni se borra una entrada: si algo cambió,
> se añade una nueva que la reemplaza y enlaza a la anterior.
>
> Formato: [\`TEMPLATE.md\`](./TEMPLATE.md) · Decisiones estructurales:
> [\`../architecture/adr/\`](../architecture/adr/) · Sesiones: [\`sessions/\`](./sessions/)

---

<!-- Añade las entradas nuevas justo debajo de esta línea, empujando esta hacia abajo -->
`,
  '.sdd/agent-audit.jsonl': '',
};

/**
 * Capa global: lo que se instala a nivel de usuario y aparece en TODOS los proyectos.
 *
 * Solo agentes y skills. Los hooks NO: una guarda de territorio o un formateador activos
 * en todos tus repositorios —incluidos los que no usan SDD— es intrusivo, y lo intrusivo
 * se desactiva. Los hooks se quedan por proyecto, que es donde tienen contexto.
 *
 * `nativo: false` significa que el host no lo descubre solo y hay que configurarlo.
 */
export const GLOBAL = [
  { host: 'Claude Code', origen: '.claude/agents', destino: '~/.claude/agents', nativo: true },
  { host: 'Claude Code · Cursor', origen: '.claude/skills', destino: '~/.claude/skills', nativo: true },
  { host: 'Cursor', origen: '.cursor/agents', destino: '~/.cursor/agents', nativo: true },
  { host: 'VS Code · Copilot', origen: '.github/agents', destino: '~/.github/agents', nativo: false },
];

/**
 * JSON que se fusionan en vez de sobrescribirse. Nunca se pisa una clave que ya exista:
 * la configuración del usuario gana siempre sobre la de la plantilla.
 */
export const FUSIONABLES = ['.vscode/settings.json', '.claude/settings.json', '.mcp.json'];

/** Se añaden solo las líneas que falten, dentro de un bloque delimitado y comentado. */
export const APENDICES = {
  '.gitignore': {
    marcaInicio: '# ─── SDD (instalado por sdd init) ───',
    marcaFin: '# ─── fin SDD ───',
    lineas: ['.sdd/state/', '.claude/settings.local.json', '.claude/.cache/', '.cursor/local/'],
  },
};

/** Rutas que se crean vacías si no existen: la estructura importa aunque no haya contenido. */
export const DIRECTORIOS = [
  'docs/specs',
  'docs/architecture/adr',
  'docs/bitacora/sessions',
  'docs/quality/reports',
  'docs/security/reports',
  'docs/design/flows',
  'docs/design/wireframes',
  'docs/ops/runbooks',
];

/** ¿Coincide una ruta con alguno de estos patrones tipo glob simple? */
export function coincide(ruta, patrones) {
  return patrones.some((p) => {
    if (p.endsWith('/**')) return ruta === p.slice(0, -3) || ruta.startsWith(p.slice(0, -2));
    return ruta === p;
  });
}
