/**
 * Contrato del resumen de ejecución de gates.
 *
 * Existe porque `run` heredaba la salida del hijo (`stdio: 'inherit'`) y la suite entera acababa
 * en la conversación en cada GREEN del ciclo TDD. Resumir no puede significar perder: el código de
 * salida real manda, el fallo relevante viaja, y la salida completa sigue recuperable por su
 * identificador. Un resumen que oculta un fallo es peor que no resumir.
 */
import { existsSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

async function cargar() {
  try { return await import('../lib/resumen-gates.mjs'); } catch { return null; }
}

// Una suite real: 186 líneas de «✓» que nadie lee y que hoy acaban enteras en la conversación.
const VERDE = [
  'contexto · recorta la política a lo que la fase necesita',
  ...Array.from({ length: 186 }, (_, i) => `  ✓ caso_numero_${i + 1}_que_pasa_sin_incidencias`),
  '',
  '186 correcta(s) · 0 fallo(s)',
  '✅ Las guardas deciden lo que dicen que deciden.',
].join('\n');

const ROJO = [
  '  ✓ un caso que sí pasa',
  "  ✗ deniega_variacion_de_caja → esperado 'ok', obtenido 'fail'",
  '',
  '185 correcta(s) · 1 fallo(s)',
].join('\n');

export async function pruebas(comprueba) {
  const mod = await cargar();
  if (!mod) {
    comprueba('resume_comando_codigo_conteos_y_ejecucion', 'sin-modulo', 'ok');
    comprueba('la_salida_completa_sigue_recuperable_por_identificador', 'sin-modulo', 'ok');
    return;
  }
  const { resumir, nuevoRunId, guardarSalida, leerSalida } = mod;

  comprueba('resume_comando_codigo_conteos_y_ejecucion', (() => {
    const runId = nuevoRunId();
    const verde = resumir({ id: 'test', command: 'npm run test', speed: 'fast', status: 0,
      durationMs: 1200, salida: VERDE, runId });
    if (verde.command !== 'npm run test') return 'fail-sin-comando';
    if (verde.exitCode !== 0 || verde.ok !== true) return 'fail-sin-codigo';
    if (verde.counts?.passed !== 186 || verde.counts?.failed !== 0) return 'fail-sin-conteos';
    if (!verde.runId || !verde.outputHash) return 'fail-sin-identificador';
    if (verde.failure) return 'fail-inventa-fallo-en-verde';
    // Resumir tiene que ahorrar de verdad, no reempaquetar.
    if (JSON.stringify(verde).length >= VERDE.length) return 'fail-no-ahorra';

    const rojo = resumir({ id: 'test', command: 'npm run test', speed: 'fast', status: 1,
      durationMs: 900, salida: ROJO, runId });
    if (rojo.ok !== false || rojo.exitCode !== 1) return 'fail-rojo-no-es-rojo';
    if (!/deniega_variacion_de_caja/.test(String(rojo.failure || ''))) return 'fail-rojo-sin-fallo-relevante';
    if (rojo.counts?.failed !== 1) return 'fail-rojo-sin-conteos';
    return 'ok';
  })(), 'ok');

  comprueba('la_salida_completa_sigue_recuperable_por_identificador', (() => {
    const base = join(tmpdir(), `sdd-resumen-${process.pid}`);
    try {
      const runId = nuevoRunId();
      const ruta = guardarSalida(base, runId, 'test', VERDE);
      if (!existsSync(ruta)) return 'fail-no-persiste';
      if (readFileSync(ruta, 'utf8') !== VERDE) return 'fail-no-es-identica';
      if (leerSalida(base, runId, 'test') !== VERDE) return 'fail-no-se-recupera';
      // Dos ejecuciones distintas no se pisan.
      const otro = nuevoRunId();
      if (otro === runId) return 'fail-identificador-no-unico';
      return 'ok';
    } finally {
      rmSync(base, { recursive: true, force: true });
    }
  })(), 'ok');
}
