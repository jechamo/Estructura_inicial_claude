# Investigación · 007-seguridad-jwt-owasp-2025

## D-01 · Marco normativo

- Opciones: Top 10 como checklist / ASVS como contrato / ambos con responsabilidades separadas.
- Elegida: Top 10:2025 como mapa de riesgos y ASVS 5.0.0 como requisitos verificables.
- Motivo: Top 10 es deliberadamente de concienciación; ASVS ofrece requisitos e IDs versionados.

## D-02 · JWT

- Opciones: imponer JWT / prohibirlo / hacerlo condicional a una decisión arquitectónica.
- Elegida: condicional. Sesiones opacas u OIDC pueden ser mejores según el contexto.
- Coste asumido: más campos en el plan cuando se elige JWT, a cambio de evitar defaults inseguros.

## D-03 · Gate de herramientas

- Opciones: SAST/DAST por producto / un gate agregado `security` / solo auditoría humana.
- Elegida: gate agregado configurable + auditoría humana estructurada.
- Motivo: permite múltiples stacks sin fingir que un único escáner cubre ASVS.

## Fuentes

- OWASP Top 10:2025.
- OWASP ASVS 5.0.0, especialmente V9 Self-contained Tokens.
- OWASP REST Security y CSRF Prevention Cheat Sheets.
- Material didáctico aportado: `6.5.3-AuthN-AuthZ-con-Tokens-a-mano.pdf` y
  `6.5.4-OWASP-Top-10-Aplicado.pdf`, tratado como fuente secundaria y no distribuido.

## Discrepancias resueltas del material didáctico

- El PDF de OWASP usa Top 10:2021; el circuito fija Top 10:2025 y ASVS 5.0.0 como autoridad.
- Los secretos JWT embebidos son ejemplos docentes, nunca configuración reutilizable.
- `SameSite` reduce riesgo, pero no sustituye una defensa CSRF acorde al transporte elegido.
- Validar el esquema con Zod no evita por sí mismo SQL injection: siguen siendo obligatorias las
  consultas parametrizadas y el control de identificadores dinámicos.
- La política de contraseñas se remite al estándar vigente; no se heredan reglas de composición
  o rotación periódica del material secundario sin análisis de riesgo.
