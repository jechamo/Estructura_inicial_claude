# 014 · Plan técnico

| Campo | Valor |
|---|---|
| **Spec** | `014-gates-propios-y-medicion` |
| **Estado** | en implementación |
| **Fecha** | 2026-08-18 |

## 1. Enfoque

Tres de los cuatro problemas se resuelven con la misma idea: **el motivo de una ausencia es una
afirmación sobre el mundo, y una afirmación sobre el mundo se puede contrastar contra el mundo**.
El cuarto —medir cobertura— se resuelve dándose cuenta de que la restricción que lo impedía ya no
existe.

Sobre lo primero. La tabla de §10 de la estrategia de test contiene frases como «la plantilla no
tiene interfaz gráfica». Eso no es una opinión: es una proposición verificable contra
`git ls-files`. Añadir una comprobación que la contraste convierte un comentario que envejece en
un control que caduca ruidosamente. Es la misma lección de la spec `013` aplicada un nivel más
arriba: allí un control escrito no se ejecutaba, aquí un motivo escrito no se revisa.

Sobre lo segundo. El argumento de cero dependencias para no medir cobertura era correcto cuando
medir exigía `nyc` o `c8`. Pero V8 recolecta cobertura de forma nativa y Node la vuelca a disco
con solo definir `NODE_V8_COVERAGE`, una capacidad presente desde Node 12 sobre un artefacto que
ya exige Node 18. No hay dependencia que añadir: hay una variable de entorno que definir. Y como
los procesos hijo heredan la variable, la suite de instalación —que lanza el CLI decenas de veces
contra destinos reales— produce cobertura de integración de verdad, no solo de los módulos que se
importan en el proceso principal.

Comprobado antes de escribir esta spec, no después:

```text
NODE_V8_COVERAGE=... node scripts/check-syntax.mjs --selftest
→ 3 volcados · el del proceso raíz contiene scripts/check-syntax.mjs con 8 funciones y rangos count=0
```

De ahí salen dos trampas que el plan asume desde el principio, no como corrección posterior. La
URL del volcado viene **percent-encoded** —`OneDrive%20-%20Bankinter`— así que resolverla con
manipulación de cadena falla en cuanto la ruta tiene un espacio. Y los desplazamientos de V8
indexan la **cadena** del módulo, no su búfer, de modo que contarlos sobre bytes desalinea cada
fichero con tildes; en un repositorio escrito en español eso es todos.

## 2. Decisiones

### D-01 · El umbral se mide primero y se registra después

No se elige un número redondo y se persigue. Se ejecuta la suite, se mide lo que hay, y se
registra ese valor menos un margen declarado. Un umbral por encima de lo medido convertiría el
gate en rojo desde el primer día y acabaría desactivado; un umbral aspiracional escrito como si
fuera real sería la misma afirmación cómoda que el sistema reprocha en los demás. El trinquete
solo sube, y sube en un commit que se ve.

### D-02 · Se mide línea ejecutada, y se dice que eso no es suficiencia

La cobertura por V8 responde «esta línea se recorrió», no «este comportamiento se probó». Es un
suelo útil —detecta código que ningún test toca jamás— y un techo engañoso. La estrategia de test
lo dirá con esas palabras, junto al número. Publicar un porcentaje sin esa frase sería exhibir
precisamente lo que la memoria critica en otros proyectos.

### D-03 · La accesibilidad se audita en lo comprobable y se declara lo demás

Sin navegador no hay contraste calculado, ni foco visible, ni orden de tabulación real. Lo que sí
se puede leer del HTML es mucho: idioma, título, alternativas textuales, regiones, jerarquía de
encabezados y nombre accesible de los controles. Se audita eso y se enumera lo otro. Un gate de
accesibilidad que no dice qué no mira produce falsa tranquilidad, que es peor que no tenerlo.

### D-04 · Longitud sí, complejidad ciclomática no

Contar líneas de una función es exacto. Calcular su complejidad sin un analizador sintáctico real
es aproximarla con expresiones regulares, y una métrica mal calculada legitima decisiones malas
con apariencia de rigor. El gate `smells` medirá lo que puede medir bien y su motivo dirá por qué
no mide lo otro, en lugar de desaparecer de la tabla.

### D-05 · La clase de la ausencia vive junto al motivo, no en el esquema

Distinguir `no-aplica` de `pendiente` de `se-ejecuta-en-otro-sitio` es una mejora de honestidad,
no de mecánica. Meterla en `.sdd/checks.json` obligaría a subir la versión del esquema, tocar el
instalador y migrar las instalaciones existentes, a cambio de nada que el fichero necesite saber.
Va como columna en la tabla que ya contiene el motivo, y la comprobación que ya lee esa tabla
pasa a leer también la columna.

### D-06 · La medición se declara lenta

`coverage` exige ejecutar la suite entera bajo instrumentación; en este repositorio, sobre
OneDrive, eso son minutos. Un gate previo al commit que tarda minutos se desactiva a la tercera
vez. Va a `slow`, junto a `a11y`. `smells` lee ficheros y cuenta líneas: cabe en `fast`.

## 3. Alternativas descartadas

| Alternativa | Por qué no |
|---|---|
| Añadir `c8` como dependencia de desarrollo | La regla de cero dependencias es lo que hace instalable esta plantilla sobre cualquier repositorio. Y ya no hace falta: V8 lo da |
| Fijar el umbral de cobertura en 80 % | Es el número que todo el mundo escribe y casi nadie mide. Si lo medido está por debajo, el gate nace roto; si está por encima, el umbral no protege nada |
| Auditar accesibilidad con un motor completo tipo axe | Exige navegador sin cabeza y varias dependencias pesadas, para un sitio de tres páginas estáticas |
| Retirar `visual` y `mutation` de la tabla | Retirar una ausencia es hacerla invisible. Se quedan, con motivo corregido y clase declarada |
| Calcular complejidad ciclomática con expresiones regulares | Ver D-04 |

## 4. Matriz de controles de seguridad

| Control | ASVS | OWASP | Aplica | Decisión | Tarea | Test | Evidencia |
|---|---|---|---|---|---|---|---|
| SEC-COV-001 | 5.0.0 · V4.1.3 | A01:2025 | sí | La URL de un volcado de cobertura se decodifica y se resuelve contra la raíz del repositorio; una entrada que apunte fuera se descarta en lugar de leerse | T-014-01 | `scripts/test-hooks.mjs::la_cobertura_no_lee_fuera_del_repositorio` | evidence.md#SEC-COV-001 |
| SEC-COV-002 | 5.0.0 · V1.14.6 | A03:2025 | sí | Ningún gate nuevo interpola cadenas en una shell ni ejecuta programas externos; se leen ficheros y se calculan números | T-014-02 | `scripts/test-install.mjs::los_gates_nuevos_no_invocan_shell` | evidence.md#SEC-COV-002 |
| SEC-CLI-004 | 5.0.0 · V1.14.6 | A03:2025 | no | Esta spec no añade generadores ni ejecución de plantillas; lo cubre SEC-COV-002 para la superficie que sí añade | — | — | — |
| SEC-TERR-001 | 5.0.0 · V4.1.3 | A01:2025 | no | El reparto de territorios no cambia en esta spec; lo verifica la `013` | — | — | — |

## 5. Matriz de controles de usabilidad

| Control | WCAG 2.2 | Heurística | Aplica | Decisión | Tarea | Test | Evidencia |
|---|---|---|---|---|---|---|---|
| UX-A11Y-002 | 2.2 · 1.3.1, 2.4.6, 3.1.1 | H4 | sí | Las páginas publicadas declaran idioma, título, región principal y jerarquía de encabezados sin saltos; el gate lo comprueba en cada ejecución | T-014-04 | `scripts/test-install.mjs::el_sitio_publicado_pasa_su_propia_auditoria` | evidence.md#UX-A11Y-002 |
| UX-COPY-003 | n/a | H9 | sí | El fallo de cobertura dice el porcentaje medido, el umbral vigente y qué ficheros lo bajan, en lugar de un binario sin salida | T-014-03 | `scripts/test-install.mjs::el_fallo_de_cobertura_dice_que_falta` | evidence.md#UX-COPY-003 |
| UX-COPY-002 | n/a | H9 | no | El microcopy de la auditoría de trazas no cambia en esta spec; lo cubre la `013` | — | — | — |
| UX-FORM-001 | n/a | H5 | no | Esta spec no añade formularios ni entrada interactiva | — | — | — |

## 6. Documentación

| DOC-ID | Aplica | Fuente | Artefacto | Propietario | Tarea | Gate/test | Evidencia |
|---|---|---|---|---|---|---|---|
| DOC-QUALITY | sí | `.sdd/checks.json`, `scripts/check-coverage.mjs`, `scripts/check-a11y.mjs` | `docs/quality/TEST-STRATEGY.md` | docs-writer | T-014-05 | `scripts/test-install.mjs::cada_ausencia_declara_su_clase` | `evidence.md#DOC-QUALITY` |

## 7. Impacto en ficheros

| Fichero | Cambio |
|---|---|
| `scripts/check-coverage.mjs` | nuevo · lectura de volcados V8, cálculo por líneas, `--json` y `--selftest` |
| `scripts/check-a11y.mjs` | nuevo · auditoría de las páginas publicadas, `--json` y `--selftest` |
| `scripts/check-smells.mjs` | nuevo · longitud de fichero y de función contra trinquete |
| `scripts/lib/manifiesto.mjs` | alta de los tres scripts en la lista blanca de `scripts/lib` y del paquete |
| `.sdd/coverage.json` | nuevo · umbral medido y margen declarado |
| `.sdd/smells.json` | nuevo · máximos de longitud medidos |
| `.sdd/checks.json` | alta de `coverage`, `a11y` y `smells`; baja de las tres ausencias correspondientes |
| `package.json` | scripts `coverage`, `a11y`, `smells` y su inclusión en `files` |
| `docs/quality/TEST-STRATEGY.md` | §10 gana columna `Clase`, motivos corregidos y lo no cubierto por `a11y` |
| `scripts/test-install.mjs` | clase de cada ausencia, motivo falsable, gates nuevos ejecutables |
| `scripts/test-hooks.mjs` | confinamiento de la lectura de volcados |

## 8. Verificación

```text
node scripts/check-coverage.mjs --selftest
node scripts/check-a11y.mjs --selftest
node scripts/check-smells.mjs --selftest
node scripts/test-hooks.mjs
node scripts/test-install.mjs
node scripts/check-sdd.mjs --strict --spec 014
node scripts/sdd-project.mjs trace-status --spec 014 --json
node scripts/sdd-project.mjs run --fast
node scripts/sdd-project.mjs run --slow
```
