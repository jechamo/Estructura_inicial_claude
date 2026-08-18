/**
 * Corroboración de trazas — verificar la delegación sin depender del entorno.
 *
 * El estado `observed` exige que el IDE emita eventos de inicio y fin de subagente, y solo
 * dos de los seis entornos soportados los emiten. Para los otros cuatro la única alternativa
 * era `declared-direct`: una afirmación del propio agente que nadie contrasta.
 *
 * Esto añade un tercer estado, `declared-corroborated`, sobre el único sustrato que todos los
 * entornos comparten: git. Un commit que declara `Spec`, `Task` y `Agent` en sus trailers hace
 * tres afirmaciones verificables contra artefactos que ya existen —`tasks.md`, el catálogo de
 * agentes y el reparto de territorios—.
 *
 * El límite, sin adornos: un agente puede escribir un trailer falso y esto no lo impedirá. Lo
 * que hace es encarecer la mentira deliberada y, sobre todo, volver detectable el descuido, que
 * es el fallo que de verdad ocurre.
 *
 * Sin dependencias. Node >= 18.
 */
import { decidirTerritorio } from '../../.sdd/hooks/territorios.mjs';
import { clasificar, motivoMaterial, cuota } from './circuito.mjs';

const FORMA_TAREA = /^T-\d{3}-\d+$/;


/**
 * Extrae los trailers de un mensaje de commit.
 *
 * Solo cuenta el último bloque contiguo de líneas `Clave: valor` al final del mensaje, que es
 * lo que git considera trailers. Sin esta restricción, una línea suelta en mitad del cuerpo
 * podría suplantar un trailer real y atribuir el trabajo a otro agente.
 */
export function parsearTrailers(mensaje) {
  const lineas = String(mensaje || '').replace(/\r\n/g, '\n').split('\n');
  while (lineas.length && lineas[lineas.length - 1].trim() === '') lineas.pop();

  const bloque = [];
  for (let i = lineas.length - 1; i >= 0; i--) {
    const linea = lineas[i];
    // Un trailer con el valor vacío sigue siendo un trailer. Si se descartara, un
    // `Trace-exception:` sin motivo arrastraría consigo a los trailers legítimos que tiene
    // encima y el commit pasaría de infractor a «no auditable»: el descuido saldría gratis.
    if (/^[A-Za-z][A-Za-z0-9-]*:(?:\s|$)/.test(linea)) bloque.unshift(linea);
    else break;
  }

  const trailers = {};
  for (const linea of bloque) {
    const corte = linea.indexOf(':');
    const clave = linea.slice(0, corte).trim();
    const valor = linea.slice(corte + 1).trim();
    // El último gana: repetir una clave no debe permitir colar la primera y usar la segunda.
    trailers[clave] = valor;
  }
  return trailers;
}

/**
 * Audita un commit contra los artefactos del repositorio.
 *
 * @param {object} commit           `{ sha, mensaje, ficheros }`
 * @param {object} contexto         `{ tareas:Set, agentes:Set, reparto, specs:Set, frontera }`
 * @returns {{estado:'conforme'|'no-auditable'|'infractor'|'ligero', hallazgos:string[]}}
 */
export function auditarCommit(commit, contexto) {
  const { sha = '', mensaje = '', ficheros = [] } = commit || {};
  const { tareas = new Set(), agentes = new Set(), reparto = null, specs = new Set(), frontera = null } = contexto || {};
  const t = parsearTrailers(mensaje);
  const hallazgos = [];
  const corto = String(sha).slice(0, 8) || 'sin sha';

  // Circuito ligero. Declararlo no lo hace cierto: es una afirmación sobre el propio commit,
  // exactamente de la misma naturaleza que `Trace-exception`, y se contrasta contra su diff.
  // Un commit ligero no debe `Spec:` ni `Task:` —de eso trata el atajo—, pero sí debe caber
  // en la frontera y sí debe explicar por qué.
  if (Object.hasOwn(t, 'Circuit')) {
    const valor = String(t.Circuit || '').trim().toLowerCase();
    if (valor !== 'light') {
      return {
        estado: 'infractor',
        ligero: true,
        hallazgos: [`${corto}: \`Circuit: ${t.Circuit}\` no es un circuito reconocido; el único valor válido es \`light\`.`],
      };
    }
    const veredicto = clasificar(ficheros, frontera);
    if (!frontera)
      hallazgos.push(`${corto}: declara \`Circuit: light\` pero no hay frontera en \`.sdd/lightweight.json\`; sin frontera no hay circuito ligero.`);
    else if (veredicto.circuito !== 'light')
      hallazgos.push(
        `${corto}: declara \`Circuit: light\` y toca rutas fuera de la frontera — ${veredicto.obligan.join(', ')}. ` +
          'Ese cambio exige el circuito completo.',
      );
    if (!motivoMaterial(t['Circuit-reason']))
      hallazgos.push(
        `${corto}: \`Circuit-reason\` no explica nada («${t['Circuit-reason'] || ''}»). ` +
          'Escribe qué cambia y por qué no necesita spec; un atajo sin motivo legible es un atajo que nadie puede revisar después.',
      );
    return { estado: hallazgos.length ? 'infractor' : 'conforme', ligero: true, hallazgos };
  }

  // Un commit sin trailers no es un infractor: es un commit que esta auditoría no alcanza.
  // Confundir "no lo sé" con "está mal" es la forma más rápida de que nadie se crea el informe.
  if (!t.Task && !t.Agent && !t.Spec) {
    return { estado: 'no-auditable', hallazgos: [`${corto}: sin trailers de traza; no auditable`] };
  }

  for (const clave of ['Spec', 'Task', 'Agent']) {
    if (!t[clave])
      hallazgos.push(`${corto}: falta el trailer \`${clave}:\`. Añade al final del mensaje una línea con la forma \`${clave}: <valor>\`.`);
  }

  if (t.Task && !FORMA_TAREA.test(t.Task))
    hallazgos.push(`${corto}: \`Task: ${t.Task}\` no tiene la forma \`T-NNN-N\`.`);
  else if (t.Task && !tareas.has(t.Task))
    hallazgos.push(`${corto}: la tarea \`${t.Task}\` no existe en ningún tasks.md.`);

  if (t.Agent && !agentes.has(t.Agent))
    hallazgos.push(`${corto}: el agente \`${t.Agent}\` no existe en .claude/agents/.`);

  if (t.Spec && specs.size && !specs.has(t.Spec))
    hallazgos.push(`${corto}: la spec \`${t.Spec}\` no existe en docs/specs/.`);

  if (t.Spec && t.Task && FORMA_TAREA.test(t.Task) && !t.Task.startsWith(`T-${t.Spec}-`))
    hallazgos.push(`${corto}: \`Task: ${t.Task}\` no pertenece a \`Spec: ${t.Spec}\`.`);

  // El territorio se evalúa con la MISMA función que usa la guarda de escritura: si esta
  // auditoría aplicara su propia versión de la regla, verificarla no diría nada del hook.
  if (t.Agent && agentes.has(t.Agent) && reparto) {
    const invasiones = [];
    for (const ruta of ficheros) {
      const v = decidirTerritorio({ agente: t.Agent, ruta, modo: 'deny', config: reparto });
      if (v.decision === 'deny') invasiones.push(`${ruta} (territorio de ${v.dueno || v.territorio})`);
    }
    const tieneExcepcion = Object.hasOwn(t, 'Trace-exception');
    if (invasiones.length && !tieneExcepcion) {
      hallazgos.push(
        `${corto}: \`${t.Agent}\` tocó territorio ajeno — ${invasiones.join(', ')}. ` +
          'Si fue deliberado, declara el motivo con una línea `Trace-exception: <motivo>` al final del mensaje.',
      );
    } else if (invasiones.length && !motivoMaterial(t['Trace-exception'])) {
      hallazgos.push(
        `${corto}: \`Trace-exception\` no explica nada («${t['Trace-exception']}»). ` +
          'Escribe por qué ese agente tenía que escribir ahí; una excepción sin motivo es una excepción sin control.',
      );
    }
  }

  return { estado: hallazgos.length ? 'infractor' : 'conforme', hallazgos };
}

/** Audita una lista de commits y resume el veredicto. */
export function auditarCommits(commits, contexto) {
  const resultados = commits.map((c) => ({ sha: c.sha, ...auditarCommit(c, contexto) }));
  const ligeros = resultados.filter((r) => r.ligero).length;
  return {
    total: resultados.length,
    conformes: resultados.filter((r) => r.estado === 'conforme').length,
    noAuditables: resultados.filter((r) => r.estado === 'no-auditable').length,
    infractores: resultados.filter((r) => r.estado === 'infractor'),
    // La proporción se informa siempre. Superarla no acusa a nadie: dice que la frontera
    // deja pasar más de lo que se pensaba y conviene volver a mirarla.
    cuota: cuota({ ligeros, total: resultados.length, maximo: contexto?.frontera?.cuota ?? 1 }),
    resultados,
  };
}
