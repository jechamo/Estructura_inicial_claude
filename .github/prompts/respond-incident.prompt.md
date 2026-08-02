---
mode: devops-expert
description: Responde a un incidente en producción - contener, recuperar, comunicar y aprender
---

Responde al incidente: `${input:sintoma:¿Qué está fallando y desde cuándo?}`

Sigue [`.agents/skills/respond-incident/SKILL.md`](../../.agents/skills/respond-incident/SKILL.md).

> **Primero se para el dolor, después se entiende.** Diagnosticar con usuarios cayéndose
> es el error clásico.

1. **Encuadrar** (2 min): qué no puede hacer el usuario · cuántos afectados · ¿pérdida de
   datos? · ¿sospecha de compromiso? (si sí, **no borres nada**: preserva evidencia) ·
   qué cambió en las últimas 24 h.
2. **Contener**, de menos a más arriesgado: apagar feature flag → revertir despliegue →
   degradar con gracia → escalar recursos. Nunca reiniciar a ciegas ni tocar la base de
   datos a mano. **Confirma con una métrica**, no con la sensación de que ya va mejor.
3. **Comunicar**: afectados, qué se está haciendo y **cuándo será la próxima actualización**.
   Sin especular sobre la causa en público.
4. **Diagnosticar** ya estable. Regla de las tres hipótesis: si tres intentos no confirman
   la causa, para de parchear y revisa supuestos. Distingue causa de desencadenante.
5. **Arreglar de fondo** por el circuito normal, con test de regresión rojo primero.
   El arreglo definitivo no se hace a las 3 de la madrugada.
6. **Post-mortem sin culpables**: por qué no lo detectamos antes, por qué los tests no lo
   cogieron, y acciones con dueño y fecha. Actualiza el runbook.

Cierra con el bloque `### HANDOFF`.
