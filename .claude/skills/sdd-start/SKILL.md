---
name: sdd-start
description: Punto de entrada del circuito SDD. Clasifica la petición, detecta el estado del proyecto y te lleva a la fase correcta. Úsalo cuando no sepas por dónde empezar.
---

# /sdd-start — Puerta de entrada

Delega en el agente `orchestrator`. Sigue estos pasos **en orden**.

## 1. Diagnóstico del proyecto

Comprueba, en este orden:

| Comprobación | Herramienta |
|---|---|
| ¿Existe `docs/architecture/constitution.md`? | Read |
| ¿Existe `docs/specs/` y qué specs hay? | Glob `docs/specs/*/spec.md` |
| ¿Alguna spec tiene `tasks.md` con tareas pendientes? | Grep `Estado: pendiente\|en curso` |
| ¿Hay marcadores `[NEEDS CLARIFICATION]` sin resolver? | Grep |
| ¿Hay código sin commitear? | `git status` |
| ¿Es un repo con código pero sin `docs/`? | Glob |

## 2. Clasificación de la petición del usuario

| Lo que pide el usuario | Clasificación |
|---|---|
| "Quiero hacer una app de..." y el repo está vacío | **Proyecto nuevo** |
| "Quiero hacer una app de..." y hay código | **Onboarding** primero |
| "Añade / quiero que también haga..." | **Feature nueva** |
| "No funciona / da error" | **Bug** |
| "Mejora / limpia / es lento" | **Mejora técnica** |
| "¿Por qué hicimos...?" | **Consulta a bitácora** |

## 3. Enrutado

```
Proyecto nuevo         → /sdd-init          (@architect)
Repo existente sin docs→ /onboard           (@research-analyst → @architect)
Feature nueva          → /sdd-specify       (@spec-analyst)
Spec con marcadores    → /sdd-clarify       (@spec-analyst)
Spec lista sin plan    → /sdd-plan          (@planner)
Plan sin tareas        → /sdd-tasks         (@planner)
Tareas pendientes      → /sdd-implement     (@implementer)
Código sin verificar   → /sdd-verify        (@code-reviewer + @security-auditor)
Todo verde             → /sdd-ship          (@release-manager)
Bug                    → @research-analyst (triage) → /sdd-specify si es cambio de comportamiento,
                         o directamente /sdd-implement con test de regresión si es defecto puro
Mejora técnica         → @refactor-specialist o @performance-optimizer
Consulta               → @bitacora-keeper
```

## 4. Respuesta al usuario

Presenta:
1. **Diagnóstico** en 3-5 líneas (qué has encontrado).
2. **Clasificación** de su petición.
3. **Fase de destino** y el comando exacto a ejecutar.
4. Si faltan datos para clasificar, **una sola pregunta** con opciones concretas.

No empieces la fase sin confirmar. El usuario debe saber en qué punto del circuito entra.
