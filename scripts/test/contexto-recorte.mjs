/**
 * Contrato del recorte de contexto por fase.
 *
 * Existe porque el modelo operativo son 42 KB y las instrucciones de los hosts pedían leerlo
 * entero en cualquier fase. Recortar es barato; recortar mal es caro y silencioso: un agente que
 * opera sin la regla cero, sin los gates o sin las prohibiciones no se da cuenta de que le falta
 * algo. Por eso el recortador falla cerrado y estas pruebas comprueban la ausencia, no solo la
 * presencia.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const MODELO = join(ROOT, 'docs/sdd/OPERATING-MODEL.md');
const leer = (ruta) => (existsSync(ruta) ? readFileSync(ruta, 'utf8') : null);

/** Carga el recortador. Devuelve null si aún no existe: eso es el rojo legítimo de T-017-01. */
async function cargar() {
  try {
    return await import('../lib/contexto.mjs');
  } catch {
    return null;
  }
}

/** Documento sintético mínimo con la forma de encabezados del modelo operativo. */
const FIXTURE = [
  '# Modelo',
  '', '## 0. Regla cero', 'cero invariante', '',
  '## 1. Identidad del proyecto', 'identidad', '',
  '## 2. Circuito SDD', 'circuito', '',
  '### 2.5 Estructura de una spec', 'estructura de spec', '',
  '### 2.6 El circuito ligero', 'circuito ligero', '',
  '## 3. Arquitectura', 'arquitectura', '',
  '## 4. Principios de diseño', 'principios', '',
  '## 5. Patrones de diseño', 'patrones', '',
  '## 6. TDD', 'tedede', '',
  '## 7. Gates de calidad', 'gates invariantes', '',
  '## 8. Seguridad', 'declara impacto', '',
  '### 8.1 Trazabilidad por fase', 'tablas largas de seguridad', '',
  '## 8 bis. Usabilidad', 'declara usabilidad', '',
  '### 8 bis.1 Trazabilidad por fase', 'tablas largas de usabilidad', '',
  '## 9. Bitácora', 'bitacora', '',
  '## 10. Ecosistema de agentes', 'ecosistema', '',
  '## 11. Convenciones de código', 'convenciones', '',
  '## 13. Qué NO hacer', 'prohibiciones invariantes', '',
].join('\n');

export async function pruebas(comprueba) {
  const mod = await cargar();

  const falta = (titulo) =>
    comprueba(titulo, 'sin-modulo', 'ok');

  if (!mod) {
    falta('recorta_solo_las_secciones_de_la_fase');
    falta('falla_cerrado_y_conserva_invariantes');
    falta('la_trazabilidad_de_seguridad_solo_llega_si_la_spec_es_sensible');
    falta('ninguna_superficie_exige_el_documento_completo');
    return;
  }

  const { recortar, MAPA_FASES, INVARIANTES } = mod;

  // ── recorta_solo_las_secciones_de_la_fase ──────────────────────────────────
  comprueba('recorta_solo_las_secciones_de_la_fase', (() => {
    const salida = recortar(FIXTURE, 'plan');
    const trae = (s) => salida.includes(s);
    // plan pide 3; y arrastra las invariantes 0, 7 y 13. No debe traer 1, 2 ni 8.1.
    return trae('arquitectura') && trae('cero invariante') && trae('gates invariantes') &&
      !trae('identidad') && !trae('circuito') && !trae('tablas largas de seguridad')
      ? 'ok' : 'fail';
  })(), 'ok');

  // ── falla_cerrado_y_conserva_invariantes ───────────────────────────────────
  comprueba('falla_cerrado_y_conserva_invariantes', (() => {
    // (a) las invariantes están en TODAS las fases declaradas
    for (const fase of Object.keys(MAPA_FASES)) {
      const salida = recortar(FIXTURE, fase);
      if (!salida.includes('cero invariante')) return 'fail-invariante-0';
      if (!salida.includes('gates invariantes')) return 'fail-invariante-7';
      if (!salida.includes('prohibiciones invariantes')) return 'fail-invariante-13';
    }
    // (b) encabezado ausente → lanza nombrando la sección
    const sinCero = FIXTURE.replace('## 0. Regla cero\ncero invariante\n', '');
    try {
      recortar(sinCero, 'plan');
      return 'fail-no-lanzo-ante-ausente';
    } catch (e) {
      if (!/\b0\b/.test(String(e.message))) return 'fail-no-nombra-la-seccion';
    }
    // (c) encabezado duplicado → lanza
    try {
      recortar(`${FIXTURE}\n## 7. Gates\nduplicado`, 'plan');
      return 'fail-no-lanzo-ante-duplicado';
    } catch { /* correcto */ }
    // (d) fase desconocida → lanza, nunca recorte vacío
    try {
      recortar(FIXTURE, 'fase-que-no-existe');
      return 'fail-no-lanzo-ante-fase-desconocida';
    } catch { /* correcto */ }
    // (e) las invariantes declaradas son exactamente las tres cortas
    return INVARIANTES.includes('0') && INVARIANTES.includes('7') && INVARIANTES.includes('13')
      ? 'ok' : 'fail-invariantes-mal-declaradas';
  })(), 'ok');

  // ── la_trazabilidad_de_seguridad_solo_llega_si_la_spec_es_sensible ─────────
  comprueba('la_trazabilidad_de_seguridad_solo_llega_si_la_spec_es_sensible', (() => {
    const normal = recortar(FIXTURE, 'specify', { sensible: false });
    const sensible = recortar(FIXTURE, 'specify', { sensible: true });
    // §8 (declarar impacto) siempre; §8.1 (tablas) solo si es sensible.
    return normal.includes('declara impacto') && !normal.includes('tablas largas de seguridad') &&
      sensible.includes('declara impacto') && sensible.includes('tablas largas de seguridad')
      ? 'ok' : 'fail';
  })(), 'ok');

  // ── el recorte del modelo real es más pequeño que el modelo ────────────────
  comprueba('el_recorte_de_implement_es_menor_que_el_modelo_completo', (() => {
    const modelo = leer(MODELO);
    if (!modelo) return 'fail-sin-modelo';
    let salida;
    try {
      salida = recortar(modelo, 'implement');
    } catch (e) {
      return `fail-lanzo:${e.message.slice(0, 60)}`;
    }
    // Si no ahorra al menos la mitad, esta spec no tiene sentido.
    return salida.length < modelo.length * 0.5 ? 'ok' : 'fail-no-ahorra';
  })(), 'ok');

  // ── ninguna_superficie_exige_el_documento_completo (T-017-03) ──────────────
  comprueba('ninguna_superficie_exige_el_documento_completo', (() => {
    const superficies = [
      'CLAUDE.md', 'AGENTS.md', '.github/copilot-instructions.md',
    ];
    for (const s of superficies) {
      const texto = leer(join(ROOT, s));
      if (texto === null) continue;
      if (/modelo completo|documento completo|léelo entero|completo en\s*\[?`?docs\/sdd\/OPERATING-MODEL/i.test(texto))
        return `fail:${s}`;
    }
    return 'ok';
  })(), 'ok');
}
