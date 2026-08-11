# Plan de test · 007-seguridad-jwt-owasp-2025

## Controles de seguridad y casos adversos

| Control | Criterios | Test / evidencia | Caso adverso principal |
|---|---|---|---|
| SEC-STD-001 | CA-01 | `scripts/test-install.mjs::seguridad_versionada` | una referencia Top 10:2021 no satisface el contrato |
| SEC-TRACE-001 | CA-02 | `scripts/test-install.mjs::matriz_seguridad` | un control aplicable sin tarea, test o evidencia bloquea |
| SEC-JWT-001 | CA-03 | `scripts/test-install.mjs::contrato_jwt` | `alg: none`, claim ausente, token de tipo incorrecto y refresh reutilizado |
| SEC-CSRF-001 | CA-04 | `scripts/test-install.mjs::csrf_no_samesite_solo` | credenciales automáticas protegidas solo por SameSite |
| SEC-GATE-001 | CA-05 | `scripts/test-install.mjs::gate_security_e_informe` | GO con CRÍTICO/ALTO, JSON inválido o riesgo MEDIO sin aceptar |
| SEC-SUPPLY-001 | CA-08 | `scripts/test-install.mjs::workflow_supply_chain` | action móvil o auditoría omitida presentada como verde |

## 1. Alcance

Contrato documental, parsers/gates, router, instalador, paquete y workflow. No se implementa ni
prueba una aplicación JWT real; se verifica que cada proyecto que la elija reciba requisitos y
casos adversos suficientes.

## 2. Mapa criterio → test

| CA | Comportamiento | Nivel | Test |
|---|---|---|---|
| CA-01 | estándares versionados | integración | `test-install::seguridad_versionada` |
| CA-02 | matriz completa y bloqueante | integración | `test-install::matriz_seguridad` |
| CA-03 | referencia JWT completa | contrato | `test-install::contrato_jwt` |
| CA-04 | SameSite no sustituye CSRF | contrato | `test-install::csrf_no_samesite_solo` |
| CA-05 | informe/veredicto/gate | integración | `test-install::gate_security_e_informe` |
| CA-06 | router y handoff | contrato | `test-hooks::auth_feature_vs_auditoria` |
| CA-07 | instalación y paridad | E2E local | greenfield/brownfield/idempotencia |
| CA-08 | workflow fijado y honesto | contrato | `test-install::workflow_supply_chain` |

## 3. Casos adversos JWT que la plantilla exigirá downstream

- `alg:none`, algoritmo no permitido y confusión MAC/firma.
- Firma alterada, clave o `kid` desconocidos.
- `iss`/`aud` incorrectos, `exp` vencido, `nbf` futuro, `sub` ausente.
- Access token usado como refresh/ID token o para otro scope.
- Refresh reutilizado tras rotación; token revocado tras logout/cambio de contraseña/privilegio.
- IDOR horizontal, elevación vertical y diferencia 401/403.
- Token en URL/log y payload con dato sensible.
- Cookie insegura y petición cross-site sin defensa válida.

## 4. Criterio de suficiencia

- `check-sdd`, `test-hooks`, `test-install`, `skills-sync --check`, `scan-secrets` y `git diff --check` verdes.
- Tarball contiene referencias nuevas y no contiene informes/decisiones de la plantilla.
- Greenfield sin stack continúa ejecutando CI universal.
- Cobertura estructural de todas las ramas nuevas del parser mediante fixtures positivos y negativos.

## 5. Qué no se automatiza

- Smoke visual de los menús de cada IDE: se documenta como control manual.
- Calidad semántica final del informe del auditor: revisión humana, además del esquema determinista.
- Actualidad futura de OWASP: la revalida `/sdd-refresh`, no se consulta red durante cada gate.
