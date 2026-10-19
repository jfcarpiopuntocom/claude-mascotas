---
description: Elige tu mascota: por número (1-24), por nombre o al azar; sin nada muestra la lista
argument-hint: "[número | nombre | azar]"
allowed-tools: Bash(node "${CLAUDE_PLUGIN_ROOT}/pick.js" *)
---
Ejecuta exactamente este comando y muestra su salida al usuario tal cual, en un bloque de código, sin agregar nada más:

```
node "${CLAUDE_PLUGIN_ROOT}/pick.js" $ARGUMENTS
```
