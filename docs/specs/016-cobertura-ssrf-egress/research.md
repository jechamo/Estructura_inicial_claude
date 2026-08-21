# Investigación · 016-cobertura-ssrf-egress

Decisiones técnicas evaluadas antes de escribir el plan. Las fuentes web enlazadas se
consultaron el 2026-08-21; las decisiones arquitectónicas se contrastaron además con la
constitución y el ADR-0001 aprobados.

---

## D-01 · Dónde vive el contrato SSRF/egress

**Contexto**: el perfil `security-auditor` ya nombra SSRF, pero la skill portable y la checklist
instalada no ofrecen el mismo corte explícito. La solución debe llegar a los seis hosts sin crear
un agente, una skill o un comando.

**Criterios**: fuente única · paridad entre hosts · instalación conservadora · ausencia de
dependencias · coste de mantenimiento · compatibilidad brownfield.

| Opción | Pros | Contras | Coste | Veredicto |
|---|---|---|---|---|
| A · Actualizar solo `security-auditor` | Refuerza el perfil especializado | Cinco hosts consumen la skill portable y la deriva continúa | Bajo inicial, alto de riesgo | descartada |
| B · Actualizar `.agents/skills/security-scan/SKILL.md` y `docs/security/SECURITY-CHECKLIST.md` | Un procedimiento portable y una referencia exhaustiva; ambos ya se distribuyen | Obliga a probar coherencia entre dos textos | Bajo | **elegida** |
| C · No añadir nada | Cero cambio | Mantiene el falso verde que origina la spec | Cero inmediato, alto de riesgo | descartada |

**Elegida**: B. El perfil de agente no cambia: ya cubre SSRF y seguirá remitiendo al procedimiento
y a la checklist. El adaptador Claude permanece mínimo y enlaza la fuente canónica; el resto de
hosts descubre directamente `.agents/skills`.

**Criterio que desempató**: la portabilidad procede de una única skill canónica, no de copiar el
mismo texto a seis formatos.

**Coste asumido**: dos documentos normativos y una prueba de coherencia/instalación.

**Condición para revisar**: un host soportado deja de descubrir `.agents/skills` o necesita un
formato ejecutable distinto; ese cambio requerirá una spec de compatibilidad, no una copia manual.

**Fuentes**:

- [OWASP SSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html) — consultada 2026-08-21.
- [OWASP ASVS 5.0.0](https://github.com/OWASP/ASVS/tree/v5.0.0_release/5.0) — consultada 2026-08-21.

## D-02 · Forma del control: allowlist y destino efectivo por salto

**Contexto**: validar únicamente la URL aparente no cubre protocolos alternativos, resoluciones
A/AAAA, DNS pinning/rebinding, redirecciones ni representaciones equivalentes de una IP.

**Criterios**: denegación por defecto · resultado verificable · neutralidad de stack · resistencia
a bypass · correspondencia con RF-01 a RF-05 y RF-12.

| Opción | Pros | Contras | Coste | Veredicto |
|---|---|---|---|---|
| A · Allowlist de URL textual una sola vez | Simple | No representa el destino efectivo ni cada salto | Bajo | descartada |
| B · Decidir protocolo/destino solicitado y revalidar cada destino efectivo | Cubre resolución y redirección; permite política contextual | Exige más casos de abuso y evidencia | Medio | **elegida** |
| C · No añadir nada | Evita prescribir una implementación | No cumple RF-01 a RF-05/RF-12 | Cero | descartada |

**Elegida**: B como contrato de auditoría, sin imponer librería ni algoritmo de red. La revisión
exige: allowlist material de protocolo y destino; evaluación de todas las direcciones efectivas
IPv4/IPv6 antes de la conexión; revalidación de cada redirección; rechazo incondicional de
metadatos; y rechazo o excepción completa para otros destinos locales, privados o link-local.

**Criterio que desempató**: OWASP recomienda allowlists, comprobar A y AAAA y desactivar las
redirecciones automáticas; cuando se permiten, el requisito aprobado obliga a tratar cada salto
como una decisión nueva.

**Coste asumido**: una sección explícita en skill/checklist y casos negativos estáticos que
comprueben que ninguna parte desaparece.

**Condición para revisar**: ASVS u OWASP publican un requisito estable incompatible o el producto
incorpora un motor real de peticiones salientes; ese motor requeriría su propia spec y threat model.

**Fuentes**:

- [OWASP SSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html) — consultada 2026-08-21.
- [ASVS 5.0.0, V1.3.6](https://github.com/OWASP/ASVS/blob/v5.0.0_release/5.0/docs_en/OWASP_Application_Security_Verification_Standard_5.0.0_en.md#v13-sanitization) — consultada 2026-08-21.

## D-03 · Evidencia sin crear un esquema de informe incompatible

**Contexto**: RF-06 exige resultado verificable y RF-10/RF-11 permiten resumen y agrupación. El
informe `sdd-security-report:v1` ya tiene conteos, hallazgos y controles no ejecutados.

**Criterios**: compatibilidad hacia atrás · trazabilidad individual · minimización de datos ·
ausencia de un segundo formato · implementación proporcional.

| Opción | Pros | Contras | Coste | Veredicto |
|---|---|---|---|---|
| A · Crear `sdd-security-report:v2` | Datos SSRF estructurados por máquina | Amplía el contrato más allá de la necesidad y obliga a migrar parsers | Alto | descartada |
| B · Añadir tabla humana por escenario y conservar el JSON v1 | Compatible; cada escenario y evidencia siguen localizables; permite resumen | La tabla no es un API JSON nuevo | Bajo | **elegida** |
| C · No añadir nada | Sin cambios | Los controles podrían quedar como prosa no reconstruible | Cero | descartada |

**Elegida**: B. El HANDOFF humano incorpora, cuando SSRF/egress aplique, una tabla por escenario y
salto con estado `superado`, `fallido` o `no ejecutado`. El JSON v1 conserva sus campos actuales;
sus conteos y `controlsNotExecuted` siguen siendo el cierre máquina-legible. La agrupación de
hallazgos es opcional y conserva la lista de IDs de escenario.

**Criterio que desempató**: satisface la evidencia aprobada sin introducir un cambio rompedor ni
un formato paralelo.

**Coste asumido**: más detalle en informes aplicables y pruebas de presencia del contrato textual.

**Condición para revisar**: aparece un consumidor automático real de escenarios SSRF; entonces se
diseñará y versionará contract-first un esquema máquina independiente.

## D-04 · Verificación de portabilidad e instalación

**Contexto**: afirmar que seis entornos comparten contrato no basta. Debe comprobarse el artefacto
canónico, el adaptador Claude y una instalación limpia sin incrementar los catálogos.

**Criterios**: prueba observable · cero red · determinismo Windows/Linux · conservación de trabajo
brownfield · reutilización de la suite existente.

| Opción | Pros | Contras | Coste | Veredicto |
|---|---|---|---|---|
| A · Test estático solo sobre el repositorio fuente | Rápido | No detecta omisiones del paquete o instalador | Bajo | descartada |
| B · Contrato fuente + instalación real temporal + paridad existente | Prueba distribución y descubrimiento; reutiliza `test-install.mjs` | La suite E2E crece | Medio | **elegida** |
| C · No añadir nada | Cero mantenimiento | RF-09 queda sin evidencia nueva | Cero | descartada |

**Elegida**: B. Como `scripts/test-install.mjs` ya está en su trinquete 3831/3831, primero se
extraerá el bloque/harness de contratos de seguridad a
`scripts/test/install-security-contracts.mjs`, se demostrará la suite previa verde sin elevar
`maxLineas` y solo después se añadirán allí los RED de la 016. Los casos demuestran: contrato
completo y autosuficiente en la skill; checklist sincronizada; copia exacta de la skill canónica
en instalación limpia; adaptador Claude apuntando a ella; 20 agentes/27 skills sin capacidad
paralela; y preservación/reconciliación visible de checklist propia en brownfield.

**Criterio que desempató**: es el único nivel que ve el mismo resultado que recibe un proyecto
destino sin añadir infraestructura de test.

**Coste asumido**: extraer un módulo interno de test antes de añadir casos. El entrypoint
`test-install.mjs` se conserva y el umbral de olores no se eleva.

**Condición para revisar**: el módulo extraído alcanza su propio trinquete o la suite exige una
separación adicional por contrato; nunca se solventa elevando el límite del entrypoint.

## D-05 · Documentación viva

**Contexto**: `DOC-SKILLS` declara como artefacto
`docs/guides/COMO-TRABAJAR-CON-LOS-AGENTES.md`. La checklist es fuente normativa instalada, no el
artefacto de orientación para personas.

**Criterios**: fuente de verdad declarada · ausencia de documentación duplicada · gate verificable
· responsabilidad explícita.

| Opción | Pros | Contras | Coste | Veredicto |
|---|---|---|---|---|
| A · Actualizar solo skill/checklist | Contrato técnico completo | Deja `DOC-SKILLS` en deriva | Bajo | descartada |
| B · Actualizar también la guía declarada por `.sdd/docs.json` | Mantiene el contrato documental | Requiere revisión y test | Bajo | **elegida** |
| C · No añadir nada | Cero coste | Incumple el impacto documental aprobado | Cero | descartada |

**Elegida**: B, con la skill como fuente de procedimiento, la checklist como referencia exhaustiva
y la guía como explicación breve que enlaza ambas. No se cambia `.sdd/docs.json`: ya contiene el
mapeo correcto.

**Condición para revisar**: se habilita un gate `docs` local; hasta entonces la comprobación
semántica vive en `test-install.mjs` y `--docs-diff` continúa en CI.

## Dependencias nuevas propuestas

| Paquete | Versión | Para qué | Último release | Licencia | CVEs abiertos | Alternativa |
|---|---|---|---|---|---|---|
| Ninguna | — | La solución son contratos Markdown y pruebas Node existentes | — | — | — | librería estándar y suite actual |

## Descartes que conviene recordar

- Una skill o agente `ssrf`: duplicaría capacidad y rompería el catálogo 20/27.
- Copiar instrucciones SSRF a los seis hosts: crea seis fuentes divergentes; `.agents/skills` ya
  es el contrato portable.
- Implementar un filtro, proxy o cliente HTTP: esta plantilla audita proyectos; no ejecuta las
  peticiones descritas por la spec.
- Convertir MITRE ATT&CK en marco primario: quedó fuera de alcance; puede complementar threat
  models de infraestructura, no sustituye OWASP/ASVS.
- Introducir DAST, SAST o un servicio de pago obligatorio: el contrato pide evidencia honesta,
  pero no presupone el stack ni una herramienta.
