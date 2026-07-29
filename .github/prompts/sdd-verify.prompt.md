---
mode: code-reviewer
description: Verifica todos los gates de calidad antes de entregar - tests, revisión, diseño y seguridad
---

Ejecuta la fase **verify** sobre los cambios de esta rama.

Sigue [`.claude/skills/sdd-verify/SKILL.md`](../../.claude/skills/sdd-verify/SKILL.md).

1. **Automático**: suite completa, cobertura, lint, formato, typecheck, build, auditoría de
   dependencias. **Pega la salida real de cada uno.** Si algo está en rojo, para aquí.
2. **Trazabilidad**: tabla RF → CA → test. Ningún criterio de aceptación sin test.
3. **Revisión de código**: diff completo, hallazgos con `ruta:línea` y gravedad.
4. **Diseño**: auditoría SOLID, DRY, KISS, YAGNI y patrones.
5. **Seguridad**: OWASP Top 10 + nivel ASVS de la constitución. CRÍTICO o ALTO **bloquea**.
6. **Suite**: tests sin assert, flaky, `.only`, `.skip`, cobertura con aserciones pobres.
7. **Operación**: logs, métricas, trazas, migraciones reversibles, feature flag, plan de reversión.

Escribe el informe en `docs/quality/reports/YYYY-MM-DD-NNN-slug.md`.

Veredicto explícito: **APTO PARA ENTREGA** o **REQUIERE CAMBIOS** con la lista de bloqueantes.

Cierra con el bloque `### HANDOFF`.
