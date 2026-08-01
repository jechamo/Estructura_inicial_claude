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
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const ORIGEN = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const INSTALADOR = join(ORIGEN, 'scripts', 'install.mjs');

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

const leer = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : null);

// ─── 1 · Instalación limpia ──────────────────────────────────────────────────
console.log('\n1 · init sobre un directorio vacío');
{
  const d = nuevoDestino();
  const r = sdd(d, 'init');

  comprueba('termina sin error', r.status === 0, r.stderr?.slice(0, 120));
  comprueba('instala AGENTS.md', existsSync(join(d, 'AGENTS.md')));
  comprueba('instala los agentes', existsSync(join(d, '.claude/agents/implementer.md')));
  comprueba('instala las skills', existsSync(join(d, '.claude/skills/middle/SKILL.md')));
  comprueba('instala los hooks', existsSync(join(d, '.claude/hooks/guard-write.mjs')));
  comprueba('instala los territorios', existsSync(join(d, '.sdd/territories.json')));
  comprueba('instala las superficies de Cursor', existsSync(join(d, '.cursor/agents/backend-expert.md')));
  comprueba('instala las de VS Code', existsSync(join(d, '.github/agents/planner.agent.md')));
  comprueba('crea docs/specs', existsSync(join(d, 'docs/specs')));
  comprueba('deja registro de instalación', existsSync(join(d, '.sdd/installed.json')));

  // Lo que NO debe viajar: el historial de la plantilla
  comprueba('NO copia el README de la plantilla', !existsSync(join(d, 'README.md')));
  comprueba('NO copia el CHANGELOG', !existsSync(join(d, 'CHANGELOG.md')));
  comprueba('NO copia las sesiones de la plantilla', !existsSync(join(d, 'docs/bitacora/sessions/2026-07.md')));
  comprueba('NO copia el instalador', !existsSync(join(d, 'scripts/install.mjs')));
  comprueba('la bitácora se instala vacía',
    (leer(join(d, 'docs/bitacora/DECISIONS.md')) || '').includes('Bitácora de decisiones') &&
    !(leer(join(d, 'docs/bitacora/DECISIONS.md')) || '').includes('El handoff no aísla'));

  // Los gates de la plantilla deben pasar DENTRO del proyecto recién instalado
  const check = spawnSync(process.execPath, ['scripts/check-sdd.mjs'], { cwd: d, encoding: 'utf8' });
  comprueba('check-sdd pasa en el destino', check.status === 0, (check.stdout || '').slice(-160));
  const hooks = spawnSync(process.execPath, ['scripts/test-hooks.mjs'], { cwd: d, encoding: 'utf8' });
  comprueba('las guardas funcionan en el destino', hooks.status === 0, (hooks.stdout || '').slice(-160));
}

// ─── 2 · No pisar lo que ya existe ───────────────────────────────────────────
console.log('\n2 · init sobre un proyecto con ficheros propios');
{
  const d = nuevoDestino();
  const MIO = '# Mis reglas\n\nEsto es del proyecto y no se toca.\n';
  writeFileSync(join(d, 'AGENTS.md'), MIO, 'utf8');
  writeFileSync(join(d, '.gitignore'), 'dist/\n*.log\n', 'utf8');
  mkdirSync(join(d, '.vscode'), { recursive: true });
  writeFileSync(join(d, '.vscode/settings.json'),
    '{\n  "editor.tabSize": 4,\n  "files.associations": { "*.foo": "json" }\n}\n', 'utf8');

  sdd(d, 'init');

  comprueba('AGENTS.md propio intacto', leer(join(d, 'AGENTS.md')) === MIO);
  comprueba('deja el nuevo al lado como .sdd-nuevo', existsSync(join(d, 'AGENTS.md.sdd-nuevo')));

  const ajustes = JSON.parse(leer(join(d, '.vscode/settings.json')));
  comprueba('respeta tus claves de settings.json', ajustes['editor.tabSize'] === 4);
  comprueba('respeta tus valores anidados', ajustes['files.associations']['*.foo'] === 'json');
  comprueba('añade las claves de SDD', !!ajustes['chat.agentFilesLocations']);

  const gitignore = leer(join(d, '.gitignore'));
  comprueba('.gitignore conserva lo tuyo', gitignore.includes('dist/') && gitignore.includes('*.log'));
  comprueba('.gitignore añade lo de SDD en bloque marcado',
    gitignore.includes('.sdd/state/') && gitignore.includes('SDD (instalado por sdd init)'));
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
  const MIO = leer(ruta).replace('"modo": "deny"', '"modo": "ask"');
  writeFileSync(ruta, MIO, 'utf8');

  const r = sdd(d, 'update');
  comprueba('update no pisa tu territories.json', leer(ruta) === MIO);
  comprueba('avisa del conflicto', /conflicto/.test(r.stdout || ''));
  comprueba('deja el nuevo al lado', existsSync(join(d, '.sdd/territories.json.sdd-nuevo')));
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
