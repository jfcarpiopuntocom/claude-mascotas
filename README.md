# =^.^= mascota

*English: [claude-pets](https://github.com/jfcarpiopuntocom/claude-pets).*

Una gatita ASCII que te hace compañía en la statusLine de Claude Code. Ocupa **una sola línea**. Siempre. Por diseño.

```
[Opus 5.5] │ mi-proyecto git:(main)
=^o^= trabajando...  @
Context ░░░░░░░░░░ 12%
```

Cuando trabaja tu equipo de agentes, cada uno recibe su propio gatito con su **nombre o rol real**, uno al lado del otro, en la misma línea:

```
=^.^=/ 3 agentes trabajando  =^o^= estratega  =^O^= investigador  =^o^= redactor  @
```

| Estado | Gatito |
|---|---|
| tranquila | `=^.^=` |
| trabajando | `=^o^=` |
| agentes | `=^.^=/` + un gatito por agente |
| algo falló | `=;.;=` |
| dormitando | `=-.-= z` |

## Instalar (2 minutos, gratis, para siempre*)

Dentro de Claude Code:

```
/plugin marketplace add jfcarpiopuntocom/mascota-statusline
/plugin install mascota@mascota
/mascota:setup
```

Reinicia Claude Code. Listo.

**¿No puedes escribir `/`?** Desde cualquier terminal:

```
claude plugin marketplace add jfcarpiopuntocom/mascota-statusline
claude plugin install mascota@mascota
```

Luego abre Claude Code y pídele: *"ejecuta el comando de setup de mascota"*.

**Para que te lleguen las mejoras solas:** `/plugin` → *Marketplaces* → `mascota` → *Enable auto-update*. La statusLine apunta a un lanzador fijo que siempre ejecuta la versión más nueva instalada, así que nunca tienes que volver a configurarla.

Si ya tenías otra statusLine (por ejemplo claude-hud), `/mascota:setup` la conserva y mete a la gatita como una línea debajo de la del modelo.

## Ajustes (opcionales)

Crea `~/.claude/plugins/mascota/config.json` (o dentro de tu `CLAUDE_CONFIG_DIR`). Sobrevive a las actualizaciones:

```json
{ "lang": "en", "creature": "buho", "color": true, "maxAgentes": 4 }
```

Para quitar la firma `@`: `{ "firma": { "enabled": false } }`.

## Preguntas que nadie hizo

**¿Por qué existe esto?** Fue un proyecto paralelo para aprender a usar Claude Code. Se nos fue un poco de las manos.

**¿Cuánto cuesta?** Nada. Puedes usarlo 40 días gratis, y después también.

**¿Puedo tener dos líneas?** No. Es un gato, no una novela.

**¿Funciona en Windows, macOS y Linux?** Sí. Solo necesita Node, que Claude Code ya trae a tu vida.

---

## English

A one-line ASCII kitty (she keeps you company) for the Claude Code statusLine. When your agent team works, each agent gets its own cat with its **real name or role**, side by side, on that same single line.

Install inside Claude Code: `/plugin marketplace add jfcarpiopuntocom/mascota-statusline`, then `/plugin install mascota@mascota`, then `/mascota:setup`, and restart. For automatic updates, enable auto-update for the `mascota` marketplace in `/plugin`. Set `"lang": "en"` in `~/.claude/plugins/mascota/config.json` for English messages.

Born as a side project to learn Claude Code. Free. You may evaluate it for 40 days, and after that, too.

---

\* *"para siempre" sujeto a que los gatos sigan existiendo.*

by J.F.Carpio — [jfcarpio.com](https://jfcarpio.com) — for Avatiun Consultores · MIT
