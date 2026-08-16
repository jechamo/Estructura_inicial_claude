# Informe de seguridad · 011-automatizacion-determinista-tokens

- Fecha: 2026-08-16
- Alcance: `status`, `scaffold`, `trace-status`, `generate`, JSONC e instalación
- Estándares: OWASP Top 10:2025 · ASVS 5.0.0 L2
- Veredicto: **APTO**
- Hallazgos abiertos: CRÍTICO 0 · ALTO 0 · MEDIO 0 · BAJO 0
- Riesgos aceptados: ninguno
- Controles no ejecutados: ninguno

## Resultado

- `SEC-AUTO-001`: IDs y rutas permanecen dentro del repositorio; traversal, absolutas
  Windows/POSIX, UNC, separadores mixtos, symlink/junction y hardlink fallan cerrado.
- `SEC-AUTO-002`: programa y argv usan gramática cerrada, `shell:false`; shells, metacaracteres e
  instalación implícita se rechazan antes de ejecutar.
- `SEC-AUTO-003`: registro opt-in vacío, inputs/outputs observables, timeout entre 1 y 300 segundos
  (120 por defecto), fallo sin estado falso e identificación de drift.
- El programa aprobado conserva los permisos del usuario. La salida
  `approved-program-not-os-sandboxed` y la documentación no prometen aislamiento del SO.

## Evidencia

- `node scripts/test-install.mjs`: 313 correctas, 0 fallos; casos SEC de 011 incluidos.
- `node scripts/test-hooks.mjs`: 85 correctas, 0 fallos.
- `node scripts/scan-secrets.mjs --json`: 405 ficheros, 0 hallazgos.
- `git diff --check`: PASS.
- Revisión manual: sin nuevas primitivas de shell ni dependencias runtime.

<!-- sdd-security-report:v1 -->
```json
{
  "schemaVersion": 1,
  "spec": "011-automatizacion-determinista-tokens",
  "standards": {
    "owaspTop10": "2025",
    "asvs": "5.0.0",
    "level": "L2"
  },
  "scope": "diff",
  "controlsEvaluated": ["SEC-AUTO-001", "SEC-AUTO-002", "SEC-AUTO-003"],
  "openFindings": { "critical": 0, "high": 0, "medium": 0, "low": 0 },
  "verdict": "PASS",
  "acceptedRisks": [],
  "controlsNotExecuted": []
}
```

### HANDOFF
- Agente origen: security-auditor
- Fase completada: security-scan · verify
- Controles evaluados: SEC-AUTO-001, SEC-AUTO-002, SEC-AUTO-003
- Hallazgos: CRÍTICO 0 · ALTO 0 · MEDIO 0 · BAJO 0
- Riesgos aceptados: ninguno
- Controles no ejecutados: ninguno dentro del alcance de seguridad
- Veredicto: APTO
- Siguiente agente sugerido: release-manager tras strict, gates y CI
