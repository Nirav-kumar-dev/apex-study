# ⚡ Apex Study OS — CBSE AI Study Suite & Examination Engine

> [!IMPORTANT]
> **🌐 Web Preview Notice**: The hosted website is only an **online preview/demo**. To use the **full application** with offline NCERT PDF textbooks, local progress persistence, and unrestricted high-speed NVIDIA NIM AI tutoring, you must **download and run the desktop application on your computer**.

---

## 📥 Download & Desktop Installation

### 🚀 Quick Start (Recommended)
1. Download **[`installer.exe`](https://github.com/Nirav-kumar-dev/apex-study/raw/main/desktop/installer.exe)** on your Windows computer.
2. Run `installer.exe` and click **Install Now**.
   - The installer automatically downloads the full repository and all NCERT textbook PDFs.
   - Installs both **`Apex Study.exe` (Launcher)** and **`Uninstall.exe` (Uninstaller)** into `%LOCALAPPDATA%\Programs\ApexStudy`.
   - Creates dual Desktop shortcuts: **`Apex Study OS`** and **`Uninstall Apex Study OS`**.
3. Click **Launch Apex Study OS** (or open the Desktop shortcut).
   - The launcher starts all background services (Python API, Vite local host server, PDF streaming proxy) and automatically opens your web browser to **`http://localhost:5173/`**.

---

## 🗑️ How to Uninstall
If you ever want to remove the application completely from your computer:
1. Double-click the **`Uninstall Apex Study OS`** shortcut on your Desktop (or run `Uninstall.exe`).
2. Click **Yes** to confirm.
3. The uninstaller will safely close all running background processes and completely delete:
   - All downloaded repository files, source code, and `node_modules`
   - All offline NCERT textbook PDFs
   - All AppData profiles, cached data, and scheduled watchdog tasks
   - All Desktop and Start Menu shortcuts

---

## ✨ Features

- 🤖 **NVIDIA NIM AI Study Tutor**: Step-by-step mathematical derivations, physics numerical problem solver with reasoning tokens, and instant CBSE rubric evaluation.
- 📚 **Full Offline NCERT PDF Textbook Reader**: Embedded reader with smooth page zooming, range byte streaming, and instant chapter search for Mathematics, Science, English, Hindi, and Social Science.
- 📅 **Official 2026–2027 Examination Timetables**: Preloaded exam schedules and syllabus breakdowns for Classes 7th, 8th, 9th, and 10th.
- 🔁 **Ebbinghaus Spaced Repetition**: Leitner box scheduling and active recall drills to maximize long-term retention.
- 📓 **Smart Error Notebook**: Categorize errors into Conceptual, Calculation, or Recall slips with diagnostic remediation tips.
- ⚡ **Interactive AI Mock Tests**: Auto-synthesize CBSE mock exam papers tailored by topic and difficulty level.

---

## 💻 Manual Developer Setup (Localhost)

If you prefer to run the project from source code using terminal commands:

### Prerequisites:
- **Node.js**: v18 or higher (with `npm`)
- **Python**: 3.10+ (for backend API proxy)

### Commands:
```bash
# 1. Clone the repository
git clone https://github.com/Nirav-kumar-dev/apex-study.git
cd apex-study

# 2. Install frontend dependencies
npm install

# 3. Start the Vite development server
npm run dev

# 4. (Optional) Run the standalone desktop launcher
python desktop/apex_app.py
```

Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 🔑 NVIDIA NIM API Configuration

You can configure your free NVIDIA API Key directly in the app UI via **Settings** → **NVIDIA AI API Key**, or by creating a `.env` file in the root directory:

```env
VITE_NVIDIA_API_KEY=nvapi-your-key-here
```

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
