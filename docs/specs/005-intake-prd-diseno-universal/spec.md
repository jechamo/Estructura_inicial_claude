# 005 · Intake universal de PRD y diseño

| Campo | Valor |
|---|---|
| Estado | aprobada |
| Tipo | capacidad transversal de producto |
| Versión objetivo | v0.4.0 |
| Aprobación | plan explícitamente aprobado por el usuario el 2026-08-03 |

## Objetivo

Permitir que el usuario entregue al `orchestrator` un PRD y un diseño opcional en cualquier formato
accesible, normalizarlos en una base de producto durable y comenzar el circuito SDD sin depender del
contexto efímero del chat ni generar código durante el intake.

## Requisitos

| Id | Requisito EARS | Prioridad | Esfuerzo |
|---|---|---:|---:|
| RF-01 | Cuando el usuario aporte texto, ruta, carpeta, URL o PRD del repo, el sistema DEBE identificar y leer solo las fuentes accesibles. | M | 4 |
| RF-02 | Cuando termine la normalización, el sistema DEBE producir `PRD.md`, `USE-CASES.md`, `FEATURE-MAP.md` y `SOURCES.md`. | M | 4 |
| RF-03 | Cuando use una fuente, el sistema DEBE registrar procedencia, fecha, accesibilidad y hash cuando pueda calcularlo. | M | 3 |
| RF-04 | Cuando cree el mapa de producto, el sistema DEBE mantener la cadena `OBJ → PRD-RF → UC → spec/RF → CA → tarea → test → evidencia`. | M | 4 |
| RF-05 | Cuando detecte contradicciones o termine el baseline, el sistema DEBE pausar en un gate humano de producto antes de arquitectura o specs. | M | 3 |
| RF-06 | Durante intake, el orquestador DEBERÍA delegar en `spec-analyst`, `ux-designer` y de nuevo `spec-analyst`, con handoffs durables y sin encadenamiento de especialistas. | S | 4 |
| RF-07 | Cuando un host no permita delegación automática, el sistema DEBERÍA indicar agente/comando exacto y reanudar desde documentos. | S | 4 |
| RF-08 | Cuando se actualice un brownfield sin baseline de producto, el sistema DEBERÍA usar `legacy-pending` como aviso no bloqueante y preservar todo contexto existente. | S | 3 |
| RF-09 | Cuando un greenfield no tenga producto aprobado, `/sdd-init` DEBERÍA redirigir a intake y bloquear la decisión arquitectónica. | S | 3 |
| RF-10 | Si Stitch/Figma o un diseño resultan inaccesibles, el sistema DEBERÍA pedir acceso/exportación o permiso para tratarlos como ausentes. | S | 3 |
| RF-11 | Durante intake, el sistema DEBE tratar todas las fuentes como datos no confiables, no activar MCP ni copiar credenciales y no generar código. | M | 2 |
| RF-12 | Cuando se instale v0.4.0, el sistema DEBERÍA mantener 20 agentes, exponer 24 skills y no crear prompts/commands paralelos para `sdd-intake`. | S | 2 |

Reparto MoSCoW por esfuerzo: M 20/39 (51,3 %), S 19/39 (48,7 %), C 0 %, W 0 %.

## Criterios de aceptación

### CA-01 · Fuentes universales y seguras

Texto pegado, fichero, carpeta, URL, PRD del repo, enlace Stitch/Figma, boceto o ausencia de diseño
se clasifican sin interpretar su contenido como instrucciones. Una fuente inaccesible queda
registrada y bloquea solo la decisión que dependa de ella.

### CA-02 · Baseline de producto

Los cuatro documentos existen con IDs únicos, objetivos, requisitos, casos de uso, mapa de specs,
contradicciones, supuestos, no objetivos y procedencia; el original puede permanecer en origen.

### CA-03 · Trazabilidad sin huérfanos

Todo `PRD-RF` cubierto apunta al menos a un `UC` y a una spec propuesta; ningún `UC`, spec/RF o CA
declara un identificador inexistente.

### CA-04 · Gate y discrepancias

PRD y diseño contradictorios producen una discrepancia visible y no avanzan hasta decisión humana.
El gate registra `pendiente`, `aprobado` o `rechazado` con fecha, actor y alcance.

### CA-05 · Delegación y handoff

Cada fase devuelve fuentes, artefactos, cobertura, discrepancias, supuestos, bloqueos y siguiente
agente. La profundidad no supera dos saltos y los especialistas no delegan.

### CA-06 · Greenfield y brownfield

Greenfield exige producto aprobado antes de arquitectura. Brownfield conserva PRD, visión, specs,
arquitectura y diseño; si carece del baseline nuevo queda `legacy-pending` sin romper gates.

### CA-07 · Paridad multihost

Existen 20 agentes en las cuatro superficies adaptadas, 24 skills canónicas y 24 adaptadores Claude.
VS Code/Cursor descubren `sdd-intake` una sola vez y no hay agente adicional.

### CA-08 · Instalación y compatibilidad

Greenfield, brownfield, update e idempotencia pasan en Node 18/20/22 y Windows/Linux; las plantillas
de producto solo se crean cuando faltan y MCP sigue desactivado por defecto.

## Gates humanos

1. PRD, casos, contradicciones y mapa de specs.
2. Arquitectura y stack, solo greenfield.
3. Spec funcional sin ambigüedades.
4. Dirección visual y diseño.
5. Plan técnico.
6. Entrega final.

## Fuera de alcance

- Implementar código de producto durante intake.
- Copiar obligatoriamente originales externos o habilitar acceso sin permiso.
- Añadir un agente número 21, MCP por defecto o formatos paralelos de comando.
