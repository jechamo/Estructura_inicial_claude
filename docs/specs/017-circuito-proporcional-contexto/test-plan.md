# Plan de test · 017-circuito-proporcional-contexto

| Campo | Valor |
|---|---|
| **Spec** | [`spec.md`](./spec.md) · **Plan**: [`plan.md`](./plan.md) · **Tareas**: [`tasks.md`](./tasks.md) |

## 1. Alcance

Dos funciones puras —el clasificador de circuito y el recortador de contexto— más dos superficies de
CLI. No hay interfaz, ni red, ni persistencia. Eso permite que la mayor parte de la verificación sea
unitaria y determinista, sin proceso hijo ni repositorio temporal.

## 2. Mapa criterio → test

| CA | Test | Nivel |
|---|---|---|
| CA-01 | `scripts/test/contexto-recorte.mjs::recorta_solo_las_secciones_de_la_fase` | unit |
| CA-02 | `scripts/test/contexto-recorte.mjs::falla_cerrado_y_conserva_invariantes` | unit |
| CA-03 | `scripts/test/contexto-recorte.mjs::ninguna_superficie_exige_el_documento_completo` | contract |
| CA-04 | `scripts/test/resumen-gates.mjs::resume_comando_codigo_conteos_y_ejecucion` | unit |
| CA-05 | `scripts/test/circuito-frontera.mjs::clasifica_en_tres_niveles_con_full_por_defecto` | unit |
| CA-06 | `scripts/test/circuito-frontera.mjs::clasifica_rutas_previstas_con_arbol_limpio` | integration |
| CA-07 | `scripts/test/circuito-frontera.mjs::un_ejecutable_nunca_es_ligero` | unit |
| CA-08 | `scripts/test/circuito-frontera.mjs::deniega_variacion_de_caja` | unit |
| CA-09 | `scripts/test/circuito-frontera.mjs::sin_aprobacion_no_hay_atajo` | integration |
| CA-10 | `scripts/test/circuito-frontera.mjs::la_frontera_heredada_sigue_habilitando_solo_light` | integration |
| CA-11 | `scripts/test/circuito-frontera.mjs::el_documento_compacto_declara_limites_verificables` | contract |

## 3. Por nivel

### Unitarios (~70 %)

Clasificación de rutas, plegado de caja, gramática, suelo por extensión y recorte por encabezados.
Todo sobre las funciones puras de `scripts/lib/`, sin tocar disco.

### Integración (~20 %)

Los subcomandos del CLI sobre repositorios temporales: `--planned` con árbol limpio, frontera sin
aprobar, frontera heredada y aprobación ligada a la propuesta mostrada.

### Contrato

Que ninguna de las siete superficies siga exigiendo el modelo operativo completo, y que la plantilla
del documento compacto declare sus límites. Son aserciones semánticas sobre ficheros versionados,
restringidas a la sección pertinente para que un texto equivalente en otro sitio no produzca un
falso verde — la misma técnica que la spec 016.

### E2E (~10 %)

Instalación limpia y brownfield mediante el harness existente, que se **extiende y no se reemplaza**.

## 4. Casos límite a cubrir

- Árbol limpio y sin rutas previstas: no hay nada que clasificar, y decirlo no es un reproche.
- Ruta presente en permitidos y en prohibidos a la vez: gana la prohibición.
- Repositorio sin frontera de ninguna clase: no hay atajo y el motivo se nombra.
- Fase inexistente en el mapa: error, no recorte vacío.
- Encabezado del modelo operativo duplicado o renombrado: error nombrando la sección.
- Fichero sin extensión conocida: desconocido, luego circuito completo.
- Ruta con `..`, con separador de Windows, absoluta, o que difiere solo en caja.
- Gate en rojo: el resumen incluye el fallo relevante y el código de salida real no cambia.

## 5. Datos de prueba

Fronteras sintéticas construidas en el propio test y un documento markdown de fixture con la
estructura de encabezados del modelo operativo. Ningún dato personal, ninguna credencial, ninguna
llamada de red.

### 5.1 · Casos de abuso y controles de seguridad

| Control | ASVS | OWASP | Caso de abuso / condición negativa | Nivel | Test | Resultado seguro esperado |
|---|---|---|---|---|---|---|
| SEC-CIRCUIT-001 | ASVS 5.0.0 V1 | A01:2025 | Una ruta prohibida se reescribe cambiando mayúsculas (`Src/Domain/pagos.ts` frente a `denied: ["src/domain/"]`), con `..`, con separador de Windows, como ruta absoluta, o la frontera declara un comodín `**/auth/` | unit | `scripts/test/circuito-frontera.mjs::deniega_variacion_de_caja` | Rechazo cerrado: la ruta queda denegada y el patrón inválido no concede atajo; nunca se degrada a permiso |
| SEC-CIRCUIT-002 | ASVS 5.0.0 V1 | A01:2025 | Se intenta usar el atajo con la frontera recién instalada y sin aprobar, o se altera la propuesta después de mostrarla y antes de aprobarla | integration | `scripts/test/circuito-frontera.mjs::sin_aprobacion_no_hay_atajo` | Sin aprobación no hay atajo y el mensaje nombra el comando; una propuesta alterada se rechaza por no corresponder con la mostrada |
| SEC-CONTEXT-001 | ASVS 5.0.0 V1 | A04:2025 | El documento pierde una sección invariante, la duplica o la renombra, de modo que el recorte podría devolver un contexto sin la regla cero, sin los gates o sin las prohibiciones | unit | `scripts/test/contexto-recorte.mjs::falla_cerrado_y_conserva_invariantes` | Falla cerrado nombrando la sección; jamás devuelve un recorte parcial ni vacío en silencio |

No hay JWT, cookies ni bearer: la spec no introduce autenticación, sesiones ni credenciales.

### 5.2 · Casos de uso hostil y accesibilidad

No aplica. Motivo material heredado de `spec.md`: la spec amplía un CLI y ficheros de configuración;
no crea pantalla, formulario, texto que lea una persona en una interfaz ni espera perceptible. En
`/sdd-verify` se comprueba que no haya aparecido una superficie interactiva accidental; sin
hallazgo, se conserva el motivo y no se declara un `PASS` de usabilidad que nadie ejecutó.

## 6. Dobles

Ninguno para las funciones puras: reciben texto y estructuras, y devuelven valores. Para los
subcomandos, repositorios temporales reales en vez de dobles, porque lo que se prueba es
precisamente la interacción con el árbol de ficheros.

## 6 bis. Verificación documental

| DOC-ID | Tarea | Fuente | Artefacto | Comprobación o revisión | Resultado esperado |
|---|---|---|---|---|---|
| DOC-CONTEXTO | T-017-03 | `scripts/sdd-project.mjs` + `docs/sdd/OPERATING-MODEL.md` | `CLAUDE.md`, `AGENTS.md`, mapa de lectura por fase | `scripts/test/contexto-recorte.mjs::ninguna_superficie_exige_el_documento_completo` | ninguna superficie exige el documento completo |
| DOC-CIRCUITO | T-017-08 | `.sdd/circuit.json` + `.agents/skills/sdd-light/SKILL.md` | `docs/sdd/OPERATING-MODEL.md` §2.6 | `scripts/test/circuito-frontera.mjs::el_documento_compacto_declara_limites_verificables` | los tres niveles y sus límites quedan escritos |

Ninguna de las dos se declara verificada por inspección visual: la aserción se restringe a su
sección para que un texto equivalente en otro sitio no produzca un falso verde, y `--docs-diff`
vuelve a comprobarlo en CI.

## 7. Criterio de suficiencia

- Los tres controles de seguridad tienen caso adverso ejecutado con salida real.
- Cada CA tiene su test nombrado y ejecutado.
- Las mutaciones negativas de los contratos semánticos demuestran que quitar la frase que se afirma
  vuelve roja la suite; si no, el test no prueba nada.
- El trinquete de cobertura no baja.

## 8. Qué NO se automatiza

- El consumo real de Copilot y Cursor: sus API no lo exponen. Se mide un proxy auditable y se dice
  que es un proxy.
- CI multi-OS y multiversión de Node: se ejecuta en el pipeline, no en local. Lo que no se ejecute
  aquí se declara como no ejecutado, con riesgo, dueño y siguiente paso.

## 9. Fuentes y discrepancias

`SRC-001` (modelo operativo y reglas duras) y `SRC-003` (specs cerradas con evidencia). Ninguna
discrepancia abierta afecta a esta spec.
