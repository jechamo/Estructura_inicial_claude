# 013 · Plan técnico

| Campo | Valor |
|---|---|
| **Spec** | `013-verificacion-independiente-del-host` |
| **Estado** | en implementación |
| **Fecha** | 2026-08-17 |

## 1. Enfoque

El problema tiene dos mitades y cada una se resuelve mudando la verificación a un sustrato que
el entorno de trabajo no controla.

Para los territorios, el sustrato es una **función pura**. Hoy la decisión vive dentro de
`guard-write.mjs`, mezclada con la lectura de la entrada del hook y con la escritura de la
respuesta, y por eso solo se puede probar simulando un host. Al extraer
`decidirTerritorio({ agente, ruta, modo, config })` a `.sdd/hooks/territorios.mjs`, la regla pasa a
ser una tabla de casos que se verifica sin host. El hook queda como lo que debe ser: el
adaptador que traduce el protocolo de cada entorno a esa llamada. Verificar la función es
verificar lo que deciden los seis, porque los seis llaman a la misma.

Para la autoría, el sustrato es **git**. Todos los entornos escriben commits; ninguno puede
evitarlo. Un commit que declara `Spec`, `Task` y `Agent` en sus trailers ofrece tres
afirmaciones contrastables contra artefactos que ya existen: `tasks.md`, el catálogo de agentes
y el reparto de territorios. La comprobación no necesita que el IDE cuente nada.

Esto introduce un tercer estado de verificación, entre los dos actuales:

| Estado | Quién lo respalda | Fuerza |
|---|---|---|
| `observed` | el host vio el ciclo de vida del subagente | fuerte, disponible en 2 de 6 entornos |
| `declared-corroborated` | el agente lo declaró y el repositorio lo contrasta | media, disponible en los 6 |
| `declared-direct` | el agente lo declaró y nadie lo contrasta | débil, disponible siempre |

El límite se escribe sin adornos: un agente puede escribir un trailer falso. La corroboración no
lo impide. Encarece la mentira deliberada y, sobre todo, hace **detectable el descuido**, que es
el fallo que de verdad ocurre: escribir fuera del carril sin darse cuenta.

## 2. Decisiones

### D-01 · La regla se extrae, no se duplica

`.sdd/hooks/territorios.mjs` exporta `decidirTerritorio()` y `cargarTerritorios()`.
`guard-write.mjs` pasa a importarlas. No se copia lógica: si el hook y la comprobación
divergieran, la comprobación dejaría de significar nada.

### D-02 · Modo desconocido falla cerrado, configuración ausente no

Hoy un mapa ilegible devuelve `null` y permite escribir. Se conserva ese comportamiento para el
fichero **ausente** —un proyecto que no reparte territorios no debe bloquearse— pero un fichero
**presente y corrupto**, o un `modo` fuera de los cuatro admitidos, pasa a resolverse como el
modo más restrictivo declarado. Un reparto que no se entiende no puede interpretarse como
permiso.

### D-03 · Los agentes sin territorio se declaran, no se reparten

Trece de los veinte agentes no tienen territorio. Cuatro de ellos —`orchestrator`,
`code-reviewer`, `security-auditor`, `research-analyst`— son auditores de solo lectura: darles
territorio de escritura sería contradecir su definición. Los otros nueve escriben dentro de
`src/` y `tests/`, que son territorio de la aplicación y no de la plantilla. El fichero pasa a
declarar ambos grupos con su motivo, y la comprobación exige que todo agente esté en una de las
tres listas: con territorio, auditor, o de aplicación.

### D-04 · La auditoría de trazas es explícita en su rango

`check-sdd --trace-audit --base <ref>` audita los commits entre `<ref>` y `HEAD`. No audita todo
el historial: los doce ciclos anteriores no usaron trailers y declararlos incumplidores sería
falsear la historia. Un commit sin trailers dentro del rango se reporta como **no auditable**,
que es distinto de conforme y distinto de infractor.

### D-05 · La autoría se deduplica por delegación, no por escritura

El evento `authorship` se escribe una vez por terna `(sesión, agente, spec)`. El estado vive en
`.sdd/state/authorship/`, que no se versiona. Sin deduplicación, un refactor de treinta ficheros
produciría treinta entradas idénticas y el fichero de trazas dejaría de ser legible, que es la
forma más eficaz de que nadie lo mire.

### D-06 · La plantilla observa, este repositorio obliga

Un proyecto recién instalado arranca en `audit`: bloquear a alguien el primer día, antes de que
haya entendido el reparto, es la mejor forma de que desactive el sistema entero. Este
repositorio, que sí lo entiende, pasa a `deny` y lo asevera con una comprobación. Predicar un
control y no aplicárselo es exactamente el incumplimiento que corrigió la spec anterior.

## 3. Alternativas descartadas

| Alternativa | Por qué no |
|---|---|
| Exigir a cada host un evento de subagente | No está en nuestra mano. Tres entornos no lo ofrecen y uno no tiene hooks; esperar a que lo implementen es no resolver el problema |
| Firmar los trailers con GPG | Traslada el problema a la gestión de claves y rompe la portabilidad de cero dependencias, para impedir una mentira deliberada que nadie ha cometido |
| Deducir la autoría del contenido del diff | Adivinar quién escribió algo a partir de su estilo es exactamente el tipo de inferencia no determinista que este sistema evita |
| Registrar un evento por cada escritura | Produce un fichero que nadie lee, y un registro que nadie lee no es trazabilidad |

## 4. Matriz de controles de seguridad

| Control | ASVS | OWASP | Aplica | Decisión | Tarea | Test | Evidencia |
|---|---|---|---|---|---|---|---|
| SEC-TERR-001 | 5.0.0 · V4.1.3 | A01:2025 | sí | La ruta se normaliza antes de decidir: traversal, separador de Windows y enlace simbólico no eluden el territorio | T-013-01 | `scripts/test-hooks.mjs::la_normalizacion_de_ruta_no_elude_el_territorio` | evidence.md#SEC-TERR-001 |
| SEC-TERR-002 | 5.0.0 · V1.2.2 | A01:2025 | sí | Un reparto presente pero ilegible, o un modo desconocido, resuelve al modo más restrictivo declarado en lugar de permitir | T-013-02 | `scripts/test-hooks.mjs::un_reparto_corrupto_no_degrada_a_permitir` | evidence.md#SEC-TERR-002 |
| SEC-TRACE-001 | 5.0.0 · V7.1.1 | A09:2025 | sí | El trailer se rechaza si el agente o la tarea no existen, y una línea inyectada en el mensaje no puede suplantar un trailer real | T-013-04 | `scripts/test-install.mjs::el_trailer_no_suplanta_ni_inyecta` | evidence.md#SEC-TRACE-001 |
| SEC-TRACE-002 | 5.0.0 · V7.3.1 | A09:2025 | sí | El registro de autoría es append-only y confinado al repositorio; una spec con ruta hostil degrada a la auditoría general sin escribir fuera | T-013-06 | `scripts/test-hooks.mjs::la_autoria_no_escribe_fuera_del_repositorio` | evidence.md#SEC-TRACE-002 |
| SEC-CLI-004 | 5.0.0 · V1.14.6 | A03:2025 | no | Esta spec no añade ejecución de programas externos ni interpolación de shell; los generadores siguen fuera de su alcance | — | — | — |

## 5. Matriz de controles de usabilidad

| Control | WCAG 2.2 | Heurística | Aplica | Decisión | Tarea | Test | Evidencia |
|---|---|---|---|---|---|---|---|
| UX-COPY-001 | n/a | H1 | sí | El rechazo por territorio nombra el agente, la ruta y el territorio dueño, para que la persona sepa qué ocurrió sin leer el fichero de reparto | T-013-03 | `scripts/test-hooks.mjs::el_rechazo_por_territorio_dice_quien_que_y_de_quien` | evidence.md#UX-COPY-001 |
| UX-COPY-002 | n/a | H9 | sí | El fallo de auditoría de trazas indica el trailer que falta y su forma exacta, de modo que el mensaje contenga la solución y no solo el diagnóstico | T-013-05 | `scripts/test-install.mjs::el_fallo_de_auditoria_ensena_como_arreglarlo` | evidence.md#UX-COPY-002 |
| UX-A11Y-001 | 2.2 · 1.4.1 | H4 | no | La salida es de línea de comandos y no transmite información solo por color: cada estado lleva su palabra | — | — | — |
| UX-FORM-001 | n/a | H5 | no | Esta spec no añade formularios ni entrada interactiva; la entrada es de argumentos de comando | — | — | — |

## 6. Documentación

| DOC-ID | Aplica | Fuente | Artefacto | Propietario | Tarea | Gate/test | Evidencia |
|---|---|---|---|---|---|---|---|
| DOC-TRACE | sí | `scripts/check-sdd.mjs`, `.sdd/hooks/territorios.mjs` | `docs/sdd/OPERATING-MODEL.md` | docs-writer | T-013-05 | `scripts/test-install.mjs::el_fallo_de_auditoria_ensena_como_arreglarlo` | `evidence.md#DOC-TRACE` |
| DOC-HOSTS | sí | `.sdd/hooks/`, contratos de los seis entornos | `docs/integrations/IDE-COMPATIBILITY.md` | docs-writer | T-013-03 | `scripts/test-hooks.mjs::el_rechazo_por_territorio_dice_quien_que_y_de_quien` | `evidence.md#DOC-HOSTS` |

## 7. Impacto en ficheros

| Fichero | Cambio |
|---|---|
| `.sdd/hooks/territorios.mjs` | nuevo · función pura de decisión y carga del reparto |
| `.sdd/hooks/guard-write.mjs` | pasa a importar la función en lugar de decidir en línea |
| `.sdd/hooks/subagent-log.mjs` | registro de autoría deduplicado |
| `.sdd/territories.json` | modo `deny`, agentes sin territorio declarados con motivo |
| `scripts/check-sdd.mjs` | integridad del reparto y `--trace-audit` |
| `scripts/test-hooks.mjs` | tabla de decisión, sexto entorno, mensajes |
| `scripts/test-install.mjs` | auditoría de trazas de punta a punta |
| `docs/integrations/IDE-COMPATIBILITY.md` | carencias de cada entorno y su consecuencia |
| `docs/sdd/OPERATING-MODEL.md` | tercer estado de verificación |

## 8. Verificación

```text
node scripts/test-hooks.mjs
node scripts/test-install.mjs
node scripts/check-sdd.mjs --strict --spec 013
node scripts/sdd-project.mjs trace-status --spec 013 --json
node scripts/sdd-project.mjs run --fast
node scripts/sdd-project.mjs run --slow
```
