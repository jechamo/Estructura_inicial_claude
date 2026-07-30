#!/usr/bin/env node
/**
 * check-sdd — validador determinista del circuito SDD.
 *
 * Existe porque la Definition of Done la marcaba el propio modelo. Una casilla que
 * marca quien tiene que ser evaluado no es un gate: es una declaración de intenciones.
 * Esto lo comprueba desde fuera, contra el sistema de ficheros.
 *
 *   node scripts/check-sdd.mjs            → estructura y coherencia (avisa)
 *   node scripts/check-sdd.mjs --strict   → además exige evidencia y trazabilidad (falla)
 *   node scripts/check-sdd.mjs --spec 042 → limita el análisis a una spec
 *
 * Node >= 18, sin dependencias.
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const args = process.argv.slice(2);
const STRICT = args.includes('--strict');
const soloSpec = (args[args.indexOf('--spec') + 1] || '').replace(/^--.*/, '');

const problemas = [];
const avisos = [];
const err = (regla, msg) => problemas.push({ regla, msg });
const warn = (regla, msg) => avisos.push({ regla, msg });

const leer = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : null);
const rel = (p) => relative(ROOT, p).replace(/\\/g, '/');

function dirs(p) {
  try {
    return readdirSync(p, { withFileTypes: true })
      .filter((d) => d.isDirectory() && !d.name.startsWith('_') && !d.name.startsWith('.'))
      .map((d) => d.name)
      .sort();
  } catch {
    return [];
  }
}

function walk(dir, filtro, out = []) {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.git', 'dist', 'build', 'coverage'].includes(e.name)) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, filtro, out);
    else if (filtro(e.name)) out.push(p);
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1 · Ecosistema de agentes: frontmatter válido y sin deriva entre superficies
// ─────────────────────────────────────────────────────────────────────────────
const AGENTES_DIR = join(ROOT, '.claude/agents');
const nombresAgentes = new Set();

// El campo `tools` es un allowlist de NOMBRES de herramienta. El único scoping
// documentado es `Agent(tipo)`. `Bash(git status:*)` no se reconoce como `Bash`
// y deja al agente sin la herramienta: el scoping va en `permissions`.
const SCOPING_INVALIDO = /\b(?!Agent\()([A-Z][A-Za-z]*)\([^)]*\)/;

for (const f of existsSync(AGENTES_DIR) ? readdirSync(AGENTES_DIR).filter((x) => x.endsWith('.md')) : []) {
  const t = leer(join(AGENTES_DIR, f)) || '';
  const fin = t.indexOf('\n---', 4);
  if (!t.startsWith('---') || fin === -1) {
    err('agente/frontmatter', `${f}: sin frontmatter cerrado`);
    continue;
  }
  const fm = Object.fromEntries(
    t.slice(4, fin).split('\n').map((l) => l.match(/^([a-zA-Z][\w-]*):\s*(.*)$/)).filter(Boolean)
      .map((m) => [m[1], m[2].trim()]),
  );

  if (!fm.name) err('agente/name', `${f}: falta 'name'`);
  else {
    nombresAgentes.add(fm.name);
    if (fm.name !== f.replace('.md', '')) err('agente/name', `${f}: name '${fm.name}' no coincide con el fichero`);
  }
  if (!fm.description) err('agente/description', `${f}: falta 'description'`);
  if (fm.model && !['opus', 'sonnet', 'haiku', 'inherit'].includes(fm.model))
    err('agente/model', `${f}: model '${fm.model}' no válido`);
  if (fm.tools && SCOPING_INVALIDO.test(fm.tools))
    err('agente/tools', `${f}: 'tools' lleva especificadores — el scoping va en permissions de settings.json. Valor: ${fm.tools}`);
}

// Los envoltorios de otras superficies deben apuntar a un perfil que exista.
for (const [dir, filtro] of [['.github/agents', (n) => n.endsWith('.agent.md')], ['.cursor/agents', (n) => n.endsWith('.md')]]) {
  for (const p of walk(join(ROOT, dir), filtro)) {
    const t = leer(p) || '';
    const nombre = (t.match(/^name:\s*(.+)$/m) || [])[1]?.trim() || p.split(/[/\\]/).pop().replace(/\.(agent\.)?md$/, '');
    if (nombre === 'README') continue;
    if (!nombresAgentes.has(nombre))
      err('deriva/envoltorio', `${rel(p)}: '${nombre}' no tiene perfil canónico en .claude/agents/`);
    if (!/\.claude\/agents\//.test(t))
      warn('deriva/envoltorio', `${rel(p)}: no referencia su perfil canónico; puede derivar`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2 · Hooks referenciados en settings.json que existan de verdad
// ─────────────────────────────────────────────────────────────────────────────
const settings = leer(join(ROOT, '.claude/settings.json'));
if (settings) {
  let cfg;
  try {
    cfg = JSON.parse(settings);
  } catch (e) {
    err('settings/json', `.claude/settings.json no es JSON válido: ${e.message}`);
  }
  for (const grupos of Object.values(cfg?.hooks || {})) {
    for (const g of grupos) {
      for (const h of g.hooks || []) {
        const m = String(h.command || '').match(/\.claude\/hooks\/([\w-]+\.mjs)/);
        if (m && !existsSync(join(ROOT, '.claude/hooks', m[1])))
          err('hook/inexistente', `settings.json referencia ${m[1]}, que no existe`);
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3 · Specs: estructura, trazabilidad y evidencia
// ─────────────────────────────────────────────────────────────────────────────
const SPECS = join(ROOT, process.env.SDD_SPECS_DIR || 'docs/specs');
const specs = dirs(SPECS).filter((s) => !soloSpec || s.startsWith(soloSpec));
const ficherosTest = walk(ROOT, (n) => /\.(test|spec)\.[jt]sx?$/.test(n) || /^test_.*\.py$/.test(n));
const textoTests = ficherosTest.map((p) => leer(p) || '').join('\n');

let tareasHechas = 0;

for (const s of specs) {
  const dir = join(SPECS, s);
  const spec = leer(join(dir, 'spec.md'));
  if (!spec) {
    err('spec/estructura', `${s}: falta spec.md`);
    continue;
  }

  // 3.1 · La spec no avanza con ambigüedades sin resolver
  const marcadores = (spec.match(/\[NEEDS CLARIFICATION/g) || []).length;
  const tienePlan = existsSync(join(dir, 'plan.md'));
  if (marcadores && tienePlan)
    err('spec/clarify', `${s}: ${marcadores} marcador(es) [NEEDS CLARIFICATION] y ya existe plan.md — se planificó sobre ambigüedad`);

  const tasks = leer(join(dir, 'tasks.md'));
  if (tienePlan && !tasks) warn('spec/estructura', `${s}: hay plan.md pero no tasks.md`);
  if (!tasks) continue;

  // 3.2 · Todo criterio de aceptación necesita un test que lo referencie
  const criterios = [...spec.matchAll(/\bCA-(\d+)\b/g)].map((m) => `CA-${m[1]}`);
  const unicos = [...new Set(criterios)];
  const evidence = leer(join(dir, 'evidence.md')) || '';
  const testPlan = leer(join(dir, 'test-plan.md')) || '';
  for (const ca of unicos) {
    const enTests = textoTests.includes(ca);
    const enArtefactos = tasks.includes(ca) || evidence.includes(ca) || testPlan.includes(ca);
    if (!enTests && !enArtefactos) {
      const m = `${s}: ${ca} no aparece en ninguna tarea, test, plan de test ni evidencia`;
      STRICT ? err('trazabilidad/CA', m) : warn('trazabilidad/CA', m);
    }
  }

  // 3.3 · Tareas hechas: evidencia y ejecución registrada
  const bloques = tasks.split(/^### /m).slice(1);
  const log = leer(join(dir, 'execution-log.jsonl')) || '';
  const hayEventos = log.trim().length > 0;

  for (const b of bloques) {
    const id = (b.match(/^(T-[\w-]+)/) || [])[1];
    if (!id) continue;
    const estado = (b.match(/Estado\**:\s*\**\s*(\w[\w\s]*)/i) || [])[1]?.trim().toLowerCase() || '';
    if (!estado.startsWith('hecho')) continue;
    tareasHechas++;

    if (!/Test que la define|Cubre/i.test(b))
      err('tarea/trazabilidad', `${s}/${id}: marcada hecho sin test asociado ni criterio que cubra`);

    if (STRICT) {
      if (!evidence.includes(id))
        err('tarea/evidencia', `${s}/${id}: marcada hecho pero no aparece en evidence.md`);
      if (!hayEventos)
        err('tarea/ejecucion', `${s}/${id}: marcada hecho y execution-log.jsonl está vacío — ninguna ejecución registrada`);
    }
  }

  // 3.4 · Delegaciones no verificadas y decisión de entrega
  if (STRICT && evidence) {
    const sinVerificar = (evidence.match(/\bunverified\b/gi) || []).length;
    if (sinVerificar && !/no observad|limitaci[óo]n|motivo|porque/i.test(evidence))
      err('evidencia/unverified', `${s}: ${sinVerificar} delegación(es) 'unverified' sin justificación escrita`);

    if (!/##\s*3\.[\s\S]*?\|\s*\S/.test(evidence) && !/Controles NO ejecutados[\s\S]{0,400}\|\s*\w/i.test(evidence))
      warn('evidencia/no-ejecutado', `${s}: la sección de controles NO ejecutados está vacía. Si de verdad se ejecutó todo, dilo explícitamente`);
  }

  // 3.5 · El log de ejecución no se edita a mano
  for (const linea of log.split('\n').filter((l) => l.trim())) {
    try {
      JSON.parse(linea);
    } catch {
      err('log/formato', `${s}: execution-log.jsonl tiene una línea que no es JSON — ¿se editó a mano?`);
      break;
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4 · Higiene del repositorio
// ─────────────────────────────────────────────────────────────────────────────
if (!existsSync(join(ROOT, 'AGENTS.md'))) err('repo/AGENTS', 'falta AGENTS.md, la fuente de verdad');
if (existsSync(join(ROOT, '.env'))) err('repo/secretos', '.env está en el árbol de trabajo — comprueba que .gitignore lo excluye');

const gitignore = leer(join(ROOT, '.gitignore')) || '';
if (!/^\.env\s*$/m.test(gitignore)) err('repo/secretos', '.gitignore no excluye .env');

for (const p of walk(join(ROOT, 'docs/specs'), (n) => n.endsWith('.md'))) {
  const t = leer(p) || '';
  if (/\bsk-ant-[A-Za-z0-9_-]{20,}|ghp_[A-Za-z0-9]{30,}|AKIA[0-9A-Z]{16}/.test(t))
    err('repo/secretos', `${rel(p)}: contiene algo con forma de credencial real`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Informe
// ─────────────────────────────────────────────────────────────────────────────
const modo = STRICT ? 'estricto' : 'normal';
console.log(`check-sdd (${modo}) · ${specs.length} spec(s) · ${tareasHechas} tarea(s) hecha(s) · ${nombresAgentes.size} agente(s)\n`);

if (avisos.length) {
  console.log('Avisos:');
  for (const a of avisos) console.log(`  ~ [${a.regla}] ${a.msg}`);
  console.log('');
}

if (problemas.length) {
  console.log('Problemas:');
  for (const p of problemas) console.log(`  ✗ [${p.regla}] ${p.msg}`);
  console.log(`\n${problemas.length} problema(s). El circuito SDD no está en un estado entregable.`);
  process.exit(1);
}

console.log(
  STRICT
    ? '✅ Estricto: estructura, trazabilidad y evidencia verificadas.'
    : '✅ Estructura y coherencia correctas. Usa --strict antes de entregar.',
);
