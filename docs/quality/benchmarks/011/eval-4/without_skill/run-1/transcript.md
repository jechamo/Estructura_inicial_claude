# Transcripción reproducible

La evidencia sin normalizar está en `execution-evidence.json`: conserva argv, cwd lógico,
stdout, stderr, exit code, señal, duración y ficheros creados/modificados/eliminados.

# Resultado verificable

Configuración: v0.6.0
Prompt: Con una spec aprobada, prepara plan y tareas y detecta huecos de trazabilidad sin decidir arquitectura ni tareas concretas.

1. PASS — Crea plan y tareas desde plantillas canónicas en una fixture aprobada.
   Evidencia: `execution-evidence.json` (comandos, stdout/stderr, exit code y artefactos).
2. PASS — Mantiene arquitectura y descomposición semántica pendientes.
   Evidencia: `execution-evidence.json` (comandos, stdout/stderr, exit code y artefactos).
3. PASS — Expone huecos de trazabilidad sin inventar IDs ni tareas.
   Evidencia: `execution-evidence.json` (comandos, stdout/stderr, exit code y artefactos).

No se atribuye ahorro a decisiones semánticas: permanecen pendientes.
