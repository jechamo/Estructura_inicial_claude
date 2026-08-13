# Resumen ejecutivo · v0.6.0 documentación viva

## Qué hicimos

La plantilla ya instala y mantiene un circuito documental completo que viaja con cada proyecto,
sin copiar historia ajena, activar herramientas no elegidas ni tomar decisiones de Git por el
equipo.

## Por qué importa

Al clonar un proyecto en otro equipo se recuperan sus agentes, skills, reglas y documentación
oficial. Los cambios de producto entregan su documentación en el mismo PR, mientras una errata o
una actualización editorial puede usar una ruta ligera sin crear una spec funcional ni ejecutar
tests de aplicación que no guardan relación con el documento.

## Resultados verificados

| Resultado | Medido con |
|---|---|
| 20 agentes coherentes en seis superficies | gate estricto y suite del instalador |
| 26 skills canónicas sin comandos duplicados | gate estricto y empaquetado |
| 261 pruebas del instalador en verde | `node scripts/test-install.mjs` |
| 71 pruebas de hooks y routing en verde | `node scripts/test-hooks.mjs` |
| 390 ficheros revisados y 0 secretos detectados | `node scripts/scan-secrets.mjs --json` |
| 0 hallazgos de seguridad abiertos | auditoría OWASP Top 10:2025 / ASVS 5.0.0 L2 |

## Lo que no se ha resuelto todavía

La matriz CI de Windows/Linux con Node 18, 20 y 22 se ejecutará sobre el commit publicado en
`main`. Hasta observarla verde, el tag estable continúa bloqueado. Los smoke manuales de cada IDE
no se reinterpretan como pruebas automatizadas.

## Qué sigue

Publicar el commit de cierre, observar la matriz CI, solicitar el gate humano final y crear el tag
inmutable `v0.6.0` solo si todos esos controles están verdes.

**Completado localmente:** 2026-08-13 · **Trazabilidad:**
`docs/specs/008-documentacion-viva-portable/spec.md` ·
`docs/specs/008-documentacion-viva-portable/evidence.md`
