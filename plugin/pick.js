#!/usr/bin/env node
// /mascota [number | name | azar]: with nothing, lists every pet numbered; otherwise saves your choice in your settings,
// which live outside the plugin and survive updates. Your agent team comes in the same species.
'use strict';
const fs = require('fs');
const path = require('path');
const { readJson, writeJson, cfgPath } = require('./comun.js');

const { creatures } = JSON.parse(fs.readFileSync(path.join(__dirname, 'mascota.config.json'), 'utf8'));
const nombres = Object.entries(creatures).map(([nombre]) => nombre);
const norm = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
let want = norm(process.argv.slice(2).join(' '));

if (!want) {
  console.log(`${nombres.length} mascotas (elige por número, por nombre o al azar):\n`);
  nombres.forEach((k, i) => console.log(`  ${String(i + 1).padStart(2)}  ${creatures[k].calm[0].padEnd(18)} ${k}`));
  console.log(`\n  /mascota 7   ·   /mascota ${nombres[1]}   ·   /mascota azar`);
  process.exit(0);
}
if (want === norm('azar')) want = nombres[Math.floor(Math.random() * nombres.length)];
if (/^\d+$/.test(want) && nombres[Number(want) - 1]) want = nombres[Number(want) - 1];
const k = nombres.find((x) => x === want || norm(creatures[x].name) === want);
if (!k) { console.log(`No conozco esa mascota: ${want}. /mascota (1-${nombres.length})`); process.exit(1); }
const cfg = readJson(cfgPath, {});
cfg.creature = k;
writeJson(cfgPath, cfg);
console.log(`${creatures[k].calm[0]}  Elegida: #${nombres.indexOf(k) + 1} ${creatures[k].name}.`);
