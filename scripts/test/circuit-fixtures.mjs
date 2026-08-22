import { hashPropuesta } from '../lib/circuito.mjs';

export function approvedCircuitConfig({ lightFiles = [], compactPrefixes = [], deniedPrefixes = [], sensitiveSegments = ['scripts', 'auth', 'security'] } = {}) {
  const proposal = {
    light: { allowedFiles: lightFiles },
    compact: { allowedPrefixes: compactPrefixes },
    deniedPrefixes,
    executableExtensions: ['.js', '.mjs', '.ts', '.tsx'],
    sensitiveSegments,
    limits: { modules: 1, criteria: 3, tasks: 3, intentBytes: 12288, auditWindow: 20 },
    quota: 0.4,
  };
  const base = { schemaVersion: 1, grammar: 'portable-path-v1', detectorVersion: 1, proposal };
  return {
    ...base,
    status: 'approved',
    proposalHash: hashPropuesta(base),
    approval: { approvedBy: 'Test humano', approvedAt: '2026-08-22T10:00:00.000Z', decisionRef: 'DEC-TEST' },
    activationCommit: '1'.repeat(40),
  };
}
