---
mode: architect
description: Arranca un proyecto nuevo - elige arquitectura y stack, crea la constitución y el ADR-0001
---

Ejecuta la fase **init** para el proyecto: `${input:proyecto:¿Qué producto vamos a construir?}`

Sigue [`.agents/skills/sdd-init/SKILL.md`](../../.agents/skills/sdd-init/SKILL.md).

**Solo para proyectos nuevos.** Si ya existe `docs/architecture/constitution.md`, para y avisa.
Si hay código sin documentar, usa el prompt de onboarding.

1. **Entrevista** — máximo 8 preguntas con opciones y recomendación: producto y usuarios ·
   tipo · escala al año 1 · equipo · restricciones · datos sensibles · horizonte · integraciones.
2. **Decisión de arquitectura** — presenta la recomendada + 1 alternativa seria con coste y
   consecuencias. **Espera confirmación.** Ley del proyecto: monolito modular con fronteras
   hexagonales por defecto.
3. **Artefactos** — `constitution.md`, `ADR-0001-arquitectura-inicial.md`,
   `ADR-0002-stack-tecnologico.md`, tabla §1 de `AGENTS.md`, esqueleto de carpetas con README
   por capa, `TEST-STRATEGY.md`, `THREAT-MODEL.md`, linter/formateador/tests/CI, `.env.example`
   sin valores, primera entrada de bitácora.
4. **Test de humo** — un test trivial que pase. Pega la salida real.

Cierra con el bloque `### HANDOFF` y di al usuario que el siguiente paso es especificar la
primera funcionalidad.
