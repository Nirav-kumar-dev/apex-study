import os
import sys
import time
import socket
import shutil
import logging
import subprocess
import threading
import ssl
import json
import urllib.parse
import urllib.request
import urllib.error
import webbrowser
from http.server import HTTPServer, SimpleHTTPRequestHandler

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

def is_port_in_use(port, host='127.0.0.1'):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex((host, port)) == 0

def get_repo_root():
    exe_dir = os.path.dirname(os.path.abspath(sys.executable if getattr(sys, 'frozen', False) else __file__))
    candidates = [
        exe_dir,
        os.path.dirname(exe_dir),
        os.path.join(LOCALAPPDATA, "Programs", "ApexStudy"),
        os.getcwd(),
    ]
    for c in candidates:
        if c and os.path.exists(os.path.join(c, "package.json")):
            return c
    return exe_dir

def get_base_dir():
    candidates = []
    if getattr(sys, 'frozen', False):
        meipass = getattr(sys, '_MEIPASS', '')
        candidates.append(os.path.join(meipass, 'dist'))
        candidates.append(meipass)
        exe_dir = os.path.dirname(os.path.abspath(sys.executable))
        candidates.append(os.path.join(exe_dir, 'dist'))
        candidates.append(exe_dir)
    
    repo_root = get_repo_root()
    candidates.append(os.path.join(repo_root, 'dist'))
    candidates.append(os.path.join(APP_DATA_DIR, 'dist'))
    candidates.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dist'))
    candidates.append(repo_root)

    for cand in candidates:
        if cand and os.path.exists(cand) and os.path.exists(os.path.join(cand, 'index.html')):
            return cand
            
    for cand in candidates:
        if cand and os.path.exists(cand):
            return cand
    return repo_root

def get_book_dir(base_dir):
    repo_root = get_repo_root()
    candidates = [
        os.path.join(base_dir, 'book'),
        os.path.join(repo_root, 'book'),
        os.path.join(APP_DATA_DIR, 'book'),
        os.path.join(APP_DATA_DIR, 'dist', 'book'),
        os.path.join(os.path.dirname(os.path.abspath(__file__)), 'book'),
    ]
    if getattr(sys, 'frozen', False):
        exe_dir = os.path.dirname(os.path.abspath(sys.executable))
        candidates.insert(0, os.path.join(exe_dir, 'book'))
        candidates.insert(0, os.path.join(exe_dir, 'dist', 'book'))
        meipass = getattr(sys, '_MEIPASS', '')
        candidates.insert(0, os.path.join(meipass, 'book'))
        candidates.insert(0, os.path.join(meipass, 'dist', 'book'))

    for cand in candidates:
        if cand and os.path.exists(cand):
            return cand
    return os.path.join(repo_root, 'book')

class ApexHTTPHandler(SimpleHTTPRequestHandler):
    base_dir = ""
    book_dir = ""
    repo_root = ""

    def log_message(self, format, *args):
        pass

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin')
        self.send_header('Access-Control-Max-Age', '86400')
        self.send_header('Content-Length', '0')
        self.end_headers()

    def do_POST(self):
        content_len = int(self.headers.get('Content-Length', 0))
        post_body = self.rfile.read(content_len) if content_len > 0 else b''

        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        # 1. NVIDIA NIM Proxy Endpoint
        if path.startswith('/api/nvidia'):
            rel_path = path[len('/api/nvidia'):]
            if not rel_path.startswith('/'):
                rel_path = '/' + rel_path
            
            target_url = f"https://integrate.api.nvidia.com/v1{rel_path}"
            if parsed.query:
                target_url += f"?{parsed.query}"

            headers = {
                'User-Agent': 'ApexStudyOS/1.1 (Windows)',
                'Accept': 'application/json',
                'Content-Type': self.headers.get('Content-Type', 'application/json'),
            }
            auth = self.headers.get('Authorization')
            if auth:
                headers['Authorization'] = auth

            try:
                req = urllib.request.Request(target_url, data=post_body, headers=headers, method='POST')
                ctx = ssl.create_default_context()
                with urllib.request.urlopen(req, context=ctx, timeout=120) as resp:
                    resp_data = resp.read()
                    self.send_response(resp.status)
                    self.send_header('Content-Type', 'application/json; charset=utf-8')
                    self.send_header('Content-Length', str(len(resp_data)))
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
                    self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
                    self.end_headers()
                    self.wfile.write(resp_data)
            except urllib.error.HTTPError as e:
                err_data = e.read()
                self.send_response(e.code)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Content-Length', str(len(err_data)))
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
                self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
                self.end_headers()
                self.wfile.write(err_data)
            except Exception as e:
                err_obj = json.dumps({"error": {"message": f"NVIDIA NIM Proxy Error: {str(e)}"}}).encode('utf-8')
                self.send_response(500)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Content-Length', str(len(err_obj)))
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(err_obj)
            return

        # 2. Local Python API Server Proxy (/api/py/*)
        elif path.startswith('/api/py'):
            rel_path = path[len('/api/py'):]
            if not rel_path.startswith('/'):
                rel_path = '/' + rel_path
            
            target_url = f"http://127.0.0.1:8001{rel_path}"
            if parsed.query:
                target_url += f"?{parsed.query}"

            headers = {'Content-Type': self.headers.get('Content-Type', 'application/json')}
            auth = self.headers.get('Authorization')
            if auth:
                headers['Authorization'] = auth

            try:
                req = urllib.request.Request(target_url, data=post_body, headers=headers, method='POST')
                with urllib.request.urlopen(req, timeout=120) as resp:
                    resp_data = resp.read()
                    self.send_response(resp.status)
                    self.send_header('Content-Type', 'application/json; charset=utf-8')
                    self.send_header('Content-Length', str(len(resp_data)))
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(resp_data)
            except urllib.error.HTTPError as e:
                err_data = e.read()
                self.send_response(e.code)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Content-Length', str(len(err_data)))
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(err_data)
            except Exception as e:
                err_obj = json.dumps({"error": f"Python backend service (port 8001) not active: {str(e)}"}).encode('utf-8')
                self.send_response(503)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Content-Length', str(len(err_obj)))
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(err_obj)
            return

        # 3. Default fallback
        self.send_response(404)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(b'{"error": "Endpoint not found"}')

    def serve_file(self, full_path):
        ext = os.path.splitext(full_path)[1].lower()
        mime_map = {
            '.html': 'text/html; charset=utf-8',
            '.js': 'application/javascript; charset=utf-8',
            '.mjs': 'application/javascript; charset=utf-8',
            '.css': 'text/css; charset=utf-8',
            '.json': 'application/json; charset=utf-8',
            '.pdf': 'application/pdf',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.svg': 'image/svg+xml',
            '.ico': 'image/x-icon',
            '.webp': 'image/webp',
            '.woff': 'font/woff',
            '.woff2': 'font/woff2',
            '.ttf': 'font/ttf',
            '.txt': 'text/plain; charset=utf-8',
        }
        content_type = mime_map.get(ext, 'application/octet-stream')
        try:
            file_size = os.path.getsize(full_path)
        except OSError:
            self.send_response(404)
            self.end_headers()
            return

        range_header = self.headers.get('Range')
        if range_header and range_header.startswith('bytes='):
            try:
                byte_range = range_header.split('=')[1].strip()
                start_str, end_str = byte_range.split('-')
                start = int(start_str) if start_str else 0
                end = int(end_str) if end_str else file_size - 1
                if end >= file_size:
                    end = file_size - 1
                length = end - start + 1

                self.send_response(206)
                self.send_header('Content-Type', content_type)
                self.send_header('Content-Range', f'bytes {start}-{end}/{file_size}')
                self.send_header('Content-Length', str(length))
                self.send_header('Accept-Ranges', 'bytes')
                self.send_header('Content-Disposition', 'inline')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()

                with open(full_path, 'rb') as f:
                    f.seek(start)
                    self.wfile.write(f.read(length))
                return
            except Exception:
                pass

        self.send_response(200)
        self.send_header('Content-Type', content_type)
        self.send_header('Content-Length', str(file_size))
        self.send_header('Accept-Ranges', 'bytes')
        self.send_header('Content-Disposition', 'inline')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()

        with open(full_path, 'rb') as f:
            shutil.copyfileobj(f, self.wfile)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        rel_path = urllib.parse.unquote(parsed.path.lstrip('/'))

        # 1. Root path -> serve index.html
        if not rel_path:
            index_file = os.path.join(self.base_dir, 'index.html')
            if os.path.exists(index_file):
                return self.serve_file(index_file)

        # 2. Book path -> lookup in book_dir or base_dir or repo_root
        if rel_path.startswith('book/') or rel_path.startswith('book\\'):
            sub_book = rel_path[5:]
            candidate_paths = [
                os.path.join(self.book_dir, sub_book),
                os.path.join(self.base_dir, rel_path),
                os.path.join(self.repo_root, rel_path),
                os.path.join(APP_DATA_DIR, rel_path),
            ]
            for cand in candidate_paths:
                if cand and os.path.exists(cand) and os.path.isfile(cand):
                    return self.serve_file(cand)

        # 3. Direct file in base_dir
        full_path = os.path.join(self.base_dir, rel_path)
        if os.path.exists(full_path) and os.path.isfile(full_path):
            return self.serve_file(full_path)

        # 4. Direct file in repo_root
        repo_path = os.path.join(self.repo_root, rel_path)
        if os.path.exists(repo_path) and os.path.isfile(repo_path):
            return self.serve_file(repo_path)

        # 5. Missing static asset
        ext = os.path.splitext(rel_path)[1].lower()
        if ext and ext not in ['.html', '.htm']:
            self.send_response(404)
            self.send_header('Content-Type', 'text/plain; charset=utf-8')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(b"404 Asset Not Found")
            return

        # 6. SPA fallback
        index_file = os.path.join(self.base_dir, 'index.html')
        if not os.path.exists(index_file):
            index_file = os.path.join(self.repo_root, 'dist', 'index.html')
        if os.path.exists(index_file):
            return self.serve_file(index_file)

        self.send_response(404)
        self.end_headers()

def start_local_server(base_dir, book_dir, repo_root, port):
    ApexHTTPHandler.base_dir = base_dir
    ApexHTTPHandler.book_dir = book_dir
    ApexHTTPHandler.repo_root = repo_root
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

def has_npm():
    try:
        res = subprocess.run("npm --version", shell=True, capture_output=True)
        return res.returncode == 0
    except Exception:
        return False

def open_app_in_browser(app_url):
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
        return proc
    else:
        webbrowser.open(app_url)
        return None

def main():
    repo_root = get_repo_root()
    base_dir = get_base_dir()
    book_dir = get_book_dir(base_dir)

    os.makedirs(APP_DATA_DIR, exist_ok=True)
    os.makedirs(PROFILE_DIR, exist_ok=True)

    # Step 1: Start Python API Server (api_server.py on port 8001) in background if present
    py_api_proc = None
    api_server_path = os.path.join(repo_root, "api_server.py")
    if os.path.exists(api_server_path) and not is_port_in_use(8001):
        try:
            py_api_proc = subprocess.Popen(
                ["python", api_server_path],
                cwd=repo_root,
                creationflags=subprocess.CREATE_NO_WINDOW if os.name == 'nt' else 0
            )
        except Exception:
            pass

    # Step 2: Start Frontend Web Server (npm run dev on port 5173 or internal Python server)
    npm_proc = None
    app_url = None
    target_port = 5173

    if has_npm() and os.path.exists(os.path.join(repo_root, "package.json")):
        try:
            cmd = "npm run dev -- --host 127.0.0.1 --port 5173"
            npm_proc = subprocess.Popen(
                cmd,
                shell=True,
                cwd=repo_root,
                creationflags=subprocess.CREATE_NO_WINDOW if os.name == 'nt' else 0
            )
            # Wait up to 6 seconds for npm / Vite server to bind port 5173
            for _ in range(12):
                time.sleep(0.5)
                if is_port_in_use(target_port):
                    app_url = f"http://localhost:{target_port}/"
                    break
        except Exception:
            pass

    # Step 3: Fallback to built-in Python server if npm was not used or did not bind port
    py_server = None
    if not app_url:
        port = get_free_port()
        py_server = start_local_server(base_dir, book_dir, repo_root, port)
        app_url = f"http://127.0.0.1:{port}/"

    # Step 4: Open the browser / Edge App Mode at the localhost URL
    proc = open_app_in_browser(app_url)

    if proc:
        proc.wait()
    else:
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            pass

    # Step 5: Clean up all running background programs on exit
    if npm_proc:
        try:
            subprocess.run(f"taskkill /F /T /PID {npm_proc.pid}", shell=True, capture_output=True)
        except Exception:
            pass

    if py_api_proc:
        try:
            py_api_proc.terminate()
        except Exception:
            pass

    if py_server:
        py_server.shutdown()

if __name__ == '__main__':
    main()
