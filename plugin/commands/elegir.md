---
description: Elige tu mascota (sin nombre muestra la lista; "azar" elige una por ti)
argument-hint: "[nombre | azar]"
allowed-tools: Bash(node "${CLAUDE_PLUGIN_ROOT}/pick.js"*)
---
Ejecuta exactamente este comando y muestra su salida al usuario tal cual, en un bloque de código, sin agregar nada más:

```
node "${CLAUDE_PLUGIN_ROOT}/pick.js" $ARGUMENTS
```
