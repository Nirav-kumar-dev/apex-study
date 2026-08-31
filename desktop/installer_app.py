import os
import sys
import time
import shutil
import urllib.request
import zipfile
import subprocess
import threading
import tkinter as tk
from tkinter import ttk, messagebox

APP_NAME = "Apex Study OS"
REPO_URL = "https://github.com/Nirav-kumar-dev/apex-study.git"
ZIP_URL = "https://github.com/Nirav-kumar-dev/apex-study/archive/refs/heads/main.zip"
LAUNCHER_RAW_URL = "https://raw.githubusercontent.com/Nirav-kumar-dev/apex-study/main/desktop/Apex%20Study.exe"
UNINSTALLER_RAW_URL = "https://raw.githubusercontent.com/Nirav-kumar-dev/apex-study/main/desktop/Uninstall.exe"

LOCALAPPDATA = os.environ.get("LOCALAPPDATA", os.path.expanduser("~\\AppData\\Local"))
DEFAULT_INSTALL_DIR = os.path.join(LOCALAPPDATA, "Programs", "ApexStudy")
APP_DATA_DIR = os.path.join(LOCALAPPDATA, "ApexStudy")

def create_windows_shortcut(target_exe, shortcut_path, description="Apex Study OS Desktop App", icon_path=None, args=""):
    try:
        icon_line = f'$Shortcut.IconLocation = "{icon_path}";' if icon_path and os.path.exists(icon_path) else ''
        args_line = f'$Shortcut.Arguments = "{args}";' if args else ''
        ps_script = f'''
$WshShell = New-Object -comObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("{shortcut_path}")
$Shortcut.TargetPath = "{target_exe}"
$Shortcut.WorkingDirectory = "{os.path.dirname(target_exe)}"
$Shortcut.Description = "{description}"
{args_line}
{icon_line}
$Shortcut.Save()
'''
        subprocess.run(["powershell", "-ExecutionPolicy", "Bypass", "-Command", ps_script], 
                       capture_output=True, creationflags=subprocess.CREATE_NO_WINDOW if os.name == 'nt' else 0)
    except Exception:
        pass

def has_npm():
    try:
        res = subprocess.run("npm --version", shell=True, capture_output=True)
        return res.returncode == 0
    except Exception:
        return False

class InstallerGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("Apex Study OS — Setup & Installer")
        self.root.geometry("560x420")
        self.root.resizable(False, False)
        self.root.configure(bg="#0f172a") # Slate-900

        self.center_window()

        self.install_dir = DEFAULT_INSTALL_DIR
        self.is_installed = False

        self.create_widgets()

    def center_window(self):
        self.root.update_idletasks()
        w = 560
        h = 420
        x = (self.root.winfo_screenwidth() // 2) - (w // 2)
        y = (self.root.winfo_screenheight() // 2) - (h // 2)
        self.root.geometry(f'{w}x{h}+{x}+{y}')

    def create_widgets(self):
        header_frame = tk.Frame(self.root, bg="#1e1b4b", height=85)
        header_frame.pack(fill="x", side="top")

        title_label = tk.Label(header_frame, text="⚡ Apex Study OS", font=("Segoe UI", 16, "bold"), fg="#ffffff", bg="#1e1b4b")
        title_label.pack(anchor="w", padx=24, pady=(16, 2))

        subtitle_label = tk.Label(header_frame, text="Downloads repository, installs Launcher & Uninstaller, and opens localhost", font=("Segoe UI", 9), fg="#a5b4fc", bg="#1e1b4b")
        subtitle_label.pack(anchor="w", padx=24, pady=(0, 16))

        body_frame = tk.Frame(self.root, bg="#0f172a", padx=24, pady=18)
        body_frame.pack(fill="both", expand=True)

        dest_label = tk.Label(body_frame, text="Install Destination Folder:", font=("Segoe UI", 9, "bold"), fg="#cbd5e1", bg="#0f172a")
        dest_label.pack(anchor="w")

        path_box = tk.Entry(body_frame, font=("Segoe UI", 9), fg="#94a3b8", bg="#1e293b", relief="flat", insertbackground="white")
        path_box.insert(0, self.install_dir)
        path_box.configure(state="readonly")
        path_box.pack(fill="x", pady=(4, 10), ipady=6)

        repo_info = tk.Label(body_frame, text="Source: https://github.com/Nirav-kumar-dev/apex-study.git", font=("Segoe UI", 8), fg="#64748b", bg="#0f172a")
        repo_info.pack(anchor="w", pady=(0, 12))

        style = ttk.Style()
        style.theme_use('clam')
        style.configure("Indigo.Horizontal.TProgressbar", foreground='#4f46e5', background='#6366f1', troughcolor='#1e293b', bordercolor='#0f172a', lightcolor='#6366f1', darkcolor='#4f46e5')

        self.progress = ttk.Progressbar(body_frame, style="Indigo.Horizontal.TProgressbar", orient="horizontal", mode="determinate")
        self.progress.pack(fill="x", pady=(0, 8), ipady=3)

        self.status_label = tk.Label(body_frame, text="Ready to install. Click 'Install Now' to begin setup.", font=("Segoe UI", 9), fg="#94a3b8", bg="#0f172a")
        self.status_label.pack(anchor="w", pady=(0, 14))

        btn_frame = tk.Frame(self.root, bg="#0f172a", padx=24, pady=14)
        btn_frame.pack(fill="x", side="bottom")

        self.install_btn = tk.Button(btn_frame, text="Install Now", font=("Segoe UI", 10, "bold"), fg="#ffffff", bg="#4f46e5", activebackground="#4338ca", activeforeground="#ffffff", relief="flat", padx=20, pady=8, cursor="hand2", command=self.start_installation)
        self.install_btn.pack(side="right")

        self.cancel_btn = tk.Button(btn_frame, text="Cancel", font=("Segoe UI", 9), fg="#94a3b8", bg="#1e293b", activebackground="#334155", activeforeground="#ffffff", relief="flat", padx=16, pady=8, cursor="hand2", command=self.root.destroy)
        self.cancel_btn.pack(side="right", padx=(0, 10))

    def update_status(self, text, percent=None):
        self.status_label.config(text=text)
        if percent is not None:
            self.progress['value'] = percent
        self.root.update_idletasks()

    def start_installation(self):
        if self.is_installed:
            exe_path = os.path.join(self.install_dir, "Apex Study.exe")
            if not os.path.exists(exe_path):
                exe_path = os.path.join(self.install_dir, "apex.exe")
            if os.path.exists(exe_path):
                subprocess.Popen([exe_path], creationflags=subprocess.CREATE_NO_WINDOW if os.name == 'nt' else 0)
            self.root.destroy()
            return

        self.install_btn.config(state="disabled", bg="#312e81")
        self.cancel_btn.config(state="disabled")
        t = threading.Thread(target=self.run_install_worker, daemon=True)
        t.start()

    def run_install_worker(self):
        try:
            self.update_status("Creating installation folders...", 10)
            os.makedirs(self.install_dir, exist_ok=True)
            os.makedirs(APP_DATA_DIR, exist_ok=True)
            time.sleep(0.3)

            base_dir = getattr(sys, '_MEIPASS', os.path.dirname(os.path.abspath(__file__)))
            parent_dir = os.path.dirname(base_dir) if os.path.exists(os.path.join(os.path.dirname(base_dir), "package.json")) else base_dir

            dest_apex_exe = os.path.join(self.install_dir, "Apex Study.exe")
            dest_apex_alt = os.path.join(self.install_dir, "apex.exe")
            dest_uninstall_exe = os.path.join(self.install_dir, "Uninstall.exe")
            dest_icon = os.path.join(self.install_dir, "icon.ico")

            # Step 1: Download & Clone Full Repository from GitHub
            self.update_status("Downloading full repository files from GitHub...", 20)
            repo_downloaded = False

            temp_clone_dir = os.path.join(os.environ.get("TEMP", ""), "apex_clone_temp")
            if os.path.exists(temp_clone_dir):
                shutil.rmtree(temp_clone_dir, ignore_errors=True)

            try:
                cmd = f'git clone --depth 1 {REPO_URL} "{temp_clone_dir}"'
                res = subprocess.run(cmd, shell=True, capture_output=True)
                if res.returncode == 0 and os.path.exists(temp_clone_dir):
                    self.update_status("Extracting and copying repository files...", 40)
                    for item in os.listdir(temp_clone_dir):
                        if item == ".git":
                            continue
                        s = os.path.join(temp_clone_dir, item)
                        d = os.path.join(self.install_dir, item)
                        if os.path.isdir(s):
                            if os.path.exists(d):
                                shutil.rmtree(d, ignore_errors=True)
                            shutil.copytree(s, d)
                        else:
                            shutil.copy2(s, d)
                    shutil.rmtree(temp_clone_dir, ignore_errors=True)
                    repo_downloaded = True
            except Exception:
                pass

            if not repo_downloaded:
                try:
                    self.update_status("Downloading repository ZIP archive...", 30)
                    zip_temp = os.path.join(os.environ.get("TEMP", ""), "apex_main.zip")
                    
                    def report_hook(block_num, block_size, total_size):
                        if total_size > 0:
                            p = min(55, 30 + int((block_num * block_size / total_size) * 25))
                            self.update_status(f"Downloading files ({int((block_num * block_size)/(1024*1024))} MB)...", p)
                            
                    urllib.request.urlretrieve(ZIP_URL, zip_temp, reporthook=report_hook)
                    
                    self.update_status("Extracting files...", 58)
                    with zipfile.ZipFile(zip_temp, 'r') as zf:
                        extract_temp = os.path.join(os.environ.get("TEMP", ""), "apex_zip_extract")
                        if os.path.exists(extract_temp):
                            shutil.rmtree(extract_temp, ignore_errors=True)
                        zf.extractall(extract_temp)
                        
                        extracted_root = os.path.join(extract_temp, "apex-study-main")
                        if not os.path.exists(extracted_root):
                            extracted_root = extract_temp

                        for item in os.listdir(extracted_root):
                            s = os.path.join(extracted_root, item)
                            d = os.path.join(self.install_dir, item)
                            if os.path.isdir(s):
                                if os.path.exists(d):
                                    shutil.rmtree(d, ignore_errors=True)
                                shutil.copytree(s, d)
                            else:
                                shutil.copy2(s, d)
                                
                        shutil.rmtree(extract_temp, ignore_errors=True)
                    if os.path.exists(zip_temp):
                        os.remove(zip_temp)
                    repo_downloaded = True
                except Exception:
                    self.update_status("Using local bundle fallback...", 55)
                    for folder_name in ["dist", "book", "public", "src", "desktop"]:
                        s = os.path.join(parent_dir, folder_name)
                        d = os.path.join(self.install_dir, folder_name)
                        if os.path.exists(s):
                            if os.path.exists(d):
                                shutil.rmtree(d, ignore_errors=True)
                            shutil.copytree(s, d)
                    for f_name in ["package.json", "index.html", "vite.config.ts"]:
                        s = os.path.join(parent_dir, f_name)
                        d = os.path.join(self.install_dir, f_name)
                        if os.path.exists(s):
                            shutil.copy2(s, d)

            # Step 2: Install npm dependencies if npm is available
            if has_npm() and os.path.exists(os.path.join(self.install_dir, "package.json")):
                self.update_status("Configuring npm packages and Vite environment...", 68)
                try:
                    subprocess.run("npm install --prefer-offline --no-audit", shell=True, cwd=self.install_dir, capture_output=True)
                except Exception:
                    pass

            # Step 3: Install & Verify Launcher (Apex Study.exe) and Uninstaller (Uninstall.exe)
            self.update_status("Downloading & installing Launcher and Uninstaller...", 80)
            
            # Check embedded copies in installer first
            src_apex_exe = os.path.join(base_dir, "Apex Study.exe")
            if not os.path.exists(src_apex_exe):
                src_apex_exe = os.path.join(base_dir, "apex.exe")
            if not os.path.exists(src_apex_exe):
                src_apex_exe = os.path.join(parent_dir, "desktop", "Apex Study.exe")
            if not os.path.exists(src_apex_exe):
                src_apex_exe = os.path.join(self.install_dir, "desktop", "Apex Study.exe")

            src_uninstall_exe = os.path.join(base_dir, "Uninstall.exe")
            if not os.path.exists(src_uninstall_exe):
                src_uninstall_exe = os.path.join(parent_dir, "desktop", "Uninstall.exe")
            if not os.path.exists(src_uninstall_exe):
                src_uninstall_exe = os.path.join(self.install_dir, "desktop", "Uninstall.exe")

            src_icon = os.path.join(base_dir, "desktop_icon.ico")
            if not os.path.exists(src_icon):
                src_icon = os.path.join(parent_dir, "desktop_icon.ico")
            if not os.path.exists(src_icon):
                src_icon = os.path.join(self.install_dir, "desktop_icon.ico")

            # Copy Launcher
            if os.path.exists(src_apex_exe):
                shutil.copy2(src_apex_exe, dest_apex_exe)
                shutil.copy2(src_apex_exe, dest_apex_alt)
            else:
                # Try downloading from raw GitHub if missing
                try:
                    urllib.request.urlretrieve(LAUNCHER_RAW_URL, dest_apex_exe)
                    shutil.copy2(dest_apex_exe, dest_apex_alt)
                except Exception:
                    pass

            # Copy Uninstaller
            if os.path.exists(src_uninstall_exe):
                shutil.copy2(src_uninstall_exe, dest_uninstall_exe)
            else:
                try:
                    urllib.request.urlretrieve(UNINSTALLER_RAW_URL, dest_uninstall_exe)
                except Exception:
                    pass

            # Copy Icon
            if os.path.exists(src_icon):
                shutil.copy2(src_icon, dest_icon)

            # Step 4: Create Desktop & Start Menu Shortcuts for BOTH Launcher & Uninstaller
            self.update_status("Creating desktop & start menu shortcuts...", 90)
            desktop = os.path.join(os.environ.get("USERPROFILE", ""), "Desktop")
            
            # 1. Desktop Shortcuts (Both Launcher and Uninstaller)
            desktop_launcher_shortcut = os.path.join(desktop, "Apex Study OS.lnk")
            create_windows_shortcut(dest_apex_exe, desktop_launcher_shortcut, "Apex Study OS — CBSE AI Study Suite", dest_icon)

            desktop_uninstaller_shortcut = os.path.join(desktop, "Uninstall Apex Study OS.lnk")
            create_windows_shortcut(dest_uninstall_exe, desktop_uninstaller_shortcut, "Uninstall Apex Study OS and remove all files", dest_icon)

            # 2. Start Menu Folder & Shortcuts (Both Launcher and Uninstaller)
            start_menu = os.path.join(os.environ.get("APPDATA", ""), r"Microsoft\Windows\Start Menu\Programs\Apex Study OS")
            os.makedirs(start_menu, exist_ok=True)
            
            start_menu_app = os.path.join(start_menu, "Apex Study OS.lnk")
            create_windows_shortcut(dest_apex_exe, start_menu_app, "Apex Study OS", dest_icon)

            start_menu_uninst = os.path.join(start_menu, "Uninstall Apex Study.lnk")
            create_windows_shortcut(dest_uninstall_exe, start_menu_uninst, "Uninstall Apex Study OS and clean all files", dest_icon)

            self.update_status("Setup completed successfully! 🎉", 100)
            self.is_installed = True
            self.install_btn.config(text="Launch Apex Study OS", state="normal", bg="#10b981", activebackground="#059669")
            self.cancel_btn.config(text="Exit", state="normal")

        except Exception as e:
            self.update_status(f"Installation error: {str(e)}", 0)
            self.install_btn.config(state="normal", bg="#4f46e5")
            self.cancel_btn.config(state="normal")
            messagebox.showerror("Installation Error", f"An error occurred during installation:\n{str(e)}")

def main():
    root = tk.Tk()
    app = InstallerGUI(root)
    root.mainloop()

if __name__ == '__main__':
    main()
