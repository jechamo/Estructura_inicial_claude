/**
 * Sección de documentación: trae la memoria completa, la renderiza y la hace navegable.
 *
 * El documento se sirve entero, sin recortes ni resúmenes. Lo que se añade encima es solo
 * navegación: índice con seguimiento del scroll, búsqueda, progreso de lectura y diagramas.
 */
import { pedirTexto } from './api.mjs';
import { renderizar } from './markdown.mjs';

const CDN_MERMAID = 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';

const $ = (selector) => document.querySelector(selector);

let cargada = false;
let entradasIndice = [];

/* ── Índice ───────────────────────────────────────────────────────────────── */

function pintarIndice(indice) {
  const lista = $('#indice-lista');
  lista.textContent = '';
  entradasIndice = [];

  for (const entrada of indice) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.className = 'indice__enlace';
    a.dataset.nivel = String(entrada.nivel);
    a.href = `#${entrada.id}`;
    a.textContent = entrada.texto;
    li.append(a);
    lista.append(li);
    entradasIndice.push({ ...entrada, li, enlace: a, texto: entrada.texto });
  }
}

/** Marca en el índice el encabezado por el que va la lectura. */
function seguimiento() {
  const titulos = entradasIndice
    .map((e) => ({ ...e, nodo: document.getElementById(e.id) }))
    .filter((e) => e.nodo);
  if (!titulos.length) return;

  let pendiente = false;
  const actualizar = () => {
    pendiente = false;
    const linea = window.scrollY + 140;
    let activo = titulos[0];
    for (const titulo of titulos) if (titulo.nodo.offsetTop <= linea) activo = titulo;

    for (const titulo of titulos) titulo.enlace.classList.toggle('activo', titulo === activo);

    const prosa = $('#prosa');
    const inicio = prosa.offsetTop;
    const total = prosa.offsetHeight - window.innerHeight;
    const barra = $('#progreso-lectura');
    if (total > 0) {
      const avance = Math.min(1, Math.max(0, (window.scrollY - inicio) / total));
      barra.style.setProperty('--avance', String(avance));
      barra.classList.toggle('visible', avance > 0 && avance < 1);
    } else {
      barra.classList.remove('visible');
    }
  };

  addEventListener('scroll', () => {
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(actualizar);
  }, { passive: true });
  actualizar();
}

/* ── Búsqueda en el índice ────────────────────────────────────────────────── */

function resaltar(enlace, texto, consulta) {
  enlace.textContent = '';
  if (!consulta) { enlace.textContent = texto; return; }
  const posicion = texto.toLowerCase().indexOf(consulta);
  if (posicion < 0) { enlace.textContent = texto; return; }
  enlace.append(
    document.createTextNode(texto.slice(0, posicion)),
    Object.assign(document.createElement('mark'), { textContent: texto.slice(posicion, posicion + consulta.length) }),
    document.createTextNode(texto.slice(posicion + consulta.length)),
  );
}

function buscador() {
  const campo = $('#buscar-indice');
  campo.addEventListener('input', () => {
    const consulta = campo.value.trim().toLowerCase();
    let visibles = 0;

    for (const entrada of entradasIndice) {
      const coincide = !consulta || entrada.texto.toLowerCase().includes(consulta);
      entrada.li.hidden = !coincide;
      if (coincide) { visibles += 1; resaltar(entrada.enlace, entrada.texto, consulta); }
    }

    const lista = $('#indice-lista');
    let vacio = lista.querySelector('.indice__vacio');
    if (!visibles) {
      if (!vacio) {
        vacio = document.createElement('li');
        vacio.className = 'indice__vacio';
        vacio.textContent = 'Ninguna sección coincide.';
        lista.append(vacio);
      }
      vacio.hidden = false;
    } else if (vacio) {
      vacio.hidden = true;
    }
  });
}

/* ── Diagramas ────────────────────────────────────────────────────────────── */

/** Sustituye el diagrama por su código fuente cuando Mermaid no está disponible. */
function respaldo(caja, motivo) {
  caja.textContent = '';
  const envoltorio = document.createElement('div');
  envoltorio.className = 'diagrama__respaldo';
  const nota = document.createElement('p');
  nota.className = 'diagrama__nota';
  nota.textContent = motivo;
  const pre = document.createElement('pre');
  const code = document.createElement('code');
  code.textContent = caja.dataset.mermaid;
  pre.append(code);
  envoltorio.append(nota, pre);
  caja.append(envoltorio);
}

async function diagramas() {
  const cajas = [...document.querySelectorAll('[data-mermaid]')];
  if (!cajas.length) return;

  let mermaid;
  try {
    ({ default: mermaid } = await import(CDN_MERMAID));
  } catch {
    for (const caja of cajas) {
      respaldo(caja, 'Sin conexión con el CDN: se muestra el código del diagrama tal cual.');
    }
    return;
  }

  mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    securityLevel: 'strict',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    themeVariables: { background: '#0b0d17', primaryColor: '#161a2b', lineColor: '#6d8bff' },
  });

  // Se renderizan bajo demanda: la memoria tiene más de una decena y dibujarlos todos de
  // entrada bloquearía el hilo principal durante un buen rato.
  const observador = new IntersectionObserver(async (entradas) => {
    for (const entrada of entradas) {
      if (!entrada.isIntersecting) continue;
      const caja = entrada.target;
      observador.unobserve(caja);
      try {
        const { svg } = await mermaid.render(`diagrama-${caja.dataset.indice}`, caja.dataset.mermaid);
        const contenedor = document.createElement('div');
        // `svg` viene de Mermaid en modo estricto, que ya sanea el contenido del diagrama.
        contenedor.innerHTML = svg;
        caja.textContent = '';
        caja.append(contenedor);
      } catch (error) {
        respaldo(caja, `El diagrama no se pudo dibujar (${error.message}). Este es su código.`);
      }
    }
  }, { rootMargin: '400px 0px' });

  for (const caja of cajas) observador.observe(caja);
}

/* ── Carga ────────────────────────────────────────────────────────────────── */

function estado(texto, conAnillo = true) {
  const prosa = $('#prosa');
  prosa.textContent = '';
  const caja = document.createElement('div');
  caja.className = 'docs__estado';
  if (conAnillo) {
    const anillo = document.createElement('span');
    anillo.className = 'diagrama__anillo';
    anillo.setAttribute('aria-hidden', 'true');
    caja.append(anillo);
  }
  const mensaje = document.createElement('span');
  mensaje.textContent = texto;
  caja.append(mensaje);
  prosa.append(caja);
}

async function cargar() {
  if (cargada) return;
  const boton = $('#cargar-memoria');
  boton.disabled = true;
  estado('Trayendo la memoria completa…');

  let markdown;
  try {
    markdown = await pedirTexto('/api/memoria');
  } catch (error) {
    estado(`No se pudo cargar la memoria: ${error.message}`, false);
    boton.disabled = false;
    return;
  }

  const { fragmento, indice } = renderizar(markdown);
  const prosa = $('#prosa');
  prosa.textContent = '';
  prosa.append(fragmento);

  pintarIndice(indice);
  seguimiento();
  buscador();
  diagramas();

  cargada = true;
  boton.textContent = 'Memoria cargada';
  $('#descargar-memoria').hidden = false;
  $('#imprimir').hidden = false;
  $('#imprimir').addEventListener('click', () => window.print());

  // Si se llegó con un ancla en la URL, ahora sí existe el destino.
  if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
}

export function iniciarDocumentacion() {
  $('#cargar-memoria').addEventListener('click', cargar);

  // Carga automática al acercarse a la sección: quien baja hasta aquí quiere leerla.
  const seccion = document.getElementById('documentacion');
  const observador = new IntersectionObserver((entradas) => {
    for (const entrada of entradas) {
      if (!entrada.isIntersecting) continue;
      observador.disconnect();
      cargar();
    }
  }, { rootMargin: '300px 0px' });
  observador.observe(seccion);
}
