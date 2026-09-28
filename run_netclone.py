"""
NetClone Unified Single-Command Runner
Launches both the FastAPI Backend (port 8000) and Vite React Frontend (port 5173),
and coordinates graceful shutdown.
"""
import subprocess
import sys
import os
import time
import webbrowser
import signal

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")
FRONTEND_DIR = os.path.join(ROOT_DIR, "frontend")

def main():
    print("=" * 65)
    print("      NETCLONE: AI CYBER TWIN FRAMEWORK & MLSA DEFENSE")
    print("=" * 65)
    print("[1/3] Verifying backend AI models...")
    
    cache_dir = os.path.join(BACKEND_DIR, "models_cache")
    ae_file = os.path.join(cache_dir, "autoencoder.pt")
    if not os.path.exists(ae_file):
        print("      Training baseline Autoencoder & Isolation Forest...")
        subprocess.run([sys.executable, "train_models.py"], cwd=BACKEND_DIR, check=True)
    else:
        print("      Pre-trained models verified in cache.")

    # 2. Launch FastAPI Backend
    print("[2/3] Starting FastAPI Backend on http://127.0.0.1:8000 ...")
    backend_cmd = [
        sys.executable, "-m", "uvicorn", "app.main:app",
        "--host", "127.0.0.1",
        "--port", "8000",
        "--reload"
    ]
    backend_proc = subprocess.Popen(
        backend_cmd,
        cwd=BACKEND_DIR,
    )

    # 3. Launch Vite Frontend
    print("[3/3] Starting Vite React Dashboard on http://localhost:5173 ...")
    npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
    frontend_proc = subprocess.Popen(
        [npm_cmd, "run", "dev"],
        cwd=FRONTEND_DIR,
    )

    print("=" * 65)
    print(" NetClone Platform is Live!")
    print(" - React Dashboard: http://localhost:5173")
    print(" - Backend REST API: http://127.0.0.1:8000")
    print(" - API Interactive Docs: http://127.0.0.1:8000/docs")
    print(" Press Ctrl+C at any time to shut down all services.")
    print("=" * 65)

    # Wait a few seconds for servers to start, then optionally open browser
    time.sleep(2)
    try:
        webbrowser.open("http://localhost:5173")
    except Exception:
        pass

    def cleanup(signum, frame):
        print("\n[NetClone] Stopping services gracefully...")
        try:
            backend_proc.terminate()
            frontend_proc.terminate()
        except Exception:
            pass
        sys.exit(0)

    signal.signal(signal.SIGINT, cleanup)
    if hasattr(signal, "SIGTERM"):
        signal.signal(signal.SIGTERM, cleanup)

    # Stream logs to console
    try:
        while True:
            time.sleep(1)
            if backend_proc.poll() is not None:
                print("[NetClone] Backend process terminated unexpectedly.")
                break
            if frontend_proc.poll() is not None:
                print("[NetClone] Frontend process terminated unexpectedly.")
                break
    except KeyboardInterrupt:
        cleanup(None, None)

if __name__ == "__main__":
    main()
