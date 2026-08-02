# Plan de pruebas · 001-agentes-codex

| CA | Nivel | Caso | Resultado esperado |
|---|---|---|---|
| CA-01 | Gate estático | Validar todos los TOML | 20 agentes válidos y completos |
| CA-02 | Regresión | Ejecutar la suite completa | Las superficies existentes continúan en verde |
| CA-03 | Revisión documental | Buscar afirmaciones antiguas | Ninguna afirma que Codex sea solo global |
| CA-04 | Integración | Instalar en directorio temporal | `.codex/config.toml` y 20 agentes presentes |
| CA-05 | Negativo | Retirar un TOML en un destino temporal | `check-sdd` falla e informa del agente ausente |

No se requiere E2E de interfaz. La carga real en un cliente Codex se declara como control manual,
porque el binario instalado no es ejecutable dentro del sandbox de esta sesión.
