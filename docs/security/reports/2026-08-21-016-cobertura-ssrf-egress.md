# Informe de seguridad · 016-cobertura-ssrf-egress

**Fecha:** 2026-08-21
**Modo:** `/security-scan verify`
**Alcance:** diff y evidencias de la spec 016, incluido el contrato portable SSRF/egress, su instalación y la corrección concurrente de `trace-correct`.
**Estándares:** OWASP Top 10:2025 · ASVS 5.0.0 L2 · [OWASP SSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html)
**Impacto:** sensible
**JWT/cookies/bearer:** no aplica; la spec no introduce autenticación, sesiones ni credenciales de navegador.

## Resultado

Los once controles `SEC-SSRF-001..011` están implementados, trazados y ejercidos. No se han identificado hallazgos abiertos.

| Control | Estado | Evidencia principal |
|---|---|---|
| SEC-SSRF-001 | superado | decisión explícita sobre destino solicitado y allowlist; contrato fuente/instalado y test específico verde |
| SEC-SSRF-002 | superado | protocolo solicitado identificado y permitido/rechazado explícitamente |
| SEC-SSRF-003 | superado | canonización, clasificación y evaluación de todas las direcciones A/AAAA antes de conectar |
| SEC-SSRF-004 | superado | redirecciones automáticas deshabilitadas o revalidación de cada salto |
| SEC-SSRF-005 | superado | metadata de infraestructura rechazada sin excepción |
| SEC-SSRF-006 | superado | destinos locales, privados o link-local rechazados o sujetos a excepción con responsable, alcance, motivo, evidencia y revisión |
| SEC-SSRF-007 | superado | aplicabilidad, estado, decisión y evidencia separados; ausencia de ejecución nunca equivale a `PASS`; contenido externo tratado como dato no confiable |
| SEC-SSRF-008 | superado | timeout, cancelación y reintentos acotados, o hallazgo obligatorio por ausencia |
| SEC-SSRF-009 | superado | límite máximo de respuesta y procesamiento, con pruebas de frontera delegadas al proyecto consumidor |
| SEC-SSRF-010 | superado | evidencia minimizada; escaneo de 575 ficheros con 0 secretos |
| SEC-SSRF-011 | superado | fuente canónica idéntica en instalación, adaptador mínimo y paridad de 20 agentes/27 skills |

Las pruebas semánticas están restringidas a la sección SSRF/egress de cada contrato. Las mutaciones negativas demuestran que quitar el motivo/revisión de una excepción o mezclar aplicabilidad y estado vuelve roja la suite, evitando que texto equivalente situado en otra sección produzca un falso verde.

## Corrección concurrente revisada

La modificación de `scripts/sdd-project.mjs` mantiene el comportamiento fail-closed:

- Solo reintenta `ENOENT` después de que `openSync(..., "wx")` haya observado un lock existente que desaparece durante su validación.
- El deadline sigue comprobándose en cada iteración, por lo que una rotación continua no permite espera indefinida.
- Errores por enlaces, hardlinks, reemplazo de identidad o escape de ruta no se absorben.
- La liberación conserva la comprobación de descriptor, inode/dispositivo y token antes de eliminar el lock.

Quedaron verdes los casos de concurrencia, rotación con timeout, sustitución del lock, lock stale y reanudación tras append parcial.

## Evidencia automática

| Comprobación | Resultado |
|---|---|
| `node scripts/test-install.mjs` | `536 correctas · 0 fallos` |
| `node scripts/check-sdd.mjs --json --strict --spec 016` | `ok=true`; 0 problemas, 0 avisos |
| `node scripts/scan-secrets.mjs --json` | 575 ficheros; 0 hallazgos |
| `node scripts/skills-sync.mjs --check` | manifiesto y política correctos; 20 agentes/27 skills |
| `node scripts/sdd-project.mjs trace-status --spec 016 --json` | `complete=true`; 0 referencias ausentes |
| `node scripts/sdd-project.mjs run --fast` | PASS |
| `node scripts/sdd-project.mjs run --slow --json` | PASS: secretos 575/0, cobertura 50,3 % sobre 2900 líneas, a11y 3 páginas y E2E 536/536 |
| Revisión independiente de código | 0 hallazgos; APTO |

## Verificaciones posteriores que no se presentan como PASS

| Verificación | Estado | Naturaleza | Riesgo y siguiente paso |
|---|---|---|---|
| CI Windows/Linux × Node 18/20/22 | no ejecutada | gate de release y compatibilidad posterior al push; no es un control `SEC-SSRF-*` | ejecutar el workflow y exigir matriz verde antes del tag |
| Smoke vivo de los seis hosts | no ejecutado | comprobación manual de compatibilidad; no es un control `SEC-SSRF-*` | ejecutar o conservar explícitamente su estado no observado antes de afirmar compatibilidad viva |

Estas comprobaciones no alimentan `controlsNotExecuted` del informe de seguridad porque no son controles de seguridad aplicables de la matriz `SEC-SSRF-001..011`. Tampoco quedan certificadas por este informe ni autorizan por sí solas la release.

## Hallazgos y riesgos

- CRÍTICO: 0
- ALTO: 0
- MEDIO: 0
- BAJO: 0
- Riesgos de seguridad aceptados: ninguno
- Controles de seguridad no ejecutados: ninguno
- Veredicto de seguridad: **APTO**

Este veredicto permite cerrar la auditoría de seguridad de la spec. El `GO` global de entrega y el tag siguen sujetos a los gates de release pendientes.

<!-- sdd-security-report:v1 -->
```json
{
  "schemaVersion": 1,
  "spec": "016-cobertura-ssrf-egress",
  "standards": {
    "owaspTop10": "2025",
    "asvs": "5.0.0",
    "level": "L2"
  },
  "scope": "diff",
  "controlsEvaluated": [
    "SEC-SSRF-001",
    "SEC-SSRF-002",
    "SEC-SSRF-003",
    "SEC-SSRF-004",
    "SEC-SSRF-005",
    "SEC-SSRF-006",
    "SEC-SSRF-007",
    "SEC-SSRF-008",
    "SEC-SSRF-009",
    "SEC-SSRF-010",
    "SEC-SSRF-011"
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
- Fuentes consultadas: perfil del auditor; skill de security-scan; checklist; constitución; spec/plan/tasks/test-plan/evidence 016; harness y CLI
- Estándares: OWASP Top 10:2025 · ASVS 5.0.0 L2
- Alcance: diff de la spec 016, contrato portable instalado, pruebas y corrección concurrente de `trace-correct`
- Controles evaluados: SEC-SSRF-001 a SEC-SSRF-011
- Evidencias y comandos: test-install 536/536; strict 016 0/0; secrets 575/0; trace-status completo; skills-sync correcto; fast PASS; slow PASS
- Hallazgos: CRÍTICO 0 · ALTO 0 · MEDIO 0 · BAJO 0
- Riesgos aceptados: ninguno
- Controles no ejecutados: ninguno dentro de la matriz de seguridad; CI multi-OS y smokes vivos permanecen pendientes como gates de release/compatibilidad y no se presentan como PASS
- Veredicto: APTO
- Informe a materializar: `docs/security/reports/2026-08-21-016-cobertura-ssrf-egress.md`
- Siguiente agente sugerido: agente invocador; después release-manager
