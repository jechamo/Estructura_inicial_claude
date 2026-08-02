# Plan de pruebas · 002-portabilidad-instalador-universal

| CA | Nivel | Caso |
|---|---|---|
| CA-01 | integración | instalar en directorio vacío y validar snapshot/invariantes vírgenes |
| CA-02 | integración | instalar y actualizar fixtures brownfield con contenido centinela |
| CA-03 | contrato | validar agentes, skills y configuraciones de hooks por host |
| CA-04 | estructura | validar allowlists, profundidad y niveles de evidencia |
| CA-05 | unitario/integración | introducir derivas y comprobar fallo de `check-sdd` |
| CA-06 | integración | inventario, status, new-spec y new-adr deterministas |
| CA-07 | integración | instalación sin MCP y selección explícita sin secretos |
| CA-08 | integración | comparar hashes del destino antes/después de `--dry-run` |

Casos adicionales: espacios en ruta, destino inexistente, JSONC malformado, segunda instalación,
actualización de fichero intacto/modificado y ejecución en Windows/Linux.
