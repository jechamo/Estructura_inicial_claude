#!/usr/bin/env node
// Caso trazable: reutiliza_solo_evidencia_materialmente_vigente.
import assert from 'node:assert/strict';
import { linkSync, mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, symlinkSync, truncateSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import {
  esMetadataRelease,
  evaluarReutilizacionRelease,
  firmarEvidenciaRelease,
  hashEvidenciaRelease,
  huellaMaterialRelease,
  resultadoReutilizado,
  rutaMaterialSegura,
} from './lib/release-gates.mjs';

const sha = 'a'.repeat(40);
const localKey = Buffer.from('clave-local-de-test-017-release-gates');
const previous = {
  schemaVersion: 2,
  kind: 'slow',
  ok: true,
  runId: 'slow-017',
  head: sha,
  at: '2026-08-22T20:00:00.000Z',
  checksHash: 'checks-1',
  runtime: 'node-v22.0.0|win32|x64',
  machineHash: 'machine-1',
  materialHash: 'material-1',
  editorialBaseline: [],
  checks: ['security', 'coverage', 'a11y', 'e2e'],
  results: [
    { id: 'security', status: 0, outputHash: 'sec', execution: 'executed' },
    { id: 'coverage', status: 0, outputHash: 'cov', execution: 'executed' },
    { id: 'a11y', status: 0, outputHash: 'a11y', execution: 'executed' },
    { id: 'e2e', status: 0, outputHash: 'e2e', execution: 'executed' },
  ],
};
previous.evidenceHash = hashEvidenciaRelease(previous);
previous.evidenceMac = firmarEvidenciaRelease(previous, localKey);
const signed = (evidence) => {
  const result = { ...evidence };
  result.evidenceHash = hashEvidenciaRelease(result);
  result.evidenceMac = firmarEvidenciaRelease(result, localKey);
  return result;
};

const current = {
  checksHash: previous.checksHash,
  runtime: previous.runtime,
  machineHash: previous.machineHash,
  evidenceKey: localKey,
  editorial: { ok: true, reason: 'íntegra' },
  materialHash: previous.materialHash,
  ancestor: true,
  changedPaths: [
    'CHANGELOG.md',
    'docs/bitacora/DECISIONS.md',
    'docs/specs/017-circuito-proporcional-contexto/evidence.md',
    'docs/quality/reports/2026-08-22-017.md',
    'docs/security/reports/2026-08-22-017.md',
  ],
  requiredSlowChecks: ['security', 'coverage', 'a11y', 'e2e'],
};

for (const path of current.changedPaths) assert.equal(esMetadataRelease(path), true, path);
for (const path of [
  'site/index.html',
  'docs/TFM/MEMORIA-TECNICA-TFM.md',
  '.github/workflows/sdd-gates.yml',
  '.sdd/checks.json',
  '.agents/skills/sdd-ship/SKILL.md',
  'scripts/sdd-project.mjs',
  'package-lock.json',
  'src/index.ts',
  'docs/specs/017-demo/plan.md',
  'docs/specs/017-demo/test-plan.md',
]) assert.equal(esMetadataRelease(path), false, `${path} no puede reutilizar evidencia`);

const eligible = evaluarReutilizacionRelease(previous, current);
assert.equal(eligible.ok, true, eligible.reason);
assert.deepEqual(eligible.reusedChecks.sort(), ['a11y', 'coverage', 'e2e']);
assert.deepEqual(eligible.freshChecks, ['security']);

const reused = resultadoReutilizado(previous.results[1], previous);
assert.equal(reused.execution, 'reused');
assert.equal(reused.sourceRunId, previous.runId);
assert.equal(reused.sourceAt, previous.at);
assert.equal(reused.status, 0);

const rejects = [
  [null, current, 'no existe'],
  [signed({ ...previous, kind: 'release', evidenceHash: undefined }), current, 'slow completa'],
  [signed({ ...previous, ok: false, evidenceHash: undefined }), current, 'rojo'],
  [{ ...previous, schemaVersion: 1 }, current, 'schema'],
  [signed({ ...previous, results: previous.results.filter((r) => r.id !== 'e2e'), evidenceHash: undefined }), current, 'e2e'],
  [previous, { ...current, ancestor: false }, 'ancestro'],
  [previous, { ...current, checksHash: 'otro' }, 'checks'],
  [previous, { ...current, runtime: 'otro' }, 'runtime'],
  [previous, { ...current, machineHash: 'otra-maquina' }, 'máquina'],
  [previous, { ...current, materialHash: 'otro' }, 'material'],
  [previous, { ...current, changedPaths: ['site/index.html'] }, 'permitidos'],
  [{ ...previous, results: [] }, current, 'integridad'],
  [{ ...previous, results: [], evidenceHash: hashEvidenciaRelease({ ...previous, results: [] }) },
    current, 'autenticidad'],
];
for (const [oldEvidence, now, fragment] of rejects) {
  const decision = evaluarReutilizacionRelease(oldEvidence, now);
  assert.equal(decision.ok, false, fragment);
  assert.match(decision.reason, new RegExp(fragment, 'i'));
  assert.match(decision.fallbackCommand, /run --slow --summary-json/);
}

const tagOnly = evaluarReutilizacionRelease(previous, { ...current, changedPaths: [] });
assert.equal(tagOnly.ok, true, 'un tag no cambia bytes y no invalida evidencia');
const duplicatedPrevious = signed({ ...previous, evidenceHash: undefined, evidenceMac: undefined,
  results: [...previous.results, { id: 'coverage:duplicada', status: 0, outputHash: 'cov-2', execution: 'executed' }] });
const duplicated = evaluarReutilizacionRelease(duplicatedPrevious, { ...current,
  requiredSlowChecks: [...current.requiredSlowChecks, 'coverage:duplicada'] });
assert.equal(duplicated.ok, false, 'cada tipo reutilizable admite un único check');
assert.match(duplicated.reason, /duplicad/i);

const project = mkdtempSync(join(tmpdir(), 'sdd-release-gates-'));
try {
  mkdirSync(join(project, '.sdd/state'), { recursive: true });
  mkdirSync(join(project, 'scripts'), { recursive: true });
  mkdirSync(join(project, 'src'), { recursive: true });
  mkdirSync(join(project, 'docs/specs/017-demo'), { recursive: true });
  mkdirSync(join(project, 'docs/bitacora'), { recursive: true });
  mkdirSync(join(project, 'docs/security/reports'), { recursive: true });
  writeFileSync(join(project, '.gitignore'), '.sdd/state/\n', 'utf8');
  writeFileSync(join(project, 'CHANGELOG.md'), '# Changelog\n', 'utf8');
  writeFileSync(join(project, 'src/app.js'), 'export const value = 1;\n', 'utf8');
  writeFileSync(join(project, 'docs/specs/017-demo/spec.md'),
    '# Spec\n\n| **Estado** | approved |\n\n## Requisito\nMantener la conducta.\n', 'utf8');
  writeFileSync(join(project, 'docs/specs/017-demo/evidence.md'), '# Evidence\n\nBase verificada.\n', 'utf8');
  writeFileSync(join(project, 'docs/bitacora/DECISIONS.md'), '# Decisiones\n\n---\n\nDecisión original.\n', 'utf8');
  writeFileSync(join(project, 'docs/security/reports/017.md'), '# Informe original\n', 'utf8');
  writeFileSync(join(project, 'scripts/check-sdd.mjs'),
    `import { appendFileSync, mkdirSync } from 'node:fs';\n` +
    `mkdirSync('.sdd/state', { recursive: true });\n` +
    `appendFileSync('.sdd/state/calls.log', 'check-sdd ' + process.argv.slice(2).join(' ') + '\\n');\n`, 'utf8');
  writeFileSync(join(project, 'scripts/scan-secrets.mjs'),
    `import { appendFileSync } from 'node:fs';\nappendFileSync('.sdd/state/calls.log', 'secret-scan\\n');\n`, 'utf8');
  writeFileSync(join(project, 'scripts/fake-gate.mjs'),
    `import { appendFileSync, mkdirSync } from 'node:fs';\n` +
    `mkdirSync('.sdd/state', { recursive: true });\n` +
    `appendFileSync('.sdd/state/calls.log', process.argv[2] + '\\n');\n`, 'utf8');
  writeFileSync(join(project, '.sdd/checks.json'), JSON.stringify({ version: 1, checks: {
    security: { command: 'node scripts/fake-gate.mjs security', required: true, speed: 'slow' },
    coverage: { command: 'node scripts/fake-gate.mjs coverage', required: true, speed: 'slow' },
    a11y: { command: 'node scripts/fake-gate.mjs a11y', required: true, speed: 'slow' },
    e2e: { command: 'node scripts/fake-gate.mjs e2e', required: true, speed: 'slow' },
  }, unconfigured: [] }, null, 2), 'utf8');
  spawnSync('git', ['init', '-q', '.'], { cwd: project, encoding: 'utf8' });
  for (const [key, value] of [['user.email', 'test@example.invalid'], ['user.name', 'Test']])
    spawnSync('git', ['config', key, value], { cwd: project, encoding: 'utf8' });
  spawnSync('git', ['add', '.'], { cwd: project, encoding: 'utf8' });
  spawnSync('git', ['commit', '-qm', 'baseline'], { cwd: project, encoding: 'utf8' });
  writeFileSync(join(project, 'baseline-2.txt'), 'base\n', 'utf8');
  spawnSync('git', ['add', 'baseline-2.txt'], { cwd: project, encoding: 'utf8' });
  spawnSync('git', ['commit', '-qm', 'segundo baseline'], { cwd: project, encoding: 'utf8' });

  const cli = resolve('scripts/sdd-project.mjs');
  const run = (...args) => spawnSync(process.execPath, [cli, 'run', ...args],
    { cwd: project, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
  const slow = run('--slow', '--summary-json');
  assert.equal(slow.status, 0, slow.stdout + slow.stderr);
  writeFileSync(join(project, 'CHANGELOG.md'), '# Changelog\n\n## Unreleased\n', 'utf8');
  const release = run('--release', '--summary-json');
  assert.equal(release.status, 0, release.stdout + release.stderr);
  const summary = JSON.parse((release.stdout || '').trim().split(/\r?\n/).pop());
  assert.deepEqual(summary.results.filter((r) => r.execution === 'reused').map((r) => r.id).sort(),
    ['a11y', 'coverage', 'e2e']);
  for (const id of ['trace-audit', 'secret-scan', 'sdd-strict', 'docs-diff', 'security'])
    assert.equal(summary.results.find((r) => r.id === id)?.execution, 'executed', id);
  const calls = readFileSync(join(project, '.sdd/state/calls.log'), 'utf8');
  assert.match(calls, /check-sdd --docs-diff --base [0-9a-f]{40}/,
    'docs-diff recibe un SHA completo, no un nombre de ref');
  assert.equal((calls.match(/^coverage$/gm) || []).length, 1, 'coverage no se reejecuta');
  assert.equal((calls.match(/^security$/gm) || []).length, 2, 'security siempre se reejecuta');

  spawnSync('git', ['tag', 'v-test'], { cwd: project, encoding: 'utf8' });
  assert.equal(run('--release', '--summary-json').status, 0, 'crear un tag no cambia la evidencia material');
  writeFileSync(join(project, 'docs/specs/017-demo/spec.md'),
    '# Spec\n\n| **Estado** | entregada |\n\n## Requisito\nMantener la conducta.\n', 'utf8');
  assert.equal(run('--release', '--summary-json').status, 0,
    'solo el estado de la spec puede cambiar sin repetir slow');
  writeFileSync(join(project, 'docs/specs/017-demo/spec.md'),
    '# Spec\n\n| **Estado** | entregada |\n\n## Requisito\nCambiar la conducta.\n', 'utf8');
  const rewrittenSpec = run('--release', '--summary-json');
  assert.equal(rewrittenSpec.status, 1, 'reescribir requisitos no es metadata de release');
  assert.match(rewrittenSpec.stdout, /run --slow --summary-json/);
  writeFileSync(join(project, 'docs/specs/017-demo/spec.md'),
    '# Spec\n\n| **Estado** | approved |\n\n## Requisito\nMantener la conducta.\n', 'utf8');
  writeFileSync(join(project, 'docs/bitacora/DECISIONS.md'), '# Decisiones\n\n---\n\nDecisión reescrita.\n', 'utf8');
  const rewrittenDecision = run('--release', '--summary-json');
  assert.equal(rewrittenDecision.status, 1, 'la bitácora solo admite conservar la historia previa');
  writeFileSync(join(project, 'docs/bitacora/DECISIONS.md'),
    '# Decisiones\n\n---\n\nNueva decisión.\n\n---\n\nDecisión original.\n', 'utf8');
  assert.equal(run('--release', '--summary-json').status, 0, 'la bitácora admite insertar tras su cabecera');
  writeFileSync(join(project, 'docs/security/reports/017.md'), '# Informe reescrito\n', 'utf8');
  assert.equal(run('--release', '--summary-json').status, 1, 'un informe previo es inmutable');
  writeFileSync(join(project, 'docs/security/reports/017.md'), '# Informe original\n', 'utf8');
  const hugeReport = join(project, 'docs/security/reports/nuevo-enorme.md');
  writeFileSync(hugeReport, 'x', 'utf8');
  truncateSync(hugeReport, 64 * 1024 * 1024 + 1);
  assert.equal(run('--release', '--summary-json').status, 1,
    'un informe nuevo por encima de cuota no puede agotar la huella');
  rmSync(hugeReport);
  writeFileSync(join(project, 'src/app.js'), 'export const value = 2;\n', 'utf8');
  const rejected = run('--release', '--summary-json');
  assert.equal(rejected.status, 1);
  assert.match(rejected.stdout, /run --slow --summary-json/);

  const hardlink = join(project, 'src/app-hardlink.js');
  linkSync(join(project, 'src/app.js'), hardlink);
  assert.equal(rutaMaterialSegura(project, 'src/app-hardlink.js'), false,
    'un hardlink no puede participar en la huella');
  assert.equal(huellaMaterialRelease(project), null, 'la huella falla cerrado ante hardlinks');
  rmSync(hardlink);
  const outside = mkdtempSync(join(tmpdir(), 'sdd-release-outside-'));
  try {
    writeFileSync(join(outside, 'outside.js'), 'export const outside = true;\n', 'utf8');
    symlinkSync(outside, join(project, 'linked'), process.platform === 'win32' ? 'junction' : 'dir');
    assert.equal(rutaMaterialSegura(project, 'linked/outside.js'), false,
      'un ancestro junction/symlink no puede participar en la huella');
  } finally {
    rmSync(join(project, 'linked'), { recursive: true, force: true });
    rmSync(outside, { recursive: true, force: true });
  }
} finally {
  rmSync(project, { recursive: true, force: true });
}

export function reutiliza_solo_evidencia_materialmente_vigente() {
  return eligible.ok && rejects.length === 13 && tagOnly.ok;
}

console.log('test-release-gates: 42 comprobaciones correctas');
