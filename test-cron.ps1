$baseUrl = "http://localhost:3000"
$cronSecret = "baraka-akram"

function Test-WeeklyDigest {
    Write-Host "Testing Weekly Digest Cron Job (POST with ?secret=)..." -ForegroundColor Cyan
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/cron/weekly-digest?secret=$cronSecret" -Method Post
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
    Write-Host "Testing Expiration Report Cron Job (POST with ?secret=)..." -ForegroundColor Cyan
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/cron/expiration-report?secret=$cronSecret" -Method Post
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

function Test-RetargetUsers {
    Write-Host "Testing Retarget Users Cron Job (POST with ?secret=)..." -ForegroundColor Cyan
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/cron/retarget-users?secret=$cronSecret" -Method Post
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

Write-Host "Select a Cron Job to test (POST):"
Write-Host "1. Weekly Digest"
Write-Host "2. Expiration Report"
Write-Host "3. Retarget Users"
$choice = Read-Host "Enter number (1, 2 or 3)"

if ($choice -eq "1") {
    Test-WeeklyDigest
} elseif ($choice -eq "2") {
    Test-ExpirationReport
} elseif ($choice -eq "3") {
    Test-RetargetUsers
} else {
    Write-Host "Invalid choice." -ForegroundColor Yellow
}
