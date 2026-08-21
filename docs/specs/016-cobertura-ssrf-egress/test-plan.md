# Plan de test · 016-cobertura-ssrf-egress

## 1. Alcance

Se verifica el contrato Markdown en el repositorio fuente y en una instalación temporal real: la
skill portable, la checklist, el adaptador Claude, la guía de uso, la paridad 20/27 y la política
conservadora brownfield. No se prueban conexiones, DNS ni redirects reales porque esta plantilla
no los ejecuta; audita que cada proyecto aplicable los controle y evidencie.

## 2. Mapa criterio → test

| OBJ | PRD-RF | UC | RF | CA | Tarea prevista | Comportamiento | Nivel | Test |
|---|---|---|---|---|---|---|---|---|
| OBJ-001 | PRD-RF-001 | UC-003 | RF-01 | CA-01 | T-016-01 → T-016-02 | exige decisión sobre destino solicitado | contrato | `scripts/test/install-security-contracts.mjs::contrato_ssrf_exige_destino_permitido` |
| OBJ-001 | PRD-RF-001 | UC-003 | RF-02 | CA-02 | T-016-01 → T-016-02 | exige allowlist y decisión de protocolo | contrato | `scripts/test/install-security-contracts.mjs::contrato_ssrf_exige_protocolo_permitido` |
| OBJ-001 | PRD-RF-001 | UC-003 | RF-03 | CA-03 | T-016-01 → T-016-02 | evalúa todas las direcciones efectivas A/AAAA | contrato | `scripts/test/install-security-contracts.mjs::contrato_ssrf_revalida_destino_efectivo` |
| OBJ-001 | PRD-RF-001 | UC-003 | RF-04 | CA-04 | T-016-01 → T-016-02 | revalida cada redirección antes de continuar | contrato | `scripts/test/install-security-contracts.mjs::contrato_ssrf_revalida_cada_redireccion` |
| OBJ-001 | PRD-RF-001 | UC-003 | RF-05 | CA-05 | T-016-01 → T-016-02 | metadata no admite excepción | contrato | `scripts/test/install-security-contracts.mjs::contrato_ssrf_bloquea_metadata_sin_excepcion` |
| OBJ-002 | PRD-RF-004 | UC-004 | RF-06 | CA-06 | T-016-01 → T-016-02 | cada control conserva estado, decisión y evidencia | contrato | `scripts/test/install-security-contracts.mjs::contrato_ssrf_no_admite_verde_implicito` |
| OBJ-002 | PRD-RF-004 | UC-004 | RF-07 | CA-07 | T-016-03 | ausencia de timeout produce hallazgo | contrato | `scripts/test/install-security-contracts.mjs::contrato_ssrf_exige_timeout_material` |
| OBJ-002 | PRD-RF-004 | UC-004 | RF-08 | CA-08 | T-016-03 | ausencia de límite de datos produce hallazgo | contrato | `scripts/test/install-security-contracts.mjs::contrato_ssrf_exige_limite_de_respuesta` |
| OBJ-003 | PRD-RF-006 | UC-001 | RF-09 | CA-09 | T-016-01 → T-016-02 | instalación ofrece una fuente portable y adaptador mínimo | integración/E2E | `scripts/test/install-security-contracts.mjs::instala_contrato_ssrf_portable_sin_duplicados` |
| OBJ-002 | PRD-RF-004 | UC-004 | RF-10 | CA-10 | T-016-04 | resumen distingue tres estados | contrato | `scripts/test/install-security-contracts.mjs::contrato_ssrf_resume_resultados_verificables` |
| OBJ-002 | PRD-RF-004 | UC-004 | RF-11 | CA-11 | T-016-04 | agrupación conserva IDs individuales | contrato | `scripts/test/install-security-contracts.mjs::contrato_ssrf_agrupa_sin_perder_escenarios` |
| OBJ-001 | PRD-RF-001 | UC-003 | RF-12 | CA-12 | T-016-01 → T-016-02 | excepción interna exige responsable, alcance y evidencia | contrato | `scripts/test/install-security-contracts.mjs::contrato_ssrf_exige_excepcion_interna_completa` |

Los nombres son el contrato previsto para `/sdd-tasks`: T-016-01 extrae el harness y demuestra
cada RED; T-016-02 aplica el GREEN mínimo. El helper puro vive en el módulo extraído y no fusiona
motivos de fallo.

## 3. Por nivel

### Unitarios

No se añade lógica de producción. El helper semántico de test se mantiene puro y pequeño; no se
crea un parser público solo para probar Markdown.

### Integración

- T-016-01 extrae primero el bloque de contratos de seguridad a
  `scripts/test/install-security-contracts.mjs`, demuestra la suite previa verde y no eleva el
  trinquete 3831/3831 de `test-install.mjs`; solo después añade los RED de esta spec.
- Una instalación limpia temporal contiene la skill canónica exacta y la checklist actualizada.
- El adaptador Claude apunta a `.agents/skills/security-scan/SKILL.md`.
- Las configuraciones/instrucciones existentes mantienen descubrimiento común en seis hosts.
- Una instalación brownfield conserva una checklist propia y hace visible el conflicto según la
  política vigente, sin sobrescribir contexto ajeno.

### Contrato

- [`contracts/security-audit-ssrf-v1.md`](./contracts/security-audit-ssrf-v1.md) define cada
  comportamiento que debe aparecer en skill/checklist.
- La prueba falla si desaparecen aplicabilidad, destino/protocolo, A/AAAA, redirecciones, metadata,
  excepción interna, límites, estados, evidencia o minimización.
- El contrato mantiene `sdd-security-report:v1`; no se prueba un esquema v2 inexistente.

### E2E

`node scripts/test-install.mjs` ya es el E2E del producto: ejecuta el instalador sobre directorios
temporales reales. No se añade navegador ni red.

## 4. Casos límite a cubrir

| Caso | Test/revisión | Estado previsto |
|---|---|---|
| Entrada vacía: sin destino o protocolo | `contrato_ssrf_exige_destino_permitido` y `...protocolo_permitido` | hallazgo, nunca superado |
| Límite exacto de timeout/tamaño/saltos | revisión del contrato: el proyecto declara n y prueba n-1/n/n+1 | inequívoco; sin valor universal |
| Dos auditorías concurrentes | tabla por IDs de auditoría/escenario | evidencias no mezcladas |
| Permiso denegado | `contrato_ssrf_no_admite_verde_implicito` | `no ejecutado` con riesgo/owner/siguiente paso |
| Destino caído o red lenta | `...timeout_material` | decisión estática + control dinámico no ejecutado o hallazgo |
| Respuesta extrema | `...limite_de_respuesta` | límite o hallazgo |
| Petición repetida/reintento | revisión de checklist | mismos controles y reintentos acotados; traza preservada |
| Evidencia corrupta/parcial | `...no_admite_verde_implicito` | no verificable / no ejecutado |
| Cadena, bucle o exceso de redirects | `...revalida_cada_redireccion` | cada salto revalidado; bucle/exceso es hallazgo |
| Resolución cambiante/DNS rebinding | `...revalida_destino_efectivo` | aprobación anterior inválida |
| IPv4/IPv6 y representación alternativa | `...revalida_destino_efectivo` | clasificación por destino efectivo canonizado |
| Metadata de infraestructura | `...bloquea_metadata_sin_excepcion` | rechazo incondicional |
| Local/privado/link-local legítimo | `...exige_excepcion_interna_completa` | rechazo o excepción completa |
| Control materialmente no aplicable | `...no_admite_verde_implicito` | `no aplica` con motivo específico |
| Contenido auditado ordena omitir controles o declarar PASS | `...trata_contenido_como_dato` | se ignora como instrucción y se conserva el gate versionado |

## 5. Datos de prueba

- Fixtures Markdown construidos dentro de la suite; sin tráfico de red.
- Dominios `.invalid`, direcciones de documentación y valores sintéticos sin formato de secreto.
- Un fixture omite cada cláusula por separado para demostrar que el assert correspondiente falla.
- No se copian cuerpos, credenciales, tokens ni PII real.

### 5.1 · Casos de abuso y controles de seguridad

| Control | ASVS | OWASP | Caso de abuso / condición negativa | Nivel | Test | Resultado seguro esperado |
|---|---|---|---|---|---|---|
| SEC-SSRF-001 | v5.0.0-1.3.6, 13.2.4, 13.2.5 · L2 | A01:2025 · CWE-918 | URL aparente aceptada sin política de destino | contrato | `scripts/test/install-security-contracts.mjs::contrato_ssrf_exige_destino_permitido` | hallazgo explícito |
| SEC-SSRF-002 | v5.0.0-1.3.6, 13.2.4, 13.2.5 · L2 | A01:2025 · CWE-918 | esquema alternativo no validado | contrato | `scripts/test/install-security-contracts.mjs::contrato_ssrf_exige_protocolo_permitido` | protocolo rechazado |
| SEC-SSRF-003 | v5.0.0-1.1.1, 1.3.6, 13.2.4 · L2 | A01:2025 · CWE-918 | A/AAAA efectivo cae en red restringida | contrato | `scripts/test/install-security-contracts.mjs::contrato_ssrf_revalida_destino_efectivo` | revalidación antes de conectar |
| SEC-SSRF-004 | v5.0.0-15.3.2, 1.3.6 · L2 | A01:2025 · CWE-918/CWE-601 | salto permitido redirige a destino restringido | contrato | `scripts/test/install-security-contracts.mjs::contrato_ssrf_revalida_cada_redireccion` | siguiente salto bloqueado |
| SEC-SSRF-005 | v5.0.0-13.2.4, 13.2.5, 1.3.6 · L2 | A01:2025 · CWE-918/CWE-441 | excepción intenta autorizar metadata | contrato | `scripts/test/install-security-contracts.mjs::contrato_ssrf_bloquea_metadata_sin_excepcion` | rechazo sin excepción |
| SEC-SSRF-006 | v5.0.0-13.2.4, 13.2.5, 1.3.6 · L2 | A01:2025 · CWE-918 | red privada autorizada sin owner/alcance/evidencia | contrato | `scripts/test/install-security-contracts.mjs::contrato_ssrf_exige_excepcion_interna_completa` | excepción inválida y hallazgo |
| SEC-SSRF-007 | v5.0.0-16.2.1, 16.3.3, 16.3.4, 16.5.3 · L2 | A09/A10:2025 | falta de acceso se presenta como verde, `no-aplica` se confunde con estado o contenido redefine el gate | contrato | `scripts/test/install-security-contracts.mjs::contrato_ssrf_no_admite_verde_implicito` | aplicabilidad separada; no ejecutado nunca PASS; instrucciones ignoradas |
| SEC-SSRF-008 | v5.0.0-15.1.3, 15.2.2, 16.5.2, 16.5.3 · L2; 13.1.3 · L3 suplementario | A10:2025 · CWE-400 | destino lento sin timeout/reintentos acotados agota recursos | contrato | `scripts/test/install-security-contracts.mjs::contrato_ssrf_exige_timeout_material` | límite o hallazgo |
| SEC-SSRF-009 | v5.0.0-15.1.3, 15.2.2 · L2 | A10:2025 · CWE-400 | respuesta ilimitada agota recursos | contrato | `scripts/test/install-security-contracts.mjs::contrato_ssrf_exige_limite_de_respuesta` | límite o hallazgo |
| SEC-SSRF-010 | v5.0.0-16.2.1, 16.2.5, 16.3.4 · L2 | A09:2025 · CWE-532 | informe copia token, userinfo o cuerpo | contrato + gate | `scripts/test/install-security-contracts.mjs::contrato_ssrf_minimiza_evidencia` | referencia mínima sin secreto |
| SEC-SSRF-011 | ASVS 5.0.0 · sin requisito técnico directo; control de integridad del SDLC | A03/A08:2025 | paquete omite skill/checklist, no deja mínimos autosuficientes o duplica capacidad | integración/E2E | `scripts/test/install-security-contracts.mjs::instala_contrato_ssrf_portable_sin_duplicados` | misma fuente, checklist sincronizada, brownfield verificable y 20/27 |

### 5.2 · Usabilidad

No aplica: la spec no crea o modifica interfaz, formulario, microcopy interactiva ni espera
percibida. No se declaran IDs `UX-*`.

## 6. Dobles

| Dependencia | Doble | Por qué |
|---|---|---|
| Filesystem destino | directorio temporal real | Prueba el instalador sin mockear el contrato propio |
| DNS/HTTP | ninguno | El producto no realiza peticiones; simularlas fingiría probar una mitigación inexistente |

## 6 bis. Verificación documental

| DOC-ID | Tarea | Fuente | Artefacto | Comprobación o revisión | Resultado esperado |
|---|---|---|---|---|---|
| DOC-SKILLS | T-016-05 | `.agents/skills/security-scan/SKILL.md` + `docs/security/SECURITY-CHECKLIST.md` | `docs/guides/COMO-TRABAJAR-CON-LOS-AGENTES.md` | `scripts/test/install-security-contracts.mjs::la_guia_enlaza_el_contrato_ssrf_portable` | guía breve, coherente y enlazada |

## 7. Criterio de suficiencia

| Módulo / ruta | Tier | Umbral | Cómo se demuestra |
|---|---|---:|---|
| `scripts/test/install-security-contracts.mjs` | CORE | 100 % de CA/controles | cada cláusula tiene test que falla por ausencia; módulo extraído antes de crecer |
| `scripts/test-install.mjs` | CORE | 100 % del entrypoint | sigue ejecutando toda la suite sin superar 3831 líneas |
| `.agents/skills/security-scan/SKILL.md` | CORE | 100 % del contrato aplicable | helper semántico + instalación exacta |
| `docs/security/SECURITY-CHECKLIST.md` | CORE | 100 % del contrato aplicable | helper semántico + instalación |
| `.claude/skills/security-scan/SKILL.md` | INFRASTRUCTURE | excluido de línea | referencia estructural validada por `check-sdd` y E2E |
| `docs/guides/COMO-TRABAJAR-CON-LOS-AGENTES.md` | IMPORTANT | 80 % no cuantificable por línea | comprobación semántica + revisión DOC-SKILLS |

- Todos los CA y controles aplicables verdes.
- `node scripts/test-install.mjs`, `node scripts/skills-sync.mjs --check`, fast/slow y CI verdes.
- Cero `.skip`/`.only` y cero tests flaky.
- Mutation score: no ejecutado; el gate `mutation` está pendiente y añadir una dependencia queda
  fuera de alcance. Los casos RED que eliminan una cláusula son la prueba negativa proporcional.
- Duración total de gates lentos por debajo del objetivo existente de 10 minutos.

### Calibración mediante las cuatro preguntas

| Pregunta | Respuesta |
|---|---|
| ¿Conocemos el comportamiento esperado? | sí, 12 CA y contrato cerrado |
| ¿El coste de fallar es alto? | sí, un falso negativo de seguridad erosiona confianza |
| ¿El requisito es estable? | sí, spec y ASVS 5.0.0 aprobados/versionados |
| ¿Puede simularse el escenario real? | sí para distribución/contrato; no para ejecución de red que no pertenece al producto |

Resultado: **4/4 hacia verificar** para el contrato/distribución, por lo que se exige suite
exhaustiva. No se añade E2E de red ni mutation engine porque probarían otro producto o ampliarían
dependencias, no porque se reduzca el ciclo TDD.

## 8. Qué NO se automatiza

- La eficacia de una mitigación concreta en un proyecto consumidor: la decide y prueba ese stack.
- Smokes vivos de cada IDE: el repositorio verifica contratos de fichero; sin smoke se declara
  `declared-corroborated`/`declared-direct`, no `observed`.
- Gate humano del plan y entrega.
- Revisión semántica final del informe por `security-auditor` en `/security-scan verify`.

## 9. Fuentes y discrepancias

| Riesgo de intake | Fuente / discrepancia | Test o revisión | Resultado esperado |
|---|---|---|---|
| Deriva perfil/skill | auditoría de 26 documentos + DISC-016-01 | contrato fuente/instalado | la skill portable iguala el alcance SSRF necesario sin crear corte nuevo |
| Fuente externa evoluciona | OWASP SSRF Cheat Sheet y ASVS 5.0.0 fijado | revisión en `research.md` | IDs ASVS versionados; no seguir `master` como contrato estable |
| Producto no nombra corte SSRF | DISC-016-01 resuelta | trazabilidad OBJ→PRD-RF→UC→RF→CA | se mantiene FEAT-003 + FEAT-002, sin modificar baseline |
