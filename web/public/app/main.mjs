/** Punto de entrada: arranca movimiento, instalador y documentación. */
import { iniciarMovimiento } from './motion.mjs';
import { iniciarInstalador } from './installer.mjs';
import { iniciarDocumentacion } from './docs.mjs';
import { pedirJson } from './api.mjs';

async function comprobarServidor() {
  const salud = await pedirJson('/api/health');
  if (salud.memoriaDisponible === false) {
    const boton = document.getElementById('cargar-memoria');
    boton.disabled = true;
    boton.textContent = 'Memoria no disponible en este repositorio';
  }
}

iniciarMovimiento();
iniciarInstalador();
iniciarDocumentacion();
comprobarServidor();
