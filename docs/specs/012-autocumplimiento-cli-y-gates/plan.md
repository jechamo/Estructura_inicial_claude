# Plan técnico · 012-autocumplimiento-cli-y-gates

## 1. Enfoque

Tres cambios acotados sobre código que ya existe, sin dependencias nuevas y sin tocar el esquema
de `.sdd/checks.json`.

1. **Degradación**: `snapshotEstado()` ya resuelve el caso "no hay instalación" con un
   `try/catch` que devuelve `{ mode: 'template' }`. Se extrae ese patrón a una función
   `cargarInstalacionOPlantilla()` y se usa en los tres lugares donde hoy se rompe.
2. **Contrato de error**: el `catch` del despachador pasa a respetar `--json`.
3. **Gates propios**: se declara lo que este repositorio ya sabe ejecutar y se publica el motivo
   de cada ausencia. Se añade un único script nuevo, `scripts/check-syntax.mjs`, porque hoy nada
   detecta CRLF ni espacios finales en un repositorio editado desde Windows por agentes de IA.

## 2. Contratos

```text
node scripts/sdd-project.mjs --help | -h | help      → uso completo, exit 0
node scripts/sdd-project.mjs product-status [--json] → estado, exit 0 aun sin installed.json
node scripts/sdd-project.mjs docs-status [--json]    → estado, exit 0 aun sin installed.json
node scripts/sdd-project.mjs approve-product --approved-by <persona> [--json]
node scripts/check-syntax.mjs [--json]               → lint sin dependencias
node scripts/check-syntax.mjs --selftest             → verifica el propio linter
```

Contrato de error, idéntico para todos los subcomandos:

```jsonc
// stderr, una sola línea, solo cuando se invocó con --json; exit code 1
{ "schemaVersion": 1, "ok": false, "command": "product-status", "error": "…" }
```

Sin `--json` la salida de error sigue siendo la frase humana actual, sin prefijos ni ruido.

### Estado por defecto de plantilla

`cargarInstalacionOPlantilla()` devuelve `{ mode: 'template' }` cuando el fichero no existe, y
propaga el error tal cual cuando existe pero es JSON inválido: un fichero corrupto es un
problema real y no debe confundirse con "todavía no instalado". Con `mode: 'template'`,
`estadoProducto()` y `estadoDocumentacion()` caen en su rama `legacy-pending`, que es la lectura
conservadora correcta: no hay aprobación registrada y no se inventa ninguna.

### Ayuda

El bloque de uso deja de ser un comentario y pasa a ser la constante `USO`, que se imprime tanto
en la cabecera del fichero como en `--help`. La intercepción ocurre **antes** de
`validarArgumentos()`, porque hoy `--help` muere ahí como "argumento desconocido".

## 3. Gates del repositorio

| Gate | Velocidad | Comando | Qué verifica |
|---|---|---|---|
| `sdd` | fast | `node scripts/check-sdd.mjs` | el circuito documental y de trazabilidad |
| `lint` | fast | `npm run lint` | sintaxis de los `.mjs` y reglas de `.editorconfig` |
| `test` | fast | `npm run test` | hooks compartidos y autotest del linter |
| `build` | fast | `npm run build` | sincronía de las skills canónicas y sus adaptadores |
| `security` | slow | `node scripts/scan-secrets.mjs --json` | secretos en el árbol versionado |
| `e2e` | slow | `npm run e2e` | contrato completo del instalador |

`security` se mantiene `required: true` y `speed: slow`, que es lo que `check-sdd.mjs` exige para
dar por configurado el contrato de seguridad. `e2e` permanece lento a propósito: construye
instalaciones completas en disco y `run --fast` debe seguir midiéndose en segundos, o los agentes
dejarán de ejecutarlo.

`scripts/check-syntax.mjs` no incorpora dependencias: usa `node --check` para la sintaxis y
comprueba fin de línea LF, línea final, ausencia de espacios finales e indentación por espacios.
No analiza Markdown: el formato de prosa no es un defecto y penalizarlo produce ruido.

## 4. Seguridad

| Control | ASVS | OWASP | Aplica | Decisión | Tarea | Test | Evidencia |
|---|---|---|---|---|---|---|---|
| SEC-CLI-001 | ASVS 5.0.0 V1.2.4 | A01:2025 | sí | crear `.sdd/installed.json` solo después de que la validación completa del baseline pase; una degradación nunca concede estado aprobado | T-012-02 | `scripts/test-install.mjs::cli_degrada_sin_estado_instalado` | `evidence.md#SEC-CLI-001` |
| SEC-CLI-002 | ASVS 5.0.0 V7.4.1 | A09:2025 | sí | el error JSON expone mensaje y comando, nunca traza de pila, rutas absolutas del host ni contenido del fichero ilegible | T-012-03 | `scripts/test-install.mjs::cli_error_json_es_maquina_legible` | `evidence.md#SEC-CLI-002` |
| SEC-CLI-003 | ASVS 5.0.0 V15.3.5 | A03:2025 | sí | los comandos de gate declarados se ejecutan por el runner existente, sin ampliar la superficie de ejecución ni añadir dependencias | T-012-05 | `scripts/test-install.mjs::gates_declarados_son_ejecutables` | `evidence.md#SEC-CLI-003` |

Los tres controles son de contención, no de cifrado ni de sesión: la superficie tocada es un CLI
local que lee estado del propio repositorio y lanza comandos ya declarados por una persona.

## 5. Usabilidad

Impacto `aplicable`, exclusivamente de microcopy de línea de comandos. No hay interfaz gráfica,
ni formularios, ni contenido que renderizar, de modo que los controles de accesibilidad visual y
de formulario quedan declarados como no aplicables en la tabla y el gate `a11y` sigue sin
configurarse con razón.

| Control | WCAG 2.2 | Heurística | Aplica | Decisión | Tarea | Test | Evidencia |
|---|---|---|---|---|---|---|---|
| UX-COPY-001 | n/a | H6 | sí | `--help`, `-h` y `help` publican todos los subcomandos: reconocer en vez de recordar | T-012-04 | `scripts/test-install.mjs::cli_ayuda_explica_comandos` | `evidence.md#UX-COPY-001` |
| UX-COPY-002 | n/a | H9 | sí | todo error humano nombra causa y siguiente acción; en `--json` el mismo error es parseable sin heurísticas | T-012-03 | `scripts/test-install.mjs::cli_error_json_es_maquina_legible` | `evidence.md#UX-COPY-002` |
| UX-A11Y-001 | n/a | n/a | no | no hay superficie visual, foco, contraste ni orden de lectura que evaluar en un CLI | — | — | — |
| UX-FORM-001 | n/a | n/a | no | no existe formulario; la única entrada es `--approved-by`, validada ya por la spec 005 | — | — | — |

## 6. Documentación

| DOC-ID | Aplica | Fuente | Artefacto | Propietario | Tarea | Gate/test | Evidencia |
|---|---|---|---|---|---|---|---|
| DOC-CLI | sí | `scripts/sdd-project.mjs`, `.sdd/checks.json` | `docs/quality/TEST-STRATEGY.md`, `README.md` | docs-writer | T-012-06 | `scripts/test-install.mjs::gates_no_configurados_tienen_motivo` | `evidence.md#DOC-CLI` |

## 7. Despliegue y reversión

Cambios locales al repositorio de la plantilla. `.sdd/checks.json` y `package.json` están en las
exclusiones exactas del manifiesto: no viajan a las instalaciones, de modo que ningún proyecto
hereda los gates de este repositorio. `scripts/check-syntax.mjs` sí se copia, como el resto de
`scripts/*.mjs`, y eso es deseable: cualquier instalación gana el mismo linter sin dependencias.

Reversión: `git revert` de la implementación. No hay migración de datos ni de estado local.

## 8. Gate humano de plan

| Campo | Valor |
|---|---|
| **Estado** | `approved` |
| **Persona** | usuario |
| **Fecha** | 2026-08-17 |
| **Alcance aprobado** | implementación literal de la spec 012 |
| **Condiciones / riesgos aceptados** | cero dependencias; `run --fast` acotado a segundos; sin lint de Markdown |

### HANDOFF
- Agente origen: planner
- Fase completada: plan
- Fuentes consultadas: `scripts/sdd-project.mjs`, `scripts/check-sdd.mjs`, `.sdd/checks.json`, `.editorconfig`
- Artefactos: `plan.md`, `tasks.md`, `test-plan.md`
- Requisitos / casos cubiertos: RF-01…RF-06 · CA-01…CA-06
- Discrepancias: ninguna
- Decisiones tomadas: un solo script nuevo con autotest integrado; no se lintan ficheros Markdown
- Supuestos: Node 18+ y ejecución desde la raíz del repositorio
- Bloqueos: ninguno para RED
- Siguiente agente sugerido: implementer
- Comando / contexto durable: `/sdd-implement 012`
