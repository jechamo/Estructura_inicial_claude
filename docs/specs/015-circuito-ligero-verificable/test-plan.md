# Plan de test · 015-circuito-ligero-verificable

| Campo | Valor |
|---|---|
| **Spec** | [`spec.md`](./spec.md) · **Plan**: [`plan.md`](./plan.md) · **Tareas**: [`tasks.md`](./tasks.md) |
| **Arnés** | suites propias del repositorio, sin dependencias externas |
| **Suites** | `scripts/test-hooks.mjs`, `scripts/test-install.mjs` |

## 1. Estrategia

Esta spec construye una puerta y todo lo que importa está en la cerradura. Probar que la puerta
se abre es trivial y no dice nada; lo que hay que probar es que **no se abre cuando no debe**.
Así que cada caso relevante es un caso hostil: un fichero que intenta colarse por la frontera, un
commit que afirma algo que su diff desmiente, un motivo que ocupa espacio sin decir nada.

Hay una trampa concreta que conviene nombrar. Es tentador probar la frontera con las rutas reales
de este repositorio, porque están a mano. Pero entonces el test dejaría de fallar en cuanto
alguien ampliase `.sdd/lightweight.json`, que es exactamente el cambio peligroso que debería
hacerlo saltar. Los casos de frontera usan **fronteras fabricadas por el propio test**, y el
contenido real del repositorio se comprueba aparte, como un caso más.

La segunda trampa es la simétrica en la auditoría. Contrastar `Circuit: light` sobre el historial
real produciría verde hoy —no hay ningún commit ligero todavía— y seguiría produciéndolo si la
comprobación no mirase nada. Los casos de auditoría construyen un repositorio git temporal con
commits fabricados: uno honesto, uno que miente y uno sin motivo.

El reparto entre suites sigue el criterio establecido. Cálculo puro —decidir si una ruta cae
dentro de la frontera, si un motivo es material, si una proporción supera la cuota— va a
`scripts/test-hooks.mjs` sin proceso hijo. Lo que exige ejecutar el CLI y leer su salida real va a
`scripts/test-install.mjs`.

## 2. Casos por criterio de aceptación

| CA | Test | Suite | Qué falsaría el criterio |
|---|---|---|---|
| CA-01 | `la_negacion_prevalece_sobre_el_permiso` | `scripts/test-hooks.mjs` | Que un fichero cubierto a la vez por `permitido` y por `prohibido` salga ligero; que una frontera ausente conceda permiso; que `..` o un separador de Windows escapen de la comparación |
| CA-06 | `circuit_status_nombra_lo_que_obliga_al_circuito_completo` | `scripts/test-install.mjs` | Que la respuesta sea un veredicto sin decir qué fichero lo provoca; que ignore el índice; que no admita `--json` |
| CA-03 | `un_commit_ligero_que_miente_falla` | `scripts/test-install.mjs` | Que un commit `Circuit: light` que toca `scripts/` se corrobore; que el hallazgo no nombre la ruta; que un commit ligero honesto exija `Spec:` |
| CA-04 · CA-05 | `la_cuota_senala_la_frontera` | `scripts/test-install.mjs` | Que un motivo vacío, de una palabra o de relleno pase; que la proporción no se informe; que la cuota falle fuera de `--strict` o que el mensaje culpe al autor en vez de a la frontera |
| CA-02 | `el_circuito_ligero_no_perdona_ningun_gate` | `scripts/test-install.mjs` | Que la skill mencione omitir, saltar o desactivar un gate; que no enumere lo que sigue siendo obligatorio; que no empiece consultando `--circuit-status` |
| CA-02 | `el_modelo_operativo_describe_el_circuito_ligero` | `scripts/test-install.mjs` | Que el modelo operativo no nombre la frontera, el trailer o lo que el circuito ligero no dispensa |
| CA-07 | `el_sitio_publicado_no_puede_mentir_sobre_el_catalogo` | `scripts/test-install.mjs` | Que un agente del catálogo real falte en el sitio, que el sitio anuncie uno inexistente, o que los recuentos escritos a mano en el HTML no coincidan con los reales |

## 3. Casos por control de seguridad

| Control | Test | Entrada hostil |
|---|---|---|
| SEC-LIGHT-001 | `scripts/test-hooks.mjs::la_negacion_prevalece_sobre_el_permiso` | `docs/../scripts/install.mjs`; `docs\guides\..\..\scripts\install.mjs`; una frontera que declara `permitido: ["**"]`; una ruta absoluta fuera de la raíz |
| SEC-LIGHT-002 | `scripts/test-hooks.mjs::sin_frontera_no_hay_circuito_ligero` | Frontera ausente; frontera con JSON inválido; frontera con `permitido` vacío; frontera sin la clave `prohibido` |
| SEC-LIGHT-003 | `scripts/test-install.mjs::un_commit_ligero_que_miente_falla` | Commit con `Circuit: light` que toca `scripts/check-sdd.mjs`; commit que toca a la vez una ruta permitida y una prohibida; commit con el trailer escrito en otra caja |

## 4. Casos por control de usabilidad

| Control | Test | Qué se asevera del mensaje |
|---|---|---|
| UX-COPY-004 | `scripts/test-install.mjs::circuit_status_nombra_lo_que_obliga_al_circuito_completo` | Que enumera las rutas concretas que obligan al circuito completo, no solo el veredicto |
| UX-COPY-005 | `scripts/test-install.mjs::la_cuota_senala_la_frontera` | Que el mensaje de cuota superada nombra la frontera como sospechosa y propone revisarla, sin señalar a ningún autor |

## 4.1 Comprobación documental

| DOC-ID | Artefacto | Tarea | Gate/test |
|---|---|---|---|
| DOC-CIRCUITO | `docs/sdd/OPERATING-MODEL.md` | T-015-06 | `scripts/test-install.mjs::el_modelo_operativo_describe_el_circuito_ligero` |

## 5. Lo que estos tests no cubren

- **Que la frontera esté bien trazada.** Los tests comprueban que se aplica como está escrita, no
  que su contenido sea el correcto. Eso es un juicio humano, y la cuota de CA-05 existe
  precisamente porque ese juicio puede estar equivocado y conviene enterarse.
- **Que nadie edite `.sdd/lightweight.json` para colar un cambio.** Ampliar la frontera es un diff
  visible sobre un fichero prohibido —y por tanto nunca ligero—, así que exige circuito completo;
  pero quien revise ese diff sigue siendo una persona.
- **El ahorro real de tokens.** Se necesita una serie temporal que empieza a acumularse ahora.
