/**
 * Validación de la entrada del formulario de instalación.
 *
 * Todo lo que llega del navegador se valida aquí antes de tocar el disco o construir un argv.
 * La landing corre en local, pero eso no cambia la regla: la frontera se valida igual, porque
 * un navegador con otra pestaña abierta ya es un origen ajeno.
 *
 * Node >= 18, sin dependencias.
 */
import { existsSync, statSync } from 'node:fs';
import { isAbsolute, resolve, dirname, join } from 'node:path';

export const MODOS = new Set(['auto', 'greenfield', 'brownfield']);

/** Referencias git admitidas: etiqueta, rama o SHA. Nada que pueda parecer un flag. */
const REF_VALIDA = /^[A-Za-z0-9][A-Za-z0-9._/-]{0,99}$/;

/** Nombres de servidor MCP: el instalador los reenvía tal cual, así que se acotan aquí. */
const MCP_VALIDO = /^[a-z0-9][a-z0-9-]{0,39}$/;

/**
 * Caracteres que un intérprete de órdenes trataría como sintaxis. Solo se comprueban para
 * decidir si es seguro usar el respaldo con shell; el camino normal nunca abre un shell.
 */
const METACARACTERES = /["'`$;&|<>^%\n\r]/;

const tieneControl = (texto) => /[\u0000-\u001f\u007f]/.test(texto);

/**
 * Valida la ruta de destino y describe qué hay en ella, para que la interfaz pueda avisar
 * antes de ejecutar nada — instalar sobre un repositorio con trabajo en curso es legítimo,
 * pero hacerlo sin saberlo no.
 */
export function validarDestino(entrada) {
  const bruto = typeof entrada === 'string' ? entrada.trim() : '';
  if (!bruto) return { ok: false, error: 'Indica la ruta del proyecto.' };
  if (tieneControl(bruto)) return { ok: false, error: 'La ruta contiene caracteres de control.' };
  if (bruto.length > 4096) return { ok: false, error: 'La ruta es demasiado larga.' };
  if (!isAbsolute(bruto)) {
    return { ok: false, error: 'La ruta debe ser absoluta, por ejemplo C:\\ruta\\proyecto o /home/usuario/proyecto.' };
  }

  const ruta = resolve(bruto);
  const padre = dirname(ruta);
  const avisos = [];
  let existe = false;
  let esDirectorio = false;

  try {
    const info = statSync(ruta);
    existe = true;
    esDirectorio = info.isDirectory();
  } catch {
    existe = false;
  }

  if (existe && !esDirectorio) return { ok: false, ruta, error: 'La ruta existe pero no es una carpeta.' };

  const padreExiste = existsSync(padre);
  if (!existe && !padreExiste) {
    return { ok: false, ruta, error: `La carpeta contenedora no existe: ${padre}` };
  }

  const esRepoGit = existe && existsSync(join(ruta, '.git'));
  const yaInstalado = existe && existsSync(join(ruta, '.sdd', 'installed.json'));

  if (!existe) avisos.push('La carpeta no existe todavía; la instalación real la creará.');
  if (yaInstalado) avisos.push('Ya hay una instalación SDD aquí: init la actualizará conservando tus cambios locales.');
  if (existe && !esRepoGit) avisos.push('No es un repositorio Git: los hooks de commit no podrán activarse hasta que ejecutes git init.');

  return {
    ok: true,
    ruta,
    existe,
    esDirectorio,
    padreExiste,
    esRepoGit,
    yaInstalado,
    seguraSinShell: !METACARACTERES.test(ruta),
    avisos,
  };
}

/** Normaliza las opciones del formulario. Devuelve valores ya seguros para construir el argv. */
export function validarOpciones(cuerpo = {}) {
  const destino = validarDestino(cuerpo.destino);
  if (!destino.ok) return { ok: false, error: destino.error };

  const modo = typeof cuerpo.modo === 'string' ? cuerpo.modo : 'auto';
  if (!MODOS.has(modo)) return { ok: false, error: `Modo no válido: ${modo}` };

  const refBruta = typeof cuerpo.ref === 'string' ? cuerpo.ref.trim().replace(/^#/, '') : '';
  if (refBruta && !REF_VALIDA.test(refBruta)) {
    return { ok: false, error: 'La referencia solo admite letras, números, punto, guion, guion bajo y barra.' };
  }

  const mcp = Array.isArray(cuerpo.mcp) ? cuerpo.mcp.map((x) => String(x).trim()).filter(Boolean) : [];
  const invalido = mcp.find((nombre) => !MCP_VALIDO.test(nombre));
  if (invalido) return { ok: false, error: `Servidor MCP no válido: ${invalido}` };

  const paso = Number(cuerpo.paso);
  if (![1, 2, 3].includes(paso)) return { ok: false, error: 'Paso desconocido.' };

  return {
    ok: true,
    paso,
    destino,
    modo,
    ref: refBruta,
    mcp,
    sinHooks: cuerpo.sinHooks === true,
    conBaseline: cuerpo.conBaseline === true,
    tlsPermisivo: cuerpo.tlsPermisivo === true,
  };
}
