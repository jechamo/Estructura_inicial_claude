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
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, readdirSync, rmSync, symlinkSync } from 'node:fs';
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

function seguridad_versionada(destino) {
  const checklist = leer(join(destino, 'docs/security/SECURITY-CHECKLIST.md')) || '';
  return /OWASP Top 10:2025/.test(checklist) && /ASVS 5\.0\.0/.test(checklist) &&
    Array.from({ length: 10 }, (_, i) => `A${String(i + 1).padStart(2, '0')}:2025`)
      .every((categoria) => checklist.includes(categoria));
}

function contrato_jwt(destino) {
  const tokens = leer(join(destino, 'docs/security/AUTH-TOKENS.md')) || '';
  return /alg\s*:\s*none/i.test(tokens) &&
    ['iss', 'aud', 'sub', 'iat', 'exp', 'nbf', 'jti'].every((claim) => new RegExp(`\\b${claim}\\b`).test(tokens)) &&
    /firma|signature/i.test(tokens) && /rotaci[oó]n de claves|key rotation/i.test(tokens) &&
    /refresh token rotation/i.test(tokens) && /reuse detection/i.test(tokens) &&
    /revocaci[oó]n|revocation/i.test(tokens) && /logout/i.test(tokens) &&
    /roles|scopes/i.test(tokens) && /401/.test(tokens) && /403/.test(tokens) && /IDOR/.test(tokens) &&
    /URL|query/i.test(tokens) && /logs?/i.test(tokens) &&
    /no (?:se )?(?:impone|presupone|activa).*JWT/i.test(tokens);
}

function csrf_no_samesite_solo(destino) {
  const tokens = leer(join(destino, 'docs/security/AUTH-TOKENS.md')) || '';
  return /SameSite[\s\S]{0,220}(?:no sustituye|no reemplaza|defensa en profundidad)/i.test(tokens) &&
    /HttpOnly/i.test(tokens) && /Secure/i.test(tokens) && /CSRF/i.test(tokens) &&
    /GET[\s\S]{0,100}(?:no muta|no debe mutar|sin mutaci[oó]n|no cambia(?:n)? estado)/i.test(tokens) &&
    /Bearer[\s\S]{0,220}(?:cookie|CSRF)/i.test(tokens);
}

function matriz_seguridad(destino) {
  const spec = leer(join(destino, 'docs/specs/_TEMPLATE/spec.md')) || '';
  const plan = leer(join(destino, 'docs/specs/_TEMPLATE/plan.md')) || '';
  const tasks = leer(join(destino, 'docs/specs/_TEMPLATE/tasks.md')) || '';
  const tests = leer(join(destino, 'docs/specs/_TEMPLATE/test-plan.md')) || '';
  const evidence = leer(join(destino, 'docs/specs/_TEMPLATE/evidence.md')) || '';
  return /Impacto de seguridad/.test(spec) &&
    /Control\s*\|\s*ASVS\s*\|\s*OWASP\s*\|\s*Aplica\s*\|\s*Decisión \/ justificación\s*\|\s*Tarea\s*\|\s*Test\s*\|\s*Evidencia/.test(plan) &&
    /Controles de seguridad/.test(tasks) && /abuso|negativ/i.test(tests) &&
    /Informe de seguridad/.test(evidence) && /Controles de seguridad ejecutados/.test(evidence);
}

/** La cadena de usabilidad debe existir entera en las plantillas, igual que la de seguridad. */
function usabilidad_versionada(destino) {
  const spec = leer(join(destino, 'docs/specs/_TEMPLATE/spec.md')) || '';
  const plan = leer(join(destino, 'docs/specs/_TEMPLATE/plan.md')) || '';
  const tasks = leer(join(destino, 'docs/specs/_TEMPLATE/tasks.md')) || '';
  const tests = leer(join(destino, 'docs/specs/_TEMPLATE/test-plan.md')) || '';
  const evidence = leer(join(destino, 'docs/specs/_TEMPLATE/evidence.md')) || '';
  return /Impacto de usabilidad/.test(spec) &&
    /Clasificación de usabilidad/.test(spec) &&
    /Control\s*\|\s*WCAG 2\.2\s*\|\s*Heurística\s*\|\s*Aplica\s*\|\s*Decisión \/ justificación\s*\|\s*Tarea\s*\|\s*Test\s*\|\s*Evidencia/.test(plan) &&
    /Controles de usabilidad/.test(tasks) && /hostil|accesibilidad/i.test(tests) &&
    /Informe de usabilidad/.test(evidence) && /Controles de usabilidad ejecutados/.test(evidence) &&
    /sdd-usability-report:v1/.test(evidence);
}

/** El contrato instalado declara usabilidad con sus estándares y su umbral de exigencia. */
function contrato_usabilidad_instalado(destino) {
  let registro;
  try { registro = JSON.parse(leer(join(destino, '.sdd/installed.json')) || 'null'); }
  catch { return false; }
  const u = registro?.usability;
  return !!u && u.schemaVersion === 1 &&
    ['bootstrap', 'legacy-pending'].includes(u.status) &&
    u.standards?.wcag === '2.2' && u.standards?.level === 'AA' &&
    u.standards?.heuristics === 'nielsen-10' &&
    /^\d{3}$/.test(String(u.enforceFromSpec || ''));
}

/** La doctrina y las reglas por glob llegan a los hosts que no leen agentes. */
function portabilidad_usabilidad(destino) {
  const indice = leer(join(destino, 'docs/README.md')) || '';
  const cursor = leer(join(destino, '.cursor/rules/40-usability.mdc')) || '';
  const copilot = leer(join(destino, '.github/instructions/usability.instructions.md')) || '';
  const globCubreUI = (texto) => /tsx|jsx|vue|svelte/.test(texto);
  return /design\/A11Y-CHECKLIST\.md/.test(indice) &&
    /design\/USABILITY-CHECKLIST\.md/.test(indice) &&
    existsSync(join(destino, 'docs/design/A11Y-CHECKLIST.md')) &&
    existsSync(join(destino, 'docs/design/USABILITY-CHECKLIST.md')) &&
    existsSync(join(destino, 'docs/design/reports')) &&
    !!cursor && globCubreUI(cursor) && /WCAG 2\.2/.test(cursor) &&
    !!copilot && globCubreUI(copilot) && /WCAG 2\.2/.test(copilot);
}

/**
 * Quien audita usabilidad no puede ser quien la diseña, y no se crea un agente número 21 para
 * ello: `code-reviewer` ya es de solo lectura y `ux-designer` conserva su escritura.
 */
function auditor_usabilidad_no_es_el_disenador(destino) {
  const revisor = leer(join(destino, '.claude/agents/code-reviewer.md')) || '';
  const disenador = leer(join(destino, '.claude/agents/ux-designer.md')) || '';
  const toolsRevisor = revisor.match(/^---\s*\n([\s\S]*?)\n---/)?.[1]?.match(/^tools:\s*(.+)$/m)?.[1] || '';
  const toolsDisenador = disenador.match(/^---\s*\n([\s\S]*?)\n---/)?.[1]?.match(/^tools:\s*(.+)$/m)?.[1] || '';
  return /\bRead\b/.test(toolsRevisor) && !/\b(?:Write|Edit|Agent)\b/.test(toolsRevisor) &&
    /WCAG 2\.2/.test(revisor) && /- Veredicto de usabilidad:/.test(revisor) &&
    /\bWrite\b/.test(toolsDisenador) &&
    /code-reviewer/.test(disenador);
}

/** El HANDOFF conserva la usabilidad después del diseño; si no, se pierde en el primer salto. */
function handoff_arrastra_usabilidad(destino) {
  const perfiles = ['planner', 'implementer', 'frontend-expert', 'code-reviewer'];
  return perfiles.every((nombre) => {
    const perfil = leer(join(destino, `.claude/agents/${nombre}.md`)) || '';
    const handoff = perfil.split('### HANDOFF')[1] || '';
    return /[Uu]sabilidad/.test(handoff);
  });
}

function workflow_supply_chain(destino) {
  const ci = leer(join(destino, '.github/workflows/sdd-gates.yml')) || '';
  const referencias = [...ci.matchAll(/uses:\s*[^@\s]+@([^\s#]+)/g)].map((m) => m[1]);
  return !!ci && referencias.length > 0 && referencias.every((ref) => /^[0-9a-f]{40}$/.test(ref)) &&
    (ci.match(/persist-credentials:\s*false/g) || []).length === 2 &&
    /scan-secrets\.mjs/.test(ci) && /run --fast/.test(ci) && /run --slow/.test(ci) &&
    !/test-install\.mjs|\b(?:npm|pnpm|yarn)\s+(?:ci|run|audit)\b|upload-artifact@v\d/.test(ci);
}

function portabilidad_seguridad(destino) {
  const indice = leer(join(destino, 'docs/README.md')) || '';
  return /security\/AUTH-TOKENS\.md/.test(indice) &&
    /security\/SECURITY-CHECKLIST\.md/.test(indice) &&
    existsSync(join(destino, '.codex/agents/security-auditor.toml')) &&
    existsSync(join(destino, '.cursor/agents/security-auditor.md')) &&
    existsSync(join(destino, '.github/agents/security-auditor.agent.md'));
}

function contrato_auditor_solo_lectura(destino) {
  const perfil = leer(join(destino, '.claude/agents/security-auditor.md')) || '';
  const cabecera = perfil.match(/^---\s*\n([\s\S]*?)\n---/)?.[1] || '';
  const tools = cabecera.match(/^tools:\s*(.+)$/m)?.[1] || '';
  const camposHandoff = [
    'Agente origen', 'Fase completada', 'Fuentes consultadas', 'Estándares', 'Alcance',
    'Controles evaluados', 'Evidencias y comandos', 'Hallazgos', 'Riesgos aceptados',
    'Controles no ejecutados', 'Veredicto', 'Informe a materializar', 'Siguiente agente sugerido',
    'Comando / contexto durable',
  ];
  return /\bRead\b/.test(tools) && !/\b(?:Write|Edit|Agent)\b/.test(tools) &&
    /auditor de seguridad de solo lectura/i.test(perfil) && /### HANDOFF/.test(perfil) &&
    camposHandoff.every((campo) => perfil.includes(`- ${campo}:`));
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
  comprueba('instala /docs-sync como skill canónica sin comandos paralelos',
    existsSync(join(d, '.agents/skills/docs-sync/SKILL.md')) &&
    !existsSync(join(d, '.github/prompts/docs-sync.prompt.md')) &&
    !existsSync(join(d, '.cursor/commands/docs-sync.md')));
  comprueba('el adaptador Claude de /docs-sync apunta a la fuente canónica',
    (leer(join(d, '.claude/skills/docs-sync/SKILL.md')) || '')
      .includes('.agents/skills/docs-sync/SKILL.md'));
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
  comprueba('mantiene paridad exacta de 20 agentes en seis hosts y 26 skills sin duplicados',
    readdirSync(join(d, '.claude/agents')).filter((f) => f.endsWith('.md')).length === 20 &&
    readdirSync(join(d, '.github/agents')).filter((f) => f.endsWith('.agent.md')).length === 20 &&
    readdirSync(join(d, '.cursor/agents')).filter((f) => f.endsWith('.md')).length === 20 &&
    readdirSync(join(d, '.codex/agents')).filter((f) => f.endsWith('.toml')).length === 20 &&
    existsSync(join(d, '.agents/agents')) &&
    readdirSync(join(d, '.agents/agents')).filter((f) => f.endsWith('.md')).length === 20 &&
    existsSync(join(d, '.gemini/agents')) &&
    readdirSync(join(d, '.gemini/agents')).filter((f) => f.endsWith('.md')).length === 20 &&
    readdirSync(join(d, '.agents/skills'), { withFileTypes: true }).filter((e) => e.isDirectory()).length === 26 &&
    readdirSync(join(d, '.claude/skills'), { withFileTypes: true }).filter((e) => e.isDirectory()).length === 26);
  comprueba('los adaptadores permiten planificar seguridad y materializar el handoff sin escribir desde el auditor', (() => {
    const plannerGithub = leer(join(d, '.github/agents/planner.agent.md')) || '';
    const orchestratorGithub = leer(join(d, '.github/agents/orchestrator.agent.md')) || '';
    const plannerCursor = leer(join(d, '.cursor/agents/planner.md')) || '';
    const orchestratorCursor = leer(join(d, '.cursor/agents/orchestrator.md')) || '';
    return /agents:[^\n]*security-auditor/.test(plannerGithub) &&
      /agents:[^\n]*docs-writer/.test(orchestratorGithub) &&
      /security-auditor/.test(plannerCursor) && /docs-writer/.test(orchestratorCursor) &&
      /solo lectura|read-only/i.test(leer(join(d, '.github/agents/security-auditor.agent.md')) || '');
  })());
  comprueba('el auditor canónico no puede escribir, editar ni delegar y conserva HANDOFF material',
    contrato_auditor_solo_lectura(d));
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
  comprueba('greenfield instala el contrato documental vacío en audit', (() => {
    try {
      const docs = JSON.parse(leer(join(d, '.sdd/docs.json')) || '{}');
      return docs.schemaVersion === 1 && docs.mode === 'audit' &&
        Array.isArray(docs.documentSets) && docs.documentSets.length === 0;
    } catch { return false; }
  })());
  comprueba('greenfield exige documentación desde la primera spec', (() => {
    const documentation = JSON.parse(leer(join(d, '.sdd/installed.json')) || '{}').documentation;
    return documentation?.schemaVersion === 1 && documentation.status === 'bootstrap' &&
      documentation.enforceFromSpec === '001';
  })());
  comprueba('greenfield nace con baseline de producto pendiente', (() => {
    const registro = JSON.parse(leer(join(d, '.sdd/installed.json')) || '{}');
    return registro.product?.status === 'bootstrap' &&
      ['PRD.md', 'USE-CASES.md', 'FEATURE-MAP.md', 'SOURCES.md']
        .every((nombre) => existsSync(join(d, 'docs/product', nombre)));
  })());
  comprueba('greenfield registra contrato de seguridad desde la primera spec', (() => {
    const security = JSON.parse(leer(join(d, '.sdd/installed.json')) || '{}').security;
    return security?.schemaVersion === 1 && security.status === 'bootstrap' &&
      security.enforceFromSpec === '001' && security.standards?.owaspTop10 === '2025' &&
      security.standards?.asvs === '5.0.0' && security.standards?.level === 'L2';
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
        c.unconfigured?.includes('security') &&
        !Object.values(c.checks || {}).some((x) => /npm |pytest|gradle|mvn /.test(x?.command || ''));
    } catch { return false; }
  })());
  comprueba('el tooling documental nace opt-in y sin inventar Swagger, Storybook o TypeDoc', (() => {
    try {
      const c = JSON.parse(leer(join(d, '.sdd/checks.json')) || '{}');
      const comandos = Object.entries(c.checks || {})
        .filter(([id]) => id === 'docs' || id.startsWith('docs:'))
        .map(([, check]) => check?.command || '');
      return c.unconfigured?.includes('docs') && comandos.length === 0 &&
        !/swagger|storybook|typedoc/i.test(JSON.stringify(c));
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
  comprueba('instala doctrina versionada OWASP y ASVS sin decidir el stack', seguridad_versionada(d));
  comprueba('instala contrato completo JWT, refresh y autorización', contrato_jwt(d));
  comprueba('CSRF no descansa únicamente en SameSite', csrf_no_samesite_solo(d));
  comprueba('las plantillas propagan impacto, controles y abuso hasta la evidencia', matriz_seguridad(d));
  comprueba('las plantillas propagan DOC-ID desde impacto hasta evidencia', (() => {
    const spec = leer(join(d, 'docs/specs/_TEMPLATE/spec.md')) || '';
    const plan = leer(join(d, 'docs/specs/_TEMPLATE/plan.md')) || '';
    const tasks = leer(join(d, 'docs/specs/_TEMPLATE/tasks.md')) || '';
    const tests = leer(join(d, 'docs/specs/_TEMPLATE/test-plan.md')) || '';
    const evidence = leer(join(d, 'docs/specs/_TEMPLATE/evidence.md')) || '';
    return /Impacto de documentaci[oó]n/.test(spec) &&
      ['aplicable', 'no-aplica', 'docs-pending'].every((estado) => spec.includes(estado)) &&
      /no-aplica[\s\S]{0,120}(?:motivo|justificaci[oó]n)/i.test(spec) &&
      /DOC-ID[\s\S]{0,500}superficie[\s\S]{0,500}fuente de verdad[\s\S]{0,500}artefacto/i.test(plan) &&
      /Documentaci[oó]n[^\n]*DOC-/i.test(tasks) && /DOC-ID/.test(tests) &&
      /DOC-ID[\s\S]{0,500}tarea[\s\S]{0,500}artefacto[\s\S]{0,500}(?:comprobaci[oó]n|resultado)/i.test(evidence);
  })());
  comprueba('docs-writer tiene ownership acotado y devuelve el handoff al invocador', (() => {
    const perfil = leer(join(d, '.claude/agents/docs-writer.md')) || '';
    const mantiene = perfil.match(/## Qu[eé] mantienes([\s\S]*?)(?:\n## |$)/i)?.[1] || '';
    return /README\.md|docs\/guides|docs\/api/.test(mantiene) &&
      /\.sdd\/docs\.json/.test(mantiene) && /tools:[^\n]*\bBash\b/.test(perfil) &&
      !/docs\/product|docs\/specs|architecture\/adr|bit[aá]cora|CHANGELOG/i.test(mantiene) &&
      /Devuelvo control a:\s*<agente que me invoc[oó]>/i.test(perfil);
  })());
  comprueba('orchestrator e implementer pueden delegar docs-only y tareas documentales', (() => {
    const rutas = [
      '.claude/agents/orchestrator.md', '.claude/agents/implementer.md',
      '.github/agents/orchestrator.agent.md', '.github/agents/implementer.agent.md',
      '.cursor/agents/orchestrator.md', '.cursor/agents/implementer.md',
      '.codex/agents/orchestrator.toml', '.codex/agents/implementer.toml',
      '.agents/agents/orchestrator.md', '.agents/agents/implementer.md',
      '.gemini/agents/orchestrator.md', '.gemini/agents/implementer.md',
    ];
    return rutas.every((ruta) => /docs-writer/.test(leer(join(d, ruta)) || ''));
  })());
  comprueba('la doctrina de seguridad es descubrible y portable entre hosts', portabilidad_seguridad(d));
  comprueba('la cadena de usabilidad llega entera a las plantillas de spec', usabilidad_versionada(d));
  comprueba('el contrato usability queda declarado en installed.json', contrato_usabilidad_instalado(d));
  comprueba('la doctrina de usabilidad es descubrible y portable entre hosts', portabilidad_usabilidad(d));
  comprueba('quien audita usabilidad no es quien la diseña, y no hay agente nuevo',
    auditor_usabilidad_no_es_el_disenador(d));
  comprueba('el HANDOFF arrastra la usabilidad más allá del diseño', handoff_arrastra_usabilidad(d));
  comprueba('a11y queda declarado sin configurar: la plantilla no presupone runner', (() => {
    const checks = JSON.parse(leer(join(d, '.sdd/checks.json')) || '{}');
    const pendientes = checks.unconfigured || [];
    return pendientes.includes('a11y') && !Object.keys(checks.checks || {}).includes('a11y');
  })());
  comprueba('instala dirección visual mínima y conserva la guía aparte',
    existsSync(join(d, 'docs/design/DIRECTION-GUIDE.md')) &&
    !/frontend-design|theme-factory|canvas-design/.test(leer(join(d, 'docs/design/DIRECCION-VISUAL.md')) || ''));
  comprueba('solo instala la plantilla de ADR',
    existsSync(join(d, 'docs/architecture/adr/_TEMPLATE.md')) &&
    !existsSync(join(d, 'docs/architecture/adr/ADR-0000-plantilla.md')));
  comprueba('el CI instalado es universal y no prueba la plantilla', workflow_supply_chain(d));
  comprueba('el CI documental obtiene historial y pasa un SHA base exacto al gate', (() => {
    const ci = leer(join(d, '.github/workflows/sdd-gates.yml')) || '';
    return /fetch-depth:\s*0/.test(ci) && /pull_request\.base\.sha|github\.event\.before/.test(ci) &&
      /--docs-diff\s+--base/.test(ci) && /push:[\s\S]{0,80}branches:/.test(ci) &&
      !/continue-on-error:\s*true/.test(ci);
  })());
  comprueba('el pre-push documental resuelve una base y falla cerrado si no puede', (() => {
    const hook = leer(join(d, '.sdd/githooks/pre-push')) || '';
    return /--docs-diff\s+--base/.test(hook) && /local_sha\^\{commit\}/.test(hook) &&
      /refs\/tags\/\*/.test(hook) && /exit\s+1|NO EJECUTADO/i.test(hook);
  })());
  comprueba('el instalador explica qué versionar y qué conservar local',
    /versionar|subir|commit/i.test(r.stdout || '') &&
    /local|no versionar|excluid/i.test(r.stdout || '') &&
    /git status/i.test(r.stdout || ''));

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

  const sinAuditoriaInventada = nuevoDestino();
  writeFileSync(join(sinAuditoriaInventada, 'package.json'), '{"name":"yarn-app"}\n', 'utf8');
  writeFileSync(join(sinAuditoriaInventada, 'yarn.lock'), '# lockfile v1\n', 'utf8');
  writeFileSync(join(sinAuditoriaInventada, 'Cargo.toml'), '[package]\nname="rust-app"\nversion="0.1.0"\n', 'utf8');
  sdd(sinAuditoriaInventada, 'init');
  const detectSinHerramienta = spawnSync(process.execPath,
    ['scripts/sdd-project.mjs', 'detect', '--json'], { cwd: sinAuditoriaInventada, encoding: 'utf8' });
  const sinHerramienta = JSON.parse(detectSinHerramienta.stdout || '{}');
  comprueba('detect no inventa yarn audit ni cargo audit sin herramienta declarada',
    detectSinHerramienta.status === 0 &&
    !Object.values(sinHerramienta.suggestions || {}).some((s) => /yarn audit|cargo audit/.test(s.command || '')));

  const inventory = spawnSync(process.execPath, ['scripts/sdd-project.mjs', 'inventory', '--json'], { cwd: d, encoding: 'utf8' });
  let inventario = null;
  try { inventario = JSON.parse(inventory.stdout || 'null'); } catch { /* lo informa la aserción */ }
  comprueba('inventory cuenta agentes y skills canónicos',
    inventory.status === 0 && inventario?.agents === 20 && inventario?.skills === 26);

  comprueba('la skill observability se instala con su adaptador Claude',
    existsSync(join(d, '.agents/skills/observability/SKILL.md')) &&
    existsSync(join(d, '.claude/skills/observability/SKILL.md')));

  comprueba('los git hooks viajan con la plantilla',
    existsSync(join(d, '.sdd/githooks/pre-commit')) && existsSync(join(d, '.sdd/githooks/pre-push')));

  // Los hooks compartidos se versionan, pero el instalador no muta Git, Husky ni package.json.
  // La activación es una decisión local y se muestra como comando explícito.
  {
    const nodo = nuevoDestino();
    spawnSync('git', ['init', '-q', '.'], { cwd: nodo, encoding: 'utf8' });
    writeFileSync(join(nodo, 'package.json'), '{"name":"n","version":"1.0.0"}\n', 'utf8');
    const instalacionNodo = sdd(nodo, 'init', nodo, '--mode', 'auto');
    comprueba('en Node no crea Husky y explica la activación manual',
      !existsSync(join(nodo, '.husky')) &&
      /git config core\.hooksPath \.sdd\/githooks|hooks.*manual/i.test(instalacionNodo.stdout || ''));
    // El package.json es del usuario: se propone el cambio, no se aplica.
    comprueba('en Node no modifica el package.json del proyecto',
      !JSON.parse(leer(join(nodo, 'package.json'))).scripts);

    const py = nuevoDestino();
    spawnSync('git', ['init', '-q', '.'], { cwd: py, encoding: 'utf8' });
    writeFileSync(join(py, 'pyproject.toml'), '[project]\nname="x"\n', 'utf8');
    sdd(py, 'init', py, '--mode', 'auto');
    const rutaHooks = spawnSync('git', ['config', '--get', 'core.hooksPath'], { cwd: py, encoding: 'utf8' });
    comprueba('sin Node tampoco muta core.hooksPath ni crea .husky',
      !(rutaHooks.stdout || '').trim() && !existsSync(join(py, '.husky')));

    const sin = nuevoDestino();
    spawnSync('git', ['init', '-q', '.'], { cwd: sin, encoding: 'utf8' });
    writeFileSync(join(sin, 'package.json'), '{"name":"s","version":"1.0.0"}\n', 'utf8');
    sdd(sin, 'init', sin, '--mode', 'auto', '--no-hooks');
    const sinRuta = spawnSync('git', ['config', '--get', 'core.hooksPath'], { cwd: sin, encoding: 'utf8' });
    comprueba('--no-hooks no toca ni git ni el proyecto',
      !existsSync(join(sin, '.husky')) && (sinRuta.stdout || '').trim() !== '.sdd/githooks');
  }

  const checksInstalados = JSON.parse(leer(join(d, '.sdd/checks.json')));
  comprueba('checks.json nace sin comandos de stack y con el vocabulario ampliado',
    Object.keys(checksInstalados.checks).length === 1 && checksInstalados.checks.sdd &&
    ['coverage', 'e2e', 'smells', 'a11y', 'deps-audit', 'docs', 'security'].every((g) => checksInstalados.unconfigured.includes(g)));

  const rapidos = spawnSync(process.execPath, ['scripts/sdd-project.mjs', 'run', '--fast', '--json'], { cwd: d, encoding: 'utf8' });
  const lentos = spawnSync(process.execPath, ['scripts/sdd-project.mjs', 'run', '--slow', '--json'], { cwd: d, encoding: 'utf8' });
  let salidaRapidos = null;
  let salidaLentos = null;
  try { salidaRapidos = JSON.parse((rapidos.stdout || '').trim().split('\n').pop() || 'null'); } catch { /* lo informa la aserción */ }
  try { salidaLentos = JSON.parse((lentos.stdout || '').trim().split('\n').pop() || 'null'); } catch { /* lo informa la aserción */ }
  comprueba('run --fast y --slow reparten los gates por velocidad',
    salidaRapidos?.results?.some((r) => r.id === 'sdd') === true &&
    salidaLentos?.results?.length === 0 && salidaLentos?.skipped?.includes('sdd') &&
    salidaLentos?.status === 'unconfigured' && salidaLentos?.unconfigured?.includes('security'));
  const lentosHumanos = spawnSync(process.execPath, ['scripts/sdd-project.mjs', 'run', '--slow'], { cwd: d, encoding: 'utf8' });
  comprueba('cero gates lentos se declara NO EJECUTADO, nunca PASS',
    lentosHumanos.status === 0 && /NO EJECUTADO/.test(lentosHumanos.stdout || '') &&
    !/: PASS/.test(lentosHumanos.stdout || ''));

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
console.log('\n1 quinquies · gate de seguridad determinista');
function gate_security_e_informe() {
  const d = nuevoDestino();
  writeFileSync(join(d, 'package.json'), JSON.stringify({
    name: 'brownfield-security',
    scripts: {
      security: 'node -e "process.exit(7)"',
      'security:scan': 'node -e "process.exit(8)"',
      'test:security': 'node -e "process.exit(9)"',
    },
  }, null, 2), 'utf8');
  sdd(d, 'init');

  const detect = spawnSync(process.execPath, ['scripts/sdd-project.mjs', 'detect', '--json'], { cwd: d, encoding: 'utf8' });
  let detectado = null;
  try { detectado = JSON.parse(detect.stdout || 'null'); } catch { /* lo informa la aserción */ }
  comprueba('detect propone security solo cuando existe y con precedencia estable',
    detect.status === 0 && detectado?.suggestions?.security?.command === 'npm run security' &&
    detectado?.suggestions?.security?.required === true && detectado?.suggestions?.security?.speed === 'slow');

  const configured = spawnSync(process.execPath,
    ['scripts/sdd-project.mjs', 'configure', '--accept-detected', '--json'], { cwd: d, encoding: 'utf8' });
  const checks = JSON.parse(leer(join(d, '.sdd/checks.json')) || '{}');
  comprueba('configure activa el gate security real como lento y obligatorio',
    configured.status === 0 && checks.checks?.security?.required === true && checks.checks?.security?.speed === 'slow' &&
    !checks.unconfigured?.includes('security'));
  const slow = spawnSync(process.execPath, ['scripts/sdd-project.mjs', 'run', '--slow', '--json'], { cwd: d, encoding: 'utf8' });
  comprueba('run --slow ejecuta security y propaga su fallo',
    slow.status === 1 && /"id":"security"/.test((slow.stdout || '').replace(/\s/g, '')));

  const specDir = join(d, 'docs/specs/901-security-report');
  mkdirSync(specDir, { recursive: true });
  writeFileSync(join(specDir, 'spec.md'), `# Spec
| Estado | aprobada |
|---|---|
| Impacto de seguridad | sensible |
| Impacto de usabilidad | sin-ui · fixture técnico sin interfaz |
| Impacto de documentación | no-aplica · fixture técnico del gate de seguridad |
| RF-01 | El sistema DEBE verificar el gate. | M | 1 |
### CA-01 · Gate bloqueante
`, 'utf8');
  writeFileSync(join(specDir, 'plan.md'), `# Plan
| Control | ASVS | OWASP | Aplica | Decisión / justificación | Tarea | Test | Evidencia |
|---|---|---|---|---|---|---|---|
| SEC-GATE-001 | v5.0.0-1.1.1 | A02:2025 | sí | Validar informe estructurado | T-901-01 | tests/security.test.mjs::report | evidence.md#SEC-GATE-001 |
`, 'utf8');
  writeFileSync(join(specDir, 'tasks.md'), `# Tareas
### T-901-01 · Validar informe
- **Estado**: pendiente
- **Cubre**: RF-01, CA-01
- **Controles de seguridad**: SEC-GATE-001
- **Test que la define**: tests/security.test.mjs::report
`, 'utf8');
  writeFileSync(join(specDir, 'test-plan.md'), `# Plan de pruebas
| SEC-GATE-001 | CA-01 | tests/security.test.mjs::report | informe con ALTO abierto bloquea |
`, 'utf8');
  mkdirSync(join(d, 'tests'), { recursive: true });
  writeFileSync(join(d, 'tests/security.test.mjs'), 'export function report() { return "PASS"; }\n', 'utf8');
  writeFileSync(join(specDir, 'evidence.md'), `# Evidencia
| Estado | GO |
|---|---|
**Informe de seguridad**: \`docs/security/reports/2026-08-11-901-security-report.md\`
## Controles de seguridad ejecutados
| SEC-GATE-001 | T-901-01 | declared-direct | tests/security.test.mjs::report | verde |
## 3. Controles NO ejecutados
| Control | Motivo | Riesgo | Dueño | Paso |
|---|---|---|---|---|
| ninguno | todos ejecutados | ninguno | equipo | ninguno |
`, 'utf8');
  const qualityReport = join(d, 'docs/quality/reports/2026-08-11-901-security-report.md');
  writeFileSync(qualityReport, '# Calidad\nPASS\n', 'utf8');
  const securityReport = join(d, 'docs/security/reports/2026-08-11-901-security-report.md');
  const informe = ({
    high = 0, medium = 0, verdict = 'PASS', acceptedRisks = [], controlsNotExecuted = [],
    spec = '901-security-report', scope = 'diff', schemaVersion = 1,
    standards = { owaspTop10: '2025', asvs: '5.0.0', level: 'L2' },
    controlsEvaluated = ['SEC-GATE-001'], openFindings = null,
  } = {}) => `# Informe de seguridad
<!-- sdd-security-report:v1 -->
\`\`\`json
${JSON.stringify({
  schemaVersion,
  spec,
  standards,
  scope,
  controlsEvaluated,
  openFindings: openFindings || { critical: 0, high, medium, low: 0 },
  verdict,
  acceptedRisks,
  controlsNotExecuted,
}, null, 2)}
\`\`\`
`;
  writeFileSync(securityReport, informe({ high: 1 }), 'utf8');
  const altoAbierto = spawnSync(process.execPath,
    ['scripts/check-sdd.mjs', '--strict', '--spec', '901'], { cwd: d, encoding: 'utf8' });
  comprueba('GO se bloquea ante un ALTO abierto aunque el informe diga PASS',
    altoAbierto.status === 1 && /security|seguridad|ALTO|high|informe/i.test(altoAbierto.stdout || ''));

  writeFileSync(securityReport, informe(), 'utf8');
  const tareaPendiente = spawnSync(process.execPath,
    ['scripts/check-sdd.mjs', '--strict', '--spec', '901'], { cwd: d, encoding: 'utf8' });
  comprueba('GO se bloquea mientras una tarea de seguridad siga pendiente',
    tareaPendiente.status === 1 && /tarea.*no está hecha|seguridad\/trazabilidad/i.test(tareaPendiente.stdout || ''));
  writeFileSync(join(specDir, 'tasks.md'), (leer(join(specDir, 'tasks.md')) || '')
    .replace('- **Estado**: pendiente', '- **Estado**: hecho'), 'utf8');
  const valido = spawnSync(process.execPath,
    ['scripts/check-sdd.mjs', '--strict', '--spec', '901'], { cwd: d, encoding: 'utf8' });
  comprueba('informe estructurado válido permite verificar una spec sensible',
    valido.status === 0, (valido.stdout || '').slice(-260));

  const checksValidos = leer(join(d, '.sdd/checks.json')) || '';
  const checksDesactivados = JSON.parse(checksValidos);
  checksDesactivados.checks.security.enabled = false;
  writeFileSync(join(d, '.sdd/checks.json'), `${JSON.stringify(checksDesactivados, null, 2)}\n`, 'utf8');
  const gateDesactivado = spawnSync(process.execPath,
    ['scripts/check-sdd.mjs', '--strict', '--spec', '901'], { cwd: d, encoding: 'utf8' });
  comprueba('un gate security desactivado no satisface GO',
    gateDesactivado.status === 1 && /gate security configurado|required|slow/i.test(gateDesactivado.stdout || ''));
  writeFileSync(join(d, '.sdd/checks.json'), checksValidos, 'utf8');

  const evidenceValida = leer(join(specDir, 'evidence.md')) || '';
  writeFileSync(join(specDir, 'evidence.md'), evidenceValida.replace('| verde |', '| no ejecutado |'), 'utf8');
  const resultadoNoEjecutado = spawnSync(process.execPath,
    ['scripts/check-sdd.mjs', '--strict', '--spec', '901'], { cwd: d, encoding: 'utf8' });
  comprueba('evidence no acepta no ejecutado como resultado verde',
    resultadoNoEjecutado.status === 1 && /resultado verde ejecutado|trazabilidad/i.test(resultadoNoEjecutado.stdout || ''));
  writeFileSync(join(specDir, 'evidence.md'), evidenceValida, 'utf8');

  writeFileSync(join(specDir, 'evidence.md'), evidenceValida.replace('| Estado | GO |', '| Estado | NO-GO |'), 'utf8');
  writeFileSync(join(specDir, 'tasks.md'), (leer(join(specDir, 'tasks.md')) || '')
    .replace('tests/security.test.mjs::report', 'tests/security.test.mjs::otro'), 'utf8');
  const cadenaAntesDeGo = spawnSync(process.execPath,
    ['scripts/check-sdd.mjs', '--strict', '--spec', '901'], { cwd: d, encoding: 'utf8' });
  comprueba('la cadena exacta control-tarea-test-evidencia se exige antes de GO',
    cadenaAntesDeGo.status === 1 && /seguridad\/trazabilidad|no enlaza/i.test(cadenaAntesDeGo.stdout || ''));
  writeFileSync(join(specDir, 'tasks.md'), (leer(join(specDir, 'tasks.md')) || '')
    .replace('tests/security.test.mjs::otro', 'tests/security.test.mjs::report'), 'utf8');
  writeFileSync(join(specDir, 'evidence.md'), evidenceValida, 'utf8');

  const specValida = leer(join(specDir, 'spec.md')) || '';
  writeFileSync(join(specDir, 'spec.md'), specValida.replace(/^\| Impacto de seguridad[^\n]*\n/m, ''), 'utf8');
  const sinImpacto = spawnSync(process.execPath,
    ['scripts/check-sdd.mjs', '--strict', '--spec', '901'], { cwd: d, encoding: 'utf8' });
  comprueba('una spec posterior al umbral no puede omitir Impacto de seguridad',
    sinImpacto.status === 1 && /Impacto de seguridad|seguridad\/impacto/i.test(sinImpacto.stdout || ''));
  writeFileSync(join(specDir, 'spec.md'), specValida, 'utf8');

  const planValido = leer(join(specDir, 'plan.md')) || '';
  writeFileSync(join(specDir, 'plan.md'), planValido.replace('evidence.md#SEC-GATE-001', 'pendiente'), 'utf8');
  const matrizIncompleta = spawnSync(process.execPath,
    ['scripts/check-sdd.mjs', '--strict', '--spec', '901'], { cwd: d, encoding: 'utf8' });
  comprueba('una matriz sensible con evidencia pendiente bloquea',
    matrizIncompleta.status === 1 && /matriz|evidencia|seguridad/i.test(matrizIncompleta.stdout || ''));
  writeFileSync(join(specDir, 'plan.md'), planValido, 'utf8');

  writeFileSync(securityReport, '# Informe\n<!-- sdd-security-report:v1 -->\n```json\n{ roto }\n```\n', 'utf8');
  const jsonRoto = spawnSync(process.execPath,
    ['scripts/check-sdd.mjs', '--strict', '--spec', '901'], { cwd: d, encoding: 'utf8' });
  comprueba('un informe con JSON inválido bloquea GO',
    jsonRoto.status === 1 && /JSON.*inválido|informe/i.test(jsonRoto.stdout || ''));

  const rechazaInforme = (titulo, opciones, patron) => {
    writeFileSync(securityReport, informe(opciones), 'utf8');
    const salida = spawnSync(process.execPath,
      ['scripts/check-sdd.mjs', '--strict', '--spec', '901'], { cwd: d, encoding: 'utf8' });
    comprueba(titulo, salida.status === 1 && patron.test(salida.stdout || ''), (salida.stdout || '').slice(-180));
  };
  rechazaInforme('schemaVersion del informe es vinculante', { schemaVersion: 2 }, /schemaVersion|informe/i);
  rechazaInforme('estándar y nivel inválidos bloquean',
    { standards: { owaspTop10: '2021', asvs: '4.0.3', level: 'L4' } }, /estándar|estandar|ASVS|nivel/i);
  rechazaInforme('controlsEvaluated debe cubrir el control aplicable',
    { controlsEvaluated: [] }, /no evaluados|controlsEvaluated|informe/i);
  rechazaInforme('controlsEvaluated no admite duplicados',
    { controlsEvaluated: ['SEC-GATE-001', 'SEC-GATE-001'] }, /duplicados|controlsEvaluated/i);
  rechazaInforme('controlsEvaluated debe ser un array',
    { controlsEvaluated: 'SEC-GATE-001' }, /array|controlsEvaluated/i);
  rechazaInforme('controlsNotExecuted debe ser un array',
    { controlsNotExecuted: 'ninguno' }, /array|controlsNotExecuted/i);
  rechazaInforme('openFindings exige enteros no negativos',
    { openFindings: { critical: 0, high: -1, medium: 0.5, low: 0 } }, /entero no negativo|openFindings/i);
  rechazaInforme('un veredicto fuera del vocabulario bloquea', { verdict: 'UNKNOWN' }, /veredicto inválido|veredicto/i);
  rechazaInforme('PASS no admite hallazgos MEDIO abiertos', { medium: 1 }, /PASS.*MEDIO|veredicto/i);
  rechazaInforme('CONDITIONAL exige al menos un MEDIO real',
    { verdict: 'CONDITIONAL', acceptedRisks: [] }, /CONDITIONAL|riesgo|MEDIO/i);

  writeFileSync(securityReport, informe({ verdict: 'BLOCKED' }), 'utf8');
  const bloqueado = spawnSync(process.execPath,
    ['scripts/check-sdd.mjs', '--strict', '--spec', '901'], { cwd: d, encoding: 'utf8' });
  comprueba('BLOCKED bloquea incluso con conteos abiertos a cero',
    bloqueado.status === 1 && /BLOCKED|veredicto/i.test(bloqueado.stdout || ''));

  writeFileSync(securityReport, informe({ controlsNotExecuted: [{ control: 'SEC-GATE-001' }] }), 'utf8');
  const noEjecutado = spawnSync(process.execPath,
    ['scripts/check-sdd.mjs', '--strict', '--spec', '901'], { cwd: d, encoding: 'utf8' });
  comprueba('un control no ejecutado incompleto falla esquema y bloquea GO',
    noEjecutado.status === 1 && /reason.*risk.*owner.*nextStep|cada control no ejecutado/i.test(noEjecutado.stdout || '') &&
    /no ejecutados|veredicto/i.test(noEjecutado.stdout || ''));
  const controlNoEjecutadoCompleto = [{
    control: 'SEC-GATE-001', reason: 'runner no disponible', risk: 'cambio sensible sin validar',
    owner: 'security-owner', nextStep: 'habilitar runner antes de release',
  }];
  writeFileSync(securityReport, informe({ controlsNotExecuted: controlNoEjecutadoCompleto }), 'utf8');
  const noEjecutadoCompleto = spawnSync(process.execPath,
    ['scripts/check-sdd.mjs', '--strict', '--spec', '901'], { cwd: d, encoding: 'utf8' });
  comprueba('un control no ejecutado completo sigue bloqueando sin falso error de esquema',
    noEjecutadoCompleto.status === 1 && /controles de seguridad no ejecutados|veredicto/i.test(noEjecutadoCompleto.stdout || '') &&
    !/cada control no ejecutado necesita/i.test(noEjecutadoCompleto.stdout || ''));

  writeFileSync(securityReport, informe({ scope: 'TBD' }), 'utf8');
  const alcancePendiente = spawnSync(process.execPath,
    ['scripts/check-sdd.mjs', '--strict', '--spec', '901'], { cwd: d, encoding: 'utf8' });
  comprueba('los placeholders no cuentan como alcance material',
    alcancePendiente.status === 1 && /alcance|pendiente|informe/i.test(alcancePendiente.stdout || ''));
  writeFileSync(securityReport, informe({ scope: 'tbd' }), 'utf8');
  const alcancePendienteMinusculas = spawnSync(process.execPath,
    ['scripts/check-sdd.mjs', '--strict', '--spec', '901'], { cwd: d, encoding: 'utf8' });
  comprueba('tbd minúsculo tampoco cuenta como alcance material',
    alcancePendienteMinusculas.status === 1 && /alcance|pendiente|informe/i.test(alcancePendienteMinusculas.stdout || ''));

  writeFileSync(securityReport, informe({ medium: 1, verdict: 'CONDITIONAL', acceptedRisks: [{ id: 'RISK-001' }] }), 'utf8');
  const riesgoIncompleto = spawnSync(process.execPath,
    ['scripts/check-sdd.mjs', '--strict', '--spec', '901'], { cwd: d, encoding: 'utf8' });
  comprueba('un MEDIO aceptado sin owner, fecha y decisión bloquea',
    riesgoIncompleto.status === 1 && /riesgo|owner|reviewDate|decisionRef/i.test(riesgoIncompleto.stdout || ''));

  const riesgoCompleto = [{
    id: 'RISK-001', owner: 'security-owner', justification: 'Impacto acotado y mitigación temporal activa',
    reviewDate: '2026-09-30', decisionRef: 'DEC-2026-08-11-SEC-001',
  }];
  writeFileSync(securityReport, informe({ medium: 1, verdict: 'CONDITIONAL', acceptedRisks: riesgoCompleto }), 'utf8');
  const decisionInventada = spawnSync(process.execPath,
    ['scripts/check-sdd.mjs', '--strict', '--spec', '901'], { cwd: d, encoding: 'utf8' });
  comprueba('una decisionRef inexistente no acepta un riesgo',
    decisionInventada.status === 1 && /riesgo|decisionRef|decisi/i.test(decisionInventada.stdout || ''));

  const fechaImposible = [{ ...riesgoCompleto[0], reviewDate: '2026-02-30' }];
  writeFileSync(securityReport, informe({ medium: 1, verdict: 'CONDITIONAL', acceptedRisks: fechaImposible }), 'utf8');
  const fechaInvalida = spawnSync(process.execPath,
    ['scripts/check-sdd.mjs', '--strict', '--spec', '901'], { cwd: d, encoding: 'utf8' });
  comprueba('reviewDate debe ser una fecha calendario válida',
    fechaInvalida.status === 1 && /riesgo|reviewDate/i.test(fechaInvalida.stdout || ''));

  writeFileSync(join(d, 'docs/bitacora/DECISIONS.md'),
    `${leer(join(d, 'docs/bitacora/DECISIONS.md')) || ''}\nDEC-2026-08-11-SEC-001 · Riesgo temporal aceptado por security-owner.\n`, 'utf8');
  const riesgosDuplicados = [riesgoCompleto[0], { ...riesgoCompleto[0] }];
  writeFileSync(securityReport, informe({ medium: 2, verdict: 'CONDITIONAL', acceptedRisks: riesgosDuplicados }), 'utf8');
  const idsDuplicados = spawnSync(process.execPath,
    ['scripts/check-sdd.mjs', '--strict', '--spec', '901'], { cwd: d, encoding: 'utf8' });
  comprueba('los riesgos aceptados tienen IDs únicos y cardinalidad exacta',
    idsDuplicados.status === 1 && /IDs.*únicos|riesgo/i.test(idsDuplicados.stdout || ''));
  writeFileSync(securityReport, `${informe({ medium: 1, verdict: 'CONDITIONAL', acceptedRisks: riesgoCompleto })}\n[ALTO] Hallazgo histórico corregido.\n`, 'utf8');
  const condicional = spawnSync(process.execPath,
    ['scripts/check-sdd.mjs', '--strict', '--spec', '901'], { cwd: d, encoding: 'utf8' });
  comprueba('un MEDIO materialmente aceptado pasa y un ALTO histórico corregido no bloquea',
    condicional.status === 0, (condicional.stdout || '').slice(-220));

  writeFileSync(join(d, 'tests/security.test.mjs'), 'export function otro() { return "PASS"; }\n', 'utf8');
  const testInexistente = spawnSync(process.execPath,
    ['scripts/check-sdd.mjs', '--strict', '--spec', '901'], { cwd: d, encoding: 'utf8' });
  comprueba('GO exige que la referencia ruta::caso exista realmente',
    testInexistente.status === 1 && /no se resuelve el test|trazabilidad/i.test(testInexistente.stdout || ''));
  writeFileSync(join(d, 'tests/security.test.mjs'), 'export function report() { return "PASS"; }\n', 'utf8');

  const artefactosTraza = ['plan.md', 'tasks.md', 'test-plan.md', 'evidence.md'];
  const contenidosTraza = Object.fromEntries(artefactosTraza.map((nombre) => [nombre, leer(join(specDir, nombre)) || '']));
  for (const nombre of artefactosTraza)
    writeFileSync(join(specDir, nombre), contenidosTraza[nombre]
      .replaceAll('tests/security.test.mjs::report', '../fuera.test.mjs::report'), 'utf8');
  const testTraversal = spawnSync(process.execPath,
    ['scripts/check-sdd.mjs', '--strict', '--spec', '901'], { cwd: d, encoding: 'utf8' });
  comprueba('la referencia de test no puede escapar de la raíz del proyecto',
    testTraversal.status === 1 && /no se resuelve el test|trazabilidad/i.test(testTraversal.stdout || ''));
  for (const nombre of artefactosTraza)
    writeFileSync(join(specDir, nombre), contenidosTraza[nombre], 'utf8');

  rmSync(qualityReport, { force: true });
  const sinCalidad = spawnSync(process.execPath,
    ['scripts/check-sdd.mjs', '--strict', '--spec', '901'], { cwd: d, encoding: 'utf8' });
  comprueba('GO exige informe de calidad material',
    sinCalidad.status === 1 && /informe de calidad|entrega\/informe/i.test(sinCalidad.stdout || ''));
  writeFileSync(qualityReport, '# Calidad\nPASS\n', 'utf8');

  rmSync(securityReport, { force: true });
  const sinSeguridad = spawnSync(process.execPath,
    ['scripts/check-sdd.mjs', '--strict', '--spec', '901'], { cwd: d, encoding: 'utf8' });
  comprueba('GO exige el informe de seguridad declarado',
    sinSeguridad.status === 1 && /no existe|informe de seguridad|seguridad\/informe/i.test(sinSeguridad.stdout || ''));
  writeFileSync(securityReport, informe(), 'utf8');

  writeFileSync(securityReport, informe({ spec: 'otra-spec' }), 'utf8');
  const specIncorrecta = spawnSync(process.execPath,
    ['scripts/check-sdd.mjs', '--strict', '--spec', '901'], { cwd: d, encoding: 'utf8' });
  comprueba('un informe de otra spec no satisface la entrega actual',
    specIncorrecta.status === 1 && /declara spec|otra-spec/i.test(specIncorrecta.stdout || ''));

  writeFileSync(securityReport, informe(), 'utf8');

  writeFileSync(join(specDir, 'evidence.md'), (leer(join(specDir, 'evidence.md')) || '')
    .replace('docs/security/reports/2026-08-11-901-security-report.md', '../security/reports/2026-08-11-901-security-report.md'), 'utf8');
  const traversal = spawnSync(process.execPath,
    ['scripts/check-sdd.mjs', '--strict', '--spec', '901'], { cwd: d, encoding: 'utf8' });
  comprueba('el informe se resuelve por ruta exacta y rechaza traversal',
    traversal.status === 1 && /ruta|report|informe|security|seguridad/i.test(traversal.stdout || ''));
}
gate_security_e_informe();

/**
 * El equivalente de usabilidad: la matriz `UX-*` se exige igual que la de seguridad y el informe
 * bloquea `GO` por los mismos motivos. Si estos casos pasan en verde, toda la capa es decorativa.
 */
function matriz_usabilidad_y_gate_a11y() {
  console.log('\n1 bis-b · matriz de usabilidad, informe y puerta de GO');
  const d = nuevoDestino();
  writeFileSync(join(d, 'package.json'), '{"name":"ux-fixture"}\n', 'utf8');
  sdd(d, 'init');

  const specDir = join(d, 'docs/specs/902-usability-report');
  mkdirSync(specDir, { recursive: true });
  mkdirSync(join(d, 'tests'), { recursive: true });
  writeFileSync(join(d, 'tests/ux.test.mjs'), 'export function formulario() { return "PASS"; }\n', 'utf8');

  const spec = `# 902 · Fixture de usabilidad

| Estado | aprobada |
|---|---|
| **Impacto de seguridad** | no-sensible |
| **Impacto de usabilidad** | aplicable |
| **Impacto de documentación** | no-aplica · fixture técnico del gate de usabilidad |

| Id | Requisito | Prioridad | Esfuerzo |
|---|---|---|---|
| RF-01 | El sistema DEBE validar el formulario al salir del campo. | M | 1 |

### CA-01 · Validación al salir del campo
`;
  writeFileSync(join(specDir, 'spec.md'), spec, 'utf8');

  const plan = `# Plan

### 9.3 · Matriz de controles de usabilidad

| Control | WCAG 2.2 | Heurística | Aplica | Decisión / justificación | Tarea | Test | Evidencia |
|---|---|---|---|---|---|---|---|
| UX-FORM-001 | 3.3.1 AA | H5 prevención de errores | sí | Validación en blur con mensaje accionable | T-902-01 | tests/ux.test.mjs::formulario | evidence.md#UX-FORM-001 |
| UX-PERF-001 | n/a | H1 visibilidad del estado | no | Sin espera perceptible: la validación es local y síncrona | — | — | — |
`;
  writeFileSync(join(specDir, 'plan.md'), plan, 'utf8');

  writeFileSync(join(specDir, 'tasks.md'), `# Tareas

### T-902-01 · Validar el formulario al salir del campo
- **Estado**: hecho
- **Cubre**: RF-01, CA-01
- **Controles de usabilidad**: UX-FORM-001 — tests/ux.test.mjs::formulario
- **Evidencia prevista**: evidence.md#T-902-01
`, 'utf8');

  writeFileSync(join(specDir, 'test-plan.md'), `# Plan de test

### 5.2 · Casos de uso hostil y accesibilidad

| Control | WCAG 2.2 | Heurística | Condición hostil | Nivel | Test | Resultado usable esperado |
|---|---|---|---|---|---|---|
| UX-FORM-001 | 3.3.1 AA | H5 | Envío con el campo vacío y solo teclado | integración | tests/ux.test.mjs::formulario | Error junto al campo que dice cómo se arregla |
`, 'utf8');

  const informeUX = (cambios = {}) => {
    const base = {
      schemaVersion: 1,
      spec: '902-usability-report',
      standards: { wcag: '2.2', level: 'AA', heuristics: 'nielsen-10' },
      scope: 'diff',
      controlsEvaluated: ['UX-FORM-001'],
      openFindings: { critical: 0, high: 0, medium: 0, low: 0 },
      verdict: 'PASS',
      acceptedRisks: [],
      controlsNotExecuted: [],
      ...cambios,
    };
    if (typeof cambios.medium === 'number') {
      base.openFindings = { ...base.openFindings, medium: cambios.medium };
      delete base.medium;
    }
    if (typeof cambios.high === 'number') {
      base.openFindings = { ...base.openFindings, high: cambios.high };
      delete base.high;
    }
    return `# Informe de usabilidad\n\n<!-- sdd-usability-report:v1 -->\n\`\`\`json\n${JSON.stringify(base, null, 2)}\n\`\`\`\n`;
  };

  const rutaInforme = join(d, 'docs/design/reports/2026-08-12-902-usability-report.md');
  mkdirSync(join(d, 'docs/design/reports'), { recursive: true });
  writeFileSync(rutaInforme, informeUX(), 'utf8');
  mkdirSync(join(d, 'docs/quality/reports'), { recursive: true });
  writeFileSync(join(d, 'docs/quality/reports/2026-08-12-902-usability-report.md'), '# Calidad\nPASS\n', 'utf8');
  // La spec declara impacto de seguridad, así que el gate de entrega también le pide gate e
  // informe. No es el sujeto de esta prueba: se aportan mínimos y válidos para aislar la parte de
  // usabilidad y que un fallo aquí signifique de verdad "la usabilidad no bloquea".
  writeFileSync(join(d, '.sdd/checks.json'), `${JSON.stringify({
    version: 1,
    checks: {
      sdd: { command: 'node scripts/check-sdd.mjs', required: true, speed: 'fast' },
      security: { command: 'node scripts/scan-secrets.mjs --json', required: true, speed: 'slow' },
    },
    unconfigured: ['lint', 'test', 'typecheck', 'build', 'a11y'],
  }, null, 2)}\n`, 'utf8');
  mkdirSync(join(d, 'docs/security/reports'), { recursive: true });
  writeFileSync(join(d, 'docs/security/reports/2026-08-12-902-usability-report.md'),
    `# Informe de seguridad\n\n<!-- sdd-security-report:v1 -->\n\`\`\`json\n${JSON.stringify({
      schemaVersion: 1,
      spec: '902-usability-report',
      standards: { owaspTop10: '2025', asvs: '5.0.0', level: 'L1' },
      scope: 'diff',
      controlsEvaluated: [],
      openFindings: { critical: 0, high: 0, medium: 0, low: 0 },
      verdict: 'PASS',
      acceptedRisks: [],
      controlsNotExecuted: [],
    }, null, 2)}\n\`\`\`\n`, 'utf8');

  const evidenciaValida = `# Evidencias

## 1. Ejecuciones

| Fecha/hora | Agente | Verificación | Tarea | Comando ejecutado | Resultado | Artefacto |
|---|---|---|---|---|---|---|
| 2026-08-12 10:00 | implementer | declared-direct | T-902-01 | node --test tests/ux.test.mjs | 🟢 1/1 | log |

### 3.2 · Controles de usabilidad ejecutados

| Control | Tarea | Test / comando ejecutado | Resultado | Evidencia | Estado |
|---|---|---|---|---|---|
| UX-FORM-001 | T-902-01 | tests/ux.test.mjs::formulario | 🟢 verde | log | verificado |

**Informe de usabilidad**: \`docs/design/reports/2026-08-12-902-usability-report.md\`.

**Informe de seguridad**: \`docs/security/reports/2026-08-12-902-usability-report.md\`.

## 5. Decisión de entrega

| Campo | Valor |
|---|---|
| **Estado** | \`GO\` |
`;
  writeFileSync(join(specDir, 'evidence.md'), evidenciaValida, 'utf8');

  const correr = () => spawnSync(process.execPath,
    ['scripts/check-sdd.mjs', '--strict', '--spec', '902'], { cwd: d, encoding: 'utf8' });

  const base = correr();
  comprueba('la cadena completa de usabilidad pasa en verde', base.status === 0, (base.stdout || '').slice(-260));
  comprueba('sin runner de a11y se avisa, pero no se bloquea la entrega',
    /usabilidad\/gate/.test(base.stdout || '') && base.status === 0);

  const planValido = leer(join(specDir, 'plan.md')) || '';
  const rechazaPlan = (titulo, sustituir, por, patron) => {
    writeFileSync(join(specDir, 'plan.md'), planValido.replace(sustituir, por), 'utf8');
    const salida = correr();
    comprueba(titulo, salida.status === 1 && patron.test(salida.stdout || ''), (salida.stdout || '').slice(-200));
    writeFileSync(join(specDir, 'plan.md'), planValido, 'utf8');
  };
  rechazaPlan('un ID de control de usabilidad mal formado bloquea',
    'UX-FORM-001 | 3.3.1 AA', 'UX-1 | 3.3.1 AA', /usabilidad\/control|inválido/i);
  rechazaPlan('un control de accesibilidad sin criterio WCAG bloquea',
    '| UX-FORM-001 | 3.3.1 AA |', '| UX-A11Y-001 | n/a |', /criterio WCAG|usabilidad\/matriz/i);
  rechazaPlan('un control aplicable sin test concreto bloquea',
    'tests/ux.test.mjs::formulario | evidence.md#UX-FORM-001', ' | evidence.md#UX-FORM-001',
    /usabilidad\/matriz|Test debe ser/i);
  rechazaPlan('un control no aplicable sin justificación material bloquea',
    'no | Sin espera perceptible: la validación es local y síncrona', 'no | ',
    /justificación concreta|usabilidad\/matriz/i);

  const specValida = leer(join(specDir, 'spec.md')) || '';
  writeFileSync(join(specDir, 'spec.md'), specValida.replace(/^\| \*\*Impacto de usabilidad\*\*[^\n]*\n/m, ''), 'utf8');
  const sinImpacto = correr();
  comprueba('una spec posterior al umbral no puede omitir Impacto de usabilidad',
    sinImpacto.status === 1 && /Impacto de usabilidad|usabilidad\/impacto/i.test(sinImpacto.stdout || ''));
  writeFileSync(join(specDir, 'spec.md'),
    specValida.replace('| **Impacto de usabilidad** | aplicable |', '| **Impacto de usabilidad** | sin-ui |'), 'utf8');
  const sinMotivo = correr();
  comprueba('un sin-ui sin motivo material no vale como clasificación',
    sinMotivo.status === 1 && /motivo material|usabilidad\/impacto/i.test(sinMotivo.stdout || ''));
  writeFileSync(join(specDir, 'spec.md'), specValida, 'utf8');

  const rechazaInformeUX = (titulo, cambios, patron) => {
    writeFileSync(rutaInforme, informeUX(cambios), 'utf8');
    const salida = correr();
    comprueba(titulo, salida.status === 1 && patron.test(salida.stdout || ''), (salida.stdout || '').slice(-200));
    writeFileSync(rutaInforme, informeUX(), 'utf8');
  };
  rechazaInformeUX('un estándar de usabilidad degradado bloquea',
    { standards: { wcag: '2.1', level: 'AA', heuristics: 'nielsen-10' } }, /estándar|estandar|WCAG/i);
  rechazaInformeUX('un hallazgo ALTO de usabilidad bloquea la entrega', { high: 2 }, /CRÍTICO\/ALTO|veredicto/i);
  rechazaInformeUX('PASS no admite hallazgos MEDIO de usabilidad', { medium: 1 }, /PASS.*MEDIO|veredicto/i);
  rechazaInformeUX('un control de usabilidad no ejecutado bloquea GO',
    { controlsNotExecuted: [{ control: 'UX-FORM-001', reason: 'sin runner', risk: 'regresión invisible', owner: 'ux', nextStep: 'añadir axe' }] },
    /no ejecutados|veredicto/i);
  rechazaInformeUX('el informe de usabilidad de otra spec no sirve', { spec: 'otra' }, /declara spec|otra/i);
  rechazaInformeUX('controlsEvaluated debe cubrir el control aplicable', { controlsEvaluated: [] },
    /no evaluados|controlsEvaluated/i);

  writeFileSync(rutaInforme, '# Informe\n<!-- sdd-usability-report:v1 -->\n```json\n{ roto }\n```\n', 'utf8');
  const jsonRoto = correr();
  comprueba('un informe de usabilidad con JSON inválido bloquea',
    jsonRoto.status === 1 && /inválido|informe/i.test(jsonRoto.stdout || ''));
  writeFileSync(rutaInforme, informeUX(), 'utf8');

  writeFileSync(join(specDir, 'evidence.md'), evidenciaValida
    .replace('docs/design/reports/2026-08-12-902-usability-report.md',
      'docs/design/reports/../../../fuera.md'), 'utf8');
  const traversal = correr();
  comprueba('la ruta del informe de usabilidad rechaza traversal',
    traversal.status === 1 && /ruta de informe no permitida|usabilidad\/informe/i.test(traversal.stdout || ''));
  writeFileSync(join(specDir, 'evidence.md'), evidenciaValida, 'utf8');

  writeFileSync(join(specDir, 'evidence.md'),
    evidenciaValida.replace('**Informe de usabilidad**: `docs/design/reports/2026-08-12-902-usability-report.md`.', ''), 'utf8');
  const sinDeclarar = correr();
  comprueba('GO exige declarar el informe de usabilidad en evidence.md',
    sinDeclarar.status === 1 && /Informe de usabilidad|usabilidad\/informe/i.test(sinDeclarar.stdout || ''));
  writeFileSync(join(specDir, 'evidence.md'), evidenciaValida, 'utf8');
}
matriz_usabilidad_y_gate_a11y();

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
| **Impacto de seguridad** | no-sensible |
| **Impacto de usabilidad** | sin-ui · fixture técnico de ejecución directa, sin interfaz |
| **Impacto de documentación** | no-aplica · fixture técnico de ejecución directa |

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
  mkdirSync(join(d, 'docs/security/reports'), { recursive: true });
  writeFileSync(join(d, 'docs/security/AUTH-TOKENS.md'), `# Auth propia\n${SENTINELA}\n`, 'utf8');
  writeFileSync(join(d, 'docs/security/SECURITY-CHECKLIST.md'), `# Checklist propia\n${SENTINELA}\n`, 'utf8');
  writeFileSync(join(d, 'docs/security/reports/auditoria-existente.md'), SENTINELA, 'utf8');
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
  mkdirSync(join(d, '.sdd'), { recursive: true });
  writeFileSync(join(d, '.sdd/docs.json'), `${JSON.stringify({
    schemaVersion: 1,
    mode: 'audit',
    documentSets: [{
      id: 'DOC-PROPIO', kind: 'user-guide', sources: ['src/**'], artifacts: ['docs/guides/**'],
      generated: false, gate: null, owner: 'docs-writer', extensionPropia: SENTINELA,
    }],
  }, null, 2)}\n`, 'utf8');

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
  comprueba('preserva doctrina e informes de seguridad brownfield',
    leer(join(d, 'docs/security/AUTH-TOKENS.md')).includes(SENTINELA) &&
    leer(join(d, 'docs/security/SECURITY-CHECKLIST.md')).includes(SENTINELA) &&
    leer(join(d, 'docs/security/reports/auditoria-existente.md')) === SENTINELA);
  comprueba('preserva íntegramente el baseline de producto brownfield',
    ['PRD.md', 'USE-CASES.md', 'FEATURE-MAP.md', 'SOURCES.md']
      .every((nombre) => leer(join(d, 'docs/product', nombre)).includes(SENTINELA)));
  comprueba('brownfield sin aprobación explícita queda legacy-pending sin romper la instalación',
    JSON.parse(leer(join(d, '.sdd/installed.json')) || '{}').product?.status === 'legacy-pending');
  comprueba('brownfield conserva el contrato documental y empieza a exigir desde la siguiente spec', (() => {
    const docs = JSON.parse(leer(join(d, '.sdd/docs.json')) || '{}');
    const documentation = JSON.parse(leer(join(d, '.sdd/installed.json')) || '{}').documentation;
    return docs.documentSets?.[0]?.extensionPropia === SENTINELA &&
      documentation?.schemaVersion === 1 && documentation.status === 'legacy-pending' &&
      documentation.enforceFromSpec === '778';
  })());
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
  mkdirSync(join(d, '.sdd'), { recursive: true });
  const JSONC_MALO = '{ "editor.tabSize": 2, esto-no-es-jsonc }\n';
  const TOML_MALO = '[[[esto no es toml\n';
  const DOCS_MALO = '{ "schemaVersion": 1, "documentSets": [';
  writeFileSync(join(d, '.vscode/settings.json'), JSONC_MALO, 'utf8');
  writeFileSync(join(d, '.codex/config.toml'), TOML_MALO, 'utf8');
  writeFileSync(join(d, '.sdd/docs.json'), DOCS_MALO, 'utf8');

  const r = sdd(d, 'init', '--with-mcp', 'context7');
  comprueba('configuración malformada no aborta toda la instalación', r.status === 0, r.stderr?.slice(0, 180));
  comprueba('JSONC malformado se preserva', leer(join(d, '.vscode/settings.json')) === JSONC_MALO);
  comprueba('JSONC propuesto queda bajo conflicts',
    existsSync(join(d, `.sdd/conflicts/${VERSION}/.vscode/settings.json`)));
  comprueba('TOML malformado se preserva', leer(join(d, '.codex/config.toml')) === TOML_MALO);
  comprueba('TOML propuesto queda bajo conflicts',
    existsSync(join(d, `.sdd/conflicts/${VERSION}/.codex/config.toml`)));
  comprueba('docs.json inválido se preserva y la propuesta queda bajo conflicts',
    leer(join(d, '.sdd/docs.json')) === DOCS_MALO &&
    existsSync(join(d, `.sdd/conflicts/${VERSION}/.sdd/docs.json`)));
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
  const docsPrimera = leer(join(d, '.sdd/docs.json'));
  const registroPrimero = leer(join(d, '.sdd/installed.json'));
  const documentationPrimera = JSON.parse(registroPrimero || '{}').documentation;
  const segunda = sdd(d, 'init');

  comprueba('la segunda no genera conflictos', /0 conflicto\(s\)/.test(segunda.stdout || ''), (segunda.stdout || '').slice(-160));
  comprueba('no deja ficheros .sdd-nuevo', !existsSync(join(d, 'AGENTS.md.sdd-nuevo')));
  comprueba('la segunda conserva idempotentes docs.json e installed.documentation',
    docsPrimera !== null && leer(join(d, '.sdd/docs.json')) === docsPrimera &&
    leer(join(d, '.sdd/installed.json')) === registroPrimero &&
    documentationPrimera?.status === 'bootstrap' &&
    JSON.stringify(JSON.parse(leer(join(d, '.sdd/installed.json')) || '{}').documentation) ===
      JSON.stringify(documentationPrimera));
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

console.log('\n4 quater · migración conservadora de seguridad');
{
  const d = nuevoDestino();
  sdd(d, 'init', '--mode', 'brownfield');
  mkdirSync(join(d, 'docs/specs/001-previa'), { recursive: true });
  mkdirSync(join(d, 'docs/specs/007-previa'), { recursive: true });

  const registroRuta = join(d, '.sdd/installed.json');
  const anterior = JSON.parse(leer(registroRuta));
  delete anterior.security;
  anterior.version = '0.4.0';
  writeFileSync(registroRuta, `${JSON.stringify(anterior, null, 2)}\n`, 'utf8');

  const checksRuta = join(d, '.sdd/checks.json');
  writeFileSync(checksRuta, `${JSON.stringify({
    version: 1,
    checks: {
      sdd: { command: 'node scripts/check-sdd.mjs', required: true, speed: 'fast' },
      custom: { command: 'node custom-check.mjs', required: false, speed: 'slow' },
    },
    unconfigured: ['test'],
    extensionPropia: { sentinel: true },
  }, null, 2)}\n`, 'utf8');

  const actualizacion = sdd(d, 'update');
  const migrado = JSON.parse(leer(registroRuta));
  const checks = JSON.parse(leer(checksRuta));
  comprueba('brownfield registra security-pending y empieza en la siguiente spec',
    actualizacion.status === 0 && migrado.security?.status === 'legacy-pending' &&
    migrado.security?.enforceFromSpec === '008' && migrado.security?.standards?.owaspTop10 === '2025' &&
    migrado.security?.standards?.asvs === '5.0.0' && migrado.security?.standards?.level === 'L2');
  comprueba('migrar checks añade solo security sin configurar y conserva extensiones',
    checks.checks?.custom?.command === 'node custom-check.mjs' && checks.extensionPropia?.sentinel === true &&
    checks.unconfigured.filter((id) => id === 'security').length === 1);

  const repetida = sdd(d, 'update');
  const checksRepetidos = JSON.parse(leer(checksRuta));
  comprueba('la migración de security-pending es idempotente',
    repetida.status === 0 && checksRepetidos.unconfigured.filter((id) => id === 'security').length === 1 &&
    JSON.parse(leer(registroRuta)).security?.enforceFromSpec === '008');
}

{
  const d = nuevoDestino();
  sdd(d, 'init', '--mode', 'brownfield');
  const checksRuta = join(d, '.sdd/checks.json');
  const propio = {
    version: 1,
    checks: {
      sdd: { command: 'node scripts/check-sdd.mjs', required: true, speed: 'fast' },
      'security:scan': { command: 'mi-scanner --fail-high', required: true, speed: 'slow' },
    },
    unconfigured: ['test'],
  };
  writeFileSync(checksRuta, `${JSON.stringify(propio, null, 2)}\n`, 'utf8');
  const update = sdd(d, 'update');
  const conservado = JSON.parse(leer(checksRuta));
  comprueba('un gate security:* existente se conserva y no recibe pendiente duplicado',
    update.status === 0 && conservado.checks?.['security:scan']?.command === 'mi-scanner --fail-high' &&
    !conservado.unconfigured.includes('security'));
}

{
  const d = nuevoDestino();
  sdd(d, 'init', '--mode', 'brownfield');
  const checksRuta = join(d, '.sdd/checks.json');
  const invalido = '{ "checks": { "sdd": ';
  writeFileSync(checksRuta, invalido, 'utf8');
  const update = sdd(d, 'update');
  comprueba('checks JSON inválido se preserva y la propuesta queda en conflicts',
    update.status === 0 && leer(checksRuta) === invalido &&
    existsSync(join(d, `.sdd/conflicts/${VERSION}/.sdd/checks.json`)));
}

console.log('\n4 quinquies · migración conservadora de documentación');
{
  const d = nuevoDestino();
  sdd(d, 'init', '--mode', 'brownfield');
  mkdirSync(join(d, 'docs/specs/003-previa'), { recursive: true });
  mkdirSync(join(d, 'docs/specs/011-previa'), { recursive: true });
  rmSync(join(d, '.sdd/docs.json'), { force: true });

  const registroRuta = join(d, '.sdd/installed.json');
  const anterior = JSON.parse(leer(registroRuta));
  delete anterior.documentation;
  anterior.version = '0.5.0';
  writeFileSync(registroRuta, `${JSON.stringify(anterior, null, 2)}\n`, 'utf8');

  const checksRuta = join(d, '.sdd/checks.json');
  writeFileSync(checksRuta, `${JSON.stringify({
    version: 1,
    checks: {
      sdd: { command: 'node scripts/check-sdd.mjs', required: true, speed: 'fast' },
      'docs:links': { command: 'node mi-doc-check.mjs', required: true, speed: 'slow' },
    },
    unconfigured: ['test'],
    extensionPropia: { sentinel: true },
  }, null, 2)}\n`, 'utf8');

  const update = sdd(d, 'update');
  const docs = JSON.parse(leer(join(d, '.sdd/docs.json')) || '{}');
  const registro = JSON.parse(leer(registroRuta));
  const checks = JSON.parse(leer(checksRuta));
  comprueba('update crea docs.json audit y documentation legacy-pending desde la siguiente spec',
    update.status === 0 && docs.schemaVersion === 1 && docs.mode === 'audit' &&
    Array.isArray(docs.documentSets) && registro.documentation?.status === 'legacy-pending' &&
    registro.documentation?.enforceFromSpec === '012');
  comprueba('la migración conserva un gate docs:* real y extensiones propias',
    checks.checks?.['docs:links']?.command === 'node mi-doc-check.mjs' &&
    checks.extensionPropia?.sentinel === true && !checks.unconfigured.includes('docs'));

  const docsPrimera = leer(join(d, '.sdd/docs.json'));
  const estadoPrimero = JSON.stringify(registro.documentation);
  const repetida = sdd(d, 'update');
  comprueba('la migración documental repetida es idempotente',
    repetida.status === 0 && leer(join(d, '.sdd/docs.json')) === docsPrimera &&
    JSON.stringify(JSON.parse(leer(registroRuta)).documentation) === estadoPrimero);

  rmSync(join(d, 'docs/specs/003-previa'), { recursive: true, force: true });
  rmSync(join(d, 'docs/specs/011-previa'), { recursive: true, force: true });
  spawnSync('git', ['init', '-q', '.'], { cwd: d, encoding: 'utf8' });
  spawnSync('git', ['add', '-A'], { cwd: d, encoding: 'utf8' });
  spawnSync('git', ['update-index', '--chmod=+x', '.sdd/githooks/pre-commit', '.sdd/githooks/pre-push'],
    { cwd: d, encoding: 'utf8' });
  spawnSync('git', ['-c', 'user.name=SDD Test', '-c', 'user.email=sdd@example.invalid',
    'commit', '-q', '-m', 'adopta SDD'], { cwd: d, encoding: 'utf8' });
  const base = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: d, encoding: 'utf8' }).stdout.trim();
  const legado = spawnSync(process.execPath,
    ['scripts/check-sdd.mjs', '--docs-diff', '--base', base], { cwd: d, encoding: 'utf8' });
  comprueba('el primer PR brownfield queda N/A verificable antes del umbral documental',
    legado.status === 0 && /legacy-pending|N\/A|spec 012/i.test(legado.stdout || ''));

  mkdirSync(join(d, 'docs/specs/012-nueva'), { recursive: true });
  const cruzaUmbral = spawnSync(process.execPath,
    ['scripts/check-sdd.mjs', '--docs-diff', '--base', base], { cwd: d, encoding: 'utf8' });
  comprueba('la primera spec posterior al umbral obliga a aprobar el contrato documental',
    cruzaUmbral.status === 1 && /NO EJECUTADO|enforce|documentSets|contrato/i.test(cruzaUmbral.stdout || ''));
  rmSync(join(d, 'docs/specs/012-nueva'), { recursive: true, force: true });

  writeFileSync(join(d, '.sdd/docs.json'), `${JSON.stringify({
    schemaVersion: 1,
    mode: 'audit',
    documentSets: [{
      id: 'DOC-BASELINE', kind: 'developer-readme', sources: ['README.md'],
      artifacts: ['docs/README.md'], generated: false, gate: null, owner: 'docs-writer',
    }],
  }, null, 2)}\n`, 'utf8');
  const aprobado = spawnSync(process.execPath,
    ['scripts/sdd-project.mjs', 'approve-docs', '--approved-by', 'Equipo Test'], { cwd: d, encoding: 'utf8' });
  const registroAprobado = JSON.parse(leer(registroRuta) || '{}').documentation;
  comprueba('approve-docs exige persona y materializa un baseline durable sin mover el umbral',
    aprobado.status === 0 && JSON.parse(leer(join(d, '.sdd/docs.json')) || '{}').mode === 'enforce' &&
    registroAprobado?.status === 'approved' && registroAprobado?.approvedBy === 'Equipo Test' &&
    registroAprobado?.enforceFromSpec === '012' && /^[0-9a-f]{16}$/.test(registroAprobado?.configHash || ''));

  const contratoDerivado = JSON.parse(leer(join(d, '.sdd/docs.json')) || '{}');
  contratoDerivado.documentSets[0].sources = ['docs/README.md'];
  writeFileSync(join(d, '.sdd/docs.json'), `${JSON.stringify(contratoDerivado, null, 2)}\n`, 'utf8');
  const driftAprobado = spawnSync(process.execPath,
    ['scripts/check-sdd.mjs', '--docs-diff', '--base', base], { cwd: d, encoding: 'utf8' });
  comprueba('docs-diff bloquea deriva de un contrato aprobado aunque conserve documentSets',
    driftAprobado.status === 1 && /drift|aprobado|contrato documental/i.test(driftAprobado.stdout || ''));
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
    'docs/guides/DOCUMENTACION.md', 'docs/guides/INSTALACION.md',
    'docs/architecture/PATTERNS.md', 'docs/sdd/OPERATING-MODEL.md',
    'docs/security/AUTH-TOKENS.md', 'docs/security/SECURITY-CHECKLIST.md',
    '.sdd/githooks/pre-commit', '.sdd/githooks/pre-push',
    '.agents/skills/observability/SKILL.md', '.claude/skills/observability/SKILL.md',
    '.agents/skills/docs-sync/SKILL.md', '.claude/skills/docs-sync/SKILL.md',
    '.agents/agents/orchestrator.md', '.gemini/agents/orchestrator.md',
    '.sdd/docs.json',
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

console.log('\n4 bis bis · Git portable sin mutaciones implícitas');
{
  const d = nuevoDestino();
  spawnSync('git', ['init', '-q', '.'], { cwd: d, encoding: 'utf8' });
  writeFileSync(join(d, 'sentinel.txt'), 'contenido previo\n', 'utf8');
  spawnSync('git', ['add', 'sentinel.txt'], { cwd: d, encoding: 'utf8' });
  spawnSync('git', ['-c', 'user.name=SDD Test', '-c', 'user.email=sdd@example.invalid',
    'commit', '-q', '-m', 'baseline'], { cwd: d, encoding: 'utf8' });
  const headAntes = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: d, encoding: 'utf8' }).stdout.trim();

  const r = sdd(d, 'init', '--mode', 'brownfield');
  const headDespues = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: d, encoding: 'utf8' }).stdout.trim();
  const indiceLimpio = spawnSync('git', ['diff', '--cached', '--quiet'], { cwd: d, encoding: 'utf8' });
  comprueba('el instalador no ejecuta git add, commit ni push',
    r.status === 0 && headDespues === headAntes && indiceLimpio.status === 0);

  const compartidos = [
    'AGENTS.md', 'CHANGELOG.md', 'docs/README.md', '.sdd/docs.json', '.sdd/installed.json',
    '.agents/skills/docs-sync/SKILL.md', '.claude/agents/docs-writer.md',
    '.github/agents/docs-writer.agent.md', '.cursor/agents/docs-writer.md',
    '.codex/agents/docs-writer.toml', '.agents/agents/docs-writer.md',
    '.gemini/agents/docs-writer.md',
  ];
  const noIgnorados = compartidos.every((ruta) =>
    existsSync(join(d, ruta)) &&
    spawnSync('git', ['check-ignore', '-q', '--', ruta], { cwd: d, encoding: 'utf8' }).status === 1);
  comprueba('agentes, skills, configuración SDD e historia quedan versionables', noIgnorados);
  comprueba('estado local y secretos quedan ignorados', (() => {
    const ignorados = ['.env', '.sdd/state/prueba.json', '.sdd/conflicts/prueba.txt'];
    for (const ruta of ignorados) {
      mkdirSync(dirname(join(d, ruta)), { recursive: true });
      writeFileSync(join(d, ruta), 'dato local\n', 'utf8');
    }
    return ignorados.every((ruta) =>
      spawnSync('git', ['check-ignore', '-q', '--', ruta], { cwd: d, encoding: 'utf8' }).status === 0);
  })());
  comprueba('la salida final distingue compartidos y locales y recomienda git status',
    /versionar|subir|commit/i.test(r.stdout || '') && /local|no versionar|excluid/i.test(r.stdout || '') &&
    /git status/i.test(r.stdout || ''));
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

console.log('\n5 bis · contrato documental y diff base-aware');
{
  const d = nuevoDestino();
  sdd(d, 'init', '--mode', 'greenfield');
  mkdirSync(join(d, 'src'), { recursive: true });
  mkdirSync(join(d, 'docs/guides'), { recursive: true });
  writeFileSync(join(d, 'src/public.mjs'), 'export const valor = 1;\n', 'utf8');
  writeFileSync(join(d, 'docs/guides/public.md'), '# API pública\n\nValor documentado.\n', 'utf8');

  const docsRuta = join(d, '.sdd/docs.json');
  const contratoValido = {
    schemaVersion: 1,
    mode: 'enforce',
    documentSets: [{
      id: 'DOC-PUBLIC', kind: 'public-code', sources: ['src/public.mjs'],
      artifacts: ['docs/guides/public.md'], generated: false, gate: null, owner: 'docs-writer',
    }],
  };
  const guardaContrato = (contrato) =>
    writeFileSync(docsRuta, `${JSON.stringify(contrato, null, 2)}\n`, 'utf8');
  const checkDocs = (...args) => spawnSync(process.execPath,
    ['scripts/check-sdd.mjs', '--strict', ...args], { cwd: d, encoding: 'utf8' });
  guardaContrato(contratoValido);

  guardaContrato({ ...contratoValido, documentSets: [{
    ...contratoValido.documentSets[0], artifacts: ['../fuera.md'],
  }] });
  const traversal = checkDocs();
  guardaContrato({ ...contratoValido, documentSets: [{
    ...contratoValido.documentSets[0], artifacts: ['C:/fuera.md'],
  }] });
  const absoluta = checkDocs();
  comprueba('check-sdd rechaza traversal y rutas documentales absolutas',
    traversal.status === 1 && absoluta.status === 1 &&
    /docs|document|ruta|path|escape/i.test(`${traversal.stdout}${absoluta.stdout}`));

  guardaContrato({ ...contratoValido, documentSets: [{
    ...contratoValido.documentSets[0], artifacts: ['docs/guides/no-existe.md'],
  }] });
  const exactoAusente = checkDocs();
  comprueba('un artefacto concreto inexistente falla aunque no use glob',
    exactoAusente.status === 1 && /no existe|artefacto|document/i.test(exactoAusente.stdout || ''));

  guardaContrato({ ...contratoValido, documentSets: [{
    ...contratoValido.documentSets[0], artifacts: ['docs/{guides,api}/**'],
  }] });
  const globNoSoportado = checkDocs();
  guardaContrato({ ...contratoValido, documentSets: [{
    ...contratoValido.documentSets[0], artifacts: ['credentials/token.md'],
  }] });
  const rutaSensible = checkDocs();
  comprueba('el contrato rechaza globs ambiguos y rutas con material sensible',
    globNoSoportado.status === 1 && rutaSensible.status === 1 &&
    /glob|soportad|ruta|secret|credencial|estado local/i.test(`${globNoSoportado.stdout}${rutaSensible.stdout}`));

  const fuera = nuevoDestino();
  writeFileSync(join(fuera, 'privado.md'), '# Fuera del repositorio\n', 'utf8');
  const enlaceDirectorio = join(d, 'docs/guides/escape');
  symlinkSync(fuera, enlaceDirectorio, process.platform === 'win32' ? 'junction' : 'dir');
  guardaContrato({ ...contratoValido, documentSets: [{
    ...contratoValido.documentSets[0], artifacts: ['docs/guides/escape/privado.md'],
  }] });
  const escapeEnlace = checkDocs();
  comprueba('check-sdd rechaza artefactos que escapan mediante symlink o junction',
    escapeEnlace.status === 1 && /escapa|fuera|enlace|ruta|document/i.test(escapeEnlace.stdout || ''));
  writeFileSync(join(d, 'docs/guides/public.md'), '# API\n\n[Fuera](./escape/privado.md)\n', 'utf8');
  guardaContrato(contratoValido);
  const enlacePorEscape = checkDocs();
  comprueba('check-sdd rechaza enlaces Markdown que atraviesan un symlink o junction',
    enlacePorEscape.status === 1 && /enlace|escapa|repositorio/i.test(enlacePorEscape.stdout || ''));
  rmSync(enlaceDirectorio, { recursive: true, force: true });

  guardaContrato(contratoValido);
  writeFileSync(join(d, 'docs/guides/public.md'), '# API\n\n[Enlace roto](./no-existe.md)\n', 'utf8');
  const enlaceRoto = checkDocs();
  comprueba('check-sdd rechaza enlaces rotos en documentos oficiales declarados',
    enlaceRoto.status === 1 && /enlace|link|no existe|document/i.test(enlaceRoto.stdout || ''));

  writeFileSync(join(d, 'docs/guides/public.md'), '# API\n\nTODO: completar antes de publicar.\n', 'utf8');
  const placeholder = checkDocs();
  comprueba('check-sdd rechaza placeholders en documentos oficiales declarados',
    placeholder.status === 1 && /placeholder|TODO|pendiente|document/i.test(placeholder.stdout || ''));

  guardaContrato({ ...contratoValido, documentSets: [{
    ...contratoValido.documentSets[0], generated: true, gate: 'docs:typedoc',
  }] });
  writeFileSync(join(d, 'docs/guides/public.md'), '# API\n\nValor documentado.\n', 'utf8');
  const gateAusente = checkDocs();
  comprueba('un artefacto generado exige un gate docs:* realmente configurado',
    gateAusente.status === 1 && /docs:typedoc|gate.*document|no ejecutado/i.test(gateAusente.stdout || ''));

  const checksRuta = join(d, '.sdd/checks.json');
  const checksConDocs = JSON.parse(leer(checksRuta) || '{}');
  checksConDocs.checks['docs:typedoc'] = {
    command: 'node -e "process.exit(0)"', required: true, speed: 'slow', enabled: true,
  };
  checksConDocs.unconfigured = (checksConDocs.unconfigured || []).filter((id) => id !== 'docs');
  writeFileSync(checksRuta, `${JSON.stringify(checksConDocs, null, 2)}\n`, 'utf8');
  const generadoSinBuild = checkDocs();
  comprueba('un output generado e ignorado puede faltar si su gate slow está configurado',
    generadoSinBuild.status === 0, `${generadoSinBuild.stdout}${generadoSinBuild.stderr}`.slice(-220));

  guardaContrato(contratoValido);
  spawnSync('git', ['init', '-q', '.'], { cwd: d, encoding: 'utf8' });
  spawnSync('git', ['add', '-A'], { cwd: d, encoding: 'utf8' });
  spawnSync('git', ['update-index', '--chmod=+x', '.sdd/githooks/pre-commit', '.sdd/githooks/pre-push'],
    { cwd: d, encoding: 'utf8' });
  spawnSync('git', ['-c', 'user.name=SDD Test', '-c', 'user.email=sdd@example.invalid',
    'commit', '-q', '-m', 'baseline'], { cwd: d, encoding: 'utf8' });
  const base = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: d, encoding: 'utf8' }).stdout.trim();
  comprueba('el fixture documental materializa un SHA base real',
    /^[0-9a-f]{40,64}$/i.test(base), 'git rev-parse HEAD no devolvió un SHA');

  guardaContrato({ schemaVersion: 1, mode: 'audit', documentSets: [] });
  const contratoSinAprobar = checkDocs('--docs-diff', '--base', base);
  comprueba('docs-diff no pasa si el contrato sigue en audit y vacío',
    contratoSinAprobar.status === 1 && /NO EJECUTADO|enforce|documentSets|contrato/i.test(contratoSinAprobar.stdout || ''));
  guardaContrato(contratoValido);

  writeFileSync(join(d, 'src/public.mjs'), 'export const valor = 2;\n', 'utf8');
  writeFileSync(join(d, 'CHANGELOG.md'), `${leer(join(d, 'CHANGELOG.md'))}\n- Cambia la API pública.\n`, 'utf8');
  const sinDocs = checkDocs('--docs-diff', '--base', base);
  comprueba('docs-diff detecta fuente pública cambiada sin su artefacto',
    sinDocs.status === 1 && /DOC-PUBLIC|document|artefacto|diff|base/i.test(sinDocs.stdout || ''));

  spawnSync('git', ['add', 'src/public.mjs', 'CHANGELOG.md'], { cwd: d, encoding: 'utf8' });
  spawnSync('git', ['-c', 'user.name=SDD Test', '-c', 'user.email=sdd@example.invalid',
    'commit', '-q', '-m', 'cambio de código'], { cwd: d, encoding: 'utf8' });
  writeFileSync(join(d, 'docs/guides/public.md'), '# API pública\n\nValor documentado: 2.\n', 'utf8');
  spawnSync('git', ['add', 'docs/guides/public.md'], { cwd: d, encoding: 'utf8' });
  spawnSync('git', ['-c', 'user.name=SDD Test', '-c', 'user.email=sdd@example.invalid',
    'commit', '-q', '-m', 'documenta el cambio'], { cwd: d, encoding: 'utf8' });
  const mismoPr = checkDocs('--docs-diff', '--base', base);
  comprueba('código y documentación pueden vivir en commits distintos del mismo PR',
    mismoPr.status === 0, `${mismoPr.stdout}${mismoPr.stderr}`.slice(-220));

  const baseInvalida = checkDocs('--docs-diff', '--base', 'f'.repeat(40));
  comprueba('docs-diff falla cerrado cuando no puede resolver el SHA base',
    baseInvalida.status === 1 && /base|SHA|NO EJECUTADO|resolver/i.test(`${baseInvalida.stdout}${baseInvalida.stderr}`));

  rmSync(join(d, 'docs/guides/public.md'), { force: true });
  const eliminado = checkDocs('--docs-diff', '--base', base);
  comprueba('docs-diff detecta artefactos eliminados o renombrados sin actualizar el contrato',
    eliminado.status === 1 && /DOC-PUBLIC|elimin|renombr|artefacto|document/i.test(eliminado.stdout || ''));
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
