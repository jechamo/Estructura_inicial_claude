# Modelo de datos · 004

No introduce datos de aplicación. El contrato relevante es un conjunto de nombres normalizados:

- `agentNames`: 20 nombres canónicos con paridad por host.
- `skillNames`: 23 nombres canónicos.
- `hostCommandNames`: nombres adicionales del host, cuya intersección con `skillNames` debe ser vacía.
- `packageFiles`: allowlist explícita de rutas distribuibles.
