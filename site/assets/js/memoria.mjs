/**
 * Página de la memoria técnica.
 *
 * El documento se sirve como Markdown y se convierte en el navegador. Podría haberse
 * pre-renderizado a HTML, pero entonces habría dos copias del mismo texto y una acabaría
 * quedándose atrás; así el fichero de `docs/` sigue siendo la única fuente.
 */

import { renderizar } from './markdown.mjs';
import { VERSION } from './datos.mjs';
import { iniciarMovimiento } from './motion.mjs';

const CDN_MERMAID = 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';

const prosa = document.querySelector('[data-prosa]');
const listaIndice = document.querySelector('[data-indice]');
const buscador = document.querySelector('[data-buscar]');
const estado = document.querySelector('[data-estado]');

for (const nodo of document.querySelectorAll('[data-version]')) {
  nodo.textContent = `v${VERSION}`;
}

/* ── Diagramas ────────────────────────────────────────────────────────────── */

/**
 * Mermaid se carga desde una CDN y solo cuando hay diagramas que dibujar. Si no llega —red
 * cortada, bloqueo corporativo— cada diagrama se degrada a su propio código fuente, que sigue
 * siendo legible.
 */
async function dibujarDiagramas() {
  const cajas = [...document.querySelectorAll('[data-mermaid]')];
  if (!cajas.length) return;

  const respaldo = () => {
    for (const caja of cajas) {
      caja.textContent = '';
      const pre = document.createElement('pre');
      const code = document.createElement('code');
      code.textContent = caja.dataset.mermaid;
      pre.append(code);
      caja.append(pre);
    }
  };

  let mermaid;
  try {
    ({ default: mermaid } = await import(CDN_MERMAID));
  } catch {
    respaldo();
    return;
  }

  mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
    themeVariables: {
      background: '#0d1020',
      primaryColor: '#141830',
      primaryTextColor: '#e9edfb',
      primaryBorderColor: '#6d8bff',
      lineColor: '#94a3dc',
      secondaryColor: '#141830',
      tertiaryColor: '#0d1020',
    },
  });

  for (const caja of cajas) {
    try {
      const { svg } = await mermaid.render(`diagrama-${caja.dataset.indice}`, caja.dataset.mermaid);
      caja.innerHTML = svg;
    } catch {
      caja.textContent = '';
      const pre = document.createElement('pre');
      const code = document.createElement('code');
      code.textContent = caja.dataset.mermaid;
      pre.append(code);
      caja.append(pre);
    }
  }
}

/* ── Índice ───────────────────────────────────────────────────────────────── */

function construirIndice(entradas) {
  if (!listaIndice) return [];

  const enlaces = [];
  for (const entrada of entradas) {
    const item = document.createElement('li');
    const enlace = document.createElement('a');
    enlace.className = 'indice__enlace';
    enlace.href = `#${entrada.id}`;
    enlace.dataset.nivel = String(entrada.nivel);
    enlace.textContent = entrada.texto;
    item.append(enlace);
    listaIndice.append(item);
    enlaces.push(enlace);
  }

  if (!('IntersectionObserver' in window)) return enlaces;

  // Se marca el último encabezado que ha cruzado el borde superior de la ventana.
  const vistos = new Set();
  const vigia = new IntersectionObserver((registros) => {
    for (const registro of registros) {
      if (registro.isIntersecting) vistos.add(registro.target.id);
      else vistos.delete(registro.target.id);
    }
    const activo = entradas.find((e) => vistos.has(e.id))?.id;
    for (const enlace of enlaces) {
      enlace.classList.toggle('activo', Boolean(activo) && enlace.getAttribute('href') === `#${activo}`);
    }
  }, { rootMargin: '-15% 0px -70% 0px' });

  for (const entrada of entradas) {
    const titulo = document.getElementById(entrada.id);
    if (titulo) vigia.observe(titulo);
  }

  return enlaces;
}

/* ── Búsqueda ─────────────────────────────────────────────────────────────── */

function iniciarBusqueda(enlaces) {
  if (!buscador) return;

  buscador.addEventListener('input', () => {
    const consulta = buscador.value.trim().toLowerCase();
    for (const enlace of enlaces) {
      enlace.parentElement.hidden = Boolean(consulta) && !enlace.textContent.toLowerCase().includes(consulta);
    }
  });
}

/* ── Carga ────────────────────────────────────────────────────────────────── */

async function cargar() {
  try {
    const respuesta = await fetch('assets/memoria.md');
    if (!respuesta.ok) throw new Error(String(respuesta.status));
    const texto = await respuesta.text();

    const { fragmento, indice } = renderizar(texto);
    prosa.textContent = '';
    prosa.append(fragmento);
    estado?.remove();

    const enlaces = construirIndice(indice);
    iniciarBusqueda(enlaces);

    // El ancla del enlace de entrada no existe hasta que el documento está pintado.
    if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();

    await dibujarDiagramas();
  } catch {
    prosa.textContent = '';
    const aviso = document.createElement('p');
    aviso.className = 'parrafo';
    aviso.textContent = 'No se ha podido cargar la memoria técnica. Está disponible en el repositorio, en docs/TFM/MEMORIA-SISTEMA-AGENTES.md.';
    prosa.append(aviso);
    estado?.remove();
  }
}

cargar();
iniciarMovimiento();
