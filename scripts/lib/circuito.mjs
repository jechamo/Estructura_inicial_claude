/**
 * circuito — decide si un cambio cabe en el circuito ligero.
 *
 * Cálculo puro: no lee ficheros, no ejecuta git, no imprime nada. Existe separado del gate
 * para que la única regla que separa «ahorrar papeleo» de «saltarse el sistema» se pueda
 * probar sin proceso hijo y sin repositorio.
 *
 * La regla es deliberadamente aburrida: un fichero es ligero si alguna entrada de `permitido`
 * lo cubre y **ninguna** de `prohibido` lo alcanza. El orden importa porque los errores
 * humanos son asimétricos. Ampliar `permitido` de más es fácil y silencioso —`docs/` parece
 * inofensivo hasta que uno recuerda que ahí viven la constitución, el PRD y las specs—;
 * ampliar `prohibido` de más solo produce papeleo sobrante, que es un fallo ruidoso y molesto.
 */

/**
 * Normaliza una ruta relativa a la raíz del proyecto. Devuelve `null` si la ruta es absoluta
 * o si escapa del árbol: describir la misma ruta prohibida con `..` o con separador de
 * Windows es la forma más barata de esquivar una frontera que compara cadenas.
 */
export function normalizar(ruta) {
  const bruta = String(ruta || '').replace(/\\/g, '/').trim();
  if (!bruta) return null;
  if (bruta.startsWith('/') || /^[a-zA-Z]:\//.test(bruta)) return null;
  const partes = [];
  for (const parte of bruta.split('/')) {
    if (!parte || parte === '.') continue;
    if (parte === '..') {
      if (!partes.length) return null; // escapa de la raíz
      partes.pop();
      continue;
    }
    partes.push(parte);
  }
  return partes.length ? partes.join('/') : null;
}

/**
 * ¿Cubre un patrón a una ruta? El vocabulario es intencionadamente mínimo: una entrada que
 * acaba en `/` cubre el subárbol, y en otro caso es un fichero exacto. Sin comodines: un
 * lenguaje de patrones rico invita a escribir fronteras que nadie sabe leer, y esta frontera
 * la tiene que poder revisar una persona en un diff.
 */
function cubre(patron, ruta) {
  const p = normalizar(String(patron || '').replace(/\/+$/, '/'));
  if (!p) return false;
  const esCarpeta = String(patron).replace(/\\/g, '/').trim().endsWith('/');
  return esCarpeta ? ruta === p || ruta.startsWith(`${p}/`) : ruta === p;
}

/** ¿Cabe este fichero en el circuito ligero según la frontera declarada? */
export function esLigero(ruta, frontera) {
  // Sin frontera no hay circuito ligero. La alternativa —tratar la ausencia como permiso
  // total— convertiría un despiste en la desactivación del sistema entero.
  if (!frontera || typeof frontera !== 'object') return false;
  if (!Array.isArray(frontera.permitido) || !Array.isArray(frontera.prohibido)) return false;
  const r = normalizar(ruta);
  if (!r) return false;
  if (frontera.prohibido.some((p) => cubre(p, r))) return false;
  return frontera.permitido.some((p) => cubre(p, r));
}

/**
 * Clasifica un conjunto de rutas y nombra las que obligan al circuito completo. Devolver la
 * lista y no solo el veredicto es la diferencia entre una respuesta accionable y un «no».
 */
export function clasificar(rutas, frontera) {
  const lista = (rutas || []).map((r) => String(r).replace(/\\/g, '/'));
  const obligan = lista.filter((r) => !esLigero(r, frontera));
  // Un commit sin ficheros no es un cambio de bajo riesgo: es la ausencia de cambio, y
  // concederle el atajo sería conceder el atajo a lo que no se ha mirado.
  const circuito = lista.length && !obligan.length ? 'light' : 'full';
  return { circuito, obligan, total: lista.length };
}

const RELLENO = [
  /^(cambio|arreglo|fix|ajuste|mejora|update|actualizaci[oó]n|correcci[oó]n|errata|typo)s?\s*(menor|peque[nñ]o|r[aá]pido|trivial|varios?|general|es)?$/i,
  /^(?:varios|otros?|n\/?a|ninguno|motivo|excepci[oó]n|porque s[ií]|hac[ií]a falta|necesario)\.?$/i,
  /pendiente|tbd|todo/i,
];

/**
 * ¿Es material el motivo de un atajo? Un motivo de relleno es peor que ninguno: ocupa el
 * sitio de la explicación y aparenta haberla dado. La misma vara rige para `Trace-exception:`
 * y para `Circuit-reason:`, y vive aquí una sola vez para que no puedan divergir.
 */
export function motivoMaterial(texto) {
  const t = String(texto || '').trim();
  if (t.length < 20) return false;
  if (t.split(/\s+/).length < 4) return false;
  return !RELLENO.some((re) => re.test(t));
}

/**
 * Proporción de commits ligeros en una ventana. Superar la cuota no significa que alguien
 * haya hecho trampa: significa que la frontera está mal trazada. El número existe para poner
 * la regla en duda, no para señalar a quien la usa.
 */
export function cuota({ ligeros = 0, total = 0, maximo = 1 } = {}) {
  const proporcion = total > 0 ? Number((ligeros / total).toFixed(3)) : 0;
  return { ligeros, total, proporcion, maximo, superada: total > 0 && proporcion > maximo };
}
