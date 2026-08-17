/**
 * Movimiento: revelado al hacer scroll, contadores, parallax y brillo de los botones.
 *
 * Todo lo de aquí es adorno. Si el usuario ha pedido menos movimiento, se sale sin instalar
 * nada — más limpio que animar y luego anular la animación con una duración de un milisegundo.
 */

const menosMovimiento = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function revelar() {
  const objetivos = document.querySelectorAll('[data-revelar]');
  if (menosMovimiento()) {
    objetivos.forEach((el) => el.classList.add('visible'));
    return;
  }
  const observador = new IntersectionObserver((entradas) => {
    for (const entrada of entradas) {
      if (!entrada.isIntersecting) continue;
      entrada.target.classList.add('visible');
      observador.unobserve(entrada.target);
    }
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  objetivos.forEach((el) => observador.observe(el));
}

/** Cuenta hasta el valor con desaceleración; el cero no se anima porque no tendría gracia. */
function contadores() {
  const objetivos = document.querySelectorAll('[data-contador]');
  const pintar = (el) => {
    const destino = Number(el.dataset.contador);
    if (!destino || menosMovimiento()) { el.textContent = String(destino); return; }
    const duracion = 1100;
    const inicio = performance.now();
    const paso = (ahora) => {
      const t = Math.min(1, (ahora - inicio) / duracion);
      const suave = 1 - Math.pow(1 - t, 3);
      el.textContent = String(Math.round(destino * suave));
      if (t < 1) requestAnimationFrame(paso);
    };
    requestAnimationFrame(paso);
  };

  const observador = new IntersectionObserver((entradas) => {
    for (const entrada of entradas) {
      if (!entrada.isIntersecting) continue;
      pintar(entrada.target);
      observador.unobserve(entrada.target);
    }
  }, { threshold: 0.6 });
  objetivos.forEach((el) => observador.observe(el));
}

function navegacionFija() {
  const nav = document.getElementById('nav');
  const secciones = [...document.querySelectorAll('main section[id]')];
  const enlaces = new Map(
    [...document.querySelectorAll('.nav__enlace')].map((a) => [a.getAttribute('href').slice(1), a]),
  );

  let pendiente = false;
  const actualizar = () => {
    pendiente = false;
    nav.classList.toggle('fijada', window.scrollY > 12);

    const linea = window.scrollY + window.innerHeight * 0.32;
    let activa = null;
    for (const seccion of secciones) if (seccion.offsetTop <= linea) activa = seccion.id;
    for (const [id, enlace] of enlaces) {
      if (id === activa) enlace.setAttribute('aria-current', 'true');
      else enlace.removeAttribute('aria-current');
    }
  };

  addEventListener('scroll', () => {
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(actualizar);
  }, { passive: true });
  actualizar();
}

function parallax() {
  const aurora = document.getElementById('aurora');
  if (!aurora || menosMovimiento()) return;
  let pendiente = false;
  addEventListener('scroll', () => {
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(() => {
      pendiente = false;
      aurora.style.setProperty('--parallax', `${window.scrollY * 0.18}px`);
    });
  }, { passive: true });
}

/** El resplandor de los botones sigue al cursor; se apaga con movimiento reducido. */
function brilloBotones() {
  if (menosMovimiento()) return;
  document.addEventListener('pointermove', (evento) => {
    const boton = evento.target.closest('.btn');
    if (!boton) return;
    const caja = boton.getBoundingClientRect();
    boton.style.setProperty('--mx', `${evento.clientX - caja.left}px`);
    boton.style.setProperty('--my', `${evento.clientY - caja.top}px`);
  }, { passive: true });
}

function botonArriba() {
  const boton = document.getElementById('arriba');
  if (!boton) return;
  boton.addEventListener('click', () => window.scrollTo({ top: 0, behavior: menosMovimiento() ? 'auto' : 'smooth' }));
  addEventListener('scroll', () => {
    boton.classList.toggle('visible', window.scrollY > window.innerHeight);
  }, { passive: true });
}

export function iniciarMovimiento() {
  revelar();
  contadores();
  navegacionFija();
  parallax();
  brilloBotones();
  botonArriba();
}
