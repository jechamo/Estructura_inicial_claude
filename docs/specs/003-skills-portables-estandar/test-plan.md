# Plan de pruebas · 003-skills-portables-estandar

| CA | Comprobación |
|---|---|
| CA-01 | `node scripts/check-sdd.mjs` y validador oficial `quick_validate.py` sobre 23 skills |
| CA-02 | `node scripts/test-install.mjs`: inventario 23 y adaptador presente |
| CA-03 | `node scripts/skills-sync.mjs --check` y revisión estática de scripts |
| CA-04 | `npm run verify`, estado Git limpio, tag ausente antes de crearlo y presente en remoto después |
