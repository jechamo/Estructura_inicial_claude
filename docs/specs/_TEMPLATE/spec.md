# NNN · <Título de la funcionalidad>

| Campo | Valor |
|---|---|
| **ID** | `NNN-slug` |
| **Estado** | borrador \| en clarificación \| aprobada \| en implementación \| entregada |
| **Autor** | |
| **Fecha** | YYYY-MM-DD |
| **Rama** | `feature/NNN-slug` |
| **Depende de** | <otras specs, o "ninguna"> |

> ⚠️ Esta spec describe **QUÉ** y **POR QUÉ**. Cero tecnología: ni tablas, ni endpoints,
> ni frameworks, ni nombres de clase. Eso va en `plan.md`.

---

## 1. Problema

<Qué duele hoy. A quién. Con qué frecuencia. Qué coste tiene no arreglarlo.>

## 2. Objetivo y métrica de éxito

**Objetivo**: <en una frase>

**Cómo sabremos que funcionó**:
- <métrica con número y plazo. No vale "mejor experiencia">

## 3. Usuarios y contexto de uso

| Perfil | Qué necesita | Frecuencia | Contexto |
|---|---|---|---|
| | | | |

## 4. Requisitos funcionales (EARS)

> Formatos: `El sistema DEBE …` · `CUANDO <disparador>, el sistema DEBE …` ·
> `MIENTRAS <estado>, el sistema DEBE …` · `SI <condición no deseada>, ENTONCES el sistema DEBE …`

- **RF-01** — <requisito atómico y verificable>
- **RF-02** — <…>

## 5. Requisitos no funcionales

> No los omitas: es el error más común y el que más caro sale.

| Categoría | Requisito | Valor objetivo |
|---|---|---|
| Rendimiento | | p95 < ___ ms |
| Disponibilidad | | ___ % |
| Escala | | ___ usuarios / ___ registros |
| Seguridad y privacidad | ¿hay PII? ¿nivel ASVS? | |
| Accesibilidad | WCAG 2.2 AA | |
| Internacionalización | | |
| Observabilidad | | |
| Coste | | |
| Retención de datos | | |

## 6. Criterios de aceptación

> Uno por comportamiento. Si no sabes escribir el test, el requisito no está claro.

### CA-01 — <nombre> *(cubre RF-01)*
```gherkin
Escenario: <nombre>
  Dado <contexto>
  Cuando <acción>
  Entonces <resultado observable>
```

## 7. Casos límite

| Situación | Comportamiento esperado |
|---|---|
| Entrada vacía | |
| Valor en el límite exacto | |
| Dos usuarios a la vez | |
| Usuario sin permisos | |
| Sistema externo caído | |
| Petición repetida (idempotencia) | |
| Datos existentes corruptos | |

## 8. Reglas de negocio

- **RN-01** — <invariante que debe cumplirse siempre>

## 9. Fuera de alcance

> Tan importante como el alcance. Defensa contra el scope creep.

- <lo que esta spec NO hace, y por qué>

## 10. Riesgos y dependencias

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| | | | |

## 11. Supuestos

> Decisiones tomadas por el agente ante la falta de información. **El usuario debe validarlas.**

- <supuesto>

## 12. Glosario

| Término | Definición |
|---|---|
| | |

## 13. Preguntas abiertas

- `[NEEDS CLARIFICATION: <pregunta>]`
