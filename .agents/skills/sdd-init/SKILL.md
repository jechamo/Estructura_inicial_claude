---
name: sdd-init
description: Arranca un proyecto NUEVO. Define principios, elige arquitectura y stack, crea la constitución, el ADR-0001 y el esqueleto de carpetas. Solo para greenfield.
---

# /sdd-init — Bootstrap de proyecto nuevo

**Solo para proyectos nuevos.** Si el repo ya tiene código, usa `/onboard`.
Agente responsable: `@architect`, con apoyo de `@bitacora-keeper`.

## Paso 0 — Verificación

Si existe `docs/architecture/constitution.md`, **para** y avisa: el proyecto ya está
inicializado. Ofrece `/sdd-specify` o `/sdd-status`.

## Paso 1 — Entrevista (máximo 8 preguntas, con opciones)

Pregunta solo lo que **cambia la decisión arquitectónica**. Ofrece siempre una
recomendación por defecto para que el usuario pueda decir "lo que tú veas".

1. ¿Qué es el producto y qué problema resuelve? ¿Quién lo usa?
2. Tipo: web app · API · móvil · CLI · data/ML · librería · monorepo con varios.
3. Escala esperada al año 1: usuarios concurrentes, volumen de datos, picos.
4. Equipo: tamaño, experiencia, stack que ya dominan.
5. Restricciones: cloud obligado, on-premise, presupuesto, normativa (RGPD, PCI, sanitario).
6. ¿Hay datos personales, pagos o contenido de terceros? → determina el nivel ASVS.
7. Horizonte: MVP para validar en semanas · producto a años.
8. ¿Integraciones externas conocidas? ¿Diseño en Figma/Stitch?

Si el usuario no sabe algo, propón el default razonable y **márcalo como supuesto**.

## Paso 2 — Decisión de arquitectura

Aplica el árbol de decisión de `@architect` y de `docs/architecture/DECISION-GUIDE.md`.

Presenta al usuario: **opción recomendada + 1 alternativa seria**, con coste y consecuencias
de cada una en 5 líneas. Espera confirmación antes de escribir nada.

Recuerda la ley del proyecto: **monolito modular con fronteras hexagonales por defecto**.
Cualquier otra cosa necesita justificación explícita.

## Paso 3 — Artefactos

Crea, en este orden:

1. `docs/architecture/constitution.md` — estilo arquitectónico y por qué; C4 nivel 1 y 2 en
   mermaid; contextos acotados; reglas de dependencia; estructura de carpetas canónica;
   stack con versiones; estándares transversales (errores, logs, config, validación, auth,
   i18n); nivel ASVS objetivo; prohibiciones; cómo se modifica esta constitución.
2. `docs/architecture/adr/ADR-0001-arquitectura-inicial.md` (formato MADR).
3. `docs/architecture/adr/ADR-0002-stack-tecnologico.md`.
4. Rellena la tabla §1 de `AGENTS.md` (nombre, tipo, estado, arquitectura, stack).
5. Esqueleto de carpetas de código según la arquitectura elegida, con un `README.md` en cada
   carpeta raíz explicando qué va ahí y qué **no**.
6. `docs/quality/TEST-STRATEGY.md` adaptado al stack.
7. `docs/security/THREAT-MODEL.md` inicial (STRIDE sobre el diagrama C4 nivel 2).
8. Configuración base: linter, formateador, tipado estricto, runner de tests, hooks de
   pre-commit, `.gitignore`, `.env.example` (**sin valores reales**).
9. Pipeline de CI mínimo con los gates de `AGENTS.md` §7.
10. Primera entrada en `docs/bitacora/DECISIONS.md`.

## Paso 4 — Test de humo

Crea **un** test trivial que pase y ejecuta la suite. Pega la salida real.
Sirve para verificar que el andamiaje funciona antes de escribir nada de negocio.

## Paso 5 — Cierre

```
### HANDOFF
- Agente origen: architect
- Fase completada: init
- Arquitectura elegida: <cuál> — motivo: <1 línea>
- Stack: <resumen>
- Artefactos: <lista de rutas>
- Supuestos asumidos: <lista>
- Siguiente agente sugerido: spec-analyst — comando: /sdd-specify
```

Termina diciendo al usuario: *"El proyecto está inicializado. Cuéntame la primera
funcionalidad y ejecutamos `/sdd-specify`."*
