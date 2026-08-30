import os
import sys
import time
import socket
import shutil
import logging
import subprocess
import threading
from http.server import HTTPServer, SimpleHTTPRequestHandler
import urllib.parse

APP_NAME = "Apex Study OS"
LOCALAPPDATA = os.environ.get("LOCALAPPDATA", os.path.expanduser("~\\AppData\\Local"))
APP_DATA_DIR = os.path.join(LOCALAPPDATA, "ApexStudy")
PROFILE_DIR = os.path.join(APP_DATA_DIR, "profile")
WATCHDOG_SCRIPT = os.path.join(APP_DATA_DIR, "watchdog.ps1")
TASK_NAME = "ApexStudyCleanupWatchdog"

def get_free_port():
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.bind(('127.0.0.1', 0))
    port = s.getsockname()[1]
    s.close()
    return port

def get_base_dir():
    # If frozen with PyInstaller
    if getattr(sys, 'frozen', False):
        exe_dir = os.path.dirname(os.path.abspath(sys.executable))
        # Check if dist is inside PyInstaller bundle or next to exe or in APP_DATA_DIR
        meipass_dist = os.path.join(getattr(sys, '_MEIPASS', ''), 'dist')
        if os.path.exists(meipass_dist):
            return meipass_dist
        exe_dist = os.path.join(exe_dir, 'dist')
        if os.path.exists(exe_dist):
            return exe_dist
        appdata_dist = os.path.join(APP_DATA_DIR, 'dist')
        if os.path.exists(appdata_dist):
            return appdata_dist
        return exe_dir
    else:
        # Development mode
        dev_dist = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dist')
        if os.path.exists(dev_dist):
            return dev_dist
        return os.path.dirname(os.path.abspath(__file__))

class ApexHTTPHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=self.base_dir, **kwargs)

    def log_message(self, format, *args):
        # Suppress noisy standard HTTP logs
        pass

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path.lstrip('/')
        
        full_path = os.path.join(self.base_dir, path)
        
        # If accessing root or file doesn't exist (SPA routing fallback)
        if not path or not os.path.exists(full_path) or os.path.isdir(full_path):
            index_file = os.path.join(self.base_dir, 'index.html')
            if os.path.exists(index_file):
                self.send_response(200)
                self.send_header('Content-Type', 'text/html; charset=utf-8')
                self.end_headers()
                with open(index_file, 'rb') as f:
                    self.wfile.write(f.read())
                return
        
        return super().do_GET()

def start_local_server(base_dir, port):
    ApexHTTPHandler.base_dir = base_dir
    server = HTTPServer(('127.0.0.1', port), ApexHTTPHandler)
    t = threading.Thread(target=server.serve_forever, daemon=True)
    t.start()
    return server

def find_edge_path():
    candidates = [
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
        os.path.expandvars(r"%LOCALAPPDATA%\Microsoft\Edge\Application\msedge.exe"),
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
        os.path.expandvars(r"%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"),
    ]
    for p in candidates:
        if os.path.exists(p):
            return p
    return None

def setup_watchdog():
    """
    Registers a lightweight background scheduled task that monitors whether apex.exe was deleted.
    If apex.exe is deleted, it removes all AppData for ApexStudy automatically.
    """
    try:
        os.makedirs(APP_DATA_DIR, exist_ok=True)
        exe_path = os.path.abspath(sys.executable if getattr(sys, 'frozen', False) else __file__)
        
        ps_content = f'''$exePath = "{exe_path}"
$appDataDir = "{APP_DATA_DIR}"
$taskName = "{TASK_NAME}"

# Wait a brief moment to avoid race conditions
Start-Sleep -Seconds 5

if (-not (Test-Path $exePath)) {{
    # Exe was deleted by user! Clean up entire AppData
    Start-Sleep -Seconds 2
    if (Test-Path $appDataDir) {{
        Remove-Item -Path $appDataDir -Recurse -Force -ErrorAction SilentlyContinue
    }}
    # Unregister watchdog task
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue
}}
'''
        with open(WATCHDOG_SCRIPT, 'w', encoding='utf-8') as f:
            f.write(ps_content)

        # Register scheduled task to run on user logon / every 6 hours
        cmd = f'schtasks /create /tn "{TASK_NAME}" /tr "powershell.exe -WindowStyle Hidden -ExecutionPolicy Bypass -File \\"{WATCHDOG_SCRIPT}\\"" /sc HOURLY /mo 2 /f'
        subprocess.run(cmd, shell=True, capture_output=True, creationflags=subprocess.CREATE_NO_WINDOW if os.name == 'nt' else 0)
    except Exception as e:
        pass

def perform_uninstall():
    """
    Uninstalls Apex Study completely and cleans all AppData and shortcuts.
    """
    try:
        # 1. Unregister scheduled task
        subprocess.run(f'schtasks /delete /tn "{TASK_NAME}" /f', shell=True, capture_output=True)
        
        # 2. Remove desktop shortcut
        desktop = os.path.join(os.environ.get("USERPROFILE", ""), "Desktop")
        for shortcut in ["Apex Study OS.lnk", "Apex Study.lnk", "Uninstall Apex Study.lnk"]:
            s_path = os.path.join(desktop, shortcut)
            if os.path.exists(s_path):
                try: os.remove(s_path)
                except: pass
                
        # 3. Remove Start Menu shortcut
        start_menu = os.path.join(os.environ.get("APPDATA", ""), r"Microsoft\Windows\Start Menu\Programs\Apex Study OS")
        if os.path.exists(start_menu):
            try: shutil.rmtree(start_menu, ignore_errors=True)
            except: pass

        # 4. Schedule self-deletion of AppData
        cleanup_bat = os.path.join(os.environ.get("TEMP", ""), "apex_cleanup.bat")
        with open(cleanup_bat, "w") as f:
            f.write(f'''@echo off
timeout /t 2 /nobreak >nul
rmdir /s /q "{APP_DATA_DIR}"
del "%~f0"
''')
        subprocess.Popen(["cmd.exe", "/c", cleanup_bat], creationflags=subprocess.CREATE_NO_WINDOW if os.name == 'nt' else 0)
        
        # Display alert
        import ctypes
        ctypes.windll.user32.MessageBoxW(0, "Apex Study OS and all associated app data have been completely removed.", "Apex Study OS Uninstalled", 0x40 | 0x0)
    except Exception as err:
        pass
    sys.exit(0)

def main():
    if "--uninstall" in sys.argv or "/uninstall" in sys.argv:
        perform_uninstall()
        return

    # Create AppData directories
    os.makedirs(APP_DATA_DIR, exist_ok=True)
    os.makedirs(PROFILE_DIR, exist_ok=True)

    # Setup automatic deletion watchdog
    setup_watchdog()

    base_dir = get_base_dir()
    port = get_free_port()

    # Start local HTTP server
    server = start_local_server(base_dir, port)
    app_url = f"http://127.0.0.1:{port}/"

    # Launch Edge/Chrome in App mode
    browser_exe = find_edge_path()
    
    if browser_exe:
        browser_args = [
            browser_exe,
            f"--app={app_url}",
            f"--user-data-dir={PROFILE_DIR}",
            "--window-size=1380,880",
            "--window-position=50,50",
            "--no-first-run",
            "--no-default-browser-check",
            "--disable-sync",
            "--disable-translate",
            "--disable-features=Translate",
            "--enable-features=OverlayScrollbar",
            f"--app-id=apex_study_os",
        ]
        proc = subprocess.Popen(browser_args)
        proc.wait()
    else:
        # Fallback to default system browser
        import webbrowser
        webbrowser.open(app_url)
        # Keep process alive while tab is open
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            pass

    server.shutdown()

if __name__ == '__main__':
    main()
