# CLAUDE.md

@AGENTS.md

<!-- sdd:start -->
Lee y aplica primero `AGENTS.md` y, para cualquier fase o decisión, el modelo completo en
[`docs/sdd/OPERATING-MODEL.md`](docs/sdd/OPERATING-MODEL.md).

- Perfiles de subagente: `.claude/agents/`.
- Skills canónicas: `.agents/skills/`; `.claude/skills/` conserva el descubrimiento nativo.
- Hooks: `.claude/settings.json`, con implementaciones compartidas en `.sdd/hooks/`.
- Entrada recomendada si la petición no está clasificada: `/sdd-start` o `orchestrator`.
- Cierra cada fase con el bloque `### HANDOFF` de `AGENTS.md`.
<!-- sdd:end -->
