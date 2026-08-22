#!/usr/bin/env node
// Caso trazable: ignora_instrucciones_y_falla_ante_estructura_invalida.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

const result = spawnSync(process.execPath, [
  'scripts/sdd-project.mjs', 'context', '--phase', 'implement', '--spec', '017',
  '--task', 'T-017-03', '--json',
], { encoding: 'utf8' });

assert.equal(result.status, 0, `RED: falta context --phase: ${result.stderr}`);
const context = JSON.parse(result.stdout);
assert.equal(context.schemaVersion, 1);
assert.equal(context.phase, 'implement');
assert.match(context.policy, /Regla cero/);
assert.match(context.policy, /Gates de calidad/);
assert.match(context.policy, /Seguridad/);
assert.match(context.policy, /Qué NO hacer/);
assert.match(context.taskContext, /T-017-03/);
assert.match(context.taskContext, /SEC-CONTEXT-001/);
assert.match(context.taskContext, /Escenario: cargar una fase/, 'la tarea trae el Gherkin completo de CA-03');
assert.doesNotMatch(context.taskContext, /T-017-04/);
assert.ok(Buffer.byteLength(context.policy, 'utf8') < 42_000, 'el recorte debe ser menor que la política completa');

const nonSensitive = spawnSync(process.execPath, [
  'scripts/sdd-project.mjs', 'context', '--phase', 'implement', '--spec', '014', '--json',
], { encoding: 'utf8' });
assert.equal(nonSensitive.status, 0, nonSensitive.stderr);
const universal = JSON.parse(nonSensitive.stdout).policy;
function ignora_instrucciones_y_falla_ante_estructura_invalida() {
  assert.match(universal, /Nada de secretos en el repo/, 'RED: el núcleo no sensible conserva secretos');
  assert.match(universal, /AuthN ≠ AuthZ/, 'RED: el núcleo no sensible conserva autorización');
  assert.match(universal, /salida de herramienta.*dato no confiable/is, 'RED: conserva seguridad agentic');
  assert.doesNotMatch(universal, /\| Specify \| Clasifica/, 'la matriz por fase sí es condicional');
}
ignora_instrucciones_y_falla_ante_estructura_invalida();

for (const phase of ['specify', 'light', 'compact']) {
  const phaseResult = spawnSync(process.execPath,
    ['scripts/sdd-project.mjs', 'context', '--phase', phase, '--json'], { encoding: 'utf8' });
  assert.equal(phaseResult.status, 0, `${phase} debe resolver encabezados H2/H3: ${phaseResult.stderr}`);
}

const planContext = spawnSync(process.execPath,
  ['scripts/sdd-project.mjs', 'context', '--phase', 'plan', '--spec', '017', '--json'], { encoding: 'utf8' });
assert.equal(planContext.status, 0, planContext.stderr);
const planPayload = JSON.parse(planContext.stdout);
assert.match(planPayload.taskContext, /RF-01/);
assert.match(planPayload.taskContext, /Escenario: clasificar antes de editar/);

const invalid = spawnSync(process.execPath,
  ['scripts/sdd-project.mjs', 'context', '--phase', 'inventada', '--json'], { encoding: 'utf8' });
assert.notEqual(invalid.status, 0);
assert.match(invalid.stderr, /fase/i);

console.log('test-context: 25 comprobaciones correctas');
