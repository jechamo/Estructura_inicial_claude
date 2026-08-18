#!/usr/bin/env node
/**
 * Prepara `site/` para publicarlo.
 *
 * El sitio es estático y funciona tal cual está en el repositorio; este script solo resuelve las
 * tres cosas que no tiene sentido duplicar a mano: la versión publicada, la memoria técnica y el
 * logotipo. Se ejecuta en el flujo de Pages y también en local con `npm run site`.
 */

import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITIO = join(RAIZ, 'site');

const version = JSON.parse(readFileSync(join(RAIZ, 'package.json'), 'utf8')).version;
const hechos = [];

/** Mantiene `datos.mjs` alineado con package.json sin que nadie tenga que acordarse. */
const datos = join(SITIO, 'assets', 'js', 'datos.mjs');
const fuente = readFileSync(datos, 'utf8');
const alineado = fuente.replace(/export const VERSION = '[^']*';/, `export const VERSION = '${version}';`);
if (alineado !== fuente) {
  writeFileSync(datos, alineado);
  hechos.push(`versión → ${version}`);
}

/** La memoria vive en docs/; aquí solo se copia para que la página pueda pedirla por fetch. */
const copiar = (origen, destino, etiqueta) => {
  if (!existsSync(origen)) {
    console.warn(`  ! falta ${etiqueta}: ${origen}`);
    return;
  }
  mkdirSync(dirname(destino), { recursive: true });
  copyFileSync(origen, destino);
  hechos.push(etiqueta);
};

copiar(
  join(RAIZ, 'docs', 'TFM', 'MEMORIA-SISTEMA-AGENTES.md'),
  join(SITIO, 'assets', 'memoria.md'),
  'memoria técnica',
);

copiar(
  join(RAIZ, 'web', 'public', 'assets', 'logo.png'),
  join(SITIO, 'assets', 'img', 'logo.png'),
  'logotipo',
);

// Sin este fichero, Pages pasa el sitio por Jekyll y descarta lo que empiece por guion bajo.
const nojekyll = join(SITIO, '.nojekyll');
if (!existsSync(nojekyll)) {
  writeFileSync(nojekyll, '');
  hechos.push('.nojekyll');
}

console.log(`site listo · ${hechos.join(' · ') || 'sin cambios'}`);
