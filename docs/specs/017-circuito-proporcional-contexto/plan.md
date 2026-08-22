# Plan técnico · 017 · Circuito proporcional al riesgo y presupuesto de contexto

| Campo | Valor |
|---|---|
| **Spec** | [`spec.md`](spec.md) · estado `aprobada` |
| **Autor** | `planner` (`declared-direct`) |
| **Fecha** | 2026-08-22 |
| **Estado** | aprobado |

> Este plan es deliberadamente corto. Responder a un problema de exceso de documento con un
> expediente hinchado sería incoherente con lo que la spec pide.

---

## 1. Resumen de la solución

Tres piezas independientes que se ordenan por amortización, de modo que detenerse en cualquier punto
deja beneficio consolidado:

1. **Recorte de contexto por fase.** Un subcomando corta el modelo operativo por encabezados y
   entrega solo las secciones de la fase. Ahorra en *todas* las fases, incluido el circuito completo.
2. **Resumen de gates.** La ejecución de gates emite un resumen; la salida completa queda fuera del
   contexto y recuperable por identificador.
3. **Tres niveles de circuito.** Un clasificador por rutas con suelo por tipo de fichero, consultable
   antes de editar, y un documento único para el nivel compacto.

Todo el cálculo nuevo vive en `scripts/lib/`, no en los entrypoints: el trinquete de tamaño deja 5
líneas de margen en el fichero mayor, y además la lógica pura se prueba sin proceso hijo.

### Trazabilidad y fuentes de entrada

| RF | CA | Componente | Tarea |
|---|---|---|---|
| RF-01, RF-02, RF-03 | CA-01, CA-02 | `scripts/lib/contexto.mjs` | T-017-01, T-017-02 |
| RF-04 | CA-03 | superficies de host y bloque gestionado | T-017-03 |
| RF-05, RF-06 | CA-04 | `scripts/lib/resumen-gates.mjs` | T-017-04 |
| RF-10 | CA-08 | `scripts/lib/circuito.mjs` | T-017-05 |
| RF-07, RF-08, RF-09, RF-12 | CA-05, CA-06, CA-07, CA-10 | `scripts/lib/circuito.mjs`, `check-sdd.mjs` | T-017-06 |
| RF-11 | CA-09 | `scripts/sdd-project.mjs`, `scripts/install.mjs` | T-017-07 |
| RF-13 | CA-11 | plantilla `change.md`, `/sdd-light` ampliada | T-017-08 |

## 2. Aplicación de la arquitectura

Se conserva la separación que ya establece la constitución: **cálculo puro en `scripts/lib/`,
entrada y salida en los entrypoints**. `circuito.mjs` documenta esa frontera de forma explícita —*no
lee ficheros, no ejecuta git, no imprime nada*— y esta spec la respeta ampliándolo, no rodeándolo.

No se añaden agentes. No se rompe la paridad de los seis hosts. No se introducen dependencias.

## 3. Componentes

### Nuevos

- `scripts/lib/contexto.mjs` — corta un documento markdown por encabezados según un mapa de fases.
  Puro: recibe texto y fase, devuelve secciones o lanza. No lee disco.
- `scripts/lib/resumen-gates.mjs` — construye el resumen de una ejecución de gates.
- `docs/specs/_TEMPLATE/change.md` — mini-spec del nivel compacto con límites declarados.
- `.sdd/circuit.json` — contrato de los tres niveles.

### Modificados

- `.agents/skills/sdd-light/SKILL.md` — **ampliada**, no duplicada: pasa a cubrir los tres niveles.
- `scripts/lib/circuito.mjs` — plegado de caja, gramática `exact-prefix-v1`, clasificación en tres
  niveles y suelo por tipo de fichero.
- `scripts/check-sdd.mjs` — `--planned`; mensajes cuando la frontera está sin aprobar.
- `scripts/sdd-project.mjs` — `context`, `new-change`, `detect-circuit`, `approve-circuit`,
  `run --summary-json`, y su registro en el bloque `USO`.
- `scripts/lib/manifiesto.mjs` — semilla de `.sdd/circuit.json`, compatibilidad de la frontera
  heredada y bloque gestionado de `AGENTS.md`.
- `scripts/install.mjs` — salida final: la frontera nace sin aprobar y cómo aprobarla.
- `docs/sdd/OPERATING-MODEL.md`, `AGENTS.md`, `CLAUDE.md` y las superficies de host.

## 4. Patrones de diseño aplicados

- **Función pura + adaptador de E/S** para `contexto.mjs` y `circuito.mjs`: la regla se prueba sin
  repositorio ni proceso hijo, que es la razón por la que `circuito.mjs` ya existía separado.
- **Fail-closed** en el recorte y en la gramática de la frontera: ante estructura inesperada se
  lanza, nunca se devuelve vacío.
- **Lista de permitidos con negación prevalente**, ya establecida en la spec 015; se conserva.

## 5. Flujo principal

**Clasificar antes de editar.** Se aportan las rutas previstas → se normalizan (caja plegada,
traversal y rutas absolutas rechazadas) → si alguna cae en `denied`, el resultado es `full` → si
alguna es ejecutable, el suelo es `compact` → si todas están en `light.allowed` y ninguna es
ejecutable, el resultado es `light` → en cualquier otro caso, `full`.

**Recortar contexto.** Se pide una fase → se busca en el mapa → se extraen sus encabezados del
modelo operativo → si falta uno, está duplicado o fue renombrado, se lanza → se añaden las
invariantes → se devuelve.

## 6. Modelo de datos

Ver [`data-model.md`](data-model.md). No hay base de datos: son dos ficheros JSON de configuración
versionados y un documento markdown.

## 7. Contratos

No se publica API. El contrato es el de los subcomandos del CLI, cuya única lista es el bloque `USO`
de `scripts/sdd-project.mjs`: un comando que no aparezca allí no existe para quien lo usa.

## 8. Estrategia de test

Ciclo rojo-verde-refactor por tarea. La lógica pura se prueba directamente sobre la función; el
comportamiento del CLI, mediante el harness de instalación existente, que se **extiende y no se
reemplaza**.

El trinquete de olores está a 5 líneas del límite con `scripts/test-install.mjs` en 3825 líneas. Los
casos nuevos van a un fichero propio bajo `scripts/test/`, como ya se hizo en la spec 016 con
`install-security-contracts.mjs`. Si aun así el trinquete se toca, se sube de forma deliberada y
documentada, nunca en silencio.

### 8.1 · Calibración de verificación

| Módulo / ruta | Tier | Por qué |
|---|---|---|
| `scripts/lib/circuito.mjs` | CORE | decide si un cambio puede prescindir del expediente; un fallo aquí produce código sin spec |
| `scripts/lib/contexto.mjs` | CORE | si omite una sección invariante, un agente opera sin una regla que sí aplicaba |
| `scripts/lib/resumen-gates.mjs` | IMPORTANT | un resumen erróneo confunde, pero el exit code real sigue mandando |
| `scripts/sdd-project.mjs` | IMPORTANT | superficie de usuario del CLI |
| `scripts/lib/manifiesto.mjs` | IMPORTANT | semillas de instalación, cubiertas por el harness |

| Componente | Respuesta | Decisión |
|---|---|---|
| `circuito.mjs` | 4 de 4 hacia verificar | suite exhaustiva con casos adversos: caja, traversal, solapamiento, comodín, extensión |
| `contexto.mjs` | 4 de 4 hacia verificar | suite exhaustiva incluyendo estructura corrupta |
| `resumen-gates.mjs` | 2 de 4 hacia verificar | camino feliz y fallo, sin mutación |

## 9. Seguridad

**Impacto de seguridad heredado de `spec.md`**: `sensible`.

### 9.1 · Matriz de controles

| Control | ASVS | OWASP | Aplica | Decisión / justificación | Tarea | Test | Evidencia |
|---|---|---|---|---|---|---|---|
| SEC-CIRCUIT-001 | ASVS 5.0.0 V1 | A01:2025 | sí | La frontera se compara con caja plegada y gramática sin comodines; la negación prevalece y ninguna raíz ejecutable se concede. Una ruta prohibida no puede esquivarse cambiando mayúsculas ni con `..` | T-017-05 | `scripts/test/circuito-frontera.mjs::deniega_variacion_de_caja` | `evidence.md#SEC-CIRCUIT-001` |
| SEC-CIRCUIT-002 | ASVS 5.0.0 V1 | A01:2025 | sí | La frontera se instala sin aprobar y no concede atajo. Aprobarla es un acto humano separado, ligado a la propuesta mostrada; el agente presenta el comando y se detiene. La identidad declarada no es firma criptográfica y se documenta | T-017-07 | `scripts/test/circuito-frontera.mjs::sin_aprobacion_no_hay_atajo` | `evidence.md#SEC-CIRCUIT-002` |
| SEC-CONTEXT-001 | ASVS 5.0.0 V1 | A04:2025 | sí | Las secciones invariantes no pueden faltar en ningún recorte, y una estructura inesperada falla cerrado en vez de devolver vacío | T-017-02 | `scripts/test/contexto-recorte.mjs::falla_cerrado_y_conserva_invariantes` | `evidence.md#SEC-CONTEXT-001` |

### 9.2 · Auditoría prevista

- Skill: `/security-scan` con alcance `plan` antes de implementar y `verify` antes de entregar.
- Auditor: `security-auditor` en solo lectura; devuelve un HANDOFF y no escribe el informe.
- Escritor autorizado: `docs-writer`, que materializa el handoff literalmente.
- Informe: `docs/security/reports/2026-08-22-017-circuito-proporcional-contexto.md`.

### 9.3 · Matriz de controles de usabilidad

No aplica. Motivo material heredado de `spec.md`: la spec amplía un CLI y ficheros de configuración;
no crea pantalla, formulario, texto que lea una persona en una interfaz ni espera perceptible por
encima de 300 ms.

### 9.4 · Auditoría de usabilidad prevista

Se verifica en `/sdd-verify` que no haya aparecido una superficie interactiva accidental. Sin
hallazgo, el motivo material se conserva; no se declara un `PASS` de usabilidad que nadie ejecutó.

## 10. Rendimiento

Clasificación y recorte son operaciones locales sin red. Objetivo: por debajo de un segundo en un
repositorio con miles de ficheros. El recorte trabaja sobre un documento de 42 KB en memoria.

## 10 bis. Documentación

**Impacto heredado de `spec.md`**: `aplicable · DOC-CIRCUITO, DOC-CONTEXTO`.

| DOC-ID | Superficie | Aplica / motivo | Fuente de verdad | Artefacto | Generado / manual | Propietario | Tarea | Gate / comprobación | Evidencia |
|---|---|---|---|---|---|---|---|---|---|
| DOC-CIRCUITO | architecture | sí · el circuito pasa de uno a tres niveles | `.sdd/circuit.json`, `.agents/skills/sdd-compact/SKILL.md` | `docs/sdd/OPERATING-MODEL.md` §2.6 | manual | `docs-writer` | T-017-08 | `check-sdd --docs-diff` en CI | `evidence.md#DOC-CIRCUITO` |
| DOC-CONTEXTO | architecture | sí · las siete superficies dejan de exigir el documento completo | `scripts/sdd-project.mjs`, `docs/sdd/OPERATING-MODEL.md` | `AGENTS.md`, `CLAUDE.md`, mapa de lectura por fase | manual | `docs-writer` | T-017-03 | `check-sdd --docs-diff` en CI | `evidence.md#DOC-CONTEXTO` |

## 11. Observabilidad

Cada ejecución de gates lleva identificador recuperable, que es la observabilidad que faltaba: hoy
la única forma de saber qué pasó es haber conservado el volcado entero en la conversación.

## 12. Despliegue

Versión compatible `v0.9.0`. La instalación existente no se rompe: la frontera heredada se sigue
leyendo y no se reescribe. Commit, push, tag y publicación conservan sus aprobaciones humanas.

## 13. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| El trinquete de tamaño bloquea los tests nuevos | Fichero de test propio bajo `scripts/test/`; si aun así se toca, se sube de forma deliberada y documentada |
| El recorte omite una regla que sí hacía falta | Invariantes no recortables y fallo cerrado; el benchmark mide calidad funcional, no solo tamaño |
| El nivel compacto se usa para trocear una feature | Los cambios del mismo pedido se acumulan; superados los límites, exigen circuito completo |
| El umbral de ahorro no se alcanza | Se descarta y se registra como experimento, conforme a `RF-08` de la spec 011 |

## 14. Plan de reversión

Cada pieza es independiente y reversible por separado. Revertir el clasificador devuelve el circuito
ligero heredado, que sigue leyéndose. Revertir el recorte devuelve la lectura completa. Ningún
cambio migra datos ni altera formato de registro existente.

## 15. Conformidad con la constitución

- Cálculo puro separado de la E/S: se respeta y se amplía.
- Sin dependencias de runtime nuevas: se respeta.
- Paridad de agentes y skills entre hosts: se respeta **sin tocar el recuento**. El nivel compacto
  amplía `/sdd-light` en vez de añadir una skill 28. Motivo material: el contrato «20 agentes · 27
  skills» está grabado en once superficies —`README.md`, `AGENTS.md`, `.github/copilot-instructions.md`,
  `.github/agents/README.md`, `check-sdd.mjs:571`, `test-install.mjs:1222`, `web/` y `site/`— y el
  gate de paridad lo verifica en varias de ellas. Una skill nueva obligaría a tocarlas todas sin
  ganar nada funcional. Consecuencia aceptada y declarada dentro del propio documento: el nombre
  `light` se queda corto para lo que la skill pasa a cubrir.
- Regla dura de `AGENTS.md` §«Agentes, delegación y aislamiento»: no se crean prompts ni commands
  paralelos para representar una skill. Ampliar la existente es justamente lo que esa regla pide.

## 16. Gate humano del plan técnico

| Campo | Valor |
|---|---|
| **Estado** | aprobado |
| **Fecha** | 2026-08-22 |

- [x] Aprobado por: Jorge Enrique Chamorro Rodriguez · fecha: 2026-08-22

Aprobado junto con la decisión de ampliar `/sdd-light` en lugar de crear una skill 28.
