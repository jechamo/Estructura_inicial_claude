/**
 * Contrato de la frontera del circuito.
 *
 * La frontera decide si un cambio puede prescindir del expediente. Equivocarse aquí no produce
 * papeleo sobrante —eso sería el fallo ruidoso y barato—, produce código sin spec. Por eso estas
 * pruebas atacan la frontera en vez de comprobar que funciona el camino feliz.
 */
async function cargar() {
  try { return await import('../lib/circuito.mjs'); } catch { return null; }
}

export async function pruebas(comprueba) {
  const mod = await cargar();
  if (!mod) { comprueba('deniega_variacion_de_caja', 'sin-modulo', 'ok'); return; }
  const { esLigero, clasificar } = mod;

  /** Frontera de ejemplo con los tres niveles aprobados. */
  const CONTRATO = {
    schemaVersion: 1,
    status: 'approved',
    light: { allowed: ['README.md', 'docs/guides/', 'src/styles/'] },
    compact: { modules: [{ id: 'carrusel', prefixes: ['src/components/carrusel/'] }] },
    denied: ['src/domain/', 'migrations/', '.sdd/', 'scripts/'],
  };

  comprueba('deniega_variacion_de_caja', (() => {
    // El caso realmente explotable: `permitido` se escribe con la caja real del disco —lo natural
    // en Windows si la carpeta se llama `Src`— mientras `prohibido` viene en minúsculas desde la
    // semilla. El permiso casa, la negación no, y un fichero de dominio se cuela como ligero.
    if (esLigero('Src/domain/pagos.ts', { permitido: ['Src/'], prohibido: ['src/domain/'] }))
      return 'fail-la-negacion-se-esquiva-con-la-caja';
    // Y al revés: la negación declarada con mayúsculas también tiene que alcanzar la ruta real.
    if (esLigero('src/domain/pagos.ts', { permitido: ['src/'], prohibido: ['SRC/DOMAIN/'] }))
      return 'fail-la-negacion-en-mayusculas-no-alcanza';
    // Un fichero legítimamente permitido no deja de estarlo por la caja: plegar no puede
    // convertirse en una prohibición nueva.
    if (!esLigero('Docs/Guides/instalacion.md', { permitido: ['docs/guides/'], prohibido: ['src/'] }))
      return 'fail-plegar-rompe-un-permiso-legitimo';
    // Lo que ya funcionaba sigue funcionando: negación prevalente y traversal rechazado.
    if (esLigero('src/domain/pagos.ts', { permitido: ['src/'], prohibido: ['src/domain/'] }))
      return 'fail-negacion-prevalente-rota';
    if (esLigero('../fuera.md', { permitido: ['../'], prohibido: [] }))
      return 'fail-traversal-aceptado';
    if (esLigero('/etc/passwd', { permitido: ['/etc/'], prohibido: [] }))
      return 'fail-ruta-absoluta-aceptada';
    return 'ok';
  })(), 'ok');

  comprueba('clasifica_en_tres_niveles_con_full_por_defecto', (() => {
    if (!clasificar) return 'fail-sin-clasificador';
    const nivel = (rutas, c = CONTRATO) => clasificar(rutas, c).circuito;
    if (nivel(['README.md']) !== 'light') return 'fail-doc-exacta-no-es-light';
    if (nivel(['docs/guides/instalacion.md']) !== 'light') return 'fail-guia-no-es-light';
    if (nivel(['src/components/carrusel/Carrusel.tsx']) !== 'compact') return 'fail-componente-no-es-compact';
    if (nivel(['src/domain/pagos.ts']) !== 'full') return 'fail-dominio-no-es-full';
    if (nivel(['migrations/001.sql']) !== 'full') return 'fail-migracion-no-es-full';
    if (nivel(['.sdd/circuit.json']) !== 'full') return 'fail-el-propio-sdd-no-es-full';
    // Ruta que la frontera no menciona: la duda cae del lado caro.
    if (nivel(['inventado/cosa.txt']) !== 'full') return 'fail-desconocida-no-es-full';
    // El conjunto manda: mezclar un ligero con un full da full.
    if (nivel(['README.md', 'src/domain/pagos.ts']) !== 'full') return 'fail-el-conjunto-no-manda';
    if (nivel(['README.md', 'src/components/carrusel/Carrusel.tsx']) !== 'compact') return 'fail-mezcla-light-compact';
    // Sin aprobar no hay atajo, diga lo que diga la frontera.
    if (nivel(['README.md'], { ...CONTRATO, status: 'pending' }) !== 'full') return 'fail-sin-aprobar-hay-atajo';
    // Gramática: un comodín no concede nada.
    if (nivel(['src/lib/auth/token.ts'], { ...CONTRATO, light: { allowed: ['**/auth/'] } }) !== 'full')
      return 'fail-comodin-concede';
    return 'ok';
  })(), 'ok');

  comprueba('un_ejecutable_nunca_es_ligero', (() => {
    if (!clasificar) return 'fail-sin-clasificador';
    // Aunque alguien lo declare explícitamente como permitido para el nivel ligero.
    const laxo = { ...CONTRATO, light: { allowed: ['src/components/Carrusel.tsx', 'src/util.js'] } };
    for (const ruta of ['src/components/Carrusel.tsx', 'src/util.js']) {
      const nivel = clasificar([ruta], laxo).circuito;
      if (nivel === 'light') return `fail-ejecutable-ligero:${ruta}`;
    }
    // Un fichero no ejecutable declarado sí puede ser ligero: el suelo no es una prohibición.
    if (clasificar(['README.md'], CONTRATO).circuito !== 'light') return 'fail-el-suelo-prohibe-de-mas';
    return 'ok';
  })(), 'ok');

  comprueba('clasifica_rutas_previstas_con_arbol_limpio', (() => {
    if (!clasificar) return 'fail-sin-clasificador';
    // No hace falta haber editado nada: la clasificación es sobre rutas, no sobre el árbol.
    const r = clasificar(['src/components/carrusel/Carrusel.tsx'], CONTRATO);
    if (r.circuito !== 'compact') return 'fail-no-clasifica-previstas';
    if (r.total !== 1) return 'fail-no-cuenta';
    // Cero rutas no es un atajo ni un reproche.
    const vacio = clasificar([], CONTRATO);
    if (vacio.total !== 0 || vacio.circuito !== 'full') return 'fail-vacio-mal';
    // Lo que obliga a subir de nivel se nombra, para poder discutirlo.
    const obliga = clasificar(['README.md', 'src/domain/pagos.ts'], CONTRATO);
    if (!obliga.obligan.some((o) => String(o).includes('src/domain/pagos.ts'))) return 'fail-no-nombra-quien-obliga';
    return 'ok';
  })(), 'ok');

  comprueba('la_frontera_heredada_sigue_habilitando_solo_light', (() => {
    if (!clasificar) return 'fail-sin-clasificador';
    // Un proyecto instalado antes de esta spec: solo tiene la frontera vieja.
    const heredada = { permitido: ['README.md'], prohibido: ['src/'] };
    const r = clasificar(['README.md'], heredada);
    if (r.circuito !== 'light') return 'fail-heredada-no-funciona';
    if (!r.legacy) return 'fail-no-avisa-de-migracion';
    // Y no gana el nivel compacto por la puerta de atrás.
    if (clasificar(['src/components/carrusel/Carrusel.tsx'], heredada).circuito !== 'full')
      return 'fail-heredada-concede-compact';
    return 'ok';
  })(), 'ok');

  // NOTA: la parte de `clasificar` de este caso no nació de un rojo — la construyó T-017-06 al
  // implementar el clasificador. Se conserva como **regresión**, no como ciclo TDD, y así consta
  // en la evidencia. El rojo real de T-017-07 es el de los comandos de propuesta y aprobación,
  // que se comprueban en `aprobacion_separada_y_ligada_a_la_propuesta`.
  comprueba('sin_aprobacion_no_hay_atajo', (() => {
    if (!clasificar) return 'fail-sin-clasificador';
    // Recién instalada: la frontera existe, propone candidatos, y no concede nada.
    const reciente = { ...CONTRATO, status: 'pending' };
    const r = clasificar(['README.md'], reciente);
    if (r.circuito !== 'full') return 'fail-pending-concede';
    if (!/no está aprobada/.test(String(r.motivo || ''))) return 'fail-no-dice-por-que';
    // Un estado inventado tampoco vale: solo `approved` aprueba.
    for (const estado of ['approve', 'ok', 'true', '', undefined]) {
      if (clasificar(['README.md'], { ...CONTRATO, status: estado }).circuito !== 'full')
        return `fail-estado-colado:${estado}`;
    }
    // Y con la aprobación puesta, vuelve a funcionar.
    if (clasificar(['README.md'], CONTRATO).circuito !== 'light') return 'fail-aprobada-no-funciona';
    return 'ok';
  })(), 'ok');

  comprueba('aprobacion_separada_y_ligada_a_la_propuesta', (() => {
    const { proponerFrontera, aprobarFrontera, huellaPropuesta } = mod;
    if (!proponerFrontera || !aprobarFrontera || !huellaPropuesta) return 'fail-sin-comandos';

    // La propuesta se calcula sobre rutas que existen, y nunca abre raíces ejecutables.
    const propuesta = proponerFrontera(['README.md', 'docs/guides/x.md', 'src/app.tsx', 'src/domain/p.ts']);
    if (propuesta.status !== 'pending') return 'fail-propuesta-nace-aprobada';
    if (propuesta.light.allowed.some((p) => /^(src|app|components|public)\/$/.test(p)))
      return 'fail-propone-raiz-ejecutable';
    if (propuesta.light.allowed.some((p) => /\.(t|j)sx?$/.test(p)))
      return 'fail-propone-ejecutable-como-ligero';
    // Los ficheros que gobiernan el propio circuito no son documentación cualquiera: cambiarlos
    // cambia las reglas. Que acaben en `.md` no los vuelve inocuos.
    const gobierno = proponerFrontera(['AGENTS.md', 'CLAUDE.md', 'GEMINI.md', 'package.json', 'README.md']);
    for (const prohibido of ['AGENTS.md', 'CLAUDE.md', 'GEMINI.md', 'package.json']) {
      if (gobierno.light.allowed.includes(prohibido)) return `fail-propone-gobierno:${prohibido}`;
    }
    if (!gobierno.light.allowed.includes('README.md')) return 'fail-excluye-de-mas';

    // Aprobar exige la huella de la propuesta que se mostró.
    const hash = huellaPropuesta(propuesta);
    const mal = aprobarFrontera(propuesta, { hash: 'otro', by: 'Persona' });
    if (mal.ok !== false) return 'fail-acepta-hash-que-no-corresponde';

    const bien = aprobarFrontera(propuesta, { hash, by: 'Persona' });
    if (bien.ok !== true) return 'fail-no-aprueba-con-el-hash-correcto';
    if (bien.contrato.status !== 'approved') return 'fail-no-queda-aprobada';
    if (bien.contrato.approvedBy !== 'Persona') return 'fail-no-registra-quien';
    if (!bien.contrato.approvedAt) return 'fail-no-registra-cuando';

    // Y una propuesta alterada después de mostrarse deja de casar con su huella.
    const alterada = { ...propuesta, light: { allowed: [...propuesta.light.allowed, 'src/domain/'] } };
    if (aprobarFrontera(alterada, { hash, by: 'Persona' }).ok !== false)
      return 'fail-acepta-propuesta-alterada';

    // Aprobar sin decir quién no es aprobar.
    if (aprobarFrontera(propuesta, { hash, by: '' }).ok !== false) return 'fail-aprueba-sin-actor';
    return 'ok';
  })(), 'ok');
}
