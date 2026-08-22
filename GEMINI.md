# GEMINI.md — Antigravity

<!-- sdd:start -->
Lee [`AGENTS.md`](AGENTS.md) y el recorte de tu fase con
`node scripts/sdd-project.mjs context --phase <fase>`.

- Reglas y workflows: `.agents/rules/` y `.agents/workflows/`.
- Skills canónicas: `.agents/skills/`.
- Perfiles de rol: `.claude/agents/`; Antigravity los adopta por lectura cuando no puede
  delegar a un subagente aislado.
- Ante PRD en texto/ruta/carpeta/URL o diseño opcional, sigue `/sdd-intake` antes de
  arquitectura o specs. Usa los documentos del repo para pasar entre perfiles, no el chat.
- Contrato de hooks: `.agents/hooks.json`; implementación compartida: `.sdd/hooks/`.
- No declares una ejecución `observed` sin que el host haya emitido el evento real.
<!-- sdd:end -->
