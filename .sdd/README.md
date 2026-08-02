# .sdd/

Estado y auditoría del circuito SDD.

| Fichero | Qué es |
|---|---|
| `agent-audit.jsonl` | Eventos de subagente que no pudieron asociarse a una spec activa. Append-only, lo escriben los hooks. |

Cuando hay una spec activa, los eventos van a `docs/specs/NNN-slug/execution-log.jsonl`.
Este fichero es la red de seguridad para no perder ninguno.

**No lo edites a mano.** `guard-write.mjs` bloquea la escritura sobre él: si un agente pudiera
reescribir su propio registro, el registro no serviría como evidencia de nada.

## Formato de cada línea

```json
{"ts":"AAAA-MM-DDTHH:mm:ss.sssZ","evento":"subagent-stop","agente":"backend-expert","sesion":"<id-sesion>","verificacion":"observed"}
```

`verificacion: observed` significa que un hook del host vio el ciclo real del subagente.
Es el único nivel que no depende de lo que el modelo afirme en el chat.
