# CLAUDE.md

@AGENTS.md

<!-- sdd:start -->
Lee y aplica primero `AGENTS.md` y, para cualquier fase o decisión, el modelo completo en
[`docs/sdd/OPERATING-MODEL.md`](docs/sdd/OPERATING-MODEL.md).

- Perfiles de subagente: `.claude/agents/`.
- Skills canónicas: `.agents/skills/`; `.claude/skills/` conserva el descubrimiento nativo.
- Hooks: `.claude/settings.json`, con implementaciones compartidas en `.sdd/hooks/`.
- Entrada recomendada si la petición no está clasificada: `/sdd-start` o `orchestrator`.
- Si el usuario aporta un PRD, ruta/URL de requisitos o diseño opcional, entra por
  `/sdd-intake`; producto se aprueba antes de arquitectura o specs.
- Cierra cada fase con el bloque `### HANDOFF` de `AGENTS.md`. Si no puedes delegar, indica
  perfil y comando exactos y deja las rutas durables que la siguiente fase debe releer.
<!-- sdd:end -->
