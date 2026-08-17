# Plan de pruebas · 012-autocumplimiento-cli-y-gates

## 1. Estrategia

Caja negra sobre el CLI real, invocado con `spawnSync` desde `scripts/test-install.mjs`, que ya es
el arnés de contrato del proyecto. Cada caso comprueba tres cosas a la vez: salida (texto o JSON),
exit code y bytes escritos en disco. Los fixtures se construyen en directorios temporales, de modo
que el estado del repositorio no interfiere.

Los casos de degradación son el punto ciego histórico: todas las suites anteriores partían de una
instalación completa, donde `.sdd/installed.json` existe siempre. Aquí el fixture se construye
adrede **sin** ese fichero.

## 2. Casos

| Caso | Tipo | Requisitos | CA | Resultado esperado |
|---|---|---|---|---|
| `cli_degrada_sin_estado_instalado` | integración | RF-01, RF-03 | CA-01, CA-03 | `product-status` y `docs-status` salen con 0 y JSON parseable; `approve-product` crea el registro tras validar; un JSON corrupto sigue fallando |
| `cli_error_json_es_maquina_legible` | contrato | RF-02 | CA-02 | con `--json`, `stderr` es una línea JSON con `ok:false` y exit 1; sin `--json`, texto humano intacto |
| `cli_ayuda_explica_comandos` | contrato | RF-04 | CA-04 | `--help`, `-h` y `help` salen con 0 y nombran todos los subcomandos; la invocación desnuda sigue devolviendo `status` |
| `gates_declarados_son_ejecutables` | integración | RF-05 | CA-05 | los comandos de `.sdd/checks.json` existen, `run --fast` cubre `sdd`, `lint`, `test` y `build`, y `security` sigue lento y obligatorio |
| `gates_no_configurados_tienen_motivo` | docs | RF-06 | CA-06 | cada id de `unconfigured` tiene motivo material publicado y ninguno está a la vez configurado |

## 2.1 Trazabilidad de controles

| Control | Tarea | Test exacto |
|---|---|---|
| SEC-CLI-001 | T-012-02 | `scripts/test-install.mjs::cli_degrada_sin_estado_instalado` |
| SEC-CLI-002 | T-012-03 | `scripts/test-install.mjs::cli_error_json_es_maquina_legible` |
| SEC-CLI-003 | T-012-05 | `scripts/test-install.mjs::gates_declarados_son_ejecutables` |
| UX-COPY-001 | T-012-04 | `scripts/test-install.mjs::cli_ayuda_explica_comandos` |
| UX-COPY-002 | T-012-03 | `scripts/test-install.mjs::cli_error_json_es_maquina_legible` |
| DOC-CLI | T-012-06 | `scripts/test-install.mjs::gates_no_configurados_tienen_motivo` |

## 3. Casos hostiles

- `.sdd/installed.json` ausente, vacío, con JSON corrupto y con `product` de otro esquema.
- `approve-product` sobre un baseline con placeholders: no debe escribir el registro.
- Comando inexistente, argumento desconocido y flag duplicada, con y sin `--json`.
- `--help` combinado con un subcomando y con argumentos que hoy rompen la validación.
- Un gate declarado cuyo comando no existe: `run` debe fallar, no simular verde.
- Un identificador presente a la vez en `checks` y en `unconfigured`.

## 4. Autotest del linter

`scripts/check-syntax.mjs --selftest` valida el propio verificador con fixtures en memoria: un
fragmento con CRLF, otro con espacios finales, otro sin línea final, otro con tabuladores y uno
correcto. Comprueba que cada fixture produce exactamente el hallazgo esperado y que el fixture
limpio no produce ninguno. No se crea un arnés de test separado: para una herramienta de este
tamaño, un segundo fichero sería más superficie que valor.

## 5. Cobertura y suficiencia

No hay porcentaje que perseguir: la unidad de medida es el criterio de aceptación. Los seis CA
tienen caso propio y cada control de seguridad y usabilidad aplicable enlaza un caso concreto.

## 6. Matriz de plataformas

La suite corre en Windows y Linux con Node 18/20/22 en GitHub Actions. `check-syntax.mjs` compara
fines de línea leyendo bytes, no texto normalizado, para que el resultado sea el mismo en ambos
sistemas.
