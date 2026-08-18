/**
 * Generador de comandos.
 *
 * Esta página no instala nada: no puede, y es mejor así. Un sitio web no ejecuta procesos en el
 * ordenador de quien lo visita, de modo que lo honesto es construir el comando exacto y dejar
 * que la persona lo pegue en su terminal, donde puede leerlo antes de que ocurra nada.
 *
 * El texto plano y la versión coloreada salen de la misma estructura, así que lo que se copia
 * es siempre lo que se ve.
 */

import { REF_FIJA, REPO } from './datos.mjs';

const RUTA_EJEMPLO = 'C:\\ruta\\proyecto';
const PAQUETE = `github:${REPO}#${REF_FIJA}`;

/** Solo se entrecomilla cuando hace falta; un comando lleno de comillas se lee peor. */
const citar = (valor) => (/[\s"'`$;&|<>^%()]/.test(valor) ? `"${valor}"` : valor);

/**
 * Cada pieza lleva su tipo para poder colorearla sin volver a analizar la cadena después.
 * `tipo` se corresponde con las clases `l-*` de la hoja de componentes.
 */
function piezas(estado) {
  const ruta = estado.ruta.trim() || RUTA_EJEMPLO;
  const base = [
    { tipo: 'cmd', texto: 'npx' },
    { tipo: 'bandera', texto: '--yes' },
    { tipo: 'tenue', texto: PAQUETE },
  ];

  const opciones = [];
  if (estado.modo !== 'auto') opciones.push({ tipo: 'bandera', texto: `--mode ${estado.modo}` });
  else opciones.push({ tipo: 'bandera', texto: '--mode auto' });
  if (estado.sinHooks) opciones.push({ tipo: 'bandera', texto: '--no-hooks' });
  if (estado.conBaseline) opciones.push({ tipo: 'bandera', texto: '--con-baseline' });

  return {
    simular: [...base, { tipo: 'cmd', texto: 'init' }, { tipo: 'ruta', texto: citar(ruta) }, ...opciones, { tipo: 'bandera', texto: '--dry-run' }],
    instalar: [...base, { tipo: 'cmd', texto: 'init' }, { tipo: 'ruta', texto: citar(ruta) }, ...opciones],
    actualizar: [...base, { tipo: 'cmd', texto: 'update' }, { tipo: 'ruta', texto: citar(ruta) }],
    entrar: [{ tipo: 'cmd', texto: 'cd' }, { tipo: 'ruta', texto: citar(ruta) }],
    verificar: [{ tipo: 'cmd', texto: 'node' }, { tipo: 'tenue', texto: 'scripts/check-sdd.mjs' }],
  };
}

const plano = (linea) => linea.map((p) => p.texto).join(' ');

function pintarLinea(linea) {
  const fila = document.createElement('div');
  const indicador = document.createElement('span');
  indicador.className = 'l-prompt';
  indicador.textContent = '$ ';
  fila.append(indicador);

  linea.forEach((pieza, i) => {
    const nodo = document.createElement('span');
    nodo.className = `l-${pieza.tipo}`;
    nodo.textContent = pieza.texto;
    fila.append(nodo);
    if (i < linea.length - 1) fila.append(document.createTextNode(' '));
  });

  return fila;
}

/**
 * `data-comandos` nombra las líneas a pintar, separadas por comas, y opcionalmente una salida
 * esperada en `data-salida` para el paso de verificación.
 */
function pintarTerminales(estado) {
  const juego = piezas(estado);

  for (const cuerpo of document.querySelectorAll('[data-comandos]')) {
    const nombres = cuerpo.dataset.comandos.split(',').map((n) => n.trim()).filter(Boolean);
    const lineas = nombres.map((nombre) => juego[nombre]).filter(Boolean);

    cuerpo.textContent = '';
    for (const linea of lineas) cuerpo.append(pintarLinea(linea));

    if (cuerpo.dataset.salida) {
      for (const texto of cuerpo.dataset.salida.split('\n')) {
        const fila = document.createElement('div');
        fila.className = texto.startsWith('!') ? 'l-aviso' : 'l-ok';
        fila.textContent = texto.replace(/^!/, '');
        cuerpo.append(fila);
      }
    }

    // Lo que copia el botón: solo los comandos, nunca la salida de ejemplo.
    cuerpo.dataset.comando = lineas.map(plano).join('\n');
  }
}

function leerEstado(panel) {
  return {
    ruta: panel.querySelector('[data-campo="ruta"]')?.value ?? '',
    modo: panel.querySelector('[data-campo="modo"]')?.value ?? 'auto',
    sinHooks: panel.querySelector('[data-campo="sin-hooks"]')?.checked ?? false,
    conBaseline: panel.querySelector('[data-campo="con-baseline"]')?.checked ?? false,
  };
}

export function iniciarComandos() {
  const panel = document.querySelector('[data-panel]');
  if (!panel) return;

  const campoRuta = panel.querySelector('[data-campo="ruta"]');
  const aviso = panel.querySelector('[data-aviso-ruta]');

  const revisarRuta = () => {
    if (!aviso || !campoRuta) return;
    const valor = campoRuta.value.trim();
    const absoluta = /^([A-Za-z]:[\\/]|[\\/]{1,2})/.test(valor);
    const visible = valor.length > 0 && !absoluta;
    aviso.hidden = !visible;
    campoRuta.setAttribute('aria-invalid', String(visible));
  };

  const refrescar = () => {
    pintarTerminales(leerEstado(panel));
    revisarRuta();
  };

  panel.addEventListener('input', refrescar);
  panel.addEventListener('change', refrescar);
  refrescar();
}
