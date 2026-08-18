# Prompts para las ilustraciones

Cuatro prompts, uno por imagen. Están escritos en inglés porque los generadores de imagen
responden mejor así, y todos repiten la paleta y el acabado para que las cuatro parezcan de la
misma familia.

Guarda cada resultado en `site/assets/img/` con el nombre indicado.

Dos avisos que ahorran repeticiones:

- **Pide siempre que no haya texto.** Los generadores escriben palabras inventadas o mal
  deletreadas dentro de los diagramas, y aquí las etiquetas ya las pone el HTML.
- **Si el modelo no acepta proporciones libres**, genera en la más cercana que ofrezca y recorta
  después. La proporción importa porque la reserva el CSS.

---

## 1 · `circuito.png` — 16:10 (1600 × 1000)

> A wide abstract technical illustration on a very dark navy background (#06070d), rendered as a
> premium software product visual. Show an elegant left-to-right pipeline of six softly glowing
> nodes connected by thin luminous lines, each node a rounded translucent glass panel with a
> subtle inner glow. The connecting lines pulse with light gradients moving from indigo (#6d8bff)
> through teal (#24d3b8) to violet (#c07bff). Between the nodes, place small diamond-shaped
> checkpoint markers that glow slightly brighter, suggesting approval gates. Add a faint square
> grid in the background at very low opacity, and soft volumetric aurora blooms of indigo and
> violet behind the pipeline, heavily blurred. Cinematic depth of field, subtle film grain,
> generous negative space. Absolutely no text, no letters, no numbers, no UI chrome. Flat modern
> vector-meets-3D aesthetic, dark mode developer tool branding.

---

## 2 · `gates.png` — 21:9 (1680 × 720)

> An ultra-wide minimal illustration on near-black navy (#06070d). Six tall, narrow vertical
> gateways arranged in a row across the frame, like luminous doorways or portals seen straight
> on. Each gateway is outlined with a thin bright edge that glows indigo (#6d8bff), and the
> gaps between them fade into darkness. A single continuous horizontal beam of light passes
> through all six, shifting hue from indigo to teal (#24d3b8) to violet (#c07bff) as it travels
> left to right. The beam is brightest where it passes through each gateway, creating soft
> bloom. Faint particles drift in the beam. Background has a barely visible technical grid and
> deep atmospheric haze. Extremely clean and restrained, lots of empty dark space. No text, no
> characters, no symbols, no labels. Premium dark-mode SaaS marketing visual, cinematic lighting.

---

## 3 · `agentes.png` — 16:9 (1600 × 900)

> A dark abstract network constellation on a deep navy background (#06070d). About twenty small
> glowing orbs arranged in five loose clusters spread across the frame, each cluster with its own
> subtle color identity drawn from indigo (#6d8bff), teal (#24d3b8), violet (#c07bff), a soft
> green (#38d98a) and a warm amber (#f5b544). Within each cluster the orbs are connected by thin
> bright filaments; between clusters there are only a few long, faint connections, suggesting
> restricted communication. Each orb sits inside a soft halo and casts a faint reflection.
> Background shows a very low-opacity hexagonal or square technical grid and large blurred
> aurora gradients. Shallow depth of field with some orbs slightly out of focus. Elegant,
> scientific, calm. No text, no letters, no numbers, no icons, no human figures. Modern dark
> developer-tool illustration.

---

## 4 · `og.png` — 1.91:1 (1200 × 630)

> A dark, premium social share card background on deep navy (#06070d). Composition weighted to
> the left third with a large soft aurora bloom in indigo (#6d8bff) and violet (#c07bff),
> heavily blurred, and the right two thirds left almost empty and dark for text overlay. Across
> the lower area, a thin horizontal line of light with a few small glowing nodes on it,
> gradient shifting from indigo to teal (#24d3b8). Faint square technical grid at very low
> opacity across the whole frame. Subtle film grain, smooth gradients, no banding. Absolutely
> no text, no logos, no letters, no numbers. Clean, spacious, cinematic dark-mode branding
> background for a developer tool.

---

## Ajustes si algo no encaja

- **Demasiado saturado o «de videojuego»**: añade al final `muted, restrained, editorial, low
  saturation, sophisticated`.
- **Se llena de detalle**: añade `minimal, sparse, generous negative space, fewer elements`.
- **El fondo no es negro del todo**: insiste con `background must be nearly black, #06070d, not
  gray, not blue-gray`.
- **Aparece texto igualmente**: repite la prohibición al principio y al final del prompt; suele
  bastar con mencionarla dos veces.
