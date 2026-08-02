---
name: sdd-verify
description: "Verifica el trabajo antes de entregar. Ejecuta todos los gates de calidad: tests, cobertura, lint, revisión de código, principios de diseño y auditoría de seguridad."
---

# /sdd-verify — Validar

Agentes: `@code-reviewer`, `@security-auditor`, `@refactor-specialist`, `@test-engineer`.

## Paso 1 — Verificación automática

Ejecuta y **pega la salida real** de cada uno:

```bash
node scripts/check-sdd.mjs --strict
```

```
suite de tests completa
cobertura
lint + formato
typecheck
build
auditoría de dependencias (npm audit / pip-audit / …)
```

`check-sdd --strict` es el gate que **no marca el modelo**: comprueba contra el sistema de
ficheros que toda tarea `hecho` tiene evidencia y ejecución registrada, que ningún criterio
de aceptación quedó sin test, que no se planificó sobre ambigüedades y que el log de
ejecución no se ha manipulado. Si sale con código 1, **para**.

Si algo está en rojo, **para aquí**. No se revisa código que no compila ni pasa tests.

## Paso 2 — Trazabilidad

Construye la tabla y comprueba que está completa:

| RF | CA | Test | Estado |
|---|---|---|---|
| RF-01 | CA-01 | `ruta::nombre` | ✅ |

- [ ] Todo `CA` de la spec tiene un test que lo verifica
- [ ] Todas las tareas del alcance están en `hecho`
- [ ] No hay código sin tarea asociada

## Paso 3 — Revisión (`@code-reviewer`)

Sobre el diff de la rama. Veredicto ✅ / ⚠️ / ❌ con hallazgos por gravedad y `ruta:línea`.

## Paso 4 — Diseño (`@refactor-specialist`)

Auditoría SOLID, DRY, KISS, YAGNI y patrones. Cada violación: o se arregla, o se justifica
por escrito en el PR y en la bitácora.

## Paso 5 — Seguridad (`@security-auditor`)

OWASP Top 10 + nivel ASVS de la constitución (+ OWASP Agentic si hay LLM).
Informe en `docs/security/reports/YYYY-MM-DD-NNN-slug.md`.

**CRÍTICO o ALTO ⇒ bloquea la entrega.**

## Paso 6 — Calidad de la suite (`@test-engineer`)

- ¿Hay tests sin assert o con asserts triviales?
- ¿Los tests fallan si rompes el código a propósito? (comprobación puntual)
- ¿Casos límite cubiertos, no solo el camino feliz?
- ¿Sin `.only`, `.skip` ni tests flaky?
- Mutation testing en el core, si está configurado.

## Paso 7 — Evidencia y trazabilidad de ejecución

- [ ] `evidence.md` tiene una fila por ejecución, con comando, resultado y artefacto
- [ ] La sección **"controles no ejecutados"** está rellenada o justificadamente vacía
- [ ] Cada tarea `hecho` tiene su evento en `execution-log.jsonl`
- [ ] Las delegaciones aparecen como `observed`; si alguna es `declared-direct` o
      `unverified`, está documentado por qué
- [ ] La decisión de entrega de `evidence.md` §5 sigue en `NO-GO` hasta que un humano la cambie

## Paso 8 — Operación

- [ ] Logs estructurados, sin PII, en los caminos nuevos
- [ ] Métricas y trazas
- [ ] Migraciones reversibles y compatibles con la versión anterior desplegada
- [ ] Feature flag donde el plan lo pedía
- [ ] Plan de reversión escrito
- [ ] Documentación y contratos actualizados
- [ ] Bitácora actualizada si hubo decisiones

## Informe

Escribe `docs/quality/reports/YYYY-MM-DD-NNN-slug.md` con el resultado de cada gate y la
salida real de las herramientas.

## Cierre

```
### HANDOFF
- Agente origen: code-reviewer (coordinando verificación)
- Gates automáticos: <verde | rojo, cuál>
- Trazabilidad: <n>/<n> CA cubiertos
- Revisión: ✅ | ⚠️ | ❌  (bloqueantes: <n>)
- Diseño: <n> violaciones sin justificar
- Seguridad: CRÍTICO <n> · ALTO <n> · MEDIO <n>
- Veredicto: APTO PARA ENTREGA | REQUIERE CAMBIOS
- Siguiente agente sugerido: implementer (arreglar) | release-manager — comando: /sdd-ship
```
