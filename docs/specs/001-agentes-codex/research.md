# Investigación · 001-agentes-codex

## D-01 · Ubicación de los agentes de Codex

- **Opciones**: solo agentes personales; agentes incluidos en el proyecto; duplicar el contenido canónico.
- **Criterios**: portabilidad al clonar, aislamiento respecto a otros IDE, mantenimiento y soporte oficial.
- **Elegida**: agentes de proyecto bajo `.codex/agents/`, porque Codex los descubre de forma nativa y viajan con el repositorio.
- **Descartadas**: la ubicación personal no actualiza este repositorio; duplicar instrucciones crea deriva.
- **Coste asumido**: mantener un adaptador TOML por rol.
- **Fuente**: [documentación oficial de subagentes de Codex](https://developers.openai.com/codex/multi-agent/), consultada el 2026-08-02.

## D-02 · Fuente de verdad

- **Opciones**: migrar los perfiles a Codex; mantener `.claude/agents/`; generar copias completas.
- **Elegida**: mantener `.claude/agents/` como fuente canónica y hacer que cada TOML ordene leerla.
- **Motivo**: conserva intactas todas las superficies existentes y limita la duplicación a metadatos mínimos.
- **Dependencias nuevas**: ninguna.
