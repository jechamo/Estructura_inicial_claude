# Plan · 003-skills-portables-estandar

1. Convertir las restricciones oficiales del frontmatter en checks deterministas sin dependencias.
2. Mantener las extensiones de Claude exclusivamente en sus adaptadores.
3. Instalar `skill-creator` completa en la ubicación canónica portable y añadir el adaptador Claude.
4. Registrar commit, licencia, scripts, red, escrituras y comandos externos auditados.
5. Verificar instalación limpia, gates estrictos y empaquetado; cerrar changelog y release SemVer.

Reversión: eliminar la skill y su adaptador, restaurar el conteo anterior y revertir el commit de
esta spec. Un tag publicado no se mueve: una corrección posterior usa una versión nueva.
