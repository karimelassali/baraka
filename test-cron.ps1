$baseUrl = "http://localhost:3000"
$cronSecret = "ChangeMe123!" # Replace this if your .env CRON_SECRET is different

function Test-WeeklyDigest {
    Write-Host "Testing Weekly Digest Cron Job..." -ForegroundColor Cyan
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/cron/weekly-digest" -Method Get -Headers @{ "Authorization" = "Bearer $cronSecret" }
        Write-Host "Success!" -ForegroundColor Green
        Write-Host ($response | ConvertTo-Json -Depth 5)
    } catch {
        Write-Host "Error: $_" -ForegroundColor Red
        if ($_.Exception.Response) {
             $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
             $responseBody = $reader.ReadToEnd()
             Write-Host "Response Body: $responseBody" -ForegroundColor Red
        }
    }
}

function Test-ExpirationReport {
    Write-Host "Testing Expiration Report Cron Job..." -ForegroundColor Cyan
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/cron/expiration-report" -Method Get -Headers @{ "Authorization" = "Bearer $cronSecret" }
        Write-Host "Success!" -ForegroundColor Green
        Write-Host ($response | ConvertTo-Json -Depth 5)
    } catch {
        Write-Host "Error: $_" -ForegroundColor Red
        if ($_.Exception.Response) {
             $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
             $responseBody = $reader.ReadToEnd()
             Write-Host "Response Body: $responseBody" -ForegroundColor Red
        }
    }
}

Write-Host "Select a Cron Job to test:"
Write-Host "1. Weekly Digest"
Write-Host "2. Expiration Report"
$choice = Read-Host "Enter number (1 or 2)"

if ($choice -eq "1") {
    Test-WeeklyDigest
} elseif ($choice -eq "2") {
    Test-ExpirationReport
} else {
    Write-Host "Invalid choice." -ForegroundColor Yellow
}
