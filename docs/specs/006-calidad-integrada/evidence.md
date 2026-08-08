# Evidencias y convergencia · 006-calidad-integrada

> `execution-log.jsonl` es la bitácora **append-only** que registra qué subagente arrancó y
> terminó, escrita por los hooks y no por el modelo. Este documento resume la **evidencia
> técnica**: qué se ejecutó, con qué comando, con qué resultado.
>
> Regla: **"pasa" sin ejecución no es un resultado. "No ejecutado" sí lo es** — y se escribe.

---

## 1. Ejecuciones

| Fecha | Agente | Verificación | Tarea | Comando | Resultado |
|---|---|---|---|---|---|
| 2026-08-07 | Claude Code (directo) | `declared-direct` | T-006-04 | `node scripts/check-sdd.mjs` | 🔴 `se esperaban 24 skills canónicas y hay 25` (esperado: el gate de paridad detectó la skill nueva) |
| 2026-08-07 | Claude Code (directo) | `declared-direct` | T-006-04 | `node scripts/check-sdd.mjs` | 🟢 tras actualizar el contrato a 25 |
| 2026-08-07 | Claude Code (directo) | `declared-direct` | T-006-09 | `node scripts/check-sdd.mjs` con gate `inventado`/`speed: turbo` sembrado | 🔴 `gate 'inventado' fuera del vocabulario permitido` + `speed 'turbo' no válido` |
| 2026-08-07 | Claude Code (directo) | `declared-direct` | T-006-10 | `node scripts/check-sdd.mjs` con `](../front/SKILL.md)` sembrado en `tdd` | 🔴 `.agents/skills/tdd/SKILL.md enlaza '../front/SKILL.md'` |
| 2026-08-07 | Claude Code (directo) | `declared-direct` | T-006-11 | `node scripts/scan-secrets.mjs` sobre fixture con clave AWS y `.env` | 🔴 3 hallazgos con fichero y línea, salida 1 |
| 2026-08-07 | Claude Code (directo) | `declared-direct` | T-006-12 | `node scripts/check-sdd.mjs --strict` sobre commit sin CHANGELOG ni bitácora | 🔴 `entrega/changelog` y `entrega/bitacora`, nombrando el fichero culpable |
| 2026-08-07 | Claude Code (directo) | `declared-direct` | T-006-12 | `node scripts/check-sdd.mjs --strict` con ambos añadidos | 🟢 `Estricto: estructura, trazabilidad y evidencia verificadas` |
| 2026-08-07 | Claude Code (directo) | `declared-direct` | T-006-08 | `sdd-project detect --json` × hash antes/después | 🟢 hash idéntico: `detect` no escribe |
| 2026-08-07 | Claude Code (directo) | `declared-direct` | T-006-08 | `sdd-project run --fast` / `--slow` en proyecto instalado | 🟢 4 gates rápidos / 3 lentos, sin solaparse |
| 2026-08-07 | Claude Code (directo) | `declared-direct` | T-006-08 | `git commit` con lint en rojo y `core.hooksPath=.sdd/githooks` | 🟢 bloqueado (0 commits); con `--no-verify`, 1 commit |
| 2026-08-07 | Claude Code (directo) | `declared-direct` | T-006-03 | `sdd-project debt` | 🔴 21 marcadores, 18 falsos positivos (la propia implementación) → corregido a exigir comentario |
| 2026-08-07 | Claude Code (directo) | `declared-direct` | todas | `node scripts/check-sdd.mjs` | 🟢 `6 spec(s) · 36 tarea(s) hecha(s) · 20 agente(s) · 25 skill(s)` |
| 2026-08-07 | Claude Code (directo) | `declared-direct` | todas | `node scripts/test-hooks.mjs` | 🟢 `51 correcta(s) · 0 fallo(s)` |
| 2026-08-07 | Claude Code (directo) | `declared-direct` | todas | `node scripts/test-install.mjs` | 🟢 `137 correcta(s) · 0 fallo(s)` |
| 2026-08-07 | Claude Code (directo) | `declared-direct` | todas | `node scripts/skills-sync.mjs --check` | 🟢 manifiesto y política correctos |
| 2026-08-07 | Claude Code (directo) | `declared-direct` | T-006-11 | `node scripts/scan-secrets.mjs` | 🟢 `sin hallazgos en 312 fichero(s) versionado(s)` |
| 2026-08-07 | Claude Code (directo) | `declared-direct` | T-006-04 | instalación limpia desde tarball + 5 superficies de IDE | 🟢 20 agentes y 25 skills en todas |
| 2026-08-07 | Claude Code (directo) | `declared-direct` | T-006-01 | `node scripts/check-sdd.mjs` + revisión del texto de `TEST-STRATEGY.md` §0/§8 y de la DoD | 🟢 estructura válida; §8 sin umbral global, con tiers y defecto estricto; DoD coherente con §8 |
| 2026-08-07 | Claude Code (directo) | `declared-direct` | T-006-02 | revisión de `docs/quality/METRICS.md` contra los criterios de la spec | 🟢 tres niveles, umbral binario con acción por métrica, máximo cinco vivas, lista de no reportadas |
| 2026-08-07 | Claude Code (directo) | `declared-direct` | T-006-05 | revisión de `docs/design/USABILITY-CHECKLIST.md` y enlace desde `ux-designer` y `/front` | 🟢 diez heurísticas con fallo típico, formularios, mensajes de error, microcopy, velocidad percibida |
| 2026-08-07 | Claude Code (directo) | `declared-direct` | T-006-06 | plantilla creada y referenciada desde `/sdd-ship` y `release-manager` | 🟢 existe, ≤300 palabras, con la regla de cifras verificadas |
| 2026-08-07 | Claude Code (directo) | `declared-direct` | T-006-07 | `node scripts/check-sdd.mjs` + `node scripts/test-hooks.mjs` tras enriquecer 12 perfiles y 10 skills | 🟢 estructura válida · 51/51 guardas · `implementer` con las dos filas nuevas |

> **Nota sobre las cinco filas anteriores.** Son tareas documentales: su verificación es
> estructural (`check-sdd`) más revisión humana del texto, no una salida de test. Se registran
> igual porque una tarea `hecho` sin evidencia no es una tarea hecha, y porque el gate
> `tarea/evidencia` las rechazó hasta escribirlas — que es exactamente para lo que existe.

**Verificación**: todas las filas son `declared-direct`. **No hubo delegación a subagentes**: el
trabajo lo hizo el agente activo. Las dos únicas entradas de `execution-log.jsonl` de esta sesión
son `unverified`, con motivo registrado por el hook —*"el host no expuso el nombre del subagente
en el payload"*— y pertenecen a la spec 001, no a esta.

## 2. Trazabilidad requisito → verificación

La tabla completa RF → CA → tarea → evidencia está en [`tasks.md`](./tasks.md). Los 18 RF y los
8 CA tienen tarea y verificación asignadas.

- [x] Todo `CA` de la spec aparece en la cadena
- [x] Cada comprobación citada se ha ejecutado y su salida está arriba
- [x] Ningún RF, CA o tarea referenciado es huérfano

### Gates humanos verificados

| Gate | Estado | Persona | Fecha | Alcance |
|---|---|---|---|---|
| Producto | `legacy-pending` | — | — | Capacidad interna; no hay PRD nuevo |
| Spec | `approved` | usuario | 2026-08-07 | [`spec.md`](./spec.md) |
| Diseño | `skipped-no-ui` | — | — | Sin interfaz |
| Plan técnico | `approved` | usuario | 2026-08-07 | Aprobado como plan de trabajo antes de implementar |
| Entrega | `pending` | | | §5 |

## 3. Controles NO ejecutados

> La sección más importante y la que todo el mundo omite. Un control que no se corrió
> no es un control aprobado: es un riesgo sin dueño.

| Control | Por qué no se ejecutó | Riesgo abierto | Propietario | Próximo paso |
|---|---|---|---|---|
| **Importar una skill en Lovable** | No tengo acceso a un workspace de Lovable | **Puede invalidar la parte de distribución**: si su importador rechaza el directorio oculto `.agents/`, las 25 URLs no sirven | usuario | Importar **una** skill antes que las 25. Alternativas: `.zip` o espejo sin punto |
| **Disparo automático de skill por descripción** | Ídem | Las descripciones actuales podrían no activar la skill sola, dejando solo `/nombre` | usuario | Pedir algo que encaje con la descripción de `tdd` y observar |
| **Cobertura por tier sobre este repositorio** | No hay herramienta de cobertura instalada: sus tests son scripts deterministas | Los tiers de `plan.md` §8.1 están declarados pero no impuestos por máquina **aquí** | mantenedor | Vale para los proyectos que instalan la plantilla, que es su destino |
| **Mutation testing** | Sin herramienta configurada, mismo motivo | No sabemos si los 137 checks de `test-install` detectan defectos inyectados más allá de los que probé en rojo | mantenedor | Evaluar Stryker si el repositorio incorpora suite unitaria |
| **Job de CI ejecutado en GitHub** | Los workflows se verificaron localmente ejecutando sus comandos, no en un runner | Un error de sintaxis YAML o de permisos no se detectaría hasta el primer PR | usuario | Observar el primer PR que dispare `sdd-gates.yml` |
| **Auditoría de dependencias real** | Este repositorio **no tiene lockfile**, y el job lo salta a propósito | Ninguno aquí: no hay dependencias de runtime | mantenedor | Se activará en proyectos con lockfile |
| **Smoke de los git hooks en Windows nativo** | Probado en Git Bash | `pre-commit` es shell POSIX; en un Windows sin shell compatible no correría | mantenedor | Documentado: son opt-in y CI es quien bloquea |

### Desviaciones de proceso, declaradas

| Desviación | Impacto |
|---|---|
| `plan.md` y `tasks.md` se escribieron **al cerrar**, no antes | El backlog no guio el troceo. Es reconstrucción fiel, no planificación |
| No hubo ciclo rojo-verde por tarea de producto | El trabajo fue documental y de herramienta. **Sí** hubo rojo-verde en los cinco gates nuevos, que es donde había comportamiento verificable |
| Sin delegación a subagentes | Todo `declared-direct`. En un host con hooks, lo esperable sería `observed` |

## 4. Convergencia

- [x] La spec refleja el comportamiento realmente construido
- [x] El código y los documentos satisfacen los criterios de aceptación
- [x] Las comprobaciones relevantes pasan; ninguna intermitente ignorada
- [x] Seguridad y privacidad revisadas — ver informe
- [x] Documentación, bitácora y CHANGELOG actualizados
- [x] No quedan discrepancias abiertas
- [ ] **Las delegaciones no se observaron por hooks**: no las hubo, y está documentado arriba
- [x] Los riesgos abiertos tienen propietario y próximo paso

## 5. Decisión de entrega

| Campo | Valor |
|---|---|
| **Estado** | `NO-GO` |
| **Razón** | Pendiente de decisión humana. El riesgo residual está acotado y declarado en §3; el que puede obligar a rehacer trabajo es el importador de Lovable, que solo el usuario puede probar |
| **Aprobado por** | |
| **Fecha** | |

> Arranca en `NO-GO`. Se cambia a `GO` cuando todas las casillas de §4 están marcadas
> **y** una persona lo aprueba. El valor por defecto no es "listo".
