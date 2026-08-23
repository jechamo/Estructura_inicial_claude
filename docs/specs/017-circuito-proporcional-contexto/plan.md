# Plan técnico · 017-circuito-proporcional-contexto

| Campo | Valor |
|---|---|
| **Estado** | aprobado |
| **Fecha** | 2026-08-22 |
| **Arquitectura** | constitución heredada aprobada: Node ESM procedural, ficheros/Git, cero dependencias runtime |
| **ADR** | no requerido; no cambia la posición arquitectónica |
| **Gates** | producto y spec aprobados; diseño omitido por `sin-ui` |
| **Aprobado por** | usuario mediante «PLEASE IMPLEMENT THIS PLAN» |

## 1. Solución y componentes

La clasificación pura evoluciona a tres niveles y consume un contrato `.sdd/circuit.json`
versionado. El CLI propone, sella y aprueba la frontera; `check-sdd` clasifica rutas previstas y
reales; `trace-audit` corrobora cada commit contra la configuración histórica. El CLI de proyecto
recorta contexto y resume gates. Instalador, hosts y documentación reciben el contrato solo cuando
la auditoría completa ya está integrada.

| RF/CA | Componente | Cambio | Prueba principal |
|---|---|---|---|
| RF-01 / CA-01 | `scripts/lib/circuito.mjs`, `.sdd/circuit.json` | matcher portable, tres niveles y fallo cerrado | `scripts/test-circuit.mjs` |
| RF-01 / CA-01 | `scripts/sdd-project.mjs`, `scripts/check-sdd.mjs` | detectar/aprobar y clasificar antes de editar | `scripts/test-circuit.mjs`, `scripts/test-install.mjs` |
| RF-04 / CA-02 | `scripts/lib/trace-audit.mjs`, slow/ship/CI | trailers, baseline, padre, sello, grupo y territorio | `scripts/test-trace-audit.mjs` |
| RF-02 / CA-03 | `scripts/sdd-project.mjs` | contexto por encabezados, spec y tarea | `scripts/test-context.mjs` |
| RF-03 / CA-04 | runner de gates | resumen sanitizado acotado, sin salida cruda | `scripts/test-gate-summary.mjs` |
| RF-05 / CA-05 | manifiesto, skills y documentación | paridad, TFM, Pages y benchmark | suites de instalación/docs/benchmark |
| RF-06 / CA-06 | runner, sello local y guarda de push | `run --release`, huella material y procedencia executed/reused | `scripts/test-release-gates.mjs` + hooks/install |

## 2. Contrato del circuito

`circuit.json` usa `schemaVersion: 1`, `grammar: portable-path-v1`, `status:
pending|approved`, `detectorVersion`, `proposalHash`, `proposal`, `approval` y `activationCommit`.
La forma canónica del hash incluye versión, gramática, rutas originales y canónicas, extensiones,
límites y cuota; excluye metadatos de aprobación.

- `light.allowedFiles`: solo ficheros exactos no ejecutables.
- `compact.allowedPrefixes`: módulos existentes. Ejecutables tienen suelo `compact`.
- `deniedPrefixes`: rutas sensibles; prevalecen sobre cualquier permiso.
- Límites compactos: un módulo, tres criterios, tres tareas y 12 KiB de intención.
- Ausente, pendiente, inválido, ambiguo, legacy o hash incoherente: `full`.
- `portable-path-v1`: barra `/`, Unicode NFC, case-fold independiente de locale; rechaza ruta
  absoluta, controles, glob y traversal. Toda colisión original→canónica falla cerrada.
- Catálogo sensible versionado: `auth`, `security`, `domain`, `contracts`, `api`, `routes`,
  `migrations`, `prisma`, `supabase`, `database`, `infra`, CI, hooks, agentes, skills, gates,
  configuración SDD y manifiestos/dependencias. Coincidencia por segmento canónico, no substring.
- Impacto de seguridad ausente, `security-pending` o `sensible`: `full`. Solo `no-sensible` con
  motivo material puede optar a compact. Rutas desconocidas o de varios módulos: `full`.
- La clasificación real usa `lstat`: symlink, junction/reparse point u otro tipo no regular se
  rechaza; nunca se sigue para decidir un nivel reducido.

`detect-circuit` solo muestra una propuesta exacta y hash. `approve-circuit --hash --approved-by
--decision-ref` escribe la aprobación si el hash sigue vigente; los agentes nunca lo ejecutan.
La semilla queda `pending`. `lightweight.json` solo se importa como propuesta pendiente y jamás
concede por compatibilidad.

## 3. Clasificación, cambio compacto y auditoría

`check-sdd --circuit-status --planned <rutas...> [--behavior changed] --json` usa el mismo matcher
que status y auditoría. `--behavior changed` solo eleva `light→compact`; el diff real puede elevar
hasta `full`.

`new-change <slug> --mode compact` crea un único `change.md` canónico con intención, criterios,
rutas, impactos, tareas y `Change-Group`. La aprobación sella las secciones de intención; cambiar
el sello invalida el nivel.

Trailers obligatorios tras `activationCommit`: `Circuit`, `Circuit-reason`, `Circuit-config` y
`Agent`; compact/full añaden `Spec`, `Task` y `Change-Group` cuando aplica. `trace-audit` toma el
`circuit.json` del padre, contrasta su hash, valida territorio antes de devolver también en light,
y convierte commits nuevos no auditables en infracción. Todos los commits de un `Change-Group`
usan una única intención sellada y sus rutas exactas. Grupos distintos sobre el mismo módulo en
los últimos 20 commits auditables —incluidos los anteriores a la base— producen aviso y se agregan
por módulo: solo bloquean cuando la unión supera un límite compacto. Un compact sin
`Change-Group` o que exceda su alcance propio o agregado es infractor.

La auditoría se ejecuta en `run --slow`, `/sdd-ship`, pre-push y los workflows de gates y Pages.
La activación es atómica: no se entrega una versión donde los niveles estén activos sin estas
comprobaciones.

## 4. Contexto y evidencia

`context --phase <fase> [--spec NNN] [--task T-*] --json` recorta por encabezados y falla si falta
o se duplica alguno. Siempre incluye regla cero, gates, prohibiciones y un núcleo de seguridad
universal (secretos, validación, inyección, acceso, dependencias, XSS, criptografía, logs,
cabeceras y agentes). Añade matriz sensible o UX solo cuando el impacto lo exige.

Mapa adicional por fase: specify/clarify `§1, §2.5`; design `§8 bis`; plan/tasks `§3–5`;
implement `§4–6, §11`; verify/ship `§8–9`; light/compact `§2.6, §6`; orchestrate `§1–2, §10`.
Con `--task`, devuelve tarea, CA, decisiones y SEC/UX/DOC enlazados, no documentos completos.

`run --summary-json` captura cada proceso sin imprimir su cuerpo con timeout de 15 minutos,
cancelación del hijo y `maxBuffer` de 1 MiB. Alcanzar timeout o límite falla el gate. Redacta comando, stdout y stderr
antes de incorporarlos al resumen y emite como máximo 8 KiB: `runId`, gate, exit code, duración,
bytes/líneas totales por canal, truncado, hash y extracto de fallo. Prueba n-1/n/n+1. Solo persiste
el mismo resumen en `.sdd/state/gate-runs/`, con máximo 20 ejecuciones y siete días; valida cada
segmento con `lstat`/no-follow y nunca guarda salida cruda ni artefactos versionados.

## 5. Seguridad, documentación y operación

### 5.1 Threat model acotado

| Activo / frontera | Entrada no confiable | Abuso | Control |
|---|---|---|---|
| decisión de nivel | argumentos, rutas y tipos del filesystem | traversal, caja, enlace o catálogo incompleto concede atajo | SEC-CIRCUIT-001/005 |
| aprobación humana | propuesta/configuración editable | agente aprueba, hash obsoleto o edición posterior parece válida | SEC-CIRCUIT-002 |
| historia y autoría | mensajes/diffs de Git | trailer falso, frontera ampliada o grupo rotado legitima el commit | SEC-CIRCUIT-003/004/006 |
| política contextual | spec, tarea, documentos y salida Git | prompt injection se carga como instrucción o elimina controles | SEC-CONTEXT-001 |
| evidencia local | comando/stdout/stderr de procesos y sellos reutilizables | fuga de secreto, log injection, evidencia obsoleta o agotamiento de recursos | SEC-EVIDENCE-001/002/003 |

Controles Agentic: toda salida de fichero, Git, herramienta o benchmark se delimita como dato;
nunca modifica política ni gates. Los agentes no pueden ejecutar `approve-circuit`; permisos,
profundidad, tiempo, buffer y contexto están acotados; toda acción material conserva trailers y
auditoría. La ausencia o manipulación de metadatos falla cerrada.

| Control | ASVS | OWASP | Aplica | Decisión / justificación | Tarea | Test | Evidencia |
|---|---|---|---|---|---|---|---|
| SEC-CIRCUIT-001 | 5.0.0 V1.14.6, V4.1.3 · L2 | A01,A05,A10:2025 | sí | matcher único, negación y fallo cerrado, incluidos tipos no regulares | T-017-01 | `scripts/test-circuit.mjs::rechaza_rutas_ambiguas_y_enlaces` | `evidence.md#SEC-CIRCUIT-001` |
| SEC-CIRCUIT-002 | 5.0.0 V4.1.3, V16.5.3 · L2 | A01,A08:2025 | sí | aprobación humana separada y ligada al hash canónico vigente | T-017-01 | `scripts/test-circuit.mjs::rechaza_hash_obsoleto_o_aprobacion_de_agente` | `evidence.md#SEC-CIRCUIT-002` |
| SEC-CIRCUIT-003 | 5.0.0 V16.2.1, V16.3.3, V16.5.3 · L2 | A08,A09:2025 | sí | trace obligatorio y commits posteriores no auditables son infracción | T-017-02 | `scripts/test-trace-audit.mjs::bloquea_commit_nuevo_sin_trailers` | `evidence.md#SEC-CIRCUIT-003` |
| SEC-CIRCUIT-004 | 5.0.0 V4.1.3, V16.5.3 · L2 | A01,A08:2025 | sí | frontera del padre, Agent, autoría y territorio en todos los niveles | T-017-02 | `scripts/test-trace-audit.mjs::impide_legitimacion_retroactiva_e_invasion` | `evidence.md#SEC-CIRCUIT-004` |
| SEC-CIRCUIT-005 | 5.0.0 V1.14.6, V4.1.3 · L2 | A01,A06:2025 | sí | catálogo versionado; impacto ausente/pending/sensible y enlaces fuerzan full | T-017-01 | `scripts/test-circuit.mjs::eleva_impacto_sensible_y_tipo_no_regular` | `evidence.md#SEC-CIRCUIT-005` |
| SEC-CIRCUIT-006 | 5.0.0 V1.14.6 · L2 | A06:2025 | sí | alcance sellado por grupo, aviso y límite agregado por módulo en 20 commits auditables | T-017-02 | `scripts/test-trace-audit.mjs::agrega_grupos_por_modulo_en_ventana` | `evidence.md#SEC-CIRCUIT-006` |
| SEC-CONTEXT-001 | 5.0.0 V1.3.6, V16.5.3 · L2 | A05,A08,A10:2025 · Agentic | sí | datos delimitados, seguridad universal y recorte fail-closed | T-017-03 | `scripts/test-context.mjs::ignora_instrucciones_y_falla_ante_estructura_invalida` | `evidence.md#SEC-CONTEXT-001` |
| SEC-EVIDENCE-001 | 5.0.0 V16.2.1, V16.2.5, V16.3.4 · L2 | A05,A09:2025 | sí | redacción de comando/canales antes de persistir y sin raw | T-017-03 | `scripts/test-gate-summary.mjs::redacta_todos_los_canales_antes_de_persistir` | `evidence.md#SEC-EVIDENCE-001` |
| SEC-EVIDENCE-002 | 5.0.0 V15.1.3, V15.2.2 · L2 | A09,A10:2025 | sí | timeout/cancelación reales, maxBuffer y resumen total n-1/n/n+1 | T-017-03 | `scripts/test-gate-summary.mjs::acota_tiempo_y_salida` | `evidence.md#SEC-EVIDENCE-002` |
| SEC-EVIDENCE-003 | 5.0.0 V16.2.1, V16.3.3, V16.5.3 · L2 | A08,A09:2025 | sí | PASS ancestral con HMAC local anticorrupción; checks/runtime/host/entradas idénticos; rutas regulares y acotadas; procedencia preservada; autoridad remota por workflow exacto, SHA y `main` | T-017-06 | `scripts/test-release-gates.mjs::reutiliza_solo_evidencia_materialmente_vigente` | `evidence.md#SEC-EVIDENCE-003` |

No aplican AuthN/JWT/CSRF, datos personales, base de datos ni egress: no existen esas superficies
en el cambio. No se crean logs de negocio ni alertas remotas; la observabilidad es el resumen local
con fallo visible. La reversión es volver a la versión 0.8.0: un destino actualizado conserva su
configuración y, sin contrato aprobado válido, queda en `full`.

| DOC-ID | Fuente | Artefacto | Tarea | Comprobación | Evidencia | Owner | Estado |
|---|---|---|---|---|---|---|---|
| DOC-CIRCUITO | clasificador/CLI | modelo operativo, AGENTS/hosts/skills | T-017-04 | check-sdd + skills-sync | `evidence.md#DOC-CIRCUITO` | docs-writer | verificado |
| DOC-GATES | runner/auditor/workflows | guía y definición de hecho | T-017-04, T-017-06 | gates CI/hook | `evidence.md#DOC-GATES` | docs-writer | verificado |
| DOC-TFM | contrato implementado | `docs/TFM/MEMORIA-TECNICA-TFM.md`; cinco diagramas `.excalidraw` de `docs/TFM/` | T-017-04, T-017-06 | JSON válido, conceptos y versión | `evidence.md#DOC-TFM` | docs-writer | verificado |
| DOC-PAGES | contrato implementado | `site/index.html`, `site/documentacion.html`, datos | T-017-04, T-017-06 | site-prep + a11y | `evidence.md#DOC-PAGES` | docs-writer | verificado |

## 6. Riesgos, benchmark y entrega

- Un matcher permisivo o una auditoría opt-in bloquean la release.
- El benchmark regenera baseline con cinco escenarios, suma instrucciones activadas, artefactos,
  salida e intervenciones. Bytes/4 se etiqueta siempre como proxy.
- Umbrales: compact ≥70 % y ≤3 intervenciones; full ≥20 %; expectativas 100 %. Si falla, no se
  publica el mecanismo y se registra el experimento.
- `run --fast` antes del commit; `run --slow` antes de pedir push. No push, merge, tag, Pages ni
  publicación sin aprobación humana.

## 7. Gate humano del plan técnico

| Campo | Valor |
|---|---|
| Estado | `approved` |
| Persona | usuario |
| Fecha | 2026-08-22 |
| Alcance | plan solicitado completo, una entrega atómica en `feature/mejoras_codex` |
| Riesgos aceptados | ninguno; los diez controles son bloqueantes |

### HANDOFF
- Agente origen: planner
- Fase completada: plan
- Artefactos: `plan.md`, `test-plan.md`
- Seguridad: diez controles aplicables; auditoría plan/verify obligatoria
- UX: sin-ui
- Documentación: cuatro DOC-ID en la misma entrega
- Conformidad: arquitectura vigente respetada; sin ADR ni dependencias
- Siguiente agente sugerido: planner — `/sdd-tasks`
