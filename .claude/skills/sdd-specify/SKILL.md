---
name: sdd-specify
description: Crea la especificación de una funcionalidad nueva. Convierte la idea en requisitos EARS con criterios de aceptación testables. Sin decisiones técnicas.
disable-model-invocation: true
---

# /sdd-specify — Qué y por qué

Agente responsable: `@spec-analyst`.

## Paso 0 — Contexto

Lee `docs/architecture/constitution.md` (si existe) solo para conocer el dominio y el
vocabulario. **No** la uses para meter decisiones técnicas en la spec.

Si no existe constitución y el repo está vacío → avisa: falta `/sdd-init`.

## Paso 1 — Numeración y carpeta

Siguiente número libre en `docs/specs/`. Formato `NNN-slug-en-kebab-case`.
Copia `docs/specs/_TEMPLATE/` a `docs/specs/NNN-slug/`.

Si se trabaja con git, propón crear la rama `feature/NNN-slug` (no la crees sin permiso).

## Paso 2 — Escribir `spec.md`

Secciones obligatorias:

1. **Metadatos** — id, título, autor, fecha, estado (`borrador`), dependencias con otras specs.
2. **Problema** — qué duele hoy, a quién, con qué frecuencia, qué coste tiene no arreglarlo.
3. **Objetivo y métrica de éxito** — cómo sabremos que funcionó (número, no adjetivo).
4. **Usuarios y contexto de uso** — perfiles, escenario real, frecuencia.
5. **Requisitos funcionales (EARS)** — numerados `RF-01`…
   - `El sistema DEBE <respuesta>.`
   - `CUANDO <disparador>, el sistema DEBE <respuesta>.`
   - `MIENTRAS <estado>, el sistema DEBE <respuesta>.`
   - `SI <condición no deseada>, ENTONCES el sistema DEBE <respuesta>.`
6. **Requisitos no funcionales** — rendimiento (p95), disponibilidad, escala, seguridad y
   privacidad, accesibilidad (WCAG 2.2 AA), i18n, observabilidad, coste, retención de datos.
7. **Criterios de aceptación** — numerados `CA-01`…, en Gherkin, ligados a su `RF`.
8. **Casos límite** — vacío, extremos, concurrencia, sin permisos, sistema externo caído,
   datos corruptos, reintentos.
9. **Reglas de negocio** — invariantes que deben cumplirse siempre.
10. **Fuera de alcance** — explícito. Tan importante como el alcance.
11. **Riesgos y dependencias**.
12. **Supuestos** — lo que has decidido tú y el usuario debe validar.
13. **Glosario** — lenguaje ubicuo del dominio.
14. **Preguntas abiertas** — cada una como `[NEEDS CLARIFICATION: ...]` en su sitio.

## Reglas duras

- **Cero tecnología.** Nada de tablas, endpoints, frameworks, librerías o nombres de clase.
  Si aparece, bórralo: es trabajo del `planner`.
- Si no sabes escribir el test de un requisito, el requisito no está claro. Márcalo.
- Un requisito con "y" suele ser dos requisitos.
- No inventes: lo que no sepas y cambie el resultado, va como `[NEEDS CLARIFICATION]`.

## Paso 3 — Autorrevisión antes de entregar

- [ ] Cada `RF` tiene al menos un `CA`
- [ ] Cada `CA` es observable y automatizable
- [ ] Hay sección de casos límite no vacía
- [ ] Hay requisitos no funcionales (no los olvides: es el error más común)
- [ ] Hay "fuera de alcance"
- [ ] No hay ninguna decisión técnica
- [ ] Los marcadores `[NEEDS CLARIFICATION]` están donde deben

## Cierre

```
### HANDOFF
- Agente origen: spec-analyst
- Fase completada: specify
- Artefacto: docs/specs/NNN-slug/spec.md
- Requisitos: <n> RF · <n> RNF · <n> CA
- Marcadores pendientes: <n>
- Siguiente agente sugerido: spec-analyst — comando: /sdd-clarify (si hay marcadores)
                              o planner — comando: /sdd-plan
```
