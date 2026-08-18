/** Arranque de la portada. */

import { VERSION } from './datos.mjs';
import { iniciarCatalogo } from './catalogo.mjs';
import { iniciarComandos } from './comandos.mjs';
import { iniciarComponentes } from './componentes.mjs';
import { iniciarMovimiento } from './motion.mjs';

for (const nodo of document.querySelectorAll('[data-version]')) {
  nodo.textContent = `v${VERSION}`;
}

iniciarCatalogo();
iniciarComandos();
iniciarComponentes();
iniciarMovimiento();
