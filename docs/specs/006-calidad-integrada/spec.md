# 006 · Calidad integrada: calibración y runtime

| Campo | Valor |
|---|---|
| Estado | aprobada |
| Tipo | capacidad transversal de calidad |
| Versión objetivo | v0.5.0 |
| Aprobación | spec aprobada explícitamente por el usuario el 2026-08-07 |

## Objetivo

Incorporar al sistema de agentes dos capacidades que hoy no tiene: **criterio para calibrar** cuánta
verificación merece cada módulo, y **la mitad de runtime del ciclo** —qué se observa, se clasifica y
se alerta después del despliegue—. Más las piezas de artesanía ausentes en testing, refactor,
seguridad de configuración, documentación y usabilidad, sin presuponer ningún stack y sin duplicar
lo que el sistema ya cubre mejor que la fuente.

Fuente analizada: 30 lecciones de `Master/Calidad` en siete bloques. El material es
React + Vitest + Playwright + Sentry + Husky; ninguna de esas herramientas entra como supuesto.

## Requisitos

| Id | Requisito EARS | Prioridad | Esfuerzo |
|---|---|---:|---:|
| RF-01 | Cuando el `planner` escriba `plan.md`, el sistema DEBE declarar el tier de cobertura CORE / IMPORTANT / INFRASTRUCTURE de cada módulo nuevo o modificado, y todo módulo sin tier declarado DEBE verificarse al 100 %. | M | 4 |
| RF-02 | Cuando la profundidad de verificación no sea obvia, el sistema DEBE resolverla con el marco de cuatro preguntas y registrar la decisión, sin que ello autorice omitir el ciclo rojo-verde de ninguna tarea de la spec. | M | 3 |
| RF-03 | Cuando una spec introduzca caminos de ejecución nuevos, el sistema DEBE instrumentar captura y clasificación de errores, salud de la versión y rastro de eventos de negocio sin datos personales. | M | 4 |
| RF-04 | Cuando se mida deuda técnica, el sistema DEBE obtener la cifra con un comando determinista sobre ficheros versionados, no con una estimación del modelo. | M | 3 |
| RF-05 | Cuando se instale la plantilla, el sistema DEBE conservar 20 agentes y exponer 25 skills canónicas con su adaptador, sin prompts ni comandos paralelos. | M | 2 |
| RF-06 | Cuando se declare cualquier gate nuevo, el sistema DEBE mantenerlo agnóstico de stack: `.sdd/checks.json` nace sin comandos y solo se sugiere un gate con evidencia real en el repositorio. | M | 3 |
| RF-07 | Cuando `implementer` reciba una tarea de instrumentación o de refactor estructural, el sistema DEBE delegar en `devops-expert` o `refactor-specialist` respectivamente, con profundidad máxima de dos saltos y devolución de control. | M | 3 |
| RF-08 | Cuando `/sdd-verify` compruebe lo anterior, el sistema DEBE hacerlo en solo lectura contra artefactos durables, porque el agente que coordina esa fase no tiene escritura ni delegación. | M | 2 |
| RF-09 | Cuando se escriban tests de extremo a extremo, el sistema DEBERÍA encapsular selectores y acciones por pantalla, cubrir regresión visual con línea base y tolerancia, y conservar traza, captura y vídeo solo en fallo. | S | 3 |
| RF-10 | Cuando se defina una alerta, el sistema DEBERÍA declarar umbral de aviso y umbral crítico, criterio de agrupación, prioridad y playbook asociado. | S | 3 |
| RF-11 | Cuando se reporten métricas, el sistema DEBERÍA mantener como máximo cinco vivas, cada una con umbral binario y acción asociada, y no reportar métricas de vanidad. | S | 3 |
| RF-12 | Cuando el proyecto configure el gate de olores, el sistema DEBERÍA bloquear ante nuevas violaciones del umbral de complejidad cognitiva declarado. | S | 2 |
| RF-13 | Cuando un refactor no quepa en un paso reversible, el sistema DEBERÍA aplicar una técnica de sustitución gradual con la suite en verde en cada paso. | S | 2 |
| RF-14 | Cuando el proyecto lo active explícitamente, el sistema DEBERÍA ejecutar gates rápidos antes del commit y lentos antes del push, con salida de emergencia documentada y obligación de seguimiento. | S | 3 |
| RF-15 | Cuando una aplicación arranque con configuración inválida o incompleta, el sistema DEBERÍA impedir el arranque con un error que nombre la variable y el motivo, sin revelar su valor. | S | 2 |
| RF-16 | Cuando cambie el código, el sistema DEBERÍA verificar que la documentación asociada sigue viva: referencias resolubles y ejemplos que corresponden a la interfaz real. | S | 2 |
| RF-17 | Cuando haya interfaz, el sistema DEBERÍA verificar heurísticas de usabilidad, formularios, microcopy y velocidad percibida, además de la accesibilidad que ya exige. | S | 3 |
| RF-18 | Cuando se entregue una spec, el sistema DEBERÍA producir un resumen ejecutivo sin jerga con cifras verificadas, o declarar que no hay cifras que reportar. | S | 2 |

Reparto MoSCoW por esfuerzo: M 24/49 (49,0 %), S 25/49 (51,0 %), C 0 %, W 0 %.

## Criterios de aceptación

### CA-01 · Cobertura por riesgo, no por número global

`docs/quality/TEST-STRATEGY.md` §8 ya no contiene un umbral de cobertura global como criterio de
suficiencia. Contiene la tabla de tres tiers con su criterio de clasificación y la regla de defecto
estricto. `DEFINITION-OF-DONE.md` exige el umbral del tier, no un porcentaje único.
`evidence.md` reporta por tier y lista aparte los módulos sin tier declarado.

### CA-02 · Calibración que no es coartada

`TEST-STRATEGY.md` §0 contiene el marco de cuatro preguntas y la matriz por etapa, y afirma de forma
literal que calibra la profundidad de la verificación y **nunca** sustituye el ciclo rojo-verde de
una tarea. `planner` y `test-engineer` repiten la restricción.

### CA-03 · Observabilidad instrumentada y alertas accionables

Existe `/observability` como skill canónica con adaptador. Produce `docs/ops/OBSERVABILITY.md` con
taxonomía de errores y acción por clase, salud de la versión, rastro de eventos de negocio sin datos
personales, y matriz de alertas con aviso, crítico, agrupación, prioridad, silencio y playbook.
Cierra con `### HANDOFF` y devuelve el control.

### CA-04 · Deuda y métricas con número

`node scripts/sdd-project.mjs debt` devuelve JSON válido con el conteo por directorio sobre ficheros
versionados y sin depender del lenguaje. `docs/quality/METRICS.md` declara los tres niveles de
métrica, el máximo de cinco vivas, el umbral binario con su acción, y la lista de métricas que el
sistema no reporta.

### CA-05 · Gates ejecutables y portables

`.sdd/checks.json` se instala sin ningún comando y con el vocabulario ampliado en `unconfigured`.
`sdd-project detect` sugiere un gate solo con evidencia en el repositorio y no escribe.
`run --fast` y `run --slow` filtran por velocidad; sin bandera el comportamiento no cambia.
Los git hooks se copian pero **no** se activan sin acción explícita.

### CA-06 · Usabilidad y documentación

`docs/design/USABILITY-CHECKLIST.md` existe y es vinculante desde `ux-designer` y `/front`: diez
heurísticas con un ejemplo de fallo cada una, formularios, patrón de mensaje de error, microcopy y
velocidad percibida con la lista de casos donde no se aplica actualización optimista.
El gate `docs` está en el vocabulario y `docs-writer` lo conoce.

### CA-07 · Delegación, handoff y aislamiento

`implementer` tiene las dos filas de delegación nuevas. Ningún especialista encadena. Los pasos
nuevos de `/sdd-verify` son comprobaciones de solo lectura. El bloque `### HANDOFF` universal no
cambia; cambian seis bloques específicos. `.sdd/territories.json` declara `docs/ops/**` para
`devops-expert` y no declara dueño de `docs/quality/**`.

### CA-08 · Contrato y paridad multihost

`scripts/check-sdd.mjs` exige 20 agentes y 25 skills, y valida que `checks.json` solo use
identificadores del vocabulario permitido. Los ocho documentos que citan el conteo lo actualizan.
No se crea agente 21 ni prompt o comando paralelo para `observability`.

## Gates humanos

1. Producto — no aplica: capacidad interna de la plantilla, sin PRD nuevo.
2. Arquitectura — no aplica: no cambia la constitución.
3. **Spec funcional sin ambigüedades** ← gate activo.
4. Diseño — no aplica: sin interfaz.
5. Plan técnico.
6. Entrega final.

## Fuera de alcance

- Añadir un agente número 21.
- Imponer herramienta o stack concreto: ni gestor de errores, ni runner de tests, ni gestor de git
  hooks. Todo entra como detección o como ejemplo.
- Activar git hooks sin acción explícita del proyecto.
- Reescribir lo que el sistema ya cubre mejor que la fuente: pirámide, dobles, casos límite, OWASP,
  ASVS, WCAG, ADRs, runbooks y métricas RED.
- Añadir campos nuevos al bloque `### HANDOFF` universal de `AGENTS.md`.
