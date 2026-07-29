---
name: sdd-implement
description: Ejecuta las tareas de tasks.md en ciclo TDD estricto rojo-verde-refactor, una a una, mostrando la salida real de los tests.
disable-model-invocation: true
---

# /sdd-implement — Construir con TDD

Agente responsable: `@implementer`, con delegación a especialistas.

## Puerta de entrada

`tasks.md` existe, con tareas trazadas a `spec.md` y test asociado.
Si no existe → `/sdd-tasks`.

## Bucle principal

Repite hasta agotar el alcance acordado. **Una tarea por ciclo.**

### 0 · Seleccionar
Primera tarea `pendiente` sin dependencias abiertas. Márcala `en curso` en `tasks.md`.
Anuncia: *"T-042-03 · <título> — test: `<ruta>`"*.

### 1 · 🔴 RED
- Escribe **solo** el test de esta tarea.
- Ejecútalo.
- **Pega la salida real del fallo.** Sin rojo demostrado no se continúa.
- Verifica que falla por el motivo correcto (assert que no se cumple), no por un import roto
  o un fichero que no existe.

### 2 · 🟢 GREEN
- El código **mínimo** que pone el test en verde. Nada de generalizar por adelantado.
- Ejecuta el test → verde. Pega la salida.
- Ejecuta la **suite completa** → verde. Si rompiste otra cosa, arréglalo ahora.

### 3 · 🔵 REFACTOR
- Con verde, limpia: nombres, duplicación de conocimiento, funciones largas, niveles de
  abstracción mezclados, condicionales anidados.
- Aplica los patrones del plan. Si aparece un patrón no previsto, anótalo para el handoff.
- Si el olor es grande, delega en `@refactor-specialist`.
- Vuelve a ejecutar. Verde otra vez.

### 4 · Cerrar tarea
- `tasks.md` → `hecho`.
- **Registra la evidencia** en `evidence.md`: agente que ejecutó, comando exacto, resultado
  (🔴 y 🟢 con su salida) y artefacto. Si algún control previsto **no** se ejecutó, escríbelo
  en la sección de controles no ejecutados con su riesgo y su dueño. "No ejecutado" es un
  resultado válido; "pasa" sin ejecución, no.
- Verifica la DoD de `AGENTS.md` §7 aplicable a la tarea.
- Si hubo decisión relevante → `@bitacora-keeper`.
- Si el plan resultó incorrecto → **para** y vuelve a `@planner`. No parchees el plan sobre la marcha.

## Delegación

| Terreno | Agente |
|---|---|
| UI, estado, accesibilidad | `@frontend-expert` |
| Dominio, casos de uso, integraciones | `@backend-expert` |
| Esquema, migraciones, consultas | `@database-expert` |
| Contratos | `@api-designer` |
| Test difícil, fixtures, dobles | `@test-engineer` |
| Lentitud medida | `@performance-optimizer` |
| Olor de diseño | `@refactor-specialist` |

Los especialistas **devuelven el control**; no encadenan ellos la siguiente fase.

## Prohibido

- Código de producción sin test rojo previo.
- Implementar lo que la spec no pide.
- Tocar ficheros fuera del alcance de la tarea.
- Decir "los tests pasan" sin pegar la salida.
- Hacer commit o push sin que te lo pidan.
- Continuar con la suite en rojo.

## Cierre (al agotar el alcance de la sesión)

```
### HANDOFF
- Agente origen: implementer
- Tareas completadas: <lista>  ·  Pendientes: <n>
- Tests: <n> nuevos · suite: <salida real resumida>
- Cobertura dominio/aplicación: <%>
- Ficheros tocados: <rutas>
- Desviaciones del plan: <lista o "ninguna">
- Deuda anotada: <lista o "ninguna">
- Siguiente agente sugerido: implementer (siguiente tarea) | code-reviewer — comando: /sdd-verify
```
