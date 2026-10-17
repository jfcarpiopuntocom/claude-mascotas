#!/usr/bin/env node
// mascota.js - mascota para la statusLine de Claude Code. Sin dependencias.
// by J.F.Carpio -jfcarpio.com- for Avatiun Consultores.
// Lee el JSON de stdin, imprime la mascota. Nunca lanza excepcion.
// Modo combinador: config 'encadenar' = comando de otra statusline (p. ej. claude-hud); recibe el mismo JSON.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const FALLBACK = '=^.^=';
try {
  const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, 'mascota.config.json'), 'utf8').replace(/^﻿/, ''));
  let raw = '';
  try { raw = fs.readFileSync(0, 'utf8'); } catch (e) {}
  let input = null;
  try { input = JSON.parse(raw); } catch (e) {}

  const now = Date.now();
  const th = cfg.thresholds;
  const mtime = (f) => fs.statSync(f).mtimeMs;
  let state = 'calm', n = 0, age = Infinity, tp = null;

  if (input && input.transcript_path) {
    try { age = (now - mtime(input.transcript_path)) / 1000; tp = input.transcript_path; } catch (e) {}
  }

  // subagentes: *.output recientes en <root>/<proyecto>/<session_id>/tasks
  if (input && input.session_id) {
    const root = process.env.MASCOTA_TASKS_ROOT || path.join(os.tmpdir(), 'claude');
    const dirs = [];
    const cwd = (input.workspace && input.workspace.project_dir) || input.cwd;
    if (cwd) dirs.push(path.join(root, cwd.replace(/[^A-Za-z0-9]/g, '-'), input.session_id, 'tasks'));
    try {
      for (const p of fs.readdirSync(root)) dirs.push(path.join(root, p, input.session_id, 'tasks'));
    } catch (e) {}
    for (const d of dirs) {
      let files;
      try { files = fs.readdirSync(d); } catch (e) { continue; }
      for (const f of files) {
        if (!f.endsWith('.output')) continue;
        try { if ((now - mtime(path.join(d, f))) / 1000 < th.agentsSec) n++; } catch (e) {}
      }
      break;
    }
  }

  // error: solo el final del transcript (64 KB)
  let err = false;
  if (tp && age < th.errorWindowSec) {
    const fd = fs.openSync(tp, 'r');
    try {
      const size = fs.fstatSync(fd).size;
      const len = Math.min(size, 65536);
      const buf = Buffer.alloc(len);
      fs.readSync(fd, buf, 0, len, size - len);
      const tail = buf.toString('utf8').split('\n').filter(Boolean).slice(-th.errorTailLines);
      err = tail.some((l) => /"is_error"\s*:\s*true/.test(l));
    } finally { fs.closeSync(fd); }
  }

  if (err) state = 'error';
  else if (n > 0) state = 'agents';
  else if (tp && age < th.workingSec) state = 'working';
  else if (tp && age > th.sleepSec) state = 'sleeping';

  const cr = cfg.creatures[cfg.creature] || cfg.creatures.gato;
  const face = cr[state][new Date(now).getSeconds() % 2];
  const key = state === 'agents' ? (n === 1 ? 'agents1' : 'agentsN') : state;
  const ov = cr.messages && cr.messages[cfg.lang];
  let msg = (ov && ov[key]) || cfg.messages[cfg.lang][key];
  msg = msg.replace('{n}', n);

  let line = `${face} ${msg}`;
  if (cfg.color) {
    const c = { calm: 36, working: 33, agents: 35, error: 31, sleeping: 90 }[state];
    line = `\x1b[${c}m${line}\x1b[0m`;
  }
  // Firma: un solo @ ambar que es hipervinculo OSC 8 (la firma completa vive en firma.texto y el README).
  const fi = cfg.firma;
  if (fi && fi.enabled && fi.url) {
    const g = fi.glifo || '@';
    const link = `\x1b]8;;${fi.url}\x1b\\${g}\x1b]8;;\x1b\\`;
    line += cfg.color ? `  \x1b[38;5;214m${link}\x1b[0m` : `  ${link}`;
  }

  if (cfg.encadenar) {
    try {
      const r = spawnSync(cfg.encadenar, { input: raw, shell: true, timeout: 1000, encoding: 'utf8', windowsHide: true });
      const o = (r.stdout || '').replace(/[\r\n]+$/, '');
      if (r.status === 0 && !r.error && o) {
        line = cfg.disposicion === 'linea-aparte' ? `${o}\n${line}` : `${o}  ${line}`;
      }
    } catch (e) {}
  }
  process.stdout.write(line);
} catch (e) {
  process.stdout.write(FALLBACK);
}
