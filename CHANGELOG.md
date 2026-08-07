# Changelog

Formato [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) · versionado [SemVer](https://semver.org/lang/es/).

> Escrito para **usuarios**, no para desarrolladores. "Refactorizado el servicio X" no va aquí;
> va en el historial de git. Lo mantiene `release-manager` en `/sdd-ship`.

## [No publicado]

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
- `.sdd/checks.json` reconoce doce gates —cobertura, E2E, olores, accesibilidad, dependencias,
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
