# Plan técnico · 009-usabilidad-integrada

| Campo | Valor |
|---|---|
| **Spec** | [`spec.md`](./spec.md) |
| **Estado** | borrador |
| **Fecha** | 2026-08-12 |
| **Arquitectura vigente** | Plantilla y CLI sin dependencias de runtime · [`constitution.md`](../../architecture/constitution.md) |
| **ADR relacionados** | — |
| **Gate de producto** | `legacy-pending` · `docs/product/PRD.md` |
| **Gate funcional** | `pending` · [`spec.md`](./spec.md) |
| **Gate de diseño** | `skipped-no-ui` · la plantilla no tiene interfaz gráfica; su superficie es documental y de CLI |

---

## 1. Resumen de la solución

Se replica sobre usabilidad el contrato que la spec 007 estableció para seguridad, capa por capa y
sobre los mismos ficheros: clasificación en la spec, matriz de controles en el plan, propagación a
tareas y evidencia, paso de auditoría en `/sdd-verify`, informe parseable, validación en
`check-sdd.mjs`, contrato en `.sdd/installed.json` y reglas por `glob` para los hosts que no leen
agentes. No se crea ningún agente ni ninguna skill: se amplían los existentes.

### Trazabilidad y fuentes de entrada

| OBJ | PRD-RF | UC | RF | CA | Componente previsto | Test previsto |
|---|---|---|---|---|---|---|
| OBJ-001 | PRD-RF-001 | UC-001 | RF-01 | CA-01 | `scripts/check-sdd.mjs::impactoUsabilidad` | `scripts/test-install.mjs::usabilidad_versionada` |
| OBJ-001 | PRD-RF-001 | UC-001 | RF-02 | CA-02, CA-03 | `scripts/check-sdd.mjs` matriz `UX-*` | `scripts/test-install.mjs::matriz_usabilidad` |
| OBJ-001 | PRD-RF-001 | UC-001 | RF-03 | CA-04 | `docs/specs/_TEMPLATE/tasks.md` | `scripts/test-install.mjs::matriz_usabilidad` |
| OBJ-001 | PRD-RF-001 | UC-001 | RF-04 | CA-05 | `docs/specs/_TEMPLATE/evidence.md` | `scripts/test-install.mjs::gate_a11y_e_informe` |
| OBJ-001 | PRD-RF-001 | UC-001 | RF-05 | CA-06, CA-07 | `scripts/check-sdd.mjs` puerta de `GO` | `scripts/test-install.mjs::gate_a11y_e_informe` |
| OBJ-001 | PRD-RF-001 | UC-001 | RF-06 | CA-08 | `docs/design/A11Y-CHECKLIST.md` | `scripts/test-install.mjs::portabilidad_usabilidad` |
| OBJ-001 | PRD-RF-001 | UC-001 | RF-07 | CA-09 | `.cursor/rules/40-usability.mdc` | `scripts/test-install.mjs::portabilidad_usabilidad` |
| OBJ-001 | PRD-RF-001 | UC-001 | RF-08 | CA-10 | `.claude/agents/*.md` bloques HANDOFF | `scripts/check-sdd.mjs::handoff/ausente` |
| OBJ-001 | PRD-RF-001 | UC-001 | RF-09 | CA-11 | `.sdd/checks.json`, `scripts/sdd-project.mjs` | `scripts/test-hooks.mjs` |
| OBJ-001 | PRD-RF-001 | UC-001 | RF-10 | CA-12 | `scripts/check-sdd.mjs::diseno/tabla` | `scripts/test-install.mjs::matriz_usabilidad` |

- Fuentes consideradas: `SRC-009-01` … `SRC-009-04`.
- Discrepancias resueltas: `ninguna`.
- Discrepancias abiertas: `0`.

## 2. Aplicación de la arquitectura

Este repositorio no tiene capas de aplicación; su arquitectura son **superficies**. La tabla se
adapta a lo que existe de verdad en vez de rellenar capas inventadas:

| Superficie | Qué se añade aquí |
|---|---|
| Doctrina (`docs/design/`) | `A11Y-CHECKLIST.md` nuevo; `USABILITY-CHECKLIST.md` ampliado; `reports/` |
| Contrato (`docs/specs/_TEMPLATE/`) | Clasificación, matriz, propagación, casos hostiles e informe |
| Comportamiento de agentes (`.agents/skills/`, `.claude/agents/` + 5 envoltorios) | Pasos de fase y campos de HANDOFF |
| Reglas por `glob` (`.cursor/rules/`, `.github/instructions/`) | Doctrina al editar ficheros de UI |
| Validación (`scripts/check-sdd.mjs`) | Errores `usabilidad/*` y `diseno/tabla` |
| Distribución (`scripts/install.mjs`, `scripts/lib/manifiesto.mjs`) | Contrato `usability` y `VERSION_MANIFIESTO` |
| Gates (`.sdd/checks.json`, `scripts/sdd-project.mjs`, `.sdd/hooks/`) | Gate `a11y` condicionado |

**Reglas de dependencia respetadas**: sí. Ninguna superficie nueva; sin dependencias de runtime.

## 3. Componentes

### Nuevos
| Componente | Responsabilidad (una sola) | Ruta prevista |
|---|---|---|
| Checklist de accesibilidad | Doctrina verificable de WCAG 2.2 AA por pantalla | `docs/design/A11Y-CHECKLIST.md` |
| Regla de usabilidad para Cursor | Entregar la doctrina al editar UI | `.cursor/rules/40-usability.mdc` |
| Instrucciones de usabilidad para Copilot | Lo mismo en la superficie de GitHub | `.github/instructions/usability.instructions.md` |
| Carpeta de informes de usabilidad | Destino único y validable del informe | `docs/design/reports/` |
| `impactoUsabilidad()` | Leer la clasificación de la cabecera de una spec | `scripts/check-sdd.mjs` |
| `contratoUsabilidad()` | Declarar el contrato en `.sdd/installed.json` | `scripts/install.mjs` |

### Modificados
| Componente | Qué cambia | Riesgo de regresión |
|---|---|---|
| `docs/specs/_TEMPLATE/{spec,plan,tasks,test-plan,evidence,design}.md` | Secciones nuevas | Bajo: aditivo |
| `docs/design/USABILITY-CHECKLIST.md` | §4 y §5 ampliadas; §6 con enlace corregido | Bajo |
| `.agents/skills/` (9 skills) | Pasos de usabilidad | Bajo: no cambia el contador de 26 |
| `.claude/agents/` (5 perfiles) + 5 envoltorios cada uno | Enrutado y HANDOFF | **Medio**: la paridad se verifica en CI |
| `scripts/check-sdd.mjs` | Validación nueva | **Alto**: es el gate que sostiene todo el circuito |
| `scripts/install.mjs`, `scripts/lib/manifiesto.mjs` | Contrato y versión 5→6 | **Medio**: afecta a `update` de instalaciones existentes |
| `.sdd/checks.json`, `scripts/sdd-project.mjs`, `.sdd/hooks/guard-bash.mjs` | Gate `a11y` | Medio: puede endurecer el sello `slow` |
| `AGENTS.md`, `docs/sdd/OPERATING-MODEL.md`, `docs/quality/DEFINITION-OF-DONE.md` | Regla dura 13 y doctrina | Bajo |

## 4. Patrones de diseño aplicados

| Problema | Patrón | Alternativa descartada | Por qué |
|---|---|---|---|
| El contrato debe exigirse solo desde cierta spec sin romper la historia | Contrato versionado con `enforceFromSpec` | Exigirlo a todo el repositorio | Rompería las specs 001-008, que no lo conocían |
| El informe debe ser legible por persona y por máquina | Marcador HTML + bloque JSON canónico | JSON suelto en otro fichero | Ya demostrado en seguridad; mantiene un solo documento |
| Quien audita no debe poder maquillar su informe | Auditor de solo lectura + escritor autorizado | Que el auditor escriba | Un auditor que redacta su veredicto no es un control |
| La doctrina debe llegar a hosts que no leen agentes | Regla por `glob` duplicada en dos formatos | Confiar en `AGENTS.md` | Cursor y Copilot no lo cargan al editar un `.tsx` |

## 5. Flujo principal

```mermaid
sequenceDiagram
    actor P as Persona
    participant S as /sdd-specify
    participant D as /sdd-design
    participant PL as /sdd-plan
    participant I as /sdd-implement
    participant V as /sdd-verify
    participant W as docs-writer
    S->>S: declara Impacto de usabilidad
    S->>D: spec aprobada con §5.3
    D->>D: a11y-checklist del proyecto + tablas §6/§6 bis
    D->>PL: diseño aprobado
    PL->>PL: matriz UX-<AREA>-NNN §9.3
    PL->>I: tareas con Controles de usabilidad
    I->>V: implementación con evidencia
    V->>V: code-reviewer audita en solo lectura
    V->>W: HANDOFF estructurado
    W->>W: materializa el informe literalmente
    V-->>P: veredicto; CRÍTICO/ALTO bloquean GO
```

## 6. Modelo de datos

No hay base de datos. El único **esquema** que se introduce es el JSON del informe:

```json
{
  "schemaVersion": 1,
  "spec": "NNN-slug",
  "standards": { "wcag": "2.2", "level": "AA", "heuristics": "nielsen-10" },
  "scope": "diff",
  "controlsEvaluated": ["UX-<AREA>-NNN"],
  "openFindings": { "critical": 0, "high": 0, "medium": 0, "low": 0 },
  "verdict": "PASS",
  "acceptedRisks": [],
  "controlsNotExecuted": []
}
```

Y el bloque `usability` de `.sdd/installed.json`:

```json
{
  "schemaVersion": 1,
  "status": "bootstrap",
  "standards": { "wcag": "2.2", "level": "AA", "heuristics": "nielsen-10" },
  "enforceFromSpec": "NNN"
}
```

Migración: `contratoUsabilidad()` lo crea en `install` y lo conserva en `update`. Una instalación
previa sin el bloque entra como `legacy-pending` y solo se le exige desde `enforceFromSpec`.

## 7. Contratos

Ver [`contracts/`](./contracts/). ¿Cambios rompedores? **No** para specs anteriores a
`enforceFromSpec`. Versionado: `schemaVersion: 1` en ambos esquemas, igual que seguridad.

## 8. Estrategia de test

Ver [`test-plan.md`](./test-plan.md).

| Nivel | Qué se prueba aquí |
|---|---|
| Unitario | Formato de ID, parseo del informe, lectura de la clasificación |
| Integración | `check-sdd --strict` sobre fixtures positivos y negativos |
| Contrato | Paridad de 20 agentes / 26 skills; presencia de las dos reglas de IDE |
| E2E | Instalación limpia en directorio temporal y `update` sobre instalación previa |

### 8.1 · Calibración de verificación

| Módulo / ruta | Tier | Por qué |
|---|---|---|
| `scripts/check-sdd.mjs` | **CORE** | Es el único control que no marca el modelo; si falla en falso negativo, todo el contrato es decorativo |
| `scripts/install.mjs` | **CORE** | Escribe el contrato en proyectos ajenos; un error se propaga a cada instalación |
| `scripts/lib/manifiesto.mjs` | **CORE** | Controla qué ficheros se copian y qué bloques se regeneran |
| `scripts/sdd-project.mjs` | IMPORTANT | Gate visible; un fallo se detecta al ejecutarlo |
| `.sdd/hooks/guard-bash.mjs` | IMPORTANT | Refuerza el sello, no lo sustituye |
| `docs/**`, `.cursor/rules/**`, `.github/instructions/**` | INFRASTRUCTURE | Contenido; se verifica por presencia y por enlaces |

Ningún módulo que maneje dinero, datos críticos o permisos queda por debajo de CORE: esta spec no
toca ninguno.

**Profundidad, cuando no es obvia**

| Componente | Respuesta | Decisión |
|---|---|---|
| Puerta de `GO` en `check-sdd.mjs` | 4 de 4 hacia verificar | Suite exhaustiva: fixture por cada motivo de bloqueo |
| Parser del informe | 3 de 4 | Casos límite de JSON inválido, ruta fuera de carpeta y veredicto incoherente |
| Reglas de IDE | 1 de 4 | Comprobación de presencia y `glob`; el efecto real lo juzga una persona |

## 9. Seguridad

**Impacto de seguridad heredado de `spec.md`**: `no-sensible`.

Marco: **OWASP Top 10:2025** y **ASVS 5.0.0** nivel `L1`. No se elige JWT ni credenciales de
navegador; esta spec no tiene superficie de autenticación.

| Aspecto | Decisión dependiente del stack |
|---|---|
| HTTPS y headers de seguridad | No aplica: sin servidor |
| Entradas externas y validación | El JSON del informe se parsea con `try/catch` y esquema explícito; un JSON malformado es error, no excepción no capturada |
| Inyección y queries parametrizadas | No aplica: sin base de datos |
| Autorización | No aplica |
| Rate limiting e idempotencia | No aplica |
| CSRF, CORS, cookies | No aplica |
| XSS, sanitización y CSP | No aplica |
| Secretos, dependencias y supply chain | Cero dependencias nuevas; `scan-secrets` sigue cubriendo el repositorio |
| Datos sensibles | Ninguno. Los informes no contienen PII |
| Amenazas y casos de abuso | Ruta de informe con `..` — ya bloqueado por el patrón de seguridad y replicado aquí |

### 9.1 · Matriz de controles

| Control | ASVS | OWASP | Aplica | Decisión / justificación | Tarea | Test | Evidencia |
|---|---|---|---|---|---|---|---|
| SEC-PATH-001 | ASVS 5.0.0 V12 | A01:2025 | sí | La ruta del informe de usabilidad se valida sin `..` y directamente bajo `docs/design/reports/`, igual que la de seguridad | T-009-09 | `scripts/test-install.mjs::gate_a11y_e_informe` | `evidence.md#SEC-PATH-001` |

### 9.2 · Auditoría prevista

- Skill: `/security-scan` con alcance `plan`. Al ser `no-sensible`, no se exige `verify`.
- Auditor: `security-auditor` en solo lectura.
- Escritor autorizado: `docs-writer`.
- Informe: no se exige informe de seguridad para una spec `no-sensible`.

## 10. Rendimiento

| Métrica | Objetivo | Cómo se consigue |
|---|---|---|
| Tiempo de `check-sdd.mjs` | < +15 % sobre el actual | Reutilizar el recorrido de specs ya existente; no abrir ficheros dos veces |
| Tiempo de `test-install.mjs` | < +30 % | Un solo fixture nuevo, no uno por caso |

Consultas críticas: ninguna. Caché e invalidación: no aplica.

## 10 bis. Documentación

**Impacto heredado de `spec.md`**: `aplicable · DOC-009-01, DOC-009-02`.

| DOC-ID | Superficie | Aplica / motivo | Fuente de verdad | Artefacto | Generado / manual | Propietario | Tarea | Gate / comprobación | Evidencia |
|---|---|---|---|---|---|---|---|---|---|
| DOC-TRACE | `architecture` | sí: cambian las plantillas de spec y el validador | `docs/specs/_TEMPLATE/*.md` | `docs/sdd/OPERATING-MODEL.md` | manual | planner | T-009-07 | `node scripts/check-sdd.mjs --strict` | `evidence.md#DOC-TRACE` |
| DOC-VCS | `developer-readme` | sí: cambia lo que recibe quien instala | `scripts/install.mjs` | `docs/guides/INSTALACION.md` | manual | docs-writer | T-009-10 | `node scripts/check-sdd.mjs --strict` | `evidence.md#DOC-VCS` |
| DOC-HOSTS | `developer-readme` | sí: cambian los perfiles en las seis superficies | `.claude/agents/*.md` | `docs/integrations/IDE-COMPATIBILITY.md` | manual | implementer | T-009-06 | `node scripts/check-sdd.mjs --strict` | `evidence.md#DOC-HOSTS` |

## 10 ter. Usabilidad

**Impacto heredado de `spec.md`**: `aplicable`.

Marco: **WCAG 2.2 AA** y las **diez heurísticas de Nielsen**. Doctrina en
[`USABILITY-CHECKLIST.md`](../../design/USABILITY-CHECKLIST.md) y
[`A11Y-CHECKLIST.md`](../../design/A11Y-CHECKLIST.md).

La única superficie que lee una persona en esta spec es el **texto de los mensajes de error** del
validador y de los avisos del instalador. Por eso solo aplica el área `COPY`.

### 9.3 · Matriz de controles de usabilidad

> Una fila por control. `Aplica = no` exige una justificación material. Si aplica, ninguna celda
> desde decisión hasta evidencia puede quedar vacía o con marcador.

| Control | WCAG 2.2 | Heurística | Aplica | Decisión / justificación | Tarea | Test | Evidencia |
|---|---|---|---|---|---|---|---|
| UX-COPY-001 | n/a | H9 recuperación de errores | sí | Cada error nuevo de `check-sdd` dice qué está mal y qué formato se espera, no solo que algo falló | T-009-09 | `scripts/test-install.mjs::matriz_usabilidad` | `evidence.md#UX-COPY-001` |
| UX-COPY-002 | n/a | H2 lenguaje del usuario | sí | Los avisos del instalador nombran el fichero y la acción concreta, sin jerga interna del validador | T-009-10 | `scripts/test-install.mjs::usabilidad_versionada` | `evidence.md#UX-COPY-002` |
| UX-A11Y-001 | 2.2 AA | H4 consistencia | no | La plantilla no renderiza interfaz: no hay contraste, foco ni orden de tabulación que verificar | — | — | — |
| UX-FORM-001 | 2.2 AA | H5 prevención de errores | no | No existe ningún formulario en la superficie entregada | — | — | — |
| UX-PERF-001 | n/a | H1 visibilidad del estado | no | `check-sdd` es síncrono y local; no hay espera perceptible que amortiguar | — | — | — |

### 9.4 · Auditoría de usabilidad prevista

- Skill: `/sdd-verify` paso 5 bis, con alcance `verify`.
- Auditor: `code-reviewer` en solo lectura, con las dos checklists como criterio. **No** se crea un
  agente nuevo: rompería la paridad de 20 en seis hosts, y `code-reviewer` ya coordina esta fase.
- Consultado en fase de plan: `ux-designer`, que conserva su rol de escritura en `/sdd-design`.
- Escritor autorizado: `docs-writer`, que materializa literalmente el HANDOFF.
- Informe: `docs/design/reports/YYYY-MM-DD-NNN-slug.md` con `<!-- sdd-usability-report:v1 -->`.

## 11. Observabilidad

- Logs: no aplica; las herramientas escriben a `stdout` con códigos de error estables.
- Métricas: número de errores por categoría, ya expuesto por `check-sdd`.
- Trazas: no aplica.
- **Caminos que se instrumentan**: los códigos `usabilidad/impacto`, `usabilidad/matriz`,
  `usabilidad/control`, `usabilidad/aplica`, `usabilidad/trazabilidad`, `usabilidad/estado`,
  `usabilidad/informe` y `diseno/tabla` son la superficie observable del contrato.
- **Salud por versión**: `VERSION_MANIFIESTO` 6 identifica la instalación; una instalación en 5 no
  tiene el contrato y se detecta en `update`.
- **Eventos de negocio**: no aplica.
- Alertas: CI en rojo es la única alerta; el playbook es arreglar o declarar el control no ejecutado.

## 12. Despliegue

- Feature flag: `enforceFromSpec` actúa como tal — se retira cuando ninguna spec activa sea anterior.
- Orden: doctrina → plantillas → skills y agentes → reglas de IDE → gates → validación → instalador →
  tests. La validación va **después** de las plantillas a propósito: validar antes de que exista qué
  validar deja el repositorio en rojo durante toda la implementación.
- Compatibilidad: una instalación en `VERSION_MANIFIESTO` 5 sigue funcionando; recibe el contrato al
  ejecutar `update`.

## 13. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| `check-sdd.mjs` crece y se vuelve inmantenible | Las funciones de usabilidad se colocan junto a sus equivalentes de seguridad, con el mismo nombre y forma; se lee por analogía |
| El fixture negativo pasa en verde y nadie lo nota | Es criterio de aceptación explícito (CA-02) y comprobación manual obligatoria en la verificación |
| La paridad de superficies se rompe al tocar cinco perfiles por seis hosts | `check-sdd` ya falla con `superficie/incompleta`; se ejecuta después de cada bloque de edición |
| Editar a mano los bloques `sdd:start/sdd:end` | Se regeneran desde `manifiesto.mjs`; editarlos a mano se pierde en el siguiente `update` |

## 14. Plan de reversión

```bash
git checkout main && git branch -D feat/009-usabilidad-integrada
```

Menos de un minuto. No hay datos migrados: el contrato solo existe en ficheros versionados. Una
instalación que ya hubiera recibido `VERSION_MANIFIESTO` 6 conserva el bloque `usability` en
`.sdd/installed.json`, que es inerte si el validador no lo lee.

## 15. Conformidad con la constitución

- [x] Respeta las reglas de dependencia
- [x] No introduce una arquitectura distinta sin ADR
- [x] Cada RF de la spec tiene componente(s) que lo cubren
- [x] Cada CA tiene un test previsto
- [x] Cada patrón tiene un problema real detrás
- [x] Nada implementado que la spec no pida (YAGNI) — sin agente ni skill nuevos
- [x] Toda dependencia nueva justificada en `research.md` — no hay ninguna

## 16. Gate humano del plan técnico

| Campo | Valor |
|---|---|
| **Estado** | `pending` |
| **Persona** | `<quién decide>` |
| **Fecha** | `<YYYY-MM-DD>` |
| **Alcance aprobado** | Doctrina, plantillas, skills, agentes, reglas de IDE, gates, validación, instalador y tests |
| **Condiciones / riesgos aceptados** | `<ninguno / lista>` |

> `/sdd-tasks` no comienza con este gate pendiente, con discrepancias abiertas o con un gate de
> producto, spec o diseño incompatible.
