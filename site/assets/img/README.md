# Ilustraciones del sitio

Las cuatro imágenes de abajo son **opcionales**: mientras no existan, cada figura muestra una
superficie con textura en lugar de un hueco roto, y la página sigue siendo perfectamente legible.
El script `componentes.mjs` solo destapa la imagen cuando el fichero carga de verdad.

Todas comparten la misma paleta que el sitio, para que no parezcan pegadas encima:

| Papel | Color |
|---|---|
| Fondo | `#06070d` |
| Superficie | `#0d1020` |
| Acento primario | `#6d8bff` |
| Acento secundario | `#24d3b8` |
| Acento terciario | `#c07bff` |
| Texto | `#e9edfb` |

| Fichero | Proporción | Tamaño sugerido | Dónde aparece |
|---|---|---|---|
| `circuito.png` | 16:10 | 1600 × 1000 | Portada, junto al terminal |
| `gates.png` | 21:9 | 1680 × 720 | Sección «Circuito» |
| `agentes.png` | 16:9 | 1600 × 900 | Sección «Agentes» |
| `og.png` | 1.91:1 | 1200 × 630 | Vista previa al compartir el enlace |

`logo.png` lo copia `scripts/site-prep.mjs` desde `web/public/assets/`; no hay que ponerlo a mano.

Guarda los ficheros en esta misma carpeta con exactamente esos nombres. Los prompts para
generarlos están en `PROMPTS.md`.
