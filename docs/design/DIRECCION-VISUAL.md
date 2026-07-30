# Dirección visual del proyecto

> **Se decide una vez y es vinculante**, como la constitución de arquitectura. Cada `design.md`
> se contrasta contra este documento, y `/front` comprueba el código contra él.
>
> Lo rellena `@ux-designer` **con el usuario** en el primer `/sdd-design`, o antes si el proyecto
> arranca con identidad. Sin esto aprobado, `/sdd-design` no dibuja pantallas.

| Campo | Valor |
|---|---|
| **Estado** | borrador \| **aprobada por el usuario** |
| **Fecha** | YYYY-MM-DD |
| **Aprobada por** | `<persona>` |

---

## Por qué existe este documento

La accesibilidad y los seis estados son un **suelo**, no un techo. Una interfaz puede cumplir
WCAG 2.2 AA, tener sus estados vacío/cargando/error y seguir siendo el MVP de cuatro cajas grises
que nadie quiere usar.

Y hay un sesgo en contra: **la interfaz generada por IA converge en un aspecto reconocible y
genérico** —tarjeta con borde redondeado, gris neutro, mismo espaciado en todo, titular apenas
mayor que el cuerpo—. Sin una dirección declarada, ese es el resultado por defecto, porque es el
camino de menor resistencia.

Este documento existe para cerrar esa puerta antes de abrir el editor.

---

## 1. Referencias

> Dos o tres productos reales, **y por qué**. "Moderno y limpio" no es una referencia: es lo que
> dice todo el mundo y no descarta nada.

| Producto | Qué tomamos de él | Qué NO tomamos |
|---|---|---|
| | | |

**Antirreferencia** — un producto que representa lo que **no** queremos ser, y por qué:

## 2. Personalidad

> Tres adjetivos que **excluyan algo**. "Sobrio, denso, técnico" descarta cosas.
> "Bonito, moderno, profesional" no descarta nada y por eso no sirve.

1.
2.
3.

**Traducción a decisiones**: por cada adjetivo, qué implica en la pantalla.

| Adjetivo | Se ve en |
|---|---|
| | |

## 3. Tipografía

> El error más común y el que más "look de plantilla" produce: **titular de 32 px sobre cuerpo de
> 16 px**. Un ratio de 2 no es jerarquía, es una lista con la primera línea un poco más grande.

| Nivel | Tamaño | Peso | Uso |
|---|---|---|---|
| Display | | | Lo que debe verse desde lejos |
| Título | | | |
| Cuerpo | | | |
| Secundario | | | |

- **Familia(s)**: <cuántas, y por qué. Dos como máximo salvo justificación>
- **Ratio de escala**: <p. ej. 1,25 · 1,333 · 1,5>
- **Contraste de peso**: ¿hay salto real entre el titular y el cuerpo, o solo de tamaño?

## 4. Color

> Un color de marca con intención, no una paleta de doce tonos que nadie recuerda.

| Rol | Valor | Cuándo se usa |
|---|---|---|
| Marca / acento | | **Con moderación**: si todo destaca, nada destaca |
| Superficie | | |
| Superficie elevada | | |
| Texto principal | | |
| Texto secundario | | |
| Éxito / aviso / error | | |

- **Modo claro y oscuro**: ¿los dos desde el inicio? Decidir ahora sale gratis; después no.
- **Contraste verificado**: ≥ 4.5:1 texto normal · ≥ 3:1 texto grande y controles.

## 5. Densidad y espacio

> Decisión consciente, no resultado del azar.

- **Densidad**: `aire generoso (producto de consumo)` \| `compacta (herramienta profesional)`
- **Escala de espaciado**: <4/8, 4/6/8…>
- **Ancho máximo de lectura**: <60-75 caracteres>
- **Radio de esquina**: <un valor, no cinco>

## 6. Elemento con carácter

> **Uno por pantalla, obligatorio.** Es lo que separa un producto de un formulario.
> No tiene que ser decorativo: un dato bien presentado tiene más carácter que una ilustración.

Catálogo de recursos permitidos en este proyecto:

- [ ] Dato destacado con tratamiento tipográfico propio
- [ ] Ilustración o icono con estilo definido
- [ ] Estado vacío que **enseña** en lugar de disculparse
- [ ] Visualización de datos
- [ ] Fotografía / imagen con tratamiento consistente
- [ ] Composición asimétrica o superposición deliberada
- [ ] Otro: <cuál>

## 7. Movimiento

> Declarado, no improvisado. La animación sin criterio se nota más que su ausencia.

| Qué se anima | Duración | Curva | Por qué |
|---|---|---|---|
| | | | |

- **`prefers-reduced-motion`**: alternativa definida. No es opcional.
- **Qué NO se anima**: <lo que debe ser instantáneo>

## 8. Lo que este proyecto NO va a hacer

> Tan útil como lo anterior. Cierra discusiones antes de que ocurran.

- <p. ej. "sin degradados", "sin sombras difusas grandes", "sin animaciones de entrada al hacer scroll">

---

## 9. Cómo se verifica

| Momento | Quién | Qué comprueba |
|---|---|---|
| `/sdd-design` | `@ux-designer` | Cada pantalla declara su elemento con carácter y respeta escala y paleta |
| `/front` | `@frontend-expert` | El código implementa la dirección; toda desviación se acuerda y se anota |
| `/sdd-verify` | `@code-reviewer` | No hay valores fuera de los tokens ni jerarquía tipográfica plana |

**Skills de apoyo** — ver [`docs/agents/SKILLS-EXTERNAS.md`](../agents/SKILLS-EXTERNAS.md):
`anthropics/skills:frontend-design` para el criterio visual antes de escribir código,
`vercel-labs/agent-skills:web-design-guidelines` para auditar la UI terminada, y
`shadcn-ui/ui:shadcn` si el proyecto usa esa base de componentes.

> **Una desviación de este documento no es un detalle de estilo: es una decisión de producto.**
> Se acuerda con el usuario y se anota, igual que una violación de la constitución de arquitectura.
