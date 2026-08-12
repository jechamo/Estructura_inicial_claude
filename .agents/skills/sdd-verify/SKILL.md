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
node scripts/sdd-project.mjs run --slow
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

También contrasta `Impacto de documentación`, matriz `DOC-ID`, tareas, artefactos y evidencia.
Ejecuta gates `docs`/`docs:*`; ausente o `NO EJECUTADO` no equivale a verde. El co-cambio del PR
se valida con `--docs-diff --base <SHA>` en pre-push y CI.

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

Si `Impacto de seguridad = sensible`, ejecuta `/security-scan verify` contra **OWASP Top
10:2025** y **ASVS 5.0.0** al nivel de la constitución. Comprueba la matriz exacta:

| Control | ASVS | OWASP | Aplica | Decisión / justificación | Tarea | Test | Evidencia |
|---|---|---|---|---|---|---|---|

Cada control aplicable necesita salida real; cada `no aplica`, motivo material. `security-pending`
solo cubre historia brownfield, no una spec sensible nueva.

`security-auditor` es **solo lectura**: devuelve HANDOFF con estándares, alcance, controles,
evidencias, hallazgos, conteos y veredicto. El coordinador puede delegar en `@docs-writer` la
materialización **literal** —sin reinterpretar— en
`docs/security/reports/YYYY-MM-DD-NNN-slug.md`, con `<!-- sdd-security-report:v1 -->` y su JSON.

**CRÍTICO o ALTO ⇒ bloquea la entrega.** MEDIO requiere responsable, justificación y fecha de
revisión para `APTO CON CONDICIONES`. Un control no ejecutado conserva riesgo, propietario y paso.

## Paso 6 — Calidad de la suite (`@test-engineer`)

- ¿Hay tests sin assert o con asserts triviales?
- ¿Los tests fallan si rompes el código a propósito? (comprobación puntual)
- ¿Casos límite cubiertos, no solo el camino feliz?
- ¿Sin `.only`, `.skip` ni tests flaky?
- Mutation testing en el core, si está configurado.
- ¿Hay tests que mockean justo lo que dicen probar? Esos pasan siempre y no prueban nada.

## Paso 6 bis — Calibración de la verificación

Comprobaciones **de solo lectura** contra `plan.md` y la configuración del runner. Quien coordina
esta fase es un auditor sin escritura ni delegación: aquí no se llama a nadie, se comprueba.

- [ ] Cada módulo nuevo o modificado tiene **tier declarado** en `plan.md`
- [ ] **Lista los que no lo tienen**: esos debían verificarse al 100 %. Si no lo están, es un
      bloqueo, no una observación
- [ ] Ningún módulo que maneje **dinero, datos críticos o permisos** está clasificado por debajo de
      CORE. Esta es la vía de escape obvia del sistema de tiers y hay que buscarla a propósito:
      bajar de tier es más barato que escribir tests
- [ ] Cada módulo cumple el umbral de su tier. Si el runner solo admite umbral global, la
      limitación está declarada en `evidence.md`, no disimulada
- [ ] Gate `smells` en verde, o declarado como no configurado en este proyecto

## Paso 6 ter — Observabilidad, métricas y deuda

- [ ] Los caminos nuevos capturan y **clasifican** sus errores
- [ ] Salud por versión visible y regla de reversión escrita
- [ ] Rastro de eventos de negocio **sin datos personales** — lo cruza `@security-auditor`
- [ ] Toda alerta añadida tiene umbral de aviso, umbral crítico y playbook
- [ ] Métricas de nivel 1 recogidas (`docs/quality/METRICS.md`)
- [ ] Ratio de deuda medido, no estimado:

```bash
node scripts/sdd-project.mjs debt --json
```

## Paso 7 — Evidencia y trazabilidad de ejecución

- [ ] `evidence.md` tiene una fila por ejecución, con comando, resultado y artefacto
- [ ] La sección **"controles no ejecutados"** está rellenada o justificadamente vacía
- [ ] Cada tarea `hecho` tiene su evento en `execution-log.jsonl`
- [ ] Las delegaciones aparecen como `observed`; si alguna es `declared-direct` o
      `unverified`, está documentado por qué
- [ ] La decisión de entrega de `evidence.md` §5 sigue en `NO-GO` hasta que un humano la cambie
- [ ] El informe de seguridad es material y parseable; estándares, nivel, alcance, conteos y
      veredicto coinciden con el HANDOFF literal del auditor

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
- Cobertura: CORE <n/n> · IMPORTANT <n/n> · sin tier declarado <n> (deben estar al 100 %)
- Observabilidad: <instrumentada | huecos> · alertas sin playbook: <n>
- Deuda: <ratio> · marcadores <n>
- Seguridad: CRÍTICO <n> · ALTO <n> · MEDIO <n>
- Informe de seguridad: <ruta> · OWASP Top 10:2025 · ASVS 5.0.0 <nivel> · <veredicto>
- Veredicto: APTO PARA ENTREGA | REQUIERE CAMBIOS
- Siguiente agente sugerido: implementer (arreglar) | release-manager — comando: /sdd-ship
```
