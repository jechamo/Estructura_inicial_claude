# 003 · Skills portables conformes al estándar abierto

| Campo | Valor |
|---|---|
| **ID** | `003-skills-portables-estandar` |
| **Estado** | entregada |
| **Autor** | usuario + Codex |
| **Fecha** | 2026-08-02 |
| **Rama** | `main` |
| **Depende de** | `002-portabilidad-instalador-universal` |

## Problema

Las skills canónicas incluyen metadatos específicos de un host y el proyecto no incorpora una
herramienta portable y auditada para crear y evaluar skills nuevas.

## Objetivo

Todas las skills distribuidas serán válidas para clientes compatibles con Agent Skills y la
plantilla incluirá una `skill-creator` oficial, fijada y accesible desde todos los IDE soportados.

## Requisitos

| Id | Requisito | Prioridad | Esfuerzo |
|---|---|---:|---:|
| RF-01 | El sistema DEBE rechazar metadatos canónicos que no pertenezcan al estándar abierto. | M | 2 |
| RF-02 | El sistema DEBE distribuir `skill-creator` sin limitarla a un único IDE. | M | 2 |
| RF-03 | El sistema DEBE registrar origen, revisión y versión exacta de toda skill externa vendorizada. | S | 1 |
| RF-04 | CUANDO los gates estén verdes, el sistema DEBE publicar una versión estable e inmutable. | S | 1 |

Must: 4/6 = 66,7 %. Se acepta superar el 60 % porque RF-01 y RF-02 forman un único cambio de
compatibilidad pequeño, con rollback directo y suite existente.

## Criterios de aceptación

### CA-01 · Frontmatter portable *(RF-01)*

Dadas las skills canónicas, cuando se ejecuta el gate, entonces todas cumplen nombre, descripción,
campos permitidos y límites del estándar Agent Skills.

### CA-02 · Descubrimiento multihost *(RF-02)*

Dada una instalación virgen, cuando se inventarían las skills, entonces `skill-creator` existe en
`.agents/skills/` y Claude dispone de un adaptador que remite a esa fuente canónica.

### CA-03 · Cadena de suministro *(RF-03)*

Dada `skill-creator`, cuando se audita, entonces constan publicador, licencia Apache-2.0, commit
fijado, scripts revisados y riesgos operativos.

### CA-04 · Release estable *(RF-04)*

Dados todos los gates verdes y el GO explícito del usuario, cuando se entrega, entonces el commit
queda publicado en `main` y recibe un tag SemVer anotado sin reescribir ningún tag previo.

## Fuera de alcance

- Reescribir el contenido oficial de `skill-creator`.
- Garantizar resultados idénticos entre modelos o IDE.
- Instalar automáticamente futuras actualizaciones desde una referencia móvil.

## Riesgos y supuestos

- Los scripts oficiales pueden lanzar `claude -p`, abrir un visor local y escribir workspaces de
  evaluación; solo se ejecutan cuando el usuario usa esos flujos.
- El tag estable solicitado constituye el GO humano de esta entrega.

## Preguntas abiertas

Ninguna.
