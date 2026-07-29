# Workflow: nueva funcionalidad (circuito B)

Flujo completo para añadir una funcionalidad a un proyecto que **ya tiene** arquitectura
decidida. Ejecuta los pasos en orden; no saltes ninguno.

Reglas del proyecto: @AGENTS.md · Arquitectura: @docs/architecture/constitution.md

---

## 1. Especificar

Adopta el perfil de @.claude/agents/spec-analyst.md.

Crea `docs/specs/NNN-slug/spec.md` con: problema · objetivo medible · usuarios ·
requisitos funcionales en **EARS** · requisitos no funcionales · criterios de aceptación en
**Gherkin** · casos límite · reglas de negocio · **fuera de alcance** · riesgos · supuestos.

**Cero tecnología.** Lo que no sepas → `[NEEDS CLARIFICATION: ...]`.

## 2. Clarificar

Mismo perfil. Máximo 5 preguntas por ronda, cada una con opciones concretas y tu recomendación.
Registra en `clarifications.md`. **La spec no avanza con marcadores pendientes.**

## 3. Planificar

Adopta el perfil de @.claude/agents/planner.md.

Produce `research.md`, `data-model.md`, `contracts/`, `test-plan.md` y `plan.md`.
Justifica cada patrón aplicado. Consulta a los especialistas de @.claude/agents/ cuando el
tema sea de su terreno.

Si el plan viola la constitución → para y adopta el perfil de @.claude/agents/architect.md
para escribir el ADR correspondiente.

## 4. Trocear

Mismo perfil. `tasks.md` con tareas atómicas, ordenadas **de dentro hacia fuera**
(domain → application → infrastructure → interfaces), cada una con su test y su
trazabilidad a RF/CA.

## 5. Implementar

Adopta el perfil de @.claude/agents/implementer.md. **Una tarea por ciclo**:

1. 🔴 Test que falla. **Pega la salida real del fallo.**
2. 🟢 Código mínimo. Test verde + suite completa verde. Pega la salida.
3. 🔵 Refactor con SOLID, tests en verde.
4. `tasks.md` → `hecho`.

## 6. Verificar

Adopta @.claude/agents/code-reviewer.md y luego @.claude/agents/security-auditor.md.

Gates automáticos (tests, cobertura, lint, typecheck, build, auditoría de dependencias),
trazabilidad RF→CA→test, revisión del diff, auditoría SOLID, auditoría de seguridad OWASP.

**CRÍTICO o ALTO en seguridad bloquea la entrega.**

## 7. Entregar

Adopta @.claude/agents/release-manager.md.

Verifica la DoD de AGENTS.md §7, prepara el PR con tabla de cobertura, actualiza el CHANGELOG,
registra en `docs/bitacora/DECISIONS.md` y escribe el plan de reversión.

**No hagas push, PR, merge ni deploy sin permiso explícito del usuario.**

---

Al terminar cada paso, cierra con el bloque `### HANDOFF` de AGENTS.md §10.
