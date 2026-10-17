# mascota.ps1 - mascota para la statusLine de Claude Code (PowerShell 5.1 / 7).
# by J.F.Carpio -jfcarpio.com- for Avatiun Consultores.
# Lee el JSON de stdin, imprime UNA linea. Nunca lanza excepcion.
# Modo combinador: config 'encadenar' = comando de otra statusline; se le reenvia el mismo JSON. Archivo solo ASCII a proposito (PS 5.1 sin BOM).
$ErrorActionPreference = 'Stop'
$fallback = '=^.^='
try {
    [Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)
    $cfgPath = Join-Path $PSScriptRoot 'mascota.config.json'
    $cfg = [IO.File]::ReadAllText($cfgPath, [Text.Encoding]::UTF8) | ConvertFrom-Json

    $in = $null
    try { $raw = [Console]::In.ReadToEnd(); if ($raw) { $in = $raw | ConvertFrom-Json } } catch {}

    $now = Get-Date
    $th = $cfg.thresholds
    $state = 'calm'; $n = 0
    $age = [double]::PositiveInfinity

    $tp = $null
    if ($in -and $in.transcript_path -and ([IO.File]::Exists($in.transcript_path))) { $tp = $in.transcript_path }
    if ($tp) { $age = ($now - [IO.File]::GetLastWriteTime($tp)).TotalSeconds }

    # subagentes: *.output recientes en <root>\<proyecto>\<session_id>\tasks
    if ($in -and $in.session_id) {
        $root = $env:MASCOTA_TASKS_ROOT
        if (-not $root) { $root = Join-Path $env:TEMP 'claude' }
        $dirs = @()
        $cwd = $null
        if ($in.workspace -and $in.workspace.project_dir) { $cwd = $in.workspace.project_dir } elseif ($in.cwd) { $cwd = $in.cwd }
        if ($cwd) { $dirs += (Join-Path $root (Join-Path ($cwd -replace '[^A-Za-z0-9]', '-') (Join-Path $in.session_id 'tasks'))) }
        # respaldo: cualquier proyecto con esa sesion
        if ([IO.Directory]::Exists($root)) {
            foreach ($p in [IO.Directory]::GetDirectories($root)) { $dirs += (Join-Path $p (Join-Path $in.session_id 'tasks')) }
        }
        foreach ($d in $dirs) {
            if ([IO.Directory]::Exists($d)) {
                foreach ($f in [IO.Directory]::GetFiles($d, '*.output')) {
                    if (($now - [IO.File]::GetLastWriteTime($f)).TotalSeconds -lt $th.agentsSec) { $n++ }
                }
                break
            }
        }
    }

    # error: leer solo el final del transcript (64 KB)
    $err = $false
    if ($tp -and $age -lt $th.errorWindowSec) {
        $fs = [IO.File]::Open($tp, 'Open', 'Read', 'ReadWrite')
        try {
            $len = [Math]::Min($fs.Length, 65536)
            $fs.Seek(-$len, 'End') | Out-Null
            $buf = New-Object byte[] $len
            $fs.Read($buf, 0, $len) | Out-Null
            $lines = [Text.Encoding]::UTF8.GetString($buf) -split "`n" | Where-Object { $_ }
            $tail = $lines | Select-Object -Last $th.errorTailLines
            $err = [bool]($tail | Where-Object { $_ -match '"is_error"\s*:\s*true' })
        } finally { $fs.Dispose() }
    }

    if ($err) { $state = 'error' }
    elseif ($n -gt 0) { $state = 'agents' }
    elseif ($tp -and $age -lt $th.workingSec) { $state = 'working' }
    elseif ($tp -and $age -gt $th.sleepSec) { $state = 'sleeping' }

    $cr = $cfg.creatures.($cfg.creature)
    if (-not $cr) { $cr = $cfg.creatures.gato }
    $frames = $cr.$state
    $face = $frames[[int]$now.Second % 2]

    $lang = $cfg.lang
    $msgs = $cfg.messages.$lang
    if ($cr.messages -and $cr.messages.$lang) { $ov = $cr.messages.$lang } else { $ov = $null }
    $key = $state
    if ($state -eq 'agents') { if ($n -eq 1) { $key = 'agents1' } else { $key = 'agentsN' } }
    $msg = $null
    if ($ov) { $msg = $ov.$key }
    if (-not $msg) { $msg = $msgs.$key }
    $msg = $msg -replace '\{n\}', $n

    $line = "$face $msg"
    if ($cfg.color) {
        $e = [char]27
        $c = @{ calm = '36'; working = '33'; agents = '35'; error = '31'; sleeping = '90' }[$state]
        $line = "$e[${c}m$line$e[0m"
    }
    $sig = $cfg.signature
    if ($sig -and $sig.enabled -and $sig.text) {
        $t = $sig.text
        if ($sig.link -and $sig.url) { $e = [char]27; $t = "$e]8;;$($sig.url)$e\$t$e]8;;$e\" }
        $line += "  | $t"
    }
    $ch = $cfg.encadenar
    if ($ch) {
        try {
            $psi = New-Object Diagnostics.ProcessStartInfo 'cmd.exe', ('/c ' + $ch)
            $psi.RedirectStandardInput = $true; $psi.RedirectStandardError = $true; $psi.RedirectStandardOutput = $true
            $psi.UseShellExecute = $false; $psi.CreateNoWindow = $true
            $psi.StandardOutputEncoding = New-Object System.Text.UTF8Encoding($false)
            $pr = [Diagnostics.Process]::Start($psi)
            $task = $pr.StandardOutput.ReadToEndAsync()
            try { $pr.StandardInput.Write($raw); $pr.StandardInput.Close() } catch {}
            if ($pr.WaitForExit(1000) -and $task.Wait(500)) {
                $o = $task.Result.TrimEnd("`r", "`n")
                if ($o) {
                    if ($cfg.disposicion -eq 'linea-aparte') { $line = $o + "`n" + $line } else { $line = $o + '  ' + $line }
                }
            } else { try { $pr.Kill() } catch {} }
        } catch {}
    }
    [Console]::Out.Write($line)
} catch {
    [Console]::Out.Write($fallback)
}
