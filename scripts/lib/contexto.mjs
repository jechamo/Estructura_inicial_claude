/**
 * contexto — recorta el modelo operativo a lo que una fase necesita.
 *
 * Cálculo puro: no lee ficheros, no ejecuta git, no imprime nada. Vive separado del CLI por la
 * misma razón que `circuito.mjs`: la regla que decide qué política ve un agente tiene que poder
 * probarse sin proceso hijo y sin repositorio.
 *
 * El recorte **falla cerrado**. Un recortador que devuelve vacío cuando no encuentra una sección
 * es peor que no tener recortador: el agente no nota la ausencia y opera sin una regla que sí
 * aplicaba. Por eso una sección que falta, que aparece dos veces o que ha sido renombrada es un
 * error ruidoso, nunca un recorte silencioso.
 */

/**
 * Secciones que van en **todas** las fases. Son las tres cortas e innegociables: la regla cero,
 * los gates y las prohibiciones. Juntas no llegan a 2 KB; discutir su coste no merece la pena.
 */
export const INVARIANTES = ['0', '7', '13'];

/**
 * Qué secciones necesita cada fase. Es deliberadamente una tabla y no una heurística: si el
 * recorte dependiera de lo que el modelo crea que hace falta, no sería un presupuesto sino una
 * opinión.
 */
export const MAPA_FASES = {
  specify: ['1', '2.5', '8', '8bis'],
  clarify: ['1', '2.5', '8', '8bis'],
  design: ['8bis'],
  plan: ['3', '4', '5'],
  tasks: ['3', '4', '5'],
  implement: ['4', '5', '6', '11'],
  verify: ['8', '8bis', '9'],
  ship: ['8', '8bis', '9'],
  light: ['2.6', '6'],
  compact: ['2.6', '6'],
  orchestrate: ['1', '2', '10'],
};

/**
 * Un encabezado numerado. `### HANDOFF` no casa a propósito: no es una sección del contrato, y
 * tratarla como tal partiría la sección que la contiene.
 */
const ENCABEZADO = /^(#{2,3})\s+(\d+(?:\s+bis)?(?:\.\d+)?)\s*\.?\s+\S/;

/** `8 bis.1` y `8bis.1` son el mismo identificador; la caja y los espacios no distinguen. */
const normalizarId = (bruto) => String(bruto).replace(/\s+/g, '').toLowerCase();

/**
 * Índice de secciones del documento. Una sección va desde su encabezado hasta el siguiente
 * encabezado numerado, sea del nivel que sea: así `§8` termina donde empieza `§8.1` y se puede
 * pedir la regla de impacto sin arrastrar sus tablas de trazabilidad.
 */
export function indexar(texto) {
  const lineas = String(texto || '').split('\n');
  const marcas = [];
  lineas.forEach((linea, i) => {
    const m = linea.match(ENCABEZADO);
    if (m) marcas.push({ id: normalizarId(m[2]), inicio: i });
  });

  const secciones = new Map();
  const duplicados = new Set();
  marcas.forEach((marca, i) => {
    const fin = i + 1 < marcas.length ? marcas[i + 1].inicio : lineas.length;
    if (secciones.has(marca.id)) duplicados.add(marca.id);
    else secciones.set(marca.id, lineas.slice(marca.inicio, fin).join('\n').trimEnd());
  });
  return { secciones, duplicados };
}

/**
 * Devuelve el texto de las secciones que esa fase necesita, en el orden del documento.
 *
 * @param {string} texto documento completo
 * @param {string} fase clave de `MAPA_FASES`
 * @param {{sensible?: boolean, usabilidad?: boolean}} [opciones]
 * @throws si la fase no existe, o si una sección pedida falta o está duplicada
 */
export function recortar(texto, fase, opciones = {}) {
  const pedidas = MAPA_FASES[fase];
  if (!pedidas)
    throw new Error(
      `Fase desconocida: «${fase}». Las declaradas son ${Object.keys(MAPA_FASES).join(', ')}.`,
    );

  const { secciones, duplicados } = indexar(texto);

  // La trazabilidad detallada solo viaja cuando su impacto aplica. Es el 84 % de la sección de
  // seguridad, y arrastrarla siempre convertiría el presupuesto en un gesto.
  const ids = [...new Set([...INVARIANTES, ...pedidas])];
  if (opciones.sensible && ids.includes('8')) ids.push('8.1');
  if (opciones.usabilidad && ids.includes('8bis')) ids.push('8bis.1');

  const ausentes = ids.filter((id) => !secciones.has(id));
  if (ausentes.length)
    throw new Error(
      `El documento no declara la(s) sección(es) ${ausentes.join(', ')} que la fase «${fase}» ` +
      'necesita. Puede que se hayan renombrado: el recorte no continúa sin ellas.',
    );

  const repetidas = ids.filter((id) => duplicados.has(id));
  if (repetidas.length)
    throw new Error(
      `La(s) sección(es) ${repetidas.join(', ')} aparece(n) más de una vez; no se puede saber ` +
      'cuál es la buena, así que el recorte no continúa.',
    );

  const orden = [...secciones.keys()].filter((id) => ids.includes(id));
  return orden.map((id) => secciones.get(id)).join('\n\n');
}
