#!/usr/bin/env node
/**
 * sdd — instala el ecosistema SDD en un proyecto existente.
 *
 *   npx github:jechamo/Estructura_inicial_claude init      → instala en el proyecto actual
 *   npx github:jechamo/Estructura_inicial_claude global    → agentes y skills en tu máquina
 *   npx github:jechamo/Estructura_inicial_claude update    → actualiza a la versión nueva
 *   npx github:jechamo/Estructura_inicial_claude check     → qué falta o está desactualizado
 *
 * Opciones: --dry-run (no escribe nada) · --con-baseline · --si (no pregunta)
 *
 * Principio de diseño: NUNCA se pisa un fichero que el usuario haya tocado. Se detecta
 * comparando el hash actual con el que se registró al instalar. Si difieren, el fichero
 * nuevo se deja al lado como `.sdd-nuevo` y se avisa. Un instalador que sobrescribe en
 * silencio se usa una vez y no se vuelve a usar.
 *
 * Node >= 18, sin dependencias.
 */
import {
  readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync, statSync,
} from 'node:fs';
import { join, dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';
import { createHash } from 'node:crypto';
import {
  NUNCA, OPCIONAL_BASELINE, REINICIADOS, GLOBAL, FUSIONABLES, APENDICES, DIRECTORIOS, coincide,
} from './lib/manifiesto.mjs';

const ORIGEN = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DESTINO = process.cwd();

const args = process.argv.slice(2);
const comando = args.find((a) => !a.startsWith('-')) || 'check';
const DRY = args.includes('--dry-run');
const CON_BASELINE = args.includes('--con-baseline');

const VERSION = (() => {
  try {
    return JSON.parse(readFileSync(join(ORIGEN, 'package.json'), 'utf8')).version || '0.0.0';
  } catch {
    return '0.0.0';
  }
})();

const REGISTRO = join(DESTINO, '.sdd', 'installed.json');

// ─────────────────────────────────────────────────────────────────────────────
// Utilidades
// ─────────────────────────────────────────────────────────────────────────────
const hash = (contenido) => createHash('sha256').update(contenido).digest('hex').slice(0, 16);
const leer = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : null);
const norm = (p) => p.split(sep).join('/');

const escritos = [];
const conflictos = [];
const omitidos = [];
const fusionados = [];

function escribir(rutaRel, contenido) {
  escritos.push(rutaRel);
  if (DRY) return;
  const destino = join(DESTINO, rutaRel);
  mkdirSync(dirname(destino), { recursive: true });
  writeFileSync(destino, contenido, 'utf8');
}

function listar(dir, base = dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      if (['.git', 'node_modules'].includes(e.name)) continue;
      listar(p, base, out);
    } else out.push(norm(relative(base, p)));
  }
  return out;
}

/** Fusión profunda que NUNCA pisa una clave existente: la del usuario gana. */
function fusionar(base, nuevo, añadidas = [], prefijo = '') {
  for (const [k, v] of Object.entries(nuevo)) {
    const ruta = prefijo ? `${prefijo}.${k}` : k;
    if (!(k in base)) {
      base[k] = v;
      añadidas.push(ruta);
    } else if (v && typeof v === 'object' && !Array.isArray(v) && base[k] && typeof base[k] === 'object' && !Array.isArray(base[k])) {
      fusionar(base[k], v, añadidas, ruta);
    }
    // Si la clave existe y no es objeto, se respeta la del usuario. A propósito.
  }
  return añadidas;
}

/** JSON con comentarios: los quita para poder parsear (.vscode/settings.json los admite). */
const parseJsonc = (t) => JSON.parse(t.replace(/^\s*\/\/.*$/gm, '').replace(/,(\s*[}\]])/g, '$1'));

// ─────────────────────────────────────────────────────────────────────────────
// Clasificación
// ─────────────────────────────────────────────────────────────────────────────
function seInstala(rutaRel) {
  if (coincide(rutaRel, NUNCA)) return false;
  if (coincide(rutaRel, OPCIONAL_BASELINE) && !CON_BASELINE) return false;
  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// Instalación por proyecto
// ─────────────────────────────────────────────────────────────────────────────
function instalarProyecto({ actualizar }) {
  const registroPrevio = (() => {
    try {
      return JSON.parse(leer(REGISTRO) || '{}');
    } catch {
      return {};
    }
  })();
  const hashesPrevios = registroPrevio.ficheros || {};
  const nuevoRegistro = {};

  for (const rutaRel of listar(ORIGEN).filter(seInstala)) {
    const contenidoOrigen = readFileSync(join(ORIGEN, rutaRel), 'utf8');
    const rutaDestino = join(DESTINO, rutaRel);
    const actual = leer(rutaDestino);

    // Ficheros que se instalan vacíos o reiniciados
    if (rutaRel in REINICIADOS) {
      if (actual === null) escribir(rutaRel, REINICIADOS[rutaRel]);
      else omitidos.push(rutaRel);
      continue;
    }

    // JSON que se fusionan
    if (FUSIONABLES.includes(rutaRel) && actual !== null) {
      try {
        const base = parseJsonc(actual);
        const añadidas = fusionar(base, parseJsonc(contenidoOrigen));
        if (añadidas.length) {
          escribir(rutaRel, JSON.stringify(base, null, 2) + '\n');
          fusionados.push(`${rutaRel} (+${añadidas.length}: ${añadidas.slice(0, 4).join(', ')}${añadidas.length > 4 ? '…' : ''})`);
        } else omitidos.push(rutaRel);
      } catch {
        conflictos.push(`${rutaRel} — no se pudo interpretar el JSON existente`);
        escribir(`${rutaRel}.sdd-nuevo`, contenidoOrigen);
      }
      nuevoRegistro[rutaRel] = hash(contenidoOrigen);
      continue;
    }

    // Apéndices delimitados (.gitignore)
    if (rutaRel in APENDICES && actual !== null) {
      const { marcaInicio, marcaFin, lineas } = APENDICES[rutaRel];
      const faltan = lineas.filter((l) => !actual.split('\n').some((x) => x.trim() === l));
      if (faltan.length && !actual.includes(marcaInicio)) {
        escribir(rutaRel, `${actual.replace(/\s*$/, '')}\n\n${marcaInicio}\n${faltan.join('\n')}\n${marcaFin}\n`);
        fusionados.push(`${rutaRel} (+${faltan.length} línea(s))`);
      } else omitidos.push(rutaRel);
      nuevoRegistro[rutaRel] = hash(contenidoOrigen);
      continue;
    }

    // Caso general
    if (actual === null) {
      escribir(rutaRel, contenidoOrigen);
    } else if (hash(actual) === hash(contenidoOrigen)) {
      omitidos.push(rutaRel); // ya está al día
    } else if (actualizar && hashesPrevios[rutaRel] === hash(actual)) {
      // Lo instalamos nosotros y nadie lo ha tocado desde entonces: seguro actualizarlo.
      escribir(rutaRel, contenidoOrigen);
    } else {
      conflictos.push(rutaRel);
      escribir(`${rutaRel}.sdd-nuevo`, contenidoOrigen);
    }
    nuevoRegistro[rutaRel] = hash(contenidoOrigen);
  }

  for (const d of DIRECTORIOS) {
    const p = join(DESTINO, d);
    if (!existsSync(p)) {
      if (!DRY) mkdirSync(p, { recursive: true });
      const gk = `${d}/.gitkeep`;
      if (!existsSync(join(DESTINO, gk))) escribir(gk, '');
    }
  }

  if (!DRY) {
    mkdirSync(dirname(REGISTRO), { recursive: true });
    writeFileSync(
      REGISTRO,
      JSON.stringify(
        { version: VERSION, fecha: new Date().toISOString(), origen: 'jechamo/Estructura_inicial_claude', ficheros: nuevoRegistro },
        null, 2,
      ) + '\n',
      'utf8',
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Instalación global
// ─────────────────────────────────────────────────────────────────────────────
function rutaVsCodeUsuario() {
  const h = homedir();
  const candidatas = process.platform === 'win32'
    ? [join(process.env.APPDATA || join(h, 'AppData/Roaming'), 'Code/User/settings.json')]
    : process.platform === 'darwin'
      ? [join(h, 'Library/Application Support/Code/User/settings.json')]
      : [join(h, '.config/Code/User/settings.json'), join(h, '.config/Code - OSS/User/settings.json')];
  return candidatas.find(existsSync) || null;
}

function instalarGlobal() {
  console.log('Capa global — agentes y skills a nivel de usuario.');
  console.log('Los hooks NO se instalan en global a propósito: una guarda activa en todos tus');
  console.log('repositorios, incluidos los que no usan SDD, es intrusiva y acaba desactivada.\n');

  for (const { host, origen, destino, nativo } of GLOBAL) {
    const dirOrigen = join(ORIGEN, origen);
    if (!existsSync(dirOrigen)) continue;
    const dirDestino = destino.replace('~', homedir());
    const ficheros = listar(dirOrigen);

    console.log(`  ${nativo ? '✓' : '⚙'} ${host.padEnd(22)} ${ficheros.length} fichero(s) → ${destino}`);
    if (DRY) continue;

    for (const f of ficheros) {
      const d = join(dirDestino, f);
      mkdirSync(dirname(d), { recursive: true });
      writeFileSync(d, readFileSync(join(dirOrigen, f), 'utf8'), 'utf8');
    }
  }

  // VS Code no descubre solo las skills de usuario: hay que declarárselo.
  const ajustes = rutaVsCodeUsuario();
  const skillsGlobal = join(homedir(), '.claude', 'skills').split(sep).join('/');
  const clave = { 'chat.agentSkillsLocations': { [skillsGlobal]: true } };

  console.log('');
  if (!ajustes) {
    console.log('  ⚠ No encuentro el settings.json de usuario de VS Code. Si lo usas, añade a mano:');
    console.log(`    ${JSON.stringify(clave)}`);
  } else if (DRY) {
    console.log(`  ⚙ Fusionaría en ${ajustes}: ${JSON.stringify(clave)}`);
  } else {
    try {
      const base = parseJsonc(leer(ajustes) || '{}');
      const añadidas = fusionar(base, clave);
      if (añadidas.length) {
        writeFileSync(ajustes, JSON.stringify(base, null, 2) + '\n', 'utf8');
        console.log(`  ✓ VS Code: añadido chat.agentSkillsLocations en ${ajustes}`);
      } else {
        console.log('  · VS Code: ya estaba configurado');
      }
    } catch {
      console.log(`  ⚠ No pude fusionar ${ajustes}. Añade a mano: ${JSON.stringify(clave)}`);
    }
  }

  console.log('\nCodex y Antigravity quedan fuera: Codex usa TOML en ~/.codex/agents/ y Antigravity');
  console.log('solo admite reglas globales. Está declarado en docs/integrations/IDE-COMPATIBILITY.md.');
}

// ─────────────────────────────────────────────────────────────────────────────
// check
// ─────────────────────────────────────────────────────────────────────────────
function comprobar() {
  const registro = (() => {
    try {
      return JSON.parse(leer(REGISTRO) || 'null');
    } catch {
      return null;
    }
  })();

  if (!registro) {
    console.log('Este proyecto no tiene la estructura SDD instalada.');
    console.log('  → npx github:jechamo/Estructura_inicial_claude init');
    return 0;
  }

  console.log(`Instalado: v${registro.version} · ${registro.fecha?.slice(0, 10)} · plantilla actual: v${VERSION}`);

  const modificados = [];
  const desaparecidos = [];
  for (const [ruta, h] of Object.entries(registro.ficheros || {})) {
    const actual = leer(join(DESTINO, ruta));
    if (actual === null) desaparecidos.push(ruta);
    else if (hash(actual) !== h) modificados.push(ruta);
  }

  if (registro.version !== VERSION) console.log(`\n⚠ Hay versión nueva de la plantilla (v${VERSION}). → sdd update`);
  if (modificados.length) {
    console.log(`\n${modificados.length} fichero(s) modificados en local (update NO los tocará):`);
    for (const m of modificados.slice(0, 15)) console.log(`  ~ ${m}`);
    if (modificados.length > 15) console.log(`  … y ${modificados.length - 15} más`);
  }
  if (desaparecidos.length) {
    console.log(`\n${desaparecidos.length} fichero(s) que se instalaron y ya no están:`);
    for (const d of desaparecidos.slice(0, 10)) console.log(`  ✗ ${d}`);
  }
  if (!modificados.length && !desaparecidos.length && registro.version === VERSION)
    console.log('\n✅ Al día y sin modificaciones locales.');
  return 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// Informe
// ─────────────────────────────────────────────────────────────────────────────
function informe() {
  console.log(`\n${DRY ? '[simulación] ' : ''}${escritos.length} escrito(s) · ${fusionados.length} fusionado(s) · ${omitidos.length} sin cambios · ${conflictos.length} conflicto(s)`);

  if (fusionados.length) {
    console.log('\nFusionado sin pisar nada tuyo:');
    for (const f of fusionados) console.log(`  + ${f}`);
  }

  if (conflictos.length) {
    console.log('\n⚠ Ya existían y son distintos. NO se han tocado; tienes el nuevo al lado como `.sdd-nuevo`:');
    for (const c of conflictos) console.log(`  ! ${c}`);
    console.log('\n  Compáralos y quédate con lo que quieras. Después borra los `.sdd-nuevo`.');
  }

  if (DRY) {
    console.log('\nSimulación: no se ha escrito nada. Quita --dry-run para aplicarlo.');
    return;
  }

  console.log('\nSiguientes pasos:');
  console.log('  1. Ajusta `.sdd/territories.json` a la estructura REAL de este proyecto.');
  console.log('     Trae rutas convencionales (src/components/**, migrations/**…) y si no coinciden,');
  console.log('     la guarda de territorio protegerá rutas que no existen.');
  console.log('  2. Documenta lo que ya hay: `/onboard` (agentes research-analyst → architect).');
  console.log('  3. Verifica: node scripts/check-sdd.mjs');
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────
if (ORIGEN === DESTINO && comando !== 'check') {
  console.error('No puedes instalar la plantilla sobre sí misma. Ejecuta esto desde el proyecto destino.');
  process.exit(1);
}

switch (comando) {
  case 'init':
    console.log(`sdd init v${VERSION} → ${DESTINO}${DRY ? '  [simulación]' : ''}\n`);
    instalarProyecto({ actualizar: false });
    informe();
    break;

  case 'update':
    if (!existsSync(REGISTRO)) {
      console.error('Este proyecto no tiene la estructura instalada. Usa `init` primero.');
      process.exit(1);
    }
    console.log(`sdd update → v${VERSION}${DRY ? '  [simulación]' : ''}\n`);
    instalarProyecto({ actualizar: true });
    informe();
    break;

  case 'global':
    instalarGlobal();
    break;

  case 'check':
    process.exit(comprobar());
    break;

  default:
    console.log(`sdd v${VERSION} — ecosistema de agentes SDD

  init            instala la estructura en el proyecto actual
  update          actualiza a la versión de la plantilla, sin pisar lo que hayas tocado
  global          instala agentes y skills a nivel de usuario (todos tus proyectos)
  check           qué está instalado, qué has modificado y si hay versión nueva

Opciones
  --dry-run       imprime lo que haría, sin escribir nada
  --con-baseline  incluye docs/research/ (la investigación fechada de la plantilla)

Se puede invocar desde una copia local, que es la vía recomendada: funciona con repositorios
privados y no depende del almacén de certificados de npm.

  git clone --depth 1 <url-de-la-plantilla> ~/sdd-plantilla
  cd /mi/proyecto && node ~/sdd-plantilla/scripts/install.mjs init
`);
}
