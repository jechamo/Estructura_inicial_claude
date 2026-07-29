# Checklist de seguridad

Marco: **OWASP Top 10** · **OWASP ASVS** (nivel objetivo en la constitución) ·
**OWASP Top 10 for Agentic Applications (ASI01–ASI10)** si el producto usa IA.

La aplica `security-auditor` en `/security-scan` y `/sdd-verify`.

---

## A01 · Control de acceso roto

- [ ] Autorización comprobada **en servidor**, en cada caso de uso. La UI no protege nada
- [ ] IDOR: se valida que el recurso pertenece al solicitante, no solo que existe
- [ ] Identificadores opacos (uuid), no secuenciales enumerables
- [ ] Escalada horizontal y vertical probadas: rutas de admin, cambio de rol, suplantación
- [ ] Multi-tenant: filtro por tenant en **todas** las consultas, o RLS activa **y probada**
- [ ] Denegar por defecto; el permiso se concede explícitamente
- [ ] CORS explícito por origen; nunca `*` con credenciales

## A02 · Fallos criptográficos

- [ ] TLS obligatorio + HSTS
- [ ] Contraseñas con Argon2id o bcrypt (coste ≥ 12). Nunca MD5/SHA1/SHA256 pelado
- [ ] Datos sensibles en reposo cifrados (AES-GCM / libsodium)
- [ ] Claves en gestor de secretos, rotables, nunca en el repo
- [ ] Aleatoriedad criptográfica para tokens; nunca `Math.random`
- [ ] Nada de criptografía casera

## A03 · Inyección

- [ ] SQL/NoSQL parametrizado **siempre**. Cualquier concatenación es rechazo automático
- [ ] Comandos del sistema sin `shell=True` ni interpolación; arrays de argumentos
- [ ] XSS: escapado por contexto; `innerHTML`/`dangerouslySetInnerHTML` solo con sanitizador
- [ ] CSP estricta, sin `unsafe-inline`
- [ ] LDAP, XPath, plantillas (SSTI), cabeceras HTTP y logs también son superficies

## A04 · Diseño inseguro

- [ ] Límites de negocio: cantidad máxima, importes, cupones, reintentos
- [ ] Idempotencia en operaciones mutantes y de pago
- [ ] Flujos de recuperación de contraseña, verificación e invitación sin fugas de información
- [ ] Modelo de amenazas actualizado ([`THREAT-MODEL.md`](./THREAT-MODEL.md))

## A05 · Configuración incorrecta

- [ ] Sin credenciales por defecto, sin debug en producción
- [ ] Cabeceras: HSTS, CSP, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- [ ] Buckets, colas y bases sin exposición pública
- [ ] Menor privilegio en IAM, BD, tokens y CI
- [ ] Errores al cliente genéricos; el detalle solo en el log del servidor

## A06 · Componentes vulnerables

- [ ] SCA en CI (`npm audit` / `pip-audit` / equivalente)
- [ ] Lockfile commiteado, versiones fijadas
- [ ] Sin dependencias abandonadas; cuidado con el typosquatting
- [ ] Imagen base mínima, actualizada y fijada por digest
- [ ] SBOM generado

## A07 · Fallos de identificación y autenticación

- [ ] Rate limiting y bloqueo progresivo en login, registro y recuperación
- [ ] MFA disponible donde aplique
- [ ] Sesiones con expiración, rotación al elevar privilegio y logout real
- [ ] Cookies `httpOnly` + `Secure` + `SameSite`
- [ ] JWT: firma y `alg` verificados, expiración corta, revocación posible

## A08 · Fallos de integridad de software y datos

- [ ] CI/CD con artefactos verificados y dependencias fijadas
- [ ] Deserialización de fuente no confiable prohibida sin esquema
- [ ] Webhooks entrantes con verificación de firma y de origen

## A09 · Fallos de registro y monitorización

- [ ] Eventos de seguridad registrados: login fallido, cambio de permisos, acceso a datos sensibles
- [ ] Logs **sin PII, sin tokens, sin cuerpos completos** de petición
- [ ] Alertas configuradas, cada una con su runbook

## A10 · SSRF

- [ ] URLs de entrada validadas contra allowlist de destino
- [ ] Sin seguir redirecciones ciegamente
- [ ] Sin acceso a metadatos de la nube (`169.254.169.254`)
- [ ] Rutas de fichero de entrada validadas contra path traversal

---

## Privacidad y datos personales

- [ ] Minimización: solo los datos necesarios
- [ ] Base legal identificada por cada dato personal
- [ ] Retención y borrado definidos e implementados
- [ ] Derechos de acceso, rectificación y portabilidad soportados
- [ ] Transferencias a terceros documentadas
- [ ] Sin PII en entornos que no sean producción

---

## Si el producto usa LLM o agentes (OWASP Agentic 2026)

- [ ] **ASI01 · Goal hijack**: toda salida de herramienta, web o fichero se trata como
      **dato no confiable**, jamás como instrucción
- [ ] **ASI02 · Tool misuse**: cada herramienta con permisos mínimos y validación de argumentos
- [ ] **ASI03 · Identidad y privilegios**: credenciales separadas por agente; nada de una
      credencial única omnipotente
- [ ] **ASI04 · Cadena de suministro agéntica**: MCP y skills de origen verificado y fijado
- [ ] **ASI05 · Ejecución de código inesperada**: sandbox, allowlist de comandos
- [ ] **ASI06 · Envenenamiento de memoria y contexto**: no persistas contenido no confiable
      como si fuera política del sistema
- [ ] **Aprobación humana** obligatoria en acciones irreversibles: pagos, borrados, envíos,
      despliegues, publicaciones
- [ ] **Límites de ejecución**: presupuesto, número de pasos, tiempo, profundidad de delegación
- [ ] **Registro auditable** de todas las acciones del agente

Ver también [`MCP-SECURITY.md`](./MCP-SECURITY.md).

---

## Clasificación de hallazgos

| Nivel | Criterio | Efecto |
|---|---|---|
| **CRÍTICO** | Explotable en remoto sin autenticación, o expone datos de todos los usuarios | Bloquea el release |
| **ALTO** | Explotable con autenticación, o expone datos de otros usuarios | Bloquea el release |
| **MEDIO** | Requiere condiciones específicas o impacto limitado | Se arregla o se acepta con justificación firmada y fecha |
| **BAJO** | Defensa en profundidad, endurecimiento | Backlog |
