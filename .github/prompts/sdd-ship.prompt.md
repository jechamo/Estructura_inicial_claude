---
mode: release-manager
description: Prepara la entrega con trazabilidad, CHANGELOG y decisión GO/NO-GO
---

Ejecuta la fase **ship** sobre: `${input:spec:¿Qué spec (NNN-slug)?}`

Sigue [`.agents/skills/sdd-ship/SKILL.md`](../../.agents/skills/sdd-ship/SKILL.md).

**Regla absoluta: no ejecutas `git push`, ni abres PR, ni mergeas, ni etiquetas, ni
despliegas** sin que el usuario lo pida explícitamente en este turno. Preparas y muestras
los comandos.

1. `node scripts/check-sdd.mjs --strict` y la DoD de [`AGENTS.md`](../../AGENTS.md) §7,
   con la salida real pegada. Cualquier gate en rojo → para.
2. Verifica que los commits siguen `tipo(NNN): descripción — task T-NNN-XX`.
3. CHANGELOG en formato Keep a Changelog, escrito **para usuarios**, no para desarrolladores.
4. PR con tabla de cobertura `RF → CA → test`, verificación, seguridad, riesgos y reversión.
5. **GO / NO-GO**: presenta qué se entrega, qué se verificó, **qué NO se verificó**, riesgo
   residual y cómo se revierte. Recomienda, pero **no marcas `GO` tú**: lo firma una persona.
   Un `GO` firmado por quien produjo el trabajo no es una revisión.
6. Plan de vigilancia post-despliegue: métrica, ventana y umbral de reversión.

Cierra con el bloque `### HANDOFF`.
