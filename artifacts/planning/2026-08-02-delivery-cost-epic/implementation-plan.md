# Delivery cost epic — how the eleven work items are delivered

Planned 6 August 2026, against main at `2c6da98c`. The epic body is
[#404](https://github.com/m2ux/workflow-server/issues/404); this file records the delivery shape and
the sequencing decision, so a reader picking up a half-finished epic can see what depends on what.

## Five pull requests, not eleven

The eleven work items group into five changes because several of them edit the same mechanism. Three
touch the server's delivery path, two touch the meta workflow's definitions. Splitting them further
would put two pull requests inside one file's response-assembly block, which is a merge conflict
rather than a review boundary.

| PR | Repo / branch | Carries | Why these together |
|---|---|---|---|
| **W-A** | workflows | W4, W5 | Both trim what the setup window delivers, both are definition-only, both re-measured by the same method. |
| **S1** | main | W1, W2, W6 | W2's counters come from the resolver W1 introduces; W6 is the third cost figure and reads none of the same code. |
| **S2** | main | W7, W9, W8 | All three change what one delivery sends or says, in the same three response-assembly blocks. |
| **S3** | main | W10 | A new ledger namespace and the body split that reads it — the largest single change, and the one whose collapse figure the walk test asserts. |
| **W-B** | workflows | W3, and the running-dispatch signal that extends W2 | Both are agent-facing protocol guidance, and both describe behaviour the server only has after S1 and S2. |

## A sequence is necessary — three of the five have real predecessors

Not everything can go in parallel. Two of the four dependencies are logical (a change would state
something untrue if it landed first) and two are mechanical (the same lines).

```
W-A ──┬──► S1 ──► S2 ──► S3
      │           │
      └───────────┴──────► W-B
```

- **W-A before S1.** S1 holds bootstrap-time fixed content to a stated budget by measuring it. The
  measurement counts the resources the bootstrap protocol instructs the orchestrator to read, so
  while step 1 still reads the whole workflow schema the budget is 44 KB over on arrival. S1 bumps
  the workflows submodule to pick W-A up.
- **S1 before S2.** The per-delivery cost line reports characters spent against the eager budget.
  S2 changes what a full delivery spends, so the line exists first and S2 moves its figure.
- **S2 before S3.** S2 settles whether the collapse pass may run on a full delivery. S3 keys the
  activity body's parts into that same pass; landing it first would key them against a rule that is
  still being decided.
- **S1 and S2 before W-B.** W-B tells a worker what a lazy fetch costs and that a repeat arrives as
  a marker. Landing it first documents behaviour the server does not yet have.

Everything else inside a PR is parallel: W6 shares no file with W1 or W2, W8 shares no file with W7
or W9, and W4's and W5's edits do not overlap.

## Two items cannot be delivered by code, and are not being pretended into it

- **W8's second half.** The field a worker reads to know it may continue is emitted today in
  `_meta.batch`; S2 also puts it where a worker demonstrably reads — the response text, beside
  `artifact_prefix`, which is in the header for exactly this reason. Confirming that a run then
  *forms* needs a real session on a server build carrying the change. S2 states the method and the
  event to read; the confirmation is a later read.
- **W11.** Gated on around ten completed gate-crossing sessions since the delivery-identity fix
  (#408, merged 5 August 2026 as #410 and #411). The session records hold one such session — the
  5 August run, and that one straddles the build. The gate is not met and the read is not attempted.

## Baselines recorded before any change

Measured on main at `2c6da98c` so the after-figures have something to be read against.

| Figure | Value | Source |
|---|---:|---|
| Reference-walk re-request saving | **69.9%** (271,411 of 900,666 chars over 13 gates) | `npx vitest run tests/e2e/worker-identity-walk.test.ts` |
| Technique files in the corpus | 184 across `workflow-design` and `meta` | epic README |
| Resumed-delivery body share | 38.4% over eight main-workflow activities | W10 capture |

The epic body quotes 65.4% for the walk's collapse figure. That reading predates the batched-dispatch
merge, which added the `activity-worker` role technique to every activity delivery; the same test on
current main reports 69.9%. W10's acceptance is read against 69.9%, not 65.4%.
