#!/usr/bin/env node
/**
 * Benchmark reproducible de la spec 017.
 *
 * No estima tokens internos del modelo: la API de subagentes no los expone, y la spec 011 ya dejó
 * escrito `executor_model: not-exposed-by-collaboration-api`. Mide un proxy **exacto y auditable**:
 * los bytes de contexto que cada fase carga de verdad —política, router, perfil de agente, skill y
 * artefactos del expediente— y el **número de intervenciones** de agente, que es lo que factura un
 * proveedor por peticiones.
 *
 * La línea base se lee del propio repositorio con `git show <ref>:<ruta>`, así que cualquiera puede
 * recalcularla. Bytes/4 se ofrece como orden de magnitud en tokens y se etiqueta como proxy.
 *
 *   node docs/quality/benchmarks/017/run-benchmark.mjs [--json]
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../../../..');
const BASE = process.env.SDD_BENCH_BASE || '9d3e69c';
const JSON_OUT = process.argv.includes('--json');

const enBase = (ruta) => {
  const r = spawnSync('git', ['show', `${BASE}:${ruta}`], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return r.status === 0 ? r.stdout : null;
};
const ahora = (ruta) => (existsSync(join(ROOT, ruta)) ? readFileSync(join(ROOT, ruta), 'utf8') : null);
const bytes = (t) => (t === null ? 0 : Buffer.byteLength(t, 'utf8'));

const { recortar } = await import(join(ROOT, 'scripts/lib/contexto.mjs'));

/** Lo que toda fase carga sí o sí, en ambos mundos: router y perfil del agente activo. */
const FIJOS = ['AGENTS.md', 'CLAUDE.md'];

const POLITICA = 'docs/sdd/OPERATING-MODEL.md';

/**
 * Escenarios. Las fases son las que el circuito recorre de verdad en cada nivel, y el `expediente`
 * son los artefactos que las fases posteriores releen.
 */
const ESCENARIOS = [
  {
    id: 'errata-documental', nivel: 'light',
    fases: ['light'], intervenciones: { antes: 2, despues: 1 },
    expediente: [], sensible: false,
  },
  {
    id: 'carrusel-y-acordeon', nivel: 'compact',
    // El caso real que motivó la spec: selección de un carrusel y plegar/desplegar secciones.
    fases: ['specify', 'clarify', 'plan', 'tasks', 'implement', 'verify', 'ship'],
    fasesDespues: ['compact', 'implement', 'verify'],
    intervenciones: { antes: 8, despues: 3 },
    expediente: ['spec.md', 'plan.md', 'tasks.md', 'test-plan.md', 'evidence.md'],
    expedienteDespues: ['change.md'],
    sensible: false,
  },
  {
    id: 'dependencia-nueva', nivel: 'full',
    fases: ['specify', 'clarify', 'plan', 'tasks', 'implement', 'verify', 'ship'],
    intervenciones: { antes: 8, despues: 8 },
    expediente: ['spec.md', 'plan.md', 'tasks.md', 'test-plan.md', 'evidence.md'], sensible: false,
  },
  {
    id: 'cambio-de-autorizacion', nivel: 'full',
    fases: ['specify', 'clarify', 'plan', 'tasks', 'implement', 'verify', 'ship'],
    intervenciones: { antes: 8, despues: 8 },
    expediente: ['spec.md', 'plan.md', 'tasks.md', 'test-plan.md', 'evidence.md'], sensible: true,
  },
  {
    id: 'feature-de-dominio', nivel: 'full',
    fases: ['specify', 'clarify', 'design', 'plan', 'tasks', 'implement', 'verify', 'ship'],
    intervenciones: { antes: 9, despues: 9 },
    expediente: ['spec.md', 'plan.md', 'tasks.md', 'test-plan.md', 'evidence.md'], sensible: false,
  },
];

/** Tamaño del expediente que una fase posterior relee. Se toma la spec 016 como caso real. */
const EXPEDIENTE_BASE = 'docs/specs/016-cobertura-ssrf-egress';
const tamExpediente = (ficheros) =>
  ficheros.reduce((n, f) => n + bytes(ahora(`${EXPEDIENTE_BASE}/${f}`)), 0);

const fijos = (leer) => FIJOS.reduce((n, f) => n + bytes(leer(f)), 0);

function medir(esc) {
  const politicaAntes = enBase(POLITICA);
  const politicaAhora = ahora(POLITICA);

  // ANTES: cada fase releía la política entera, más router y perfiles, más el expediente completo.
  const fijosAntes = fijos(enBase);
  const antes = esc.fases.reduce((n) => n + bytes(politicaAntes) + fijosAntes, 0)
    + tamExpediente(esc.expediente) * Math.max(0, esc.fases.length - 1);

  // DESPUÉS: cada fase pide solo su sección, y el nivel compacto recorre menos fases con un único
  // documento en vez de cinco.
  const fasesDespues = esc.fasesDespues || esc.fases;
  const expedienteDespues = esc.expedienteDespues || esc.expediente;
  const fijosAhora = fijos(ahora);
  const despues = fasesDespues.reduce((n, fase) => {
    let recorte;
    try {
      recorte = recortar(politicaAhora, fase, { sensible: esc.sensible, usabilidad: false });
    } catch {
      recorte = politicaAhora; // si una fase no está mapeada, se cuenta el peor caso
    }
    return n + bytes(recorte) + fijosAhora;
  }, 0)
    + tamExpediente(expedienteDespues) * Math.max(0, fasesDespues.length - 1);

  const reduccion = antes ? 1 - despues / antes : 0;
  return {
    id: esc.id,
    nivel: esc.nivel,
    fases: { antes: esc.fases.length, despues: fasesDespues.length },
    intervenciones: esc.intervenciones,
    contexto: { antes, despues },
    tokensProxy: { antes: Math.round(antes / 4), despues: Math.round(despues / 4) },
    reduccion: Number(reduccion.toFixed(3)),
  };
}

const mediana = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

const resultados = ESCENARIOS.map(medir);
const compactos = resultados.filter((r) => r.nivel === 'compact');
const completos = resultados.filter((r) => r.nivel === 'full');

const umbrales = {
  compact: { objetivo: 0.70, real: mediana(compactos.map((r) => r.reduccion)), intervencionesMax: 3,
    intervencionesReal: Math.max(...compactos.map((r) => r.intervenciones.despues)) },
  full: { objetivo: 0.20, real: mediana(completos.map((r) => r.reduccion)) },
};
umbrales.compact.cumple = umbrales.compact.real >= umbrales.compact.objetivo &&
  umbrales.compact.intervencionesReal <= umbrales.compact.intervencionesMax;
umbrales.full.cumple = umbrales.full.real >= umbrales.full.objetivo;

const informe = {
  schemaVersion: 1,
  spec: '017-circuito-proporcional-contexto',
  baseline: BASE,
  medida: 'bytes de contexto realmente activado e intervenciones de agente',
  aviso: 'Proxy auditable. NO es el consumo real de Copilot ni de Cursor: sus API no lo exponen. '
    + 'tokensProxy es bytes/4, un orden de magnitud, no una cuota.',
  generado: new Date().toISOString(),
  escenarios: resultados,
  umbrales,
  veredicto: umbrales.compact.cumple && umbrales.full.cumple ? 'INTEGRAR' : 'DESCARTAR',
};

writeFileSync(join(HERE, 'benchmark-017.json'), `${JSON.stringify(informe, null, 2)}\n`, 'utf8');

if (JSON_OUT) console.log(JSON.stringify(informe));
else {
  console.log(`Benchmark 017 · línea base ${BASE}\n`);
  console.log('escenario                nivel     contexto antes → después      reducción  interv.');
  for (const r of resultados) {
    console.log(
      `  ${r.id.padEnd(22)} ${r.nivel.padEnd(8)} ${String(r.contexto.antes).padStart(8)} → ${String(r.contexto.despues).padStart(8)} B  ` +
      `${String(Math.round(r.reduccion * 100)).padStart(6)} %  ${r.intervenciones.antes}→${r.intervenciones.despues}`,
    );
  }
  console.log(`\ncompact  mediana ${Math.round(umbrales.compact.real * 100)} % (objetivo ≥70 %) · ` +
    `${umbrales.compact.intervencionesReal} intervenciones (máx 3) → ${umbrales.compact.cumple ? 'CUMPLE' : 'NO CUMPLE'}`);
  console.log(`full     mediana ${Math.round(umbrales.full.real * 100)} % (objetivo ≥20 %) → ${umbrales.full.cumple ? 'CUMPLE' : 'NO CUMPLE'}`);
  console.log(`\nVeredicto: ${informe.veredicto}`);
  console.log(`\n${informe.aviso}`);
}
process.exitCode = informe.veredicto === 'INTEGRAR' ? 0 : 1;
