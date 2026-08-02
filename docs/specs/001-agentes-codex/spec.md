# 001 · Agentes SDD nativos en Codex

| Campo | Valor |
|---|---|
| **ID** | `001-agentes-codex` |
| **Estado** | entregada |
| **Autor** | usuario + `spec-analyst` (`declared-direct`) |
| **Fecha** | 2026-08-02 |
| **Rama** | `main` — entrega directa solicitada por el usuario |
| **Depende de** | ninguna |

> Aprobación: solicitud explícita del usuario del 2026-08-02 para actualizar el repositorio,
> habilitar sus agentes en Codex sin alterar el acceso de los demás IDE y entregar en `main`.

---

## 1. Problema

El repositorio define veinte agentes especializados, pero Codex solo recibe las reglas generales.
Quien usa Codex no puede seleccionar esos perfiles como subagentes del proyecto y la documentación
vigente afirma que solo pueden configurarse fuera del repositorio.

## 2. Objetivo y métrica de éxito

**Objetivo**: ofrecer en Codex los mismos veinte roles SDD, manteniendo una sola definición
canónica y sin modificar las integraciones existentes.

**Cómo sabremos que funcionó**:

- 20/20 perfiles canónicos tienen un agente de proyecto reconocible por Codex.
- 20/20 perfiles continúan disponibles en las superficies ya existentes.
- La instalación limpia y el gate determinista terminan con código de salida 0.

## 3. Usuarios y contexto de uso

| Perfil | Qué necesita | Frecuencia | Contexto |
|---|---|---|---|
| Desarrollador que usa Codex | Delegar una tarea al rol SDD adecuado | En cada fase SDD | Codex app, CLI o extensión IDE sobre el repositorio |
| Mantenedor de la plantilla | Evitar deriva entre perfiles | En cada cambio del catálogo | CI y actualización de la plantilla |

## 4. Requisitos funcionales (EARS) con prioridad MoSCoW

| Id | Requisito | Prioridad | Esfuerzo |
|---|---|---|---|
| **RF-01** | El sistema DEBE exponer en Codex los veinte roles definidos por el proyecto. | M | 3 |
| **RF-02** | MIENTRAS se añade el soporte de Codex, el sistema DEBE conservar sin cambios funcionales el acceso existente desde los demás IDE. | M | 2 |
| **RF-03** | El sistema DEBE explicar la estructura y el modo de invocación de los agentes en Codex. | M | 1 |
| **RF-04** | CUANDO la plantilla se instala en otro proyecto, el sistema DEBERÍA incluir la superficie de agentes de Codex. | S | 2 |
| **RF-05** | SI falta o deriva un agente de Codex, ENTONCES el sistema PODRÍA detectarlo mediante el gate determinista. | C | 2 |

### Reparto MoSCoW

| Prioridad | Esfuerzo | % | Límite recomendado |
|---|---:|---:|---|
| Must | 6 | 60 % | ≤ 60 % |
| Should | 2 | 20 % | ~20 % |
| Could | 2 | 20 % | ~20 % |
| **Total** | **10** | **100 %** | |

**Won't have this time**:

| Id | Qué se descarta | Por qué ahora no | ¿Volverá? |
|---|---|---|---|
| **RF-W01** | Hooks nativos de Codex equivalentes a los de Claude/Cursor | Codex no publica esa superficie para el repositorio | Solo si la plataforma la incorpora |
| **RF-W02** | Instalación global de los agentes de Codex | El alcance solicitado es este repositorio | En una spec independiente si se solicita |

## 5. Requisitos no funcionales

| Categoría | Requisito | Valor objetivo |
|---|---|---|
| Compatibilidad | No degradar integraciones existentes | 0 ficheros modificados bajo `.claude/agents`, `.github/agents`, `.cursor/agents` y `.agents/workflows` |
| Mantenibilidad | Conservar una sola fuente canónica | 100 % de los agentes de Codex referencian su perfil canónico |
| Seguridad | Mantener sin escritura a los roles auditores | 4/4 roles declarados de solo lectura en Codex |
| Dependencias | No añadir paquetes | 0 dependencias nuevas |

## 6. Criterios de aceptación

### CA-01 · Catálogo completo en Codex *(cubre RF-01)*
```gherkin
Escenario: el proyecto se abre con una versión actual de Codex
  Dado que existen veinte perfiles canónicos
  Cuando Codex carga la configuración del proyecto
  Entonces encuentra veinte agentes personalizados con nombre, descripción e instrucciones
```

### CA-02 · Superficies existentes intactas *(cubre RF-02)*
```gherkin
Escenario: se añade la superficie de Codex
  Dado que Claude Code, VS Code, Copilot, Cursor y Antigravity ya tienen sus adaptadores
  Cuando se revisa el cambio
  Entonces esos adaptadores no presentan cambios funcionales ni pierden perfiles
```

### CA-03 · Estructura documentada *(cubre RF-03)*
```gherkin
Escenario: una persona consulta cómo funciona Codex en la plantilla
  Cuando lee la documentación de compatibilidad
  Entonces identifica la ubicación, el esquema mínimo, la fuente canónica y las limitaciones
```

### CA-04 · Instalación por proyecto *(cubre RF-04)*
```gherkin
Escenario: se instala la plantilla en un directorio vacío
  Cuando termina el instalador por proyecto
  Entonces la configuración y los agentes de Codex están presentes en el destino
```

### CA-05 · Detección de deriva *(cubre RF-05)*
```gherkin
Escenario: falta un agente de Codex
  Dado que el catálogo canónico conserva los veinte perfiles
  Cuando se ejecuta el gate determinista
  Entonces el gate falla e identifica la superficie incompleta
```

## 7. Casos límite

| Situación | Comportamiento esperado |
|---|---|
| Perfil canónico sin envoltorio | El gate falla con el nombre ausente |
| Envoltorio sin perfil canónico | El gate falla por deriva |
| Configuración de Codex ya existente al instalar | No se sobrescribe; se entrega como conflicto revisable |
| Rol auditor | Se carga en modo de solo lectura |
| Codex sin soporte de subagentes | Las reglas generales siguen disponibles mediante `AGENTS.md` |

## 8. Reglas de negocio

- **RN-01** — `.claude/agents/` continúa siendo la definición canónica de los veinte roles.
- **RN-02** — La superficie de Codex es un adaptador fino; no duplica las instrucciones del rol.
- **RN-03** — Solo `orchestrator`, `planner` e `implementer` pueden encadenar delegaciones según la constitución.

## 9. Fuera de alcance

- Cambiar perfiles, comandos, hooks o settings de Claude Code, VS Code, Copilot, Cursor o Antigravity.
- Añadir MCP, plugins, modelos fijados o credenciales a los agentes de Codex.
- Proporcionar botones de handoff o hooks que Codex no soporte.

## 10. Riesgos y dependencias

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Evolución del esquema TOML de Codex | Media | Medio | Esquema mínimo, documentación oficial enlazada y gate local |
| Deriva entre adaptador y perfil canónico | Media | Alto | Referencia obligatoria y paridad validada |
| Conflicto con configuración propia del proyecto destino | Baja | Medio | Política del instalador de no sobrescritura |

## 11. Supuestos

- La solicitud explícita del usuario aprueba este alcance cerrado y la entrega directa en `main`.
- La versión de Codex utilizada soporta agentes de proyecto, como documenta OpenAI el 2026-08-02.

## 12. Glosario

| Término | Definición |
|---|---|
| Perfil canónico | Definición completa del rol bajo `.claude/agents/` |
| Adaptador Codex | TOML mínimo que registra el rol y remite al perfil canónico |

## 13. Preguntas abiertas

Ninguna.
