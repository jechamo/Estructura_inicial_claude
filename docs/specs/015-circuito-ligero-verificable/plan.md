# 015 · Plan técnico

| Campo | Valor |
|---|---|
| **Spec** | `015-circuito-ligero-verificable` |
| **Estado** | en implementación |
| **Fecha** | 2026-08-18 |

## 1. Enfoque

La idea central es una sola: **el circuito ligero no reduce la verificación, reduce el papeleo**.
Todo lo demás se deriva de ahí. Lo que se dispensa son cinco documentos; lo que no se dispensa es
ningún gate, ninguna entrada de bitácora y ningún trailer. Formulado así, el atajo deja de ser un
permiso para no comprobar y pasa a ser un permiso para no describir por adelantado un cambio cuyo
riesgo ya está acotado por la ruta que toca.

Esa distinción es la que salva la tesis. Un circuito ligero que apagase gates sería una puerta
trasera con nombre elegante, y bastaría para disolver todo lo construido en catorce specs. Un
circuito ligero que mantiene los gates y quita los documentos ahorra exactamente lo que sobra —el
coste de tokens y de tiempo del expediente— sin tocar lo que protege.

De ahí salen tres piezas que **entran juntas o no entra ninguna**, porque cada una tapa el agujero
que dejan las otras dos:

1. **La frontera se calcula.** Si la decide un modelo leyendo el prompt, la frontera es la
   elocuencia de quien pide el cambio. Se decide por ruta, contra un fichero versionado.
2. **El atajo es falsable.** Declarar `Circuit: light` no lo convierte en cierto. La auditoría
   de traza de la spec `013` ya recorre commits y contrasta afirmaciones contra el diff; aquí se
   le añade una afirmación más que contrastar. Cero scripts nuevos.
3. **El uso se mide.** Si el circuito ligero absorbe la mayoría de los commits, la conclusión no
   es que la gente haga trampa: es que la frontera está mal trazada. La cuota existe para poner
   la regla en duda.

La séptima superficie es un problema distinto que viaja en la misma spec por afinidad: también es
una afirmación pública que nada contrasta. El sitio dice «20 agentes · 26 skills» en HTML escrito
a mano y enumera cada uno en `datos.mjs`. `check-sdd` ya compara seis superficies de agentes entre
sí desde la spec `002` y no mira la única que ve alguien de fuera. Añadir la séptima es media
docena de comparaciones de conjuntos sobre ficheros que ya se leen.

## 2. Decisiones

### D-01 · La negación prevalece sobre el permiso

`.sdd/lightweight.json` tiene dos listas y un orden: un fichero es ligero si `permitido` lo cubre
y `prohibido` no lo alcanza. El orden importa porque los errores humanos son asimétricos. Ampliar
`permitido` de más es fácil —`docs/**` parece inofensivo hasta que uno recuerda que ahí viven la
constitución, el PRD y las specs—, y la lista de negación es la red que atrapa esa ampliación
descuidada. Al revés no funciona: una negación demasiado amplia solo produce papeleo de más, que
es un fallo visible y molesto, no silencioso.

### D-02 · Sin fichero no hay circuito ligero

Si `.sdd/lightweight.json` no existe, `--circuit-status` responde `full`. La alternativa —tratar
la ausencia como permiso total— convertiría un despiste en la desactivación del sistema entero.
Es la misma regla que ya siguen `coverage` y `smells` desde la spec `014`, pero al revés y por la
misma razón: allí la ausencia de calibración no puede fingir verde, aquí la ausencia de frontera
no puede fingir permiso.

### D-03 · La frontera inicial es deliberadamente pequeña

Arranca con guías, README, CONTRIBUTING, runbooks, catálogo de agentes y las páginas del sitio.
Fuera quedan `scripts/**`, `.sdd/**`, `.claude/**`, `.github/**`, `.agents/**`, `docs/specs/**`,
`docs/architecture/**`, `docs/product/**`, `docs/security/**`, `docs/quality/**` y `package.json`.
Es más restrictiva de lo que probablemente conviene, y eso es intencionado: ampliar una frontera
que aprieta es un diff de dos líneas que alguien revisa; recuperar la confianza en una frontera
que dejó pasar un cambio de autorización no lo es.

### D-04 · La comprobación se monta sobre `--trace-audit`, no al lado

La spec `013` ya construyó el recorrido de commits, el parseo de trailers, la lectura del diff y
el vocabulario de salida —`corroborado`, `no auditable`, `con hallazgos`—. `Circuit: light` es una
afirmación más de la misma naturaleza que `Trace-exception:`: alguien dice algo sobre su propio
commit y el sistema lo contrasta. Reutilizarlo cuesta una función; duplicarlo costaría un script,
una superficie de test y una segunda forma de decir lo mismo.

### D-05 · La cuota avisa siempre y falla solo en estricto

Fallar en cada commit por una proporción histórica castigaría a quien no ha hecho nada mal: el
commit que cruza el umbral puede ser el más inocente de la ventana. El repositorio ya tiene el
idioma para esto —`STRICT ? err : warn`— y se usa igual aquí. El aviso es permanente y visible; el
fallo llega en el momento en que alguien ya está mirando el conjunto.

### D-06 · Preguntar es un flag, no un subcomando nuevo

`check-sdd --circuit-status` en vez de un `sdd-project light-check`. `check-sdd` ya lee el
repositorio, ya sabe hablar `--json` y ya es el punto único de verdad sobre el estado del
circuito. Un subcomando nuevo obligaría a mantener dos rutas de entrada para la misma pregunta y a
documentar cuál manda cuando discrepan.

### D-07 · Del sitio se verifica el inventario, nunca la prosa

Los identificadores y los recuentos son hechos y se comprueban. La descripción de cada agente
—«Puerta de entrada. Clasifica la petición y decide la fase; solo lectura.»— es una frase escrita
por una persona para alguien que llega de fuera, y generarla desde el frontmatter la degradaría a
la descripción técnica que ya está en otra parte. La comprobación falla si falta un agente o
sobra una skill; no opina sobre cómo se cuentan.

### D-08 · La skill consulta, no juzga

`/sdd-light` empieza ejecutando `--circuit-status` y obedece la respuesta. No lleva heurísticas
propias, ni ejemplos de «esto suele ser ligero», ni margen de interpretación. El único punto del
sistema donde un modelo podría erosionar la frontera es el punto donde se le pide que la aplique
de memoria, y esta skill no se lo pide.

## 3. Alternativas descartadas

| Alternativa | Por qué no |
|---|---|
| Que el `sdd-router` clasifique el cambio por el texto del prompt | El router orienta, y ya lo hará; pero la decisión vinculante no puede depender de cómo esté redactada la petición. Se decide sobre las rutas del diff |
| Una etiqueta en la spec en vez de un trailer de commit | Un circuito que dispensa de escribir la spec no puede exigir un campo dentro de la spec |
| Añadir `agents-sync.mjs` que genere las seis superficies | Cada superficie tiene vocabulario de herramientas propio y prosa distinta; generarlas las aplanaría al mínimo común. Y `check-sdd` ya comprueba su paridad desde la spec `002` |
| Generar `site/assets/js/datos.mjs` desde los catálogos | Ver D-07. La descripción de cada agente es texto de divulgación, no metadato |
| Hacer que la cuota bloquee siempre | Ver D-05. Castiga al commit equivocado y enseña a rodear la medida, que es justo lo que esta spec intenta evitar |
| Dejar la frontera implícita en la skill, como hace `/docs-sync` | Funcionó para documentación porque el límite era una frase clara. Para código no lo es, y una frase no se puede auditar contra un diff |

## 4. Matriz de controles de seguridad

| Control | ASVS | OWASP | Aplica | Decisión | Tarea | Test | Evidencia |
|---|---|---|---|---|---|---|---|
| SEC-LIGHT-001 | 5.0.0 · V4.1.3 | A01:2025 | sí | La frontera se evalúa por ruta normalizada contra listas versionadas, y la negación prevalece; ningún permiso puede alcanzar dominio, contratos, autorización, persistencia, hooks, agentes ni gates | T-015-01 | `scripts/test-hooks.mjs::la_negacion_prevalece_sobre_el_permiso` | evidence.md#SEC-LIGHT-001 |
| SEC-LIGHT-002 | 5.0.0 · V1.14.6 | A04:2025 | sí | La ausencia de `.sdd/lightweight.json` deniega el circuito ligero en vez de concederlo; un despiste no puede desactivar el control | T-015-01 | `scripts/test-hooks.mjs::sin_frontera_no_hay_circuito_ligero` | evidence.md#SEC-LIGHT-002 |
| SEC-LIGHT-003 | 5.0.0 · V4.1.3 | A09:2025 | sí | La declaración `Circuit: light` se contrasta contra las rutas reales del commit; un commit que la declare y toque ruta prohibida falla nombrando la ruta | T-015-03 | `scripts/test-install.mjs::un_commit_ligero_que_miente_falla` | evidence.md#SEC-LIGHT-003 |
| SEC-COV-001 | 5.0.0 · V4.1.3 | A01:2025 | no | La lectura de volcados de cobertura no cambia en esta spec; lo verifica la `014` | — | — | — |
| SEC-TERR-001 | 5.0.0 · V4.1.3 | A01:2025 | no | El reparto de territorios no cambia en esta spec; lo verifica la `013` | — | — | — |

## 5. Matriz de controles de usabilidad

| Control | WCAG 2.2 | Heurística | Aplica | Decisión | Tarea | Test | Evidencia |
|---|---|---|---|---|---|---|---|
| UX-COPY-004 | n/a | H9 | sí | `--circuit-status` responde `full` nombrando los ficheros concretos que lo obligan, no un veredicto sin salida | T-015-02 | `scripts/test-install.mjs::circuit_status_nombra_lo_que_obliga_al_circuito_completo` | evidence.md#UX-COPY-004 |
| UX-COPY-005 | n/a | H9 | sí | Superada la cuota, el mensaje señala la frontera como sospechosa y no al autor del commit | T-015-04 | `scripts/test-install.mjs::la_cuota_senala_la_frontera` | evidence.md#UX-COPY-005 |
| UX-A11Y-002 | 2.2 · 1.3.1, 2.4.6, 3.1.1 | H4 | no | Las páginas publicadas no cambian de estructura; el gate `a11y` de la `014` sigue cubriéndolas en cada ejecución | — | — | — |
| UX-FORM-001 | n/a | H5 | no | Esta spec no añade formularios ni entrada interactiva | — | — | — |

## 6. Documentación

| DOC-ID | Aplica | Fuente | Artefacto | Propietario | Tarea | Gate/test | Evidencia |
|---|---|---|---|---|---|---|---|
| DOC-CIRCUITO | sí | `.sdd/lightweight.json`, `.agents/skills/sdd-light/SKILL.md`, `scripts/check-sdd.mjs` | `docs/sdd/OPERATING-MODEL.md` | docs-writer | T-015-06 | `scripts/test-install.mjs::el_modelo_operativo_describe_el_circuito_ligero` | `evidence.md#DOC-CIRCUITO` |

## 7. Impacto en ficheros

| Fichero | Cambio |
|---|---|
| `scripts/lib/circuito.mjs` | nuevo · cálculo puro de la frontera y de la cuota |
| `.sdd/lightweight.json` | nuevo · frontera declarada del repositorio |
| `scripts/check-sdd.mjs` | `--circuit-status`, verificación de `Circuit: light` en `--trace-audit`, cuota y séptima superficie |
| `.agents/skills/sdd-light/SKILL.md` | nuevo · skill 27 del contrato |
| `.claude/skills/sdd-light/SKILL.md` | generado por `skills-sync` |
| `.sdd/hooks/sdd-router.mjs` | sugiere `/sdd-light` cuando el cambio parece de bajo riesgo, sin decidirlo |
| `scripts/lib/manifiesto.mjs` | alta en la lista blanca de `scripts/lib` y semilla neutra de la frontera |
| `site/assets/js/datos.mjs` | alta de `sdd-light` en el grupo `circuito` |
| `site/index.html` | recuentos, sección del circuito ligero y pregunta frecuente |
| `docs/sdd/OPERATING-MODEL.md` | describe el circuito ligero, su frontera y su límite |
| `scripts/test-hooks.mjs` | frontera, cuota y sugerencia del router |
| `scripts/test-install.mjs` | atajo falsable, microcopy, séptima superficie y contrato de 27 skills |

## 8. Verificación

```text
node scripts/check-sdd.mjs --circuit-status
node scripts/check-syntax.mjs
node scripts/skills-sync.mjs --check
node scripts/test-hooks.mjs
node scripts/test-install.mjs
node scripts/check-sdd.mjs --strict --spec 015
node scripts/sdd-project.mjs trace-status --spec 015 --json
node scripts/sdd-project.mjs run --fast
node scripts/check-sdd.mjs --strict
node scripts/check-sdd.mjs --trace-audit --base HEAD~1
```
