#!/usr/bin/env node
// /mascotas:setup: copies the fixed launcher and points your statusLine at it (refreshing every second so the pet
// blinks). Your previous statusLine is kept: it keeps running, and the pet goes in as ONE line below the model line.
'use strict';
const fs = require('fs');
const path = require('path');
const { dir, home, ours, readJson, writeJson, settingsPath, cfgPath, launcher } = require('./comun.js');

const settings = readJson(settingsPath, {});
const cfg = readJson(cfgPath, {});
fs.mkdirSync(home, { recursive: true });
fs.copyFileSync(path.join(__dirname, 'launcher.js'), launcher);
if (fs.existsSync(settingsPath) && !fs.existsSync(settingsPath + '.bak-claude-mascotas')) fs.copyFileSync(settingsPath, settingsPath + '.bak-claude-mascotas');

const prev = settings.statusLine || {};
if (cfg.encadenar && !cfg.chain) cfg.chain = cfg.encadenar;
delete cfg.encadenar;
if (prev.command && !ours(prev.command)) {
  cfg.chain = prev.command;
  cfg.previousStatusLine = prev;
} else if (ours(prev.command) && !cfg.chain) {
  // coming from the other language's plugin, or from a standalone mascota-statusline copy (its config sits next to
  // its script): inherit the statusLine it was keeping
  const script = (/"([^"]*mascota[^"]*\.js)"/.exec(prev.command) || [])[1];
  const local = script ? [path.join(path.dirname(script), 'mascota.config.json')] : [];
  for (const f of [...['claude-mascotas', 'claude-pets', 'mascota'].map((s) => path.join(dir, 'plugins', s, 'config.json')), ...local]) {
    let c = {};
    try { c = JSON.parse(fs.readFileSync(f, 'utf8').replace(/^﻿/, '')); } catch (e) {}
    const ch = c.chain || c.encadenar;
    if (ch && !ours(ch)) { cfg.chain = ch; if (c.previousStatusLine) cfg.previousStatusLine = c.previousStatusLine; break; }
  }
}
writeJson(cfgPath, cfg);

// plain `node` from PATH: works in bash, cmd and PowerShell, and survives node upgrades
const command = `node "${launcher.replace(/\\/g, '/')}"`;
settings.statusLine = { ...prev, type: 'command', command, refreshInterval: prev.refreshInterval && prev.refreshInterval < 1 ? prev.refreshInterval : 1 };
writeJson(settingsPath, settings);
console.log(`=^.^= listo. statusLine -> ${command}`);
if (cfg.chain) console.log('Tu statusLine anterior sigue funcionando: la mascota entra como una línea debajo de la del modelo.');
console.log(`Respaldo: ${settingsPath}.bak-claude-mascotas · Tus ajustes: ${cfgPath}`);
console.log('Si no la ves en unos segundos, reinicia Claude Code.');
