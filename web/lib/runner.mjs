/**
 * Ejecutor de los tres pasos de instalación.
 *
 * Dos decisiones importan aquí:
 *
 * 1. Nunca se abre un intérprete de órdenes. `npx` en Windows es un `.cmd`, y Node >= 20 se
 *    niega a lanzarlo sin shell; la salida fácil sería `shell: true`, que reintroduce la
 *    inyección por la puerta de atrás. En vez de eso se resuelve `npx-cli.js` junto al propio
 *    ejecutable de Node y se lanza `node npx-cli.js …` con los argumentos como array.
 * 2. El modo TLS permisivo vive y muere con el proceso hijo. Se pasa por `env`, no se escribe
 *    en `.npmrc` ni en la configuración global, para que relajar la validación una vez no deje
 *    el equipo relajado para siempre.
 *
 * Node >= 18, sin dependencias.
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { randomUUID } from 'node:crypto';

export const REPO = 'github:jechamo/Estructura_inicial_claude';

const MAX_LINEAS = 4000;
const TIMEOUT_POR_PASO = { 1: 10 * 60 * 1000, 2: 20 * 60 * 1000, 3: 5 * 60 * 1000 };

/** Síntomas de que el fallo es de certificados o de proxy, no del instalador. */
const SINTOMAS_TLS = [
  'unable to get local issuer certificate',
  'self signed certificate',
  'self-signed certificate',
  'unable to verify the first certificate',
  'cert_untrusted',
  'depth_zero_self_signed_cert',
  'err_tls_cert_altname_invalid',
  'certificate has expired',
  'econnreset',
  'econnrefused',
  'etimedout',
  'enotfound',
  'eai_again',
  'und_err_connect_timeout',
  'tunneling socket could not be established',
  'network',
  'proxy',
  '407',
];

/** Localiza `npx-cli.js` en el mismo Node que ejecuta este servidor. */
export function resolverNpxCli(ejecutable = process.execPath) {
  const base = dirname(ejecutable);
  const candidatos = [
    join(base, 'node_modules', 'npm', 'bin', 'npx-cli.js'),
    join(base, '..', 'lib', 'node_modules', 'npm', 'bin', 'npx-cli.js'),
    join(base, '..', 'node_modules', 'npm', 'bin', 'npx-cli.js'),
  ];
  return candidatos.find((ruta) => existsSync(ruta)) || null;
}

/** Construye el comando literal de un paso, tal y como se mostrará en la interfaz. */
export function construirComando(opciones) {
  const { paso, destino, modo, ref, mcp, sinHooks, conBaseline } = opciones;
  if (paso === 3) {
    return {
      programa: 'node',
      args: ['scripts/check-sdd.mjs'],
      cwd: destino.ruta,
      texto: `cd "${destino.ruta}"\nnode scripts/check-sdd.mjs`,
    };
  }

  const paquete = ref ? `${REPO}#${ref}` : REPO;
  const args = ['--yes', paquete, 'init', destino.ruta, '--mode', modo, '--si'];
  if (paso === 1) args.push('--dry-run');
  if (sinHooks) args.push('--no-hooks');
  if (conBaseline) args.push('--con-baseline');
  if (mcp.length) args.push('--with-mcp', mcp.join(','));

  const legible = args
    .map((a) => (a === destino.ruta ? `"${a}"` : a))
    .join(' ');

  return { programa: 'npx', args, cwd: process.cwd(), texto: `npx ${legible}` };
}

/** Entorno del proceso hijo. El modo permisivo solo existe dentro de este objeto. */
function construirEntorno(tlsPermisivo) {
  const env = { ...process.env, npm_config_yes: 'true', NO_COLOR: '1', FORCE_COLOR: '0' };
  if (tlsPermisivo) {
    env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    env.npm_config_strict_ssl = 'false';
  }
  return env;
}

/** Mata también a los hijos: en Windows, matar `npx` deja vivo al `node` que lanzó. */
function matarArbol(proceso) {
  if (!proceso || proceso.killed) return;
  if (process.platform === 'win32') {
    spawn('taskkill', ['/pid', String(proceso.pid), '/T', '/F'], { stdio: 'ignore' });
    return;
  }
  try { process.kill(-proceso.pid, 'SIGTERM'); }
  catch { proceso.kill('SIGTERM'); }
}

/**
 * Una ejecución en curso. Guarda su propia salida para que un cliente que se reconecte no
 * pierda el principio del log, y reparte los eventos a quien esté escuchando.
 */
class Ejecucion {
  constructor(opciones) {
    this.id = randomUUID();
    this.paso = opciones.paso;
    this.opciones = opciones;
    this.eventos = [];
    this.oyentes = new Set();
    this.estado = 'pendiente';
    this.codigo = null;
    this.proceso = null;
    this.temporizador = null;
    this.iniciadoEn = Date.now();
  }

  emitir(evento) {
    if (evento.tipo === 'stdout' || evento.tipo === 'stderr') {
      this.eventos.push(evento);
      if (this.eventos.length > MAX_LINEAS) this.eventos.splice(0, this.eventos.length - MAX_LINEAS);
    } else {
      this.eventos.push(evento);
    }
    for (const oyente of this.oyentes) {
      try { oyente(evento); } catch { /* un cliente caído no puede tumbar la ejecución */ }
    }
  }

  suscribir(oyente) {
    for (const evento of this.eventos) oyente(evento);
    if (this.estado !== 'ejecutando' && this.estado !== 'pendiente') {
      // Solo se fabrica un cierre si no lo hay ya en el búfer: repetirlo haría que el cliente
      // procesara el final dos veces, y la segunda llegaría sin resumen.
      if (!this.eventos.some((e) => e.tipo === 'fin')) {
        oyente({ tipo: 'fin', codigo: this.codigo, estado: this.estado, resumen: this.resumen(), duracionMs: Date.now() - this.iniciadoEn });
      }
      return () => {};
    }
    this.oyentes.add(oyente);
    return () => this.oyentes.delete(oyente);
  }

  cancelar() {
    if (this.estado !== 'ejecutando') return false;
    this.estado = 'cancelado';
    this.emitir({ tipo: 'aviso', texto: 'Cancelado por el usuario.' });
    matarArbol(this.proceso);
    return true;
  }

  arrancar() {
    const comando = construirComando(this.opciones);
    const tls = this.opciones.tlsPermisivo === true;

    if (this.paso === 3 && !existsSync(join(comando.cwd, 'scripts', 'check-sdd.mjs'))) {
      this.estado = 'error';
      this.emitir({ tipo: 'error', texto: 'No existe scripts/check-sdd.mjs en el destino: ejecuta antes el paso 2.' });
      this.emitir({ tipo: 'fin', codigo: 1, estado: 'error' });
      return this;
    }

    let programa;
    let args;
    let usaShell = false;

    if (this.paso === 3) {
      programa = process.execPath;
      args = [join(comando.cwd, 'scripts', 'check-sdd.mjs')];
    } else {
      const npxCli = resolverNpxCli();
      if (npxCli) {
        programa = process.execPath;
        args = [npxCli, ...comando.args];
      } else if (this.opciones.destino.seguraSinShell) {
        // Node se instaló sin npm junto al ejecutable. Se recurre al shell, pero solo porque la
        // ruta ya se validó como libre de metacaracteres, y se deja constancia en el log.
        programa = 'npx';
        args = comando.args;
        usaShell = true;
        this.emitir({ tipo: 'aviso', texto: 'No se encontró npx-cli.js junto a Node: se usará el intérprete del sistema.' });
      } else {
        this.estado = 'error';
        this.emitir({ tipo: 'error', texto: 'No se encontró npx-cli.js y la ruta contiene caracteres que impiden usar el intérprete del sistema con seguridad.' });
        this.emitir({ tipo: 'fin', codigo: 1, estado: 'error' });
        return this;
      }
    }

    this.estado = 'ejecutando';
    this.emitir({ tipo: 'inicio', comando: comando.texto, cwd: comando.cwd, tls });
    if (tls) {
      this.emitir({ tipo: 'aviso', texto: 'Modo TLS permisivo activo: la validación de certificados queda desactivada solo para este proceso.' });
    }

    this.proceso = spawn(programa, args, {
      cwd: comando.cwd,
      env: construirEntorno(tls),
      shell: usaShell,
      windowsHide: true,
      detached: process.platform !== 'win32',
    });

    const trocear = (tipo) => {
      let resto = '';
      return (bloque) => {
        const texto = resto + bloque.toString('utf8');
        const lineas = texto.split(/\r?\n/);
        resto = lineas.pop();
        for (const linea of lineas) this.emitir({ tipo, texto: linea });
      };
    };

    this.proceso.stdout.on('data', trocear('stdout'));
    this.proceso.stderr.on('data', trocear('stderr'));

    this.temporizador = setTimeout(() => {
      if (this.estado !== 'ejecutando') return;
      this.estado = 'timeout';
      this.emitir({ tipo: 'error', texto: 'Tiempo máximo agotado; el proceso se ha detenido.' });
      matarArbol(this.proceso);
    }, TIMEOUT_POR_PASO[this.paso] || TIMEOUT_POR_PASO[3]);

    this.proceso.on('error', (error) => {
      clearTimeout(this.temporizador);
      this.estado = 'error';
      this.codigo = -1;
      this.emitir({ tipo: 'error', texto: `No se pudo lanzar el proceso: ${error.message}` });
      this.emitir({ tipo: 'fin', codigo: -1, estado: 'error' });
      this.oyentes.clear();
    });

    this.proceso.on('close', (codigo) => {
      clearTimeout(this.temporizador);
      this.codigo = codigo;
      if (this.estado === 'ejecutando') this.estado = codigo === 0 ? 'ok' : 'error';
      this.emitir({
        tipo: 'fin',
        codigo,
        estado: this.estado,
        resumen: this.resumen(),
        duracionMs: Date.now() - this.iniciadoEn,
      });
      this.oyentes.clear();
    });

    return this;
  }

  /** Extrae de la salida lo que la interfaz necesita para decidir si el paso fue bien. */
  resumen() {
    const salida = this.eventos
      .filter((e) => e.tipo === 'stdout' || e.tipo === 'stderr')
      .map((e) => e.texto)
      .join('\n');
    return { ...analizarSalida(salida, this.paso), sugiereTls: pareceProblemaTls(salida) };
  }
}

/** Un fallo de red o de certificado no se parece a un fallo del instalador; conviene distinguirlos. */
export function pareceProblemaTls(salida) {
  const texto = String(salida || '').toLowerCase();
  return SINTOMAS_TLS.some((sintoma) => texto.includes(sintoma));
}

/**
 * Lee las líneas de resumen que emiten el instalador y `check-sdd`. Son texto plano: el
 * instalador no ofrece salida en JSON, así que se parsea lo que imprime y, si el formato
 * cambiase, la interfaz sigue mostrando el log íntegro en vez de mentir con un resumen vacío.
 */
export function analizarSalida(salida, paso) {
  const texto = String(salida || '');
  if (paso === 3) {
    const linea = texto.match(/check-sdd \((normal|estricto)\)[^\n]*/);
    if (!linea) return { tipo: 'check', reconocido: false };
    const num = (patron) => {
      const m = linea[0].match(patron);
      return m ? Number(m[1]) : null;
    };
    return {
      tipo: 'check',
      reconocido: true,
      linea: linea[0].trim(),
      specs: num(/(\d+)\s+spec/),
      tareas: num(/(\d+)\s+tarea/),
      agentes: num(/(\d+)\s+agente/),
      skills: num(/(\d+)\s+skill/),
      correcto: /Estructura y coherencia correctas/.test(texto),
    };
  }

  const linea = texto.match(/(?:\[simulaci[oó]n\] )?modo (auto|greenfield|brownfield)[^\n]*/i);
  if (!linea) return { tipo: 'init', reconocido: false };
  const num = (patron) => {
    const m = linea[0].match(patron);
    return m ? Number(m[1]) : null;
  };
  return {
    tipo: 'init',
    reconocido: true,
    linea: linea[0].trim(),
    modo: linea[1],
    escritos: num(/(\d+) escrito/),
    fusionados: num(/(\d+) fusionado/),
    conservados: num(/(\d+) conservado/),
    conflictos: num(/(\d+) conflicto/),
    simulacion: /\[simulaci[oó]n\]/i.test(linea[0]),
  };
}

const ejecuciones = new Map();

export function lanzar(opciones) {
  // Una ejecución por paso: relanzar sustituye a la anterior en vez de acumular procesos.
  for (const [id, previa] of ejecuciones) {
    if (previa.estado !== 'ejecutando' && Date.now() - previa.iniciadoEn > 60 * 60 * 1000) ejecuciones.delete(id);
  }
  const ejecucion = new Ejecucion(opciones).arrancar();
  ejecuciones.set(ejecucion.id, ejecucion);
  return ejecucion;
}

export const obtener = (id) => ejecuciones.get(id) || null;
