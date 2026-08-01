# Impact Analysis — Corpus batch: top-20 citation grain, C3 defects, ORCHESTRATION MODEL fragments

**Workflow:** multi-target corpus batch — nine workflows (scope table in the change brief)
**Mode:** Update
**Date:** 2026-08-01
**Change source:** [Change brief](01-change-brief.md)
**Baseline:** branch `workflow/358-338-corpus-batch` @ `b04713e4` at `.worktrees/pr1-corpus-batch`; per-target file/entity counts in the intake structural inventory (session record)

---

## Summary

Content-grain and rule-topology change across nine workflows: citation anchors and verdicts (no reference is dropped, only narrowed), five in-place content-defect fixes, and inline-rule-to-fragment conversion. No activity is added, removed or reordered anywhere, so every transition graph, entry activity and reachability property is untouched; the only topology that moves is where the ORCHESTRATION MODEL rule body is declared.

**Removals inventoried:** 4

---

## 1. Impact classification

### Directly modified

| File | Why |
|------|-----|
| `meta/techniques/cargo-operations/check.md` | env-after-`nice` shell form (line 28) |
| `meta/techniques/cargo-operations/clippy.md` | env-after-`nice` shell form (line 32) |
| `meta/techniques/cargo-operations/test.md` | env-after-`nice` shell form (lines 29, 31) |
| `meta/techniques/cargo-operations/build-dev.md` | env-after-`nice` shell form (line 28) |
| `meta/techniques/cargo-operations/build-release.md` | env-after-`nice` shell form (line 28) |
| `meta/techniques/cargo-operations/doc.md` | env-after-`nice` shell form (line 24) |
| `meta/techniques/cargo-operations/TECHNIQUE.md` | `resource-budget` rule claims `RUST_TEST_THREADS` group-wide; only `test` uses it — narrow to test scope |
| `meta/techniques/cargo-operations/run-suite.md` | Step-1 concurrent fan-out vs group rule `foreground-only` — reconcile |
| `work-package/techniques/create-issue.md` | Step 1 claims to run only when an issue key exists, then handles the no-key case — rescope |
| `work-package/activities/02-design-philosophy.yaml` | Classification checkpoint message interpolates a value its own options set |
| `prism/workflow.yaml` | Inline ORCHESTRATION MODEL rule copy → fragment ref |
| `remediate-vuln/workflow.yaml` | Inline ORCHESTRATION MODEL rule copy → fragment ref |
| `prism-audit/workflow.yaml` | Declares fragment `orchestration-model` — home/dedupe per change-brief judgements 1–3 |
| Citing technique files of the twenty reserved whole-resource pairs | AP-134 retarget or leave-whole verdict per pair; membership re-measured at scope time (routing-plan measurement: 20 pairs ≥ 5,531 chars, 85 whole-citation pairs at baseline) |

### Possibly touched at draft time

| File | Why |
|------|-----|
| The ten anchor-surface resource bodies (change brief, Resources dimension) | Heading/anchor added only where a retarget verdict needs one that does not exist |
| `prism-evaluate/workflow.yaml` | Existing `prism-audit::orchestration-model` ref repointed only if judgement 1 moves the home |
| `meta/workflow.yaml` | Gains the fragment declaration only if judgement 1 selects a neutral home |
| Citing files in `workflow-authoring`, `prism-evaluate`, `remediate-vuln` | Slug-mention sweep hits; in scope only if pair-level measurement confirms whole-resource citations in the top-20 |
| `workflow-design` technique files citing `design-principles` / `schema-construct-inventory` | Deprecated targets — twin verdicts, minimal edits |

### Unaffected

All activity files except `02-design-philosophy.yaml` (75 of 76 across the nine targets); every workflow.yaml except the three named (and conditionally `meta`/`prism-evaluate`); every resource body outside the ten-resource anchor surface; all READMEs; the six non-target workflows in the library.

---

## 2. Integrity checks

| Check | Verdict |
|-------|---------|
| Transitions, entry activity, reachability | Pass — no activity added, removed, renamed or reordered in any target; no `transitions[].to`, `initialActivity` or reachability change |
| Technique and resource references | Pass with obligation — every retarget must resolve `resource.md#section` to an existing heading (anchors guard); fragment refs must resolve to a declared body in exactly one home (fragments guard); `prism-evaluate`'s existing cross-workflow ref must survive any home move |
| Variables, checkpoint effects, step gates | Pass with repair — the `design-philosophy` checkpoint message currently reads a value first set by its own options; the fix removes the render-time-unavailable read. No variable declaration, effect key or gate condition changes anywhere |

### Change constraints

- **Fragment co-change set** — `prism/workflow.yaml`, `remediate-vuln/workflow.yaml`, `prism-audit/workflow.yaml` (+ `meta/workflow.yaml` and `prism-evaluate/workflow.yaml` if the home moves) must land in one coherent change: a ref without its declared body breaks fragment resolution.
- **Budget-claim co-change set** — `TECHNIQUE.md` (`resource-budget` narrowing) and the test-scoped landing site for the `RUST_TEST_THREADS` claim move together; the claim must never be absent from both.
- **Reconciliation co-change set** — `run-suite.md` step 1 and the `foreground-only` group rule: whichever side is reworded, the pair must read consistently in the same commit.
- **Anchor co-change set** — a citing file retargeted to `#section` and any heading added to its resource move together; guards enforce resolution.
- **Identifier collisions** — fragment key `orchestration-model` is taken in `prism-audit`; `worker-permissions`/`artifact-verification` (prism), `interaction-discipline` (+ checkpoint fragments, work-package), `agents-md-prerequisite` (work-packages), `planning-artifacts-gitignored` (substrate-node-security-audit) are taken in their declaring workflows. Any new fragment key or twin-verdict register id must avoid these.

---

## 3. Removals inventory

| # | Location | Removed | Preserved |
|---|----------|---------|-----------|
| 1 | `prism/workflow.yaml` rules list | Inline ORCHESTRATION MODEL rule string, including prism-specific output-forwarding and workers-not-resumed clauses | Fragment ref in place; rule body at the declaring home; variant clauses survive per change-brief judgement 2 (merged body or prism-local fragment) |
| 2 | `remediate-vuln/workflow.yaml` rules list | Inline ORCHESTRATION MODEL rule string, including inline-orchestrator and one-level-indirection clauses | Fragment ref in place; variant clauses survive per change-brief judgement 2 |
| 3 | `meta/techniques/cargo-operations/TECHNIQUE.md` `resource-budget` rule | `RUST_TEST_THREADS=${RUST_TEST_THREADS:-4}` from the group-wide inline-budget claim | The claim, rescoped to test operations (`test.md` already carries the usage); the rest of the budget claim stays group-wide |
| 4 | `meta/techniques/cargo-operations/run-suite.md` protocol step 1 | The unconditional "fan out four concurrent shells" instruction as currently worded | Suite semantics (four ops, collect-all, no short-circuit); the reconciled concurrency/foreground wording per G2 |

---

## Decision ask

Confirm the impact scope and the four inventoried removals — or preserve instead.
