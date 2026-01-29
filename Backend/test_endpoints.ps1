$baseUrl = "http://localhost:5032/api"

function Test-Endpoint($method, $path, $body = $null) {
    Write-Host "Testing $method $path ..." -ForegroundColor Cyan
    try {
        $params = @{
            Uri = "$baseUrl/$path"
            Method = $method
            ContentType = "application/json"
            UseBasicParsing = $true
        }
        if ($body) {
            $params.Body = $body | ConvertTo-Json
        }
        $response = Invoke-WebRequest @params
        Write-Host "Success: $($response.StatusCode)" -ForegroundColor Green
        return $response.Content | ConvertFrom-Json
    } catch {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            Write-Host "Response: $($reader.ReadToEnd())" -ForegroundColor Yellow
        }
    }
}

Write-Host "`n--- Testing Faculty Endpoints ---" -ForegroundColor Magenta
$faculties = Test-Endpoint "GET" "Faculty"
if ($faculties) { Write-Host "Found $($faculties.Count) faculties" }

$facultyLogin = @{
    Email = "ritesh.kapoor@techuniv.edu"
    Password = "8jK2pL0mN4qO6rP8sT0uV2wX"
}
$facultyToken = Test-Endpoint "POST" "Faculty/login" $facultyLogin
if ($facultyToken) { Write-Host "Faculty Login Successful" }

Write-Host "`n--- Testing Subject Endpoints ---" -ForegroundColor Magenta
$subjects = Test-Endpoint "GET" "Subject"
if ($subjects) { Write-Host "Found $($subjects.Count) subjects" }

Write-Host "`n--- Testing User Endpoints ---" -ForegroundColor Magenta
$testUser = @{
    Name = "Test User"
    UniEmail = "test@univ.edu"
    Password = "Password123!"
    PhoneNumber = "1234567890"
    StudentId = "S12345"
    Branch = "CS"
    Bio = "Tester"
}
$registeredUser = Test-Endpoint "POST" "User" $testUser

$userLogin = @{
    Email = "test@univ.edu"
    Password = "Password123!"
}
$userToken = Test-Endpoint "POST" "User/login" $userLogin
if ($userToken) { Write-Host "User Login Successful" }

$users = Test-Endpoint "GET" "User"
if ($users) { Write-Host "Found $($users.Count) users" }
