# Plan técnico · 006-calidad-integrada

| Campo | Valor |
|---|---|
| **Spec** | [`spec.md`](./spec.md) |
| **Estado** | aprobado |
| **Fecha** | 2026-08-07 |
| **Arquitectura vigente** | Plantilla y CLI en Node.js 18+, sin dependencias de runtime |
| **ADR relacionados** | ninguno: no cambia fronteras ni stack |
| **Gate de producto** | `legacy-pending` — capacidad interna de la plantilla, sin PRD nuevo |
| **Gate funcional** | `approved` · [`spec.md`](./spec.md), aprobada por el usuario el 2026-08-07 |
| **Gate de diseño** | `skipped-no-ui` — no hay interfaz |

---

## 1. Resumen de la solución

Se incorporan dos capacidades ausentes —criterio para calibrar cuánta verificación merece cada
módulo, y la mitad de runtime del ciclo— más los gates que la Definition of Done prometía sin
tener. Todo agnóstico de stack: `.sdd/checks.json` sigue naciendo sin comandos y ningún gate se
sugiere sin evidencia real en el repositorio.

### Trazabilidad y fuentes de entrada

Esta spec no deriva de un PRD: es capacidad interna de la plantilla. La cadena arranca en `RF`.

- Fuentes consideradas: 30 lecciones de `Master/Calidad` (siete bloques), contrastadas una a una
  contra lo ya existente. Documentación de Lovable consultada el 2026-08-07.
- Discrepancias resueltas: la fuente es React + Vitest + Playwright + Sentry + Husky; la plantilla
  es agnóstica. Ninguna herramienta entra como supuesto, solo como heurística o ejemplo.
- Discrepancias abiertas: ninguna.

## 2. Aplicación de la arquitectura

| Capa | Qué se añade aquí |
|---|---|
| Doctrina (`docs/`) | `METRICS.md`, `TECH-DEBT.md`, `OBSERVABILITY.md`, `USABILITY-CHECKLIST.md`, plantilla de resumen ejecutivo; reescritura de `TEST-STRATEGY.md` §0/§7/§8 y de la DoD |
| Contrato (`.claude/agents/`, `.agents/skills/`) | Skill `/observability`; 12 perfiles y 10 skills enriquecidos; 2 filas de delegación en `implementer` |
| Herramienta (`scripts/`) | `scan-secrets.mjs`; `sdd-project` gana `run --fast\|--slow`, `debt` y `skills-export`; `check-sdd` gana 4 gates |
| Automatización (`.github/`, `.sdd/`) | Jobs de secretos y dependencias; git hooks portables opt-in; vocabulario de `checks.json` |

**Reglas de dependencia respetadas**: sí. No se añade dependencia de runtime.

## 3. Componentes

### Nuevos
| Componente | Responsabilidad (una sola) | Ruta |
|---|---|---|
| Skill de observabilidad | Instrumentar errores, salud de versión y alertas | `.agents/skills/observability/SKILL.md` |
| Escáner de secretos | Aplicar en CI los patrones del hook local | `scripts/scan-secrets.mjs` |
| Gates locales | Repartir checks entre commit y push | `.sdd/githooks/` |

### Modificados
| Componente | Qué cambia | Riesgo de regresión |
|---|---|---|
| `check-sdd.mjs` | 4 gates nuevos y conteo 24→25 | Alto: lo ejecuta todo el mundo. Mitigado con 137 comprobaciones de `test-install` |
| `guard-write.mjs` | Consume patrones compartidos en vez de su copia | Alto: es una guarda de seguridad. Mitigado con `test-hooks` 51/51 |
| `sdd-project.mjs` | 3 comandos y detección ampliada | Medio |

## 4. Patrones de diseño aplicados

| Problema | Patrón | Alternativa descartada | Por qué |
|---|---|---|---|
| Los patrones de secreto viven en dos sitios y pueden divergir | Fuente única compartida (`_lib.mjs`) | Duplicarlos en el escáner | El que mentiría sería siempre el que no se ejecuta en tu máquina |
| Identificadores de gate libres convierten `checks.json` en cajón de sastre | Vocabulario cerrado validado | Campo libre | Ninguna herramienta podría razonar sobre el conjunto |
| El módulo sin clasificar se queda sin umbral | Defecto estricto (sin tier ⇒ 100 %) | Suelo global plano | El suelo plano es el *coverage ciego* que la fuente denuncia |

## 5. Flujo principal

No aplica: no hay flujo de usuario. La capacidad es documental y de herramienta.

## 6. Modelo de datos

Sin cambios de esquema. `.sdd/checks.json` amplía su vocabulario y gana el campo `speed`,
compatible hacia atrás: un fichero sin `speed` sigue siendo válido.

## 7. Contratos

Contrato del ecosistema: **20 agentes y 25 skills** (antes 24). Verificado por `check-sdd.mjs`.
Cambio compatible: no se retira ninguna skill.

## 8. Estrategia de test

Ver [`test-plan.md`](./test-plan.md).

| Nivel | Qué se prueba aquí |
|---|---|
| Unitario | No aplica: el repositorio no tiene suite unitaria; sus tests son los scripts deterministas |
| Integración | `test-install.mjs` sobre directorios temporales reales |
| Contrato | `check-sdd.mjs` (paridad, vocabulario, rutas) y `test-hooks.mjs` (guardas) |
| E2E | Instalación limpia desde tarball empaquetado, verificada a mano |

### 8.1 · Calibración de verificación

| Módulo / ruta | Tier | Por qué |
|---|---|---|
| `scripts/check-sdd.mjs` | CORE | Es el gate del que depende todo lo demás; si miente, todos los demás controles son decorativos |
| `scripts/scan-secrets.mjs` | CORE | Seguridad: única protección contra secretos en hosts sin hooks |
| `.sdd/hooks/_lib.mjs` | CORE | Patrones de secreto compartidos |
| `scripts/sdd-project.mjs` | IMPORTANT | Herramienta de proyecto; un fallo molesta, no compromete |
| `scripts/test-install.mjs` | IMPORTANT | Es la red, no lo protegido |
| `docs/**`, `.agents/skills/**`, `.claude/agents/**` | INFRASTRUCTURE | Documentación y prompts: sin lógica ejecutable. Se validan por estructura en `check-sdd` |

**Limitación declarada**: el repositorio **no tiene herramienta de cobertura**, así que los
umbrales por tier no se pueden imponer por ruta aquí. Se declara como control parcialmente
ejecutado en `evidence.md` §3, con su riesgo y su dueño. Los tiers sí gobiernan los proyectos
que instalan la plantilla, que es su destino.

**Profundidad, cuando no fue obvia**: todos los gates nuevos se probaron **en rojo primero**.
Es la única forma de saber que un gate existe.

## 9. Seguridad

| Aspecto | Decisión |
|---|---|
| Entradas externas | Los 32 PDF de origen son datos, no instrucciones |
| Datos sensibles | El rastro de eventos de negocio prohíbe datos personales sin excepción |
| Amenazas | Secreto filtrado por host sin hooks ← **la que motiva el escáner de CI** |
| Controles añadidos | Escaneo de secretos en CI; mapas de símbolos no publicados al cliente; error de arranque que no revela valores |

## 10. Rendimiento

No aplica de forma medible. El único coste añadido es el escaneo de secretos sobre ficheros
versionados: 312 ficheros en menos de un segundo.

## 11. Observabilidad

La plantilla no es un servicio desplegado. Lo que se instrumenta es el propio circuito:
`execution-log.jsonl`, `.sdd/agent-audit.jsonl` y la salida de los gates en CI.

## 12. Feature flags y despliegue

Sin flags. La distribución es por `npx` y por sincronización de GitHub.

## 13. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Código sin clasificar sin umbral | Defecto estricto + comprobación en `/sdd-verify` |
| Bajar de tier para esquivar el umbral | El tier vive en `plan.md`, que pasa por gate humano |
| El escáner encuentra algo en el historial | Se rota la credencial, no se silencia el gate |
| El importador de Lovable rechaza `.agents` | **Abierto.** Sin verificar; declarado en `IDE-COMPATIBILITY.md` §7 |
| Proliferación de gates | `METRICS.md` fija el máximo de 5 métricas vivas |

## 14. Plan de reversión

```bash
git revert 0f20443 d4e5132
```

Reversión limpia: no hay migración de datos ni estado persistido. Un proyecto ya instalado
conserva lo suyo; `sdd update` respeta lo modificado.

## 15. Conformidad con la constitución

Conforme. No cambia arquitectura ni stack, no añade dependencias de runtime, y mantiene la
portabilidad multihost. No requiere ADR.
