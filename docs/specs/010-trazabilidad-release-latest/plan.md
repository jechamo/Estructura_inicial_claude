# Plan técnico · 010-trazabilidad-release-latest

## 1. Enfoque

Separar tres responsabilidades: parseo de tareas, resolución de spec activa y rectificación
durable. Los hooks siguen sin dependencias; el CLI reutiliza validaciones de raíz y escribe solo
después de validar completamente origen, destino y sesión.

## 2. Componentes

- `.sdd/hooks/_lib.mjs`: parser de bloques `T-*`, resolución `{ spec, reason, candidates }` y
  compatibilidad confinada de `SDD_SPECS_DIR`.
- Hooks de subagente/sesión: propagan el motivo cuando no existe una atribución única.
- `scripts/sdd-project.mjs`: comando `trace-correct` con validación e idempotencia.
- README/guía/CHANGELOG: contrato `main` móvil frente a tag estable.

## 3. Contrato CLI

```text
node scripts/sdd-project.mjs trace-correct \
  --from-spec NNN --to-spec NNN --session <id> --reason <texto> [--json]
```

Salida JSON estable: `status`, `fromSpec`, `toSpec`, `session`, `eventsMatched`, `writes`.
`status` será `corrected` o `already-corrected`. Los IDs numéricos se resuelven a una única
carpeta `NNN-*`; no se aceptan rutas.

Los eventos nuevos incluyen `correctionId` determinista, specs origen/destino, sesión, motivo y
cantidad de eventos afectados. La bitácora se selecciona con la fecha de los eventos corregidos;
si abarcan meses distintos, se escribe una rectificación por mes.

Un lock exclusivo bajo `.sdd/state/` serializa el ciclo completo de lectura, decisión y append.
Quien pierde la carrera espera, vuelve a leer los IDs durables y devuelve `already-corrected`.

## 4. Seguridad

| Control | ASVS | OWASP | Aplica | Decisión | Tarea | Test | Evidencia |
|---|---|---|---|---|---|---|---|
| SEC-TRACE-001 | ASVS 5.0.0 V5.3.2 | A01:2025 | sí | aceptar IDs, confinar directorio configurado/canónico y abrir logs por descriptor rechazando enlaces | T-010-03 | `scripts/test-install.mjs::trace_correct_seguridad_rutas_hooks_y_lock` | `evidence.md#SEC-TRACE-001` |
| SEC-TRACE-002 | ASVS 5.0.0 V16.4.1, V16.4.2 | A08:2025, A09:2025 | sí | JSONL inyectable-safe y append-only; motivo acotado; validación previa | T-010-03 | `scripts/test-install.mjs::trace_correct_append_only_e_idempotente` | `evidence.md#SEC-TRACE-002` |
| SEC-TRACE-003 | ASVS 5.0.0 V16.5.3 | A10:2025 | sí | cada destino converge tras fallo parcial o carrera; el lock conserva identidad/token y nunca roba uno reemplazado/stale | T-010-03 | `scripts/test-install.mjs::trace_correct_seguridad_rutas_hooks_y_lock` | `evidence.md#SEC-TRACE-003` |
| SEC-RELEASE-001 | ASVS 5.0.0 n/a · control local `/sdd-ship` | A03:2025 | sí | tag solo tras gates/CI; rechazo si ya existe; sin force | T-010-05 | `scripts/test-install.mjs::release_rechaza_tag_existente_o_ci_rojo` | `evidence.md#SEC-RELEASE-001` |

## 5. Usabilidad

`sin-ui`: no hay pantalla, formulario, microcopy de aplicación ni espera perceptible. La salida
CLI conserva mensajes accionables, pero no requiere informe WCAG para esta spec.

## 6. Matriz de impacto documental

| DOC-ID | Aplica | Fuente | Artefacto | Generado/manual | Propietario | Tarea | Gate/test | Evidencia |
|---|---|---|---|---|---|---|---|---|
| DOC-VCS | sí | resolución npm/git | `README.md`, `docs/guides/INSTALACION.md` | manual | docs-writer | T-010-04 | `scripts/test-install.mjs::instalacion_main_movil_y_tag_estable` | `evidence.md#DOC-VCS` |
| DOC-TRACE | sí | hooks y CLI | `.sdd/hooks/README.md`, `.sdd/README.md` | manual | implementer/docs-writer | T-010-04 | `node scripts/check-sdd.mjs --strict --spec 010` | `evidence.md#DOC-TRACE` |
| DOC-OPS | sí | versión y entrega | `CHANGELOG.md`, evidencia y bitácora | manual | release-manager | T-010-05 | `scripts/test-install.mjs::release_rechaza_tag_existente_o_ci_rojo` | `evidence.md#DOC-OPS` |

## 7. Despliegue y reversión

Sin migración destructiva. Los eventos correctivos son aditivos. Reversión del código mediante
`git revert <commit-010>`; el tag solo se crea después del commit y nunca se mueve.

## 8. Gate humano de plan

| Campo | Valor |
|---|---|
| **Estado** | `approved` |
| **Persona** | usuario |
| **Fecha** | 2026-08-13 |
| **Alcance aprobado** | implementación literal del plan solicitado |
| **Condiciones / riesgos aceptados** | ninguna escritura destructiva; tag condicionado a CI verde |

### HANDOFF
- Agente origen: planner
- Fase completada: plan
- Fuentes consultadas: spec 010 aprobada, hooks y CLI existentes
- Artefactos: `plan.md`, `test-plan.md`, `tasks.md`
- Requisitos / casos cubiertos: RF-01…RF-07 · CA-01…CA-07
- Discrepancias: ninguna adicional
- Decisiones tomadas: parser por bloques; CLI solo acepta IDs; corrección idempotente
- Supuestos: Node 18+ y Git disponible solo para la fase de release
- Bloqueos: ninguno para TDD
- Siguiente agente sugerido: implementer
- Comando / contexto durable: `/sdd-implement 010`
