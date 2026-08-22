# Evidencias y convergencia · 017-circuito-proporcional-contexto

> Regla: **"pasa" sin ejecución no es un resultado. "No ejecutado" sí lo es** — y se escribe.

---

## 1. Ejecuciones

| Fecha/hora | Agente | Verificación | Tarea | Comando ejecutado | Resultado | Artefacto |
|---|---|---|---|---|---|---|
| 2026-08-22 | `implementer` | `declared-direct` | T-017-01 | `node -e "import('./scripts/test/contexto-recorte.mjs')…"` | 🔴 `0 correcta(s) · 4 fallo(s)`, las cuatro con `obtenido 'sin-modulo'` | `scripts/test/contexto-recorte.mjs` |
| 2026-08-22 | `implementer` | `declared-direct` | T-017-02 | mismo comando, tras crear `scripts/lib/contexto.mjs` | 🟢 4 de 5 en verde; la quinta seguía roja a propósito (`fail:CLAUDE.md`) porque es el rojo de T-017-03 | `scripts/lib/contexto.mjs` |
| 2026-08-22 | `implementer` | `declared-direct` | T-017-02 | `node scripts/sdd-project.mjs context --phase implement --json` | 🟢 `42481 B → 7474 B`, ahorro 82 % | salida JSON real |
| 2026-08-22 | `implementer` | `declared-direct` | T-017-02 | `node scripts/sdd-project.mjs context --phase inventada` | 🟢 error nombrando las fases declaradas; no devuelve recorte | salida real |
| 2026-08-22 | `implementer` | `declared-direct` | T-017-03 | `node scripts/test-hooks.mjs` | 🔴 `ENOENT … last-gate-run.json`: el `import` estático de `contexto.mjs` impedía cargar `sdd-project.mjs` donde ese fichero no estaba | traza de Node |
| 2026-08-22 | `implementer` | `declared-direct` | T-017-03 | `node scripts/test-hooks.mjs` tras añadir `contexto.mjs` a la allowlist del instalador y al fixture | 🟢 `186 correcta(s) · 0 fallo(s)` | `scripts/lib/manifiesto.mjs`, `scripts/test-hooks.mjs` |
| 2026-08-22 | `implementer` | `declared-direct` | T-017-03 | `node scripts/sdd-project.mjs run --fast` | 🟢 PASS 5/5 · sdd, lint, test, build, smells | salida real |
| 2026-08-22 | `implementer` | `declared-direct` | T-017-04 | tests de `scripts/test/resumen-gates.mjs` | 🔴 `0 ok · 2 fallo(s)` con `sin-modulo` → 🟢 `2 ok · 0 fallo(s)` | `scripts/lib/resumen-gates.mjs` |
| 2026-08-22 | `implementer` | `declared-direct` | T-017-04 | `node scripts/sdd-project.mjs run --fast --summary-json` | 🟢 PASS; salida real 12.654 B → resumen 1.721 B, ahorro 86 % | salida JSON real |
| 2026-08-22 | `implementer` | `declared-direct` | T-017-04 | `node scripts/sdd-project.mjs run --slow --summary-json` | 🟢 PASS; e2e 536/536; salida real 31.473 B → resumen 1.521 B, ahorro 95 % | salida JSON real |
| 2026-08-22 | `implementer` | `declared-direct` | T-017-05 | comprobación empírica del defecto antes de escribir el test | 🔴 `esLigero('Src/domain/pagos.ts', {permitido:['Src/'], prohibido:['src/domain/']})` devolvía `true`: un fichero de dominio como ligero | salida real |
| 2026-08-22 | `implementer` | `declared-direct` | T-017-05 | `scripts/test/circuito-frontera.mjs::deniega_variacion_de_caja` | 🔴 `fail-la-negacion-se-esquiva-con-la-caja` → 🟢 tras plegar la caja en `cubre()` | `scripts/lib/circuito.mjs` |
| 2026-08-22 | `implementer` | `declared-direct` | T-017-05 | `node scripts/sdd-project.mjs run --slow` | 🟢 PASS 4/4; `test-install` 536/536: plegar la caja no rompió la frontera existente | salida real |

### Defectos encontrados por el propio ciclo

**1 · Un módulo nuevo no se instalaba.**

El rojo de `test-hooks` no era un fallo del test: `scripts/lib/` es una **allowlist** explícita en
`debeCopiar()` (`scripts/lib/manifiesto.mjs`), de modo que un módulo nuevo no se instala salvo que
se declare. Sin ese arreglo, `context --phase` habría fallado en **todos** los proyectos instalados
mientras funcionaba en la plantilla. Lo detectó el fixture que copia el conjunto mínimo de ficheros,
no una revisión visual.

**2 · La frontera se podía esquivar con la caja, pero no como se había descrito.** La
descripción inicial —«cambiar una mayúscula esquiva la prohibición»— era imprecisa, y se
comprobó antes de escribir el test. Cambiar la caja de la ruta por sí solo cae del lado
seguro: no casa con el permiso y el resultado es circuito completo. Lo explotable es la
combinación `permitido: ["Src/"]` (la caja real del disco en Windows) con
`prohibido: ["src/domain/"]` (la que trae la semilla): el permiso casa, la negación no
alcanza, y un fichero de dominio sale ligero. Se corrigió la redacción de `spec.md` §1 antes
de implementar.

## 2. Trazabilidad requisito → test

| OBJ | PRD-RF | UC | RF | CA | Tarea | Implementación | Test | Resultado |
|---|---|---|---|---|---|---|---|---|
| OBJ-004 | PRD-RF-008 | UC-005 | RF-01 | CA-01 | T-017-02 | `scripts/lib/contexto.mjs` `recortar()` | `scripts/test/contexto-recorte.mjs::recorta_solo_las_secciones_de_la_fase` | 🟢 |
| OBJ-004 | PRD-RF-008 | UC-005 | RF-02 | CA-02 | T-017-02 | `scripts/lib/contexto.mjs` `indexar()` | `scripts/test/contexto-recorte.mjs::falla_cerrado_y_conserva_invariantes` | 🟢 |
| OBJ-004 | PRD-RF-008 | UC-005 | RF-03 | CA-01 | T-017-02 | `scripts/lib/contexto.mjs` opciones `sensible`/`usabilidad` | `scripts/test/contexto-recorte.mjs::la_trazabilidad_de_seguridad_solo_llega_si_la_spec_es_sensible` | 🟢 |
| OBJ-004 | PRD-RF-008 | UC-005 | RF-04 | CA-03 | T-017-03 | `CLAUDE.md`, `AGENTS.md`, `.github/copilot-instructions.md`, `.agents/rules/00-core.md`, `.cursor/rules/00-core.mdc`, `scripts/lib/manifiesto.mjs` | `scripts/test/contexto-recorte.mjs::ninguna_superficie_exige_el_documento_completo` | 🟢 |
| OBJ-004 | PRD-RF-007 | UC-005 | RF-05 | CA-04 | T-017-04 | `scripts/lib/resumen-gates.mjs` | `scripts/test/resumen-gates.mjs::resume_comando_codigo_conteos_y_ejecucion` | 🟢 |
| OBJ-004 | PRD-RF-007 | UC-005 | RF-06 | CA-04 | T-017-04 | `scripts/lib/resumen-gates.mjs` | `scripts/test/resumen-gates.mjs::la_salida_completa_sigue_recuperable_por_identificador` | 🟢 |
| OBJ-001 | PRD-RF-001 | UC-003 | RF-10 | CA-08 | T-017-05 | `scripts/lib/circuito.mjs` `cubre()` | `scripts/test/circuito-frontera.mjs::deniega_variacion_de_caja` | 🟢 |
| OBJ-002 | PRD-RF-003 | UC-002 | RF-07 | CA-05 | T-017-06 | pendiente | `scripts/test/circuito-frontera.mjs::clasifica_en_tres_niveles_con_full_por_defecto` | ⏸️ |
| OBJ-002 | PRD-RF-003 | UC-002 | RF-08 | CA-06 | T-017-06 | pendiente | `scripts/test/circuito-frontera.mjs::clasifica_rutas_previstas_con_arbol_limpio` | ⏸️ |
| OBJ-002 | PRD-RF-004 | UC-004 | RF-09 | CA-07 | T-017-06 | pendiente | `scripts/test/circuito-frontera.mjs::un_ejecutable_nunca_es_ligero` | ⏸️ |
| OBJ-001 | PRD-RF-001 | UC-003 | RF-12 | CA-10 | T-017-06 | pendiente | `scripts/test/circuito-frontera.mjs::la_frontera_heredada_sigue_habilitando_solo_light` | ⏸️ |
| OBJ-001 | PRD-RF-001 | UC-003 | RF-11 | CA-09 | T-017-07 | pendiente | `scripts/test/circuito-frontera.mjs::sin_aprobacion_no_hay_atajo` | ⏸️ |
| OBJ-002 | PRD-RF-003 | UC-002 | RF-13 | CA-11 | T-017-08 | pendiente | `scripts/test/circuito-frontera.mjs::el_documento_compacto_declara_limites_verificables` | ⏸️ |

- [x] Todo `CA` de la spec aparece en esta tabla
- [x] Cada test citado como 🟢 se ha ejecutado y su salida está arriba
- [x] Ningún OBJ, PRD-RF, UC, RF, CA o tarea referenciado es huérfano

### Gates humanos verificados

| Gate | Estado | Quién | Fecha |
|---|---|---|---|
| Especificación | aprobado | Jorge Enrique Chamorro Rodriguez | 2026-08-22 |
| Plan técnico | aprobado | Jorge Enrique Chamorro Rodriguez | 2026-08-22 |
| Entrega | pendiente | — | — |

## 3. Controles NO ejecutados

| Control | Por qué | Riesgo | Dueño | Siguiente paso |
|---|---|---|---|---|
| CI multi-OS y multiversión de Node | No hay forma de ejecutar GitHub Actions desde esta sesión | Una regresión específica de plataforma o de versión quedaría sin detectar | quien empuje la rama | Empujar y leer `quality-gates.yml` y `sdd-gates.yml` |
| Benchmark 017 | Corresponde a T-017-09, todavía no alcanzada | Los umbrales de `spec.md` §2 aún no están demostrados | `implementer` | Ejecutar el harness ampliado en T-017-09 |
| Auditoría independiente de seguridad | Corresponde a T-017-09 | Los tres controles están ejercidos por test pero no auditados por un tercero | `security-auditor` | `/security-scan verify` en T-017-09 |

### 3.0 · Evidencia documental

| DOC-ID | Tarea | Artefacto | Comprobación | Resultado | Estado |
|---|---|---|---|---|---|
| DOC-CONTEXTO | T-017-03 | `docs/sdd/OPERATING-MODEL.md` (mapa de lectura), `CLAUDE.md`, `AGENTS.md` y las reglas de Copilot, Cursor y genéricas | `scripts/test/contexto-recorte.mjs::ninguna_superficie_exige_el_documento_completo` + `check-sdd --docs-diff` en CI | 🟢 test semántico ejecutado; 186/186 | implementado; comprobación de CI pendiente de T-017-09 |
| DOC-CIRCUITO | T-017-08 | docs/sdd/OPERATING-MODEL.md §2.6 | `scripts/test/circuito-frontera.mjs::el_documento_compacto_declara_limites_verificables` | ⏸️ no ejecutado | pendiente |

### 3.1 · Controles de seguridad ejecutados

| Control | Tarea | Test / comando ejecutado | Resultado | Evidencia | Estado |
|---|---|---|---|---|---|
| SEC-CONTEXT-001 | T-017-02 | `scripts/test/contexto-recorte.mjs::falla_cerrado_y_conserva_invariantes` | 🔴 correcto → 🟢; las invariantes §0, §7 y §13 están en las once fases declaradas; sección ausente, duplicada o fase desconocida lanzan error nombrando la causa | `scripts/lib/contexto.mjs` | verificado |
| SEC-CIRCUIT-001 | T-017-05 | `scripts/test/circuito-frontera.mjs::deniega_variacion_de_caja` | 🔴 la negación se esquivaba con la caja → 🟢 tras plegarla; negación prevalente, traversal y ruta absoluta siguen rechazados, y plegar no convierte un permiso legítimo en prohibición | `scripts/lib/circuito.mjs` | verificado (parcial: gramática sin comodines y suelo por ejecutable llegan en T-017-06) |
| SEC-CIRCUIT-002 | T-017-07 | `scripts/test/circuito-frontera.mjs::sin_aprobacion_no_hay_atajo` | ⏸️ no ejecutado | — | no ejecutado (tarea no alcanzada) |

**Informe de seguridad**: pendiente de `/security-scan verify` en T-017-09.

### 3.2 · Controles de usabilidad ejecutados

No aplica. Motivo material heredado de `spec.md`: la spec amplía un CLI y ficheros de
configuración; no crea pantalla, formulario, texto que lea una persona en una interfaz ni espera
perceptible. En T-017-09 se verificará que no haya aparecido una superficie interactiva accidental.

## 3 bis. Cobertura, deuda y observabilidad

El trinquete de cobertura y el de tamaño siguen verdes: `run --fast` PASS incluye `smells`, con el
mayor fichero dentro del límite. La cobertura se mide en los gates lentos, en T-017-09.

## 4. Convergencia

Medición real del recorte sobre `docs/sdd/OPERATING-MODEL.md` (42.481 B tras añadir el mapa):

| Fase | Recorte | Ahorro | Con `--sensible --usabilidad` |
|---|---:|---:|---:|
| `specify` · `clarify` | 4.592 B | 89 % | 10.908 B · 73 % |
| `design` | 2.381 B | 94 % | 5.545 B · 87 % |
| `plan` · `tasks` | 5.048 B | 88 % | igual |
| `implement` | 7.474 B | 82 % | igual |
| `verify` · `ship` | 4.100 B | 90 % | 10.416 B · 75 % |
| `light` · `compact` | 5.624 B | 86 % | igual |
| `orchestrate` | 5.007 B | 88 % | igual |

Estas cifras son bytes de documento, **no tokens ni cuota de proveedor**. La conversión a tokens y
la comparación con la línea base de la spec 011 corresponden al benchmark de T-017-09, y hasta
entonces no se presentan como ahorro de consumo.

### 6.3 · Estado al cerrar T-017-03

- 🟢 T-017-01, T-017-02 y T-017-03 hechas: RF-01 a RF-04 y CA-01 a CA-03 cubiertos con test
  ejecutado.
- 🟢 `SEC-CONTEXT-001` verificado con caso adverso real.
- ⏸️ T-017-04 a T-017-09 pendientes; sus RF y CA figuran arriba como no ejecutados.
- ⏸️ No se declara `GO`: faltan seis tareas, el benchmark y la auditoría independiente.

## 5. Decisión de entrega

Pendiente. No hay decisión de entrega mientras queden tareas sin ejecutar y el benchmark de §2 no
esté medido.
