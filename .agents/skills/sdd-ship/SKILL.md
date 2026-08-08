---
name: sdd-ship
description: "Prepara la entrega: verificación final de gates, PR con trazabilidad, CHANGELOG, bitácora y plan de reversión. No hace push ni merge sin permiso explícito."
---

# /sdd-ship — Entregar

Agente responsable: `@release-manager`.

## Regla absoluta

**No ejecutas `git push`, ni abres PR, ni mergeas, ni etiquetas, ni despliegas** sin que el
usuario lo pida explícitamente en este turno. Preparas todo y muestras los comandos.

## Paso 1 — Gates

```bash
node scripts/check-sdd.mjs --strict
```

Recorre después la DoD de `AGENTS.md` §7 y ejecuta lo ejecutable, pegando la salida real.
Si `/sdd-verify` no se ha pasado, ejecútalo antes. Cualquier gate en rojo → **para**.

## Paso 1b — Decisión GO / NO-GO

`evidence.md` §5 arranca en `NO-GO`. Cambiarlo a `GO` **no es una formalidad**: es la
decisión de que el riesgo residual es aceptable, y la toma una persona, no el agente.

Presenta al humano, en cinco líneas:

| Qué | Contenido |
|---|---|
| **Qué se entrega** | La spec y su valor, en una frase |
| **Qué se ha verificado** | Con la salida real, no con adjetivos |
| **Qué NO se ha verificado** | La sección de controles no ejecutados de `evidence.md` |
| **Riesgo residual** | Qué puede salir mal y a quién afecta |
| **Cómo se revierte** | Comando exacto y tiempo estimado |

**Tú no marcas `GO`.** Recomiéndalo si procede, y espera la aprobación explícita.
Un `GO` firmado por quien produjo el trabajo no es una revisión: es una firma en blanco.

## Paso 2 — Commits

Verifica formato y trazabilidad:
`<tipo>(NNN): <descripción> — task T-NNN-XX`

Tipos: `feat` `fix` `refactor` `perf` `test` `docs` `build` `ci` `chore`.
Rompedor: `feat(042)!:` + `BREAKING CHANGE:` en el cuerpo.

Si faltan referencias y la rama no está compartida, propón la reescritura (no la hagas sin permiso).

## Paso 3 — CHANGELOG

Keep a Changelog + SemVer. Escrito para **usuarios**, no para desarrolladores.
Secciones: Added · Changed · Deprecated · Removed · Fixed · Security.

Versión: `MAJOR` si rompe contrato público · `MINOR` si añade compatible · `PATCH` si corrige.

## Paso 4 — Pull request (preparado, no enviado)

Usa la plantilla de `@release-manager`: Qué · Por qué (spec) · Cómo (patrones, ADR) ·
Tabla de cobertura RF→CA→test · Verificación con salida real · Seguridad · Riesgos y
reversión · Checklist.

## Paso 5 — Resumen ejecutivo

El PR y el CHANGELOG los leen desarrolladores. Quien decide sobre presupuesto y prioridad, no.

Plantilla: `docs/quality/_TEMPLATE.executive-summary.md`.
Qué hicimos en una frase sin jerga · por qué importa · resultados con números · qué sigue.
Máximo 300 palabras.

**Toda cifra está verificada y se rastrea hasta `evidence.md`.** Sin medición se escribe "sin
medición todavía" y cuándo la habrá. Una proyección inventada quema la credibilidad de todos los
resúmenes siguientes.

## Paso 6 — Bitácora

Pide a `@bitacora-keeper` la entrada de cierre: qué se entregó, decisiones tomadas,
alternativas descartadas, deuda aceptada **con cifra** y fecha de revisión.

## Paso 7 — Post-despliegue

Deja escrito:
- Qué métrica se vigila y durante cuánto tiempo.
- Umbral que dispara la reversión.
- Comando exacto de reversión.
- Cuándo se retira el feature flag.
- **Salud de la nueva versión**: tasa de fallo de sesión, errores por hora y usuarios afectados,
  comparados con la versión anterior. Es lo que convierte "creo que va bien" en un dato.

## Paso 8 — Estado

- `tasks.md`: todas las tareas del alcance en `hecho`.
- `spec.md`: estado → `entregada`.

## Cierre

```
### HANDOFF
- Agente origen: release-manager
- Spec: NNN-slug → entregada
- Gates: <todos verdes | bloqueado por X>
- Versión propuesta: vX.Y.Z
- Resumen ejecutivo: <ruta> · cifras verificadas: sí | "sin medición todavía"
- PR preparado (NO enviado): <título>
- Comandos para el humano:
    git push -u origin feature/NNN-slug
    gh pr create --title "..." --body-file .github/pr-body.md
- Reversión: <comando y tiempo estimado>
- Vigilancia post-despliegue: <métrica · ventana · umbral>
```
