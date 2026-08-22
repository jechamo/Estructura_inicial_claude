# Clarificaciones · 017-circuito-proporcional-contexto

Registro de las ambigüedades resueltas con el usuario. Cada respuesta actualiza `spec.md`.

---

## Ronda 1 — 2026-08-22

Las tres ambigüedades se resolvieron durante la planificación, contrastando tres propuestas
independientes. Se registran aquí porque la decisión, no el debate, es lo que la spec hereda.

### P1 · ¿Cómo se abarata un cambio de comportamiento pequeño sin abrir la mano?

**Marcador origen**: `spec.md` §1, causa 3

**Trazabilidad afectada**: `OBJ-002 → PRD-RF-003 → UC-002 → RF-07/RF-09/RF-13 · CA-05/CA-07/CA-11`

**Fuentes / discrepancias**: `SRC-003 · ninguna`

**Opciones planteadas**:
- a) Ampliar la frontera ligera para que cubra directorios de componentes — consecuencia: el atajo
  dispensa el expediente entero, así que una regla de negocio escondida en un componente se iría sin
  spec. Barato de implementar y peligroso.
- b) Añadir un tercer nivel intermedio con un único documento y límites verificables —
  consecuencia: el ligero se queda estrecho, y lo que cambia comportamiento paga un peaje pequeño
  pero conserva TDD, gates y revisión independiente.
- c) No hacer nada y aceptar el peaje completo — consecuencia: se sigue enseñando a rodear el
  circuito.

**Recomendación del agente**: b. La opción a se propuso primero y se descartó al ver que el atajo no
dispensa papeleo sino expediente completo: abrir raíces ejecutables era regalar la verificación
documental de cualquier cambio que pasara por allí.

**Respuesta**: b, con un suelo adicional por tipo de fichero: todo ejecutable es `compact` como
mínimo, se escriba como se escriba la frontera. Así el nivel ligero es estructuralmente incapaz de
cubrir código, y no depende de que la frontera esté bien redactada.

### P2 · ¿Quién decide el nivel: la herramienta o quien pide el cambio?

**Marcador origen**: `spec.md` §8

**Trazabilidad afectada**: `OBJ-001 → PRD-RF-001 → UC-003 → RF-10 · CA-08`

**Fuentes / discrepancias**: `SRC-001 · ninguna`

**Opciones planteadas**:
- a) La herramienta clasifica por rutas y nadie puede contradecirla — consecuencia: determinista,
  pero deja fuera casos que la ruta no distingue, como un fichero de configuración que sí cambia
  comportamiento.
- b) Quien pide el cambio declara si hay cambio de comportamiento — consecuencia: la frontera pasa a
  depender de cómo esté redactada la petición, que es exactamente lo que el diseño del circuito
  ligero se propuso evitar.
- c) La herramienta clasifica, y una declaración solo puede **elevar** el nivel, nunca rebajarlo —
  consecuencia: se cubre el caso que la ruta no ve sin conceder ninguna palanca para abaratarse.

**Recomendación del agente**: c.

**Respuesta**: c. Y se añade a las reglas de negocio de forma explícita, para que no se reinterprete
más adelante: ninguna declaración rebaja el nivel.

### P3 · ¿Qué umbral de ahorro justifica integrar el cambio?

**Marcador origen**: `spec.md` §2

**Trazabilidad afectada**: `OBJ-004 → PRD-RF-008 → UC-005 → RF-01 · CA-01`

**Fuentes / discrepancias**: `SRC-003 · ninguna`

**Opciones planteadas**:
- a) Reducción ≥30 % también en circuito completo — consecuencia: sin precedente; descartaría una
  mejora real por no llegar a una vara inventada.
- b) Reducción ≥20 % en circuito completo, que es la que la spec 011 estableció y midió —
  consecuencia: comparable con lo ya medido en este repositorio.

**Recomendación del agente**: b para el circuito completo y ≥70 % para el compacto, donde el
mecanismo —un solo documento y tres intervenciones— sí justifica la cifra alta.

**Respuesta**: b. El umbral osciló entre 20 % y 30 % durante la planificación; se fija en el que
tiene precedente medido. Si no se alcanza, la candidata se descarta y se registra como experimento,
conforme a `RF-08` de la spec 011.

---

## Ambigüedades restantes

Ninguna. La spec pasa a gate humano.
