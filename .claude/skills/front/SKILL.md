---
name: front
description: Implementa una tarea de frontend — componentes, estado, formularios, routing, consumo de API, accesibilidad y rendimiento de UI. Aplica el documento de diseño, patrones de front y TDD. Úsala cuando la tarea toque interfaz.
---

# /front — Implementación de frontend

Agente responsable: `@frontend-expert`. Apoyo: `@ux-designer` para dudas de diseño,
`@test-engineer` para E2E. Devuelve el control a quien invocó.

## Puerta de entrada

- [ ] Tarea con id (`T-NNN-XX`) y criterio de aceptación que la origina
- [ ] `design.md` de la spec, o el flujo en `docs/design/flows/` — con los **estados** definidos
- [ ] Contrato de la API en `contracts/` si consume datos. Si no existe, para: no adivines la
      forma de la respuesta y luego "ya lo ajustamos"
- [ ] Tokens del design system disponibles

Si el diseño no dice qué se ve mientras carga, o qué se ve si falla, **falta diseño**.
Vuelve a `@ux-designer`; no lo improvises en el componente.

## Ciclo obligatorio

### 1 · 🔴 RED

Test que falla, con salida real pegada.

- Prueba **comportamiento observable por el usuario**, no implementación. Consulta por rol
  accesible y texto visible, no por clase CSS ni estructura interna del DOM.
- Si al testear necesitas conocer el estado interno del componente, el test está mal o el
  componente hace demasiado.
- E2E solo para flujos críticos de negocio, con el MCP `playwright`. Son caros: pocos y buenos.

### 2 · 🟢 GREEN · 3 · ♻️ REFACTOR

Igual que en el resto del circuito. Refactor con la suite verde.

## Los cinco estados. Siempre

Ningún componente que traiga datos está terminado sin los cinco. Es el defecto más común y el
que más se nota en producción:

| Estado | Qué debe mostrar |
|---|---|
| **Vacío** | Qué es esto y cuál es el siguiente paso. No un hueco en blanco |
| **Cargando** | Skeleton con la forma del contenido real. Nada de saltos de layout |
| **Parcial** | Lo que ya hay, sin bloquear el resto |
| **Error** | Qué pasó, qué puede hacer el usuario, cómo reintentar. Sin códigos crudos |
| **Sin permiso** | Distinto de error y distinto de vacío |
| **Éxito** | Confirmación visible del resultado |

## Arquitectura de componentes

- **Composición sobre configuración.** Un componente con doce props booleanas son varios
  componentes. Prefiere `children` y slots a `variant="a" | "b" | "c" | ...`.
- **Presentación separada de obtención de datos.** El componente que pinta no sabe de dónde
  vienen los datos: recibe props o consume un hook. Así se testea sin red.
- **Estado en el nivel más bajo que funcione.** Estado global es la última opción, no la primera.
- **Distingue los tipos de estado**: de servidor (caché, se invalida), de UI (efímero), de
  formulario, de URL. Meterlos todos en el mismo store es la causa habitual del caos.
- **La URL es estado.** Filtros, paginación y pestañas van en la URL: se comparte y se recarga.
- **Cero lógica de negocio en el componente.** Si hay una regla de negocio en la UI, está
  duplicada en el servidor o —peor— solo está aquí, y entonces es un agujero de seguridad.
- **Errores tipados por frontera**: red, validación, permiso y negocio se muestran distinto.

## Formularios

Validación con esquema compartido con el backend si el lenguaje lo permite. Errores junto al
campo, asociados con `aria-describedby`. Botón de envío deshabilitado **solo** durante el envío,
nunca por validación pendiente. Protección contra doble envío. Estado sucio recuperable: perder
lo escrito es imperdonable.

## Accesibilidad — WCAG 2.2 AA, en el código

- HTML semántico primero. `role` es un parche, no un punto de partida. Un `div` con `onClick` no
  es un botón: no recibe foco, no responde a teclado.
- Navegable **solo con teclado**, de principio a fin, incluidos modales (foco atrapado, `Esc`
  cierra, foco devuelto al origen).
- Foco visible siempre. No lo elimines por estética.
- Contraste ≥ 4.5:1 texto normal, ≥ 3:1 texto grande y controles.
- Nada comunicado **solo** por color.
- Cambios dinámicos anunciados con región `aria-live` cuando importan.
- Objetivos táctiles ≥ 24×24 px con separación.
- Respeta `prefers-reduced-motion`.
- Imágenes con `alt` con intención; decorativas con `alt=""`.
- Compruébalo con axe en el test, no a ojo.

## Rendimiento, con medición

Sin medición previa no se optimiza. Objetivo declarado o no hay tarea.

- **Core Web Vitals**: LCP, INP, CLS. Presupuesto de bundle declarado y verificado en CI.
- División de código por ruta. `import()` para lo que no se ve al entrar.
- Imágenes: formato moderno, tamaño correcto, `width`/`height` para no mover el layout, `lazy`
  salvo la primera visible.
- Listas largas: virtualización.
- Memoiza **cuando el perfilador lo pide**. Memoizar por reflejo añade coste y esconde bugs.
- Fuentes: `font-display` y precarga de la crítica.

## Seguridad en el cliente

- Escapado por contexto. `dangerouslySetInnerHTML` (o equivalente) solo con sanitizado, y
  justificado por escrito.
- **Ningún secreto en el cliente.** Todo lo que llega al navegador es público. Sin excepción.
- Tokens: preferible cookie `HttpOnly` + `SameSite` a `localStorage`.
- CSP estricta. La autorización real está en el servidor: ocultar un botón no protege nada.
- Enlaces externos con `rel="noopener noreferrer"`.
- Dependencias de UI: cada una es código de terceros ejecutándose en la sesión del usuario.

## Antes de devolver el control

- [ ] Rojo demostrado con salida real, ahora verde
- [ ] Los seis estados implementados y probados
- [ ] Accesible por teclado y verificado con axe
- [ ] Fiel al diseño; toda desviación **acordada y anotada**, no silenciosa
- [ ] Lint, formato y tipado estricto sin warnings
- [ ] Presupuesto de rendimiento respetado
- [ ] Sin lógica de negocio ni secretos en el cliente

## Stack concreto

El método no depende del framework; las prácticas del fabricante sí.
[`docs/agents/SKILLS-EXTERNAS.md`](../../../docs/agents/SKILLS-EXTERNAS.md) recoge las skills
oficiales aplicables —`vercel-labs/next-best-practices`, `next-cache-components`, `next-upgrade`
y la `frontend-design` de Anthropic para criterio visual—. Para versiones y APIs actuales, MCP
`context7`; para leer tokens y componentes del diseño, MCP `figma` o `stitch`. No inventes la API
de una librería de memoria.

## Salida

```
### HANDOFF
- Agente origen: frontend-expert
- Tarea: T-NNN-XX — <título>
- Criterio que cubre: CA-NN
- Ficheros tocados: <rutas>
- Ciclo TDD: rojo <salida pegada> → verde → refactor <qué se limpió>
- Estados implementados: vacío / cargando / parcial / error / sin permiso / éxito
- Accesibilidad: <qué se verificó y con qué>
- Rendimiento: <medición, si aplica>
- Desviaciones del diseño: <lista y motivo, o "ninguna">
- Bloqueos / supuestos: <lista, o "ninguno">
- Devuelvo control a: <quien me invocó>
```
