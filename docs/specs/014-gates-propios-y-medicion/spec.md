# 014 · Gates propios y medición honesta

| Campo | Valor |
|---|---|
| **ID** | `014-gates-propios-y-medicion` |
| **Estado** | en implementación |
| **Autor** | usuario + `spec-analyst` (`declared-direct`) |
| **Fecha** | 2026-08-18 |
| **Rama** | `main` · trabajo local solicitado por el usuario |
| **Depende de** | `013-verificacion-independiente-del-host` |
| **Baseline de producto** | `approved` · `docs/product/PRD.md` |
| **Impacto de seguridad** | `no-sensible` |
| **Impacto de usabilidad** | `aplicable` |
| **Impacto de documentación** | `aplicable · DOC-QUALITY` |

> Capacidad interna de la plantilla: no crea requisitos de producto ni decisiones de dominio.

## 1. Problema

La spec `012` cerró un desequilibrio evidente —el repositorio exigía catorce gates y ejecutaba
dos— dejando seis configurados y ocho declarados como ausentes con motivo escrito. La spec `013`
destapó después que un control puede estar escrito, estar en verde y no ejecutarse nunca. Las
ocho ausencias son exactamente el sitio donde ese fallo puede repetirse, porque nadie las vuelve
a mirar: un motivo, una vez escrito, envejece en silencio.

Y han envejecido. El repositorio publica hoy un sitio en GitHub Pages con tres páginas HTML,
mientras dos de las ocho filas siguen afirmando que **no hay superficie visual**:

| Fila | Lo que afirma | Lo que es cierto hoy |
|---|---|---|
| `a11y` | «no hay superficie visual, foco ni contraste que auditar» | `site/index.html`, `documentacion.html` y `404.html` se publican y se navegan con teclado |
| `visual` | «la plantilla no tiene interfaz gráfica» | la tiene desde que existe `site/` |

Un tercer caso no es falso sino mal clasificado: `docs` figura como no configurado, pero
`quality-gates.yml` lo ejecuta en cada pull request con `check-sdd --docs-diff --base`. Está
listado como ausencia una comprobación que sí corre. La lista mezcla tres cosas distintas bajo
una sola etiqueta —lo que no aplica, lo que aún no se hace y lo que se hace en otro sitio— y esa
mezcla es la que permite que una afirmación caducada pase inadvertida.

Queda el fondo del asunto. Los dos gates que de verdad medirían la suficiencia de la suite
—`coverage` y `smells`— siguen ausentes con el mismo argumento: exigirían una dependencia
externa. El argumento era razonable y ha dejado de serlo, porque Node incorpora recolección de
cobertura por V8 desde la versión 12 y este repositorio exige Node 18. La regla de cero
dependencias no obliga a renunciar a medir; obliga a medir con lo que ya hay.

## 2. Objetivo

Ejecutar los gates que el repositorio puede ejecutar con la plataforma que ya exige, clasificar
cada ausencia restante por su naturaleza en lugar de por su enunciado, y hacer que un motivo
caducado falle en vez de envejecer.

## 3. Requisitos

| Id | Requisito EARS | Prioridad | Esfuerzo |
|---|---|---|---:|
| RF-01 | CUANDO se ejecute la suite del repositorio, el sistema DEBE medir la cobertura real de sus módulos ejecutables usando la instrumentación incorporada en Node, sin añadir ninguna dependencia. | M | L |
| RF-02 | SI la cobertura medida baja respecto del umbral registrado, el gate DEBE fallar; y SI sube de forma sostenida, el umbral DEBE poder subirse de forma explícita y versionada. | M | M |
| RF-03 | CUANDO el repositorio publique páginas HTML, el sistema DEBE auditar sobre ellas los controles de accesibilidad comprobables sin navegador —idioma, título, textos alternativos, regiones, orden de encabezados y etiquetado de controles—. | M | M |
| RF-04 | CUANDO se verifique el repositorio, el sistema DEBE detectar funciones y ficheros que superen la longitud registrada como aceptable, sin evaluar complejidad ciclomática ni estilo. | S | M |
| RF-05 | CUANDO un gate no se ejecute, su declaración DEBE indicar la clase de la ausencia —`no-aplica`, `pendiente` o `se-ejecuta-en-otro-sitio`— además del motivo, y una comprobación DEBE fallar si falta la clase o si no es una de las admitidas. | M | S |
| RF-06 | SI un motivo de ausencia afirma que no existe una superficie que el repositorio sí contiene, una comprobación DEBE fallar nombrando los ficheros que lo desmienten. | M | M |
| RF-07 | CUANDO se ejecuten los gates rápidos, el conjunto DEBE seguir terminando en segundos; los gates de medición DEBEN declararse lentos. | M | S |

## 4. Criterios de aceptación

### CA-01 · La cobertura se mide, no se estima

`scripts/check-coverage.mjs` lee los volcados que Node deja en `NODE_V8_COVERAGE`, se queda con
los módulos propios del repositorio —`scripts/**` y `.sdd/hooks/**`—, resuelve la URL de cada
uno a una ruta real y calcula qué líneas ejecutables quedaron sin recorrer. Emite `--json` para
consumo automático y `--selftest` que verifica el cálculo contra un caso construido, igual que
`check-syntax.mjs`.

### CA-02 · El umbral es un trinquete, no un deseo

El umbral vive en `.sdd/coverage.json` con el valor medido menos un margen declarado, nunca un
porcentaje aspiracional. Bajar de él falla el gate. Subirlo es un cambio versionado y visible en
el diff. Un umbral inventado por encima de lo medido sería la misma clase de afirmación cómoda
que el sistema persigue en los demás.

### CA-03 · Las páginas publicadas se auditan

`scripts/check-a11y.mjs` recorre las páginas de `site/` y falla si una carece de `lang`, de
`title` con contenido, si una imagen informativa no tiene `alt`, si no hay región principal, si
los encabezados saltan un nivel o si un control de formulario no tiene nombre accesible. Lo que
no se puede comprobar sin navegador —contraste calculado, foco visible, orden de tabulación
real— queda declarado como no cubierto, con su motivo, en la misma tabla que el resto.

### CA-04 · La longitud se vigila; la complejidad, no

`scripts/check-smells.mjs` mide longitud de fichero y de función contra los máximos de
`.sdd/smells.json`, fijados también por trinquete sobre lo medido. No evalúa complejidad
ciclomática: no hay analizador sin dependencias que la calcule con fiabilidad, y una métrica mal
calculada es peor que ninguna.

### CA-05 · Cada ausencia declara de qué clase es

La tabla de `docs/quality/TEST-STRATEGY.md` §10 gana una columna `Clase`. `typecheck` y
`deps-audit` son `no-aplica` porque no hay TypeScript ni árbol de dependencias que auditar;
`docs` pasa a `se-ejecuta-en-otro-sitio` nombrando el flujo de CI que lo corre; lo que quede
pendiente lo dice. Una comprobación falla si una ausencia no trae clase, si la clase no es una
de las tres, o si un gate `se-ejecuta-en-otro-sitio` no nombra dónde.

### CA-06 · Un motivo caducado falla

Una comprobación contrasta las afirmaciones de inexistencia contra el árbol real: si un motivo
sostiene que no hay interfaz gráfica y existen páginas publicadas, falla nombrándolas. Es la
generalización del descuido que esta spec corrige, para que no haga falta que alguien se acuerde
de releer la tabla.

### CA-07 · El peaje rápido sigue siendo rápido

`coverage`, `a11y` y `mutation` se declaran lentos. `smells` cabe en los rápidos. `run --fast`
sigue midiéndose en segundos, porque un gate previo al commit que tarda minutos se desactiva.

## 5. Trazabilidad de producto

| Objetivo | Requisito de producto | Caso de uso | Requisito | Criterio |
|---|---|---|---|---|
| OBJ-002 | PRD-RF-003 | UC-004 | RF-01 | CA-01 |
| OBJ-002 | PRD-RF-003 | UC-004 | RF-02 | CA-02 |
| OBJ-002 | PRD-RF-004 | UC-004 | RF-03 | CA-03 |
| OBJ-002 | PRD-RF-004 | UC-004 | RF-04 | CA-04 |
| OBJ-003 | PRD-RF-006 | UC-001 | RF-05 | CA-05 |
| OBJ-003 | PRD-RF-006 | UC-001 | RF-06 | CA-06 |
| OBJ-002 | PRD-RF-004 | UC-004 | RF-07 | CA-07 |

## 6. Fuera de alcance

- No se mide complejidad ciclomática. Ver CA-04.
- No se implementa regresión visual. Sigue ausente y su motivo se reescribe para decir lo que
  falta de verdad —un presupuesto de capturas sin dependencias—, no que no haya interfaz.
- No se implementa un motor de mutación. La ausencia se conserva con su motivo.
- No se auditan contraste calculado, foco visible ni orden de tabulación real: exigen navegador.
- No se cambia el esquema de `.sdd/checks.json`. La clase de la ausencia vive en la estrategia de
  test, donde ya vive el motivo, y no obliga a versionar el fichero ni a tocar el instalador.
- No se miden tasa de defectos ni coste en tokens. Es la línea «métricas de efectividad» del
  trabajo futuro y necesita una serie temporal que empieza a acumularse ahora, no una spec.

## 7. Riesgos

| Riesgo | Mitigación |
|---|---|
| El umbral de cobertura se convierte en un número decorativo | Se fija por trinquete sobre lo medido y bajarlo es un cambio visible en el diff, no una configuración olvidada |
| La cobertura por V8 mide bytes ejecutados y no comportamiento probado | Se declara explícitamente en la estrategia de test: es un suelo que detecta código nunca recorrido, no una prueba de suficiencia |
| El gate de accesibilidad da falsa tranquilidad sobre WCAG | Lo que no se comprueba se enumera junto a lo que sí, en la misma tabla, como exige la regla dura 13 |
| Los gates de medición alargan el peaje previo al commit | Se declaran lentos; una comprobación asevera que los rápidos siguen siendo cuatro y terminan en segundos |
| Las rutas con espacios y las tildes rompen el mapeo de cobertura en Windows | La URL se decodifica antes de resolverla y los desplazamientos se cuentan sobre la cadena, no sobre el búfer; ambos casos tienen su comprobación |
