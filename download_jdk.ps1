$destZip = "$env:USERPROFILE\Downloads\corretto17.zip"
$destDir = "$env:USERPROFILE\Downloads\jdk17"

if (-not (Test-Path "$destDir\jdk17*")) {
    Write-Host "Downloading Amazon Corretto 17 JDK (64-bit Windows)..." -ForegroundColor Cyan
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Invoke-WebRequest -Uri "https://corretto.aws/downloads/latest/amazon-corretto-17-x64-windows-jdk.zip" -OutFile $destZip
    
    Write-Host "Extracting JDK 17 to $destDir..." -ForegroundColor Cyan
    Expand-Archive -Path $destZip -DestinationPath $destDir -Force
    Remove-Item $destZip -Force -ErrorAction SilentlyContinue
    Write-Host "JDK 17 download and extraction completed!" -ForegroundColor Green
} else {
    Write-Host "JDK 17 already present in $destDir" -ForegroundColor Green
}

$jdkFolder = Get-ChildItem "$destDir\jdk*" | Select-Object -First 1 -ExpandProperty FullName
Write-Host "JDK_HOME: $jdkFolder" -ForegroundColor Yellow
