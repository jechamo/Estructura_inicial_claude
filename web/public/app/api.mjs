/**
 * Cliente de la API local. El testigo viaja siempre en una cabecera, nunca en la URL: así no
 * acaba en el historial ni en un registro, y una pestaña de otro origen no puede fabricarlo.
 */

const TESTIGO = document.querySelector('meta[name="sdd-token"]').content;

export const VERSION = document.querySelector('meta[name="sdd-version"]').content;

async function peticion(ruta, opciones = {}) {
  const respuesta = await fetch(ruta, {
    ...opciones,
    headers: { 'x-sdd-token': TESTIGO, ...(opciones.headers || {}) },
  });
  return respuesta;
}

export async function pedirJson(ruta, cuerpo) {
  const respuesta = await peticion(ruta, cuerpo
    ? { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(cuerpo) }
    : {});
  const datos = await respuesta.json().catch(() => ({ error: 'Respuesta ilegible' }));
  if (!respuesta.ok && !datos.error) datos.error = `Error ${respuesta.status}`;
  return datos;
}

export async function pedirTexto(ruta) {
  const respuesta = await peticion(ruta);
  if (!respuesta.ok) throw new Error(`No se pudo cargar ${ruta} (${respuesta.status})`);
  return respuesta.text();
}

/**
 * Lee un flujo de eventos del servidor. Se usa `fetch` en vez de `EventSource` porque este
 * último no admite cabeceras, y meter el testigo en la URL sería tirar por tierra la razón
 * de tenerlo.
 */
export async function escucharFlujo(ruta, alRecibir, senal) {
  const respuesta = await peticion(ruta, { signal: senal });
  if (!respuesta.ok || !respuesta.body) throw new Error(`Flujo no disponible (${respuesta.status})`);

  const lector = respuesta.body.getReader();
  const decodificador = new TextDecoder();
  let resto = '';

  for (;;) {
    const { done, value } = await lector.read();
    if (done) break;
    resto += decodificador.decode(value, { stream: true });
    const bloques = resto.split('\n\n');
    resto = bloques.pop();
    for (const bloque of bloques) {
      for (const linea of bloque.split('\n')) {
        if (!linea.startsWith('data: ')) continue;
        try { alRecibir(JSON.parse(linea.slice(6))); }
        catch { /* un evento ilegible no debe cortar el resto del flujo */ }
      }
    }
  }
}
