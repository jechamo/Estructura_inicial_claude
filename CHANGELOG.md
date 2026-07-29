# Changelog

Formato [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) · versionado [SemVer](https://semver.org/lang/es/).

> Escrito para **usuarios**, no para desarrolladores. "Refactorizado el servicio X" no va aquí;
> va en el historial de git. Lo mantiene `release-manager` en `/sdd-ship`.

## [No publicado]

### Added
-

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
