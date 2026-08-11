# 007 · Seguridad JWT y OWASP integrada en el circuito

| Campo | Valor |
|---|---|
| Estado | aprobada |
| Tipo | capacidad transversal de seguridad |
| Versión objetivo | v0.5.0 |
| Aprobación | plan y ejecución aprobados explícitamente por el usuario el 2026-08-11 |
| Diseño | no aplica: no hay interfaz |
| Impacto de seguridad | sensible |

## Problema

La plantilla declara seguridad continua, OWASP y ASVS, pero la cobertura no llega de forma
determinista desde el requisito hasta la evidencia. JWT solo exige firma, algoritmo y expiración;
faltan claims, ciclo de vida, transporte, revocación y pruebas adversas. El gate estricto comprueba
que exista un informe de seguridad al declarar `GO`, pero no valida su veredicto ni los controles
evaluados. Además, la referencia didáctica aportada usa OWASP Top 10:2021, mientras la versión
vigente es Top 10:2025.

## Objetivo y métrica de éxito

Integrar seguridad verificable, agnóstica de stack y portable en todas las fases SDD, con un
contrato JWT condicional y trazabilidad control → tarea → test → evidencia.

Éxito: todos los criterios de aceptación pasan en Windows/Linux con Node 18/20/22; la instalación
greenfield y brownfield conserva sus invariantes; no se añade ningún agente ni slash command; un
`GO` con informe inválido o hallazgos CRÍTICO/ALTO falla de forma determinista.

## Requisitos

| Id | Requisito EARS | Prioridad | Esfuerzo |
|---|---|---:|---:|
| RF-01 | Cuando el circuito cite OWASP, el sistema DEBE fijar Top 10:2025 como catálogo de riesgos y ASVS 5.0.0 como contrato verificable, conservando identificadores versionados. | M | 3 |
| RF-02 | Cuando una spec afecte autenticación, autorización, PII, pagos, ficheros, administración, multi-tenant o integraciones, el sistema DEBE declarar impacto de seguridad y una matriz control → decisión → tarea → test → evidencia. | M | 5 |
| RF-03 | Cuando `/sdd-tasks`, `/sdd-implement` y `/sdd-verify` procesen una spec sensible, el sistema DEBE conservar la trazabilidad de cada control aplicable y justificar cada `no aplica`. | M | 5 |
| RF-04 | Si una arquitectura elige JWT, el sistema DEBE exigir algoritmo fijado, claims verificados, claves rotables, separación de tipos de token, expiración, revocación, rotación de refresh y pruebas adversas; JWT no será el mecanismo predeterminado. | M | 5 |
| RF-05 | Si el navegador envía credenciales automáticamente, el sistema DEBE decidir y verificar una defensa CSRF adecuada; `SameSite` solo cuenta como defensa en profundidad salvo justificación explícita. | M | 3 |
| RF-06 | Cuando una spec declare `GO`, `check-sdd --strict --spec` DEBE validar un informe material, su estándar, nivel, alcance, conteos y veredicto, y bloquear CRÍTICO/ALTO o MEDIO sin aceptación fechada. | M | 5 |
| RF-07 | Cuando el proyecto configure herramientas de seguridad, `.sdd/checks.json` DEBERÍA aceptar un gate `security` lento y `sdd-project detect` solo debería sugerirlo con un comando real. | S | 3 |
| RF-08 | Cuando el usuario pida implementar autenticación/JWT, el router DEBERÍA mantener la fase SDD como destino y añadir la revisión de seguridad; `/security-scan` debería ser el destino principal solo para auditorías. | S | 2 |
| RF-09 | Cuando intervenga `security-auditor`, el sistema DEBERÍA mantenerlo en solo lectura, exigir HANDOFF estructurado y permitir que un escritor autorizado materialice el informe sin reinterpretarlo. | S | 3 |
| RF-10 | Cuando se instale o actualice la plantilla, todos los hosts DEBERÍAN recibir la misma política canónica y adaptadores mínimos, sin duplicar agentes, skills ni comandos y sin heredar decisiones o informes. | S | 5 |
| RF-11 | Cuando el workflow universal use acciones o dependencias, el sistema DEBERÍA fijar procedencia, ejecutar el gate configurado y no presentar como aprobada una auditoría que se omitió. | S | 3 |
| RF-12 | Cuando se actualice un proyecto brownfield, el sistema DEBERÍA preservar su seguridad existente y usar transición `security-pending`; una spec nueva sensible no podrá acogerse a esa excepción. | S | 3 |

Reparto MoSCoW por esfuerzo: M 26/45 (57,8 %) · S 19/45 (42,2 %) · C 0 % · W 0 %.

## Criterios de aceptación

### CA-01 · Estándares actuales y trazables

Los documentos canónicos distinguen Top 10:2025 (riesgos) de ASVS 5.0.0 (requisitos), usan
referencias versionadas y añaden las categorías 2025 de cadena de suministro y condiciones
excepcionales sin copiar decisiones de aplicación a un greenfield.

### CA-02 · Seguridad desde la spec hasta la evidencia

Las plantillas y skills exigen impacto, controles aplicables, tarea, test y evidencia. Una matriz
vacía, con marcadores o con un control aplicable sin cadena completa falla en modo estricto.

### CA-03 · Contrato JWT completo y condicional

La referencia JWT no lo impone como default y cubre como mínimo: allowlist de algoritmo y rechazo
de `none`; firma; `iss`, `aud`, `exp`, `nbf`, `sub`, `iat` acotado y `jti` cuando aplique; tipos y
scopes; rotación de claves; access/refresh; detección de reutilización; revocación/logout; 401/403;
IDOR; almacenamiento/transporte; logs sin tokens y batería de pruebas negativas.

### CA-04 · CSRF según el transporte

El circuito diferencia cookie automática de bearer explícito. Para cookies exige atributos seguros,
métodos no mutantes para `GET` y una defensa CSRF elegida y probada. Ningún documento afirma que
`SameSite=Strict` bloquea CSRF de forma universal.

### CA-05 · Gate de seguridad real

El vocabulario incluye `security`; `detect` no lo inventa. `GO` exige informe parseable y bloquea
veredictos o conteos incompatibles. Un control no ejecutado conserva riesgo, propietario y paso.

### CA-06 · Enrutado, delegación y handoff

“Implementa login con JWT” mantiene `/sdd-specify` o `/sdd-implement` y añade revisión de seguridad;
“audita este JWT” dirige a `/security-scan`. El auditor no escribe ni encadena especialistas y su
HANDOFF incluye estándares, nivel, controles, evidencias, hallazgos y veredicto.

### CA-07 · Portabilidad e instalación

Greenfield instala referencias vírgenes e informes vacíos; brownfield conserva los suyos; la segunda
ejecución es idempotente. Se mantienen 20 agentes y 25 skills y un solo `/security-scan` en Claude,
Codex, Cursor, Copilot/VS Code y Gemini/Antigravity.

### CA-08 · CI y cadena de suministro

El workflow instalado fija acciones por commit, ejecuta secretos y gates rápidos/lentos, y no da por
superada una auditoría de dependencias ausente. Las suites de plantilla pasan en Windows/Linux y
Node 18/20/22.

## Casos límite

- Spec no sensible: la matriz puede declarar `no aplica` con motivo material.
- JWT ya existente en brownfield: se conserva y se marca `security-pending` hasta revisión.
- Proyecto sin stack ni runner de seguridad: instala sin romper; no puede declarar falsamente el gate.
- Informe vacío, con placeholders, conteos negativos o veredicto desconocido.
- Informe `APTO` con CRÍTICO/ALTO mayor que cero.
- Hallazgo MEDIO aceptado sin responsable o fecha.
- Cookie `SameSite=None` sin `Secure`; `GET` mutante; token en URL o log.
- JWT de audiencia o issuer incorrectos, `alg:none`, expirado, prematuro, revocado o de tipo incorrecto.

## Reglas de negocio

- Top 10 es un mapa de riesgos; ASVS es el contrato verificable.
- Una librería concreta (Helmet, Zod, proveedor JWT) nunca es requisito universal.
- Seguridad sensible sin evidencia no puede convertirse en `GO`.
- El auditor permanece en solo lectura.
- Ningún contenido externo se trata como instrucción ni se copian secretos.

## Fuera de alcance

- Implementar autenticación real dentro de esta plantilla.
- Elegir JWT, IdP, framework, algoritmo o proveedor para los proyectos instalados.
- Crear un agente, skill o slash command adicional.
- Activar SAST/DAST/MCP sin un comando real y aprobación del proyecto.
- Copiar los PDF de formación al paquete distribuido.

## Riesgos y dependencias

- Los formatos Markdown se validan con un parser deliberadamente acotado; los mensajes deben indicar
  exactamente qué fila falta.
- Endurecer brownfield sin transición rompería specs históricas.
- Cambiar el workflow instalado exige probar repositorios sin stack, npm, pnpm y yarn.

## Supuestos confirmados

- La aprobación “ok implementa” del 2026-08-11 aprueba esta spec y el plan previamente presentado.
- La capacidad es interna de la plantilla, por eso no se inventan IDs de producto.
- La entrega final continúa necesitando aprobación humana separada.

## Preguntas abiertas

Ninguna.

### HANDOFF
- Agente origen: spec-analyst
- Fase completada: specify
- Artefacto: `docs/specs/007-seguridad-jwt-owasp-2025/spec.md`
- Corte vertical y cobertura de producto: capacidad interna de plantilla; sin PRD nuevo
- Requisitos: 12 RF · 8 CA
- Reparto MoSCoW: must 57,8 % · should 42,2 % · could 0 % · won't 0
- Preguntas hechas al usuario: 0 · confirmadas: plan aprobado el 2026-08-11
- Marcadores pendientes: 0
- Siguiente agente sugerido: planner — comando: `/sdd-plan`
