# 017 · Circuito proporcional y reducción de contexto

| Campo | Valor |
|---|---|
| **ID** | `017-circuito-proporcional-contexto` |
| **Estado** | aprobada |
| **Autor** | Usuario y Codex |
| **Fecha** | 2026-08-22 |
| **Rama** | `feature/mejoras_codex` |
| **Depende de** | `011-automatizacion-determinista-tokens`, `015-circuito-ligero-verificable` |
| **Baseline de producto** | `approved` |
| **Corte de producto** | `FEAT-004` |
| **Impacto de seguridad** | `sensible` |
| **Impacto de usabilidad** | `sin-ui · modifica CLI, contratos y documentación, no una interfaz de aplicación` |
| **Impacto de documentación** | `aplicable · DOC-CIRCUITO, DOC-GATES, DOC-TFM, DOC-PAGES` |

## 0. Origen y trazabilidad

| Objetivo | Requisito de producto | Caso de uso | Requisito de spec | Criterio de aceptación |
|---|---|---|---|---|
| OBJ-004 | PRD-RF-007 | UC-005 | RF-01 | CA-01 |
| OBJ-002 | PRD-RF-003 | UC-002 | RF-04 | CA-02 |
| OBJ-004 | PRD-RF-008 | UC-005 | RF-02 | CA-03 |
| OBJ-004 | PRD-RF-008 | UC-005 | RF-03 | CA-04 |
| OBJ-004 | PRD-RF-008 | UC-005 | RF-05 | CA-05 |
| OBJ-002 | PRD-RF-004 | UC-004 | RF-05 | CA-05 |

No hay discrepancias abiertas ni marcadores de clarificación.

## 1. Problema

El circuito cobra el mismo expediente y contexto para una errata, un componente acotado y un
cambio de autorización. En instalaciones reales el modo ligero nace inaccesible, la política se
relee completa por fase y las suites vuelcan salidas extensas en cada ciclo. El resultado agota
cuota de agentes antes de terminar cambios pequeños e incentiva saltarse los controles.

## 2. Objetivo y métricas

Hacer proporcionales el expediente, el contexto y la evidencia sin reducir TDD, gates,
trazabilidad, bitácora ni aprobación humana.

- `compact`: reducción mediana del proxy de contexto de al menos 70 % y como máximo tres
  intervenciones de agente.
- `full`: reducción mediana de al menos 20 %.
- Clasificación y expectativas funcionales: 100 % en los escenarios de benchmark.
- Cero concesiones `light` o `compact` antes de aprobar una frontera auditable.

## 3. Usuarios

| Perfil | Necesidad | Contexto |
|---|---|---|
| Persona desarrolladora | completar cambios pequeños sin agotar cuota | Copilot, Cursor y demás hosts instalados |
| Persona revisora | comprobar que el atajo era legítimo | commits, gates y CI |
| Mantenedor de plantilla | distribuir el contrato sin abrir proyectos existentes | instalación y actualización |

## 4. Requisitos funcionales

| ID | Requisito EARS | Prioridad | Esfuerzo |
|---|---|---:|---:|
| RF-01 | El sistema DEBE clasificar rutas previstas y reales como `light`, `compact` o `full`, con fallo cerrado y aprobación humana verificable. | M | 8 |
| RF-02 | CUANDO una fase solicite contexto, el sistema DEBE entregar solo la política, tarea, criterios y controles aplicables, conservando siempre las reglas de seguridad universales. | S | 5 |
| RF-03 | CUANDO se ejecuten gates, el sistema DEBE emitir una evidencia resumida y sanitizada sin persistir salida cruda. | S | 3 |
| RF-04 | CUANDO se use un nivel reducido, el sistema DEBE auditar diff, configuración histórica, trailers, autoría, territorio y límites antes de permitir la entrega. | M | 3 |
| RF-05 | El sistema DEBE mantener sincronizados la documentación operativa, la Memoria TFM y Pages, y medir el ahorro con un proxy declarado. | C | 3 |

### Reparto MoSCoW

| Prioridad | Esfuerzo | Porcentaje |
|---|---:|---:|
| Must | 11 | 50 % |
| Should | 8 | 36 % |
| Could | 3 | 14 % |
| Total | 22 | 100 % |

**Won't have this time**: desplegar Pages, migrar RRSS, fusionar a `main`, publicar una release o
medir la cuota real no expuesta por Copilot/Cursor.

## 5. Requisitos no funcionales

| Categoría | Valor objetivo |
|---|---|
| Portabilidad | Node.js 18+, Windows y Linux, cero dependencias runtime |
| Seguridad | ASVS 5.0.0 L2 y OWASP Top 10:2025; denegación por defecto |
| Privacidad | cero secretos, credenciales, PII o cuerpos completos en logs/evidencia |
| Rendimiento | clasificación y recorte deterministas sin red ni servicios externos |
| Observabilidad | resumen con ejecución, duración, estado, conteos y hash |
| Coste | proxy auditable; nunca presentarlo como cuota real del proveedor |
| Retención | estado local resumido y acotado; ningún log crudo versionado |

La spec es sensible porque modifica agentes, skills, gates, CI y la frontera que permite omitir
el expediente completo. No introduce autenticación, PII, pagos ni integraciones externas.

## 6. Criterios de aceptación

### CA-01 · Clasificación proporcional segura (RF-01)
```gherkin
Escenario: clasificar antes de editar
  Dada una frontera pendiente o inválida
  Cuando se clasifican rutas previstas
  Entonces el resultado es full
  Y solo una frontera aprobada puede conceder light o compact
```

### CA-02 · Activación atómica y auditable (RF-01, RF-04)
```gherkin
Escenario: impedir un atajo no corroborado
  Dado un commit posterior a la activación
  Cuando faltan trailers, cambia la intención o el diff supera el alcance aprobado
  Entonces la auditoría bloquea la entrega y nombra la causa
```

### CA-03 · Contexto mínimo con invariantes (RF-02)
```gherkin
Escenario: cargar una fase
  Dada una fase, spec y tarea válidas
  Cuando se solicita su contexto
  Entonces solo se devuelve el bloque aplicable
  Y siempre incluye regla cero, gates, prohibiciones y seguridad universal
```

### CA-04 · Evidencia sanitizada (RF-03)
```gherkin
Escenario: resumir una ejecución
  Dada una salida extensa o sensible
  Cuando termina un gate
  Entonces el resumen está acotado y redactado
  Y no se persiste la salida cruda
```

### CA-05 · Documentación y medida coherentes (RF-05)
```gherkin
Escenario: preparar la entrega
  Dado el contrato implementado
  Cuando se comprueba la documentación y el benchmark
  Entonces el modelo operativo, hosts, Memoria y Pages describen el mismo comportamiento
  Y los porcentajes se publican únicamente si alcanzan los umbrales
```

## 7. Casos límite e invariantes

- Ruta vacía, absoluta, con `..`, controles, glob o caja/Unicode colisionante: `full` o error.
- Solapamiento permitido/prohibido: prevalece la prohibición.
- Código ejecutable declarado como ligero: suelo `compact`.
- Ruta sensible, desconocida o de varios módulos: `full`.
- Hash de propuesta obsoleto, legado o configuración ambigua: no activa ningún atajo.
- `--behavior changed` y el diff real solo elevan el nivel.
- Un `Change-Group` agregado que exceda límites escala a `full`.

## 8. Fuera de alcance y riesgos

- No se toca `RRSS`, no se despliega Pages y no se hace push, merge, tag ni publicación.
- No se añaden dependencias ni agentes.
- Riesgos principales: clasificación permisiva, legitimación retroactiva, fuga en evidencia,
  incompatibilidad de actualización y deriva multihost. Todos enlazan controles SEC explícitos.

## 9. Supuestos y glosario

- El usuario prioriza esta spec sobre 010 y 016 sin modificar ni cerrar esas specs.
- La Memoria TFM actualmente no rastreada entra expresamente en el alcance; los demás ficheros
  no rastreados se preservan.
- `light` significa sin comportamiento ejecutable; `compact`, comportamiento acotado; `full`,
  expediente completo.

## 10. Gate humano

| Campo | Valor |
|---|---|
| Estado | `approved` |
| Aprobado por | usuario |
| Fecha | 2026-08-22 |
| Alcance | plan completo solicitado para implementación en `feature/mejoras_codex` |
| Condiciones | mínima documentación; Memoria TFM y Pages incluidas; nada en `main` |

### HANDOFF
- Agente origen: spec-analyst
- Fase completada: specify y clarify sin marcadores
- Artefacto: `docs/specs/017-circuito-proporcional-contexto/spec.md`
- Cobertura: FEAT-004 · OBJ-002, OBJ-004 · PRD-RF-003, PRD-RF-004, PRD-RF-007, PRD-RF-008 · UC-002, UC-004, UC-005
- Impactos: seguridad sensible · sin-ui · documentación aplicable
- Reparto: must 50 % · should 36 % · could 14 %
- Siguiente agente sugerido: planner — `/sdd-plan`
