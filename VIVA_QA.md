# Viva Prep – SlotWise (Kangna, 2501060041)

1. **Explain your project in one line.** It schedules exams with the minimum number of slots and no student clash by colouring a conflict graph using backtracking.
2. **What are the vertices and edges?** Vertices are subjects. An edge joins two subjects if at least one student takes both.
3. **What does a colour mean?** One exam slot. Same colour means the exams run together.
4. **What is the chromatic number?** The smallest number of colours that colours the graph properly. It is our minimum slot count.
5. **Why backtracking?** It searches systematically and abandons partial colourings as soon as they cannot work, and it guarantees the minimum k.
6. **Describe your recursion.** solve(i, k): if all vertices are coloured return true; for each colour c < k, if no neighbour has c, assign it and recurse; if that fails, unassign (backtrack) and try the next c; return false if none work.
7. **How do you find the minimum?** Try k = 2, 3, 4… the first k that succeeds is the answer. The Analysis tab shows each attempt (in our sample k=2, 3, 4 fail, k=5 succeeds).
8. **Why sort by degree?** Subjects with many conflicts are hardest to place; handling them first makes failures happen early and prunes the tree.
9. **What is symmetry breaking?** Colour names are interchangeable, so a subject can only use an existing slot or the next new one. This avoids repeating equivalent solutions.
10. **Time complexity?** O(kⁿ) worst case. Space O(n).
11. **Why is the practical run fast?** Pruning plus sparse conflict graphs. Our 12-subject sample needs only 60 nodes in total.
12. **Is the problem NP-complete?** Yes, deciding k-colourability is NP-complete for k ≥ 3.
13. **Why compare with greedy?** Greedy is linear but can use extra slots. In our benchmark greedy used 6 slots where backtracking needed 4 (15 subjects).
14. **What is first-fit greedy?** Colour vertices in input order, giving each the smallest colour not used by a neighbour.
15. **What if the input is huge?** The solver stops at 3 million nodes and returns the greedy colouring; better options are DSATUR, branch and bound, or metaheuristics.
16. **How do you check correctness?** Every edge is tested: endpoints must have different colours. The clash counter must show 0.
17. **What is the Trace tab?** It records each place and backtrack move so you can watch the algorithm think.
18. **Bounds on χ(G)?** Largest clique ≤ χ(G) ≤ max degree + 1. A student with 3 papers forms a triangle, so we need at least 3 slots.
19. **How are dates assigned?** Slot s goes to day ⌊s / sessions⌋ and session s mod sessions; weekends are skipped.
20. **Limitations and future work?** No room capacity, invigilators or exam duration; future work includes DSATUR, CSV import and minimising back-to-back exams.

## Architecture questions (full-stack version)
21. **Why a backend?** The algorithm runs on the server in Python (`graph_coloring.py`); the browser only collects input and draws results. This separates logic from presentation.
22. **Which endpoints exist?** POST `/api/solve`, POST `/api/random`, GET `/api/benchmark`, GET `/api/health`.
23. **What does /api/solve return?** Subjects, students, conflict edges, the colour (slot) of each subject, minimum k, nodes explored, time, clash count, greedy comparison, attempts per k and the backtracking trace.
24. **How is bad input handled?** The server returns HTTP 400 with a message when fewer than two subjects are found, and 413 for oversized input.
