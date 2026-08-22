# Benchmark 017

Regenera la línea base en cada ejecución y ejecuta el CLI `context` sobre tres superficies reales:
Claude, Copilot y Cursor. Cuenta host, agente, skill, artefactos y salida sanitizada realmente
activados, y calcula la mediana. Las tres intervenciones son el máximo contractual del flujo, no
telemetría del proveedor. `bytes/4` es un proxy auditable de contexto, no consumo real de Copilot
o Cursor. La mejora solo es aceptable con clasificación funcional al 100 %, `compact` ≥70 % y
máximo tres intervenciones, y `full` ≥20 %.

```bash
node docs/quality/benchmarks/017/run-benchmark.mjs
```
