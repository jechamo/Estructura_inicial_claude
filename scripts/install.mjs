#!/usr/bin/env node
/**
 * Instalador portable SDD. Node >= 18, sin dependencias.
 *
 *   sdd init [directorio] --mode auto|greenfield|brownfield [--dry-run]
 *   sdd update [directorio] [--dry-run]
 *   sdd check [directorio]
 *   sdd global [--dry-run]
 */
import {
  readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync, rmSync, lstatSync,
} from 'node:fs';
import { join, dirname, relative, resolve, sep, parse as parsePath } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';
import { createHash } from 'node:crypto';
import {
  VERSION_MANIFIESTO, DIRECTORIOS_VIRGENES, JSON_FUSIONABLES,
  BLOQUES_GESTIONADOS, SEMILLAS, BASE_GITIGNORE, APENDICE_GITIGNORE,
  RUTAS_RETIRADAS, debeCopiar,
} from './lib/manifiesto.mjs';

const ORIGEN = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const COMANDOS = new Set(['init', 'update', 'check', 'global']);
const MODOS = new Set(['auto', 'greenfield', 'brownfield']);

function parsearArgs(argv) {
  const out = {
    comando: 'check', destino: null, modo: 'auto', dry: false,
    conBaseline: false, mcp: [], si: false, sinHooks: false,
  };
  let i = 0;
  if (COMANDOS.has(argv[0])) out.comando = argv[i++];
  for (; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry-run') out.dry = true;
    else if (a === '--no-hooks') out.sinHooks = true;
    else if (a === '--con-baseline') out.conBaseline = true;
    else if (a === '--si' || a === '-y') out.si = true;
    else if (a === '--mode') out.modo = argv[++i];
    else if (a === '--with-mcp') out.mcp = String(argv[++i] || '').split(',').map((x) => x.trim()).filter(Boolean);
    else if (a.startsWith('--')) throw new Error(`Opción desconocida: ${a}`);
    else if (!out.destino) out.destino = a;
    else throw new Error(`Argumento inesperado: ${a}`);
  }
  if (!MODOS.has(out.modo)) throw new Error(`Modo no válido: ${out.modo}`);
  if (argv.includes('--with-mcp') && !out.mcp.length)
    throw new Error('--with-mcp requiere una selección explícita, por ejemplo: --with-mcp context7,playwright');
  return out;
}

let opciones;
try {
  opciones = parsearArgs(process.argv.slice(2));
} catch (error) {
  console.error(error.message);
  process.exit(2);
}

const DESTINO = resolve(opciones.destino || process.cwd());
const VERSION = (() => {
  try { return JSON.parse(readFileSync(join(ORIGEN, 'package.json'), 'utf8')).version || '0.0.0'; }
  catch { return '0.0.0'; }
})();

const hash = (contenido) => createHash('sha256').update(contenido).digest('hex').slice(0, 16);
const leer = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : null);
const norm = (p) => p.split(sep).join('/');
const fechaVersion = VERSION.replace(/[^0-9A-Za-z._-]/g, '_');
const escritos = [];
const fusionados = [];
const omitidos = [];
const conflictos = [];
const retirados = [];
let contratoSeguridadActual = null;
let contratoUsabilidadActual = null;
let contratoDocumentacionActual = null;

/**
 * Resuelve una ruta controlada por la plantilla o por installed.json sin permitir que escape del
 * destino. También rechaza symlinks y junctions ya existentes en cualquier prefijo interno: de
 * otro modo una ruta textual segura como `.sdd/checks.json` podría terminar fuera del proyecto.
 */
function rutaDestinoSegura(ruta) {
  if (typeof ruta !== 'string' || !ruta.trim() || ruta.includes('\0'))
    throw new Error('Ruta de destino no válida: valor vacío o byte NUL');
  const portable = ruta.replace(/\\/g, '/');
  const segmentos = portable.split('/');
  if (portable.startsWith('/') || /^[A-Za-z]:\//.test(portable) || portable.startsWith('//') ||
      segmentos.some((segmento) => !segmento || segmento === '.' || segmento === '..'))
    throw new Error(`Ruta fuera del destino o con traversal: ${ruta}`);

  const absoluta = resolve(DESTINO, ...segmentos);
  const prefijo = `${DESTINO}${sep}`;
  if (absoluta !== DESTINO && !absoluta.startsWith(prefijo))
    throw new Error(`Ruta fuera del destino: ${ruta}`);

  let actual = DESTINO;
  for (const segmento of segmentos) {
    actual = join(actual, segmento);
    if (existsSync(actual) && lstatSync(actual).isSymbolicLink())
      throw new Error(`Enlace simbólico o junction no permitido dentro del destino: ${ruta}`);
  }
  return absoluta;
}

function validarRutasRegistro(registro) {
  for (const grupo of ['files', 'ficheros']) {
    const entradas = registro?.[grupo];
    if (!entradas || typeof entradas !== 'object' || Array.isArray(entradas)) continue;
    for (const ruta of Object.keys(entradas)) rutaDestinoSegura(ruta);
  }
}

function listar(dir, base = dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const entrada of readdirSync(dir, { withFileTypes: true })) {
    if (['.git', 'node_modules'].includes(entrada.name)) continue;
    const p = join(dir, entrada.name);
    if (entrada.isDirectory()) listar(p, base, out);
    else out.push(norm(relative(base, p)));
  }
  return out;
}

function escribir(ruta, contenido) {
  escritos.push(ruta);
  if (opciones.dry) return;
  let absoluta = rutaDestinoSegura(ruta);
  mkdirSync(dirname(absoluta), { recursive: true });
  // Repite la comprobación después de crear prefijos para no confiar en el estado previo.
  absoluta = rutaDestinoSegura(ruta);
  writeFileSync(absoluta, contenido, 'utf8');
}

function registrarConflicto(ruta, contenido, motivo = 'contenido local distinto') {
  const salida = `.sdd/conflicts/${fechaVersion}/${ruta}`;
  conflictos.push(`${ruta} — ${motivo} → ${salida}`);
  escribir(salida, contenido);
}

function parseJsonc(texto) {
  return JSON.parse(texto
    .replace(/^\s*\/\/.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/,(\s*[}\]])/g, '$1'));
}

function claveArray(valor) {
  return valor && typeof valor === 'object'
    ? JSON.stringify(valor, Object.keys(valor).sort())
    : JSON.stringify(valor);
}

/** Fusión conservadora: las claves del proyecto ganan y los arrays se unen sin duplicados. */
function fusionarJson(base, nuevo, cambios = [], prefijo = '') {
  for (const [clave, valor] of Object.entries(nuevo)) {
    const ruta = prefijo ? `${prefijo}.${clave}` : clave;
    if (!(clave in base)) {
      base[clave] = valor;
      cambios.push(ruta);
    } else if (Array.isArray(base[clave]) && Array.isArray(valor)) {
      const vistas = new Set(base[clave].map(claveArray));
      const nuevas = valor.filter((x) => !vistas.has(claveArray(x)));
      if (nuevas.length) {
        base[clave].push(...nuevas);
        cambios.push(`${ruta}[+${nuevas.length}]`);
      }
    } else if (
      valor && typeof valor === 'object' && !Array.isArray(valor) &&
      base[clave] && typeof base[clave] === 'object' && !Array.isArray(base[clave])
    ) fusionarJson(base[clave], valor, cambios, ruta);
  }
  return cambios;
}

// Estas tres claves son un selector excluyente, no preferencias acumulables. Si el proyecto
// conserva las dos superficies activas, VS Code muestra agentes, skills o hooks duplicados.
function normalizarSuperficiesVsCode(base, deseado, cambios = []) {
  for (const clave of ['chat.agentFilesLocations', 'chat.agentSkillsLocations', 'chat.hookFilesLocations']) {
    if (!deseado[clave] || typeof deseado[clave] !== 'object') continue;
    if (!base[clave] || typeof base[clave] !== 'object' || Array.isArray(base[clave])) base[clave] = {};
    for (const [ubicacion, activa] of Object.entries(deseado[clave])) {
      if (base[clave][ubicacion] === activa) continue;
      base[clave][ubicacion] = activa;
      cambios.push(`${clave}.${ubicacion}=${activa}`);
    }
  }
  return cambios;
}

function bloqueGestionado(contenido, cuerpo) {
  const inicio = '<!-- sdd:start -->';
  const fin = '<!-- sdd:end -->';
  const bloque = `${inicio}\n${cuerpo.trim()}\n${fin}`;
  const patron = /<!-- sdd:start -->[\s\S]*?<!-- sdd:end -->/;
  if (patron.test(contenido)) return contenido.replace(patron, bloque).replace(/\s*$/, '\n');
  return `${contenido.replace(/\s*$/, '')}\n\n${bloque}\n`;
}

/** Validador conservador para no anexar bloques a un TOML obviamente corrupto. */
function tomlPareceValido(contenido) {
  let continuacion = 0;
  for (const original of contenido.split(/\r?\n/)) {
    const linea = original.trim();
    if (!linea || linea.startsWith('#')) continue;
    if (continuacion > 0) {
      continuacion += (linea.match(/[\[{]/g) || []).length - (linea.match(/[\]}]/g) || []).length;
      continue;
    }
    if (/^\[\[[^\[\]]+\]\]$/.test(linea) || /^\[[^\[\]]+\]$/.test(linea)) continue;
    if (!/^[A-Za-z0-9_.-]+\s*=/.test(linea)) return false;
    continuacion = Math.max(0,
      (linea.match(/[\[{]/g) || []).length - (linea.match(/[\]}]/g) || []).length,
    );
  }
  return continuacion === 0;
}

function fusionarSemillas(registroNuevo) {
  for (const [ruta, semilla] of Object.entries(SEMILLAS)) {
    const actual = leer(rutaDestinoSegura(ruta));
    if (ruta === '.sdd/docs.json' && actual !== null) {
      try {
        JSON.parse(actual);
        omitidos.push(ruta);
      } catch (error) {
        registrarConflicto(ruta, semilla, `JSON documental no valido: ${error.message}`);
      }
      continue;
    }
    if (ruta in BLOQUES_GESTIONADOS && actual !== null) {
      const nuevo = bloqueGestionado(actual, BLOQUES_GESTIONADOS[ruta]);
      if (nuevo !== actual) {
        escribir(ruta, nuevo);
        fusionados.push(`${ruta} (bloque sdd)`);
      } else omitidos.push(ruta);
      registroNuevo[ruta] = { hash: hash(nuevo), policy: 'managed-block' };
    } else if (actual === null) {
      escribir(ruta, semilla);
      registroNuevo[ruta] = { hash: hash(semilla), policy: 'seed-once' };
    } else {
      omitidos.push(ruta);
      // Una semilla existente pertenece al proyecto; update nunca la reinicia.
    }
  }
}

function fusionarGitignore(registroNuevo) {
  const ruta = '.gitignore';
  const actual = leer(rutaDestinoSegura(ruta));
  const faltan = APENDICE_GITIGNORE.lineas.filter(
    (linea) => !(actual || '').split(/\r?\n/).some((x) => x.trim() === linea),
  );
  if (actual === null) {
    const nuevo = `${BASE_GITIGNORE.join('\n')}\n\n${APENDICE_GITIGNORE.inicio}\n${APENDICE_GITIGNORE.lineas.join('\n')}\n${APENDICE_GITIGNORE.fin}\n`;
    escribir(ruta, nuevo);
    registroNuevo[ruta] = { hash: hash(nuevo), policy: 'append-block' };
  } else if (faltan.length) {
    const nuevo = `${actual.replace(/\s*$/, '')}\n\n${APENDICE_GITIGNORE.inicio}\n${faltan.join('\n')}\n${APENDICE_GITIGNORE.fin}\n`;
    escribir(ruta, nuevo);
    fusionados.push(`${ruta} (+${faltan.length})`);
    registroNuevo[ruta] = { hash: hash(nuevo), policy: 'append-block' };
  } else omitidos.push(ruta);
}

/** Devuelve el primer ID de spec que no pertenece a la historia previa del destino. */
function siguienteSpec() {
  const dir = rutaDestinoSegura('docs/specs');
  if (!existsSync(dir)) return '001';
  const ids = readdirSync(dir, { withFileTypes: true })
    .filter((entrada) => entrada.isDirectory())
    .map((entrada) => /^(\d{3})-/.exec(entrada.name)?.[1])
    .filter(Boolean)
    .map(Number);
  return String((ids.length ? Math.max(...ids) : 0) + 1).padStart(3, '0');
}

function contratoSeguridad(anterior, modo) {
  const base = {
    schemaVersion: 1,
    status: opciones.comando === 'update' && anterior.version
      ? 'legacy-pending'
      : modo === 'greenfield' ? 'bootstrap' : 'legacy-pending',
    standards: { owaspTop10: '2025', asvs: '5.0.0', level: 'L2' },
    enforceFromSpec: siguienteSpec(),
  };
  if (!anterior.security || typeof anterior.security !== 'object') return base;
  return {
    ...base,
    ...anterior.security,
    standards: { ...base.standards, ...(anterior.security.standards || {}) },
  };
}

function contratoUsabilidad(anterior, modo) {
  const base = {
    schemaVersion: 1,
    status: opciones.comando === 'update' && anterior.version
      ? 'legacy-pending'
      : modo === 'greenfield' ? 'bootstrap' : 'legacy-pending',
    standards: { wcag: '2.2', level: 'AA', heuristics: 'nielsen-10' },
    enforceFromSpec: siguienteSpec(),
  };
  if (!anterior.usability || typeof anterior.usability !== 'object') return base;
  return {
    ...base,
    ...anterior.usability,
    standards: { ...base.standards, ...(anterior.usability.standards || {}) },
  };
}

function contratoDocumentacion(anterior, modo) {
  const base = {
    schemaVersion: 1,
    status: opciones.comando === 'update' && anterior.version
      ? 'legacy-pending'
      : modo === 'greenfield' ? 'bootstrap' : 'legacy-pending',
    enforceFromSpec: siguienteSpec(),
  };
  if (!anterior.documentation || typeof anterior.documentation !== 'object' ||
      Array.isArray(anterior.documentation)) return base;
  return { ...base, ...anterior.documentation };
}

/**
 * Migra únicamente el vocabulario. No sustituye comandos ni adopta el fichero completo.
 * `security` queda pendiente solo si el proyecto no declaró ya un gate `security` o `security:*`.
 */
function migrarChecksSeguridad(registroNuevo) {
  const ruta = '.sdd/checks.json';
  const actual = leer(rutaDestinoSegura(ruta));
  if (actual === null) return;
  let checks;
  try {
    checks = parseJsonc(actual);
  } catch (error) {
    registrarConflicto(ruta, SEMILLAS[ruta], `JSON/JSONC no válido: ${error.message}`);
    return;
  }
  const configurados = Object.keys(checks.checks || {});
  const yaConfigurado = configurados.some((id) => id === 'security' || id.startsWith('security:'));
  const pendientes = Array.isArray(checks.unconfigured) ? checks.unconfigured : [];
  const yaPendiente = pendientes.some((id) => id === 'security' || id.startsWith('security:'));
  if (yaConfigurado || yaPendiente) return;

  checks.unconfigured = [...pendientes, 'security'];
  const nuevo = `${JSON.stringify(checks, null, 2)}\n`;
  escribir(ruta, nuevo);
  fusionados.push(`${ruta} (+security sin configurar)`);
  registroNuevo[ruta] = { hash: hash(nuevo), policy: 'json-security-migration' };
}

/**
 * Igual que la de seguridad, pero `a11y` nunca se convierte en gate obligatorio automático: la
 * plantilla no sabe si el proyecto tiene interfaz ni con qué stack se pinta. Se deja declarado
 * como pendiente para que aparezca en `detect` y en `configure`, y la persona decida.
 */
function migrarChecksUsabilidad(registroNuevo) {
  const ruta = '.sdd/checks.json';
  const actual = leer(rutaDestinoSegura(ruta));
  if (actual === null) return;
  let checks;
  try {
    checks = parseJsonc(actual);
  } catch (error) {
    if (!conflictos.some((item) => item.startsWith(`${ruta} `)))
      registrarConflicto(ruta, SEMILLAS[ruta], `JSON/JSONC no válido: ${error.message}`);
    return;
  }
  const configurados = Object.keys(checks.checks || {});
  const yaConfigurado = configurados.some((id) => id === 'a11y' || id.startsWith('a11y:'));
  const pendientes = Array.isArray(checks.unconfigured) ? checks.unconfigured : [];
  const yaPendiente = pendientes.some((id) => id === 'a11y' || id.startsWith('a11y:'));
  if (yaConfigurado || yaPendiente) return;

  checks.unconfigured = [...pendientes, 'a11y'];
  const nuevo = `${JSON.stringify(checks, null, 2)}\n`;
  escribir(ruta, nuevo);
  fusionados.push(`${ruta} (+a11y sin configurar)`);
  registroNuevo[ruta] = { hash: hash(nuevo), policy: 'json-usability-migration' };
}

/** Conserva gates docs/docs:* reales y solo mantiene `docs` pendiente si no existe ninguno. */
function migrarChecksDocumentacion(registroNuevo) {
  const ruta = '.sdd/checks.json';
  const actual = leer(rutaDestinoSegura(ruta));
  if (actual === null) return;
  let checks;
  try {
    checks = parseJsonc(actual);
  } catch (error) {
    if (!conflictos.some((item) => item.startsWith(`${ruta} `)))
      registrarConflicto(ruta, SEMILLAS[ruta], `JSON/JSONC no valido: ${error.message}`);
    return;
  }

  const gateReal = Object.entries(checks.checks || {}).some(([id, gate]) =>
    (id === 'docs' || id.startsWith('docs:')) && gate &&
    typeof gate.command === 'string' && gate.command.trim() && gate.required === true &&
    gate.enabled !== false && gate.speed === 'slow');
  const pendientes = Array.isArray(checks.unconfigured) ? checks.unconfigured : [];
  const yaPendiente = pendientes.some((id) => id === 'docs' || id.startsWith('docs:'));
  const nuevosPendientes = gateReal
    ? pendientes.filter((id) => id !== 'docs')
    : yaPendiente ? pendientes : [...pendientes, 'docs'];
  if (JSON.stringify(nuevosPendientes) === JSON.stringify(pendientes)) return;

  checks.unconfigured = nuevosPendientes;
  const nuevo = `${JSON.stringify(checks, null, 2)}\n`;
  escribir(ruta, nuevo);
  fusionados.push(`${ruta} (${gateReal ? 'docs configurado' : 'docs sin configurar'})`);
  registroNuevo[ruta] = { hash: hash(nuevo), policy: 'json-docs-migration' };
}

function migrarRutasRetiradas(registroNuevo, previos) {
  if (opciones.comando !== 'update') return;
  for (const ruta of RUTAS_RETIRADAS) {
    const previo = previos[ruta];
    if (!previo) continue;
    const absoluta = rutaDestinoSegura(ruta);
    const actual = leer(absoluta);
    if (actual === null) {
      delete registroNuevo[ruta];
      continue;
    }
    if (hash(actual) === previo.hash) {
      retirados.push(`${ruta} (eliminado: gestionado e intacto)`);
      if (!opciones.dry) rmSync(absoluta, { force: true });
    } else {
      retirados.push(`${ruta} (preservado: contiene cambios locales)`);
      omitidos.push(ruta);
    }
    delete registroNuevo[ruta];
  }
}

function cargarRegistro() {
  const contenido = leer(rutaDestinoSegura('.sdd/installed.json'));
  try { return JSON.parse(contenido || '{}'); }
  catch { return {}; }
}

function instalarMcp(registroNuevo) {
  if (!opciones.mcp.length) return;
  let seleccionCanonica = null;
  const superficies = [
    ['.mcp.json', 'mcpServers'],
    ['.vscode/mcp.json', 'servers'],
  ];
  for (const [ruta, clave] of superficies) {
    const fuente = leer(join(ORIGEN, ruta));
    if (fuente === null) continue;
    const json = JSON.parse(fuente);
    const disponibles = json[clave] || {};
    const desconocidos = opciones.mcp.filter((id) => !(id in disponibles));
    if (desconocidos.length) throw new Error(`MCP no disponible para ${ruta}: ${desconocidos.join(', ')}`);
    const seleccion = Object.fromEntries(opciones.mcp.map((id) => [id, disponibles[id]]));
    if (clave === 'mcpServers') seleccionCanonica = seleccion;
    const referencias = JSON.stringify(seleccion);
    const inputs = (json.inputs || []).filter((input) => referencias.includes(`\${input:${input.id}}`));
    const salida = {
      ...(json.$schema ? { $schema: json.$schema } : {}),
      ...(inputs.length ? { inputs } : {}),
      [clave]: seleccion,
    };
    const contenido = `${JSON.stringify(salida, null, 2)}\n`;
    if (/(?:@latest|\blatest\b)/i.test(contenido))
      throw new Error(`${ruta} contiene una referencia móvil; fija versiones antes de instalar MCP`);
    instalarFichero(ruta, contenido, registroNuevo, cargarRegistro().files || {});
  }

  if (seleccionCanonica) {
    const valorToml = (valor) => {
      if (Array.isArray(valor)) return `[${valor.map((x) => JSON.stringify(x)).join(', ')}]`;
      if (valor && typeof valor === 'object')
        return `{ ${Object.entries(valor).map(([k, v]) => `${JSON.stringify(k)} = ${JSON.stringify(v)}`).join(', ')} }`;
      return JSON.stringify(valor);
    };
    const secciones = [];
    for (const [id, servidor] of Object.entries(seleccionCanonica)) {
      secciones.push(`[mcp_servers.${id}]`);
      if (servidor.type === 'http') {
        secciones.push(`url = ${valorToml(servidor.url)}`);
        if (servidor.headers) secciones.push(`http_headers = ${valorToml(servidor.headers)}`);
      } else {
        if (servidor.command) secciones.push(`command = ${valorToml(servidor.command)}`);
        if (servidor.args) secciones.push(`args = ${valorToml(servidor.args)}`);
        if (servidor.env) secciones.push(`env = ${valorToml(servidor.env)}`);
      }
      secciones.push('');
    }
    const ruta = '.codex/config.toml';
    const actual = leer(rutaDestinoSegura(ruta)) || '';
    const inicio = '# sdd:mcp:start';
    const fin = '# sdd:mcp:end';
    const bloque = `${inicio}\n${secciones.join('\n').trim()}\n${fin}`;
    const patron = /# sdd:mcp:start[\s\S]*?# sdd:mcp:end/;
    const nuevo = patron.test(actual)
      ? actual.replace(patron, bloque)
      : `${actual.replace(/\s*$/, '')}\n\n${bloque}\n`;
    if (actual.trim() && !tomlPareceValido(actual)) {
      registrarConflicto(ruta, nuevo, 'TOML existente no válido');
      return;
    }
    if (nuevo !== actual) {
      escribir(ruta, nuevo);
      fusionados.push(`${ruta} (MCP: ${opciones.mcp.join(', ')})`);
    }
    registroNuevo[ruta] = { hash: hash(nuevo), policy: 'toml-managed-block' };
  }
}

function instalarFichero(ruta, contenido, registroNuevo, previos) {
  const absoluta = rutaDestinoSegura(ruta);
  const actual = leer(absoluta);
  const previo = previos[ruta];

  if (JSON_FUSIONABLES.includes(ruta) && actual !== null) {
    try {
      const base = parseJsonc(actual);
      const deseado = parseJsonc(contenido);
      const cambios = fusionarJson(base, deseado);
      if (ruta === '.vscode/settings.json') normalizarSuperficiesVsCode(base, deseado, cambios);
      const nuevo = `${JSON.stringify(base, null, 2)}\n`;
      if (cambios.length) {
        escribir(ruta, nuevo);
        fusionados.push(`${ruta} (+${cambios.length})`);
      } else omitidos.push(ruta);
      registroNuevo[ruta] = { hash: hash(nuevo), sourceHash: hash(contenido), policy: 'json-merge' };
    } catch (error) {
      registrarConflicto(ruta, contenido, `JSON/JSONC no válido: ${error.message}`);
    }
    return;
  }

  if (actual === null) {
    escribir(ruta, contenido);
    registroNuevo[ruta] = { hash: hash(contenido), sourceHash: hash(contenido), policy: 'managed' };
  } else if (actual === contenido) {
    omitidos.push(ruta);
    registroNuevo[ruta] = { hash: hash(actual), sourceHash: hash(contenido), policy: 'managed' };
  } else if (previo && hash(actual) === previo.hash) {
    escribir(ruta, contenido);
    registroNuevo[ruta] = { hash: hash(contenido), sourceHash: hash(contenido), policy: 'managed' };
  } else if (previo) {
    registrarConflicto(ruta, contenido);
    registroNuevo[ruta] = previo;
  } else {
    // Brownfield: el fichero preexistente pertenece al proyecto y no se adopta en silencio.
    omitidos.push(ruta);
  }
}

function detectarModo() {
  if (opciones.modo !== 'auto') return opciones.modo;
  if (!existsSync(DESTINO)) return 'greenfield';
  const señales = readdirSync(DESTINO).filter((x) => !['.git', '.DS_Store'].includes(x));
  return señales.length ? 'brownfield' : 'greenfield';
}

function instalarProyecto() {
  if (DESTINO === ORIGEN) throw new Error('No puedes instalar la plantilla sobre sí misma. Usa un directorio destino.');
  if (DESTINO === parsePath(DESTINO).root)
    throw new Error('No puedes instalar la plantilla sobre la raíz de un disco.');
  if (DESTINO === resolve(homedir()))
    throw new Error('No puedes instalar la plantilla directamente sobre el directorio personal.');
  const anterior = cargarRegistro();
  validarRutasRegistro(anterior);
  const previos = anterior.files || Object.fromEntries(
    Object.entries(anterior.ficheros || {}).map(([ruta, h]) => [ruta, { hash: h, policy: 'legacy' }]),
  );
  const registroNuevo = { ...previos };
  const modo = anterior.mode && opciones.modo === 'auto'
    ? anterior.mode
    : opciones.comando === 'update' ? (anterior.mode || 'brownfield') : detectarModo();
  const product = anterior.product || {
    schemaVersion: 1,
    status: opciones.comando === 'update' && anterior.version
      ? 'legacy-pending'
      : modo === 'greenfield' ? 'bootstrap' : 'legacy-pending',
    approvedAt: null,
    approvedBy: null,
    enforceFromSpec: null,
    hashes: {},
  };
  const security = contratoSeguridad(anterior, modo);
  contratoSeguridadActual = security;
  const usability = contratoUsabilidad(anterior, modo);
  contratoUsabilidadActual = usability;
  const documentation = contratoDocumentacion(anterior, modo);
  contratoDocumentacionActual = documentation;

  fusionarSemillas(registroNuevo);
  fusionarGitignore(registroNuevo);
  migrarChecksSeguridad(registroNuevo);
  migrarChecksUsabilidad(registroNuevo);
  migrarChecksDocumentacion(registroNuevo);
  migrarRutasRetiradas(registroNuevo, previos);

  const rutas = listar(ORIGEN).filter((ruta) => debeCopiar(ruta, { conBaseline: opciones.conBaseline }));
  for (const ruta of rutas) {
    const contenido = readFileSync(join(ORIGEN, ruta), 'utf8');
    instalarFichero(ruta, contenido, registroNuevo, previos);
  }

  instalarMcp(registroNuevo);

  for (const dir of DIRECTORIOS_VIRGENES) {
    const gitkeep = `${dir}/.gitkeep`;
    if (!existsSync(rutaDestinoSegura(gitkeep))) escribir(gitkeep, '');
  }

  if (!opciones.dry) {
    let registroSeguro = rutaDestinoSegura('.sdd/installed.json');
    mkdirSync(dirname(registroSeguro), { recursive: true });
    registroSeguro = rutaDestinoSegura('.sdd/installed.json');
    for (const [ruta, meta] of Object.entries(registroNuevo)) {
      const actual = leer(rutaDestinoSegura(ruta));
      if (actual !== null) meta.hash = hash(actual);
      if (ruta in BLOQUES_GESTIONADOS) meta.policy = 'managed-block';
      else if (JSON_FUSIONABLES.includes(ruta)) meta.policy = 'json-merge';
    }
    const ficheros = Object.fromEntries(Object.entries(registroNuevo).map(([ruta, meta]) => [ruta, meta.hash]));
    const ahora = new Date().toISOString();
    const siguiente = {
      schemaVersion: VERSION_MANIFIESTO,
      version: VERSION,
      mode: modo,
      installedAt: anterior.installedAt || anterior.fecha || ahora,
      updatedAt: ahora,
      source: 'jechamo/Estructura_inicial_claude',
      product,
      security,
      usability,
      documentation,
      files: registroNuevo,
      ficheros,
    };
    const sinFecha = (registro) => {
      const copia = { ...registro };
      delete copia.updatedAt;
      return JSON.stringify(copia);
    };
    if (anterior.updatedAt && sinFecha(anterior) === sinFecha(siguiente))
      siguiente.updatedAt = anterior.updatedAt;
    writeFileSync(registroSeguro, `${JSON.stringify(siguiente, null, 2)}\n`, 'utf8');
  }

  informar(modo);
  activarGitHooks(DESTINO);
}

function comprobar() {
  const registro = cargarRegistro();
  validarRutasRegistro(registro);
  if (!registro.version) {
    console.log('Este proyecto no tiene la estructura SDD instalada.');
    console.log('  → sdd init [directorio] --mode auto');
    return;
  }
  const cambios = [];
  const ausentes = [];
  for (const [ruta, meta] of Object.entries(registro.files || {})) {
    const actual = leer(rutaDestinoSegura(ruta));
    if (actual === null) ausentes.push(ruta);
    else if (hash(actual) !== meta.hash) cambios.push(ruta);
  }
  console.log(`Instalado: v${registro.version} · modo ${registro.mode || 'desconocido'} · plantilla v${VERSION}`);
  if (cambios.length) console.log(`\n${cambios.length} fichero(s) con cambios locales; update los preservará.`);
  if (ausentes.length) console.log(`\n${ausentes.length} fichero(s) gestionados ausentes.`);
  if (!cambios.length && !ausentes.length && registro.version === VERSION)
    console.log('\n✅ Al día y sin modificaciones locales.');
}

function instalarGlobal() {
  const destinos = [
    ['.claude/agents', join(homedir(), '.claude/agents')],
    ['.agents/skills', join(homedir(), '.agents/skills')],
    ['.cursor/agents', join(homedir(), '.cursor/agents')],
    ['.github/agents', join(homedir(), '.github/agents')],
  ];
  console.log('Capa global — perfiles y skills; los hooks permanecen por proyecto.');
  for (const [origenRel, destino] of destinos) {
    const rutas = listar(join(ORIGEN, origenRel));
    console.log(`  ${opciones.dry ? '·' : '✓'} ${origenRel}: ${rutas.length} fichero(s) → ${destino}`);
    if (opciones.dry) continue;
    for (const ruta of rutas) {
      const salida = join(destino, ruta);
      mkdirSync(dirname(salida), { recursive: true });
      writeFileSync(salida, readFileSync(join(ORIGEN, origenRel, ruta), 'utf8'), 'utf8');
    }
  }

  const candidatasVsCode = process.platform === 'win32'
    ? [join(process.env.APPDATA || join(homedir(), 'AppData/Roaming'), 'Code/User/settings.json')]
    : process.platform === 'darwin'
      ? [join(homedir(), 'Library/Application Support/Code/User/settings.json')]
      : [join(homedir(), '.config/Code/User/settings.json'), join(homedir(), '.config/Code - OSS/User/settings.json')];
  const settings = candidatasVsCode.find(existsSync);
  const ubicaciones = {
    'chat.agentSkillsLocations': {
      [norm(join(homedir(), '.agents/skills'))]: true,
      [norm(join(homedir(), '.claude/skills'))]: false,
    },
    'chat.agentFilesLocations': {
      [norm(join(homedir(), '.github/agents'))]: true,
      [norm(join(homedir(), '.claude/agents'))]: false,
    },
  };
  if (!settings) {
    console.log(`  ⚠ VS Code: añade manualmente ${JSON.stringify(ubicaciones)}`);
  } else if (opciones.dry) {
    console.log(`  · VS Code: fusionaría ubicaciones globales en ${settings}`);
  } else {
    try {
      const base = parseJsonc(leer(settings) || '{}');
      const cambios = fusionarJson(base, ubicaciones);
      normalizarSuperficiesVsCode(base, ubicaciones, cambios);
      if (cambios.length) writeFileSync(settings, `${JSON.stringify(base, null, 2)}\n`, 'utf8');
    } catch (error) {
      console.log(`  ⚠ VS Code: no se pudo fusionar ${settings}: ${error.message}`);
    }
  }
}

/** Informa cómo activar los hooks copiados; no ejecuta Git ni modifica permisos. */
function activarGitHooks(destino) {
  if (opciones.sinHooks) {
    console.log('\nGates locales: hooks versionables instalados; activación omitida por --no-hooks.');
    return;
  }

  const esGit = existsSync(join(destino, '.git'));
  console.log(`\nGates locales: hooks compartidos instalados${esGit ? '' : '; inicializa Git primero'}.`);
  console.log('Activación manual recomendada:');
  console.log('  git config core.hooksPath .sdd/githooks');
  console.log('  git update-index --chmod=+x .sdd/githooks/pre-commit .sdd/githooks/pre-push');
  console.log('El instalador no ejecuta esos comandos, no crea Husky y no modifica permisos.');
}

function informar(modo) {
  console.log(`\n${opciones.dry ? '[simulación] ' : ''}modo ${modo} · ${escritos.length} escrito(s) · ${fusionados.length} fusionado(s) · ${omitidos.length} conservado(s) · ${conflictos.length} conflicto(s)`);
  if (fusionados.length) for (const ruta of fusionados) console.log(`  + ${ruta}`);
  if (conflictos.length) {
    console.log('\nConflictos conservados fuera de los ficheros del proyecto:');
    for (const conflicto of conflictos) console.log(`  ! ${conflicto}`);
  }
  if (retirados.length) {
    console.log('\nArtefactos retirados de versiones anteriores:');
    for (const ruta of retirados) console.log(`  - ${ruta}`);
  }
  if (opciones.dry) console.log('\nSimulación: no se ha creado ni modificado ningún fichero.');
  else {
    console.log('\nVS Code: confía en el workspace y ejecuta `Developer: Reload Window` para aplicar una sola superficie de agentes y skills.');
    if (contratoSeguridadActual?.status === 'legacy-pending') {
      console.log(`Seguridad: legacy-pending; conserva la historia y exige el contrato nuevo desde la spec ${contratoSeguridadActual.enforceFromSpec}.`);
    }
    if (contratoUsabilidadActual?.status === 'legacy-pending') {
      console.log(`Usabilidad: legacy-pending; conserva la historia y exige el contrato nuevo desde la spec ${contratoUsabilidadActual.enforceFromSpec}. Las checklists están en docs/design/A11Y-CHECKLIST.md y docs/design/USABILITY-CHECKLIST.md.`);
    }
    if (contratoDocumentacionActual?.status === 'legacy-pending') {
      console.log(`Documentación: legacy-pending; conserva el contrato previo y exige desde la spec ${contratoDocumentacionActual.enforceFromSpec}.`);
    }
    console.log('\nCompartido/versionable: código, tests, agentes, skills, reglas, hooks, specs, evidencias y documentación oficial.');
    console.log('Local/excluido: secretos `.env*`, configuración personal, cachés, `.sdd/state/` y `.sdd/conflicts/`.');
    console.log('Revisa deliberadamente antes de versionar: git status --short');
    if (modo === 'greenfield') console.log('Siguiente paso: /sdd-intake; tras aprobar producto, /sdd-init.');
    else console.log('Siguiente paso: /sdd-intake para cerrar legacy-pending o /onboard para documentar la arquitectura existente.');
  }
}

try {
  if (opciones.comando === 'global') instalarGlobal();
  else if (opciones.comando === 'check') comprobar();
  else instalarProyecto();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
