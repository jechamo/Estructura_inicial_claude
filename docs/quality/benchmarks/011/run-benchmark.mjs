#!/usr/bin/env node
/**
 * Benchmark reproducible de la spec 011.
 *
 * No pretende estimar tokens internos del modelo: la API de subagentes no los expone. Mide un
 * proxy exacto y auditable sobre bytes de instrucciones activadas + bytes del resultado. Además
 * ejecuta los caminos mecánicos positivos en fixtures aisladas y conserva argv/stdout/stderr/exit.
 */
import { spawnSync } from 'node:child_process';
import {
  cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync,
} from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, relative, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../../../..');
const BASELINE_REF = 'v0.6.0';
const temp = mkdtempSync(join(tmpdir(), 'sdd-benchmark-011-'));
const baselineRoot = join(temp, 'baseline-v0.6.0');
const evidence = new Map();

const evals = [
  {
    id: 1, name: 'status',
    prompt: 'Explica el estado del proyecto, specs abiertas, tareas y siguiente paso sin modificar nada.',
    expected_output: 'Snapshot correcto, ambigüedad honesta y siguiente skill sin inventar.',
    expectations: [
      'No modifica el repositorio al consultar el estado.',
      'Distingue cero, una o varias specs abiertas sin elegir de forma arbitraria.',
      'Expone tareas y siguiente paso a partir de hechos verificables.',
    ],
    skills: ['sdd-status'],
  },
  {
    id: 2, name: 'adr',
    prompt: 'Prepara el esqueleto para documentar la decisión de usar un registro opt-in de generadores deterministas, sin shell y vacío por defecto; no apruebes todavía la opción.',
    expected_output: 'ADR numerado desde la plantilla canónica, con contenido decisorio pendiente.',
    expectations: [
      'Usa la plantilla MADR canónica y calcula un ID sin sobrescribir.',
      'Mantiene contexto, decisión y consecuencias pendientes.',
      'No aprueba ni decide la opción por la persona.',
    ],
    skills: ['adr'],
  },
  {
    id: 3, name: 'spec-design',
    prompt: 'Prepara una spec nueva para recuperación de contraseña y su fase de diseño sin rellenar requisitos ni UI.',
    expected_output: 'Scaffolds canónicos sin overwrite y sin decisiones inventadas.',
    expectations: [
      'Crea los scaffolds canónicos en una fixture aprobada sin sobrescribir.',
      'Mantiene requisitos, criterios y UI como decisiones pendientes.',
      'Respeta los gates de producto, spec y diseño.',
    ],
    skills: ['sdd-specify', 'sdd-design'],
  },
  {
    id: 4, name: 'plan-tasks',
    prompt: 'Con una spec aprobada, prepara plan y tareas y detecta huecos de trazabilidad sin decidir arquitectura ni tareas concretas.',
    expected_output: 'Scaffold de plan/tasks y trazabilidad; decisiones quedan humanas.',
    expectations: [
      'Crea plan y tareas desde plantillas canónicas en una fixture aprobada.',
      'Mantiene arquitectura y descomposición semántica pendientes.',
      'Expone huecos de trazabilidad sin inventar IDs ni tareas.',
    ],
    skills: ['sdd-plan', 'sdd-tasks'],
  },
  {
    id: 5, name: 'docs-verify',
    prompt: 'Audita documentación y prepara la verificación de una spec sin escribir ni declarar verde lo no ejecutado.',
    expected_output: 'Gates y trazabilidad consumidos, auditoría read-only y NO EJECUTADO honesto.',
    expectations: [
      'No modifica documentos durante audit/verify.',
      'Conserva exit code, avisos y problemas del gate real.',
      'Nunca convierte un control no ejecutado en PASS.',
    ],
    skills: ['docs-sync', 'sdd-verify'],
  },
];

function sha(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function paths(root, dir = root) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === '.git') return [];
    const full = join(dir, entry.name);
    return entry.isDirectory() ? paths(root, full) : [relative(root, full).replaceAll('\\', '/')];
  }).sort();
}

function treeSnapshot(root) {
  return Object.fromEntries(paths(root).map((path) => {
    const bytes = readFileSync(join(root, path));
    return [path, `${bytes.length}:${sha(bytes)}`];
  }));
}

function run(label, program, args, cwd, record = true) {
  const before = treeSnapshot(cwd);
  const start = Date.now();
  const result = spawnSync(program, args, { cwd, encoding: 'utf8', shell: false, timeout: 120_000 });
  const after = treeSnapshot(cwd);
  const item = {
    label,
    program,
    args,
    cwd: cwd === ROOT ? '<repo>' : '<fixture>',
    exitCode: result.status,
    signal: result.signal,
    durationMs: Date.now() - start,
    stdout: result.stdout || '',
    stderr: result.stderr || '',
    changedFiles: {
      created: Object.keys(after).filter((file) => !(file in before)),
      modified: Object.keys(after).filter((file) => file in before && after[file] !== before[file]),
      deleted: Object.keys(before).filter((file) => !(file in after)),
    },
  };
  if (record) return item;
  if (result.status !== 0) throw new Error(`${label} falló (${result.status}): ${item.stderr || item.stdout}`);
  return item;
}

function noMutations(command) {
  return ['created', 'modified', 'deleted'].every((kind) => command.changedFiles?.[kind]?.length === 0);
}

function noDurableMutations(command) {
  return ['created', 'modified', 'deleted'].every((kind) =>
    (command.changedFiles?.[kind] || []).every((path) => path.startsWith('.sdd/state/')));
}

function outputJson(command) {
  const lines = String(command.stdout || '').trim().split(/\r?\n/).filter(Boolean);
  try { return JSON.parse(lines.at(-1) || '{}'); } catch { return null; }
}

function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function read(path) {
  return readFileSync(path, 'utf8');
}

function approveProduct(project) {
  const path = join(project, '.sdd/installed.json');
  const installed = JSON.parse(read(path));
  installed.product = { ...(installed.product || {}), status: 'approved', approvedBy: 'Fixture benchmark 011' };
  writeJson(path, installed);
}

function replaceState(path, value) {
  const content = read(path);
  const next = content.replace(/^(\|\s*\*\*Estado\*\*\s*\|\s*)[^\n]+$/m, `$1${value} |`);
  if (next === content) throw new Error(`No se encontró Estado en ${path}`);
  writeFileSync(path, next, 'utf8');
}

function approveLastGate(path) {
  const content = read(path);
  const marker = '| **Estado** |';
  const start = content.lastIndexOf(marker);
  if (start < 0) throw new Error(`No se encontró el gate final en ${path}`);
  const end = content.indexOf('\n', start);
  writeFileSync(path, `${content.slice(0, start)}${marker} \`approved\` |${content.slice(end)}`, 'utf8');
}

function instantiateTemplate(source, target, replacements) {
  if (existsSync(target)) throw new Error(`La fixture se niega a sobrescribir ${target}`);
  let content = read(source);
  for (const [from, to] of replacements) content = content.replaceAll(from, to);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content, 'utf8');
}

function installFixture(sourceRoot, name) {
  const project = join(temp, name);
  mkdirSync(project, { recursive: true });
  const command = run('install greenfield', process.execPath,
    [join(sourceRoot, 'scripts/install.mjs'), 'init', project, '--mode', 'greenfield'], project);
  if (command.exitCode !== 0) throw new Error(command.stderr || command.stdout);
  approveProduct(project);
  return { project, command };
}

function prepareCandidate() {
  const zero = installFixture(ROOT, 'candidate-zero');
  const statusZero = run('status zero specs', process.execPath,
    ['scripts/sdd-project.mjs', 'status', '--json'], zero.project);
  const fixture = installFixture(ROOT, 'candidate-project');
  const commands = [fixture.command];
  commands.push(run('new-spec positiva', process.execPath,
    ['scripts/sdd-project.mjs', 'new-spec', 'recuperacion-contrasena', '--json'], fixture.project));
  const specDir = join(fixture.project, 'docs/specs/001-recuperacion-contrasena');
  replaceState(join(specDir, 'spec.md'), 'aprobada');
  commands.push(run('scaffold design positivo', process.execPath,
    ['scripts/sdd-project.mjs', 'scaffold', '--spec', '001', '--phase', 'design', '--json'], fixture.project));
  const designHash = sha(readFileSync(join(specDir, 'design.md')));
  commands.push(run('scaffold design rechaza overwrite', process.execPath,
    ['scripts/sdd-project.mjs', 'scaffold', '--spec', '001', '--phase', 'design', '--json'], fixture.project));
  if (commands.at(-1).exitCode === 0 || sha(readFileSync(join(specDir, 'design.md'))) !== designHash)
    throw new Error('scaffold design sobrescribió contenido');
  approveLastGate(join(specDir, 'design.md'));
  commands.push(run('scaffold plan positivo', process.execPath,
    ['scripts/sdd-project.mjs', 'scaffold', '--spec', '001', '--phase', 'plan', '--json'], fixture.project));
  approveLastGate(join(specDir, 'plan.md'));
  commands.push(run('scaffold tasks positivo', process.execPath,
    ['scripts/sdd-project.mjs', 'scaffold', '--spec', '001', '--phase', 'tasks', '--json'], fixture.project));
  commands.push(run('trace-status positivo', process.execPath,
    ['scripts/sdd-project.mjs', 'trace-status', '--spec', '001', '--json'], fixture.project));
  commands.push(statusZero);
  commands.push(run('status one spec', process.execPath,
    ['scripts/sdd-project.mjs', 'status', '--json'], fixture.project));
  commands.push(run('new-spec para ambigüedad', process.execPath,
    ['scripts/sdd-project.mjs', 'new-spec', 'segunda-activa', '--json'], fixture.project));
  const secondDir = join(fixture.project, 'docs/specs/002-segunda-activa');
  cpSync(join(specDir, 'tasks.md'), join(secondDir, 'tasks.md'));
  commands.push(run('status multiple specs', process.execPath,
    ['scripts/sdd-project.mjs', 'status', '--json'], fixture.project));
  commands.push(run('new-adr dry-run', process.execPath,
    ['scripts/sdd-project.mjs', 'new-adr', 'registro-opt-in-generadores', '--dry-run', '--json'], fixture.project));
  commands.push(run('check-sdd JSON', process.execPath,
    ['scripts/check-sdd.mjs', '--json', '--spec', '001'], fixture.project));
  commands.push(run('slow gates no ejecutados', process.execPath,
    ['scripts/sdd-project.mjs', 'run', '--slow', '--json'], fixture.project));
  return { project: fixture.project, specDir, commands };
}

function prepareBaseline() {
  const clone = run('clone baseline', 'git', [
    '-c', 'core.excludesFile=', '-c', `safe.directory=${ROOT}`, '-c', `safe.directory=${join(ROOT, '.git')}`,
    'clone', '--quiet', '--no-hardlinks', '--branch', BASELINE_REF, ROOT, baselineRoot,
  ], temp, false);
  if (clone.exitCode !== 0) throw new Error(clone.stderr || clone.stdout);
  const fixture = installFixture(baselineRoot, 'baseline-project');
  const commands = [fixture.command];
  commands.push(run('new-spec baseline', process.execPath,
    ['scripts/sdd-project.mjs', 'new-spec', 'recuperacion-contrasena', '--json'], fixture.project));
  const specDir = join(fixture.project, 'docs/specs/001-recuperacion-contrasena');
  replaceState(join(specDir, 'spec.md'), 'aprobada');
  const replacements = [['NNN', '001'], ['slug', 'recuperacion-contrasena'], ['YYYY-MM-DD', '2026-08-16'], ['<Título de la funcionalidad>', 'Recuperación contraseña']];
  instantiateTemplate(join(fixture.project, 'docs/specs/_TEMPLATE/design.md'), join(specDir, 'design.md'), replacements);
  approveLastGate(join(specDir, 'design.md'));
  instantiateTemplate(join(fixture.project, 'docs/specs/_TEMPLATE/plan.md'), join(specDir, 'plan.md'), replacements);
  for (const file of ['research.md', 'data-model.md'])
    instantiateTemplate(join(fixture.project, `docs/specs/_TEMPLATE/${file}`), join(specDir, file), replacements);
  mkdirSync(join(specDir, 'contracts'), { recursive: true });
  writeFileSync(join(specDir, 'contracts/.gitkeep'), '', 'utf8');
  approveLastGate(join(specDir, 'plan.md'));
  for (const file of ['tasks.md', 'test-plan.md'])
    instantiateTemplate(join(fixture.project, `docs/specs/_TEMPLATE/${file}`), join(specDir, file), replacements);
  const manualStatus = [
    "const fs=require('node:fs');",
    "const dirs=fs.readdirSync('docs/specs').filter(x=>/^\\d{3}-/.test(x));",
    "const active=dirs.filter(d=>{const p='docs/specs/'+d+'/tasks.md';return fs.existsSync(p)&&/- (?:\\*\\*)?Estado(?:\\*\\*)?: (?:pendiente|en curso)/i.test(fs.readFileSync(p,'utf8'))});",
    "process.stdout.write(JSON.stringify({activeCount:active.length,active,ambiguous:active.length>1,manualInspection:true})+'\\n');",
  ].join('');
  const zero = installFixture(baselineRoot, 'baseline-zero');
  commands.push(run('status baseline zero specs', process.execPath, ['-e', manualStatus], zero.project));
  commands.push(run('status baseline one spec', process.execPath, ['-e', manualStatus], fixture.project));
  cpSync(specDir, join(fixture.project, 'docs/specs/002-segunda-activa'), { recursive: true });
  commands.push(run('status baseline multiple specs', process.execPath, ['-e', manualStatus], fixture.project));
  commands.push(run('new-adr baseline dry-run', process.execPath,
    ['scripts/sdd-project.mjs', 'new-adr', 'registro-opt-in-generadores', '--dry-run', '--json'], fixture.project));
  commands.push(run('check-sdd baseline', process.execPath,
    ['scripts/check-sdd.mjs'], fixture.project));
  commands.push(run('slow gates baseline no ejecutados', process.execPath,
    ['scripts/sdd-project.mjs', 'run', '--slow', '--json'], fixture.project));
  return {
    project: fixture.project,
    specDir,
    commands,
    fixtureActions: [
      'Instanciar design.md desde _TEMPLATE (operación manual pedida por la skill v0.6.0).',
      'Instanciar plan/research/data-model/contracts desde _TEMPLATE.',
      'Instanciar tasks/test-plan desde _TEMPLATE; la inspección de trazabilidad era manual.',
    ],
  };
}

function commandSubset(configuration, evalId, fixture) {
  const labels = configuration === 'candidate'
    ? {
      1: ['status snapshot'], 2: ['new-adr dry-run'],
      3: ['new-spec positiva', 'scaffold design positivo', 'scaffold design rechaza overwrite'],
      4: ['scaffold plan positivo', 'scaffold tasks positivo', 'trace-status positivo'],
      5: ['check-sdd JSON', 'slow gates no ejecutados'],
    }
    : {
      1: ['status baseline zero specs', 'status baseline one spec', 'status baseline multiple specs'],
      2: ['new-adr baseline dry-run'], 3: ['new-spec baseline'],
      4: [], 5: ['check-sdd baseline', 'slow gates baseline no ejecutados'],
    };
  if (configuration === 'candidate') labels[1] = ['status zero specs', 'status one spec', 'status multiple specs'];
  return fixture.commands.filter((command) => labels[evalId].includes(command.label));
}

function materialChecks(evaluation, configuration, execution) {
  const commands = execution.commands || [];
  const byLabel = (label) => commands.find((command) => command.label === label);
  const readOnly = commands.every(noMutations);
  if (evaluation.id === 1) {
    const snapshots = commands.map(outputJson);
    return [readOnly, snapshots.map((item) => item?.specs?.activeCount ?? item?.activeCount).join(',') === '0,1,2',
      snapshots[2]?.specs?.ambiguous === true || snapshots[2]?.ambiguous === true];
  }
  if (evaluation.id === 2) {
    const output = outputJson(commands[0]);
    return [commands[0]?.exitCode === 0 && readOnly, output?.created === false && /ADR-\d{4}/.test(output?.path || ''),
      !/approved|aprobada/i.test(commands[0]?.stdout || '')];
  }
  if (evaluation.id === 3) {
    const positive = configuration === 'with_skill'
      ? byLabel('scaffold design positivo')?.exitCode === 0 && byLabel('scaffold design rechaza overwrite')?.exitCode !== 0
      : execution.artifactChecks.design === true;
    return [positive, execution.artifactChecks.semanticPlaceholdersRemain === true,
      execution.artifactChecks.spec === true && execution.artifactChecks.design === true];
  }
  if (evaluation.id === 4) {
    const positive = configuration === 'with_skill'
      ? ['scaffold plan positivo', 'scaffold tasks positivo', 'trace-status positivo']
        .every((label) => byLabel(label)?.exitCode === 0)
      : execution.artifactChecks.plan === true && execution.artifactChecks.tasks === true;
    const trace = outputJson(byLabel('trace-status positivo') || { stdout: '{}' });
    return [positive, execution.artifactChecks.semanticPlaceholdersRemain === true,
      configuration === 'with_skill' ? trace?.schemaVersion === 1 && trace?.families : execution.fixtureActions.length > 0];
  }
  const check = commands.find((command) => /check-sdd/.test(command.label));
  const slow = commands.find((command) => /slow gates/.test(command.label));
  const checkJson = configuration === 'with_skill' ? outputJson(check) : null;
  const slowJson = outputJson(slow);
  return [commands.every(noDurableMutations), configuration === 'with_skill' ? check?.exitCode === 1 && checkJson?.ok === false : [0, 1].includes(check?.exitCode),
    slow?.exitCode === 0 && slowJson?.status === 'unconfigured' && !/: PASS/.test(slow?.stdout || '')];
}

function sourceBytes(configuration, skillNames) {
  const result = [];
  for (const skill of skillNames) {
    const path = `.agents/skills/${skill}/SKILL.md`;
    let bytes;
    if (configuration === 'candidate') bytes = readFileSync(join(ROOT, path));
    else {
      const shown = spawnSync('git', [
        '-c', 'core.excludesFile=', '-c', `safe.directory=${ROOT}`, '-c', `safe.directory=${join(ROOT, '.git')}`,
        'show', `${BASELINE_REF}:${path}`,
      ],
        { cwd: ROOT, encoding: null, shell: false });
      if (shown.status !== 0) throw new Error(`No se pudo leer ${BASELINE_REF}:${path}`);
      bytes = shown.stdout;
    }
    result.push({ path, ref: configuration === 'candidate' ? 'working-tree' : BASELINE_REF, bytes: bytes.length, sha256: sha(bytes) });
  }
  return result;
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

try {
  writeJson(join(HERE, 'evals.json'), { skill_name: 'sdd-deterministic-workflows', evals: evals.map(({ skills, ...item }) => item) });
  const candidate = prepareCandidate();
  const baseline = prepareBaseline();
  const caseResults = [];

  for (const evaluation of evals) {
    writeJson(join(HERE, `eval-${evaluation.id}`, 'eval_metadata.json'), {
      eval_id: evaluation.id,
      eval_name: evaluation.name,
      prompt: evaluation.prompt,
      metric: 'estimated_tokens_from_utf8_bytes',
      formula: 'ceil((skillSourceBytes + persistedOutputBytes) / 4)',
    });
    const perConfig = {};
    for (const configuration of ['without_skill', 'with_skill']) {
      const isCandidate = configuration === 'with_skill';
      const fixture = isCandidate ? candidate : baseline;
      const source = sourceBytes(isCandidate ? 'candidate' : 'baseline', evaluation.skills);
      const commands = commandSubset(isCandidate ? 'candidate' : 'baseline', evaluation.id, fixture);
      const runDir = join(HERE, `eval-${evaluation.id}`, configuration, 'run-1');
      const execution = {
        schemaVersion: 1,
        evaluation: evaluation.name,
        configuration: isCandidate ? 'candidate-011' : BASELINE_REF,
        prompt: evaluation.prompt,
        skillSources: source,
        commands,
        fixtureActions: isCandidate ? [] : (evaluation.id === 3 ? baseline.fixtureActions.slice(0, 1) : evaluation.id === 4 ? baseline.fixtureActions.slice(1) : []),
        artifactChecks: {
          spec: existsSync(join(fixture.specDir, 'spec.md')),
          design: [3, 4].includes(evaluation.id) ? existsSync(join(fixture.specDir, 'design.md')) : null,
          plan: evaluation.id === 4 ? existsSync(join(fixture.specDir, 'plan.md')) : null,
          tasks: evaluation.id === 4 ? existsSync(join(fixture.specDir, 'tasks.md')) : null,
          semanticPlaceholdersRemain: [3, 4].includes(evaluation.id)
            ? /<[^>]+>|pendiente|borrador/i.test(read(join(fixture.specDir, evaluation.id === 3 ? 'design.md' : 'tasks.md')))
            : null,
        },
      };
      const checks = materialChecks(evaluation, configuration, execution).map(Boolean);
      if (checks.length !== evaluation.expectations.length || checks.some((passed) => !passed))
        throw new Error(`Calidad funcional fallida: ${evaluation.name}/${configuration}`);
      writeJson(join(runDir, 'execution-evidence.json'), execution);
      const result = [
        '# Resultado verificable', '',
        `Configuración: ${execution.configuration}`,
        `Prompt: ${evaluation.prompt}`, '',
        ...evaluation.expectations.flatMap((expectation, index) => [
          `${index + 1}. ${checks[index] ? 'PASS' : 'FAIL'} — ${expectation}`,
          `   Evidencia: \`execution-evidence.json\` (comandos, stdout/stderr, exit code y artefactos).`,
        ]),
        '', 'No se atribuye ahorro a decisiones semánticas: permanecen pendientes.', '',
      ].join('\n');
      mkdirSync(join(runDir, 'outputs'), { recursive: true });
      writeFileSync(join(runDir, 'outputs/result.md'), result, 'utf8');
      writeFileSync(join(runDir, 'transcript.md'), [
        '# Transcripción reproducible', '',
        'La evidencia sin normalizar está en `execution-evidence.json`: conserva argv, cwd lógico,',
        'stdout, stderr, exit code, señal, duración y ficheros creados/modificados/eliminados.', '', result,
      ].join('\n'), 'utf8');
      const grading = {
        expectations: evaluation.expectations.map((text, index) => ({
          text, passed: checks[index],
          evidence: `outputs/result.md punto ${index + 1}; execution-evidence.json conserva la ejecución material.`,
        })),
        summary: {
          passed: checks.filter(Boolean).length,
          failed: checks.filter((passed) => !passed).length,
          total: evaluation.expectations.length,
          pass_rate: checks.filter(Boolean).length / evaluation.expectations.length,
        },
        execution_metrics: {
          total_tool_calls: commands.length,
          output_chars: result.length,
          errors_encountered: commands.filter((command) => command.exitCode !== 0 && !/rechaza overwrite|check-sdd/.test(command.label)).length,
        },
      };
      writeJson(join(runDir, 'grading.json'), grading);
      const outputBytes = statSync(join(runDir, 'outputs/result.md')).size;
      const skillBytes = source.reduce((total, item) => total + item.bytes, 0);
      const estimatedTokens = Math.ceil((skillBytes + outputBytes) / 4);
      writeJson(join(runDir, 'measurement.json'), {
        schemaVersion: 1,
        metric: 'estimated_tokens_from_utf8_bytes',
        formula: 'ceil((skillSourceBytes + persistedOutputBytes) / 4)',
        skillSourceBytes: skillBytes,
        persistedOutputBytes: outputBytes,
        estimatedTokens,
        actualModelTokensAvailable: false,
      });
      const durationMs = commands.reduce((total, command) => total + command.durationMs, 0);
      writeJson(join(runDir, 'timing.json'), {
        total_duration_seconds: durationMs / 1000,
        eligibleForAcceptance: false,
        total_tokens: estimatedTokens,
        tokenMetric: 'estimated_tokens_from_utf8_bytes',
      });
      writeJson(join(runDir, 'eval_metadata.json'), {
        eval_id: evaluation.id,
        eval_name: evaluation.name,
        configuration: execution.configuration,
        run_number: 1,
        prompt: evaluation.prompt,
      });
      perConfig[configuration] = { estimatedTokens, durationMs };
    }
    const reduction = Number((100 * (perConfig.without_skill.estimatedTokens - perConfig.with_skill.estimatedTokens) /
      perConfig.without_skill.estimatedTokens).toFixed(2));
    caseResults.push({
      id: evaluation.id,
      name: evaluation.name,
      baseline: `${perConfig.without_skill.estimatedTokens} tokens estimados`,
      candidate: `${perConfig.with_skill.estimatedTokens} tokens estimados`,
      qualityMaintained: true,
      tokenReductionPct: reduction,
      timeReductionPct: null,
      accepted: reduction >= 20,
    });
  }

  const benchmark = {
    schemaVersion: 1,
    baseline: BASELINE_REF,
    candidate: 'spec-011',
    measurement: {
      tokens: 'Proxy reproducible: ceil((bytes UTF-8 exactos de SKILL.md activadas + bytes exactos del outputs/result.md persistido) / 4).',
      time: 'Duración material registrada, no elegible: una sola ejecución local no permite comparación estable.',
      quality: 'Expectativas funcionales comunes; execution-evidence.json conserva procesos y artefactos reales.',
    },
    cases: caseResults,
    summary: {
      medianTokenReductionPct: median(caseResults.map((item) => item.tokenReductionPct)),
      medianTimeReductionPct: null,
      qualityPassRate: 1,
      fixedCost: 'No se automatizan lectura semántica, decisiones, clarificaciones, TDD, auditorías ni evidencia; ese coste sigue siendo necesario para mantener calidad.',
    },
  };
  writeJson(join(HERE, 'benchmark.json'), benchmark);
  process.stdout.write(`${JSON.stringify({ ok: true, cases: caseResults, summary: benchmark.summary }, null, 2)}\n`);
} finally {
  rmSync(temp, { recursive: true, force: true });
}
