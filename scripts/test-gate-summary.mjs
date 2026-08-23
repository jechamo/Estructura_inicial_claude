#!/usr/bin/env node
// Casos trazables: redacta_todos_los_canales_antes_de_persistir; acota_tiempo_y_salida.
import assert from 'node:assert/strict';

const summary = await import('./lib/gate-summary.mjs');
assert.equal(typeof summary.sanitizarSalida, 'function', 'RED: falta sanitizarSalida');
assert.equal(typeof summary.resumirEjecucion, 'function', 'RED: falta resumirEjecucion');
assert.equal(typeof summary.acotarResumen, 'function', 'RED: falta acotarResumen');
assert.equal(typeof summary.ejecutarProcesoResumido, 'function', 'RED: falta ejecución acotada real');

const secret = 'ghp_' + 'a'.repeat(36);
const boundaries = [8191, 8192, 8193];
function acota_tiempo_y_salida() {
  for (const size of boundaries) {
    const output = `${'x'.repeat(size)}\nAuthorization: Bearer ${secret}\n${secret}`;
    const sanitized = summary.sanitizarSalida(output, 8192);
    assert.ok(Buffer.byteLength(sanitized.text, 'utf8') <= 8192, `límite incumplido para ${size}`);
    assert.doesNotMatch(sanitized.text, /ghp_/);
    assert.doesNotMatch(sanitized.text, /Bearer\s+/i);
  }
}
acota_tiempo_y_salida();

const result = summary.resumirEjecucion({
  id: 'test', command: `node fake.mjs --token ${secret}`, status: 1, signal: null,
  durationMs: 25, stdout: `${secret}\nfallo útil`, stderr: `Authorization: Bearer ${secret}`,
  timedOut: false,
});
function redacta_todos_los_canales_antes_de_persistir() {
  assert.equal(result.status, 1);
  assert.match(result.command, /\[REDACTED\]/);
  assert.doesNotMatch(JSON.stringify(result), /ghp_/);
  assert.ok(result.outputHash);
  assert.ok(result.counts.totalBytes > 0);
  assert.equal(Object.hasOwn(result, 'raw'), false);
}
redacta_todos_los_canales_antes_de_persistir();

const boundarySecret = ['ULTRA', 'SENSITIVE', 'VALUE', '123456789'].join('_');
const boundary = summary.resumirEjecucion({
  id: 'frontera-redaccion', command: 'node fake.mjs', status: 1, signal: null,
  durationMs: 5, stdout: `${'x'.repeat(100)}password=${boundarySecret}${'Z'.repeat(8160)}`,
  stderr: '', timedOut: false,
});
assert.doesNotMatch(JSON.stringify(boundary), new RegExp(boundarySecret),
  'RED: se redacta el stream completo antes de cortar el fragmento final');
assert.ok(boundary.counts.redactions >= 1, 'la redacción anterior al corte queda contabilizada');

const bounded = summary.acotarResumen({ results: Array.from({ length: 10 }, (_, index) => ({
  ...result, id: `fallo-${index}`, output: 'z'.repeat(4096),
})) });
assert.ok(Buffer.byteLength(JSON.stringify(bounded), 'utf8') <= 8192, 'el resumen completo supera 8 KiB');
assert.equal(bounded.results.slice(1).every((entry) => entry.output === ''), true);

const many = summary.acotarResumen({ schemaVersion: 1, runId: 'muchos', status: 'pass', ok: true,
  results: Array.from({ length: 200 }, (_, index) => ({ ...result, id: `verde-${index}`, status: 0, output: '' })) });
assert.ok(Buffer.byteLength(JSON.stringify(many), 'utf8') <= 8192,
  'RED: 200 resultados verdes también deben caber en el límite total');
assert.ok(many.resultsOmitted > 0, 'el resumen declara cuántos resultados omitió');

const reuseHeavy = summary.acotarResumen({ schemaVersion: 1, runId: 'reuse-heavy', status: 'pass', ok: true,
  results: [
    ...Array.from({ length: 48 }, (_, index) => ({ ...result, id: `executed-${index}`, status: 0,
      command: 'x'.repeat(500), output: '', execution: 'executed' })),
    ...['coverage', 'e2e', 'a11y'].map((id) => ({ ...result, id, status: 0, output: '',
      execution: 'reused', sourceRunId: 'slow-source-017', sourceAt: '2026-08-23T10:00:00.000Z',
      sourceHead: 'a'.repeat(40), reason: 'huella idéntica' })),
  ] });
assert.deepEqual(reuseHeavy.results.filter((entry) => entry.execution === 'reused').map((entry) => entry.id).sort(),
  ['a11y', 'coverage', 'e2e'], 'la cota nunca elimina la procedencia de resultados reused');
assert.ok(Buffer.byteLength(`${JSON.stringify(reuseHeavy, null, 2)}\n`, 'utf8') <= 8192);

const failureLast = summary.acotarResumen({ schemaVersion: 1, runId: 'fallo-final', status: 'fail', ok: false,
  results: [
    ...Array.from({ length: 200 }, (_, index) => ({ ...result, id: `verde-${index}`, status: 0, output: '' })),
    { ...result, id: 'fallo-material', status: 1, output: 'aserción que explica el fallo' },
  ] });
assert.ok(failureLast.results.some((entry) => entry.id === 'fallo-material' && entry.status === 1),
  'RED: el recorte nunca puede ocultar el único fallo');
assert.ok(Buffer.byteLength(`${JSON.stringify(failureLast, null, 2)}\n`, 'utf8') <= 8192,
  'RED: el límite de 8 KiB aplica al JSON pretty-print realmente persistido');

const timeout = summary.ejecutarProcesoResumido({ id: 'timeout', command: process.execPath,
  args: ['-e', 'setInterval(() => {}, 1000)'], timeoutMs: 50, maxBuffer: 1024 });
assert.equal(timeout.timedOut, true, 'RED: un hijo bloqueado debe cancelarse por timeout real');
const overflow = summary.ejecutarProcesoResumido({ id: 'buffer', command: process.execPath,
  args: ['-e', 'process.stdout.write("x".repeat(50000))'], timeoutMs: 1000, maxBuffer: 1024 });
assert.notEqual(overflow.status, 0, 'RED: superar maxBuffer debe fallar el gate');

console.log('test-gate-summary: 26 comprobaciones correctas');
