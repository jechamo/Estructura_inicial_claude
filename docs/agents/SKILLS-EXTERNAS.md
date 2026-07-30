# Skills externas — catálogo, política y registro de auditoría

Manifiesto: [`.sdd/external-skills.json`](../../.sdd/external-skills.json)
Verificación: `node scripts/skills-sync.mjs --check`
Investigación de origen: [`baseline-2026-07-30.md`](../research/baseline-2026-07-30.md) §1

---

## 1. Por qué este fichero existe

A 30/07/2026 el directorio del ecosistema declara **107 318 skills descubribles** en 2350
repositorios. El problema dejó de ser encontrar skills y pasó a ser **elegirlas**.

Una skill no es documentación. Es **instrucciones que tu agente obedece** más un directorio que
puede contener scripts que ejecuta. Es una dependencia ejecutable con permiso de escritura sobre
tu repositorio. Instalar la skill de un desconocido porque tiene muchas estrellas es lo mismo que
copiar un `postinstall` sin leerlo.

Eso es exactamente **ASI04 — cadena de suministro agéntica** del OWASP Top 10 for Agentic
Applications. Por eso: se declaran, se auditan, se fijan, y las instala una persona.

## 2. La decisión de diseño: declarar, no copiar

| Opción | Por qué no / sí |
|---|---|
| Copiar el `SKILL.md` de Vercel a `.claude/skills/` | **No.** Crea una copia que envejece en silencio, arrastra su licencia y hace que la próxima mejora del fabricante no llegue nunca |
| Instalar colecciones curadas completas | **No.** Colisión de triggers, consumo de contexto, superficie de ejecución y deuda de actualización |
| Declarar la referencia, fijarla y auditarla antes de usar | **Sí.** Es como se tratan las demás dependencias |

Y una consecuencia que conviene entender:

> **Las skills propias (`/middle`, `/front`, `/bbdd`) son agnósticas de stack a propósito.**
> SOLID, las fronteras entre capas, el ciclo TDD y "toda migración es reversible" no caducan
> cuando cambias de framework. Las skills de fabricante sí: son la capa de arriba, no la base.
> Si mañana el proyecto pasa de Next a otra cosa, la skill del fabricante se sustituye y el
> método sigue en pie.

## 3. Estados

| Estado | Significa |
|---|---|
| **candidata** | Descubierta y catalogada. **No instalada, no auditada.** |
| **aprobada** | Auditada y fijada. Instalable. Requiere `pin` y licencia verificada — el `--check` lo exige |
| **rechazada** | Auditada y descartada, **con motivo escrito**. Evita reevaluar lo mismo dentro de seis meses |

La auditoría se hace **cuando el proyecto adopta ese stack**, no antes. Auditar una skill de
Cloudflare en un proyecto que no usa Workers es teatro: consume tiempo y produce una conclusión
que caducará antes de servir para algo.

## 4. Catálogo

Este repositorio es una plantilla: **no tiene stack todavía**, así que todo está en `candidata` y
no hay nada instalado. Es el estado correcto, no un pendiente.

### Front

| Skill | Publicador | Aporta | Estado |
|---|---|---|---|
| `anthropics/skills:frontend-design` | Anthropic (oficial) | Criterio de diseño visual antes de tocar código. Apache-2.0 | candidata |
| `vercel-labs/next-best-practices` | Vercel (oficial) | Patrones de Next.js del equipo que lo mantiene | candidata |
| `vercel-labs/next-cache-components` | Vercel (oficial) | Caché y componentes cache-aware | candidata |
| `vercel-labs/next-upgrade` | Vercel (oficial) | Migración de versiones | candidata |

### Middle

| Skill | Publicador | Aporta | Estado |
|---|---|---|---|
| `cloudflare/workers-best-practices` | Cloudflare (oficial) | Workers contra prácticas de producción | candidata |
| `cloudflare/wrangler` | Cloudflare (oficial) | Workers, KV, R2, D1, Vectorize, Queues, Workflows | candidata |
| `netlify/netlify-functions` | Netlify (oficial) | Endpoints serverless y tareas en background | candidata |
| `netlify/netlify-edge-functions` | Netlify (oficial) | Middleware en edge, geolocalización | candidata |
| `stripe/stripe-best-practices` | Stripe (oficial) | Pagos: idempotencia, webhooks, reintentos | candidata |

### BBDD

| Skill | Publicador | Aporta | Estado |
|---|---|---|---|
| `supabase/postgres-best-practices` | Supabase (oficial) | PostgreSQL y RLS sobre Supabase | candidata |
| `neondatabase/neon-postgres` | Neon (oficial) | Postgres serverless | candidata |
| `netlify/netlify-db` | Netlify (oficial) | Postgres gestionado con branching por preview | candidata |

### QA

| Skill | Publicador | Aporta | Estado |
|---|---|---|---|
| `anthropics/skills:webapp-testing` | Anthropic (oficial) | Verificación en navegador real. Apache-2.0 | candidata |

### Rechazadas

| Qué | Motivo |
|---|---|
| Instalar colecciones curadas completas (`ComposioHQ`, `travisvn`, `VoltAgent`, `Chat2AnyLLM`) | Colisión de triggers, contexto, superficie de ejecución y deuda de actualización. **Se usan para descubrir**, no para instalar en bloque |

## 5. Un hueco que conviene saber

De las **17 skills** oficiales de [`anthropics/skills`](https://github.com/anthropics/skills), solo
tres tocan nuestro terreno: `frontend-design`, `webapp-testing` y `skill-creator`.

**Anthropic no publica skills de backend, capa media, dominio ni base de datos.** Quien las
publica es el fabricante de cada plataforma (Vercel, Supabase, Cloudflare, Netlify, Stripe, Neon),
y siempre atadas a *su* producto.

De ahí la decisión: el método de middle/front/BBDD lo pone esta plantilla. Nadie va a publicar
una skill oficial de "cómo aplicar SOLID en tu capa de aplicación" porque no vende plataforma.

## 6. Cómo se audita una candidata

Antes de pasar a `aprobada`, y con el resultado anotado en §8:

1. **Licencia** — compatible y registrada. `docx`, `pdf`, `pptx` y `xlsx` de Anthropic son
   *source-available*, **no** open source: conviene saberlo antes de depender de ellas.
2. **Lee el `SKILL.md` completo.** Son instrucciones que tu agente va a obedecer. ¿Contradice
   `AGENTS.md`? ¿Se salta el circuito SDD? ¿Empuja a decisiones que aquí requieren ADR?
3. **Scripts y ficheros adjuntos** — qué ejecutan, qué red tocan, qué escriben. Si trae un script
   que no entiendes, no está auditada.
4. **Permisos y herramientas** que declara en el frontmatter.
5. **Colisión de triggers** con `/middle`, `/front`, `/bbdd` y las `sdd-*`. Dos skills compitiendo
   por el mismo caso producen comportamiento no determinista según la superficie.
6. **Fija la versión** (`pin`). Nunca una referencia móvil.
7. **Anótala** en la tabla de §8, con fecha y quién.

Al actualizar: **revisa el diff del `SKILL.md`**, igual que en cualquier dependencia. Una
actualización de skill puede cambiar por completo lo que tu agente cree que debe hacer.

## 7. Instalación

Gestor del ecosistema: **skills.sh**, de Vercel.

```bash
node scripts/skills-sync.mjs          # qué aplica al stack detectado
node scripts/skills-sync.mjs --plan   # comandos de lo aprobado y aplicable
npx skills add <ref>@<pin>            # lo ejecutas tú
```

`skills-sync.mjs` **no instala nada**. Imprime el comando. Un script que descarga y activa
instrucciones de terceros por su cuenta es el vector ASI04 con otro nombre, y la plantilla no lo
va a incluir.

En Claude Code, las de Anthropic también entran por
`/plugin marketplace add anthropics/skills`.

Portabilidad: **Agent Skills** es estándar abierto desde el 18/12/2025. El mismo `SKILL.md`
funciona en Claude Code, Codex, Antigravity, Gemini CLI, Cursor, Copilot, OpenCode y Windsurf.
A diferencia de los agentes, aquí **no hay que duplicar por IDE**. Lo que no se ha comprobado es
si la *salida* es idéntica en todas: eso queda declarado como pendiente en el baseline.

## 8. Registro de auditorías

| Fecha | Skill | Veredicto | Quién | Notas |
|---|---|---|---|---|
| 2026-07-30 | Colecciones completas | **rechazada** | plantilla | Descubrimiento sí, instalación en bloque no |
| | | | | |

> Vacío por debajo de la primera fila **a propósito**: este repositorio no tiene stack, así que no
> hay nada que auditar todavía. Cuando `/sdd-init` fije el stack, `skills-sync.mjs` dirá qué
> candidatas aplican y esta tabla se rellena.
