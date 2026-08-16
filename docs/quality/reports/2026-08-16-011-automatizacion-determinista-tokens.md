# Informe de calidad · 011-automatizacion-determinista-tokens

- Fecha: 2026-08-16
- Veredicto técnico local: **PASS**
- Suite instalador: 315/315
- Suite hooks: 85/85
- Seguridad: PASS · 0 hallazgos abiertos
- Revisión benchmark/código: GO · 0 P0, 0 P1 y 0 P2 abiertos

## Resultado funcional

- `status --json` entrega un snapshot v1 y distingue cero, una o varias specs activas.
- Las specs con tareas bloqueadas siguen visibles como activas y remiten a `/sdd-implement`.
- `scaffold` materializa únicamente plantillas canónicas, respeta gates, soporta `--dry-run` y no
  sobrescribe.
- `scaffold plan` solo omite diseño con `sin-ui` y una justificación material.
- `trace-status` calcula cobertura y huérfanos sin crear tareas.
- `check-sdd --json` conserva el veredicto y exit code del gate humano.
- `generate` es opt-in, neutral al stack, sin shell, con timeout y drift observable.
- Greenfield, brownfield, update, idempotencia y allowlist del paquete están cubiertos.

## Benchmark

Los cinco pares conservan el 100 % de las expectativas. La reducción estimada mediana es
**43,33 %**, por encima del 20 % exigido. La API no expone tokens reales: el proxy usa bytes exactos
de las skills activadas y del resultado persistido. Cada ejecución conserva argv, stdout, stderr,
exit code, hashes y artefactos en `docs/quality/benchmarks/011/`.

El coste semántico permanece: requisitos, arquitectura, campos de DTO, tareas, seguridad,
usabilidad, TDD y evidencia no se automatizan.

## Portabilidad pendiente de release

La matriz Windows/Linux con Node 18/20/22 está definida en GitHub Actions, pero no se afirma como
ejecutada sobre estos cambios porque no se hizo commit ni push. El informe acredita los gates
locales; la publicación queda condicionada al CI del SHA exacto.

### HANDOFF
- Agente origen: code-reviewer
- Fase completada: revisión técnica local 011
- Gates automáticos: test-install 315/315 · test-hooks 85/85 · skills-sync PASS
- Benchmark: calidad 100 % · mediana 43,33 %
- Seguridad: PASS
- Veredicto: APTO localmente; release condicionada a CI
