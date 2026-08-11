# Contratos

Esta spec no añade API de aplicación. Su contrato público es documental y de CLI:

- Nuevo identificador de gate permitido: `security`.
- `/security-scan` conserva su nombre y admite los alcances `plan`, `verify` y `complete`.
- Las tareas pueden declarar `Controles de seguridad`.
- Los informes de seguridad tienen campos estructurados y veredicto bloqueante.
