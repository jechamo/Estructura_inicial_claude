/** Tipos MIME de los estáticos que sirve la landing. Lista corta y cerrada a propósito. */
const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

export function tipoMime(ruta) {
  const punto = ruta.lastIndexOf('.');
  if (punto < 0) return 'application/octet-stream';
  return TIPOS[ruta.slice(punto).toLowerCase()] || 'application/octet-stream';
}
