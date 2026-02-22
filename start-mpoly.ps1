# start-mpoly.ps1  –  Launch backend API + Angular dev server
Write-Host "=== Starting Mpoly Application ===" -ForegroundColor Cyan

# Kill any existing processes on ports 3000 / 4200
foreach ($port in @(3000, 4200)) {
    $pids = (netstat -ano | Select-String "LISTENING" | Select-String ":$port ") -replace '.*\s+(\d+)$','$1'
    foreach ($p in $pids) {
        if ($p -match '^\d+$') {
            Stop-Process -Id ([int]$p) -Force -ErrorAction SilentlyContinue
            Write-Host "  Stopped existing process on :$port (PID $p)" -ForegroundColor DarkGray
        }
    }
}
Start-Sleep 1

# Start API
Write-Host "Starting backend API on port 3000..." -ForegroundColor Yellow
$ngJs = "$PSScriptRoot\frontend\node_modules\@angular\cli\bin\ng.js"
Start-Process -NoNewWindow -FilePath "node" -ArgumentList "server.js" -WorkingDirectory "$PSScriptRoot\backend"
Start-Sleep 2

# Test API health
try {
    $h = Invoke-RestMethod http://localhost:3000/api/health
    Write-Host "[OK] Backend health: $($h.status) at $($h.timestamp)" -ForegroundColor Green
} catch {
    Write-Host "[WARN] Backend may still be starting..." -ForegroundColor Yellow
}

# Start Angular dev server with proxy
Write-Host "Starting Angular dev server on port 4200..." -ForegroundColor Yellow
Start-Process -NoNewWindow -FilePath "node" -ArgumentList "$ngJs serve --proxy-config proxy.conf.json" -WorkingDirectory "$PSScriptRoot\frontend"
Start-Sleep 8

Write-Host ""
Write-Host "=== Mpoly is running ===" -ForegroundColor Green
Write-Host "  Frontend : http://localhost:4200" -ForegroundColor White
Write-Host "  API      : http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Demo credentials:" -ForegroundColor Cyan
Write-Host "  Admin:        userId=admin    password=password123" -ForegroundColor White
Write-Host "  General User: userId=jdoe     password=password123" -ForegroundColor White
