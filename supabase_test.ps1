# supabase_test.ps1 - quick PowerShell test to POST a row to your Supabase table
# Run this in PowerShell from the project folder.

$url = 'https://asnvouccgrlejilujldw.supabase.co/rest/v1/schedules'
$anon = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzbnZvdWNjZ3JsZWppbHVqbGR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4ODMxMjgsImV4cCI6MjA3NTQ1OTEyOH0.BQAGm8f8YtNxPcWeb6CgZrB2nhLb2Nx9u1ONgX5oPJM'
$body = @{
  name = 'PS Test User'
  phone = '+1234567890'
  email = 'ps-test@example.com'
  pickup_date = (Get-Date).ToString('yyyy-MM-dd')
  pickup_time = '10:00'
  address = 'PowerShell test address'
  notes = 'testing REST insert'
  created_at = (Get-Date).ToString('o')
} | ConvertTo-Json

try {
  $resp = Invoke-RestMethod -Uri $url -Method Post -Body $body -ContentType 'application/json' -Headers @{ 
    apikey = $anon
    Authorization = "Bearer $anon"
    Prefer = 'return=representation'
  }
  Write-Host "Insert success:`n" ($resp | ConvertTo-Json -Depth 5)
} catch {
  Write-Host "Error: $($_.Exception.Message)"
  if ($_.Exception.Response) {
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $reader.ReadToEnd()
  }
}
