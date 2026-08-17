#!/usr/bin/env node
/**
 * Servidor de la landing de instalación. Node >= 18, sin dependencias.
 *
 *   node web/server.mjs [--port 4173] [--no-open]
 *
 * Escucha solo en la interfaz de bucle local y exige un testigo generado al arrancar, que se
 * inyecta en el HTML. Un servidor local sin testigo es alcanzable desde cualquier página que
 * el usuario tenga abierta —eso es el ataque de reasignación de DNS— y aquí hay un endpoint
 * que ejecuta procesos, así que el coste de equivocarse no es teórico.
 */
import { createServer } from 'node:http';
import { readFile, readFileSync, existsSync, statSync } from 'node:fs';
import { readFile as leerFichero } from 'node:fs/promises';
import { join, dirname, resolve, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';
import { spawn } from 'node:child_process';
import { tipoMime } from './lib/mime.mjs';
import { validarDestino, validarOpciones } from './lib/validate.mjs';
import { lanzar, obtener, construirComando, REPO } from './lib/runner.mjs';

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = resolve(AQUI, '..');
const PUBLICO = join(AQUI, 'public');
const MEMORIA = join(RAIZ, 'docs', 'TFM', 'MEMORIA-SISTEMA-AGENTES.md');

const TESTIGO = randomBytes(24).toString('hex');
const MAX_CUERPO = 64 * 1024;

const argv = process.argv.slice(2);
const abrirNavegador = !argv.includes('--no-open');
const indicePuerto = argv.indexOf('--port');
const PUERTO = indicePuerto >= 0 ? Number(argv[indicePuerto + 1]) || 4173 : 4173;

const VERSION = (() => {
  try { return JSON.parse(readFileSync(join(RAIZ, 'package.json'), 'utf8')).version || '0.0.0'; }
  catch { return '0.0.0'; }
})();

const CSP = [
  "default-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'none'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  // Mermaid se carga bajo demanda y solo para los diagramas de la memoria; si no hay red, la
  // interfaz degrada al bloque de código y no pasa nada más.
  "script-src 'self' https://cdn.jsdelivr.net",
  // Mermaid inserta una etiqueta <style> dentro de cada SVG que genera.
  "style-src 'self' 'unsafe-inline'",
].join('; ');

function cabecerasBase(extra = {}) {
  return {
    'content-security-policy': CSP,
    'x-content-type-options': 'nosniff',
    'referrer-policy': 'no-referrer',
    'cross-origin-opener-policy': 'same-origin',
    'cache-control': 'no-store',
    ...extra,
  };
}

const responderJson = (res, codigo, cuerpo) => {
  const texto = JSON.stringify(cuerpo);
  res.writeHead(codigo, cabecerasBase({ 'content-type': 'application/json; charset=utf-8' }));
  res.end(texto);
};

/** Solo se atiende a quien dice venir de este mismo servidor local. */
function anfitrionValido(req) {
  const host = String(req.headers.host || '').toLowerCase();
  return host === `127.0.0.1:${PUERTO}` || host === `localhost:${PUERTO}` || host === `[::1]:${PUERTO}`;
}

function leerCuerpo(req) {
  return new Promise((resolver, rechazar) => {
    let total = 0;
    const trozos = [];
    req.on('data', (trozo) => {
      total += trozo.length;
      if (total > MAX_CUERPO) {
        rechazar(new Error('Cuerpo demasiado grande'));
        req.destroy();
        return;
      }
      trozos.push(trozo);
    });
    req.on('end', () => {
      if (!trozos.length) { resolver({}); return; }
      try { resolver(JSON.parse(Buffer.concat(trozos).toString('utf8'))); }
      catch { rechazar(new Error('JSON no válido')); }
    });
    req.on('error', rechazar);
  });
}

function servirEstatico(req, res, rutaUrl) {
  const relativa = rutaUrl === '/' ? '/index.html' : rutaUrl;
  const destino = join(PUBLICO, normalize(relativa).replace(/^([/\\])+/, ''));
  if (!destino.startsWith(PUBLICO)) { responderJson(res, 403, { error: 'Ruta no permitida' }); return; }
  if (!existsSync(destino) || !statSync(destino).isFile()) { responderJson(res, 404, { error: 'No encontrado' }); return; }

  readFile(destino, (error, datos) => {
    if (error) { responderJson(res, 500, { error: 'No se pudo leer el fichero' }); return; }
    if (destino.endsWith('index.html')) {
      const html = datos.toString('utf8')
        .replace('__SDD_TOKEN__', TESTIGO)
        .replace('__SDD_VERSION__', VERSION);
      res.writeHead(200, cabecerasBase({ 'content-type': 'text/html; charset=utf-8' }));
      res.end(html);
      return;
    }
    res.writeHead(200, cabecerasBase({ 'content-type': tipoMime(destino) }));
    res.end(datos);
  });
}

function abrirFlujo(res, ejecucion) {
  res.writeHead(200, cabecerasBase({
    'content-type': 'text/event-stream; charset=utf-8',
    connection: 'keep-alive',
    'x-accel-buffering': 'no',
  }));

  const enviar = (evento) => {
    if (res.writableEnded) return;
    res.write(`data: ${JSON.stringify(evento)}\n\n`);
    if (evento.tipo === 'fin') res.end();
  };

  const desuscribir = ejecucion.suscribir(enviar);
  const latido = setInterval(() => { if (!res.writableEnded) res.write(': latido\n\n'); }, 15000);
  res.on('close', () => { clearInterval(latido); desuscribir(); });
}

async function atenderApi(req, res, url) {
  if (req.headers['x-sdd-token'] !== TESTIGO) { responderJson(res, 401, { error: 'Testigo no válido' }); return; }

  if (url.pathname === '/api/health' && req.method === 'GET') {
    responderJson(res, 200, {
      ok: true,
      node: process.version,
      plataforma: process.platform,
      version: VERSION,
      repo: REPO,
      refPorDefecto: `v${VERSION}`,
      raiz: RAIZ,
      memoriaDisponible: existsSync(MEMORIA),
    });
    return;
  }

  if (url.pathname === '/api/validate-path' && req.method === 'POST') {
    const cuerpo = await leerCuerpo(req);
    responderJson(res, 200, validarDestino(cuerpo.destino));
    return;
  }

  if (url.pathname === '/api/preview' && req.method === 'POST') {
    const cuerpo = await leerCuerpo(req);
    const opciones = validarOpciones(cuerpo);
    if (!opciones.ok) { responderJson(res, 400, opciones); return; }
    responderJson(res, 200, { ok: true, comando: construirComando(opciones).texto });
    return;
  }

  if (url.pathname === '/api/run' && req.method === 'POST') {
    const cuerpo = await leerCuerpo(req);
    const opciones = validarOpciones(cuerpo);
    if (!opciones.ok) { responderJson(res, 400, opciones); return; }
    const ejecucion = lanzar(opciones);
    responderJson(res, 200, { ok: true, id: ejecucion.id, comando: construirComando(opciones).texto });
    return;
  }

  const flujo = url.pathname.match(/^\/api\/run\/([0-9a-f-]{36})\/stream$/);
  if (flujo && req.method === 'GET') {
    const ejecucion = obtener(flujo[1]);
    if (!ejecucion) { responderJson(res, 404, { error: 'Ejecución desconocida' }); return; }
    abrirFlujo(res, ejecucion);
    return;
  }

  const cancelar = url.pathname.match(/^\/api\/run\/([0-9a-f-]{36})\/cancel$/);
  if (cancelar && req.method === 'POST') {
    const ejecucion = obtener(cancelar[1]);
    if (!ejecucion) { responderJson(res, 404, { error: 'Ejecución desconocida' }); return; }
    responderJson(res, 200, { ok: ejecucion.cancelar() });
    return;
  }

  if (url.pathname === '/api/memoria' && req.method === 'GET') {
    if (!existsSync(MEMORIA)) { responderJson(res, 404, { error: 'La memoria no está disponible en este repositorio.' }); return; }
    const texto = await leerFichero(MEMORIA, 'utf8');
    res.writeHead(200, cabecerasBase({ 'content-type': 'text/markdown; charset=utf-8' }));
    res.end(texto);
    return;
  }

  responderJson(res, 404, { error: 'Endpoint desconocido' });
}

const servidor = createServer((req, res) => {
  if (!anfitrionValido(req)) { responderJson(res, 403, { error: 'Anfitrión no permitido' }); return; }

  const url = new URL(req.url, `http://127.0.0.1:${PUERTO}`);

  if (url.pathname.startsWith('/api/')) {
    atenderApi(req, res, url).catch((error) => {
      if (!res.headersSent) responderJson(res, 400, { error: error.message });
    });
    return;
  }

  if (req.method !== 'GET') { responderJson(res, 405, { error: 'Método no permitido' }); return; }
  servirEstatico(req, res, url.pathname);
});

function abrir(url) {
  const orden = process.platform === 'win32'
    ? { cmd: 'cmd', args: ['/c', 'start', '', url] }
    : process.platform === 'darwin'
      ? { cmd: 'open', args: [url] }
      : { cmd: 'xdg-open', args: [url] };
  try {
    spawn(orden.cmd, orden.args, { stdio: 'ignore', detached: true, windowsHide: true }).unref();
  } catch { /* si no hay navegador, la URL ya está impresa en la consola */ }
}

servidor.listen(PUERTO, '127.0.0.1', () => {
  const url = `http://127.0.0.1:${PUERTO}/`;
  console.log(`Instalador SDD v${VERSION} — ${url}`);
  console.log('Escucha solo en bucle local. Cierra con Ctrl+C.');
  if (abrirNavegador) abrir(url);
});

servidor.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`El puerto ${PUERTO} está ocupado. Prueba: node web/server.mjs --port ${PUERTO + 1}`);
    process.exit(1);
  }
  console.error(error.message);
  process.exit(1);
});
