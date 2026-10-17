# Test de mascota.ps1: crea transcripts/tareas temporales con fechas ajustadas y comprueba cada estado.
$here = $PSScriptRoot
$tmp = Join-Path ([IO.Path]::GetTempPath()) ('mascota-test-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $tmp | Out-Null
$env:MASCOTA_TASKS_ROOT = Join-Path $tmp 'claude'
$esc = [char]27
$fail = 0

function Run($json) {
    $ps = (Get-Process -Id $PID).Path
    $out = $json | & $ps -NoProfile -ExecutionPolicy Bypass -File (Join-Path $here 'mascota.ps1')
    ($out -join "`n") -replace "$esc\[[0-9;]*m", ''
}
function Case($name, $transcriptAgeSec, $transcriptBody, $agentFiles, $expect) {
    $sid = [guid]::NewGuid().ToString('N')
    $tp = Join-Path $tmp "$sid.jsonl"
    if ($null -ne $transcriptAgeSec) {
        Set-Content -LiteralPath $tp -Value $transcriptBody -Encoding UTF8
        (Get-Item $tp).LastWriteTime = (Get-Date).AddSeconds(-$transcriptAgeSec)
    }
    $cwd = 'C:\proj\demo'
    $td = Join-Path $env:MASCOTA_TASKS_ROOT "C--proj-demo\$sid\tasks"
    if ($agentFiles) {
        New-Item -ItemType Directory -Path $td -Force | Out-Null
        $i = 0
        foreach ($age in $agentFiles) {
            $f = Join-Path $td "t$i.output"; Set-Content $f 'x'
            (Get-Item $f).LastWriteTime = (Get-Date).AddSeconds(-$age); $i++
        }
    }
    $json = @{ session_id = $sid; transcript_path = $tp; cwd = $cwd; workspace = @{ current_dir = $cwd; project_dir = $cwd }; model = @{ display_name = 'Opus' } } | ConvertTo-Json -Compress
    $got = Run $json
    if ($got -match $expect) { Write-Host "PASS $name -> $got" } else { Write-Host "FAIL $name -> '$got' (esperaba /$expect/)"; $script:fail++ }
}

$ok  = '{"type":"user","message":"hola"}'
$bad = '{"type":"user","message":{"content":[{"type":"tool_result","is_error":true,"content":"boom"}]}}'
Case 'tranquila'  60   $ok  $null      'tranquila'
Case 'trabajando' 5    $ok  $null      'trabajando'
Case 'agentes x3' 60   $ok  @(5,10,30) '3 agentes trabajando'
Case 'agente x1'  60   $ok  @(5,500)   '1 agente trabajando'
Case 'error'      5    $bad $null      'fallo'
Case 'zzz'        300  $ok  $null      'zzz'
Case 'sin datos'  $null $null $null    '\S'
Write-Host ("neutra ante basura -> " + (Run 'esto no es json'))
if ((Run 'esto no es json') -notmatch '\S') { Write-Host 'FAIL basura'; $fail++ }

# encadenar: config temporal con comando simulado (eco del session_id) y comando roto
$cfgPath = Join-Path $here 'mascota.config.json'
$orig = [IO.File]::ReadAllText($cfgPath)
try {
    $stub = Join-Path $tmp 'otra.cmd'
    Set-Content $stub '@echo HUD-OK' -Encoding ASCII
    $c = $orig | ConvertFrom-Json
    $c.encadenar = '"' + $stub + '"'; $c.disposicion = 'linea-aparte'
    [IO.File]::WriteAllText($cfgPath, ($c | ConvertTo-Json -Depth 10))
    $got = Run '{}'
    if ($got -match "(?s)^HUD-OK\s*
.*tranquila") { Write-Host "PASS encadenar linea-aparte" } else { Write-Host "FAIL encadenar aparte -> $got"; $fail++ }
    $c.disposicion = 'misma-linea'; [IO.File]::WriteAllText($cfgPath, ($c | ConvertTo-Json -Depth 10))
    $got = Run '{}'
    if ($got -match '^HUD-OK\s+\S+.*tranquila') { Write-Host "PASS encadenar misma-linea" } else { Write-Host "FAIL encadenar misma -> $got"; $fail++ }
    $c.encadenar = 'comando-que-no-existe-xyz'; [IO.File]::WriteAllText($cfgPath, ($c | ConvertTo-Json -Depth 10))
    $got = Run '{}'
    if ($got -match 'tranquila' -and $got -notmatch 'HUD') { Write-Host "PASS encadenar roto se omite" } else { Write-Host "FAIL encadenar roto -> $got"; $fail++ }
} finally { [IO.File]::WriteAllText($cfgPath, $orig) }

Remove-Item -Recurse -Force $tmp
if ($fail) { Write-Host "$fail FALLOS"; exit 1 } else { Write-Host 'TODO OK'; exit 0 }
