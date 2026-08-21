# Informe de calidad · 016-cobertura-ssrf-egress

- Fecha: 2026-08-21
- Alcance: contrato portable SSRF/egress, instalación, documentación y regresión concurrente
- Veredicto: **APTO PARA ENTREGA**
- Hallazgos abiertos: bloqueantes 0 · mayores 0 · menores 0
- Usabilidad: `sin-ui`

## Verificaciones

- Sintaxis de los tres scripts revisados: PASS.
- `node scripts/check-smells.mjs`: PASS; mayor fichero 3826/3831 líneas y mayor función 304/304.
- `node scripts/check-sdd.mjs --json --strict --spec 016`: PASS; 0 problemas y 0 avisos.
- `git diff --check`: PASS.
- `node scripts/test-install.mjs`: 536/536.
- `node scripts/sdd-project.mjs run --fast --json`: PASS.
- `node scripts/sdd-project.mjs run --slow --json`: PASS; secrets 575/0, cobertura 50,3 %
  sobre 2900 líneas (umbral 48,3 %), a11y 3 páginas y E2E 536/536.

## Revisión independiente

La primera revisión detectó dos hallazgos mayores: el deadline podía eludirse durante una rotación
continua del lock y dos cláusulas CORE de SSRF carecían de regresiones negativas. Ambos se
corrigieron en TDD y la segunda revisión confirmó:

- el deadline se comprueba antes de validar o reintentar `ENOENT`;
- el preload fuerza de forma determinista `EEXIST → lstat → ENOENT`;
- el harness limita sus aserciones al bloque SSRF/egress;
- las mutaciones negativas fallan al retirar motivo/revisión o la separación entre aplicabilidad,
  estado, decisión y evidencia;
- no aparecen regresiones nuevas ni se debilita el comportamiento fail-closed.

La matriz Windows/Linux × Node 18/20/22 y los smokes vivos de los seis hosts son gates de release
posteriores al push. No se presentan como ejecutados ni como PASS en este informe local.

### HANDOFF
- Agente origen: code-reviewer
- Fase completada: segunda revisión independiente de `/sdd-verify`
- Fuentes consultadas: diff corregido, spec/evidencia 010 y 016, tests de concurrencia y contratos SSRF
- Alcance: corrección del lock, harness SSRF y evidencia asociada
- Requisitos / casos cubiertos: CA-06, CA-12, SEC-SSRF-006/007 y regresión concurrente T-010-03
- Discrepancias: ninguna
- Hallazgos: bloqueantes 0 · mayores 0 · menores 0
- Veredicto: APTO PARA ENTREGA
- Siguiente agente sugerido: security-auditor; después release-manager
