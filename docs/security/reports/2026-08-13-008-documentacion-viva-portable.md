# Informe de seguridad · 008-documentacion-viva-portable

- Fecha: 2026-08-13
- Alcance: implementación de la spec 008 y correcciones finales de confinamiento del instalador
- Estándares: OWASP Top 10:2025 · ASVS 5.0.0 L2
- Veredicto: **APTO**
- Hallazgos abiertos: CRÍTICO 0 · ALTO 0 · MEDIO 0 · BAJO 0
- Riesgos aceptados: ninguno
- Controles no ejecutados: ninguno

## Resultado

Los seis controles `SEC-DOCS-001` a `SEC-DOCS-006` están verificados.

Los hallazgos de la auditoría anterior quedan cerrados:

- El instalador centraliza las operaciones sobre el proyecto en `rutaDestinoSegura`.
- Rechaza rutas absolutas, traversal, bytes NUL y symlinks/junctions en cualquier prefijo interno.
- Repite la validación después de crear directorios y antes de escribir el registro.
- Valida las claves `files` y `ficheros` de `installed.json` antes de leerlas, escribirlas o borrarlas.
- Las regresiones confirman que una junction en `.sdd` no permite escribir fuera y que una clave
  `../` del manifiesto falla cerrada antes de usarse.
- La trazabilidad de `SEC-DOCS-002` referencia correctamente OWASP A01:2025 y ASVS 5.0.0 V5.3.2.
- El instalador continúa sin ejecutar Git ni modificar permisos.
- El escaneo de secretos no detectó hallazgos.

<!-- sdd-security-report:v1 -->
```json
{
  "schemaVersion": 1,
  "spec": "008-documentacion-viva-portable",
  "standards": {
    "owaspTop10": "2025",
    "asvs": "5.0.0",
    "level": "L2"
  },
  "scope": "implementación completa de la spec 008 y correcciones finales de confinamiento del instalador",
  "controlsEvaluated": [
    "SEC-DOCS-001",
    "SEC-DOCS-002",
    "SEC-DOCS-003",
    "SEC-DOCS-004",
    "SEC-DOCS-005",
    "SEC-DOCS-006"
  ],
  "openFindings": {
    "critical": 0,
    "high": 0,
    "medium": 0,
    "low": 0
  },
  "verdict": "PASS",
  "acceptedRisks": [],
  "controlsNotExecuted": []
}
```

### HANDOFF
- Agente origen: security-auditor
- Fase completada: security-scan · verify
- Controles evaluados: SEC-DOCS-001…SEC-DOCS-006
- Hallazgos: CRÍTICO 0 · ALTO 0 · MEDIO 0 · BAJO 0
- Riesgos aceptados: ninguno
- Controles no ejecutados: ninguno
- Veredicto: APTO
- Siguiente agente sugerido: release-manager tras los gates de calidad y el gate humano
