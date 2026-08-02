# Investigación · 002-portabilidad-instalador-universal

## Decisiones contrastadas

- Codex: `.agents/skills`, `.codex/agents/*.toml` y `.codex/hooks.json`.
- Claude Code: `.claude/agents`, `.claude/skills` y `.claude/settings.json`.
- GitHub/VS Code: `.github/agents`, `.github/hooks` y skills estándar.
- Antigravity: `.agents/skills`, `.agents/rules`, `.agents/workflows` y `.agents/hooks.json`.
- Cursor: adaptadores propios para agentes/comandos/hooks y skills estándar en `.agents/skills`.

Se descartan symlinks por portabilidad Windows y la fusión libre de Markdown por no ser
determinista. Las referencias ejecutables externas no se distribuyen con `latest`.
