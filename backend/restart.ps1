# Stop process on port 5000
$connections = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
foreach ($conn in $connections) {
    Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
}

Write-Host "Waiting for port to be released..."
Start-Sleep -Seconds 2

# Start the server
Write-Host "Starting backend server..."
npm run dev
