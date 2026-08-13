# Plan de test · 009-usabilidad-integrada

---

## 1. Alcance

Se prueba que el **contrato** de usabilidad existe, se exige y no se puede eludir: la clasificación
en la spec, la matriz de controles, la propagación a tareas y evidencia, el informe parseable, la
puerta de `GO`, la paridad entre superficies y la distribución de la doctrina.

**No** se prueba que una interfaz concreta sea usable: esta spec entrega el contrato, no una
librería de componentes. Tampoco se prueban las herramientas externas de accesibilidad (axe,
pa11y, lighthouse): la plantilla no las empaqueta y no presupone stack.

## 2. Mapa criterio → test

| OBJ | PRD-RF | UC | RF | CA | Tarea | Comportamiento | Nivel | Test |
|---|---|---|---|---|---|---|---|---|
| OBJ-001 | PRD-RF-001 | UC-001 | RF-01 | CA-01 | T-009-02 | Una spec sin clasificación no aprueba plan | integración | `scripts/test-install.mjs::usabilidad_versionada` |
| OBJ-001 | PRD-RF-001 | UC-001 | RF-02 | CA-02 | T-009-09 | Control aplicable sin trazabilidad completa bloquea | integración | `scripts/test-install.mjs::matriz_usabilidad` |
| OBJ-001 | PRD-RF-001 | UC-001 | RF-02 | CA-03 | T-009-09 | ID de control mal formado se rechaza | unitario | `scripts/test-install.mjs::matriz_usabilidad` |
| OBJ-001 | PRD-RF-001 | UC-001 | RF-03 | CA-04 | T-009-03 | Los controles llegan a las tareas | integración | `scripts/test-install.mjs::matriz_usabilidad` |
| OBJ-001 | PRD-RF-001 | UC-001 | RF-04 | CA-05 | T-009-04 | El informe es parseable | contrato | `scripts/test-install.mjs::matriz_usabilidad` |
| OBJ-001 | PRD-RF-001 | UC-001 | RF-05 | CA-06 | T-009-09 | Un hallazgo ALTO impide la entrega | integración | `scripts/test-install.mjs::matriz_usabilidad` |
| OBJ-001 | PRD-RF-001 | UC-001 | RF-05 | CA-07 | T-009-09 | Un control no ejecutado impide la entrega | integración | `scripts/test-install.mjs::matriz_usabilidad` |
| OBJ-001 | PRD-RF-001 | UC-001 | RF-06 | CA-08 | T-009-01 | La doctrina se distribuye | E2E | `scripts/test-install.mjs::portabilidad_usabilidad` |
| OBJ-001 | PRD-RF-001 | UC-001 | RF-07 | CA-09 | T-009-06, T-009-07 | Las seis superficies reciben la doctrina | contrato | `scripts/test-install.mjs::portabilidad_usabilidad` |
| OBJ-001 | PRD-RF-001 | UC-001 | RF-08 | CA-10 | T-009-05 | El HANDOFF conserva la usabilidad | contrato | `scripts/test-install.mjs::portabilidad_usabilidad` |
| OBJ-001 | PRD-RF-001 | UC-001 | RF-09 | CA-11 | T-009-08 | El gate a11y no se presupone | integración | `scripts/test-hooks.mjs` |
| OBJ-001 | PRD-RF-001 | UC-001 | RF-10 | CA-12 | T-009-09 | Las tablas de diseño dejan de ser decorativas | integración | `scripts/test-install.mjs::matriz_usabilidad` |

**Regla**: ningún CA sin test. Ningún test sin CA (salvo tests técnicos justificados).

## 3. Por nivel

### Unitarios
Formato de identificadores y parseo, sin tocar el sistema de ficheros más allá del fixture.
- Expresión de `UX-<AREA>-NNN` con áreas válidas e inválidas.
- Parseo del bloque `<!-- sdd-usability-report:v1 -->` con JSON válido, inválido y ausente.
- Lectura de `Impacto de usabilidad` con los tres valores y con un valor inventado.

### Integración
`check-sdd.mjs --strict` sobre fixtures completos en `SDD_SPECS_DIR` temporal.
- Fixture positivo: spec `aplicable` con matriz completa e informe `PASS` → código 0.
- Fixtures negativos, uno por motivo de bloqueo (ver §4).

### Contrato
Paridad entre superficies y presencia de artefactos distribuidos.
- 20 perfiles en cada uno de los seis directorios de agentes.
- 26 skills canónicas con su adaptador en `.claude/skills/`.
- `.cursor/rules/40-usability.mdc` y `.github/instructions/usability.instructions.md` presentes y
  con `glob`/`applyTo` que cubren ficheros de UI.
- Campo de usabilidad presente en los bloques `### HANDOFF` de la cadena posterior al diseño.

### E2E
Instalación real en directorio temporal.
- `install` limpio: llegan los dos checklists, `docs/design/reports/` y el bloque `usability`.
- `update` sobre una instalación en `VERSION_MANIFIESTO` 5: recibe el contrato como
  `legacy-pending` sin pisar comandos ajenos de `.sdd/checks.json`.

## 4. Casos límite a cubrir

> La tabla de la plantilla asume una aplicación con datos. Aquí se sustituye por los límites que
> esta spec tiene de verdad; rellenar "zonas horarias" con un guion sería ruido.

| Caso | Test | Estado |
|---|---|---|
| Spec anterior a `enforceFromSpec` sin clasificación | `matriz_usabilidad` — no se exige nada | pendiente |
| `Impacto de usabilidad` con valor inventado | `usabilidad_versionada` — error `usabilidad/impacto` | pendiente |
| `sin-ui` sin motivo material | `usabilidad_versionada` — error | pendiente |
| Matriz con marcadores de plantilla sin sustituir | `matriz_usabilidad` — error | pendiente |
| Dos controles con el mismo identificador | `matriz_usabilidad` — error de duplicado | pendiente |
| `Aplica = no` sin justificación material | `matriz_usabilidad` — error | pendiente |
| Informe con JSON malformado | `matriz_usabilidad` — error de esquema, no excepción | verde |
| Informe fuera de `docs/design/reports/` o con `..` | `matriz_usabilidad` — rechazado | verde |
| `verdict: PASS` con `openFindings.medium > 0` | `matriz_usabilidad` — rechazado | verde |
| `controlsNotExecuted` no vacío con `GO` | `matriz_usabilidad` — bloquea | verde |
| `design.md` con tabla §6 en blanco e impacto `aplicable` | `matriz_usabilidad` — error `diseno/tabla` | pendiente |
| Proyecto sin runner de a11y | `test-hooks.mjs` — el sello no rompe | pendiente |
| Superficie de agente incompleta tras editar seis hosts | `portabilidad_usabilidad` — `superficie/incompleta` | pendiente |

## 5. Datos de prueba

- Fixtures: `docs/specs/902-usability-report` (positivo) y variantes negativas generadas en el
  directorio temporal del test, no versionadas.
- Builders: los helpers existentes de `test-install.mjs` para crear un árbol de spec mínimo.
- **Sin PII real.** Sin secretos, ni siquiera de prueba con formato válido.

### 5.1 · Casos de abuso y controles de seguridad

| Control | ASVS | OWASP | Caso de abuso / condición negativa | Nivel | Test | Resultado seguro esperado |
|---|---|---|---|---|---|---|
| SEC-PATH-001 | ASVS 5.0.0 V12 | A01:2025 | Ruta de informe con `..` o fuera de `docs/design/reports/` | integración | `scripts/test-install.mjs::matriz_usabilidad` | Rechazo cerrado y observable; el informe no se acepta |

### 5.2 · Casos de uso hostil y accesibilidad

> Obligatorio si `Impacto de usabilidad = aplicable`. Cada control aplicable de `plan.md` aparece
> aquí; un `no aplica` conserva la misma justificación material.

| Control | WCAG 2.2 | Heurística | Condición hostil | Nivel | Test | Resultado usable esperado |
|---|---|---|---|---|---|---|
| UX-COPY-001 | n/a | H9 recuperación de errores | Una persona ve el error del validador sin conocer el código fuente | integración | `scripts/test-install.mjs::matriz_usabilidad` | El mensaje nombra el fichero, el control y el formato esperado; no solo "inválido" |
| UX-COPY-002 | n/a | H2 lenguaje del usuario | Alguien instala la plantilla sin haber leído esta spec | E2E | `scripts/test-install.mjs::usabilidad_versionada` | El aviso dice qué se ha creado y desde qué spec se exigirá, sin jerga del validador |
| UX-A11Y-001 | 2.2 AA | H4 consistencia | — | — | — | `no aplica`: la plantilla no renderiza interfaz |
| UX-FORM-001 | 2.2 AA | H5 prevención de errores | — | — | — | `no aplica`: no existe ningún formulario |
| UX-PERF-001 | n/a | H1 visibilidad del estado | — | — | — | `no aplica`: sin espera perceptible |

## 6. Dobles

| Dependencia | Doble | Por qué |
|---|---|---|
| Sistema de ficheros del proyecto destino | directorio temporal real | Es barato y el test pierde todo su valor con un `fs` falso: lo que se prueba es precisamente que los ficheros llegan |
| `git` | ninguno | `test-install.mjs` no lo necesita para estos casos |

> No mockees lo que no controlas: envuélvelo en un puerto y haz un fake del puerto.

## 6 bis. Verificación documental

| DOC-ID | Tarea | Fuente | Artefacto | Comprobación o revisión | Resultado esperado |
|---|---|---|---|---|---|
| DOC-TRACE | T-009-07 | `docs/specs/_TEMPLATE/*.md` | `docs/sdd/OPERATING-MODEL.md` | `node scripts/check-sdd.mjs --strict` | La trazabilidad de usabilidad por fase existe y concuerda con las plantillas |
| DOC-VCS | T-009-10 | `scripts/install.mjs` | `docs/guides/INSTALACION.md` | `node scripts/check-sdd.mjs --strict` | La guía nombra el contrato nuevo y los ficheros que llegan al instalar |
| DOC-HOSTS | T-009-06 | `.claude/agents/*.md` | `docs/integrations/IDE-COMPATIBILITY.md` | `node scripts/check-sdd.mjs --strict` | La tabla de compatibilidad refleja las reglas por `glob` nuevas |

La documentación puede vivir en otro commit del mismo PR. `NO EJECUTADO` no equivale a verde.

## 7. Criterio de suficiencia

| Módulo / ruta | Tier | Umbral | Alcanzado |
|---|---|---:|---:|
| `scripts/check-sdd.mjs` | CORE | 100 % de los caminos nuevos | caminos contractuales 009 ejercitados |
| `scripts/install.mjs` | CORE | 100 % de los caminos nuevos | instalación/migración ejercitadas |
| `scripts/lib/manifiesto.mjs` | CORE | 100 % de los caminos nuevos | paquete e instalación ejercitados |
| `scripts/sdd-project.mjs` | IMPORTANT | 80 % | fast/slow/detect ejercitados |
| `.sdd/hooks/guard-bash.mjs` | IMPORTANT | 80 % | suite de hooks verde |
| `docs/**`, `.cursor/rules/**`, `.github/instructions/**` | INFRASTRUCTURE | excluido | — |

Este repositorio no tiene runner de cobertura configurado: el umbral se verifica por **caminos
nuevos ejercitados**, no por porcentaje. Esa limitación se declara aquí y en `evidence.md`, no se
disimula.

- Todos los CA con test verde
- Suite completa < 2 minutos
- Cero tests flaky, cero `.skip`, cero `.only`

## 8. Qué NO se automatiza

- **Que las reglas de IDE surtan efecto** en Cursor y Copilot. Se verifica manualmente abriendo un
  fichero de UI y comprobando que la regla se carga; no hay forma de automatizarlo sin el host.
- **Que la doctrina sea buena.** Que un checklist esté presente no lo hace correcto. Lo juzga la
  persona que aprueba el gate.
- **Que un `UX-*` sobreviva la cadena completa de delegación** en un host real. Se recorre a mano
  con una spec de juguete.

Los gates humanos de producto, spec, diseño, plan y entrega no se infieren de tests: su estado,
persona, fecha y alcance se comprueban como evidencia documental.

## 9. Fuentes y discrepancias

| Riesgo de intake | Fuente / discrepancia | Test o revisión | Resultado esperado |
|---|---|---|---|
| Las cuatro lecciones son material docente, no norma | `SRC-009-01..04` | Revisión al escribir la doctrina | Lo que se incorpora es el principio verificable, no el ejemplo en React de la diapositiva |
| WCAG 2.2 AA vs. la 2.1 que cita la lección 26 | `SRC-009-01` | Revisión | Se conserva **2.2 AA**, que ya era el estándar del repositorio; la discrepancia se documenta y no se degrada el nivel |
