# Agentes para GitHub Copilot y VS Code

## Por qué hay dos carpetas de agentes

| Carpeta | La leen | Contenido |
|---|---|---|
| `.claude/agents/*.md` | **Claude Code** y **VS Code** (Copilot lo soporta como ubicación alternativa) | **Perfiles canónicos completos.** Aquí vive la definición real de los 20 agentes |
| `.github/agents/*.agent.md` | **Copilot** (VS Code, Visual Studio, Copilot CLI y agente en la nube) | **Envoltorios finos** que apuntan al perfil canónico y añaden `handoffs`, que es una función propia de VS Code |

La regla: **una sola fuente de verdad**. Los envoltorios no duplican el contenido, lo
referencian. Si cambias un comportamiento, cámbialo en `.claude/agents/`.

## Envoltorios disponibles

Solo los agentes del eje principal del circuito SDD, que son los que se seleccionan a mano
desde el picker:

`orchestrator` · `spec-analyst` · `architect` · `planner` · `implementer` · `code-reviewer` ·
`security-auditor`

Los especialistas (`frontend-expert`, `backend-expert`, `database-expert`, `ux-designer`,
`test-engineer`, `refactor-specialist`, `performance-optimizer`, `api-designer`,
`devops-expert`, `docs-writer`, `bitacora-keeper`, `research-analyst`, `release-manager`)
están en `.claude/agents/` y VS Code también los lee desde ahí. Si usas el **agente en la
nube** de Copilot y necesitas alguno, crea su envoltorio con el mismo patrón.

## Handoffs

El campo `handoffs` del frontmatter genera botones en el chat de VS Code para pasar el
trabajo al siguiente agente del circuito. Con `send: false` el prompt se rellena pero no se
envía: te da oportunidad de revisarlo antes.

Es la implementación de VS Code del protocolo de handoff descrito en
[`AGENTS.md`](../../AGENTS.md) §10.

## Otros ficheros de esta carpeta

| Ruta | Función |
|---|---|
| `.github/copilot-instructions.md` | Instrucciones de repo, siempre activas |
| `.github/instructions/*.instructions.md` | Instrucciones por glob (`applyTo`) |
| `.github/prompts/*.prompt.md` | Prompts reutilizables: el circuito SDD como comandos `/` |
| `.github/workflows/` | CI con los gates de calidad |
