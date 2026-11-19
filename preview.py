"""
AETHER // LOCAL DEV PREVIEW SIMULATOR
Allows instant browser preview without waiting for local Java JDK installation.
Simulates all Java REST endpoints (/api/status, /api/insight, /api/thoughts) exactly.
"""
import http.server
import json
import os
import sys
import time

PORT = int(os.environ.get("PORT", 8080))
PUBLIC_DIR = os.path.join(os.path.dirname(__file__), "public")
DATA_FILE = os.path.join(os.path.dirname(__file__), "aether_data.json")

INSIGHTS = [
    "Intelligence is the compression of chaos into elegant, high-leverage order.",
    "Deep focus is not discipline—it is the elimination of friction between intention and flow.",
    "Time is asymmetric; an hour of transcendent clarity outweighs days of fractured attention.",
    "Simplicity is the final evolution of complexity, stripped of performative noise.",
    "Your cognition shapes reality. Guard your sensory bandwidth as sacred space.",
    "The mind operates at peak resonance when thought and action dissolve into a singular vector.",
    "Silence is not empty; it is the blank canvas where profound architectures are born."
]

def load_thoughts():
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []
    return []

def save_thoughts(thoughts):
    try:
        with open(DATA_FILE, "w", encoding="utf-8") as f:
            json.dump(thoughts, f, indent=2)
    except Exception:
        pass

class AetherPreviewHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=PUBLIC_DIR, **kwargs)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        if self.path == "/api/status":
            data = {
                "status": "ONLINE (PREVIEW RUNNER)",
                "uptimeSeconds": int(time.time() - start_time),
                "memoryUsedMb": 18,
                "memoryMaxMb": 512,
                "thoughtsLogged": len(load_thoughts()),
                "javaVersion": "Simulator (Java 21 Equivalent)",
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            }
            self._send_json(200, data)
        elif self.path == "/api/insight":
            idx = int(time.time()) % len(INSIGHTS)
            self._send_json(200, {"index": idx, "quote": INSIGHTS[idx]})
        elif self.path == "/api/thoughts":
            self._send_json(200, load_thoughts())
        else:
            if self.path == "/":
                self.path = "/index.html"
            super().do_GET()

    def do_POST(self):
        if self.path == "/api/thoughts":
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length).decode("utf-8")
            try:
                payload = json.loads(body)
                text = payload.get("text", "").strip()
                tag = payload.get("tag", "CLARITY")
                if not text:
                    self._send_json(400, {"error": "Text cannot be empty"})
                    return
                record = {
                    "id": str(int(time.time() * 1000))[-6:],
                    "text": text,
                    "tag": tag,
                    "time": time.strftime("%H:%M:%S")
                }
                thoughts = load_thoughts()
                thoughts.insert(0, record)
                save_thoughts(thoughts)
                self._send_json(201, record)
            except Exception as e:
                self._send_json(400, {"error": str(e)})
        else:
            self._send_json(404, {"error": "Not Found"})

    def do_DELETE(self):
        if self.path == "/api/thoughts":
            save_thoughts([])
            self._send_json(200, {"message": "All thoughts cleared"})
        else:
            self._send_json(404, {"error": "Not Found"})

    def _send_json(self, status, obj):
        res = json.dumps(obj).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-Length", str(len(res)))
        self.end_headers()
        self.wfile.write(res)

start_time = time.time()
if __name__ == "__main__":
    print(f"[AETHER PREVIEW] Listening on http://localhost:{PORT}")
    server = http.server.HTTPServer(("0.0.0.0", PORT), AetherPreviewHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[AETHER PREVIEW] Stopped.")
