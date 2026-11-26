"""Graph colouring with backtracking for exam timetabling (core algorithm)."""
import re
import time
import random

NODE_LIMIT = 3_000_000
LINE = re.compile(r"^(.*?)\s*(?:->|\||:)\s*(.+)$")


def parse(text):
    """Turn 'Name | SUB1, SUB2' lines into subjects, students and a conflict graph."""
    subjects, index, students = [], {}, []
    for raw in text.splitlines():
        m = LINE.match(raw.strip())
        if not m:
            continue
        seen = []
        for s in m.group(2).split(","):
            s = s.strip().upper()
            if s and s not in seen:
                seen.append(s)
        for s in seen:
            if s not in index:
                index[s] = len(subjects)
                subjects.append(s)
        students.append({"name": m.group(1).strip(), "subs": [index[s] for s in seen]})
    n = len(subjects)
    adj = [set() for _ in range(n)]
    for st in students:
        for a in st["subs"]:
            for b in st["subs"]:
                if a != b:
                    adj[a].add(b)
    edges = [[i, j] for i in range(n) for j in sorted(adj[i]) if i < j]
    return {"subjects": subjects, "students": students, "adj": [sorted(a) for a in adj], "edges": edges, "n": n}


def color_with_k(n, adj, order, k, limit=NODE_LIMIT, trace=None):
    """Backtracking m-colouring: can the graph be coloured with at most k colours?"""
    col = [-1] * n
    state = {"nodes": 0, "aborted": False}

    def log(kind, v, c):
        if trace is not None and len(trace) < 150:
            trace.append({"t": kind, "v": v, "c": c})

    def rec(i, used):
        if i == n:
            return True
        state["nodes"] += 1
        if state["nodes"] > limit:
            state["aborted"] = True
            return False
        v = order[i]
        for c in range(min(k, used + 1)):          # symmetry breaking: at most one new colour
            if any(col[u] == c for u in adj[v]):   # safe check
                continue
            col[v] = c
            log("a", v, c)                         # assign
            if rec(i + 1, max(used, c + 1)):
                return True
            col[v] = -1                            # backtrack
            log("b", v, c)
            if state["aborted"]:
                return False
        return False

    ok = rec(0, 0)
    return ok, col, state["nodes"], state["aborted"]


def first_fit(n, adj):
    """Greedy baseline: smallest free colour in input order."""
    col, checks, m = [-1] * n, 0, 0
    for v in range(n):
        c = 0
        while True:
            checks += len(adj[v])
            if any(col[u] == c for u in adj[v]):
                c += 1
            else:
                break
        col[v] = c
        m = max(m, c + 1)
    return {"colors": col, "k": m, "checks": checks}


def solve(g, limit=NODE_LIMIT):
    t0 = time.perf_counter()
    n, adj = g["n"], g["adj"]
    gr = first_fit(n, adj)
    order = sorted(range(n), key=lambda v: -len(adj[v]))   # most constrained first
    tries, total, res, aborted = [], 0, None, False
    k = 2 if g["edges"] else 1
    while k <= gr["k"]:
        ok, col, nodes, ab = color_with_k(n, adj, order, k, limit)
        total += nodes
        tries.append({"k": k, "ok": ok, "nodes": nodes})
        if ok or ab:
            res, aborted = (ok, col), ab and not ok
            break
        k += 1
    trace = []
    if res and res[0]:
        color_with_k(n, adj, order, k, limit, trace)
        colors = res[1]
    else:                                               # node limit hit: fall back to greedy
        colors, k = gr["colors"], gr["k"]
    clashes = sum(1 for a, b in g["edges"] if colors[a] == colors[b])
    return {
        "subjects": g["subjects"], "students": g["students"], "edges": g["edges"],
        "colors": colors, "k": k, "nodes": total, "aborted": aborted,
        "ms": (time.perf_counter() - t0) * 1000, "clashes": clashes,
        "greedy": {"k": gr["k"], "checks": gr["checks"]}, "tries": tries, "trace": trace,
    }


def random_data(subjects, students, rng=None):
    rng = rng or random.Random()
    codes = [f"SUB{i + 1:02d}" for i in range(subjects)]
    lines = []
    for i in range(1, students + 1):
        picks = rng.sample(codes, min(rng.choice([2, 3]), subjects))
        lines.append(f"Student {i} | {', '.join(picks)}")
    return "\n".join(lines)


def benchmark(sizes=(6, 9, 12, 15, 18)):
    rows = []
    for n in sizes:
        g = parse(random_data(n, round(n * 1.6), random.Random(n * 11 + 3)))
        r = solve(g)
        rows.append({"n": n, "edges": len(g["edges"]), "k": r["k"], "greedy": r["greedy"]["k"],
                     "nodes": r["nodes"], "ms": r["ms"]})
    return rows
