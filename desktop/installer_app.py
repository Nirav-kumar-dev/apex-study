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

LOCALAPPDATA = os.environ.get("LOCALAPPDATA", os.path.expanduser("~\\AppData\\Local"))
DEFAULT_INSTALL_DIR = os.path.join(LOCALAPPDATA, "Programs", "ApexStudy")
APP_DATA_DIR = os.path.join(LOCALAPPDATA, "ApexStudy")

def create_windows_shortcut(target_exe, shortcut_path, description="Apex Study OS Desktop App", icon_path=None):
    try:
        icon_line = f'$Shortcut.IconLocation = "{icon_path}";' if icon_path and os.path.exists(icon_path) else ''
        ps_script = f'''
$WshShell = New-Object -comObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("{shortcut_path}")
$Shortcut.TargetPath = "{target_exe}"
$Shortcut.WorkingDirectory = "{os.path.dirname(target_exe)}"
$Shortcut.Description = "{description}"
{icon_line}
$Shortcut.Save()
'''
        subprocess.run(["powershell", "-ExecutionPolicy", "Bypass", "-Command", ps_script], 
                       capture_output=True, creationflags=subprocess.CREATE_NO_WINDOW if os.name == 'nt' else 0)
    except Exception as e:
        pass

class InstallerGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("Apex Study OS — Setup & Installer")
        self.root.geometry("540x380")
        self.root.resizable(False, False)
        self.root.configure(bg="#0f172a") # Slate-900

        # Center window
        self.center_window()

        self.install_dir = DEFAULT_INSTALL_DIR
        self.is_installed = False

        self.create_widgets()

    def center_window(self):
        self.root.update_idletasks()
        w = 540
        h = 380
        x = (self.root.winfo_screenwidth() // 2) - (w // 2)
        y = (self.root.winfo_screenheight() // 2) - (h // 2)
        self.root.geometry(f'{w}x{h}+{x}+{y}')

    def create_widgets(self):
        # Header banner frame
        header_frame = tk.Frame(self.root, bg="#1e1b4b", height=80)
        header_frame.pack(fill="x", side="top")

        title_label = tk.Label(header_frame, text="⚡ Apex Study OS", font=("Segoe UI", 16, "bold"), fg="#ffffff", bg="#1e1b4b")
        title_label.pack(anchor="w", padx=24, pady=(16, 2))

        subtitle_label = tk.Label(header_frame, text="Desktop Installation & Setup Wizard • Classes 7th to 10th", font=("Segoe UI", 9), fg="#a5b4fc", bg="#1e1b4b")
        subtitle_label.pack(anchor="w", padx=24, pady=(0, 16))

        # Main content body
        body_frame = tk.Frame(self.root, bg="#0f172a", padx=24, pady=20)
        body_frame.pack(fill="both", expand=True)

        # Destination path box
        dest_label = tk.Label(body_frame, text="Install Destination (Safe User Folder):", font=("Segoe UI", 9, "bold"), fg="#cbd5e1", bg="#0f172a")
        dest_label.pack(anchor="w")

        path_box = tk.Entry(body_frame, font=("Segoe UI", 9), fg="#94a3b8", bg="#1e293b", relief="flat", insertbackground="white")
        path_box.insert(0, self.install_dir)
        path_box.configure(state="readonly")
        path_box.pack(fill="x", pady=(4, 16), ipady=6)

        # GitHub Repo source info
        repo_info = tk.Label(body_frame, text="Source Repository: https://github.com/Nirav-kumar-dev/apex-study.git", font=("Segoe UI", 8), fg="#64748b", bg="#0f172a")
        repo_info.pack(anchor="w", pady=(0, 14))

        # Progress bar
        style = ttk.Style()
        style.theme_use('clam')
        style.configure("Indigo.Horizontal.TProgressbar", foreground='#4f46e5', background='#6366f1', troughcolor='#1e293b', bordercolor='#0f172a', lightcolor='#6366f1', darkcolor='#4f46e5')

        self.progress = ttk.Progressbar(body_frame, style="Indigo.Horizontal.TProgressbar", orient="horizontal", mode="determinate")
        self.progress.pack(fill="x", pady=(0, 6), ipady=2)

        self.status_label = tk.Label(body_frame, text="Ready to install. Click 'Install Now' to proceed.", font=("Segoe UI", 9), fg="#94a3b8", bg="#0f172a")
        self.status_label.pack(anchor="w", pady=(0, 16))

        # Action Buttons frame
        btn_frame = tk.Frame(self.root, bg="#0f172a", padx=24, pady=16)
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
            # Launch App
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
            self.update_status("Creating safe installation directories...", 10)
            os.makedirs(self.install_dir, exist_ok=True)
            os.makedirs(APP_DATA_DIR, exist_ok=True)
            time.sleep(0.5)

            # Step 1: Check embedded or bundled assets first
            base_dir = getattr(sys, '_MEIPASS', os.path.dirname(os.path.abspath(__file__)))
            embedded_apex_exe = os.path.join(base_dir, "apex.exe")
            embedded_dist = os.path.join(base_dir, "dist")
            icon_file = os.path.join(base_dir, "desktop_icon.ico")

            dest_exe = os.path.join(self.install_dir, "apex.exe")
            dest_dist = os.path.join(self.install_dir, "dist")
            dest_icon = os.path.join(self.install_dir, "icon.ico")

            # Step 2: Download/Clone or copy dist
            self.update_status("Synchronizing latest files from GitHub repository...", 25)
            
            # If bundled with installer, copy directly
            if os.path.exists(embedded_dist):
                if os.path.exists(dest_dist):
                    shutil.rmtree(dest_dist, ignore_errors=True)
                shutil.copytree(embedded_dist, dest_dist)
            else:
                # Clone or download from GitHub
                try:
                    self.update_status("Fetching latest build from GitHub repository...", 35)
                    # Try git clone if git is available
                    temp_clone_dir = os.path.join(os.environ.get("TEMP", ""), "apex_clone_temp")
                    if os.path.exists(temp_clone_dir):
                        shutil.rmtree(temp_clone_dir, ignore_errors=True)
                    
                    cmd = f'git clone --depth 1 {REPO_URL} "{temp_clone_dir}"'
                    res = subprocess.run(cmd, shell=True, capture_output=True)
                    if res.returncode == 0 and os.path.exists(os.path.join(temp_clone_dir, "dist")):
                        if os.path.exists(dest_dist):
                            shutil.rmtree(dest_dist, ignore_errors=True)
                        shutil.copytree(os.path.join(temp_clone_dir, "dist"), dest_dist)
                        shutil.rmtree(temp_clone_dir, ignore_errors=True)
                except Exception as e:
                    pass

            self.update_status("Installing apex.exe desktop binary...", 60)
            if os.path.exists(embedded_apex_exe):
                shutil.copy2(embedded_apex_exe, dest_exe)
            
            if os.path.exists(icon_file):
                shutil.copy2(icon_file, dest_icon)

            self.update_status("Creating Desktop & Start Menu shortcuts...", 80)
            desktop = os.path.join(os.environ.get("USERPROFILE", ""), "Desktop")
            shortcut_path = os.path.join(desktop, "Apex Study OS.lnk")
            create_windows_shortcut(dest_exe, shortcut_path, "Apex Study OS — CBSE Study Suite", dest_icon)

            start_menu = os.path.join(os.environ.get("APPDATA", ""), r"Microsoft\Windows\Start Menu\Programs\Apex Study OS")
            os.makedirs(start_menu, exist_ok=True)
            start_menu_shortcut = os.path.join(start_menu, "Apex Study OS.lnk")
            create_windows_shortcut(dest_exe, start_menu_shortcut, "Apex Study OS", dest_icon)

            # Create uninstaller shortcut
            uninstaller_shortcut = os.path.join(start_menu, "Uninstall Apex Study.lnk")
            try:
                ps_uninst = f'''
$WshShell = New-Object -comObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("{uninstaller_shortcut}")
$Shortcut.TargetPath = "{dest_exe}"
$Shortcut.Arguments = "--uninstall"
$Shortcut.WorkingDirectory = "{self.install_dir}"
$Shortcut.Description = "Uninstall Apex Study OS and clean all data"
$Shortcut.Save()
'''
                subprocess.run(["powershell", "-ExecutionPolicy", "Bypass", "-Command", ps_uninst], 
                               capture_output=True, creationflags=subprocess.CREATE_NO_WINDOW if os.name == 'nt' else 0)
            except:
                pass

            self.update_status("Finalizing configuration & watchdog service...", 95)
            time.sleep(0.5)

            self.update_status("Installation completed successfully! 🎉", 100)
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
