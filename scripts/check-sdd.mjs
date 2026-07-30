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
// 1 bis · Skills: el nombre declarado manda sobre la carpeta
//
// Una skill se invoca por su `name`, no por el nombre del directorio. Si divergen,
// el comando que documentas no es el que existe.
// ─────────────────────────────────────────────────────────────────────────────
const SKILLS_DIR = join(ROOT, '.claude/skills');
for (const d of dirs(SKILLS_DIR)) {
  const t = leer(join(SKILLS_DIR, d, 'SKILL.md'));
  if (t === null) {
    err('skill/estructura', `.claude/skills/${d}/: falta SKILL.md`);
    continue;
  }
  const fin = t.indexOf('\n---', 4);
  if (!t.startsWith('---') || fin === -1) {
    err('skill/frontmatter', `${d}/SKILL.md: sin frontmatter cerrado`);
    continue;
  }
  const fm = t.slice(4, fin);
  const nombre = (fm.match(/^name:\s*(.+)$/m) || [])[1]?.trim();
  if (!nombre) err('skill/name', `${d}/SKILL.md: falta 'name'`);
  else if (nombre !== d) err('skill/name', `${d}/SKILL.md: name '${nombre}' no coincide con la carpeta`);
  if (!/^description:\s*\S/m.test(fm))
    err('skill/description', `${d}/SKILL.md: falta 'description' — sin ella el modelo no sabe cuándo usarla`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 1 ter · Mapa de territorios: quién puede escribir dónde
//
// Es lo que impide que un agente haga el trabajo de otro. Si nombra agentes que ya no
// existen, deja de proteger justo donde crees que protege.
// ─────────────────────────────────────────────────────────────────────────────
const territoriosRaw = leer(join(ROOT, '.sdd/territories.json'));
if (territoriosRaw) {
  let cfg;
  try {
    cfg = JSON.parse(territoriosRaw);
  } catch (e) {
    err('territorios/json', `.sdd/territories.json no es JSON válido: ${e.message}`);
  }

  if (cfg) {
    if (!['deny', 'ask', 'off'].includes(cfg.modo))
      err('territorios/modo', `modo '${cfg.modo}' no válido (deny | ask | off)`);
    if (cfg.modo === 'off')
      warn('territorios/modo', 'el reparto de territorios está desactivado: nadie impide que un agente escriba fuera de su terreno');

    for (const a of cfg.coordinadores || [])
      if (!nombresAgentes.has(a)) err('territorios/agente', `coordinador '${a}' no existe en .claude/agents/`);

    const conDueño = new Set();
    for (const [nombre, t] of Object.entries(cfg.territorios || {})) {
      if (!Array.isArray(t.duenos) || !t.duenos.length)
        err('territorios/duenos', `territorio '${nombre}' sin dueños: no protege nada`);
      for (const a of t.duenos || []) {
        if (!nombresAgentes.has(a)) err('territorios/agente', `'${a}' (dueño de '${nombre}') no existe en .claude/agents/`);
        conDueño.add(a);
      }
      if (!Array.isArray(t.patrones) || !t.patrones.length)
        err('territorios/patrones', `territorio '${nombre}' sin patrones`);
    }

    // Un agente que escribe y no aparece en ningún sitio no está gobernado por nadie.
    const AUDITORES = new Set(['code-reviewer', 'security-auditor', 'research-analyst', 'orchestrator']);
    for (const a of nombresAgentes) {
      if (conDueño.has(a) || (cfg.coordinadores || []).includes(a) || AUDITORES.has(a)) continue;
      warn('territorios/huerfano', `'${a}' no es dueño de ningún territorio ni coordinador: puede escribir en cualquier sitio no reclamado`);
    }
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

  // 3.1 bis · El diseño tampoco avanza con ambigüedades sin resolver
  const design = leer(join(dir, 'design.md'));
  if (design) {
    const marcadoresDiseño = (design.match(/\[NEEDS CLARIFICATION/g) || []).length;
    if (marcadoresDiseño && tienePlan)
      err(
        'design/clarify',
        `${s}: ${marcadoresDiseño} marcador(es) [NEEDS CLARIFICATION] en design.md y ya existe plan.md`,
      );

    // Los estados no felices son la mitad del diseño y son lo primero que se olvida.
    const faltan = ['vacío', 'cargando', 'error', 'sin permiso'].filter(
      (e) => !new RegExp(e.replace('í', '[íi]'), 'i').test(design),
    );
    if (faltan.length)
      warn('design/estados', `${s}: design.md no menciona estado(s): ${faltan.join(', ')}`);

    // Cumplir accesibilidad y estados es el suelo. Sin dirección visual declarada, el
    // resultado por defecto es el MVP genérico: correcto y sin carácter.
    const direccion = leer(join(ROOT, 'docs/design/DIRECCION-VISUAL.md'));
    const filaEstado = (direccion || '').match(/^\|\s*\*{0,2}Estado\*{0,2}\s*\|([^|]*)\|/im)?.[1] || '';
    // La plantilla ofrece las dos opciones en la misma celda ("borrador | aprobada"). Solo
    // cuenta como aprobada cuando se ha elegido: queda 'aprobada' y ya no queda 'borrador'.
    const aprobada = /aprobada/i.test(filaEstado) && !/borrador/i.test(filaEstado);

    if (!direccion) {
      warn('design/direccion', `${s}: hay design.md pero no existe docs/design/DIRECCION-VISUAL.md`);
    } else if (!aprobada) {
      const m = `${s}: la dirección visual sigue sin aprobar (docs/design/DIRECCION-VISUAL.md, campo Estado)`;
      STRICT ? err('design/direccion', m) : warn('design/direccion', m);
    }
    if (!/car[áa]cter/i.test(design))
      warn('design/caracter', `${s}: ninguna pantalla declara su elemento con carácter`);
  }

  // 3.1 ter · Prioridad: una spec sin prioridades es una lista de deseos
  if (/\bRF-\d+\b/.test(spec)) {
    const tienePrioridad =
      /\|\s*(M|S|C|W)\s*\|/.test(spec) || /\b(must|should|could|won't)\b/i.test(spec);
    if (!tienePrioridad)
      warn(
        'spec/prioridad',
        `${s}: hay requisitos pero ninguna prioridad MoSCoW. Sin prioridad no hay alcance negociable`,
      );
    else if (/Reparto MoSCoW/i.test(spec) && !/%/.test(spec))
      warn('spec/prioridad', `${s}: hay tabla de reparto MoSCoW sin porcentajes calculados`);
  }

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
const nSkills = dirs(SKILLS_DIR).length;
console.log(
  `check-sdd (${modo}) · ${specs.length} spec(s) · ${tareasHechas} tarea(s) hecha(s) · ` +
    `${nombresAgentes.size} agente(s) · ${nSkills} skill(s)\n`,
);

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
