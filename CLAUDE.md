# CLAUDE.md

@AGENTS.md

<!-- sdd:start -->
Lee y aplica primero `AGENTS.md`. La política vinculante vive en
[`docs/sdd/OPERATING-MODEL.md`](docs/sdd/OPERATING-MODEL.md), y **no se lee entera**:
Para cada fase pide solo su sección con `node scripts/sdd-project.mjs context --phase <fase>`; el mapa de lectura vive al principio de ese documento. Leerlo entero cuesta 41 KB en cada fase y una fase típica necesita menos de la quinta parte.

- Perfiles de subagente: `.claude/agents/`.
- Skills canónicas: `.agents/skills/`; `.claude/skills/` conserva el descubrimiento nativo.
- Hooks: `.claude/settings.json`, con implementaciones compartidas en `.sdd/hooks/`.
- Entrada recomendada si la petición no está clasificada: `/sdd-start` o `orchestrator`.
- Si el usuario aporta un PRD, ruta/URL de requisitos o diseño opcional, entra por
  `/sdd-intake`; producto se aprueba antes de arquitectura o specs.
- Cierra cada fase con el bloque `### HANDOFF` de `AGENTS.md`. Si no puedes delegar, indica
  perfil y comando exactos y deja las rutas durables que la siguiente fase debe releer.
<!-- sdd:end -->
