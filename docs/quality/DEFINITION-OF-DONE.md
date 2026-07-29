# Definition of Done

Una tarea **no está hecha** hasta que todo esto está en verde.
Lo verifica `/sdd-verify` y lo exige `release-manager` antes de `/sdd-ship`.

---

## Por tarea

- [ ] Test rojo previo demostrado (salida pegada) y ahora verde
- [ ] Toda la suite pasa, sin `.skip` ni `.only`
- [ ] Lint, formato y tipado estricto sin warnings
- [ ] El código cumple los criterios de aceptación que la tarea declara cubrir
- [ ] Casos límite tratados: vacío, límite, concurrencia, error externo
- [ ] Sin secretos, claves ni PII en código, logs o tests
- [ ] Sin `TODO` sin ticket ni código muerto
- [ ] `tasks.md` actualizado

## Por spec (antes de entregar)

- [ ] Todos los `CA` de la spec tienen un test que los verifica
- [ ] `evidence.md` completo: ejecuciones con su comando y resultado, trazabilidad
      requisito → test, y **la lista de controles que NO se ejecutaron** con su riesgo y dueño
- [ ] Cada tarea `hecho` tiene ejecución registrada en `execution-log.jsonl`
- [ ] Cobertura dominio/aplicación ≥ 80 % **y cero zonas críticas sin probar** ← este segundo
      criterio es el que manda; el porcentaje es solo un punto de partida ajustable por riesgo
- [ ] `code-reviewer` → veredicto ✅
- [ ] `refactor-specialist` → sin violaciones SOLID sin justificar
- [ ] `security-auditor` → sin hallazgos CRÍTICO ni ALTO
- [ ] Contratos de `contracts/` actualizados y tipos regenerados
- [ ] Documentación actualizada en el mismo cambio
- [ ] Migraciones reversibles y compatibles con la versión anterior desplegada
- [ ] Observabilidad: logs estructurados, métricas y trazas en los caminos nuevos
- [ ] Feature flag donde el plan lo pedía, con condición de retirada escrita
- [ ] Plan de reversión escrito, con comando exacto
- [ ] Entrada en `docs/bitacora/DECISIONS.md` si hubo decisión relevante
- [ ] Trazabilidad completa: código ↔ tarea ↔ criterio de aceptación ↔ spec

---

## Automatización

Todo gate que se pueda automatizar, **se automatiza en CI**. Lo que depende de la buena
voluntad, se olvida.

| Gate | Automatizado en | Bloquea merge |
|---|---|---|
| Tests | CI | Sí |
| Cobertura mínima | CI | Sí |
| Lint / formato / tipos | CI + hook `PostToolUse` | Sí |
| Escaneo de secretos | CI + hook `PreToolUse` | Sí |
| Auditoría de dependencias | CI | Sí (CRÍTICO/ALTO) |
| Tests de contrato | CI | Sí |
| Revisión de código | `code-reviewer` + humano | Sí |
| Auditoría de seguridad | `security-auditor` | Sí (CRÍTICO/ALTO) |
| Trazabilidad spec ↔ test | `/sdd-verify` | Sí |

---

## Regla final

> **Nada se marca como terminado sin ejecutar los tests y mostrar la salida real.**
>
> "Los tests pasan" sin la salida pegada no cuenta como verificación. Ni para un humano,
> ni para un agente.
>
> Y su corolario, que se olvida siempre: **"no ejecutado" es un resultado válido y se
> escribe.** Un control que no se corrió no es un control aprobado: es un riesgo sin dueño.
> Por eso `evidence.md` tiene una sección obligatoria para ellos.
