# Aclaraciones · 006

No quedan marcadores `[NEEDS CLARIFICATION]`.

| Pregunta | Resolución aprobada |
|---|---|
| ¿La cobertura por riesgo sustituye al umbral plano o se suma? | Lo **sustituye**. El ≥80 % global desaparece como criterio de suficiencia: era el *coverage ciego* que la fuente denuncia, y la DoD ya reconocía que el criterio que manda es "cero zonas críticas sin probar". |
| Entonces, ¿qué protege al módulo que nadie clasificó? | El defecto estricto: sin tier declarado ⇒ CORE 100 %. Bajarlo se justifica por escrito en `plan.md`, que pasa por gate humano. |
| ¿Y si alguien clasifica como INFRASTRUCTURE lo que es CORE? | `/sdd-verify` contrasta el tier declarado contra lo que el módulo hace: dinero, datos críticos o seguridad no pueden estar por debajo de CORE. |
| ¿La observabilidad es un agente nuevo? | No. Es una skill que ejecuta `devops-expert`, que ya es el dueño de plataforma. Precedente: intake fue skill, no agente 21. |
| ¿"Testear menos y observar más" permite saltarse el TDD? | No. Calibra profundidad —cuántos casos límite, si hay E2E, si hay mutation testing—. El ciclo rojo-verde de una tarea de la spec no es negociable. |
| ¿Se impone Sentry, Vitest, Playwright o Husky? | No. Entran como heurística de detección o como ejemplo. `.sdd/checks.json` sigue naciendo sin comandos. |
| ¿Se usa Husky para los git hooks? | No: es Node-only y rompería la portabilidad. Shell POSIX y `core.hooksPath`, opt-in. |
| ¿Quién puede ejecutar los pasos nuevos de `/sdd-verify`? | Nadie por delegación: quien coordina esa fase es un auditor sin escritura ni `Agent`. Son comprobaciones de solo lectura contra artefactos durables. |
| ¿Se amplía el bloque `### HANDOFF` universal? | No. Obligaría a editar veinte perfiles y tres juegos de adaptadores. Se amplían seis bloques específicos de agente. |
| ¿Quién es dueño de `docs/quality/**` en territorios? | Nadie. Lo escriben varios agentes en fases distintas y la regla vigente permite las rutas sin dueño. Declarar dueño bloquearía `/sdd-verify`. |
| ¿Qué pasa si el runner del proyecto no admite umbral por ruta? | Se declara en `evidence.md` como control parcialmente ejecutado, con su riesgo y su dueño. No se finge cumplimiento. |
