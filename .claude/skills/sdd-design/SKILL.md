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

## Paso 0 bis — Dirección visual: sin esto no se dibuja

**Antes de la primera pantalla del proyecto**, comprueba
[`docs/design/DIRECCION-VISUAL.md`](../../../docs/design/DIRECCION-VISUAL.md).

| Estado | Qué haces |
|---|---|
| No existe | La rellenas **con el usuario** y él la aprueba. Es una fase, no un trámite |
| Existe en `borrador` | La cierras con el usuario antes de seguir |
| Aprobada | La lees y la aplicas. Cada pantalla se contrasta contra ella |

**Por qué es una puerta y no una recomendación**: los seis estados y la accesibilidad son un
**suelo**. Una interfaz puede cumplirlos enteros y seguir siendo el MVP de cuatro cajas grises.
Y hay un sesgo activo en contra: la interfaz generada por un modelo converge en un aspecto
reconocible y genérico —tarjeta redondeada, gris neutro, espaciado uniforme, titular apenas mayor
que el cuerpo— porque es el camino de menor resistencia. Sin dirección declarada, ese es el
resultado por defecto.

Lo que hay que arrancarle al usuario, con tu propuesta encima de la mesa:

- **Referencias reales**: dos o tres productos y **por qué**. "Moderno y limpio" no descarta nada,
  así que no es una referencia. Pide también una **antirreferencia**.
- **Tres adjetivos que excluyan algo**: "sobrio, denso, técnico" decide cosas; "bonito,
  profesional, moderno" no decide ninguna.
- **Escala tipográfica con contraste real**: un titular de 32 px sobre cuerpo de 16 no es
  jerarquía, es una lista con la primera línea un poco más grande.
- **Densidad**: aire generoso o compacta. Se decide, no se hereda del framework.
- **Movimiento**: qué se anima, cuánto, y la alternativa para `prefers-reduced-motion`.
- **Qué NO va a hacer este proyecto**: cierra discusiones antes de que ocurran.

Si el usuario no tiene criterio formado, **propón tú una dirección completa y defiéndela**. Lo que
no vale es dejarla vacía y empezar a dibujar: eso garantiza el resultado genérico.

Skills de apoyo si están aprobadas (ver [`SKILLS-EXTERNAS.md`](../../../docs/agents/SKILLS-EXTERNAS.md)):
`anthropics/skills:frontend-design` para el criterio visual, `theme-factory` para sistemas de tema.

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

## Paso 3 bis — Un elemento con carácter por pantalla

**Obligatorio, uno por pantalla.** Es lo que separa un producto de un formulario.

No tiene que ser decorativo: **un dato bien presentado tiene más carácter que una ilustración**.
Vale un número con tratamiento tipográfico propio, un estado vacío que enseña el siguiente paso en
lugar de disculparse, una visualización, una composición deliberadamente asimétrica.

Lo que **no** vale: "usaremos la tarjeta estándar". Eso es ausencia de decisión.

Declara en `design.md`, por pantalla, cuál es y por qué encaja con la personalidad declarada.

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

- [ ] `docs/design/DIRECCION-VISUAL.md` existe y está **aprobada por el usuario**
- [ ] Cada pantalla declara su **elemento con carácter**
- [ ] La escala tipográfica tiene contraste real, no solo tamaños distintos
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
- Dirección visual: <aprobada el YYYY-MM-DD | creada en esta fase y pendiente de aprobación>
- Pantallas: <n> · con los seis estados: <n/n> · con elemento con carácter: <n/n>
- Componentes: <n> reutilizados · <n> extendidos · <n> nuevos
- Requisitos nuevos descubiertos: <lista, o "ninguno"> → si hay, vuelve a /sdd-specify
- Inconsistencias con el design system: <lista, o "ninguna">
- Accesibilidad: <qué se verificó y qué riesgo queda>
- Preguntas confirmadas por el usuario: <n> · marcadores pendientes: <n>
- Siguiente agente sugerido: planner — comando: /sdd-plan
- Contexto que necesita: spec.md, design.md y la lista de componentes nuevos
```
