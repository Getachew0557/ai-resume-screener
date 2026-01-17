$ports = @(3000, 3001, 3002, 3003, 3004, 3006, 3007, 3008, 3009, 5005, 5006, 5173, 5174)

foreach ($port in $ports) {
    echo "Checking port $port..."
    $process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($process) {
        $pid_to_kill = $process.OwningProcess
        echo "Killing PID $pid_to_kill on port $port"
        Stop-Process -Id $pid_to_kill -Force -ErrorAction SilentlyContinue
    }
    else {
        echo "Port $port is free."
    }
}

echo "Stopping all python processes just in case..."
Get-Process python -ErrorAction SilentlyContinue | Stop-Process -Force
echo "Stopping all node processes just in case..."
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

echo "Done."
