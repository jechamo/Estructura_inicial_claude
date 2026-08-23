# Memoria tecnica del sistema portable de agentes SDD

## 1. Descripcion del proyecto

**Estructura inicial de agentes SDD** es una plantilla portable que incorpora un sistema de agentes para gobernar el ciclo de vida de software en un repositorio existente o nuevo. No es una aplicacion de negocio ni impone un stack: instala perfiles de agentes, skills, reglas, hooks, plantillas y comandos Node.js que permiten trabajar de forma trazable en Claude Code, VS Code/Copilot, Cursor, Codex, Gemini CLI y Antigravity.

El modelo combina **Spec-Driven Development (SDD)** y **Test-Driven Development (TDD)**. La especificacion aprobada es la fuente de verdad: el codigo se construye despues de formular requisitos verificables, resolver ambiguedades, disenar la experiencia cuando existe interfaz, planificar y dividir el trabajo. La implementacion se realiza como ciclos rojo-verde-refactor y se entrega tras gates de calidad, seguridad, documentacion y revision humana.

La autonomia es deliberadamente acotada. El sistema automatiza el diagnostico, el enrutado, los scaffolds, la trazabilidad, los checks y el aislamiento de territorios, pero exige aprobacion humana en producto, arquitectura de greenfield, especificacion, direccion visual, plan y entrega. Por tanto, el objetivo no es eliminar el gobierno humano, sino hacer que los agentes puedan avanzar de forma coordinada, repetible y auditable desde requisitos funcionales y de diseno aprobados.

Principios operativos:

- Una funcionalidad no genera codigo sin una spec aprobada en `docs/specs/NNN-slug/`.
- Las dependencias se orientan hacia el dominio y la constitucion arquitectonica es vinculante.
- Solo `orchestrator`, `planner` e `implementer` pueden delegar; la profundidad maxima es de dos saltos entre agentes.
- Los auditores (`code-reviewer`, `security-auditor` y `research-analyst`) no escriben aquello que revisan.
- La evidencia ejecutada prevalece sobre las afirmaciones: un control no ejecutado se declara como tal.

Fuentes de verdad: `AGENTS.md`, `docs/sdd/OPERATING-MODEL.md`, `docs/architecture/constitution.md` y la spec activa.

## 2. Instalacion limpia y primera ejecucion

### Requisitos

- Node.js 18 o posterior.
- Un repositorio Git destino, nuevo o existente.
- Un IDE/host compatible y un workspace marcado como confiable.

La instalacion no instala dependencias de aplicacion, no hace `git add`, no crea commits y no escribe credenciales. Para una ejecucion reproducible debe usarse un tag inmutable publicado; la version preparada por este trabajo es `v0.9.1`. El tag no se publica hasta que lo apruebe el equipo.

## Circuito proporcional y presupuesto de contexto (v0.9.0)

La version 0.9.0 sustituye el peaje unico por tres niveles sin apagar controles:

| Nivel | Alcance | Evidencia |
|---|---|---|
| `light` | Fichero exacto no ejecutable y aprobado | gates, trailers y bitacora |
| `compact` | Conducta acotada en un modulo existente | `change.md` sellado, TDD y revision independiente |
| `full` | Seguridad, auth, API, datos, dependencias, infraestructura, SDD, varios modulos o exceso de limites | expediente SDD completo |

### Como elegir y usar cada modo

La persona no elige el nivel por conveniencia: primero declara las rutas previstas y el
clasificador aplica el nivel mas restrictivo. Una ruta desconocida, una configuracion pendiente o
un impacto de seguridad sin resolver siempre terminan en `full`.

| Modo | Usalo cuando | Ejemplos | Flujo minimo |
|---|---|---|---|
| `light` | Solo cambia un fichero exacto, aprobado y no ejecutable; no aparece conducta nueva | una errata en `README.md`, copy o una guia exacta | clasificar rutas -> editar -> gates -> trailers y bitacora |
| `compact` | Cambia conducta dentro de un unico modulo ya existente y cabe en 3 criterios, 3 tareas y 12 KiB | seleccion de un carrusel, plegado de secciones o correccion localizada de un componente | clasificar -> crear y aprobar `change.md` -> commit de aprobacion dedicado -> RED/GREEN/REFACTOR -> revision y gates |
| `full` | El cambio es sensible, cruza modulos o altera contratos, datos, dependencias, infraestructura o el propio SDD | auth, API, migracion, dependencia nueva, pantalla nueva o cambio de gates/agentes | expediente SDD completo -> aprobaciones -> TDD -> verify y ship |

```powershell
# La frontera nace pendiente: primero se inspecciona la propuesta, sin escribir.
node scripts/sdd-project.mjs detect-circuit --json

# Solo una persona aprueba el hash mostrado y una decision durable existente.
# El arbol debe estar limpio y el cambio de circuit.json se commitea solo, como full.
node scripts/sdd-project.mjs approve-circuit --hash <sha256> `
  --approved-by "<persona>" --decision-ref DEC-<id> --json

# La clasificacion previa no edita el proyecto.
node scripts/check-sdd.mjs --circuit-status --planned README.md --json
node scripts/check-sdd.mjs --circuit-status --planned src/components/Carousel.tsx --behavior changed --json

# Compact crea una mini-spec pendiente; aprobarla tambien exige persona y commit full dedicado.
node scripts/sdd-project.mjs new-change seleccion-carrusel --mode compact --json
node scripts/sdd-project.mjs approve-change --spec NNN `
  --approved-by "<persona>" --decision-ref DEC-<id> --json

# Full conserva la entrada habitual del circuito completo.
node scripts/sdd-project.mjs new-spec autenticacion-sesiones --json
```

Los tres modos conservan gates, trailers, bitacora y auditoria. `light` no declara que TDD sea
opcional: simplemente no puede cubrir codigo ejecutable. `compact` conserva TDD completo. Si el
diff, los impactos o el alcance crecen, solo se permite escalar hacia `full`; nunca degradar.
La suma de cambios compactos por modulo se audita en una ventana de 20 commits: se avisa al rotar
`Change-Group` y se exige `full` cuando la union supera los limites.

La frontera vive en `.sdd/circuit.json`. Nace `pending`: `detect-circuit` muestra la propuesta y
su hash sin escribir, y una persona ejecuta `approve-circuit` con actor y referencia de decision.
La frontera aprobada se materializa sola en un commit `full`; un `change.md` aprobado hace lo
mismo antes del código compacto. Ausencia, invalidez, hash obsoleto o el antiguo
`.sdd/lightweight.json` devuelven `full`.
`check-sdd --circuit-status --planned <ruta>...` permite conocer el nivel antes de editar.

La auditoria `--trace-audit` es obligatoria en gates lentos, ship y CI/Pages. Contrasta trailers,
configuracion del padre, territorio, autor, sello de intencion y limites agregados por modulo.
`context --phase <fase> --spec NNN --task T-*` recorta la politica y el expediente. `run
--fast|--slow --summary-json` devuelve evidencia sanitizada y acotada; nunca persiste salida cruda.

### Cierre de release sin repetir el slow completo (enmienda preparada para v0.9.1)

El slow completo sigue siendo obligatorio cuando cambia codigo, configuracion, dependencias,
Pages, la propia Memoria TFM o el circuito. La optimizacion solo cubre el paso editorial que suele
ocurrir despues: cerrar CHANGELOG, bitacora, evidence, campos de estado/progreso de la spec e informes.

```powershell
# 1. Contenido funcional definitivo: todos los gates lentos se ejecutan.
node scripts/sdd-project.mjs run --slow --summary-json

# 2. Tras el commit editorial de cierre: verificacion selectiva y auditable.
node scripts/sdd-project.mjs run --release --summary-json
```

`--release` busca el ultimo slow local verde y comprueba que su commit sea ancestro, que coincidan
Node/plataforma, `.sdd/checks.json` y la huella de todas las entradas no editoriales. Solo entonces
coverage, E2E y a11y aparecen como `execution: "reused"`, con `sourceRunId`, fecha y SHA de origen.
Trace-audit, escaneo de secretos, strict y diff documental se ejecutan siempre y aparecen como
`execution: "executed"`. No se reutiliza evidencia entre maquinas.

El sello no se autofirma con un hash simple: usa HMAC-SHA-256 y una clave aleatoria local guardada
bajo el directorio Git, fuera del arbol versionado. Detecta corrupcion y mezcla entre clones, pero
no autentica frente a otro proceso del mismo usuario, que puede leer esa clave. Por eso la autoridad
de publicacion es la CI completa del workflow exacto `sdd-gates.yml` sobre el mismo SHA de `main`.
Tambien se rechazan hardlinks, junctions y entradas que superan las cuotas de lectura.

Si falta evidencia, esta en rojo o cambia cualquier fichero material, el comando falla sin lanzar
automaticamente la suite costosa y muestra `run --slow --summary-json`. De este modo una persona
puede decidir si lo ejecuta ella o el agente. Un tag o una GitHub Release sobre el mismo SHA no
cambia bytes, por lo que no exige repetir el slow. CI conserva la ejecucion completa.

Los campos de estado/progreso se normalizan antes de calcular la huella. El resto de `spec.md` y
`tasks.md` sigue protegido: cambiar requisitos, criterios, plan o pruebas invalida la reutilizacion.
La bitacora solo puede anteponer historia, evidence solo puede anexarla y un informe ya existente
es inmutable; un informe nuevo si puede formar parte del cierre.

El push exclusivo de un tag no ejecuta gates locales otra vez. Un workflow remoto comprueba que
el tag apunta a un commit contenido en `main` y que `SDD gates` ya termino en verde sobre exactamente
ese SHA. Por eso `--no-verify` no crea una via de publicacion sin control y el slow no se repite.

El benchmark 017 regenera su linea base y exige una reduccion mediana minima del 70 % para
`compact` y del 20 % para `full`, manteniendo 100 % de clasificacion y expectativas funcionales.
La ejecución verificada de esta rama obtuvo 76,00 % en `compact`, 71,30 % en `full` y 100 % de
clasificación, con tres intervenciones compactas.
Bytes/4 es un **proxy auditable de contexto**, no la cuota real de Copilot o Cursor: esos hosts no
exponen de forma fiable tokens consumidos por intervencion.

```powershell
# 1. Inspeccion sin escribir nada
npx --yes github:jechamo/Estructura_inicial_claude#v0.9.1 init "C:\ruta\proyecto" --mode auto --dry-run

# 2. Instalacion materializada; auto preserva un proyecto con contenido
npx --yes github:jechamo/Estructura_inicial_claude#v0.9.1 init "C:\ruta\proyecto" --mode auto

# 3. Comprobaciones del motor instalado
node scripts/check-sdd.mjs
node scripts/test-hooks.mjs
node scripts/sdd-project.mjs detect --json
node scripts/sdd-project.mjs status --json
```

`--mode greenfield` se reserva para un directorio vacio o proyecto nuevo; `--mode brownfield` declara explicitamente un repositorio ya en marcha; `--mode auto` es la opcion recomendada. Una actualizacion posterior conserva ficheros modificados y deja propuestas de conflicto en `.sdd/conflicts/`.

```powershell
# Actualizacion y comprobacion de una instalacion existente
npx --yes github:jechamo/Estructura_inicial_claude#v0.9.1 check "C:\ruta\proyecto"
npx --yes github:jechamo/Estructura_inicial_claude#v0.9.1 update "C:\ruta\proyecto"

# Hooks locales opcionales: requieren una decision explicita del equipo
git config core.hooksPath .sdd/githooks
git update-index --chmod=+x .sdd/githooks/pre-commit .sdd/githooks/pre-push
```

### Primeros pasos segun el contexto

| Situacion | Secuencia correcta | Resultado esperado |
|---|---|---|
| Proyecto nuevo | `/sdd-intake` -> aprobacion humana -> `/sdd-init` | Baseline de producto, constitucion y ADR-0001 |
| Proyecto existente con poca documentacion | `/onboard` -> `/sdd-intake` -> `/docs-sync bootstrap` | Arquitectura real documentada, baseline de producto y baseline documental |
| Proyecto existente ya documentado | `/sdd-start` o `/sdd-status` | Diagnostico y siguiente fase sin duplicar trabajo |

En un brownfield, **no debe suponerse** que siempre se empieza escribiendo `AGENTS.md`. El instalador ya incorpora el bloque SDD de forma conservadora. Primero se documenta la realidad con `/onboard`; despues se normalizan producto y documentacion. Cambiar `AGENTS.md` es una modificacion de gobernanza y debe pasar por `orchestrator`; si modifica reglas estructurales, corresponde a `architect` y puede requerir ADR.

## 3. Estructura instalada, finalidad y flujos

La matriz visual editable de agentes, delegacion y handoff esta en [ESTRUCTURA-INSTALADA.excalidraw](./ESTRUCTURA-INSTALADA.excalidraw). La siguiente tabla es la referencia textual y explica como se conectan los directorios.

| Ubicacion | Contenido y finalidad | Relacion y flujos |
|---|---|---|
| `AGENTS.md` | Router operativo comun: reglas duras, entradas, gates y formato de handoff. | Primera referencia del agente. Remite a `docs/sdd/OPERATING-MODEL.md`. |
| `README.md`, `CONTRIBUTING.md`, `CHANGELOG.md`, `SECURITY.md` | Entrada publica, colaboracion, historial de cambios y reporte de seguridad. | Se sincronizan en entrega/documentacion; no sustituyen una spec ni una evidencia. |
| `.agents/` | Superficie canonica portable: skills, perfiles, reglas, hooks y workflows. | Las skills son compartidas por hosts; los perfiles de IDE son adaptadores. |
| `.claude/`, `.github/`, `.cursor/`, `.codex/`, `.gemini/` | Adaptadores por host para descubrir agentes, instrucciones y hooks. | Remiten al modelo y a perfiles canonicos; evitan duplicar la logica de negocio. |
| `.sdd/` | Estado durable y contratos: checks, territorios, documentos, generadores, hooks, instalacion y auditoria. | Los hooks y los scripts lo usan para imponer territorios, gates y trazabilidad. No se versionan secretos, estado local ni conflictos. |
| `docs/product/` | `PRD.md`, casos de uso, mapa de funcionalidades, fuentes y vision. | Lo crea/actualiza `/sdd-intake`; alimenta `/sdd-specify` y requiere aprobacion humana. |
| `docs/architecture/` | Constitucion, ADR, guia de decision y patrones. | `/sdd-init` o `/onboard` formalizan la arquitectura; `/sdd-plan` y `/sdd-implement` la obedecen. |
| `docs/specs/NNN-slug/` | Una carpeta por funcionalidad: `spec`, aclaraciones, diseno, plan, contratos, tareas, tests y evidencia. | Es el hilo de trazabilidad desde requisito a prueba y entrega. `/sdd-implement` consume `tasks.md`; `/sdd-verify` completa evidencia. |
| `docs/design/` | Direccion visual, accesibilidad, usabilidad, flujos y wireframes. | `/sdd-design` lo produce si hay UI; `/front` y `/sdd-verify` aplican y revisan UX/WCAG. |
| `docs/quality/` y `docs/security/` | Estrategia de pruebas, DoD, deuda, informes, checklist OWASP/ASVS y modelo de amenazas. | `/sdd-verify` y `/security-scan` producen/controlan evidencia de calidad y seguridad. |
| `docs/ops/` | Observabilidad y runbooks. | `/observability` prepara sensores; `/respond-incident` usa runbooks para contener y aprender. |
| `docs/agents/`, `docs/guides/`, `docs/integrations/` | Catalogo de roles, guias operativas y compatibilidad por IDE. | Referencias para personas y agentes; no son sustitutos del contrato operativo. |
| `docs/bitacora/` y `docs/research/` | Diario de decisiones/aprendizajes y baselines verificados con fecha. | `/bitacora` conserva memoria; `/sdd-refresh` revalida supuestos del ecosistema. |
| `scripts/` | Instalador, checks, sincronizacion de skills y CLI `sdd-project`. | Automatizan operaciones deterministas; no deciden requisitos ni arquitectura. |

Flujo nuclear de una funcionalidad: `producto aprobado -> spec -> aclaraciones -> diseno (si UI) -> plan -> tareas -> implementacion TDD -> verificacion -> entrega`. Los artefactos de una fase son la entrada verificable de la siguiente; un hallazgo devuelve el trabajo a la fase que puede resolverlo.

## 4. Matriz de agentes

Un agente que figura como "devuelve al invocador" no decide por si mismo la fase siguiente. `Ninguna` en delegacion es una restriccion, no una omision. Las skills se describen en la seccion 5.

| Agente | Descripcion y funcion principal | Delega a | Handoff a | Skills principales |
|---|---|---|---|---|
| `orchestrator` | Router de peticiones y fases; no implementa. | Agentes de fase: `spec-analyst`, `ux-designer`, `architect`, `planner`, `implementer`, `code-reviewer`, `release-manager`, `research-analyst`. | Agente de fase adecuado. | `/sdd-start`, `/sdd-intake` |
| `spec-analyst` | Convierte producto/idea en baseline, spec EARS y aclaraciones. | Ninguna. | `orchestrator` en intake; `ux-designer` con UI; `planner` sin UI. | `/sdd-intake`, `/sdd-specify`, `/sdd-clarify` |
| `ux-designer` | Define flujo, estados, diseno y accesibilidad. | Ninguna. | `orchestrator` en intake; `planner` tras diseno; `spec-analyst` ante requisito nuevo. | `/sdd-design`, `/design-sync` |
| `architect` | Decide arquitectura y registra decisiones duraderas. | Ninguna. | `spec-analyst` o `planner`. | `/sdd-init`, `/adr`, `/onboard`, `/sdd-refresh` |
| `planner` | Traduce una spec aprobada a plan, contratos, modelo y tareas. | `api-designer`, `database-expert`, `ux-designer`, `research-analyst`, `architect`. | `implementer`; `architect` si viola la constitucion. | `/sdd-plan`, `/sdd-tasks` |
| `implementer` | Ejecuta una tarea a la vez con TDD y actualiza su evidencia. | `backend-expert`, `frontend-expert`, `database-expert`, `test-engineer`, `refactor-specialist`, `api-designer`. | `code-reviewer`; `planner` si el plan es incorrecto. | `/sdd-implement`, `/tdd` |
| `code-reviewer` | Revisa correccion, trazabilidad, diseno y tests sin escribir. | Ninguna. | `security-auditor` o `implementer` si hay hallazgos. | `/sdd-verify` |
| `release-manager` | Prepara release, PR, changelog y reversibilidad; no publica sin permiso. | Ninguna. | Persona responsable de aprobar entrega. | `/sdd-ship` |
| `research-analyst` | Investiga estado actual, triage y tecnologia; solo lectura. | Ninguna. | Quien lo invoco. | `/onboard`, `/sdd-refresh` |
| `api-designer` | Diseña contratos REST, GraphQL o eventos antes de cruzar fronteras. | Ninguna. | Quien lo invoco. | Sin skill canonica exclusiva; trabaja dentro de `/sdd-plan` o `/sdd-implement`. |
| `backend-expert` | Implementa dominio, casos de uso, integraciones y resiliencia. | Ninguna. | Quien lo invoco. | `/middle` |
| `frontend-expert` | Implementa componentes, estado, formularios, a11y y rendimiento de UI. | Ninguna. | Quien lo invoco. | `/front`, `/design-sync` |
| `database-expert` | Implementa modelo, migraciones, indices, RLS y consultas. | Ninguna. | Quien lo invoco. | `/bbdd` |
| `test-engineer` | Define estrategia y ayuda con pruebas complejas o fragiles. | Ninguna. | Quien lo invoco. | `/tdd` |
| `security-auditor` | Audita OWASP/ASVS y evidencia de seguridad; solo lectura. | Ninguna. | `implementer` ante hallazgos; `release-manager` si es apto. | `/security-scan` |
| `refactor-specialist` | Audita SOLID, DRY, KISS, YAGNI y patrones durante refactor. | Ninguna. | Quien lo invoco. | Sin skill exclusiva; etapa refactor de `/tdd` y `/sdd-implement`. |
| `performance-optimizer` | Diagnostica latencia, memoria, bundle y consultas con medicion previa. | Ninguna. | Quien lo invoco. | Sin skill exclusiva. |
| `devops-expert` | Gestiona CI/CD, infraestructura, observabilidad y respuesta a incidentes. | Ninguna. | Quien lo invoco. | `/observability`, `/respond-incident` |
| `docs-writer` | Mantiene guias y documentacion oficial sin cambiar comportamiento. | Ninguna. | Quien lo invoco. | `/docs-sync` |
| `bitacora-keeper` | Registra decisiones, deuda, incidentes y aprendizajes. | Ninguna. | Quien lo invoco. | `/bitacora` |

## 5. Catalogo de skills y automatizacion determinista

### Skills propias

| Skill | Definicion | Agente responsable o usuarios habituales |
|---|---|---|
| `/sdd-start` | Diagnostica estado y ruta de entrada. | `orchestrator` |
| `/sdd-intake` | Normaliza PRD, fuentes, casos y diseno opcional antes de arquitectura/specs. | `orchestrator` con `spec-analyst` y `ux-designer` |
| `/sdd-init` | Inicializa un greenfield aprobado, constitucion y ADR-0001. | `architect` |
| `/onboard` | Reconstruye y documenta la arquitectura real de un repo existente. | `research-analyst` -> `architect` |
| `/sdd-specify` | Redacta requisitos EARS y criterios verificables sin tecnologia. | `spec-analyst` |
| `/sdd-clarify` | Cierra ambiguedades de la spec con decisiones humanas. | `spec-analyst` |
| `/sdd-design` | Define experiencia, estados, componentes y accesibilidad. | `ux-designer` |
| `/sdd-plan` | Decide el como tecnico, datos, riesgos y contratos. | `planner` |
| `/sdd-tasks` | Divide el plan en tareas atomicas con test y trazabilidad. | `planner` |
| `/sdd-implement` | Ejecuta tareas con TDD estricto y especialistas de terreno. | `implementer` |
| `/tdd` | Ejecuta un ciclo rojo-verde-refactor para un comportamiento puntual. | `implementer`, `test-engineer`, `refactor-specialist` |
| `/middle` | Implementa backend, dominio, integraciones y colas. | `backend-expert` |
| `/front` | Implementa UI, estado, formularios, accesibilidad y rendimiento. | `frontend-expert` |
| `/bbdd` | Implementa esquema, migraciones reversibles, indices y RLS. | `database-expert` |
| `/sdd-verify` | Ejecuta gates de calidad, revision, tests y seguridad. | `code-reviewer`, consulta especialistas |
| `/security-scan` | Audita contra OWASP Top 10:2025 y ASVS 5.0.0. | `security-auditor` |
| `/sdd-ship` | Prepara entrega, changelog, PR y plan de reversion. | `release-manager` |
| `/docs-sync` | Sincroniza o audita documentacion sin cambiar comportamiento. | `docs-writer` |
| `/bitacora` | Registra o consulta decisiones, deuda e incidentes. | `bitacora-keeper` |
| `/design-sync` | Contrasta tokens y componentes Figma/Stitch con el codigo. | `ux-designer` y `frontend-expert` |
| `/observability` | Instrumenta errores, salud, eventos, alertas y playbooks. | `devops-expert` |
| `/respond-incident` | Contiene, recupera, comunica y aprende de un incidente activo. | `devops-expert`, con auditoria de seguridad si aplica |
| `/sdd-refresh` | Revalida estandares, formatos de IDE, seguridad y MCP. | `research-analyst` -> `architect` |
| `/sdd-status` | Muestra fase actual, specs abiertas y siguiente paso. | Cualquier usuario; solo lectura |
| `/adr` | Crea un ADR MADR para una decision estructural. | `architect` |
| `/skill-creator` | Crea, evalua y mejora skills de forma iterativa. | Mantenedor del ecosistema |

### Scripts deterministas

| Comando | Para que sirve |
|---|---|
| `node scripts/check-sdd.mjs [--strict] [--json] [--spec NNN]` | Valida estructura, coherencia y contratos SDD. |
| `node scripts/test-hooks.mjs` | Prueba guardas, hooks y sus contratos. |
| `node scripts/test-install.mjs` | Prueba el instalador; aplicable al repositorio plantilla. |
| `node scripts/skills-sync.mjs --check` | Comprueba sincronizacion y estado de skills externas declaradas. |
| `node scripts/sdd-project.mjs detect --json` | Detecta comandos reales del proyecto; no escribe ni aprueba. |
| `node scripts/sdd-project.mjs configure --accept-detected` | Incorpora explicitamente comandos detectados a `.sdd/checks.json`. |
| `node scripts/sdd-project.mjs status --json [--spec NNN]` | Da un snapshot de producto, arquitectura, specs, tareas, Git y siguiente paso. |
| `node scripts/sdd-project.mjs product-status/docs-status --json` | Consulta el estado durable de los baselines de producto/documentacion. |
| `node scripts/sdd-project.mjs approve-product/approve-docs --approved-by "persona" --json` | Registra una aprobacion humana explicita. |
| `node scripts/sdd-project.mjs scaffold --spec NNN --phase design|plan|tasks|verify` | Crea artefactos canonicos sin sobrescribir ni decidir contenido. |
| `node scripts/sdd-project.mjs trace-status --spec NNN --json` | Detecta trazabilidad ausente entre IDs de la spec. |
| `node scripts/sdd-project.mjs new-spec` y `new-adr` | Numera y crea el esqueleto de spec o ADR. |
| `node scripts/sdd-project.mjs run --fast|--slow|--ci` | Ejecuta los gates configurados; rapido antes de commit y lento antes de push. |
| `node scripts/sdd-project.mjs debt --json` | Mide marcadores TODO/FIXME/HACK/XXX sin convertir ausencia de medicion en cero. |
| `node scripts/sdd-project.mjs generate <id> --dry-run` | Ejecuta un generador previamente aprobado y confinado. |
| `node scripts/sdd-project.mjs skills-export --json` | Exporta/inspecciona skills para su uso portable. |

## 6. Workflows principales y prompts reutilizables

Los prompts se pueden dirigir al agente indicado en el selector del host. Cuando el estado sea incierto, `orchestrator` o `/sdd-start` es la entrada correcta; cuando la fase es conocida, entrar directamente reduce una delegacion innecesaria.

| Objetivo | Flujo recomendado | Agente de entrada | Prompt sugerido |
|---|---|---|---|
| Adoptar sistema en un proyecto existente | Instalar -> `/onboard` -> `/sdd-intake` -> aprobacion -> `/docs-sync bootstrap`. | `orchestrator` | `@orchestrator Hemos instalado el sistema en este repositorio existente. Ejecuta el diagnostico brownfield: documenta la arquitectura real sin refactorizar, normaliza el baseline de producto y deja preparado el baseline documental. Indica cada gate humano.` |
| Generar o reconstruir documentacion | `/docs-sync bootstrap` si no hay baseline; `/docs-sync update` para deriva concreta. | `docs-writer` | `@docs-writer /docs-sync bootstrap. Reconstruye un inventario verificable de la documentacion actual sin cambiar codigo, contratos ni arquitectura. Declara fuentes, propietarios, controles no ejecutados y la aprobacion humana pendiente.` |
| Actualizar `AGENTS.md` | Clasificar impacto -> decision/ADR si cambia gobernanza estructural -> actualizar bloque gestionado y documentacion relacionada. | `orchestrator`, despues `architect` cuando aplique | `@orchestrator Necesito actualizar AGENTS.md para reflejar [cambio]. Clasifica si es una correccion editorial o una regla de gobernanza/arquitectura. No modifiques nada hasta indicar propietario, artefactos afectados, necesidad de ADR y gate humano.` |
| Crear una funcionalidad nueva | `/sdd-specify` -> `/sdd-clarify` -> `/sdd-design` si UI -> `/sdd-plan` -> `/sdd-tasks` -> `/sdd-implement` -> `/sdd-verify` -> `/sdd-ship`. | `spec-analyst` o `orchestrator` | `@spec-analyst /sdd-specify. Quiero incorporar [funcionalidad]. Usa el baseline de producto y crea una spec EARS con criterios de aceptacion, impacto de seguridad, usabilidad y documentacion; no tomes decisiones tecnicas.` |
| Implementar una tarea aprobada | Seleccionar tarea -> RED -> GREEN -> REFACTOR -> evidencia. | `implementer` | `@implementer /sdd-implement para la spec NNN. Ejecuta solo la primera tarea pendiente, muestra el test rojo real, implementa lo minimo, refactoriza con la suite verde y devuelve el handoff.` |
| Generar o mejorar tests | Comprobar que hay comportamiento/spec -> `/tdd` o tarea de test dentro de implementacion. | `implementer` con `test-engineer` | `@implementer /tdd. Para el comportamiento [condicion -> resultado], crea primero un test observable que falle, muestra su salida y aplica el cambio minimo. Pide a test-engineer apoyo si necesita dobles, integracion o E2E.` |
| Ver errores de calidad | Snapshot -> gates configurados -> revision de hallazgos -> volver a fase causante. | `code-reviewer` | `@code-reviewer /sdd-verify de la spec NNN. Ejecuta los gates configurados y entrega hallazgos por severidad con evidencia. No modifiques codigo; indica exactamente a que fase/agente debe volver cada hallazgo.` |
| Revisar seguridad | `/security-scan plan` antes de aprobar plan o `verify` antes de release. | `security-auditor` | `@security-auditor /security-scan verify para la spec NNN. Audita el diff, configuracion, tests y evidencias frente a OWASP Top 10:2025 y ASVS 5.0.0. Devuelve solo hallazgos trazables y el handoff.` |
| Resolver un bug | Triage -> test de regresion -> cambio controlado -> verificacion. | `research-analyst`, despues `implementer` | `@research-analyst Investiga el fallo [sintoma]. Delimita reproduccion, impacto y causa probable sin editar. Si es un defecto puro, prepara handoff a implementer para un test de regresion; si altera comportamiento, indica la spec necesaria.` |
| Incidente en produccion | Contener -> recuperar -> comunicar -> analisis y aprendizaje. | `devops-expert` | `@devops-expert /respond-incident. Usuarios estan afectados por [impacto]. Prioriza contencion y recuperacion, preserva evidencia y activa security-auditor si existe sospecha de compromiso. No despliegues ni cambies produccion sin autorizacion explicita.` |
| Medir rendimiento | Medicion previa -> diagnostico -> plan/tarea -> implementacion y medicion posterior. | `performance-optimizer` | `@performance-optimizer Analiza [latencia/memoria/bundle/consulta] con la medicion actual [dato]. No propongas optimizaciones sin baseline, causa probable y criterio cuantificable de exito.` |

## 7. Consideraciones para la entrega de TFM

1. **Afirmacion defendible.** El proyecto aporta un marco de orquestacion portable y verificable, no inteligencia autonoma ilimitada. La aportacion tecnica es la combinacion de contratos durables, roles aislados, trazabilidad, gates y automatizacion determinista.
2. **Reproducibilidad.** En una demostracion, usar un tag inmutable, `--dry-run`, `check-sdd`, `status --json` y una spec de ejemplo permite separar hechos ejecutados de narrativa.
3. **Trazabilidad evaluable.** La cadena `objetivo -> requisito -> caso de uso -> criterio -> tarea -> test -> evidencia` permite evaluar cobertura y localizar el origen de un cambio.
4. **Seguridad y privacidad.** El repositorio no debe incluir `.env`, tokens, credenciales ni configuracion personal. Las skills externas se tratan como dependencias ejecutables: se declaran, auditan, fijan a una version y no se instalan automaticamente.
5. **Limitaciones.** La calidad de la salida sigue dependiendo de requisitos, decisiones humanas, configuracion real de checks y capacidades del host. Algunos mecanismos de hooks/aislamiento tienen diferente soporte segun el IDE; el CI es la capa comun de control.
6. **Evidencia recomendada para anexos.** Incluir captura del `--dry-run`, estado de producto/documentacion, una spec completa, una ejecucion RED/GREEN, informe de `/sdd-verify`, informe de seguridad y el diagrama Excalidraw editable. Esto permite defender tanto el diseno como el funcionamiento observable.

## Referencias internas

- `AGENTS.md`
- `docs/sdd/OPERATING-MODEL.md`
- `docs/guides/INSTALACION.md`
- `docs/guides/COMO-TRABAJAR-CON-LOS-AGENTES.md`
- `docs/agents/CATALOG.md`
- `docs/agents/SKILLS-EXTERNAS.md`
- `.agents/skills/*/SKILL.md`
- `scripts/sdd-project.mjs`
