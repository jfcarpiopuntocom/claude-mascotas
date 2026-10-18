#!/usr/bin/env node
// Regenera la galería (imagen a color y tabla) desde la configuración. Uso: node scripts/galeria.js
// Writes assets/gallery.svg (every pet in every mood, in the same colors as the terminal) and the README gallery.
'use strict';
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const cfg = JSON.parse(fs.readFileSync(path.join(root, 'plugin', 'mascota.config.json'), 'utf8'));
const pets = Object.entries(cfg.creatures);
const say = (v, k) => (v.messages && v.messages.es && v.messages.es[k]) || cfg.messages.es[k];
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// same colors as the statusLine: calm cyan, working yellow, team magenta, error red, sleeping gray
const cols = [
  ['En calma', 'calm', '#39c5cf'], ['Trabajando', 'working', '#e3b341'], ['Con su equipo', 'agents', '#d2a8ff'],
  ['Algo falló', 'error', '#ff7b72'], ['Durmiendo', 'sleeping', '#8b949e'],
];
const CH = 9.1, ROW = 30, TOP = 92, PAD = 28;
const nameW = (Math.max(...pets.map(([, v]) => v.name.length), 8) + 4) * CH + 34;
const widths = cols.map(([h, k]) => Math.max(h.length, ...pets.map(([, v]) => v[k][0].length)) * CH + 30);
const W = Math.ceil(PAD * 2 + nameW + widths.reduce((a, b) => a + b, 0));
const H = TOP + pets.length * ROW + 24;
const mono = 'font-family="ui-monospace,SFMono-Regular,Menlo,Consolas,monospace"';
let x = PAD + nameW;
const xs = widths.map((w) => { const v = x; x += w; return v; });
const out = [
  `<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Galería de mascotas en sus cinco estados, con los colores de la terminal">`,
  `<rect width="${W}" height="${H}" rx="14" fill="#0d1117"/>`,
  `<circle cx="${PAD}" cy="24" r="6" fill="#ff5f56"/><circle cx="${PAD + 20}" cy="24" r="6" fill="#ffbd2e"/><circle cx="${PAD + 40}" cy="24" r="6" fill="#27c93f"/>`,
  `<text x="${W / 2}" y="29" text-anchor="middle" ${mono} font-size="14" fill="#8b949e">${pets.length} mascotas</text>`,
  `<text x="${PAD}" y="${TOP - 22}" ${mono} font-size="13" font-weight="700" fill="#f0f6fc">Mascota</text>`,
  ...cols.map(([h, , c], i) => `<text x="${xs[i]}" y="${TOP - 22}" ${mono} font-size="13" font-weight="700" fill="${c}">${esc(h)}</text>`),
  `<line x1="${PAD}" y1="${TOP - 12}" x2="${W - PAD}" y2="${TOP - 12}" stroke="#30363d"/>`,
];
pets.forEach(([k, v], r) => {
  const y = TOP + r * ROW + 8;
  if (r % 2) out.push(`<rect x="${PAD - 10}" y="${y - 20}" width="${W - PAD * 2 + 20}" height="${ROW}" rx="6" fill="#161b22"/>`);
  out.push(`<text x="${PAD}" y="${y}" ${mono} font-size="15" fill="#f0f6fc"><tspan fill="#6e7681">${String(r + 1).padStart(2)}</tspan>  ${esc(v.name)}</text>`);
  cols.forEach(([, s, c], i) => out.push(`<text x="${xs[i]}" y="${y}" ${mono} font-size="15" fill="${c}">${esc(v[s][0])}</text>`));
});
out.push('</svg>');
fs.mkdirSync(path.join(root, 'assets'), { recursive: true });
fs.writeFileSync(path.join(root, 'assets', 'gallery.svg'), out.join('\n') + '\n');

const c = (s) => '`' + s + '`';
const rows = pets.map(([k, v], i) => `| ${i + 1} | **${v.name}** | ${c(v.calm[0])} <sub>${say(v, 'calm')}</sub> | ${c(v.working[0])} | ${c(v.error[0])} | ${c(v.sleeping[0])} | ${c(k)} |`);
const block = [
  '<p align="center"><img src="assets/gallery.svg" alt="Galería de mascotas en sus cinco estados, con los colores de la terminal" width="100%"></p>',
  '',
  '<details>',
  '<summary><b>Ver la galería en texto (para copiar los nombres)</b></summary>',
  '',
  '| # | Mascota | En calma | Trabajando | Algo falló | Durmiendo | Clave |',
  '|---|---|---|---|---|---|---|',
  ...rows,
  '',
  '</details>',
].join('\n');
const readme = path.join(root, 'README.md');
const s = fs.readFileSync(readme, 'utf8');
const a = '<!-- galeria:start -->', b = '<!-- galeria:end -->';
fs.writeFileSync(readme, s.slice(0, s.indexOf(a) + a.length) + '\n' + block + '\n' + s.slice(s.indexOf(b)));
console.log(rows.length + ' mascotas');
