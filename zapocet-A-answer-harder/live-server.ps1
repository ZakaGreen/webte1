param(
    [int]$Port = 5500,
    [string]$Root = ""
)

if (-not $Root) { $Root = (Get-Location).Path }
$Sep = [IO.Path]::DirectorySeparatorChar
$Root = (Resolve-Path -LiteralPath $Root).Path.TrimEnd('\', '/')
$RootPrefix = $Root + $Sep

$mime = @{
    ".html" = "text/html; charset=utf-8";  ".htm"  = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8";   ".js"   = "application/javascript; charset=utf-8"
    ".mjs"  = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"; ".map" = "application/json; charset=utf-8"
    ".txt"  = "text/plain; charset=utf-8"; ".md"   = "text/plain; charset=utf-8"
    ".xml"  = "application/xml; charset=utf-8"; ".csv" = "text/csv; charset=utf-8"
    ".png"  = "image/png";  ".jpg" = "image/jpeg"; ".jpeg" = "image/jpeg"
    ".gif"  = "image/gif";  ".svg" = "image/svg+xml"; ".webp" = "image/webp"
    ".ico"  = "image/x-icon"; ".avif" = "image/avif"
    ".woff" = "font/woff"; ".woff2" = "font/woff2"; ".ttf" = "font/ttf"; ".otf" = "font/otf"
    ".mp4"  = "video/mp4"; ".webm" = "video/webm"; ".mp3" = "audio/mpeg"; ".wav" = "audio/wav"
    ".pdf"  = "application/pdf"; ".wasm" = "application/wasm"
}

$reloadScript = @"
<script>
(function(){var v=null;setInterval(function(){fetch('/__livereload',{cache:'no-store'}).then(function(r){return r.text()}).then(function(t){if(v===null){v=t}else if(t!==v){location.reload()}}).catch(function(){})},800)})();
</script>
"@

function Get-Stamp {
    $files = Get-ChildItem -LiteralPath $Root -Recurse -File -ErrorAction SilentlyContinue |
        Where-Object { $_.FullName -notmatch '[\\/](node_modules|\.git)[\\/]' }
    $max = 0L; $count = 0
    foreach ($f in $files) {
        $count++
        $t = $f.LastWriteTimeUtc.Ticks
        if ($t -gt $max) { $max = $t }
    }
    return "$max-$count"
}

function Send-Bytes($res, [byte[]]$bytes, [string]$type, [int]$status = 200) {
    $res.StatusCode = $status
    $res.ContentType = $type
    $res.Headers.Add("Cache-Control", "no-store")
    $res.ContentLength64 = $bytes.Length
    $res.OutputStream.Write($bytes, 0, $bytes.Length)
}

function Send-Text($res, [string]$text, [string]$type = "text/plain; charset=utf-8", [int]$status = 200) {
    Send-Bytes $res ([Text.Encoding]::UTF8.GetBytes($text)) $type $status
}

function Get-Listing([string]$dir, [string]$urlPath) {
    $sb = New-Object System.Text.StringBuilder
    [void]$sb.Append("<!doctype html><meta charset='utf-8'><title>$urlPath</title>")
    [void]$sb.Append("<style>body{font-family:system-ui,sans-serif;max-width:720px;margin:40px auto;padding:0 16px}li{margin:6px 0}</style>")
    [void]$sb.Append("<h1>$urlPath</h1><ul>")
    if ($urlPath -ne "/") { [void]$sb.Append("<li><a href='../'>..</a></li>") }
    Get-ChildItem -LiteralPath $dir -ErrorAction SilentlyContinue | Sort-Object { -not $_.PSIsContainer }, Name | ForEach-Object {
        $name = $_.Name
        if ($_.PSIsContainer) { $name += "/" }
        $href = [Uri]::EscapeDataString($_.Name)
        if ($_.PSIsContainer) { $href += "/" }
        [void]$sb.Append("<li><a href='$href'>$([System.Net.WebUtility]::HtmlEncode($name))</a></li>")
    }
    [void]$sb.Append("</ul>")
    return $sb.ToString()
}

$listener = $null
for ($p = $Port; $p -lt $Port + 20; $p++) {
    $l = New-Object System.Net.HttpListener
    $l.Prefixes.Add("http://localhost:$p/")
    try { $l.Start(); $listener = $l; $Port = $p; break } catch { $l.Close() }
}
if (-not $listener) { Write-Host "Nepodarilo sa najst volny port." -ForegroundColor Red; exit 1 }

$url = "http://localhost:$Port/"
Write-Host ""
Write-Host "  Live server bezi:  $url" -ForegroundColor Green
Write-Host "  Priecinok:         $Root"
Write-Host "  Zastavenie:        Ctrl+C alebo zatvor toto okno"
Write-Host ""
Start-Process $url

try {
    while ($listener.IsListening) {
        $task = $listener.GetContextAsync()
        while (-not $task.Wait(300)) { }   # umozni Ctrl+C
        $ctx = $task.Result
        $req = $ctx.Request
        $res = $ctx.Response
        try {
            $path = [Uri]::UnescapeDataString($req.Url.AbsolutePath)

            if ($path -eq "/__livereload") {
                Send-Text $res (Get-Stamp)
                continue
            }

            $rel = $path.TrimStart('/').Replace('/', $Sep)
            $full = [IO.Path]::GetFullPath([IO.Path]::Combine($Root, $rel)).TrimEnd('\', '/')

            if (($full -ne $Root) -and (-not $full.StartsWith($RootPrefix, [StringComparison]::OrdinalIgnoreCase))) {
                Send-Text $res "403 Forbidden" -status 403
                continue
            }

            if (Test-Path -LiteralPath $full -PathType Container) {
                if (-not $path.EndsWith("/")) {
                    $res.StatusCode = 301
                    $res.RedirectLocation = $path + "/"
                    continue
                }
                $index = Join-Path $full "index.html"
                if (Test-Path -LiteralPath $index -PathType Leaf) {
                    $full = $index
                } else {
                    Send-Text $res ((Get-Listing $full $path) + $reloadScript) "text/html; charset=utf-8"
                    continue
                }
            }

            if (Test-Path -LiteralPath $full -PathType Leaf) {
                $ext = [IO.Path]::GetExtension($full).ToLower()
                $type = $mime[$ext]
                if (-not $type) { $type = "application/octet-stream" }

                if ($ext -eq ".html" -or $ext -eq ".htm") {
                    $html = [IO.File]::ReadAllText($full, [Text.Encoding]::UTF8)
                    if ($html -match '(?i)</body>') {
                        $html = [regex]::Replace($html, '(?i)</body>', { param($m) $reloadScript + $m.Value })
                    } else {
                        $html += $reloadScript
                    }
                    Send-Text $res $html $type
                } else {
                    Send-Bytes $res ([IO.File]::ReadAllBytes($full)) $type
                }
                Write-Host ("  200  " + $path) -ForegroundColor DarkGray
            } else {
                Send-Text $res "404 Not Found: $path" -status 404
                Write-Host ("  404  " + $path) -ForegroundColor Yellow
            }
        } catch {
            try { $res.StatusCode = 500 } catch { }
        } finally {
            try { $res.Close() } catch { }
        }
    }
} finally {
    $listener.Stop()
    $listener.Close()
}
