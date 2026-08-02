# Modelo de datos · 002-portabilidad-instalador-universal

No hay persistencia de negocio. Los estados versionados son:

- **Registro de instalación**: versión, fecha, origen, modo, ficheros gestionados, hash y propiedad.
- **Operación**: tipo (`create`, `merge`, `update`, `skip`, `conflict`), ruta y motivo.
- **Check de proyecto**: nombre, comando, estado configurado y obligatoriedad.
- **Registro de skill externa**: política común y lista `entries`, vacía al instalar.

Invariantes: una ruta pertenece a una sola política; una semilla virgen solo se crea si falta; un
fichero del usuario no cambia sin bloque gestionado o fusión estructural válida.
