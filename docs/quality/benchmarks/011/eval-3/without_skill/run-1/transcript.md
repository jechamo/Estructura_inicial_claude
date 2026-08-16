# Transcripción reproducible

La evidencia sin normalizar está en `execution-evidence.json`: conserva argv, cwd lógico,
stdout, stderr, exit code, señal, duración y ficheros creados/modificados/eliminados.

# Resultado verificable

Configuración: v0.6.0
Prompt: Prepara una spec nueva para recuperación de contraseña y su fase de diseño sin rellenar requisitos ni UI.

1. PASS — Crea los scaffolds canónicos en una fixture aprobada sin sobrescribir.
   Evidencia: `execution-evidence.json` (comandos, stdout/stderr, exit code y artefactos).
2. PASS — Mantiene requisitos, criterios y UI como decisiones pendientes.
   Evidencia: `execution-evidence.json` (comandos, stdout/stderr, exit code y artefactos).
3. PASS — Respeta los gates de producto, spec y diseño.
   Evidencia: `execution-evidence.json` (comandos, stdout/stderr, exit code y artefactos).

No se atribuye ahorro a decisiones semánticas: permanecen pendientes.
