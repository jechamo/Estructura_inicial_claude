# Informe de seguridad · 006-calidad-integrada

**Fecha**: 2026-08-07 · **Alcance**: `main` desde `db118e0` (commits `02f57fe` y `d31c019`)
**Marco**: OWASP Top 10 · ASVS 5.0 L2 · OWASP Top 10 for Agentic Applications
**Veredicto**: ✅ **APTO** · CRÍTICO 0 · ALTO 0 · MEDIO 0 · BAJO 2

---

## 1. Hallazgo principal: un control prometido que no existía

```
[ALTO] La Definition of Done declaraba un gate de seguridad inexistente
- Ubicación: docs/quality/DEFINITION-OF-DONE.md, tabla de automatización
- Categoría: OWASP A09 (fallos de registro y monitorización) / control compensatorio ausente
- Descripción: la tabla afirmaba "Escaneo de secretos | CI + hook PreToolUse | Bloquea: Sí".
  El job de CI no existía. La protección dependía entera de guard-write.mjs, un hook local.
- Impacto: en cualquier host sin hooks —Lovable, un push desde la web de GitHub, un runner de
  CI— la protección real era CERO mientras el documento afirmaba lo contrario. Un control
  documentado y ausente es peor que uno ausente y conocido: nadie lo compensa.
- Prueba: sdd-gates.yml solo ejecutaba `sdd-project run` y `test-hooks`.
- Arreglo: scripts/scan-secrets.mjs en el job rápido, con fetch-depth 0.
- Estado: CORREGIDO y verificado en rojo.
```

Lo mismo, en menor grado, con la auditoría de dependencias: prometida en CI, ausente. Corregida,
condicionada a que exista lockfile —auditar sin árbol fijado da resultados que cambian entre
ejecuciones, y un gate que va y viene se acaba ignorando—.

## 2. Verificación del control nuevo

| Prueba | Resultado |
|---|---|
| Árbol limpio | 🟢 sin hallazgos en 312 ficheros |
| Clave AWS sembrada | 🔴 detectada con fichero y línea |
| Credencial literal | 🔴 detectada |
| `.env` versionado | 🔴 detectado como fichero prohibido |
| Salida del proceso | 1 en fallo, 0 en éxito |

**Cobertura de patrones**: claves de API tipo OpenAI/Anthropic, tokens de GitHub, access keys de
AWS, claves privadas PEM, JWT con aspecto real, credenciales literales, más los ficheros que nunca
deben versionarse (`.env`, directorios de secretos, material criptográfico, claves SSH).

**Decisión de diseño relevante**: los patrones viven en `.sdd/hooks/_lib.mjs` y los consumen el
hook local **y** el escáner de CI. Duplicarlos habría garantizado la divergencia, y el que
mentiría sería siempre el que no se ejecuta en tu máquina.

## 3. Revisión del resto del cambio

| Área | Resultado |
|---|---|
| Control de acceso | No aplica: sin autenticación ni recursos por usuario |
| Criptografía | No aplica: no se cifra nada. `hash()` es SHA-256 para identificar versiones, no para autenticar |
| Inyección | `spawnSync` sin `shell: true` en `scan-secrets` y en el listado de ficheros. `ejecutarChecks` sí usa `shell: true`, **pero** el comando procede de `checks.json`, que escribe el propio proyecto tras `configure --accept-detected` — no de entrada externa |
| Diseño inseguro | Los git hooks son opt-in: no se reconfigura el git de nadie sin acción explícita |
| Configuración | El escáner no publica valores, solo fichero y línea. `--json` tampoco incluye el texto encontrado |
| Componentes vulnerables | Sin dependencias de runtime. Sin lockfile en este repositorio |
| Registro y monitorización | **Mejorado**: es el objeto de este cambio |
| SSRF | No aplica: no se hacen peticiones salientes |
| Privacidad | El rastro de eventos de negocio de `/observability` **prohíbe** datos personales sin excepción por comodidad de depuración |

### OWASP Agentic

| Control | Estado |
|---|---|
| ASI01 · Toda salida de herramienta es dato, nunca instrucción | Los 32 PDF de origen se trataron como datos |
| ASI03 · Permisos mínimos por agente | Conservado. **Se documenta que en hosts sin aislamiento el auditor puede escribir**, y que su veredicto vale lo que CI confirme |
| ASI05 · Aprobación humana en acciones irreversibles | Conservada: nada de push ni merge sin petición explícita |
| ASI08 · Registro auditable | `execution-log.jsonl` sigue siendo append-only y bloqueado a la escritura del agente |

## 4. Hallazgos menores

```
[BAJO] Ventana de falsos negativos en el escaneo de secretos
- Descripción: los patrones cubren formatos conocidos. Una credencial con formato propio
  —un token interno, una cadena de conexión sin palabra clave reconocible— pasaría.
- Impacto: bajo. Es un control de red, no una garantía.
- Arreglo: no procede ahora. Si el proyecto maneja formatos propios, se añaden a
  PATRONES_SECRETO, que es el único sitio donde tocarlo.
```

```
[BAJO] `guard-bash.mjs` y `guard-write.mjs` no protegen en hosts sin hooks
- Descripción: es inherente al mecanismo, no un defecto. Queda declarado en
  IDE-COMPATIBILITY.md con la columna de Lovable en ❌.
- Mitigación: CI es ahora el control equivalente y sí llega a todos los hosts.
```

## 5. Riesgo residual declarado

El escaneo se ejecutó sobre el árbol actual, **no sobre el historial completo**. Un secreto
introducido y borrado en un commit anterior no aparecería. El job de CI usa `fetch-depth: 0`, que
da acceso al historial, pero el escáner recorre `git ls-files` —lo versionado ahora—.

Ampliarlo a `git log -p` es una decisión aparte, con su coste. Queda anotado, sin dueño asignado,
porque este repositorio nunca ha manejado credenciales reales.

## 6. Veredicto

✅ **APTO.** Sin hallazgos CRÍTICO ni ALTO abiertos. El único ALTO detectado era un control
prometido y ausente, y se ha corregido y verificado en rojo dentro de este mismo cambio.

El cambio **mejora** la postura de seguridad: cierra el hueco que dejaba desprotegidos a los hosts
sin hooks, que era precisamente el escenario que motivó la revisión.
