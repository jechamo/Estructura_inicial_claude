# Changelog

Formato [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) · versionado [SemVer](https://semver.org/lang/es/).

> Escrito para **usuarios**, no para desarrolladores. "Refactorizado el servicio X" no va aquí;
> va en el historial de git. Lo mantiene `release-manager` en `/sdd-ship`.

## [No publicado]

### Added
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
- Actions de GitHub fijadas por SHA (14 usos) en vez de por tag flotante.
- `toolCall()` no reconocía el payload plano de Cursor y dejaba las guardas sin datos,
  permitiéndolo todo en silencio.
- Nivel ASVS del `security-auditor` alineado con la constitución: L2 por defecto, no L1.
- `subagent-log.mjs` registraba un identificador de sesión en lugar del nombre del agente:
  la búsqueda difusa por `agent` capturaba claves como `agentSessionId`. Un registro que dice
  `a18ccba93b95e515c` en vez de `backend-expert` no vale como evidencia. Ahora la coincidencia
  de clave es exacta.

### Changed
-

### Deprecated
-

### Removed
-

### Fixed
-

### Security
-

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
