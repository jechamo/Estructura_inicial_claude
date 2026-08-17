/**
 * Renderizador de Markdown sin dependencias.
 *
 * Construye nodos del DOM en vez de concatenar HTML. Es más verboso, pero significa que ningún
 * fragmento del documento puede convertirse en marcado ejecutable por accidente: el texto entra
 * siempre por `textContent`.
 */

const ESQUEMAS_SEGUROS = /^(https?:|mailto:|#|\.{0,2}\/)/i;

const trocito = (etiqueta, texto) => {
  const nodo = document.createElement(etiqueta);
  nodo.textContent = texto;
  return nodo;
};

export function idDeTitulo(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 80) || 'seccion';
}

/* ── Nivel de línea ────────────────────────────────────────────────────────── */

const PATRON_INLINE = /(`[^`\n]+`)|(\*\*[^*\n]+\*\*)|(__[^_\n]+__)|(~~[^~\n]+~~)|(\*[^*\n]+\*)|(_[^_\n]+_)|(\[[^\]\n]*\]\([^)\s]+\))/g;

export function inline(texto) {
  const fragmento = document.createDocumentFragment();
  let indice = 0;

  for (const coincidencia of texto.matchAll(PATRON_INLINE)) {
    if (coincidencia.index > indice) {
      fragmento.append(document.createTextNode(texto.slice(indice, coincidencia.index)));
    }
    const bruto = coincidencia[0];
    indice = coincidencia.index + bruto.length;

    if (bruto.startsWith('`')) { fragmento.append(trocito('code', bruto.slice(1, -1))); continue; }
    if (bruto.startsWith('**') || bruto.startsWith('__')) { fragmento.append(trocito('strong', bruto.slice(2, -2))); continue; }
    if (bruto.startsWith('~~')) { fragmento.append(trocito('del', bruto.slice(2, -2))); continue; }
    if (bruto.startsWith('[')) {
      const corte = bruto.indexOf('](');
      const etiqueta = bruto.slice(1, corte);
      const destino = bruto.slice(corte + 2, -1);
      if (!ESQUEMAS_SEGUROS.test(destino)) {
        // Un enlace con un esquema desconocido se degrada a texto: no merece la pena arriesgarse.
        fragmento.append(document.createTextNode(bruto));
        continue;
      }
      const enlace = document.createElement('a');
      enlace.href = destino;
      enlace.append(inline(etiqueta));
      if (/^https?:/i.test(destino)) { enlace.target = '_blank'; enlace.rel = 'noopener noreferrer'; }
      fragmento.append(enlace);
      continue;
    }
    fragmento.append(trocito('em', bruto.slice(1, -1)));
  }

  if (indice < texto.length) fragmento.append(document.createTextNode(texto.slice(indice)));
  return fragmento;
}

/* ── Tablas ───────────────────────────────────────────────────────────────── */

const celdas = (linea) => linea.replace(/^\s*\|/, '').replace(/\|\s*$/, '').split('|').map((c) => c.trim());
const esSeparador = (linea) => /^\s*\|?[\s:|-]+\|[\s:|-]*$/.test(linea) && linea.includes('-');

function tabla(lineas) {
  const envoltorio = document.createElement('div');
  envoltorio.className = 'tabla-envoltorio';
  const nodoTabla = document.createElement('table');
  const cabecera = document.createElement('thead');
  const filaCabecera = document.createElement('tr');

  const alineaciones = celdas(lineas[1]).map((c) => (
    c.startsWith(':') && c.endsWith(':') ? 'center' : c.endsWith(':') ? 'right' : null
  ));

  celdas(lineas[0]).forEach((texto, i) => {
    const th = document.createElement('th');
    th.append(inline(texto));
    if (alineaciones[i]) th.style.textAlign = alineaciones[i];
    filaCabecera.append(th);
  });
  cabecera.append(filaCabecera);

  const cuerpo = document.createElement('tbody');
  for (const linea of lineas.slice(2)) {
    const tr = document.createElement('tr');
    celdas(linea).forEach((texto, i) => {
      const td = document.createElement('td');
      td.append(inline(texto));
      if (alineaciones[i]) td.style.textAlign = alineaciones[i];
      tr.append(td);
    });
    cuerpo.append(tr);
  }

  nodoTabla.append(cabecera, cuerpo);
  envoltorio.append(nodoTabla);
  return envoltorio;
}

/* ── Listas ───────────────────────────────────────────────────────────────── */

const MARCA_LISTA = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/;

function elemento(texto) {
  const li = document.createElement('li');
  const casilla = /^\[([ xX])\]\s+/.exec(texto);
  if (casilla) {
    const marca = document.createElement('input');
    marca.type = 'checkbox';
    marca.disabled = true;
    marca.checked = casilla[1].toLowerCase() === 'x';
    marca.style.marginRight = '0.45rem';
    li.append(marca, inline(texto.slice(casilla[0].length)));
  } else {
    li.append(inline(texto));
  }
  return li;
}

/**
 * Construye una lista y, de forma recursiva, sus sublistas. La sangría del primer elemento fija
 * el nivel: lo que venga más sangrado cuelga del elemento anterior, y lo que venga menos cierra
 * la lista y devuelve el control al bloque de arriba.
 */
function lista(lineas, desde) {
  const primera = MARCA_LISTA.exec(lineas[desde]);
  const sangriaBase = primera[1].length;
  const ul = document.createElement(primera[2].length > 1 ? 'ol' : 'ul');
  let i = desde;
  let actual = null;

  while (i < lineas.length) {
    const m = MARCA_LISTA.exec(lineas[i]);

    if (m) {
      const sangria = m[1].length;
      if (sangria < sangriaBase) break;
      if (sangria > sangriaBase) {
        if (!actual) break;
        const anidada = lista(lineas, i);
        actual.append(anidada.nodo);
        i = anidada.fin;
        continue;
      }
      actual = elemento(m[3]);
      ul.append(actual);
      i += 1;
      continue;
    }

    // Una línea en blanco no cierra la lista si después sigue habiendo elementos: las listas
    // sueltas de Markdown separan sus puntos con líneas vacías.
    if (!lineas[i].trim()) {
      let j = i + 1;
      while (j < lineas.length && !lineas[j].trim()) j += 1;
      const siguiente = j < lineas.length ? MARCA_LISTA.exec(lineas[j]) : null;
      if (siguiente && siguiente[1].length >= sangriaBase) { i = j; continue; }
      break;
    }

    // Continuación sangrada del último elemento.
    if (actual && lineas[i].startsWith(' '.repeat(sangriaBase + 2))) {
      actual.append(document.createTextNode(' '), inline(lineas[i].trim()));
      i += 1;
      continue;
    }

    break;
  }

  return { nodo: ul, fin: i };
}

/* ── Documento completo ───────────────────────────────────────────────────── */

/**
 * Devuelve `{ fragmento, indice }`, donde `indice` es la lista de encabezados con su nivel y su
 * identificador, lista para pintar el índice lateral sin volver a recorrer el DOM.
 */
export function renderizar(markdown) {
  const lineas = markdown.replace(/\r\n/g, '\n').split('\n');
  const fragmento = document.createDocumentFragment();
  const indice = [];
  const usados = new Set();
  let i = 0;
  let diagramas = 0;

  const idUnico = (texto) => {
    const base = idDeTitulo(texto);
    let id = base;
    let n = 2;
    while (usados.has(id)) { id = `${base}-${n}`; n += 1; }
    usados.add(id);
    return id;
  };

  while (i < lineas.length) {
    const linea = lineas[i];

    if (!linea.trim()) { i += 1; continue; }

    // Comentarios y marcadores HTML: se ignoran en silencio.
    if (/^\s*<!--/.test(linea)) {
      while (i < lineas.length && !/-->/.test(lineas[i])) i += 1;
      i += 1;
      continue;
    }

    // Bloque de código cercado.
    const cerca = /^\s*```+\s*([\w+-]*)\s*$/.exec(linea);
    if (cerca) {
      const idioma = cerca[1].toLowerCase();
      const cuerpo = [];
      i += 1;
      while (i < lineas.length && !/^\s*```+\s*$/.test(lineas[i])) { cuerpo.push(lineas[i]); i += 1; }
      i += 1;

      if (idioma === 'mermaid') {
        diagramas += 1;
        const caja = document.createElement('figure');
        caja.className = 'diagrama';
        caja.dataset.mermaid = cuerpo.join('\n');
        caja.dataset.indice = String(diagramas);
        const cargando = document.createElement('div');
        cargando.className = 'diagrama__cargando';
        const anillo = document.createElement('span');
        anillo.className = 'diagrama__anillo';
        anillo.setAttribute('aria-hidden', 'true');
        cargando.append(anillo, trocito('span', `Diagrama ${diagramas}`));
        caja.append(cargando);
        fragmento.append(caja);
        continue;
      }

      const pre = document.createElement('pre');
      const code = trocito('code', cuerpo.join('\n'));
      if (idioma) code.dataset.idioma = idioma;
      pre.append(code);
      fragmento.append(pre);
      continue;
    }

    // Encabezado.
    const titulo = /^(#{1,6})\s+(.*)$/.exec(linea);
    if (titulo) {
      const nivel = titulo[1].length;
      const texto = titulo[2].replace(/\s+#+\s*$/, '').trim();
      const h = document.createElement(`h${nivel}`);
      const id = idUnico(texto);
      h.id = id;
      h.append(inline(texto));
      if (nivel >= 2 && nivel <= 4) {
        const ancla = document.createElement('a');
        ancla.className = 'ancla';
        ancla.href = `#${id}`;
        ancla.textContent = '#';
        ancla.setAttribute('aria-label', `Enlace a «${texto}»`);
        h.append(ancla);
        indice.push({ nivel, texto, id });
      }
      fragmento.append(h);
      i += 1;
      continue;
    }

    // Regla horizontal.
    if (/^\s*([-*_])\s*\1\s*\1[\s\-*_]*$/.test(linea)) {
      fragmento.append(document.createElement('hr'));
      i += 1;
      continue;
    }

    // Tabla.
    if (linea.includes('|') && i + 1 < lineas.length && esSeparador(lineas[i + 1])) {
      const bloque = [linea, lineas[i + 1]];
      i += 2;
      while (i < lineas.length && lineas[i].includes('|') && lineas[i].trim()) { bloque.push(lineas[i]); i += 1; }
      fragmento.append(tabla(bloque));
      continue;
    }

    // Cita.
    if (/^\s*>\s?/.test(linea)) {
      const cuerpo = [];
      while (i < lineas.length && /^\s*>\s?/.test(lineas[i])) { cuerpo.push(lineas[i].replace(/^\s*>\s?/, '')); i += 1; }
      const cita = document.createElement('blockquote');
      cita.append(renderizar(cuerpo.join('\n')).fragmento);
      fragmento.append(cita);
      continue;
    }

    // Lista.
    if (MARCA_LISTA.test(linea)) {
      const { nodo, fin } = lista(lineas, i);
      fragmento.append(nodo);
      i = fin;
      continue;
    }

    // Párrafo: se acumula hasta la primera línea en blanco o el primer bloque de otro tipo.
    const parrafo = [];
    while (
      i < lineas.length && lineas[i].trim()
      && !/^(#{1,6}\s|\s*```|\s*>)/.test(lineas[i])
      && !MARCA_LISTA.test(lineas[i])
      && !(lineas[i].includes('|') && i + 1 < lineas.length && esSeparador(lineas[i + 1]))
    ) { parrafo.push(lineas[i].trim()); i += 1; }

    if (parrafo.length) {
      const p = document.createElement('p');
      p.append(inline(parrafo.join(' ')));
      fragmento.append(p);
    } else {
      i += 1;
    }
  }

  return { fragmento, indice, diagramas };
}
