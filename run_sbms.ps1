Write-Host "Initializing Smart Beneficiary Mapping System (SBMS)..." -ForegroundColor Cyan

# Start Django Backend in a new window
Write-Host "Starting Django Backend Server on Port 8000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit -Command `"Set-Location 'd:\Smart BENE mapping\sbms_project'; python manage.py runserver`""

# Start React Frontend in a new window
Write-Host "Starting Vite Frontend on Port 5173..." -ForegroundColor Magenta
Start-Process powershell -ArgumentList "-NoExit -Command `"Set-Location 'd:\Smart BENE mapping\sbms_frontend'; npm run dev`""

Write-Host "All intelligence nodes launched!" -ForegroundColor Green
