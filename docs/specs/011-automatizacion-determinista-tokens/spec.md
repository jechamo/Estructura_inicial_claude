# 011 · Automatización determinista y reducción medible de tokens

| Campo | Valor |
|---|---|
| **ID** | `011-automatizacion-determinista-tokens` |
| **Estado** | aprobada · implementación completa; release pendiente de CI |
| **Autor** | usuario + `spec-analyst` (`declared-direct`) |
| **Fecha** | 2026-08-16 |
| **Rama** | `main` · trabajo local solicitado por el usuario |
| **Depende de** | `008-documentacion-viva-portable`, `010-trazabilidad-release-latest` |
| **Impacto de seguridad** | `sensible` |
| **Impacto de usabilidad** | `sin-ui · amplía un CLI y skills, sin interfaz gráfica` |
| **Impacto de documentación** | `aplicable · DOC-AUTO, DOC-SKILLS, DOC-GEN` |

> Capacidad interna de la plantilla: no crea requisitos de producto ni decisiones de dominio.

## 1. Problema

Las skills repiten inspecciones, esqueletos y checklists que una herramienta determinista puede
resolver con menos contexto y menor riesgo de divergencia. Sin medición, reducir instrucciones
también puede ocultar criterios útiles o automatizar decisiones que pertenecen a una persona.

## 2. Objetivo y métrica

Automatizar solo trabajo mecánico y mantener el razonamiento semántico en el agente.

Una candidata se integra únicamente si conserva todos los checks funcionales y reduce al menos
un 20 % la mediana de tokens o un 30 % el tiempo frente a la skill de `v0.6.0`.

## 3. Requisitos

| Id | Requisito EARS | Prioridad |
|---|---|---:|
| RF-01 | CUANDO se consulte el estado, el CLI DEBE devolver un snapshot JSON versionado con baseline, specs, fases, tareas, Git y siguiente paso calculable. | M |
| RF-02 | CUANDO se solicite scaffold de `design`, `plan`, `tasks` o `verify`, el CLI DEBE instanciar solo la plantilla canónica y nunca sobrescribir ni aprobar decisiones. | M |
| RF-03 | CUANDO se consulte trazabilidad, el CLI DEBE extraer OBJ, PRD-RF, UC, RF, CA, SEC, UX y DOC y declarar cobertura y huérfanos sin inventar enlaces. | M |
| RF-04 | CUANDO se ejecute `check-sdd --json`, DEBE conservar el veredicto y exit code del gate humano con un esquema compacto y estable. | M |
| RF-05 | SI un proyecto registra un generador aprobado, el CLI DEBE ejecutarlo sin shell, con programa/argumentos separados y entradas/salidas confinadas. | M |
| RF-06 | SI no hay generadores aprobados, la instalación DEBE dejar un registro vacío, portable e idempotente y no instalar dependencias. | M |
| RF-07 | CUANDO una skill use estas operaciones, DEBE cargar solo reglas críticas y referencias aplicables, manteniendo una única implementación canónica. | S |
| RF-08 | CUANDO una candidata no alcance el umbral o pierda calidad, DEBE descartarse y quedar registrada como experimento. | M |

## 4. Criterios de aceptación

### CA-01 · Estado fiable

Cero, una y varias specs activas producen snapshots diferenciados; `--spec NNN` limita el
detalle sin ocultar ambigüedad global y una salida no JSON sigue siendo legible.

### CA-02 · Scaffold conservador

`--dry-run` no escribe, una fase existente no se reemplaza y ninguna plantilla contiene una
decisión materializada por el CLI.

### CA-03 · Trazabilidad explícita

Cada familia de ID informa declarados, referencias, cubiertos y huérfanos con orden estable.

### CA-04 · Gate consumible

La salida JSON de `check-sdd` incluye versión de esquema, modo, alcance, contadores, avisos y
problemas; un problema mantiene exit code distinto de cero.

### CA-05 · Generación segura y opt-in

Registro ausente, inválido, ID desconocido, traversal, enlaces, programa hostil, argumento
hostil, fallo del proceso o output ausente/drift fallan sin simular éxito.

### CA-06 · Portabilidad

Greenfield, brownfield, update y segunda ejecución conservan el registro y todos los hosts
consumen los mismos scripts desde las skills canónicas.

### CA-07 · Reducción demostrada

El benchmark compara `v0.6.0` con la candidata en estado, ADR, spec/plan/tareas,
documentación y verify; se publican métricas, checks y descartes.

## 5. Fuera de alcance

- Generar requisitos, criterios de aceptación o texto decisorio de ADR.
- Elegir arquitectura, patrones, campos o validaciones de DTO.
- Descomponer semánticamente tareas o emitir veredictos de seguridad/usabilidad.
- Instalar Swagger, Storybook, TypeDoc u otros generadores.
- Crear un generador universal dependiente de stack.

## 6. Gate humano

| Campo | Valor |
|---|---|
| **Estado** | `approved` |
| **Aprobado por** | usuario |
| **Fecha** | 2026-08-16 |
| **Alcance de la decisión** | plan completo de automatización determinista y benchmark conservador |
| **Condiciones** | no integrar una candidata sin ahorro medido o si reduce calidad |

### HANDOFF
- Agente origen: spec-analyst
- Fase completada: specify
- Fuentes consultadas: plan explícitamente aprobado, CLI y 25 skills actuales
- Artefactos: `docs/specs/011-automatizacion-determinista-tokens/spec.md`
- Requisitos / casos cubiertos: RF-01…RF-08 · CA-01…CA-07
- Discrepancias: ninguna
- Decisiones tomadas: automatizar mecánica; mantener decisiones semánticas en agentes/personas
- Supuestos: Node 18+; ningún generador activo por defecto
- Bloqueos: ninguno para TDD
- Siguiente agente sugerido: planner
- Comando / contexto durable: `/sdd-plan docs/specs/011-automatizacion-determinista-tokens/spec.md`
