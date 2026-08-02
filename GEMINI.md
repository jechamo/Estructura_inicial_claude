# GEMINI.md — Antigravity

<!-- sdd:start -->
Lee y aplica primero [`AGENTS.md`](AGENTS.md) y
[`docs/sdd/OPERATING-MODEL.md`](docs/sdd/OPERATING-MODEL.md).

- Reglas y workflows: `.agents/rules/` y `.agents/workflows/`.
- Skills canónicas: `.agents/skills/`.
- Perfiles de rol: `.claude/agents/`; Antigravity los adopta por lectura cuando no puede
  delegar a un subagente aislado.
- Contrato de hooks: `.agents/hooks.json`; implementación compartida: `.sdd/hooks/`.
- No declares una ejecución `observed` sin que el host haya emitido el evento real.
<!-- sdd:end -->
