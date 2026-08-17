# Casos de uso de producto

> Estado: `pending`. Describe el comportamiento del ecosistema tal y como se somete a aprobación.

## UC-001 · Instalar el circuito sobre un repositorio que ya tiene trabajo

- **Actor**: quien mantiene el repositorio
- **Cubre**: `PRD-RF-005`, `PRD-RF-006`
- **Precondiciones**: el destino es un repositorio git con contenido propio y Node 18 o superior
- **Disparador**: se ejecuta el instalador apuntando al repositorio
- **Flujo principal**: el instalador detecta el modo, calcula qué ficheros faltan, escribe únicamente los que no existen, siembra los documentos base vacíos y deja registro de la instalación
- **Alternativas y errores**: si un fichero ya existe se conserva intacto y se informa; si el destino es la propia plantilla, la raíz del disco o el directorio personal, la instalación se rechaza
- **Postcondiciones**: los seis entornos comparten la misma definición de agentes y skills, y ningún fichero previo ha cambiado

## UC-002 · Llevar una funcionalidad de la idea a la entrega

- **Actor**: quien desarrolla con un agente
- **Cubre**: `PRD-RF-003`
- **Precondiciones**: el baseline de producto está aprobado
- **Disparador**: se pide una funcionalidad nueva
- **Flujo principal**: se escribe la spec con criterios verificables, se resuelven las ambigüedades, se planifica, se trocea en tareas con su test, se implementa en ciclo rojo-verde-refactor y se verifica antes de entregar
- **Alternativas y errores**: si la spec conserva ambigüedades no se planifica; si una tarea no tiene test nombrado no puede declararse hecha
- **Postcondiciones**: cada criterio de aceptación enlaza tarea, test y evidencia con resultado ejecutado

## UC-003 · Impedir una acción destructiva o una fuga de secretos

- **Actor**: el agente en ejecución, supervisado por la persona
- **Cubre**: `PRD-RF-001`, `PRD-RF-002`
- **Precondiciones**: las guardas están instaladas en el host
- **Disparador**: el agente intenta escribir un fichero o ejecutar un comando
- **Flujo principal**: la guarda clasifica la acción y la permite, la bloquea o la escala a la persona antes de que ocurra
- **Alternativas y errores**: si el host no soporta escalado, la duda se convierte en bloqueo; si la acción toca ficheros de entorno o credenciales, se bloquea siempre
- **Postcondiciones**: ninguna acción peligrosa se ejecuta sin decisión humana y queda constancia de la decisión

## UC-004 · Ejecutar los gates antes de comprometer y de publicar

- **Actor**: quien desarrolla con un agente
- **Cubre**: `PRD-RF-004`
- **Precondiciones**: el proyecto ha declarado sus gates
- **Disparador**: se va a registrar un commit o a publicar la rama
- **Flujo principal**: se ejecutan los gates rápidos antes del commit y los lentos antes del push, y el resultado se sella sobre el árbol de trabajo real
- **Alternativas y errores**: un gate que el proyecto no tiene se declara ausente con su motivo; un sello que no corresponde al árbol actual no vale
- **Postcondiciones**: lo que no se ha ejecutado es visible y está justificado por escrito

## UC-005 · Retomar el trabajo sin releer el repositorio

- **Actor**: quien desarrolla con un agente
- **Cubre**: `PRD-RF-007`, `PRD-RF-008`
- **Precondiciones**: existe al menos una spec en curso
- **Disparador**: empieza una sesión nueva
- **Flujo principal**: se consulta el estado del circuito con un comando determinista y se carga únicamente el conocimiento de proceso que la fase actual necesita
- **Alternativas y errores**: si todavía no hay instalación registrada, el estado se devuelve igualmente como estado de plantilla, sin inventar aprobaciones
- **Postcondiciones**: la sesión arranca con el contexto suficiente sin lectura exploratoria del repositorio completo
