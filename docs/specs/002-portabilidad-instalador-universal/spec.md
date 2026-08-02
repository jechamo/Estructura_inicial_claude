# 002 · Portabilidad e instalación universal del ecosistema SDD

| Campo | Valor |
|---|---|
| Estado | aprobada |
| Autor | usuario + Codex |
| Fecha | 2026-08-02 |
| Dependencias | ninguna |

## Problema

La plantilla contiene un circuito SDD/TDD completo, pero parte de sus adaptadores no coincide con
los formatos vigentes de todos los entornos soportados y el instalador puede trasladar contexto
histórico, decisiones o supuestos de stack a proyectos nuevos. Adoptarla en un proyecto existente
también exige preservar instrucciones y configuración propias sin sobrescrituras silenciosas.

## Objetivo y métricas de éxito

Un único comando debe instalar el ecosistema en un directorio nuevo o existente, dejando un
proyecto nuevo sin historia ajena y conservando íntegramente el contexto de un proyecto existente.

- 100 % de las superficies soportadas con adaptadores detectables y validados.
- 0 ficheros de historia de la plantilla en una instalación greenfield.
- 0 sobrescrituras de contenido ajeno en los escenarios brownfield cubiertos.
- Instalación repetida sin cambios ni conflictos espurios.

## Usuarios y contexto

- Persona que inicia un proyecto nuevo y quiere SDD/TDD desde el primer commit.
- Equipo que adopta el flujo en un repositorio con código e instrucciones existentes.
- Mantenedor que actualiza varios proyectos cuando evoluciona la plantilla.

## Requisitos funcionales

| Id | Requisito EARS | Prioridad | Esfuerzo |
|---|---|---:|---:|
| RF-01 | CUANDO se instale en un directorio nuevo, el sistema DEBE crear el motor SDD y esqueletos sin historia ni decisiones de la plantilla. | M | 8 |
| RF-02 | CUANDO se instale o actualice un repositorio existente, el sistema DEBE conservar su contenido y fusionar solo elementos gestionados. | M | 8 |
| RF-03 | El sistema DEBE exponer agentes, skills y hooks en los formatos soportados por cada host declarado. | M | 8 |
| RF-04 | El sistema DEBE conservar las reglas de delegación, handoff y trazabilidad sin afirmar ejecuciones no observadas. | M | 5 |
| RF-05 | El sistema DEBE validar de forma determinista estructura, paridad, estado virgen y trazabilidad. | S | 5 |
| RF-06 | El sistema DEBE ofrecer comandos deterministas para inventario, scaffolding, estado y verificación. | S | 3 |
| RF-07 | SI se solicitan integraciones MCP, ENTONCES el sistema DEBE instalarlas solo mediante selección explícita y configuración sin secretos. | C | 3 |
| RF-08 | El sistema DEBE permitir simular la instalación y producir salida legible o JSON. | C | 2 |

Esfuerzo total: 42. Must: 29/42 = 69 %. Se acepta excepcionalmente porque RF-01–RF-04 forman
un único mínimo de seguridad y portabilidad; quitar cualquiera invalidaría la promesa central.

## Requisitos no funcionales

- RNF-01: funcionar en Windows, Linux y macOS con Node.js 18 o superior.
- RNF-02: no requerir dependencias de runtime para la instalación base.
- RNF-03: no leer ni copiar secretos o ficheros `.env`.
- RNF-04: producir operaciones idempotentes y rutas normalizadas.
- RNF-05: fallar de forma visible ante configuración malformada o conflicto no resoluble.
- RNF-06: no prometer capacidades que el host no pueda imponer.

## Criterios de aceptación

### CA-01 · Instalación greenfield virgen — RF-01

**Dado** un directorio vacío, **cuando** se instala la plantilla, **entonces** contiene los
esqueletos definidos y no contiene specs activas, decisiones, sesiones, informes, auditoría,
versiones de changelog, MCP activos ni supuestos de stack procedentes de la plantilla.

### CA-02 · Conservación brownfield — RF-02

**Dado** un repositorio con instrucciones, documentación y configuraciones propias, **cuando** se
instala o actualiza el motor, **entonces** esos contenidos permanecen y solo cambian bloques o
entradas gestionadas identificables.

### CA-03 · Paridad por host — RF-03

**Dado** el proyecto instalado, **cuando** se valida cada superficie, **entonces** los agentes,
skills y hooks declarados tienen adaptador válido y apuntan a una fuente canónica existente.

### CA-04 · Delegación auditable — RF-04

**Dado** un handoff o una ejecución, **cuando** se verifica la trazabilidad, **entonces** las listas
de delegación, la profundidad y el nivel `observed`, `declared-direct` o `unverified` son coherentes.

### CA-05 · Gate universal — RF-05

**Dado** un estado incoherente, **cuando** se ejecuta el validador, **entonces** termina con error y
señala una regla concreta; con un estado válido termina en verde.

### CA-06 · Operaciones mecánicas — RF-06

**Dado** un repositorio instalado, **cuando** se pide inventario, estado o scaffolding, **entonces**
la salida depende únicamente del sistema de ficheros y no inventa decisiones del proyecto.

### CA-07 · MCP opt-in — RF-07

**Dado** que no se ha seleccionado MCP, **cuando** se instala, **entonces** no se activa ninguno;
si se selecciona, no se escribe ningún secreto y las versiones ejecutables quedan fijadas.

### CA-08 · Simulación — RF-08

**Dado** `--dry-run`, **cuando** se ejecuta cualquier instalación, **entonces** no se modifica el
destino y se informa de todas las operaciones previstas.

## Casos límite

- Directorio inexistente, vacío, con espacios o con múltiples roots.
- Destino igual a la plantilla, raíz de disco o directorio personal.
- JSONC o TOML existente malformado.
- Bloque gestionado incompleto o duplicado.
- Fichero previamente instalado y modificado por el usuario.
- Proyecto sin stack, Node, Python o con varios gestores.
- Segunda instalación y actualización desde otra versión.

## Reglas de negocio

- “Virgen” nunca permite borrar información existente.
- El historial de la plantilla no es historia del proyecto destino.
- Un artefacto `observed` solo existe si lo produjo un evento real del host.
- Las integraciones externas son opt-in.
- Los contenidos propios del usuario siempre ganan ante un conflicto no resoluble.

## Fuera de alcance

- Instalar dependencias del stack de la aplicación.
- Elegir arquitectura, tecnologías, MCP o licencia del proyecto.
- Garantizar aislamiento que el host no soporte.
- Migrar retrospectivamente la historia de un brownfield.

## Riesgos y dependencias

- Los formatos de los hosts evolucionan; se mantienen fixtures y matriz fechada.
- La fusión semántica de prosa no es determinista; se limita a bloques gestionados.
- Un hook no sustituye al sandbox ni al CI.

## Supuestos aprobados

- Se instalan adaptadores de todos los hosts soportados.
- Node.js 18 es el runtime común.
- MCP permanece desactivado por defecto.
- El plan técnico presentado en la conversación queda aprobado por la petición explícita de implementación.

## Won't have this time

- Marketplace o paquete plugin distribuido: primero se estabiliza el instalador de repositorio.
- Interfaz gráfica del instalador: el contrato inicial es CLI.
- Instalación automática de skills de terceros.

## Glosario

- **Motor SDD**: reglas, agentes, skills, hooks, scripts y gates reutilizables.
- **Greenfield**: directorio sin contexto de producto previo.
- **Brownfield**: repositorio con código o contexto existente.
- **Gestionado**: contenido que el instalador puede actualizar mediante propiedad o marcadores.

## Preguntas abiertas

Ninguna.
