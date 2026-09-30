# PR 3 — claim table

Branch `workflow/work-package-routines`. Specimen `work-package-assumptions-review-conformance`, which borrows `work-package/07-assumptions-review.yaml`.

Run record: MCP `http://127.0.0.1:32772/mcp` · image `workflow-server:exp-provenance-loop-back` · engine pin `ffe83e8c` · corpus pin `00e79398`. MVW `CQHG62` reached the terminal. Specimen `Y53UOF`, planning folder `…/2026-09-30-work-package-assumptions-review-conformance`.

| # | Claim | Case | Evidence | Result |
|---|---|---|---|---|
| 1 | Assumptions review collects, then settles through `settle-assumptions`: convergence rounds, then the residual set assembled, then the batch gate | implementation | walk | held — one convergence pass settled AR-2 from the code, and combine left AR-1 as the one open |
| 2 | The batch gate's message carries the assembled presentation | implementation | walk | held — the rendered message carried the log link and AR-1's entry, every name resolved |
| 3 | The gate's answer is written into the log by the interview's batch record, and no record step runs after the interview | implementation | walk | held — record read the outcome from the gate's setVariable, and AR-1's row reads User · Confirmed |
| 4 | A review run converges into the log, assembles nothing and raises no gate | review | walk | held — AR-3 converged as open, the assembly and batch record were skipped, the gate was dismissed and the interview did not run |
| 5 | The converged log is the `assumptions-log.md` artifact on the review path, written back by reconcile | review | walk | held — reconcile's output carries the artifact, and its path landed on the settling routine's internal |
| 6 | Elicitation, research, implementation analysis and plan-prepare collect into the log and run no convergence and no record step | 03–06 | walk snapshot | held |
| 7 | Implement settles through the same routine | 08 | walk snapshot | held — the batch gate is raised under implement's materialised names |
| 8 | Submit and complete publish review-mode artifacts through `publish-planning-artifacts` | 13, 14 | walk snapshot; not walked live, since the commit pushes | held on the snapshot |
| 9 | Requirements refinement reconciles at least once and at most ten rounds | workflow-design 03 | definition | held |
| 10 | Guards stay at the base's result | `check-all` against `d0dd198d` | 57/57 | held |

## Found by the walk

- The batch gate ran its entries into the lead sentence, so an entry's heading did not render. The entries now sit in a paragraph of their own.
- Assumptions review's collect step binds no source and no categories, and the bag holds neither, so a worker takes both from its working context. That predates this branch.
- A review run skips the residual assembly, so the batch gate's presentation still holds an earlier visit's value. The gate is dismissed in review, so nothing reads it.
