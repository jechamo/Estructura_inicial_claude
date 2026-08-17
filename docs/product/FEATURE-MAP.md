# Mapa de funcionalidades y specs

> Estado: `pending`. Los cortes son verticales y se aprueban durante `/sdd-intake`.

| ID | Spec propuesta | Valor entregado | Objetivos | PRD-RF | Casos de uso | Estado |
|---|---|---|---|---|---|---|
| FEAT-001 | `002-portabilidad-instalador-universal` | instalación de un comando, conservadora y reversible, sobre cualquier repositorio | OBJ-003 | PRD-RF-005, PRD-RF-006 | UC-001 | entregada |
| FEAT-002 | `006-calidad-integrada` | trazabilidad obligatoria hasta la evidencia y gates declarados por el proyecto | OBJ-002 | PRD-RF-003, PRD-RF-004 | UC-002, UC-004 | entregada |
| FEAT-003 | `007-seguridad-jwt-owasp-2025` | guardas de escritura y de comando alineadas con OWASP Top 10:2025 | OBJ-001 | PRD-RF-001, PRD-RF-002 | UC-003 | entregada |
| FEAT-004 | `011-automatizacion-determinista-tokens` | estado del circuito en comandos deterministas y carga de proceso bajo demanda | OBJ-004 | PRD-RF-007, PRD-RF-008 | UC-005 | entregada |

## Dependencias de producto

FEAT-001 precede a todo lo demás: sin instalación no hay circuito. FEAT-002 depende de FEAT-001
porque los gates se declaran en el fichero que la instalación siembra. FEAT-003 y FEAT-004 son
independientes entre sí y pueden avanzar en paralelo una vez existe FEAT-001.

## Cobertura diferida

Ningún requisito del baseline queda fuera de las funcionalidades anteriores. Lo que sí queda
diferido es la ampliación de gates que exigirían dependencias externas —análisis de complejidad
y mutación—, cuyo motivo se documenta en la estrategia de test.
