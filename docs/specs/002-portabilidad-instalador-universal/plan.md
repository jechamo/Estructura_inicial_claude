# Plan técnico · 002-portabilidad-instalador-universal

## Resumen

Separar el motor reusable del estado histórico de la plantilla, publicar skills en la ubicación
neutral, adaptar hooks por host y convertir el instalador en una operación transaccional,
idempotente y consciente de greenfield/brownfield.

## Componentes

1. **Fuentes canónicas y adaptadores**: skills en `.agents/skills`, perfiles en
   `.claude/agents`, hooks ejecutables en `.sdd/hooks` y configuraciones por host.
2. **Manifiesto de distribución**: clasifica rutas como copiadas, fusionadas, vírgenes,
   generadas, opcionales o exclusivas de la plantilla.
3. **Motor de instalación**: resuelve destino y modo, prepara operaciones, detecta conflictos,
   aplica escrituras seguras y registra propiedad/hashes.
4. **CLI de proyecto**: inventario, estado, scaffolding y verificación compacta.
5. **Gates**: validan paridad, formatos, estado virgen, trazabilidad y contratos del instalador.

## Compatibilidad

- Se conserva el comando sin destino, que opera sobre el directorio actual.
- Los ficheros existentes nunca se reemplazan por contenido de plantilla no gestionado.
- `update` no vuelve a aplicar semillas vírgenes.
- No se introducen dependencias de runtime.

## Riesgos

- Los hosts tienen respuestas de hook diferentes: un adaptador de salida central evita mezclarlas.
- VS Code puede descubrir dos fuentes: su configuración desactiva la duplicada.
- Los cambios mecánicos de 22 skills requieren un gate de paridad.
