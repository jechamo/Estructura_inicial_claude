# Plan de test · 014-gates-propios-y-medicion

| Campo | Valor |
|---|---|
| **Spec** | [`spec.md`](./spec.md) · **Plan**: [`plan.md`](./plan.md) · **Tareas**: [`tasks.md`](./tasks.md) |
| **Arnés** | suites propias del repositorio, sin dependencias externas |
| **Suites** | `scripts/test-hooks.mjs`, `scripts/test-install.mjs` |

## 1. Estrategia

Hay una tentación evidente en esta spec y conviene nombrarla para no caer en ella: comprobar los
gates nuevos ejecutándolos sobre este repositorio y aceptar el verde como prueba. Eso verifica
que el script termina, no que decida bien. Un gate que siempre pasa es indistinguible de un gate
que no mira nada, que es exactamente el defecto que la spec `013` encontró en los territorios.

Por eso cada verificador nuevo se prueba **contra un caso que debe fallar**, construido por el
propio test: un HTML sin `lang`, un volcado de cobertura con rangos sin recorrer, un motivo de
ausencia que afirma algo falso. El verde sobre el repositorio real es un caso más, no el caso.

El reparto entre las dos suites sigue el criterio ya establecido. Lo que es cálculo puro —resolver
una URL de volcado, decidir si una ruta cae dentro del árbol— va a `scripts/test-hooks.mjs`, sin
proceso hijo. Lo que exige ejecutar el CLI de verdad y leer su salida va a
`scripts/test-install.mjs`, que ya construye árboles temporales.

Ningún test depende de la cobertura que haya hoy: aseverar un porcentaje concreto convertiría
cualquier refactor en un fallo espurio y el trinquete acabaría desactivado. Lo que se asevera es
el **comportamiento del umbral**, con volcados fabricados.

## 2. Casos por criterio de aceptación

| CA | Test | Suite | Qué falsaría el criterio |
|---|---|---|---|
| CA-01 | `la_cobertura_no_lee_fuera_del_repositorio` | `scripts/test-hooks.mjs` | Que una URL percent-encoded con espacios no resuelva, que una que apunta fuera del árbol se lea, o que un fichero con tildes desalinee los desplazamientos |
| CA-02 | `los_gates_nuevos_no_invocan_shell` | `scripts/test-install.mjs` | Que un porcentaje por debajo del umbral termine en verde, que el umbral no esté versionado, o que algún gate nuevo interpole en una shell |
| CA-02 | `el_fallo_de_cobertura_dice_que_falta` | `scripts/test-install.mjs` | Que el fallo no nombre porcentaje medido, umbral vigente y ficheros responsables |
| CA-03 | `el_sitio_publicado_pasa_su_propia_auditoria` | `scripts/test-install.mjs` | Que una página sin `lang`, sin `title`, con salto de encabezado o con un control sin nombre accesible pase; o que las páginas reales del sitio no pasen |
| CA-05 | `cada_ausencia_declara_su_clase` | `scripts/test-install.mjs` | Que una ausencia sin clase, con clase no admitida, o `se-ejecuta-en-otro-sitio` sin decir dónde, pase la comprobación |
| CA-06 | `un_motivo_caducado_falla` | `scripts/test-install.mjs` | Que un motivo que niega una superficie presente en el árbol versionado siga pasando |
| CA-04 · CA-07 | `el_peaje_rapido_sigue_siendo_rapido` | `scripts/test-install.mjs` | Que `coverage` o `a11y` acaben en los rápidos, que `smells` no mida longitud, o que un gate quede a la vez configurado y declarado ausente |

## 3. Casos por control de seguridad

| Control | Test | Entrada hostil |
|---|---|---|
| SEC-COV-001 | `scripts/test-hooks.mjs::la_cobertura_no_lee_fuera_del_repositorio` | `file:///C:/Users/x/OneDrive%20-%20Empresa/repo/scripts/a.mjs`; una URL a `../../etc/passwd`; una URL con esquema `http:`; un módulo interno de Node |
| SEC-COV-002 | `scripts/test-install.mjs::los_gates_nuevos_no_invocan_shell` | Comando declarado en `.sdd/checks.json` con `|`, `&`, `;`, `>`, backtick o `$` |

## 4. Casos por control de usabilidad

| Control | Test | Qué se asevera del mensaje |
|---|---|---|
| UX-A11Y-002 | `scripts/test-install.mjs::el_sitio_publicado_pasa_su_propia_auditoria` | Que el hallazgo nombra la página, la regla incumplida y el elemento concreto |
| UX-COPY-003 | `scripts/test-install.mjs::el_fallo_de_cobertura_dice_que_falta` | Que contiene el porcentaje medido, el umbral vigente y los ficheros que más lo bajan |

## 4.1 Comprobación documental

| DOC-ID | Artefacto | Tarea | Gate/test |
|---|---|---|---|
| DOC-QUALITY | `docs/quality/TEST-STRATEGY.md` | T-014-05 | `scripts/test-install.mjs::cada_ausencia_declara_su_clase` |

## 5. Fuera del alcance de esta verificación

No se verifica contraste calculado, foco visible ni orden de tabulación real: exigen un navegador
y esta spec renuncia a añadir uno. No se verifica que la cobertura medida implique comportamiento
probado; se verifica que el número sea el que corresponde a los volcados leídos. La diferencia
entre esas dos frases es justamente lo que la estrategia de test debe conservar por escrito.

## 6. Comandos

```text
node scripts/check-coverage.mjs --selftest
node scripts/check-a11y.mjs --selftest
node scripts/check-smells.mjs --selftest
node scripts/test-hooks.mjs
node scripts/test-install.mjs
node scripts/check-sdd.mjs --strict --spec 014
node scripts/sdd-project.mjs trace-status --spec 014 --json
```
