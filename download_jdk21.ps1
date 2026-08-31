# Download and extract JDK 21
$ProgressPreference = 'SilentlyContinue'
$zip = "$env:USERPROFILE\Downloads\corretto21.zip"
$dir = "$env:USERPROFILE\Downloads\jdk21"

if (-not (Test-Path "$dir\jdk21*")) {
    Write-Host "Downloading Amazon Corretto 21 JDK..." -ForegroundColor Cyan
    curl.exe -L -o $zip "https://corretto.aws/downloads/latest/amazon-corretto-21-x64-windows-jdk.zip"
    Write-Host "Extracting JDK 21..." -ForegroundColor Cyan
    Expand-Archive -Path $zip -DestinationPath $dir -Force
    Remove-Item $zip -Force -ErrorAction SilentlyContinue
    Write-Host "JDK 21 is ready!" -ForegroundColor Green
}

$jdkFolder = (Get-ChildItem -Path "$dir\jdk21*" -Directory | Select-Object -First 1).FullName
Write-Host "JDK 21 Path: $jdkFolder" -ForegroundColor Yellow
