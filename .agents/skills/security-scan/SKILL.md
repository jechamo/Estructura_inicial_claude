---
name: security-scan
description: "Auditoría de seguridad del código: OWASP Top 10, ASVS y OWASP Agentic si hay LLM. Úsala antes de un release o al tocar auth, datos personales, pagos, ficheros o integraciones."
---

# /security-scan — Auditoría de seguridad

Agente responsable: `@security-auditor`.

## Alcance

Por defecto, el **diff** de la rama actual. Con `completo`, todo el repositorio.

## Herramientas automáticas primero

Ejecuta y pega la salida:
- Auditoría de dependencias (`npm audit`, `pip-audit`, `cargo audit`, …)
- Escaneo de secretos en el historial (`gitleaks`, `trufflehog`) si está disponible
- SAST del stack si está configurado
- Búsqueda manual de patrones peligrosos:
  `Grep` de concatenación SQL, `eval`, `exec`, `shell=True`, `innerHTML`,
  `dangerouslySetInnerHTML`, `verify=False`, `rejectUnauthorized: false`,
  `Math.random` para tokens, claves con aspecto de secreto.

## Revisión manual — checklist

Recorre la checklist completa de `@security-auditor` y de
`docs/security/SECURITY-CHECKLIST.md`. En resumen:

1. **Control de acceso** — autorización en servidor por caso de uso, IDOR, multi-tenant, RLS.
2. **Criptografía** — TLS, hashes de contraseña, gestión de claves, aleatoriedad segura.
3. **Inyección** — SQL, comandos, plantillas, XSS, cabeceras, logs.
4. **Diseño inseguro** — límites de negocio, idempotencia, flujos de recuperación.
5. **Configuración** — debug, cabeceras de seguridad, CORS, permisos cloud, errores verbosos.
6. **Dependencias** — CVEs, abandono, typosquatting, scripts de instalación.
7. **Autenticación** — rate limiting, sesiones, MFA, cookies, JWT.
8. **Integridad** — firma de webhooks, deserialización, cadena de suministro.
9. **Logging** — eventos de seguridad registrados, sin PII ni tokens.
10. **SSRF** — allowlist de destinos, sin acceso a metadatos de la nube.
11. **Privacidad** — minimización, retención, borrado, base legal.
12. **Agentic (si hay LLM)** — salidas de herramienta como dato y no como instrucción,
    permisos mínimos por agente, aprobación humana en acciones irreversibles, límites de
    ejecución, registro auditable.

## Formato de hallazgo

```
[CRÍTICO|ALTO|MEDIO|BAJO] <título>
- Ubicación: ruta:línea
- Categoría: OWASP A0X / ASI0X / CWE-NNN
- Descripción: <qué falla>
- Impacto: <qué consigue un atacante>
- Verificación: <cómo comprobarlo, sin exploit funcional>
- Arreglo: <código o configuración concreta>
```

## Informe y veredicto

Escribe `docs/security/reports/YYYY-MM-DD-<alcance>.md`.

**CRÍTICO o ALTO ⇒ bloquea la entrega.** MEDIO se arregla o se acepta con justificación
firmada en la bitácora y fecha de revisión.

## Límite ético

Encuentras, explicas el impacto y das el arreglo. **No escribes exploits funcionales**
ni herramientas de ataque.
