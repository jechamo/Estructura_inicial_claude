# 004 · Eliminar duplicados de IDE

| Campo | Valor |
|---|---|
| Estado | aprobada |
| Tipo | mantenimiento de la plantilla |
| Versión objetivo | v0.3.1 |
| Aprobación | petición explícita del usuario del 2026-08-03 |

## Objetivo

Distribuir una única entrada visible por agente y por skill/comando en cada host compatible, sin
perder los 20 perfiles ni las 23 skills actuales y sin depender del fallback de `.gitignore` al
empaquetar el instalador.

## Requisitos

| Id | Requisito EARS | Prioridad | Esfuerzo |
|---|---|---:|---:|
| RF-01 | Cuando VS Code cargue un workspace confiable, el sistema DEBE exponer una sola ubicación de los 20 agentes. | M | 2 |
| RF-02 | Cuando VS Code o Cursor descubran skills canónicas, el sistema NO DEBE instalar prompts o commands con el mismo nombre. | M | 3 |
| RF-03 | Cuando el workspace esté en Restricted Mode, el instalador DEBE informar de que hay que confiar y recargar para aplicar la selección de ubicaciones. | M | 2 |
| RF-04 | Cuando npm prepare el paquete, el sistema DEBE usar una lista explícita de artefactos y excluir configuración local e historia no necesaria para `npx ... init`. | M | 3 |
| RF-05 | Cuando se instale o actualice un proyecto, el sistema DEBE conservar la paridad de 20 agentes y 23 skills y la configuración ajena. | M | 3 |

Reparto MoSCoW: M 100 %, S 0 %, C 0 %, W 0 %. Todos los requisitos son de corrección de la
distribución y no se recorta ninguno en esta versión de parche.

## Criterios de aceptación

### CA-01 · Agentes únicos en VS Code

- Dado un destino greenfield instalado y confiable
- Cuando VS Code lea `.vscode/settings.json`
- Entonces `.github/agents` está habilitado, `.claude/agents` deshabilitado y existen exactamente
  20 wrappers con correspondencia a los 20 perfiles canónicos.

### CA-02 · Slash commands sin colisiones

- Dado el conjunto de skills en `.agents/skills`
- Cuando se inspeccionan los nombres publicados por VS Code y Cursor
- Entonces no existe ningún prompt o command específico del host con el mismo nombre.

### CA-03 · Restricted Mode comunicado

- Dada una instalación completada
- Cuando el instalador muestra los siguientes pasos
- Entonces incluye instrucciones inequívocas para confiar en el workspace y recargar VS Code.

### CA-04 · Empaquetado explícito y seguro

- Dado `package.json`
- Cuando se ejecuta `npm pack --dry-run`
- Entonces el paquete se construye desde una lista explícita, contiene el instalador y sus fuentes,
  y no contiene `.claude/settings.local.json`, specs activas, informes ni sesiones de la plantilla.

### CA-05 · Compatibilidad e idempotencia

- Dado un destino greenfield y otro brownfield con centinelas
- Cuando se ejecutan `init` y una segunda actualización
- Entonces pasan los gates, no reaparecen duplicados y se preservan los centinelas.

## Fuera de alcance

- Añadir o eliminar roles del catálogo de 20 agentes.
- Añadir la skill de intake de producto, reservada para la spec 005.
- Cambiar el protocolo de delegación o de handoff.

## Riesgos

- VS Code ignora ajustes de workspace en Restricted Mode; se mitiga con aviso, documentación y
  smoke manual, no intentando modificar la confianza del usuario.
- Los formatos de host evolucionan; el gate comprueba colisiones por nombre y no una lista manual.
