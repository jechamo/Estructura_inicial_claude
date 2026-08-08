# .sdd/githooks/

Gates locales de git. **Desactivados por defecto.**

| Hook | Ejecuta | Cuándo |
|---|---|---|
| `pre-commit` | `sdd-project run --fast` | lint, tests rápidos, tipos, build, olores |
| `pre-push` | `sdd-project run --slow` | cobertura, E2E, auditoría de dependencias, documentación |

## Activar

```bash
git config core.hooksPath .sdd/githooks
```

Es una línea, es local a tu copia, y se revierte con `git config --unset core.hooksPath`.

**Por qué no se activa solo**: reconfigurar el git de alguien durante una instalación es la clase
de sorpresa que hace que se desinstale la herramienta entera. Y por qué no se usa un gestor de
hooks del ecosistema Node: ataría la plantilla a un stack, y aquí se instalan proyectos de Python,
Go, Rust y Java.

Si `.sdd/checks.json` no tiene comandos configurados, los hooks no hacen nada. No fallan: no hay
nada que ejecutar.

## Saltárselos

```bash
git commit --no-verify
git push --no-verify
```

Existe para la emergencia real, y la emergencia real deja rastro: **abre la tarea de seguimiento
en el mismo momento**. Un bypass sin tarea no es una excepción, es deuda que nadie ha registrado.

## Esto no sustituye a CI

Los hooks locales son un atajo para enterarte en noventa segundos en vez de en diez minutos.
**Quien bloquea de verdad es CI**, porque es el único que no se puede saltar con una bandera.
