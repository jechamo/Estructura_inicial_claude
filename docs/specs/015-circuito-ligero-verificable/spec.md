# 015 · Circuito ligero verificable y la séptima superficie

| Campo | Valor |
|---|---|
| **ID** | `015-circuito-ligero-verificable` |
| **Estado** | en implementación |
| **Autor** | usuario + `spec-analyst` (`declared-direct`) |
| **Fecha** | 2026-08-18 |
| **Rama** | `main` · trabajo local solicitado por el usuario |
| **Depende de** | `013-verificacion-independiente-del-host`, `014-gates-propios-y-medicion` |
| **Baseline de producto** | `approved` · `docs/product/PRD.md` |
| **Impacto de seguridad** | `sensible` |
| **Impacto de usabilidad** | `aplicable` |
| **Impacto de documentación** | `aplicable · DOC-CIRCUITO` |

> Capacidad interna de la plantilla: no crea requisitos de producto ni decisiones de dominio.

## 1. Problema

El circuito cobra el mismo peaje por renombrar una variable interna que por cambiar una regla de
autorización. Cinco documentos —spec, plan, tareas, plan de test y evidencia— para corregir una
errata del README. El coste no es solo de tiempo: es de tokens, y sobre todo de credibilidad.

Un peaje desproporcionado no se obedece: se rodea. Y se rodea de la peor manera posible, que no
es saltárselo abiertamente sino **declarar que se pasó**. La spec `013` ya demostró que este
sistema tolera esa clase de mentira durante meses: un bloque de tests que no se ejecutaba nunca
seguía contando como verde. Cuando el peaje es absurdo, esa tentación deja de ser un descuido y
se convierte en la salida racional.

Existe un precedente que funciona. `/docs-sync` es ya un circuito ligero: documenta sin spec
funcional y sin TDD de aplicación, y lleva escrita su propia frontera —«si la petición cambia
comportamiento, contrato, arquitectura, seguridad o persistencia, detente»—. Lleva ocho specs sin
haber degradado nada. Pero solo cubre documentación, y el problema no es solo documental.

Al mismo tiempo, este repositorio publica desde la spec `009` un sitio que **enumera los veinte
agentes y las veintiséis skills a mano**, en prosa escrita por una persona, con los recuentos
incrustados en el HTML. `check-sdd` comprueba la paridad de los agentes en seis superficies y no
mira la séptima, que es precisamente la única que ve el público.

## 2. Objetivo

Hacer que el peaje sea proporcional al riesgo sin que el atajo sea una afirmación no
contrastable: la frontera se decide por ruta y no por criterio, el atajo se declara y se audita,
y su uso se mide. Y cerrar la superficie publicada, que hoy puede mentir sin que nada falle.

## 3. Requisitos

| Id | Requisito EARS | Prioridad | Esfuerzo |
|---|---|---|---:|
| RF-01 | CUANDO se evalúe si un cambio cabe en el circuito ligero, el sistema DEBE decidirlo comparando las rutas tocadas contra una frontera declarada en `.sdd/lightweight.json`, en la que una lista de negación prevalece sobre cualquier permiso. | M | M |
| RF-02 | CUANDO se use el circuito ligero, el sistema DEBE dispensar únicamente de los documentos de la spec, y NUNCA de los gates: los rápidos siguen corriendo antes del commit y los lentos antes de integrar. | M | S |
| RF-03 | SI un commit declara `Circuit: light` y toca una ruta fuera de la frontera, la auditoría de traza DEBE fallar nombrando las rutas que lo desmienten. | M | M |
| RF-04 | CUANDO un commit declare `Circuit: light`, DEBE acompañarlo un motivo material; un motivo vacío, de una palabra o de relleno DEBE rechazarse igual que su ausencia. | M | S |
| RF-05 | CUANDO se audite una ventana de commits, el sistema DEBE informar de la proporción que usó el circuito ligero y DEBE fallar en modo estricto si supera la cuota declarada. | S | M |
| RF-06 | CUANDO alguien pregunte si un cambio cabe en el circuito ligero, el sistema DEBE responderlo de forma determinista sobre las rutas realmente modificadas, sin que el agente tenga que juzgarlo. | M | M |
| RF-07 | CUANDO el sitio publicado enumere agentes o skills, una comprobación DEBE contrastar esos identificadores y sus recuentos contra los catálogos reales y fallar ante cualquier divergencia. | M | M |

## 4. Criterios de aceptación

### CA-01 · La frontera se calcula, no se opina

`.sdd/lightweight.json` declara `permitido` y `prohibido` como listas de rutas. Un fichero entra
en el circuito ligero solo si alguna entrada de `permitido` lo cubre y **ninguna** de `prohibido`
lo alcanza. El dominio, los contratos, la autorización, la persistencia, los esquemas, los hooks,
los agentes, las skills, los gates y las propias specs quedan fuera por construcción, no por
buen juicio de quien pide el cambio. Si el fichero no existe, no hay circuito ligero: la ausencia
de frontera no es una frontera infinita.

### CA-02 · Lo que se perdona es el papeleo, no la verificación

El circuito ligero dispensa de `spec.md`, `plan.md`, `tasks.md`, `test-plan.md` y `evidence.md`.
No dispensa de ningún gate: `run --fast` sigue corriendo antes del commit y los lentos antes de
integrar. Tampoco dispensa de la bitácora ni de los trailers. Un circuito que apagase gates sería
otra cosa —un permiso para no comprobar— y esta spec no lo concede.

### CA-03 · El atajo es falsable

`check-sdd --trace-audit` clasifica cada commit `Circuit: light` y falla si tocó una ruta que la
frontera no cubre, nombrándola. El atajo deja de ser una afirmación del autor y pasa a ser una
afirmación contrastable contra el diff, sobre git, que es el sustrato común a los seis entornos.

### CA-04 · Un motivo de relleno no es un motivo

`Circuit-reason:` exige texto material con la misma vara que ya se aplica a `Trace-exception:`:
se rechazan el vacío, la palabra suelta y las fórmulas de relleno. Escribir por qué se toma un
atajo es barato; que nadie pueda leerlo después es lo caro.

### CA-05 · La cuota vigila la frontera, no al autor

La auditoría informa siempre de la proporción de commits ligeros en la ventana. Si supera el
máximo declarado, avisa en modo normal y falla en `--strict`. Superarla no significa que alguien
haya hecho trampa: significa que **la frontera está mal trazada** y hay que revisarla. El número
existe para poner en duda la regla, no para señalar a quien la usa.

### CA-06 · Preguntar es determinista y barato

`node scripts/check-sdd.mjs --circuit-status` responde `light` o `full` sobre los ficheros
realmente modificados, con la lista de los que obligan al circuito completo. La skill `/sdd-light`
empieza ejecutándolo: el agente no decide si el atajo aplica, lo consulta. Un juicio delegado a un
modelo es exactamente el punto donde la frontera se erosionaría.

### CA-07 · La séptima superficie no puede mentir

`check-sdd` contrasta los identificadores de agentes y skills de `site/assets/js/datos.mjs`
contra `.claude/agents/**` y `.agents/skills/**`, en ambas direcciones, y comprueba que los
recuentos escritos a mano en `site/index.html` coinciden con los reales. La prosa que describe
cada uno sigue siendo humana: se verifica el inventario, no la redacción.

## 5. Trazabilidad de producto

| Objetivo | Requisito de producto | Caso de uso | Requisito | Criterio |
|---|---|---|---|---|
| OBJ-002 | PRD-RF-004 | UC-004 | RF-01 | CA-01 |
| OBJ-002 | PRD-RF-004 | UC-004 | RF-02 | CA-02 |
| OBJ-002 | PRD-RF-003 | UC-004 | RF-03 | CA-03 |
| OBJ-002 | PRD-RF-003 | UC-004 | RF-04 | CA-04 |
| OBJ-002 | PRD-RF-003 | UC-004 | RF-05 | CA-05 |
| OBJ-002 | PRD-RF-004 | UC-004 | RF-06 | CA-06 |
| OBJ-003 | PRD-RF-006 | UC-001 | RF-07 | CA-07 |

## 6. Fuera de alcance

- No se genera el contenido del sitio ni los perfiles de agente. Las seis superficies de agentes
  tienen vocabularios de herramientas distintos y prosa propia; unificarlas mecánicamente las
  aplanaría al mínimo común. Se verifica el inventario, no se sustituye a quien escribe.
- No se añade `agents-sync.mjs`. `check-sdd` ya comprueba la paridad de agentes en las seis
  superficies desde la spec `002`; un generador nuevo duplicaría esa comprobación.
- No se aplica el circuito ligero hacia atrás. Los commits anteriores a esta spec no declaran
  `Circuit:` y siguen clasificándose como hoy.
- No se automatiza la decisión de mover la frontera. Superada la cuota, el sistema avisa; quién
  la reescribe y con qué criterio es una decisión humana que deja rastro en el diff.
- No se mide el ahorro de tokens del circuito ligero. Exige una serie temporal que empieza a
  acumularse ahora.

## 7. Riesgos

| Riesgo | Impacto | Mitigación |
|---|---|---|
| El circuito ligero se convierte en la vía por defecto y disuelve el sistema | Crítico | Frontera por ruta con negación prevalente (CA-01), auditoría falsable (CA-03) y cuota con aviso y fallo estricto (CA-05). Las tres entran juntas o no entra ninguna. |
| Alguien amplía `permitido` para colar un cambio de riesgo | Alto | La lista de negación prevalece y vive versionada; ampliarla es un diff visible y revisable, no una decisión de tiempo de ejecución. |
| El agente decide por su cuenta que un cambio es ligero | Alto | La decisión es determinista y externa (CA-06); la skill consulta, no juzga. |
| La comprobación de la séptima superficie obliga a escribir prosa mecánica | Medio | Solo se verifican identificadores y recuentos; la descripción de cada agente y skill sigue siendo humana (CA-07). |
