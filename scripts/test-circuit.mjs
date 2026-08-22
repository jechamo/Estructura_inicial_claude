#!/usr/bin/env node
// Casos trazables: rechaza_rutas_ambiguas_y_enlaces;
// rechaza_hash_obsoleto_o_aprobacion_de_agente; eleva_impacto_sensible_y_tipo_no_regular.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const circuito = await import('./lib/circuito.mjs');

assert.equal(typeof circuito.canonicalizarRuta, 'function',
  'RED: falta canonicalizarRuta para portable-path-v1');
assert.equal(typeof circuito.hashPropuesta, 'function',
  'RED: falta el sello canónico de la propuesta');
assert.equal(typeof circuito.clasificarCircuito, 'function',
  'RED: falta el clasificador light/compact/full');

const {
  canonicalizarRuta, hashPropuesta, clasificarCircuito, intencionCambio, validarAprobacionCambio,
  validarCambioCompacto, validarCircuito, validarSolicitudAprobacion,
} = circuito;

assert.equal(canonicalizarRuta('Src\\Components\\Cafe\u0301.tsx'), 'src/components/café.tsx');
assert.equal(canonicalizarRuta(' README.md'), null, 'RED: portable-path-v1 no recorta nombres ambiguos');
assert.equal(canonicalizarRuta('README.md '), null, 'RED: portable-path-v1 rechaza espacios exteriores');
function rechaza_rutas_ambiguas_y_enlaces() {
  for (const hostil of ['', '../x', 'a/../x', 'C:\\x', '/x', '**/auth/', 'a\u0000b'])
    assert.equal(canonicalizarRuta(hostil), null, `debe rechazar ${JSON.stringify(hostil)}`);
}
rechaza_rutas_ambiguas_y_enlaces();

const proposal = {
  light: { allowedFiles: ['README.md', 'docs/guides/USO.md'] },
  compact: { allowedPrefixes: ['src/components/'] },
  deniedPrefixes: ['src/domain/', 'src/auth/', '.sdd/'],
  executableExtensions: ['.js', '.mjs', '.ts', '.tsx', '.jsx'],
  sensitiveSegments: ['auth', 'security', 'domain', 'contracts', 'api', 'migrations', 'prisma', 'supabase'],
  limits: { modules: 1, criteria: 3, tasks: 3, intentBytes: 12288, auditWindow: 20 },
  quota: 0.4,
};
const proposalHash = hashPropuesta({ schemaVersion: 1, grammar: 'portable-path-v1', detectorVersion: 1, proposal });
const approved = {
  schemaVersion: 1,
  grammar: 'portable-path-v1',
  detectorVersion: 1,
  status: 'approved',
  proposalHash,
  proposal,
  approval: { approvedBy: 'Persona', approvedAt: '2026-08-22T10:00:00.000Z', decisionRef: 'DEC-017' },
  activationCommit: '1234567890abcdef1234567890abcdef12345678',
};
const decisionRefs = new Set(['DEC-017']);
const classify = (paths, config = approved, options = {}) =>
  clasificarCircuito(paths, config, { ...options, decisionRefs });

assert.equal(validarCircuito(approved, { decisionRefs }).ok, true);
assert.equal(validarCircuito({ ...approved, approval: { ...approved.approval, approvedBy: 'Codex' } }, { decisionRefs }).active, false);
assert.equal(validarCircuito({ ...approved, approval: { ...approved.approval, approvedAt: '2026-99-99Tbad' } }, { decisionRefs }).active, false);
assert.equal(validarCircuito(approved, { decisionRefs: new Set() }).active, false,
  'la referencia durable debe existir cuando el host puede corroborarla');
assert.equal(classify(['README.md'], { ...approved, status: 'pending' }).circuito, 'full');
assert.equal(classify(['README.md']).circuito, 'light');
assert.equal(classify(['readme.md'], approved, { trackedPaths: ['README.md'] }).circuito, 'full',
  'una caja distinta del fichero versionado falla cerrada');
assert.equal(classify(['src/components/Card.tsx'], approved,
  { securityImpact: 'no-sensible' }).circuito, 'compact');
assert.equal(classify(['src/Components/Card.tsx'], approved,
  { securityImpact: 'no-sensible' }).circuito, 'full', 'la caja distinta no abre otro árbol en Linux');
function eleva_impacto_sensible_y_tipo_no_regular() {
  assert.equal(classify(['src/components/Card.tsx'], approved,
    { securityImpact: 'sensible' }).circuito, 'full');
  assert.equal(classify(['src/components/Card.tsx'], approved,
    { securityImpact: 'no-sensible', fileTypes: { 'src/components/card.tsx': 'symlink' } }).circuito, 'full');
}
eleva_impacto_sensible_y_tipo_no_regular();
assert.equal(classify(['src/components/Card.tsx'], approved,
  { securityImpact: 'no-sensible', behaviorChanged: true }).circuito, 'compact');
assert.equal(classify(['README.md'], approved,
  { behaviorChanged: true }).circuito, 'compact');
assert.equal(classify(['src/domain/pagos.ts'], approved,
  { securityImpact: 'no-sensible' }).circuito, 'full');
assert.equal(classify(['SRC/DOMAIN/pagos.ts'], approved,
  { securityImpact: 'no-sensible' }).circuito, 'full');
assert.equal(classify(['src/components/Auth/Card.tsx'], approved,
  { securityImpact: 'no-sensible' }).circuito, 'full');

const collision = structuredClone(approved);
collision.proposal.light.allowedFiles.push('readme.md');
collision.proposalHash = hashPropuesta({ schemaVersion: 1, grammar: 'portable-path-v1', detectorVersion: 1, proposal: collision.proposal });
assert.equal(validarCircuito(collision).ok, false);

const stale = structuredClone(approved);
stale.proposal.quota = 0.8;
assert.equal(validarCircuito(stale).ok, false);
for (const invalidQuota of [-1, 2, Number.NaN]) {
  const invalid = structuredClone(approved);
  invalid.proposal.quota = invalidQuota;
  invalid.proposalHash = hashPropuesta(invalid);
  assert.equal(validarCircuito(invalid).active, false, `cuota inválida: ${invalidQuota}`);
}
const oversizedWindow = structuredClone(approved);
oversizedWindow.proposal.limits.auditWindow = 101;
oversizedWindow.proposalHash = hashPropuesta(oversizedWindow);
assert.equal(validarCircuito(oversizedWindow, { decisionRefs }).active, false,
  'RED: auditWindow queda acotada contra agotamiento de recursos');

const unicode = structuredClone(approved);
unicode.proposal.light.allowedFiles.push('docs/Café.md');
unicode.proposalHash = hashPropuesta(unicode);
assert.equal(classify(['docs/Cafe\u0301.md'], unicode).circuito, 'full',
  'NFD no suplanta al fichero exacto NFC aprobado');

function rechaza_hash_obsoleto_o_aprobacion_de_agente() {
  assert.equal(validarSolicitudAprobacion({ suppliedHash: 'f'.repeat(64), expectedHash: proposalHash,
    approvedBy: 'Persona mantenedora', decisionRef: 'DEC-017' }).ok, false);
  assert.equal(validarSolicitudAprobacion({ suppliedHash: proposalHash, expectedHash: proposalHash,
    approvedBy: 'Codex', decisionRef: 'DEC-017' }).ok, false);
  assert.equal(validarSolicitudAprobacion({ suppliedHash: proposalHash, expectedHash: proposalHash,
    approvedBy: 'Persona mantenedora', decisionRef: 'DEC-017' }).ok, true);
}
rechaza_hash_obsoleto_o_aprobacion_de_agente();

const validChange = `# Cambio compacto
| Campo | Valor |
|---|---|
| Change-Group | CG-017-card |
| Módulo | src/components |
| Revisor independiente | code-reviewer |
## Intención sellada
### Comportamiento
Actualiza la selección visible de una tarjeta existente.
### Criterios de aceptación
- CA-01: la tarjeta activa queda anunciada.
### Rutas previstas
- \`src/components/Card.tsx\`
### Impactos
- Seguridad: \`no-sensible\`
- Usabilidad: \`sin-ui\`
- Documentación: \`no-aplica\`
## Tareas (máximo 3)
- [ ] T-017-01 · RED → GREEN → REFACTOR · test: \`scripts/card.test.mjs::selecciona_tarjeta\`
`;
assert.equal(validarCambioCompacto(validChange, approved, { decisionRefs }).ok, true);
assert.equal(validarCambioCompacto(validChange.replace('`no-sensible`', '`no-sensible | sensible`'), approved, { decisionRefs }).ok, false);
assert.equal(validarCambioCompacto(validChange.replace('src/components/Card.tsx', 'src/auth/token.ts'), approved, { decisionRefs }).ok, false);
assert.notEqual(intencionCambio(validChange), intencionCambio(validChange.replace('CG-017-card', 'CG-017-otro')),
  'Change-Group pertenece al sello');
assert.notEqual(intencionCambio(validChange), intencionCambio(validChange.replace('src/components |', 'src/components/forms |')),
  'el módulo pertenece al sello');

const approvedChange = validChange
  .replace('| Revisor independiente | code-reviewer |', `| Estado | approved |
| Aprobado por | Persona mantenedora |
| Fecha de aprobación | 2026-08-22T10:00:00.000Z |
| Referencia de decisión | DEC-017 |
| Sello de intención | ${createHash('sha256').update(intencionCambio(validChange)).digest('hex')} |
| Revisor independiente | code-reviewer |`);
assert.equal(validarAprobacionCambio(approvedChange, { decisionRefs: new Set(['DEC-017']) }).ok, true);
assert.equal(validarAprobacionCambio(approvedChange.replace('Persona mantenedora', 'Codex'),
  { decisionRefs: new Set(['DEC-017']) }).ok, false);

if (process.env.SDD_COVERAGE !== '1') {
  const help = spawnSync(process.execPath, ['scripts/sdd-project.mjs', '--help'], { encoding: 'utf8' });
  assert.equal(help.status, 0);
  for (const command of ['detect-circuit', 'approve-circuit', 'new-change', 'approve-change', 'context --phase', '--summary-json'])
    assert.match(help.stdout, new RegExp(command.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
      `RED: la ayuda debe publicar ${command}`);

  const planned = spawnSync(process.execPath,
    ['scripts/check-sdd.mjs', '--circuit-status', '--planned', 'README.md', '--json'], { encoding: 'utf8' });
  assert.equal(planned.status, 0);
  const plannedJson = JSON.parse(planned.stdout);
  assert.equal(plannedJson.total, 1, 'RED: --planned debe clasificar solo la ruta prevista');
  assert.equal(plannedJson.circuito, 'full', 'la frontera pending falla cerrada');
  assert.equal(plannedJson.configStatus, 'pending');

  const repo = mkdtempSync(join(tmpdir(), 'sdd-circuit-'));
  const outside = mkdtempSync(join(tmpdir(), 'sdd-circuit-out-'));
  try {
    mkdirSync(join(repo, '.sdd'), { recursive: true });
    mkdirSync(join(repo, 'docs', 'bitacora'), { recursive: true });
    mkdirSync(join(repo, 'src'), { recursive: true });
    writeFileSync(join(repo, 'docs', 'bitacora', 'DECISIONS.md'), '# DEC-017\n');
    writeFileSync(join(outside, 'Card.tsx'), 'export default 1;\n');
    symlinkSync(outside, join(repo, 'src', 'components'), process.platform === 'win32' ? 'junction' : 'dir');
    writeFileSync(join(repo, '.sdd', 'circuit.json'), JSON.stringify(approved));
    const junction = spawnSync(process.execPath, [resolve('scripts/check-sdd.mjs'), '--circuit-status',
      '--planned', 'src/components/Card.tsx', '--json'], { cwd: repo, encoding: 'utf8' });
    assert.equal(JSON.parse(junction.stdout).circuito, 'full', 'un junction en un ancestro falla cerrado');
  } finally {
    rmSync(repo, { recursive: true, force: true });
    rmSync(outside, { recursive: true, force: true });
  }
}

console.log('test-circuit: 61 comprobaciones correctas');
