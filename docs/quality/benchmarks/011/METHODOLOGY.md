# Metodología del benchmark 011

Se ejecutaron cinco prompts emparejados contra las skills de `v0.6.0` y el árbol candidato. Cada
configuración usa exactamente las mismas tres expectativas funcionales. Los resultados completos
están en `eval-*/{without_skill,with_skill}/run-1/`; cada `execution-evidence.json` conserva argv,
stdout, stderr, exit code, tiempos y artefactos de procesos reales. Los casos 3 y 4 materializan el
camino positivo en proyectos temporales con producto, spec, diseño y plan aprobados únicamente como
fixture; también prueban el rechazo de sobrescritura.

La infraestructura de colaboración disponible no publica `total_tokens`. Para no fingir precisión,
la métrica es un proxy determinista sobre ficheros persistidos:
`ceil((skillSourceBytes + persistedOutputBytes) / 4)`. Ambos sumandos son el tamaño exacto en bytes
UTF-8 leído del sistema de ficheros: los `SKILL.md` activados y `outputs/result.md`, incluido su byte
final cuando existe. `measurement.json` conserva los operandos y la fórmula. `timing.json` repite el
proxy en `total_tokens` solo para que el agregador estándar de `skill-creator` pueda representarlo;
`tokenMetric` evita confundirlo con tokens reales del modelo.

La duración material se registra, pero una única ejecución local no es elegible para aceptación. Una
candidata se acepta solo con calidad 100 % y una reducción de al menos 20 % en el proxy de tokens. El
proxy no atribuye ahorro al razonamiento semántico inevitable; mide instrucciones activadas y salida.
`skill-creator-benchmark.json` es la agregación estándar; `benchmark.json` contiene la decisión del
umbral de esta spec.
