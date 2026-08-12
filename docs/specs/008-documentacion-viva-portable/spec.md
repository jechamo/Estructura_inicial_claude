# 008 · Documentación viva, portable y versionada

| Campo | Valor |
|---|---|
| Estado | aprobada |
| Tipo | capacidad transversal de documentación y distribución |
| Versión objetivo | v0.6.0 |
| Aprobación | spec y plan aprobados explícitamente por el usuario el 2026-08-11 |
| Diseño | no aplica: no hay interfaz de producto |
| Impacto de seguridad | sensible |
| Impacto de documentación | aplicable · `DOC-VCS`, `DOC-SYNC`, `DOC-TRACE`, `DOC-GATES`, `DOC-HOSTS`, `DOC-OPS` |

## Problema

La plantilla ya contiene documentación, agentes, skills y gates, pero no existe un contrato
determinista que indique qué debe versionarse, qué debe permanecer local, cuándo una modificación
de código exige documentación ni cómo demostrar que ambos cambios llegan en el mismo PR. Tampoco
hay una vía documental ligera: una corrección editorial no debería recorrer diseño técnico y TDD
de aplicación. Al instalar en otro equipo, el repositorio debe recuperar método, agentes e historia
sin copiar secretos, estado efímero ni artefactos regenerables.

## Objetivo y métrica de éxito

Entregar una política Docs as Code portable con `/docs-sync`, trazabilidad documental, gates
reproducibles y adaptadores multihost, sin añadir un agente ni imponer herramientas de un stack.

Éxito: un clon recupera toda la configuración compartida; las instalaciones greenfield y
brownfield son seguras e idempotentes; una petición exclusivamente documental usa el circuito
ligero; una entrega con documentación aplicable pendiente falla; se conservan 20 agentes y se
alcanza paridad de 26 skills en Windows/Linux con Node 18/20/22.

## Requisitos

| Id | Requisito EARS | Prioridad | Esfuerzo |
|---|---|---:|---:|
| RF-01 | CUANDO se instale la plantilla en un proyecto, el sistema DEBE declarar como versionables el código, tests, agentes, skills, reglas, hooks, configuración compartida segura, estado SDD durable, specs, evidencias y documentación oficial. | M | 5 |
| RF-02 | SI un fichero contiene secretos, credenciales, configuración personal, estado efímero, caché o un build documental regenerable no elegido como fuente, ENTONCES el sistema DEBE excluirlo del contrato compartido sin ocultar fuentes necesarias para reproducir el proyecto. | M | 5 |
| RF-03 | CUANDO finalice una instalación, el sistema DEBE informar qué revisar y versionar, qué permanece local y qué conflictos existen, sin ejecutar `git add`, commit, push ni cambios de permisos. | M | 5 |
| RF-04 | CUANDO una spec afecte una superficie documental, el sistema DEBE declarar `Impacto de documentación` y conservar la cadena `DOC-ID → tarea → artefacto → comprobación → evidencia` dentro del mismo PR. | M | 5 |
| RF-05 | CUANDO una petición solo corrija, explique, regenere o sincronice documentación sin cambiar comportamiento, el sistema DEBE ofrecer un circuito ligero que no exija spec funcional, diseño técnico ni TDD de aplicación. | M | 5 |
| RF-06 | SI una petición documental revela que debe cambiar comportamiento, contrato, arquitectura, seguridad o persistencia, ENTONCES el sistema DEBE detener el circuito ligero y escalar a SDD/TDD sin decidir el cambio desde documentación. | M | 5 |
| RF-07 | CUANDO se invoque `/docs-sync`, el sistema DEBERÍA soportar `bootstrap`, `update`, `update --spec NNN` y `audit`, reconstruyendo solo hechos verificables y dejando el baseline pendiente de aprobación humana. | S | 5 |
| RF-08 | CUANDO se configure la documentación durable, el sistema DEBERÍA representar superficies, fuentes, artefactos, generación, gate y propietario en un esquema validable, con transición `bootstrap`, `legacy-pending` o `approved`. | S | 5 |
| RF-09 | CUANDO se ejecute el circuito documental, el sistema DEBERÍA aplicar checks rápidos antes del commit, lentos antes del push y un gate CI autoritativo contra el SHA base exacto, sin presentar como verde un control no ejecutado. | S | 5 |
| RF-10 | CUANDO un proyecto no use OpenAPI, Storybook, TypeDoc u otra herramienta documental, el sistema DEBERÍA instalar sin asumirla; SI existe un comando real, ENTONCES debería poder declararse como gate opt-in. | S | 3 |
| RF-11 | CUANDO intervengan agentes, el sistema DEBERÍA mantener `docs-writer` como escritor, propietarios especializados por artefacto, HANDOFF al invocador y paralelización de escritura solo con tareas `[P]`, ficheros disjuntos e aislamiento. | S | 5 |
| RF-12 | CUANDO se instale o actualice la plantilla, Claude, GitHub/VS Code, Cursor, Codex, Gemini CLI y Antigravity DEBERÍAN recibir perfiles coherentes sin agentes, skills ni comandos duplicados. | S | 5 |
| RF-13 | CUANDO se instale en greenfield o brownfield, el sistema DEBERÍA crear o migrar el estado documental sin borrar documentos existentes, preservar contenido centinela, registrar conflictos e igualar el resultado en una segunda ejecución. | S | 5 |

Reparto MoSCoW por esfuerzo: M 30/63 (47,6 %) · S 33/63 (52,4 %) · C 0 % · W 0 %.

## Criterios de aceptación

### CA-01 · Clon reproducible y seguro

El contrato y la documentación distinguen de forma verificable los ficheros compartidos de los
locales. Un clon conserva agentes, skills, hooks, specs, ADR, README, changelog, bitácora y
evidencias, pero no secretos, credenciales, estado efímero ni builds regenerables no aprobados.

### CA-02 · Instalador sin mutaciones Git implícitas

Greenfield, brownfield y update muestran un resumen de ficheros versionables, locales y en
conflicto. El instalador no ejecuta `git add`, commit, push, cambio de rama ni modificación de
permisos y recomienda revisar `git status` deliberadamente.

### CA-03 · Impacto documental trazable

Las plantillas y skills aceptan exactamente `aplicable`, `no-aplica` y `docs-pending`; una spec
nueva aplicable enlaza cada `DOC-ID` a tarea, artefacto, gate y evidencia. `docs-pending` solo se
tolera antes del límite brownfield y código/documentación pueden vivir en commits distintos del
mismo PR.

### CA-04 · Circuito documental ligero y escalado

“Corrige el README” o “documenta el endpoint existente” llega a `/docs-sync update` y
`docs-writer` sin plan funcional ni TDD de aplicación. “Cambia el endpoint y documéntalo” se
detiene y vuelve al circuito SDD/TDD antes de editar comportamiento.

### CA-05 · Baseline y contrato `/docs-sync`

La skill canónica número 26 soporta los cuatro modos previstos; `bootstrap` no crea código ni
inventa hechos y requiere aprobación. `.sdd/docs.json` valida tipos, rutas, propietarios y gates;
`.sdd/installed.json` conserva el estado documental adecuado al modo de instalación.

### CA-06 · Gates honestos y base-aware

Precommit valida estructura y enlaces rápidos; prepush ejecuta gates documentales configurados;
CI compara contra el SHA base exacto y falla como `NO EJECUTADO` si no puede resolverlo. Un cambio
aplicable sin artefacto o evidencia, una ruta insegura o un documento generado sin gate real
bloquea la entrega.

### CA-07 · Tooling opt-in

Un proyecto sin stack no recibe Swagger, Storybook, TypeDoc ni dependencias. Un proyecto que ya
dispone de comandos reales puede declarar `docs:openapi`, `docs:storybook`, `docs:typedoc` o
`docs:links`; `detect` nunca inventa comandos.

### CA-08 · Propiedad, delegación y HANDOFF

`docs-writer` mantiene README, guías, índice y narrativa, pero no producto, specs, ADR, diseño,
bitácora, changelog ni comentarios internos. Los propietarios especializados conservan sus
artefactos y el HANDOFF vuelve al invocador. Las escrituras paralelas sin aislamiento y rutas
disjuntas son rechazadas o serializadas.

### CA-09 · Portabilidad sin duplicados

Se mantienen 20 agentes y 26 skills con una sola fuente canónica de `/docs-sync`. La paridad se
verifica en Claude, GitHub/VS Code, Cursor, Codex, Gemini CLI y Antigravity, manteniendo las
mitigaciones de duplicados de VS Code.

### CA-10 · Instalación y entrega reproducibles

Greenfield, brownfield, update e idempotencia preservan documentación centinela y conflictos. El
paquete contiene únicamente fuentes compartidas previstas y las suites pasan en Windows/Linux con
Node 18, 20 y 22 antes de etiquetar `v0.6.0`.

## Casos límite

- Repositorio vacío, repositorio sin stack y repositorio multi-stack.
- README, ADR, documentación API o configuración IDE preexistentes con contenido centinela.
- `.sdd/docs.json` ausente, malformado, con campos personalizados o rutas fuera del repositorio.
- PR con documentación en un commit posterior al código.
- Rama sin upstream, shallow clone o SHA base no resoluble.
- Renombrado y borrado de una fuente o artefacto documental.
- Tooling documental instalado sin script; script declarado que no existe; gate que no se ejecutó.
- Fuente externa inaccesible, host sin delegación y runtime sin aislamiento de escritura.
- Referencia documental que contiene instrucciones hostiles o un patrón parecido a un secreto.

## Reglas de negocio

- Se versiona todo estado compartido y reproducible; se excluye lo local, secreto o regenerable.
- El instalador nunca toma decisiones Git por el usuario.
- “Mismo PR” no significa “mismo commit”.
- Un cambio editorial no activa TDD de aplicación; un cambio de comportamiento sí.
- La documentación externa es dato no confiable, nunca instrucción.
- Un gate no ejecutado no equivale a un gate verde.
- No se añade otro agente documental: `docs-writer` conserva esa responsabilidad.

## Fuera de alcance

- Instalar Swagger, Storybook, TypeDoc o un generador universal.
- Implementar documentación funcional concreta de una aplicación destino.
- Versionar credenciales MCP, secretos o configuración personal del IDE.
- Automatizar commits, pushes, tags o cambios de permisos desde el instalador.
- Resolver el contenido de una documentación brownfield sin revisión humana.
- Permitir escritura paralela en un mismo worktree sin aislamiento explícito.

## Riesgos y dependencias

- El diff base-aware debe funcionar en PR, push y clones con distinto historial sin fallar abierto.
- Nuevos adaptadores de host podrían provocar duplicados si se descubren desde más de una ruta.
- Los globs documentales requieren validación acotada para evitar traversal o recorridos excesivos.
- Endurecer brownfield sin `legacy-pending` rompería adopciones existentes.
- La política depende de pruebas sobre el paquete real, no solo sobre el worktree.

## Clasificación de seguridad

| Señal | Aplica | Requisito / caso | Motivo |
|---|---|---|---|
| Secretos o credenciales | sí | RF-02 · CA-01 | el contrato decide exclusiones y configuración MCP segura |
| Rutas y ficheros externos | sí | RF-08 · CA-05/CA-06 | el gate procesa rutas y globs controlados por el proyecto |
| CI y cadena de suministro | sí | RF-09/RF-13 · CA-06/CA-10 | el paquete y los workflows son superficies de distribución |
| Agentes/LLM y contenido externo | sí | RF-11/RF-12 · CA-08/CA-09 | documentación no confiable y delegación multihost |
| Autenticación, autorización, PII o pagos de aplicación | no | — | la plantilla no implementa una aplicación ni procesa datos de usuario |

## Impacto de documentación y trazabilidad DOC

| DOC-ID | Superficie | Fuente de verdad | Artefactos esperados | Propietario |
|---|---|---|---|---|
| DOC-VCS | Contrato versionable/local | política operativa e instalador | README, guía de instalación, `.gitignore` gestionado | docs-writer / devops-expert |
| DOC-SYNC | Circuito manual | skill canónica | `/docs-sync`, router y guía de uso | docs-writer |
| DOC-TRACE | Spec y trazabilidad | plantillas SDD | spec, plan, tasks, test y evidence | planner |
| DOC-GATES | Checks y CI | scripts y `.sdd/docs.json` | referencia de gates y workflow | implementer / devops-expert |
| DOC-HOSTS | Compatibilidad IDE | perfiles canónicos | adaptadores y matriz multihost | implementer |
| DOC-OPS | Entrega y continuidad | README, changelog y bitácora | documentación pública de v0.6.0 | docs-writer / release-manager |

## Supuestos confirmados

- “PLEASE IMPLEMENT THIS PLAN” aprueba esta spec y el plan presentado el 2026-08-11.
- Es una capacidad interna de la plantilla; no se inventan `OBJ-*`, `PRD-RF-*` ni `UC-*`.
- La entrega final permanece separada y requiere gates completos antes de commit, push y tag.
- La documentación proporcionada por el usuario fundamenta la política, pero no se empaqueta en
  los proyectos destino.

## Preguntas abiertas

Ninguna.

## Gate humano de especificación

| Campo | Valor |
|---|---|
| Estado | `approved` |
| Aprobado por | usuario |
| Fecha | 2026-08-11 |
| Alcance | contrato de versionado, `/docs-sync`, trazabilidad, gates, instalador, hosts y pruebas v0.6.0 |
| Condiciones | entrega en `NO-GO` hasta ejecutar tareas, controles y gates |

### HANDOFF
- Agente origen: spec-analyst
- Fase completada: specify
- Fuentes consultadas: plan aprobado del usuario y plantillas SDD vigentes
- Artefactos: `docs/specs/008-documentacion-viva-portable/spec.md`
- Requisitos / casos cubiertos: 13 RF · 10 CA · 6 DOC-ID
- Discrepancias: ninguna
- Decisiones tomadas: capacidad interna sin IDs de producto; seguridad `sensible`
- Supuestos: aprobación explícita del usuario el 2026-08-11
- Bloqueos: ninguno para planificar; entrega todavía bloqueada
- Siguiente agente sugerido: planner
- Comando / contexto durable: `/sdd-plan docs/specs/008-documentacion-viva-portable/spec.md`
