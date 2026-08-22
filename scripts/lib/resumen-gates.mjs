/**
 * resumen-gates — convierte la salida de un gate en algo que quepa en una conversación.
 *
 * Existe porque `run` heredaba la salida del hijo y la suite completa acababa en el contexto en
 * cada GREEN del ciclo TDD. Eso es la mayor parte del coste de la fase de implementación y no
 * aporta nada cuando todo está verde: nadie lee 500 líneas de «✓».
 *
 * Resumir no puede significar perder. Por eso: el código de salida real manda y no se toca, el
 * fallo relevante viaja siempre en el resumen, y la salida completa se guarda y se recupera por
 * su identificador. Un resumen que oculta un fallo sería peor que no resumir.
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash, randomUUID } from 'node:crypto';
import { join } from 'node:path';

/** Identificador de una ejecución. Sirve para recuperar después lo que aquí no se imprime. */
export const nuevoRunId = () => `${new Date().toISOString().slice(0, 10)}-${randomUUID().slice(0, 8)}`;

const huella = (texto) => createHash('sha256').update(String(texto ?? ''), 'utf8').digest('hex').slice(0, 16);

/**
 * Conteos que aparecen en las suites de este repositorio y en las habituales de otros.
 * Devuelve `null` si no reconoce ninguno: inventar un conteo sería peor que no darlo.
 */
export function extraerConteos(salida) {
  const texto = String(salida ?? '');
  const es = texto.match(/(\d+)\s+correcta\(?s?\)?\s*·\s*(\d+)\s+fallo/i);
  if (es) return { passed: Number(es[1]), failed: Number(es[2]), total: Number(es[1]) + Number(es[2]) };
  const ratio = texto.match(/\b(\d+)\/(\d+)\b/);
  if (ratio) return { passed: Number(ratio[1]), total: Number(ratio[2]), failed: Number(ratio[2]) - Number(ratio[1]) };
  const jest = texto.match(/(\d+)\s+passed[^\n]*?(\d+)\s+total/i);
  if (jest) return { passed: Number(jest[1]), total: Number(jest[2]), failed: Number(jest[2]) - Number(jest[1]) };
  return null;
}

/**
 * El trozo que de verdad importa cuando algo falla: las líneas marcadas como error.
 * Si no encuentra marcas, devuelve la cola, que es donde suelen morir los procesos.
 */
export function fragmentoRelevante(salida, maxLineas = 12) {
  const lineas = String(salida ?? '').split('\n');
  const marcadas = lineas.filter((l) => /[✗×]|\bFAIL(?:ED)?\b|\bError\b|\bAssertionError\b|^\s*✘/.test(l));
  const elegidas = marcadas.length ? marcadas : lineas.filter((l) => l.trim()).slice(-maxLineas);
  return elegidas.slice(0, maxLineas).join('\n').trim();
}

/**
 * Resumen de una ejecución. `status` es el código de salida real del proceso y se conserva tal
 * cual: este módulo describe, no decide.
 */
export function resumir({ id, command, speed, status, durationMs, salida, runId }) {
  const ok = status === 0;
  return {
    id,
    command,
    speed,
    exitCode: status,
    ok,
    durationMs,
    counts: extraerConteos(salida),
    // En verde no se arrastra ni una línea: es justo el caso que hacía cara la fase TDD.
    ...(ok ? {} : { failure: fragmentoRelevante(salida) }),
    runId,
    outputBytes: String(salida ?? '').length,
    outputHash: huella(salida),
  };
}

const rutaDe = (base, runId, id) => join(base, runId, `${String(id).replace(/[^\w.-]/g, '_')}.log`);

/** Guarda la salida completa fuera del contexto y devuelve dónde quedó. */
export function guardarSalida(base, runId, id, salida) {
  const ruta = rutaDe(base, runId, id);
  mkdirSync(join(base, runId), { recursive: true });
  writeFileSync(ruta, String(salida ?? ''), 'utf8');
  return ruta;
}

/** Recupera la salida completa. Devuelve `null` si esa ejecución ya no está. */
export function leerSalida(base, runId, id) {
  const ruta = rutaDe(base, runId, id);
  return existsSync(ruta) ? readFileSync(ruta, 'utf8') : null;
}
