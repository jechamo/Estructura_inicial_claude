# 012 · Autocumplimiento del CLI y gates realmente ejecutables

| Campo | Valor |
|---|---|
| **ID** | `012-autocumplimiento-cli-y-gates` |
| **Estado** | cerrada |
| **Autor** | usuario + `spec-analyst` (`declared-direct`) |
| **Fecha** | 2026-08-17 |
| **Rama** | `main` · trabajo local solicitado por el usuario |
| **Depende de** | `011-automatizacion-determinista-tokens` |
| **Impacto de seguridad** | `sensible` |
| **Impacto de usabilidad** | `aplicable` |
| **Impacto de documentación** | `aplicable · DOC-CLI` |

> Capacidad interna de la plantilla: no crea requisitos de producto ni decisiones de dominio.

## 1. Problema

La redacción de la memoria del TFM obligó a recorrer el sistema desde fuera, como lo haría
alguien que lo instala por primera vez, y ese recorrido dejó tres incumplimientos materiales de
la propia doctrina.

El primero es de robustez: `scripts/sdd-project.mjs` resuelve `.sdd/installed.json` con una
excepción que corta la ejecución. En el repositorio de la plantilla ese fichero no existe —es
estado local de cada instalación—, así que `product-status`, `docs-status`, `approve-product` y
`new-spec` fallan con exit 1 sobre el propio repositorio que los publica. `status` ya degrada
correctamente a `{ mode: 'template' }`; el resto de comandos no replicó ese patrón.

El segundo es de contrato: el CLI promete salida JSON con `--json`, pero el `catch` del
despachador escribe texto plano por `stderr`. Un agente que orquesta el circuito recibe una
cadena no parseable justo en el caso en el que más necesita razonar sin gastar contexto.

El tercero es de honestidad del gate: `.sdd/checks.json` declara `sdd` y `security` y deja los
otros doce identificadores en `unconfigured`. La plantilla tiene tres suites propias
—`test-hooks.mjs`, `test-install.mjs`, `skills-sync.mjs --check`— que se ejecutan a mano y no
están declaradas, de modo que `run --fast` no ejerce sobre este repositorio la disciplina que
este repositorio exige a los demás. Además, `unconfigured` es una lista de identificadores sin
motivo: nadie puede distinguir "no aplica" de "se nos olvidó".

Ninguno de los tres se detecta con las suites actuales porque todas ellas construyen una
instalación completa en un directorio temporal, donde `.sdd/installed.json` siempre existe y
donde los gates se configuran a propósito para el caso de prueba.

## 2. Objetivo

Que la plantilla cumpla sobre sí misma las tres promesas que hace a quien la instala: degradar
sin romper, hablar el contrato que declara y verificar con gates ejecutables y justificados.

## 3. Requisitos

| Id | Requisito EARS | Prioridad | Esfuerzo |
|---|---|---|---:|
| RF-01 | CUANDO no exista `.sdd/installed.json`, `product-status` y `docs-status` DEBEN devolver el estado por defecto de plantilla y terminar con exit 0, igual que `status`. | M | S |
| RF-02 | SI un comando falla y se invocó con `--json`, el CLI DEBE emitir por `stderr` un objeto JSON con `ok: false` y `error`, y conservar el exit code distinto de cero. | M | S |
| RF-03 | CUANDO se ejecute `approve-product` sin `.sdd/installed.json`, el CLI DEBE crear el registro con la aprobación, y solo después de que la validación completa del baseline haya pasado. | M | M |
| RF-04 | CUANDO se invoque `--help`, `-h` o `help`, el CLI DEBE imprimir el uso de todos los subcomandos y terminar con exit 0, sin alterar que una invocación desnuda siga resolviendo a `status`. | S | S |
| RF-05 | CUANDO se ejecute `run --fast` sobre este repositorio, DEBE ejecutar gates reales del propio proyecto y no solo el gate del circuito. | M | M |
| RF-06 | SI un identificador de gate queda sin configurar, el proyecto DEBE declarar por escrito el motivo material por el que no aplica. | M | S |

## 4. Criterios de aceptación

### CA-01 · Degradación sin estado instalado

Sobre un árbol sin `.sdd/installed.json`, `product-status` y `docs-status` devuelven JSON
parseable con `status` derivado del modo plantilla y exit 0. Con el fichero presente, la salida
sigue siendo exactamente la registrada: la degradación no sustituye estado real.

### CA-02 · Error máquina-legible

Un comando desconocido, un argumento desconocido y un fichero de configuración inválido
producen, con `--json`, una única línea JSON en `stderr` con `ok:false` y `error` no vacío, y
exit 1. Sin `--json`, el mensaje sigue siendo la frase humana actual.

### CA-03 · Aprobación desde cero

`approve-product` sobre un baseline válido y sin registro previo crea `.sdd/installed.json` con
`product.status: approved`, `approvedBy`, `approvedAt`, hashes y `enforceFromSpec`. Con un
baseline inválido no escribe nada y falla con el mismo mensaje de validación de siempre.

### CA-04 · Ayuda descubrible

`--help`, `-h` y `help` imprimen todos los subcomandos y terminan con 0. Una invocación sin
argumentos sigue devolviendo el snapshot de `status`.

### CA-05 · Gates propios ejecutables

`.sdd/checks.json` de este repositorio declara gates `lint`, `test` y `build` rápidos y `e2e`
lento, con comandos que existen y terminan en verde; `run --fast` los ejecuta y `run --slow`
conserva `security` obligatorio.

### CA-06 · Ausencias justificadas

Cada identificador que quede en `unconfigured` tiene su motivo publicado en
`docs/quality/TEST-STRATEGY.md`, y ningún gate configurado aparece a la vez como no configurado.

## 5. Fuera de alcance

- Añadir dependencias: no se incorpora ESLint, Prettier, TypeScript ni ninguna herramienta externa.
- Cambiar el esquema de `.sdd/checks.json` o el vocabulario cerrado de gates.
- Reinterpretar las specs 001–011 ni añadirles trazabilidad de producto retroactiva.
- Configurar gates que este repositorio no puede ejecutar honestamente (`typecheck`, `visual`, `mutation`).

## 6. Gate humano

| Campo | Valor |
|---|---|
| **Estado** | `approved` |
| **Aprobado por** | usuario |
| **Fecha** | 2026-08-17 |
| **Alcance de la decisión** | corregir los tres incumplimientos de código detectados al documentar el sistema |
| **Condiciones** | sin dependencias nuevas; `run --fast` debe seguir siendo de segundos |

### HANDOFF
- Agente origen: spec-analyst
- Fase completada: specify
- Fuentes consultadas: `scripts/sdd-project.mjs`, `.sdd/checks.json`, `scripts/check-sdd.mjs`, memoria del TFM
- Artefactos: `docs/specs/012-autocumplimiento-cli-y-gates/spec.md`
- Requisitos / casos cubiertos: RF-01…RF-06 · CA-01…CA-06
- Discrepancias: ninguna
- Decisiones tomadas: corregir el CLI antes de aprobar el baseline de producto, para no bloquearse
- Supuestos: Node 18+; cero dependencias
- Bloqueos: ninguno para TDD
- Siguiente agente sugerido: planner
- Comando / contexto durable: `/sdd-plan docs/specs/012-autocumplimiento-cli-y-gates/spec.md`
