#!/usr/bin/env node
// /mascotas:elegir [name]: with no name, lists every pet; with a name (or "azar"), saves it in your
// settings, which live outside the plugin and survive updates.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');

const env = (process.env.CLAUDE_CONFIG_DIR || '').trim();
const dir = env ? env.replace(/^~(?=$|[\\/])/, os.homedir()) : path.join(os.homedir(), '.claude');
const cfgPath = path.join(dir, 'plugins', 'claude-mascotas', 'config.json');
const { creatures } = JSON.parse(fs.readFileSync(path.join(__dirname, 'mascota.config.json'), 'utf8'));
const keys = Object.keys(creatures);
const norm = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
let want = norm(process.argv.slice(2).join(' '));

if (!want) {
  console.log('Mascotas disponibles (elige con /mascotas:elegir <nombre>):\n');
  for (const k of keys) console.log(`  ${creatures[k].calm[0].padEnd(18)} ${k}`);
  process.exit(0);
}
if (want === 'azar') want = keys[Math.floor(Math.random() * keys.length)];
const k = keys.find((x) => x === want || norm(creatures[x].name) === want);
if (!k) { console.log(`No conozco esa mascota: ${want}. /mascotas:elegir`); process.exit(1); }
let cfg = {};
try { cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8')); } catch (e) {}
cfg.creature = k;
fs.mkdirSync(path.dirname(cfgPath), { recursive: true });
fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2));
console.log(`${creatures[k].calm[0]}  Elegida: ${creatures[k].name}. Se ve en la próxima actualización de la statusLine (unos segundos).`);
