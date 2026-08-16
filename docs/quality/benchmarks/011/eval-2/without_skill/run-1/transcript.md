# Transcripción reproducible

La evidencia sin normalizar está en `execution-evidence.json`: conserva argv, cwd lógico,
stdout, stderr, exit code, señal, duración y ficheros creados/modificados/eliminados.

# Resultado verificable

Configuración: v0.6.0
Prompt: Prepara el esqueleto para documentar la decisión de usar un registro opt-in de generadores deterministas, sin shell y vacío por defecto; no apruebes todavía la opción.

1. PASS — Usa la plantilla MADR canónica y calcula un ID sin sobrescribir.
   Evidencia: `execution-evidence.json` (comandos, stdout/stderr, exit code y artefactos).
2. PASS — Mantiene contexto, decisión y consecuencias pendientes.
   Evidencia: `execution-evidence.json` (comandos, stdout/stderr, exit code y artefactos).
3. PASS — No aprueba ni decide la opción por la persona.
   Evidencia: `execution-evidence.json` (comandos, stdout/stderr, exit code y artefactos).

No se atribuye ahorro a decisiones semánticas: permanecen pendientes.
