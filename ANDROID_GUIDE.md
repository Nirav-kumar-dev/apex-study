# 📱 Apex Study OS — Android App Guide & Build Instructions

Welcome to the **Apex Study OS Android Application**! This project has been converted into a high-performance **native Android application** using **Capacitor** and **Android Gradle**.

---

## 🌟 Key Android Features

- 📲 **Native Android Shell**: Full native Android project located in [`android/`](file:///c:/Users/Asus/Downloads/apex-study-main/apex-study-main/android).
- 🔙 **Hardware Back-Button Navigation**: Pressing the Android physical/gesture back button automatically closes active modals (Chapter details, Active Recall, Add Task, Settings), returns from sub-views to Dashboard, or safely exits the app.
- 🎨 **Immersive Dark Status Bar**: Integrated with `@capacitor/status-bar` and theme `#030712` for edge-to-edge dark navy aesthetic.
- 📐 **Notch & Safe-Area Insets**: Full support for camera cutouts, rounded corners, and Android gesture navigation bars (`viewport-fit=cover`, `pt-safe`, `pb-safe`).
- 🤖 **Direct NVIDIA NIM AI Tutoring**: Direct HTTPS communication with NVIDIA NIM API (`https://integrate.api.nvidia.com/v1`) without CORS proxy constraints.
- 📚 **Full Offline NCERT Textbook Suite**: Offline PDF textbook chapters bundled directly into the APK asset container.

---

## 🚀 How to Build & Run the Android App

### Method 1: Using Android Studio (Recommended & Easiest)

If you have **Android Studio** installed:

1. In your terminal, run:
   ```bash
   npm run cap:open
   ```
   *(Or: `npx cap open android`)*
2. Android Studio will open the [`android/`](file:///c:/Users/Asus/Downloads/apex-study-main/apex-study-main/android) project automatically.
3. Wait a moment for Gradle to sync.
4. **To Run on Device / Emulator**:
   - Connect your Android phone with **USB Debugging** enabled, or start an Android Virtual Device (AVD).
   - Click the green **Run ▶️** button in Android Studio.
5. **To Generate an APK (`.apk`) file**:
   - In the top menu, go to **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**.
   - Click **locate** in the bottom-right notification to get your `app-debug.apk`.

---

### Method 2: 1-Click Automated Script (`build-apk.bat`)

For Windows users with JDK 17+ and Android SDK configured:

1. Double-click **[`build-apk.bat`](file:///c:/Users/Asus/Downloads/apex-study-main/apex-study-main/build-apk.bat)** (or run `./build-apk.ps1` in PowerShell).
2. The script will automatically:
   - Compile the React/TypeScript frontend (`npm run build`).
   - Sync all assets with the Android project (`npx cap sync android`).
   - Run Gradle wrapper to assemble the APK (`gradlew assembleDebug`).
3. Your generated APK will be ready at:
   ```
   android\app\build\outputs\apk\debug\app-debug.apk
   ```

---

### Method 3: Command Line (CLI) Workflow

```bash
# 1. Build web production bundle & sync with Android
npm run build:android

# 2. Navigate to android directory
cd android

# 3. Assemble Debug APK
.\gradlew.bat assembleDebug

# 4. Install directly to connected Android device via ADB
adb install -r app\build\outputs\apk\debug\app-debug.apk
```

---

## 📲 How to Install the APK on Your Android Phone

1. Take the generated file: `android\app\build\outputs\apk\debug\app-debug.apk`.
2. Transfer it to your Android device using any method:
   - **USB Cable**: Copy to your phone's *Download* folder.
   - **Google Drive / WhatsApp / Telegram**: Upload and download on your phone.
   - **ADB**: Run `adb install -r app-debug.apk`.
3. On your phone, tap the `.apk` file and select **Install**.
   *(If prompted, enable "Allow installation from unknown sources" in Android settings).*
4. Launch **Apex Study OS** from your home screen / app drawer! 🎉

---

## 🛠️ Project Structure

```
apex-study-main/
├── android/                     # 📱 Native Android Studio & Gradle Project
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── AndroidManifest.xml   # Android permissions & activity configuration
│   │   │   ├── java/.../MainActivity.java # Native Android entry point
│   │   │   ├── assets/public/        # Bundled web app + NCERT textbooks
│   │   │   └── res/                  # App icons, splash screens, dark styles & colors
│   │   └── build.gradle         # App-level build configurations & dependencies
│   ├── build.gradle             # Project-level Gradle build file
│   └── gradlew.bat              # Gradle wrapper for CLI builds
├── capacitor.config.ts          # ⚙️ Capacitor configuration (App ID: com.apexstudy.os)
├── build-apk.bat                # ⚡ 1-Click Windows APK builder script
├── build-apk.ps1                # ⚡ PowerShell APK builder script
├── src/                         # ⚛️ React 19 + TypeScript + Tailwind source code
│   ├── components/layout/       # MainLayout with Android hardware back-button listener
│   ├── lib/nvidiaApi.ts         # Direct HTTPS NVIDIA NIM AI Engine for mobile
│   └── index.css                # Mobile safe-area (notch / gesture bar) CSS classes
└── package.json                 # Project scripts (cap:sync, cap:open, build:android)
```

---

## 🔑 NVIDIA AI Setup on Mobile

On first launch in the Android app:
1. Go to **Settings** (or the **NVIDIA AI Tutor** panel).
2. Enter your NVIDIA NIM API key (starts with `nvapi-...`).
3. Your key is stored securely in the app's local storage and enables full AI exam synthesis, step-by-step problem solving, and CBSE rubric grading on your phone!
