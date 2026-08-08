# Informe de calidad · 006-calidad-integrada

**Fecha**: 2026-08-07 · **Alcance**: `main` desde `db118e0` (commits `02f57fe` y `d31c019`)
**Veredicto**: ⚠️ **APTO CON CONDICIONES** — ver §6

---

## 1. Gates automáticos

| Gate | Comando | Resultado |
|---|---|---|
| Estructura y contrato | `node scripts/check-sdd.mjs` | 🟢 6 specs · 36 tareas hechas · 20 agentes · 25 skills |
| Trazabilidad y evidencia | `node scripts/check-sdd.mjs --strict` | 🟢 |
| Guardas | `node scripts/test-hooks.mjs` | 🟢 51/51 |
| Instalador | `node scripts/test-install.mjs` | 🟢 137/137 |
| Skills externas | `node scripts/skills-sync.mjs --check` | 🟢 |
| Secretos | `node scripts/scan-secrets.mjs` | 🟢 0 hallazgos en 312 ficheros |
| Deuda | `node scripts/sdd-project.mjs debt` | 🟢 0 marcadores en 315 ficheros |
| Lint / tipos / build / cobertura | — | **no aplica**: el repositorio no declara estos gates; sus tests son los scripts |

## 2. Cobertura por tier

Declarada en [`plan.md`](../../specs/006-calidad-integrada/plan.md) §8.1 y **no impuesta por
máquina aquí**: el repositorio no tiene herramienta de cobertura. Declarado como control
parcialmente ejecutado en `evidence.md` §3.

| Módulo | Tier | Verificado por |
|---|---|---|
| `scripts/check-sdd.mjs` | CORE | 137 checks de `test-install` + 5 gates probados en rojo |
| `scripts/scan-secrets.mjs` | CORE | Rojo con clave sembrada, verde en árbol limpio |
| `.sdd/hooks/_lib.mjs` | CORE | `test-hooks` 51/51 tras el refactor de patrones compartidos |
| `scripts/sdd-project.mjs` | IMPORTANT | `detect`/`run`/`debt`/`skills-export` ejecutados |
| `docs/**`, prompts | INFRASTRUCTURE | Estructura validada por `check-sdd` |

**Sin tier declarado**: ninguno. Todo módulo tocado está clasificado.

## 3. Calidad de la suite

Los cinco gates nuevos se probaron **en rojo antes de fijarlos**, que es la única evidencia de que
un gate existe:

| Gate | Prueba en rojo |
|---|---|
| Paridad de skills | `se esperaban 24 y hay 25` al añadir `/observability` |
| Vocabulario de `checks.json` | gate `inventado` y `speed: turbo` rechazados |
| Rutas relativas en skills | `](../front/SKILL.md)` sembrado y detectado |
| Escaneo de secretos | clave AWS y `.env` sembrados: 3 hallazgos, salida 1 |
| CHANGELOG y bitácora en `--strict` | commit sin ellos: bloqueado nombrando el fichero |

**Defectos propios encontrados y corregidos durante la verificación:**

1. `debt` contaba 21 marcadores, **18 falsos positivos** de su propia implementación y de una
   variable llamada `TODO`. Corregido a exigir que el marcador abra un comentario.
2. `detectedFrom` afirmaba "lockfile de npm" sin comprobar que existiera. Ese campo es la prueba
   de por qué se sugiere un gate; corregido a nombrar el fichero real.
3. Añadir `debt` a `status` rompía `status` fuera de un repositorio git. Corregido a devolver
   `available: false` con motivo, coherente con "no ejecutado es un resultado".
4. La allowlist de npm dejaba fuera **8 ficheros nuevos**: la instalación por `npx` habría llevado
   la skill sin los documentos que enlaza. Blindado con test fichero a fichero.
5. El gate de informes exigía artefactos de entrega en cada `--strict --spec`, rompiendo un test
   legítimo. Corregido a exigirlos solo cuando `evidence.md` declara `GO`.

## 4. Diseño

Sin auditoría formal de `refactor-specialist`. El cambio no introduce clases ni jerarquías: son
documentos, prompts y scripts procedurales. La decisión de diseño relevante —patrones de secreto
en fuente única compartida— está justificada en `plan.md` §4.

## 5. Documentación y trazabilidad

- 262 enlaces relativos verificados, 0 rotos.
- Conteo de skills actualizado en los 8 documentos que lo citan, más `.mdc` de Cursor y el
  workflow de Antigravity, que tres sustituciones anteriores habían fallado por escribirse
  distinto.
- CHANGELOG y bitácora al día. Spec, plan, tareas y evidencia completos.

## 6. Condiciones

**No bloqueantes para el merge, sí para dar la capacidad por probada:**

1. **Importar una skill en Lovable.** Si su importador rechaza `.agents/` por el punto inicial, la
   distribución hay que rehacerla. Es el riesgo con más impacto y solo el usuario puede probarlo.
2. **Ver ejecutar `sdd-gates.yml` en un runner real.** Los comandos se verificaron localmente; la
   sintaxis YAML y los permisos, no.

Ambos están en `evidence.md` §3 con propietario y próximo paso.

## 7. Veredicto

⚠️ **APTO CON CONDICIONES.** Los gates automáticos están en verde, los nuevos se probaron en rojo
primero, y cinco defectos propios se encontraron y corrigieron durante la verificación. Quedan dos
controles sin ejecutar, declarados, con dueño y sin bloquear la entrega.

Lo que **no** puedo afirmar: que la capacidad funcione en Lovable. Puedo afirmar que el formato es
el estándar y que las skills ya no dependen de su ubicación. La prueba real está pendiente.
