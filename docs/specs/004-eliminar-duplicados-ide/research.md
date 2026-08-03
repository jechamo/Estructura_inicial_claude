# Investigación · 004

## Hallazgos locales

- VS Code descubre perfiles tanto en `.github/agents/` como en `.claude/agents/`; la selección del
  proyecto solo aplica en un workspace confiable.
- VS Code muestra prompts y skills en el mismo selector `/`; los 15 prompts actuales duplican
  nombres canónicos.
- Cursor descubre `.agents/skills/`; seis `.cursor/commands/` repiten esos nombres.
- npm usa `.gitignore` como fallback porque no existe un contrato explícito de empaquetado.

## Decisión

Mantener una representación por capacidad y host: perfiles específicos cuando aportan metadatos
nativos; una única skill canónica para comandos. Usar allowlist de paquete en `package.json`.
