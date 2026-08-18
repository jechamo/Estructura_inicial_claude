/**
 * Componentes de interfaz sin dependencias.
 *
 * Cada uno se activa buscando su marcador en el documento, así que la página puede usarlos o no
 * sin que este módulo cambie. Todos parten de marcado que ya funciona sin JavaScript: las
 * pestañas son enlaces internos, el acordeón muestra su contenido y el carrusel es una lista
 * desplazable. El script solo añade estado y transiciones.
 */

const menosMovimiento = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const comportamiento = () => (menosMovimiento() ? 'auto' : 'smooth');

/* ── Copiar al portapapeles ───────────────────────────────────────────────── */

/**
 * El texto se toma del elemento al que apunta `data-copiar`, de forma que nunca haya dos copias
 * del mismo comando —una visible y otra en un atributo— que puedan quedar desincronizadas.
 */
export function iniciarCopiar(raiz = document) {
  for (const boton of raiz.querySelectorAll('[data-copiar]')) {
    if (boton.dataset.listo) continue;
    boton.dataset.listo = '1';

    boton.addEventListener('click', async () => {
      const origen = document.querySelector(boton.dataset.copiar);
      const texto = origen?.dataset.comando ?? origen?.textContent?.trim();
      if (!texto) return;

      const etiqueta = boton.querySelector('[data-copiar-texto]') ?? boton;
      const original = etiqueta.textContent;

      try {
        await navigator.clipboard.writeText(texto);
      } catch {
        // Sin permiso de portapapeles queda el camino manual: seleccionar el comando.
        const rango = document.createRange();
        rango.selectNodeContents(origen);
        const seleccion = window.getSelection();
        seleccion.removeAllRanges();
        seleccion.addRange(rango);
        etiqueta.textContent = 'Selecciona y copia';
        window.setTimeout(() => { etiqueta.textContent = original; }, 2200);
        return;
      }

      boton.dataset.hecho = '1';
      etiqueta.textContent = 'Copiado';
      window.setTimeout(() => {
        delete boton.dataset.hecho;
        etiqueta.textContent = original;
      }, 1800);
    });
  }
}

/* ── Pestañas ─────────────────────────────────────────────────────────────── */

export function iniciarPestanas(raiz = document) {
  for (const grupo of raiz.querySelectorAll('[data-pestanas]')) {
    const lista = grupo.querySelector('.pestanas__lista');
    const botones = [...grupo.querySelectorAll('.pestana')];
    const paneles = [...grupo.querySelectorAll('.pestanas__panel')];
    if (!botones.length) continue;

    const indicador = document.createElement('span');
    indicador.className = 'pestanas__indicador';
    indicador.setAttribute('aria-hidden', 'true');
    lista.prepend(indicador);

    const moverIndicador = (boton) => {
      indicador.style.width = `${boton.offsetWidth}px`;
      indicador.style.transform = `translateX(${boton.offsetLeft - 5}px)`;
    };

    const activar = (indice, mover = true) => {
      botones.forEach((boton, i) => {
        const activa = i === indice;
        boton.setAttribute('aria-selected', String(activa));
        boton.tabIndex = activa ? 0 : -1;
        paneles[i]?.toggleAttribute('hidden', !activa);
      });
      moverIndicador(botones[indice]);
      if (mover) botones[indice].focus();
    };

    botones.forEach((boton, i) => {
      boton.addEventListener('click', () => activar(i, false));
      boton.addEventListener('keydown', (evento) => {
        const salto = { ArrowRight: 1, ArrowLeft: -1, Home: -Infinity, End: Infinity }[evento.key];
        if (salto === undefined) return;
        evento.preventDefault();
        const destino = !Number.isFinite(salto)
          ? (salto < 0 ? 0 : botones.length - 1)
          : (i + salto + botones.length) % botones.length;
        activar(destino);
      });
    });

    const inicial = Math.max(0, botones.findIndex((b) => b.getAttribute('aria-selected') === 'true'));
    activar(inicial, false);

    // El indicador se mide en píxeles, así que hay que recolocarlo cuando cambia el ancho.
    if ('ResizeObserver' in window) new ResizeObserver(() => {
      const activa = botones[botones.findIndex((b) => b.getAttribute('aria-selected') === 'true')];
      if (activa) moverIndicador(activa);
    }).observe(lista);
  }
}

/* ── Acordeón ─────────────────────────────────────────────────────────────── */

export function iniciarAcordeon(raiz = document) {
  for (const acordeon of raiz.querySelectorAll('[data-acordeon]')) {
    const unico = acordeon.hasAttribute('data-unico');
    const disparadores = [...acordeon.querySelectorAll('.acordeon__disparador')];

    for (const disparador of disparadores) {
      disparador.addEventListener('click', () => {
        const abierto = disparador.getAttribute('aria-expanded') === 'true';
        if (unico && !abierto) {
          for (const otro of disparadores) otro.setAttribute('aria-expanded', 'false');
        }
        disparador.setAttribute('aria-expanded', String(!abierto));
      });
    }
  }
}

/* ── Carrusel ─────────────────────────────────────────────────────────────── */

/**
 * Desplazamiento nativo con `scroll-snap` más arrastre con el ratón. Apoyarse en el scroll real
 * en lugar de en transformaciones deja gratis el teclado, el gesto táctil y la accesibilidad.
 */
export function iniciarCarrusel(raiz = document) {
  for (const carrusel of raiz.querySelectorAll('[data-carrusel]')) {
    const pista = carrusel.querySelector('.carrusel__pista');
    const grupos = [...pista.children];
    const anterior = carrusel.querySelector('[data-carrusel-anterior]');
    const siguiente = carrusel.querySelector('[data-carrusel-siguiente]');
    const contenedorPuntos = carrusel.querySelector('.carrusel__puntos');
    if (!grupos.length) continue;

    const puntos = grupos.map((_, i) => {
      const punto = document.createElement('button');
      punto.type = 'button';
      punto.className = 'carrusel__punto';
      punto.setAttribute('aria-label', `Ir al grupo ${i + 1} de ${grupos.length}`);
      punto.addEventListener('click', () => {
        pista.scrollTo({ left: grupos[i].offsetLeft - pista.offsetLeft, behavior: comportamiento() });
      });
      contenedorPuntos?.append(punto);
      return punto;
    });

    const actual = () => {
      const centro = pista.scrollLeft + pista.clientWidth / 2;
      let mejor = 0;
      let distancia = Infinity;
      grupos.forEach((grupo, i) => {
        const medio = grupo.offsetLeft - pista.offsetLeft + grupo.offsetWidth / 2;
        const d = Math.abs(medio - centro);
        if (d < distancia) { distancia = d; mejor = i; }
      });
      return mejor;
    };

    const refrescar = () => {
      const indice = actual();
      puntos.forEach((punto, i) => punto.setAttribute('aria-current', String(i === indice)));
      // Un margen de un píxel evita que el redondeo del scroll deje la flecha activa al final.
      if (anterior) anterior.disabled = pista.scrollLeft <= 1;
      if (siguiente) siguiente.disabled = pista.scrollLeft >= pista.scrollWidth - pista.clientWidth - 1;
    };

    const desplazar = (signo) => {
      const paso = grupos[0].offsetWidth + 20;
      pista.scrollBy({ left: signo * paso, behavior: comportamiento() });
    };

    anterior?.addEventListener('click', () => desplazar(-1));
    siguiente?.addEventListener('click', () => desplazar(1));
    pista.addEventListener('scroll', refrescar, { passive: true });
    window.addEventListener('resize', refrescar, { passive: true });

    // Arrastre con puntero. Solo se activa tras superar un umbral para no comerse los clics.
    let arrastrando = false;
    let inicioX = 0;
    let inicioScroll = 0;
    let movido = false;

    pista.addEventListener('pointerdown', (evento) => {
      if (evento.pointerType === 'touch') return;
      arrastrando = true;
      movido = false;
      inicioX = evento.clientX;
      inicioScroll = pista.scrollLeft;
    });

    pista.addEventListener('pointermove', (evento) => {
      if (!arrastrando) return;
      const delta = evento.clientX - inicioX;
      if (!movido && Math.abs(delta) < 6) return;
      if (!movido) { movido = true; pista.classList.add('arrastrando'); pista.setPointerCapture(evento.pointerId); }
      pista.scrollLeft = inicioScroll - delta;
    });

    const soltar = () => {
      arrastrando = false;
      pista.classList.remove('arrastrando');
    };

    pista.addEventListener('pointerup', soltar);
    pista.addEventListener('pointercancel', soltar);
    pista.addEventListener('click', (evento) => { if (movido) evento.preventDefault(); }, true);

    refrescar();
  }
}

/* ── Cinta infinita ───────────────────────────────────────────────────────── */

/**
 * La animación desplaza la pista un 50 %, así que el contenido tiene que estar duplicado para
 * que el salto sea invisible. Se clona aquí y no en el HTML para no repetir el marcado a mano.
 */
export function iniciarCinta(raiz = document) {
  for (const cinta of raiz.querySelectorAll('[data-cinta]')) {
    const pista = cinta.querySelector('.cinta__pista');
    if (!pista || pista.dataset.duplicada) continue;
    pista.dataset.duplicada = '1';
    for (const item of [...pista.children]) {
      const copia = item.cloneNode(true);
      copia.setAttribute('aria-hidden', 'true');
      pista.append(copia);
    }
  }
}

/* ── Figuras ──────────────────────────────────────────────────────────────── */

/**
 * La figura enseña su imagen desde el principio y solo se tapa con el marcador de hueco si el
 * fichero falla de verdad.
 *
 * Antes era al revés —nacían tapadas y el JS las destapaba al cargar— y eso escondía dos fallos.
 * El primero: `.figura[data-sin-imagen] img` aplica `display: none`, y una imagen sin caja nunca
 * llega a intersecar el viewport, así que con `loading="lazy"` el navegador no la pedía jamás, el
 * evento `load` no llegaba y la figura se quedaba tapada para siempre. El segundo: cualquier fallo
 * del módulo dejaba las tres ilustraciones invisibles, mientras el resto de la página se veía bien.
 */
export function iniciarFiguras(raiz = document) {
  for (const figura of raiz.querySelectorAll('[data-figura]')) {
    const imagen = figura.querySelector('img');
    if (!imagen) continue;

    const tapar = () => figura.setAttribute('data-sin-imagen', '');
    // `complete` con anchura cero significa que el navegador ya intentó cargarla y no pudo.
    if (imagen.complete && imagen.naturalWidth === 0) { tapar(); continue; }
    imagen.addEventListener('error', tapar, { once: true });
  }
}

export function iniciarComponentes(raiz = document) {
  iniciarCopiar(raiz);
  iniciarPestanas(raiz);
  iniciarAcordeon(raiz);
  iniciarCarrusel(raiz);
  iniciarCinta(raiz);
  iniciarFiguras(raiz);
}
