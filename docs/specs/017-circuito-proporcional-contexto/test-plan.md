# Plan de test · 017-circuito-proporcional-contexto

## 1. Mapa criterio → prueba

| RF / CA | Tarea | Nivel | Prueba |
|---|---|---|---|
| RF-01 / CA-01 | T-017-01 | unitario/contrato/E2E | `scripts/test-circuit.mjs` + instalación temporal |
| RF-01, RF-04 / CA-02 | T-017-02 | unitario/integración | `scripts/test-trace-audit.mjs` |
| RF-02 / CA-03 | T-017-03 | unitario/contrato | `scripts/test-context.mjs` |
| RF-03 / CA-04 | T-017-03 | unitario/integración | `scripts/test-gate-summary.mjs` |
| RF-05 / CA-05 | T-017-04 | contrato/E2E | install, skills-sync, site-prep, a11y y benchmark 017 |
| RF-06 / CA-06 | T-017-06 | unitario/integración | `scripts/test-release-gates.mjs` + hooks/install |

## 2. Casos obligatorios

- Path portable: vacío, absoluto, `..`, barra Windows, control, glob, caja, NFC/NFD, colisión,
  symlink, junction/reparse point y tipo no regular.
- Clasificación: negación prevalente, ejecutable como mínimo compact, sensible/desconocido/full,
  un módulo/varios, `behavior changed` solo eleva.
- Aprobación: proposal hash canónico, actor/fecha/decisión, hash obsoleto y legado pendiente.
- Auditoría: baseline, trailers, frontera del padre, Agent/territorio, sello cambiado, grupo
  agregado y rotación de grupos sobre el mismo módulo en 20 commits.
- Contexto: fases válidas, tarea/controles, seguridad universal, UX condicional y encabezado
  ausente/duplicado/renombrado.
- Resumen: éxito/fallo, timeout/cancelación, stdout/stderr y comando, buffer n-1/n/n+1, salida
  >8 KiB, patrones de secreto, ausencia de raw, retención y symlink.
- E2E: README exacto→light; componente ejecutable existente→compact; auth/API/migración/SDD→full.
- Compatibilidad: instalación limpia, actualización, idempotencia y seis hosts.
- Release: PASS ancestral, huella material estable, metadata cerrada, checks/runtime manipulados,
  otra máquina, HMAC inválido, hardlink/junction, cuota, entrada ejecutable cambiada, procedencia
  executed/reused y tag atestado por CI sin cambio de bytes.

## 3. Seguridad

Referencias ejecutables conservadas literalmente:

- SEC-CIRCUIT-001 · T-017-01 · `scripts/test-circuit.mjs::rechaza_rutas_ambiguas_y_enlaces`
- SEC-CIRCUIT-002 · T-017-01 · `scripts/test-circuit.mjs::rechaza_hash_obsoleto_o_aprobacion_de_agente`
- SEC-CIRCUIT-003 · T-017-02 · `scripts/test-trace-audit.mjs::bloquea_commit_nuevo_sin_trailers`
- SEC-CIRCUIT-004 · T-017-02 · `scripts/test-trace-audit.mjs::impide_legitimacion_retroactiva_e_invasion`
- SEC-CIRCUIT-005 · T-017-01 · `scripts/test-circuit.mjs::eleva_impacto_sensible_y_tipo_no_regular`
- SEC-CIRCUIT-006 · T-017-02 · `scripts/test-trace-audit.mjs::agrega_grupos_por_modulo_en_ventana`
- SEC-CONTEXT-001 · T-017-03 · `scripts/test-context.mjs::ignora_instrucciones_y_falla_ante_estructura_invalida`
- SEC-EVIDENCE-001 · T-017-03 · `scripts/test-gate-summary.mjs::redacta_todos_los_canales_antes_de_persistir`
- SEC-EVIDENCE-002 · T-017-03 · `scripts/test-gate-summary.mjs::acota_tiempo_y_salida`
- SEC-EVIDENCE-003 · T-017-06 · `scripts/test-release-gates.mjs::reutiliza_solo_evidencia_materialmente_vigente`

| Control | Caso adverso | Resultado seguro |
|---|---|---|
| SEC-CIRCUIT-001 | ruta ambigua/hostil o permiso solapado | full/error, nunca concesión |
| SEC-CIRCUIT-002 | aprobar una propuesta modificada | rechazo sin escritura |
| SEC-CIRCUIT-003 | commit nuevo sin trailers | infracción bloqueante |
| SEC-CIRCUIT-004 | ampliar frontera después o invadir territorio | commit infractor |
| SEC-CIRCUIT-005 | impacto ausente/pending/sensible o tipo no regular | full |
| SEC-CIRCUIT-006 | rotar grupos sobre el mismo módulo | aviso y bloqueo si la unión excede límites en la ventana histórica |
| SEC-CONTEXT-001 | política estructuralmente distinta | error, no contexto incompleto |
| SEC-EVIDENCE-001 | salida con secreto/cuerpo extenso | resumen redactado, sin raw |
| SEC-EVIDENCE-002 | hijo bloqueado o salida ilimitada | cancelación y gate fallido |
| SEC-EVIDENCE-003 | evidencia roja, ajena, autofirmada/manipulada, enlace, exceso de cuota o entradas distintas | fallo cerrado y comando slow exacto; tag exige atestación CI del mismo SHA |

Sin PII ni secretos reales en fixtures. No aplican JWT, cookies, SQL, egress o autenticación.

## 4. Documentación y suficiencia

| DOC-ID | Comprobación |
|---|---|
| DOC-CIRCUITO | `node scripts/check-sdd.mjs --strict --spec 017` y skills sync |
| DOC-GATES | suites de hooks/workflows e instalación |
| DOC-TFM | JSON válido, conceptos y versión en la memoria y los cinco `.excalidraw`; comandos, niveles y métricas coinciden con código |
| DOC-PAGES | `node scripts/site-prep.mjs` y `node scripts/check-a11y.mjs` |

- DOC-CIRCUITO · `check-sdd + skills-sync`
- DOC-GATES · `gates CI/hook`
- DOC-TFM · `revisión de comandos/versiones`
- DOC-PAGES · `site-prep + a11y`

Todos los módulos de clasificación, aprobación y auditoría son CORE. Contexto y resumen son
IMPORTANT. Criterio suficiente: todos los CA verdes, cero `.only/.skip`, regresión completa verde,
auditorías sin CRÍTICO/ALTO ni controles no ejecutados y benchmark sobre línea base regenerada.

Los gates humanos no se automatizan. La cuota real del proveedor tampoco: bytes/4 y número de
intervenciones se informan como proxies auditables.
