# Changelog

Formato [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) · versionado [SemVer](https://semver.org/lang/es/).

> Escrito para **usuarios**, no para desarrolladores. "Refactorizado el servicio X" no va aquí;
> va en el historial de git. Lo mantiene `release-manager` en `/sdd-ship`.

## [No publicado]

### Added
- **La CLI responde antes de instalar nada.** `product-status` y `docs-status` ya no fallan cuando
  todavía no existe `.sdd/installed.json`: devuelven el estado de plantilla. Consultar el estado es
  lo primero que hace cualquiera, y no puede exigir que el estado ya exista.
- **Ayuda de la CLI.** `--help`, `-h` o `help` imprimen la lista completa de subcomandos agrupados
  por tarea. Antes había que leer el código fuente para descubrirlos.
- **Errores en JSON cuando se pidió JSON.** Si se invoca con `--json` y algo falla, el error sale
  por `stderr` como `{ "schemaVersion": 1, "ok": false, "command": "...", "error": "..." }`.
- **Gate `lint` propio.** `scripts/check-syntax.mjs` comprueba sintaxis y formato de los `.mjs`
  versionados, sin dependencias, y trae su propio autotest con `--selftest`.
- **El reparto de territorios se verifica de verdad.** `check-sdd` comprueba que no nombra agentes
  inexistentes, que sus rutas existen, que dos territorios no se pisan y que todo agente sin
  territorio tiene escrito por qué no lo necesita. Antes era una convención que nadie contrastaba.
- **Traza corroborada, funcione o no el IDE.** `node scripts/check-sdd.mjs --trace-audit --base <ref>`
  contrasta los trailers `Spec:`, `Task:` y `Agent:` de cada commit contra las tareas reales, el
  catálogo de agentes y el reparto de territorios. Solo dos de los seis entornos soportados pueden
  observar la delegación desde dentro; esto cubre a los otros cuatro usando git, que está en todos.
  Escribir fuera del propio territorio exige un `Trace-exception:` con un motivo material.
- **Autoría legible al cerrar una tarea.** El registro de ejecución añade una línea por sesión,
  agente y spec, en vez de obligar a reconstruir quién trabajó a partir de decenas de arranques y
  paradas.
- **Quién tocó cada fichero, en cinco entornos de seis.** La autoría de fichero la emite la guarda
  de escritura, que existe casi en todas partes, en vez del ciclo de vida del subagente, que solo
  existe en dos. La pregunta que se hace al revisar un cambio deja de depender del IDE.
- **Gate `coverage` sin instalar nada.** `scripts/check-coverage.mjs` mide cobertura de línea con el
  recolector que V8 ya trae dentro de Node. El umbral vive en `.sdd/coverage.json`, se fijó después
  de medir y no al revés, y bajarlo es una decisión humana que deja rastro en el fichero.
- **Gate `a11y` sobre el sitio publicado.** `scripts/check-a11y.mjs` audita idioma, título, texto
  alternativo, referencia principal, jerarquía de encabezados y nombre accesible. Comprueba seis
  cosas verificables sin navegador y dice en su cabecera cuáles no puede comprobar.
- **Gate `smells` con trinquete.** `scripts/check-smells.mjs` vigila tamaño de fichero y de función
  contra un techo que solo puede apretarse. No aproxima complejidad ciclomática: un número que se
  baja reordenando código sin mejorarlo acaba gestionándose en vez de usarse.
- **Cuando la cobertura falla, dice qué falta.** El fallo nombra el porcentaje medido, el umbral, los
  puntos que faltan y los cinco ficheros peor cubiertos, en vez de un número rojo sin destino.

### Changed
- **El repositorio ejecuta nueve gates en vez de dos.** `sdd`, `lint`, `test`, `build` y `smells` son
  rápidos y caben antes de cada commit; `security`, `coverage`, `a11y` y `e2e` quedan para antes del
  push. El peaje rápido sigue midiéndose en segundos.
- **Cada gate ausente declara de qué tipo es su ausencia.** Las cinco que quedan se clasifican en
  `no-aplica`, `pendiente` o `se-ejecuta-en-otro-sitio`, y esta última tiene que nombrar el workflow
  donde corre. Un motivo caducado se parece demasiado a una decisión tomada, así que ahora una
  comprobación contrasta las negaciones contra los ficheros que las refutarían.
- **Baseline de producto aprobado.** El propio ecosistema pasa por fin su gate 1: `docs/product/`
  deja de ser plantilla y recoge objetivos, requisitos, casos de uso, mapa de funcionalidades y
  fuentes reales. La aprobación no se aplica hacia atrás: las specs cerradas se quedan como están.
- **`docs/agents/MAPEO-10-AGENTES.md` pasa a llamarse `ORIGEN-Y-EVOLUCION.md`.** El nombre contaba
  agentes que ya eran veinte; lo que el documento conserva —de dónde viene el diseño— no caduca.
- **Este repositorio aplica el reparto en modo restrictivo (`deny`).** Una instalación nueva sigue
  arrancando en `audit`, que solo observa: bloquear a alguien el primer día, antes de que entienda
  el reparto, es la mejor forma de que acabe desactivando el sistema entero.

### Fixed
- **Los casos de prueba del reparto de territorios no se ejecutaban.** Estaban tras una condición
  que consultaba una clave que el fichero de configuración no tiene, así que el bloque entero se
  saltaba en silencio y la suite salía en verde sin haber probado nada. La regla vive ahora en una
  función pura con su tabla de casos.
- **`docs/TFM/` deja de instalarse en los proyectos destino.** Es la memoria de esta plantilla
  concreta, no un artefacto reutilizable.
- **El comando de instalación de las pruebas se deriva de `package.json`.** Antes llevaba la versión
  escrita a mano y cada release rompía la comprobación.

## [0.7.0] — 2026-08-16

### Added
- **Snapshots deterministas para agentes.** `status --json`, `trace-status` y `check-sdd --json`
  exponen estado, fases, tareas, trazabilidad y gates sin obligar al modelo a reconstruirlos leyendo
  todo el repositorio.
- **Scaffolding conservador por fase.** `scaffold` instancia las plantillas canónicas de diseño,
  plan, tareas y evidencia, admite `--dry-run` y nunca sobrescribe contenido ni aprueba decisiones.
- **Generadores opt-in y neutrales al stack.** `.sdd/generators.json` nace vacío; cada proyecto puede
  registrar programas ya aprobados con argv separado, inputs/outputs declarados y ejecución sin shell.
- **Benchmark reproducible de skills.** Cinco casos emparejados conservan el 100 % de las
  expectativas y documentan el proxy usado cuando el host no expone tokens reales.

### Changed
- **Menos contexto mecánico en las skills.** Estado, ADR, specify, design, plan, tasks, verify y
  documentación consumen los nuevos comandos; checklists extensas de frontend, diseño, plan y
  verificación se cargan desde `references/` únicamente cuando afectan a la tarea.

### Fixed
- **Los metadatos tras un estado ya no rompen el conteo.** `hecho · evidencia` se interpreta como
  tarea terminada en vez de estado desconocido.
- **Los globs JSONC ya no se confunden con comentarios.** Rutas como las usadas por contratos
  documentales se preservan al validar o fusionar configuración.

## [0.6.0] — 2026-08-13

### Added
- **La usabilidad es exigible, no una recomendación.** Una spec declara `Impacto de usabilidad` y,
  cuando aplica, cada control `UX-<AREA>-NNN` —accesibilidad, formularios, microcopy y velocidad
  percibida— enlaza decisión, tarea, test y evidencia. La entrega se bloquea con hallazgos
  CRÍTICO/ALTO o con controles sin ejecutar, igual que ya ocurría con seguridad.
- **Checklist de accesibilidad WCAG 2.2 AA** en `docs/design/A11Y-CHECKLIST.md`: los cuatro
  principios, verificación por pantalla, navegación por teclado y qué se comprueba a mano porque
  ningún analizador lo ve. Cierra un hueco real: el circuito ya pedía un `a11y-checklist.md` por
  proyecto que nunca tuvo plantilla de la que salir.
- **Reglas de usabilidad para Cursor y Copilot.** Al editar una pantalla, un formulario o una hoja
  de estilos ahora llega la doctrina; antes solo llegaban las de arquitectura, TDD y seguridad.
- **Informe de usabilidad parseable** en `docs/design/reports/`, con marcador
  `sdd-usability-report:v1`, estándares, alcance, conteos y veredicto.
- **Documentación viva con `/docs-sync`.** Permite crear el baseline documental de un proyecto,
  actualizar la documentación asociada a una spec, atender cambios editoriales sin ejecutar todo
  el circuito SDD/TDD y auditar divergencias sin escribir.
- **Contrato documental portable en `.sdd/docs.json`.** Cada proyecto declara sus fuentes,
  artefactos, propietario y gate opcional sin instalar herramientas que el stack no utiliza.
- **Trazabilidad rectificable sin reescritura.** `trace-correct` conserva los eventos originales,
  añade la atribución correcta y deja constancia legible e idempotente en la bitácora.

### Changed
- **`/sdd-verify` verifica la usabilidad.** Antes no la mencionaba en absoluto, igual que
  `/sdd-clarify`, `/sdd-tasks` y `/sdd-ship`. Quien audita es `code-reviewer`, en solo lectura:
  `ux-designer` conserva su escritura en `/sdd-design` porque nadie audita su propio diseño.
- **Las tablas de accesibilidad y usabilidad del diseño dejan de ser decorativas.** Existían desde
  siempre y nada las validaba, así que podían entregarse vacías sin coste.
- **El gate `a11y` se exige solo cuando hay interfaz**, y sin herramienta configurada se declara
  como control no ejecutado con riesgo y dueño. La plantilla no presupone ningún stack.
- **La instalación sin `#ref` sigue la última `main`; el tag permanece reproducible.** La guía
  distingue explícitamente la opción móvil de `#v0.6.0`, estable e inmutable.
- **Los hooks ya no adivinan una spec activa.** Solo atribuyen cuando existe exactamente una spec
  con tareas `pendiente` o `en curso`; cero o varias candidatas quedan auditadas con el motivo.
- **La documentación aplicable forma parte de la misma entrega que el cambio.** Specs, tareas,
  tests y evidencias enlazan `DOC-ID`; una corrección exclusivamente documental conserva el flujo
  ligero.

### Fixed
- **Un resultado verde con emoji se leía como rojo.** La comprobación de evidencia comparaba
  emojis sin el indicador `u`, y el sustituto alto de 🔴 coincide con el de 🟢. Como las plantillas
  usan 🟢, cualquier proyecto que siguiera la convención veía bloqueada su entrega sin motivo.
- **Los estados Markdown en negrita ya no se interpretan como tareas abiertas.** El parser trabaja
  por bloques `T-*`, reconoce estados plain/bold y evita atribuir sesiones nuevas a specs cerradas.

### Portability
- **El circuito completo viaja con el repositorio.** Los 20 agentes y 26 skills quedan disponibles
  de forma coherente en seis superficies: Claude, VS Code/GitHub, Cursor, Codex,
  Gemini/Antigravity y el formato compartido de Agent Skills.
- **Greenfield y brownfield conservan su contexto.** Los proyectos nuevos nacen en estado
  `bootstrap`; los existentes se actualizan como `legacy-pending` y mantienen íntegros sus README,
  guías, contratos y decisiones hasta aprobar su propio baseline.
- **Los gates documentales comparan contra el SHA base del cambio.** CI y pre-push pueden detectar
  fuentes modificadas sin su artefacto, documentación borrada, enlaces rotos, rutas inseguras y
  generadores requeridos no ejecutados, incluso cuando código y documentación llegan en commits
  distintos del mismo PR.
- **El instalador deja el control de Git en manos del proyecto.** Instala hooks y configuración
  versionables, muestra los comandos manuales recomendados y no ejecuta `git add`, commit, push,
  `core.hooksPath`, Husky ni cambios de permisos.

### Security
- Las rutas del contrato documental se validan para impedir traversal, destinos absolutos y
  enlaces fuera del repositorio; los artefactos oficiales también se comprueban para evitar
  secretos, placeholders y referencias rotas antes de la entrega.
- El instalador rechaza rutas hostiles de `.sdd/installed.json` y cualquier symlink o junction
  dentro del destino antes de leer, escribir o retirar artefactos gestionados.

## [0.5.0] — 2026-08-11

### Security
- **OWASP Top 10:2025 y ASVS 5.0.0 ya forman parte verificable del circuito**, desde la
  clasificación de cada spec hasta tarea, caso de abuso, evidencia e informe final.
- **Contrato portable de JWT, sesiones y CSRF.** JWT no se activa ni se impone: si el proyecto lo
  elige, debe fijar algoritmo, validar claims y tipos, rotar/revocar credenciales, detectar reuse
  de refresh tokens y probar los casos adversos. `SameSite` cuenta como defensa en profundidad,
  no como sustituto universal de CSRF.
- **Un informe vacío ya no puede fingir un GO.** El gate valida un bloque JSON versionado,
  estándar, nivel, alcance, controles, conteos y veredicto. CRÍTICO/ALTO bloquea; MEDIO requiere
  aceptación con responsable, decisión y fecha de revisión.
- **El auditor sigue siendo de solo lectura.** Devuelve un HANDOFF estructurado y `docs-writer`
  materializa literalmente el informe; ningún adaptador amplía sus permisos para que pueda
  corregir o certificarse a sí mismo.
- **CI reproducible y honesto.** Las actions instaladas están fijadas por SHA, no conservan
  credenciales y no presentan una auditoría npm/pnpm/yarn como superada si el proyecto no ha
  configurado un gate real.

- **Escaneo de secretos en CI, que era una promesa sin cumplir.** La Definition of Done decía que
  este control bloqueaba el merge; en realidad solo existía como hook local, así que no protegía
  nada en hosts sin hooks ni en un push desde la web de GitHub. Ahora se ejecuta en CI con los
  mismos patrones que el hook, compartidos desde un solo sitio para que no puedan divergir.
- **Auditoría de dependencias en CI**, cuando el proyecto acepta el comando real detectado desde
  su lockfile. Sin gate configurado queda visible como no ejecutada; nunca como verde.

### Added
- **Los gates se ejecutan antes de commitear, sin que tengas que acordarte.** En proyectos Node el
  instalador monta Husky; en el resto configura los hooks de git. Ambos llaman a los mismos
  comandos, así que si cambias de runner solo tocas `.sdd/checks.json`.
- **Y en los IDEs donde no hay hooks, los ejecuta el agente.** Es la diferencia entre "los tests
  pasan" y "los tests pasan y lo he comprobado sobre este código". Cada ejecución deja constancia
  de sobre qué estado del proyecto se hizo, y si algo cambió después, se avisa antes de commitear.
- **Las skills funcionan en Lovable y equivalentes.** Sus skills nativas usan el mismo formato
  estándar, así que las 25 se importan tal cual. `node scripts/sdd-project.mjs skills-export`
  emite las URLs listas y el hash de cada una, para saber si la copia del workspace se quedó
  atrás.
- **CHANGELOG, bitácora e informes exigidos por máquina.** `--strict` reclama el CHANGELOG cuando
  el cambio toca código, una entrada de bitácora cuando toca el contrato de agentes o skills, y
  los informes de seguridad y calidad de la spec que se entrega. Antes dependía de acordarse.

### Fixed
- **Nueve skills enlazaban con rutas que se rompían al importarlas fuera del repositorio.** Ahora
  referencian desde la raíz, y a otras skills por su comando. Un gate impide que vuelva a pasar.
- **Los hooks de git no eran ejecutables**, así que en Linux y macOS no se ejecutaban — en algunas
  versiones, en silencio. En Windows no se notaba. Corregido, y con una comprobación que lo impide
  a futuro. Si hiciera falta cambiar un permiso, el agente te lo dice y te da el comando: no lo
  hace por su cuenta.

### Added
- **`/observability`, la mitad que faltaba del ciclo.** El circuito terminaba en el despliegue.
  Ahora hay un procedimiento para enterarte de que algo se rompió antes que el usuario: clasificar
  errores por tipo, ver la salud de cada versión, dejar rastro de lo que el usuario intentaba
  hacer, y definir alertas con umbral y playbook. Sin datos personales, y probando que el aviso
  llega de verdad.
- **Métricas y deuda con número.** `docs/quality/METRICS.md` fija tres niveles de métrica y rechaza
  las que no llevan a una decisión. `node scripts/sdd-project.mjs debt` cuenta los marcadores de
  deuda en ficheros versionados, para no discutir con adjetivos.
- **Checklist de usabilidad** (`docs/design/USABILITY-CHECKLIST.md`): heurísticas, formularios,
  mensajes de error, microcopy y velocidad percibida. La accesibilidad seguía siendo obligatoria;
  esto es lo que además hace que se entienda.
- **Gates locales opcionales** en `.sdd/githooks/`: rápidos antes del commit, lentos antes del
  push. Se activan con una línea y no se tocan solos.
- **Resumen ejecutivo en la entrega**, con la regla de que toda cifra está verificada.

### Changed
- **La cobertura se mide por riesgo, no por porcentaje global.** El código que maneja dinero, datos
  críticos o permisos se verifica al 100 %; lo que ve el usuario, al 80 %; los tipos y constantes
  quedan fuera. **Y lo que nadie clasifique se exige al 100 %**: un número único sobre todo el
  repositorio dejaba pasar en verde justo lo que hunde un producto.
- `.sdd/checks.json` reconoce trece gates configurables —cobertura, E2E, olores, accesibilidad,
  documentación…— y cada uno declara si es rápido o lento. Sigue naciendo sin ningún comando: la
  plantilla no presupone tu stack.
- `sdd-project detect` propone esos gates solo cuando encuentra evidencia real en el repositorio.
- CI separa gates rápidos y lentos, y sube los informes **también cuando falla**, que es cuando
  hacen falta.
- 25 skills (antes 24). Los 20 agentes no cambian.

## [0.4.0] — 2026-08-03

### Added
- **`/sdd-intake` universal antes de arquitectura.** El `orchestrator` acepta PRD pegado, ruta,
  carpeta, URL o documento del repo y un diseño opcional de Stitch/Figma/boceto. Normaliza
  `PRD.md`, `USE-CASES.md`, `FEATURE-MAP.md` y `SOURCES.md` sin generar código.
- **Gate durable de producto.** `sdd-project product-status` y `approve-product` validan IDs,
  cadenas completas, discrepancias, fuentes inaccesibles, URLs públicas saneadas y hashes. Greenfield nace
  `bootstrap`; brownfield o actualizaciones previas, `legacy-pending` no bloqueante.
- **Trazabilidad integral.** Las plantillas enlazan
  `OBJ → PRD-RF → UC → RF → CA → tarea → test → evidencia`, con persona, fecha y alcance en cada
  gate humano.

### Changed
- Los perfiles `orchestrator`, `spec-analyst` y `ux-designer`, sus adaptadores y los workflows de
  los cinco hosts reconocen intake, delegación con retorno y handoff guiado desde documentos.
- El catálogo pasa a 24 skills manteniendo 20 agentes y una sola entrada visible por skill; no se
  añaden prompts de Copilot ni commands de Cursor.
- `/sdd-init` exige producto aprobado antes de decidir arquitectura. `/onboard` preserva todo el
  contexto brownfield y recomienda intake sin reescribir su historia.

### Security
- PRD, diseño y fuentes externas se tratan como datos no confiables. La instalación no activa MCP
  ni copia credenciales; el intake niega destinos no públicos y persiste URLs sin query ni fragmento.

## [0.3.1] — 2026-08-03

### Fixed
- **Una sola entrada por agente y skill en VS Code y Cursor.** Se retiraron 15 prompts de Copilot
  y 6 commands de Cursor que repetían las Agent Skills canónicas. VS Code conserva únicamente
  `.github/agents` para perfiles y `.agents/skills` para comandos en workspaces confiables.
- **Actualización segura desde v0.3.0.** `sdd update` elimina superficies retiradas solo cuando
  `installed.json` demuestra que siguen intactas; cualquier personalización se conserva, se avisa
  y deja de estar gestionada.
- **Empaquetado npm explícito.** Una allowlist granular y `.npmignore` evitan el fallback de
  `.gitignore`, el estado local y la historia de mantenimiento innecesaria.

### Changed
- La salida del instalador recuerda confiar en el workspace y recargar VS Code para aplicar la
  selección única de ubicaciones.

## [0.3.0] — 2026-08-02

### Added
- **23 skills conformes al estándar Agent Skills.** La fuente canónica permanece en
  `.agents/skills/`; los metadatos específicos de cada host viven solo en sus adaptadores.
  Se distribuye la `skill-creator` oficial de Anthropic completa, con licencia Apache-2.0,
  commit fijado y auditoría reproducible, además de un adaptador fino para Claude.
- **Instalación universal greenfield/brownfield con estado virgen verificable.** `init` acepta un
  destino explícito y `--mode auto|greenfield|brownfield`; README, changelog, constitución,
  dirección visual, threat model, bitácora, auditoría, specs, ADR e informes nacen sin historia
  de la plantilla. `update` nunca reinicia esas semillas.
- **Skills canónicas en `.agents/skills/` y hooks compartidos en `.sdd/hooks/`.** Claude conserva
  adaptadores finos y cada host tiene su contrato: Claude, Cursor, Copilot/VS Code, Antigravity y
  Codex. `test-hooks` valida las cinco superficies.
- **MCP opt-in y selectivo** mediante `--with-mcp <lista>`, con versiones ejecutables fijadas y
  fusión de `.mcp.json`, `.vscode/mcp.json` y el bloque MCP de Codex.
- **`scripts/sdd-project.mjs`**: inventario, detección de stack sin escritura, aprobación explícita
  de checks, ejecución de gates y scaffolds deterministas `new-spec` / `new-adr`.
- **Conflictos centralizados** en `.sdd/conflicts/<version>/` y propiedad/hash por fichero en
  `.sdd/installed.json`.
- **Los 20 agentes ya son nativos en Codex por proyecto** mediante `.codex/agents/*.toml`.
  Son adaptadores finos hacia `.claude/agents/`, por lo que no duplican la definición canónica;
  los cuatro auditores usan sandbox de solo lectura. `sdd init` los instala y `check-sdd` falla si
  falta alguno o deriva su esquema. Las superficies existentes de los demás IDE no cambian.
- **Instalador para proyectos que ya existen**, en dos capas:
  - `npx github:jechamo/Estructura_inicial_claude global` — agentes y skills a nivel de usuario,
    disponibles al abrir cualquier proyecto. Nativo en Claude Code y Cursor; en VS Code el
    instalador añade la clave que hace falta. Codex y Antigravity quedan fuera de esta capa global.
  - `... init` por proyecto, más `check` y `update`. Con `--dry-run` para verlo en seco.
  - **Nunca pisa un fichero tuyo**: si existe y difiere, conserva el original y deja la propuesta
    bajo `.sdd/conflicts/<version>/`. Los JSON conocidos se fusionan y tus claves ganan.
  - `update` se apoya en `.sdd/installed.json` (hash por fichero): lo que no has tocado se
    actualiza solo; lo que has modificado se respeta.
  - **Los hooks no se instalan en global a propósito**: una guarda activa en todos tus
    repositorios, incluidos los que no usan SDD, es intrusiva y acaba desactivada.
- **`scripts/test-install.mjs`**: 89 comprobaciones sobre directorios temporales reales, entre
  ellas que `check-sdd` y las guardas **pasan dentro del proyecto recién instalado**, que un
  `AGENTS.md` ajeno queda intacto y que ejecutarlo dos veces no genera conflictos. En CI.
- `docs/guides/INSTALACION.md` y `package.json` con `bin: sdd`.
- **Dirección visual vinculante: `docs/design/DIRECCION-VISUAL.md` + puerta en `/sdd-design`.**
  Se decide **una vez**, como la constitución de arquitectura, y sin ella aprobada por el usuario
  no se dibuja ninguna pantalla. Fija referencias reales y una antirreferencia, tres adjetivos que
  excluyan algo, escala tipográfica con contraste real, densidad, movimiento y qué NO va a hacer
  el proyecto. Además, **un elemento con carácter por pantalla** es obligatorio.
  Motivo: los seis estados y WCAG 2.2 AA son un **suelo**, no un techo — se cumplen enteros y aun
  así sale el MVP de cuatro cajas grises. Y la interfaz generada por un modelo converge en una
  estética genérica reconocible si nadie declara lo contrario.
  `/front` verifica el código contra la dirección —es donde el carácter se diluye sin querer— y
  `check-sdd --strict` falla si hay `design.md` con la dirección sin aprobar.
- **6 skills de diseño visual catalogadas**: `frontend-design`, `theme-factory`, `canvas-design` y
  `web-artifacts-builder` de Anthropic, `web-design-guidelines` de Vercel (audita la UI terminada
  en formato `fichero:línea`) y la oficial de `shadcn-ui/ui`. Son refuerzo, no sustituto de la
  dirección visual propia.
- **Aislamiento por territorio: `.sdd/territories.json` + guarda en `guard-write.mjs`.** Declara
  qué rutas pertenecen a qué agentes, y bloquea al que escribe en terreno ajeno. El agente activo
  lo registran `SubagentStart`/`SubagentStop` en `.sdd/state/`, **fuera del modelo**: `PreToolUse`
  no dice quién escribe, y sin ese dato la guarda ve la ruta pero no la mano.
  La regla es *no entres en el territorio de otro*, no *quédate en el tuyo*: lo que no es de nadie
  se permite, porque una guarda que bloquea lo desconocido se desactiva el primer día.
- **Delegación real en VS Code y Cursor, que estaba documentada pero sin cablear.** Los tres
  agentes que delegan declaran la herramienta `agent` y una lista `agents:` que limita a quién
  pueden llamar; `.cursor/agents/` pasa de 2 a **los 20 agentes**, con `readonly: true` en
  `orchestrator`, `code-reviewer`, `security-auditor` y `research-analyst` — que a nivel de
  plataforma no pueden escribir.
- **`scripts/test-hooks.mjs`**: 40 comprobaciones de que las guardas y contratos deciden lo que documentan.
  En CI. Una guarda rota falla en silencio devolviendo `allow`; si estos gates son la garantía del
  proyecto, tienen que demostrarlo en cada PR.
- **Skills de dominio `/middle`, `/front` y `/bbdd`**: el procedimiento escrito de cada
  especialista, con puerta de entrada, ciclo TDD, patrones aplicables y lista de comprobación
  antes de devolver el control. Un agente al que solo le dices "aplica SOLID" no aplica SOLID.
- **`/sdd-design`**: el diseño pasa a ser fase propia entre `/sdd-clarify` y `/sdd-plan`, con
  `design.md` como artefacto. Obliga a los seis estados por pantalla (vacío, cargando, parcial,
  error, sin permiso, éxito) y a verificar accesibilidad **sobre el diseño**. Se salta si la
  funcionalidad no tiene interfaz. Descubrir una pantalla que falta después de planificar la
  arquitectura significa replanificar.
- **Priorización MoSCoW con las reglas del DSDM** en `spec.md`: prioridad y esfuerzo relativo por
  requisito, reparto calculado **sobre esfuerzo y no sobre número de requisitos**, y aviso
  automático si los *must* pasan del 60 %. Sección obligatoria de *won't have this time*.
- **`.sdd/external-skills.json` + `scripts/skills-sync.mjs` + `docs/agents/SKILLS-EXTERNAS.md`**:
  13 skills oficiales de Anthropic, Vercel, Supabase, Cloudflare, Netlify, Stripe y Neon
  catalogadas para middle, front y BBDD. Se **declaran, no se copian**: nada se aprueba sin
  versión fijada y licencia verificada, y el script imprime el comando pero **no instala** —
  una skill de terceros es una dependencia ejecutable (OWASP Agentic ASI04).
- `docs/agents/MAPEO-10-AGENTES.md`: de dónde viene este diseño, qué se conservó de la idea
  original de 10 agentes y el motivo de cada cambio.
- `docs/research/baseline-2026-07-30.md`: baseline vigente — ecosistema de skills y su cadena de
  suministro, TDD y QA con agentes (datos DORA), separación macro/micro en arquitectura, reglas
  reales de MoSCoW.
- 4 prompts nuevos para Copilot (15 en total), 4 comandos nuevos para Cursor y envoltorio de
  `ux-designer` para VS Code, ahora que es agente de fase.
- `scripts/check-sdd.mjs`: validador determinista del circuito SDD, con modo `--strict`.
  Convierte la Definition of Done en un gate que falla el build en lugar de una casilla que
  marca el modelo. Integrado en CI, `/sdd-verify` y `/sdd-ship`.
- `/respond-incident`: ciclo completo de incidente — contener, comunicar, diagnosticar,
  arreglar y post-mortem sin culpables.
- Decisión GO/NO-GO explícita en `/sdd-ship`, firmada por una persona.
- Análisis de coherencia entre artefactos en `/sdd-plan`, contra el scope creep silencioso.
- Regla de las tres hipótesis en `research-analyst`, contra la espiral de parches.
- Hooks funcionando también en Cursor (`.cursor/hooks.json`) y adaptador para Antigravity.
- `docs/integrations/IDE-COMPATIBILITY.md`: qué funciona en cada proveedor y qué no,
  separando lo verificado de lo inferido.
- 6 prompts nuevos para Copilot (11 en total).

### Fixed
- **8 agentes tenían especificadores en `tools:`** (`Bash(git status:*)`), formato que no
  existe: el único scoping documentado es `Agent(tipo)`. El agente se quedaba sin `Bash`.
  El scoping se ha movido a `permissions` de `settings.json`, que es su sitio.
- El job de trazabilidad del CI **falla** en lugar de emitir avisos decorativos.
- Actions de GitHub fijadas por SHA (14 usos) en vez de por tag flotante, y en la major
  vigente: checkout, setup-node y upload-artifact en v7, gitleaks en v3. Los SHA se
  verificaron con `gh` y `git ls-remote` de forma independiente.
- `toolCall()` no reconocía el payload plano de Cursor y dejaba las guardas sin datos,
  permitiéndolo todo en silencio.
- Nivel ASVS del `security-auditor` alineado con la constitución: L2 por defecto, no L1.
- `subagent-log.mjs` registraba un identificador de sesión en lugar del nombre del agente:
  la búsqueda difusa por `agent` capturaba claves como `agentSessionId`. Un registro que dice
  `a18ccba93b95e515c` en vez de `backend-expert` no vale como evidencia. Ahora la coincidencia
  de clave es exacta.

### Changed
- **VS Code sí tiene hooks, y son compatibles campo por campo**: mismos eventos —incluidos
  `SubagentStart`/`SubagentStop`—, mismo payload y misma decisión por stdout, y **lee
  `.claude/settings.json`**. Los hooks de la plantilla funcionan ahí sin tocar nada, y con ellos
  la guarda de territorio y la trazabilidad `observed`, que se daban por exclusivas de Claude Code.
  **No se crea `.github/hooks/`**: duplicaría la carga y cada guarda se ejecutaría dos veces.
- Los `matcher` de `.claude/settings.json` cubren ahora los nombres de herramienta de los dos
  hosts (`Edit` y `edit/editFiles`). Un matcher que no coincide no dispara el hook, y **una guarda
  que no se ejecuta falla en abierto**: permite todo en silencio.
- La regla de **profundidad máxima de delegación** era ambigua sobre qué se cuenta. Ahora es
  explícita: se cuentan **saltos entre agentes**, el humano no es un nivel. Así
  `Tú → orchestrator → implementer → backend-expert` es exactamente el máximo permitido, y que el
  especialista llamara a otro sería el nivel 3.
- `subagent-log.mjs` ya no registra `observed` cuando el host no expone el nombre del subagente:
  en ese caso escribe `unverified` con el motivo. Afirmar que se observó a un agente sin saber
  cuál era es fabricar la evidencia que este registro existe para dar.
- **El eje de arquitectura se separa en macro y micro.** `vertical slice` estaba junto a layered,
  hexagonal y clean, como si compitieran; responde a otra pregunta. El monolito modular decide
  dónde están las fronteras (macro); el vertical slice, cómo se ordena el código dentro de una
  (micro), y es **decisión local de cada módulo**. Aplicado a `AGENTS.md` §3.1 y a
  `DECISION-GUIDE.md`. La ley del proyecto no cambia.
- `/sdd-tasks` separa las tareas por **terreno** (middle / front / BBDD) y le asigna a cada una su
  skill. BBDD va antes de middle cuando el esquema es prerrequisito; el contrato antes del front
  siempre, y por eso front y middle pueden ir en paralelo.
- El orden de implementación respeta MoSCoW: todos los *must* antes del primer *should*.
- Mutation testing pasa de mención a requisito con dato: los tests generados por un modelo tienen
  cobertura presentable y *mutation score* bajo. El número va en `evidence.md`.
- `guard-bash` pregunta antes de `skills add` y `plugin marketplace add`; `guard-write` trata
  `.sdd/external-skills.json` como política del ecosistema.
- `check-sdd` comprueba además que toda skill declara `name` coincidente con su carpeta, que
  `design.md` no lleva ambigüedades si ya hay plan, y avisa si una spec no tiene prioridades.

### Deprecated
-

### Removed
-

### Security
- Instalar una skill de terceros se trata como decisión de cadena de suministro: `ask` en el hook,
  auditoría registrada, versión fijada y licencia verificada antes de aprobar. `skills-sync.mjs`
  **no instala** por su cuenta — un script que descarga y activa instrucciones de terceros sin
  intervención humana es el vector ASI04 con otro nombre.

---

## [0.1.0] — 2026-07-29

### Added

- Circuito SDD completo: `/sdd-init`, `/sdd-specify`, `/sdd-clarify`, `/sdd-plan`,
  `/sdd-tasks`, `/sdd-implement`, `/sdd-verify`, `/sdd-ship`.
- Comandos auxiliares: `/sdd-start`, `/sdd-status`, `/onboard`, `/sdd-refresh`, `/adr`,
  `/bitacora`, `/tdd`, `/security-scan`, `/design-sync`.
- 20 agentes especializados en `.claude/agents/`, con protocolo de handoff explícito.
- Hooks multiplataforma en Node: contexto de sesión, router SDD, guardas de escritura y de
  comandos con decisiones `allow`/`ask`/`deny`, formateo automático, bitácora de sesión y
  **trazabilidad de subagentes** (`execution-log.jsonl`).
- Compatibilidad verificada con Claude Code, VS Code/Copilot, Cursor y Antigravity.
- Estructura `docs/` con plantillas de spec, plan, tareas, modelo de datos, plan de test y
  evidencias; constitución, guía de decisión arquitectónica, catálogo de patrones, estrategia
  de test, checklist de seguridad y bitácora.
- Baseline de investigación fechado (`docs/research/baseline-2026-07-29.md`) revalidable
  con `/sdd-refresh`.
