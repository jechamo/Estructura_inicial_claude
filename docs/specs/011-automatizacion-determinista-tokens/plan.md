# Plan técnico · 011-automatizacion-determinista-tokens

## 1. Enfoque

Ampliar `scripts/sdd-project.mjs` como CLI canónico, sin runtime dependencies. Los comandos leen
artefactos durables y emiten contratos JSON versionados. Las skills quedan como router y criterio;
las plantillas/referencias largas se cargan solo cuando aplican.

## 2. Contratos

```text
node scripts/sdd-project.mjs status --json [--spec NNN]
node scripts/sdd-project.mjs scaffold --spec NNN --phase design|plan|tasks|verify [--dry-run]
node scripts/sdd-project.mjs trace-status --spec NNN --json
node scripts/check-sdd.mjs --json [--strict] [--spec NNN]
node scripts/sdd-project.mjs generate <id> [--dry-run]
```

Todos los JSON incluyen `schemaVersion: 1`. `scaffold` resuelve un único directorio `NNN-*` y
usa este mapa cerrado:

| Fase | Plantilla | Destino |
|---|---|---|
| design | `docs/specs/_TEMPLATE/design.md` | `design.md` |
| plan | `plan.md`, `data-model.md`, `research.md`, `contracts/.gitkeep` | mismas rutas |
| tasks | `tasks.md`, `test-plan.md` | mismas rutas |
| verify | `evidence.md` | `evidence.md` |

El registro `.sdd/generators.json` tiene `schemaVersion` y `generators`. Cada entrada declara ID,
programa, argv, inputs, outputs, owner y un timeout opcional acotado. El proceso se lanza con
`spawnSync(program, args, {shell:false, timeout})`; antes y después se comprueban rutas, enlaces,
hardlinks y existencia/drift. El límite por defecto es 120 segundos y el rango permitido, 1–300.
El programa es confiable y aprobado por una persona: el runner confina las rutas declaradas, no
sandboxea el proceso ni garantiza que un ejecutable malicioso carezca de otros efectos laterales.

## 3. Estado y trazabilidad

`status` lee installed/product/security/usability/docs, specs reales, cabeceras de estado, tareas
por bloque, artefactos presentes y `git status --porcelain`. El siguiente paso sale de una tabla
cerrada de fases, no de inferencia generativa.

`trace-status` separa declaraciones fuente de referencias de ejecución. Un ID está cubierto solo
si aparece en una fila de trazabilidad con tarea, test o evidencia según corresponda. Nunca crea
ni modifica documentos.

## 4. Seguridad

| Control | ASVS | OWASP | Aplica | Decisión | Tarea | Test | Evidencia |
|---|---|---|---|---|---|---|---|
| SEC-AUTO-001 | ASVS 5.0.0 V5.3.2 | A01:2025 | sí | resolver IDs/rutas dentro de root y rechazar symlink, junction, hardlink, absoluta, UNC y traversal | T-011-03 | `scripts/test-install.mjs::automatizacion_rutas_confinadas` | `evidence.md#SEC-AUTO-001` |
| SEC-AUTO-002 | ASVS 5.0.0 V1.2.5, V15.3.5 | A03:2025, A05:2025 | sí | gramática cerrada; `shell:false`; sin flags/programas de shell ni expansión | T-011-04 | `scripts/test-install.mjs::generadores_sin_shell` | `evidence.md#SEC-AUTO-002` |
| SEC-AUTO-003 | ASVS 5.0.0 V16.5.2, V16.5.3 | A08:2025, A10:2025 | sí | registro validado, inputs presentes, timeout acotado, outputs observables y fallo cerrado; no instalar dependencias | T-011-04 | `scripts/test-install.mjs::generadores_opt_in_y_drift` | `evidence.md#SEC-AUTO-003` |

## 5. Usabilidad

`sin-ui`: CLI y skills. Mensajes humanos indican comando, causa y acción; JSON queda estable para
máquinas. No se automatizan decisiones ni se presenta una fase creada como aprobada.

## 6. Documentación

| DOC-ID | Aplica | Fuente | Artefacto | Propietario | Tarea | Gate/test | Evidencia |
|---|---|---|---|---|---|---|---|
| DOC-AUTO | sí | CLI | `README.md`, `docs/guides/COMO-TRABAJAR-CON-LOS-AGENTES.md` | docs-writer | T-011-06 | `scripts/test-install.mjs::automatizacion_documentada` | `evidence.md#DOC-AUTO` |
| DOC-SKILLS | sí | skills canónicas | `.agents/skills/*/SKILL.md`, `references/**` | implementer | T-011-05 | `scripts/test-install.mjs::skills_consumen_snapshots` | `evidence.md#DOC-SKILLS` |
| DOC-GEN | sí | `.sdd/generators.json` | `.sdd/README.md`, guía de agentes | docs-writer | T-011-06 | `scripts/test-install.mjs::generadores_versionados` | `evidence.md#DOC-GEN` |

## 7. Benchmark

Se conserva una copia de skills `v0.6.0` como baseline de ejecución, no como segunda skill
instalada. Evals representativos miden estado, ADR, spec/plan/tareas, documentación y verify.
Cada caso registra tokens, duración y grading funcional. Solo se integra una candidata con
calidad equivalente y reducción ≥20 % en mediana de tokens o ≥30 % en tiempo.

## 8. Despliegue y reversión

El registro nace vacío. Update preserva entradas existentes y propone conflicto si el JSON es
inválido. Reversión: `git revert` de la implementación; no hay migración de código de aplicación.

## 9. Gate humano de plan

| Campo | Valor |
|---|---|
| **Estado** | `approved` |
| **Persona** | usuario |
| **Fecha** | 2026-08-16 |
| **Alcance aprobado** | implementación literal de Spec 011 |
| **Condiciones / riesgos aceptados** | calidad prevalece sobre ahorro; generadores opt-in |

### HANDOFF
- Agente origen: planner
- Fase completada: plan
- Fuentes consultadas: spec 011, CLI/instalador/skills actuales, `skill-creator`
- Artefactos: `plan.md`, `tasks.md`, `test-plan.md`
- Requisitos / casos cubiertos: RF-01…RF-08 · CA-01…CA-07
- Discrepancias: ninguna
- Decisiones tomadas: CLI único; JSON v1; registro vacío; progressive disclosure medido
- Supuestos: las herramientas de stack ya existen si un proyecto registra un generador
- Bloqueos: ninguno para RED
- Siguiente agente sugerido: implementer
- Comando / contexto durable: `/sdd-implement 011`
