$ErrorActionPreference = "Stop"
$baseUrl = "http://localhost:5032/api"

function Test-Get($path) {
    Write-Host "GET $path" -ForegroundColor Cyan
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/$path" -Method Get
        Write-Host "Success" -ForegroundColor Green
        return $response
    }
    catch {
        Write-Host "Failed: $_" -ForegroundColor Red
        return $null
    }
}

function Test-Post($path, $body) {
    Write-Host "POST $path" -ForegroundColor Cyan
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/$path" -Method Post -Body ($body | ConvertTo-Json) -ContentType "application/json"
        Write-Host "Success" -ForegroundColor Green
        return $response
    }
    catch {
        Write-Host "Failed: $_" -ForegroundColor Red
        if ($_.Exception.Response) {
            try {
                $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                Write-Host "Response Body: $($reader.ReadToEnd())" -ForegroundColor Yellow
            }
            catch {}
        }
        return $null
    }
}

function Test-Put($path, $body) {
    Write-Host "PUT $path" -ForegroundColor Cyan
    try {
        Invoke-RestMethod -Uri "$baseUrl/$path" -Method Put -Body ($body | ConvertTo-Json) -ContentType "application/json"
        Write-Host "Success" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "Failed: $_" -ForegroundColor Red
        return $false
    }
}

function Test-Delete($path) {
    Write-Host "DELETE $path" -ForegroundColor Cyan
    try {
        Invoke-RestMethod -Uri "$baseUrl/$path" -Method Delete
        Write-Host "Success" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "Failed: $_" -ForegroundColor Red
        return $false
    }
}

# 1. Faculty
Write-Host "`n--- Faculty ---" -ForegroundColor Magenta
$faculties = Test-Get "Faculty"
if ($faculties.Count -gt 0) {
    $firstFaculty = $faculties[0]
    Test-Get "Faculty/$($firstFaculty.id)" | Out-Null
}

$facultyLogin = @{
    Email    = "ritesh.kapoor@techuniv.edu"
    Password = "8jK2pL0mN4qO6rP8sT0uV2wX"
}
Test-Post "Faculty/login" $facultyLogin | Out-Null

# 2. Subject
Write-Host "`n--- Subject ---" -ForegroundColor Magenta
$subjects = Test-Get "Subject"
$subjectId = 0
if ($subjects.Count -gt 0) {
    $firstSubject = $subjects[0]
    $subjectId = $firstSubject.id
    Test-Get "Subject/$subjectId" | Out-Null
}

# 3. User
Write-Host "`n--- User ---" -ForegroundColor Magenta
$rand = Get-Random
$userEmail = "testuser_$rand@univ.edu"
$newUser = @{
    Name        = "Test User $rand"
    UniEmail    = $userEmail
    Password    = "Password123!"
    PhoneNumber = "1234567890"
    StudentId   = "S$rand"
    Branch      = "CS"
    Bio         = "Tester"
}

$createdUser = Test-Post "User" $newUser

if ($createdUser) {
    $userId = $createdUser.id
    
    # Login
    $loginData = @{
        Email    = $userEmail
        Password = "Password123!"
    }
    $token = Test-Post "User/login" $loginData

    # Get by ID
    Test-Get "User/$userId" | Out-Null

    # Get by Email
    Test-Get "User/email/$userEmail" | Out-Null

    # Update Bio
    $createdUser.bio = "Updated Bio"
    Test-Put "User/$userId" $createdUser | Out-Null
    
    # Verify Update
    $updatedUser = Test-Get "User/$userId"
    if ($updatedUser.bio -eq "Updated Bio") {
        Write-Host "Update Verified" -ForegroundColor Green
    }
    else {
        Write-Host "Update Failed verification" -ForegroundColor Red
    }

    # Enroll
    if ($subjectId -ne 0) {
        $enrollData = @{
            UserEmail = $userEmail
            CourseId  = $subjectId
        }
        Test-Post "User/enroll" $enrollData | Out-Null

        # Get Enrollments
        $enrollments = Test-Get "User/$userEmail/enrollments"
        if ($enrollments.Count -gt 0) {
            Write-Host "Enrollment Verified" -ForegroundColor Green
        }
        else {
            Write-Host "Enrollment Failed verification" -ForegroundColor Red
        }
    }

    # Test Duplicate Registration (Expect Conflict 409)
    Write-Host "`nTesting Duplicate User Registration..." -ForegroundColor Cyan
    try {
        Invoke-RestMethod -Uri "$baseUrl/User" -Method Post -Body ($newUser | ConvertTo-Json) -ContentType "application/json"
        Write-Host "Duplicate Registration Failed (Should have errored)" -ForegroundColor Red
    }
    catch {
        if ($_.Exception.Response.StatusCode -eq "Conflict") {
            Write-Host "Duplicate Registration Verified (409 Conflict)" -ForegroundColor Green
        }
        else {
            Write-Host "Duplicate Registration check failed with unexpected error: $_" -ForegroundColor Red
        }
    }

    # Delete User
    Test-Delete "User/$userId" | Out-Null
    
    # Verify Delete
    # Expect 404
    try {
        Invoke-RestMethod -Uri "$baseUrl/User/$userId" -Method Get
        Write-Host "Delete Failed (User still exists)" -ForegroundColor Red
    }
    catch {
        if ($_.Exception.Response.StatusCode -eq "NotFound") {
            Write-Host "Delete Verified (404)" -ForegroundColor Green
        }
        else {
            Write-Host "Delete check failed with unexpected error: $_" -ForegroundColor Red
        }
    }
}
