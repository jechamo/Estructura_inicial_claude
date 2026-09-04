# Clarificaciones · 018-seleccion-de-modelo-por-agente-y-tarea

Registro de las ambigüedades resueltas. Cada respuesta actualiza `spec.md`.

---

## Ronda 1 — 2026-09-04

Cuatro preguntas se plantearon al usuario antes de redactar la spec; las tres primeras están
respondidas y la cuarta se respondió parcialmente, con una pregunta de vuelta que queda recogida
en P4.

### P1 · ¿Hasta dónde llega la selección: solo por agente o también por tarea?

**Marcador origen**: `spec.md` §4 (alcance de RF-04)

**Trazabilidad afectada**: `OBJ-004 → PRD-RF-007 → UC-005 → RF-04/CA-05`

**Fuentes / discrepancias**: `SRC-001` · ninguna

**Opciones planteadas**:
- a) Niveles + elección por tarea — consecuencia: cubre el ahorro estático y el dinámico; hay que
  definir una política de escalado y su comando de consulta.
- b) Solo estático por agente — consecuencia: más simple, pero una tarea trivial y una compleja
  del mismo agente se pagan igual.
- c) Solo documentar la política — consecuencia: barato y estéril; nadie la aplica.

**Recomendación del agente**: a)

**Respuesta**: a) Niveles + elección por tarea.

**Decidido por**: usuario

**Impacto en la spec**: RF-04, RF-05, RF-06 y CA-05, CA-06, CA-07. La política se apoya en la
clasificación `light`/`compact`/`full` que ya existe, sin duplicarla.

---

### P2 · ¿Se fijan identificadores de modelo concretos o se evita nombrarlos?

**Marcador origen**: `spec.md` §11 (SUP-02)

**Trazabilidad afectada**: `OBJ-003 → PRD-RF-006 → UC-001 → RF-01/CA-01`

**Fuentes / discrepancias**: `SRC-018-A`, `SRC-018-B`, `SRC-018-D` · `DISC-003`

**Opciones planteadas**:
- a) Mapa de identificadores en la configuración — consecuencia: cada nivel declara su modelo
  real por host; un solo fichero que actualizar; un gate detecta la deriva.
- b) Sin identificadores, solo herencia y esfuerzo — consecuencia: nunca caduca, pero deja a
  Copilot sin ahorro.
- c) Identificadores + esfuerzo de razonamiento por nivel — consecuencia: el mayor ahorro real,
  más superficie que mantener.

**Recomendación del agente**: a)

**Respuesta**: a), con una pregunta de vuelta que se trata en P4.

**Decidido por**: usuario

**Impacto en la spec**: RF-01 fija que el **contrato son los niveles**, no los identificadores.
RF-06 añade caducidad. SUP-02 deja abierto al gate humano si el mapa llega a pinchar
identificadores o se queda en herencia y esfuerzo: el mecanismo admite ambos y la decisión no
cambia ningún requisito.

---

### P3 · ¿Se entra por el circuito completo o se implementa directamente?

**Marcador origen**: `spec.md` cabecera (estado y fase)

**Trazabilidad afectada**: `OBJ-002 → PRD-RF-003 → UC-002 → todos`

**Fuentes / discrepancias**: `SRC-001` · ninguna

**Opciones planteadas**:
- a) Spec primero y parar en el gate humano.
- b) Circuito completo de una tirada, presentando todo al final.
- c) Solo el diseño técnico, sin tocar el repositorio.

**Recomendación del agente**: a)

**Respuesta**: a) Spec primero, luego implementar.

**Decidido por**: usuario

**Impacto en la spec**: ninguno sobre requisitos. Fija que `/sdd-plan` no arranca hasta que §14
esté en `approved`. Es además lo que exige la regla dura 1: la frontera aprobada del circuito
clasifica este cambio como `full`.

---

### P4 · Si los hosts cambian el modelo por su cuenta, ¿de qué sirve declararlo?

**Marcador origen**: pregunta del usuario en la ronda de P2 — *«¿qué pasa si se actualizan
modelos? en Cursor he visto que cuando lanza subagentes a veces coge otros modelos, y en Copilot
igual, ¿o estoy equivocado?»*

**Trazabilidad afectada**: `OBJ-003 → PRD-RF-006 → UC-001 → RF-03/CA-04`, `RF-06/CA-07`,
`RF-07/CA-08`

**Fuentes / discrepancias**: `SRC-018-A`, `SRC-018-B`, `SRC-018-C`, `SRC-018-D` · `DISC-003`

**Verificación**: la observación del usuario es correcta y está documentada por los tres
proveedores.

- Cursor aplica el modelo del perfil **salvo** que una restricción de administración lo bloquee,
  el plan lo exija en otra modalidad o el modelo no esté disponible; entonces sustituye por uno
  compatible **sin avisar**. Además, los veinte perfiles instalados usan vocabulario de otro
  proveedor, que ese host no reconoce: hoy ya están en ese fallback (`DISC-003`).
- Copilot aplica el modelo del perfil en el IDE, no en el agente de nube; y la sintaxis de lista
  que una superficie admite hace que otra del mismo proveedor **rechace el fichero entero**.
- Codex resuelve en cascada —valor explícito de la llamada, luego el del perfil, luego el
  predeterminado de subagentes, luego el del padre—, de modo que lo declarado puede quedar por
  debajo de un valor explícito.

**Opciones planteadas**:
- a) Declarar identificadores y confiar — consecuencia: envejece mal y falla en silencio.
- b) Niveles como contrato, identificadores como configuración datada con caducidad, valor
  portable de herencia siempre disponible, vocabulario validado por host y registro del nivel
  como **declarado**, nunca observado.
- c) No declarar nada y dejarlo al usuario en cada sesión — consecuencia: es el estado actual, y
  es el problema.

**Recomendación del agente**: b)

**Respuesta**: pendiente de confirmación en el gate humano; se adopta b) como supuesto porque es
la única opción compatible con la respuesta a) de P2 y con la regla 7 del proyecto.

**Decidido por**: agente (recomendación aplicada como supuesto explícito)

**Impacto en la spec**: RF-03 (rechazar vocabulario inválido en vez de escribirlo), RF-06
(caducidad y aviso), RF-07 y RN-05 (nivel declarado, nunca observado), §7 (caso límite «el host
ignora el valor»), §10 (dos riesgos con probabilidad alta), SUP-02 y SUP-04, y DISC-003.

---

## Ronda 2 — 2026-09-04

### P5 · ¿El nivel es una propiedad del agente o de la tarea?

**Marcador origen**: petición del usuario — *«lo que quiero es que no baje la calidad del
circuito. Si debo cambiar el color de un botón no necesito un opus, con un haiku valdría; para
otro cambio más complejo igual debería ser un sonnet o un opus (similitudes con luna, terra y
sol)»*

**Trazabilidad afectada**: `OBJ-004 → PRD-RF-008 → UC-005 → RF-04/CA-10`,
`OBJ-002 → PRD-RF-003 → UC-002 → RF-09/CA-11`

**Fuentes / discrepancias**: `SRC-001`, `SRC-003` · ninguna nueva

**Fallo detectado en el diseño de la ronda 1.** La resolución tomaba como base el nivel **del
agente** y solo lo modulaba con el nivel de circuito. Contrastado contra el ejemplo del usuario,
no da el resultado que pide:

| Dónde vive el color del botón | Nivel de circuito | Nivel que daba el diseño de la ronda 1 |
|---|---|---|
| `src/components/Button.tsx` | `compact` (suelo del código ejecutable) | intermedio — **no el mínimo** |
| `src/styles/button.css` | puede ser `light` | mínimo ✅ |

Es decir: el mismo cambio trivial costaba el nivel intermedio solo por vivir en un fichero con
extensión ejecutable. El nivel de circuito mide **cuánto expediente exige un cambio**, no
**cuánto criterio exige la tarea**. Son dos preguntas distintas y estaba usando una para
responder la otra.

**Opciones planteadas**:
- a) Dejarlo como estaba — consecuencia: el ejemplo del usuario no se cumple; el ahorro se pierde
  justo en el caso más frecuente.
- b) Añadir más señales de ruta al clasificador de circuito — consecuencia: contamina una
  frontera ya aprobada con una responsabilidad que no es suya.
- c) **La tarea declara su nivel base**; el agente solo aporta un suelo para los perfiles no
  rebajables; las elevaciones obligatorias siguen ganando siempre.

**Recomendación del agente**: c)

**Respuesta**: c), aplicada. La tarea es la unidad correcta: ya es atómica, ya nace de un
criterio de aceptación y ya la revisa una persona en el gate del backlog.

**Decidido por**: usuario (requisito) · agente (mecanismo)

**Impacto en la spec**: **RF-04** reescrito (base = nivel de la tarea), **RF-05** reescrito
(suelo, no base), **RF-09 nuevo** (toda tarea declara nivel base, propuesto de forma
determinista y revisable), **RN-01**, **RN-02** y **RN-02 bis** reescritos, **CA-05** y **CA-06**
actualizados, **CA-10** y **CA-11** nuevos, dos casos límite, dos riesgos, SUP-06 y SUP-07.
MoSCoW recalculado: must 55 %.

---

### P6 · ¿Cómo se garantiza que bajar el nivel no baja la calidad?

**Marcador origen**: petición del usuario — *«lo que quiero es que no baje la calidad del
circuito»*

**Trazabilidad afectada**: `OBJ-002 → PRD-RF-004 → UC-004 → RF-05/CA-06`, `RF-04/CA-10`

**Fuentes / discrepancias**: `SRC-001` · ninguna

**Respuesta**: con cuatro barreras independientes, ya recogidas en la spec. Se listan juntas aquí
porque el requisito es del usuario y debe poder comprobarse de un vistazo:

| # | Barrera | Dónde |
|---|---|---|
| 1 | El nivel toca **el razonamiento, nunca el expediente**: mismos gates, mismo TDD, misma bitácora, misma evidencia y mismas aprobaciones en los tres niveles | RN-04, y CA-10 lo exige explícitamente en el caso más barato |
| 2 | Hay agentes **no rebajables**: los cuatro auditores, `architect` y `spec-analyst` conservan su suelo aunque la tarea declare el mínimo | RF-05, RN-03, CA-06 |
| 3 | Hay **elevaciones obligatorias** que ninguna declaración puede desactivar: contratos, arquitectura, migraciones, seguridad e impacto `sensible` | RF-05, RN-02 bis |
| 4 | El nivel base **se propone de forma determinista**, no lo elige un modelo, y una persona lo revisa antes de implementar | RF-09, RN-06, CA-11 |

**Decidido por**: usuario (requisito) · agente (materialización)

**Impacto en la spec**: ninguna barrera es nueva salvo la 4; las otras tres ya estaban y ahora
quedan trazadas a un criterio de aceptación cada una.

---

### P7 · ¿Cómo se llaman los tres niveles?

**Marcador origen**: analogía del usuario — *«similitudes con luna, terra y sol»*

**Trazabilidad afectada**: `OBJ-003 → PRD-RF-006 → UC-001 → RF-01/CA-01`

**Fuentes / discrepancias**: ninguna

**Opciones planteadas**:
- a) Por rol del trabajo: `razonamiento` / `ejecucion` / `mecanico`.
- b) Por peso del trabajo: **`luna` / `terra` / `sol`**.
- c) Numéricos: `1` / `2` / `3`.

**Recomendación del agente**: b), y no solo por seguir la analogía. Nombrar por rol sugiere que
el nivel pertenece al agente —«el agente de razonamiento»—, que es exactamente lo que RN-02 niega
tras la ronda 2: pertenece a la tarea. Nombrar por peso lo dice bien: *cambiar un color es una
tarea `luna`; cambiar un contrato de autorización es una tarea `sol`*. Y ningún nombre comercial
de modelo entra en el vocabulario, que es lo que RF-01 exige.

**Respuesta**: b), adoptada como supuesto revisable.

**Decidido por**: agente (recomendación aplicada como SUP-06, renombrable en el gate)

**Impacto en la spec**: SUP-06 y §14. El cuerpo de la spec sigue sin nombrar los niveles: la
nomenclatura vive en la configuración y en el plan técnico, no en el QUÉ.


## Decisiones tomadas sin preguntar

Se resolvieron sin consulta porque no cambiaban materialmente el resultado; quedan registradas
para que el gate humano pueda desmentirlas.

| # | Duda | Decisión | Por qué no se preguntó |
|---|---|---|---|
| D1 | ¿Impacto de seguridad `sensible` o `no-sensible`? | `sensible` | La spec cambia con qué capacidad razonan los auditores; clasificar a la baja sería la decisión arriesgada. El gate puede rebajarlo con motivo escrito |
| D2 | ¿Se tocan las superficies de Gemini y Antigravity? | No | El host no admite el campo; escribirlo sería declarar un control inexistente |
| D3 | ¿Se añaden las fuentes de proveedor al baseline de producto? | No | Obligaría a reaprobar el baseline y recalcular su sello por un motivo que no es de producto (SUP-05) |
| D4 | ¿La spec modifica la clasificación `light`/`compact`/`full`? | No, la consume | Tocarla ampliaría el alcance a una frontera ya aprobada |
| D5 | ¿Métrica de ahorro en euros o en distribución de niveles? | Distribución de niveles | Ningún host expone coste por subagente; una cifra en euros sería inventada (regla 7) |
| D6 | ¿Se añade un gate nuevo para revisar el nivel de cada tarea? | No: se revisa en el gate del backlog que ya existe | Un gate más por una decisión reversible desincentiva usar el mecanismo |

---

## Resumen de cambios de alcance

| Ronda | Qué se amplió | Qué se sacó del alcance |
|---|---|---|
| 1 | Resolución por tarea (RF-04 a RF-06) y corrección del vocabulario de host (RF-03) | Medición de coste real (RF-W01, RF-W04), superficies sin soporte de modelo (RF-W02), cambio de nivel en caliente (RF-W03) |
| 2 | Nivel base declarado por la tarea (RF-09, CA-10, CA-11) | Nada. La ronda 2 corrige el mecanismo, no amplía el alcance |

---

## Estado

- Marcadores iniciales: 4 (ronda 1) + 3 (ronda 2)
- Resueltos: 7
- **Pendientes: 0**

Los puntos que siguen abiertos no son ambigüedades de la spec, sino **decisiones reservadas a una
persona**, y están listadas en `spec.md` §14: alcance del mapa de identificadores (SUP-02), lista
de agentes no rebajables (SUP-03), nombres de los tres niveles (SUP-06), aceptación de la
clasificación `sensible` (D1) y resolución de DISC-003.

## Gate humano de clarificaciones

| Campo | Valor |
|---|---|
| Estado | `pending` |
| Persona | — |
| Fecha | — |
| Discrepancias abiertas | 1 · `DISC-003` |

Este gate alimenta el gate de `spec.md`; no lo sustituye.
