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
  // La comparación pliega la caja. En Windows y en macOS por defecto el sistema de ficheros no
  // distingue mayúsculas: `Src/domain/pagos.ts` y `src/domain/pagos.ts` son el MISMO fichero. Sin
  // plegar, una frontera que declara `permitido: ["Src/"]` —lo natural si la carpeta se llama así
  // en el disco— y `prohibido: ["src/domain/"]` —lo que trae la semilla— deja pasar como ligero un
  // fichero de dominio: el permiso casa y la negación no. Comparar cadenas sin plegar convierte la
  // ortografía de quien escribió la frontera en un permiso.
  const a = p.toLowerCase();
  const b = String(ruta).toLowerCase();
  return esCarpeta ? b === a || b.startsWith(`${a}/`) : b === a;
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
 * Extensiones que ejecutan. La lista es el **candado principal** del nivel ligero: por muy mal
 * escrita que esté la frontera, un fichero que ejecuta no puede irse sin expediente. Sin este
 * suelo, la única garantía sería la ortografía de quien redactó la lista de permitidos.
 */
export const EJECUTABLES = new Set([
  '.js', '.mjs', '.cjs', '.jsx', '.ts', '.mts', '.cts', '.tsx', '.vue', '.svelte',
  '.py', '.rb', '.go', '.rs', '.java', '.kt', '.php', '.cs', '.swift', '.sh', '.bash', '.ps1', '.sql',
]);

const ORDEN = { light: 0, compact: 1, full: 2 };
const mayor = (a, b) => (ORDEN[a] >= ORDEN[b] ? a : b);

/**
 * ¿Ejecuta este fichero? Solo por extensión conocida. Un fichero sin extensión reconocida no se
 * declara ejecutable aquí, pero tampoco se cuela: al no estar cubierto por ninguna lista termina
 * en `full` por la vía de lo desconocido, que es donde la duda debe caer.
 */
export function esEjecutable(ruta) {
  const m = String(ruta).toLowerCase().match(/(\.[a-z0-9]+)$/);
  return m ? EJECUTABLES.has(m[1]) : false;
}

/**
 * Una entrada de frontera es válida si es un fichero exacto o un prefijo de directorio. Sin
 * comodines: un lenguaje de patrones rico invita a escribir fronteras que nadie sabe leer, y una
 * frontera que nadie sabe leer no se puede revisar en un diff.
 */
export function entradaValida(patron) {
  const bruto = String(patron || '');
  if (/[*?[\]]/.test(bruto)) return false;
  return normalizar(bruto) !== null;
}

/** ¿Cubre alguna entrada válida de la lista a esta ruta? Una entrada inválida no concede nada. */
const cubierta = (lista, ruta) =>
  (Array.isArray(lista) ? lista : []).some((p) => entradaValida(p) && cubre(p, ruta));

/** Nivel de un solo fichero contra el contrato de tres niveles. */
function nivelDe(ruta, contrato) {
  const r = normalizar(ruta);
  // Ruta que escapa del árbol o absoluta: no se clasifica, se manda al circuito completo.
  if (!r) return 'full';
  if (cubierta(contrato.denied, r)) return 'full';
  const ejecuta = esEjecutable(r);
  if (!ejecuta && cubierta(contrato.light?.allowed, r)) return 'light';
  const modulos = Array.isArray(contrato.compact?.modules) ? contrato.compact.modules : [];
  const enModulo = modulos.filter((m) => cubierta(m?.prefixes, r));
  // Un cambio compacto vive en UN módulo. Si toca dos, ya no es acotado.
  if (enModulo.length === 1) return 'compact';
  // Un ejecutable declarado como ligero sigue siendo compacto: el suelo no lo puede rebajar
  // nadie. Pero si no está declarado en ninguna parte, es desconocido y por tanto completo.
  if (ejecuta && cubierta(contrato.light?.allowed, r)) return 'compact';
  return 'full';
}

/**
 * Clasifica un conjunto de rutas en `light`, `compact` o `full`.
 *
 * Acepta las dos formas de frontera: el contrato de tres niveles (`.sdd/circuit.json`) y la
 * heredada de dos (`.sdd/lightweight.json`), que sigue habilitando **solo** el nivel ligero. Un
 * proyecto instalado antes de esta spec no se rompe, pero tampoco gana el nivel compacto por la
 * puerta de atrás: para eso hay que declarar y aprobar la frontera nueva.
 */
export function clasificar(rutas, frontera) {
  const lista = (rutas || []).map((r) => String(r).replace(/\\/g, '/'));
  const legacy = Boolean(frontera && !frontera.light && !frontera.denied &&
    (Array.isArray(frontera.permitido) || Array.isArray(frontera.prohibido)));

  // Un conjunto sin ficheros no es un cambio de bajo riesgo: es la ausencia de cambio, y
  // concederle el atajo sería conceder el atajo a lo que no se ha mirado.
  if (!lista.length) return { circuito: 'full', obligan: [], total: 0, ...(legacy ? { legacy } : {}) };

  if (legacy) {
    const obligan = lista.filter((r) => !esLigero(r, frontera));
    return { circuito: obligan.length ? 'full' : 'light', obligan, total: lista.length, legacy: true };
  }

  // Sin frontera declarada, o declarada pero sin aprobar, no hay atajo de ninguna clase. Tratar
  // el descuido como permiso desactivaría el control entero en silencio.
  if (!frontera || typeof frontera !== 'object' || frontera.status !== 'approved')
    return {
      circuito: 'full', obligan: [...lista], total: lista.length,
      motivo: !frontera ? 'no hay frontera declarada' : 'la frontera no está aprobada',
    };

  const niveles = lista.map((r) => ({ ruta: r, nivel: nivelDe(r, frontera) }));
  const circuito = niveles.reduce((acc, n) => mayor(acc, n.nivel), 'light');
  // Un cambio compacto vive en un solo módulo; si el conjunto toca varios, ya no es acotado.
  const modulosTocados = new Set(
    niveles.filter((n) => n.nivel === 'compact')
      .map((n) => (frontera.compact?.modules || []).find((m) => cubierta(m?.prefixes, normalizar(n.ruta)))?.id)
      .filter(Boolean),
  );
  const definitivo = circuito === 'compact' && modulosTocados.size > 1 ? 'full' : circuito;
  return {
    circuito: definitivo,
    obligan: niveles.filter((n) => n.nivel === 'full').map((n) => n.ruta),
    total: lista.length,
    ...(definitivo !== circuito ? { motivo: `toca ${modulosTocados.size} módulos compactos; uno solo cabe en el nivel compacto` } : {}),
  };
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
