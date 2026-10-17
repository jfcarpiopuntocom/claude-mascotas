// Test de mascota.js: transcripts/tareas temporales con fechas ajustadas; comprueba cada estado y el encadenado.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const here = __dirname;
const cfgPath = path.join(here, 'mascota.config.json');
const origCfg = fs.readFileSync(cfgPath, 'utf8');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mascota-test-'));
const env = { ...process.env, MASCOTA_TASKS_ROOT: path.join(tmp, 'claude') };
let fail = 0;

const run = (json) =>
  spawnSync(process.execPath, [path.join(here, 'mascota.js')], { input: json, env, encoding: 'utf8' })
    .stdout.replace(/\x1b\[[0-9;]*m/g, '');
const runRaw = (json) =>
  spawnSync(process.execPath, [path.join(here, 'mascota.js')], { input: json, env, encoding: 'utf8' }).stdout;
const touch = (f, ageSec) => { const t = new Date(Date.now() - ageSec * 1000); fs.utimesSync(f, t, t); };
const check = (name, got, re) => {
  if (re.test(got)) console.log(`PASS ${name} -> ${got.replace(/\n/g, ' / ')}`);
  else { console.log(`FAIL ${name} -> '${got}' (esperaba ${re})`); fail++; }
};

let i = 0;
function stateCase(name, ageSec, body, agentAges, re) {
  const sid = 's' + i++;
  const tp = path.join(tmp, sid + '.jsonl');
  if (ageSec !== null) { fs.writeFileSync(tp, body); touch(tp, ageSec); }
  const cwd = 'C:\\proj\\demo';
  if (agentAges) {
    const td = path.join(env.MASCOTA_TASKS_ROOT, 'C--proj-demo', sid, 'tasks');
    fs.mkdirSync(td, { recursive: true });
    agentAges.forEach((a, k) => { const f = path.join(td, `t${k}.output`); fs.writeFileSync(f, 'x'); touch(f, a); });
  }
  check(name, run(JSON.stringify({ session_id: sid, transcript_path: tp, cwd, workspace: { current_dir: cwd, project_dir: cwd } })), re);
}

const ok = '{"type":"user","message":"hola"}';
const bad = '{"type":"user","message":{"content":[{"type":"tool_result","is_error":true,"content":"boom"}]}}';
try {
  stateCase('tranquila', 60, ok, null, /tranquila/);
  stateCase('trabajando', 5, ok, null, /trabajando/);
  stateCase('agentes x3', 60, ok, [5, 10, 30], /3 agentes trabajando/);
  stateCase('agente x1', 60, ok, [5, 500], /1 agente trabajando/);
  stateCase('error', 5, bad, null, /fallo/);
  stateCase('zzz', 300, ok, null, /zzz/);
  stateCase('sin datos', null, null, null, /tranquila/);
  const raw = runRaw('{}');
  check('firma: un @ ambar con hipervinculo OSC 8', raw, /\x1b\[38;5;214m\x1b\]8;;https:\/\/jfcarpio\.com\x1b\\@\x1b\]8;;\x1b\\\x1b\[0m$/);
  check('firma: el texto completo ya no esta en la barra', run('{}'), /^(?!.*J\.F\.Carpio)/);
  check('basura -> neutra', run('esto no es json'), /\S/);

  const c = JSON.parse(origCfg);
  const stub = path.join(tmp, 'otra.cmd');
  fs.writeFileSync(stub, '@echo HUD-OK\r\n');
  c.encadenar = `"${stub}"`;
  c.disposicion = 'linea-aparte';
  fs.writeFileSync(cfgPath, JSON.stringify(c));
  check('encadenar linea-aparte', run('{}'), /^HUD-OK\n.*tranquila/s);
  c.disposicion = 'misma-linea'; fs.writeFileSync(cfgPath, JSON.stringify(c));
  check('encadenar misma-linea', run('{}'), /^HUD-OK {2}\S.*tranquila/);
  c.encadenar = 'comando-que-no-existe-xyz'; fs.writeFileSync(cfgPath, JSON.stringify(c));
  check('encadenar roto se omite', run('{}'), /^[^\n]*tranquila/);
} finally {
  fs.writeFileSync(cfgPath, origCfg);
  fs.rmSync(tmp, { recursive: true, force: true });
}
console.log(fail ? `${fail} FALLOS` : 'TODO OK');
process.exit(fail ? 1 : 0);
