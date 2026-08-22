#!/usr/bin/env node
// Casos trazables: bloquea_commit_nuevo_sin_trailers;
// impide_legitimacion_retroactiva_e_invasion; agrega_grupos_por_modulo_en_ventana.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { auditarCommit, auditarCommits } from './lib/trace-audit.mjs';
import { approvedCircuitConfig } from './test/circuit-fixtures.mjs';

const frontier = approvedCircuitConfig({
  compactPrefixes: ['src/components/'],
  deniedPrefixes: ['src/auth/', 'migrations/'],
  sensitiveSegments: ['auth', 'api', 'migrations', 'security'],
});

const baseContext = {
  enforceTrailers: true,
  circuitConfigHash: frontier.proposalHash,
  tareas: new Set(['T-017-01']),
  specs: new Set(['017']),
  agentes: new Set(['implementer']),
  reparto: null,
  frontera: frontier,
  decisionRefs: new Set(['DEC-TEST']),
  limits: { criteria: 3, tasks: 3, intentBytes: 12288, auditWindow: 20 },
  changeSeals: new Map([['CG-017', 'b'.repeat(64)]]),
};

const missing = auditarCommit({ sha: '1'.repeat(40), mensaje: 'sin traza', ficheros: ['README.md'] }, baseContext);
function bloquea_commit_nuevo_sin_trailers() {
  assert.equal(missing.estado, 'infractor', 'RED: tras activación un commit sin trailers debe bloquear');
}
bloquea_commit_nuevo_sin_trailers();

const compactMessage = `feat: carrusel

Circuit: compact
Circuit-reason: Cambia la selección visible del carrusel existente con tests acotados
Circuit-config: ${frontier.proposalHash}
Change-Group: CG-017
Change-seal: ${'b'.repeat(64)}
Spec: 017
Task: T-017-01
Agent: implementer`;
const compactScope = { module: 'src/components', routes: ['src/components/Carousel.tsx'],
  criteria: 1, tasks: 1, intentBytes: 1024 };
const compact = auditarCommit({ sha: '2'.repeat(40), mensaje: compactMessage,
  ficheros: ['src/components/Carousel.tsx'], scope: compactScope }, baseContext);
assert.equal(compact.estado, 'conforme', compact.hallazgos.join('\n'));

for (const hostile of ['src/auth/session.ts', 'migrations/001.sql', 'src/components/api/route.ts']) {
  const escaped = auditarCommit({ sha: 'e'.repeat(40), mensaje: compactMessage, ficheros: [hostile], scope: compactScope }, baseContext);
  assert.equal(escaped.estado, 'infractor', `RED: compact no puede encubrir ${hostile}`);
}

const bundledActivation = auditarCommit({ sha: 'f'.repeat(40), mensaje: compactMessage,
  ficheros: ['.sdd/circuit.json', 'src/components/Carousel.tsx'], scope: compactScope },
{ ...baseContext, activationTransition: true });
assert.equal(bundledActivation.estado, 'infractor', 'RED: la activación debe ser un commit full dedicado');

const fullActivationMessage = `chore: activa circuito aprobado

Circuit: full
Circuit-reason: Activa la frontera humana aprobada en un commit dedicado y auditable
Circuit-config: ${frontier.proposalHash}
Spec: 017
Task: T-017-01
Agent: implementer`;
const validActivation = auditarCommit({ sha: 'a'.repeat(40), mensaje: fullActivationMessage,
  ficheros: ['.sdd/circuit.json'] }, { ...baseContext, activationTransition: true, activationCommitValid: true });
assert.equal(validActivation.estado, 'conforme', validActivation.hallazgos.join('\n'));
const mismatchedActivation = auditarCommit({ sha: 'b'.repeat(40), mensaje: fullActivationMessage,
  ficheros: ['.sdd/circuit.json'] }, { ...baseContext, activationTransition: true, activationCommitValid: false });
assert.equal(mismatchedActivation.estado, 'infractor', 'activationCommit obsoleto debe bloquear');
const bundledReapproval = auditarCommit({ sha: 'b'.repeat(40), mensaje: fullActivationMessage,
  ficheros: ['.sdd/circuit.json', 'src/components/Carousel.tsx'] }, { ...baseContext,
  circuitApprovalTransition: true, activationCommitValid: true });
assert.equal(bundledReapproval.estado, 'infractor',
  'RED: reaprobar una frontera activa también exige commit full dedicado');

const changePath = 'docs/specs/017-carrusel/change.md';
const bundledChange = auditarCommit({ sha: 'b'.repeat(40), mensaje: fullActivationMessage,
  ficheros: [changePath, 'src/components/Carousel.tsx'] }, { ...baseContext,
  changeApprovalTransition: true, changeApprovalPaths: [changePath] });
assert.equal(bundledChange.estado, 'infractor', 'aprobar change.md y código en el mismo commit debe bloquear');
const dedicatedChange = auditarCommit({ sha: 'b'.repeat(40), mensaje: fullActivationMessage,
  ficheros: [changePath] }, { ...baseContext,
  changeApprovalTransition: true, changeApprovalPaths: [changePath] });
assert.equal(dedicatedChange.estado, 'conforme', dedicatedChange.hallazgos.join('\n'));

const wrongConfig = auditarCommit({ sha: '3'.repeat(40), mensaje: compactMessage.replace(frontier.proposalHash, 'c'.repeat(64)),
  ficheros: ['src/components/Carousel.tsx'], scope: compactScope }, baseContext);
assert.equal(wrongConfig.estado, 'infractor');
assert.ok(wrongConfig.hallazgos.some((x) => x.includes('Circuit-config')));

const wrongSeal = auditarCommit({ sha: '4'.repeat(40), mensaje: compactMessage.replace(/b{64}/, 'd'.repeat(64)),
  ficheros: ['src/components/Carousel.tsx'], scope: compactScope }, baseContext);
assert.equal(wrongSeal.estado, 'infractor');

const moduleEscape = auditarCommit({ sha: 'c'.repeat(40), mensaje: compactMessage,
  ficheros: ['src/components/Other.tsx'],
  scope: { ...compactScope, module: 'src/components/carousel' } }, baseContext);
assert.equal(moduleEscape.estado, 'infractor', 'el diff debe quedar dentro del módulo sellado');
const routeEscape = auditarCommit({ sha: 'c'.repeat(40), mensaje: compactMessage,
  ficheros: ['src/components/Other.tsx'], scope: compactScope }, baseContext);
assert.equal(routeEscape.estado, 'infractor', 'RED: el diff debe ser subconjunto de rutas exactas selladas');

function impide_legitimacion_retroactiva_e_invasion() {
  assert.equal(wrongConfig.estado, 'infractor');
  assert.equal(mismatchedActivation.estado, 'infractor');
  assert.equal(moduleEscape.estado, 'infractor');
  assert.equal(routeEscape.estado, 'infractor');
}
impide_legitimacion_retroactiva_e_invasion();

const lightUnknownAgent = auditarCommit({
  sha: '5'.repeat(40),
  mensaje: `docs: corrige guía

Circuit: light
Circuit-reason: Corrige una errata exacta sin cambiar ningún comportamiento ejecutable
Circuit-config: ${'a'.repeat(64)}
Agent: fantasma`,
  ficheros: ['README.md'],
}, { ...baseContext, lightFiles: new Set(['readme.md']) });
assert.equal(lightUnknownAgent.estado, 'infractor', 'light también valida Agent');

const commits = [0, 1, 2, 3].map((index) => ({
  sha: String(6 + index).repeat(40),
  mensaje: compactMessage.replace('CG-017', `CG-${index}`).replace(/b{64}/, String(index + 1).repeat(64)),
  ficheros: ['src/components/Carousel.tsx'],
  scope: { module: 'src/components', routes: ['src/components/Carousel.tsx'], criteria: 1, tasks: 1, intentBytes: 4000 },
}));
const groups = new Map(commits.map((commit, index) => [`CG-${index}`, String(index + 1).repeat(64)]));
const aggregate = auditarCommits(commits, { ...baseContext, changeSeals: groups });
assert.ok(aggregate.infractores.length >= 1,
  'RED: la unión de grupos del mismo módulo que excede límites debe exigir full');
assert.ok(aggregate.avisos.length >= 1, 'rotar Change-Group también deja aviso por módulo');

function agrega_grupos_por_modulo_en_ventana() {
  assert.ok(aggregate.avisos.length >= 1);
  assert.ok(aggregate.infractores.length >= 1);
}
agrega_grupos_por_modulo_en_ventana();

const distinctBelowLimit = auditarCommits(commits.slice(0, 2).map((commit) => ({
  ...commit, scope: { ...commit.scope, intentBytes: 1000 },
})), { ...baseContext, changeSeals: groups });
assert.equal(distinctBelowLimit.infractores.length, 0,
  'grupos distintos bajo el límite agregado solo avisan');
assert.ok(distinctBelowLimit.avisos.length >= 1);

const sealA1 = 'a'.repeat(64);
const sealB = 'c'.repeat(64);
const sealA2 = 'e'.repeat(64);
const messageFor = (group, seal) => compactMessage
  .replace('CG-017', group).replace(/b{64}/, seal);
const reapprovedGroup = [
  { sha: 'a1'.padEnd(40, 'a'), mensaje: messageFor('G-A', sealA1),
    ficheros: ['src/components/Carousel.tsx'],
    scope: { ...compactScope, criteria: 1, tasks: 1, intentBytes: 1000 },
    context: { changeSeals: new Map([['G-A', sealA1]]) } },
  { sha: 'b1'.padEnd(40, 'b'), mensaje: messageFor('G-B', sealB),
    ficheros: ['src/components/Carousel.tsx'],
    scope: { ...compactScope, criteria: 1, tasks: 1, intentBytes: 1000 },
    context: { changeSeals: new Map([['G-A', sealA1], ['G-B', sealB]]) } },
  { sha: 'a2'.padEnd(40, 'a'), mensaje: messageFor('G-A', sealA2),
    ficheros: ['src/components/Carousel.tsx'],
    scope: { ...compactScope, criteria: 3, tasks: 1, intentBytes: 1000 },
    context: { changeSeals: new Map([['G-A', sealA2], ['G-B', sealB]]) } },
];
assert.ok(auditarCommits(reapprovedGroup, baseContext).infractores.length >= 1,
  'RED: reaprobar un grupo con sello nuevo reemplaza su contribución antes de sumar el módulo');

const sameGroup = [0, 1].map((index) => ({
  sha: `d${index}`.padEnd(40, 'd'), mensaje: compactMessage,
  ficheros: ['src/components/Carousel.tsx'],
  scope: { module: 'src/components', routes: ['src/components/Carousel.tsx'], criteria: 2, tasks: 2, intentBytes: 7000 },
}));
assert.equal(auditarCommits(sameGroup, baseContext).infractores.length, 0,
  'RED: varios commits del mismo Change-Group cuentan la intención una sola vez');

const oldOverflow = Array.from({ length: 21 }, (_, index) => ({
  sha: `9${index}`.padEnd(40, '9'), mensaje: compactMessage.replace('CG-017', `OLD-${index}`)
    .replace(/b{64}/, String((index % 8) + 1).repeat(64)),
  ficheros: [index < 4 ? 'src/components/Carousel.tsx' : `src/components/m${index}/Card.tsx`],
  scope: { module: index < 4 ? 'src/components' : `src/components/m${index}`,
    routes: [index < 4 ? 'src/components/Carousel.tsx' : `src/components/m${index}/Card.tsx`],
    criteria: 1, tasks: 1, intentBytes: 100 },
}));
const oldSeals = new Map(oldOverflow.map((commit, index) => [`OLD-${index}`, String((index % 8) + 1).repeat(64)]));
assert.equal(auditarCommits(oldOverflow, { ...baseContext, changeSeals: oldSeals }).infractores.length, 0,
  'RED: la ventana cronológica ignora el desborde que quedó fuera de los 20 commits recientes');

for (const path of [
  '.github/workflows/pages.yml',
  '.github/workflows/quality-gates.yml',
  '.github/workflows/sdd-gates.yml',
  '.agents/skills/sdd-ship/SKILL.md',
]) assert.match(readFileSync(path, 'utf8'), /trace-audit/,
  `RED: ${path} debe ejecutar trace-audit`);
assert.match(readFileSync('scripts/sdd-project.mjs', 'utf8'), /if \(!base\)[\s\S]{0,500}status:\s*1/,
  'run --slow falla si no resuelve una base material');
assert.match(readFileSync('.github/workflows/quality-gates.yml', 'utf8'), /'017'/,
  'la spec 017 entra en la matriz strict');
const lightSkill = readFileSync('.agents/skills/sdd-light/SKILL.md', 'utf8');
assert.match(lightSkill, /Circuit-config:/);
assert.match(lightSkill, /Agent:/);

console.log('test-trace-audit: 38 comprobaciones correctas');
