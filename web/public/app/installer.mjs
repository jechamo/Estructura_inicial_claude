/**
 * Instalador de tres pasos.
 *
 * La regla que gobierna este módulo: nada avanza solo. Cada paso termina, muestra lo que ha
 * pasado y se queda esperando. Un instalador que encadena los tres pasos por su cuenta es más
 * cómodo hasta el día que escribe donde no debía.
 */
import { pedirJson, escucharFlujo, VERSION } from './api.mjs';

const REF_FIJA = `v${VERSION}`;

const $ = (selector, raiz = document) => raiz.querySelector(selector);
const $$ = (selector, raiz = document) => [...raiz.querySelectorAll(selector)];

const estado = {
  destinoValido: false,
  ejecuciones: new Map(),
  aborto: new Map(),
};

/* ── Lectura del formulario ────────────────────────────────────────────────── */

function leerConfig(paso) {
  const refSeleccionada = $('#ref').value;
  return {
    paso,
    destino: $('#destino').value.trim(),
    modo: $('#modo').value,
    ref: refSeleccionada === '' ? REF_FIJA : refSeleccionada,
    mcp: $('#mcp').value.split(',').map((x) => x.trim()).filter(Boolean),
    sinHooks: $('#sin-hooks').checked,
    conBaseline: $('#con-baseline').checked,
    tlsPermisivo: $('#tls-permisivo').checked,
  };
}

/* ── Validación de la ruta ─────────────────────────────────────────────────── */

function pintarValidacion(resultado) {
  const caja = $('#destino-validacion');
  const entrada = $('#destino');
  caja.textContent = '';

  if (!resultado || !resultado.ok) {
    estado.destinoValido = false;
    entrada.setAttribute('aria-invalid', 'true');
    entrada.removeAttribute('data-estado');
    if (resultado && resultado.error) {
      const p = document.createElement('p');
      p.className = 'error';
      p.textContent = resultado.error;
      caja.append(p);
    }
    return;
  }

  estado.destinoValido = true;
  entrada.removeAttribute('aria-invalid');
  entrada.dataset.estado = 'ok';

  const ok = document.createElement('p');
  ok.className = 'ok';
  ok.textContent = resultado.existe ? 'Carpeta encontrada.' : 'Ruta válida.';
  caja.append(ok);

  for (const texto of resultado.avisos || []) {
    const p = document.createElement('p');
    p.className = 'aviso';
    p.textContent = texto;
    caja.append(p);
  }
}

async function refrescarPrevia() {
  const config = leerConfig(1);
  const previa = $('#previa-codigo');
  if (!estado.destinoValido) {
    previa.textContent = 'Indica una carpeta válida para ver el comando.';
    return;
  }
  const paso1 = await pedirJson('/api/preview', config);
  const paso2 = await pedirJson('/api/preview', { ...config, paso: 2 });
  const paso3 = await pedirJson('/api/preview', { ...config, paso: 3 });
  if (!paso1.ok) { previa.textContent = paso1.error || 'Configuración no válida.'; return; }

  const marcaTls = config.tlsPermisivo ? '\n\n# con TLS permisivo: NODE_TLS_REJECT_UNAUTHORIZED=0 solo en este proceso' : '';
  previa.textContent = [
    `# paso 1 — simulación\n${paso1.comando}`,
    `# paso 2 — instalación real\n${paso2.comando}`,
    `# paso 3 — verificación\n${paso3.comando}`,
  ].join('\n\n') + marcaTls;
}

function retardado(fn, ms) {
  let id = null;
  return (...args) => {
    clearTimeout(id);
    id = setTimeout(() => fn(...args), ms);
  };
}

const validarRuta = retardado(async () => {
  const valor = $('#destino').value.trim();
  if (!valor) { pintarValidacion(null); await refrescarPrevia(); return; }
  pintarValidacion(await pedirJson('/api/validate-path', { destino: valor }));
  await refrescarPrevia();
}, 320);

/* ── Estado visual de los pasos ────────────────────────────────────────────── */

const nodoPaso = (paso) => $(`.paso[data-paso="${paso}"]`);

function fijarEstado(paso, nuevo) {
  const nodo = nodoPaso(paso);
  nodo.dataset.estado = nuevo;
  const medidor = $('.paso__medidor', nodo);
  const relleno = { bloqueado: '0%', listo: '0%', ejecutando: '50%', hecho: '100%', error: '100%' }[nuevo] || '0%';
  medidor.style.setProperty('--relleno', relleno);

  const ejecutar = $('[data-accion="ejecutar"]', nodo);
  const cancelar = $('[data-accion="cancelar"]', nodo);
  const enCurso = nuevo === 'ejecutando';
  ejecutar.disabled = nuevo === 'bloqueado' || enCurso;
  cancelar.hidden = !enCurso;
  $(`.terminal[data-terminal="${paso}"]`).dataset.vivo = enCurso ? 'si' : 'no';
}

function insignia(paso, texto, tono) {
  const nodo = $('[data-insignia]', nodoPaso(paso));
  nodo.textContent = texto;
  nodo.className = `pastilla pastilla-${tono}`;
}

function crono(paso, ms) {
  const nodo = $('[data-crono]', nodoPaso(paso));
  nodo.textContent = ms == null ? '' : `${(ms / 1000).toFixed(1)} s`;
}

function escribirLinea(paso, texto, clase) {
  const salida = $(`[data-salida="${paso}"]`);
  const linea = document.createElement('span');
  if (clase) linea.className = clase;
  linea.textContent = `${texto}\n`;
  salida.append(linea);
  const alFinal = salida.scrollHeight - salida.scrollTop - salida.clientHeight < 60;
  if (alFinal) salida.scrollTop = salida.scrollHeight;
}

function limpiarPaso(paso) {
  $(`[data-salida="${paso}"]`).textContent = '';
  const confirmacion = $(`[data-confirmacion="${paso}"]`);
  confirmacion.textContent = '';
  confirmacion.className = 'confirmacion';
  crono(paso, null);
}

/* ── Tarjetas de confirmación ──────────────────────────────────────────────── */

function tarjeta(paso, { tono, titulo, texto, metricas = [], comparativa = null, acciones = [] }) {
  const caja = $(`[data-confirmacion="${paso}"]`);
  caja.textContent = '';
  caja.className = `confirmacion confirmacion--${tono} visible`;

  const h = document.createElement('h4');
  h.textContent = titulo;
  caja.append(h);

  if (texto) {
    const p = document.createElement('p');
    p.textContent = texto;
    caja.append(p);
  }

  if (metricas.length) {
    const rejilla = document.createElement('div');
    rejilla.className = 'metricas';
    for (const m of metricas) {
      const celda = document.createElement('div');
      celda.className = 'metrica';
      if (m.tono) celda.dataset.tono = m.tono;
      const b = document.createElement('b');
      b.textContent = String(m.valor);
      const s = document.createElement('span');
      s.textContent = m.nombre;
      celda.append(b, s);
      rejilla.append(celda);
    }
    caja.append(rejilla);
  }

  if (comparativa) {
    const bloque = document.createElement('div');
    bloque.className = 'comparativa';
    for (const columna of comparativa) {
      const parte = document.createElement('div');
      const titulo5 = document.createElement('h5');
      titulo5.textContent = columna.titulo;
      const pre = document.createElement('pre');
      pre.textContent = columna.texto;
      parte.append(titulo5, pre);
      bloque.append(parte);
    }
    caja.append(bloque);
  }

  if (acciones.length) {
    const fila = document.createElement('div');
    fila.className = 'paso__acciones';
    for (const accion of acciones) {
      const boton = document.createElement('button');
      boton.type = 'button';
      boton.className = `btn ${accion.clase || 'btn-fantasma'} btn-pequeno`;
      boton.textContent = accion.texto;
      boton.addEventListener('click', accion.al);
      fila.append(boton);
    }
    caja.append(fila);
  }
}

/* ── Ejecución de un paso ──────────────────────────────────────────────────── */

async function ejecutar(paso) {
  if (!estado.destinoValido) {
    $('#destino').focus();
    return;
  }

  limpiarPaso(paso);
  $(`.terminal[data-terminal="${paso}"]`).classList.add('visible');
  fijarEstado(paso, 'ejecutando');
  insignia(paso, 'en curso', 'aviso');

  const config = leerConfig(paso);
  const arranque = await pedirJson('/api/run', config);
  if (!arranque.ok) {
    fijarEstado(paso, 'error');
    insignia(paso, 'error', 'error');
    escribirLinea(paso, arranque.error || 'No se pudo iniciar el proceso.', 'l-err');
    return;
  }

  estado.ejecuciones.set(paso, arranque.id);
  const controlador = new AbortController();
  estado.aborto.set(paso, controlador);

  const recibir = (evento) => {
    if (evento.tipo === 'inicio') {
      escribirLinea(paso, `$ ${evento.comando}`, 'l-info');
      escribirLinea(paso, `  cwd: ${evento.cwd}`, 'l-info');
      return;
    }
    if (evento.tipo === 'aviso') { escribirLinea(paso, `! ${evento.texto}`, 'l-aviso'); return; }
    if (evento.tipo === 'error') { escribirLinea(paso, `✗ ${evento.texto}`, 'l-err'); return; }
    if (evento.tipo === 'stdout') { escribirLinea(paso, evento.texto); return; }
    if (evento.tipo === 'stderr') { escribirLinea(paso, evento.texto, 'l-err'); return; }
    if (evento.tipo === 'fin') cerrarPaso(paso, evento, config);
  };

  try {
    await escucharFlujo(`/api/run/${arranque.id}/stream`, recibir, controlador.signal);
  } catch (error) {
    if (error.name !== 'AbortError') {
      fijarEstado(paso, 'error');
      escribirLinea(paso, `✗ Se perdió la conexión con el proceso: ${error.message}`, 'l-err');
    }
  }
}

async function cancelar(paso) {
  const id = estado.ejecuciones.get(paso);
  if (!id) return;
  await pedirJson(`/api/run/${id}/cancel`, {});
}

/* ── Cierre de cada paso ───────────────────────────────────────────────────── */

function cerrarPaso(paso, evento, config) {
  crono(paso, evento.duracionMs);
  const resumen = evento.resumen || {};
  const bien = evento.codigo === 0 && evento.estado === 'ok';

  fijarEstado(paso, bien ? 'hecho' : 'error');
  insignia(paso, bien ? 'completado' : evento.estado === 'cancelado' ? 'cancelado' : 'error', bien ? 'exito' : 'error');

  if (!bien) { tarjetaDeFallo(paso, evento, resumen, config); return; }

  if (paso === 1) confirmarSimulacion(resumen);
  else if (paso === 2) confirmarInstalacion(resumen);
  else confirmarVerificacion(resumen);
}

function tarjetaDeFallo(paso, evento, resumen, config) {
  const acciones = [{ texto: 'Reintentar', clase: 'btn-primario', al: () => ejecutar(paso) }];

  // La descarga es lo primero que se rompe en una red corporativa, y muchas veces sin dejar un
  // mensaje reconocible: por eso el reintento permisivo se ofrece ante cualquier fallo de los
  // dos primeros pasos, no solo cuando el log delata el certificado.
  if (!config.tlsPermisivo && paso !== 3 && evento.estado !== 'cancelado') {
    acciones.unshift({
      texto: 'Reintentar en modo TLS permisivo',
      clase: 'btn-peligro',
      al: () => {
        $('#tls-permisivo').checked = true;
        $('#tls-permisivo').dispatchEvent(new Event('change', { bubbles: true }));
        ejecutar(paso);
      },
    });
  }

  const cancelado = evento.estado === 'cancelado';
  const agotado = evento.estado === 'timeout';

  let texto;
  if (cancelado) texto = 'El proceso se ha detenido a petición tuya. Nada más ha cambiado.';
  else if (agotado) texto = 'Se agotó el tiempo sin respuesta. Casi siempre es la descarga desde GitHub: comprueba tu proxy o prueba el modo TLS permisivo.';
  else if (resumen.sugiereTls) texto = 'La salida apunta a un problema de certificados, de proxy o de red, no del instalador. Revisa el log completo antes de decidir.';
  else texto = 'Revisa el log completo arriba: contiene el motivo exacto.';

  tarjeta(paso, {
    tono: cancelado ? 'aviso' : 'error',
    titulo: cancelado
      ? 'Paso cancelado'
      : agotado
        ? `El paso ${paso} agotó el tiempo máximo`
        : `El paso ${paso} ha fallado (código ${evento.codigo})`,
    texto,
    acciones,
  });
}

function confirmarSimulacion(resumen) {
  const metricas = resumen.reconocido ? [
    { nombre: 'escritos', valor: resumen.escritos ?? '—' },
    { nombre: 'fusionados', valor: resumen.fusionados ?? '—' },
    { nombre: 'conservados', valor: resumen.conservados ?? '—' },
    { nombre: 'conflictos', valor: resumen.conflictos ?? '—', tono: resumen.conflictos ? 'aviso' : 'ok' },
  ] : [];

  tarjeta(1, {
    tono: 'ok',
    titulo: 'Simulación terminada — no se ha escrito nada',
    texto: resumen.reconocido
      ? `Esto es lo que haría la instalación real: ${resumen.linea}`
      : 'El proceso terminó bien. Revisa el log para ver el detalle.',
    metricas,
    acciones: [
      {
        texto: 'Continuar con la instalación real',
        clase: 'btn-exito',
        al: () => {
          fijarEstado(2, 'listo');
          $('.paso__resumen', nodoPaso(2)).textContent = 'Escribe en disco. Revisa el comando antes de lanzarlo.';
          nodoPaso(2).scrollIntoView({ behavior: 'smooth', block: 'center' });
          $('[data-accion="ejecutar"]', nodoPaso(2)).focus();
        },
      },
      { texto: 'Volver a simular', al: () => ejecutar(1) },
    ],
  });
}

function confirmarInstalacion(resumen) {
  const metricas = resumen.reconocido ? [
    { nombre: 'escritos', valor: resumen.escritos ?? '—', tono: 'ok' },
    { nombre: 'fusionados', valor: resumen.fusionados ?? '—' },
    { nombre: 'conservados', valor: resumen.conservados ?? '—' },
    { nombre: 'conflictos', valor: resumen.conflictos ?? '—', tono: resumen.conflictos ? 'aviso' : 'ok' },
  ] : [];

  tarjeta(2, {
    tono: 'ok',
    titulo: 'Instalación completada',
    texto: resumen.reconocido ? resumen.linea : 'El instalador terminó sin errores.',
    metricas,
    acciones: [
      {
        texto: 'Verificar la instalación',
        clase: 'btn-exito',
        al: () => {
          fijarEstado(3, 'listo');
          nodoPaso(3).scrollIntoView({ behavior: 'smooth', block: 'center' });
          ejecutar(3);
        },
      },
    ],
  });
}

const SALIDA_ESPERADA = 'check-sdd (normal) · 0 spec(s) · 0 tarea(s) hecha(s) · 20 agente(s) · 26 skill(s)\n✅ Estructura y coherencia correctas.';

function confirmarVerificacion(resumen) {
  const contratoOk = resumen.agentes === 20 && resumen.skills === 26;

  tarjeta(3, {
    tono: contratoOk ? 'ok' : 'aviso',
    titulo: contratoOk ? 'Contrato verificado' : 'Verificación con matices',
    texto: contratoOk
      ? 'El recuento de agentes y skills coincide con el contrato: la instalación está completa.'
      : 'El proceso terminó bien pero el recuento no coincide con el contrato esperado. Revisa el log.',
    metricas: resumen.reconocido ? [
      { nombre: 'specs', valor: resumen.specs ?? '—' },
      { nombre: 'tareas', valor: resumen.tareas ?? '—' },
      { nombre: 'agentes', valor: resumen.agentes ?? '—', tono: resumen.agentes === 20 ? 'ok' : 'aviso' },
      { nombre: 'skills', valor: resumen.skills ?? '—', tono: resumen.skills === 26 ? 'ok' : 'aviso' },
    ] : [],
    comparativa: resumen.reconocido ? [
      { titulo: 'Salida esperada', texto: SALIDA_ESPERADA },
      { titulo: 'Salida obtenida', texto: `${resumen.linea}\n${resumen.correcto ? '✅ Estructura y coherencia correctas.' : '(sin línea de confirmación)'}` },
    ] : null,
  });

  mostrarSiguientes();
}

function mostrarSiguientes() {
  const destino = $('#destino').value.trim();
  $('#siguientes-codigo').textContent = [
    `cd "${destino}"`,
    'git config core.hooksPath .sdd/githooks',
    'git update-index --chmod=+x .sdd/githooks/pre-commit .sdd/githooks/pre-push',
    '',
    '# y en VS Code: confía en el workspace y ejecuta «Developer: Reload Window»',
  ].join('\n');
  $('#siguientes').classList.add('visible');
}

/* ── Copiar al portapapeles ────────────────────────────────────────────────── */

async function copiar(texto, boton) {
  const original = boton.textContent;
  try {
    await navigator.clipboard.writeText(texto);
    boton.textContent = 'Copiado';
  } catch {
    boton.textContent = 'No se pudo copiar';
  }
  setTimeout(() => { boton.textContent = original; }, 1600);
}

/* ── Arranque ──────────────────────────────────────────────────────────────── */

export function iniciarInstalador() {
  $('#marca-version').textContent = `v${VERSION}`;
  $('#ref').options[0].textContent = `${REF_FIJA} — etiqueta fija, reproducible`;

  $('#destino').addEventListener('input', validarRuta);
  for (const id of ['#modo', '#ref', '#mcp', '#sin-hooks', '#con-baseline']) {
    $(id).addEventListener('change', refrescarPrevia);
  }

  $('#tls-permisivo').addEventListener('change', (evento) => {
    $('#aviso-tls').classList.toggle('visible', evento.target.checked);
    refrescarPrevia();
  });

  $('#config').addEventListener('submit', (evento) => evento.preventDefault());

  for (const boton of $$('[data-accion="ejecutar"]')) {
    boton.addEventListener('click', () => ejecutar(Number(boton.dataset.objetivo)));
  }
  for (const boton of $$('[data-accion="cancelar"]')) {
    boton.addEventListener('click', () => cancelar(Number(boton.dataset.objetivo)));
  }
  for (const boton of $$('[data-copiar]')) {
    boton.addEventListener('click', () => copiar($(boton.dataset.copiar).textContent, boton));
  }
  for (const boton of $$('[data-copiar-log]')) {
    boton.addEventListener('click', () => copiar($(`[data-salida="${boton.dataset.copiarLog}"]`).textContent, boton));
  }

  for (const paso of [1, 2, 3]) fijarEstado(paso, paso === 1 ? 'listo' : 'bloqueado');
}
