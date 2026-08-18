# Landing de instalación

Interfaz local para instalar el ecosistema SDD en un proyecto sin escribir comandos a mano.
Vive fuera del circuito SDD/TDD: es una herramienta de acompañamiento, no una funcionalidad del
producto, y por eso no tiene spec, plan ni tareas asociadas.

```bash
npm run web            # arranca en http://127.0.0.1:4173 y abre el navegador
node web/server.mjs --port 5000 --no-open
```

## Qué hace

Tres pasos, cada uno esperando confirmación explícita:

1. **Simulación** — `npx --yes github:jechamo/Estructura_inicial_claude init "<ruta>" --mode auto --dry-run`.
   No escribe nada. Sirve para ver qué haría la instalación real antes de correr el riesgo.
2. **Instalación real** — el mismo comando sin `--dry-run`.
3. **Verificación** — `node scripts/check-sdd.mjs` dentro del destino. Compara la salida obtenida
   con la esperada: `20 agente(s) · 27 skill(s)`.

El paso 2 permanece bloqueado hasta que la simulación termina bien y se confirma; el 3 hasta que
termina la instalación. La interfaz nunca encadena pasos por su cuenta.

## Decisiones que conviene conocer

**Solo rutas locales.** El destino es una carpeta del equipo, validada en el servidor: absoluta,
sin caracteres de control, y con avisos si ya contiene una instalación previa o no es un
repositorio Git. No se clona nada desde una URL.

**Nunca se abre un intérprete de comandos.** `npx` es un `.cmd` en Windows y Node ya no lo lanza
sin shell. En vez de concatenar una cadena, se resuelve `npx-cli.js` junto al ejecutable de Node y
se ejecuta `node npx-cli.js …` con los argumentos en un array. Si no se encuentra, se recurre al
shell solo si la ruta se validó libre de metacaracteres, y queda registrado en el log.

**El modo TLS permisivo es un préstamo, no un ajuste.** Inyecta `NODE_TLS_REJECT_UNAUTHORIZED=0` y
`npm_config_strict_ssl=false` en el entorno del proceso hijo y en ningún sitio más: no toca
`.npmrc`, ni la configuración global, ni el proceso del servidor. Existe porque una CA corporativa
o un proxy rompen la descarga antes de que empiece nada, y sin él el usuario solo vería un error
de certificado sin salida. Se avisa en rojo en la interfaz y se deja constancia en el log.

**El servidor escucha solo en el bucle local.** Se enlaza a `127.0.0.1`, valida la cabecera `Host`
—403 si no es local— y exige un testigo aleatorio por sesión en la cabecera `x-sdd-token` para
cualquier ruta bajo `/api`. El testigo se inyecta en el HTML al servirlo y viaja en cabecera, no
en la URL, para que no acabe en el historial ni en un registro. La CSP no permite `script-src`
inline; el único origen externo autorizado es `cdn.jsdelivr.net`, y solo para dibujar diagramas.

**El flujo de salida usa `fetch` en vez de `EventSource`.** `EventSource` no admite cabeceras, así
que habría obligado a poner el testigo en la URL: exactamente lo que se quería evitar.

## Endpoints

| Ruta | Método | Devuelve |
|---|---|---|
| `/api/health` | GET | versión, plataforma y si la memoria está disponible |
| `/api/validate-path` | POST | validación de la ruta destino con avisos |
| `/api/preview` | POST | el comando exacto que se ejecutaría |
| `/api/run` | POST | identificador de la ejecución lanzada |
| `/api/run/:id/stream` | GET | flujo de eventos del proceso |
| `/api/run/:id/cancel` | POST | detiene el árbol de procesos |
| `/api/memoria` | GET | `docs/TFM/MEMORIA-SISTEMA-AGENTES.md` sin modificar |

## Sección de documentación

Renderiza la memoria completa —los once capítulos y los seis anexos— con un renderizador de
Markdown propio, sin dependencias. Construye nodos del DOM en vez de concatenar HTML, de modo que
el contenido del documento no puede convertirse en marcado ejecutable. Los diagramas Mermaid se
cargan bajo demanda desde el CDN y, si no hay red, degradan a su código fuente en vez de dejar un
hueco.

## Qué no se instala

`web/` está excluido del manifiesto de instalación (`scripts/lib/manifiesto.mjs`): la landing
instala la plantilla, no se instala con ella.
