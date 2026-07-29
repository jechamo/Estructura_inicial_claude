/**
 * Utilidades compartidas por los hooks.
 * Node >= 18. Sin dependencias externas a propósito: un hook que necesita `npm install`
 * es un hook que algún día no se ejecuta.
 */
import { readFileSync, existsSync, readdirSync, mkdirSync, appendFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

/** Lee el JSON que Claude Code envía por stdin. Devuelve {} si no hay nada legible. */
export async function readHookInput() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8').trim();
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

/** Los gates se pueden desactivar temporalmente con SDD_GATES=off. */
export const gatesEnabled = () => process.env.SDD_GATES !== 'off';

export const projectRoot = (input = {}) => input.cwd || process.cwd();

/**
 * Normaliza la llamada a herramienta entre hosts.
 * Claude Code / Copilot: { tool_name, tool_input }
 * Antigravity:           { toolCall: { name, args } }
 * Devuelve { herramienta, entrada, antigravity }.
 */
export function toolCall(payload = {}) {
  const esAntigravity = payload.toolCall && typeof payload.toolCall === 'object';
  const call = esAntigravity ? payload.toolCall : payload;
  const nombre = esAntigravity ? call.name : (call.tool_name ?? call.toolName ?? '');
  const entrada = esAntigravity ? call.args : (call.tool_input ?? call.toolInput ?? {});
  return {
    herramienta: String(nombre || '').toLowerCase(),
    entrada: entrada && typeof entrada === 'object' ? entrada : {},
    antigravity: Boolean(esAntigravity),
  };
}

/** Recolecta recursivamente los valores cuyas claves contengan alguno de los tokens. */
export function valoresPorClave(valor, tokens) {
  const out = [];
  if (Array.isArray(valor)) {
    for (const v of valor) out.push(...valoresPorClave(v, tokens));
  } else if (valor && typeof valor === 'object') {
    for (const [k, v] of Object.entries(valor)) {
      const clave = k.toLowerCase().replace(/[_-]/g, '');
      if (tokens.some((t) => clave.includes(t))) {
        if (typeof v === 'string') out.push(v);
        else if (Array.isArray(v)) out.push(...v.filter((x) => typeof x === 'string'));
      }
      if (v && typeof v === 'object') out.push(...valoresPorClave(v, tokens));
    }
  }
  return out;
}

export const rutasDe = (entrada) =>
  valoresPorClave(entrada, ['path', 'file', 'target', 'directory']).map((r) =>
    r.trim().replace(/^["']|["']$/g, '').replace(/\\/g, '/').replace(/^\.\//, ''),
  );

export const comandosDe = (entrada) => valoresPorClave(entrada, ['command', 'cmd']);

/**
 * Emite una decisión de permiso. A diferencia de exit 2 (que solo puede denegar),
 * permite `ask`: escalar al humano en lugar de bloquear o dejar pasar.
 */
export function decide(decision, motivo, antigravity = false) {
  const salida = antigravity
    ? { decision: decision === 'ask' ? 'force_ask' : decision, reason: motivo }
    : {
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          permissionDecision: decision,
          permissionDecisionReason: motivo,
        },
      };
  process.stdout.write(JSON.stringify(salida) + '\n');
  process.exit(0);
}

/** Bloquea la acción: Claude ve el mensaje y corrige. */
export function block(message) {
  process.stderr.write(message + '\n');
  process.exit(2);
}

/** Añade contexto a la conversación (SessionStart / UserPromptSubmit). */
export function inject(text) {
  if (text && text.trim()) process.stdout.write(text.trim() + '\n');
  process.exit(0);
}

export const allow = () => process.exit(0);

export function readIfExists(path) {
  try {
    return existsSync(path) ? readFileSync(path, 'utf8') : null;
  } catch {
    return null;
  }
}

export function listDirs(path) {
  try {
    return readdirSync(path, { withFileTypes: true })
      .filter((d) => d.isDirectory() && !d.name.startsWith('_') && !d.name.startsWith('.'))
      .map((d) => d.name)
      .sort();
  } catch {
    return [];
  }
}

export function appendLine(path, line) {
  try {
    mkdirSync(resolve(path, '..'), { recursive: true });
    appendFileSync(path, line + '\n', 'utf8');
  } catch {
    /* la bitácora nunca debe romper la sesión */
  }
}

/**
 * Localiza la spec activa: la que tiene tareas pendientes o en curso.
 * Devuelve { dir, nombre, total, hechas, enCurso } o null.
 */
export function findActiveSpec(root) {
  const specsDir = join(root, process.env.SDD_SPECS_DIR || 'docs/specs');
  for (const name of listDirs(specsDir)) {
    const tasks = readIfExists(join(specsDir, name, 'tasks.md'));
    if (!tasks) continue;
    const total = (tasks.match(/^###\s+T-/gm) || []).length;
    const hechas = (tasks.match(/^-\s*Estado:\s*hecho/gim) || []).length;
    const enCurso = (tasks.match(/^-\s*Estado:\s*en curso/gim) || []).length;
    if (total > hechas) {
      return { dir: join(specsDir, name), nombre: name, total, hechas, enCurso };
    }
  }
  return null;
}

/**
 * Registra un evento en la bitácora de ejecución append-only de la spec activa.
 * Si no hay spec activa, cae a `.sdd/agent-audit.jsonl` para no perder el evento.
 *
 * La narración del chat no demuestra qué subagente trabajó. Esto sí deja rastro.
 */
export function logEjecucion(root, evento) {
  const spec = findActiveSpec(root);
  const destino = spec
    ? join(spec.dir, 'execution-log.jsonl')
    : join(root, '.sdd', 'agent-audit.jsonl');
  const linea = JSON.stringify({ ts: new Date().toISOString(), ...evento });
  appendLine(destino, linea);
  return { destino, spec: spec?.nombre ?? null };
}

/** Últimas N entradas (encabezados `## `) de la bitácora. */
export function lastDecisions(root, n = 3) {
  const content = readIfExists(join(root, process.env.SDD_BITACORA || 'docs/bitacora/DECISIONS.md'));
  if (!content) return [];
  return (content.match(/^##\s+.+$/gm) || []).slice(0, n).map((l) => l.replace(/^##\s+/, ''));
}
