# 013 · Verificación independiente del host

| Campo | Valor |
|---|---|
| **ID** | `013-verificacion-independiente-del-host` |
| **Estado** | en implementación |
| **Autor** | usuario + `spec-analyst` (`declared-direct`) |
| **Fecha** | 2026-08-17 |
| **Rama** | `main` · trabajo local solicitado por el usuario |
| **Depende de** | `012-autocumplimiento-cli-y-gates` |
| **Baseline de producto** | `approved` · `docs/product/PRD.md` |
| **Impacto de seguridad** | `sensible` |
| **Impacto de usabilidad** | `aplicable` |
| **Impacto de documentación** | `aplicable · DOC-TRACE` |

> Capacidad interna de la plantilla: no crea requisitos de producto ni decisiones de dominio.

## 1. Problema

El sistema promete dos garantías que hoy dependen de que el entorno de trabajo colabore, y hay
entornos que no colaboran.

La primera es el reparto de territorios. `.sdd/territories.json` declara siete territorios y
asigna cada uno a un agente, pero el fichero está en `modo: "audit"` y solo lo lee
`guard-write.mjs` cuando el host ejecuta hooks. La integración continua se limita a comprobar
que el JSON se puede parsear. Nadie verifica que los agentes citados existan, que las rutas
declaradas correspondan a algo real, que dos territorios no reclamen el mismo camino, ni que la
decisión sea la misma en los seis entornos soportados. El reparto es, en la práctica, una
convención escrita: describe una intención que ningún control obliga a cumplir.

La segunda es la trazabilidad de la delegación. El estado `observed` exige que el host emita
eventos de inicio y fin de subagente, y solo dos de los seis los emiten —Claude Code y Codex—.
Cursor, Copilot/VS Code y Antigravity tienen evento de pre-escritura pero no de subagente.
Gemini no tiene contrato de hooks en absoluto y ni siquiera aparece en la lista de hosts que
verifica `scripts/test-hooks.mjs`, de modo que su carencia no está registrada en ningún sitio:
es un hueco invisible. En los cuatro entornos restantes la única alternativa es
`declared-direct`, que es una afirmación del propio agente que nadie contrasta.

El resultado es que las dos garantías más citadas del sistema —quién puede escribir dónde, y
quién hizo realmente qué— se apoyan en el eslabón que el proyecto no controla.

## 2. Objetivo

Verificar el reparto de territorios y la autoría del trabajo con mecanismos que no dependan de
que el entorno de trabajo emita eventos, y declarar con precisión el límite de lo que sí
depende de él.

## 3. Requisitos

| Id | Requisito EARS | Prioridad | Esfuerzo |
|---|---|---|---:|
| RF-01 | CUANDO se evalúe una escritura, la decisión de territorio DEBE calcularse en una función pura, verificable con una tabla de casos y compartida por los seis entornos, en lugar de vivir dentro del hook de un host concreto. | M | M |
| RF-02 | CUANDO se verifique el proyecto, `check-sdd` DEBE comprobar que cada territorio cita un agente existente, que sus rutas resuelven a algo real o están declaradas como futuras, y que dos territorios no reclaman la misma ruta. | M | M |
| RF-03 | SI un entorno soportado carece de un evento necesario para observar la delegación, el proyecto DEBE declararlo por escrito junto a la consecuencia que tiene, y una comprobación DEBE fallar si esa declaración desaparece. | M | S |
| RF-04 | CUANDO un commit declare tarea y agente mediante trailers, una comprobación DEBE contrastar que la tarea existe, que el agente existe y que los ficheros tocados caen dentro de su territorio, sin usar eventos del host. | M | M |
| RF-05 | SI los ficheros de un commit caen fuera del territorio del agente declarado, la comprobación DEBE exigir una excepción escrita y material en lugar de aceptarla en silencio. | M | S |
| RF-06 | CUANDO un hook de pre-escritura identifique al agente activo, el sistema DEBE registrar la autoría una sola vez por sesión, agente y spec, sin crecer con el número de ficheros escritos. | S | M |
| RF-07 | CUANDO este repositorio se verifique a sí mismo, el reparto de territorios DEBE estar en modo restrictivo, mientras que una instalación nueva DEBE seguir arrancando en modo de observación. | M | S |

## 4. Criterios de aceptación

### CA-01 · La regla de territorio es una tabla, no un hook

La decisión `(agente, ruta, modo) → allow | ask | deny` se calcula en una función exportada y
sin efectos, dirigida por una tabla de casos que cubre: agente dueño, agente ajeno, agente
coordinador, ruta fuera de todo territorio y los cuatro modos. La misma función es la que
consulta el hook, de modo que verificarla es verificar lo que decide el hook.

### CA-02 · Integridad del reparto

`check-sdd` falla si un territorio cita un agente que no existe en `.claude/agents/`, si una
ruta declarada no resuelve a nada existente ni está marcada como futura, si dos territorios
reclaman la misma ruta sin precedencia declarada, o si el modo no es uno de los cuatro
admitidos. Los agentes sin territorio se enumeran con su motivo; que un agente auditor no tenga
territorio es una decisión, no un olvido.

### CA-03 · Las carencias de cada entorno están escritas

Los seis entornos soportados aparecen en la comprobación de contratos, incluido el que no tiene
hooks. Para cada uno consta si observa la pre-escritura y si observa el ciclo de vida del
subagente. Si alguien retira esa declaración, la comprobación falla.

### CA-04 · Autoría corroborada por el repositorio

Sobre un historial de prueba, la auditoría de trazas acepta un commit cuyos trailers `Spec`,
`Task` y `Agent` son coherentes con `tasks.md`, con el catálogo de agentes y con el territorio
del agente; y rechaza, con mensaje distinto para cada caso, el commit cuya tarea no existe, cuyo
agente no existe, y el que toca ficheros fuera de territorio sin excepción declarada.

### CA-05 · La excepción es explícita y material

Un commit que escribe fuera del territorio de su agente pasa la auditoría únicamente si declara
`Trace-exception` con un motivo de longitud material. Un motivo vacío, o formado por palabras de
relleno, se rechaza igual que la ausencia del trailer.

### CA-06 · El registro de autoría está acotado

Escribir veinte ficheros en la misma sesión, con el mismo agente y la misma spec, produce una
sola entrada de autoría. Cambiar de agente, de sesión o de spec produce una entrada nueva. El
registro no crece con el trabajo, crece con la delegación.

### CA-07 · Este repositorio se aplica el modo restrictivo

`.sdd/territories.json` de este repositorio declara modo `deny`, y una comprobación lo asevera.
La plantilla que se instala en un proyecto nuevo declara modo `audit`, y otra comprobación lo
asevera. El escape declarado `SDD_GATES=off` sigue funcionando en ambos.

## 5. Trazabilidad de producto

| Objetivo | Requisito de producto | Caso de uso | Requisito | Criterio |
|---|---|---|---|---|
| OBJ-001 | PRD-RF-001 | UC-003 | RF-01 | CA-01 |
| OBJ-001 | PRD-RF-001 | UC-003 | RF-02 | CA-02 |
| OBJ-003 | PRD-RF-006 | UC-001 | RF-03 | CA-03 |
| OBJ-002 | PRD-RF-003 | UC-004 | RF-04 | CA-04 |
| OBJ-002 | PRD-RF-003 | UC-004 | RF-05 | CA-05 |
| OBJ-002 | PRD-RF-003 | UC-004 | RF-06 | CA-06 |
| OBJ-001 | PRD-RF-001 | UC-003 | RF-07 | CA-07 |

## 6. Fuera de alcance

- No se verifica que un host concreto haya invocado la guarda. Eso no se puede comprobar desde
  fuera del host y esta spec no lo insinúa en ninguna parte.
- No se implementa firma criptográfica de los trailers. La corroboración encarece la mentira y
  hace detectable el descuido; no la impide.
- No se reparten territorios a los veinte agentes. Se declara por qué los que no lo tienen no
  lo tienen.
- No se modifican las doce specs anteriores para ajustarlas a los contratos vigentes desde esta.

## 7. Riesgos

| Riesgo | Mitigación |
|---|---|
| Pasar este repositorio a `deny` bloquea trabajo legítimo | El escape `SDD_GATES=off` ya existe y se conserva; el modo se asevera con una comprobación, así que revertirlo es un cambio visible |
| La auditoría de trazas produce falsos positivos sobre el historial existente | Se audita el rango de commits indicado, no todo el historial; los commits sin trailers se declaran no auditables en lugar de fallar |
| El registro de autoría por pre-escritura infla el fichero de trazas | La deduplicación por sesión, agente y spec es un criterio de aceptación, no una optimización posterior |
