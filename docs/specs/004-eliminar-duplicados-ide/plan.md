# Plan técnico · 004

## Componentes

1. Gate determinista: detectar colisiones de nombre entre skills canónicas y prompts/commands.
2. Pruebas del instalador: verificar ubicaciones, ausencia de duplicados, aviso Trust + Reload y
   paridad 20/23 en greenfield, brownfield e idempotencia.
3. Superficies: retirar prompts GitHub y commands Cursor redundantes; conservar adaptadores de
   agentes y skills que aportan metadatos propios del host.
4. Empaquetado: declarar una allowlist npm granular que incluya el runtime del instalador y excluya
   estado local e historia no distribuible.
5. Documentación: actualizar la matriz de compatibilidad y el árbol sin alterar el modelo SDD.

## Compatibilidad

- Node 18/20/22, Windows/Linux.
- Sin symlinks.
- Las fusiones JSON/JSONC existentes se mantienen.
- No se cambia código de aplicación de proyectos destino.

## Reversión

Revertir el commit de la spec 004 y retirar el tag no publicado. Una vez publicado, el tag no se
mueve: una regresión se corrige en una versión posterior.
