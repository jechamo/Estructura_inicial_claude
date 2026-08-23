# Security-scan VERIFY · T-017-06

Veredicto: **APTO**. No quedan hallazgos abiertos ni controles sin ejecutar.

Los cuatro hallazgos anteriores quedan cerrados:

- El HMAC local se limita explícitamente a anticorrupción y mezcla entre clones; no pretende
  autenticar frente al mismo usuario. La autoridad de publicación es la CI completa del workflow
  exacto sobre el mismo SHA de `main`.
- La atestación de tag consulta el workflow por ruta exacta y valida `path`, SHA, rama, evento
  `push` y conclusión `success`.
- La metadata editorial aplica cuotas sobre el estado actual: 64 MiB por fichero, 256 MiB totales
  y 256 entradas. La reproducción con un fichero de 512 MiB fue rechazada.
- Solo `coverage`, `e2e` y `a11y` son IDs reutilizables literales, únicos y no namespaced, acotando
  también el resumen persistido.

La frontera de confianza queda coherente: el sello local evita reutilización accidental o
evidencia mezclada; la publicación requiere atestación remota exacta y falla cerrada si esta no
existe.

Evidencia independiente: hooks 183, circuit 61, trace 38, context 25, summary 26, release 42,
instalación 539/539, strict 017 y sintaxis en PASS. La reproducción adversarial de 512 MiB devolvió
`baselineAccepted: false` por superar la cuota editorial.

<!-- sdd-security-report:v1 -->
```json
{
  "schemaVersion": 1,
  "spec": "017-circuito-proporcional-contexto",
  "standards": {
    "owaspTop10": "2025",
    "asvs": "5.0.0",
    "level": "L2"
  },
  "scope": "diff · T-017-06",
  "controlsEvaluated": [
    "SEC-CIRCUIT-001",
    "SEC-CIRCUIT-002",
    "SEC-CIRCUIT-003",
    "SEC-CIRCUIT-004",
    "SEC-CIRCUIT-005",
    "SEC-CIRCUIT-006",
    "SEC-CONTEXT-001",
    "SEC-EVIDENCE-001",
    "SEC-EVIDENCE-002",
    "SEC-EVIDENCE-003"
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
- Alcance: T-017-06 y regresión de los diez controles de la spec 017
- Hallazgos: CRÍTICO 0 · ALTO 0 · MEDIO 0 · BAJO 0
- Riesgos aceptados: ninguno
- Controles no ejecutados: ninguno
- Veredicto: APTO
