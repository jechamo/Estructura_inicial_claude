# Investigación · 003-skills-portables-estandar

Fecha de corte: 2026-08-02.

- Agent Skills define `name` y `description` obligatorios y solo seis campos canónicos.
- `npx skills` 1.5.21 reconoce `.agents/skills/` para Universal, Codex, Cursor, Copilot y otros;
  Claude Code usa `.claude/skills/`.
- `--copy` evita symlinks, apropiado para Windows y para una plantilla versionada.
- `skill-creator` se fija al commit `b29e7cf65e5cb78a5ac33d582270551bc74a14eb` y conserva
  su licencia Apache-2.0.

Fuentes primarias y hallazgos completos: `docs/research/baseline-2026-08-02.md`.
