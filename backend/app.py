"""SlotWise backend: Flask server exposing the graph-colouring solver as a JSON API."""
from pathlib import Path
from flask import Flask, jsonify, request, send_from_directory
import graph_coloring as gc

FRONTEND = Path(__file__).resolve().parent.parent / "frontend"
app = Flask(__name__, static_folder=str(FRONTEND), static_url_path="")


@app.get("/")
def home():
    return send_from_directory(FRONTEND, "index.html")


@app.post("/api/solve")
def solve():
    body = request.get_json(silent=True) or {}
    text = str(body.get("data", ""))
    if len(text) > 200_000:
        return jsonify(error="Input too large."), 413
    g = gc.parse(text)
    if g["n"] < 2:
        return jsonify(error="Add at least one student with two or more subjects."), 400
    return jsonify(gc.solve(g))


@app.post("/api/random")
def random_data():
    body = request.get_json(silent=True) or {}
    subjects = max(3, min(26, int(body.get("subjects", 12))))
    students = max(5, min(300, int(body.get("students", 24))))
    return jsonify(data=gc.random_data(subjects, students))


@app.get("/api/benchmark")
def benchmark():
    return jsonify(gc.benchmark())


@app.get("/api/health")
def health():
    return jsonify(status="ok")


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
