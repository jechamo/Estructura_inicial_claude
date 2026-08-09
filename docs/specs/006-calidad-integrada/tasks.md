# Tareas · 006-calidad-integrada

| Campo | Valor |
|---|---|
| **Spec** | [`spec.md`](./spec.md) · **Plan**: [`plan.md`](./plan.md) |
| **Total** | 12 tareas · S: 4 · M: 5 · L: 3 |
| **Progreso** | 12/12 |

> **Nota de honestidad sobre este backlog.** Se escribió **después** de implementar, al cerrar el
> circuito, no antes. Es una reconstrucción fiel de lo ejecutado —cada tarea enlaza su evidencia
> real— pero no cumplió su función de guiar el troceo. Queda registrado como desviación en
> `evidence.md` §3 y en la bitácora: un backlog reconstruido no equivale a uno planificado.

---

## Trazabilidad

| RF | CA | Tarea | Verificación | Evidencia |
|---|---|---|---|---|
| RF-01, RF-02 | CA-01, CA-02 | T-006-01 | `check-sdd` + revisión de `TEST-STRATEGY.md` §0/§8 | `evidence.md#T-006-01` |
| RF-11 | CA-04 | T-006-02 | revisión de `METRICS.md` | `evidence.md#T-006-02` |
| RF-04 | CA-04 | T-006-03 | `sdd-project debt --json` | `evidence.md#T-006-03` |
| RF-03, RF-10 | CA-03 | T-006-04 | `check-sdd` paridad 25 skills | `evidence.md#T-006-04` |
| RF-17 | CA-06 | T-006-05 | revisión de `USABILITY-CHECKLIST.md` | `evidence.md#T-006-05` |
| RF-18 | CA-06 | T-006-06 | plantilla creada y enlazada | `evidence.md#T-006-06` |
| RF-07, RF-08, RF-13, RF-15 | CA-07 | T-006-07 | `check-sdd`, `test-hooks` | `evidence.md#T-006-07` |
| RF-06, RF-12, RF-14 | CA-05 | T-006-08 | `test-install` (detect/run/githooks) | `evidence.md#T-006-08` |
| RF-01, RF-05 | CA-01, CA-08 | T-006-09 | `check-sdd` vocabulario + conteo | `evidence.md#T-006-09` |
| RF-09 | CA-03 | T-006-10 | gate `skill/ruta-relativa` en rojo | `evidence.md#T-006-10` |
| RF-06 (defecto de la DoD) | CA-05 | T-006-11 | `scan-secrets` en rojo y en verde | `evidence.md#T-006-11` |
| RF-16 | CA-06 | T-006-12 | `--strict` en rojo y en verde | `evidence.md#T-006-12` |
| RF-07, RF-14 | CA-05, CA-07 | T-006-13 | `check-sdd` gate de permisos en rojo | `evidence.md#T-006-13` |
| RF-07, RF-14 | CA-05, CA-07 | T-006-14 | `test-hooks` sello en 4 escenarios | `evidence.md#T-006-14` |

- [x] Todo RF tiene al menos una tarea
- [x] Todo CA tiene verificación en alguna tarea
- [x] Ninguna tarea sin RF ni justificación transversal — T-006-11 es corrección de defecto,
      justificada por la fila de la DoD que prometía un gate inexistente

---

## Orden de ejecución

### T-006-01 · Reescribir la doctrina de verificación
- **Estado**: hecho
- **Terreno**: docs · **Skill**: — (documento vinculante, sin skill aplicable)
- **Cubre**: RF-01, RF-02 / CA-01, CA-02
- **Ficheros**: `docs/quality/TEST-STRATEGY.md`, `docs/quality/DEFINITION-OF-DONE.md`
- **Definición de hecho**: §8 sin umbral global, con tiers y defecto estricto; §0 con el marco de
  cuatro preguntas y la restricción de que no exime del rojo-verde
- **Estimación**: L

### T-006-02 · Documento de métricas accionables
- **Estado**: hecho · **Terreno**: docs · **Cubre**: RF-11 / CA-04
- **Ficheros**: `docs/quality/METRICS.md`
- **Definición de hecho**: tres niveles, umbral binario con acción, máximo cinco vivas y lista
  explícita de lo que no se reporta
- **Estimación**: M

### T-006-03 · Deuda medida por comando
- **Estado**: hecho · **Terreno**: tooling · **Cubre**: RF-04 / CA-04
- **Ficheros**: `docs/quality/TECH-DEBT.md`, `scripts/sdd-project.mjs`
- **Definición de hecho**: `debt --json` devuelve conteo determinista sobre ficheros versionados
- **Estimación**: M

### T-006-04 · Skill /observability y su artefacto
- **Estado**: hecho · **Terreno**: contrato · **Skill**: `/observability` (creada aquí)
- **Cubre**: RF-03, RF-10 / CA-03
- **Ficheros**: `.agents/skills/observability/`, `.claude/skills/observability/`, `docs/ops/OBSERVABILITY.md`
- **Definición de hecho**: 25 skills con adaptador, `check-sdd` en verde
- **Estimación**: L

### T-006-05 · Checklist de usabilidad
- **Estado**: hecho · **Terreno**: docs · **Cubre**: RF-17 / CA-06
- **Ficheros**: `docs/design/USABILITY-CHECKLIST.md`
- **Estimación**: M

### T-006-06 · Resumen ejecutivo
- **Estado**: hecho · **Terreno**: docs · **Cubre**: RF-18 / CA-06
- **Ficheros**: `docs/quality/_TEMPLATE.executive-summary.md`, `sdd-ship`, `release-manager`
- **Estimación**: S

### T-006-07 · Enriquecer perfiles y delegación
- **Estado**: hecho · **Terreno**: contrato · **Cubre**: RF-07, RF-08, RF-13, RF-15 / CA-07
- **Ficheros**: 12 perfiles de `.claude/agents/`, 10 skills, `.sdd/territories.json`
- **Definición de hecho**: `implementer` con dos filas nuevas; pasos de `/sdd-verify` en solo lectura
- **Estimación**: L

### T-006-08 · Gates ejecutables y portables
- **Estado**: hecho · **Terreno**: tooling · **Cubre**: RF-06, RF-12, RF-14 / CA-05
- **Ficheros**: `.sdd/checks.json`, `scripts/sdd-project.mjs`, `.sdd/githooks/`, `sdd-gates.yml`
- **Definición de hecho**: `detect` no escribe, `run --fast|--slow` reparte, githooks no se activan solos
- **Estimación**: L

### T-006-09 · Contrato, conteos y plantillas
- **Estado**: hecho · **Terreno**: tooling · **Cubre**: RF-01, RF-05 / CA-01, CA-08
- **Ficheros**: `check-sdd.mjs`, `test-install.mjs`, plantillas de spec, 8 documentos con el conteo
- **Estimación**: M

### T-006-10 · Skills autocontenidas
- **Estado**: hecho · **Terreno**: contrato · **Cubre**: RF-09 / CA-03
- **Ficheros**: 9 `SKILL.md`, `check-sdd.mjs`
- **Definición de hecho**: cero `](../` en skills canónicas, con gate que lo impide
- **Estimación**: M

### T-006-11 · Escaneo de secretos en CI ← corrección de defecto
- **Estado**: hecho · **Terreno**: tooling
- **Cubre**: RF-06 / CA-05 — es un gate ejecutable y portable, aunque nació de un defecto
- **Justificación**: la DoD prometía este gate "en CI, bloquea merge" y no existía
- **Ficheros**: `scripts/scan-secrets.mjs`, `.sdd/hooks/_lib.mjs`, `guard-write.mjs`, `sdd-gates.yml`
- **Definición de hecho**: detecta clave sembrada con fichero y línea, sale 1; patrones compartidos
- **Estimación**: M

### T-006-12 · Artefactos de entrega exigidos por máquina
- **Estado**: hecho · **Terreno**: tooling · **Cubre**: RF-16 / CA-06
- **Ficheros**: `scripts/check-sdd.mjs`
- **Definición de hecho**: `--strict` bloquea sin CHANGELOG, sin bitácora, y sin informes cuando
  `evidence.md` declara `GO`
- **Estimación**: S

### T-006-13 · Bit de ejecución de los git hooks ← corrección de defecto
- **Estado**: hecho · **Terreno**: tooling · **Cubre**: RF-07, RF-14 / CA-05, CA-07
- **Justificación**: los hooks estaban en el índice como `100644`; git no los ejecuta en Linux ni
  macOS, y en Windows `core.fileMode=false` lo ocultaba
- **Ficheros**: índice de git, `scripts/check-sdd.mjs`, `scripts/install.mjs`
- **Definición de hecho**: `100755` en el índice, gate que falla con `100644`, y `chmod` que avisa
  con el comando cuando no puede aplicarse
- **Estimación**: S

### T-006-14 · Gates antes de commit y push, en todas las superficies
- **Estado**: hecho · **Terreno**: tooling · **Cubre**: RF-07, RF-14 / CA-05, CA-07
- **Ficheros**: `scripts/sdd-project.mjs`, `.sdd/hooks/guard-bash.mjs`, `scripts/install.mjs`,
  `AGENTS.md`, `release-manager`, `implementer`, `/sdd-ship`, `/sdd-implement`
- **Definición de hecho**: sello por velocidad y árbol; `guard-bash` avisa sin bloquear; Husky en
  Node y `core.hooksPath` en el resto, sin pasos manuales; y el agente los ejecuta por su cuenta,
  que es lo único que llega a hosts sin git local
- **Estimación**: L
