# Plan de test · 006-calidad-integrada

| Campo | Valor |
|---|---|
| **Spec** | [`spec.md`](./spec.md) · **Plan**: [`plan.md`](./plan.md) |
| **Evidencia** | [`evidence.md`](./evidence.md) |

---

## 1. Alcance

Esta spec no añade lógica de negocio: añade **gates**. Y un gate solo se puede probar de una
forma —viéndolo fallar cuando debe—, así que la estrategia entera se apoya en eso.

> **Un gate que nunca ha fallado no demuestra que exista.** Es la misma regla que la spec aplica a
> los tests de producto, aplicada a sí misma.

## 2. Mapa criterio → verificación

| RF | CA | Tarea | Nivel | Verificación |
|---|---|---|---|---|
| RF-01, RF-02 | CA-01, CA-02 | T-006-01 | estático | Revisión de `TEST-STRATEGY.md` §0/§8 y de la DoD |
| RF-05 | CA-08 | T-006-04, T-006-09 | contrato | `check-sdd`: paridad 20/25 y vocabulario de gates |
| RF-09 | CA-03 | T-006-10 | contrato | `check-sdd`: ninguna skill canónica con `](../` |
| RF-06, RF-12 | CA-05 | T-006-08 | integración | `test-install`: detect no escribe, `run --fast\|--slow` reparte |
| RF-14 | CA-05 | T-006-08, T-006-11 | integración | `test-install`: Husky en Node, `core.hooksPath` sin Node, `--no-hooks` |
| RF-04 | CA-04 | T-006-03 | integración | `sdd-project debt --json` sobre árbol sembrado |
| RF-16 | CA-06 | T-006-12 | integración | `check-sdd --strict`: CHANGELOG, bitácora e informes |
| — | CA-05 | T-006-11 | seguridad | `scan-secrets` con credencial y `.env` sembrados |
| RF-07, RF-08 | CA-07 | T-006-07, T-006-14 | contrato | `test-hooks`: sello de gates en cuatro escenarios |

## 3. Por nivel

**Contrato** — `check-sdd.mjs`. Paridad de agentes y skills, vocabulario de `checks.json`, rutas
relativas en skills, bit de ejecución de los hooks en el **índice de git**. Todo determinista y
agnóstico de sistema operativo.

**Guardas** — `test-hooks.mjs`, 56 comprobaciones. Incluye el sello: sin sello, sello de otro
árbol, sello en rojo, y que el aviso no convierta el `ask` en `deny`.

**Integración** — `test-install.mjs`, 141 comprobaciones sobre directorios temporales reales.
Instalación, idempotencia, actualización, allowlist fichero a fichero, y los tres caminos de
activación de hooks.

**Extremo a extremo, manual** — empaquetar con `npm pack`, extraer, instalar en un proyecto vacío
y comprobar las cinco superficies de IDE. Es el único nivel que detecta lo que ninguna suite ve:
así se encontró que la allowlist dejaba fuera ocho ficheros.

## 4. Casos límite cubiertos

| Caso | Dónde | Estado |
|---|---|---|
| Repositorio sin commits (primer commit) | sello: HEAD vacío en vez de renunciar a la huella | 🟢 |
| Directorio que no es repositorio git | `debt` y el sello declaran que no pueden medir | 🟢 |
| Proyecto sin lockfile | `deps-audit` no se sugiere ni se ejecuta | 🟢 |
| Runner sin umbral por ruta | Se declara en `evidence.md`, no se finge | 🟢 |
| `chmod` que falla | Avisa con el comando; no se calla | 🟢 |
| Windows sin bit de ejecución | La comprobación va sobre el índice, no sobre el disco | 🟢 |
| Marcador de deuda fuera de comentario | No cuenta: se exige que abra comentario | 🟢 |

## 5. Datos de prueba

Credenciales falsas compuestas **en ejecución**, nunca escritas enteras en el fichero de test: si
estuvieran literales, el propio escáner las detectaría — que es, de hecho, la prueba de que el
patrón funciona.

## 6. Criterio de suficiencia

Cobertura por tier declarada en `plan.md` §8.1 y **no impuesta por máquina aquí**: este
repositorio no tiene herramienta de cobertura. Declarado como control parcialmente ejecutado en
[`evidence.md`](./evidence.md) §3.

Lo que sí se exige:

- Los seis gates nuevos, **vistos fallar** antes de darlos por buenos.
- `check-sdd`, `test-hooks`, `test-install` y `skills-sync` en verde.
- Cero hallazgos en `scan-secrets`.
- Cero enlaces relativos rotos.

## 7. Qué NO se automatiza

| Control | Cómo se cubre |
|---|---|
| Bloqueo real del hook en Linux y macOS | Manual, pendiente. Es el defecto que motivó el arreglo del bit de ejecución y no se puede reproducir desde Windows |
| Ejecución de los workflows en un runner de GitHub | Manual, al primer PR |
| Importación de una skill en Lovable | Manual, solo el usuario tiene workspace |

Los tres están en [`evidence.md`](./evidence.md) §3 con dueño y próximo paso.
