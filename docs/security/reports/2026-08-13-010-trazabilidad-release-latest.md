# Informe de seguridad · 010-trazabilidad-release-latest

- Fecha: 2026-08-13
- Alcance: selector de spec activa, `trace-correct`, trazabilidad append-only y contrato manual de tag inmutable
- Estándares: OWASP Top 10:2025 · ASVS 5.0.0 L2
- Veredicto: **APTO**
- Hallazgos abiertos: CRÍTICO 0 · ALTO 0 · MEDIO 0 · BAJO 0
- Riesgos aceptados: ninguno
- Controles no ejecutados: ninguno

## Resultado

- `SEC-TRACE-001`: acepta IDs canónicos, confina las rutas y rechaza traversal, rutas absolutas,
  symlinks, junctions, hardlinks y enlaces colgantes. Los hooks validan el directorio canónico y
  abren el log por descriptor; ante un destino inseguro degradan a auditoría confinada.
- `SEC-TRACE-002`: conserva el historial, añade JSONL mediante append, valida estrictamente los
  logs y evita inyección en JSONL y Markdown.
- `SEC-TRACE-003`: la corrección es byte-idempotente y converge tras fallos parciales o carreras
  concurrentes. El lock verifica descriptor, pathname y token; un reemplazo o stale falla cerrado
  sin borrar el lock ajeno ni escribir trazas.
- `SEC-RELEASE-001`: el CLI no publica ni crea tags. `/sdd-ship` exige gates y CI verdes, permiso
  humano y un tag nuevo; prohíbe mover, borrar o forzar uno existente.

## Evidencia

- `node scripts/test-hooks.mjs`: 85 correctas, 0 fallos.
- `node scripts/test-install.mjs`: 299 correctas, 0 fallos.
- `node scripts/scan-secrets.mjs --json`: 405 ficheros analizados, 0 hallazgos.
- Comprobación sintáctica de CLI y hooks: correcta.
- `git diff --check`: sin incidencias.

<!-- sdd-security-report:v1 -->
```json
{
  "schemaVersion": 1,
  "spec": "010-trazabilidad-release-latest",
  "standards": {
    "owaspTop10": "2025",
    "asvs": "5.0.0",
    "level": "L2"
  },
  "scope": "diff completo de 010: selector de spec activa, trace-correct, trazabilidad append-only, documentación operativa y contrato de tag inmutable",
  "controlsEvaluated": ["SEC-TRACE-001", "SEC-TRACE-002", "SEC-TRACE-003", "SEC-RELEASE-001"],
  "openFindings": { "critical": 0, "high": 0, "medium": 0, "low": 0 },
  "verdict": "PASS",
  "acceptedRisks": [],
  "controlsNotExecuted": []
}
```

### HANDOFF
- Agente origen: security-auditor
- Fase completada: security-scan · verify
- Controles evaluados: SEC-TRACE-001, SEC-TRACE-002, SEC-TRACE-003, SEC-RELEASE-001
- Hallazgos: CRÍTICO 0 · ALTO 0 · MEDIO 0 · BAJO 0
- Riesgos aceptados: ninguno
- Controles no ejecutados: ninguno
- Veredicto: APTO
- Siguiente agente sugerido: release-manager tras strict, gates y CI
