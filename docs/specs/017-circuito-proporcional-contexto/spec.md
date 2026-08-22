# 017 · Circuito proporcional al riesgo y presupuesto de contexto

| Campo | Valor |
|---|---|
| **ID** | `017-circuito-proporcional-contexto` |
| **Estado** | aprobada |
| **Autor** | usuario + `implementer` (`declared-direct`) |
| **Fecha** | 2026-08-22 |
| **Rama** | `claude/token-consumption-sdd-tdd-tbfcei` |
| **Depende de** | `011-automatizacion-determinista-tokens`, `015-circuito-ligero-verificable` |
| **Baseline de producto** | [`docs/product/PRD.md`](../../product/PRD.md) · estado `approved` |
| **Fuentes** | [`docs/product/SOURCES.md`](../../product/SOURCES.md) · `SRC-001`, `SRC-003` |
| **Impacto de seguridad** | `sensible` |
| **Impacto de usabilidad** | `sin-ui · amplía un CLI, semillas y skills; no crea pantalla, formulario, microcopy interactiva ni espera perceptible` |
| **Impacto de documentación** | `aplicable · DOC-CIRCUITO, DOC-CONTEXTO` |

> Capacidad interna de la plantilla: no crea requisitos de producto ni decisiones de dominio.

> ⚠️ Esta spec describe **QUÉ** y **POR QUÉ**. El cómo va en `plan.md`.

---

## 0. Origen y trazabilidad de producto

| Objetivo | Requisito de producto | Caso de uso | Requisito | Criterio | Fuente |
|---|---|---|---|---|---|
| OBJ-004 | PRD-RF-008 | UC-005 | RF-01 | CA-01 | SRC-001 |
| OBJ-004 | PRD-RF-008 | UC-005 | RF-02 | CA-02 | SRC-001 |
| OBJ-004 | PRD-RF-008 | UC-005 | RF-03 | CA-01 | SRC-001 |
| OBJ-004 | PRD-RF-008 | UC-005 | RF-04 | CA-03 | SRC-001 |
| OBJ-004 | PRD-RF-007 | UC-005 | RF-05 | CA-04 | SRC-001 |
| OBJ-004 | PRD-RF-007 | UC-005 | RF-06 | CA-04 | SRC-001 |
| OBJ-002 | PRD-RF-003 | UC-002 | RF-07 | CA-05 | SRC-003 |
| OBJ-002 | PRD-RF-003 | UC-002 | RF-08 | CA-06 | SRC-003 |
| OBJ-002 | PRD-RF-004 | UC-004 | RF-09 | CA-07 | SRC-003 |
| OBJ-001 | PRD-RF-001 | UC-003 | RF-10 | CA-08 | SRC-001 |
| OBJ-001 | PRD-RF-001 | UC-003 | RF-11 | CA-09 | SRC-001 |
| OBJ-001 | PRD-RF-001 | UC-003 | RF-12 | CA-10 | SRC-001 |
| OBJ-002 | PRD-RF-003 | UC-002 | RF-13 | CA-11 | SRC-003 |

`PRD-RF-008` —*"el conocimiento de proceso debe cargarse bajo demanda, no inyectarse entero en cada
conversación"*— está declarado como `Should` desde el baseline y nunca se materializó. Esta spec lo
materializa.

**Discrepancias que afectan a esta spec**: ninguna.

## 1. Problema

El circuito cobra un peaje de tamaño fijo, independiente del riesgo del cambio. Instalado en un
proyecto real, agotó la cuota de un proveedor en la fase SDD y la de otro en la fase TDD para una
modificación menor de interfaz: cambiar la selección de un carrusel y plegar y desplegar unas
secciones.

Duele a quien instala la plantilla, en **cada** cambio pequeño, que es la mayoría de los cambios. El
coste de no arreglarlo no es solo económico: un peaje desproporcionado enseña a rodear el circuito, y
un circuito que se rodea no protege nada.

Cuatro causas medidas, no supuestas:

1. **El atajo existe y nace desactivado.** La semilla de la frontera se instala con la lista de
   permitidos vacía, y sin permitidos ninguna ruta clasifica como ligera. El circuito ligero está
   documentado y es inalcanzable el día uno.
2. **Solo se puede clasificar lo ya editado.** La consulta de circuito parte de los cambios
   registrados, así que el peaje no se puede conocer antes de pagarlo.
3. **No existe un nivel intermedio.** El circuito ligero dispensa el expediente entero: correcto para
   una errata, inaceptable para un componente. Un cambio de comportamiento acotado paga el
   expediente completo.
4. **La política se lee entera en cada fase.** El modelo operativo son 42 KB y las instrucciones de
   los hosts piden el documento completo para cualquier fase o decisión. Ocho fases con agente frío
   releen la misma política ocho veces.

A esto se suma un defecto vivo: la comparación de rutas de la frontera no pliega la caja. Cambiar
la caja de una ruta por sí solo cae del lado seguro —no casa con el permiso y el resultado es
circuito completo—, pero hay una combinación que sí abre la puerta: cuando el permiso se declara
con la caja real del disco (`Src/`, lo natural si la carpeta se llama así en Windows) y la
prohibición viene en minúsculas desde la semilla (`src/domain/`), el permiso casa, la negación no
alcanza, y un fichero de dominio se clasifica como ligero. En sistemas de ficheros que no
distinguen mayúsculas —Windows y macOS por defecto— ambas rutas son el mismo fichero, así que la
ortografía de quien escribió la frontera se convierte en un permiso.

## 2. Objetivo y métrica de éxito

**Objetivo**: que el papeleo, la relectura y el número de intervenciones sean proporcionales al riesgo
del cambio, sin dispensar ninguna verificación.

**Métrica**: sobre el proxy auditable de contexto realmente activado e intervenciones por cambio,
medido con el harness de la spec 011 regenerado:

- un cambio acotado de interfaz reduce la mediana **≥70 %** y se resuelve en **≤3 intervenciones**;
- un cambio de dominio por circuito completo reduce la mediana **≥20 %**, el umbral que la spec 011
  ya estableció y midió;
- la clasificación y las expectativas funcionales se conservan al **100 %**.

Si un umbral no se alcanza, la candidata se descarta y se registra como experimento, conforme a
`RF-08` de la spec 011. El proxy no se presenta como consumo real de ningún proveedor.

## 3. Usuarios y contexto de uso

| Perfil | Escenario | Frecuencia |
|---|---|---|
| Persona que instala la plantilla en su proyecto | Cambia el comportamiento de un componente existente y quiere que el peaje corresponda al riesgo | varias veces por semana |
| Agente del circuito | Necesita la política de su fase, no el tratado completo | en cada fase de cada spec |
| Persona que audita después | Quiere saber si un atajo declarado era cierto | en cada revisión y en cada release |

## 4. Requisitos funcionales (EARS) con prioridad MoSCoW

| Id | Requisito | Prioridad | Esfuerzo |
|---|---|---|---:|
| RF-01 | CUANDO se solicite el contexto de una fase, el sistema DEBE devolver únicamente las secciones del modelo operativo aplicables a esa fase. | M | 5 |
| RF-02 | SI una sección declarada en el mapa de fases falta, aparece duplicada o ha sido renombrada, ENTONCES el sistema DEBE fallar con error explícito y no devolver un recorte parcial. | M | 3 |
| RF-03 | El sistema DEBE incluir siempre las secciones invariantes, y añadir la trazabilidad detallada de seguridad solo cuando la spec sea sensible. | M | 3 |
| RF-04 | Las instrucciones de todas las superficies de host DEBEN pedir la sección aplicable a la fase y no el documento completo. | M | 3 |
| RF-05 | CUANDO se ejecuten los gates, el sistema DEBE emitir un resumen con comando, código de salida, conteos, fallo relevante, huella de la salida e identificador de ejecución. | M | 3 |
| RF-06 | MIENTRAS los gates pasen, la salida completa DEBE conservarse fuera del contexto y seguir siendo recuperable por su identificador. | M | 2 |
| RF-07 | El sistema DEBE clasificar todo cambio en `light`, `compact` o `full`, siendo `full` el valor por defecto ante cualquier duda. | M | 8 |
| RF-08 | CUANDO se consulte la clasificación aportando las rutas previstas, el sistema DEBE responder sin que exista todavía ninguna modificación en el árbol. | M | 3 |
| RF-09 | El sistema DEBE clasificar como `compact` o superior todo fichero ejecutable, con independencia de lo que declare la frontera. | M | 3 |
| RF-10 | SI una entrada de frontera usa comodines, ruta absoluta, traversal, o difiere únicamente en el uso de mayúsculas respecto de una ruta prohibida, ENTONCES el sistema DEBE rechazarla y no conceder el atajo. | M | 5 |
| RF-11 | La frontera DEBE instalarse sin aprobar y no conceder ningún atajo mientras una persona no la apruebe explícitamente. | M | 3 |
| RF-12 | MIENTRAS exista la frontera antigua y no exista la nueva, el sistema DEBE seguir habilitando solo el circuito ligero heredado y no reescribir el fichero antiguo. | S | 2 |
| RF-13 | CUANDO un cambio se clasifique `compact`, el sistema DEBE permitir sustituir los cinco documentos de la spec por un único documento con límites declarados y verificables. | M | 5 |

### Reparto MoSCoW

- **Must**: RF-01 a RF-11, RF-13.
- **Should**: RF-12.
- **Could**: ninguno.
- **Won't (esta spec)**: sellado por hash del documento compacto, auditoría obligatoria en CI y
  frontera histórica del commit padre. Van en la spec siguiente, con su propio expediente.

## 5. Requisitos no funcionales

- **Rendimiento**: la clasificación y el recorte de contexto son operaciones locales sin red; deben
  resolverse por debajo de un segundo en un repositorio con miles de ficheros.
- **Disponibilidad y escala**: no aplica; no hay servicio.
- **Seguridad y privacidad**: ver 5.1. No se leen secretos ni configuración local.
- **Accesibilidad**: no aplica; sin interfaz.
- **Observabilidad**: cada resumen de gates lleva identificador de ejecución recuperable.
- **Coste**: es el objeto de la spec; se mide con el harness declarado en §2.
- **Retención de datos**: los registros append-only conservan su política actual.

### 5.1 · Clasificación de seguridad

**Impacto de seguridad**: `sensible`. La spec modifica la decisión que permite prescindir del
circuito completo. Un error aquí no produce papeleo sobrante: produce cambios sin expediente.

| Control | Qué exige |
|---|---|
| SEC-CIRCUIT-001 | La frontera se declara con rutas exactas y prefijos, sin comodines. La negación prevalece sobre el permiso. Ninguna raíz ejecutable puede concederse. La comparación de rutas resiste traversal, separador de Windows, ruta absoluta y diferencia de caja. |
| SEC-CIRCUIT-002 | La frontera se instala sin aprobar. Aprobarla es un acto humano separado, ligado a la propuesta concreta que se mostró. Un agente presenta el comando y se detiene; no lo ejecuta. La identidad declarada no es firma criptográfica y se documenta como tal. |
| SEC-CONTEXT-001 | Las secciones invariantes de regla cero, gates y prohibiciones no pueden desaparecer de ningún recorte. Ante una estructura inesperada el recorte falla cerrado, nunca devuelve vacío en silencio. |

Ningún control se declara superado sin ejecución registrada. «No ejecutado» conserva riesgo, dueño y
siguiente paso.

### 5.2 · Clasificación documental

**Impacto de documentación**: `aplicable`.

| DOC-ID | Superficie |
|---|---|
| DOC-CIRCUITO | Modelo operativo §2.6, reglas duras del router y skill del circuito compacto |
| DOC-CONTEXTO | Mapa de lectura por fase e instrucciones de las siete superficies de host |

### 5.3 · Clasificación de usabilidad

**Impacto de usabilidad**: `sin-ui`. Motivo material: la spec amplía un CLI y ficheros de
configuración. No introduce pantalla, formulario, texto que lea una persona en una interfaz ni
espera perceptible por encima de 300 ms. Se verificará que no aparezca una superficie interactiva
accidental.

## 6. Criterios de aceptación

### CA-01 — El contexto de una fase trae lo suyo y nada más *(cubre RF-01, RF-03)*
Solicitado el contexto de una fase, la salida contiene las secciones declaradas para esa fase y las
invariantes, y no contiene las de otras fases. Una spec no sensible no arrastra la trazabilidad
detallada de seguridad.

### CA-02 — Una estructura inesperada falla, no adivina *(cubre RF-02)*
Con una sección ausente, duplicada o renombrada, la operación termina en error nombrando la sección
y sin emitir recorte.

### CA-03 — Ninguna superficie pide ya el tratado completo *(cubre RF-04)*
Las siete superficies de host, incluido el bloque gestionado que se instala en destino, piden la
sección de la fase.

### CA-04 — Los gates informan sin volcarse *(cubre RF-05, RF-06)*
Con los gates en verde, el resumen identifica comando, código de salida, conteos y ejecución, y la
salida completa sigue recuperable. Con un gate en rojo, el fallo relevante aparece en el resumen.

### CA-05 — Tres niveles, y la duda cae del lado caro *(cubre RF-07)*
Una corrección documental exacta clasifica `light`; un cambio de comportamiento en un componente
existente clasifica `compact`; arquitectura, contrato, datos, autorización, dependencias,
infraestructura o el propio circuito clasifican `full`. Una ruta desconocida clasifica `full`.

### CA-06 — Se puede preguntar antes de tocar *(cubre RF-08)*
Con el árbol limpio y las rutas previstas aportadas, la clasificación responde igual que respondería
después de editarlas.

### CA-07 — El código ejecutable nunca es ligero *(cubre RF-09)*
Un fichero ejecutable declarado en la lista de permitidos sigue clasificando `compact` como mínimo.

### CA-08 — La frontera no se esquiva escribiéndola distinto *(cubre RF-10)*
Comodín, ruta absoluta, traversal y variación de caja sobre una ruta prohibida quedan rechazados.
Con la ruta prohibida declarada en minúsculas, la misma ruta escrita con mayúsculas sigue prohibida.

### CA-09 — Sin aprobación no hay atajo *(cubre RF-11)*
Recién instalada, la frontera no concede ningún atajo y el mensaje nombra el comando de aprobación.
Una propuesta alterada después de mostrarse no puede aprobarse.

### CA-10 — La instalación antigua sigue funcionando *(cubre RF-12)*
Un proyecto con la frontera heredada conserva su circuito ligero, recibe aviso de migración y su
fichero no se reescribe.

### CA-11 — El documento compacto tiene límites verificables *(cubre RF-13)*
Un cambio compacto se documenta en un solo documento; superar sus límites declarados obliga al
circuito completo.

### Matriz RF → CA

| RF | CA |
|---|---|
| RF-01 | CA-01 |
| RF-02 | CA-02 |
| RF-03 | CA-01 |
| RF-04 | CA-03 |
| RF-05 | CA-04 |
| RF-06 | CA-04 |
| RF-07 | CA-05 |
| RF-08 | CA-06 |
| RF-09 | CA-07 |
| RF-10 | CA-08 |
| RF-11 | CA-09 |
| RF-12 | CA-10 |
| RF-13 | CA-11 |

## 7. Casos límite

- Árbol sin cambios y sin rutas previstas: no hay nada que clasificar y decirlo no es un reproche.
- Ruta que aparece a la vez en permitidos y prohibidos: gana la prohibición.
- Repositorio sin frontera de ninguna clase: no hay atajo, y el motivo se nombra.
- Fase solicitada que no existe en el mapa: error, no recorte vacío.
- Cambio que empieza acotado y crece durante la implementación: escala al circuito completo y nunca
  degrada solo.
- Fichero sin extensión conocida: se trata como desconocido, luego circuito completo.

## 8. Reglas de negocio

- El circuito ligero y el compacto dispensan expediente, **nunca** verificación: gates, ciclo TDD
  cuando cambia comportamiento, bitácora y trailers siguen siendo obligatorios.
- La clasificación la decide la herramienta sobre rutas, no la redacción de la petición.
- Ninguna declaración de quien pide el cambio puede rebajar el nivel; solo elevarlo.

## 9. Fuera de alcance

- Sellado por hash del documento compacto, auditoría obligatoria en CI y frontera del commit padre:
  spec siguiente.
- Modificar el proyecto donde se detectó el problema. Esta spec cambia la plantilla; ese proyecto
  hereda la mejora al reinstalar y tendrá que aprobar su propia frontera.
- Medir el consumo real de ningún proveedor: no está expuesto por sus API.
- Añadir agentes nuevos o romper la paridad entre hosts.

## 10. Riesgos y dependencias

| Riesgo | Mitigación |
|---|---|
| Una frontera demasiado permisiva convierte el atajo en la norma | La cuota declarada avisa, y superar el umbral señala que la frontera está mal trazada |
| El recorte de contexto oculta una regla que sí hacía falta | Las secciones invariantes no se recortan nunca y el harness mide calidad funcional, no solo tamaño |
| El nivel compacto se usa para trocear una feature grande | Los cambios del mismo pedido se acumulan y, superados los límites, exigen circuito completo |

## 11. Supuestos

- El proxy de bytes e intervenciones representa razonablemente el consumo, pero no es el consumo.
- La aprobación humana se identifica por lo declarado, sin demostración criptográfica.

## 12. Glosario

- **Frontera**: declaración por rutas de qué cambios admiten qué nivel de circuito.
- **Nivel**: `light`, `compact` o `full`; determina cuánto expediente se exige, nunca cuánta
  verificación.
- **Invariante**: sección del modelo operativo que ningún recorte puede omitir.

## 13. Preguntas abiertas

Ninguna. Las tres que existían —dónde vive la frontera, quién la aprueba y qué umbral se exige— se
resolvieron antes de redactar esta spec y constan en `clarifications.md`.

## 14. Gate humano de especificación

- [x] Aprobada por: Jorge Enrique Chamorro Rodriguez · fecha: 2026-08-22

Aprobación registrada en la conversación de planificación: se aprobó la spec completa,
incluido RF-13, y se decidió posponer `approve-docs` a la entrega para no aprobar dos
veces el mismo contrato documental.
