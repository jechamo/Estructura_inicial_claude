---
name: sdd-plan
description: Convierte una spec aprobada en plan técnico, modelo de datos, contratos e investigación. Aquí se decide el CÓMO, conforme a la arquitectura vigente.
---

# /sdd-plan — Cómo

Agente responsable: `@planner`, con consulta a los especialistas.

## Paso 0 — Puerta de entrada

- `spec.md` en estado `aprobada` y **sin marcadores**. Si no, → `/sdd-clarify`.
- La spec conserva la trazabilidad `OBJ → PRD-RF → UC → RF → CA`; en brownfield
  `legacy-pending`, registra el aviso y los huecos sin inventar IDs.
- Si la funcionalidad tiene interfaz: `design.md` existe y **sin marcadores**. Si no,
  → `/sdd-design`. Planificar antes de saber cuántas pantallas hay es planificar dos veces.
- Lee `docs/architecture/constitution.md` y los ADR vigentes.
- Las prioridades MoSCoW de la spec **ordenan el plan**: lo *must* va primero y completo. No se
  empieza un *could* con un *must* a medias.
- Lee `Impacto de seguridad`: `sensible | no-sensible | security-pending`. Si falta o una spec
  sensible nueva intenta usar `security-pending`, devuelve a `/sdd-specify`; no normalices el
  hueco desde el plan.
- Lee `Impacto de usabilidad`: `aplicable | sin-ui · motivo | ux-pending`. Si falta, o una spec
  nueva con interfaz intenta usar `ux-pending`, o el `sin-ui` no trae motivo material, devuelve a
  `/sdd-specify`; no normalices el hueco desde el plan.
- Lee `Impacto de documentación`: `aplicable · DOC-* | no-aplica · motivo | docs-pending`.
  Si aplica, cruza cada `DOC-ID` con `.sdd/docs.json` y añade fuente, artefacto, generación,
  propietario, tarea, gate/comprobación y evidencia. Una spec nueva no aprueba `docs-pending`.

## Paso 1 — Investigación (`research.md`)

Por cada decisión técnica no trivial. Usa el MCP `context7` o búsqueda web para
documentación **actual**: no confíes en tu memoria para versiones y APIs.

```markdown
## D-01: <decisión>
- Opciones: <A / B / C>
- Criterios: <encaje, madurez, coste, equipo, salida>
- **Elegida**: <cuál> porque <motivo>
- Descartadas: <por qué no>
- Coste asumido: <complejidad, dependencia, lock-in>
```

Incluye siempre la opción "no añadir nada / hacerlo a mano".

## Paso 2 — Consulta a especialistas

Delega en paralelo cuando sean áreas independientes y **recupera el control**:

| Área | Agente |
|---|---|
| Modelo de datos, migraciones, índices | `@database-expert` |
| Contratos de API y eventos | `@api-designer` |
| Componentes, estado, accesibilidad | `@frontend-expert` |
| Dominio, casos de uso, integraciones | `@backend-expert` |
| Flujos, pantallas, estados | `@ux-designer` |
| Superficie de ataque y controles | `@security-auditor` |
| Estrategia de test | `@test-engineer` |
| Despliegue y observabilidad | `@devops-expert` |

Para una spec `sensible`, delega `security-scan plan` en `@security-auditor`. Es de solo lectura:
debe devolver HANDOFF y control al `planner`. Si hace falta persistir su informe, `planner` delega
en `@docs-writer` la materialización literal; el auditor nunca escribe ni encadena especialistas.

Integra sus respuestas. **Tú decides**; ellos asesoran.

## Paso 3 — Artefactos

### `data-model.md`
Entidades, atributos, tipos, invariantes, relaciones, índices, estrategia de migración,
impacto en datos existentes, retención y borrado. Diagrama ER en mermaid.

### `contracts/`
OpenAPI / GraphQL / AsyncAPI / tipos compartidos. **Contract-first**: se escribe antes que
el código y de él salen los tipos generados y los tests de contrato.

### `test-plan.md`
Qué se prueba en cada nivel, casos límite de la spec mapeados a tests, datos de prueba,
qué se automatiza en CI, criterio de "suficiente".

### `plan.md`
```
1. Resumen de la solución (5 líneas)
2. Aplicación de la arquitectura: qué va en cada capa y módulo
3. Componentes nuevos y modificados, con rutas de fichero previstas
4. Patrones de diseño aplicados — problema → patrón → alternativa descartada
5. Flujo principal (diagrama de secuencia en mermaid)
6. Modelo de datos y migraciones
7. Contratos y versionado
8. Estrategia de test **y calibración de verificación**: tier de cobertura por módulo
   (CORE 100 % · IMPORTANT 80 % · INFRASTRUCTURE excluido). Lo que no clasifiques se exigirá
   al 100 %; bajarlo de tier se justifica **aquí**. Cuando la profundidad no sea obvia, resuélvela
   con las cuatro preguntas de `TEST-STRATEGY.md` §0 y anota la respuesta
9. Seguridad: impacto, nivel ASVS, amenazas y matriz
   `control → decisión/justificación → tarea → test → evidencia`
9 bis. Usabilidad: impacto, umbrales de velocidad percibida, dónde se usa actualización optimista
   y dónde **no**, y matriz `UX-<AREA>-NNN → decisión → tarea → test → evidencia` con áreas
   `A11Y`, `FORM`, `COPY` y `PERF`. Consulta a `@ux-designer` y `@frontend-expert` antes de
   decidir el cómo; el marco es WCAG 2.2 AA más las diez heurísticas
10. Rendimiento: objetivos, presupuesto declarado, consultas críticas, caché
11. Observabilidad: logs, métricas, trazas, **clasificación de errores, salud por versión y
    alertas con umbral y playbook**
12. Feature flags y plan de despliegue
13. Riesgos y mitigaciones
14. Plan de reversión
15. Conformidad con la constitución
```

## Paso 4 — Análisis de coherencia (antes de la puerta de salida)

Los artefactos se han escrito en momentos distintos y por manos distintas. **Contrástalos
entre sí antes de dar el plan por bueno**: un hueco detectado aquí cuesta una edición; el
mismo hueco detectado en implementación cuesta rehacer el trabajo.

Recorre esta matriz y anota cada discrepancia:

| Contraste | Qué buscas |
|---|---|
| `spec.md` ↔ `plan.md` | Todo `RF` tiene componente que lo cubre. Ningún componente sin `RF` detrás |
| `spec.md` ↔ `test-plan.md` | Todo `CA` tiene un test previsto. Ningún test sin `CA` |
| `spec.md` ↔ `data-model.md` | Toda entidad sale de un requisito. Ningún campo huérfano |
| `plan.md` ↔ `contracts/` | Toda operación del contrato aparece en el plan, y al revés |
| `data-model.md` ↔ `contracts/` | Los tipos coinciden. Nada opcional en uno y obligatorio en el otro |
| `spec.md` ↔ RNF | Cada requisito no funcional tiene una decisión técnica que lo sostiene |
| Casos límite ↔ `test-plan.md` | Cada caso límite de la spec tiene test o justificación de por qué no |
| `research.md` ↔ dependencias | Toda dependencia nueva del plan está justificada |
| Todo ↔ "fuera de alcance" | Nada del plan implementa algo declarado fuera de alcance |
| Producto ↔ spec ↔ plan | La cadena `OBJ → PRD-RF → UC → RF → CA` llega a componentes y tests |
| Seguridad ↔ plan ↔ test | Cada control aplicable llega a tarea, caso de abuso y evidencia; cada `no aplica` tiene motivo material |
| Usabilidad ↔ diseño ↔ test | Cada `UX-*` aplicable llega a tarea, caso hostil y evidencia; las tablas §6 y §6 bis de `design.md` no conservan marcadores |

**Corrige los huecos antes de trocear.** Si un hueco revela que la spec era incompleta,
vuelve a `spec-analyst`: no lo rellenes tú desde el plan, porque entonces habrás decidido
requisitos disfrazados de decisiones técnicas.

Deja constancia del resultado en `plan.md` §15.

## Paso 5 — Puerta de salida

Checklist de conformidad:
- [ ] Respeta las reglas de dependencia de la constitución
- [ ] No introduce una arquitectura distinta sin ADR
- [ ] Cada `RF` de la spec tiene componente(s) que lo cubren
- [ ] Cada `CA` tiene un test previsto
- [ ] Cada patrón aplicado tiene un problema real detrás (no decoración)
- [ ] Nada implementado que la spec no pida (YAGNI)
- [ ] Toda dependencia nueva justificada en `research.md`
- [ ] Todo `DOC-ID` aplicable tiene fuente, artefacto, propietario, tarea, comprobación y evidencia
- [ ] La cobertura total desde `OBJ-*` hasta cada test previsto está visible, o los huecos
      `legacy-pending` están advertidos
- [ ] `Impacto de seguridad` está clasificado; si es `sensible`, la tabla usa exactamente
      `Control | ASVS | OWASP | Aplica | Decisión / justificación | Tarea | Test | Evidencia`
- [ ] Cada control aplicable tiene cadena completa y cada `no aplica` tiene motivo material
- [ ] Si aplica JWT/cookie/bearer, las decisiones siguen `docs/security/AUTH-TOKENS.md`; JWT no se
      adopta por defecto ni se fija una librería universal
- [ ] `Impacto de usabilidad` está clasificado; si es `aplicable`, la tabla usa exactamente
      `Control | WCAG 2.2 | Heurística | Aplica | Decisión / justificación | Tarea | Test | Evidencia`
- [ ] Los umbrales de velocidad percibida están fijados si `PERF` aplica, y toda actualización
      optimista declara su reversión escrita — nunca en pagos, altas, contraseñas ni borrados
- [ ] El gate `a11y` está previsto, o su ausencia queda declarada como control no ejecutado

**Si el plan viola la constitución → para y llama a `@architect`.** O se ajusta el plan, o
se escribe el ADR que cambia la regla. Nunca se viola en silencio.

## Paso 6 — Gate humano del plan

Presenta al usuario el enfoque, componentes afectados, decisiones no triviales, dependencias,
migraciones, riesgos, coste relativo y reversión. Pide `aprobado`, `rechazado` o cambios y **pausa**.

Registra en `plan.md` el estado, fecha, actor y alcance de la aprobación. No marques el plan como
aprobado, no generes `tasks.md` y no delegues implementación hasta recibir confirmación humana
explícita. Una recomendación técnica del `planner` no sustituye este gate.

## Cierre

```
### HANDOFF
- Agente origen: planner
- Fase completada: plan
- Artefactos: plan.md, research.md, data-model.md, contracts/, test-plan.md
- Patrones aplicados: <lista>
- Dependencias nuevas: <lista o "ninguna">
- Conformidad: OK | requiere ADR-XXXX
- Cobertura: <OBJ-* → PRD-RF-* → UC-* → RF-* → CA-* → test previsto>
- Seguridad: <sensible/no-sensible/security-pending> · <SEC-* y huecos>
- Usabilidad: <aplicable/sin-ui · motivo/ux-pending> · <UX-* y huecos>
- Gate humano del plan: approved · <actor · fecha · alcance>
- Siguiente agente sugerido: planner — comando: /sdd-tasks
```
