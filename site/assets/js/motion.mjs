/**
 * Movimiento transversal: aparición al hacer scroll, contadores, barra fija, subrayado del
 * enlace activo, progreso de lectura y botón de volver arriba.
 *
 * Todo lo de aquí es decoración. Si algo falla o el navegador no trae `IntersectionObserver`,
 * el documento se marca como visible y la página sigue siendo perfectamente utilizable.
 */

const menosMovimiento = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── Aparición ────────────────────────────────────────────────────────────── */

function revelar() {
  const piezas = document.querySelectorAll('[data-revelar]');
  if (!piezas.length) return;

  if (!('IntersectionObserver' in window) || menosMovimiento()) {
    document.documentElement.classList.add('sin-observador');
    return;
  }

  const vigia = new IntersectionObserver((entradas) => {
    for (const entrada of entradas) {
      if (!entrada.isIntersecting) continue;
      entrada.target.classList.add('visible');
      vigia.unobserve(entrada.target);
    }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  // El escalonado se calcula por grupo: los hermanos que comparten padre entran en cascada.
  const porPadre = new Map();
  for (const pieza of piezas) {
    const grupo = porPadre.get(pieza.parentElement) ?? [];
    grupo.push(pieza);
    porPadre.set(pieza.parentElement, grupo);
  }
  for (const grupo of porPadre.values()) {
    grupo.forEach((pieza, i) => {
      if (!pieza.style.getPropertyValue('--retraso')) {
        pieza.style.setProperty('--retraso', `${Math.min(i, 6) * 70}ms`);
      }
      vigia.observe(pieza);
    });
  }
}

/* ── Contadores ───────────────────────────────────────────────────────────── */

function contar(nodo) {
  const destino = Number(nodo.dataset.contador);
  const sufijo = nodo.dataset.sufijo ?? '';
  if (!Number.isFinite(destino)) return;

  if (menosMovimiento()) { nodo.textContent = destino + sufijo; return; }

  const duracion = 1250;
  const arranque = performance.now();

  const paso = (ahora) => {
    const avance = Math.min((ahora - arranque) / duracion, 1);
    // Suavizado exponencial: arranca rápido y frena al final, que es como se lee mejor.
    const suave = 1 - (1 - avance) ** 3;
    nodo.textContent = Math.round(destino * suave) + sufijo;
    if (avance < 1) requestAnimationFrame(paso);
  };

  requestAnimationFrame(paso);
}

function contadores() {
  const nodos = document.querySelectorAll('[data-contador]');
  if (!nodos.length) return;

  if (!('IntersectionObserver' in window)) {
    for (const nodo of nodos) nodo.textContent = nodo.dataset.contador + (nodo.dataset.sufijo ?? '');
    return;
  }

  const vigia = new IntersectionObserver((entradas) => {
    for (const entrada of entradas) {
      if (!entrada.isIntersecting) continue;
      contar(entrada.target);
      vigia.unobserve(entrada.target);
    }
  }, { threshold: 0.6 });

  for (const nodo of nodos) vigia.observe(nodo);
}

/* ── Barra superior ───────────────────────────────────────────────────────── */

function barra() {
  const nav = document.querySelector('.nav');
  const progreso = document.querySelector('.progreso');
  const arriba = document.querySelector('.arriba');
  const enlaces = [...document.querySelectorAll('.nav__enlace[href^="#"]')];
  const secciones = enlaces
    .map((enlace) => document.querySelector(enlace.getAttribute('href')))
    .filter(Boolean);

  let pendiente = false;

  const pintar = () => {
    pendiente = false;
    const y = window.scrollY;

    nav?.classList.toggle('fijada', y > 12);
    arriba?.classList.toggle('visible', y > 700);

    if (progreso) {
      const recorrido = document.documentElement.scrollHeight - window.innerHeight;
      progreso.style.transform = `scaleX(${recorrido > 0 ? Math.min(y / recorrido, 1) : 0})`;
    }

    if (secciones.length) {
      // Se considera activa la última sección cuyo inicio ya ha pasado bajo la barra.
      const limite = y + window.innerHeight * 0.32;
      let activa = secciones[0];
      for (const seccion of secciones) {
        if (seccion.offsetTop <= limite) activa = seccion;
      }
      for (const enlace of enlaces) {
        enlace.classList.toggle('activo', enlace.getAttribute('href') === `#${activa.id}`);
      }
    }
  };

  const alDesplazar = () => {
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(pintar);
  };

  window.addEventListener('scroll', alDesplazar, { passive: true });
  window.addEventListener('resize', alDesplazar, { passive: true });
  pintar();

  arriba?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: menosMovimiento() ? 'auto' : 'smooth' });
  });
}

/* ── Brillo que sigue al cursor ───────────────────────────────────────────── */

function brillo() {
  if (menosMovimiento()) return;
  for (const nodo of document.querySelectorAll('.btn, .tarjeta--foco')) {
    nodo.addEventListener('pointermove', (evento) => {
      const caja = nodo.getBoundingClientRect();
      nodo.style.setProperty('--mx', `${evento.clientX - caja.left}px`);
      nodo.style.setProperty('--my', `${evento.clientY - caja.top}px`);
    });
  }
}

export function iniciarMovimiento() {
  revelar();
  contadores();
  barra();
  brillo();
}
