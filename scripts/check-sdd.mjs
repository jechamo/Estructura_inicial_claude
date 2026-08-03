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
import { join, relative, resolve, dirname } from 'node:path';
import { createHash } from 'node:crypto';

const ROOT = process.cwd();
const args = process.argv.slice(2);
const STRICT = args.includes('--strict');
const VIRGIN = args.includes('--virgin');
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

function parseJsonc(texto) {
  return JSON.parse(texto
    .replace(/^\s*\/\/.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/,(\s*[}\]])/g, '$1'));
}

function primerId(texto, patron) {
  return String(texto || '').match(patron)?.[1] || null;
}

function cadenaTrazable(linea) {
  const cadena = {
    objetivo: primerId(linea, /\b(OBJ-\d{3})\b/),
    requisitoProducto: primerId(linea, /\b(PRD-RF-\d{3})\b/),
    caso: primerId(linea, /\b(UC-\d{3})\b/),
    requisitoSpec: primerId(linea, /(?:^|[^\w-])(RF-\d+)\b/),
    criterio: primerId(linea, /\b(CA-\d+)\b/),
  };
  return Object.values(cadena).every(Boolean) ? cadena : null;
}

function tieneTestConcreto(texto) {
  const valor = String(texto || '').match(/Test que la define\**:\s*([^\n]+)/i)?.[1]?.trim();
  if (!valor || /^(?:`?<|pendiente|por definir|ningun[oa]|n\/?a|no aplica|[-—…])/i.test(valor)) return false;
  return !/<[^>\n]+>/.test(valor);
}

function tieneResultadoConcreto(texto) {
  return /[🟢🔴✅❌]|\b(?:pass(?:ed)?|verde|rojo|fall[óa]|error esperado|no ejecutado|bloquead[oa]|\d+\/\d+)\b/i
    .test(String(texto || ''));
}

function coincideCadena(texto, cadena, { conTarea = false, conTest = false, conResultado = false } = {}) {
  const contiene = Object.values(cadena).every((id) => String(texto || '').includes(id));
  return contiene && (!conTarea || /\bT-\d{3}-\d+\b/.test(texto)) &&
    (!conTest || tieneTestConcreto(texto)) && (!conResultado || tieneResultadoConcreto(texto));
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

  const delegadores = new Set(['orchestrator', 'planner', 'implementer']);
  const puedeDelegar = /(^|,\s*)Agent(\s*,|$)/.test(fm.tools || '');
  if (puedeDelegar && !delegadores.has(fm.name))
    err('delegacion/permiso', `${f}: '${fm.name}' puede delegar y no está en la lista de coordinadores`);
  if (delegadores.has(fm.name) && !puedeDelegar)
    err('delegacion/permiso', `${f}: '${fm.name}' debe disponer de Agent para cumplir su handoff`);
  if (!/^### HANDOFF\s*$/m.test(t))
    err('handoff/ausente', `${f}: el perfil no cierra con un bloque ### HANDOFF`);
}

// Los envoltorios de otras superficies deben apuntar a un perfil que exista.
const envueltos = { '.github/agents': new Set(), '.cursor/agents': new Set(), '.codex/agents': new Set() };
for (const [dir, filtro] of [['.github/agents', (n) => n.endsWith('.agent.md')], ['.cursor/agents', (n) => n.endsWith('.md')]]) {
  for (const p of walk(join(ROOT, dir), filtro)) {
    const t = leer(p) || '';
    const nombre = (t.match(/^name:\s*(.+)$/m) || [])[1]?.trim() || p.split(/[/\\]/).pop().replace(/\.(agent\.)?md$/, '');
    if (nombre === 'README') continue;
    if (!nombresAgentes.has(nombre))
      err('deriva/envoltorio', `${rel(p)}: '${nombre}' no tiene perfil canónico en .claude/agents/`);
    else envueltos[dir].add(nombre);
    if (!/\.claude\/agents\//.test(t))
      warn('deriva/envoltorio', `${rel(p)}: no referencia su perfil canónico; puede derivar`);
  }
}

// Codex usa TOML por proyecto. El adaptador es deliberadamente fino: registra el agente
// y remite al perfil canónico en vez de copiar sus instrucciones y crear una tercera versión.
const codexDir = join(ROOT, '.codex/agents');
const auditoresSoloLectura = new Set(['orchestrator', 'code-reviewer', 'security-auditor', 'research-analyst']);
for (const p of walk(codexDir, (n) => n.endsWith('.toml'))) {
  const t = leer(p) || '';
  const nombre = (t.match(/^name\s*=\s*"([^"]+)"\s*$/m) || [])[1];
  const descripcion = (t.match(/^description\s*=\s*"([^"]+)"\s*$/m) || [])[1];
  const instrucciones = /^developer_instructions\s*=\s*"""[\s\S]+?^"""\s*$/m.test(t);

  if (!nombre) {
    err('codex/name', `${rel(p)}: falta 'name'`);
    continue;
  }
  if (!descripcion) err('codex/description', `${rel(p)}: falta 'description'`);
  if (!instrucciones) err('codex/instructions', `${rel(p)}: falta 'developer_instructions' multilínea`);
  if (!nombresAgentes.has(nombre))
    err('deriva/envoltorio', `${rel(p)}: '${nombre}' no tiene perfil canónico en .claude/agents/`);
  else envueltos['.codex/agents'].add(nombre);
  if (!new RegExp(`\\.claude/agents/${nombre}\\.md`).test(t))
    warn('deriva/envoltorio', `${rel(p)}: no referencia su perfil canónico; puede derivar`);
  if (auditoresSoloLectura.has(nombre) && !/^sandbox_mode\s*=\s*"read-only"\s*$/m.test(t))
    err('codex/sandbox', `${rel(p)}: el auditor '${nombre}' debe usar sandbox_mode = "read-only"`);
}

if (existsSync(codexDir)) {
  const codexConfig = leer(join(ROOT, '.codex/config.toml')) || '';
  if (!/^\[agents\]\s*$/m.test(codexConfig) || !/^enabled\s*=\s*true\s*$/m.test(codexConfig))
    err('codex/config', `.codex/config.toml debe habilitar los agentes del proyecto`);
}

// Paridad de superficies. Importa porque `.vscode/settings.json` desactiva la lectura de
// `.claude/agents/` para que VS Code no muestre cada agente por duplicado: a partir de ahí,
// un agente sin envoltorio simplemente NO EXISTE en VS Code. En Cursor y Codex el fichero es
// la identidad del subagente, así que sin él no se le puede delegar.
for (const [dir, cuantos] of Object.entries(envueltos)) {
  if (!cuantos.size) continue; // superficie no usada en este repo: no se exige
  const faltan = [...nombresAgentes].filter((a) => !cuantos.has(a)).sort();
  if (faltan.length)
    err('superficie/incompleta', `${dir}: faltan ${faltan.length} agente(s), invisibles en esa superficie: ${faltan.join(', ')}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 1 bis · Skills: el nombre declarado manda sobre la carpeta
//
// Una skill se invoca por su `name`, no por el nombre del directorio. Si divergen,
// el comando que documentas no es el que existe.
// ─────────────────────────────────────────────────────────────────────────────
const SKILLS_DIR = join(ROOT, '.agents/skills');
const SKILL_FM_PERMITIDO = new Set([
  'name', 'description', 'license', 'allowed-tools', 'metadata', 'compatibility',
]);
for (const d of dirs(SKILLS_DIR)) {
  const t = leer(join(SKILLS_DIR, d, 'SKILL.md'));
  if (t === null) {
    err('skill/estructura', `.agents/skills/${d}/: falta SKILL.md`);
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
  else if (!/^[a-z0-9-]+$/.test(nombre) || nombre.startsWith('-') || nombre.endsWith('-') || nombre.includes('--') || nombre.length > 64)
    err('skill/name', `${d}/SKILL.md: name '${nombre}' no cumple kebab-case ni el máximo de 64 caracteres`);
  const descripcionRaw = (fm.match(/^description:\s*(.+)$/m) || [])[1]?.trim() || '';
  const descripcion = descripcionRaw.replace(/^(?:"([\s\S]*)"|'([\s\S]*)')$/, '$1$2');
  if (!descripcion)
    err('skill/description', `${d}/SKILL.md: falta 'description' — sin ella el modelo no sabe cuándo usarla`);
  else {
    if (!/^["']/.test(descripcionRaw) && /:\s/.test(descripcionRaw))
      err('skill/frontmatter', `${d}/SKILL.md: description con ':' debe ir entre comillas para ser YAML válido`);
    if (descripcion.includes('<') || descripcion.includes('>'))
      err('skill/description', `${d}/SKILL.md: description no puede contener '<' ni '>'`);
    if (descripcion.length > 1024)
      err('skill/description', `${d}/SKILL.md: description supera 1024 caracteres`);
  }
  const claves = [...fm.matchAll(/^([a-zA-Z][\w-]*):/gm)].map((m) => m[1]);
  const noPortables = claves.filter((clave) => !SKILL_FM_PERMITIDO.has(clave));
  if (noPortables.length)
    err('skill/frontmatter', `${d}/SKILL.md: claves no portables: ${[...new Set(noPortables)].sort().join(', ')}`);
  if (t.split(/\r?\n/).length > 500)
    warn('skill/progressive-disclosure', `${d}/SKILL.md supera 500 líneas; mueve detalle a references/`);
}

const skillsCanonicas = dirs(SKILLS_DIR);
const skillsClaude = dirs(join(ROOT, '.claude/skills'));
if (nombresAgentes.size !== 20)
  err('paridad/agentes', `se esperaban 20 agentes canónicos y hay ${nombresAgentes.size}`);
if (skillsCanonicas.length !== 24)
  err('paridad/skills', `se esperaban 24 skills canónicas y hay ${skillsCanonicas.length}`);
const adaptersFaltantes = skillsCanonicas.filter((skill) => !skillsClaude.includes(skill));
if (adaptersFaltantes.length)
  err('paridad/skills', `.claude/skills no adapta: ${adaptersFaltantes.join(', ')}`);
for (const skill of skillsCanonicas.filter((nombre) => skillsClaude.includes(nombre))) {
  const adapter = leer(join(ROOT, '.claude/skills', skill, 'SKILL.md')) || '';
  if (!adapter.includes(`.agents/skills/${skill}/SKILL.md`))
    err('paridad/skills', `.claude/skills/${skill}/SKILL.md no referencia la fuente canónica portable`);
}

// Una skill ya aparece como comando `/` en los hosts compatibles. Mantener además un
// prompt/command homónimo produce dos entradas visibles con contratos que pueden divergir.
function nombresDeFicheros(dir, sufijo) {
  try {
    return readdirSync(dir, { withFileTypes: true })
      .filter((entrada) => entrada.isFile() && entrada.name.endsWith(sufijo))
      .map((entrada) => entrada.name.slice(0, -sufijo.length))
      .sort();
  } catch {
    return [];
  }
}

const comandosPorHost = [
  ['.github/prompts', nombresDeFicheros(join(ROOT, '.github/prompts'), '.prompt.md')],
  ['.cursor/commands', nombresDeFicheros(join(ROOT, '.cursor/commands'), '.md')],
];
for (const [superficie, nombres] of comandosPorHost) {
  const duplicados = nombres.filter((nombre) => skillsCanonicas.includes(nombre));
  if (duplicados.length)
    err('superficie/comando-duplicado', `${superficie} duplica skills canónicas: ${duplicados.join(', ')}`);
}

const vscodeSettingsRaw = leer(join(ROOT, '.vscode/settings.json'));
if (vscodeSettingsRaw) {
  try {
    const settings = parseJsonc(vscodeSettingsRaw);
    const esperadas = [
      ['chat.agentFilesLocations', '.github/agents', true],
      ['chat.agentFilesLocations', '.claude/agents', false],
      ['chat.agentSkillsLocations', '.agents/skills', true],
      ['chat.agentSkillsLocations', '.claude/skills', false],
      ['chat.hookFilesLocations', '.github/hooks', true],
      ['chat.hookFilesLocations', '.claude/settings.json', false],
    ];
    for (const [grupo, ruta, valor] of esperadas)
      if (settings[grupo]?.[ruta] !== valor)
        err('superficie/vscode-duplicada', `.vscode/settings.json debe fijar ${grupo}.${ruta} = ${valor}`);
  } catch (error) {
    err('superficie/vscode-json', `.vscode/settings.json no es JSONC vÃ¡lido: ${error.message}`);
  }
}

const contratoIntake = [
  '.agents/skills/sdd-intake/SKILL.md',
  '.claude/skills/sdd-intake/SKILL.md',
  'docs/product/PRD.md',
  'docs/product/USE-CASES.md',
  'docs/product/FEATURE-MAP.md',
  'docs/product/SOURCES.md',
];
for (const ruta of contratoIntake) {
  if (!existsSync(join(ROOT, ruta))) err('intake/estructura', `falta ${ruta}`);
}
for (const ruta of [
  '.claude/agents/orchestrator.md', '.claude/agents/spec-analyst.md', '.claude/agents/ux-designer.md',
  '.github/agents/orchestrator.agent.md', '.cursor/agents/orchestrator.md', '.codex/agents/orchestrator.toml',
  '.agents/workflows/sdd-proyecto-nuevo.md', '.agents/workflows/sdd-nueva-funcionalidad.md',
]) {
  if (!/sdd-intake|\bintake\b/i.test(leer(join(ROOT, ruta)) || ''))
    err('intake/routing', `${ruta} no reconoce la fase intake`);
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
    if (!['audit', 'deny', 'ask', 'off'].includes(cfg.modo))
      err('territorios/modo', `modo '${cfg.modo}' no válido (deny | ask | off)`);
    if (cfg.modo === 'off')
      warn('territorios/modo', 'el reparto de territorios está desactivado: nadie impide que un agente escriba fuera de su terreno');

    for (const a of cfg.coordinadores || [])
      if (!nombresAgentes.has(a)) err('territorios/agente', `coordinador '${a}' no existe en .claude/agents/`);

    const conDueño = new Set();
    const territorios = Array.isArray(cfg.territories)
      ? cfg.territories.map((t, i) => [t.name || `territory-${i + 1}`, { duenos: [t.agent], patrones: t.paths }])
      : Object.entries(cfg.territorios || {});
    for (const [nombre, t] of territorios) {
      if (!Array.isArray(t.duenos) || !t.duenos.length)
        err('territorios/duenos', `territorio '${nombre}' sin dueños: no protege nada`);
      for (const a of t.duenos || []) {
        if (!nombresAgentes.has(a)) err('territorios/agente', `'${a}' (dueño de '${nombre}') no existe en .claude/agents/`);
        conDueño.add(a);
      }
      if (!Array.isArray(t.patrones) || !t.patrones.length)
        err('territorios/patrones', `territorio '${nombre}' sin patrones`);
    }

    // Antes de activar ask/deny, /onboard debe gobernar a todos los agentes que escriben.
    if (['ask', 'deny'].includes(cfg.modo)) {
      const AUDITORES = new Set(['code-reviewer', 'security-auditor', 'research-analyst', 'orchestrator']);
      for (const a of nombresAgentes) {
        if (conDueño.has(a) || (cfg.coordinadores || []).includes(a) || AUDITORES.has(a)) continue;
        warn('territorios/huerfano', `'${a}' no es dueño de ningún territorio ni coordinador: puede escribir en cualquier sitio no reclamado`);
      }
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
        const m = String(h.command || '').match(/\.sdd\/hooks\/([\w-]+\.mjs)/);
        if (m && !existsSync(join(ROOT, '.sdd/hooks', m[1])))
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
let contratoProducto = null;
try {
  const registro = JSON.parse(leer(join(ROOT, '.sdd/installed.json')) || 'null');
  if (registro?.product?.status === 'approved') contratoProducto = registro.product;
} catch {
  // El error de JSON se informa una sola vez en la seccion de instalacion.
}
const idsProducto = {
  objetivos: new Set([...(leer(join(ROOT, 'docs/product/PRD.md')) || '').matchAll(/\bOBJ-\d{3}\b/g)].map((m) => m[0])),
  requisitos: new Set([...(leer(join(ROOT, 'docs/product/PRD.md')) || '').matchAll(/\bPRD-RF-\d{3}\b/g)].map((m) => m[0])),
  casos: new Set([...(leer(join(ROOT, 'docs/product/USE-CASES.md')) || '').matchAll(/\bUC-\d{3}\b/g)].map((m) => m[0])),
};
const filasFeatureProducto = (leer(join(ROOT, 'docs/product/FEATURE-MAP.md')) || '')
  .split('\n').filter((linea) => /^\|\s*FEAT-\d{3}\s*\|/.test(linea));

let tareasHechas = 0;

for (const s of specs) {
  const dir = join(SPECS, s);
  const spec = leer(join(dir, 'spec.md'));
  if (!spec) {
    err('spec/estructura', `${s}: falta spec.md`);
    continue;
  }

  const numeroSpec = Number((s.match(/^(\d{3})-/) || [])[1]);
  let referenciasProductoSpec = null;
  if (contratoProducto && Number.isFinite(numeroSpec) && numeroSpec >= contratoProducto.enforceFromSpec) {
    referenciasProductoSpec = {
      objetivos: new Set([...spec.matchAll(/\bOBJ-\d{3}\b/g)].map((m) => m[0])),
      requisitos: new Set([...spec.matchAll(/\bPRD-RF-\d{3}\b/g)].map((m) => m[0])),
      casos: new Set([...spec.matchAll(/\bUC-\d{3}\b/g)].map((m) => m[0])),
    };
    for (const [tipo, conjunto] of Object.entries(referenciasProductoSpec)) {
      if (!conjunto.size) {
        const mensaje = `${s}: falta trazabilidad de producto (${tipo})`;
        STRICT ? err('producto/trazabilidad', mensaje) : warn('producto/trazabilidad', mensaje);
      }
      const huerfanos = [...conjunto].filter((id) => !idsProducto[tipo].has(id));
      if (huerfanos.length) {
        const mensaje = `${s}: referencias de producto huerfanas: ${huerfanos.join(', ')}`;
        STRICT ? err('producto/trazabilidad', mensaje) : warn('producto/trazabilidad', mensaje);
      }
    }
    const cadenasSpec = spec.split('\n').map(cadenaTrazable).filter(Boolean);
    if (!cadenasSpec.length) {
      const mensaje = `${s}: ninguna fila enlaza OBJ → PRD-RF → UC → RF → CA`;
      STRICT ? err('producto/cadena-spec', mensaje) : warn('producto/cadena-spec', mensaje);
    }
    for (const [tipo, campo] of [['objetivos', 'objetivo'], ['requisitos', 'requisitoProducto'], ['casos', 'caso']]) {
      const fueraDeCadena = [...referenciasProductoSpec[tipo]]
        .filter((id) => !cadenasSpec.some((cadena) => cadena[campo] === id));
      if (fueraDeCadena.length) {
        const mensaje = `${s}: referencias fuera de una cadena completa: ${fueraDeCadena.join(', ')}`;
        STRICT ? err('producto/cadena-spec', mensaje) : warn('producto/cadena-spec', mensaje);
      }
    }
    const requisitosLocales = new Set([...spec.matchAll(/(?<!PRD-)\bRF-\d+\b/g)].map((m) => m[0]));
    const criteriosLocales = new Set([...spec.matchAll(/\bCA-\d+\b/g)].map((m) => m[0]));
    for (const [nombre, conjunto, campo] of [
      ['RF', requisitosLocales, 'requisitoSpec'],
      ['CA', criteriosLocales, 'criterio'],
    ]) {
      const fueraDeCadena = [...conjunto].filter((id) => !cadenasSpec.some((cadena) => cadena[campo] === id));
      if (fueraDeCadena.length) {
        const mensaje = `${s}: ${nombre} sin cadena completa de producto: ${fueraDeCadena.join(', ')}`;
        STRICT ? err('producto/cadena-spec', mensaje) : warn('producto/cadena-spec', mensaje);
      }
    }
    for (const cadena of cadenasSpec) {
      if (!filasFeatureProducto.some((fila) =>
        fila.includes(cadena.objetivo) && fila.includes(cadena.requisitoProducto) && fila.includes(cadena.caso))) {
        const mensaje = `${s}: la cadena ${cadena.objetivo}/${cadena.requisitoProducto}/${cadena.caso} no existe unida en FEATURE-MAP.md`;
        STRICT ? err('producto/cadena-feature', mensaje) : warn('producto/cadena-feature', mensaje);
      }
    }
    referenciasProductoSpec.cadenas = cadenasSpec;
  }

  // 3.1 · La spec no avanza con ambigüedades sin resolver
  const marcadores = (spec.match(/\[NEEDS CLARIFICATION/g) || []).length;
  const tienePlan = existsSync(join(dir, 'plan.md'));
  if (marcadores && tienePlan)
    err('spec/clarify', `${s}: ${marcadores} marcador(es) [NEEDS CLARIFICATION] y ya existe plan.md — se planificó sobre ambigüedad`);

  // 3.1 bis · El diseño tampoco avanza con ambigüedades sin resolver
  const design = leer(join(dir, 'design.md'));
  if (design) {
    const sinUi = /no aplica|sin interfaz gr[áa]fica|dise[ñn]o se salta/i.test(design);
    const marcadoresDiseño = (design.match(/\[NEEDS CLARIFICATION/g) || []).length;
    if (marcadoresDiseño && tienePlan)
      err(
        'design/clarify',
        `${s}: ${marcadoresDiseño} marcador(es) [NEEDS CLARIFICATION] en design.md y ya existe plan.md`,
      );

    // Los gates visuales no aplican a CLI, jobs o migraciones cuya omisión esté declarada.
    if (!sinUi) {
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
  if (referenciasProductoSpec) {
    const noPropagadas = Object.entries(referenciasProductoSpec).filter(([tipo]) => tipo !== 'cadenas')
      .map(([, conjunto]) => conjunto)
      .flatMap((conjunto) => [...conjunto].filter((id) => !tasks.includes(id)));
    if (noPropagadas.length) {
      const mensaje = `${s}: tasks.md no propaga la trazabilidad de producto: ${noPropagadas.join(', ')}`;
      STRICT ? err('producto/tareas', mensaje) : warn('producto/tareas', mensaje);
    }
    const bloquesTarea = tasks.split(/^### /m).slice(1);
    for (const cadena of referenciasProductoSpec.cadenas || []) {
      if (!bloquesTarea.some((bloque) => coincideCadena(bloque, cadena, { conTarea: true, conTest: true }))) {
        const mensaje = `${s}: ninguna tarea enlaza completa la cadena de ${cadena.requisitoProducto}/${cadena.criterio} con su test`;
        STRICT ? err('producto/cadena-tarea', mensaje) : warn('producto/cadena-tarea', mensaje);
      }
    }
  }

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
      const ejecucionDirecta = evidence.split('\n').some(
        (linea) => linea.includes(id) && /\bdeclared-direct\b/i.test(linea),
      );
      const ejecucionNoVerificada = evidence.split('\n').some(
        (linea) => linea.includes(id) && /\bunverified\b/i.test(linea) &&
          /motivo|no observad|sin hooks?|no expone|limitaci[oó]n|porque/i.test(linea),
      );
      if (!hayEventos && !ejecucionDirecta && !ejecucionNoVerificada)
        err(
          'tarea/ejecucion',
          `${s}/${id}: marcada hecho sin evento observado, declared-direct ni unverified con motivo para la tarea`,
        );
      if (referenciasProductoSpec) {
        const cadenasDeTarea = (referenciasProductoSpec.cadenas || []).filter((cadena) => coincideCadena(b, cadena));
        for (const cadena of cadenasDeTarea) {
          const filaEvidencia = evidence.split('\n').some((linea) =>
            linea.includes(id) && coincideCadena(linea, cadena, { conResultado: true }));
          if (!filaEvidencia)
            err('producto/cadena-evidencia', `${s}/${id}: evidence.md no enlaza la tarea con ${cadena.objetivo} → ${cadena.criterio}`);
        }
      }
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
// Una plantilla instalada hace un año y nunca actualizada es deuda silenciosa.
const instalado = leer(join(ROOT, '.sdd/installed.json'));
if (instalado) {
  try {
    const reg = JSON.parse(instalado);
    const product = reg.product || {
      schemaVersion: 1,
      status: reg.mode === 'greenfield' ? 'bootstrap' : 'legacy-pending',
      approvedAt: null,
      approvedBy: null,
      enforceFromSpec: null,
      hashes: {},
    };
    if (product.schemaVersion !== 1 || !['bootstrap', 'legacy-pending', 'approved'].includes(product.status))
      err('producto/estado', 'el contrato product de .sdd/installed.json no tiene una version o estado validos');
    else if (product.status === 'legacy-pending')
      warn('producto/legacy-pending', 'el proyecto conserva su contexto, pero debe ejecutar /sdd-intake antes de exigir trazabilidad de producto nueva');
    else if (product.status === 'bootstrap') {
      const mensaje = 'el baseline de producto aun no esta aprobado; el siguiente paso es /sdd-intake';
      if (STRICT && specs.length) err('producto/bootstrap', `${mensaje}; no puede haber specs activas en un greenfield bootstrap`);
      else warn('producto/bootstrap', mensaje);
    }
    else {
      if (!product.approvedAt || !product.approvedBy || !Number.isInteger(product.enforceFromSpec))
        err('producto/aprobacion', 'un producto approved necesita fecha, persona y enforceFromSpec');
      const drift = [];
      for (const ruta of contratoIntake.slice(2)) {
        const contenido = leer(join(ROOT, ruta));
        const esperado = product.hashes?.[ruta];
        const actual = contenido === null ? null : createHash('sha256').update(contenido).digest('hex').slice(0, 16);
        if (!esperado || actual !== esperado) drift.push(ruta);
      }
      if (drift.length) {
        const mensaje = `baseline de producto aprobado con drift/hash distinto: ${drift.join(', ')}`;
        if (STRICT) err('producto/drift', mensaje);
        else warn('producto/drift', mensaje);
      }
    }
    const modificados = Object.entries(reg.ficheros || {}).filter(([r, h]) => {
      const t = leer(join(ROOT, r));
      return t !== null && h !== createHash('sha256').update(t).digest('hex').slice(0, 16);
    });
    if (modificados.length)
      warn('instalacion/local', `${modificados.length} fichero(s) de la plantilla modificados en local: 'sdd update' no los tocará`);
  } catch (e) {
    err('instalacion/json', `.sdd/installed.json no es JSON válido: ${e.message}`);
  }
}

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
// 5 · Invariantes de una instalación virgen
// ─────────────────────────────────────────────────────────────────────────────
if (VIRGIN) {
  const changelog = leer(join(ROOT, 'CHANGELOG.md')) || '';
  if (!/## \[Unreleased\]/.test(changelog) || /^## \[(?!Unreleased\])/m.test(changelog))
    err('virgin/changelog', 'CHANGELOG.md debe contener solo [Unreleased], sin versiones');

  const decisiones = leer(join(ROOT, 'docs/bitacora/DECISIONS.md')) || '';
  if (!/decisiones:insertar-aqui/.test(decisiones) || /^## \d{4}-\d{2}-\d{2}/m.test(decisiones))
    err('virgin/bitacora', 'DECISIONS.md contiene decisiones heredadas o no tiene marcador');

  if ((leer(join(ROOT, '.sdd/agent-audit.jsonl')) || '').length)
    err('virgin/auditoria', '.sdd/agent-audit.jsonl no está vacío');

  const gruposVacios = [
    ['docs/bitacora/sessions', () => false],
    ['docs/quality/reports', () => false],
    ['docs/security/reports', () => false],
    ['docs/specs', (n) => n === '_TEMPLATE'],
    ['docs/architecture/adr', (n) => n === '_TEMPLATE.md'],
  ];
  for (const [ruta, permitida] of gruposVacios) {
    const extras = existsSync(join(ROOT, ruta))
      ? readdirSync(join(ROOT, ruta)).filter((n) => n !== '.gitkeep' && !permitida(n))
      : [];
    if (extras.length) err('virgin/historia', `${ruta} contiene historia: ${extras.join(', ')}`);
  }

  if (walk(join(ROOT, 'docs/specs'), (n) => n === 'execution-log.jsonl').length)
    err('virgin/execution-log', 'no debe existir execution-log.jsonl antes de la primera ejecución');

  try {
    const externas = JSON.parse(leer(join(ROOT, '.sdd/external-skills.json')) || '{}');
    const entries = externas.entries;
    const validas = Array.isArray(entries) && entries.every((entrada) =>
      entrada.status === 'approved-vendored' &&
      /^[0-9a-f]{40}$/.test(entrada.commit || '') &&
      entrada.license && entrada.path && existsSync(join(ROOT, entrada.path))
    );
    if (!validas)
      err('virgin/skills-externas', 'solo se permiten skills base vendorizadas, aprobadas, licenciadas y fijadas a commit');
  } catch (error) {
    err('virgin/skills-externas', `.sdd/external-skills.json inválido: ${error.message}`);
  }

  try {
    const mapa = JSON.parse(leer(join(ROOT, '.sdd/territories.json')) || '{}');
    if (mapa.modo !== 'audit' || /src\/|supabase|prisma|\.tsx|\.sql/i.test(JSON.stringify(mapa)))
      err('virgin/territorios', 'los territorios deben estar en audit y sin rutas de aplicación asumidas');
  } catch (error) {
    err('virgin/territorios', `.sdd/territories.json inválido: ${error.message}`);
  }

  for (const ruta of ['.mcp.json', '.vscode/mcp.json', '.agents/mcp_config.json'])
    if (existsSync(join(ROOT, ruta))) err('virgin/mcp', `${ruta} no debe activarse por defecto`);

  const ci = leer(join(ROOT, '.github/workflows/sdd-gates.yml')) || '';
  if (!ci || /npm ci|npm run|pytest|gradle|mvn /i.test(ci))
    err('virgin/ci', 'el CI universal ejecuta comandos de un stack no configurado');

  const contaminacion = /001-agentes-codex|Estructura_inicial_claude|2026-0[78]-/;
  for (const ruta of ['README.md', 'CHANGELOG.md', 'docs/README.md', 'docs/bitacora/DECISIONS.md']) {
    if (contaminacion.test(leer(join(ROOT, ruta)) || ''))
      err('virgin/contaminacion', `${ruta} contiene contexto de la plantilla`);
  }

  for (const ruta of ['README.md', 'docs/README.md']) {
    const absoluta = join(ROOT, ruta);
    const contenido = leer(absoluta) || '';
    for (const match of contenido.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
      const enlace = match[1].trim().replace(/^<|>$/g, '').split('#')[0].split('?')[0];
      if (!enlace || /^(?:https?:|mailto:|#|\/)/i.test(enlace)) continue;
      let decodificado = enlace;
      try { decodificado = decodeURIComponent(enlace); } catch { /* se comprobará tal cual */ }
      if (!existsSync(resolve(dirname(absoluta), decodificado)))
        err('virgin/enlace', `${ruta}: el enlace interno '${enlace}' no existe`);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Informe
// ─────────────────────────────────────────────────────────────────────────────
const modo = VIRGIN ? 'virgen' : STRICT ? 'estricto' : 'normal';
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
