# 🚀 Apex Study OS — AI-Powered Exam Preparation & Planning System

Apex Study OS is an intelligent, full-featured web operating system designed for CBSE and school examination prep (Classes 7th, 8th, 9th, and 10th). It integrates **Official 2026–2027 Half-Yearly Exam Timetables**, **NVIDIA NIM AI Study Tutoring**, **Offline NCERT PDF Textbook Reader**, **Ebbinghaus Spaced Repetition**, and **Active Recall Drills**.

---

## ✨ Features

- 📅 **Official Gyan Niketan Examination Schedules**: Exact schedules, timings, and marks for Class 7, 8, 9, and 10.
- 🤖 **NVIDIA NIM AI Study Configuration**: AI-powered cognitive weight balancing, high-yield topic analysis, and neural configuration loading screen.
- 📚 **Embedded NCERT PDF Textbook Reader**: Big zoomable reader with full offline PDF chapters for Mathematics, Science, English (Beehive), Hindi (Kshitij), and Social Science.
- 🔁 **Spaced Repetition & Error Notebook**: Intelligent Leitner/Ebbinghaus review schedules with error log analytics.
- ⚡ **Interactive AI Mock Tests**: Full timed practice exams with instant CBSE marking breakdown.
- 🌓 **Dark Futuristic Design**: Smooth gradients, responsive layout for mobile and desktop, sound cues, and confetti celebrations.

---

## 🌐 Quick Deployment Guide (GitHub Pages)

### Step 1: Initialize Git and Commit
Open PowerShell or Terminal in the project folder and run:

```bash
git init
git add .
git commit -m "Initial commit: Apex Study OS"
```

### Step 2: Create a New Repository on GitHub
1. Go to [https://github.com/new](https://github.com/new).
2. Name your repository (e.g., `apex-study-os` or `jarvis`).
3. Set the visibility to **Public**.
4. Click **Create repository** (do not check "Initialize with README").

### Step 3: Link and Push to GitHub
Copy the commands shown on GitHub or run:

```bash
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

*(Replace `YOUR_GITHUB_USERNAME` and `YOUR_REPO_NAME` with your actual GitHub username and repository name).*

### Step 4: Enable GitHub Pages
1. On GitHub, go to your repository **Settings** → **Pages** (in the left sidebar).
2. Under **Build and deployment** → **Source**, select **GitHub Actions**.
3. That's it! The automated workflow in `.github/workflows/deploy.yml` will automatically build and publish the live web link (e.g., `https://your-username.github.io/apex-study-os/`).

---

## ⚡ Alternative 1-Click Deployment (Vercel / Netlify)

### Deploying to Vercel:
1. Go to [https://vercel.com/new](https://vercel.com/new).
2. Import your GitHub repository.
3. Framework Preset will automatically detect **Vite**.
4. Click **Deploy**! Your site is live in ~30 seconds.

### Deploying to Netlify:
1. Go to [https://app.netlify.com/start](https://app.netlify.com/start).
2. Connect your GitHub repository.
3. Build command: `npm run build`, Publish directory: `dist`.
4. Click **Deploy Site**!

---

## 💻 Local Development

### Prerequisites:
- **Node.js**: v18 or higher
- **Python**: 3.10+ (for optional local reasoning backend)

### Steps:
```bash
# 1. Install dependencies
npm install

# 2. Run the Vite dev server
npm run dev

# 3. (Optional) Run the Python AI reasoning backend
python api_server.py
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔑 Environment Variables & AI Configuration

You can provide your free NVIDIA API Key directly in the app UI via **Settings** → **NVIDIA AI API Key**, or via `.env`:

```env
VITE_NVIDIA_API_KEY=nvapi-your-key-here
```
