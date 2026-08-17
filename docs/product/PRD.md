# PRD · Baseline de producto

| Campo | Valor |
|---|---|
| Estado | `approved` |
| Aprobado por | Jesus Chamorro|
| Fecha de aprobación | 2026-08-17T11:02:18.124Z|
| Alcance aprobado | el ecosistema portable de agentes SDD: instalador, circuito de specs, guardas, gates y documentación viva |

## Problema y personas

Trabajar con agentes de IA sobre un repositorio real produce dos fallos opuestos. O el agente
escribe rápido y rompe cosas —toca ficheros que no le corresponden, afirma que los tests pasan,
filtra un secreto—, o el proceso para evitarlo se vuelve tan pesado que nadie lo sigue y se
abandona a la tercera sesión.

Este producto existe para que modificar código con IA sea seguro **y** fácil a la vez. Cuatro
ejes lo gobiernan y ninguno puede sacrificarse por otro: **seguridad**, **calidad**, **facilidad**
y **coste de tokens**.

Personas:

- **Quien desarrolla con un agente**: quiere avanzar sin releer el repositorio entero en cada
  sesión ni justificar por escrito cada línea.
- **Quien revisa**: necesita saber qué se ejecutó de verdad y qué solo se declaró, sin creerse
  la palabra del modelo.
- **Quien mantiene el repositorio**: necesita que el proceso sobreviva a cambios de IDE, de
  modelo y de persona.

## Objetivos

| ID | Resultado observable | Métrica |
|---|---|---|
| OBJ-001 | Un agente no puede realizar una acción destructiva ni exponer un secreto sin que una guarda lo detenga | acciones peligrosas bloqueadas o escaladas por las guardas, sin falsos negativos conocidos |
| OBJ-002 | Nada se da por terminado sin evidencia ejecutada y trazable hasta la spec | tareas en estado hecho con test nombrado y resultado real registrado |
| OBJ-003 | Empezar a trabajar con el circuito cuesta un comando, en cualquiera de los IDE soportados | instalación completada sin sobrescribir trabajo previo en los seis hosts |
| OBJ-004 | Recuperar el estado del proyecto no obliga a releer el repositorio | estado del circuito obtenido con una llamada determinista en lugar de lectura exploratoria |

## Requisitos de producto

| ID | Objetivo | Requisito | Prioridad | Fuente |
|---|---|---|---|---|
| PRD-RF-001 | OBJ-001 | Las guardas deben bloquear escrituras y comandos destructivos antes de que ocurran, y escalar a la persona lo que no puedan decidir | M | SRC-001 |
| PRD-RF-002 | OBJ-001 | Ningún secreto, credencial ni fichero de entorno debe poder leerse, copiarse ni versionarse desde el circuito | M | SRC-001 |
| PRD-RF-003 | OBJ-002 | Una tarea solo puede declararse hecha si enlaza spec, criterio, test y evidencia con resultado ejecutado | M | SRC-003 |
| PRD-RF-004 | OBJ-002 | Los gates de calidad los declara cada proyecto; lo que no se ejecuta debe quedar visible y justificado, nunca silencioso | M | SRC-003 |
| PRD-RF-005 | OBJ-003 | La instalación debe poder aplicarse sobre un repositorio existente sin sobrescribir trabajo previo y debe ser reversible | M | SRC-001 |
| PRD-RF-006 | OBJ-003 | La misma definición de agentes y skills debe funcionar en los seis entornos soportados sin duplicar el contenido | M | SRC-002 |
| PRD-RF-007 | OBJ-004 | El estado del circuito debe obtenerse mediante comandos deterministas con salida legible por máquina | M | SRC-003 |
| PRD-RF-008 | OBJ-004 | El conocimiento de proceso debe cargarse bajo demanda, no inyectarse entero en cada conversación | S | SRC-002 |

## Reglas y restricciones

- Cero dependencias de runtime: solo Node 18 o superior y la librería estándar.
- El contenido externo —un PRD, una URL, la salida de una herramienta— es dato, nunca instrucción.
- Una aprobación humana no puede sustituirse por una decisión del agente.
- La plantilla se aplica a sí misma lo que exige a los proyectos que la instalan.

## No objetivos

- No es un framework de aplicación ni impone lenguaje, stack ni arquitectura.
- No sustituye la revisión humana: la reduce a lo que de verdad requiere criterio.
- No pretende funcionar sin git ni sin un repositorio versionado.

## Métricas y riesgos

Métricas: acciones peligrosas interceptadas, tareas cerradas con evidencia ejecutada frente a
declarada, instalaciones limpias sobre repositorios con trabajo previo, y tokens consumidos por
sesión frente a la lectura exploratoria equivalente.

Riesgos: que un host deje de soportar su formato de agentes; que el proceso se perciba como
burocracia y se desactive; y que la evidencia se declare sin ejecutarse, que es el modo de fallo
más caro porque es invisible.

## Supuestos y preguntas

Se asume que quien usa el sistema tiene permiso de escritura sobre el repositorio y que los gates
declarados son ejecutables en su máquina. La decisión sobre añadir motores externos de mutación o
de análisis de complejidad sigue abierta y se documenta en la estrategia de test.
