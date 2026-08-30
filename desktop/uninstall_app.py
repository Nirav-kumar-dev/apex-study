import os
import sys
import time
import shutil
import subprocess
import tkinter as tk
from tkinter import messagebox

APP_NAME = "Apex Study OS"
LOCALAPPDATA = os.environ.get("LOCALAPPDATA", os.path.expanduser("~\\AppData\\Local"))
INSTALL_DIR = os.path.join(LOCALAPPDATA, "Programs", "ApexStudy")
APP_DATA_DIR = os.path.join(LOCALAPPDATA, "ApexStudy")
TASK_NAME = "ApexStudyCleanupWatchdog"

def kill_running_processes():
    try:
        subprocess.run('taskkill /F /IM "Apex Study.exe" /T', shell=True, capture_output=True)
        subprocess.run('taskkill /F /IM "apex.exe" /T', shell=True, capture_output=True)
    except Exception:
        pass

def remove_shortcuts():
    # 1. Desktop shortcuts
    desktop = os.path.join(os.environ.get("USERPROFILE", ""), "Desktop")
    shortcuts = [
        "Apex Study OS.lnk",
        "Apex Study.lnk",
        "Uninstall Apex Study.lnk"
    ]
    for s in shortcuts:
        p = os.path.join(desktop, s)
        if os.path.exists(p):
            try:
                os.remove(p)
            except Exception:
                pass

    # 2. Start menu shortcuts & folder
    start_menu = os.path.join(os.environ.get("APPDATA", ""), r"Microsoft\Windows\Start Menu\Programs\Apex Study OS")
    if os.path.exists(start_menu):
        try:
            shutil.rmtree(start_menu, ignore_errors=True)
        except Exception:
            pass

def remove_watchdog_task():
    try:
        subprocess.run(f'schtasks /delete /tn "{TASK_NAME}" /f', shell=True, capture_output=True)
    except Exception:
        pass

def schedule_folder_deletion():
    temp_dir = os.environ.get("TEMP", os.path.expanduser("~\\AppData\\Local\\Temp"))
    bat_path = os.path.join(temp_dir, "apex_uninstall_cleanup.bat")
    
    bat_content = f'''@echo off
timeout /t 2 /nobreak >nul
if exist "{INSTALL_DIR}" (
    rmdir /s /q "{INSTALL_DIR}"
)
if exist "{APP_DATA_DIR}" (
    rmdir /s /q "{APP_DATA_DIR}"
)
del "%~f0"
'''
    try:
        with open(bat_path, "w", encoding="utf-8") as f:
            f.write(bat_content)
        subprocess.Popen(["cmd.exe", "/c", bat_path], creationflags=subprocess.CREATE_NO_WINDOW if os.name == 'nt' else 0)
    except Exception:
        pass

def perform_uninstall():
    kill_running_processes()
    remove_watchdog_task()
    remove_shortcuts()
    schedule_folder_deletion()

def main():
    # Silent mode check
    if "--silent" in sys.argv or "-y" in sys.argv:
        perform_uninstall()
        sys.exit(0)

    # Tkinter confirmation dialog
    root = tk.Tk()
    root.withdraw()
    
    confirm = messagebox.askyesno(
        "Uninstall Apex Study OS",
        "Are you sure you want to completely uninstall Apex Study OS?\n\nThis will remove all application files, downloaded textbooks, cached profiles, and shortcuts from your computer.",
        icon="warning"
    )

    if confirm:
        perform_uninstall()
        messagebox.showinfo(
            "Apex Study OS Uninstalled",
            "Apex Study OS and all associated files have been completely removed from your computer."
        )
    
    root.destroy()
    sys.exit(0)

if __name__ == "__main__":
    main()
