# Automated Android License Writer & SDK Component Installer
$SdkDir = "$env:LOCALAPPDATA\Android\Sdk"
$LicenseDir = "$SdkDir\licenses"

New-Item -ItemType Directory -Path $LicenseDir -Force | Out-Null

# Write accepted license hashes
$androidSdkLicense = @"
8933bad161af4178b1185d1a37fbf41ea5269c55
d56f5187479451eabf01fb78af6dfcb131a6481e
24333f8a63b6825ea9c5514f83c2829b004d1fee
84831b940964656d6f01b253b38536f13f9b5def
"@
$androidSdkLicense | Out-File -FilePath "$LicenseDir\android-sdk-license" -Encoding ascii -Force

$androidPreviewLicense = @"
84831b940964656d6f01b253b38536f13f9b5def
"@
$androidPreviewLicense | Out-File -FilePath "$LicenseDir\android-sdk-preview-license" -Encoding ascii -Force

$androidArmLicense = @"
d9754688767a44d0e0709d92d6091499cc030f89
"@
$androidArmLicense | Out-File -FilePath "$LicenseDir\android-sdk-arm-dbt-license" -Encoding ascii -Force

Write-Host "Licenses configured successfully in $LicenseDir" -ForegroundColor Green

# Install Android 34 platform & build-tools
$sdkManagerBat = "$SdkDir\cmdline-tools\latest\bin\sdkmanager.bat"
$JdkFolder = "C:\Users\Asus\Downloads\jdk17\jdk17.0.20_10"
$env:JAVA_HOME = $JdkFolder
$env:PATH = "$JdkFolder\bin;" + $env:PATH

Write-Host "Installing platform-tools, platforms;android-34, and build-tools;34.0.0..." -ForegroundColor Cyan
& $sdkManagerBat --sdk_root="$SdkDir" "platform-tools" "platforms;android-34" "build-tools;34.0.0"

Write-Host "Android SDK Installation Complete!" -ForegroundColor Green
