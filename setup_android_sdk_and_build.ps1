# Fast Automated Android SDK and APK Builder
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

Write-Host '========================================================' -ForegroundColor Cyan
Write-Host '  Apex Study OS - Automated Android SDK and APK Builder' -ForegroundColor Cyan
Write-Host '========================================================' -ForegroundColor Cyan
Write-Host ''

$WorkspaceDir = $PSScriptRoot
$SdkDir = "$env:LOCALAPPDATA\Android\Sdk"
$JdkFolder = "C:\Users\Asus\Downloads\jdk17\jdk17.0.20_10"

# 1. Setup JDK 17
if (-not (Test-Path "$JdkFolder\bin\java.exe")) {
    Write-Host "[1/5] JDK 17 not found at $JdkFolder" -ForegroundColor Red
    Exit 1
}
Write-Host "[1/5] Using JDK 17: $JdkFolder" -ForegroundColor Green
$env:JAVA_HOME = $JdkFolder
$env:PATH = "$JdkFolder\bin;" + $env:PATH

# 2. Setup Android SDK Command-Line Tools
$needsSdk = $false
if (-not (Test-Path "$SdkDir\platforms\android-34") -or -not (Test-Path "$SdkDir\build-tools\34.0.0")) {
    $needsSdk = $true
}

if ($needsSdk) {
    Write-Host "[2/5] Setting up Android SDK Command-Line Tools in $SdkDir..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path "$SdkDir\cmdline-tools" -Force | Out-Null
    
    $cmdlineZip = "$env:USERPROFILE\Downloads\commandlinetools.zip"
    $sdkManagerBat = "$SdkDir\cmdline-tools\latest\bin\sdkmanager.bat"
    
    if (-not (Test-Path $sdkManagerBat)) {
        Write-Host "Downloading Google Android Command-Line Tools (using fast curl)..." -ForegroundColor Cyan
        curl.exe -L -o $cmdlineZip "https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip"
        
        Write-Host "Extracting Command-Line Tools..." -ForegroundColor Cyan
        $tempExtract = "$env:USERPROFILE\Downloads\cmdline_temp"
        Expand-Archive -Path $cmdlineZip -DestinationPath $tempExtract -Force
        
        New-Item -ItemType Directory -Path "$SdkDir\cmdline-tools\latest" -Force | Out-Null
        Copy-Item -Path "$tempExtract\cmdline-tools\*" -Destination "$SdkDir\cmdline-tools\latest" -Recurse -Force
        Remove-Item $tempExtract -Recurse -Force -ErrorAction SilentlyContinue
        Remove-Item $cmdlineZip -Force -ErrorAction SilentlyContinue
    }

    Write-Host "Accepting licenses and downloading Android 34 platform and build-tools..." -ForegroundColor Cyan
    cmd.exe /c "echo y | `"$sdkManagerBat`" --sdk_root=`"$SdkDir`" --licenses"
    cmd.exe /c "`"$sdkManagerBat`" --sdk_root=`"$SdkDir`" `"platform-tools`" `"platforms;android-34`" `"build-tools;34.0.0`""
}
Write-Host "[2/5] Android SDK is ready at $SdkDir" -ForegroundColor Green

# 3. Configure local.properties
$localProps = "$WorkspaceDir\android\local.properties"
$escapedSdk = $SdkDir.Replace('\', '\\')
"sdk.dir=$escapedSdk" | Out-File -FilePath $localProps -Encoding ascii
Write-Host "[3/5] Configured android/local.properties" -ForegroundColor Green

# 4. Build Web Bundle
Write-Host "[4/5] Building Web Bundle and Syncing Capacitor..." -ForegroundColor Yellow
Set-Location $WorkspaceDir
npm run build:android

# 5. Assemble APK via Gradle
Write-Host "[5/5] Compiling APK using Gradle..." -ForegroundColor Yellow
Set-Location "$WorkspaceDir\android"
$env:ANDROID_HOME = $SdkDir
$env:ANDROID_SDK_ROOT = $SdkDir

cmd.exe /c "gradlew.bat assembleDebug"

$apkFile = "$WorkspaceDir\android\app\build\outputs\apk\debug\app-debug.apk"
Set-Location $WorkspaceDir

if (Test-Path $apkFile) {
    Write-Host ''
    Write-Host '========================================================' -ForegroundColor Green
    Write-Host '  🎉 SUCCESS! ANDROID APK COMPILED SUCCESSFULLY!' -ForegroundColor Green
    Write-Host '========================================================' -ForegroundColor Green
    Write-Host "APK Location: $apkFile" -ForegroundColor White
    $apkMb = [math]::Round((Get-Item $apkFile).Length / 1MB, 2)
    Write-Host "APK File Size: $apkMb MB" -ForegroundColor Cyan
    Write-Host ''
    Write-Host 'How to run on your phone:' -ForegroundColor Yellow
    Write-Host '1. Send app-debug.apk to your phone (USB, Google Drive, WhatsApp).' -ForegroundColor White
    Write-Host '2. Tap the APK file on your phone and click Install.' -ForegroundColor White
    Write-Host '3. Open Apex Study OS on your phone!' -ForegroundColor Green
} else {
    Write-Host '[ERROR] APK compilation failed.' -ForegroundColor Red
}
