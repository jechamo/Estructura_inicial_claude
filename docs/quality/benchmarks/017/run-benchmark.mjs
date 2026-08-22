#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { clasificarCircuito, hashPropuesta } from '../../../../scripts/lib/circuito.mjs';
import { resumirEjecucion } from '../../../../scripts/lib/gate-summary.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../../../..');
const read = (path) => readFileSync(join(ROOT, path), 'utf8');
const bytes = (items) => Buffer.byteLength(items.join('\n'), 'utf8');
const median = (values) => {
  const ordered = [...values].sort((a, b) => a - b);
  return ordered[Math.floor(ordered.length / 2)];
};
const reduction = (baseline, candidate) => Number(((1 - candidate / baseline) * 100).toFixed(2));

function run(args) {
  const started = Date.now();
  const result = spawnSync(process.execPath, args, { cwd: ROOT, encoding: 'utf8', shell: false, maxBuffer: 1024 * 1024 });
  if (result.status !== 0) throw new Error(`${args.join(' ')}: ${(result.stderr || result.stdout).slice(-500)}`);
  return { result, durationMs: Date.now() - started };
}

function context(args) {
  const execution = run(['scripts/sdd-project.mjs', 'context', ...args, '--json']);
  JSON.parse(execution.result.stdout);
  return execution.result.stdout;
}

const policy = read('docs/sdd/OPERATING-MODEL.md');
const constitution = read('docs/architecture/constitution.md');
const implementer = read('.claude/agents/implementer.md');
const skill = read('.agents/skills/sdd-implement/SKILL.md');
const fullArtifacts = ['spec.md', 'plan.md', 'tasks.md', 'test-plan.md']
  .map((name) => read(`docs/specs/017-circuito-proporcional-contexto/${name}`));
const change = read('docs/specs/_TEMPLATE/change.md');
const hosts = [
  ['claude', 'CLAUDE.md'],
  ['copilot', '.github/copilot-instructions.md'],
  ['cursor', '.cursor/rules/00-core.mdc'],
].map(([id, path]) => ({ id, text: read(path) }));

const testRun = run(['scripts/test-circuit.mjs']);
const summarizedOutput = JSON.stringify(resumirEjecucion({
  id: 'test-circuit', command: 'node scripts/test-circuit.mjs', status: testRun.result.status,
  signal: testRun.result.signal, durationMs: testRun.durationMs,
  stdout: testRun.result.stdout, stderr: testRun.result.stderr,
}));
const rawOutput = `${testRun.result.stdout}${testRun.result.stderr}`;

const proposal = {
  light: { allowedFiles: ['README.md', 'docs/guides/uso.md'] },
  compact: { allowedPrefixes: ['src/components/', 'src/config/'] },
  deniedPrefixes: ['src/domain/', 'src/auth/', 'app/api/', '.sdd/', 'scripts/'],
  executableExtensions: ['.js', '.mjs', '.ts', '.tsx', '.jsx'],
  sensitiveSegments: ['auth', 'api', 'domain', 'contracts', 'migrations', '.sdd', 'scripts'],
  limits: { modules: 1, criteria: 3, tasks: 3, intentBytes: 12288, auditWindow: 20 },
  quota: 0.4,
};
const configBase = { schemaVersion: 1, grammar: 'portable-path-v1', detectorVersion: 1, proposal };
const config = { ...configBase, status: 'approved', proposalHash: hashPropuesta(configBase),
  approval: { approvedBy: 'Persona benchmark', approvedAt: '2026-08-22T00:00:00.000Z', decisionRef: 'DEC-017' },
  activationCommit: '1'.repeat(40) };

const classificationCases = [
  ['documentacion-exacta', ['README.md'], 'light', 'no-sensible'],
  ['carrusel-existente', ['src/components/Carousel.tsx'], 'compact', 'no-sensible'],
  ['acordeon-existente', ['src/components/Accordion.tsx'], 'compact', 'no-sensible'],
  ['dominio', ['src/domain/payment.ts'], 'full', 'sensible'],
  ['propio-sdd', ['scripts/check-sdd.mjs'], 'full', 'sensible'],
].map(([id, paths, expected, securityImpact]) => {
  const actual = clasificarCircuito(paths, config, { securityImpact, decisionRefs: new Set(['DEC-017']) }).circuito;
  return { id, paths, expected, actual, pass: actual === expected };
});

const compactContext = context(['--phase', 'compact']);
const fullContexts = [
  context(['--phase', 'plan', '--spec', '017']),
  context(['--phase', 'implement', '--spec', '017', '--task', 'T-017-03']),
  context(['--phase', 'verify', '--spec', '017']),
];
const samples = hosts.map((host, index) => {
  const baseline = bytes([host.text, policy, constitution, implementer, skill, ...fullArtifacts, rawOutput]);
  const compact = bytes([host.text, compactContext, implementer, skill, change, summarizedOutput]);
  const full = bytes([host.text, fullContexts[index], implementer, skill, summarizedOutput]);
  return {
    host: host.id,
    activated: { host: true, agent: true, skill: true, artifacts: true, output: true, contextCommand: true },
    baselineBytes: baseline,
    compactBytes: compact,
    compactReductionPct: reduction(baseline, compact),
    fullBytes: full,
    fullReductionPct: reduction(baseline, full),
  };
});
const compactProtocol = ['planner', 'implementer', 'code-reviewer'];
const result = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  methodology: 'bytes de contexto realmente activado (host, agente, skill, artefactos, salida y context CLI); proxy auditable, no cuota real del proveedor',
  limitations: [
    'bytes/4 solo aproxima tokens y no observa caché, razonamiento ni facturación de Copilot/Cursor',
    'las tres intervenciones son el máximo contractual de agentes, no telemetría expuesta por el host',
  ],
  cases: classificationCases,
  samples,
  summary: {
    classificationAccuracy: classificationCases.filter((item) => item.pass).length / classificationCases.length,
    compact: {
      medianReductionPct: median(samples.map((item) => item.compactReductionPct)),
      interventions: compactProtocol.length,
      interventionProtocol: compactProtocol,
      thresholdPct: 70,
    },
    full: { medianReductionPct: median(samples.map((item) => item.fullReductionPct)), thresholdPct: 20 },
  },
};
result.pass = result.summary.classificationAccuracy === 1 &&
  result.summary.compact.medianReductionPct >= 70 && result.summary.compact.interventions <= 3 &&
  result.summary.full.medianReductionPct >= 20;
writeFileSync(join(HERE, 'benchmark.json'), `${JSON.stringify(result, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(result));
if (!result.pass) process.exitCode = 1;
