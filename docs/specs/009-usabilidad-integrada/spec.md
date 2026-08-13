# 009 · Usabilidad exigible en el circuito SDD

| Campo | Valor |
|---|---|
| **ID** | `009-usabilidad-integrada` |
| **Estado** | entregada |
| **Autor** | Jechamo |
| **Fecha** | 2026-08-12 |
| **Rama** | `main` |
| **Depende de** | `006-calidad-integrada`, `007-seguridad-jwt-owasp-2025` (patrón de contrato) |
| **Baseline de producto** | [`docs/product/PRD.md`](../../product/PRD.md) · estado `legacy-pending` |
| **Fuentes** | [`docs/product/SOURCES.md`](../../product/SOURCES.md) · `SRC-009-01..04` |
| **Impacto de seguridad** | `no-sensible` |
| **Impacto de usabilidad** | `aplicable` |
| **Impacto de documentación** | `aplicable · DOC-TRACE, DOC-VCS, DOC-HOSTS` |

> ⚠️ Esta spec describe **QUÉ** y **POR QUÉ**. Cero tecnología: ni tablas, ni endpoints,
> ni frameworks, ni nombres de clase. Eso va en `plan.md`.

---

## 0. Origen y trazabilidad de producto

> `docs/product/PRD.md` es la fuente canónica. La visión, un PRD original, un diseño o una URL
> son fuentes de intake y se citan mediante `SRC-*`; no sustituyen al baseline aprobado.

| Objetivo | Requisito de producto | Caso de uso | Requisito de esta spec | Fuente |
|---|---|---|---|---|
| OBJ-001 | PRD-RF-001 | UC-001 | RF-01 … RF-08 | SRC-009-01 |

**Fuentes de intake** — cuatro lecciones de máster aportadas por el usuario, incorporadas como
doctrina, no como código:

| Id | Fuente | Qué aporta |
|---|---|---|
| `SRC-009-01` | Lección 26 · *Heurísticas y Accesibilidad* | Diez heurísticas de Nielsen, principios POUR, WCAG 2.2 AA, ARIA, navegación por teclado, herramientas de verificación |
| `SRC-009-02` | Lección 27 · *Formularios que no frustran* | Etiquetas, tipos semánticos, validación en `blur`, mensajes de error, autocompletado, revelación progresiva, móvil |
| `SRC-009-03` | Lección 28 · *Microcopy con IA* | Verbo + sustantivo, estados de carga contextuales, estados vacíos, tono, y el papel de la IA como generadora de opciones con selección humana |
| `SRC-009-04` | Lección 29 · *Performance percibida* | Umbrales de percepción, esqueletos, carga progresiva, actualización optimista y sus límites, indicadores de carga |

**Discrepancias que afectan a esta spec**: `ninguna`.

## 1. Problema

La doctrina de usabilidad **ya está escrita** en `docs/design/USABILITY-CHECKLIST.md` y cubre las
cuatro fuentes casi punto por punto. El problema no es que falte conocimiento: es que **el circuito
no lo exige en ningún punto verificable**.

Hoy, una spec con interfaz puede recorrer specify → clarify → design → plan → tasks → implement →
verify → ship **sin que nadie compruebe una sola vez** que los formularios tienen etiqueta visible,
que los errores dicen cómo se arreglan o que una acción responde antes de 100 ms. En concreto:

1. `sdd-verify`, `sdd-tasks`, `sdd-clarify` y `sdd-ship` tienen **cero menciones** de usabilidad o
   accesibilidad. La fase que valida no valida esto.
2. `docs/design/a11y-checklist.md` se declara entregable obligatorio en dos sitios
   —[`ux-designer.md:143`](../../../.claude/agents/ux-designer.md) y
   [`USABILITY-CHECKLIST.md:140`](../../design/USABILITY-CHECKLIST.md)— pero **no existe, no tiene
   plantilla y no se distribuye**. El circuito apunta a un documento que nadie puede crear igual dos
   veces.
3. Las tablas de accesibilidad y usabilidad de `design.md` (§6 y §6 bis) **no las valida nada**:
   `check-sdd.mjs` no las mira, así que se entregan vacías sin coste.
4. **No hay ninguna regla de IDE de usabilidad.** Cursor y Copilot reciben reglas de arquitectura,
   TDD y seguridad al editar código, y nada al editar una pantalla.
5. El HANDOFF **pierde la usabilidad en el primer salto**: `ux-designer` la declara, y ningún perfil
   posterior la arrastra.
6. El gate `a11y` está en `unconfigured` desde que existe el runner.

Coste de no arreglarlo: la usabilidad depende de que el agente de turno se acuerde. Es exactamente
la situación que tenía la seguridad antes de la spec 007, y se resolvió haciéndola contrato.

## 2. Objetivo y métrica de éxito

**Objetivo**: que la usabilidad sea tan imposible de saltarse como la seguridad, en los seis hosts
y a lo largo de toda la cadena de delegación.

**Cómo sabremos que funcionó**:

- Una spec con `Impacto de usabilidad: aplicable`, matriz `UX-*` incompleta y `GO` en `evidence.md`
  **hace fallar** `node scripts/check-sdd.mjs --strict` con código 1. Verificable el día de la entrega.
- Las seis superficies de agente conservan paridad de 20 agentes y 26 skills tras el cambio.
- Un `UX-*` declarado en `plan.md` aparece en el HANDOFF de `/sdd-ship` sin intervención manual.
- `docs/design/A11Y-CHECKLIST.md` se instala en un proyecto nuevo junto a las dos reglas de IDE.

## 3. Usuarios y contexto de uso

| Perfil | Qué necesita | Frecuencia | Contexto |
|---|---|---|---|
| Persona que instala la plantilla | Que su proyecto herede el contrato de usabilidad sin configurarlo | Una vez por proyecto | `sdd install` / `sdd update` |
| Agente de fase (`ux-designer`, `planner`, `implementer`) | Saber qué controles arrastra y a quién | Cada fase de una spec con UI | Cualquiera de los seis hosts |
| Persona que revisa la entrega | Un informe parseable con veredicto, no una impresión | Una vez por spec | `/sdd-verify`, `/sdd-ship` |
| Agente en Cursor o Copilot | Recibir la doctrina al abrir un fichero de UI | Cada edición de interfaz | Regla por `glob` |

## 4. Requisitos funcionales (EARS) con prioridad MoSCoW

| Id | Requisito | Prioridad | Esfuerzo |
|---|---|---|---|
| **RF-01** | El sistema DEBE permitir que una spec declare `Impacto de usabilidad` con valores `aplicable`, `sin-ui · <motivo>` o `ux-pending` | M | 2 |
| **RF-02** | SI una spec declara impacto `aplicable`, ENTONCES el sistema DEBE exigir una matriz de controles `UX-<AREA>-NNN` donde cada control aplicable enlaza decisión, tarea, test y evidencia | M | 5 |
| **RF-03** | El sistema DEBE propagar los controles de usabilidad a las tareas, al plan de test y a la evidencia de la spec | M | 3 |
| **RF-04** | CUANDO se verifica una spec con impacto `aplicable`, el sistema DEBE producir un informe de usabilidad parseable con estándares, alcance, controles, hallazgos por gravedad y veredicto | M | 5 |
| **RF-05** | SI el informe declara hallazgos CRÍTICOS o ALTOS, o controles no ejecutados, ENTONCES el sistema DEBE bloquear la decisión de entrega `GO` | M | 3 |
| **RF-06** | El sistema DEBE distribuir la doctrina de accesibilidad como documento versionado e instalable, y no como referencia a un fichero inexistente | M | 3 |
| **RF-07** | El sistema DEBE entregar la doctrina de usabilidad a los seis hosts, incluidas reglas por `glob` para los que no leen agentes | M | 3 |
| **RF-08** | El sistema DEBE conservar los controles de usabilidad en el bloque `### HANDOFF` de cada fase desde diseño hasta entrega | S | 3 |
| **RF-09** | El sistema DEBE exigir el gate `a11y` únicamente cuando la spec declara impacto `aplicable`, y admitir su declaración como control no ejecutado con riesgo cuando el proyecto no tiene herramienta | S | 3 |
| **RF-10** | El sistema DEBE validar que las tablas de accesibilidad y usabilidad de `design.md` no conservan marcadores de plantilla cuando el impacto es `aplicable` | S | 2 |

### Reparto MoSCoW

| Prioridad | Esfuerzo | % | Límite recomendado |
|---|---|---|---|
| Must | 21 | 72 % | **≤ 60 %** |
| Should | 8 | 28 % | ~20 % |
| Could | 0 | 0 % | ~20 % |
| **Total** | 29 | 100 % | |

Los *must* pasan del 60 % y se justifica por escrito: **un contrato parcial no es un contrato**.
Si RF-01 a RF-06 no entran completos, el resultado es peor que no hacer nada, porque declara una
garantía que no cumple. El riesgo de previsibilidad se acepta a cambio de que el patrón ya está
demostrado: se replica el de la spec 007, que funcionó, sobre los mismos ficheros y con los mismos
puntos de anclaje.

**Won't have this time**

| Id | Qué se descarta | Por qué ahora no | ¿Volverá? |
|---|---|---|---|
| **RF-W01** | Runner de a11y propio (axe/pa11y empaquetado) | La plantilla no presupone stack; imponer un runner rompe proyectos sin frontend | Sí, como sugerencia de `/sdd-init` |
| **RF-W02** | Agente `usability-auditor` dedicado | Rompería la paridad de 20 agentes en seis hosts a cambio de poco: `code-reviewer` ya es auditor de solo lectura y ya coordina `/sdd-verify` | Solo si el rol se demuestra insuficiente |
| **RF-W03** | Verificación automática de contraste sobre el diseño | Requiere leer Figma/Stitch por MCP en CI, que no está disponible en todos los hosts | Posible en una spec de `design-sync` |

## 5. Requisitos no funcionales

| Categoría | Requisito | Valor objetivo |
|---|---|---|
| Rendimiento | `check-sdd.mjs` no se degrada de forma perceptible | < +15 % de tiempo |
| Portabilidad | El contrato llega a los seis hosts | 6/6 superficies |
| Compatibilidad | Las specs anteriores a la 009 no se rompen | `enforceFromSpec` respetado |
| Seguridad y privacidad | Sin PII; no toca auth ni datos | n/a |
| Accesibilidad | WCAG 2.2 AA es el estándar declarado del contrato | AA |
| Observabilidad | Los errores nuevos son distinguibles por código | `usabilidad/*`, `diseno/*` |
| Coste | Sin dependencias de runtime nuevas | 0 |

### 5.1 · Clasificación de seguridad

| Señal | Aplica | Requisito / caso afectado | Fuente o motivo |
|---|---|---|---|
| Autenticación o sesión | `no` | — | La spec solo toca plantillas, doctrina y validación |
| Autorización, roles, IDOR o multi-tenant | `no` | — | Sin superficie de ejecución |
| PII, pagos, ficheros o administración | `no` | — | No se leen ni escriben datos personales |
| Integración externa, webhook o agente/LLM | `no` | — | Sin llamadas externas nuevas |

### 5.2 · Clasificación documental

> Se reutilizan los conjuntos documentales ya declarados en `.sdd/docs.json`. Un `DOC-ID` identifica
> una superficie estable, no una spec: inventar `DOC-009-*` habría creado un conjunto huérfano.

| DOC-ID / estado | Superficie afectada | Audiencia | Motivo o comportamiento que cambia |
|---|---|---|---|
| `DOC-TRACE` | `architecture` | Agentes y mantenedores | Las plantillas de spec y `check-sdd.mjs` cambian: `OPERATING-MODEL.md` gana la trazabilidad de usabilidad por fase |
| `DOC-VCS` | `developer-readme` | Quien instala la plantilla | El instalador escribe un contrato nuevo y distribuye dos checklists y dos reglas de IDE |
| `DOC-HOSTS` | `developer-readme` | Quien usa la plantilla desde otro IDE | Cambian perfiles de agente en las seis superficies y aparecen reglas por `glob` |

### 5.3 · Clasificación de usabilidad

> Esta spec estrena la clasificación que ella misma introduce.

| Señal | Aplica | Requisito / caso afectado | Fuente o motivo |
|---|---|---|---|
| Pantalla nueva o modificada | `no` | — | La plantilla no tiene interfaz propia; su superficie es documental y de CLI |
| Formulario o entrada de datos | `no` | — | Sin formularios |
| Espera perceptible (> 300 ms) | `no` | — | `check-sdd` es síncrono y local |
| Texto de interfaz nuevo | `sí` | RF-06, RF-07 | Los mensajes de error del validador y los avisos del instalador son microcopy que leen personas |

**Impacto declarado**: `aplicable`, por la última señal. Los controles se limitan al área `COPY`:
los mensajes de error nuevos deben decir qué está mal y cómo se arregla, según la misma regla que
esta spec impone a los demás. Un contrato que no se aplica a sí mismo no es creíble.

## 6. Criterios de aceptación

### CA-01 — Una spec sin clasificación de usabilidad no aprueba plan *(cubre RF-01)*
```gherkin
Escenario: falta el impacto de usabilidad
  Dado una spec posterior al contrato con plan.md presente
  Y sin fila "Impacto de usabilidad" en su cabecera
  Cuando se ejecuta check-sdd.mjs --strict
  Entonces falla con código 1 y el error usabilidad/impacto
```

### CA-02 — Un control aplicable sin trazabilidad completa bloquea *(cubre RF-02)*
```gherkin
Escenario: matriz de usabilidad incompleta
  Dado una spec con Impacto de usabilidad "aplicable"
  Y un control UX-FORM-001 con Aplica "sí" y la celda Test vacía
  Cuando se ejecuta check-sdd.mjs --strict
  Entonces falla con el error usabilidad/matriz indicando el control y el campo
```

### CA-03 — El identificador de control se valida *(cubre RF-02)*
```gherkin
Escenario: ID de control mal formado
  Dado un control llamado "UX-1" en la matriz del plan
  Cuando se ejecuta check-sdd.mjs --strict
  Entonces falla con usabilidad/control indicando el formato UX-<AREA>-NNN
```

### CA-04 — Los controles llegan a las tareas *(cubre RF-03)*
```gherkin
Escenario: tarea de UI sin controles declarados
  Dado una spec con impacto aplicable y controles UX-* en el plan
  Y una tarea que no declara "Controles de usabilidad"
  Cuando se ejecuta check-sdd.mjs --strict
  Entonces avisa con usabilidad/trazabilidad nombrando la tarea
```

### CA-05 — El informe de usabilidad es parseable *(cubre RF-04)*
```gherkin
Escenario: informe presente y bien formado
  Dado un informe en docs/design/reports/ con el marcador sdd-usability-report:v1
  Y un JSON con schemaVersion, spec, standards, verdict y controlsNotExecuted
  Cuando se ejecuta check-sdd.mjs --strict
  Entonces el informe se acepta y su veredicto se contrasta con la decisión de entrega
```

### CA-06 — Un hallazgo ALTO impide la entrega *(cubre RF-05)*
```gherkin
Escenario: GO con hallazgos abiertos
  Dado una spec con decisión de entrega "GO"
  Y un informe de usabilidad con openFindings.high mayor que cero
  Cuando se ejecuta check-sdd.mjs --strict
  Entonces falla indicando que un hallazgo ALTO bloquea la entrega
```

### CA-07 — Un control no ejecutado impide la entrega *(cubre RF-05)*
```gherkin
Escenario: GO con controles sin ejecutar
  Dado un informe de usabilidad con controlsNotExecuted no vacío
  Y una decisión de entrega "GO"
  Cuando se ejecuta check-sdd.mjs --strict
  Entonces falla: un control no ejecutado conserva riesgo y no cuenta como verificado
```

### CA-08 — La doctrina de accesibilidad se distribuye *(cubre RF-06)*
```gherkin
Escenario: instalación limpia
  Dado un directorio vacío
  Cuando se instala la plantilla
  Entonces existe docs/design/A11Y-CHECKLIST.md
  Y existe docs/design/USABILITY-CHECKLIST.md
  Y ninguna referencia apunta a un documento inexistente
```

### CA-09 — Las seis superficies reciben la doctrina *(cubre RF-07)*
```gherkin
Escenario: portabilidad del contrato
  Dado una instalación completa
  Entonces existe .cursor/rules/40-usability.mdc con globs de UI
  Y existe .github/instructions/usability.instructions.md con el mismo applyTo
  Y los seis directorios de agentes conservan 20 perfiles
  Y las skills canónicas siguen siendo 26
```

### CA-10 — El HANDOFF conserva la usabilidad *(cubre RF-08)*
```gherkin
Escenario: la cadena no pierde el control
  Dado un perfil de agente de fase posterior al diseño
  Cuando se inspecciona su bloque ### HANDOFF
  Entonces contiene un campo de usabilidad
```

### CA-11 — El gate a11y no se presupone *(cubre RF-09)*
```gherkin
Escenario: proyecto sin herramienta de accesibilidad
  Dado un proyecto con impacto de usabilidad aplicable
  Y sin runner de a11y configurado
  Cuando se ejecuta el circuito de verificación
  Entonces el gate se declara como control no ejecutado con riesgo y propietario
  Y no se presupone ningún stack
```

### CA-12 — Las tablas de diseño dejan de ser decorativas *(cubre RF-10)*
```gherkin
Escenario: design.md con marcadores de plantilla
  Dado una spec con impacto de usabilidad aplicable
  Y un design.md cuya tabla de accesibilidad conserva celdas de plantilla vacías
  Cuando se ejecuta check-sdd.mjs --strict
  Entonces falla con diseno/tabla nombrando la sección
```

### Matriz RF → CA

| OBJ | PRD-RF | UC | RF | CA |
|---|---|---|---|---|
| OBJ-001 | PRD-RF-001 | UC-001 | RF-01 | CA-01 |
| OBJ-001 | PRD-RF-001 | UC-001 | RF-02 | CA-02, CA-03 |
| OBJ-001 | PRD-RF-001 | UC-001 | RF-03 | CA-04 |
| OBJ-001 | PRD-RF-001 | UC-001 | RF-04 | CA-05 |
| OBJ-001 | PRD-RF-001 | UC-001 | RF-05 | CA-06, CA-07 |
| OBJ-001 | PRD-RF-001 | UC-001 | RF-06 | CA-08 |
| OBJ-001 | PRD-RF-001 | UC-001 | RF-07 | CA-09 |
| OBJ-001 | PRD-RF-001 | UC-001 | RF-08 | CA-10 |
| OBJ-001 | PRD-RF-001 | UC-001 | RF-09 | CA-11 |
| OBJ-001 | PRD-RF-001 | UC-001 | RF-10 | CA-12 |

## 7. Casos límite

| Situación | Comportamiento esperado |
|---|---|
| Spec anterior al contrato sin clasificación | No se exige nada: `enforceFromSpec` la deja fuera |
| Spec sin interfaz alguna | `sin-ui · <motivo material>`; sin motivo, error |
| Impacto `aplicable` y matriz con marcadores de plantilla | Error, igual que en seguridad |
| Proyecto sin runner de a11y | Control no ejecutado con riesgo, propietario y siguiente paso; nunca "pasa" |
| Informe presente pero con JSON inválido | Error de esquema; no se acepta como informe |
| Informe fuera de `docs/design/reports/` o con `..` en la ruta | Rechazado |
| `verdict: PASS` con hallazgos MEDIOS | Rechazado: `PASS` exige cero MEDIO |
| Dos controles con el mismo identificador | Error de duplicado |
| Host que no soporta delegación | El agente indica perfil y comando exactos y deja las rutas durables |

## 8. Reglas de negocio

- **RN-01** — Un control declarado `no aplica` necesita justificación **material**; "no procede" no
  es una justificación.
- **RN-02** — El auditor de usabilidad es de **solo lectura**. Quien audita no escribe su propio
  informe: lo materializa `docs-writer`, literalmente y sin reinterpretar.
- **RN-03** — `ux-pending` conserva historia brownfield. **Nunca** cubre una spec nueva con interfaz.
- **RN-04** — Un control no ejecutado **conserva riesgo**: no cuenta como verificado y bloquea `GO`.
- **RN-05** — La accesibilidad es el suelo, no el techo: cumplir WCAG 2.2 AA **no** exime de las diez
  heurísticas ni de los umbrales de velocidad percibida.
- **RN-06** — No se presupone stack. Ningún control puede exigir una librería concreta.

## 9. Fuera de alcance

- Implementar componentes de interfaz accesibles: esta spec entrega el **contrato**, no una librería.
- Auditar las specs 001 a 008 con el contrato nuevo: quedan cubiertas por `enforceFromSpec`.
- Traducir la doctrina a otros idiomas.
- Sustituir `design-sync`: la lectura de tokens desde Figma o Stitch sigue donde está.

## 10. Riesgos y dependencias

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Convertir `ux-designer` en auditor de solo lectura rompe su escritura en `/sdd-design` | Alta | Alto | **Ya resuelto en el plan**: la auditoría la asume `code-reviewer`, que ya es de solo lectura y ya coordina `/sdd-verify`. `ux-designer` no cambia de naturaleza |
| Añadir un agente rompe la paridad de 20 en seis hosts | Media | Alto | No se crea ningún agente ni ninguna skill: se amplían los existentes |
| El contador `!== 26` de `check-sdd.mjs` falla | Media | Medio | No se crean skills nuevas; se verifica en `test-install.mjs` |
| El contrato se vuelve ruido en proyectos sin UI | Media | Medio | `sin-ui` con motivo material es un camino de primera clase, no una excepción |
| Exigir el gate `a11y` rompe proyectos sin frontend | Alta | Alto | El gate solo es obligatorio con impacto `aplicable`; sin herramienta, se declara no ejecutado |
| Sobrecarga de plantilla: las specs se vuelven inmanejables | Media | Medio | Se reutilizan las secciones existentes de `design.md` en vez de duplicarlas |

## 11. Supuestos

- El patrón de la spec 007 es replicable tal cual sobre los mismos ficheros. **Validado** por
  inspección de `200a94a` antes de escribir esta spec.
- `code-reviewer` puede asumir la auditoría de usabilidad con las dos checklists como criterio, sin
  ampliar sus herramientas. **Pendiente de validar** al escribir su perfil.
- WCAG 2.2 AA y las diez heurísticas de Nielsen son los estándares declarados; no se versionan por
  proyecto en esta iteración.
- `docs/design/reports/` puede convivir con `docs/design/flows` y `wireframes` sin que el instalador
  lo trate como directorio virgen.

## 12. Glosario

| Término | Definición |
|---|---|
| **Control de usabilidad** | Comprobación identificada `UX-<AREA>-NNN` que enlaza decisión, tarea, test y evidencia |
| **Área** | `A11Y` accesibilidad · `FORM` formularios · `COPY` microcopy · `PERF` velocidad percibida |
| **Impacto de usabilidad** | Clasificación en la cabecera de la spec: `aplicable`, `sin-ui · motivo` o `ux-pending` |
| **Informe de usabilidad** | Documento en `docs/design/reports/` con marcador `sdd-usability-report:v1` y JSON canónico |
| **Velocidad percibida** | Sensación de rapidez, distinta del tiempo real medido |
| **Actualización optimista** | Pintar el resultado antes de que el servidor confirme |
| **POUR** | Perceptible, Operable, Understandable, Robust — los cuatro principios de WCAG |

## 13. Preguntas abiertas

- Ninguna. Las dos decisiones abiertas (alcance de la integración y naturaleza del gate `a11y`) se
  resolvieron con la persona antes de escribir esta spec y están registradas en §10 y en RF-09.

## 14. Gate humano de especificación

| Campo | Valor |
|---|---|
| **Estado** | `approved` |
| **Aprobado / rechazado por** | usuario |
| **Fecha** | 2026-08-13 |
| **Alcance de la decisión** | RF-01 … RF-10, CA-01 … CA-12, sin discrepancias abiertas |
| **Condiciones** | aprobación retrospectiva explícita tras integrar la implementación; no se presenta como previa al trabajo |

> `/sdd-plan` no comienza mientras haya marcadores, discrepancias abiertas o este gate no esté
> en `approved`. La aprobación del PRD no sustituye la aprobación funcional de esta spec.
