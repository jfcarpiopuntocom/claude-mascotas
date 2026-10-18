# Cambios

## 2.1.0 (18 oct 2026)
- Se mueve de verdad: `setup` pide redibujar cada segundo (`refreshInterval: 1`).
- Recuerda a tu equipo de agentes aunque la sesión sea larguísima.
- Solo se preocupa si la última herramienta falló; con agentes trabajando, manda el equipo.
- Siempre una línea, aunque tu terminal no informe su ancho: primero muestra menos agentes (`+n`), luego recorta.
- Si tu statusLine anterior tarda, la mascota sale sola en vez de congelarse.
- `/mascotas:quitar` devuelve tu statusLine anterior. El respaldo de `settings.json` ya no se pisa.
- `setup` usa `node` del PATH: funciona en bash, cmd y PowerShell, y sobrevive a actualizaciones de Node.
- Nuevas: gatito otaku. Todas duermen con Zzz.
- Opciones en inglés (`signature`, `chain`); las viejas (`firma`, `encadenar`) siguen funcionando.

## 2.0.0
- Nuevo nombre: **claude-mascotas** (antes mascota-statusline). El plugin ahora se llama `mascotas`: reinstala con los tres comandos del README.
- 24 mascotas y `/mascotas:elegir` (con `azar`). Tu equipo de agentes sale con la misma especie.

## 1.0.1
- Es una gatita. Instalación desde la terminal.

## 1.0.0
- Una sola línea, un animalito por agente con su nombre real, actualizaciones automáticas.
