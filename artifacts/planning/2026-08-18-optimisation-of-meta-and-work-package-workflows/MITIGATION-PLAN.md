# Mitigation Plan: workflow-server `meta` and `work-package` workflows

Disposition of every finding in `EVALUATION-REPORT.md`, decided one at a time across 57 gates. Full
reasoning, measurements and rejected options: [`05-resolution-dialogue-dispositions.md`](05-resolution-dialogue-dispositions.md).

> **Read this before acting on the report.** Nine of its findings did not survive re-measurement, one
> carries a prescription that would have made things worse, and the single most consequential defect in
> the system is not in it at all. The corrections section says which.

---

## 1. The finding that leads — the client drops `_meta`

**Not in the report.** Found by asking why 262 of 276 recorded dispatches took exactly one activity.

`get_activity` computes a batch reading on every successful delivery — `workflow-tools.ts:1332-1339`,
**unconditionally**, no mode gate, no extra parameter — and attaches it at line 1366 as `_meta.batch`.
The definitions are correct: `compose-prompt` instructs exactly the required call. **The client surfaces
only `content`.** The raw response, persisted verbatim, is `[{ "type": "text", "text": "…" }]` — no
`_meta` sibling *(measured)*.

**The chain:** workers cannot read `may_continue` → each reports `batch_may_continue: false`, correctly →
the orchestrator spawns a fresh worker per activity → each scope holds 0 activities at delivery →
`exempt` is always true → `batchRefusal` never refuses → **zero `batch_refused` events across 70 sessions
and 276 dispatches** *(measured)*.

**Three mechanisms dead for one cause:** batching; trace resolution (`trace_tokens[]` empty all run,
`resolve-trace-at-close-out` unsatisfiable); validation warnings (`_meta.validation` never observed).
**Client-wide** — `next_activity` returns `{activity_id, name, session_index}` only.

**It explains CHG-06, ORC-05 and ORC-07**, all of which treat the batch dial as the constraint. Acting on
them as written would have calibrated a mechanism that never runs.

**Direction, not a proposal:** every other server→worker signal rides in the response *body*
(`bundle_note`, `resources_note`, `step_techniques_note`, `enforcement_notes`, `activity_rules`). The fix
is a separate decision.

---

## 2. Disposition labels

- **Accepted** — a mitigation is specified. Some in part; some revised after acceptance.
- **Refuted** — the claim is false. Do not revisit. *(MEC-07)*
- **Refuted in part** — the stated mechanism is false; a narrower residue is carried to a named finding. *(REM-08 → CHG-05)*
- **Subsumed** — true, and its remedy is already accepted elsewhere. Revisit only if the absorbing mitigation is dropped. *(MEC-05; DEL-09 → DEL-02; RED-09 → CHG-05)*
- **Declined on cost** — may hold; the fix does not earn itself. *(RED-08, ORC-08)*

## 3. Summary table

| ID | Sev | Tier | Decision | ID | Sev | Tier | Decision |
|---|---|---|---|---|---|---|---|
| ORC-01 | CRIT | T1 | accept | REM-01 | CRIT | T3 | accept |
| CHG-01 | HIGH | T1 | accept | CHG-02 | HIGH | T3 | accept |
| CHG-03 | HIGH | T1→T3 | accept, revised | ORC-02 | HIGH | T3 | accept |
| DEL-01 | HIGH | T1 | accept | ORC-03 | HIGH | T3 | accept (Part A) |
| REM-02 | HIGH | T1 | accept | ORC-04 | HIGH | T3 | accept (Part A) |
| REM-03 | HIGH | T1 | accept | DEL-02 | HIGH | T3 | accept |
| MEC-02 | HIGH | T1 | accept | REM-04 | HIGH | T3 | accept — hazard open |
| MEC-04 | HIGH | T1 | accept | MEC-01 | HIGH | T3 | accept, modified |
| RED-02 | HIGH | T1 | accept | MEC-03 | HIGH | T3 | accept (1 of 4) |
| REM-05 | MED | T1 | accept, revised | RED-01 | HIGH | T3 | accept |
| REM-06 | MED | T1 | accept | REM-08 | MED | T3 | **refuted in part** |
| REM-07 | MED | T1 | accept | DEL-03 | MED | T3 | defer, trigger set |
| REM-09 | MED | T1 | accept | DEL-04 | MED | T3 | accept — audit first |
| ORC-05 | MED | T1 | accept | DEL-05 | MED | T3 | accept |
| MEC-07 | MED | T1 | **refuted** | DEL-06 | MED | T3 | accept |
| MEC-08 | MED | T1 | accept | DEL-07 | MED | T3 | accept |
| RED-03 | MED | T1 | accept | ORC-07 | MED | T3 | accept — evidence only |
| RED-05 | MED | T1 | accept | ORC-08 | MED | T3 | **declined on cost** |
| RED-06 | MED | T1 | accept (Part A) | MEC-06 | MED | T3 | accept narrowly |
| RED-07 | MED | T1 | accept (half) | RED-04 | MED | T3 | accept, part withdrawn |
| REM-10 | LOW | T1 | accept | CHG-05 | MED | T3 | accept |
| DEL-08 | LOW | T1 | accept, widened | CHG-07 | MED | T3 | accept |
| DEL-09 | LOW | T1 | **subsumed** | ORC-09 | LOW | T3 | accept |
| RED-08 | LOW | T1 | **declined on cost** | RED-09 | LOW | T3 | **subsumed** |
| MEC-05 | MED | T2 | **subsumed** | CHG-08 | LOW | T3 | accept |
| ORC-06 | MED | T2 | accept — delete | CHG-06 | MED | **T4** | **not yet decidable** |
| CHG-04 | MED | T2 | subsumed → priority note | | | | |

**31 accepted · 1 refuted · 1 refuted in part · 4 subsumed · 2 declined on cost · 1 not yet decidable · 3 scope additions accepted.**

## 4. Corrections — ordered by defect severity

**Diagnosis errors** — the wrong cause named, so the wrong work follows. Worst class.
- **REM-01** prescribed *building a second instrument*. It exists (`walker.ts:612-618`), is commented, is exercised by a test, and wants **one flag**. Two walkers disagreeing about what a dispatch is would be worse than the problem.
- **CHG-08** asserts ledger improvements drive session growth. The ledger is **1.6%**; growth is **89.4% `triggeredWorkflows`**. Acting on it would have undercut DEL-01 and DEL-05.
- **DEL-07/ORC-09** blamed a *missing benchmark arm*. The arm exists and walks meta correctly; **one shared assumption breaks three instruments**.

**Wrong figures** — MEC-05's "123 characters" has **no traceable source** (measured: 4,097 against a 13,023 floor). MEC-07's conclusion is false: 4 restatements, not 15; 24 absent, not 10; 0 drifts reproduced. REM-08 is false on both halves: **nine call sites**, and a named warning.

**Misleading denominators** — the headline **26.85% fall** is characters; round trips fell **4 of 246 (1.6%)**. DEL-02's "73% of server time" is **under 2% of a run**. DEL-01's 31.5% is delivery, not clock.

**Kind-of-claim errors** — the number is right, its meaning is not. ORC-08's 83.1% is an **upper bound** on concurrency: dependencies through the filesystem or agent context are invisible to it.

**Deliberate behaviour misread as defect** — CHG-07's cost-gate absence, ORC-04's 435 s of timers, DEL-06's "unscoped" bundle, DEL-08's unreached bounds. **Each file explains itself in writing.**

**Defects the evaluation missed** — a `blocking: true` gate that resolves itself on a 30-second timer (`12-strategic-review.yaml:165-167`); `seed_profile` unbound though **required**; `scripts/` and `tests/` outside the only tsconfig; **36% of session state is whitespace**.

## 5. The wall-clock account

Measured real run: **59% worker model time · 3% human wait · 38% orchestrator handoff with nothing executing.**

| Finding | Removes | Term |
|---|---|---|
| ORC-02 | 146 round trips ≈ 32 min | **59%** |
| ORC-03 | the session-wide lock | **3%** |
| ORC-04 | 10 gate triples | **38%** |
| ORC-07 | 8 of 11 decision-free boundaries | **38%** |

**Only ORC-04 and ORC-07 touch the 38%, and the largest item inside it — the 87-second spawn — belongs to
CHG-06 alone.** A reader landing ORC-02 and ORC-04 and expecting a much faster run will be disappointed.
**Critical path for the slow half: ORC-05 → dial ablations → CHG-06.**

**The instrument walks a single clean path** — no resume, no compaction, no retry, no human latency. Costs
occurring off it are invisible **by construction**: orchestrator resume (**104,635 characters, observed
this session**), worker compaction, review latency. **435 seconds of `autoAdvanceMs` sits inside any real
run's clock, attributed by nothing.**

## 6. Is this remediation lean?

T3 means *"the capability does not exist and must be built."* Of ten T3 findings: **2 produced a new
mechanism**, **7 were reuse or extension of something already in the repository**, **1 was declined**.

**Four rung-7 proposals rejected for a lower rung:** a second walker (REM-01), a batch endpoint (ORC-02),
a revision-keyed cache (DEL-02), a prose guard (MEC-03). **Four components declined inside accepted
findings:** ORC-03 Part B, ORC-04 Part B, REM-04's +29.3%, MEC-03's server-prose owner.

**The premise was wrong seven times in ten, and in every one the capability existed and was unwired.**

## 7. No identifier tracks content

| Identifier | Measurement |
|---|---|
| File version | **90 of 179 commits** changed it — 50.3% |
| File version | `mark-ready`: two copies **both v1.1.1**, differing signatures |
| Corpus commit | `72db28ae` and `2e8b6297` share one tree; `git diff` **empty** |

Both directions fail. **CHG-05's fingerprint is the first identifier that will track content, and it
covers declared variable names and defaults only.**

## 8. Capability lands on one side — nine instances

`unboundPositiveReads` (0 callers) · the refer-back predicate (1 channel of 3) · the boundary batch
reading (no call site passes the parameter) · the per-dispatch walker mode (1 caller, a test) · the
`get_workflow` collapse (`contextMode`-gated) · the meta benchmark arm (never run by CI) · triage orphan
detection (advisory) · `requireWorkflowsRoot` (14 of 22 adopters) · **`_meta.batch` (never delivered)**.

## 9. Methodological hazards

**Scope a sweep against the claim, not the evaluation's boundary** — `stealth_mode` nearly deleted live
gates; DEL-08's cap is reachable corpus-wide. **Include technique outputs; check the imported binding, not
the import; search all trees.** **Apply the guard's own exclusions** when modelling it. **Read what a file
says about itself** before calling an omission a defect. **Check the cheap claims — two for two changed
the answer.**

## 9b. A denominator correction affecting several counts

The RED-03 triage swept **19 trees with definitions, not 17** — `work-packages` and `plain-language` also
hold them. Three earlier counts used the narrower denominator:

| Count | Taken against | Affected? |
|---|---|---|
| RED-06's cross-tree writer sweep (`stealth_mode` and the frozen-variable set) | 17 trees | **No conclusion moves** — neither added tree writes any variable RED-06 examined |
| REM-07's guard-coverage census (18 nested checkpoints, 194 of 238 bindings) | 17 trees | **No conclusion moves** — `check-decision-order` walks every tree with an `activities/` folder, so its *coverage* claim was always corpus-wide; only the census figures are marginally low |
| RED-03's reachability run (32 unreached files) | 17 trees | **No conclusion moves** — re-checked in the 19-tree sweep; no additional reference found |

**Stated explicitly: no conclusion in this plan moves.** The discrepancy is arithmetic, and it is recorded
because a reader comparing tree counts across entries will otherwise take it for an inconsistency.

## 10. Implementation priority

**Prerequisites, in order.** ORC-05 → dial ablations → CHG-06. **REM-01's per-dispatch fixture is
load-bearing twice**: it prices DEL-01's real saving and REM-04's real cost.

1. **Instruments first** — ORC-01, CHG-01, ORC-05, REM-01's flag, CHG-03's ablations directory.
2. **REM-10 before the corpus bump** — it changes `corpus-sha.json`, one of the three regenerated files.
3. **All definition-only edits as one corpus bump** — 7 mitigations touch definitions; separately that is **35 file-touches and ≈217 lines** of ceremony, together **5 files and ≈31 lines**.
4. **Then server changes**, then the guard migrations.

## 11. Ladder scoreboard

**`net: +105 lines, −1 file.`**

**This remediation adds code overall.** Deletions — RED-02 (−35), DEL-08 (−25), RED-06 (−18), RED-06 Part B
(−12), MEC-04 (−4), ORC-06 (−2) — total roughly **−96 lines**; additions across the instrument work, the
cache, the array widening, the guard migrations and the fingerprint total roughly **+201**.

Most of the addition is **instrumentation**: making the system measurable, not making it bigger. The
alternative was accepted deliberately at four rung-7 rejections and eight component declines.

*Per `honesty-boundary.md`: the only genuine per-repo figure is the count of recorded deliberate
simplifications. No savings total is claimed. Every delivery figure carries `(measured)` or `(estimated)`
in the dispositions record; the report's own headline percentages are corrected in §4.*

## Appendices

**A — RED-03 triage verdict list.** 32 files over **19 trees** (not 17; `work-packages` and
`plain-language` also hold definitions — no conclusion moves). 2 exempt as documentation; 1 deleted at
RED-02; 6 referenced and not deletable; **23 unreferenced and NOT deletable** — "no reference" is evidence
of the inlining defect, not deadness. `needs_individual_interview`: **delete**, 8 sites, no producer in
any tree.

**B — typecheck costing.** Full parity **364 errors** (`src/` **0**, `scripts/` 179, `tests/` 185); **240
(66%) are `TS4111`**, mechanical. `scripts/guards.ts` alone: **2**, both closed by MEC-08.

## 12. Defects in the workflows that produced this plan

Eight defects in the evaluation and meta definitions, found by running them end to end rather than by
reading them. They are not findings about the target and carry no mitigation here — they are tracked at
[m2ux/workflow-server#477](https://github.com/m2ux/workflow-server/issues/477), which carries the
evidence and the proposed fixes.

The one that bears on this plan's own standing: the conformance step measured **2 of the 16 artifacts
this run produced**, because the map binding a filename to its writing guide has three rows and none
covers the fourteen per-dimension analyses. So the run's closing outcome check records artifact
conformance as **unmet** — not because the analyses are wrong, but because nothing could measure them.
That outcome cannot be cleared from inside the workflow; it needs a definition edit.

The others: declining to apply mitigations routes into the activity that applies them; a gate cannot be
named for work an activity did not anticipate; one step composes an output path from itself; two
references point at material no delivery tool serves; the meta close-out checks against a variable with
one producer in nineteen trees; and both analysis child runs stopped before reporting, leaving 577,124
bytes of analysis whose cost reaches no ledger.
