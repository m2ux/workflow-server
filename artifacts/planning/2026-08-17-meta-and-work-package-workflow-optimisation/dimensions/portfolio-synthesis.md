# Portfolio Synthesis — workflow-server: workflows/meta and workflows/work-package

**Lenses:** 07 claim, 08 scarcity, 10 degradation, 14 sdl-coupling, 15 sdl-abstraction, 20 optimize, 30 reachability, 51 architect · **Findings:** 28 (12 convergent, 16 unique)

Four dimensions share this subdirectory — Context Economy (15, 20), Orchestration Topology (14, 51), Redundant Work (10, 30), Change Economics (07, 08) — each lens run against its own dimension's focus and writing its own artifact. This document relates them; it derives nothing.

| Finding | Lenses | Convergence |
|---------|--------|-------------|
| The eager-delivery budget measures a term it excludes and cannot fire — 8.3× slack at the worst activity | 20 optimize, 14 sdl-coupling | convergent |
| The invariant worker bundle is re-delivered once per activity instead of once per agent context — 281,632 chars on a 12-activity walk | 20 optimize, 15 sdl-abstraction | convergent |
| Composition re-attaches a group's rules to every operation in it, the largest single intra-response repetition | 20 optimize, 15 sdl-abstraction | convergent |
| Duplicate step→technique bindings in work-package — 29 sites, two of them the same technique under one gate | 14 sdl-coupling, 30 reachability | convergent |
| The cost instrumentation needed to accept any of this work already exists and is not wired to anything | 20 optimize, 08 scarcity, 07 claim, 10 degradation | convergent |
| Conventions and prose invocations decay, and the decay is unobserved | 07 claim, 10 degradation | convergent |
| The link guard's anchored-only scope is a hard boundary, not a flag | 07 claim, 20 optimize, 10 degradation | convergent |
| Independent probes and independent reviews are serialized by document order | 51 architect, 14 sdl-coupling | convergent |
| Checkpoint density is the topology's dominant cost — 49 gates, concentrated in two activities | 51 architect, 14 sdl-coupling | convergent |
| Dead definition surface exists, is measurable, and no guard measures it | 30 reachability, 10 degradation, 51 architect | convergent |
| Sessions holding the old shape constrain every proposed change | 07 claim, 08 scarcity, 10 degradation | convergent |
| Rust-specific content is delivered on every walk, including walks that cannot use it | 20 optimize, 30 reachability | convergent |
| A work-package walk costs +31.3% more to deliver than 32 days ago; the gate that would catch it fails today and nothing runs it | 10 degradation | unique |
| A 16.9 KB exemption list reached the pinned corpus four days ago with no consumer; its guard is on four branches and not on HEAD | 10 degradation | unique |
| 106 of 130 session records are `running`; meta completes 4 of 58, so every mechanism placed at a terminal activity rarely runs | 10 degradation | unique |
| 1,414 of 1,806 manually synchronised artifact pairs have no automated check, and the largest classes fail silently | 10 degradation | unique |
| The meta pattern library's 20 files have zero in-edges because `loadActivitiesFromDir` reads non-recursively | 30 reachability | unique |
| `client_workflow_completed` gates a rewrite two shipped artifacts depend on, and no writer ever sets it true | 30 reachability | unique |
| Raw file size understates wire cost by up to 4.24× once composition runs | 20 optimize | unique |
| Two steps execute without their resource template because `extractResourceIds` discards the workflow segment | 20 optimize | unique |
| `bundle: "reference" \| "full"` puts the server's dedup decision in the caller's hands, which is why the repetition exists | 15 sdl-abstraction | unique |
| The server holds both the gate evaluator and the variable bag, and declines to evaluate | 15 sdl-abstraction | unique |
| `may_continue` is read at the start of an activity and acted on at its end | 14 sdl-coupling | unique |
| `checkpointResponses` is a permanent replay cache with no invalidation | 14 sdl-coupling | unique |
| `platform-selection` is consumed eight steps before it is set | 14 sdl-coupling | unique |
| The architecture fingerprint: the server is a delivery-and-ledger plane, and the delivery unit and dispatch unit are both the whole activity | 51 architect | unique |
| Filesystem co-location of the server checkout with the agent's working directory is the assumption every mechanisation candidate rests on | 07 claim | unique |
| The conservation law: what the three implementation surfaces trade is maintainer attention, and only one of them returns any | 08 scarcity | unique |

## What Converged

- **Context Economy's two lenses agree on the mechanism and disagree on nothing.** 20 `optimize` prices the repetition (~480,793 chars, ~35% of one walk); 15 `sdl-abstraction` names the leak that produces it — inheritance hidden from the author and re-exposed on the wire once per technique. Agreement across a cost lens and a structure lens is what makes the group-rules and worker-bundle items safe to build: one measured them, the other explains why they recur.
- **Orchestration Topology's two lenses converge on gates and on serialization.** 51 `architect` reaches 49 checkpoints as a topology property; 14 `sdl-coupling` reaches the same gates as ordering defects with named sites. The overlap is the strongest case in the portfolio for batching gate presentations, because it is simultaneously an architecture argument and a defect list.
- **Redundant Work's two lenses partition cleanly rather than overlapping.** 30 `reachability` inventories what is dead; 10 `degradation` measures the rate and finds that the tree pruned once (work-package, 2.7% dead) carries a seventh of the dead fraction of the tree never pruned (meta, 20.8%). Neither could have produced the other's number, and together they justify building the reachability guard before pruning.
- **Change Economics converges with everything, which is the portfolio's most useful result.** 07 `claim` assumes each candidate's price false and finds K8 — that nothing here is measurable, so the ordering has no evidence. 08 `scarcity` prices the three surfaces. 20 `optimize` names `record_usage`, the three benchmark scripts and the frozen A0 fixture as the acceptance instrument. 10 `degradation` then runs that instrument and it fails at +31.3%. Four lenses arriving at one wire is the finding: the measurement problem the other lenses treat as a risk is already a resident regression.

## What Only One Lens Saw

- **10 `degradation`** alone put elapsed time on the axis, and it is the only lens that ran an existing instrument rather than reading code — which is why the +31.3% regression, the orphaned exemption list, the 82% non-completion rate and the 1,414 unchecked pairs appear once. A decay lens sees mechanisms that were built and never connected; no static lens is looking for absence of invocation.
- **30 `reachability`** alone found the two defects that are pure correctness rather than cost — the non-recursive `readdir` that makes 20 pattern-library files unreachable by construction, and `client_workflow_completed`, whose gate can never flip, leaving two shipped artifacts as drafts. Dead-code analysis is the only lens whose method distinguishes "never called" from "cannot be called".
- **20 `optimize`** alone drove the server's own composition path rather than measuring files, which is why the 4.24× raw-to-wire ratio and the two steps silently missing their template are its findings and nobody else's.
- **15 `sdl-abstraction`** alone treated the tool surface as an interface and asked what it wrongly exposes; both of its unique findings (`bundle` mode in the caller's hands, the server refusing to evaluate gates it holds the evaluator for) are inversions invisible unless you ask who should be deciding.
- **14 `sdl-coupling`** alone looked for invariant windows, which is the only method that catches `may_continue` read at one end of an activity and acted on at the other, and the replay cache that never invalidates.
- **51 `architect`** alone produced alternative topologies and a migration path — the portfolio's only artifact that answers "what instead", rather than "what is wrong".
- **07 `claim`** and **08 `scarcity`** each stood alone on an assumption the others did not think to doubt: that a repo checkout is present when a run executes, and that maintainer attention across 21 definition trees is renewable.
