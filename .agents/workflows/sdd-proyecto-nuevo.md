# Workflow: proyecto nuevo (circuito A)

Flujo para arrancar un proyecto **desde cero**. Si el repo ya tiene código, usa
@.agents/workflows/onboarding.md.

Reglas del proyecto: @AGENTS.md

---

## 1. Init — decidir la arquitectura

Adopta el perfil de @.claude/agents/architect.md.
Procedimiento detallado: @.claude/skills/sdd-init/SKILL.md

### 1.1 Entrevista (máximo 8 preguntas, con opciones y recomendación)

Producto y problema · usuarios · tipo (web/API/móvil/CLI/data/librería) · escala al año 1 ·
equipo (tamaño y experiencia) · restricciones (cloud, presupuesto, normativa) · datos
sensibles (determina el nivel ASVS) · horizonte (MVP vs. años) · integraciones y diseño.

### 1.2 Decisión

Recorre el árbol de decisión. Presenta **la opción recomendada + 1 alternativa seria**, con
coste y consecuencias. **Espera confirmación antes de escribir nada.**

Ley del proyecto: **monolito modular con fronteras hexagonales** por defecto.
Microservicios prohibidos sin CI/CD, observabilidad y ownership por equipo.

### 1.3 Artefactos

- `docs/architecture/constitution.md` — estilo, C4 nivel 1 y 2 en mermaid, contextos acotados,
  reglas de dependencia, estructura de carpetas, stack con versiones, estándares transversales,
  nivel ASVS, prohibiciones
- `docs/architecture/adr/ADR-0001-arquitectura-inicial.md`
- `docs/architecture/adr/ADR-0002-stack-tecnologico.md`
- Tabla §1 de @AGENTS.md rellenada
- Esqueleto de carpetas con un README por capa (qué va ahí y qué **no**)
- `docs/quality/TEST-STRATEGY.md` y `docs/security/THREAT-MODEL.md`
- Linter, formateador, tipado estricto, runner de tests, `.gitignore`, `.env.example` sin valores
- CI con los gates de AGENTS.md §7
- Primera entrada en `docs/bitacora/DECISIONS.md`

### 1.4 Test de humo

Un test trivial que pase. **Ejecuta y pega la salida real.** Verifica el andamiaje antes de
escribir nada de negocio.

---

## 2. Primera funcionalidad

A partir de aquí, sigue @.agents/workflows/sdd-nueva-funcionalidad.md desde el paso 1.

El `architect` **ya no interviene** salvo que un cambio toque fronteras.

---

Cierra cada paso con el bloque `### HANDOFF`.
