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
import { createHash } from 'node:crypto';

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
const hash = (contenido) => createHash('sha256').update(contenido).digest('hex').slice(0, 16);

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
  comprueba('instala la skill canónica de intake sin prompt paralelo',
    existsSync(join(d, '.agents/skills/sdd-intake/SKILL.md')) &&
    !existsSync(join(d, '.github/prompts/sdd-intake.prompt.md')) &&
    !existsSync(join(d, '.cursor/commands/sdd-intake.md')));
  comprueba('instala los adaptadores de skill de Claude', existsSync(join(d, '.claude/skills/middle/SKILL.md')));
  comprueba('instala el adaptador Claude de intake',
    (leer(join(d, '.claude/skills/sdd-intake/SKILL.md')) || '').includes('.agents/skills/sdd-intake/SKILL.md'));
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
  comprueba('no instala prompts que duplican las skills de VS Code',
    !existsSync(join(d, '.github/prompts/sdd-init.prompt.md')));
  comprueba('no instala commands que duplican las skills de Cursor',
    !existsSync(join(d, '.cursor/commands/sdd-specify.md')));
  const settingsVsCode = leer(join(d, '.vscode/settings.json')) || '';
  comprueba('VS Code selecciona una sola superficie de agentes y skills',
    /"\.github\/agents"\s*:\s*true/.test(settingsVsCode) &&
    /"\.claude\/agents"\s*:\s*false/.test(settingsVsCode) &&
    /"\.agents\/skills"\s*:\s*true/.test(settingsVsCode) &&
    /"\.claude\/skills"\s*:\s*false/.test(settingsVsCode) &&
    !/chat\.promptFilesLocations/.test(settingsVsCode));
  comprueba('la salida pide confiar en el workspace y recargar VS Code',
    /trust|confiar|conf[ií]a/i.test(r.stdout || '') && /reload|recargar/i.test(r.stdout || '') && /VS Code/i.test(r.stdout || ''));
  comprueba('crea docs/specs', existsSync(join(d, 'docs/specs')));
  comprueba('deja registro de instalación', existsSync(join(d, '.sdd/installed.json')));
  comprueba('greenfield nace con baseline de producto pendiente', (() => {
    const registro = JSON.parse(leer(join(d, '.sdd/installed.json')) || '{}');
    return registro.product?.status === 'bootstrap' &&
      ['PRD.md', 'USE-CASES.md', 'FEATURE-MAP.md', 'SOURCES.md']
        .every((nombre) => existsSync(join(d, 'docs/product', nombre)));
  })());
  const productStatus = spawnSync(process.execPath, ['scripts/sdd-project.mjs', 'product-status', '--json'], {
    cwd: d, encoding: 'utf8',
  });
  let estadoProducto = null;
  try { estadoProducto = JSON.parse(productStatus.stdout || 'null'); } catch { /* aserción inferior */ }
  comprueba('product-status expone el gate bootstrap',
    productStatus.status === 0 && estadoProducto?.status === 'bootstrap');
  const specPrematura = spawnSync(process.execPath,
    ['scripts/sdd-project.mjs', 'new-spec', 'no-debe-crearse', '--json'],
    { cwd: d, encoding: 'utf8' });
  comprueba('new-spec bloquea greenfield mientras producto siga bootstrap',
    specPrematura.status === 1 && /sdd-intake|bootstrap/i.test(`${specPrematura.stdout}${specPrematura.stderr}`) &&
    !existsSync(join(d, 'docs/specs/001-no-debe-crearse')));
  const aprobacionInvalida = spawnSync(process.execPath,
    ['scripts/sdd-project.mjs', 'approve-product', '--approved-by', 'test-user', '--json'],
    { cwd: d, encoding: 'utf8' });
  comprueba('approve-product rechaza todos los placeholders estructurales de la plantilla',
    aprobacionInvalida.status === 1 && /placeholder|pendiente|aclaraciones/i.test(`${aprobacionInvalida.stdout}${aprobacionInvalida.stderr}`));
  const actorInvalido = spawnSync(process.execPath,
    ['scripts/sdd-project.mjs', 'approve-product', '--approved-by', 'persona|inyectada', '--json'],
    { cwd: d, encoding: 'utf8' });
  comprueba('approve-product rechaza una identidad que rompa el documento', actorInvalido.status === 1);
  const GATE_PRD = `# PRD
| Campo | Valor |
|---|---|
| Estado | pending |
| Aprobado por | |
| Fecha de aprobación | |
| Alcance aprobado | baseline funcional completo |
`;

  writeFileSync(join(d, 'docs/product/PRD.md'), `${GATE_PRD.replace('baseline funcional completo', '')}| OBJ-001 | objetivo |\n| PRD-RF-001 | OBJ-001 | requisito |\nSRC-001\n`, 'utf8');
  writeFileSync(join(d, 'docs/product/USE-CASES.md'), `# Casos\n## UC-001\nCubre PRD-RF-001\n`, 'utf8');
  writeFileSync(join(d, 'docs/product/FEATURE-MAP.md'), `# Mapa\n| FEAT-001 | spec | valor | OBJ-001 | PRD-RF-001 | UC-001 | propuesta |\n`, 'utf8');
  writeFileSync(join(d, 'docs/product/SOURCES.md'), `# Fuentes\nSRC-001 accesible\n`, 'utf8');
  const aprobacionSinAlcance = spawnSync(process.execPath,
    ['scripts/sdd-project.mjs', 'approve-product', '--approved-by', 'test-user', '--json'],
    { cwd: d, encoding: 'utf8' });
  comprueba('approve-product exige un alcance humano no vacío',
    aprobacionSinAlcance.status === 1 && /alcance/i.test(`${aprobacionSinAlcance.stdout}${aprobacionSinAlcance.stderr}`));

  writeFileSync(join(d, 'docs/product/PRD.md'), `${GATE_PRD}| OBJ-001 | objetivo |\n| PRD-RF-001 | OBJ-001 | requisito |\nSRC-001\n`, 'utf8');
  writeFileSync(join(d, 'docs/product/USE-CASES.md'), `# Casos\n## UC-001\nCubre PRD-RF-999\n`, 'utf8');
  writeFileSync(join(d, 'docs/product/FEATURE-MAP.md'), `# Mapa\n| FEAT-001 | spec | valor | OBJ-001 | PRD-RF-001 | UC-001 | propuesta |\n`, 'utf8');
  writeFileSync(join(d, 'docs/product/SOURCES.md'), `# Fuentes\nSRC-001 accesible\n`, 'utf8');
  const aprobacionHuerfana = spawnSync(process.execPath,
    ['scripts/sdd-project.mjs', 'approve-product', '--approved-by', 'test-user', '--json'],
    { cwd: d, encoding: 'utf8' });
  comprueba('approve-product rechaza IDs huerfanos',
    aprobacionHuerfana.status === 1 && /hu.rfan/i.test(`${aprobacionHuerfana.stdout}${aprobacionHuerfana.stderr}`));

  writeFileSync(join(d, 'docs/product/PRD.md'), `${GATE_PRD}| OBJ-001 | objetivo principal |\n| OBJ-002 | objetivo secundario |\n| PRD-RF-001 | OBJ-001 | requisito |\nSRC-001\n`, 'utf8');
  writeFileSync(join(d, 'docs/product/USE-CASES.md'), `# Casos\n## UC-001\nCubre PRD-RF-001\n`, 'utf8');
  writeFileSync(join(d, 'docs/product/FEATURE-MAP.md'), `# Mapa\n| FEAT-001 | spec | valor | OBJ-002 | PRD-RF-001 | UC-001 | propuesta |\n`, 'utf8');
  const aprobacionInconexa = spawnSync(process.execPath,
    ['scripts/sdd-project.mjs', 'approve-product', '--approved-by', 'test-user', '--json'],
    { cwd: d, encoding: 'utf8' });
  comprueba('approve-product rechaza IDs válidos que no formen la misma cadena',
    aprobacionInconexa.status === 1 && /cadena inconexa/i.test(`${aprobacionInconexa.stdout}${aprobacionInconexa.stderr}`));

  writeFileSync(join(d, 'docs/product/PRD.md'), `${GATE_PRD}| OBJ-001 | objetivo |\n| PRD-RF-001 | OBJ-001 | requisito A |\n| PRD-RF-001 | OBJ-001 | requisito B |\nSRC-001\n`, 'utf8');
  writeFileSync(join(d, 'docs/product/USE-CASES.md'), `# Casos\n## UC-001\nCubre PRD-RF-001\n`, 'utf8');
  const aprobacionDuplicada = spawnSync(process.execPath,
    ['scripts/sdd-project.mjs', 'approve-product', '--approved-by', 'test-user', '--json'],
    { cwd: d, encoding: 'utf8' });
  comprueba('approve-product rechaza IDs declarados por duplicado',
    aprobacionDuplicada.status === 1 && /duplicad/i.test(`${aprobacionDuplicada.stdout}${aprobacionDuplicada.stderr}`));

  writeFileSync(join(d, 'docs/product/PRD.md'), `${GATE_PRD}| OBJ-001 | objetivo |\n| PRD-RF-001 | OBJ-001 | requisito |\nSRC-001\n`, 'utf8');
  writeFileSync(join(d, 'docs/product/USE-CASES.md'), `# Casos\n## UC-001\nCubre PRD-RF-001\n`, 'utf8');
  writeFileSync(join(d, 'docs/product/FEATURE-MAP.md'), `# Mapa\n| FEAT-001 | spec | valor | OBJ-001 | PRD-RF-001 | UC-001 | propuesta |\n`, 'utf8');
  writeFileSync(join(d, 'docs/product/SOURCES.md'), `# Fuentes\n| SRC-001 | URL | inaccesible |\n| DISC-001 | PRD-diseño | abierta |\n`, 'utf8');
  const aprobacionBloqueada = spawnSync(process.execPath,
    ['scripts/sdd-project.mjs', 'approve-product', '--approved-by', 'test-user', '--json'],
    { cwd: d, encoding: 'utf8' });
  comprueba('approve-product bloquea fuentes inaccesibles o discrepancias abiertas',
    aprobacionBloqueada.status === 1 && /inaccesible|discrepancias/i.test(`${aprobacionBloqueada.stdout}${aprobacionBloqueada.stderr}`));

  writeFileSync(join(d, 'docs/product/SOURCES.md'), `# Fuentes\nSRC-001 https://example.test/prd?api_key=secreto\n`, 'utf8');
  const aprobacionUrlSensible = spawnSync(process.execPath,
    ['scripts/sdd-project.mjs', 'approve-product', '--approved-by', 'test-user', '--json'],
    { cwd: d, encoding: 'utf8' });
  comprueba('approve-product rechaza secretos en query o fragmento de una URL',
    aprobacionUrlSensible.status === 1 && /credenciales|sensibles|query|fragmento|saneada/i.test(`${aprobacionUrlSensible.stdout}${aprobacionUrlSensible.stderr}`));

  writeFileSync(join(d, 'docs/product/SOURCES.md'), `# Fuentes\nSRC-001 http://169.254.169.254/latest/meta-data\n`, 'utf8');
  const aprobacionUrlPrivada = spawnSync(process.execPath,
    ['scripts/sdd-project.mjs', 'approve-product', '--approved-by', 'test-user', '--json'],
    { cwd: d, encoding: 'utf8' });
  comprueba('approve-product rechaza loopback, redes privadas y link-local',
    aprobacionUrlPrivada.status === 1 && /público|publico|http/i.test(`${aprobacionUrlPrivada.stdout}${aprobacionUrlPrivada.stderr}`));

  writeFileSync(join(d, 'docs/product/SOURCES.md'), `# Fuentes\nSRC-001 http://[::ffff:7f00:1]/metadata\n`, 'utf8');
  const aprobacionIpv6Mapeada = spawnSync(process.execPath,
    ['scripts/sdd-project.mjs', 'approve-product', '--approved-by', 'test-user', '--json'],
    { cwd: d, encoding: 'utf8' });
  comprueba('approve-product rechaza IPv6 especial que represente loopback o multicast',
    aprobacionIpv6Mapeada.status === 1 && /público|publico|http/i.test(`${aprobacionIpv6Mapeada.stdout}${aprobacionIpv6Mapeada.stderr}`));

  writeFileSync(join(d, 'docs/product/PRD.md'), `${GATE_PRD}| OBJ-001 | objetivo |\n| PRD-RF-001 | OBJ-001 | requisito |\nSRC-001\n`, 'utf8');
  writeFileSync(join(d, 'docs/product/USE-CASES.md'), `# Casos\n## UC-001\nCubre PRD-RF-001\n`, 'utf8');
  writeFileSync(join(d, 'docs/product/FEATURE-MAP.md'), `# Mapa\n| FEAT-001 | spec | valor | OBJ-001 | PRD-RF-001 | UC-001 | propuesta |\n`, 'utf8');
  writeFileSync(join(d, 'docs/product/SOURCES.md'), `# Fuentes\nSRC-001 accesible; sin discrepancias abiertas\n`, 'utf8');
  const aprobacion = spawnSync(process.execPath,
    ['scripts/sdd-project.mjs', 'approve-product', '--approved-by', 'test-user', '--json'],
    { cwd: d, encoding: 'utf8' });
  let productoAprobado = null;
  try { productoAprobado = JSON.parse(aprobacion.stdout || 'null'); } catch { /* aserción inferior */ }
  comprueba('approve-product registra aprobación, hashes y umbral de specs',
    aprobacion.status === 0 && productoAprobado?.status === 'approved' &&
    productoAprobado?.approvedBy === 'test-user' && productoAprobado?.enforceFromSpec === 1 &&
    Object.keys(productoAprobado?.hashes || {}).length === 4 &&
    /\|\s*Aprobado por\s*\|\s*test-user\s*\|/i.test(leer(join(d, 'docs/product/PRD.md')) || '') &&
    /\|\s*Fecha de aprobación\s*\|\s*\d{4}-\d{2}-\d{2}T/i.test(leer(join(d, 'docs/product/PRD.md')) || ''));
  const prdAprobado = leer(join(d, 'docs/product/PRD.md'));
  writeFileSync(join(d, 'docs/product/PRD.md'), `${prdAprobado}\nCambio posterior no aprobado\n`, 'utf8');
  const drift = spawnSync(process.execPath, ['scripts/check-sdd.mjs', '--strict'], { cwd: d, encoding: 'utf8' });
  comprueba('check-sdd estricto detecta drift tras aprobar producto',
    drift.status === 1 && /drift|cambi.*aproba|hash/i.test(drift.stdout || ''));
  writeFileSync(join(d, 'docs/product/PRD.md'), prdAprobado, 'utf8');
  sdd(d, 'update');
  comprueba('update conserva el estado de producto aprobado',
    JSON.parse(leer(join(d, '.sdd/installed.json')) || '{}').product?.status === 'approved');
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
    const contenido = (leer(join(d, ruta)) || '')
      .replace(/^\|\s*Fecha de aprobación\s*\|[^\n]*$/gim, '');
    return /001-agentes-codex|Estructura_inicial_claude|2026-0[78]-/i.test(contenido);
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
    inventory.status === 0 && inventario?.agents === 20 && inventario?.skills === 25);

  comprueba('la skill observability se instala con su adaptador Claude',
    existsSync(join(d, '.agents/skills/observability/SKILL.md')) &&
    existsSync(join(d, '.claude/skills/observability/SKILL.md')));

  // Los git hooks viajan con la plantilla pero no se activan solos: reconfigurar el git de
  // alguien durante una instalación es la clase de sorpresa que hace desinstalar la herramienta.
  const hooksPath = spawnSync('git', ['config', '--get', 'core.hooksPath'], { cwd: d, encoding: 'utf8' });
  comprueba('los git hooks se copian pero no se activan sin opt-in',
    existsSync(join(d, '.sdd/githooks/pre-commit')) && existsSync(join(d, '.sdd/githooks/pre-push')) &&
    (hooksPath.stdout || '').trim() !== '.sdd/githooks');

  const checksInstalados = JSON.parse(leer(join(d, '.sdd/checks.json')));
  comprueba('checks.json nace sin comandos de stack y con el vocabulario ampliado',
    Object.keys(checksInstalados.checks).length === 1 && checksInstalados.checks.sdd &&
    ['coverage', 'e2e', 'smells', 'a11y', 'deps-audit', 'docs'].every((g) => checksInstalados.unconfigured.includes(g)));

  const rapidos = spawnSync(process.execPath, ['scripts/sdd-project.mjs', 'run', '--fast', '--json'], { cwd: d, encoding: 'utf8' });
  const lentos = spawnSync(process.execPath, ['scripts/sdd-project.mjs', 'run', '--slow', '--json'], { cwd: d, encoding: 'utf8' });
  let salidaRapidos = null;
  let salidaLentos = null;
  try { salidaRapidos = JSON.parse((rapidos.stdout || '').trim().split('\n').pop() || 'null'); } catch { /* lo informa la aserción */ }
  try { salidaLentos = JSON.parse((lentos.stdout || '').trim().split('\n').pop() || 'null'); } catch { /* lo informa la aserción */ }
  comprueba('run --fast y --slow reparten los gates por velocidad',
    salidaRapidos?.results?.some((r) => r.id === 'sdd') === true &&
    salidaLentos?.results?.length === 0 && salidaLentos?.skipped?.includes('sdd'));

  const deuda = spawnSync(process.execPath, ['scripts/sdd-project.mjs', 'debt', '--json'], { cwd: d, encoding: 'utf8' });
  let salidaDeuda = null;
  try { salidaDeuda = JSON.parse(deuda.stdout || 'null'); } catch { /* lo informa la aserción */ }
  // Fuera de un repositorio git no se inventa un recorrido del disco: se declara que no se pudo
  // medir. "No medido" es un resultado; "cero" sin medir, no.
  comprueba('debt declara que no puede medir fuera de un repositorio git',
    deuda.status === 0 && salidaDeuda?.available === false && typeof salidaDeuda?.reason === 'string');

  // El escáner es la única protección contra secretos en hosts sin hooks. Se comprueba que
  // detecta, no solo que existe: un gate que nunca ha fallado no demuestra nada.
  //
  // La credencial de prueba se compone en ejecución: escrita entera aquí, este mismo fichero
  // daría positivo en el escaneo — que es exactamente la prueba de que el patrón funciona.
  {
    const caja = nuevoDestino();
    spawnSync('git', ['init', '-q', '.'], { cwd: caja, encoding: 'utf8' });
    mkdirSync(join(caja, '.sdd/hooks'), { recursive: true });
    mkdirSync(join(caja, 'scripts'), { recursive: true });
    writeFileSync(join(caja, '.sdd/hooks/_lib.mjs'), leer(join(ORIGEN, '.sdd/hooks/_lib.mjs')), 'utf8');
    writeFileSync(join(caja, 'scripts/scan-secrets.mjs'), leer(join(ORIGEN, 'scripts/scan-secrets.mjs')), 'utf8');
    writeFileSync(join(caja, 'limpio.js'), 'export const saludo = "hola";\n', 'utf8');
    spawnSync('git', ['add', '-A'], { cwd: caja, encoding: 'utf8' });
    const limpio = spawnSync(process.execPath, ['scripts/scan-secrets.mjs', '--json'], { cwd: caja, encoding: 'utf8' });
    comprueba('scan-secrets pasa en un árbol sin secretos',
      limpio.status === 0 && JSON.parse(limpio.stdout || '{}').ok === true);

    const credencialFalsa = `${'AKIA'}${'1234567890ABCDEF'}`;
    writeFileSync(join(caja, 'config.js'), `const k = "${credencialFalsa}";\n`, 'utf8');
    spawnSync('git', ['add', '-A'], { cwd: caja, encoding: 'utf8' });
    const sucio = spawnSync(process.execPath, ['scripts/scan-secrets.mjs', '--json'], { cwd: caja, encoding: 'utf8' });
    let hallazgos = null;
    try { hallazgos = JSON.parse(sucio.stdout || 'null'); } catch { /* lo informa la aserción */ }
    comprueba('scan-secrets falla y localiza el secreto sembrado',
      sucio.status === 1 && hallazgos?.ok === false &&
      hallazgos.findings.some((f) => f.ruta === 'config.js' && f.linea === 1));
  }

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
  writeFileSync(join(d, 'package.json'), '{"name":"brownfield-evidence"}\n', 'utf8');
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

### T-900-02 · Validar delegación no observable
- **Estado**: hecho
- **Cubre**: RF-01, CA-01
- **Test que la define**: scripts/test-install.mjs::acepta_unverified_con_motivo
`, 'utf8');
  writeFileSync(join(specDir, 'evidence.md'), `# Evidencia

## 1. Ejecuciones

| Fecha | Agente | Verificación | Tarea | Comando | Resultado |
|---|---|---|---|---|---|
| 2026-08-02 | implementer | declared-direct | T-900-01 | npm test | verde |
| 2026-08-03 | implementer | unverified | T-900-02 | delegación Codex | completada; motivo: el host no expone hooks de subagente al repo |

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
console.log('\n1 quater · cadena completa y evidencia concreta');
{
  const d = nuevoDestino();
  sdd(d, 'init');
  writeFileSync(join(d, 'docs/product/PRD.md'), `# PRD
| Campo | Valor |
|---|---|
| Estado | pending |
| Aprobado por | |
| Fecha de aprobación | |
| Alcance aprobado | producto de prueba |
| OBJ-001 | objetivo |
| PRD-RF-001 | OBJ-001 | requisito | SRC-001 |
`, 'utf8');
  writeFileSync(join(d, 'docs/product/USE-CASES.md'), `# Casos\n## UC-001\nCubre PRD-RF-001\n`, 'utf8');
  writeFileSync(join(d, 'docs/product/FEATURE-MAP.md'), `# Mapa\n| FEAT-001 | 001-bypass | valor | OBJ-001 | PRD-RF-001 | UC-001 | propuesta |\n`, 'utf8');
  writeFileSync(join(d, 'docs/product/SOURCES.md'), `# Fuentes\nSRC-001 accesible\n`, 'utf8');
  const aprobado = spawnSync(process.execPath,
    ['scripts/sdd-project.mjs', 'approve-product', '--approved-by', 'test-user', '--json'],
    { cwd: d, encoding: 'utf8' });
  const specDir = join(d, 'docs/specs/001-bypass');
  mkdirSync(specDir, { recursive: true });
  writeFileSync(join(specDir, 'spec.md'), `# Spec
| Estado | aprobada |
|---|---|
| OBJ-001 | PRD-RF-001 | UC-001 | RF-01 | CA-01 |
| RF-01 | comportamiento trazado | M | 1 |
| RF-02 | comportamiento sin origen | S | 1 |
### CA-01 · trazado
### CA-02 · sin origen
`, 'utf8');
  writeFileSync(join(specDir, 'tasks.md'), `# Tareas
### T-001-01 · tarea trazada
- **Estado**: pendiente
- **Cubre**: OBJ-001, PRD-RF-001, UC-001, RF-01, CA-01
- **Test que la define**: tests/product.test.mjs::cadena
`, 'utf8');
  const rfCaSinCadena = spawnSync(process.execPath,
    ['scripts/check-sdd.mjs', '--strict', '--spec', '001'], { cwd: d, encoding: 'utf8' });
  comprueba('check-sdd exige cadena completa para cada RF y cada CA',
    aprobado.status === 0 && rfCaSinCadena.status === 1 && /RF.*CA|cadena completa/i.test(rfCaSinCadena.stdout || ''));

  writeFileSync(join(specDir, 'spec.md'), `# Spec
| Estado | aprobada |
|---|---|
| OBJ-001 | PRD-RF-001 | UC-001 | RF-01 | CA-01 |
| RF-01 | comportamiento trazado | M | 1 |
### CA-01 · trazado
`, 'utf8');
  writeFileSync(join(specDir, 'tasks.md'), `# Tareas
### T-001-01 · test ficticio
- **Estado**: pendiente
- **Cubre**: OBJ-001, PRD-RF-001, UC-001, RF-01, CA-01
- **Test que la define**: pendiente
`, 'utf8');
  const testPendiente = spawnSync(process.execPath,
    ['scripts/check-sdd.mjs', '--strict', '--spec', '001'], { cwd: d, encoding: 'utf8' });
  comprueba('check-sdd no acepta Test que la define: pendiente',
    testPendiente.status === 1 && /test|cadena.*tarea/i.test(testPendiente.stdout || ''));

  writeFileSync(join(specDir, 'tasks.md'), `# Tareas
### T-001-01 · evidencia ficticia
- **Estado**: hecho
- **Cubre**: OBJ-001, PRD-RF-001, UC-001, RF-01, CA-01
- **Test que la define**: tests/product.test.mjs::cadena
`, 'utf8');
  writeFileSync(join(specDir, 'evidence.md'), `# Evidencia
| T-001-01 | declared-direct | OBJ-001 | PRD-RF-001 | UC-001 | RF-01 | CA-01 | pendiente |
## 3. Controles NO ejecutados
| control | motivo | riesgo | dueño | paso |
`, 'utf8');
  const evidenciaPendiente = spawnSync(process.execPath,
    ['scripts/check-sdd.mjs', '--strict', '--spec', '001'], { cwd: d, encoding: 'utf8' });
  comprueba('check-sdd no acepta una fila de evidencia sin resultado concreto',
    evidenciaPendiente.status === 1 && /cadena-evidencia|evidence\.md no enlaza/i.test(evidenciaPendiente.stdout || ''));
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
  mkdirSync(join(d, 'docs/product'), { recursive: true });
  for (const nombre of ['PRD.md', 'USE-CASES.md', 'FEATURE-MAP.md', 'SOURCES.md'])
    writeFileSync(join(d, 'docs/product', nombre), `# Producto existente\n${SENTINELA}\n`, 'utf8');
  writeFileSync(join(d, '.mcp.json'), `{"mcpServers":{"propio":{"url":"https://example.invalid/mcp"}},"nota":"${SENTINELA}"}\n`, 'utf8');
  mkdirSync(join(d, '.github/workflows'), { recursive: true });
  writeFileSync(join(d, '.github/workflows/sdd-gates.yml'), `name: propio # ${SENTINELA}\n`, 'utf8');
  mkdirSync(join(d, '.vscode'), { recursive: true });
  writeFileSync(join(d, '.vscode/settings.json'),
    '{\n  "editor.tabSize": 4,\n  "files.associations": { "*.foo": "json" },\n' +
    '  "chat.agentFilesLocations": { ".claude/agents": true, ".github/agents": false },\n' +
    '  "chat.agentSkillsLocations": { ".claude/skills": true, ".agents/skills": false }\n}\n', 'utf8');

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
  comprueba('preserva íntegramente el baseline de producto brownfield',
    ['PRD.md', 'USE-CASES.md', 'FEATURE-MAP.md', 'SOURCES.md']
      .every((nombre) => leer(join(d, 'docs/product', nombre)).includes(SENTINELA)));
  comprueba('brownfield sin aprobación explícita queda legacy-pending sin romper la instalación',
    JSON.parse(leer(join(d, '.sdd/installed.json')) || '{}').product?.status === 'legacy-pending');
  comprueba('MCP queda intacto sin --with-mcp', leer(join(d, '.mcp.json')).includes(SENTINELA));
  comprueba('CI existente queda intacto', leer(join(d, '.github/workflows/sdd-gates.yml')).includes(SENTINELA));

  const ajustes = JSON.parse(leer(join(d, '.vscode/settings.json')));
  comprueba('respeta tus claves de settings.json', ajustes['editor.tabSize'] === 4);
  comprueba('respeta tus valores anidados', ajustes['files.associations']['*.foo'] === 'json');
  comprueba('añade las claves de SDD', !!ajustes['chat.agentFilesLocations']);
  comprueba('normaliza selectores VS Code aunque el brownfield tuviera ambas superficies activas',
    ajustes['chat.agentFilesLocations']['.github/agents'] === true &&
    ajustes['chat.agentFilesLocations']['.claude/agents'] === false &&
    ajustes['chat.agentSkillsLocations']['.agents/skills'] === true &&
    ajustes['chat.agentSkillsLocations']['.claude/skills'] === false);

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

  // Simula dos artefactos gestionados por v0.3.0 que v0.3.1 retira. El primero
  // sigue intacto y se puede podar; el segundo fue personalizado y se conserva.
  const retirado = join(d, '.github/prompts/sdd-init.prompt.md');
  const modificado = join(d, '.cursor/commands/sdd-specify.md');
  mkdirSync(dirname(retirado), { recursive: true });
  mkdirSync(dirname(modificado), { recursive: true });
  const CONTENIDO_ANTERIOR = '# gestionado por v0.3.0\n';
  writeFileSync(retirado, CONTENIDO_ANTERIOR, 'utf8');
  writeFileSync(modificado, CONTENIDO_ANTERIOR, 'utf8');
  const registroRuta = join(d, '.sdd/installed.json');
  const registro = JSON.parse(leer(registroRuta));
  registro.files['.github/prompts/sdd-init.prompt.md'] = { hash: hash(CONTENIDO_ANTERIOR), policy: 'managed' };
  registro.files['.cursor/commands/sdd-specify.md'] = { hash: hash(CONTENIDO_ANTERIOR), policy: 'managed' };
  writeFileSync(registroRuta, `${JSON.stringify(registro, null, 2)}\n`, 'utf8');
  writeFileSync(modificado, `${CONTENIDO_ANTERIOR}# ajuste local\n`, 'utf8');

  const migracion = sdd(d, 'update');
  comprueba('update poda un comando retirado si seguía intacto', !existsSync(retirado));
  comprueba('update conserva un comando retirado modificado', existsSync(modificado));
  comprueba('update avisa del retirado modificado',
    /retirad|obsolet|preserv/i.test(migracion.stdout || '') && /sdd-specify\.md/.test(migracion.stdout || ''));
  const registroMigrado = JSON.parse(leer(registroRuta));
  comprueba('update quita los artefactos retirados del registro de propiedad',
    !registroMigrado.files['.github/prompts/sdd-init.prompt.md'] &&
    !registroMigrado.files['.cursor/commands/sdd-specify.md']);

  const repetida = sdd(d, 'update');
  comprueba('una segunda actualización mantiene la migración idempotente',
    repetida.status === 0 && !existsSync(retirado) && existsSync(modificado) &&
    !/sdd-specify\.md.*(?:eliminado|preservado)/i.test(repetida.stdout || ''));
}

// ─── 4 bis · contrato explícito de empaquetado ───────────────────────────────
console.log('\n4 ter · migración de estado de producto previo a v0.4.0');
{
  const d = nuevoDestino();
  sdd(d, 'init');
  const registroRuta = join(d, '.sdd/installed.json');
  const anterior = JSON.parse(leer(registroRuta));
  delete anterior.product;
  anterior.version = '0.3.1';
  writeFileSync(registroRuta, `${JSON.stringify(anterior, null, 2)}\n`, 'utf8');

  const actualizacion = sdd(d, 'update');
  const migrado = JSON.parse(leer(registroRuta));
  comprueba('update desde v0.3.1 crea legacy-pending sin asumir aprobación',
    actualizacion.status === 0 && migrado.product?.status === 'legacy-pending');
  const estricto = spawnSync(process.execPath, ['scripts/check-sdd.mjs', '--strict'], { cwd: d, encoding: 'utf8' });
  comprueba('legacy-pending avisa pero no rompe el gate estricto',
    estricto.status === 0 && /legacy-pending/i.test(estricto.stdout || ''));
}

console.log('\n4 bis · allowlist de distribución npm');
{
  const paquete = JSON.parse(leer(join(ORIGEN, 'package.json')) || '{}');
  const allowlist = paquete.files || [];
  comprueba('package.json declara una allowlist no vacía', Array.isArray(allowlist) && allowlist.length > 0);
  comprueba('la allowlist contiene el runtime y los defaults portables',
    allowlist.some((ruta) => /scripts\/install\.mjs/.test(ruta)) &&
    allowlist.some((ruta) => /scripts\/lib\/manifiesto\.mjs/.test(ruta)) &&
    allowlist.includes('.gitignore'));
  comprueba('existe .npmignore defensivo', existsSync(join(ORIGEN, '.npmignore')));

  // Una allowlist incompleta no rompe nada aquí: rompe en el `npx` de otra persona, con la
  // skill instalada y el documento que enlaza ausente. Se comprueba fichero a fichero.
  const cubierto = (ruta) => allowlist.some((entrada) => ruta === entrada || ruta.startsWith(`${entrada}/`));
  const imprescindibles = [
    'docs/quality/DEFINITION-OF-DONE.md', 'docs/quality/TEST-STRATEGY.md',
    'docs/quality/METRICS.md', 'docs/quality/TECH-DEBT.md',
    'docs/quality/_TEMPLATE.executive-summary.md',
    'docs/ops/OBSERVABILITY.md', 'docs/ops/runbooks/_TEMPLATE.md',
    'docs/design/USABILITY-CHECKLIST.md',
    'docs/architecture/PATTERNS.md', 'docs/sdd/OPERATING-MODEL.md',
    '.sdd/githooks/pre-commit', '.sdd/githooks/pre-push',
    '.agents/skills/observability/SKILL.md', '.claude/skills/observability/SKILL.md',
    'scripts/sdd-project.mjs', 'scripts/check-sdd.mjs', 'scripts/scan-secrets.mjs',
  ];
  const ausentes = imprescindibles.filter((ruta) => !cubierto(ruta));
  comprueba(`la allowlist publica toda la doctrina vinculante${ausentes.length ? ` (falta: ${ausentes.join(', ')})` : ''}`,
    ausentes.length === 0);

  // Toda skill canónica viaja con su adaptador: si una de las dos se queda fuera, el host
  // descubre un comando que no existe o pierde el procedimiento entero.
  const skillsCanonicas = readdirSync(join(ORIGEN, '.agents/skills'), { withFileTypes: true })
    .filter((entrada) => entrada.isDirectory() && !entrada.name.startsWith('_'))
    .map((entrada) => entrada.name);
  comprueba('la allowlist cubre las skills canónicas y sus adaptadores',
    skillsCanonicas.length > 0 &&
    skillsCanonicas.every((skill) => cubierto(`.agents/skills/${skill}/SKILL.md`) && cubierto(`.claude/skills/${skill}/SKILL.md`)));
  const serializada = JSON.stringify(allowlist);
  comprueba('la allowlist no publica globs locales ni historia activa',
    !/\.claude\/\*\*|\.sdd\/\*\*|docs\/specs\/\*\*|scripts\/test-install\.mjs/.test(serializada));
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
