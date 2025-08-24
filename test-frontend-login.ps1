# Test frontend login
$body = @{
    email = 'admin@empresa.com'
    password = 'password123'
} | ConvertTo-Json

Write-Host "Testing frontend login with:" -ForegroundColor Yellow
Write-Host "Email: admin@empresa.com" -ForegroundColor Cyan
Write-Host "Password: password123" -ForegroundColor Cyan
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/auth/login" -Method POST -Body $body -ContentType "application/json"
    Write-Host "✅ Backend login successful!" -ForegroundColor Green
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend login failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Now test the frontend at: http://localhost:5173/login" -ForegroundColor Yellow
Write-Host "Open browser console (F12) to see detailed logs" -ForegroundColor Yellow
