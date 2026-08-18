/**
 * Pinta el catálogo del ecosistema a partir de `datos.mjs`.
 *
 * La portada no lleva ni un agente escrito a mano: si mañana el contrato pasa de 20 a 22, se
 * toca el catálogo y la página se entera sola, incluidos los contadores y los filtros.
 */

import { AGENTES, FAMILIAS_AGENTES, GRUPOS_SKILLS, IDES, SKILLS } from './datos.mjs';

const crear = (etiqueta, clase, texto) => {
  const nodo = document.createElement(etiqueta);
  if (clase) nodo.className = clase;
  if (texto !== undefined) nodo.textContent = texto;
  return nodo;
};

/* ── Agentes ──────────────────────────────────────────────────────────────── */

function pintarAgentes() {
  const pista = document.querySelector('[data-agentes]');
  if (!pista) return;

  for (const familia of FAMILIAS_AGENTES) {
    const grupo = crear('div', 'carrusel__grupo');
    const tarjeta = crear('article', 'tarjeta tarjeta--foco familia');

    const cabecera = crear('header', 'familia__cabecera');
    const nombre = crear('h3', 'familia__nombre');
    nombre.append(
      document.createTextNode(familia.nombre),
      crear('span', 'familia__indice', `${familia.agentes.length}`),
    );
    cabecera.append(nombre, crear('p', 'familia__resumen', familia.resumen));

    const lista = crear('ul', 'familia__lista');
    for (const agente of familia.agentes) {
      const item = document.createElement('li');
      const caja = crear('div', 'agente');
      caja.append(
        crear('span', 'agente__nombre', agente.nombre),
        crear('span', 'agente__papel', agente.papel),
      );
      item.append(caja);
      lista.append(item);
    }

    tarjeta.append(cabecera, lista);
    grupo.append(tarjeta);
    pista.append(grupo);
  }
}

/* ── Skills ───────────────────────────────────────────────────────────────── */

function pintarSkills() {
  const rejilla = document.querySelector('[data-skills]');
  const filtros = document.querySelector('[data-filtros-skills]');
  if (!rejilla) return;

  const tarjetas = SKILLS.map((skill) => {
    const nodo = crear('article', 'skill');
    nodo.dataset.grupo = skill.grupo;
    nodo.append(
      crear('h3', 'skill__nombre', `/${skill.id}`),
      crear('p', 'skill__papel', skill.papel),
    );
    rejilla.append(nodo);
    return nodo;
  });

  if (!filtros) return;

  const opciones = [{ id: 'todas', nombre: `Todas · ${SKILLS.length}` }, ...GRUPOS_SKILLS.map((g) => ({
    id: g.id,
    nombre: `${g.nombre} · ${g.skills.length}`,
  }))];

  const botones = opciones.map((opcion) => {
    const boton = crear('button', 'filtro', opcion.nombre);
    boton.type = 'button';
    boton.setAttribute('aria-pressed', String(opcion.id === 'todas'));
    boton.addEventListener('click', () => {
      for (const otro of botones) otro.setAttribute('aria-pressed', String(otro === boton));
      for (const tarjeta of tarjetas) {
        tarjeta.hidden = opcion.id !== 'todas' && tarjeta.dataset.grupo !== opcion.id;
      }
    });
    filtros.append(boton);
    return boton;
  });
}

/* ── Entornos ─────────────────────────────────────────────────────────────── */

function pintarIdes() {
  const pista = document.querySelector('[data-ides]');
  if (!pista) return;

  for (const ide of IDES) {
    const item = crear('div', 'cinta__item');
    item.append(
      crear('span', 'cinta__nombre', ide.nombre),
      crear('span', 'cinta__ruta', ide.archivo),
    );
    pista.append(item);
  }
}

/* ── Cifras ───────────────────────────────────────────────────────────────── */

/** Las cifras de portada se derivan del catálogo para que no puedan mentir. */
function ajustarCifras() {
  const totales = {
    agentes: AGENTES.length,
    skills: SKILLS.length,
    ides: IDES.length,
  };
  for (const [clave, valor] of Object.entries(totales)) {
    for (const nodo of document.querySelectorAll(`[data-total="${clave}"]`)) {
      nodo.dataset.contador = String(valor);
      nodo.textContent = '0';
    }
  }
}

export function iniciarCatalogo() {
  ajustarCifras();
  pintarAgentes();
  pintarSkills();
  pintarIdes();
}
