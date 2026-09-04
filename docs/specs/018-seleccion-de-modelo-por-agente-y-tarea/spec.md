# 018 · Selección de modelo por agente y por tarea

| Campo | Valor |
|---|---|
| **ID** | `018-seleccion-de-modelo-por-agente-y-tarea` |
| **Estado** | borrador |
| **Autor** | Usuario y Claude |
| **Fecha** | 2026-09-04 |
| **Rama** | `claude/agent-model-selection-n9zcf8` |
| **Depende de** | `013-verificacion-independiente-del-host`, `017-circuito-proporcional-contexto` |
| **Baseline de producto** | [`docs/product/PRD.md`](../../product/PRD.md) · estado `approved` |
| **Corte de producto** | `FEAT-001` (paridad multi-host), `FEAT-004` (determinismo y coste) |
| **Fuentes** | [`docs/product/SOURCES.md`](../../product/SOURCES.md) · `SRC-001`, `SRC-003` · fuentes técnicas propias en §12 bis |
| **Impacto de seguridad** | `sensible` |
| **Impacto de usabilidad** | `sin-ui · cambia configuración versionada y salida de un comando; no hay pantalla, formulario ni texto que lea un usuario final` |
| **Impacto de documentación** | `aplicable · DOC-HOSTS, DOC-CIRCUITO, DOC-GEN, DOC-TRACE` |

> ⚠️ Esta spec describe **QUÉ** y **POR QUÉ**. Las rutas, formatos de fichero, nombres de
> comando y esquemas van en `plan.md`.

---

## 0. Origen y trazabilidad de producto

| Objetivo | Requisito de producto | Caso de uso | Requisito de esta spec | Fuente |
|---|---|---|---|---|
| OBJ-003 | PRD-RF-006 | UC-001 | RF-01, RF-02, RF-03 | SRC-001 |
| OBJ-004 | PRD-RF-007 | UC-005 | RF-04, RF-06 | SRC-001 |
| OBJ-004 | PRD-RF-008 | UC-005 | RF-01, RF-04 | SRC-001 |
| OBJ-002 | PRD-RF-004 | UC-004 | RF-05, RF-07 | SRC-003 |
| OBJ-003 | PRD-RF-006 | UC-001 | RF-08 | SRC-003 |
| OBJ-002 | PRD-RF-003 | UC-002 | RF-09 | SRC-003 |

**Discrepancias que afectan a esta spec**: ninguna abierta. Se abre **DISC-003** (§12 bis): la
documentación de compatibilidad afirma soporte de modelo por agente en una superficie donde el
valor instalado no es válido para ese host.

## 1. Problema

El circuito reparte el trabajo entre veinte agentes con exigencias de criterio muy distintas
—decidir una arquitectura no se parece a anotar una entrada de bitácora— y hoy **no aprovecha esa
diferencia para gastar menos**. El coste se paga entero, siempre, en los cuatro hosts que sí
permiten elegir modelo.

Cuatro hechos concretos, medidos sobre el repositorio y sobre la documentación de cada host:

1. **Diez de los veinte perfiles heredan el modelo de la sesión** y ninguno declara el nivel
   intermedio. En la práctica, un especialista que solo aplica un patrón conocido corre en el
   modelo más caro disponible, porque es el que suele tener abierto quien trabaja.
2. **La superficie de Cursor lleva vocabulario que Cursor no entiende.** Los valores instalados
   provienen del vocabulario de otro proveedor; ese host acepta otros, y ante un valor que no
   reconoce **cae a un modelo compatible sin avisar**. El resultado es una elección declarada que
   no se aplica y que nadie detecta.
3. **Copilot y Codex no fijan nada.** La documentación de compatibilidad del propio repositorio
   reconoce que en Codex «modelo, esfuerzo y concurrencia se heredan de la sesión». Son las dos
   superficies donde el ahorro sería mayor y donde hoy es cero.
4. **La política existe solo como prosa.** El catálogo de agentes «sugiere» modelos por tipo de
   trabajo; ninguna comprobación la aplica, así que la sugerencia y los ficheros pueden divergir
   —y divergen— sin que ningún gate se entere.

Y falta la mitad más rentable: **la decisión por tarea**. El circuito ya clasifica cada cambio
como `light`, `compact` o `full`, y cada spec ya declara su impacto de seguridad. Ese
conocimiento no llega a la elección de modelo: corregir una errata y cambiar un contrato de
autorización se pagan igual.

El coste de no arreglarlo es doble. El evidente: factura y cuota agotada antes de terminar. El
que importa más: **cuando la cuota se acaba a mitad de tarea, lo que se salta es el control**
—el ciclo TDD, la auditoría, la evidencia—, que es exactamente lo que este sistema existe para
impedir.

## 2. Objetivo y métrica de éxito

**Objetivo**: que cada agente, y cada tarea, se ejecuten en el nivel de modelo más barato que
todavía hace bien ese trabajo, de forma declarada, verificable e igual en los cuatro hosts que lo
permiten —sin rebajar ningún gate, control de seguridad ni ciclo TDD.

**Cómo sabremos que funcionó**:

| Métrica | Estado hoy | Objetivo |
|---|---|---|
| Agentes con nivel explícito, no heredado | 10 de 20 | 20 de 20 |
| Superficies de host con el modelo derivado de una única fuente | 0 de 4 | 4 de 4 |
| Valores de modelo inválidos para su host | 20 (superficie de Cursor) | 0 |
| Deriva entre fuente y superficies detectada por un gate | no se detecta | falla el gate en el primer valor divergente |
| Resolución del nivel por tarea | inexistente | determinista y reproducible en el 100 % de las combinaciones del banco de pruebas |
| Trazas de ejecución que registran el nivel solicitado | 0 % | 100 %, marcadas como declaradas |
| Tareas del backlog con nivel base declarado | 0 % | 100 %, propuesto por el sistema y revisable por una persona |

**Lo que deliberadamente NO se promete**: una cifra de ahorro en euros. Ningún host expone el
coste por agente, así que afirmarlo sería el «pasa sin ejecución» que la regla 7 prohíbe. Se mide
la distribución de niveles, que es lo que sí se puede demostrar.

## 3. Usuarios y contexto de uso

| Perfil | Qué necesita | Frecuencia | Contexto |
|---|---|---|---|
| Persona desarrolladora | terminar la tarea sin agotar la cuota, sin decidir el modelo a mano cada vez | cada sesión | Claude Code, Cursor, Copilot o Codex |
| Persona revisora | comprobar que rebajar el nivel no rebajó ningún control | cada PR | commits, gates y CI |
| Mantenedor de la plantilla | cambiar el mapa de modelos en un sitio y que llegue a los cuatro hosts | al cambiar los modelos del mercado | instalación y actualización |
| Agente coordinador | conocer el nivel aplicable a una tarea sin inventárselo | cada delegación | resolución determinista consultable |

## 4. Requisitos funcionales (EARS) con prioridad MoSCoW

| Id | Requisito | Prioridad | Esfuerzo |
|---|---|---:|---:|
| **RF-01** | El sistema DEBE declarar, en una configuración versionada y aprobada por una persona, el nivel de modelo de cada uno de los veinte agentes, expresado en **niveles independientes del proveedor** y no en nombres de producto. | M | 5 |
| **RF-02** | CUANDO una superficie de host admita fijar el modelo, el sistema DEBE derivar su valor desde esa configuración única y DEBE fallar el gate si alguna superficie diverge de ella. | M | 5 |
| **RF-03** | SI un valor no pertenece al vocabulario que el host acepta, ENTONCES el sistema DEBE rechazarlo antes de emitirlo, en lugar de escribirlo y confiar en el fallback silencioso del host. | M | 3 |
| **RF-04** | CUANDO se solicite el nivel aplicable a una tarea, el sistema DEBE resolverlo de forma determinista y reproducible tomando como base **el nivel declarado por esa tarea** y elevándolo por el suelo del agente, el nivel de circuito y el impacto de seguridad, sin que ningún modelo participe en la decisión. | S | 5 |
| **RF-05** | El sistema DEBE impedir que la resolución rebaje el nivel de los agentes declarados como no rebajables, y DEBE elevar al nivel máximo cuando la tarea toque contratos, arquitectura, migraciones, seguridad o esté clasificada como sensible. | M | 2 |
| **RF-06** | MIENTRAS la configuración esté sin aprobar, caducada o sea inválida, el sistema DEBE avisar con el comando exacto de revisión y NO DEBE aplicar la resolución por tarea. | S | 3 |
| **RF-07** | El sistema DEBE registrar el nivel solicitado en la traza de ejecución con verificación **declarada**, y DEBE poder agregar esa distribución; NUNCA DEBE afirmar qué modelo se ejecutó realmente. | S | 3 |
| **RF-08** | El sistema DEBE mantener el catálogo de agentes y la matriz de compatibilidad coherentes con la configuración aprobada, incluida la corrección del soporte real de cada host. | C | 3 |
| **RF-09** | CUANDO se genere el backlog de una spec, cada tarea DEBE declarar su nivel base; el sistema DEBE proponerlo de forma determinista a partir del tipo de trabajo y de las rutas previstas, y una persona DEBE poder corregirlo antes de implementar. | M | 2 |

### Reparto MoSCoW

| Prioridad | Esfuerzo | % | Límite recomendado |
|---|---:|---:|---|
| Must | 17 | 55 % | ≤ 60 % ✅ |
| Should | 11 | 35 % | ~20 % |
| Could | 3 | 10 % | ~20 % |
| **Total** | 31 | 100 % | |

Los *should* superan la referencia porque RF-04, RF-06 y RF-07 forman una sola pieza —la
resolución por tarea— que puede aplazarse entera sin dejar el sistema a medias: RF-01 a RF-03,
RF-05 y RF-09 ya entregan el ahorro estático, el nivel declarado por tarea y la corrección del
error de Cursor. Ese es precisamente el corte de contingencia que la prioridad debe permitir.

### Won't have this time

| Id | Qué se descarta | Por qué ahora no | ¿Volverá? |
|---|---|---|---|
| **RF-W01** | Medir coste real en euros o tokens por agente | Ningún host lo expone por subagente; sería una cifra inventada | Sí, si algún host publica consumo por agente |
| **RF-W02** | Fijar modelo en las superficies de Gemini y Antigravity | El host no admite el campo; escribirlo sería teatro | Sí, cuando lo soporten |
| **RF-W03** | Cambiar de nivel en caliente dentro de una misma tarea | Ningún host permite cambiar el modelo de un subagente ya iniciado | Improbable |
| **RF-W04** | Elegir el nivel por presupuesto restante del periodo | Requiere un dato de consumo que no existe (ver RF-W01) | Solo tras RF-W01 |

## 5. Requisitos no funcionales

| Categoría | Requisito | Valor objetivo |
|---|---|---|
| Rendimiento | La resolución del nivel no añade espera perceptible a una delegación | < 200 ms, sin red |
| Determinismo | Misma entrada, misma salida, en cualquier host y sin modelo de por medio | 100 % reproducible |
| Portabilidad | Funciona con Node y el repositorio, sin depender del IDE | los seis hosts declarados |
| Idempotencia | Derivar dos veces sobre un árbol limpio no produce cambios | segundo diff vacío |
| Seguridad | Rebajar el nivel nunca rebaja un gate, un control ni el ciclo TDD | verificado por gate |
| Observabilidad | El nivel solicitado queda en la traza, distinguible de lo observado | 100 % de las delegaciones registradas |
| Caducidad | La configuración declara cuándo deja de ser fiable | aviso automático al vencer |
| Coste | Reducir el nivel medio de ejecución sin tocar el nivel de las decisiones caras de revertir | ver §2 |

### 5.1 · Clasificación de seguridad

| Señal | Aplica | Requisito / caso afectado | Fuente o motivo |
|---|---|---|---|
| Autenticación o sesión | no | — | no toca credenciales ni sesión |
| Autorización, roles, IDOR o multi-tenant | no | — | no hay usuarios ni permisos de aplicación |
| PII, pagos, ficheros o administración | no | — | solo configuración versionada del propio circuito |
| Integración externa, webhook o **agente/LLM** | **sí** | RF-04, RF-05, RF-07 | **cambia con qué capacidad de razonamiento corren los auditores** |

**Por qué `sensible` pese a no tocar datos.** El riesgo material de esta spec es que una rebaja
de nivel degrade en silencio un control de seguridad: un `security-auditor` o un `code-reviewer`
ejecutados en el nivel más barato pueden emitir un `GO` con la misma forma y menos criterio, y el
informe seguiría pareciendo válido. Es la superficie de ataque descrita en OWASP para
aplicaciones agénticas: **degradación de la capacidad de supervisión**. RF-05 existe por eso.
La matriz de controles se completa en `plan.md`; aquí solo se declara el comportamiento exigido.

### 5.2 · Clasificación documental

| DOC-ID | Superficie afectada | Audiencia | Motivo o comportamiento que cambia |
|---|---|---|---|
| `DOC-HOSTS` | catálogo de agentes y matriz de compatibilidad | quien instala y quien mantiene | la columna de modelo pasa a nivel; se corrige el soporte real de cada host |
| `DOC-CIRCUITO` | modelo operativo | todos los agentes | política de niveles y su relación con `light`/`compact`/`full` |
| `DOC-GEN` | guía de automatización determinista | mantenedor | aparece el primer generador declarado |
| `DOC-TRACE` | trazabilidad | revisor | nuevo campo declarado en la traza de ejecución |

### 5.3 · Clasificación de usabilidad

| Señal | Aplica | Requisito / caso afectado | Fuente o motivo |
|---|---|---|---|
| Pantalla nueva o modificada | no | — | no hay interfaz |
| Formulario o entrada de datos | no | — | la entrada es un fichero versionado y argumentos de comando |
| Espera perceptible (> 300 ms) | no | — | RNF fija < 200 ms sin red |
| Texto de interfaz nuevo | no | — | los mensajes nuevos son salida de comando y de gate, no interfaz |

`sin-ui`, con motivo material: la spec cambia configuración versionada y la salida de un comando
determinista. No introduce ninguna superficie que una persona use como interfaz.

## 6. Criterios de aceptación

### CA-01 — Todo agente tiene nivel explícito *(cubre RF-01)*
```gherkin
Escenario: el catálogo declara el nivel de los veinte agentes
  Dado el catálogo de agentes del repositorio
  Cuando se consulta la configuración de niveles aprobada
  Entonces cada uno de los veinte agentes tiene exactamente un nivel asignado
  Y ningún nivel se expresa como un nombre comercial de modelo
```

### CA-02 — La derivación es única e idempotente *(cubre RF-02)*
```gherkin
Escenario: derivar dos veces no cambia nada
  Dado un árbol de trabajo limpio y una configuración aprobada
  Cuando se deriva el modelo a las superficies de host dos veces seguidas
  Entonces la primera ejecución deja las cuatro superficies coherentes con la configuración
  Y la segunda ejecución no produce ninguna diferencia
```

### CA-03 — La deriva manual falla el gate *(cubre RF-02)*
```gherkin
Escenario: alguien edita a mano el modelo de una superficie
  Dado un repositorio con las superficies ya derivadas
  Cuando se cambia a mano el modelo de un agente en una sola superficie
  Entonces el gate determinista falla
  Y el mensaje nombra el agente, la superficie y el valor esperado
```

### CA-04 — Vocabulario inválido se rechaza, no se escribe *(cubre RF-03)*
```gherkin
Escenario: un valor que el host no reconoce
  Dado un nivel cuyo valor no pertenece al vocabulario aceptado por una superficie
  Cuando se intenta derivar o validar esa superficie
  Entonces el sistema falla con un error que nombra el host y los valores admitidos
  Y no escribe el valor inválido
```

### CA-05 — Resolución determinista por tarea *(cubre RF-04)*
```gherkin
Escenario: el mismo caso resuelve siempre igual
  Dado una tarea con nivel base declarado, un agente, un nivel de circuito y un impacto de seguridad
  Cuando se solicita el nivel aplicable a esa tarea dos veces, en hosts distintos
  Entonces ambas respuestas son idénticas
  Y la respuesta incluye el nivel base de la tarea y cada elevación que se aplicó, con su motivo
```

### CA-10 — Un cambio trivial no paga el nivel máximo *(cubre RF-04, RF-09)*
```gherkin
Escenario: cambiar el color de un botón
  Dado una tarea cuyo único efecto es cambiar un valor de estilo de un componente existente
  Y que no toca contratos, arquitectura, migraciones ni seguridad
  Cuando se resuelve su nivel
  Entonces el nivel resuelto es el mínimo
  Y ninguna elevación se aplica
  Y el ciclo TDD, los gates y la evidencia exigidos son exactamente los mismos que para cualquier otra tarea
```

### CA-06 — Ningún control se rebaja *(cubre RF-05)*
```gherkin
Escenario: una tarea barata declarada sobre un agente que no se rebaja
  Dado un cambio clasificado como light
  Y una tarea que declara el nivel mínimo
  Y un impacto de seguridad sensible
  Cuando se resuelve el nivel para el auditor de seguridad
  Entonces el nivel resuelto es el máximo
  Y el motivo declara que la elevación es obligatoria y no rebajable
  Y el nivel declarado por la tarea no lo rebaja
```

### CA-11 — Toda tarea nace con nivel base *(cubre RF-09)*
```gherkin
Escenario: generación del backlog
  Dado una spec aprobada con su plan técnico
  Cuando se genera el backlog de tareas
  Entonces cada tarea declara exactamente un nivel base
  Y ese nivel viene propuesto de forma determinista, no elegido por un modelo
  Y una persona puede corregirlo antes de implementar
```

### CA-07 — Configuración sin aprobar o caducada *(cubre RF-06)*
```gherkin
Escenario: la configuración ha caducado
  Dado que la fecha de caducidad de la configuración de niveles ya pasó
  Cuando se ejecuta el gate determinista
  Entonces avisa de la caducidad e indica el comando exacto de revisión
  Y la resolución por tarea no se aplica
```

### CA-08 — El nivel se declara, nunca se observa *(cubre RF-07)*
```gherkin
Escenario: traza de una delegación
  Dado un agente al que se delega una tarea
  Cuando la delegación queda registrada en la traza de ejecución
  Entonces la traza incluye el nivel solicitado
  Y su verificación es "declarada"
  Y en ningún caso afirma qué modelo ejecutó el host
```

### CA-09 — Documentación coherente *(cubre RF-08)*
```gherkin
Escenario: el catálogo contradice la configuración
  Dado un catálogo de agentes cuya tabla de niveles no coincide con la configuración aprobada
  Cuando se ejecuta el gate documental
  Entonces falla e indica qué fila contradice a qué agente
```

### Matriz RF → CA

| OBJ | PRD-RF | UC | RF | CA |
|---|---|---|---|---|
| OBJ-003 | PRD-RF-006 | UC-001 | RF-01 | CA-01 |
| OBJ-004 | PRD-RF-008 | UC-005 | RF-01 | CA-01 |
| OBJ-003 | PRD-RF-006 | UC-001 | RF-02 | CA-02 |
| OBJ-003 | PRD-RF-006 | UC-001 | RF-02 | CA-03 |
| OBJ-003 | PRD-RF-006 | UC-001 | RF-03 | CA-04 |
| OBJ-004 | PRD-RF-007 | UC-005 | RF-04 | CA-05 |
| OBJ-004 | PRD-RF-008 | UC-005 | RF-04 | CA-05 |
| OBJ-002 | PRD-RF-004 | UC-004 | RF-05 | CA-06 |
| OBJ-004 | PRD-RF-007 | UC-005 | RF-06 | CA-07 |
| OBJ-002 | PRD-RF-004 | UC-004 | RF-07 | CA-08 |
| OBJ-003 | PRD-RF-006 | UC-001 | RF-08 | CA-09 |
| OBJ-004 | PRD-RF-008 | UC-005 | RF-04 | CA-10 |
| OBJ-002 | PRD-RF-003 | UC-002 | RF-09 | CA-10 |
| OBJ-002 | PRD-RF-003 | UC-002 | RF-09 | CA-11 |

## 7. Casos límite

| Situación | Comportamiento esperado |
|---|---|
| La configuración de niveles no existe | Se comporta como hoy: nadie fija nivel, ningún gate nuevo falla, se avisa una vez |
| Configuración presente pero sin aprobar | Los niveles pueden estar escritos; la resolución por tarea no se aplica (CA-07) |
| Un agente del catálogo no aparece en la configuración | Falla cerrado: no se supone un nivel por defecto |
| La configuración nombra un agente que ya no existe | Falla cerrado, igual que hace hoy el mapa de territorios |
| Un nivel no declara valor para un host | Se emite el valor portable de herencia; nunca se inventa un identificador |
| El host ignora el valor y usa otro modelo | No es detectable desde el repositorio: se declara como límite conocido y se comprueba con una verificación manual registrada |
| Dos superficies del mismo agente discrepan | Falla el gate y nombra ambas (CA-03) |
| Derivación interrumpida a medias | La siguiente ejecución la completa; el gate detecta el estado intermedio |
| La resolución se pide sin spec ni tarea | Devuelve el suelo del agente y declara que no hubo contexto de tarea |
| La tarea no declara nivel base | Falla cerrado en el gate: no se supone el nivel mínimo ni el máximo |
| La tarea declara un nivel por debajo de una elevación obligatoria | Gana la elevación; la respuesta lo dice, y el nivel declarado queda registrado como propuesta descartada |
| El identificador de modelo declarado ya no existe en el proveedor | La caducidad avisa; el valor portable de herencia sigue siendo válido |
| Circuito `light` sobre un agente no rebajable | Se mantiene el nivel del agente y se explica por qué (CA-06) |

## 8. Reglas de negocio

- **RN-01** — El nivel es una propiedad del **trabajo**, no del proveedor ni del agente. La
  configuración declara niveles por peso del trabajo; los identificadores de modelo son un
  detalle datado y sustituible.
- **RN-02** — **La tarea manda sobre el agente.** El nivel base lo declara la tarea; el agente
  aporta un **suelo** que solo se aplica a los perfiles no rebajables. Un mismo agente puede
  ejecutar una tarea en el nivel mínimo y la siguiente en el máximo.
- **RN-02 bis** — La resolución **solo eleva** sobre el nivel base de la tarea. Ninguna señal
  puede rebajarlo por debajo de lo que la tarea declaró, y ninguna elevación obligatoria puede
  desactivarse declarando un nivel bajo en la tarea.
- **RN-03** — Ningún agente auditor puede quedar por debajo de su nivel declarado, cualquiera que
  sea el nivel de circuito.
- **RN-04** — Ninguna elección de nivel dispensa un gate, un control de seguridad, el ciclo TDD,
  la bitácora ni la aprobación humana. El ahorro se toma del razonamiento, nunca del control.
- **RN-05** — El nivel registrado en la traza es **declarado**. Afirmar el modelo realmente
  ejecutado exige que el host lo reporte, y ninguno lo hace hoy.
- **RN-06** — Ningún modelo elige su propio nivel. La resolución es determinista y consultable;
  el agente coordinador la consulta y la cita, no la decide.
- **RN-07** — La configuración se aprueba por una persona antes de aplicarse, en un cambio
  dedicado, como el resto de fronteras del circuito.

## 9. Fuera de alcance

- Fijar modelo en las superficies de Gemini y Antigravity: el host no admite el campo (RF-W02).
- Medir, presupuestar o limitar el gasto real (RF-W01, RF-W04).
- Cambiar el catálogo de veinte agentes o el reparto de territorios.
- Cambiar la clasificación `light`/`compact`/`full`: esta spec la **consume**, no la modifica.
- Elegir qué modelo concreto es mejor para cada trabajo: la spec fija el mecanismo y quién
  decide; el contenido del mapa lo aprueba una persona y se revisa por caducidad.
- Cualquier cambio en el ciclo TDD, los gates o la auditoría de seguridad.

## 10. Riesgos y dependencias

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Un host ignora el valor y usa otro modelo sin avisar | **alta** (ya ocurre) | medio | Vocabulario validado por host (RF-03); verificación manual registrada; nunca se declara `observed` |
| Los identificadores de modelo quedan obsoletos | alta | bajo | Los niveles son el contrato; caducidad con aviso (RF-06); valor portable de herencia siempre disponible |
| Rebajar el nivel degrada un control en silencio | media | **alto** | RN-03, RN-04 y RF-05; auditoría de seguridad sobre la propia spec |
| Una quinta superficie que mantener a mano | media | medio | Derivación única y gate de deriva (RF-02); nada se edita a mano |
| La sintaxis admitida por un host rompe otro del mismo proveedor | media | medio | Se emite siempre la forma más restrictiva compatible con ambos (RF-03) |
| El mapa se aprueba una vez y nadie lo revisa | media | bajo | Caducidad explícita enganchada al procedimiento de revalidación existente |
| Una tarea declara un nivel demasiado bajo para el trabajo real | **alta** | medio | El nivel base se **propone** de forma determinista, no se inventa (RF-09); las elevaciones obligatorias no se pueden desactivar (RN-02 bis); si el nivel resultó corto, se sube y queda en la traza |
| Se confunde «tarea barata» con «tarea sin control» | media | **alto** | RN-04: el nivel toca el razonamiento, nunca el expediente. CA-10 exige explícitamente los mismos gates, TDD y evidencia |

**Dependencias**: la clasificación proporcional de `017` (fuente del nivel de circuito) y la
verificación independiente del host de `013` (fuente del contrato de traza).

## 11. Supuestos

> El gate humano debe validarlos.

- **SUP-01** — Se asume que fijar el nivel intermedio en los agentes que hoy heredan es aceptable
  para el trabajo de implementación, tests y especialistas de dominio. Si en la práctica degrada
  la calidad, se sube el nivel de ese agente: es un dato del mapa, no un cambio de diseño.
- **SUP-02** — Se asume que el mapa puede no fijar identificador de modelo y limitarse a herencia
  y esfuerzo de razonamiento. Es la opción que no caduca, y deja a Copilot en la nube coherente
  con Copilot en el IDE.
- **SUP-03** — Se asume que los cuatro auditores de solo lectura (`orchestrator`,
  `code-reviewer`, `security-auditor`, `research-analyst`), más `architect` y `spec-analyst`, son
  no rebajables. El gate humano debe confirmar esta lista.
- **SUP-04** — Se asume que la revisión del mapa se engancha al procedimiento de revalidación que
  ya usa la matriz de compatibilidad, en lugar de crear uno nuevo.
- **SUP-05** — Se asume que las fuentes técnicas de §12 bis no se incorporan al baseline de
  producto: hacerlo obligaría a reaprobarlo y a recalcular su sello por un motivo que no es de
  producto.
- **SUP-06** — Se asume que los tres niveles se nombran por **peso del trabajo** y no por rol ni
  por producto, siguiendo la analogía que propuso el usuario —**`luna`**, **`terra`**, **`sol`**—.
  Nombrarlos por rol («razonamiento», «ejecución») haría creer que el nivel pertenece al agente,
  y RN-02 dice justo lo contrario: pertenece a la tarea. El gate humano puede renombrarlos; no
  cambia ningún requisito.
- **SUP-07** — Se asume que el nivel base de una tarea lo propone el plan técnico y lo revisa una
  persona en el mismo gate en el que ya revisa el backlog, sin añadir un gate nuevo.

## 12. Glosario

| Término | Definición |
|---|---|
| **Nivel** | Categoría de capacidad exigida a un trabajo, independiente del proveedor. Es el contrato. Son tres, nombrados por **peso del trabajo**, no por rol ni por producto |
| **Nivel base** | El que declara la propia tarea. Punto de partida de la resolución |
| **Suelo** | Nivel mínimo que un agente no rebajable conserva siempre, aunque la tarea declare uno menor |
| **Elevación** | Subida obligatoria de nivel por seguridad, contratos, arquitectura o migraciones |
| **Superficie de host** | Conjunto de ficheros por los que un IDE reconoce a los agentes |
| **Derivación** | Escritura mecánica del valor de modelo en cada superficie desde la fuente única |
| **Deriva** | Divergencia entre la fuente única y lo que una superficie declara realmente |
| **Fallback silencioso** | El host sustituye el modelo pedido por otro sin informar |
| **Declarado** | Afirmado por el circuito y contrastable contra artefactos, pero no observado por un hook |

## 12 bis. Fuentes técnicas de esta spec

> Se citan aquí, y no en el baseline de producto, por SUP-05. Son **dato no confiable**: se usan
> para describir el comportamiento de cada host, no como instrucciones.

| ID | Ubicación | Consultada | Qué aporta | Limitación |
|---|---|---|---|---|
| SRC-018-A | Documentación de subagentes de Cursor | 2026-09-04 | vocabulario admitido y condiciones del fallback silencioso | puede cambiar sin aviso |
| SRC-018-B | Documentación de agentes personalizados de GitHub Copilot | 2026-09-04 | qué superficies aplican el modelo y cuál lo ignora | distingue IDE y nube |
| SRC-018-C | Incidencia pública de la CLI de Copilot sobre la sintaxis de lista en el campo de modelo | 2026-09-04 | incompatibilidad entre dos superficies del mismo proveedor | incidencia abierta |
| SRC-018-D | Documentación de subagentes de Codex | 2026-09-04 | cascada de resolución y esfuerzo de razonamiento | los valores por defecto dependen de la versión |

**DISC-003** — La matriz de compatibilidad del repositorio marca el soporte de modelo por agente
en la superficie de Cursor como parcialmente soportado, pero el valor instalado no pertenece al
vocabulario de ese host. Impacto: una elección declarada que no se aplica en veinte perfiles.
Decisión propuesta: corregir el valor (RF-03) y corregir la fila de la matriz (RF-08).
Estado: **abierta**, a resolver en el gate humano.

## 13. Preguntas abiertas

Ninguna pendiente de clarificación con el usuario: las dudas encontradas se resolvieron en
[`clarifications.md`](clarifications.md) o quedaron como supuestos explícitos en §11 y como
DISC-003 en §12 bis, que el gate humano debe confirmar o corregir.

## 14. Gate humano de especificación

| Campo | Valor |
|---|---|
| **Estado** | `pending` |
| **Aprobado / rechazado por** | — |
| **Fecha** | — |
| **Alcance de la decisión** | RF-01 a RF-09, CA-01 a CA-11, SUP-01 a SUP-07 y DISC-003 |
| **Condiciones** | — |

**Lo que este gate decide y nadie más puede decidir:**

1. Si el mapa fija identificadores de modelo concretos o se limita a herencia y esfuerzo (SUP-02).
2. La lista de agentes no rebajables (SUP-03).
3. Los nombres de los tres niveles: `luna`, `terra`, `sol` (SUP-06).
4. Si se acepta la clasificación `sensible` de §5.1 y, con ella, la matriz de controles en el plan.
5. La resolución de DISC-003.

> `/sdd-plan` no comienza mientras este gate no esté en `approved`.
