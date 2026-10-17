# mascota-statusline

**ES** | [EN](#english)

Una mascota para la barra de estado de Claude Code. Un solo script de PowerShell, sin dependencias, que cambia de cara segun lo que pasa en tu sesion: trabajando, con agentes en segundo plano, con un error, dormitando o tranquila. Cada segundo alterna entre dos cuadros para que parezca viva.

```
=^.^= tranquila  | by J.F.Carpio -jfcarpio.com- for Avatiun Consultores
=^O^= trabajando...  | by J.F.Carpio -jfcarpio.com- for Avatiun Consultores
=^.^=/ 3 agentes trabajando  | by J.F.Carpio -jfcarpio.com- for Avatiun Consultores
=x.x= algo fallo, revisa  | by J.F.Carpio -jfcarpio.com- for Avatiun Consultores
=-.-= z dormitando... zzz  | by J.F.Carpio -jfcarpio.com- for Avatiun Consultores
```

### Estados

| Estado | Cuando | Senal (barata, local) |
|---|---|---|
| trabajando | el transcript cambio hace menos de 20 s | fecha de `transcript_path` |
| agentes | hay subagentes/tareas en segundo plano | archivos `*.output` modificados hace menos de 60 s en `%TEMP%\claude\<proyecto>\<session_id>\tasks` (muestra el numero) |
| error | un resultado de herramienta con error | `"is_error":true` en las ultimas ~40 lineas del transcript (y actividad en los ultimos 5 min) |
| zzz | sin cambios en el transcript por mas de 2 min | fecha de `transcript_path` |
| tranquila | todo lo demas | - |

Prioridad: error > agentes > trabajando > zzz > tranquila. Si algo falla, imprime una mascota neutra (`=^.^=`), nunca una excepcion.

### Instalacion (Windows 11, PowerShell 5.1 o 7)

1. Copia esta carpeta donde quieras.
2. En tu `settings.json` de Claude Code agrega:

```json
"statusLine": {
  "type": "command",
  "command": "powershell -NoProfile -ExecutionPolicy Bypass -File \"C:\\ruta\\a\\mascota-statusline\\mascota.ps1\""
}
```

Opcional: agrega `"refreshInterval": 1` dentro de `statusLine` para que la mascota alterne cuadros incluso cuando la sesion esta quieta.

3. Prueba: `powershell -NoProfile -ExecutionPolicy Bypass -File test-mascota.ps1`

### Configuracion (`mascota.config.json`)

| Clave | Que hace |
|---|---|
| `creature` | `gato`, `buho` o `dragon` (guino a Skyrim: "FUS RO DAH!"). Agrega la tuya en `creatures`. |
| `lang` | `es` o `en` (mensajes en `messages`). |
| `color` | `true`/`false`, colores ANSI. |
| `signature` | `enabled`, `text`, `url`, `link` (enlace clicable OSC 8; solo terminales compatibles). |
| `encadenar` / `disposicion` | Comando de otra statusline y `misma-linea`/`linea-aparte` (ver abajo). |
| `thresholds` | `workingSec`, `agentsSec`, `sleepSec`, `errorTailLines`, `errorWindowSec`. |

### Combinar con otra statusline (claude-hud)

Claude Code admite UN solo comando `statusLine`, pero esa salida puede tener varias lineas. `mascota.ps1` hace de combinador: ejecuta la otra statusline, le reenvia el mismo JSON, y imprime su salida antes de la mascota. Si la otra falla o tarda mas de 1 s, se omite y solo sale la mascota.

[claude-hud](https://github.com/jarrodwatts/claude-hud) (MIT, de jarrodwatts) es un plugin que se instala con `/plugin marketplace add jarrodwatts/claude-hud`, `/plugin install claude-hud` y `/claude-hud:setup`; el setup escribe su propio `statusLine` en tu `settings.json`. Para combinarlos: copia el `command` que dejo el setup, restaura el `statusLine` de la mascota (snippet de arriba) y pon ese comando en `mascota.config.json`:

```json
"encadenar": "<el command que escribio claude-hud>",
"disposicion": "linea-aparte"
```

`disposicion`: `misma-linea` (la mascota queda al final de la ultima linea) o `linea-aparte` (la mascota en una linea propia debajo). El comando se ejecuta con `cmd /c`, asi que comillas y rutas con espacios van como en cmd. Cada ejecucion lanza ambos procesos: espera mas latencia.

### Rendimiento

El cuerpo del script tarda ~100 ms con el motor ya caliente. El arranque en frio de `powershell.exe` 5.1 es lo que domina (en la maquina de pruebas, muy cargada, superaba 2 s incluso con `-Command 1`). `pwsh` 7 arranca bastante mas rapido.

### Creditos y licencia

Idea y direccion: JFC. Firma: by J.F.Carpio -jfcarpio.com- for Avatiun Consultores ([jfcarpio.com](https://jfcarpio.com), [avatiun.com](https://www.avatiun.com)). Construido con Claude Code.
Licencia: por definir por el autor.

---

## English

A pet for the Claude Code status line. One dependency-free PowerShell script whose face changes with what your session is doing: working, background agents, error, dozing, or calm. It alternates between two frames every second so it looks alive.

```
=^.^= calm  | by J.F.Carpio -jfcarpio.com- for Avatiun Consultores
=^O^= working...  | by J.F.Carpio -jfcarpio.com- for Avatiun Consultores
=^.^=/ 3 agents working  | by J.F.Carpio -jfcarpio.com- for Avatiun Consultores
=x.x= something failed, check it  | by J.F.Carpio -jfcarpio.com- for Avatiun Consultores
=-.-= z dozing off... zzz  | by J.F.Carpio -jfcarpio.com- for Avatiun Consultores
```

### States

| State | When | Cheap local signal |
|---|---|---|
| working | transcript changed < 20 s ago | mtime of `transcript_path` |
| agents | background subagents/tasks active | `*.output` files modified < 60 s ago in `%TEMP%\claude\<project>\<session_id>\tasks` (shows the count) |
| error | a tool result with an error | `"is_error":true` in the last ~40 transcript lines (and activity within 5 min) |
| zzz | no transcript change for > 2 min | mtime of `transcript_path` |
| calm | otherwise | - |

Priority: error > agents > working > zzz > calm. On any failure it prints a neutral pet, never an exception.

### Install (Windows 11, PowerShell 5.1 or 7)

Add to your Claude Code `settings.json` (adjust the path):

```json
"statusLine": {
  "type": "command",
  "command": "powershell -NoProfile -ExecutionPolicy Bypass -File \"C:\\path\\to\\mascota-statusline\\mascota.ps1\""
}
```

Optional: `"refreshInterval": 1` inside `statusLine` keeps the frames flipping while the session is idle. Run `test-mascota.ps1` to verify.

### Configuration

Edit `mascota.config.json`: `creature` (`gato` cat, `buho` owl, `dragon` with a Skyrim nod), `lang` (`es`/`en`), `color`, `signature` (turn it off with `"enabled": false`), and `thresholds`. Add your own creature under `creatures`.

### Chaining another status line (claude-hud)

Claude Code accepts ONE `statusLine` command, but its output may span several lines. `mascota.ps1` works as a combiner: it runs the other status line, forwards the same stdin JSON, and prints its output before the pet. If it fails or takes over 1 s, it is skipped.

[claude-hud](https://github.com/jarrodwatts/claude-hud) (MIT, by jarrodwatts) installs via `/plugin marketplace add jarrodwatts/claude-hud`, `/plugin install claude-hud`, `/claude-hud:setup`; setup writes its own `statusLine` to `settings.json`. To combine: copy the `command` that setup wrote, restore mascota's `statusLine` (snippet above) and put that command in `mascota.config.json` as `"encadenar"`, with `"disposicion": "misma-linea"` or `"linea-aparte"` (own line below). It runs through `cmd /c`.

### Performance

The script body takes ~100 ms on a warm engine; cold `powershell.exe` 5.1 startup dominates. `pwsh` 7 starts faster.

### Credits and license

Idea and direction: JFC. Signature: by J.F.Carpio -jfcarpio.com- for Avatiun Consultores ([jfcarpio.com](https://jfcarpio.com), [avatiun.com](https://www.avatiun.com)). Built with Claude Code.
License: to be defined by the author.
