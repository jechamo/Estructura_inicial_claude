# Deuda técnica

Documento vinculante. La mide `/sdd-verify`, la registra `bitacora-keeper` y la paga
`refactor-specialist`.

---

## Qué es

> "Decisiones de diseño convenientes a corto plazo y caras a largo plazo." — Ward Cunningham

Como la deuda financiera: tomas prestado tiempo hoy y pagas intereses cada vez que tocas ese código.
La deuda no es un fracaso; **no saber cuánta tienes, sí**.

| Eje | Tipos |
|---|---|
| Origen | **Deliberada**: decisión consciente, con compensación analizada y plan de pago · **Accidental**: por desconocimiento o prisa, sin intención |
| Efecto | **Crítica**: bloquea features · **Manejable**: solo ralentiza |

La deliberada se registra en la bitácora en el momento de contraerla, con su fecha de revisión. La
accidental se descubre midiendo.

---

## Cómo se mide

Con un comando, no con una impresión. **La deuda con adjetivo no existe**: "tenemos bastante deuda"
no permite decidir nada.

```bash
node scripts/sdd-project.mjs debt --json
```

Cuenta `TODO`, `FIXME`, `HACK` y `XXX` sobre los ficheros versionados —no sobre `node_modules` ni
sobre lo ignorado— y agrupa por directorio. Sin dependencias y sin presuponer lenguaje.

Señales complementarias, del proyecto que las tenga configuradas:

| Señal | De dónde sale |
|---|---|
| Avisos de lint | gate `lint` |
| Funciones sobre el umbral de complejidad | gate `smells` |
| Módulos CORE por debajo de su umbral | gate `coverage` |
| Tendencia del tiempo de build | histórico de CI: subida sostenida = complejidad creciente |

### Ratio

```
ratio = esfuerzo estimado para saldar la deuda / esfuerzo total del periodo
```

| Ratio | Lectura |
|---:|---|
| < 30 % | Normal. Se paga con la regla del 80/20 |
| > 30 % | Alta. Se programa un sprint de deuda |
| > 50 % | Crítica. Hay una decisión arquitectónica pendiente, no una limpieza |

El numerador es una estimación humana y se declara como tal. Lo que no es opinable es el conteo.

---

## Cómo se paga

**Regla del boy scout.** Cada vez que tocas un fichero, lo dejas algo mejor: un nombre que revela
intención, un número mágico extraído, código muerto fuera. Acotada al fichero que ya estabas
tocando —`implementer` tiene prohibido arreglar de paso lo que no es su tarea, y esa prohibición
manda—.

**Regla del 80/20.** Un quinto de la capacidad de cada ciclo va a deuda. Previene la acumulación y
mantiene la velocidad estable. Es lo que evita el sprint de deuda.

**Sprint de deuda.** Cuando el ratio supera el 30 %: un periodo sin features, solo refactor,
limpieza y tests. Es una corrección, no una rutina; si hace falta cada trimestre, el problema está
en el 80/20 que no se está respetando.

**Un `TODO` sin ticket no es deuda, es un despiste.** La Definition of Done lo bloquea.

---

## Cómo se comunica

El negocio no decide sobre complejidad ciclomática. Decide sobre tiempo y riesgo.

| No | Sí |
|---|---|
| "Tenemos alta complejidad ciclomática y varios code smells" | "Cada feature nueva en este módulo tarda el doble que hace seis meses" |
| "Hay 47 TODOs pendientes" | "Invertir una semana ahora ahorra cuatro el próximo trimestre" |
| "El código está mal" | "El riesgo es que un cambio en pagos rompa algo que no vemos hasta producción" |

Traducir no es maquillar: la cifra sigue estando en `evidence.md`. Es elegir la unidad que permite
a quien decide, decidir.

---

## Backlog brownfield · 2026-08-21

Prioridad cualitativa por **impacto × frecuencia de cambio observada**. Esta sección documenta;
no cierra tareas históricas ni corrige el baseline.

| ID | Prioridad | Deuda / evidencia | Tratamiento o disparador | Estado |
|---|---|---|---|---|
| TD-ARCH-001 | Alta | Constitución heredada materializada, pero ADR-0001 pendiente de aprobación humana | aprobar/rechazar ADR antes de tratarla como vinculante | propuesta |
| TD-SDD-002 | Alta | `web/README.md` declara la GUI fuera del circuito SDD/TDD | antes del próximo cambio de `web/`, crear spec y cobertura; no retroespecificar en bloque | abierta |
| TD-OWN-003 | Alta | `.sdd/territories.json` no gobierna `scripts/`, `web/`, `site/`, tests ni hooks | aprobar mapa sin solapamientos y verificar guardas antes de activarlo | abierta |
| TD-TRACE-004 | Alta | `T-010-05` permanece `en curso` y puede contaminar atribución | resolver mediante el circuito de la spec 010; onboarding no la cierra | abierta |
| TD-TEST-005 | Alta | sin pruebas directas observadas para servidor, runner, validación y endpoints de la GUI | obligatorio antes de modificar red, TLS, procesos o API local | abierta |
| TD-MOD-006 | Media | módulos grandes y calientes; `test-install.mjs` alcanzó el tercer aumento del trinquete | partir arnés/bloques antes de volver a elevar `.sdd/smells.json` | abierta |
| TD-SUPPLY-007 | Media | Pages usa tags móviles de Actions, a diferencia del workflow principal fijado por SHA | fijar SHA en una spec de hardening/release | abierta |
| TD-REL-008 | Media | `package.json`/tag estable 0.7.0 por detrás de `main` y de la documentación de `sdd-light` | resolver en `/sdd-ship` de la siguiente release | abierta |
| TD-PROD-009 | Media | hashes de producto aprobados con encabezados `pending` en tres fuentes | normalizar mediante intake/decisión de producto, sin reescritura silenciosa | abierta |
| TD-DOC-010 | Media | TFM presenta `skills-sync.mjs` como sincronizador/generador; el script solo audita y orienta | corregir documentación o cambiar comportamiento mediante su circuito correspondiente | abierta |
| TD-GEN-011 | Media | `site-prep.mjs` materializa Pages sin entrada en `.sdd/generators.json` | aprobar contrato `site-publication` antes de activarlo | propuesta |
| TD-DEPS-012 | Baja | sin lockfile ni `deps-audit`; hoy no hay dependencias de paquete | revisar al añadir la primera dependencia o ampliar supply chain | condicional |

Detalle arquitectónico y propuesta de territorios: [`CURRENT-STATE.md`](../architecture/CURRENT-STATE.md).
