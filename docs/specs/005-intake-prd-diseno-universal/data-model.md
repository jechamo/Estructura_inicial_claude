# Modelo documental · 005

| Entidad | Identificador | Relaciones mínimas |
|---|---|---|
| Objetivo | `OBJ-001` | uno o más `PRD-RF` |
| Requisito de producto | `PRD-RF-001` | objetivo, casos de uso, spec propuesta |
| Caso de uso | `UC-001` | actor, pre/postcondición, flujo, PRD-RF |
| Feature/spec propuesta | `FEAT-001` / `NNN-slug` | PRD-RF y UC cubiertos |
| Discrepancia | `DISC-001` | fuentes enfrentadas, decisión humana |
| Fuente | `SRC-001` | tipo, ubicación, fecha, acceso, hash opcional |
| Gate de producto | único | estado, fecha, actor, alcance aprobado |

Invariantes: IDs únicos; relaciones apuntan a IDs existentes; ninguna decisión humana se infiere;
hash `sha256` solo si el contenido es accesible; no se almacenan credenciales.
