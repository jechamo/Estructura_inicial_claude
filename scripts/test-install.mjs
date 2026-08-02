#!/usr/bin/env node
/**
 * test-install — pruebas del instalador sobre directorios temporales reales.
 *
 * Un instalador que pisa el trabajo de alguien se usa una vez. Estas pruebas existen para
 * que la promesa "nunca sobrescribo lo tuyo" sea verificable y no una intención.
 *
 *   node scripts/test-install.mjs
 *
 * Node >= 18, sin dependencias.
 */
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { join, dirname, resolve, parse } from 'node:path';
import { tmpdir, homedir } from 'node:os';
import { fileURLToPath } from 'node:url';

const ORIGEN = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const INSTALADOR = join(ORIGEN, 'scripts', 'install.mjs');
const VERSION = JSON.parse(readFileSync(join(ORIGEN, 'package.json'), 'utf8')).version;

let ok = 0;
const fallos = [];
const temporales = [];

function comprueba(titulo, condicion, detalle = '') {
  if (condicion) {
    ok++;
    console.log(`  ✓ ${titulo}`);
  } else {
    fallos.push(`${titulo}${detalle ? ` — ${detalle}` : ''}`);
    console.log(`  ✗ ${titulo}${detalle ? ` — ${detalle}` : ''}`);
  }
}

function nuevoDestino() {
  const d = mkdtempSync(join(tmpdir(), 'sdd-test-'));
  temporales.push(d);
  return d;
}

function sdd(destino, ...argumentos) {
  return spawnSync(process.execPath, [INSTALADOR, ...argumentos], {
    cwd: destino,
    encoding: 'utf8',
  });
}

function sddDesde(origenTrabajo, ...argumentos) {
  return spawnSync(process.execPath, [INSTALADOR, ...argumentos], {
    cwd: origenTrabajo,
    encoding: 'utf8',
  });
}

const leer = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : null);

function ficherosTexto(raiz, relativa = '') {
  const actual = join(raiz, relativa);
  return readdirSync(actual, { withFileTypes: true }).flatMap((entrada) => {
    const siguiente = join(relativa, entrada.name);
    if (entrada.isDirectory()) {
      if (['.git', 'node_modules'].includes(entrada.name)) return [];
      return ficherosTexto(raiz, siguiente);
    }
    return /\.(?:md|mdc|json|jsonl|toml|mjs|ya?ml)$/i.test(entrada.name) ? [siguiente] : [];
  });
}

// ─── 1 · Instalación limpia ──────────────────────────────────────────────────
console.log('\n1 · init sobre un directorio vacío');
{
  const d = nuevoDestino();
  const r = sdd(d, 'init');

  comprueba('termina sin error', r.status === 0, r.stderr?.slice(0, 120));
  comprueba('instala AGENTS.md', existsSync(join(d, 'AGENTS.md')));
  comprueba('instala los agentes', existsSync(join(d, '.claude/agents/implementer.md')));
  comprueba('instala las skills canónicas portables', existsSync(join(d, '.agents/skills/middle/SKILL.md')));
  comprueba('instala los adaptadores de skill de Claude', existsSync(join(d, '.claude/skills/middle/SKILL.md')));
  comprueba('instala skill-creator completa y con licencia',
    existsSync(join(d, '.agents/skills/skill-creator/scripts/quick_validate.py')) &&
    existsSync(join(d, '.agents/skills/skill-creator/LICENSE.txt')));
  comprueba('adapta skill-creator para Claude sin duplicar la implementación',
    (leer(join(d, '.claude/skills/skill-creator/SKILL.md')) || '').includes('.agents/skills/skill-creator/SKILL.md'));
  comprueba('instala los hooks compartidos', existsSync(join(d, '.sdd/hooks/guard-write.mjs')));
  comprueba('instala los territorios', existsSync(join(d, '.sdd/territories.json')));
  comprueba('instala las superficies de Cursor', existsSync(join(d, '.cursor/agents/backend-expert.md')));
  comprueba('instala las de VS Code', existsSync(join(d, '.github/agents/planner.agent.md')));
  comprueba('instala la configuración de Codex', existsSync(join(d, '.codex/config.toml')));
  comprueba('instala los agentes de Codex', existsSync(join(d, '.codex/agents/implementer.toml')));
  comprueba('instala los hooks de Codex', existsSync(join(d, '.codex/hooks.json')));
  comprueba('instala los hooks de Copilot', existsSync(join(d, '.github/hooks/sdd.json')));
  comprueba('instala los 20 agentes de Codex',
    existsSync(join(d, '.codex/agents')) && readdirSync(join(d, '.codex/agents')).filter((f) => f.endsWith('.toml')).length === 20);
  comprueba('crea docs/specs', existsSync(join(d, 'docs/specs')));
  comprueba('deja registro de instalación', existsSync(join(d, '.sdd/installed.json')));
  comprueba('instala el comando determinista de proyecto', existsSync(join(d, 'scripts/sdd-project.mjs')));
  comprueba('crea README virgen',
    existsSync(join(d, 'README.md')) &&
    !/Ecosistema de agentes SDD|Estructura_inicial_claude/.test(leer(join(d, 'README.md')) || ''));
  comprueba('crea CHANGELOG virgen',
    /\[Unreleased\]/.test(leer(join(d, 'CHANGELOG.md')) || '') &&
    !/\[0\.1\.0\]|agentes.*Codex|2026-07-29/i.test(leer(join(d, 'CHANGELOG.md')) || ''));
  comprueba('crea auditoría de agentes vacía', leer(join(d, '.sdd/agent-audit.jsonl')) === '');
  comprueba('solo registra la skill base auditada y fijada', (() => {
    try {
      const entries = JSON.parse(leer(join(d, '.sdd/external-skills.json')) || '{}').entries;
      return entries?.length === 1 && entries[0].skill === 'skill-creator' &&
        /^[0-9a-f]{40}$/.test(entries[0].commit || '') && entries[0].status === 'approved-vendored';
    }
    catch { return false; }
  })());
  comprueba('crea territorios en audit sin asumir carpetas de aplicación', (() => {
    try {
      const t = JSON.parse(leer(join(d, '.sdd/territories.json')) || '{}');
      const serializado = JSON.stringify(t);
      return t.modo === 'audit' && !/src\/|supabase|prisma|\.tsx|\.sql/.test(serializado);
    } catch { return false; }
  })());
  comprueba('crea checks sin asumir stack', (() => {
    try {
      const c = JSON.parse(leer(join(d, '.sdd/checks.json')) || '{}');
      return c.checks?.sdd?.command === 'node scripts/check-sdd.mjs' &&
        !Object.values(c.checks || {}).some((x) => /npm |pytest|gradle|mvn /.test(x?.command || ''));
    } catch { return false; }
  })());
  comprueba('no activa MCP por defecto',
    !existsSync(join(d, '.mcp.json')) && !existsSync(join(d, '.vscode/mcp.json')) &&
    !existsSync(join(d, '.agents/mcp_config.json')));
  comprueba('no copia variables de MCP al env de ejemplo',
    !/SUPABASE|STITCH|CONTEXT7|PERSONAL_ACCESS_TOKEN/.test(leer(join(d, '.env.example')) || ''));
  comprueba('instala constitución real mínima y conserva la plantilla aparte',
    existsSync(join(d, 'docs/architecture/_TEMPLATE.constitution.md')) &&
    !/C4Context|src\/|hexagonal/.test(leer(join(d, 'docs/architecture/constitution.md')) || ''));
  comprueba('instala threat model mínimo y conserva la plantilla aparte',
    existsSync(join(d, 'docs/security/_TEMPLATE.threat-model.md')) &&
    !/T-01|Suplantación|POST \/\.\.\./.test(leer(join(d, 'docs/security/THREAT-MODEL.md')) || ''));
  comprueba('instala dirección visual mínima y conserva la guía aparte',
    existsSync(join(d, 'docs/design/DIRECTION-GUIDE.md')) &&
    !/frontend-design|theme-factory|canvas-design/.test(leer(join(d, 'docs/design/DIRECCION-VISUAL.md')) || ''));
  comprueba('solo instala la plantilla de ADR',
    existsSync(join(d, 'docs/architecture/adr/_TEMPLATE.md')) &&
    !existsSync(join(d, 'docs/architecture/adr/ADR-0000-plantilla.md')));
  comprueba('el CI instalado es universal y no prueba la plantilla', (() => {
    const ci = leer(join(d, '.github/workflows/sdd-gates.yml')) || '';
    return !!ci && !/npm ci|test-install\.mjs|npm run/.test(ci);
  })());

  // Lo que NO debe viajar: el historial de la plantilla
  comprueba('NO copia el contenido del README de la plantilla',
    !/npx github:jechamo\/Estructura_inicial_claude global/.test(leer(join(d, 'README.md')) || ''));
  comprueba('NO copia el historial del CHANGELOG de la plantilla',
    !/\[0\.1\.0\]/.test(leer(join(d, 'CHANGELOG.md')) || ''));
  comprueba('NO copia las sesiones de la plantilla', !existsSync(join(d, 'docs/bitacora/sessions/2026-07.md')));
  comprueba('NO copia las specs de mantenimiento de la plantilla', !existsSync(join(d, 'docs/specs/001-agentes-codex')));
  comprueba('NO copia ninguna spec activa de la plantilla',
    readdirSync(join(d, 'docs/specs'), { withFileTypes: true })
      .filter((e) => e.isDirectory() && e.name !== '_TEMPLATE').length === 0);
  comprueba('NO copia informes de la plantilla',
    readdirSync(join(d, 'docs/quality/reports')).filter((x) => x !== '.gitkeep').length === 0 &&
    readdirSync(join(d, 'docs/security/reports')).filter((x) => x !== '.gitkeep').length === 0);
  comprueba('NO copia el instalador', !existsSync(join(d, 'scripts/install.mjs')));
  const contaminados = ficherosTexto(d).filter((ruta) => {
    const normalizada = ruta.replaceAll('\\', '/');
    if (['.sdd/installed.json', 'scripts/check-sdd.mjs'].includes(normalizada)) return false;
    return /001-agentes-codex|Estructura_inicial_claude|2026-0[78]-/i.test(leer(join(d, ruta)) || '');
  });
  comprueba('ningun artefacto instalado filtra nombres, specs o fechas de la plantilla',
    contaminados.length === 0, contaminados.join(', '));
  comprueba('la bitácora se instala vacía',
    (leer(join(d, 'docs/bitacora/DECISIONS.md')) || '').includes('Bitácora de decisiones') &&
    !(leer(join(d, 'docs/bitacora/DECISIONS.md')) || '').includes('El handoff no aísla'));

  // Los gates de la plantilla deben pasar DENTRO del proyecto recién instalado
  const check = spawnSync(process.execPath, ['scripts/check-sdd.mjs', '--virgin'], { cwd: d, encoding: 'utf8' });
  comprueba('check-sdd pasa en el destino', check.status === 0, (check.stdout || '').slice(-160));
  const indiceDocs = leer(join(d, 'docs/README.md'));
  writeFileSync(join(d, 'docs/README.md'), `${indiceDocs}\n[enlace roto](no-existe.md)\n`, 'utf8');
  const roto = spawnSync(process.execPath, ['scripts/check-sdd.mjs', '--virgin'], { cwd: d, encoding: 'utf8' });
  comprueba('check-sdd virgen detecta enlaces internos rotos',
    roto.status === 1 && /enlace.*no existe|enlace.*roto/i.test(roto.stdout || ''));
  writeFileSync(join(d, 'docs/README.md'), indiceDocs, 'utf8');
  const hooks = spawnSync(process.execPath, ['scripts/test-hooks.mjs'], { cwd: d, encoding: 'utf8' });
  comprueba('las guardas funcionan en el destino', hooks.status === 0, (hooks.stdout || '').slice(-160));

  const detect = spawnSync(process.execPath, ['scripts/sdd-project.mjs', 'detect', '--json'], { cwd: d, encoding: 'utf8' });
  let deteccion = null;
  try { deteccion = JSON.parse(detect.stdout || 'null'); } catch { /* lo informa la aserción */ }
  comprueba('detect no inventa stack en un repositorio vacío',
    detect.status === 0 && Array.isArray(deteccion?.stacks) && deteccion.stacks.length === 0);

  writeFileSync(join(d, 'package.json'), '{"scripts":{"test":"node --test","lint":"eslint ."}}\n', 'utf8');
  writeFileSync(join(d, 'pyproject.toml'), '[project]\nname="mi-proyecto"\n', 'utf8');
  const multi = spawnSync(process.execPath, ['scripts/sdd-project.mjs', 'detect', '--json'], { cwd: d, encoding: 'utf8' });
  let deteccionMulti = null;
  try { deteccionMulti = JSON.parse(multi.stdout || 'null'); } catch { /* lo informa la aserción */ }
  comprueba('detect reconoce un proyecto multi-stack sin modificar checks',
    multi.status === 0 && deteccionMulti?.stacks?.includes('node') && deteccionMulti?.stacks?.includes('python') &&
    JSON.parse(leer(join(d, '.sdd/checks.json'))).unconfigured.includes('test'));

  const inventory = spawnSync(process.execPath, ['scripts/sdd-project.mjs', 'inventory', '--json'], { cwd: d, encoding: 'utf8' });
  let inventario = null;
  try { inventario = JSON.parse(inventory.stdout || 'null'); } catch { /* lo informa la aserción */ }
  comprueba('inventory cuenta agentes y skills canónicos',
    inventory.status === 0 && inventario?.agents === 20 && inventario?.skills === 23);

  const nuevaSpec = spawnSync(process.execPath, ['scripts/sdd-project.mjs', 'new-spec', 'checkout-invitado', '--json'], { cwd: d, encoding: 'utf8' });
  comprueba('new-spec crea el siguiente scaffold sin execution-log',
    nuevaSpec.status === 0 && existsSync(join(d, 'docs/specs/001-checkout-invitado/spec.md')) &&
    !existsSync(join(d, 'docs/specs/001-checkout-invitado/execution-log.jsonl')));

  const nuevoAdr = spawnSync(process.execPath, ['scripts/sdd-project.mjs', 'new-adr', 'persistencia-principal', '--json'], { cwd: d, encoding: 'utf8' });
  comprueba('new-adr crea el siguiente ADR desde la plantilla',
    nuevoAdr.status === 0 && existsSync(join(d, 'docs/architecture/adr/ADR-0001-persistencia-principal.md')));

  const verify = spawnSync(process.execPath, ['scripts/sdd-project.mjs', 'verify'], { cwd: d, encoding: 'utf8' });
  comprueba('verify delega en el gate determinista', verify.status === 0, (verify.stdout || '').slice(-180));
}

// ─── 1 ter · Codex registra ejecución directa sin inventar eventos de hook ───────────────────
console.log('\n1 ter · evidencia declared-direct en un host sin hooks');
{
  const d = nuevoDestino();
  sdd(d, 'init');
  const specDir = join(d, 'docs/specs/900-directa');
  mkdirSync(specDir, { recursive: true });
  writeFileSync(join(specDir, 'spec.md'), `# 900 · Ejecución directa

| **Estado** | aprobada |
|---|---|

| Id | Requisito | Prioridad | Esfuerzo |
|---|---|---|---|
| RF-01 | El sistema DEBE aceptar evidencia directa. | M | 1 |

### CA-01 · Evidencia directa
`, 'utf8');
  writeFileSync(join(specDir, 'tasks.md'), `# Tareas

### T-900-01 · Validar evidencia directa
- **Estado**: hecho
- **Cubre**: RF-01, CA-01
- **Test que la define**: scripts/test-install.mjs::acepta_declared_direct
`, 'utf8');
  writeFileSync(join(specDir, 'evidence.md'), `# Evidencia

## 1. Ejecuciones

| Fecha | Agente | Verificación | Tarea | Comando | Resultado |
|---|---|---|---|---|---|
| 2026-08-02 | implementer | declared-direct | T-900-01 | npm test | verde |

## 3. Controles NO ejecutados

| Control | Motivo | Riesgo | Dueño | Paso |
|---|---|---|---|---|
| Hooks | Host sin hooks | Sin observed | usuario | usar declared-direct |
`, 'utf8');

  const check = spawnSync(process.execPath, ['scripts/check-sdd.mjs', '--strict', '--spec', '900'], { cwd: d, encoding: 'utf8' });
  comprueba('check-sdd acepta declared-direct sin execution-log falso',
    check.status === 0,
    (check.stdout || '').slice(-220));
}

// ─── 1 bis · La paridad de Codex es obligatoria ─────────────────────────────────────────────
console.log('\n1 bis · detección de deriva en la superficie Codex');
{
  const d = nuevoDestino();
  sdd(d, 'init');
  rmSync(join(d, '.codex/agents/docs-writer.toml'), { force: true });

  const check = spawnSync(process.execPath, ['scripts/check-sdd.mjs'], { cwd: d, encoding: 'utf8' });
  comprueba('check-sdd detecta un agente de Codex ausente',
    check.status === 1 && /\.codex\/agents/.test(check.stdout || ''),
    (check.stdout || '').slice(-180));
}

// ─── 2 · No pisar lo que ya existe ───────────────────────────────────────────
console.log('\n2 · init sobre un proyecto con ficheros propios');
{
  const d = nuevoDestino();
  const MIO = '# Mis reglas\n\nEsto es del proyecto y no se toca.\n';
  const SENTINELA = 'CONTEXTO_PROPIO_NO_BORRAR';
  writeFileSync(join(d, 'AGENTS.md'), MIO, 'utf8');
  writeFileSync(join(d, 'README.md'), `# Producto existente\n${SENTINELA}\n`, 'utf8');
  writeFileSync(join(d, 'CHANGELOG.md'), `# Changelog\n## [1.7.0]\n${SENTINELA}\n`, 'utf8');
  writeFileSync(join(d, '.gitignore'), 'dist/\n*.log\n', 'utf8');
  mkdirSync(join(d, 'docs/bitacora'), { recursive: true });
  writeFileSync(join(d, 'docs/bitacora/DECISIONS.md'), `# Bitácora\n${SENTINELA}\n`, 'utf8');
  mkdirSync(join(d, 'docs/specs/777-existente'), { recursive: true });
  writeFileSync(join(d, 'docs/specs/777-existente/spec.md'), SENTINELA, 'utf8');
  mkdirSync(join(d, 'docs/architecture/adr'), { recursive: true });
  writeFileSync(join(d, 'docs/architecture/adr/ADR-0042-existente.md'), SENTINELA, 'utf8');
  writeFileSync(join(d, '.mcp.json'), `{"mcpServers":{"propio":{"url":"https://example.invalid/mcp"}},"nota":"${SENTINELA}"}\n`, 'utf8');
  mkdirSync(join(d, '.github/workflows'), { recursive: true });
  writeFileSync(join(d, '.github/workflows/sdd-gates.yml'), `name: propio # ${SENTINELA}\n`, 'utf8');
  mkdirSync(join(d, '.vscode'), { recursive: true });
  writeFileSync(join(d, '.vscode/settings.json'),
    '{\n  "editor.tabSize": 4,\n  "files.associations": { "*.foo": "json" }\n}\n', 'utf8');

  sdd(d, 'init');

  comprueba('AGENTS.md propio se conserva y recibe solo el bloque gestionado',
    (leer(join(d, 'AGENTS.md')) || '').startsWith(MIO) &&
    (leer(join(d, 'AGENTS.md')) || '').includes('<!-- sdd:start'));
  comprueba('no deja un .sdd-nuevo junto a AGENTS.md', !existsSync(join(d, 'AGENTS.md.sdd-nuevo')));
  comprueba('preserva README, CHANGELOG y bitácora brownfield',
    leer(join(d, 'README.md')).includes(SENTINELA) && leer(join(d, 'CHANGELOG.md')).includes(SENTINELA) &&
    leer(join(d, 'docs/bitacora/DECISIONS.md')).includes(SENTINELA));
  comprueba('preserva specs y ADR brownfield',
    leer(join(d, 'docs/specs/777-existente/spec.md')) === SENTINELA &&
    leer(join(d, 'docs/architecture/adr/ADR-0042-existente.md')) === SENTINELA);
  comprueba('MCP queda intacto sin --with-mcp', leer(join(d, '.mcp.json')).includes(SENTINELA));
  comprueba('CI existente queda intacto', leer(join(d, '.github/workflows/sdd-gates.yml')).includes(SENTINELA));

  const ajustes = JSON.parse(leer(join(d, '.vscode/settings.json')));
  comprueba('respeta tus claves de settings.json', ajustes['editor.tabSize'] === 4);
  comprueba('respeta tus valores anidados', ajustes['files.associations']['*.foo'] === 'json');
  comprueba('añade las claves de SDD', !!ajustes['chat.agentFilesLocations']);

  const gitignore = leer(join(d, '.gitignore'));
  comprueba('.gitignore conserva lo tuyo', gitignore.includes('dist/') && gitignore.includes('*.log'));
  comprueba('.gitignore añade lo de SDD en bloque marcado',
    gitignore.includes('.sdd/state/') && gitignore.includes('SDD (instalado por sdd init)'));
}

// ─── 2 quater · configuraciones malformadas ──────────────────────────────────
console.log('\n2 quater · conflictos de configuración');
{
  const d = nuevoDestino();
  mkdirSync(join(d, '.vscode'), { recursive: true });
  mkdirSync(join(d, '.codex'), { recursive: true });
  const JSONC_MALO = '{ "editor.tabSize": 2, esto-no-es-jsonc }\n';
  const TOML_MALO = '[[[esto no es toml\n';
  writeFileSync(join(d, '.vscode/settings.json'), JSONC_MALO, 'utf8');
  writeFileSync(join(d, '.codex/config.toml'), TOML_MALO, 'utf8');

  const r = sdd(d, 'init', '--with-mcp', 'context7');
  comprueba('configuración malformada no aborta toda la instalación', r.status === 0, r.stderr?.slice(0, 180));
  comprueba('JSONC malformado se preserva', leer(join(d, '.vscode/settings.json')) === JSONC_MALO);
  comprueba('JSONC propuesto queda bajo conflicts',
    existsSync(join(d, `.sdd/conflicts/${VERSION}/.vscode/settings.json`)));
  comprueba('TOML malformado se preserva', leer(join(d, '.codex/config.toml')) === TOML_MALO);
  comprueba('TOML propuesto queda bajo conflicts',
    existsSync(join(d, `.sdd/conflicts/${VERSION}/.codex/config.toml`)));
}

// ─── 2 bis · Destino explícito y modos ─────────────────────────────────────
console.log('\n2 bis · destino explícito y modos');
{
  const base = nuevoDestino();
  const destino = join(base, 'Proyecto con espacios');
  const r = sddDesde(ORIGEN, 'init', destino, '--mode', 'greenfield');
  comprueba('acepta un destino explícito inexistente con espacios', r.status === 0 && existsSync(join(destino, 'AGENTS.md')), r.stderr?.slice(0, 160));

  const seco = join(base, 'solo-simulacion');
  const dry = sddDesde(ORIGEN, 'init', seco, '--mode', 'greenfield', '--dry-run');
  comprueba('dry-run con destino explícito no crea el directorio', dry.status === 0 && !existsSync(seco));
}

// ─── 2 ter · MCP opt-in, selectivo y fijado ──────────────────────────────────
console.log('\n2 ter · MCP explícito');
{
  const d = nuevoDestino();
  const r = sdd(d, 'init', '--with-mcp', 'context7,playwright');
  const claudeMcp = JSON.parse(leer(join(d, '.mcp.json')) || '{}');
  const vscodeMcp = JSON.parse(leer(join(d, '.vscode/mcp.json')) || '{}');
  const codex = leer(join(d, '.codex/config.toml')) || '';

  comprueba('MCP explícito termina sin error', r.status === 0, r.stderr?.slice(0, 180));
  comprueba('solo instala servidores seleccionados',
    Object.keys(claudeMcp.mcpServers || {}).sort().join(',') === 'context7,playwright' &&
    Object.keys(vscodeMcp.servers || {}).sort().join(',') === 'context7,playwright');
  comprueba('no instala referencias MCP móviles',
    !/latest/i.test(JSON.stringify(claudeMcp)) && !/latest/i.test(JSON.stringify(vscodeMcp)));
  comprueba('fusiona los MCP seleccionados en Codex',
    /\[mcp_servers\.context7\]/.test(codex) && /\[mcp_servers\.playwright\]/.test(codex) &&
    !/\[mcp_servers\.supabase\]/.test(codex));
}

// ─── 3 · Idempotencia ────────────────────────────────────────────────────────
console.log('\n3 · ejecutar init dos veces');
{
  const d = nuevoDestino();
  sdd(d, 'init');
  const segunda = sdd(d, 'init');

  comprueba('la segunda no genera conflictos', /0 conflicto\(s\)/.test(segunda.stdout || ''), (segunda.stdout || '').slice(-160));
  comprueba('no deja ficheros .sdd-nuevo', !existsSync(join(d, 'AGENTS.md.sdd-nuevo')));
}

// ─── 4 · update no pisa lo que has tocado ────────────────────────────────────
console.log('\n4 · update con un fichero modificado a mano');
{
  const d = nuevoDestino();
  sdd(d, 'init');

  const ruta = join(d, '.sdd/territories.json');
  const MIO = leer(ruta).replace('"modo": "audit"', '"modo": "ask"');
  writeFileSync(ruta, MIO, 'utf8');

  const r = sdd(d, 'update');
  comprueba('update no pisa tu territories.json', leer(ruta) === MIO);
  comprueba('update no reinicia una semilla propiedad del proyecto', !/territories\.json.*conflicto/.test(r.stdout || ''));
  comprueba('no genera conflicto para una semilla preservada',
    !existsSync(join(d, '.sdd/conflicts', VERSION, '.sdd/territories.json')));

  const hook = join(d, '.sdd/hooks/guard-bash.mjs');
  const HOOK_LOCAL = `${leer(hook)}\n// ajuste local deliberado\n`;
  writeFileSync(hook, HOOK_LOCAL, 'utf8');
  const segundo = sdd(d, 'update');
  comprueba('update preserva un fichero gestionado modificado', leer(hook) === HOOK_LOCAL);
  comprueba('update deja la propuesta gestionada bajo conflicts',
    segundo.status === 0 && existsSync(join(d, `.sdd/conflicts/${VERSION}/.sdd/hooks/guard-bash.mjs`)));
}

// ─── 5 · check y dry-run ─────────────────────────────────────────────────────
console.log('\n5 · check y --dry-run');
{
  const limpio = nuevoDestino();
  const r1 = sdd(limpio, 'check');
  comprueba('check detecta que no está instalado', /no tiene la estructura/.test(r1.stdout || ''));

  const seco = nuevoDestino();
  const r2 = sdd(seco, 'init', '--dry-run');
  comprueba('--dry-run no escribe nada', !existsSync(join(seco, 'AGENTS.md')));
  comprueba('--dry-run lo anuncia', /simulaci[óo]n/i.test(r2.stdout || ''));

  const instalado = nuevoDestino();
  sdd(instalado, 'init');
  const r3 = sdd(instalado, 'check');
  comprueba('check reconoce una instalación al día', /Al día/.test(r3.stdout || ''), (r3.stdout || '').slice(-120));

  const rg = sdd(instalado, 'global', '--dry-run');
  comprueba('global --dry-run no toca tu home', rg.status === 0 && /Capa global/.test(rg.stdout || ''));
}

// ─── 6 · No instalarse sobre sí misma ────────────────────────────────────────
console.log('\n6 · protección contra instalarse encima de la plantilla');
{
  const r = spawnSync(process.execPath, [INSTALADOR, 'init'], { cwd: ORIGEN, encoding: 'utf8' });
  comprueba('se niega a instalarse sobre la plantilla', r.status === 1);
  const raiz = sddDesde(ORIGEN, 'init', parse(ORIGEN).root, '--dry-run');
  comprueba('se niega a instalar sobre la raíz del disco incluso en dry-run', raiz.status === 1);
  const personal = sddDesde(ORIGEN, 'init', homedir(), '--dry-run');
  comprueba('se niega a instalar directamente sobre el directorio personal', personal.status === 1);
}

// ─── Limpieza ────────────────────────────────────────────────────────────────
for (const d of temporales) {
  try {
    rmSync(d, { recursive: true, force: true });
  } catch {
    /* directorios temporales: si el sistema no los borra ahora, lo hará él */
  }
}

console.log(`\n${ok} correcta(s) · ${fallos.length} fallo(s)`);
if (fallos.length) {
  console.log('\nEl instalador no se comporta como promete:');
  for (const f of fallos) console.log(`  ✗ ${f}`);
  process.exit(1);
}
console.log('✅ El instalador respeta lo que ya existe.');
