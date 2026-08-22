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
  const { esLigero } = mod;

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
}
