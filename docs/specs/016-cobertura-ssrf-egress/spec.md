# 016 · Cobertura portable de SSRF y peticiones salientes

| Campo | Valor |
|---|---|
| **ID** | `016-cobertura-ssrf-egress` |
| **Estado** | aprobada |
| **Autor** | spec-analyst |
| **Fecha** | 2026-08-21 |
| **Rama** | `feature/016-cobertura-ssrf-egress` |
| **Depende de** | `007-seguridad-jwt-owasp-2025` |
| **Baseline de producto** | [`docs/product/PRD.md`](../../product/PRD.md) · estado `approved` |
| **Fuentes** | [`docs/product/SOURCES.md`](../../product/SOURCES.md) · `SRC-001`, `SRC-002`, `SRC-003`; auditoría de 26 documentos formativos de seguridad aportados por el usuario |
| **Impacto de seguridad** | `sensible` |
| **Impacto de usabilidad** | `sin-ui · cambia el contrato de auditoría versionado, sin crear ni modificar pantallas, formularios, textos de interfaz o esperas perceptibles` |
| **Impacto de documentación** | `aplicable · DOC-SKILLS` |

> ⚠️ Esta spec describe **QUÉ** y **POR QUÉ**. Las decisiones sobre mecanismos, formatos y
> ubicación de los controles pertenecen al plan posterior.

---

## 0. Origen y trazabilidad de producto

La auditoría documental identificó una deriva: el perfil especializado ya contempla peticiones
salientes, pero el contrato portable no exige con el mismo detalle revisar destino, protocolo,
resolución, redirecciones, destinos internos, límites y evidencia. El corte más próximo es
`FEAT-003`, con apoyo de `FEAT-002` para la evidencia y los gates.

| Objetivo | Requisito de producto | Caso de uso | Requisito de esta spec | Fuente |
|---|---|---|---|---|
| OBJ-001 | PRD-RF-001 | UC-003 | RF-01, RF-02, RF-03, RF-04, RF-05, RF-12 | SRC-001, SRC-002 |
| OBJ-002 | PRD-RF-004 | UC-004 | RF-06, RF-07, RF-08, RF-10, RF-11 | SRC-001, SRC-003 |
| OBJ-003 | PRD-RF-006 | UC-001 | RF-09 | SRC-001, SRC-002 |

**Discrepancias que afectan a esta spec**:

- **DISC-016-01 · resuelta** — `FEATURE-MAP.md` no nombra la auditoría de peticiones salientes
  como corte independiente. El usuario aprobó tratarla como endurecimiento de `FEAT-003`, con
  apoyo de `FEAT-002` para evidencia y gates, sin modificar el baseline.

## 1. Problema

Quien audita un proyecto instalado puede recibir una guía general de seguridad que no haga
explícitos todos los riesgos de una petición saliente. Esa diferencia entre el perfil especializado
y el contrato portable se presenta cada vez que se revisa una funcionalidad capaz de contactar con
un destino externo. Si no se corrige, una revisión puede declarar cobertura suficiente sin haber
comprobado redirecciones, resoluciones cambiantes, destinos internos o límites, produciendo un falso
negativo difícil de detectar y de atribuir después.

## 2. Objetivo y métrica de éxito

**Objetivo**: hacer que toda revisión aplicable de peticiones salientes conserve un contrato
portable, verificable y homogéneo para decidir qué destinos se permiten y demostrar qué se evaluó.

**Cómo sabremos que funcionó**:

- El 100 % de los escenarios aplicables de una auditoría identifica el destino y el protocolo
  evaluados.
- El 100 % de las resoluciones y redirecciones aplicables conserva una decisión verificable sobre
  el destino efectivo.
- El 100 % de los controles aplicables termina con evidencia o con un estado explícito de control
  no ejecutado; ningún caso ausente se presenta como superado.
- Los seis entornos soportados presentan el mismo alcance funcional sin aumentar el catálogo de 20
  agentes y 27 skills.

## 3. Usuarios y contexto de uso

| Perfil | Qué necesita | Frecuencia | Contexto |
|---|---|---|---|
| Quien audita seguridad | Saber qué condiciones de salida debe evaluar y qué evidencia debe devolver | En cada planificación, verificación o release sensible con peticiones salientes | Revisión de un proyecto instalado, con o sin acceso al sistema externo |
| Quien desarrolla con un agente | Recibir hallazgos accionables sin falsos verdes ni controles implícitos | Cada vez que añade o cambia una capacidad que contacta con otro destino | Preparación de una spec, plan, implementación o verificación |
| Quien revisa la entrega | Reconstruir qué se evaluó, qué no se ejecutó y por qué | Antes de aceptar una entrega sensible | Gate de calidad y seguridad del repositorio |
| Quien mantiene la plantilla | Evitar deriva entre entornos sin multiplicar capacidades equivalentes | En cada actualización o instalación | Distribución portable del circuito |

## 4. Requisitos funcionales (EARS) con prioridad MoSCoW

| Id | Requisito | Prioridad | Esfuerzo |
|---|---|---:|---:|
| **RF-01** | CUANDO una revisión abarque una petición saliente, el sistema DEBE exigir una decisión explícita sobre si el destino solicitado está permitido. | M | 1 |
| **RF-02** | CUANDO una revisión abarque una petición saliente, el sistema DEBE exigir una decisión explícita sobre si el protocolo solicitado está permitido. | M | 1 |
| **RF-03** | CUANDO un nombre de destino se resuelva, el sistema DEBE exigir que el destino efectivo sea evaluado antes de considerar segura la petición. | M | 2 |
| **RF-04** | CUANDO una redirección cambie el destino efectivo, el sistema DEBE exigir una nueva evaluación antes de considerar seguro el siguiente salto. | M | 2 |
| **RF-05** | SI el destino efectivo pertenece a metadatos de infraestructura, ENTONCES el sistema DEBE exigir su rechazo sin excepción. | M | 2 |
| **RF-06** | CUANDO un control de petición saliente sea aplicable, el sistema DEBE exigir evidencia verificable de su resultado. | M | 2 |
| **RF-07** | CUANDO una revisión abarque una petición saliente, el sistema DEBERÍA exigir un límite material para el tiempo de espera. | S | 2 |
| **RF-08** | CUANDO una revisión abarque una petición saliente, el sistema DEBERÍA exigir un límite material para la cantidad de datos aceptada. | S | 2 |
| **RF-09** | MIENTRAS un entorno esté soportado por el producto, el sistema DEBE presentar el mismo contrato funcional de auditoría de peticiones salientes. | M | 2 |
| **RF-10** | CUANDO concluya una auditoría, el sistema PODRÍA resumir los escenarios de salida por resultado verificable. | C | 3 |
| **RF-11** | CUANDO varios escenarios produzcan el mismo hallazgo, el sistema PODRÍA agruparlos sin perder la referencia individual a cada escenario afectado. | C | 3 |
| **RF-12** | SI el destino efectivo pertenece a un ámbito local, privado o link-local distinto de metadatos de infraestructura, ENTONCES el sistema DEBE exigir su rechazo o una excepción documentada con responsable, alcance y evidencia. | M | 2 |

**Aplicabilidad confirmada**: el contrato se aplica a toda petición saliente. Un control concreto
solo puede declararse `no aplica` con una justificación material propia.

### Reparto MoSCoW

| Prioridad | Esfuerzo | % | Límite recomendado |
|---|---:|---:|---|
| Must | 14 | 58,3 % | ≤ 60 % |
| Should | 4 | 16,7 % | ~20 % |
| Could | 6 | 25,0 % | ~20 % — contingencia deliberada |
| **Total** | **24** | **100 %** | |

**Won't have this time**:

| Id | Qué se descarta | Por qué ahora no | ¿Volverá? |
|---|---|---|---|
| **RF-W01** | Asignar automáticamente una técnica de mitigación a cada proyecto | La elección depende del riesgo y contexto de cada producto | Podrá evaluarse en una spec de automatización posterior |
| **RF-W02** | Mapear todos los hallazgos a MITRE ATT&CK | Es complementario y no cambia la cobertura mínima SSRF/egress | Podrá evaluarse para proyectos con alcance de infraestructura o incidentes |

## 5. Requisitos no funcionales

| Categoría | Requisito | Valor objetivo |
|---|---|---|
| Rendimiento | Evaluar un conjunto declarado de controles sin introducir una espera perceptible en el flujo de auditoría | p95 < 1 s para 100 escenarios ya disponibles para revisión |
| Disponibilidad | El contrato de revisión no debe depender de que el destino externo esté disponible | 100 % de los controles pueden registrar resultado o `no ejecutado` aun con el destino caído |
| Escala | La revisión debe conservar trazabilidad individual en auditorías amplias | Al menos 100 escenarios de salida y 10 saltos por escenario |
| Seguridad y privacidad | La evidencia no debe revelar secretos, credenciales ni datos personales innecesarios | 0 secretos o credenciales reproducidos; ASVS 5.0.0 L2 como objetivo base |
| Accesibilidad | No hay interfaz nueva o modificada | `sin-ui`; no se activa gate de usabilidad para esta spec |
| Internacionalización | El vocabulario portable debe conservar significado inequívoco en los entornos soportados | 100 % de los términos normativos mantienen su severidad y sentido |
| Observabilidad | Cada control aplicable debe dejar estado y referencia verificables | 100 % con `superado`, `fallido` o `no ejecutado`, sin estado implícito |
| Coste | La cobertura mínima no debe exigir un servicio de pago | 0 servicios de pago obligatorios |
| Retención de datos | La plantilla no impondrá retención de tráfico ni cuerpos de respuesta | 0 cuerpos o credenciales retenidos por el contrato; la evidencia sigue la política del proyecto |

### 5.1 · Clasificación de seguridad

| Señal | Aplica | Requisito / caso afectado | Fuente o motivo |
|---|---|---|---|
| Autenticación o sesión | no | — | La spec no cambia autenticación ni sesión |
| Autorización, roles, IDOR o multi-tenant | no | — | La spec no cambia permisos de usuario |
| PII, pagos, ficheros o administración | no | — | La evidencia debe evitar PII y secretos, pero no procesa estas capacidades |
| Integración externa, webhook o agente/LLM | sí | RF-01 a RF-12; CA-01 a CA-12 | El comportamiento auditado son peticiones salientes y el contrato lo consume un agente |

La clasificación es **sensible**. RF-01 a RF-09 y RF-12 definen las señales mínimas que después deberán
trazarse a controles, tareas, pruebas y evidencia. La revisión posterior no podrá declarar `GO`
con un control aplicable no ejecutado.

### 5.2 · Clasificación documental

| DOC-ID / estado | Superficie afectada | Audiencia | Motivo o comportamiento que cambia |
|---|---|---|---|
| `DOC-SKILLS` | developer-readme | Personas y agentes que ejecutan auditorías | Cambia el contrato portable que explica qué debe comprobar una auditoría de peticiones salientes |

### 5.3 · Clasificación de usabilidad

| Señal | Aplica | Requisito / caso afectado | Fuente o motivo |
|---|---|---|---|
| Pantalla nueva o modificada | no | — | No se crea ni modifica una pantalla |
| Formulario o entrada de datos | no | — | No se crea ni modifica un formulario |
| Espera perceptible (> 300 ms) | no | — | No se cambia un flujo interactivo |
| Texto de interfaz nuevo | no | — | El texto afectado es documentación del circuito, no microcopy de una interfaz |

El impacto es **sin-ui** por el motivo material indicado en metadatos. No requiere `/sdd-design`.

## 6. Criterios de aceptación

### CA-01 — Decisión sobre el destino *(cubre RF-01)*
```gherkin
Escenario: La revisión identifica si el destino está permitido
  Dado un escenario aplicable de petición saliente
  Cuando se revisa el destino solicitado
  Entonces la evidencia indica explícitamente si está permitido
```

### CA-02 — Decisión sobre el protocolo *(cubre RF-02)*
```gherkin
Escenario: La revisión identifica si el protocolo está permitido
  Dado un escenario aplicable de petición saliente
  Cuando se revisa el protocolo solicitado
  Entonces la evidencia indica explícitamente si está permitido
```

### CA-03 — Destino efectivo tras resolución *(cubre RF-03)*
```gherkin
Escenario: La resolución cambia el destino evaluado
  Dado un nombre cuyo destino efectivo difiere del destino aparente
  Cuando se registra el resultado de la resolución
  Entonces la revisión evalúa el destino efectivo antes de considerar seguro el escenario
```

### CA-04 — Revalidación de redirecciones *(cubre RF-04)*
```gherkin
Escenario: Cada redirección vuelve a someter el destino a revisión
  Dado un escenario con una redirección a un destino diferente
  Cuando se evalúa el siguiente salto
  Entonces existe una nueva decisión sobre el destino efectivo antes de considerarlo seguro
```

### CA-05 — Destinos internos o de infraestructura *(cubre RF-05)*
```gherkin
Escenario: Los metadatos de infraestructura se rechazan siempre
  Dado un destino efectivo de metadatos de infraestructura
  Cuando se revisa el escenario
  Entonces el resultado es rechazo sin excepción
```

### CA-06 — Evidencia verificable *(cubre RF-06)*
```gherkin
Escenario: Ningún control aplicable queda como verde implícito
  Dado un control aplicable de petición saliente
  Cuando concluye la auditoría
  Entonces el control conserva decisión, resultado y referencia a la evidencia ejercida
```

### CA-07 — Límite de espera *(cubre RF-07)*
```gherkin
Escenario: La espera saliente tiene un límite material
  Dado un escenario aplicable cuyo destino no responde
  Cuando se revisa su comportamiento esperado
  Entonces se identifica un límite de espera o un hallazgo por ausencia de límite
```

### CA-08 — Límite de datos *(cubre RF-08)*
```gherkin
Escenario: La respuesta saliente tiene un límite material
  Dado un escenario aplicable cuyo destino entrega una cantidad extrema de datos
  Cuando se revisa su comportamiento esperado
  Entonces se identifica un límite aceptable o un hallazgo por ausencia de límite
```

### CA-09 — Paridad portable *(cubre RF-09)*
```gherkin
Escenario: Los entornos soportados conservan el mismo contrato
  Dado el catálogo vigente de entornos soportados
  Cuando se consulta el alcance de una auditoría de peticiones salientes en cada entorno
  Entonces todos exigen los comportamientos must de RF-01 a RF-06, RF-09 y RF-12
```

### CA-10 — Resumen por resultado *(cubre RF-10)*
```gherkin
Escenario: La auditoría resume su cobertura
  Dado varios escenarios de petición saliente con resultados distintos
  Cuando concluye la auditoría
  Entonces el resumen distingue cuántos fueron superados, fallidos y no ejecutados
```

### CA-11 — Agrupación sin pérdida de traza *(cubre RF-11)*
```gherkin
Escenario: Hallazgos equivalentes conservan sus escenarios
  Dado varios escenarios que producen el mismo hallazgo
  Cuando la auditoría los agrupa
  Entonces cada escenario afectado sigue siendo identificable desde el hallazgo
```

### CA-12 — Excepción documentada para otros destinos internos *(cubre RF-12)*
```gherkin
Escenario: Un destino interno distinto de metadatos necesita una excepción completa
  Dado un destino efectivo local, privado o link-local distinto de metadatos de infraestructura
  Cuando la auditoría no lo rechaza
  Entonces existe una excepción documentada con responsable, alcance y evidencia
```

### Matriz RF → CA

| OBJ | PRD-RF | UC | RF | CA |
|---|---|---|---|---|
| OBJ-001 | PRD-RF-001 | UC-003 | RF-01 | CA-01 |
| OBJ-001 | PRD-RF-001 | UC-003 | RF-02 | CA-02 |
| OBJ-001 | PRD-RF-001 | UC-003 | RF-03 | CA-03 |
| OBJ-001 | PRD-RF-001 | UC-003 | RF-04 | CA-04 |
| OBJ-001 | PRD-RF-001 | UC-003 | RF-05 | CA-05 |
| OBJ-002 | PRD-RF-004 | UC-004 | RF-06 | CA-06 |
| OBJ-002 | PRD-RF-004 | UC-004 | RF-07 | CA-07 |
| OBJ-002 | PRD-RF-004 | UC-004 | RF-08 | CA-08 |
| OBJ-003 | PRD-RF-006 | UC-001 | RF-09 | CA-09 |
| OBJ-002 | PRD-RF-004 | UC-004 | RF-10 | CA-10 |
| OBJ-002 | PRD-RF-004 | UC-004 | RF-11 | CA-11 |
| OBJ-001 | PRD-RF-001 | UC-003 | RF-12 | CA-12 |

## 7. Casos límite

| Situación | Comportamiento esperado |
|---|---|
| Entrada vacía | Una petición sin destino o protocolo identificable produce un hallazgo; nunca se presenta como superada |
| Valor en el límite exacto | El valor igual al límite declarado se clasifica de forma inequívoca y repetible |
| Dos auditorías a la vez | Cada auditoría conserva sus propios escenarios, resultados y evidencias sin mezclarlos |
| Usuario sin permisos | La imposibilidad de obtener evidencia se registra como `no ejecutado`, con riesgo, responsable y siguiente paso |
| Sistema externo caído | La revisión conserva la decisión estática posible y marca como no ejecutada cualquier comprobación que dependa del destino |
| Red lenta | El escenario comprueba que la espera termina conforme al límite declarado o produce un hallazgo |
| Petición repetida | La repetición no borra la evidencia anterior ni multiplica un hallazgo sin conservar la referencia a cada escenario |
| Datos existentes corruptos | La evidencia ilegible, incompleta o contradictoria se rechaza como no verificable |
| Reintentos | Cada reintento permanece sujeto a los mismos límites y decisiones de destino |
| Cadena de redirecciones | Cada salto vuelve a evaluarse; un bucle o el exceso del límite declarado produce un hallazgo |
| Resolución cambiante | Un cambio del destino efectivo invalida una aprobación basada únicamente en una resolución anterior |
| Destino expresado de forma alternativa | La clasificación se basa en el destino efectivo y no solo en su representación aparente |
| Control sin aplicación material | Solo puede declararse `no aplica` con una justificación específica del control; la ausencia de petición saliente no se presume |

## 8. Reglas de negocio

- **RN-01** — Una decisión sobre el destino aparente no sustituye la evaluación del destino efectivo.
- **RN-02** — Cada redirección constituye una nueva decisión de seguridad.
- **RN-03** — Ausencia de evidencia, falta de permisos o sistema externo caído nunca equivalen a
  control superado.
- **RN-04** — Una excepción para un destino local, privado o link-local necesita motivo material,
  responsable, alcance y evidencia.
- **RN-05** — La negación o restricción de destino prevalece sobre una aprobación más general.
- **RN-06** — La portabilidad se consigue manteniendo un único contrato funcional; esta spec no
  aumenta el catálogo de agentes ni de skills.
- **RN-07** — La evidencia no reproduce secretos, credenciales ni cuerpos completos de petición o
  respuesta.
- **RN-08** — El contrato abarca toda petición saliente; cada `no aplica` se justifica por control.
- **RN-09** — Los destinos de metadatos de infraestructura no admiten excepción.

## 9. Fuera de alcance

- Crear un agente, una skill o un comando adicional para SSRF/egress.
- Implementar peticiones salientes, filtros de red o una arquitectura concreta en esta plantilla.
- Elegir mecanismos, proveedores o valores universales para todos los proyectos instalados.
- Permitir excepciones para destinos de metadatos de infraestructura.
- Sustituir el modelo de amenazas, OWASP Top 10:2025 o ASVS 5.0.0 por MITRE ATT&CK.
- Copiar o distribuir los 26 documentos formativos dentro del producto.
- Reescribir el PRD, los casos de uso o `FEATURE-MAP.md` sin el gate humano de producto.
- Corregir el defecto de CI de rutas Windows ni preparar el versionado de una release.

## 10. Riesgos y dependencias

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Omitir influencias indirectas sobre destinos salientes | media | alto | RN-08 aplica el contrato a toda petición y exige justificar cada `no aplica` |
| Convertir la política en una prohibición universal que invalide integraciones internas legítimas | media | medio | RF-12 admite excepciones documentadas salvo para metadatos de infraestructura |
| Añadir texto en una superficie pero mantener la deriva en otras | media | alto | RF-09 y CA-09 exigen paridad funcional |
| Registrar evidencia con secretos o datos personales | baja | alto | RN-07 y el RNF de seguridad limitan el contenido permitido |
| Duplicar controles equivalentes y aumentar el coste de revisión | media | medio | RF-10 y RF-11 ofrecen resumen y agrupación sin perder traza |
| La ampliación derive del corte de producto aprobado | baja | medio | DISC-016-01 conserva el encaje confirmado sin modificar el baseline |

Dependencias: contrato de seguridad entregado por `007-seguridad-jwt-owasp-2025` y baseline
aprobado de producto.

## 11. Supuestos

- La auditoría de los 26 documentos aportados es una fuente contextual aceptada para redactar el
  borrador, pero no modifica por sí sola el baseline de producto.
- SSRF/egress se entiende como cobertura de cualquier capacidad que inicia una petición hacia un
  destino fuera de su frontera de confianza, no como una tecnología concreta.
- La mejora actualiza un contrato portable existente y no crea una nueva capacidad de usuario;
  este supuesto quedó confirmado por el usuario el 2026-08-21.
- Los umbrales numéricos de rendimiento y escala son valores propuestos para validar en el gate de
  especificación.
- Los requisitos `Could` constituyen la contingencia de alcance y pueden aplazarse sin perder la
  cobertura mínima.

## 12. Glosario

| Término | Definición |
|---|---|
| Petición saliente | Comunicación iniciada por el sistema hacia un destino fuera de la frontera que se está evaluando |
| Destino solicitado | Destino expresado antes de resolver nombres o seguir redirecciones |
| Destino efectivo | Destino concreto al que alcanzaría el siguiente salto de la comunicación |
| Resolución | Conversión de un nombre de destino en uno o más destinos efectivos |
| Redirección | Respuesta que propone continuar la comunicación hacia otro destino |
| Link-local | Ámbito de red limitado al enlace local, no destinado al acceso general desde la aplicación |
| Metadatos de infraestructura | Información de control expuesta por la plataforma donde se ejecuta el sistema |
| Evidencia verificable | Registro que permite reconstruir qué se evaluó, con qué resultado y a qué escenario corresponde |
| Control no ejecutado | Comprobación aplicable que no pudo realizarse y conserva riesgo, responsable y siguiente paso |

## 13. Preguntas abiertas

Ninguna. Las tres preguntas se resolvieron en `clarifications.md`, ronda 1.

## 14. Gate humano de especificación

| Campo | Valor |
|---|---|
| **Estado** | `approved` |
| **Aprobado / rechazado por** | Jesus Chamorro (usuario) |
| **Fecha** | 2026-08-21 |
| **Alcance de la decisión** | RF-01 a RF-12, CA-01 a CA-12 y DISC-016-01 |
| **Condiciones** | Aplicación a toda petición saliente; `no aplica` solo con justificación material; metadatos de infraestructura siempre bloqueados; otros destinos internos solo con excepción documentada |

> `/sdd-plan` no comienza mientras haya marcadores, discrepancias abiertas o este gate no esté
> en `approved`. La aprobación del PRD no sustituye la aprobación funcional de esta spec.
