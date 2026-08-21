# ADR-0001 — Adoptar y gobernar la arquitectura heredada

- **Estado**: aceptado
- **Fecha**: 2026-08-21
- **Decisores**: Jesus Chamorro (usuario); `architect` documenta
- **Evidencia de aprobación**: confirmación literal «aprobado continua», 2026-08-21
- **Spec relacionada**: no aplica · regularización brownfield mediante `/onboard`
- **Etiquetas**: arquitectura · distribución · CLI · filesystem · Git · documentación

---

## Contexto y problema

El repositorio existe, distribuye versiones y conserva specs entregadas, pero su constitución
seguía siendo la plantilla `bootstrap`. Esa plantilla presuponía una aplicación organizada en
`domain/application/infrastructure/interfaces`, una estructura que el código no implementa.
Mantenerla describiría una arquitectura ficticia y bloquearía el plan de cualquier spec nueva.

La investigación de onboarding observó:

- un paquete JavaScript ESM para Node.js 18 o superior, sin dependencias de runtime;
- dos CLI (`scripts/install.mjs` y `scripts/sdd-project.mjs`), hooks Node embebidos y validadores;
- una GUI local que escucha solo en loopback y delega la instalación en un proceso `npx`;
- un sitio estático publicado en GitHub Pages;
- Markdown, JSON, JSONL y Git como persistencia, sin base de datos, ORM, colas ni servicios;
- organización procedural por superficie técnica, con helpers compartidos pero sin capas clean o
  fronteras hexagonales sistemáticas;
- deuda histórica: GUI fuera del circuito, código sin territorios, módulos concentrados, una
  tarea histórica activa y fuentes durables con estados divergentes.

La decisión no busca rediseñar el sistema. Debe describir lo que existe, fijar reglas mínimas para
no degradarlo y declarar cuándo hay que reconsiderarlo.

## Criterios de decisión

- Fidelidad al código y a los contratos realmente instalables.
- Cero cambio de comportamiento durante el onboarding.
- Conservación de compatibilidad con repositorios que ya instalaron la plantilla.
- Portabilidad Windows/Linux y Node 18/20/22 sin dependencia runtime nueva.
- Reversibilidad: condiciones observables para sustituir la decisión con un ADR posterior.
- Complejidad proporcional al tamaño, operación local y ausencia de infraestructura distribuida.

## Opciones consideradas

### A · Aceptar la distribución monolítica procedural y gobernar sus fronteras reales

- **Cómo funciona**: se documentan CLI, hooks, GUI local y Pages como entrypoints del mismo
  producto; se reconocen cinco módulos lógicos, contratos de fichero compartidos y deuda
  explícita. Los cambios futuros respetan esas fronteras o crean un ADR nuevo.
- **Pros**: coincide con el código; desbloquea planificación; no introduce migración ni riesgo de
  compatibilidad; hace visible la deuda sin presentarla como ideal.
- **Contras**: acepta temporalmente concentración de responsabilidades y acoplamiento por
  ficheros compartidos.
- **Coste**: documental y de gobierno; sin coste operativo nuevo.

### B · Declarar y ejecutar ahora una arquitectura clean/hexagonal

- **Cómo funciona**: separar política, casos de uso y adaptadores, mover el código y definir
  puertos antes de continuar con features.
- **Pros**: podría mejorar testabilidad y aislamiento en módulos complejos.
- **Contras**: describirla antes de implementarla sería falso; implementarla cambia muchas rutas y
  contratos, exige spec, TDD y compatibilidad; no resuelve una necesidad funcional inmediata.
- **Coste**: alto, con riesgo relevante sobre el instalador y seis adaptadores de host.

### C · Dividir CLI, hooks, GUI y Pages en paquetes o servicios independientes

- **Cómo funciona**: cada superficie adquiere ciclo de release, contratos y operación propios.
- **Pros**: ownership y evolución independientes si aparecieran equipos o escalados distintos.
- **Contras**: versionado, compatibilidad, red y operación innecesarios hoy; la GUI es local y
  Pages es estática; no hay madurez ni necesidad de servicio distribuido.
- **Coste**: muy alto y contrario a KISS/YAGNI en el estado observado.

### D · No hacer nada y conservar la plantilla `bootstrap`

- **Pros**: cero trabajo inmediato.
- **Contras**: la fuente vinculante seguiría mintiendo, `/sdd-plan` no tendría una arquitectura
  aplicable y la deuda continuaría invisible o dispersa.

## Decisión

Se elige **A · aceptar la distribución monolítica procedural y gobernar sus fronteras
reales**.

La posición resultante es una distribución monolítica Node.js con cuatro entrypoints, cinco
módulos funcionales reconocibles, integración local síncrona y persistencia en ficheros/Git. La
CLI es la experiencia primaria; la GUI local es auxiliar y Pages es informativa.

No se declara clean, hexagonal, vertical slice ni microservicios. No se activa el mapa de
territorios propuesto ni el generador de Pages mediante este ADR: ambos cambian controles
operativos y requieren aprobación específica.

**Criterio que desempató**: fidelidad a la realidad con el menor cambio reversible. Una
constitución brownfield debe gobernar el sistema existente antes de aspirar a otro.

## Consecuencias

### Positivas

- El plan de nuevas specs puede contrastarse con una arquitectura real y no con marcadores.
- Los cuatro entrypoints y sus contratos quedan visibles.
- Filesystem y Git quedan reconocidos como decisiones de datos, no como detalles accidentales.
- La restricción de cero dependencias runtime y la compatibilidad instalable pasan a ser reglas
  arquitectónicas explícitas.
- La deuda heredada adquiere propietario de proceso y disparadores observables.

### Negativas / deuda aceptada

- Política e I/O continúan mezclados en módulos procedurales; se revisará cuando una spec necesite
  modificar una zona concentrada o los umbrales de olores vuelvan a bloquear.
- La GUI local conserva deuda histórica de trazabilidad y pruebas; se revisará antes de cambiar
  sus endpoints, ejecución de procesos, red o TLS.
- Los ficheros compartidos impiden afirmar aislamiento transaccional entre módulos; se revisará si
  aparece concurrencia multiusuario o persistencia remota.
- El ownership de código sigue sin materializarse en `.sdd/territories.json`; requiere gate humano
  y comprobación de solapamientos antes de activarlo.

### Impacto

| Ámbito | Efecto |
|---|---|
| Código | ninguno; no se mueve ni refactoriza código |
| Equipo | ofrece un mapa común y explicita dónde hace falta una decisión futura |
| Operación | mantiene CLI/procesos locales, GitHub Actions y Pages actuales |
| Coste | documentación y revisión; cero infraestructura adicional |
| Seguridad | conserva ASVS 5.0.0 L2 y OWASP Top 10:2025; no amplía exposición |

## Condiciones de revisión

Crear un ADR que reemplace este si ocurre cualquiera de estas señales:

1. se añade una base de datos, almacenamiento remoto o consistencia multiusuario;
2. la GUI escucha fuera de loopback o se convierte en servicio multiusuario;
3. se incorpora una dependencia o framework de runtime;
4. una superficie necesita desplegarse, versionarse, escalar o fallar independientemente;
5. el paquete se divide en varios artefactos;
6. se introduce una cola, eventos durables o procesamiento asíncrono distribuido;
7. una medición demuestra que separar capas o verticales reduce el riesgo de una zona caliente;
8. los contratos de fichero dejan de ser la fuente principal de estado.

## Referencias

- [`../CURRENT-STATE.md`](../CURRENT-STATE.md)
- [`../constitution.md`](../constitution.md)
- [`../../product/PRD.md`](../../product/PRD.md)
- [`../../sdd/OPERATING-MODEL.md`](../../sdd/OPERATING-MODEL.md)
- [`.sdd/installed.json`](../../../.sdd/installed.json)
- [`package.json`](../../../package.json)
- [`.sdd/territories.json`](../../../.sdd/territories.json)
- [`.sdd/generators.json`](../../../.sdd/generators.json)

---

> Este ADR está `aceptado` desde 2026-08-21. Una decisión posterior lo marca
> `reemplazado por ADR-XXXX` y conserva este registro.
