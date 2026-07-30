---
name: sdd-design
description: Convierte la spec en el documento de diseño de la funcionalidad — flujo de pantallas, estados, componentes y accesibilidad — antes de decidir arquitectura. Úsala cuando la funcionalidad tenga interfaz.
disable-model-invocation: true
---

# /sdd-design — Cómo se ve y cómo se recorre

Agente responsable: `@ux-designer`. Apoyo: `@spec-analyst` si aparece un requisito nuevo.

Fase **entre `/sdd-clarify` y `/sdd-plan`**. Existe porque el diseño descubre requisitos que la
spec no vio —una pantalla intermedia, una confirmación, un estado de error— y descubrirlos después
de planificar la arquitectura significa replanificar.

**Se salta cuando la funcionalidad no tiene interfaz** (un job, una integración, una migración).
Saltarla es legítimo; lo que no vale es saltarla y luego improvisar pantallas en `/sdd-implement`.

## Puerta de entrada

- [ ] `spec.md` existe, con criterios de aceptación y prioridades MoSCoW
- [ ] Cero `[NEEDS CLARIFICATION]` pendientes: si quedan, primero `/sdd-clarify`
- [ ] Si hay Figma, Stitch o bocetos, están a mano (MCP `figma` / `stitch`)
- [ ] `docs/design/design-system.md`, si el proyecto ya tiene design system

## Paso 1 — Preguntar antes de dibujar

Igual que en `/sdd-specify`: **pregunta con sugerencia y espera confirmación**. Las dudas típicas
de esta fase, que casi nunca están en el PRD:

- ¿Cuántos pasos tiene el flujo y **se puede volver atrás** en cada uno?
- ¿Qué pasa al recargar a mitad? ¿Se pierde lo escrito?
- ¿Hay pantalla que el diseño da por hecha y no está dibujada? (confirmación, error, vacío)
- ¿Esta lista es tabla, tarjetas o *feed*? ¿Con cuántos elementos deja de funcionar?
- ¿La acción es destructiva? ¿Confirmación o deshacer? (**preferimos deshacer**)
- ¿Móvil primero o escritorio primero? ¿Qué se cae en pantalla estrecha?
- ¿Hay un componente en el design system que ya resuelve esto?

```
❓ <pregunta>
   Mi sugerencia: <opción> — porque <motivo>
   Alternativas: <B> / <C>
   Sin confirmación: queda [NEEDS CLARIFICATION] en design.md y bloquea /sdd-plan
```

**Si el diseño de entrada contradice la spec, no elijas en silencio.** Ponlo delante del usuario:
esa contradicción es información, y resolverla ahora cuesta una pregunta.

## Paso 2 — Flujo antes que pantalla

Mapa del recorrido completo en mermaid: pasos, decisiones, **puntos de fricción** y **salidas de
error**. Un flujo que solo dibuja el camino feliz no es un flujo, es una demo.

Guárdalo en `docs/design/flows/NNN-<flujo>.md` y enlázalo desde `design.md`.

## Paso 3 — Inventario de estados por pantalla

Obligatorio y por pantalla. Los estados no felices son la mitad del diseño y casi siempre se
olvidan hasta que salen en producción:

**vacío · cargando · parcial · error · sin permiso · éxito**

Una pantalla sin sus seis estados no está diseñada.

## Paso 4 — Componentes

Por cada pantalla: qué componentes se **reutilizan** del design system, cuáles se **extienden**
y cuáles son **nuevos**. Un componente nuevo se justifica: es coste permanente de mantenimiento.

Si el diseño usa un valor que no está en los tokens (un color, un espaciado), **señálalo como
inconsistencia** en lugar de codificarlo a pelo. Esa es la vía por la que un design system se
desintegra.

## Paso 5 — Accesibilidad, en el diseño y no al final

Contraste ≥ 4.5:1 (≥ 3:1 texto grande y controles) · nada comunicado solo por color · foco
visible diseñado · objetivos táctiles ≥ 24×24 px · jerarquía de encabezados coherente · orden de
tabulación pensado · textos de error concretos y accionables · alternativa para
`prefers-reduced-motion`.

Comprobado **sobre el diseño**. Descubrir en el código que la paleta no cumple contraste significa
rehacer la paleta y todo lo que la usa.

## Paso 6 — Escribir `design.md`

Plantilla: `docs/specs/_TEMPLATE/design.md`. En la carpeta de la spec, no en un chat.

## Puerta de salida

- [ ] Flujo completo con caminos de error, no solo el feliz
- [ ] Los seis estados definidos en **cada** pantalla
- [ ] Cada `CA` de la spec tiene su recorrido en el diseño; y cada pantalla, su `CA`
- [ ] Componentes clasificados en reutiliza / extiende / nuevo, con los nuevos justificados
- [ ] Accesibilidad verificada sobre el diseño
- [ ] Cero decisiones técnicas: ni framework, ni librería de componentes, ni estructura de
      carpetas. Eso es `/sdd-plan`
- [ ] Requisitos nuevos descubiertos → **de vuelta a `@spec-analyst`**, no metidos aquí de tapadillo

## Cierre

```
### HANDOFF
- Agente origen: ux-designer
- Fase completada: design
- Artefactos: docs/specs/NNN-slug/design.md · docs/design/flows/NNN-<flujo>.md
- Pantallas: <n> · con los seis estados: <n/n>
- Componentes: <n> reutilizados · <n> extendidos · <n> nuevos
- Requisitos nuevos descubiertos: <lista, o "ninguno"> → si hay, vuelve a /sdd-specify
- Inconsistencias con el design system: <lista, o "ninguna">
- Accesibilidad: <qué se verificó y qué riesgo queda>
- Preguntas confirmadas por el usuario: <n> · marcadores pendientes: <n>
- Siguiente agente sugerido: planner — comando: /sdd-plan
- Contexto que necesita: spec.md, design.md y la lista de componentes nuevos
```
