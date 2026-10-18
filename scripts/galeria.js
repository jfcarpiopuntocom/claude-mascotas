#!/usr/bin/env node
// Regenera la galería del README desde la configuración. Uso: node scripts/galeria.js
'use strict';
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const { creatures } = JSON.parse(fs.readFileSync(path.join(root, 'plugin', 'mascota.config.json'), 'utf8'));
const c = (s) => '`' + s + '`';
const rows = Object.entries(creatures).map(([k, v]) => `| ${v.name} | ${c(v.calm[0])} | ${c(v.working[0])} | ${c(v.error[0])} | ${c(v.sleeping[0])} | ${c(k)} |`);
const table = ['| Mascota | Tranquila | Trabajando | Algo falló | Durmiendo | Clave |', '|---|---|---|---|---|---|', ...rows].join('\n');
const readme = path.join(root, 'README.md');
const s = fs.readFileSync(readme, 'utf8');
const a = '<!-- galeria:start -->', b = '<!-- galeria:end -->';
fs.writeFileSync(readme, s.slice(0, s.indexOf(a) + a.length) + '\n' + table + '\n' + s.slice(s.indexOf(b)));
console.log(rows.length + ' mascotas en la galería');
