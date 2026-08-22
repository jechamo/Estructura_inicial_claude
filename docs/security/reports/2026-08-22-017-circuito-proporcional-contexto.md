<!-- sdd-security-report:v1 -->
# Informe de seguridad · 017-circuito-proporcional-contexto

**Fecha:** 2026-08-22
**Modo:** `/security-scan verify`
**Alcance:** la frontera del circuito (`scripts/lib/circuito.mjs`), el recortador de contexto
(`scripts/lib/contexto.mjs`), sus superficies de CLI y la semilla de instalación.
**Estándares:** OWASP Top 10:2025 · ASVS 5.0.0 L2
**Impacto:** sensible
**JWT/cookies/bearer:** no aplica; la spec no introduce autenticación, sesiones ni credenciales.

## ⚠️ Limitación de este informe · léase primero

**No lo ha producido un auditor independiente.** `AGENTS.md` exige que audite el
`security-auditor` en solo lectura, porque nadie audita su propio diseño. En esta sesión no se
delegó en ese perfil, así que lo firma el mismo agente que implementó los controles.

Eso **no invalida los resultados de los tests** —son ejecuciones reales, con salida registrada y
casos adversos que fallan en rojo antes del arreglo— pero **sí invalida la independencia** del
juicio sobre si los controles son los correctos y si falta alguno.

| Campo | Valor |
|---|---|
| Control no ejecutado | Auditoría independiente de seguridad |
| Riesgo | Un control mal elegido o ausente no se detecta: quien lo diseñó tiene el mismo punto ciego al revisarlo |
| Dueño | `security-auditor`, en solo lectura |
| Siguiente paso | `/security-scan verify` delegando en ese perfil antes del `GO` de entrega |

Por tanto este informe **no concede un `GO`**. Concede lo que puede: constancia de que los tres
controles tienen caso adverso ejecutado con salida real.

## Resultado de los controles

| Control | ASVS | OWASP | Estado | Evidencia |
|---|---|---|---|---|
| SEC-CIRCUIT-001 | V1 | A01:2025 | superado | `circuito-frontera.mjs::deniega_variacion_de_caja` — 🔴 antes del arreglo, 🟢 después. Cubre plegado de caja en ambos sentidos, negación prevalente, traversal, ruta absoluta y comodín. Añade el suelo por extensión: `un_ejecutable_nunca_es_ligero` |
| SEC-CIRCUIT-002 | V1 | A01:2025 | superado | `circuito-frontera.mjs::sin_aprobacion_no_hay_atajo` y `::aprobacion_separada_y_ligada_a_la_propuesta` — 🔴 `fail-sin-comandos` → 🟢. Cubre estado `pending`, estados inventados, huella que no corresponde y propuesta alterada tras mostrarse |
| SEC-CONTEXT-001 | V1 | A04:2025 | superado | `contexto-recorte.mjs::falla_cerrado_y_conserva_invariantes` — 🔴 `sin-modulo` → 🟢. Invariantes presentes en las once fases; sección ausente, duplicada o fase desconocida lanzan error nombrando la causa |

## Hallazgo corregido durante la implementación

`detect-circuit` proponía `AGENTS.md`, `CLAUDE.md`, `GEMINI.md` y `package.json` como candidatos al
nivel ligero. Acaban en `.md` y `.json`, pero cambiarlos cambia las reglas del sistema, no su
documentación: habrían podido modificarse sin expediente. Severidad **MEDIA** por requerir que
alguien aprobase la propuesta sin revisarla. Corregido con la lista `GOBIERNO`, que además los añade
a `denied`. Test: `::aprobacion_separada_y_ligada_a_la_propuesta` (`fail-propone-gobierno`).

## Conteo

- CRÍTICO: 0 · ALTO: 0 · MEDIO: 1 (corregido) · BAJO: 0
- Controles no ejecutados: **1** — la auditoría independiente, declarada arriba.

```json
{
  "schemaVersion": 1,
  "spec": "017-circuito-proporcional-contexto",
  "verdict": "PENDIENTE-DE-AUDITORIA-INDEPENDIENTE",
  "critical": 0,
  "high": 0,
  "medium": 0,
  "low": 0,
  "mediumResolved": 1,
  "controlsNotExecuted": ["auditoria-independiente"],
  "independentAuditor": false,
  "note": "Los tests de los tres controles se ejecutaron con casos adversos y salida real. La independencia del juicio no está cubierta."
}
```
