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

---

## Resumen de cambios de alcance

| Ronda | Qué se amplió | Qué se sacó del alcance |
|---|---|---|
| 1 | Resolución por tarea (RF-04 a RF-06) y corrección del vocabulario de host (RF-03) | Medición de coste real (RF-W01, RF-W04), superficies sin soporte de modelo (RF-W02), cambio de nivel en caliente (RF-W03) |

---

## Estado

- Marcadores iniciales: 4
- Resueltos: 4
- **Pendientes: 0**

Los puntos que siguen abiertos no son ambigüedades de la spec, sino **decisiones reservadas a una
persona**, y están listadas en `spec.md` §14: alcance del mapa de identificadores (SUP-02), lista
de agentes no rebajables (SUP-03), aceptación de la clasificación `sensible` (D1) y resolución de
DISC-003.

## Gate humano de clarificaciones

| Campo | Valor |
|---|---|
| Estado | `pending` |
| Persona | — |
| Fecha | — |
| Discrepancias abiertas | 1 · `DISC-003` |

Este gate alimenta el gate de `spec.md`; no lo sustituye.
