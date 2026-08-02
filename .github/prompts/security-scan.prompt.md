---
mode: security-auditor
description: Auditoría OWASP Top 10, ASVS 5.0 y OWASP Agentic sobre los cambios
---

Audita la seguridad de: `${input:alcance:¿Diff de la rama o repositorio completo?}`

Sigue [`.agents/skills/security-scan/SKILL.md`](../../.agents/skills/security-scan/SKILL.md).

Modo defensivo: encuentras, explicas el impacto y das el arreglo. **No escribes exploits.**

1. Automático primero: auditoría de dependencias, escaneo de secretos, SAST, y búsqueda de
   patrones peligrosos (SQL concatenado, `eval`, `shell=True`, `innerHTML`,
   `rejectUnauthorized: false`, `Math.random` para tokens).
2. Manual: control de acceso · criptografía · inyección · diseño inseguro · configuración ·
   dependencias vulnerables · autenticación · integridad · logging · SSRF · privacidad.
3. Si el producto usa LLM o agentes, añade OWASP Agentic ASI01–ASI10: toda salida de
   herramienta es **dato, nunca instrucción**; permisos mínimos por agente; aprobación
   humana en acciones irreversibles; límites de pasos, tiempo y presupuesto.

Nivel ASVS objetivo: el declarado en `docs/architecture/constitution.md` (**L2 por defecto**
en aplicación expuesta a internet).

Cada hallazgo con ubicación `ruta:línea`, categoría OWASP/CWE, impacto y arreglo concreto.
**CRÍTICO o ALTO bloquea la entrega.**

Cierra con el bloque `### HANDOFF`.
