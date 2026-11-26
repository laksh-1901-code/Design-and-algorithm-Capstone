# SlotWise – Exam Scheduler (Full-stack)

**Student:** Kangna | **Roll No:** 2501060041 | DAA Capstone – Project 8
Exam timetable generation using **graph colouring with backtracking**.

## Project structure
```
slotwise-fullstack/
├── backend/
│   ├── app.py              # Flask server + JSON API routes
│   └── graph_coloring.py   # parsing, backtracking m-colouring, greedy baseline, benchmark
├── frontend/
│   ├── index.html          # page structure (tabs)
│   ├── css/style.css       # theme (light + dark)
│   └── js/app.js           # UI logic, calls the API with fetch()
├── requirements.txt
├── README.md
└── VIVA_QA.md
```

## Run
```bash
pip install -r requirements.txt
python backend/app.py
```
Open **http://127.0.0.1:5000** in your browser.

## API
| Method | Route | Purpose |
|---|---|---|
| POST | `/api/solve` | body `{"data": "Name | SUB1, SUB2\n..."}` → minimum slots, colouring, trace |
| POST | `/api/random` | body `{"subjects": 12, "students": 24}` → random enrolment text |
| GET | `/api/benchmark` | backtracking vs greedy on 6–18 subjects |
| GET | `/api/health` | `{"status": "ok"}` |

## Algorithm (backend/graph_coloring.py)
1. Subjects are vertices; a shared student creates an edge; a slot is a colour.
2. Sort vertices by degree (most constrained first).
3. For k = 2, 3, 4 …: recursive backtracking, place each subject in the first slot no neighbour uses, undo on dead ends.
4. The first k that works is the minimum number of slots. Symmetry breaking: at most one new colour per step.
5. Node limit of 3,000,000 falls back to the greedy colouring.

Time O(kⁿ) worst case, space O(n). Baseline: first-fit greedy, O(n + m).
