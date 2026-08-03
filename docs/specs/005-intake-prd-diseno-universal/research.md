# Investigación · 005

## Baseline local

- El circuito comienza hoy en `sdd-init` o `sdd-specify`; no existe baseline PRD/use cases común.
- `sdd-init` mezcla preguntas de producto con arquitectura y puede decidir stack demasiado pronto.
- `sdd-design` ya detecta contradicciones, pero después de crear una spec local.
- Las Agent Skills canónicas sirven en Claude, VS Code, Cursor y Codex; solo Claude necesita
  adaptador, por lo que un prompt/command paralelo recrearía el bug corregido en v0.3.1.

## Decisión

Añadir una fase de producto anterior a arquitectura/spec, durable y opcional para legacy. Mantener
la lógica de lectura/normalización en instrucciones de skill y usar scripts solo para invariantes
deterministas de IDs, estados, paridad e instalación.
