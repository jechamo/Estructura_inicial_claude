# Informe de seguridad · 001-agentes-codex

## Alcance

Adaptadores `.codex/agents/*.toml`, configuración del proyecto, validación estática, instalador y
documentación asociada.

## Resultado

| Severidad | Hallazgos |
|---|---:|
| Crítica | 0 |
| Alta | 0 |
| Media | 0 |
| Baja | 0 |

## Controles verificados

- No hay credenciales, tokens, rutas personales ni valores MCP en los TOML.
- `orchestrator`, `code-reviewer`, `security-auditor` y `research-analyst` usan
  `sandbox_mode = "read-only"`.
- Los demás agentes heredan sandbox y aprobaciones de la sesión; no se relajan permisos globales.
- La instalación no escribe en `~/.codex` y conserva configuraciones de proyecto preexistentes
  mediante la política de no sobrescritura.
- `guard-write.mjs` solicita revisión humana al cambiar `.codex/config.toml` o sus agentes.

## Riesgo residual

Codex no documenta lista blanca de delegación ni territorios por agente equivalentes a los hooks
del repositorio. Se mitiga con `AGENTS.md`, perfiles canónicos y `check-sdd` en CI.

**Veredicto**: sin bloqueantes críticos ni altos.
