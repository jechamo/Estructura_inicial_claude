#!/usr/bin/env node
/**
 * Operaciones deterministas del proyecto instalado.
 *
 *   node scripts/sdd-project.mjs detect [--json]
 *   node scripts/sdd-project.mjs configure --accept-detected [--dry-run]
 *   node scripts/sdd-project.mjs run [--ci]
 *   node scripts/sdd-project.mjs status [--json]
 *
 * Detectar no equivale a aprobar: `detect` nunca escribe. `configure` requiere la bandera
 * explícita y conserva cualquier comando ya definido por el proyecto.
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync, cpSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const argv = process.argv.slice(2);
const comando = argv.find((a) => !a.startsWith('-')) || 'status';
const indiceComando = argv.indexOf(comando);
const operando = argv.slice(indiceComando + 1).find((a) => !a.startsWith('-')) || null;
const JSON_OUT = argv.includes('--json');
const DRY = argv.includes('--dry-run');
const CHECKS_PATH = join(ROOT, '.sdd', 'checks.json');

const leer = (ruta) => (existsSync(ruta) ? readFileSync(ruta, 'utf8') : null);

function packageManager() {
  if (existsSync(join(ROOT, 'pnpm-lock.yaml'))) return 'pnpm';
  if (existsSync(join(ROOT, 'yarn.lock'))) return 'yarn';
  return 'npm';
}

function detectar() {
  const stacks = [];
  const suggestions = {};
  const evidence = {};

  const pkgText = leer(join(ROOT, 'package.json'));
  if (pkgText !== null) {
    stacks.push('node');
    evidence.node = ['package.json'];
    try {
      const pkg = JSON.parse(pkgText);
      const gestor = packageManager();
      for (const id of ['lint', 'test', 'typecheck', 'build']) {
        if (pkg.scripts?.[id]) suggestions[id] = { command: `${gestor} run ${id}`, required: true, detectedFrom: `package.json#scripts.${id}` };
      }
    } catch (error) {
      evidence.node.push(`package.json inválido: ${error.message}`);
    }
  }

  const pythonFiles = ['pyproject.toml', 'setup.cfg', 'requirements.txt'].filter((f) => existsSync(join(ROOT, f)));
  if (pythonFiles.length) {
    stacks.push('python');
    evidence.python = pythonFiles;
    const config = pythonFiles.map((f) => leer(join(ROOT, f)) || '').join('\n');
    if (/\bpytest\b/i.test(config)) suggestions['test:python'] = { command: 'python -m pytest', required: true, detectedFrom: pythonFiles.join(', ') };
    if (/\bruff\b/i.test(config)) suggestions['lint:python'] = { command: 'python -m ruff check .', required: true, detectedFrom: pythonFiles.join(', ') };
    if (/\bmypy\b/i.test(config)) suggestions['typecheck:python'] = { command: 'python -m mypy .', required: true, detectedFrom: pythonFiles.join(', ') };
  }

  if (existsSync(join(ROOT, 'Cargo.toml'))) {
    stacks.push('rust');
    evidence.rust = ['Cargo.toml'];
    suggestions['test:rust'] = { command: 'cargo test', required: true, detectedFrom: 'Cargo.toml' };
  }
  if (existsSync(join(ROOT, 'go.mod'))) {
    stacks.push('go');
    evidence.go = ['go.mod'];
    suggestions['test:go'] = { command: 'go test ./...', required: true, detectedFrom: 'go.mod' };
  }
  if (existsSync(join(ROOT, 'pom.xml'))) {
    stacks.push('java-maven');
    evidence['java-maven'] = ['pom.xml'];
    suggestions['test:java'] = { command: 'mvn test', required: true, detectedFrom: 'pom.xml' };
  }
  if (existsSync(join(ROOT, 'gradlew')) || existsSync(join(ROOT, 'gradlew.bat'))) {
    stacks.push('java-gradle');
    evidence['java-gradle'] = [existsSync(join(ROOT, 'gradlew')) ? 'gradlew' : 'gradlew.bat'];
    suggestions['test:java'] = { command: process.platform === 'win32' ? 'gradlew.bat test' : './gradlew test', required: true, detectedFrom: evidence['java-gradle'][0] };
  }

  return { stacks, suggestions, evidence, writes: false };
}

function cargarChecks() {
  const contenido = leer(CHECKS_PATH);
  if (contenido === null) return { version: 1, checks: {}, unconfigured: ['lint', 'test', 'typecheck', 'build', 'mutation'] };
  try { return JSON.parse(contenido); }
  catch (error) { throw new Error(`.sdd/checks.json no es JSON válido: ${error.message}`); }
}

function imprimir(valor) {
  if (JSON_OUT) console.log(JSON.stringify(valor));
  else console.log(JSON.stringify(valor, null, 2));
}

function nombres(dir, filtro = () => true) {
  try {
    return readdirSync(join(ROOT, dir), { withFileTypes: true }).filter(filtro).map((x) => x.name).sort();
  } catch { return []; }
}

function inventario() {
  const config = cargarChecks();
  return {
    agents: nombres('.claude/agents', (x) => x.isFile() && x.name.endsWith('.md')).length,
    skills: nombres('.agents/skills', (x) => x.isDirectory() && !x.name.startsWith('_')).length,
    specs: nombres('docs/specs', (x) => x.isDirectory() && !x.name.startsWith('_')),
    adrs: nombres('docs/architecture/adr', (x) => x.isFile() && /^ADR-\d{4}-/.test(x.name)),
    checks: Object.keys(config.checks || {}).sort(),
    unconfigured: config.unconfigured || [],
    stacks: detectar().stacks,
  };
}

function slugSeguro(valor) {
  const slug = String(valor || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  if (!slug) throw new Error('Falta un slug válido. Ejemplo: new-spec checkout-invitado');
  return slug;
}

function siguienteNumero(nombresExistentes, patron) {
  const numeros = nombresExistentes.map((x) => Number((x.match(patron) || [])[1])).filter(Number.isFinite);
  return String((numeros.length ? Math.max(...numeros) : 0) + 1).padStart(3, '0');
}

function nuevaSpec() {
  const slug = slugSeguro(operando);
  const base = nombres('docs/specs', (x) => x.isDirectory());
  const numero = siguienteNumero(base, /^(\d{3})-/);
  const nombre = `${numero}-${slug}`;
  const origen = join(ROOT, 'docs/specs/_TEMPLATE');
  const destino = join(ROOT, 'docs/specs', nombre);
  if (!existsSync(origen)) throw new Error('No existe docs/specs/_TEMPLATE');
  if (existsSync(destino)) throw new Error(`La spec ya existe: docs/specs/${nombre}`);
  if (!DRY) {
    mkdirSync(destino, { recursive: false });
    for (const fichero of ['spec.md', 'clarifications.md']) {
      const fuente = join(origen, fichero);
      if (existsSync(fuente)) cpSync(fuente, join(destino, fichero), { errorOnExist: true });
    }
  }
  imprimir({ created: !DRY, dryRun: DRY, spec: nombre, path: `docs/specs/${nombre}` });
}

function nuevoAdr() {
  const slug = slugSeguro(operando);
  const base = nombres('docs/architecture/adr', (x) => x.isFile());
  const numero = siguienteNumero(base, /^ADR-(\d{4})-/).padStart(4, '0');
  const ruta = `docs/architecture/adr/ADR-${numero}-${slug}.md`;
  const destino = join(ROOT, ruta);
  if (existsSync(destino)) throw new Error(`El ADR ya existe: ${ruta}`);
  const plantilla = leer(join(ROOT, 'docs/architecture/adr/_TEMPLATE.md'));
  if (plantilla === null) throw new Error('No existe docs/architecture/adr/_TEMPLATE.md');
  const titulo = slug.split('-').map((x) => x[0].toUpperCase() + x.slice(1)).join(' ');
  const contenido = plantilla
    .replace(/^# ADR-NNNN — <Título de la decisión>/m, `# ADR-${numero} — ${titulo}`)
    .replace(/^- Fecha: AAAA-MM-DD$/m, `- Fecha: ${new Date().toISOString().slice(0, 10)}`);
  if (!DRY) {
    mkdirSync(dirname(destino), { recursive: true });
    writeFileSync(destino, contenido, 'utf8');
  }
  imprimir({ created: !DRY, dryRun: DRY, adr: `ADR-${numero}`, path: ruta });
}

function verificar() {
  const argumentos = [join(ROOT, 'scripts/check-sdd.mjs')];
  if (argv.includes('--strict')) argumentos.push('--strict');
  const specIndex = argv.indexOf('--spec');
  if (specIndex >= 0 && argv[specIndex + 1]) argumentos.push('--spec', argv[specIndex + 1]);
  const resultado = spawnSync(process.execPath, argumentos, { cwd: ROOT, stdio: 'inherit' });
  process.exitCode = resultado.status ?? 1;
}

function configurar() {
  if (!argv.includes('--accept-detected'))
    throw new Error('configure no toma decisiones implícitas: usa --accept-detected después de revisar `detect`.');
  const deteccion = detectar();
  const actual = cargarChecks();
  const anadidos = [];
  for (const [id, check] of Object.entries(deteccion.suggestions)) {
    if (actual.checks?.[id]) continue;
    actual.checks ||= {};
    actual.checks[id] = check;
    anadidos.push(id);
  }
  const configuradas = new Set(Object.keys(actual.checks || {}).map((x) => x.split(':')[0]));
  actual.unconfigured = (actual.unconfigured || []).filter((id) => !configuradas.has(id));
  if (!DRY) {
    mkdirSync(dirname(CHECKS_PATH), { recursive: true });
    writeFileSync(CHECKS_PATH, `${JSON.stringify(actual, null, 2)}\n`, 'utf8');
  }
  imprimir({ dryRun: DRY, added: anadidos, stacks: deteccion.stacks, checks: actual });
}

function ejecutarChecks() {
  const config = cargarChecks();
  const resultados = [];
  let fallo = false;
  for (const [id, check] of Object.entries(config.checks || {})) {
    if (!check?.command || check.enabled === false) continue;
    const inicio = Date.now();
    const resultado = spawnSync(check.command, { cwd: ROOT, shell: true, encoding: 'utf8', stdio: 'inherit' });
    resultados.push({ id, command: check.command, status: resultado.status, durationMs: Date.now() - inicio });
    if (resultado.status !== 0 && check.required !== false) fallo = true;
  }
  if (!JSON_OUT) {
    console.log(`\n${resultados.length} check(s) ejecutado(s): ${fallo ? 'FAIL' : 'PASS'}`);
    for (const r of resultados) console.log(`  ${r.status === 0 ? '✓' : '✗'} ${r.id} — ${r.command}`);
  } else console.log(JSON.stringify({ ok: !fallo, results: resultados }));
  if (fallo) process.exitCode = 1;
}

try {
  if (comando === 'detect') imprimir(detectar());
  else if (comando === 'inventory') imprimir(inventario());
  else if (comando === 'new-spec') nuevaSpec();
  else if (comando === 'new-adr') nuevoAdr();
  else if (comando === 'verify') verificar();
  else if (comando === 'configure') configurar();
  else if (comando === 'run') ejecutarChecks();
  else if (comando === 'status') imprimir({ detection: detectar(), checks: cargarChecks() });
  else throw new Error(`Comando desconocido: ${comando}`);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
