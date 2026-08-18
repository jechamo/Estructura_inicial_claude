# Plan de test · 013-verificacion-independiente-del-host

| Campo | Valor |
|---|---|
| **Spec** | [`spec.md`](./spec.md) · **Plan**: [`plan.md`](./plan.md) · **Tareas**: [`tasks.md`](./tasks.md) |
| **Arnés** | suites propias del repositorio, sin dependencias externas |
| **Suites** | `scripts/test-hooks.mjs`, `scripts/test-install.mjs` |

## 1. Estrategia

La spec verifica dos mecanismos con naturalezas distintas y por eso usa dos suites.

La decisión de territorio es una función pura, así que se prueba con una **tabla de casos**:
entradas concretas, salida esperada, sin proceso hijo ni sistema de ficheros. Vive en
`scripts/test-hooks.mjs`, que es la suite que ya cubre las guardas.

La auditoría de trazas necesita un historial de git real, así que se prueba **de punta a punta**
sobre un repositorio temporal construido por el propio test, con commits fabricados para cada
caso. Vive en `scripts/test-install.mjs`, que es la suite que ya construye árboles temporales.

Ningún test consulta la red ni el historial real de este repositorio: un test que dependiera de
los commits que existan hoy dejaría de significar lo mismo mañana.

## 2. Casos por criterio de aceptación

| CA | Test | Suite | Qué falsaría el criterio |
|---|---|---|---|
| CA-01 | `la_normalizacion_de_ruta_no_elude_el_territorio` | `scripts/test-hooks.mjs` | Que `../`, `\` o una ruta absoluta equivalente obtengan una decisión distinta a la de la ruta canónica |
| CA-02 | `un_reparto_corrupto_no_degrada_a_permitir` | `scripts/test-hooks.mjs` | Que un agente inexistente, una ruta que no resuelve, un solape o un modo desconocido pasen la verificación |
| CA-03 | `el_rechazo_por_territorio_dice_quien_que_y_de_quien` | `scripts/test-hooks.mjs` | Que falte un entorno en la tabla de contratos, o que el mensaje omita agente, ruta o territorio dueño |
| CA-04 | `el_trailer_no_suplanta_ni_inyecta` | `scripts/test-install.mjs` | Que una tarea inexistente, un agente inexistente o un trailer inyectado en el cuerpo del mensaje sean aceptados |
| CA-05 | `el_fallo_de_auditoria_ensena_como_arreglarlo` | `scripts/test-install.mjs` | Que una excepción vacía o de relleno pase, o que el mensaje de fallo no contenga el trailer exacto que falta |
| CA-06 | `la_autoria_no_escribe_fuera_del_repositorio` | `scripts/test-hooks.mjs` | Que veinte escrituras de la misma terna produzcan más de una entrada, o que una spec con ruta hostil escriba fuera |
| CA-07 | `el_repositorio_declara_modo_restrictivo` | `scripts/test-install.mjs` | Que este repositorio no declare `deny`, que una instalación nueva no declare `audit`, o que el escape deje de funcionar |

## 3. Casos por control de seguridad

| Control | Test | Entrada hostil |
|---|---|---|
| SEC-TERR-001 | `scripts/test-hooks.mjs::la_normalizacion_de_ruta_no_elude_el_territorio` | `docs/../.sdd/hooks/guard-write.mjs`, `docs\\architecture\\x.md`, ruta absoluta dentro del repositorio |
| SEC-TERR-002 | `scripts/test-hooks.mjs::un_reparto_corrupto_no_degrada_a_permitir` | JSON truncado, `modo: "permisivo"`, `territorios` que no es una lista |
| SEC-TRACE-001 | `scripts/test-install.mjs::el_trailer_no_suplanta_ni_inyecta` | Cuerpo de commit con una línea `Agent: architect` antes del bloque de trailers; `Task: T-013-99`; `Agent: no-existe` |
| SEC-TRACE-002 | `scripts/test-hooks.mjs::la_autoria_no_escribe_fuera_del_repositorio` | `SDD_SPEC` con `../` y con ruta absoluta; comprobación de que el fichero de estado queda bajo `.sdd/state/` |

## 4. Casos por control de usabilidad

| Control | Test | Qué se asevera del mensaje |
|---|---|---|
| UX-COPY-001 | `scripts/test-hooks.mjs::el_rechazo_por_territorio_dice_quien_que_y_de_quien` | Contiene el nombre del agente, la ruta rechazada y el agente dueño del territorio |
| UX-COPY-002 | `scripts/test-install.mjs::el_fallo_de_auditoria_ensena_como_arreglarlo` | Contiene la forma literal del trailer ausente, de modo que copiarla resuelva el fallo |

## 4.1 Comprobación documental

| DOC-ID | Artefacto | Tarea | Gate/test |
|---|---|---|---|
| DOC-TRACE | `docs/sdd/OPERATING-MODEL.md` | T-013-05 | `scripts/test-install.mjs::el_fallo_de_auditoria_ensena_como_arreglarlo` |
| DOC-HOSTS | `docs/integrations/IDE-COMPATIBILITY.md` | T-013-03 | `scripts/test-hooks.mjs::el_rechazo_por_territorio_dice_quien_que_y_de_quien` |

## 5. Fuera del alcance de esta verificación

No se verifica que un entorno concreto haya invocado la guarda durante una sesión real. Esa
comprobación exigiría instrumentar el IDE, que es precisamente lo que esta spec renuncia a
suponer. Lo que sí se verifica es que la regla es única, que su decisión es la esperada y que
cada entorno la tiene cableada a su evento de pre-escritura, o declara que no lo tiene.

## 6. Comandos

```text
node scripts/test-hooks.mjs
node scripts/test-install.mjs
node scripts/check-sdd.mjs --strict --spec 013
node scripts/sdd-project.mjs trace-status --spec 013 --json
```
