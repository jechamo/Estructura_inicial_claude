---
mode: architect
description: Documenta un repositorio existente y lo prepara para el circuito SDD
---

Adopta este repositorio en el circuito SDD.

Sigue [`.agents/skills/onboard/SKILL.md`](../../.agents/skills/onboard/SKILL.md).

**No refactorices nada.** Documenta la realidad, aunque la realidad sea fea.

1. **Investigar** (solo lectura): superficie · estructura · **arquitectura real, no la
   declarada** (¿el dominio importa la infraestructura?) · puntos de entrada · datos · tests ·
   historia (`git log`: los ficheros que cambian siempre suelen ser los peor diseñados) ·
   riesgos (CVEs, dependencias abandonadas, secretos en el repo, versiones EOL).
   → `docs/architecture/CURRENT-STATE.md`. **Separa lo observado de lo inferido.**
2. **Formalizar**: `constitution.md` describiendo lo que **hay**, con las desviaciones
   marcadas como deuda conocida, y `ADR-0001-arquitectura-heredada.md`.
   Si lo que el equipo cree diverge de lo que el código hace, **dilo en voz alta**: suele
   ser el hallazgo más valioso de todo el onboarding.
3. **Andamiaje**: `docs/specs/`, `docs/bitacora/`, `docs/quality/TECH-DEBT.md` priorizado
   por riesgo × frecuencia de cambio, y pipeline mínimo si no hay CI.
4. **No** especifiques retroactivamente todo el sistema: coste enorme, valor bajo. Solo lo
   que vayas a tocar, cuando lo vayas a tocar.

Cierra con el bloque `### HANDOFF`.
