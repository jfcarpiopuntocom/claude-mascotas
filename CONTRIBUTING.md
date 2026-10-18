# Contribuir a claude-mascotas

¡Gracias! La forma más bonita de ayudar es **agregar una mascota**.

## Agregar una mascota

1. En `plugin/mascota.config.json`, dentro de `creatures`, agrega una clave nueva (minúsculas, sin tildes):

   ```json
   "capibara": {
     "name": "Capibara",
     "calm":     ["(o..o)", "(-..o)"],
     "working":  ["(O..O)", "(o..O)"],
     "agents":   ["(o..o)/", "(o..o)\\"],
     "error":    ["(x..x)", "(;..;)"],
     "sleeping": ["(-..-) z", "(-..-) Z"]
   }
   ```

   Reglas: 2 cuadros por estado, **solo ASCII**, máximo 20 caracteres. Una sola línea, siempre.
2. `node scripts/galeria.js` para actualizar la galería del README.
3. `node plugin/test.js` tiene que decir `PASS`.
4. Sube `version` en `plugin/.claude-plugin/plugin.json` y en `.claude-plugin/marketplace.json`.
5. Abre un pull request. Si te animas, agrega la misma mascota en [claude-pets](https://github.com/jfcarpiopuntocom/claude-pets) con su nombre en inglés.

¿No programas? [Pídela con este formulario](https://github.com/jfcarpiopuntocom/claude-mascotas/issues/new?template=nueva-mascota.yml).

## Regla de oro

La mascota **ocupa una sola línea**. Cualquier cambio que la haga ocupar dos, no entra. Es una gata, no una novela.
